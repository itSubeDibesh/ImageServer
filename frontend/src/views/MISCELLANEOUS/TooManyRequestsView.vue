<template>
    <div class="row">
        <div class="col-12 mb-3">
            <div :class="{ 'text-light bg-dark': isDarkMode, 'text-dark bg-light': !isDarkMode }">
                <div class="card-body">
                    <div class="card-head mb-3">
                        <h3 class="card-title text-center"
                            :class="{ 'text-danger': isDarkMode, 'text-success': !isDarkMode }">
                            <strong>Too Many Requests</strong>
                        </h3>
                    </div>
                    <div class="card-text mb-3 text-center">
                        <img :src="isDarkMode ? images.TooManyRequests.light : images.TooManyRequests.dark"
                            class="img img-fluid" style="max-width:30%;" alt="404 Image">
                    </div>
                    <div class="text-center mb-3">
                        <h5 class="text-primary mb-3"><strong>Please slow down, <br /> Some links might take time to
                                work
                                again.</strong></h5>
                        <router-link to="/" class="btn"
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
    name: 'TooManyRequests',
    data() {
        return {
            images: {
                "TooManyRequests": {
                    dark: require('@/assets/429-amico-dark.svg'),
                    light: require('@/assets/429-amico-light.svg')
                }
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