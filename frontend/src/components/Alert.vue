<template>
    <div class="mb-3 d-flex justify-content-center" v-if="alert">
        <div :class="{ 'bg-dark text-light': isDarkMode, 'bg-light text-dark': !isDarkMode }">
            <div class="alert alert-dismissible fade show" :class="itemClass" role="alert">
                <strong> <i class="fas fa-bullhorn"></i> Alert : </strong>
                <i class="fa-solid fa-triangle-exclamation" v-if="warning"></i>
                <i class="fa-solid fa-circle-check" v-if="success"></i>
                <i class="fa-solid fa-skull-crossbones" v-if="danger"></i>
                <i class="fa-solid fa-circle-info" v-if="info"></i>
                {{ msg }}
                <button type="button" v-on:click="hideAlert" class="btn-close" aria-label="Close"></button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Alert",
    props: ["message", "type", "showAlert"],
    emits: ["hideAlert"],
    data() {
        return {
            alert: this.showAlert,
            msg: this.message,
            itemClass: "",
            warning: false,
            success: false,
            danger: false,
            info: false,
        };
    },
    methods: {
        hideAlert() {
            if (this.alert) {
                this.warning = false;
                this.success = false;
                this.danger = false;
                this.info = false;
                this.msg = "";
                this.itemClass = "";
                this.alert = false;
                this.$emit('hideAlert', {
                    message: "",
                    type: "",
                    showAlert: false,
                });
            }
        },
    },
    updated() {
        switch (this.type) {
            case "warning":
                this.itemClass = "alert-warning";
                this.warning = true;
                break;
            case "success":
                this.itemClass = "alert-success";
                this.success = true;
                break;
            case "danger":
                this.itemClass = "alert-danger";
                this.danger = true;
                break;
            case "info":
                this.itemClass = "alert-primary";
                this.info = true;
                break;
        }
        this.alert = this.showAlert;
        this.msg = this.message;
    },
    computed: {
        isDarkMode() {
            return this.$store.getters.appMode;
        },
        getAlert() {
            const alert = this.$store.getters.getAlert;
            switch (this.type) {
                case "warning":
                    this.itemClass = "alert-warning";
                    this.warning = true;
                    break;
                case "success":
                    this.itemClass = "alert-success";
                    this.success = true;
                    break;
                case "danger":
                    this.itemClass = "alert-danger";
                    this.danger = true;
                    break;
                case "info":
                    this.itemClass = "alert-primary";
                    this.info = true;
                    break;
            }
            this.alert = this.showAlert;
            this.msg = this.message;
        }
    }
}
</script>