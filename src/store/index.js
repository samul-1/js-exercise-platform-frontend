import Vuex from 'vuex'
import Vue from 'vue'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)
export const store = new Vuex.Store({
  plugins: [createPersistedState()],
  state: {
    user: {
      email: ''
    },
    isAuthenticated: false,
    token: '',
    msg: null
  },
  mutations: {
    initializeStore (state) {
      if (localStorage.getItem('token')) {
        state.token = localStorage.getItem('token')
        state.isAuthenticated = true
        state.user.username = localStorage.getItem('username')
        state.user.id = localStorage.getItem('userid')
      } else {
        state.user.id = ''
        state.user.username = ''
        state.token = ''
        state.isAuthenticated = false
      }
    },
    setToken (state, token) {
      state.token = token
      state.isAuthenticated = true
    },
    removeToken (state) {
      state.user.id = ''
      state.user.username = ''
      state.token = ''
      state.isAuthenticated = false
    },
    setUser (state, user) {
      state.user = user
    },
    setMessage (state, msg) {
      state.msg = msg
    },
    resetMessage (state) {
      state.msg = null
    }
  },
  actions: {}
})
