<template>
    <div class="row">
        <div class="col-sm-12 col-md-12 col-lg-7 mb-3">
            <div class="card">
                <div class="card-body"
                    :class="{ 'text-light bg-dark border-light': isDarkMode, 'text-dark bg-light border-dark': !isDarkMode }">
                    <div class="card-head mb-4">
                        <h4 class="card-title" :class="{ 'text-danger': isDarkMode, 'text-success': !isDarkMode }">
                            <strong>Contact</strong>
                        </h4>
                    </div>
                    <div class="row">
                        <div class="col-sm-12 col-md-4 col-lg-4 mb-3 text-center">
                            <img :src="images.gif" class="img img-fluid" alt="Dibesh Github Image">
                        </div>
                        <div class="col-sm-12 col-md-8 col-lg-8">
                            <p class="card-text text-center mb-3">
                                <strong>Any Queries ?</strong><br /><br /> You can contact me on
                                <a href="https://www.github.com/itSubeDibesh" target="blank" class="link-danger"
                                    data-bs-toggle="tooltip" data-bs-placement="left" title="Link to GitHub"><strong><i
                                            class="fa-brands fa-github"></i> itSubeDibesh</strong></a>
                                <br /> Or send me an email at <a href="mailto:dibeshrsubedi@gmail.com" target="_blank"
                                    class="link-success" data-bs-toggle="tooltip" data-bs-placement="left"
                                    title="Email Address"><strong><i class="fas fa-envelope-open-text"></i>
                                        dibeshrsubedi@gmail.com</strong></a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="mb-3 col-lg-5 col-md-5 d-none d-lg-block">
            <img :src="isDarkMode ? images.light : images.dark" class="img img-fluid" alt="Contact Image">
        </div>
    </div>
</template>

<script>
export default {
    name: 'Contact',
    props: ["isDarkMode"],
    data() {
        return {
            images: {
                dark: require('@/assets/contact-pana-dark.svg'),
                light: require('@/assets/contact-pana-light.svg'),
                gif: require('@/assets/GitHub.gif')
            }
        }
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