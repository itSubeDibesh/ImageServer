<template>
    <div class="mb-3">
        <div class="row">
            <div class="col-sm-12 col-md-12 col-lg-12 mb-3 mt-3">

                <div class="card-title text-start pt-2"
                    :class="{ 'text-danger': isDarkMode, 'text-success': !isDarkMode }">
                    <div class="row">
                        <div class="col-6">
                            <h3><i class="fas fa-chart-line"></i> <strong> User Stats</strong></h3>
                        </div>
                        <div class="col-6 text-end">
                            <button class="btn btn-primary" v-on:click="fetchDetails()">
                                <h4><strong> <i class="fas fa-refresh"></i>
                                        Refresh</strong></h4>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-md-4 col-lg-3 mb-3 mt-3">
                <div class="card">
                    <div class="rounded rounded-3 shadow card-body text-light"
                        :class="{ 'bg-danger border-light': isDarkMode, 'bg-success border-dark': !isDarkMode }">
                        <h4 class="card-title "><strong><i class="fas fa-users"></i> Total Users</strong>
                        </h4>
                        <h2 class="card-text text-center"><strong>{{ userStats.totalUser }}</strong></h2>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-md-4 col-lg-3 mb-3 mt-3">
                <div class="card">
                    <div class="rounded rounded-3 shadow card-body text-light"
                        :class="{ 'bg-success border-light': isDarkMode, 'bg-primary border-dark': !isDarkMode }">
                        <h4 class="card-title "><strong><i class="fas fa-user-shield"></i> Admin</strong>
                        </h4>
                        <h2 class="card-text text-center"><strong>{{ userStats.admin }}</strong></h2>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-md-4 col-lg-3 mb-3 mt-3">
                <div class="card">
                    <div class="rounded rounded-3 shadow card-body text-light"
                        :class="{ 'bg-primary border-light': isDarkMode, 'bg-danger border-dark': !isDarkMode }">
                        <h4 class="card-title "><strong><i class="fas fa-user-friends"></i> Users</strong>
                        </h4>
                        <h2 class="card-text text-center"><strong>{{ userStats.users }}</strong></h2>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-md-4 col-lg-3 mb-3 mt-3">
                <div class="card">
                    <div class="rounded rounded-3 shadow card-body text-light"
                        :class="{ 'bg-success border-light': isDarkMode, 'bg-primary border-dark': !isDarkMode }">
                        <h4 class="card-title "><strong><i class="fas fa-envelope"></i> Unverified Users</strong>
                        </h4>
                        <h2 class="card-text text-center"><strong>{{ userStats.unverifiedUsers }}</strong></h2>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-md-4 col-lg-3 mb-3 mt-3">
                <div class="card">
                    <div class="rounded rounded-3 shadow card-body text-light"
                        :class="{ 'bg-success border-light': isDarkMode, 'bg-primary border-dark': !isDarkMode }">
                        <h4 class="card-title "><strong><i class="fas fa-user-xmark"></i> Blocked Users</strong>
                        </h4>
                        <h2 class="card-text text-center"><strong>{{ userStats.blocked }}</strong></h2>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-md-4 col-lg-3 mb-3 mt-3">
                <div class="card">
                    <div class="rounded rounded-3 shadow card-body text-light"
                        :class="{ 'bg-primary border-light': isDarkMode, 'bg-danger border-dark': !isDarkMode }">
                        <h4 class="card-title "><strong><i class="fas fa-user-circle"></i> Active Users</strong>
                        </h4>
                        <h2 class="card-text text-center"><strong>{{ userStats.activeUsers }}</strong></h2>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-12 col-md-12 col-lg-12 mb-3 mt-3">
                <h3 class="card-title  text-start pt-2"
                    :class="{ 'text-success': isDarkMode, 'text-danger': !isDarkMode }">
                    <strong><i class="fas fa-server"></i> Storage Stats</strong>
                </h3>
            </div>
            <div class="col-sm-12 col-md-6 col-lg-6 mb-3 mt-3">
                <div class="card">
                    <div class="rounded rounded-3 shadow card-body text-light"
                        :class="{ 'bg-danger border-light': isDarkMode, 'bg-success border-dark': !isDarkMode }">
                        <h4 class="card-title "><strong><i class="fas fa-images"></i> Total Files</strong>
                        </h4>
                        <h2 class="card-text text-center"><strong>{{ fileStats.total }} files</strong></h2>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-md-6 col-lg-6 mb-3 mt-3">
                <div class="card">
                    <div class="rounded rounded-3 shadow card-body text-light"
                        :class="{ 'bg-success border-light': isDarkMode, 'bg-primary border-dark': !isDarkMode }">
                        <h4 class="card-title "><strong><i class="fas fa-floppy-disk"></i> Total Storage</strong>
                        </h4>
                        <h2 class="card-text text-center"><strong>{{ getStorage(fileStats.storage) }}</strong></h2>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
