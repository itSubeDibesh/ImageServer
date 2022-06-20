<template>
  <PreLoader v-if="showPreload" :timeout="15e2" :appLoad="true" style="margin:15%;" />
  <div v-else>
    <NavBar :title="title" v-on:changeMode="changeMode" v-on:isLoggedIn="isLoggedIn" />
    <div class="container" :class="{ 'mt-5 pt-5': isOnline, 'mt-3 pt-0': !isOnline }">
      <NetworkStatus :class="{ 'd-none': isOnline }" />
      <div class="mb-5">
        <Alert :type="alertType" :showAlert="showAlert" :message="alertMessage" @hideAlert="hideAlert" />
        <router-view />
      </div>
    </div>
  </div>
  <Footer v-if="userLoggedIn.loggedIn" :fixedBottom="true" />
</template>
<script>
// @ is an alias to /src
import NetworkStatus from '@/components/NetworkStatus.vue'
import NavBar from '@/components/NavBar.vue'
import Alert from '@/components/Alert.vue';
import PreLoader from '@/components/PreLoader.vue'
import Footer from '@/components/Footer.vue'

import ls from 'localstorage-slim';
import encUTF8 from 'crypto-js/enc-utf8';
import AES from 'crypto-js/aes';

// Exporting the data required by other components

export default {
  components: {
    NavBar,
    PreLoader,
    NetworkStatus,
    Alert,
    Footer
  },
  data() {
    return {
      CSRF: "",
      enc: this.$store.getters.getEnc,
      title: "Home",
      alertType: '',
      alertMessage: '',
      showAlert: false,
      globalRoutes: ['/reset'],
      administratorRoutes: ['/users', '/dashboard'],
      preLoginRoutes: ['/login', '/register', '/', '/about', '/analyze', '/forget', '/verify'],
      postLoginRoutes: [
        '/images',
        '/settings'
      ],
    };
  },
  methods: {
    hideAlert(event) {
      this.showAlert = event.showAlert;
      this.alertType = event.type;
      this.alertMessage = event.message;
    },
    changeColor() {
      if (localStorage.length != 0 && localStorage.getItem('isDarkMode') === 'false') {
        document.body.classList.remove('bg-dark');
        document.body.classList.add('bg-light');
      } else {
        document.body.classList.remove('bg-light');
        document.body.classList.add('bg-dark');
      }
    },
    // Detect Dark Mode
    isNightModeEnabled() {
      this.changeColor();
      if (localStorage.length != 0 && localStorage.getItem('isDarkMode') === 'false') this.changeMode(false)
      else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          this.changeMode(true)
          this.changeColor();
        }
      }
      // Observe Night Mode as well
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', e => {
          if (localStorage.getItem('isDarkMode') == undefined) {
            this.changeMode(e.matches)
            this.changeColor();
          }
        });
    },
    changeMode(value) {
      // this.isDarkMode = value;
      localStorage.setItem('isDarkMode', value);
      this.$store.commit(value ? "isNightMode" : "isDayMode");
      this.changeColor();
    },
    // Detect if online
    isNetworkConnected() {
      this.$store.commit(navigator.onLine ? 'isConnected' : 'isDisconnected');
      window.addEventListener('online', () => this.$store.commit('isConnected'));
      window.addEventListener('offline', () => this.$store.commit('isDisconnected'));
    }
  },
  watch: {
    $route(to, from) {
      this.title = to.meta.title;
      document.title = `${this.title} || Image Server` || "Image Server";
      if (this.title === undefined) {
        // Redirect to 404 page
        this.$router.push('/404');
      }
      // 429 - Too Many Requests
      if (to.path == "/429") {
        this.$router.push('/429');
      }

      // Check LoggedIn and Session expired
      if (this.userLoggedIn.loggedIn) {
        // Send Login Check Request
        const Payload = {
          UserId: this.userLoggedIn.user.UserId
        }
        fetch('/api/auth/login_check', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.userLoggedIn.token,
            'X-CSRF-TOKEN': this.CSRF
          },
          body: JSON.stringify(Payload)
        })
          .then(response => response.json())
          .then(response => {
            if (!response.success) {
              ls.remove('userState');
              // Logout user 
              this.$store.commit('isLoggedIn', {
                loggedIn: false,
                user: {},
                token: {}
              });

              this.$store.commit('setAlert', {
                type: 'danger',
                message: response.result,
                showAlert: true
              });
              this.$router.push('/login');
            }
          });
      }

      // Global routs are accessible from everywhere
      // Pre Loggedin Routs are not accessible from logged in user
      if (this.preLoginRoutes.includes(to.path)) {
        // User Logged In  -> Don't AllowPreLoggedin Access 
        if (this.userLoggedIn.loggedIn && this.userLoggedIn.token != null) {
          if (this.userLoggedIn.user.UserGroup != 'ADMINISTRATOR') {
            this.$router.push('/images');
          } else {
            this.$router.push('/dashboard');
          }
        }
      }
      // Post logged in routes are not accessible from pre logged in user
      if (this.postLoginRoutes.includes(to.path)) {
        // User Not Logged In  -> Don't Allow Post Loggedin Access 
        if (!this.userLoggedIn.loggedIn || this.userLoggedIn.token == null) {
          this.$router.push('/login');
        }
      }
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
    });
    if (Stored != null && Stored.token != null) {
      this.$store.commit('isLoggedIn', {
        loggedIn: Stored.loggedIn,
        token: Stored.token,
        user: Stored.user
      })
    }
    this.$store.subscribe((mutation) => {
      if (mutation.type == "setAlert") {
        this.showAlert = mutation.payload.showAlert;
        this.alertType = mutation.payload.type;
        this.alertMessage = mutation.payload.message;
      }
    })
    // Enabling Show Preloader
    this.$store.commit('isLoading');
    // Check if network is connected
    this.isNetworkConnected();
    // Check if Night Mode is enabled
    this.isNightModeEnabled();
  },
  computed: {
    showPreload() {
      return this.$store.getters.loading;
    },
    isDarkMode() {
      this.isNightModeEnabled()
      return this.$store.getters.appMode;
    },
    isOnline() {
      return this.$store.getters.online;
    },
    userLoggedIn() {
      return this.$store.getters.userLoggedIn;
    },
  }
};
</script>
