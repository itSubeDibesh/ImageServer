<template>
    <div class="mb-3 d-flex justify-content-center" v-if="showPreloader">
        <div :class="{ 'bg-dark text-light': isDarkMode, 'bg-light text-dark': !isDarkMode }"
            :style="{ width: width, height: height }">
            <img src="/img/icons/mstile-150x150.png" style="margin-bottom:-30%;" class="card-img-top" alt="ImageServer">
            <div class="card-body text-center">
                <h3 class="card-text">Loading</h3>
                <div class="spinner-grow text-primary" role="status"></div>
                <div class="spinner-grow text-success" role="status"> </div>
                <div class="spinner-grow text-danger" role="status"></div>
                <div class="spinner-grow text-warning" role="status"></div>
                <div class="spinner-grow text-info" role="status"></div>
                <div class="spinner-grow" :class="{ 'text-light': isDarkMode, 'text-dark': !isDarkMode }" role="status">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "PreLoader",
    props: ["timeout", "width", "height", "keepLoading", "appLoad"],
    data() {
        return {
            showPreloader: true,
            marginTop: true,
        };
    },
    mounted() {
        if (this.appLoad)
            setTimeout(() => {
                this.showPreloader = this.keepLoading || false;
                this.$store.commit(this.showPreloader ? 'isLoading' : 'isNotLoading');
            }, this.timeout);
        else if (this.timeout)
            setTimeout(() => {
                this.showPreloader = this.keepLoading || false;
                this.$store.commit(this.showPreloader ? 'isLoading' : 'isNotLoading');
            }, this.timeout);
    },
    computed: {
        isDarkMode() {
            return this.$store.getters.appMode;
        },
    },
}
</script>