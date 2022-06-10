<template>
    <div class="mb-3">
        <div class="row">
            <div class="mb-3 col-lg-6 col-md-6 d-none d-lg-block">
                <div class="row">
                    <div class="mb-3 col-lg-12 col-md-12 ">
                        <img :src="isDarkMode ? images.light : images.dark" class="img img-fluid" alt="Register Image">
                    </div>
                    <div class="mb-3 col-lg-10 col-md-10 col-sm-10" v-if="typingPassword">
                        <div class="card mb-3">
                            <div class="card-body"
                                :class="{ 'text-light bg-dark border-light': isDarkMode, 'text-dark bg-light border-dark': !isDarkMode }">
                                <ul class="list-group">
                                    <li class="list-group-item" id="lowercase">
                                        <i class="fa-solid fa-circle-xmark text-danger"></i>
                                        Lowercase [a-z]
                                    </li>
                                    <li class="list-group-item" id="uppercase">
                                        <i class="fa-solid fa-circle-xmark text-danger"></i>
                                        Uppercase [A-Z]
                                    </li>
                                    <li class="list-group-item" id="number">
                                        <i class="fa-solid fa-circle-xmark text-danger"></i>
                                        Numbers [0-9]
                                    </li>
                                    <li class="list-group-item" id="specialCharacters">
                                        <i class="fa-solid fa-circle-xmark text-danger"></i> Special
                                        Characters
                                        [#,@,$...]
                                    </li>
                                    <li class="list-group-item" id="whiteSpace">
                                        <i class="fa-solid fa-circle-xmark text-danger"></i> Whitespace [ ]
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mb-3 col-sm-12 col-md-12 col-lg-6">
                <div class="card">
                    <div class="card-body"
                        :class="{ 'text-light bg-dark border-light': isDarkMode, 'text-dark bg-light border-dark': !isDarkMode }">
                        <div class="card-head mb-4">
                            <h4 class="card-title" :class="{ 'text-danger': isDarkMode, 'text-success': !isDarkMode }">
                                <strong>Reset Password</strong>
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
                                <input type="password" class="form-control" id="password" placeholder="Password"
                                    required maxlength="20" minlength="8" v-on:input="checkPassword">
                                <label for="password">Password</label>
                                <div class="valid-feedback" id="password-valid">
                                    {{ passwordValidMessage }}
                                </div>
                                <div class="invalid-feedback" id="password-invalid">
                                    Your password must include 8-20 characters, including letters (uppercase and
                                    lowercase),
                                    numbers, spaces and special characters.
                                </div>
                                <div class="progress mb-3 mt-3 d-none" data-bs-toggle="tooltip" data-bs-placement="top"
                                    title="">
                                    <div class="progress-bar bg-success" role="progressbar" style="width: 0%"
                                        aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" id="progress"></div>
                                </div>
                            </div>
                            <div class="form-floating text-dark mb-3">
                                <input type="password" class="form-control" id="retype-password"
                                    placeholder="Re-type Password" required maxlength="20" minlength="8"
                                    v-on:input="checkRetype">
                                <label for="retype-password">Re-type Password</label>
                                <div class="valid-feedback">
                                    Password Matched
                                </div>
                                <div class="invalid-feedback">
                                    Password not matched
                                </div>
                                <div class="progress mb-3 mt-3 d-none" data-bs-toggle="tooltip" data-bs-placement="top"
                                    title="">
                                    <div class="progress-bar bg-success" role="progressbar" style="width: 0%"
                                        aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" id="progress"></div>
                                </div>
                            </div>
                            <div class="form-floating text-center mb-3">
                                <vue-recaptcha ref="recaptcha" :sitekey="siteKey" @verify="captchaVerify"
                                    @error="captchaError" @expired="captchaExpired" />
                            </div>
                            <div class="text-center mb-3">
                                <button type="submit" class="btn btn-primary">Reset Password
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

// Import Password Analyzer
import PasswordAnalyzer from "../../../../library/security/lib.password.analyzer"
const Analyzer = new PasswordAnalyzer();

export default {
    name: 'ResetPassword',
    components: {
        Alert,
        PreLoader,
        VueRecaptcha
    },
    data() {
        return {
            siteKey: this.$store.getters.getSiteKey,
            images: {
                dark: require('@/assets/reset-pana-dark.svg'),
                light: require('@/assets/reset-pana-light.svg')
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
            passwordValidMessage: "Password accepted",
            passwordAccepted: false,
            typingPassword: false,
            passwordMatched: false,
        }
    },
    beforeMount() {
        if (window.location.search != null && window.location.search.includes('token') && window.location.search.includes('email')) {
            this.token = window.location.search.replace('?', '').split('=')[1].split('&')[0].split('_')[0];
            this.userId = window.location.search.replace('?', '').split('=')[1].split('&')[0].split('_')[1];
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
            let Checks = [];
            [
                { type: "Password", value: this.passwordAccepted },
                { type: "Re-type Password", value: this.passwordMatched }
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
                        email: this.email,
                        resetToken: this.token,
                        captcha: this.captchaToken,
                        userId: this.userId,
                        password: document.getElementById('password').value
                    }
                    // Show Preloader on reset button unless response if error hide preloader and show error in alert component
                    this.showPreloader = true;
                    // Make a request to reset the user api
                    fetch('/api/auth/reset', {
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
        setProgress: (target) => (ariaValuenow, width, innerHTML) => {
            target.attributes.ariaValuenow = ariaValuenow;
            target.style.width = width;
            target.innerHTML = innerHTML;
        },
        toggle: (target) => (source = '', destination = '') => {
            if (source != "") target.classList.remove(source);
            if (destination != "") target.classList.add(destination);
        },
        // Check Password Strength
        checkPassword(event) {
            // Extract progress Bar
            const
                progressbar = document.getElementById('progress'),
                progressDiv = document.getElementsByClassName('progress')[0];
            // Checking if Length is 0
            if (event.target.value.length != 0) {
                this.typingPassword = true;
                // Showing Progress Bar Div
                this.toggle(progressDiv)('d-none')
                // Analyze Password
                let
                    analysis = Analyzer.setPassword(event.target.value),
                    features = analysis.features,
                    totalPercentage = features.strength.totalPercent;
                // Set Progress Bar
                this.setProgress(progressbar)(totalPercentage, `${totalPercentage}%`, `${totalPercentage}% / ${event.target.value.length} characters.`)
                // Set Combination Message on Tooltip
                progressDiv.attributes.title.value = `${features.combinations} possible combinations to crack.`
                // Set Progress Bar Color
                if (totalPercentage >= 80) this.toggle(progressbar)('bg-warning', 'bg-success');
                else if (totalPercentage >= 50) this.toggle(progressbar)('bg-danger', 'bg-warning');
                else this.toggle(progressbar)('bg-success', 'bg-danger');
                // Checking password accepted
                this.passwordAccepted = features.acceptable;
                const retype = document.getElementById('retype-password');
                // A div Handle Showing Checks on Items Matched
                setTimeout(() => {
                    for (const key in features.characterCount) {
                        if (Object.hasOwnProperty.call(features.characterCount, key)) {
                            const item = document.getElementById(key);
                            item.firstElementChild.innerHTML = features.characterCount[key];
                            if (features.characterCount[key] == 0) {
                                this.toggle(item.firstChild)('text-success', 'text-danger');
                                this.toggle(item.firstChild)('fa-circle-check', 'fa-circle-xmark');
                            } else {
                                this.toggle(item.firstChild)('fa-circle-xmark', 'fa-circle-check');
                                this.toggle(item.firstChild)('text-danger', 'text-success');
                            }
                        }
                    }
                }, 5)

                if (retype.value == event.target.value) {
                    this.toggle(retype)('is-invalid', 'is-valid')
                    this.passwordMatched = true;
                } else {
                    this.toggle(retype)('is-valid', 'is-invalid')
                    this.passwordMatched = false;
                }
                // Show Messages
                if (features.acceptable) {
                    this.toggle(event.target)('is-invalid', 'is-valid')
                    // Set Message
                    this.passwordValidMessage = analysis.message.split(',')[0] + ' ' + analysis.message.split(',')[1];
                } else this.toggle(event.target)('is-valid', 'is-invalid')
            }
            else {
                this.typingPassword = false;
                // Resetting Toggle
                this.toggle(event.target)('is-valid')
                this.toggle(event.target)('is-invalid')
                // Set Progress
                this.setProgress(progressbar)(0, `0%`, `0%`)
                // Hiding Whole Div
                this.toggle(progressDiv)('', 'd-none')
            }
        },
        checkRetype(event) {
            // Checking Required Length is not 0
            if (event.target.value.length != 0) {
                // Checking if Password Match
                if (event.target.value == document.getElementById('password').value) {
                    this.toggle(event.target)('is-invalid', 'is-valid')
                    this.passwordMatched = true;
                } else {
                    this.toggle(event.target)('is-valid', 'is-invalid')
                    this.passwordMatched = false;
                }
            } else {
                // Resetting 
                this.toggle(event.target)('is-valid')
                this.toggle(event.target)('is-invalid')
            }
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