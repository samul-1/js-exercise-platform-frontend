<template>
  <div id="app" ref="app" class="flex flex-col h-screen">
    <link
      rel="stylesheet"
      href="https://use.fontawesome.com/releases/v5.15.2/css/all.css"
      integrity="sha384-vSIIfh2YWi9wW0r9iZe7RJPrKwp6bG+s9QZMoITbCckVJqGCCRhc+ccxNcdpHuYu"
      crossorigin="anonymous"
    />
    <nav class="flex w-full px-6 py-2 text-white bg-gray-900">
      <img class="w-28 md:w-32" src="./assets/unipi-logo.svg" />
      <div class="my-auto ml-auto text-xs md:text-base">
        <template v-if="$store.state.isAuthenticated">
          <span
            ><i class="mr-2 far fa-user"></i>{{ $store.state.user.email }}</span
          >
          <router-link v-if="$store.state.user.is_teacher" to="/dashboard"
            ><span><i class="ml-6 mr-2 md:text-lg fas fa-home"></i></span
          ></router-link>
        </template>
        <Dialog
          v-if="
            $store.state.isAuthenticated &&
              !$store.state.user.is_teacher &&
              !$store.state.user.course
          "
          :confirmOnly="true"
          :dismissible="false"
          :string="'Seleziona il corso a cui appartieni'"
          :disable-ok="!this.selectedCourse"
          @yes="dialog.onYes.callback(dialog.onYes.param)"
        >
          <div v-for="course in courses" :key="course">
            <input
              type="radio"
              v-model="selectedCourse"
              :name="course"
              :id="'course-' + course"
              :value="course"
            />
            <label :for="'course-' + course">
              Corso {{ course.toUpperCase() }}</label
            >
          </div>
        </Dialog>
      </div>
    </nav>

    <main class="my-auto">
      <div
        v-if="$store.state.msg"
        class="px-4 py-12 mx-4 text-white bg-gray-900 rounded-lg shadow-2xl md:mx-auto md:px-36 md:w-max"
      >
        <h1 class="text-xl text-center" v-html="$store.state.msg"></h1>
      </div>
      <router-view v-else />
      <transition name="fade">
        <div
          class="fixed w-11/12 px-4 py-4 text-center transform -translate-x-1/2 rounded-md shadow-xl md:w-max md:px-20 left-1/2 top-20"
          :class="{
            'bg-green-400 text-green-900': $store.state.smallMsg.severity == 1,
            'bg-red-400 text-red-900': $store.state.smallMsg.severity == 2
          }"
          v-if="$store.state.smallMsg"
          v-html="$store.state.smallMsg.msg"
        ></div>
      </transition>
    </main>
    <footer class="flex w-full px-6 py-3 text-sm text-white bg-gray-900">
      <p>
        Crafted with
        <img
          alt="love"
          class="inline-block mb-0.5"
          style="width: 0.95rem; margin-left: 1px; margin-right: 1px"
          src="./assets/heart.png"
        />
        by
        <a
          target="_blank"
          class="font-medium text-blue-300 hover:underline"
          href="http://bsamu.it"
          >Samuele Bonini</a
        >
      </p>
    </footer>
  </div>
</template>
<script>
import axios from 'axios'
import Dialog from './components/Dialog.vue'
export default {
  name: 'App',
  components: {
    Dialog
  },
  beforeCreate () {
    this.$store.commit('initializeStore')

    // get data about user authentication from the store if user is logged in
    const token = this.$store.state.token

    if (token) {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
    } else {
      axios.defaults.headers.common['Authorization'] = ''
    }
  },
  created () {
    if (this.storeSmallMsg) {
      // hide any leftover messages from store
      this.hideStoreSmallMessage(1000)
    }
  },
  watch: {
    storeSmallMsg (newVal) {
      if (newVal) {
        this.hideStoreSmallMessage(newVal.severity == 1 ? 2000 : 3000)
      }
    }
  },
  data () {
    return {
      selectedCourse: null,
      courses: ['a', 'b', 'c'],
      dialog: {
        onYes: { callback: this.updateUserCourse }
      }
    }
  },

  methods: {
    hideStoreSmallMessage (delay) {
      setTimeout(() => {
        this.$store.commit('resetSmallMessage')
      }, delay)
    },
    updateUserCourse () {
      if (!this.selectedCourse) return

      axios
        .patch('api/v1/users/me/', {
          course: this.selectedCourse
        })
        .then(response => {
          console.log(response)
          this.$store.commit('setUser', response.data)
        })
        .catch(error => {
          console.log(error)
          throw error // let the global handler catch this
        })
    }
  },
  computed: {
    storeSmallMsg () {
      return this.$store.state.smallMsg
    }
  }
}
</script>
<style>
/* Custom code highlight colors  */
.token.property,
.token.function {
  color: #a0b4ff !important;
}
</style>
