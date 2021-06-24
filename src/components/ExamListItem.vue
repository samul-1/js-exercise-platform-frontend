<template>
  <div
    :class="{ 'bg-gray-100': exam.draft || old }"
    class="flex w-full p-4 my-3 mt-auto transition-shadow duration-75 border rounded-lg hover:shadow-md"
  >
    <Spinner v-if="loading" :loadingMessage="loadingMessage"></Spinner>
    <h1 class="my-auto mr-2 " v-html="truncateString(exam.name, 50)"></h1>
    <!-- left buttons -->
    <router-link :to="`/editor/${exam.id}`"
      ><button
        v-if="new Date() < new Date(exam.begin_timestamp) && !exam.closed"
        :disabled="exam.locked_by"
        class="px-2.5 py-1 font-light text-white align-middle bg-indigo-700 rounded-lg disabled:opacity-40 hover:bg-indigo-800"
      >
        <i class="mr-1 fas fa-edit "></i>

        Modifica
      </button></router-link
    >
    <router-link :to="`/exams/${exam.id}/progress`"
      ><button
        v-if="new Date() >= new Date(exam.begin_timestamp) && !exam.closed"
        class="px-2.5 py-1 font-light text-white align-middle bg-indigo-700 rounded-lg disabled:opacity-40 hover:bg-indigo-800"
      >
        <i class="mr-1 text-sm fas fa-eye"></i>
        Monitora
      </button></router-link
    >
    <button
      @click="confirmClosure(exam)"
      v-if="new Date() >= new Date(exam.begin_timestamp) && !exam.closed"
      class="px-2.5 py-1 ml-2 text-white align-middle bg-red-800 rounded-lg disabled:opacity-40 hover:bg-red-900"
    >
      <i class="mr-1 text-sm fas fa-exclamation-triangle"></i> Chiudi
    </button>
    <div class="inline-block dropdown">
      <div class="absolute h-10 left-2 w-28"></div>
      <button
        v-if="new Date() < new Date(exam.begin_timestamp) || exam.closed"
        class="px-2.5 py-1 ml-2 font-light text-white align-middle bg-indigo-700 rounded-lg disabled:opacity-40 hover:bg-indigo-800"
      >
        <i class="mr-1 text-sm fas fa-file-pdf"></i> Simulazione
      </button>
      <ul
        class="absolute hidden mt-1 ml-2 text-white rounded-lg shadow-big w-max dropdown-menu"
      >
        <li class="">
          <a
            @click="getExamPreview(exam, true)"
            class="block px-6 py-4 whitespace-no-wrap bg-indigo-700 rounded-t-lg hover:bg-indigo-800"
            href="#"
            >Scarica esame completo</a
          >
        </li>
        <li class="">
          <a
            @click="getExamPreview(exam, false)"
            class="block px-6 py-4 whitespace-no-wrap bg-indigo-700 rounded-b-lg hover:bg-indigo-800"
            href="#"
            >Scarica una possibile simulazione</a
          >
        </li>
      </ul>
    </div>
    <div v-if="exam.closed" class="inline-block text-left">
      <div class="inline-block dropdown">
        <div class="absolute h-10 left-2 w-28"></div>
        <button
          class="px-2.5 py-1 ml-2 font-light text-white align-middle bg-indigo-700 rounded-lg disabled:opacity-40 hover:bg-indigo-800"
        >
          <i class="mr-1 text-sm fas fa-download"></i>

          Risultati
        </button>
        <ul
          class="absolute hidden mt-1 ml-2 text-white rounded-lg shadow-big w-max dropdown-menu"
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
      class="px-2.5 py-1 ml-2 font-light text-white align-middle bg-indigo-700 rounded-lg disabled:opacity-40 hover:bg-indigo-800"
    >
      <i class="mr-1 text-sm fas fa-link"></i>
      Codice accesso
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
      <div class="text-sm text-gray-700">
        <i class="mr-1 text-sm text-gray-500 far fa-calendar"></i>
        <span
          v-html="
            formatTimestampShort([exam.begin_timestamp, exam.end_timestamp])
          "
        ></span>
      </div>
    </div>
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
import Spinner from './Spinner.vue'
import Dialog from './Dialog.vue'
import {
  getUserFullName,
  formatTimestampShort,
  getExamSummaryText,
  getExamInstructions,
  truncateString
} from '../utility'
import { forceFileDownload, beforeDownload } from '../filedownloads'
export default {
  name: 'ExamListItem',
  components: {
    Spinner,
    Dialog
  },
  data () {
    return {
      loading: false,
      loadingMessage: '',
      dialog: {
        shown: false
      }
    }
  },
  props: {
    exam: {
      type: Object
    },
    old: {
      type: Boolean,
      default: false
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
    confirmClosure (exam) {
      // shows a dialog that prompts the user for confirmation to close an exam
      this.dialog = {
        shown: true,
        string: 'Sei sicuro di voler chiudere questo esame?',
        subText: this.getExamSummaryText(exam),
        confirmOnly: false,
        severity: 2,
        dismissible: true,
        onYes: { callback: this.closeExam, param: exam.id },
        onNo: {
          callback: () => (this.dialog = { shown: false })
        }
      }
    },
    getExamPreview (exam, allItems) {
      this.loading = true
      axios
        .post(
          `/exams/${exam.id}/${allItems ? 'all_items' : 'mock'}/`,
          {},
          {
            responseType: 'blob'
          }
        )
        .then(response => {
          this.forceFileDownload(response, `Simulazione_${exam.name}.pdf`)
        })
        .catch(err => {
          console.log(err)
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
    }
  }
}
</script>

<style>
.dropdown:hover .dropdown-menu {
  display: block;
  z-index: 100;
}
.shadow-big {
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.4);
}
</style>
