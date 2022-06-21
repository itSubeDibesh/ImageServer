<template>
    <div class="mb-3">
        <div class="row">
            <div class="col-12 mb-3  text-end">
                <button class="btn btn-primary m-2" v-on:click="Uploading"> <i class="fas fa-file-image"></i>
                    Upload
                    Image</button>
                <button class="btn btn-primary m-2" v-on:click="fetchUserImages"> <i class="fas fa-refresh"></i>
                    Refresh</button>
            </div>
            <div class="mb-3 col-12 text-center" v-if="isUploading">
                <div class="card">
                    <Alert :type="alertType" :showAlert="showAlert" :message="alertMessage" @hideAlert="hideAlert" />
                    <PreLoader v-if="showPreloader" :keepLoading="true" />
                    <div class="card-body" v-else
                        :class="{ 'text-light bg-dark border-light': isDarkMode, 'text-dark bg-light border-dark': !isDarkMode }">
                        <div class="card-head mb-4">
                            <h4 class="card-title" :class="{ 'text-danger': isDarkMode, 'text-success': !isDarkMode }">
                                <strong>Upload Image</strong>
                            </h4>
                        </div>
                        <Alert :type="alertType" :showAlert="showAlert" :message="alertMessage"
                            @hideAlert="hideAlert" />
                        <div>
                            <div v-if="!timeOutHandler.allowAccess">
                                <h3 class="text-center"><strong>Enabling uploads after ⌚.. </strong></h3>
                                <CountDown :allowAccess="timeOutHandler.allowAccess" :name="timeOutHandler.timer_name"
                                    :timeout="timeOutHandler.timeout" :showTimer="timeOutHandler.showTimer" />
                            </div>
                            <form v-on:submit="onSubmit" v-else>
                                <div class="form-floating text-center mb-3">
                                    <UploadImages ref="images" :max="10" maxError="Max files exceed"
                                        fileError="Image files only accepted" clearAll="Remove all images" />
                                </div>
                                <div class="form-floating text-center mb-3">
                                    <vue-recaptcha ref="recaptcha" :sitekey="siteKey" @verify="captchaVerify"
                                        @error="captchaError" @expired="captchaExpired" />
                                </div>
                                <div class="text-center mb-3">
                                    <button type="button" class="btn btn-danger m-2" v-on:click="Uploading">
                                        <i class="fas fa-close"></i>
                                        Close
                                    </button>
                                    <button type="submit" class="btn btn-primary">Submit
                                        <i class="fas fa-paper-plane"></i></button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mb-3 col-12 text-center" v-if="noImage">
                <img :src="isDarkMode ? image.light : image.dark" style="width:50%; height:auto;" class="img img-fluid"
                    alt="Images Photo">
            </div>
            <div class="mb-3 col-12 text-center" v-if="!noImage">
                <div class="row">
                    <div class="col-sm-12 col-md-6 col-lg-3 mt-1 mb-3 mr-1"
                        v-for="(img, imageIndex) in imagesData.images" :id="'IMAGE_' + img.ImageId"
                        :ref="'IMAGE_' + img.ImageId" :key="imageIndex">
                        <div class="card">
                            <div class="card-title">
                                <div class="row px-3 py-3 pt-2 pb-1">
                                    <div class="col-sm-6  text-start">
                                        <i class="fas fa-calendar text-success"></i>
                                        <strong>&nbsp;{{ removeTime(img.UploadDate) }}</strong>
                                    </div>
                                    <div class="col-sm-6 text-end">
                                        <span v-on:click="deleteImage(img.ImageId)" style="cursor:pointer;">
                                            <i class="fas fa-trash text-danger"></i></span>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body"
                                :class="{ 'text-light bg-dark border-light': isDarkMode, 'text-dark bg-light border-dark': !isDarkMode }">
                                <PreLoader v-if="imagesData.activateLoader" :keepLoading="true" />
                                <a :href="img.FilePath" data-lightbox="{{'Image'+removeTime(img.UploadDate)}}" v-else>
                                    <img :src="img.FilePath" class="img img-fluid" :alt="img.FileName">
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import CountDown from '@/components/CountDown.vue';
import UploadImages from "vue-upload-drop-images"
import PreLoader from '@/components/PreLoader.vue'
import Alert from '@/components/Alert.vue';
import { VueRecaptcha } from 'vue-recaptcha';


