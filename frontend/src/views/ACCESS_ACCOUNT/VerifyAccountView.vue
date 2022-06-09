<template>
    <div class="mb-3">
        <div class="row">
            <div class="mb-3 col-lg-6 col-md-6 d-none d-lg-block">
                <img :src="isDarkMode ? images.light : images.dark" class="img img-fluid" alt="Verify Image">
            </div>
            <div class="mb-3 col-sm-12 col-md-12 col-lg-6">
                <div class="card">
                    <div class="card-body"
                        :class="{ 'text-light bg-dark border-light': isDarkMode, 'text-dark bg-light border-dark': !isDarkMode }">
                        <div class="card-head mb-4">
                            <h4 class="card-title" :class="{ 'text-danger': isDarkMode, 'text-success': !isDarkMode }">
                                <strong>Verify Account ✅</strong>
                            </h4>
                        </div>
                        <Alert :type="alertType" :showAlert="showAlert" :message="alertMessage"
                            @hideAlert="hideAlert" />
                        <PreLoader v-if="showPreloader" :keepLoading="true" />
                        <form v-on:submit="onSubmit" v-else>
                            <div class="form-floating text-dark mb-3">
                                <input type="text" class="form-control" id="email" required :value="email" disabled>
                                <label for="email">Email</label>
                            </div>
                            <div class="form-floating text-dark mb-3">
                                <input type="text" class="form-control" id="verificationToken" required :value="token"
                                    disabled>
                                <label for="verificationToken">Verification Code</label>
                            </div>
                            <div class="form-floating text-center mb-3">
                                <vue-recaptcha ref="recaptcha" :sitekey="siteKey" @verify="captchaVerify"
                                    @error="captchaError" @expired="captchaExpired" />
                            </div>
                            <div class="text-center mb-3">
                                <button type="submit" class="btn btn-primary">Verify Account
                                    <i class="fa-solid fa-user-shield"></i></button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import Alert from '@/components/Alert.vue';
import PreLoader from '@/components/PreLoader.vue';
import { VueRecaptcha } from 'vue-recaptcha';

export default {
    name: 'VerifyAccountView',
    components: {
        Alert,
        PreLoader,
        VueRecaptcha
    },
    data() {
        return {
            siteKey: this.$store.getters.getSiteKey,
            images: {
                dark: require('@/assets/verify-pana-dark.svg'),
                light: require('@/assets/verify-pana-light.svg')
            },
            token: '',
            email: '',
            CSRF: "",
            alertType: '',
            alertMessage: '',
            showPreloader: false,
            showAlert: false,
            captchaVerified: false,
            captchaToken: "",
        }
    },
    beforeMount() {
        if (window.location.search != null && window.location.search.includes('token') && window.location.search.includes('email')) {
            this.token = window.location.search.replace('?', '').split('=')[1].split('&')[0]
            this.email = window.location.search.replace('?', '').split('=')[2];
        }
        else {
            this.$store.commit('setAlert', {
                type: 'danger',
                message: 'Unable to verify account with this link. Please checky your email and try again.',
                showAlert: true
            });
            this.$router.push('/');
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
        onSubmit(event) {
            event.preventDefault();
            if (this.captchaVerified == false) {
                this.showAlert = true;
                this.alertType = "danger";
                this.alertMessage = `Captcha Not Verified, Please Check and Try Again.`;
            } else {
                this.showAlert = false;
                // Captcha check -> Before Payload Hit 
                const Payload = {
                    email: this.email,
                    verificationToken: this.token,
                    captcha: this.captchaToken
                }
                // Show Preloader on verification button unless response if error hide preloader and show error in alert component
                this.showPreloader = true;
                // Make a request to verification the user api
                fetch('/api/auth/verification', {
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
                                    this.$router.push('/login');
                                }, 3e3);
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
        },
        isLoggedIn() {
            return this.$store.getters.loggedIn;
        },
    }
}
</script>