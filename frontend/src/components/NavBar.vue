<template>
    <nav
        :class="{ 'navbar navbar-expand-lg shadow fixed-top': true, 'navbar-dark bg-dark': nightMode, 'nav-light bg-light': !nightMode }">
        <div class="container-fluid">
            <router-link class="navbar-brand" to="/" v-if="!userLoggedIn.loggedIn">
                <img alt="Image Server Logo" class="bg-transparent p-2" src="/img/icons/favicon-32x32.png" />
                <b><span :class="{ 'text-success': !nightMode, 'text-light': nightMode }">image</span>
                    <span :class="{ 'text-dark': !nightMode, 'text-danger': nightMode }">Server</span></b>
            </router-link>
            <router-link class="navbar-brand" to="/dashboard" v-else>
                <img alt="Image Server Logo" class="bg-transparent p-2" src="/img/icons/favicon-32x32.png" />
                <b><span :class="{ 'text-success': !nightMode, 'text-light': nightMode }">image</span>
                    <span :class="{ 'text-dark': !nightMode, 'text-danger': nightMode }">Server</span></b>
            </router-link>
            <button :class="{ 'navbar-toggler': true }" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false">
                <i :class="{ 'fas fa-bars': true, 'text-dark': !nightMode, 'bg-light': !nightMode }"></i>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item" v-if="userLoggedIn.loggedIn">
                        <router-link class="nav-link text-center"
                            :class="{ active: isActive(`Dashboard`), 'bg-primary text-light': isActive(`Dashboard`) }"
                            aria-current="page" to="/dashboard">
                            <i class="fas fa-gauge"></i> Dashboard
                        </router-link>
                    </li>
                    <li class="nav-item" v-if="!userLoggedIn.loggedIn">
                        <router-link class="nav-link text-center"
                            :class="{ active: isActive(`Home`), 'bg-primary text-light': isActive(`Home`) }"
                            aria-current="page" to="/">
                            <i class="fas fa-home"></i> Home
                        </router-link>
                    </li>
                    <li class="nav-item" v-if="userLoggedIn.loggedIn">
                        <router-link class="nav-link text-center"
                            :class="{ active: isActive(`Images`), 'bg-primary text-light': isActive(`Images`) }"
                            aria-current="page" to="/images">
                            <i class="fas fa-image"></i> Images
                        </router-link>
                    </li>
                    <li class="nav-item" v-if="userLoggedIn.loggedIn">
                        <router-link class="nav-link text-center"
                            :class="{ active: isActive(`Access`), 'bg-primary text-light': isActive(`Access`) }"
                            aria-current="page" to="/access">
                            <i class="fas fa-universal-access"></i> Access
                        </router-link>
                    </li>
                    <li class="nav-item" v-if="userLoggedIn.loggedIn">
                        <router-link class="nav-link text-center"
                            :class="{ active: isActive(`More`), 'bg-primary text-light': isActive(`More`) }"
                            aria-current="page" to="/more">
                            <i class="fas fa-info-circle"></i> More
                        </router-link>
                    </li>
                    <li class="nav-item" v-if="!userLoggedIn.loggedIn">
                        <router-link class="nav-link text-center"
                            :class="{ active: isActive(`About`), 'bg-primary text-light': isActive(`About`) }"
                            aria-current="page" to="/about">
                            <i class="fas fa-circle-info"></i> About
                        </router-link>
                    </li>
                    <li class="nav-item" v-if="!userLoggedIn.loggedIn">
                        <router-link class="nav-link text-center"
                            :class="{ active: isActive(`Contact`), 'bg-primary text-light': isActive(`Contact`) }"
                            aria-current="page" to="/contact">
                            <i class="fas fa-address-card"></i> Contact
                        </router-link>
                    </li>
                    <li class="nav-item" v-if="!userLoggedIn.loggedIn">
                        <router-link class="nav-link text-center"
                            :class="{ active: isActive(`Password Analyzer`), 'bg-primary text-light': isActive(`Password Analyzer`) }"
                            aria-current="page" to="/analyze">
                            <i class="fas fa-gauge"></i> Password Analyzer
                        </router-link>
                    </li>
                </ul>
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <div class="form-switch form-control-lg text-center">
                            <input class="form-check-input" type="checkbox" id="DarkMode" :checked="nightMode"
                                v-on:click="changeMode">
                            <i :class="{ 'text-dark fas fa-moon': !nightMode, 'text-light fas fa-sun': nightMode }"></i>
                        </div>
                    </li>
                    <li class="nav-item" v-if="!userLoggedIn.loggedIn">
                        <router-link class="nav-link text-center"
                            :class="{ active: isActive(`Register`), 'bg-primary text-light': isActive(`Register`) }"
                            aria-current="page" to="/register"><i class="fas fa-user-plus"></i>
                            Register</router-link>
                    </li>
                    <li class="nav-item" v-if="!userLoggedIn.loggedIn">
                        <router-link class="nav-link text-center"
                            :class="{ active: isActive(`Login`), 'bg-primary text-light': isActive(`Login`) }"
                            aria-current="page" to="/login"><i class="fas fa-key"></i>
                            Login</router-link>
                    </li>
                    <li class="nav-item dropdown" v-else>
                        <a class="nav-link text-center dropdown-toggle" href="#" id="navbarDropdown" role="button"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fas fa-user"></i> {{ userLoggedIn.user.UserName }}
                        </a>
                        <ul :class="{ 'dropdown-menu': true, ' dropdown-menu-end': true, 'bg-dark': !nightMode, 'bg-light': nightMode }"
                            aria-labelledby="navbarDropdown">
                            <li>
                                <a :class="{ 'dropdown-item text-center btn': true, 'text-light': !nightMode, 'text-dark': nightMode }"
                                    href="#" id="userDetails">
                                    <span><i class="fas fa-envelope"></i>{{ userLoggedIn.user.Email }}</span>
                                </a>
                            </li>
                            <li>
                                <hr
                                    :class="{ 'dropdown-divider': true, 'text-light': !nightMode, 'text-dark': nightMode }" />
                            </li>
                            <li class="text-center">
                                <a :class="{ 'dropdown-item': true, 'text-light': !nightMode, 'text-dark': nightMode }"
                                    href="#"><i class="fas fa-cogs"></i>
                                    Settings</a>
                            </li>
                            <li class="text-center">
                                <a :class="{ 'dropdown-item': true, 'text-light': !nightMode, 'text-dark': nightMode }"
                                    href="#" v-on:click="logOut"><i class="fas fa-user-lock"></i>
                                    Logout</a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    <Alert :type="alertType" :showAlert="showAlert" :message="alertMessage" @hideAlert="hideAlert" />
