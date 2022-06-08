<template>
    <div class="row">
        <div class="mb-3 col-sm-12 col-md-12 col-lg-6">
            <div class="card mb-3">
                <div class="card-body"
                    :class="{ 'text-light bg-dark border-light': isDarkMode, 'text-dark bg-light border-dark': !isDarkMode }">
                    <div class="card-head mb-4">
                        <h4 class="card-title" :class="{ 'text-danger': isDarkMode, 'text-success': !isDarkMode }">
                            <strong>Register</strong>
                        </h4>
                    </div>
                    <Alert :type="alertType" :showAlert="showAlert" :message="alertMessage" @hideAlert="hideAlert" />
                    <PreLoader v-if="showPreloader" :keepLoading="true" />
                    <div v-else>
                        <div v-if="!timeOutHandler.allowAccess">
                            <h3 class="text-center"><strong>Enabling registration after ⌚.. </strong></h3>
                            <CountDown :allowAccess="timeOutHandler.allowAccess" :name="timeOutHandler.timer_name"
                                :timeout="timeOutHandler.timeout" :showTimer="timeOutHandler.showTimer" />
                        </div>
                        <form v-on:submit="onSubmit" v-else>
                            <div class="form-floating text-dark mb-3">
                                <input type="text" class="form-control" id="fullname" placeholder="Full Name" required
                                    minlength="3" v-on:input="checkFullName">
                                <label for="fullname">Full Name</label>
                                <div class="invalid-feedback">
                                    [FirstName MiddleName LastName] Or FirstName of at least 3 characters required.
                                </div>
                                <div class="valid-feedback">
                                    Looks good!
                                </div>
                            </div>
                            <div class="form-floating text-dark mb-3">
                                <input type="text" class="form-control" id="username" placeholder="Username"
                                    maxLength="16" minlength="6" required v-on:input="checkUserName">
                                <label for="username">User Name</label>
                                <div class="valid-feedback">
                                    Looks good!
                                </div>
                                <div class="invalid-feedback">
                                    Invalid username
                                </div>
                            </div>
                            <div class="form-floating text-dark mb-3">
                                <input type="email" class="form-control" id="email" required
                                    placeholder="name@example.com" v-on:input="checkEmail">
                                <label for="email">Email address</label>
                                <div class="valid-feedback">
                                    Looks good!
                                </div>
                                <div class="invalid-feedback">
                                    Invalid email.
                                </div>
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
                                <vue-recaptcha ref="recaptcha" sitekey="6Ldgc0cgAAAAAHjqNfj5q4qWUruiHOnlF_3iF37k"
                                    @verify="captchaVerify" @error="captchaError" @expired="captchaExpired" />
                            </div>
                            <div class="text-center mb-3">
                                <button type="submit" class="btn btn-primary">Register <i
                                        class="fa-solid fa-user-plus"></i></button>
                            </div>
                            <div class="text-center mb-3">
                                <p>Have account? <strong>
                                        <router-link to="/login" class="link-success">Login
                                        </router-link>
                                    </strong>
                                </p>
                            </div>
                            <div class="text-center mb-3">
                                <p>How strong is your password? <strong>
                                        <router-link to="/analyze" class="link-primary">Analyze it?
                                        </router-link>
                                    </strong>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <div class="mb-3 col-lg-6 col-md-6 d-none d-lg-block">
            <div class="row">
                <div class="mb-3 col-lg-12 col-md-12 ">
                    <img :src="isDarkMode ? images.light : images.dark" class="img img-fluid" alt="Register Image">
                </div>
                <div class="mb-3 col-lg-6 col-md-6 col-sm-6" v-if="typingPassword">
                    <div class="card mb-3">
                        <div class="card-body"
                            :class="{ 'text-light bg-dark border-light': isDarkMode, 'text-dark bg-light border-dark': !isDarkMode }">
                            <ul class="list-group">
                                <li class="list-group-item" id="lowerCaseAccept"> <i
                                        class="fa-solid fa-check-circle text-danger"></i>
                                    Lowercase [a-z]
                                </li>
                                <li class="list-group-item" id="upperCaseAccept"><i
                                        class="fa-solid fa-check-circle text-danger"></i>
                                    Uppercase [A-Z]
                                </li>
                                <li class="list-group-item" id="numberAccept"><i
                                        class="fa-solid fa-circle text-danger"></i> Numbers [0-9]
                                </li>
                                <li class="list-group-item" id="specialCharactersAccept"><i
                                        class="fa-solid fa-circle text-danger"></i> Special
                                    Characters
                                    [#,@,$...]</li>
                                <li class="list-group-item" id="whitespaceAccept"><i
                                        class="fa-solid fa-circle text-danger"></i> Whitespace [
                                    ]</li>
                            </ul>
                        </div>
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

// Import Password Analyzer
import PasswordAnalyzer from "../../../../library/security/lib.password.analyzer"
const Analyzer = new PasswordAnalyzer();

export default {
    name: 'Register',
    components: {
        PreLoader,
        Alert,
        CountDown,
        VueRecaptcha
    },
    data() {
        return {
            images: {
                dark: require('@/assets/register-pana-dark.svg'),
                light: require('@/assets/register-pana-light.svg')
            },
            timeOutHandler: {
                timeout: 0,
                showTimer: false,
                allowAccess: true,
                timer_name: "register_timeout",
            },
            is429: false,
            passwordValidMessage: "Password accepted",
            passwordAccepted: false,
            typingPassword: false,
            passwordMatched: false,
            emailAccepted: false,
            fullNameAccepted: false,
            usernameAccepted: false,
            CSRF: "",
            showPreloader: false,
            alertType: "",
            showAlert: false,
            alertMessage: "",
            captchaVerified: false,
            captchaToken: "",
        }
    },
    mounted() {
        // Fetch CSRF Token
        // fetch('/api/auth/csrf', {
        //     method: 'GET',
        //     credentials: 'same-origin'
        // }).then(response => {
        //     if (response.status === 2e2) {
        //         return response.json();
        //     }
        // }).then(json => {
        //     this.CSRF = json.result.CsrfToken;
        // });
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
        captchaVerify(token) {
            this.captchaVerified = true;
            this.captchaToken = token;
        },
        onSubmit(event) {
            event.preventDefault();
            /// Checking if Form Elements are In Valid Alert on Submission click
            let Checks = [];
            [
                { type: "Password", value: this.passwordAccepted },
                { type: "Re-type Password", value: this.passwordMatched },
                { type: "Email", value: this.emailAccepted },
                { type: "FullName", value: this.fullNameAccepted },
                { type: "Username", value: this.usernameAccepted }
            ]
                .forEach(item => {
                    if (!item.value) Checks.push(item.type)
                });
            if (Checks.length != 0) {
                this.showAlert = true;
                this.alertType = "danger";
                this.alertMessage = `${[...Checks]} Not Accepted, Please Check and Try Again.`;
                return;
            } else {
                if (this.captchaVerified == false) {
                    this.showAlert = true;
                    this.alertType = "danger";
                    this.alertMessage = `Captcha Not Verified, Please Check and Try Again.`;
                } else {
                    this.showAlert = false;
                    // Captcha check -> Before Payload Hit 
                    const Payload = {
                        fullname: document.getElementById('fullname').value,
                        username: document.getElementById('username').value,
                        email: document.getElementById('email').value,
                        password: document.getElementById('password').value,
                        captcha: this.captchaToken
                    }
                    // Show Preloader on register button unless response if error hide preloader and show error in alert component
                    this.showPreloader = true;
                    // Make a request to register the user api
                    fetch('/api/auth/register', {
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
                                if (json.status == "error") {
                                    this.alertType = "danger";
                                } else {
                                    this.alertType = "success";
                                }
                                this.alertMessage = json.result;
                                this.showAlert = true;
                            }, 1e3);
                        });
                }
            }
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
                console.log(analysis)


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
        checkEmail(event) {
            // Checking Required Length is not 0
            if (event.target.value.length != 0) {
                // Email Regex Pattern
                if (event.target.value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
                    this.toggle(event.target)('is-invalid', 'is-valid')
                    this.emailAccepted = true;
                } else {
                    this.toggle(event.target)('is-valid', 'is-invalid')
                    this.emailAccepted = false;
                }
            } else {
                // Resetting 
                this.toggle(event.target)('is-valid')
                this.toggle(event.target)('is-invalid')
            }
        },
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
        checkUserName(event) {
            // Checking Required Length is not 0
            if (event.target.value.length != 0) {
                // Regex Full name pattern xxx xxx xxx
                //  ^[a-zA-Z]+[a-zA-Z ]+[a-zA-Z]+$
                if (event.target.value.length >= 6 && event.target.value.length <= 16 && event.target.value.match(/[a-zA-Z0-9]/)) {
                    this.toggle(event.target)('is-invalid', 'is-valid')
                    this.usernameAccepted = true;
                } else {
                    this.toggle(event.target)('is-valid', 'is-invalid')
                    this.usernameAccepted = false;
                }
            } else {
                // Resetting 
                this.toggle(event.target)('is-valid')
                this.toggle(event.target)('is-invalid')
            }
        }
    },
    computed: {
        isDarkMode() {
            return this.$store.getters.appMode;
        },
        // isLoggedIn() {
        //     return this.$store.getters.loggedIn;
        // },
    },

}

</script>
