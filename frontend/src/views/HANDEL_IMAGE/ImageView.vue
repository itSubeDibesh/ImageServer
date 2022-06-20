<template>
    <div class="mb-3">
        <div class="row">
            <div class="col-12 mb-3  text-end">
                <button class="btn btn-primary" v-on:click="Uploading"> <i class="fas fa-file-image"></i>
                    Upload
                    Image</button>
            </div>
            <div class="mb-3 col-sm-12 col-lg-12 col-md-12 text-center" v-if="isUploading">
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
                        <PreLoader v-if="showPreloader" :keepLoading="true" />
                        <div v-else>
                            <div v-if="!timeOutHandler.allowAccess">
                                <h3 class="text-center"><strong>Enabling login after ⌚.. </strong></h3>
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
            <div class="mb-3 col-sm-12 col-lg-12 col-md-12 text-center" v-if="noImage">
                <img :src="isDarkMode ? image.light : image.dark" style="width:50%; height:auto;" class="img img-fluid"
                    alt="Images Photo">
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
            showPreloader: false,
            alertType: "",
            showAlert: false,
            alertMessage: "",
            captchaVerified: false,
            captchaToken: "",
            uploadImages: [],
            isUploading: false,
            noImage: true,
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
    mounted() {
        // Fetch CSRF Token
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
    methods: {
        Uploading() {
            this.isUploading = !this.isUploading;
            if (this.uploadImages.length == 0) {
                this.noImage = !this.noImage
            }
        },
        onSubmit(e) {
            e.preventDefault();
            this.uploadImages = this.$refs.images.files;
            if (this.uploadImages.length == 0) {
                this.showAlert = true;
                this.alertType = "danger";
                this.alertMessage = "No image selected";
                return;
            } else {
                // Captcha Check
                if (this.captchaVerified == false) {
                    this.showAlert = true;
                    this.alertType = "danger";
                    this.alertMessage = `Captcha Not Verified, Please Check and Try Again.`;
                } else {
                    this.showAlert = false;
                    const Payload = {
                        email: document.getElementById('email').value,
                        password: document.getElementById('password').value,
                        captcha: this.captchaToken
                    }
                    // Show Preloader on login button unless response if error hide preloader and show error in alert component
                    this.showPreloader = true;
                    // Make a request to login the user api
                    fetch('/api/auth/login', {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': this.CSRF,
                            'Authorization': 'Bearer ' + this.userLoggedIn.token,
                        },
                        body: JSON.stringify(Payload)
                    })
                    // File Check
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
        }
    }
}
</script>