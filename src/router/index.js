import Vue from 'vue'
import VueRouter from 'vue-router'
import ExamPage from '../views/ExamPage.vue'
import Login from '../views/Login.vue'
import { store } from '../store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/exam',
    name: 'ExamPage',
    component: ExamPage
  },
  {
    path: '/login/:role?',
    name: 'Login',
    component: Login
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  store.commit('resetMessage')
  next()
})

export default router
