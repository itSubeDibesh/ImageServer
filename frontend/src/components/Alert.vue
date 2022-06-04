<template>
    <div class="mb-3 d-flex justify-content-center" v-if="showAlert">
        <div :class="{ 'bg-dark text-light': isDarkMode, 'bg-light text-dark': !isDarkMode }">
            <div class="alert alert-dismissible fade show"
                :class="{ 'alert-warning': warning, 'alert-success': success, 'alert-danger': danger, 'alert-primary': info }"
                role="alert">
                <strong> <i class="fas fa-bullhorn"></i> Alert :
                </strong> <i class="fa-solid"
                    :class="{ 'fa-triangle-exclamation': warning, 'fa-circle-check': success, 'fa-skull-crossbones': danger, 'fa-circle-info': info }"></i>
                {{ message }}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Alert",
    props: ["message", "type", "showAlert"],
    data() {
        return {
            warning: false,
            success: false,
            danger: false,
            info: false,
        };
    },
    updated() {
        switch (this.type) {
            case "warning":
                this.warning = true;
                this.success = false;
                this.danger = false;
                this.info = false;
                break;
            case "success":
                this.success = true;
                this.warning = false;
                this.danger = false;
                this.info = false;
                break;
            case "danger":
                this.danger = true;
                this.warning = false;
                this.success = false;
                this.info = false;
                break;
            case "info":
                this.info = true;
                this.warning = false;
                this.success = false;
                this.danger = false;
                break;
        }
    },
    computed: {
        isDarkMode() {
            return this.$store.getters.appMode;
        },
    }
}
</script>