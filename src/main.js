import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './index.css'
import axios from 'axios'
import { store } from './store'
import VueCodeHighlight from 'vue-code-highlight'
import 'vue-code-highlight/themes/duotone-sea.css'
import GSignInButton from 'vue-google-signin-button'

Vue.use(VueCodeHighlight) //registers the v-highlight directive

const development = process.env.NODE_ENV !== 'production'

Vue.config.productionTip = false

axios.defaults.baseURL = development
  ? 'http://127.0.0.1:8000'
  : process.env.AXIOS_BASE

Vue.use(GSignInButton)

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
