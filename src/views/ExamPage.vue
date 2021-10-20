<template>
  <div
    id="editor-view"
    ref="editorView"
    class="h-full px-2 mb-10 md:h-max md:my-5 md:px-4"
  >
    <Spinner v-if="loading"></Spinner>
    <div v-if="studentMode" class="flex p-2 bg-gray-100 rounded-md">
      <router-link class="my-auto mr-2 " to="/exams"
        ><button
          class="pl-1.5 pr-2 text-white bg-gray-900 rounded-lg shadow-inner hover:bg-gray-700 py"
        >
          <i class="fas fa-chevron-left"></i></button
      ></router-link>
      <h1 class="text-lg">
        Simulazione esame in modalità studente
      </h1>
    </div>
    <!-- main block -->
    <div class="flex flex-wrap w-full mt-5 md:flex-nowrap">
      <div
        class="w-full h-full transition-all duration-300 border border-gray-300 rounded-lg shadow-xl"
        :class="{ 'lg:w-3/5': exercise.id }"
      >
        <!-- tabs -->
        <div class="flex bg-gray-900 rounded-t-lg borer">
          <div
            v-if="exercise.id"
            class="px-1 py-1 mr-1 text-white transition-colors duration-75 bg-gray-500 shadow-inner cursor-pointer lg:px-3 hover:bg-gray-700 rounded-t-md"
            @click="pane = 'editor'"
            :class="{ 'bg-gray-700 font-medium': pane == 'editor' }"
          >
            Editor
          </div>
          <div
            v-if="exercise.id"
            class="px-1 py-1 mr-1 text-white transition-colors duration-75 bg-gray-500 shadow-inner cursor-pointer lg:px-3 rounded-t-md hover:bg-gray-700"
            @click="pane = 'testcases'"
            :class="{
              'bg-gray-700 font-medium': pane == 'testcases'
            }"
          >
            Test <span class="hidden lg:inline">case</span>
          </div>

          <!-- question controls -->
          <div
            v-if="question.id"
            class="px-3 py-1 mr-auto text-white transition-colors duration-75 bg-gray-500 shadow-inner hover:bg-gray-700 rounded-t-md"
            @click="pane = 'question'"
            :class="{ 'bg-gray-700': pane == 'question' }"
          >
            Domanda {{ currentQuestionNumber + 1 }} di {{ totalItemsCount }}
          </div>
          <!-- exercise controls -->
          <button
            v-if="exercise.id"
            @click="pane = 'text'"
            class="p-1 px-3 mr-1 text-white transition-colors duration-75 bg-indigo-800 shadow-md cursor-pointer rounded-t-md hover:bg-indigo-800"
            :class="{ 'bg-indigo-900 font-medium': pane == 'text' }"
          >
            Testo
          </button>
          <button
            v-if="exercise.id && !turnedInSubmission"
            @click="submitCode()"
            :disabled="submitCooldown != 0 || !code.length"
            class="w-32 p-1 px-3 mr-2 font-medium text-white transition-all duration-75 bg-green-600 shadow-md cursor-pointer disabled:opacity-50 rounded-t-md hover:bg-green-700"
          >
            <i v-show="submitCooldown == 0" class="fas fa-chevron-right"></i>
            {{ !submitCooldown ? 'Esegui' : submitCooldown }}
          </button>
          <div class="flex ml-auto">
            <p
              class="my-auto mr-2 text-sm text-white animate-pulse"
              v-if="showSavingAnswerDontPanic"
            >
              Salvataggio risposta in corso...
            </p>
            <button
              @click="getExam(-1)"
              v-if="allowGoingBack"
              :disabled="controlButtonsDisabled || isFirstItem"
              class="w-20 p-1 mr-2 font-medium text-white transition-all duration-75 bg-gray-700 shadow-md cursor-pointer lg:px-3 disabled:cursor-not-allowed md:w-40 disabled:opacity-40 rounded-t-md hover:bg-gray-600 active:bg-gray-700"
            >
              <i class="md:mr-2 fas fa-chevron-left"></i>
              <span class="hidden md:inline">Indietro</span>
            </button>
          </div>
          <button
            @click="getExam(1)"
            :disabled="controlButtonsDisabled"
            v-if="!isLastItem"
            class="relative w-20 p-1 px-3 font-medium text-white transition-all duration-75 bg-gray-700 shadow-md cursor-pointer md:w-40 disabled:bg-opacity-40 rounded-t-md hover:bg-gray-600 active:bg-gray-700"
          >
            <div
              v-if="isSendingAnswer"
              class="absolute transform -translate-x-1/2 ml-1 left-1/2 top-1.5"
            >
              <inline-small-spinner></inline-small-spinner>
            </div>
            <p :class="{ 'opacity-40': controlButtonsDisabled }">
              <span class="hidden md:inline">{{
                exercise.id ? 'Salta' : 'Avanti'
              }}</span>
              <i class="md:ml-2 fas fa-chevron-right"></i>
            </p>
          </button>
          <button
            @click="confirmEndExam()"
            :disabled="isSendingAnswer || loading"
            v-else-if="!exercise.id"
            class="w-20 p-1 px-3 font-medium text-white transition-all duration-75 bg-green-700 shadow-md cursor-pointer md:w-40 disabled:opacity-80 rounded-t-md hover:bg-green-600 active:bg-green-700"
          >
            <i class="md:mr-1 fas fa-check"></i>
            <span class="hidden md:inline">Termina</span>
          </button>
          <div
            v-else
            class="hidden w-20 p-1 px-3 text-center text-white transition-all duration-75 bg-gray-700 shadow-md lg:inline md:w-40 opacity-60 rounded-t-md"
          >
            Ultimo esercizio!
          </div>
        </div>
        <!-- editor pane -->
        <div class="relative" v-show="pane == 'editor'">
          <div
            v-if="turnedInSubmission"
            class="absolute z-10 flex w-full h-full opacity-40 bg-gradient-to-br from-gray-300 to-gray-400"
          >
            <p class="mx-auto my-auto text-gray-700">
              Hai già sottomesso una soluzione per questo esercizio
            </p>
          </div>
          <AceEditor
            class="rounded-b-lg"
            id="editor-el"
            v-model="code"
            @init="editorInit"
            lang="javascript"
            theme="monokai"
            width="100%"
            :height="editorHeight"
            :options="editorOptions"
          />
        </div>

        <!-- test case pane -->
        <div
          :style="'height:' + editorHeight"
          class="overflow-auto bg-gray-100 border border-transparent rounded-b-lg"
          v-show="pane == 'testcases'"
        >
          <div
            class="p-4 m-2 font-medium bg-gray-400 shadow-md text-gray-50 rounded-xl"
          >
            <i class="mr-2 fas fa-eye-slash"></i> Il tuo codice potrebbe essere
            eseguito anche con test case non presenti in questa lista.
          </div>
          <div v-for="(testcase, index) in testCases" :key="testcase.id">
            <TestCase :testcase="testcase" :index="index + 1"></TestCase>
          </div>
          <p class="m-2" v-if="testCases.length == 0">
            Questo esercizio non ha test case.
          </p>
        </div>

        <!-- exercise text pane pane -->
        <div
          :style="'height:' + editorHeight"
          class="p-3 overflow-auto bg-gray-100 border border-transparent rounded-b-lg"
          v-show="pane == 'text'"
        >
          <div class="flex w-full">
            <h1 class="my-2 text-2xl font-medium">
              Esercizio {{ currentQuestionNumber + 1 }}
            </h1>
            <button
              @click="popupOpen = true"
              class="h-8 px-3 ml-auto text-white bg-indigo-800 rounded-md shadow-sm"
            >
              <i class="mr-1 far fa-window-restore"></i> Apri il testo in un
              popup
            </button>
          </div>
          <Skeleton v-if="!exercise.text.length"></Skeleton>
          <div v-else v-highlight v-html="highlightCode(exercise.text)"></div>
        </div>

        <!-- question text pane  -->
        <div
          :style="'height:' + editorHeight"
          class="p-3 overflow-auto bg-gray-100 border border-transparent rounded-b-lg"
          v-show="pane == 'question'"
          id="current-question"
        >
          <AggregatedQuestionIntroduction
            v-if="question.introduction"
            :text="question.introduction"
          ></AggregatedQuestionIntroduction>
          <new-question-test
            :question="question"
            :examId="$route.params.examId"
            @sendingAnswer="isSendingAnswer = true"
            @sentAnswer="isSendingAnswer = false"
          ></new-question-test>
        </div>
      </div>
      <!-- submissions sidebar -->
      <transition name="bounce-x">
        <div
          class="bg-gray-100 border rounded-lg shadow-sm md:ml-3"
          v-show="exercise.id"
          :class="{
            'w-0 w-lg:0': !exercise.id,
            'w-full lg:w-2/5': exercise.id
          }"
        >
          <h3
            class="p-2 text-xl font-medium text-white bg-gray-800 rounded-t-lg"
          >
            Sottomissioni
          </h3>
          <!-- fake submission for loading -->
          <div
            v-show="processingSubmission"
            class="flex p-3 m-2 mb-0 text-black bg-gray-300 rounded-md shadow-md opacity-50 text-shadow-lg"
          >
            <inline-small-spinner></inline-small-spinner>
            <!-- // ! spinner component -->
            <!-- <svg
              class="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path></svg
            >// ! end spinner -->
            Valutazione codice in corso...
          </div>
          <div class="overflow-auto">
            <div
              class=""
              v-for="(submission, index) in submissions"
              :key="submission.id"
            >
              <Submission
                :canBeTurnedIn="submission.is_eligible && !index"
                :index="submissions.length - index"
                :submission="submission"
                @turnInSubmissionCode="
                  confirmTurnInCodeSubmission(submission.id)
                "
              ></Submission>
            </div>
          </div>
        </div>
      </transition>
      <!-- end submission sidebar -->
    </div>
    <Dialog
      v-if="dialog.shown"
      :string="dialog.string"
      :subText="dialog.subText"
      :confirmOnly="dialog.confirmOnly"
      :severity="dialog.severity"
      @yes="dialog.onYes.callback(dialog.onYes.param)"
      @no="dialog.onNo.callback(dialog.onNo.param)"
    ></Dialog>
    <transition name="bounce">
      <DraggablePopup
        v-show="popupOpen"
        :title="'Esercizio ' + (currentQuestionNumber + 1)"
        :content="highlightCode(exercise.text)"
        @hide="popupOpen = false"
      ></DraggablePopup>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'
