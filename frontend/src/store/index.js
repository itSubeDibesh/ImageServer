import { createStore } from 'vuex'

export default createStore({
  state: {
    preLoader: false,
    nightMode: false,
    internetConnected: false,
    userLoggedIn: false,
    timeOutHandler: {},
    intervals: {},
    siteKey: "6Ldgc0cgAAAAAHjqNfj5q4qWUruiHOnlF_3iF37k",
    alert: {}
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
    loggedIn(state) {
      return state.userLoggedIn
    },
    timeOut(state) {
      return state.timeOutHandler
    },
    getSiteKey(state) {
      return state.siteKey
    },
    getAlert(state) {
      return state.alert
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
    isLoggedIn(state) {
      state.userLoggedIn = true
    },
    // isLoggedOut Mutations
    isLoggedOut(state) {
      state.userLoggedIn = false
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
