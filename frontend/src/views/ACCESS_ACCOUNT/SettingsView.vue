<template>
    <div class="mb-3">
        <div class="row">
            <div class="col-sm-12 col-md-4 col-lg-4 mb-3">
                <PreLoader v-if="showPreloader" :keepLoading="true" />
                <div class="card" style="cursor:default"
                    :class="{ 'text-light bg-dark border-light': isDarkMode, 'text-dark bg-light': !isDarkMode }"
                    v-else>
                    <img :src="isDarkMode ? images.reset.light : images.reset.dark" class="card-img-top"
                        alt="Reset Image">
                    <div class="card-body">
                        <h5 class="card-title" :class="{ 'text-danger': !isDarkMode, 'text-success': isDarkMode }">Send
                            a reset request
                        </h5>
                        <p class="card-text">Want to reset your password, No worries we will send an email to reset it.
                        </p>
                        <Alert :type="alertType" :showAlert="showAlert" :message="alertMessage"
                            @hideAlert="hideAlert" />
                        <div class="text-center mb-3">
                            <vue-recaptcha ref="recaptcha" :sitekey="siteKey" @verify="captchaVerify"
                                @error="captchaError" @expired="captchaExpired" />
                        </div>
                        <a href="#" v-on:click="sendResetRequest" class="btn btn-primary">Send Request <i
                                class="fa-solid fa-paper-plane"></i></a>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-md-4 col-lg-6 mb-3">
                <div class="card mb-3"
                    :class="{ 'text-light bg-dark border-light': isDarkMode, 'text-dark bg-light': !isDarkMode }">
                    <div class="card-header bg-light text-dark">
                        <h5 class="card-title">
                            <strong>
                                Profile
                            </strong>
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div style="cursor:default" class="col-sm-12 col-md-12 col-lg-12 mb-3 ml-1 text-center">
                                <h4> <strong> <i class="fas fa-users-cog"></i>
                                        Basic Information</strong>
                                </h4>
                            </div>
                            <div style="cursor:default" class="col-sm-12 col-md-6 col-lg-6 mb-3 ml-1">
                                <strong> <i class="fas fa-user text-primary"></i> Full Name: </strong>
                                <span class="badge rounded-pill bg-primary" data-bs-toggle="modal"
                                    data-bs-target="#exampleModal" style="cursor:pointer"> {{
                                            userLoggedIn.user.FullName
                                    }}</span>

                            </div>
                            <div style="cursor:default" class="col-sm-12 col-md-6 col-lg-6 mb-3 ml-1">
                                <strong> <i class="fas fa-envelope text-primary"></i> Email: </strong>
                                <span class="badge rounded-pill bg-primary"> {{
                                        userLoggedIn.user.Email
                                }}</span>
                            </div>
                            <div style="cursor:default" class="col-sm-12 col-md-6 col-lg-6 mb-3 ml-1">
                                <strong> <i class="fas fa-user-check text-primary"></i> Verified: </strong>
                                <span class="badge rounded-pill bg-primary">{{
                                        userLoggedIn.user.VerificationStatus ? "True" : "False"
                                }}</span>
                            </div>
                            <div style="cursor:default" class="col-sm-12 col-md-6 col-lg-6 mb-3 ml-1">
                                <strong> <i class="fas fa-user-secret text-primary"></i> Username: </strong>
                                <span class="badge rounded-pill bg-primary">{{
                                        sentenceCase(userLoggedIn.user.UserName)
                                }}</span>
                            </div>
                            <div style="cursor:default" class="col-sm-12 col-md-12 col-lg-12 mb-3 ml-1 text-center">
                                <h4> <strong> <i class="fas fa-users-cog"></i>
                                        Other Information</strong>
                                </h4>
                            </div>
                            <div style="cursor:default" class="col-sm-12 col-md-6 col-lg-6 mb-3 ml-1">
                                <strong> <i class="fas fa-calendar-day text-primary"></i> Account Created: </strong>
                                <span class="badge rounded-pill bg-success">{{
                                        removeTime(userLoggedIn.user.CreatedAt)
                                }}</span>
                            </div>
                            <div style="cursor:default" class="col-sm-12 col-md-6 col-lg-6 mb-3 ml-1">
                                <strong> <i class="fas fa-universal-access text-primary"></i> Account Type: </strong>
                                <span class="badge rounded-pill bg-danger">{{
                                        sentenceCase(userLoggedIn.user.UserGroup)
                                }}</span>
                            </div>
                            <div style="cursor:default" class="col-sm-12 col-md-6 col-lg-6 mb-3 ml-1">
                                <strong> <i class="fas fa-user-shield text-primary"></i> Password Reset: </strong>
                                <span class="badge rounded-pill bg-success">{{
                                        removeTime(userLoggedIn.user.LastPasswordResetDate)
                                }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="modal" tabindex="-1" id="exampleModal" data-bs-backdrop="static" data-bs-keyboard="false">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content" :class="{ 'text-light bg-dark': isDarkMode, 'text-dark bg-light': !isDarkMode }">
                <div class="modal-header">
                    <h5 class="modal-title">Update Full Name</h5>
                    <button type="button" class="btn-close bg-danger" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form v-on:submit="onSubmit">
                        <div class="form-floating text-dark mb-3">
                            <input type="text" class="form-control" id="fullname" placeholder="Full Name" required
                                :value="userLoggedIn.user.FullName" minlength="3" v-on:input="checkFullName">
                            <label for="fullname">Full Name</label>
                            <div class="invalid-feedback">
                                [FirstName MiddleName LastName] Or FirstName of at least 3 characters required.
                            </div>
                            <div class="valid-feedback">
                                Looks good!
                            </div>
                        </div>
                        <div class="form-floating text-center mb-3">
                            <vue-recaptcha ref="recaptcha" :sitekey="siteKey" @verify="captchaVerify"
                                @error="captchaError" @expired="captchaExpired" />
                        </div>
                        <div class="text-center mb-3">
                            <button type="button" class="btn btn-danger m-2" data-bs-dismiss="modal">
                                <i class="fas fa-close"></i>
                                Close
                            </button>
                            <button type="submit" class="btn btn-primary m-2">Update
                                <i class="fa-solid fa-paper-plane"></i></button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import { VueRecaptcha } from 'vue-recaptcha';
import Alert from '@/components/Alert.vue';
import PreLoader from '@/components/PreLoader.vue';

export default {
    name: 'Settings',
    components: {
        Alert,
        PreLoader,
        VueRecaptcha
    },
    data() {
        return {
            siteKey: this.$store.getters.getSiteKey,
            images: {
                reset: {
                    dark: require('@/assets/reset-pana-dark.svg'),
                    light: require('@/assets/reset-pana-light.svg')
                }
            },
            CSRF: "",
            alertType: '',
            alertMessage: '',
            showAlert: false,
            showPreloader: false,
            captchaVerified: false,
            captchaToken: "",
        }
    },
    beforeMount() {
        // CSRF TOKEN
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
        checkFullName(event) {
            // Checking Required Length is not 0
            if (event.target.value.length != 0) {
                // Regex Full name pattern xxx xxx xxx
                //  ^[a-zA-Z]+[a-zA-Z ]+[a-zA-Z]+$
                if (event.target.value.length >= 3 && event.target.value.match(/^[a-zA-Z]+[a-zA-Z ]+[a-zA-Z]+$/)) {
                    this.toggle(event.target)('is-invalid', 'is-valid')
                    this.fullNameAccepted = true;
                } else {
                    this.toggle(event.target)('is-valid', 'is-invalid')
                    this.fullNameAccepted = false;
                }
            } else {
                // Resetting 
                this.toggle(event.target)('is-valid')
                this.toggle(event.target)('is-invalid')
            }
        },
        onSubmit(event) {
            event.preventDefault();
        },
        sendResetRequest(e) {
            e.preventDefault();
            if (this.captchaVerified == false) {
                this.showAlert = true;
                this.alertType = "danger";
                this.alertMessage = `Captcha Not Verified, Please Check and Try Again.`;
            } else {
                this.showAlert = false;
                // Captcha check -> Before Payload Hit 
                const Payload = {
                    email: this.userLoggedIn.user.Email,
                    captcha: this.captchaToken
                }
                // Show Preloader on forgot button unless response if error hide preloader and show error in alert component
                this.showPreloader = true;
                // Make a request to forgot the user api
                fetch('/api/auth/forgot', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': this.CSRF
                    },
                    body: JSON.stringify(Payload)
                })
                    .then(response => response.json())
                    .then(json => {
                        // Clear Everything
                        this.captchaVerified = false;
                        this.captchaToken = "";
                        setTimeout(() => {
                            this.showPreloader = false;
                            this.showAlert = true;
                            if (json.status == "error")
                                this.alertType = "danger";
                            else
                                this.alertType = "success";
                            this.alertMessage = json.result;
                        }, 1e3);
                    });
            }
        },
        sentenceCase(str) {
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        },
        removeTime(str) {
            return str.split(' ')[0];
        },
        hideAlert(event) {
            this.showAlert = event.showAlert;
            this.alertType = event.type;
            this.alertMessage = event.message;
        },
        toggle: (target) => (source = '', destination = '') => {
            if (source != "") target.classList.remove(source);
            if (destination != "") target.classList.add(destination);
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