import AceEditor from 'vuejs-ace-editor'
import Spinner from '../components/Spinner.vue'
import Submission from '../components/Submission.vue'
import TestCase from '../components/TestCase.vue'
import NewQuestionTest from '../components/NewQuestionTest.vue'
import Skeleton from '../components/Skeleton.vue'
import 'vue-code-highlight/themes/duotone-sea.css'
import Dialog from '../components/Dialog.vue'
import DraggablePopup from '../components/DraggablePopup.vue'
import AggregatedQuestionIntroduction from '../components/AggregatedQuestionIntroduction.vue'
import {
  highlightCode,
  aceEditorOptions,
  SUBMIT_COOLDOWN,
  editorInit
} from '../constants'
import InlineSmallSpinner from '../components/InlineSmallSpinner.vue'

export default {
  name: 'ExamPage',
  components: {
    AceEditor,
    Submission,
    TestCase,
    Dialog,
    NewQuestionTest,
    Skeleton,
    DraggablePopup,
    Spinner,
    AggregatedQuestionIntroduction,
    InlineSmallSpinner
  },
  created () {
    this.getExam()
  },
  mounted () {
    // set the editor height to approximately 70% of parent height
    this.editorHeight = this.$parent.$refs.app.clientHeight / 1.4 + 'px'

    // set editor options asynchronously because the editor height isn't known at create time
    // and without doing this the font size gets screwed up for some reason
    setTimeout(() => (this.editorOptions = aceEditorOptions))
  },
  props: {
    restart: {
      type: Boolean,
      default: false
    },
    studentMode: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    isSendingAnswer (newVal) {
      if (newVal) {
        this.savingAnswerHandle = setTimeout(() => {
          if (this.isSendingAnswer) {
            this.showSavingAnswerDontPanic = true
          }
        }, 2000)
      } else {
        clearTimeout(this.savingAnswerHandle)
        this.savingAnswerHandle = null
        this.showSavingAnswerDontPanic = false
      }
    }
  },
  data () {
    return {
      dialog: {
        shown: false
      },
      isSendingAnswer: false,
      loading: false,

      editorElement: document.getElementById('app'),
      editorHeight: null,

      submitCooldown: 0,
      submitCooldownHandle: null,
      editorOptions: {},

      examName: null,
      allowGoingBack: false,

      exercise: {
        id: null,
        public_testcases: [],
        text: ''
      },
      question: {
        id: null,
        text: '',
        answers: []
      },
      code: '',

      currentQuestionNumber: 0,
      totalItemsCount: 0,
      isFirstItem: false,
      isLastItem: false,

      processingSubmission: false,
      submissions: [],
      pane: 'text',
      popupOpen: false,

      showSavingAnswerDontPanic: false,
      savingAnswerHandle: null
    }
  },
  methods: {
    highlightCode,
    getExam (delta = 0, y = false) {
      if (
        delta == 1 &&
        this.exercise.id &&
        !y &&
        !this.turnedInSubmission &&
        !confirm(
          'Non hai consegnato soluzioni per questo esercizio. Se hai delle sottomissioni consegnabili, clicca su Consegna accanto alla sottomissione. Sei sicuro di voler andare avanti senza consegnare?'
        )
      ) {
        return
      }
      if (
        delta == 1 &&
        !this.allowGoingBack &&
        !y &&
        !confirm(
          'Sei sicuro di voler andare avanti? Se confermi, non potrai più tornare indietro.'
        )
      ) {
        return
      }
      const examId = this.$route.params.examId
      this.loading = true

      let apiEntryPoint

      switch (delta) {
        case 1:
          apiEntryPoint = 'next_item'
          break
        case -1:
          apiEntryPoint = 'previous_item'
          break
        default:
          apiEntryPoint = 'current_item'
      }

      axios
        .post(`/exams/${examId}/${apiEntryPoint}/`, {
          ...(this.restart && delta == 0 && { restart: true })
        })
        .then(response => {
          console.log(response)
          // backend will return 204 if all exercises and questions have been completed
          if (response.status == 204) {
            this.$store.commit(
              'setMessage',
              'Hai completato tutti gli esercizi. Puoi chiudere questa pagina.'
            )
            return
          }

          // save question
          if (response.data.question) {
            this.question = response.data.question
            // move to question pane
            this.pane = 'question'
          } else {
            this.question.id = null
          }

          // save exercise
          if (response.data.exercise) {
            const { starting_code, ...exercise } = response.data.exercise
            this.code = starting_code // set initial editor code to that specified in exercise
            this.exercise = exercise
            // move to assignment text pane
            this.pane = 'text'

            this.submissions = response.data.submissions
          } else {
            this.exercise.id = null
          }

          // copy rest of response data into the corresponding fields
          this.examName = response.data.name
          this.isFirstItem = response.data.is_first_item
          this.isLastItem = response.data.is_last_item
          this.allowGoingBack = response.data.allow_going_back
          this.currentQuestionNumber = response.data.ordering
          this.totalItemsCount = response.data.total_items_count
        })
        .catch(error => {
          if (error.response.status == 401 || error.response.status == 403) {
            this.$store.commit(
              'setRedirectToAfterLogin',
              this.$router.currentRoute.fullPath
            )
            this.$router.push('/login')
          } else if (error.response.status == 404) {
            this.$store.commit('setSmallMessage', {
              severity: 2,
              msg: 'Esame non trovato.'
            })
            this.$router.push('/exam')
          } else {
            this.$store.commit(
              'setMessage',
              error.response.data.message ?? error.message
            )
            // let the global handler catch this
            throw error
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    submitCode () {
      // submits code to the server, temporarily disables submit button for cooldown,
      // and shows the submission details upon receiving them back from the server
      this.submitCooldown = SUBMIT_COOLDOWN
      this.submitCooldownHandle = setInterval(() => {
        this.submitCooldown--
        if (!this.submitCooldown) {
          clearInterval(this.submitCooldownHandle)
          this.submitCooldownHandle = null
        }
      }, 1000)

      // show fake "loading" submission
      this.processingSubmission = true
      axios
        .post(`/exercises/${this.exercise.id}/submissions/`, {
          code: this.code
        })
        .then(response => {
          console.log(response.data)
          // add new submission to submission list
          this.submissions.unshift(response.data)
          // hide fake "loading" submission
          this.processingSubmission = false
        })
        .catch(error => {
          console.log(JSON.stringify(error))
          throw error
        })
    },
    confirmTurnInCodeSubmission (id) {
      // shows a dialog that prompts the user for confirmation to turn in a submission
      this.dialog = {
        shown: true,
        string: 'Sei sicuro di voler consegnare?',
        subText:
          'Una volta confermata, la consegna non potrà più essere modificata.',
        confirmOnly: false,
        onYes: { callback: this.turnInSubmissionCode, param: id },
        onNo: {
          callback: () => (this.dialog = { shown: false })
        }
      }
    },
    confirmEndExam () {
      // shows a dialog that prompts the user for confirmation to end the exam
      this.dialog = {
        shown: true,
        string: 'Sei sicuro di voler consegnare?',
        subText: 'Se confermi, non potrai più tornare indietro.',
        confirmOnly: false,
        severity: 2,
        onYes: { callback: this.endExam },
        onNo: {
          callback: () => (this.dialog = { shown: false })
        }
      }
    },
    endExam () {
      this.dialog = { shown: false }
      axios
        .post(`/exams/${this.$route.params.examId}/end_exam/`, {})
        .then(() => {
          this.$store.commit(
            'setMessage',
            'Hai completato tutti gli esercizi. Puoi chiudere questa pagina.'
          )
        })
        .catch(error => {
          this.$store.commit(
            'setMessage',
            error.response.data.message ?? error.message
          )
          throw error
        })
    },
    turnInSubmissionCode (submissionId) {
      // makes a PUT request to the server asking to turn in an eligible submission
      this.dialog = { shown: false }
      axios
        .put(
          `/exercises/${this.exercise.id}/submissions/${submissionId}/turn_in/`,
          {}
        )
        .then(() => {
          if (!this.isLastItem) {
            // ask for next exercise or question
            this.getExam(1, true)
          } else {
            this.endExam()
          }
        })
        .catch(error => {
          this.$store.commit(
            'setMessage',
            error.response.data.message ?? error.message
          )
          console.log(JSON.stringify(error))
          throw error
        })
    },
    editorInit
  },
  computed: {
    turnedInSubmission () {
      return (
        this.exercise.id && this.submissions.some(s => s.has_been_turned_in)
      )
    },
    controlButtonsDisabled () {
      return this.isSendingAnswer || this.loading
    },
    testCases () {
      return this.exercise.public_testcases || this.exercise.testcases
    }
  }
}
</script>
<style>
.ace_scroller.ace_scroll-left {
  box-shadow: 10px 0 10px -10px rgb(0 0 0 / 20%) inset;
}
code[class*='language-'],
pre[class*='language-'] {
  padding: 0 !important;
  margin: 0 !important;
  white-space: pre-wrap;
  word-break: break-all;
}

.bounce-x-enter-active {
  animation: bounce-x-in 0.4s;
}
.bounce-x-leave-active {
  animation: bounce-x-out 0s;
}
@keyframes bounce-x-in {
  0% {
    transform: scaleX(0.9);
    opacity: 0;
  }
  50% {
    opacity: 0.9;
    transform: scaleX(0.98);
  }
  95% {
    transform: scaleX(1.03);
    opacity: 1;
  }
  100% {
    transform: scaleX(1);
    opacity: 1;
  }
}
@keyframes bounce-x-out {
  0% {
    transform: scaleX(1);
    opacity: 1;
  }
  50% {
    transform: scaleX(0.5);
    opacity: 0.3;
  }
  100% {
    transform: scaleX(0.1);
    opacity: 0;
  }
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: 0.1s opacity ease-out;
}
</style>
