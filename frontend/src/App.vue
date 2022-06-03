<template>
  <PreLoader v-if="showPreload" :width="'30%'" :timeout="15e2" />
  <div v-else>
    <NavBar :title="title" v-on:changeMode="changeMode" v-on:isLoggedIn="isLoggedIn" />
    <div class="container" :class="{ 'mt-5 pt-5': isOnline, 'mt-3 pt-0': !isOnline }">
      <NetworkStatus :class="{ 'd-none': isOnline }" />
      <div class="mb-5">
        <router-view />
      </div>
      <Footer :fixedBottom="true" />
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import NetworkStatus from '@/components/NetworkStatus.vue'
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
import PreLoader from '@/components/PreLoader.vue'

// Exporting the data required by other components

export default {
  components: {
    NavBar,
    PreLoader,
    NetworkStatus,
    Footer
  },
  data() {
    return {
      title: "Home"
    };
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
    },
    // UserLogin
    isUserLoggedIn() {
      // Handle Storage
      // addEventListener('storage', event => {
      //   this.hasLoggedIn(event.newValue == 'true');
      //   if (event.newValue != "true") {
      //     this.$router.push('/');
      //   } else {
      //     this.$router.push('/dashboard');
      //   }
      // });
      // if (localStorage.getItem('isLoggedIn') == 'true') {
      //   this.$router.push('/dashboard');
      // } else {
      //   this.$router.push('/');
      // }
    },
    hasLoggedIn(value) {
      if (value !== undefined) {
        // Triggers when the loggedIn event is emitted from login component
        // console.log(value, "triggered"); -> email, Password and isLoggedIn
        this.$store.commit(value ? 'isLoggedIn' : 'isLoggedOut')
        localStorage.setItem('isLoggedIn', value);
      }
    }
  },
  watch: {
    $route(to, from) {
      // console.log(to, from)
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
    },
  },
  beforeMount() {
    // Enabling Show Preloader
    this.$store.commit('isLoading');
    // Check if network is connected
    this.isNetworkConnected();
    // Check if Night Mode is enabled
    this.isNightModeEnabled();
    // Check if user is logged in
    this.isUserLoggedIn();
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
    }
  }
};
</script>

// Issue on is LoggedIn