<template>
  <div id="app" ref="app" class="flex flex-col h-screen">
    <link
      rel="stylesheet"
      href="https://use.fontawesome.com/releases/v5.15.2/css/all.css"
      integrity="sha384-vSIIfh2YWi9wW0r9iZe7RJPrKwp6bG+s9QZMoITbCckVJqGCCRhc+ccxNcdpHuYu"
      crossorigin="anonymous"
    />
    <nav class="flex w-full px-6 py-2 text-white bg-gray-900">
      <img
        class="w-32"
        src="https://di.unipi.it/wp-content/themes/unipi/images/cherubino-white.svg"
      />
      <div class="my-auto ml-auto">
        <template v-if="$store.state.isAuthenticated">
          <p><i class="mr-2 far fa-user"></i>{{ $store.state.user.email }}</p>
        </template>
        <p v-if="$store.state.isAuthenticated && !$store.state.user.course">
          Scegli corso
        </p>
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
        <!-- <template v-else>
          <router-link to="/login">Login</router-link>
        </template> -->
      </div>
    </nav>

    <main class="my-auto">
      <div
        v-if="$store.state.msg"
        class="py-12 mx-auto text-white bg-gray-900 rounded-lg shadow-md px-36 w-max"
      >
        <h1 class="text-xl text-center">
          {{ $store.state.msg }}
        </h1>
      </div>
      <router-view v-else />
    </main>
    <footer class="flex w-full px-6 py-3 text-sm text-white bg-gray-900">
      <p>
        Powered by
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
        .catch(error => console.log(error))
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
