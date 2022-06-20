<template>
    <div class="row">
        <div class="mb-3 col-lg-6 col-md-6 d-none d-lg-block">
            <img :src="isDarkMode ? images.login.light : images.login.dark" class="img img-fluid" alt="Login Image">
        </div>
        <div class="mb-3 col-sm-12 col-md-12 col-lg-6">
            <div class="card">
                <div class="card-body"
                    :class="{ 'text-light bg-dark border-light': isDarkMode, 'text-dark bg-light border-dark': !isDarkMode }">
                    <div class="card-head mb-4">
                        <h4 class="card-title" :class="{ 'text-danger': isDarkMode, 'text-success': !isDarkMode }">
                            <strong>Login</strong>
                        </h4>
                    </div>
                    <Alert :type="alertType" :showAlert="showAlert" :message="alertMessage" @hideAlert="hideAlert" />
                    <PreLoader v-if="showPreloader" :keepLoading="true" />
                    <div v-else>
                        <div v-if="!timeOutHandler.allowAccess">
                            <h3 class="text-center"><strong>Enabling login after ⌚.. </strong></h3>
                            <CountDown :allowAccess="timeOutHandler.allowAccess" :name="timeOutHandler.timer_name"
                                :timeout="timeOutHandler.timeout" :showTimer="timeOutHandler.showTimer" />
                        </div>
                        <form v-on:submit="onSubmit" v-else>
                            <div class="form-floating text-dark mb-3">
                                <input type="email" class="form-control" id="email" placeholder="name@example.com"
                                    required v-on:input="checkEmail">
                                <label for="email">Email address</label>
                                <div class="valid-feedback">
                                    Looks good!
                                </div>
                                <div class="invalid-feedback">
                                    Email is required.
                                </div>
                            </div>
                            <div class="form-floating text-dark mb-3">
                                <input type="password" class="form-control" id="password" placeholder="Password"
                                    required maxlength="20" minlength="8" v-on:input="checkPassword">
                                <label for="password">Password</label>
                                <div class="valid-feedback">
                                    Looks good!
                                </div>
                                <div class="invalid-feedback">
                                    Your password must be 8-20 characters long, contain letters and numbers, and must
                                    not
                                    contain spaces, special characters.
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-sm-12 col-md-6 col-lg-6">
                                    <div class="form-check text-start mb-3">
                                        <input type="checkbox" class="form-check-input" id="rememberEmail"
                                            v-on:click="rememberEmail">
                                        <label class="form-check-label" for="rememberEmail">Remember Email
                                            <i class="fas fa-envelope text-primary"></i></label>
                                    </div>
                                </div>
                                <div class="col-sm-12 col-md-6 col-lg-6 text-end mb-3">
                                    <strong>
                                        <router-link to="/forgot" class="link-info">Forgot Password?</router-link>
                                    </strong>
                                </div>
                            </div>
                            <div class="form-floating text-center mb-3">
                                <vue-recaptcha ref="recaptcha" :sitekey="siteKey" @verify="captchaVerify"
                                    @error="captchaError" @expired="captchaExpired" />
                            </div>
                            <div class="text-center mb-3">
                                <button type="submit" class="btn btn-primary">Login <i
                                        class="fas fa-right-to-bracket"></i></button>
                            </div>
                            <div class="text-center mb-3">
                                <p>Don't have account? <strong>
                                        <router-link to="/register" class="link-success">Register
                                        </router-link>
                                    </strong>
                                </p>
                            </div>
                            <div class="text-center mb-3">
                                <p>How strong is your password? <strong>
                                        <router-link to="/analyze" class="link-danger">Analyze it?
                                        </router-link>
                                    </strong>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import PreLoader from '@/components/PreLoader.vue'
import Alert from '@/components/Alert.vue';
import CountDown from '@/components/CountDown.vue';
import { VueRecaptcha } from 'vue-recaptcha';
import ls from 'localstorage-slim';
import AES from 'crypto-js/aes';

