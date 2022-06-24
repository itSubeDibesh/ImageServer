<template>
    <div class="mb-3">
        <div class="row mb-3">
            <div class="col-md-4 col-sm-12 mb-3">
                <div class="row">
                    <div class="col-12  text-end  mb-3">
                        <button class="btn btn-primary mb-2"> <i class="fas fa-user-shield"></i>
                            Add
                            Admin</button>
                    </div>
                    <div class="col-12 mb-3">
                        <div class="card overflow-auto"
                            :class="{ 'text-light bg-dark border-light': isDarkMode, 'text-dark bg-light border-dark': !isDarkMode }"
                            style=" max-height: 45em;">
                            <h3 class="card-title m-2 p-2">
                                <div class="row">
                                    <div class="col-6">
                                        <h4>Users</h4>
                                    </div>
                                    <div class="col-6 text-end">
                                        <button class="btn btn-primary" v-on:click="refreshButton"> <i
                                                class="fas fa-refresh"></i>
                                            Refresh</button>
                                    </div>
                                </div>
                            </h3>
                            <div class="card-body overflow-auto"
                                :class="{ 'text-light bg-dark border-light': isDarkMode, 'text-dark bg-light border-dark': !isDarkMode }">
                                <form class="d-flex input-group p-3">
                                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                                    <input class="form-control" type="search" ref="userSearch" placeholder="Search"
                                        aria-label="Search">
                                    <button class="btn btn-success" v-on:click="searchText">Search</button>
                                </form>
                                <ol class="list-group" data-bs-spy="scroll">
                                    <div v-if="userList.length != 0">
                                        <li class="list-group-item d-flex align-items-start"
                                            v-for="(user, userIndex) in userList" :ref="'User_' + user.UserId"
                                            :key="userIndex" style="cursor:default">
                                            <div class="text-start">
                                                <div class="fw-bold">{{ user.FullName }} &nbsp;
                                                    <span class="badge"
                                                        :class="user.IsDisabled ? 'bg-danger' : 'bg-success'">{{
                                                                user.IsDisabled ?
                                                                    "Disabled" :
                                                                    "Enabled"
                                                        }}</span>
                                                </div>
                                                <a :href="'mailto:' + user.Email" class="btn"> {{ user.Email }}</a>
                                            </div>
                                            <span class="badge bg-success">{{ sentenceCase(user.UserGroup) }}</span>
                                            <div class="row text-end">
                                                <div class="col-12">
                                                    <span class="badge bg-danger" style="cursor:pointer;"
                                                        data-bs-toggle="tooltip" data-bs-placement="top" title="Delete"
                                                        v-on:click="deleteUser(userIndex)">
                                                        <i class="fas fa-trash"></i></span>
                                                </div>
                                                <div class="col-12 p-2">
                                                    <span class="badge bg-primary" style="cursor:pointer;"
                                                        data-bs-placement="top" title="View"
                                                        v-on:click="viewUser(userIndex)">
                                                        <i class="fas fa-eye"></i></span>
                                                </div>
                                            </div>
                                        </li>
                                    </div>
                                    <li class="list-group-item d-flex justify-content-center m-3 p-2" v-else>
                                        <div class="fw-bold">Users Not Found</div>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-md-4 mb-3" v-if="profile.showProfile">
                <div class="card text-center  mb-3"
                    :class="{ 'text-light bg-dark border-light': isDarkMode, 'text-dark bg-light border-dark': !isDarkMode }">
                    <div class="card-title m-2 text-start p-2">
                        <div class="row">
                            <div class="col-6">
                                <h4>Profile</h4>
                            </div>
                            <div class="col-6 text-end">
                                <span class="badge bg-danger" style="cursor:pointer;" data-bs-placement="top"
                                    v-on:click="profile.showProfile = false" title="Exit"><i class="fas fa-x fa-2x"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <PreLoader v-if="showProfileLoader" :keepLoading="true" />
                        <div class="row" v-else>
                            <div style="cursor:default" class="col-sm-12 col-md-12 col-lg-12 mb-3 ml-1 text-center">
                                <h4> <strong> <i class="fas fa-user"></i>
                                        Basic Information</strong>
                                </h4>
                            </div>
                            <div style="cursor:default" class="col-sm-12 col-md-6 col-lg-6 mb-3 ml-1">
                                <strong> <i class="fas fa-user text-primary"></i> Full Name: </strong>
                                <span class="badge rounded-pill bg-primary" style="cursor:pointer"> {{
                                        currentUser.FullName
                                }}</span>

                            </div>
                            <div style="cursor:default" class="col-sm-12 col-md-6 col-lg-6 mb-3 ml-1">
                                <strong> <i class="fas fa-envelope text-primary"></i> Email: </strong>
                                <span class="badge rounded-pill bg-primary"> {{
                                        currentUser.Email
                                }}</span>
                            </div>
                            <div style="cursor:default" class="col-sm-12 col-md-6 col-lg-6 mb-3 ml-1">
                                <strong> <i class="fas fa-user-check text-primary"></i> Verified: </strong>
                                <span class="badge rounded-pill bg-primary">{{
                                        currentUser.VerificationStatus ? "True" : "False"
                                }}</span>
                            </div>
                            <div style="cursor:default" class="col-sm-12 col-md-6 col-lg-6 mb-3 ml-1">
                                <strong> <i class="fas fa-user-secret text-primary"></i> Username: </strong>
                                <span class="badge rounded-pill bg-primary">{{
                                        sentenceCase(currentUser.UserName)
                                }}</span>
                            </div>
                            <div style="cursor:default" class="col-sm-12 col-md-12 col-lg-12 mb-3 ml-1 text-center">
                                <hr />
                                <h4> <strong> <i class="fas fa-users-cog"></i>
                                        Other Information</strong>
                                </h4>
                            </div>
                            <div style="cursor:default" class="col-sm-12 col-md-6 col-lg-6 mb-3 ml-1">
                                <strong> <i class="fas fa-calendar-day text-primary"></i> Account Created:
                                </strong>
                                <span class="badge rounded-pill bg-success">{{
                                        removeTime(currentUser.CreatedAt)
                                }}</span>
                            </div>
                            <div style="cursor:default" class="col-sm-12 col-md-6 col-lg-6 mb-3 ml-1">
                                <strong> <i class="fas fa-universal-access text-primary"></i> Account Type:
                                </strong>
                                <span class="badge rounded-pill bg-danger">{{
                                        sentenceCase(currentUser.UserGroup)
                                }}</span>
                            </div>
                            <div style="cursor:default" class="col-sm-12 col-md-6 col-lg-6 mb-3 ml-1">
                                <strong> <i class="fas fa-user-shield text-primary"></i> Password Reset:
                                </strong>
                                <span class="badge rounded-pill bg-success">{{
                                        removeTime(currentUser.LastPasswordResetDate)
                                }}</span>
                            </div>
                            <div style="cursor:default" class="col-sm-12 col-md-6 col-lg-6 mb-3 ml-1">
                                <strong> <i class="fas fa-user-shield text-primary"></i> Disabled:
                                </strong>
                                <span class="badge rounded-pill bg-success">{{
                                        currentUser.IsDisabled ? "True" : "False"
                                }}</span>
                            </div>
                            <button class="btn btn-success" v-on:click="profile.showDisable = true">
                                <i class="fas fa-hands-helping"></i> User Support</button>
                        </div>
                        <div v-if="showStorageInfo">
                            <hr />
                            <div style="cursor:default" class="col-sm-12 col-md-12 col-lg-12 mb-3 ml-1 text-center">
                                <h4> <strong> <i class="fas fa-floppy-disk"></i>
                                        Storage Information</strong>
                                </h4>
                            </div>
                            <div style="cursor:default" class="col-sm-12 col-md-6 col-lg-6 mb-3 ml-1">
                                <strong> <i class="fas fa-images text-primary"></i> Total Files:
                                </strong>
                                <span class="badge rounded-pill bg-success">{{ currentUser.images }}
                                    files</span>
                            </div>
                            <div style="cursor:default" class="col-sm-12 col-md-6 col-lg-6 mb-3 ml-1">
                                <strong> <i class="fas fa-floppy-disk text-primary"></i> Total Storage
                                </strong>
                                <span class="badge rounded-pill bg-danger">{{
                                        getStorage(currentUser.totalStorage)
                                }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-md-4 mb-3" v-if="profile.showDisable">
                <div class="card text-center overflow-auto mb-3"
                    :class="{ 'text-light bg-dark border-light': isDarkMode, 'text-dark bg-light border-dark': !isDarkMode }">
                    <div class="card-title m-2 text-start p-2">
                        <div class="row">
                            <div class="col-6">
                                <h4>User Support</h4>
                            </div>
                            <div class="col-6 text-end">
                                <span class="badge bg-danger" style="cursor:pointer;" data-bs-placement="top"
                                    v-on:click="profile.showDisable = false" title="Exit"><i class="fas fa-x fa-2x"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="mb-3 col-12 text-center">
                            <div class="row">
                                <div class="col-sm-12 mt-1 mb-3 mr-1">
                                    <div class="card">
                                        <h5 class="card-title m-2 p-2">Enable/ Disable Account</h5>
                                        <div class="card-body">
                                            <form class="row" v-on:submit="disableSubmit">
                                                <div class="col-12 mb-2">
                                                    <strong>User Disabled: </strong>
                                                    <span class="badge rounded-pill bg-success">{{
                                                            currentUser.IsDisabled ? "True" : "False"
                                                    }}</span>
                                                </div>

                                                <div class="col-12 mb-2">
                                                    <div class="form-check form-switch form-check-inline">
                                                        <input class="form-check-input"
                                                            :checked="currentUser.IsDisabled" type="checkbox"
                                                            ref="checked" id="enabled">
                                                        <label class="form-check-label" for="enabled">Set
                                                            Disabled</label>
                                                    </div>
                                                </div>
                                                <div class="col-12">
                                                    <button type="submit" class="btn btn-primary mb-3">Update
                                                        Account</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-sm-12 mt-1 mb-3 mr-1">
                                    <div class="card">
                                        <h5 class="card-title m-2 p-2">Reset Request</h5>
                                        <div class="card-body">
                                            <a href="#" v-on:click="sendResetRequest" class="btn btn-primary">Send
                                                Request <i class="fa-solid fa-paper-plane"></i></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import PreLoader from '@/components/PreLoader.vue'
export default {
    name: 'Users',
    components: {
        PreLoader,
    },
    computed: {
        isDarkMode() {
            return this.$store.getters.appMode;
        },
        userLoggedIn() {
            return this.$store.getters.userLoggedIn;
        },
        users() {
            return this.$store.getters.getUsersList;
        }
    },
    data() {
        return {
            siteKey: this.$store.getters.getSiteKey,
            image: {
                dark: require('@/assets/photos-pana-dark.svg'),
                light: require('@/assets/photos-pana-light.svg')
            },
            profile: {
                showProfile: false,
                showDisable: false
            },
            userList: [],
            tmpBuffer: [],
            currentUser: {},
            showProfileLoader: true,
            showDisableLoader: true,
            showStorageInfo: false,
        }
    },
    methods: {
        removeTime(str) {
            if (str.length != 0)
                return str.split(' ')[0] || "";
        },
        sentenceCase(str) {
            if (str.length != 0)
                return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        },
        disableSubmit(e) {
            e.preventDefault();
            const checked = this.$refs['checked'].checked;
            this.fetchCsrf()
                .then(CSRF => {
                    if (checked) {
                        // Send Disable request
                        fetch('/api/user/disable', {
                            method: 'POST',
                            credentials: 'same-origin',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': CSRF,
                                'Authorization': 'Bearer ' + this.userLoggedIn.token,
                            },
                            body: JSON.stringify({
                                AdminId: this.userLoggedIn.user.UserId,
                                UserId: this.currentUser.UserId
                            })
                        })
                            .then(resp => resp.json())
                            .then(resp => {
                                if (resp.success) {
                                    this.currentUser = {}
                                    this.profile.showDisable = false;
                                    this.profile.showProfile = false;
                                    this.fetchUserList()
                                }
                                this.$store.commit("setAlert", {
                                    type: resp.status == "error" ? 'danger' : 'success',
                                    message: resp.result,
                                    showAlert: true
                                })
                            })

                    } else {
                        fetch('/api/user/enable', {
                            method: 'POST',
                            credentials: 'same-origin',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': CSRF,
                                'Authorization': 'Bearer ' + this.userLoggedIn.token,
                            },
                            body: JSON.stringify({
                                AdminId: this.userLoggedIn.user.UserId,
                                UserId: this.currentUser.UserId
                            })
                        })
                            .then(resp => resp.json())
                            .then(resp => {
                                if (resp.success) {
                                    this.currentUser = {}
                                    this.profile.showDisable = false;
                                    this.profile.showProfile = false;
                                    this.fetchUserList()
                                }
                                this.$store.commit("setAlert", {
                                    type: resp.status == "error" ? 'danger' : 'success',
                                    message: resp.result,
                                    showAlert: true
                                })
                            })
                    }
                })
        },
        sendResetRequest(e) {
            e.preventDefault();
            this.fetchCsrf()
                .then(CSRF => {
                    const Payload = {
                        Email: this.currentUser.Email,
                        AdminId: this.userLoggedIn.user.UserId
                    }
                    // Show Preloader on forgot button unless response if error hide preloader and show error in alert component
                    this.showPreloader = true;
                    // Make a request to forgot the user api
                    fetch('/api/user/reset_request', {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': CSRF,
                            'Authorization': 'Bearer ' + this.userLoggedIn.token,
                        },
                        body: JSON.stringify(Payload)
                    })
                        .then(response => response.json())
                        .then(json => {
                            setTimeout(() => {
                                this.$store.commit("setAlert", {
                                    type: json.status == "error" ? 'danger' : 'success',
                                    message: json.result,
                                    showAlert: true
                                })
                            }, 1e3);
                        });
                })
        },
        fetchCsrf() {
            return fetch('/api/auth/csrf', {
                method: 'GET',
                credentials: 'same-origin'
            }).then(response => {
                if (response.status === 2e2) {
                    return response.json();
                }
            }).then(json => json.result.CsrfToken)
        },
        searchText(e) {
            e.preventDefault();
            if (this.$refs["userSearch"].value != 0) {
                if (this.userList.length != 0) {
                    this.tmpBuffer = this.userList
                    this.userList = this.userList.filter(user =>
                        user.Email.includes(this.$refs["userSearch"].value) ||
                        user.FullName.includes(this.$refs["userSearch"].value) ||
                        user.UserName.includes(this.$refs["userSearch"].value))
                }
            } else {
                this.userList = this.tmpBuffer
            }
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
        refreshButton() {
            this.reset()
            this.fetchUserList()
        },
        fetchUserList() {
            Promise.all([
                this.fetchCsrf()
            ])
                .then(([
                    CSRF_1
                ]) => {
                    fetch('/api/user/view', {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': CSRF_1,
                            'Authorization': 'Bearer ' + this.userLoggedIn.token,
                        },
                        body: JSON.stringify({
                            AdminId: this.userLoggedIn.user.UserId,
                        })
                    })
                        .then(response => response.json())
                        .then(response => {
                            if (response.success) {
                                this.userList = response.data.users;
                                this.$store.commit('setUserList', response.data.users)
                            } else {
                                this.$store.commit('setAlert', {
                                    type: 'danger',
                                    message: response.result,
                                    showAlert: true
                                })
                            }
                        })
                })
        },
        deleteUser(id) {
            const userDetails = this.userList[id]
            this.$swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.fetchCsrf()
                        .then(token => {
                            fetch("/api/user/delete", {
                                method: 'POST',
                                credentials: 'same-origin',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-TOKEN': token,
                                    'Authorization': 'Bearer ' + this.userLoggedIn.token,
                                },
                                body: JSON.stringify({ AdminId: this.userLoggedIn.user.UserId, UserId: userDetails.UserId })
                            })
                                .then(resp => resp.json())
                                .then(response => {
                                    if (response.success) {
                                        // Delete Call 
                                        this.$swal.fire(
                                            'Deleted!',
                                            'User has been deleted.',
                                            'success'
                                        ).then(() => {
                                            this.fetchUserList();
                                        })
                                    } else {
                                        this.$swal.fire(
                                            'Error!',
                                            'Something went wrong.',
                                            'error'
                                        )
                                    }
                                })
                        })
                }
            })
        },
        viewUser(id) {
            this.showStorageInfo = false
            this.profile.showProfile = true
            this.currentUser = this.userList[id]
            this.fetchCsrf()
                .then(csrf => {
                    fetch('/api/image/userStats', {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrf,
                            'Authorization': 'Bearer ' + this.userLoggedIn.token,
                        },
                        body: JSON.stringify({
                            AdminId: this.userLoggedIn.user.UserId,
                            UserId: this.currentUser.UserId
                        })
                    })
                        .then(resp => resp.json())
                        .then(data => {
                            this.showProfileLoader = false;
                            if (data.success) {
                                this.showStorageInfo = true;
                                this.currentUser['totalStorage'] = data.data.TotalStorage != null ? data.data.TotalStorage : 0;
                                this.currentUser['images'] = data.data.TotalImages;
                            }
                        })
                })
        },
        reset() {
            this.userList = []
            this.currentUser = {}
            this.profile.showDisable = false
            this.profile.showProfile = false
            this.$store.commit('setUserList', [])
        }
    },
    mounted() {
        if (this.users.length == 0) {
            this.fetchUserList()
        } else {
            this.userList = this.users;
        }
    }
}
</script>