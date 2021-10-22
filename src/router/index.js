import Vue from 'vue'
import VueRouter from 'vue-router'
import ExamPage from '../views/ExamPage.vue'
import NewExamPage from '../views/NewExamPage.vue'
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
    component: ExamSelection,
    meta: {
      studentsOnly: true
    }
  },
  {
    path: '/exam/:examId',
    name: 'ExamPage',
    component: ExamPage,
    meta: {
      studentsOnly: true
    }
  },
  {
    path: '/exam/:examId/simulate',
    name: 'ExamPage',
    component: ExamPage,
    props: {
      studentMode: true,
      restart: false
    }
  },
  {
    path: '/exam-new/:examId',
    name: 'NewExamPage',
    component: NewExamPage,
    props: {
      // studentMode: true,
      // restart: false
    }
  },
  {
    path: '/login/:role?',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'TeacherDashboard',
    component: TeacherDashboard,
    meta: {
      teachersOnly: true
    }
  },
  {
    path: '/editor/:examid?',
    name: 'EditExam',
    component: ExamEditor,
    meta: {
      teachersOnly: true
    }
  },
  {
    path: '/exams',
    name: 'ExamList',
    component: ExamList,
    meta: {
      teachersOnly: true
    }
  },
  {
    // use nested routes
    path: '/exams/:examid/progress',
    name: 'ExamProgressDashboard',
    component: ExamProgressDashboard,
    meta: {
      teachersOnly: true
    }
  },
  {
    path: '/exams/:examid/stats',
    name: 'ExamStats',
    component: ExamStats,
    meta: {
      teachersOnly: true
    }
  },
  { path: '*', component: PageNotFound }
]

function teachersOnly (route) {
  return route.meta.teachersOnly
}

function studentsOnly (route) {
  return route.meta.studentsOnly
}

function isAuthenticated () {
  return store.state.isAuthenticated
}

function isTeacher () {
  return isAuthenticated() && store.state.user.is_teacher
}

function isStudent () {
  return isAuthenticated() && !store.state.user.is_teacher
}

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  store.commit('resetMessage')
  if (studentsOnly(to) && !isStudent()) {
    store.commit('setRedirectToAfterLogin', to)
    next('/login')
  } else if (teachersOnly(to) && !isTeacher()) {
    store.commit('setRedirectToAfterLogin', to)
    next('/login/teacher')
  } else {
    next()
  }
})

export default router
