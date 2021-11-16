import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './index.css'
import axios from 'axios'
import { store } from './store'
import VueCodeHighlight from 'vue-code-highlight'
import 'vue-code-highlight/themes/duotone-sea.css'
import GSignInButton from 'vue-google-signin-button'
import VueApexCharts from 'vue-apexcharts'
import * as Sentry from '@sentry/vue'
import { Integrations } from '@sentry/tracing'

Vue.use(VueApexCharts)

Vue.component('apexchart', VueApexCharts)

Vue.use(VueCodeHighlight) //registers the v-highlight directive

const dev = process.env.NODE_ENV !== 'production'

Vue.config.productionTip = false

axios.defaults.baseURL = dev
  ? 'http://127.0.0.1:8000'
  : process.env.VUE_APP_AXIOS_BASE

Vue.use(GSignInButton)
Vue.config.errorHandler = function (err, vm, info) {
  // handle error
  // `info` is a Vue-specific error info, e.g. which lifecycle hook
  // the error was found in. Only available in 2.2.0+
  axios
    .post('/frontend_errors/', {
      error_details: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      component_data: vm._data,
      component_name: vm.$options.name,
      route: vm.$route.path,
      additional_info: info
    })
    .then(response => {
      console.log(response)
    })
    .catch(error => {
      console.log(error)
    })
  throw err // could remove this once development is over with
}

if (!dev) {
  Sentry.init({
    Vue,
    dsn:
      'https://5f257bff75f24847afb3724235cc51e8@o1003719.ingest.sentry.io/6067191',
    integrations: [
      new Integrations.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracingOrigins: ['sai.di.unipi.it', /^\//]
      })
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0
  })
}

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
