<template>
    <div class="mt-5 pt-5 mb-3">
        <div class="card">
            <div
                :class="{ 'card-body rounded': true, 'bg-dark text-light': isDarkMode, 'bg-light text-dark': !isDarkMode }">
                <strong class="h5"><span class="text-danger">No</span> <span class="text-success">Connection</span> <i
                        class="text-primary fas fa-wifi"></i> !
                </strong> Please check your internet connection.
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "NetworkStatus",
    computed: {
        isDarkMode() {
            return this.$store.getters.appMode;
        },
        isOnline() {
            return this.$store.getters.online;
        },
    },
}
</script>