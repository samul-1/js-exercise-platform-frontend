<template>
  <div class="mx-8 my-5 ">
    <Spinner v-if="loading"></Spinner>
    <div class="flex my-4">
      <h1 class="text-3xl font-medium ">Lista esami</h1>
      <router-link class="my-auto" to="/editor">
        <button
          class="px-3 py-0.5 ml-4 text-white bg-green-700 rounded-md shadow-sm"
        >
          <i class="text-sm fas fa-plus-circle"></i> Crea
        </button></router-link
      >
    </div>
    <div
      :class="{ 'opacity-80 bg-gray-100': exam.draft }"
      class="flex w-full p-4 my-3 mt-auto transition-shadow duration-75 border rounded-lg hover:shadow-md"
      v-for="exam in exams"
      :key="exam.id"
    >
      <h1 class="my-auto mr-2 text-lg" v-html="exam.name"></h1>
      <!-- left buttons -->
      <router-link :to="`/editor/${exam.id}`"
        ><button
          v-if="new Date() < new Date(exam.begin_timestamp) && !exam.closed"
          :disabled="exam.locked_by"
          class="px-3 py-1 font-light text-white align-middle bg-indigo-700 rounded-lg disabled:opacity-40 hover:bg-indigo-800"
        >
          <i class="mr-1 fas fa-edit "></i>

          Modifica
        </button></router-link
      >
      <router-link :to="`/exams/${exam.id}/progress`"
        ><button
          v-if="new Date() >= new Date(exam.begin_timestamp) && !exam.closed"
          class="px-3 py-1 font-light text-white align-middle bg-indigo-700 rounded-lg disabled:opacity-40 hover:bg-indigo-800"
        >
          <i class="mr-1 text-sm fas fa-eye"></i>
          Monitora
        </button></router-link
      >
      <button
        @click="confirmClosure(exam.id)"
        v-if="new Date() >= new Date(exam.begin_timestamp) && !exam.closed"
        class="px-3 py-1 ml-2 text-white align-middle bg-red-800 rounded-lg disabled:opacity-40 hover:bg-red-900"
      >
        <i class="mr-1 text-sm fas fa-exclamation-triangle"></i> Chiudi
      </button>
      <button
        @click="getMockExam(exam.id)"
        class="px-3 ml-2 font-light text-white align-middle bg-indigo-700 rounded-lg disabled:opacity-40 hover:bg-indigo-800"
      >
        <i class="mr-1 text-sm fas fa-file-pdf"></i> PDF
      </button>
      <div class="relative inline-block text-left">
        <div class="relative inline-block dropdown">
          <button
            v-if="exam.closed"
            class="px-3 py-1 ml-2 font-light text-white align-middle bg-indigo-700 rounded-lg disabled:opacity-40 hover:bg-indigo-800"
          >
            <i class="mr-1 text-sm fas fa-download"></i>

            Risultati
          </button>
          <ul
            class="absolute z-20 hidden mt-1 ml-2 text-white rounded-lg shadow-big w-max dropdown-menu"
          >
            <li class="">
              <a
                @click="getCSVReport(exam)"
                class="block px-6 py-4 whitespace-no-wrap bg-indigo-700 rounded-t-lg hover:bg-indigo-800"
                href="#"
                >Scarica come CSV</a
              >
            </li>
            <li class="">
              <a
                @click="getZipArchive(exam)"
                class="block px-6 py-4 whitespace-no-wrap bg-indigo-700 rounded-b-lg hover:bg-indigo-800"
                href="#"
                >Scarica come PDF</a
              >
            </li>
          </ul>
        </div>
      </div>
      <button
        @click="showExamInstructions(exam)"
        v-if="!exam.closed"
        class="px-3 py-1 ml-2 font-light text-white align-middle bg-indigo-700 rounded-lg disabled:opacity-40 hover:bg-indigo-800"
      >
        <i class="mr-1 text-sm fas fa-link"></i>
        Codice
      </button>

      <!-- end left buttons -->

      <!--right buttons -->
      <div class="flex my-auto ml-auto">
        <div class="px-2 mr-6 bg-gray-600 rounded-md " v-if="exam.closed">
          <span class="text-white ">Terminato</span>
        </div>
        <div
          class="px-2 mr-6 bg-red-800 rounded-md "
          v-if="new Date() >= new Date(exam.end_timestamp) && !exam.closed"
        >
          <span class="text-white ">Scadenza passata</span>
        </div>
        <div
          class="px-2 mr-6 bg-green-700 rounded-md animate-pulse"
          v-if="new Date() >= new Date(exam.begin_timestamp) && !exam.closed"
        >
          <span class="text-white ">In corso</span>
        </div>
        <div class="px-2 mr-6 bg-red-500 rounded-md" v-if="exam.draft">
          <span class="text-white ">Bozza</span>
        </div>
        <div
          class="px-2 mr-6 bg-gray-700 rounded-md animate-pulse"
          v-if="exam.locked_by"
        >
          <span class="text-white "
            >Modifica in corso da {{ exam.locked_by }}
          </span>
        </div>
        <p class="text-sm text-gray-700">
          <i class="mr-1 text-sm text-gray-500 far fa-calendar"></i>
          <span
            v-html="
              formatTimestampShort([exam.begin_timestamp, exam.end_timestamp])
            "
          ></span>
        </p>
      </div>
    </div>
    <!-- // todo use exam name in filename -->
    <vue-html2pdf
      :show-layout="false"
      :float-layout="true"
      :enable-download="true"
      :preview-modal="false"
      :paginate-elements-by-height="1400"
      filename="Simulazione"
      :pdf-quality="2"
      :manual-pagination="false"
      pdf-format="a4"
      pdf-orientation="landscape"
      pdf-content-width="1000px"
      ref="html2Pdf"
      @startPagination="loading = true"
      @hasDownloaded="loading = false"
    >
      <section slot="pdf-content">
        <mock-exam v-if="mockId" :data="mockData"></mock-exam>
      </section>
    </vue-html2pdf>
    <Dialog
      v-if="dialog.shown"
      :string="dialog.string"
      :subText="dialog.subText"
      :confirmOnly="dialog.confirmOnly"
      :dismissible="dialog.dismissible"
      :severity="dialog.severity"
      @yes="dialog.onYes.callback(dialog.onYes.param)"
      @no="dialog.onNo.callback(dialog.onNo.param)"
    ></Dialog>
  </div>
</template>

<script>
import axios from 'axios'
import Spinner from '../components/Spinner.vue'
import MockExam from '../components/MockExam.vue'
import VueHtml2pdf from 'vue-html2pdf'
import Dialog from '../components/Dialog.vue'
import {
  getUserFullName,
  formatTimestampShort,
  getExamSummaryText,
  getExamInstructions
} from '../utility'
import { forceFileDownload, beforeDownload } from '../filedownloads'

export default {
  name: 'ExamList',
  components: {
    Spinner,
    MockExam,
    VueHtml2pdf,
    Dialog
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
      mockId: null,
      mockData: null,
      socket: null,
      dialog: {
        shown: false
      }
    }
  },
  methods: {
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
    getMockExam (examId) {
      this.loading = true
      axios
        .post(`/exams/${examId}/mock/`)
        .then(resp => {
          this.mockId = examId
          this.mockData = resp.data
          this.generatePdfMock()
        })
        .catch(err => {
          console.log(err)
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
    }
  }
}
</script>

<style>
.dropdown:hover .dropdown-menu {
  display: block;
}
.shadow-big {
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.4);
}
</style>