export default {
    name: 'Dashboard',
    data() {
        return {
            siteKey: this.$store.getters.getSiteKey,
            userStats: {
                totalUser: 0,
                admin: 0,
                users: 0,
                unverifiedUsers: 0,
                activeUsers: 0,
                blocked: 0
            },
            fileStats: {
                total: 0,
                storage: 0
            },
            CSRF_1: "",
            CSRF_2: "",
        }
    },
    computed: {
        isDarkMode() {
            return this.$store.getters.appMode;
        },
        userLoggedIn() {
            return this.$store.getters.userLoggedIn;
        },
        getDashboardDetails() {
            return this.$store.getters.getDashboardDetails;
        }
    },
    beforeMount() {
        this.fetchDetails()
    },
    mounted() {
        if (this.getDashboardDetails) {
            this.userStats.totalUser = this.getDashboardDetails.totalUser;
            this.userStats.admin = this.getDashboardDetails.admin;
            this.userStats.users = this.getDashboardDetails.users;
            this.userStats.unverifiedUsers = this.getDashboardDetails.unverifiedUsers;
            this.userStats.activeUsers = this.getDashboardDetails.activeUsers;
            this.userStats.blocked = this.getDashboardDetails.blocked;
            this.fileStats.storage = this.getDashboardDetails.storage;
            this.fileStats.total = this.getDashboardDetails.total;
        } else {
            this.reset();
            this.fetchDetails()
        }
    },
    methods: {
        reset() {
            this.userStats.totalUser = 0
            this.userStats.admin = 0;
            this.userStats.users = 0;
            this.userStats.unverifiedUsers = 0;
            this.userStats.activeUsers = 0;
            this.userStats.blocked = 0;
            this.fileStats.storage = 0;
            this.fileStats.total = 0;
            this.$store.commit('setDashboard', null)
        },
        getStorage(size) {
            const
                range = ['Kb', 'Mb', 'Gb', 'Tb', 'Pb'],
                byteSize = 1024;
            let currentRange = 0, mySize = size;
            if (size <= (Math.pow(byteSize, range.length - 3)) - 1)
                currentRange = range.length - 5
            else if (size <= Math.pow(byteSize, range.length - 2) - 1)
                currentRange = range.length - 4
            else if (size < (Math.pow(byteSize, range.length - 1)) - 1)
                currentRange = range.length - 3
            else if (size < (Math.pow(byteSize, range.length) - 0) - 1)
                currentRange = range.length - 2
            else
                currentRange = range.length - 1
            mySize = (size / Math.pow(byteSize, currentRange + 1)).toPrecision(3)
            return ` ${mySize} ${range[currentRange]}`;
        },
        fetchDetails() {
            Promise.all([
                fetch('/api/auth/csrf', {
                    method: 'GET',
                    credentials: 'same-origin'
                }).then(response => {
                    if (response.status === 2e2) {
                        return response.json();
                    }
                }).then(json => json.result.CsrfToken),
                fetch('/api/auth/csrf', {
                    method: 'GET',
                    credentials: 'same-origin'
                }).then(response => {
                    if (response.status === 2e2) {
                        return response.json();
                    }
                }).then(json => json.result.CsrfToken),
            ])
                .then(([Csrf_1, Csrf_2]) => {
                    this.CSRF_1 = Csrf_1;
                    this.CSRF_2 = Csrf_2;
                    Promise.all(
                        [
                            // API To User Stats
                            fetch('/api/user/userStats', {
                                method: 'POST',
                                credentials: 'same-origin',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-TOKEN': this.CSRF_1,
                                    'Authorization': 'Bearer ' + this.userLoggedIn.token,
                                },
                                body: JSON.stringify({
                                    AdminId: this.userLoggedIn.user.UserId,
                                })
                            })
                                .then(resp => resp.json())
                            ,
                            // API To Storage Stats
                            fetch('/api/image/allStats', {
                                method: 'POST',
                                credentials: 'same-origin',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-TOKEN': this.CSRF_2,
                                    'Authorization': 'Bearer ' + this.userLoggedIn.token,
                                },
                                body: JSON.stringify({
                                    AdminId: this.userLoggedIn.user.UserId,
                                })
                            })
                                .then(resp => resp.json())
                        ]
                    )
                        .then(([userDetails, storageDetails]) => [userDetails.data, storageDetails.data])
                        .then(([userDetails, storageDetails]) => {
                            this.$store.commit('setDashboard', {
                                totalUser: userDetails.TotalUsers,
                                admin: userDetails.Admins,
                                users: userDetails.Users,
                                unverifiedUsers: userDetails.Unverified,
                                activeUsers: userDetails.ActiveUsers,
                                blocked: userDetails.BlockedUsers,
                                storage: storageDetails.TotalStorage,
                                total: storageDetails.TotalImages,
                            })
                            this.userStats.totalUser = userDetails.TotalUsers;
                            this.userStats.admin = userDetails.Admins;
                            this.userStats.users = userDetails.Users;
                            this.userStats.unverifiedUsers = userDetails.Unverified;
                            this.userStats.activeUsers = userDetails.ActiveUsers;
                            this.userStats.blocked = userDetails.BlockedUsers;
                            this.fileStats.storage = storageDetails.TotalStorage;
                            this.fileStats.total = storageDetails.TotalImages;
                        })
                })
        }
    }
}
</script>