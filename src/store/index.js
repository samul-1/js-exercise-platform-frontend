import Vuex from "vuex"
import Vue from "vue"

Vue.use(Vuex)
export const store = new Vuex.Store({
    state: {
        user: {
            username: ''
        },
        isAuthenticated: false,
        token: ''
    },
    mutations: {
        initializeStore(state) {
            if(localStorage.getItem("token")) {
                state.token = localStorage.getItem("token")
                state.isAuthenticated = true
            } else {
                state.token = ''
                state.isAuthenticated = false
            }
        },
        setToken(state, token) {
            state.token = token
            state.isAuthenticated = true
        },
        removeToken(state) {
            state.token = ''
            state.isAuthenticated = false
        },
        setUser(state, user) {
            state.user = user
        }
    },
    actions: {

    }
})