<template>
    <div class="row">
        <div class="col-12 mb-3">
            <div :class="{ 'text-light bg-dark': isDarkMode, 'text-dark bg-light': !isDarkMode }">
                <div class="card-body">
                    <div class="card-head mb-3">
                        <h3 class="card-title text-center"
                            :class="{ 'text-danger': isDarkMode, 'text-success': !isDarkMode }">
                            <strong>Resource Not found!</strong>
                        </h3>
                    </div>
                    <div class="card-text mb-3 text-center">
                        <img :src="isDarkMode ? images.PageNotFound.light : images.PageNotFound.dark"
                            class="img img-fluid" style="max-width:30%;" alt="404 Image">
                    </div>
                    <div class="text-center mb-3">
                        <router-link to="/dashboard" class="btn" v-if="userLoggedIn.loggedIn"
                            :class="{ 'btn-danger': isDarkMode, 'btn-success': !isDarkMode }">
                            <strong>Back to Dashboard </strong>
                            <i class="fas fa-gauge"></i>
                        </router-link>
                        <router-link to="/" class="btn" v-else
                            :class="{ 'btn-danger': isDarkMode, 'btn-success': !isDarkMode }">
                            <strong>Back to Home </strong>
                            <i class="fas fa-home-lg"></i>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PageNotFound',
    data() {
        return {
            images: {
                "PageNotFound": {
                    dark: require('@/assets/404-bot-cuate-dark.svg'),
                    light: require('@/assets/404-bot-cuate-light.svg')
                }
            }
        }
    },
    computed: {
        isDarkMode() {
            return this.$store.getters.appMode;
        },
        userLoggedIn() {
            return this.$store.getters.userLoggedIn;
        },
    }
}
</script>