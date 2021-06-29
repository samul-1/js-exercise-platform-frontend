import Vue from 'vue'
import VueRouter from 'vue-router'
import ExamPage from '../views/ExamPage.vue'
import Login from '../views/Login.vue'
import ExamEditor from '../components/ExamEditor.vue'
import TeacherDashboard from '../views/TeacherDashboard.vue'
import ExamSelection from '../views/ExamSelection.vue'
import ExamList from '../views/ExamList.vue'
import ExamProgressDashboard from '../views/ExamProgressDashboard.vue'
import ExamStats from '../views/ExamStats.vue'
import PageNotFound from '../views/PageNotFound.vue'
import { store } from '../store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/exam',
    name: 'ExamSelection',
    component: ExamSelection
  },
  {
    path: '/exam/:examId',
    name: 'ExamPage',
    component: ExamPage
  },
  {
    path: '/login/:role?',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'TeacherDashoard',
    component: TeacherDashboard
  },
  {
    path: '/editor/:examid?',
    name: 'EditExam',
    component: ExamEditor
  },
  {
    path: '/exams',
    name: 'ExamList',
    component: ExamList
  },
  {
    path: '/exams/:examid/progress',
    name: 'ExamProgressDashboard',
    component: ExamProgressDashboard
  },
  {
    path: '/exams/:examid/stats',
    name: 'ExamStats',
    component: ExamStats
  },
  { path: '*', component: PageNotFound }
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
