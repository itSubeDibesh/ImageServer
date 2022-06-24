import { createStore } from 'vuex'

export default createStore({
  state: {
    // Preloader
    preLoader: false,
    // Night Mode
    nightMode: false,
    // Timeout on 429
    timeOutHandler: {},
    intervals: {},
    // Alert
    alert: {},
    // Internet Connected
    internetConnected: false,
    // Captcha
    siteKey: "6Ldgc0cgAAAAAHjqNfj5q4qWUruiHOnlF_3iF37k",
    // Encruption
    enc: `FrontEND_IMAGE$erV^r20o_a`,
    // Login Store
    user: {},
    loggedIn: false,
    token: null,
    dashboardDetails: null,
    usersList: []
  },
  getters: {
    loading(state) {
      return state.preLoader
    },
    appMode(state) {
      return state.nightMode
    },
    online(state) {
      return state.internetConnected
    },
    userLoggedIn(state) {
      return {
        loggedIn: state.loggedIn,
        user: state.user,
        token: state.token
      }
    },
    timeOut(state) {
      return state.timeOutHandler
    },
    getSiteKey(state) {
      return state.siteKey
    },
    getEnc(state) {
      return state.enc
    },
    getAlert(state) {
      return state.alert
    },
    getDashboardDetails(state) {
      return state.dashboardDetails
    },
    getUsersList(state) {
      return state.usersList
    }
  },
  mutations: {
    // Preloader Mutations
    isLoading(state) {
      state.preLoader = true
    },
    isNotLoading(state) {
      state.preLoader = false
    },
    // Night Mode Mutations
    isNightMode(state) {
      state.nightMode = true
    },
    isDayMode(state) {
      state.nightMode = false
    },
    // Internet Connectivity Mutations
    isConnected(state) {
      state.internetConnected = true
    },
    isDisconnected(state) {
      state.internetConnected = false
    },
    // isLoggedIn Mutations
    isLoggedIn(state, payload) {
      state.loggedIn = payload.loggedIn
      state.user = payload.user
      state.token = payload.token
    },
    // Timeout Handler Mutations
    setTimeOut(state, payload) {
      // Deleting title First
      state.timeOutHandler[payload.title] = payload
    },
    removeTimeout(state, payload) {
      state.timeOutHandler[payload.title] = {}
    },
    // Alert Mutations
    setAlert(state, payload) {
      state.alert = payload
    },
    // Dashboard Mutation
    setDashboard(state, payload) {
      state.dashboardDetails = payload
    },
    setUserList(state, payload) {
      state.usersList = payload
    }
  },
  actions: {
    BEGIN_TIMEOUT({ commit, state }, payload) {
      state.intervals[payload.payload.title] = setInterval(() => {
        if (payload.payload.timeOut == 0) {
          clearInterval(state.intervals[payload.payload.title]);
          state.intervals[payload.payload.title] = {}
          commit('removeTimeout', payload.payload)
        }
        else {
          commit('setTimeOut', payload.payload)
          payload.payload.timeOut -= 1e3;
        }
      }, 1e3)
    },
  },
  modules: {
  }
})
