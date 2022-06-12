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
                    <form v-on:submit="onSubmit">
                        <div class="form-floating text-dark mb-3">
                            <input type="email" class="form-control is-invalid" id="email"
                                placeholder="name@example.com">
                            <label for="email">Email address</label>
                            <div class="valid-feedback">
                                Looks good!
                            </div>
                            <div class="invalid-feedback">
                                Email is required.
                            </div>
                        </div>
                        <div class="form-floating text-dark mb-3">
                            <input type="password" class="form-control is-valid" id="floatingPassword"
                                placeholder="Password">
                            <label for="floatingPassword">Password</label>
                            <div class="valid-feedback">
                                Looks good!
                            </div>
                            <div class="invalid-feedback">
                                Your password must be 8-20 characters long, contain letters and numbers, and must not
                                contain spaces, special characters.
                            </div>
                            <div class="progress mb-3 mt-3">
                                <div class="progress-bar bg-success" role="progressbar" style="width: 50%"
                                    aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">50%</div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-sm-12 col-md-6 col-lg-6">
                                <div class="form-check text-start mb-3">
                                    <input type="checkbox" class="form-check-input" id="exampleCheck1">
                                    <label class="form-check-label" for="exampleCheck1">Remember Email
                                        <i class="fas fa-envelope text-primary"></i></label>
                                </div>
                            </div>
                            <div class="col-sm-12 col-md-6 col-lg-6 text-end mb-3">
                                <strong>
                                    <router-link to="/forgot" class="link-info">Forgot Password?</router-link>
                                </strong>
                            </div>
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
</template>

<script>
// Importing Password Analyzer
import PasswordAnalyzer from "../../../../library/security/lib.password.analyzer"

export default {
    name: 'Login',
    data() {
        return {
            images: {
                login: {
                    dark: require('@/assets/login-rafiki-dark.svg'),
                    light: require('@/assets/login-rafiki-light.svg')
                }
            }
        }
    },
    methods: {
        onSubmit(event) {
            event.preventDefault();
            let email = event.target.email.value;
            let password = event.target.floatingPassword.value;
            this.$store.commit('isLoggedIn', {
                loggedIn: true,
                user: {
                    email: email,
                    password: password,
                    username: "Dibesh"
                }
            })
            // localStorage.setItem('isLoggedIn', true);
            this.$router.push('/dashboard');
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
    },
    computed: {
        isDarkMode() {
            return this.$store.getters.appMode;
        },
        isLoggedIn() {
            return this.$store.getters.userLoggedIn;
        },
    }
}

</script>
