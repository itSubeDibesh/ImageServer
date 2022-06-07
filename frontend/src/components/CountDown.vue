<template >
    <div class="m-3 row" :class="{ 'bg-dark text-success': isDarkMode, 'bg-light text-danger': !isDarkMode }"
        v-if="isVisible">
        <div class="col-3">
            <table>
                <tr>
                    <td>
                        <div class="text-center">
                            <h1 class="display-1"><strong>{{ days }}</strong></h1>
                            <h5><strong>Days</strong></h5>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
        <div class="col-3">
            <table>
                <tr>
                    <td>
                        <div class="text-center">
                            <h1 class="display-1"><strong>{{ hours }}</strong></h1>
                            <h5><strong>Hours</strong></h5>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
        <div class="col-3">
            <table>
                <tr>
                    <td>
                        <div class="text-center">
                            <h1 class="display-1"><strong>{{ minutes }}</strong></h1>
                            <h5><strong>Minutes</strong></h5>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
        <div class="col-3">
            <table>
                <tr>
                    <td>
                        <div class="text-center">
                            <h1 class="display-1"><strong>{{ seconds }}</strong></h1>
                            <h5><strong>Seconds</strong></h5>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
export default {
    name: "CountDown",
    props: ["allowAccess", "showTimer", "timeout", "name"],
    data() {
        return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            timer: 0,
            isVisible: this.showTimer,
        };
    },
    mounted() {
        if (this.isVisible) {
            if (this.timeout != 0) {
                this.calculateTime();
                this.$store.dispatch({
                    type: "BEGIN_TIMEOUT",
                    payload: {
                        title: this.name,
                        allowAccess: this.allowAccess,
                        showTimer: this.showTimer,
                        timeOut: this.timeout
                    }
                })
                // Figure Out Way to Listen to events from store
                this.$store.subscribe((mutation, state) => {
                    if (mutation.type == "setTimeOut") {
                        if (mutation.payload.title == this.name) {
                            this.timer = mutation.payload.timeOut;
                            this.isVisible = mutation.payload.showTimer;
                            this.calculateTime();
                        }
                    }
                })
            }
        }
    },
    methods: {
        calculateTime() {
            /**
             * 1 Day = 24 Hours
             * 1 Hr = 60 Minutes
             * 1 Min = 60 Seconds
             * 1 Sec = 1000 Milliseconds
             * 
             * 1 Day = 1 * 24 * 60 * 60 * 1000 Milliseconds = 84,400,000 Milliseconds
             * 1 Hr = 1 * 60 * 60 * 1000 Milliseconds = 3,600,000 Milliseconds
             * 1 Min = 1 * 60 * 1000 Milliseconds = 60,000 Milliseconds
             */
            this.days = Math.floor(this.timer / 864e5);
            this.hours = (Math.floor((this.timer - (this.days * 864e5)) / 36e5));
            this.minutes = (Math.floor((this.timer - (this.days * 864e5) - (this.hours * 36e5)) / 6e4));
            this.seconds = (Math.floor(this.timer - (this.days * 864e5) - (this.hours * 36e5) - (this.minutes * 6e4))) / 1e3;
        }
    },
    computed: {
        isDarkMode() {
            return this.$store.getters.appMode;
        }
    }
}
</script>