export default {
    name: 'Login',
    components: {
        PreLoader,
        Alert,
        CountDown,
        VueRecaptcha
    },
    data() {
        return {
            siteKey: this.$store.getters.getSiteKey,
            enc: this.$store.getters.getEnc,
            images: {
                login: {
                    dark: require('@/assets/login-rafiki-dark.svg'),
                    light: require('@/assets/login-rafiki-light.svg')
                }
            },
            timeOutHandler: {
                timeout: 0,
                showTimer: false,
                allowAccess: true,
                timer_name: "login_timeout",
            },
            is429: false,
            CSRF: "",
            showPreloader: false,
            alertType: "",
            showAlert: false,
            alertMessage: "",
            captchaVerified: false,
            captchaToken: "",
            emailAccepted: false,
            passwordAccepted: false,
        }
    },
    mounted() {
        // Remembered Email Check
        if (localStorage.getItem("userEmail") != null) {
            document.getElementById('email').value = localStorage.getItem("userEmail");
            document.getElementById('rememberEmail').checked = true;
            this.emailAccepted = true;
            this.toggle(document.getElementById('email'))('is-invalid', 'is-valid')
        }
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
        hideAlert(event) {
            this.showAlert = event.showAlert;
            this.alertType = event.type;
            this.alertMessage = event.message;
        },
        onSubmit(event) {
            event.preventDefault();
            /// Checking if Form Elements are In Valid Alert on Submission click
            let Checks = [];
            [
                { type: "Email", value: this.emailAccepted },
                { type: "Password", value: this.passwordAccepted },
            ]
                .forEach(item => {
                    if (!item.value) Checks.push(item.type)
                });
            if (Checks.length != 0) {
                this.showAlert = true;
                this.alertType = "danger";
                this.alertMessage = `${[...Checks]} Not Accepted, Please Check and Try Again.`;
                return;
            }
            else {
                if (this.captchaVerified == false) {
                    this.showAlert = true;
                    this.alertType = "danger";
                    this.alertMessage = `Captcha Not Verified, Please Check and Try Again.`;
                } else {
                    this.showAlert = false;
                    // Captcha check -> Before Payload Hit 
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
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': this.CSRF
                        },
                        body: JSON.stringify(Payload)
                    })
                        .then(response => {
                            this.is429 = response.status === 429;
                            return response.json();
                        })
                        .then(json => {
                            setTimeout(() => {
                                if (this.is429) {
                                    this.timeOutHandler.allowAccess = false;
                                    this.timeOutHandler.showTimer = true;
                                    this.timeOutHandler.timeout = json.data.timeout;
                                }
                                this.showPreloader = false;
                                this.alertType = json.status == "error" ? "danger" : "success";
                                this.alertMessage = json.result;
                                this.showAlert = true;
                                // Set Details in Vue Store and redirect after 3 seconds
                                if (json.success) {
                                    // Set Details On Store
                                    // Redirect after 3 seconds
                                    setTimeout(() => {
                                        ls.set('userState', {
                                            loggedIn: true,
                                            user: json.data.user,
                                            token: json.data.access
                                        }, {
                                            secret: this.enc,
                                            encrypt: true,
                                            encrypter: (data, secret) => AES.encrypt(JSON.stringify(data), secret).toString()
                                        })
                                        this.$store.commit("isLoggedIn", {
                                            loggedIn: true,
                                            user: json.data.user,
                                            token: json.data.access
                                        })
                                        if (json.data.user.UserGroup == 'ADMINISTRATOR')
                                            this.$router.push('/dashboard');
                                        else
                                            this.$router.push('/images');
                                    }, 3e3);
                                }
                            }, 1e3);
                        });
                }
            }
        },
        toggle: (target) => (source = '', destination = '') => {
            if (source != "") target.classList.remove(source);
            if (destination != "") target.classList.add(destination);
        },
        checkEmail(event) {
            // Checking Required Length is not 0
            if (event.target.value.length != 0) {
                // Email Regex Pattern
                if (event.target.value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
                    this.emailAccepted = true;
                    this.toggle(event.target)('is-invalid', 'is-valid')
                } else {
                    this.emailAccepted = false;
                    this.toggle(event.target)('is-valid', 'is-invalid')
                }
            } else {
                // Resetting 
                this.toggle(event.target)('is-valid')
                this.toggle(event.target)('is-invalid')
            }
        },
        rememberEmail(event) {
            if (event.target.checked) localStorage.setItem('userEmail', document.getElementById('email').value);
            else localStorage.removeItem('userEmail');
        },
        checkPassword(event) {
            // Checking Required Length is not 0
            if (event.target.value.length != 0) {
                // Password Length
                if (event.target.value.length >= 8 && event.target.value.length <= 20) {
                    this.passwordAccepted = true;
                    this.toggle(event.target)('is-invalid', 'is-valid')
                } else {
                    this.passwordAccepted = false;
                    this.toggle(event.target)('is-valid', 'is-invalid')
                }
            } else {
                // Resetting 
                this.toggle(event.target)('is-valid')
                this.toggle(event.target)('is-invalid')
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