</template>

<script>
import $ from 'jquery';
import Alert from '@/components/Alert.vue';
import ls from 'localstorage-slim';
import encUTF8 from 'crypto-js/enc-utf8';
import AES from 'crypto-js/aes';

export default {
    name: "NavBar",
    props: ["title", "subtitle"],
    components: {
        Alert
    },
    data() {
        return {
            enc: this.$store.getters.getEnc,
            darkMode: this.$store.getters.appMode,
            CSRF: "",
            alertType: "",
            showAlert: false,
            alertMessage: "",
        }
    },
    methods: {
        changeColor() {
            if (localStorage.length != 0 && localStorage.getItem('isDarkMode') === 'false') {
                document.body.classList.remove('bg-dark');
                document.body.classList.add('bg-light');
            } else {
                document.body.classList.remove('bg-light');
                document.body.classList.add('bg-dark');
            }
        },
        logOut() {
            // Decrypting Stored Information
            const Stored = ls.get('userState', {
                secret: this.enc,
                decrypt: true,
                decrypter: (data, secret) => {
                    try {
                        return JSON.parse(AES.decrypt(data, secret).toString(encUTF8));
                    } catch (e) {
                        // incorrect/missing secret, return the encrypted data instead
                        return data;
                    }
                }
            })
            // Removing UseState from LocalStorage
            ls.remove('userState');
            // Send Logout Request
            const Payload = {
                UserId: this.userLoggedIn.user.UserId || Stored.user.UserId,
            }
            // Make a request to logout the user api
            fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.userLoggedIn.token || Stored.token,
                    'X-CSRF-TOKEN': this.CSRF
                },
                body: JSON.stringify(Payload)
            }).then(response => {
                if (response.status === 200) {
                    this.$store.commit('isLoggedIn', {
                        loggedIn: false,
                        user: {},
                        token: {}
                    });
                    this.$router.push('/login');
                }
            }).catch(error => {
                this.alertType = json.status == "error" ? "danger" : "success";
                this.alertMessage = `Something went wrong. Please try again.`;
                this.showAlert = true;
                console.log(error);
            });
        },
        isActive(pageTitle) {
            return pageTitle === this.title;
        },
        changeMode() {
            this.darkMode = !this.darkMode;
            this.$store.commit(this.darkMode ? "isNightMode" : "isDayMode");
            localStorage.setItem('isDarkMode', this.darkMode);
            // Toggle icon text color
            // Removing and adding SVG from DOM
            document.getElementById('DarkMode').nextElementSibling.remove()
            document.getElementById('DarkMode').insertAdjacentHTML('afterend', `<i class="fas ${this.nightMode ? "fa-sun text-light" : "fa-moon text-dark"}"></i>`)
        }
    },
    beforeMount() {
        // Hide navbar after open and when clicked out of it
        $(window).click(function (e) {
            if ($(".navbar-collapse").hasClass("show")) {
                $('.navbar-collapse').removeClass("show");
                e.preventDefault();
            }
        });
        $('.navbar-collapse').click(function (event) { event.stopPropagation(); });
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
    computed: {
        nightMode() {
            this.changeColor();
            return this.$store.getters.appMode;
        },
        userLoggedIn() {
            return this.$store.getters.userLoggedIn;
        }
    }
};
</script>
