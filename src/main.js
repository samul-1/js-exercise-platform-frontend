import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './index.css'
import axios from "axios"
import { store } from "./store"
import VueCodeHighlight from 'vue-code-highlight';
import "vue-code-highlight/themes/duotone-sea.css";

Vue.use(VueCodeHighlight) //registers the v-highlight directive

Vue.config.productionTip = false

axios.defaults.baseURL = "http://127.0.0.1:8000"


new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
