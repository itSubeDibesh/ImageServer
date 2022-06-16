<template>
    <div class="mb-3">
        <div class="row">
            <div class="mb-3 col-sm-12 col-md-12 col-lg-6">
                <div class="card">
                    <div class="card-body"
                        :class="{ 'text-light bg-dark border-light': isDarkMode, 'text-dark bg-light border-dark': !isDarkMode }">
                        <div class="card-head mb-4">
                            <h4 class="card-title" :class="{ 'text-danger': isDarkMode, 'text-success': !isDarkMode }">
                                <strong>Forgot Password</strong>
                            </h4>
                            <p class="text-center">Don't Worry, We will send you an email to reset your password.</p>
                        </div>
                        <Alert :type="alertType" :showAlert="showAlert" :message="alertMessage"
                            @hideAlert="hideAlert" />
                        <PreLoader v-if="showPreloader" :keepLoading="true" />
                        <form v-on:submit="onSubmit" v-else>
                            <div class="form-floating text-dark mb-3">
                                <input type="email" class="form-control" id="email" required v-on:input="checkEmail">
                                <label for="email">Email</label>
                                <div class="valid-feedback">
                                    Looks good!
                                </div>
                                <div class="invalid-feedback">
                                    Invalid email.
                                </div>
                            </div>
                            <div class="form-floating text-center mb-3">
                                <vue-recaptcha ref="recaptcha" :sitekey="siteKey" @verify="captchaVerify"
                                    @error="captchaError" @expired="captchaExpired" />
                            </div>
                            <div class="text-center mb-3">
                                <button type="submit" class="btn btn-primary">Send Request
                                    <i class="fa-solid fa-paper-plane"></i></button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div class="mb-3 col-lg-6 col-md-6 d-none d-lg-block">
                <img :src="isDarkMode ? images.light : images.dark" class="img img-fluid" alt="Verify Image">
            </div>
        </div>
    </div>
</template>


<script>
import Alert from '@/components/Alert.vue';
import PreLoader from '@/components/PreLoader.vue';
import { VueRecaptcha } from 'vue-recaptcha';

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export default {
    name: 'ForgotPassword',
    components: {
        Alert,
        PreLoader,
        VueRecaptcha
    },
    data() {
        return {
            siteKey: this.$store.getters.getSiteKey,
            images: {
                dark: require('@/assets/forgot-amico-dark.svg'),
                light: require('@/assets/forgot-amico-light.svg')
            },
            CSRF: "",
            alertType: '',
            alertMessage: '',
            showPreloader: false,
            showAlert: false,
            captchaVerified: false,
            captchaToken: "",
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
        hideAlert(event) {
            this.showAlert = event.showAlert;
            this.alertType = event.type;
            this.alertMessage = event.message;
        },
        toggle: (target) => (source = '', destination = '') => {
            if (source != "") target.classList.remove(source);
            if (destination != "") target.classList.add(destination);
        },
        checkEmail(event) {
            // Checking Required Length is not 0
            if (event.target.value.length != 0) {
                // Email Regex Pattern
                if (event.target.value.match(emailRegex)) {
                    this.toggle(event.target)('is-invalid', 'is-valid')
                } else {
                    this.toggle(event.target)('is-valid', 'is-invalid')
                }
            } else {
                // Resetting 
                this.toggle(event.target)('is-valid')
                this.toggle(event.target)('is-invalid')
            }
        },
        onSubmit(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            if (!email.match(emailRegex)) {
                this.showAlert = true;
                this.alertType = 'danger';
                this.alertMessage = 'Email is required.';
            }
            else if (this.captchaVerified == false) {
                this.showAlert = true;
                this.alertType = "danger";
                this.alertMessage = `Captcha Not Verified, Please Check and Try Again.`;
            }
            else {
                this.showAlert = false;
                // Captcha check -> Before Payload Hit 
                const Payload = {
                    email,
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
                        setTimeout(() => {
                            this.showPreloader = false;
                            this.alertType = json.status == "error" ? "danger" : "success";
                            this.alertMessage = json.result;
                            this.showAlert = true;
                            if (json.success) {
                                // On Success Redirect To Login Page
                                setTimeout(() => {
                                    this.alertType = "info";
                                    this.alertMessage = "Redirecting to login page...";
                                    this.showAlert = true;
                                    setTimeout(() => {
                                        this.$router.push('/login');
                                    }, 3e3);
                                }, 3e3)
                            }
                        }, 1e3);
                    });
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