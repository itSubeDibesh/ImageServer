<template>
    <div class="mb-3">
        <h3 :class="{ 'text-light': isDarkMode, 'text-dark': !isDarkMode }">ForgetPassword</h3>
    </div>
</template>


<script>
export default {
    name: 'ForgetPassword',
    computed: {
        isDarkMode() {
            return this.$store.getters.appMode;
        }
    },
}
</script>