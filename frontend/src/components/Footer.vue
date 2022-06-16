<template>
    <div>
        <div
            :class="{ 'text-center mt-3': true, 'fixed-bottom': fixedBottom, 'sticky-bottom': !fixedBottom, 'bg-dark text-light': isDarkMode, 'bg-light text-dark': !isDarkMode, }">
            <p class="m-2"><b>Crafted with <i class="fas fa-heart text-danger"></i> by <a
                        href="https://www.github.com/itSubeDibesh" target="blank" class="link-success">Dibesh
                        Raj Subedi</a></b>
                &nbsp;
                <button type="button" class="btn btn-sm"
                    :class="{ 'btn-dark text-light': !isDarkMode, 'btn-light text-dark': isDarkMode }"
                    data-bs-toggle="modal" data-bs-target="#attributions">
                    <strong>Attributions</strong>
                </button>
            </p>
        </div>
        <!-- Modal -->
        <div class="modal fade" id="attributions" tabindex="-1" aria-labelledby="attributionsLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content"
                    :class="{ 'text-light bg-dark': isDarkMode, 'text-dark bg-light': !isDarkMode }">
                    <div class="modal-header">
                        <h4 class="modal-title" id="attributionsLabel"><strong>Attributions</strong></h4>
                        <button type="button" class="btn-close bg-danger" data-bs-dismiss="modal"
                            aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <a href="https://storyset.com/mobile" target="_blank" data-bs-toggle="tooltip"
                            data-bs-placement="top" title="Storyset"><img
                                :src="isDarkMode ? images.storySet.light : images.storySet.dark" class="img img-fluid"
                                style="max-width:50%" alt="StorySet"></a>
                        <a href="https://getbootstrap.com/" target="_blank" data-bs-toggle="tooltip"
                            data-bs-placement="top" title="Bootstrap"><img :src="images.bootstrap" class="img img-fluid"
                                style="max-width:30%" alt="Bootstrap"></a>
                        <a href="https://fontawesome.com/" target="_blank" data-bs-toggle="tooltip"
                            data-bs-placement="top" title="Fontawesome">
                            <i class="fa-solid fa-font-awesome fa-3x"></i>
                        </a>
                        <a href="https://vuejs.org" target="_blank" data-bs-toggle="tooltip" data-bs-placement="top"
                            title="VueJs"><img :src="images.vue" class="img img-fluid" style="max-width:30%"
                                alt="Bootstrap"></a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'Footer',
    props: ["fixedBottom"],
    data() {
        return {
            images: {
                storySet: {
                    light: require('@/assets/storyset-inverted.png'),
                    dark: require('@/assets/storyset-inverted.jpg'),
                },
                bootstrap: require('@/assets/bootstrap.svg'),
                vue: require('@/assets/logo.png'),
            }
        }
    },
    computed: {
        isDarkMode() {
            return this.$store.getters.appMode;
        },
    },
}
</script>