import Vuex from 'vuex'
import Vue from 'vue'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)
export const store = new Vuex.Store({
  plugins: [createPersistedState()],
  state: {
    user: {
      email: null,
      id: null,
      is_teacher: null
    },
    isAuthenticated: false,
    token: '',
    msg: null,
    redirectToAfterLogin: null
  },
  mutations: {
    initializeStore (state) {
      if (localStorage.getItem('token')) {
        state.token = localStorage.getItem('token')
        state.isAuthenticated = true

        state.user.email = localStorage.getItem('email')
        state.user.id = localStorage.getItem('userid')
        state.user.is_teacher = localStorage.getItem('is_teacher') === 'true'
        state.user.course =
          localStorage.getItem('course') === 'null'
            ? null
            : localStorage.getItem('course')
      } else {
        state.user = {
          email: null,
          id: null,
          is_teacher: null,
          course: null
        }
        state.token = ''
        state.isAuthenticated = false
      }
      state.redirectToAfterLogin = null
    },
    setToken (state, token) {
      state.token = token
      state.isAuthenticated = true
      localStorage.setItem('token', token)
    },
    setUser (state, user) {
      state.user = user
      localStorage.setItem('userid', user.id)
      localStorage.setItem('email', user.email)
      localStorage.setItem('is_teacher', user.is_teacher)
      localStorage.setItem('course', user.course)
    },
    setMessage (state, msg) {
      state.msg = msg
    },
    removeToken (state) {
      state.user = {
        email: null,
        id: null,
        is_teacher: null
      }
      state.token = ''
      state.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('userid')
      localStorage.removeItem('email')
      localStorage.removeItem('is_teacher')
      localStorage.removeItem('course')
    },
    resetMessage (state) {
      state.msg = null
    },
    setRedirectToAfterLogin (state, path) {
      state.redirectToAfterLogin = path
      localStorage.setItem('redirectAfterLogin', path)
    },
    resetRedirectToAfterLogin (state) {
      state.redirectToAfterLogin = null
      localStorage.removeItem('redirectAfterLogin')
    }
  },
  actions: {}
})
