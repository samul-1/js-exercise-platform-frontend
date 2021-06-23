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
      v-for="exam in recentOrOpenExams"
      :key="exam.id"
      :exam="exam"
    ></exam-list-item>
    <div
      class="my-8 text-sm text-center text-gray-500 cursor-pointer"
      @click="showOldExams = !showOldExams"
    >
      <i
        class="mr-1 far fa"
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
//import Dialog from '../components/Dialog.vue'
import ExamListItem from '../components/ExamListItem.vue'
import {
  getUserFullName,
  formatTimestampShort,
  getExamSummaryText,
  getExamInstructions,
  truncateString
} from '../utility'
import { forceFileDownload, beforeDownload } from '../filedownloads'

export default {
  name: 'ExamList',
  components: {
    Spinner,
    //Dialog,
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
      // dialog: {
      //   shown: false
      // }
    }
  },
  methods: {
    truncateString,
    formatTimestampShort,
    getUserFullName,
    getExamSummaryText,
    getExamInstructions,
    beforeDownload,
    forceFileDownload,
    showExamInstructions (exam) {
      // shows a dialog that prompts the user for confirmation to close an exam

      this.dialog = {
        shown: true,
        string: "Istruzioni per l'accesso all'esame",
        subText: this.getExamInstructions(exam),
        confirmOnly: true,
        severity: 1,
        dismissible: true,
        onYes: {
          callback: () => (this.dialog = { shown: false })
        }
      }
    },
    confirmClosure (id) {
      // shows a dialog that prompts the user for confirmation to close an exam
      const idx = this.exams.findIndex(e => e.id === id)
      const exam = this.exams[idx]

      this.dialog = {
        shown: true,
        string: 'Sei sicuro di voler chiudere questo esame?',
        subText: this.getExamSummaryText(exam),
        confirmOnly: false,
        severity: 2,
        dismissible: true,
        onYes: { callback: this.closeExam, param: id },
        onNo: {
          callback: () => (this.dialog = { shown: false })
        }
      }
    },
    closeExam (id) {
      this.loading = true
      this.dialog = {
        show: false
      }
      axios
        .patch(`/exams/${id}/terminate/`)
        .then(response => {
          console.log(response)
          const idx = this.exams.findIndex(e => e.id === id)
          this.exams[idx] = response.data
          this.$store.commit('setSmallMessage', {
            severity: 1,
            msg: 'Esame chiuso con successo.'
          })
        })
        .catch(error => {
          console.log(error)
        })
        .finally(() => {
          this.loading = false
        })
    },
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
    getMockExam (exam) {
      this.loading = true
      axios
        .post(
          `/exams/${exam.id}/mock/`,
          {},
          {
            responseType: 'blob'
          }
        )
        .then(response => {
          this.forceFileDownload(response, `Simulazione_${exam.name}.pdf`)
          // this.mockId = examId
          // this.mockData = resp.data
          // this.generatePdfMock()
        })
        .catch(err => {
          console.log(err)
        })
        .finally(() => {
          this.loading = false
        })
    },
    generatePdfMock () {
      this.$refs.html2Pdf.generatePdf()
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
    recentOrOpenExams () {
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
