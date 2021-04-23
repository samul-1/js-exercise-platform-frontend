<template>
  <div class="mx-8 my-5 ">
    <Spinner v-if="loading"></Spinner>

    <h1 class="mb-5 text-3xl font-medium">Lista esami</h1>
    <div
      :class="{ 'opacity-80 bg-gray-100': exam.draft }"
      class="flex w-full px-4 py-6 my-3 mt-auto transition-shadow duration-75 border rounded-lg hover:shadow-md"
      v-for="exam in exams"
      :key="exam.id"
    >
      <h1 class="mr-2 text-lg" v-html="exam.name"></h1>
      <router-link :to="`/editor/${exam.id}`"
        ><button
          :disabled="new Date() >= new Date(exam.begin_timestamp)"
          class="px-3 text-white align-middle bg-indigo-700 rounded-lg disabled:opacity-40 hover:bg-indigo-800"
        >
          Modifica
        </button></router-link
      >
      <!--<router-link :to="`/reports/${exam.id}`">-->
      <button
        @click="getReport(exam)"
        v-if="new Date() >= new Date(exam.end_timestamp)"
        class="px-3 ml-2 text-white align-middle bg-indigo-700 rounded-lg disabled:opacity-40 hover:bg-indigo-800"
      >
        Risultati
      </button>
      <!--</router-link>-->
      <div class="flex ml-auto">
        <div
          class="px-2 mr-6 bg-gray-600 rounded-md "
          v-if="new Date() >= new Date(exam.end_timestamp)"
        >
          <span class="text-white align-middle">Terminato</span>
        </div>
        <div
          class="px-2 mr-6 bg-green-700 rounded-md animate-pulse"
          v-if="
            new Date() >= new Date(exam.begin_timestamp) &&
              new Date() <= new Date(exam.end_timestamp)
          "
        >
          <span class="text-white align-middle">In corso</span>
        </div>
        <div class="px-2 mr-6 bg-red-500 rounded-md" v-if="exam.draft">
          <span class="text-white align-middle">Bozza</span>
        </div>
        <p>
          <i class="mr-1 text-gray-500 far fa-calendar"></i>
          {{ formatTimestamp(exam.begin_timestamp) }} &ndash;
          {{ formatTimestamp(exam.end_timestamp) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Spinner from '../components/Spinner.vue'
export default {
  name: 'ExamList',
  components: {
    Spinner
  },
  created () {
    // !
    console.log('node env', process.env.NODE_ENV)
    console.log('env base url', process.env.VUE_APP_AXIOS_BASE)
    console.log('axios base url', axios.defaults.baseURL)
    console.log('all envs', process.env)
    this.loading = true
    axios
      .get('/exams/')
      .then(response => {
        console.log(response)
        this.exams = response.data
      })
      .catch(error => {
        console.log(error)
      })
      .finally(() => {
        this.loading = false
      })
  },
  data () {
    return {
      exams: [],
      loading: false
    }
  },
  methods: {
    //! move to constants.js
    formatTimestamp (timestamp) {
      const [year, month, rest] = timestamp.split('-')
      const [day, time] = rest.split(' ')
      // eslint-disable-next-line no-unused-vars
      const [hours, minutes, seconds] = time.split(':')
      return `${day}/${month}/${year} ${hours}:${minutes}`
    },
    getReport (exam) {
      this.loading = true
      axios
        .post(
          `exams/${exam.id}/report/`,
          {},
          {
            headers: {
              Accept: 'text/csv'
            },
            responseType: 'blob'
          }
        )
        .then(response => {
          console.log(response)
          this.forceFileDownload(response, `${exam.name}.csv`)
        })
        .catch(error => {
          console.log(error)
        })
        .finally(() => {
          this.loading = false
        })
    },
    forceFileDownload (response, title) {
      console.log(title)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', title)
      document.body.appendChild(link)
      link.click()
    }
  }
}
</script>

<style></style>
