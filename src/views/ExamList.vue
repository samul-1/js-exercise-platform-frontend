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
      <!-- left buttons -->
      <router-link :to="`/editor/${exam.id}`"
        ><button
          :disabled="new Date() >= new Date(exam.begin_timestamp)"
          class="px-3 py-0.5 text-white align-middle bg-indigo-700 rounded-lg disabled:opacity-40 hover:bg-indigo-800"
        >
          Modifica
        </button></router-link
      >
      <button
        @click="confirmClosure(exam.id)"
        v-if="new Date() >= new Date(exam.begin_timestamp) && !exam.closed"
        class="px-3 ml-2 py-0.5 text-white align-middle bg-red-800 rounded-lg disabled:opacity-40 hover:bg-red-900"
      >
        <i class="fas fa-exclamation-triangle"></i> Chiudi consegne
      </button>
      <button
        @click="getMockExam(exam.id)"
        v-if="new Date() < new Date(exam.begin_timestamp)"
        class="px-3 ml-2 text-white align-middle bg-indigo-700 rounded-lg disabled:opacity-40 hover:bg-indigo-800"
      >
        Simula
      </button>
      <!--<router-link :to="`/reports/${exam.id}`">-->
      <button
        @click="getReport(exam)"
        v-if="exam.closed"
        class="px-3 ml-2 text-white align-middle bg-indigo-700 rounded-lg disabled:opacity-40 hover:bg-indigo-800"
      >
        Risultati
      </button>
      <!-- end left buttons -->

      <!--right buttons -->
      <div class="flex ml-auto">
        <div class="px-2 mr-6 bg-gray-600 rounded-md " v-if="exam.closed">
          <span class="text-white align-middle">Terminato</span>
        </div>
        <div
          class="px-2 mr-6 bg-red-800 rounded-md "
          v-if="new Date() >= new Date(exam.end_timestamp) && !exam.closed"
        >
          <span class="text-white align-middle">Scadenza passata</span>
        </div>
        <div
          class="px-2 mr-6 bg-green-700 rounded-md animate-pulse"
          v-if="new Date() >= new Date(exam.begin_timestamp) && !exam.closed"
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
  formatTimestamp,
  getExamSummaryText
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
      loading: false,
      mockId: null,
      mockData: null,
      dialog: {
        shown: false
      }
    }
  },
  methods: {
    formatTimestamp,
    getUserFullName,
    getExamSummaryText,
    beforeDownload,
    forceFileDownload,
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
    getMockExam (examId) {
      this.loading = true
      axios
        .post(`/exams/${examId}/mock/`)
        .then(resp => {
          console.log(resp)
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
    }
  }
}
</script>

<style></style>
