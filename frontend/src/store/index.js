import { createStore } from 'vuex'

export default createStore({
  state: {
    preLoader: false,
    nightMode: false,
    internetConnected: false,
    userLoggedIn: false
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
    isLoggedOut(state) {
      state.userLoggedIn = false
    }
  },
  actions: {
  },
  modules: {
  }
})
