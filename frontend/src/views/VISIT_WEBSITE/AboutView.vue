<template>
  <div class="row">
    <div class="mb-3 col-lg-6 col-md-6 d-none d-lg-block">
      <img :src="isDarkMode ? images.light : images.dark" class="img img-fluid" alt="About Image">
    </div>
    <div class="col-sm-12 col-md-12 col-lg-6 mb-3">
      <div class="card">
        <div class="card-body"
          :class="{ 'text-light bg-dark border-light': isDarkMode, 'text-dark bg-light border-dark': !isDarkMode }">
          <div class="card-head mb-4">
            <h4 class="card-title" :class="{ 'text-danger': isDarkMode, 'text-success': !isDarkMode }">
              <strong>About</strong>
            </h4>
          </div>
          <div class="row">
            <div class="col-sm-12 col-md-8 col-lg-8 mb-3">
              <p class="card-text">
                <strong>ImageServer</strong> is a web application that allows user to upload images and view them.
                This project is created in completion of <strong>Advanced Cyber Security CET324</strong> course at <a
                  href="https://www.ismt.edu.np/" target="_black" class="link-danger"><strong>ISMT College</strong></a>
                affiliated to
                <a href="https://www.sunderland.ac.uk/" target="_black" class="link-success"><strong>University Of
                    Sunderland</strong></a>. This project is developed by <a href="https://www.github.com/itSubeDibesh"
                  target="blank" class="link-primary" data-bs-toggle="tooltip" data-bs-placement="left"
                  title="Link to GitHub"><strong>Dibesh
                    Raj Subedi</strong></a> and demonstrates security features like <i> access control using
                  <strong><span data-bs-toggle="tooltip" data-bs-placement="left"
                      title="Role Based Access Control">RBAC</span></strong>, password
                  strength evaluator, and several other security features preventing web attacks.</i>
              </p>
            </div>
            <div class="col-sm-12 col-md-4 col-lg-4 mb-3">
              <a href="https://www.sunderland.ac.uk/" target="_black" data-bs-toggle="tooltip" data-bs-placement="left"
                title="University of Sunderland"><img :src="images.sunderland" class="img img-fluid"
                  alt="SunderLand Image" /></a>
              <a href="https://www.ismt.edu.np/" target="_black" data-bs-toggle="tooltip" data-bs-placement="left"
                title="ISMT College"><img :src="images.ismt" class="img img-fluid" style="max-width:70%;"
                  alt="Ismt Image" /></a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  </div>

</template>

<script>
import Footer from '@/components/Footer.vue'
export default {
  name: 'About',
  components: {
    Footer
  },
  data() {
    return {
      images: {
        dark: require('@/assets/about-team-rafiki-dark.svg'),
        light: require('@/assets/about-team-rafiki-light.svg'),
        ismt: require('@/assets/ismt.png'),
        sunderland: require('@/assets/sunderland.png'),
      }
    }
  },
  computed: {
    isDarkMode() {
      return this.$store.getters.appMode;
    },
  }
}
</script>