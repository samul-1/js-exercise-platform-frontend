<template>
  <div class="mx-8 my-5 ">
    <Spinner v-if="loading" :loadingMessage="loadingMessage"></Spinner>
    <div class="flex my-4">
      <h1 class="text-3xl font-medium ">Lista esami</h1>
      <router-link class="my-auto" to="/editor">
        <button
          class="px-2.5 py-0.5 ml-4 text-white bg-green-700 rounded-md shadow-sm"
        >
          <i class="text-sm fas fa-plus-circle"></i> Crea
        </button></router-link
      >
    </div>
    <exam-list-item
      v-for="exam in recentExams"
      :key="exam.id"
      :exam="exam"
    ></exam-list-item>
    <div
      v-if="!loading && oldExams.length"
      class="my-8 text-sm text-center text-gray-500 cursor-pointer"
      @click="showOldExams = !showOldExams"
    >
      <i
        class="mr-1 far"
        :class="{ 'fa-eye': !showOldExams, 'fa-eye-slash': showOldExams }"
      ></i>
      <span class="underline"
        >{{ showOldExams ? 'Nascondi' : 'Mostra' }} esami più vecchi</span
      >
    </div>
    <div v-if="showOldExams">
      <exam-list-item
        v-for="exam in oldExams"
        :key="exam.id"
        :exam="exam"
        :old="true"
      ></exam-list-item>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Spinner from '../components/Spinner.vue'
import ExamListItem from '../components/ExamListItem.vue'
import { forceFileDownload } from '../filedownloads'

export default {
  name: 'ExamList',
  components: {
    Spinner,
    ExamListItem
  },
  created () {
    this.connectToSocket()
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
  beforeRouteLeave (to, from, next) {
    if (this.socket) {
      // unlock the exam before leaving
      this.socket.close()
    }
    console.log(to, from)
    next()
  },
  data () {
    return {
      exams: [],
      loading: false,
      loadingMessage: '',
      socket: null,
      showOldExams: false
    }
  },
  methods: {
    forceFileDownload,

    getCSVReport (exam) {
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
          this.forceFileDownload(response, `${exam.name}.csv`)
        })
        .catch(error => {
          console.log(error)
        })
        .finally(() => {
          this.loading = false
        })
    },
    getZipArchive (exam) {
      this.loading = true
      axios
        .post(
          `exams/${exam.id}/zip_archive/`,
          {},
          {
            responseType: 'blob'
          }
        )
        .then(response => {
          this.forceFileDownload(response, `${exam.name}.zip`)
        })
        .catch(error => {
          console.log(error)
        })
        .finally(() => {
          this.loading = false
        })
    },
    connectToSocket () {
      const wsScheme = window.location.protocol == 'https:' ? 'wss' : 'ws'
      this.socket = new WebSocket(
        wsScheme +
          '://' +
          axios.defaults.baseURL.split('://')[1] +
          '/ws/exam_list/?token=' +
          this.$store.state.token
      )
      this.socket.onmessage = e => {
        {
          const jsonData = JSON.parse(e.data)
          const idx = this.exams.findIndex(e => e.id == jsonData.exam_id)
          console.log(e.data)

          this.exams[idx].locked_by =
            jsonData.msg_type === 'lock' ? jsonData.by : null
        }
      }
      this.socket.onerror = () => {
        this.$store.commit('setSmallMessage', {
          severity: 2,
          msg:
            "È in corso una modifica all'esame da parte di un altro insegnante."
        })
      }
    }
  },
  computed: {
    loginLink () {
      return window.location.host + '/login'
    },
    oldExams () {
      return this.exams.filter(exam => {
        return (
          exam.closed &&
          new Date(exam.closed_at) <=
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        )
      })
    },
    recentExams () {
      return this.exams.filter(exam => {
        return (
          !exam.closed ||
          new Date(exam.closed_at) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        )
      })
    }
  }
}
</script>

<style></style>
