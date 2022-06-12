<template>
  <div class="row">
    <div class="col-sm-12 col-md-12 col-lg-5 mb-3">
      <div class="card">
        <div class="card-body"
          :class="{ 'text-light bg-dark border-light': isDarkMode, 'text-dark bg-light border-dark': !isDarkMode }">
          <div class="card-head mb-4">
            <h4 class="card-title" :class="{ 'text-danger': isDarkMode, 'text-success': !isDarkMode }">
              <strong>Welcome</strong>
            </h4>
          </div>
          <div class="row">
            <p>
              To <strong>ImageServer</strong>, <br /> One and only platform where you can <strong>upload</strong> your
              image in cloud and
              <strong>access</strong> it from anywhere.
              We prioritize the user experience and the <strong>security</strong> of your data. <strong>
                <router-link to="/register" class="link-success">Create an account</router-link>
              </strong> and enjoy the benefits of our service.
              <br>
              Know more about us <strong>
                <router-link to="/about" class="link-success">here</router-link>
              </strong> and
              if you have any questions, please <strong>
                <router-link to="/contact" class="link-success">contact us</router-link>
              </strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="mb-3 col-lg-7 col-md-7 d-none d-lg-block">
      <img :src="isDarkMode ? images.light : images.dark" class="img img-fluid" alt="Home Image">
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      images: {
        dark: require('@/assets/home-rafiki-dark.gif'),
        light: require('@/assets/home-rafiki-light.gif'),
        gif: require('@/assets/GitHub.gif')
      }
    }
  },
  computed: {
    isDarkMode() {
      return this.$store.getters.appMode;
    }
  }
};
</script>