export default {
    name: 'Images',
    components: {
        PreLoader,
        Alert,
        VueRecaptcha,
        UploadImages,
        CountDown
    },
    data() {
        return {
            siteKey: this.$store.getters.getSiteKey,
            image: {
                dark: require('@/assets/photos-pana-dark.svg'),
                light: require('@/assets/photos-pana-light.svg')
            },
            indexCoolBox: null,
            isDevEnv: window.location.href.includes('8079'),
            showPreloader: false,
            alertType: "",
            showAlert: false,
            alertMessage: "",
            captchaVerified: false,
            captchaToken: "",
            imagesData: {
                images: [],
                length: 0,
                activateLoader: false
            },
            noImage: true,
            isUploading: false,
            CSRF: "",
            timeOutHandler: {
                timeout: 0,
                showTimer: false,
                allowAccess: true,
                timer_name: "login_timeout",
            },
            is429: false,
        }
    },
    beforeMount() {
        // Fetch CSRF Token
        this.getCSRF()
        setTimeout(() => {
            this.fetchUserImages();
            this.getCSRF();
        }, 1e3);
    },
    mounted() {
        // Timeout Handler
        // Subscribing to MutationObserver
        this.$store.subscribe((mutation) => {
            if (mutation.type == "setTimeOut") {
                if (mutation.payload.title == this.timeOutHandler.timer_name) {
                    this.timeOutHandler.allowAccess = false;
                    this.timeOutHandler.showTimer = true;
                    this.timeOutHandler.timeout = mutation.payload.timeOut;
                }
            }
            else if (mutation.type == "removeTimeout") {
                if (this.timeOutHandler.timer_name == mutation.payload.title) {
                    this.timeOutHandler.showTimer = false;
                    this.timeOutHandler.allowAccess = true;
                    this.timeOutHandler.timeout = 0;
                    setTimeout(() => {
                        window.location.reload()
                    }, 5e2)
                }
            }
        })
    },
    methods: {
        getCSRF() {
            fetch('/api/auth/csrf', {
                method: 'GET',
                credentials: 'same-origin'
            }).then(response => {
                if (response.status === 2e2) {
                    return response.json();
                }
            }).then(json => {
                this.CSRF = json.result.CsrfToken;
            });
        },
        removeTime(str) {
            if (str.length != 0)
                return str.split(' ')[0] || "";
        },
        Uploading() {
            this.isUploading = !this.isUploading;
            if (this.imagesData.length == 0) {
                this.noImage = !this.noImage
            }
        },
        deleteImage(imageId) {
            this.$swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch("/api/image/delete", {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': this.CSRF,
                            'Authorization': 'Bearer ' + this.userLoggedIn.token,
                        },
                        body: JSON.stringify({ "UserId": this.userLoggedIn.user.UserId, "ImageId": imageId })
                    })
                        .then(resp => resp.json())
                        .then(response => {
                            if (response.success) {
                                // Delete Call 
                                this.$swal.fire(
                                    'Deleted!',
                                    'Your file has been deleted.',
                                    'success'
                                ).then(() => {
                                    this.fetchUserImages();
                                })
                            } else {
                                this.$swal.fire(
                                    'Error!',
                                    'Something went wrong.',
                                    'error'
                                )
                            }
                        })
                }
            })
        },
        fetchUserImages() {
            fetch("/api/image/view", {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.CSRF,
                    'Authorization': 'Bearer ' + this.userLoggedIn.token,
                },
                body: JSON.stringify({ "UserId": this.userLoggedIn.user.UserId })
            })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        if (result.data.length > 0) {
                            // Show Preloader For Specific Images
                            this.imagesData.activateLoader = true;
                            this.imagesData.images = result.data.images;
                            this.imagesData.length = result.data.length;
                            this.noImage = false;
                            setTimeout(() => {
                                this.imagesData.activateLoader = false;
                            }, 1000);
                        } else {
                            this.noImage = true;
                        }
                    }
                })
                .catch(error => {
                    this.$store.commit("setAlert", {
                        type: 'danger',
                        message: error.message,
                        showAlert: true
                    })
                });
        },
        onSubmit(e) {
            e.preventDefault();
            if (this.is429) {
                this.showPreloader = false;
                this.timeOutHandler.allowAccess = false;
                this.timeOutHandler.showTimer = true;
                this.timeOutHandler.timeout = response.data.timeout;
            } else {
                // Captcha Check
                if (this.captchaVerified == false) {
                    this.showAlert = true;
                    this.alertType = "danger";
                    this.alertMessage = `Captcha Not Verified, Please Check and Try Again.`;
                } else {
                    this.showAlert = false;
                    const formData = new FormData();
                    this.$refs.images.files.forEach(element => {
                        formData.append('images', element);
                    });
                    formData.append('UserId', this.userLoggedIn.user.UserId);
                    formData.append('captcha', this.captchaToken);
                    // Show Preloader on login button unless response if error hide preloader and show error in alert component
                    this.showPreloader = true;
                    // Make a request to login the user api
                    fetch('/api/image/upload', {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: {
                            'X-CSRF-TOKEN': this.CSRF,
                            'Authorization': 'Bearer ' + this.userLoggedIn.token,
                        },
                        body: formData
                    })
                        .then(response => {
                            this.is429 = response.status === 429;
                            return response.json();
                        })
                        .then(response => {
                            if (this.is429) {
                                this.showPreloader = false;
                                this.timeOutHandler.allowAccess = false;
                                this.timeOutHandler.showTimer = true;
                                this.timeOutHandler.timeout = response.data.timeout;
                            } else {
                                setTimeout(() => {
                                    if (response.success) {
                                        this.showPreloader = false;
                                        this.fetchUserImages();
                                        this.Uploading();
                                    } else {
                                        this.showPreloader = false;
                                        this.showAlert = true;
                                        this.alertType = "danger";
                                        this.alertMessage = response.message;
                                    }
                                }, 1e3);
                            }
                        })
                }
            }
        },
        captchaVerify(token) {
            this.captchaVerified = true;
            this.captchaToken = token;
        },
        captchaError(event) {
            this.showAlert = true;
            this.alertType = "danger";
            this.alertMessage = `Captcha Error, Please Check and Try Again.`;
            console.error(event);
        },
        captchaExpired(event) {
            this.showAlert = true;
            this.alertType = "danger";
            this.alertMessage = `Captcha Expired, Please Try Again.`;
            console.error(event);
        },
    },
    computed: {
        isDarkMode() {
            return this.$store.getters.appMode;
        },
        userLoggedIn() {
            return this.$store.getters.userLoggedIn;
        }
    }
}
</script>