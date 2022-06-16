<template>
    <div class="mb-3">
        <h3 :class="{ 'text-light': isDarkMode, 'text-dark': !isDarkMode }">Images</h3>
    </div>
</template>


<script>
export default {
    name: 'Images',
    computed: {
        isDarkMode() {
            return this.$store.getters.appMode;
        }
    }
}
</script>