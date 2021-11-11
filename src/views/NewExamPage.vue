<template>
  <div
    id="editor-view"
    ref="editorView"
    class="h-full px-2 mb-10 md:h-max md:my-5 md:px-4"
  >
    <Spinner v-if="loading"></Spinner>
    <!-- <div v-if="studentMode" class="flex p-2 bg-gray-100 rounded-md">
      <router-link class="my-auto mr-2 " to="/exams"
        ><button
          class="pl-1.5 pr-2 text-white bg-gray-900 rounded-lg shadow-inner hover:bg-gray-700 py"
        >
          <i class="fas fa-chevron-left"></i></button
      ></router-link>
      <h1 class="text-lg">
        Simulazione esame in modalità studente NUOVA
      </h1>
    </div> -->
    <!-- main block -->
    <div class="flex flex-wrap w-full mt-5 md:flex-nowrap">
      <div
        class="w-full h-full transition-all duration-300 border border-gray-300 rounded-lg shadow-xl"
        :class="{ 'lg:w-3/5': currentItemIsExercise }"
      >
        <!-- tabs -->
        <div class="flex bg-gray-900 rounded-t-lg borer">
          <div
            v-if="currentItemIsExercise"
            class="px-1 py-1 mr-1 text-white transition-colors duration-75 bg-gray-500 shadow-inner cursor-pointer lg:px-3 hover:bg-gray-700 rounded-t-md"
            @click="pane = 'editor'"
            :class="{ 'bg-gray-700 font-medium': pane == 'editor' }"
          >
            Editor
          </div>
          <div
            v-if="currentItemIsExercise"
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
            v-if="currentItemIsQuestion"
            class="px-3 py-1 mr-auto text-white transition-colors duration-75 bg-gray-500 shadow-inner hover:bg-gray-700 rounded-t-md"
            @click="pane = 'question'"
            :class="{ 'bg-gray-700': pane == 'question' }"
          >
            Domanda {{ exam.ordering + 1 }} di {{ exam.total_items_count }}
          </div>
          <!-- exercise controls -->
          <button
            v-if="currentItemIsExercise"
            @click="pane = 'text'"
            class="p-1 px-3 mr-1 text-white transition-colors duration-75 bg-indigo-800 shadow-md cursor-pointer rounded-t-md hover:bg-indigo-800"
            :class="{ 'bg-indigo-900 font-medium': pane == 'text' }"
          >
            Testo
          </button>
          <button
            v-if="currentItemIsExercise"
            @click="submitCode()"
            :disabled="submitCooldown != 0 || !code.length"
            class="relative p-1 px-4 mr-2 font-medium text-white transition-all duration-75 bg-green-600 shadow-md cursor-pointer disabled:bg-opacity-50 rounded-t-md hover:bg-green-700"
          >
            <!-- {{ submitCooldown == 0 ? 'Salva ed esegui' : submitCooldown }} -->
            <span
              :class="[submitCooldown != 0 || !code.length ? 'opacity-40' : '']"
              ><i class="mr-1 fas fa-chevron-right"></i>Salva ed esegui</span
            >
            <div
              style="text-shadow: 0px 0px 5px #111827;"
              class="absolute text-xl transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
              v-if="submitCooldown > 0"
            >
              {{ submitCooldown }}
            </div>
          </button>
          <div class="flex ml-auto">
            <p
              class="my-auto mr-2 text-sm text-white animate-pulse"
              v-if="showSavingAnswerDontPanic"
            >
              Salvataggio risposta in corso...
            </p>
            <button
              @click="dirtyOpenAnswer ? flushOpenAnswer(-1) : getExam(-1)"
              v-if="exam.allow_going_back"
              :disabled="controlButtonsDisabled || exam.is_first_item"
              class="w-20 p-1 mr-2 font-medium text-white transition-all duration-75 bg-gray-700 shadow-md cursor-pointer lg:px-1.5 disabled:cursor-not-allowed md:w-40 disabled:opacity-40 rounded-t-md hover:bg-gray-600 active:bg-gray-700"
            >
              <i class="md:mr-2 fas fa-chevron-left"></i>
              <span class="hidden md:inline">Indietro</span>
            </button>
          </div>
          <button
            @click="
              dirtyOpenAnswer
                ? flushOpenAnswer(1)
                : currentItemIsExercise && !thereIsValidSubmission
                ? confirmSkippingExercise()
                : getExam(1)
            "
            :disabled="controlButtonsDisabled"
            v-if="!exam.is_last_item"
            class="relative w-20 p-1 lg:px-1.5 font-medium text-white transition-all duration-75 shadow-md cursor-pointer md:w-40 disabled:bg-opacity-40 rounded-t-md"
            :class="[
              !currentItemIsExercise || thereIsValidSubmission
                ? 'bg-gray-700 hover:bg-gray-600 active:bg-gray-700'
                : 'bg-red-800 hover:bg-red-900 active:bg-red-800'
            ]"
          >
            <div
              v-if="isSendingAnswer"
              class="absolute transform -translate-x-1/2 ml-1 left-1/2 top-1.5"
            >
              <inline-small-spinner></inline-small-spinner>
            </div>
            <p :class="{ 'opacity-40': controlButtonsDisabled }">
              <span class="hidden md:inline">{{
                currentItemIsExercise && !thereIsValidSubmission
                  ? 'Salta'
                  : 'Avanti'
              }}</span>
              <i class="md:ml-2 fas fa-chevron-right"></i>
            </p>
          </button>
          <button
            @click="
              dirtyOpenAnswer
                ? flushOpenAnswer(1, true)
                : confirmEndExam(
                    currentItemIsExercise && !thereIsValidSubmission
                  )
            "
            v-else
            :disabled="isSendingAnswer || loading"
            :class="[
              currentItemIsExercise && !thereIsValidSubmission
                ? 'bg-red-800 hover:bg-red-900 active:bg-red-800'
                : 'bg-green-700 hover:bg-green-600 active:bg-green-700'
            ]"
            class="w-20 p-1 px-3 font-medium text-white transition-all duration-75 shadow-md cursor-pointer md:w-40 md:w-max disabled:opacity-80 rounded-t-md"
          >
            <i
              class="md:mr-1 fas"
              :class="[
                currentItemIsExercise && !thereIsValidSubmission
                  ? 'fa-exclamation-triangle md:mr-1'
                  : 'fa-check'
              ]"
            ></i>
            <span class="hidden md:inline">{{
              currentItemIsExercise && !thereIsValidSubmission
                ? 'Salta e termina'
                : 'Termina'
            }}</span>
          </button>
        </div>
        <!-- editor pane -->
        <div class="relative" v-show="pane == 'editor'">
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
            v-debounce:30000ms.lock="updateDraftCode"
          />
        </div>

        <!-- test case pane -->
        <div
          :style="'height:' + editorHeight"
          class="overflow-auto bg-gray-100 border border-transparent rounded-b-lg"
          v-show="pane == 'testcases'"
        >
          <div
            v-if="currentItemIsExercise"
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
            <h1 class="my-2 text-2xl font-medium" v-if="!loading">
              Esercizio {{ exam.ordering + 1 }} di {{ exam.total_items_count }}
            </h1>
            <button
              @click="popupOpen = true"
              class="h-8 px-3 ml-auto text-white bg-indigo-800 rounded-md shadow-sm"
            >
              <i class="mr-1 far fa-window-restore"></i> Apri il testo in un
              popup
            </button>
          </div>
          <!-- <Skeleton v-if="!exercise.text.length"></Skeleton> -->
          <div
            v-highlight
            v-if="currentItemIsExercise"
            v-html="highlightCode(currentExercise.text)"
          ></div>
        </div>

        <!-- question text pane  -->
        <div
          :style="'height:' + editorHeight"
          class="p-3 overflow-auto bg-gray-100 border border-transparent rounded-b-lg"
          v-show="pane == 'question'"
          id="current-question"
        >
          <div v-if="currentItemIsQuestion">
            <AggregatedQuestionIntroduction
              v-if="currentQuestion.introduction"
              :text="currentQuestion.introduction"
            ></AggregatedQuestionIntroduction>
            <new-question-test
              :question="currentQuestion"
              :ref="'q-' + currentQuestion.id"
              :key="'q-' + currentQuestion.id"
              :examId="exam.id"
              @sendAnswer="
                sendAnswerHandler(
                  $event.apiAction,
                  $event.body,
                  $event.oldValue
                )
              "
              @sendOpenAnswer="openAnswerHandler($event)"
              :disableInputs="controlButtonsDisabled"
            ></new-question-test>
          </div>
        </div>
      </div>
      <!-- submissions sidebar -->
      <transition name="bounce-x">
        <div
          class="bg-gray-100 border rounded-lg shadow-sm md:ml-3"
          v-show="currentItemIsExercise"
          :class="[currentItemIsExercise ? 'w-full lg:w-2/5' : 'w-0 w-lg:0']"
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
            Valutazione codice in corso...
          </div>
          <div class="overflow-auto">
            <div
              class=""
              v-for="(submission, index) in exam.submissions"
              :key="submission.id"
            >
              <Submission
                :canBeTurnedIn="submission.is_eligible && !index"
                :index="exam.submissions.length - index"
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
    >
      <div class="my-4" v-if="showHowToSubmit">
        <p>
          Potresti esserti dimenticato di consegnare. Non basta aver scritto il
          codice nell'editor, devi anche consegnarlo!
        </p>
        <p>
          Per consegnare, clicca sul pulsante
          <button
            class="relative p-1 px-4 mx-2 font-medium text-white transition-all duration-75 bg-green-600 rounded-md shadow-lg cursor-pointer disabled:bg-opacity-50 hover:bg-green-700"
          >
            <span
              ><i class="mr-1 fas fa-chevron-right"></i>Salva ed esegui</span
            >
          </button>
          in alto nella barra con tutti i tab.
        </p>
        <p class="pt-6 mt-6 border-t">
          Sei veramente sicuro di voler <strong>saltare</strong> questo
          esercizio?
        </p>
      </div>
    </Dialog>
    <transition name="bounce" v-if="currentItemIsExercise">
      <DraggablePopup
        v-show="popupOpen"
        :title="
          'Esercizio ' + (exam.ordering + 1) + ' di ' + exam.total_items_count
        "
        :content="highlightCode(currentExercise.text)"
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
// import Skeleton from '../components/Skeleton.vue'
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
import { getDirective } from 'vue-debounce'
import { throttle } from 'lodash'

export default {
  name: 'NewExamPage',
  components: {
    AceEditor,
    Submission,
    TestCase,
    Dialog,
    NewQuestionTest,
    //Skeleton,
    DraggablePopup,
    Spinner,
    AggregatedQuestionIntroduction,
    InlineSmallSpinner
  },
  directives: { debounce: getDirective() },
  created () {
    window.addEventListener('beforeunload', this.beforeWindowUnload)
    this.getExam()
  },
  beforeDestroy () {
    window.removeEventListener('beforeunload', this.beforeWindowUnload)
  },
  beforeRouteLeave (_to, _from, next) {
    if (this.confirmStay()) {
      next(false)
    } else {
      next()
    }
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
      exam: {},
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
      code: '',
      openAnswer: '',

      processingSubmission: false,
      pane: 'text',
      popupOpen: false,

      showHowToSubmit: false,
      showSavingAnswerDontPanic: false,
      savingAnswerHandle: null,

      cancelThrottledUpdate: false
    }
  },
  methods: {
    highlightCode,
    beforeWindowUnload (e) {
      if (this.confirmStay()) {
        // Cancel the event
        e.preventDefault()
        // Chrome requires returnValue to be set
        e.returnValue = ''
      }
    },
    confirmStay () {
      return !window.confirm('Sei sicuro di voler uscire dalla pagina?')
    },
    async updateDraftCode () {
      axios
        .post(`/exams/${this.exam.id}/draft_code/`, { code: this.code })
        .then(response => console.log(response))
        .catch(error => console.log(error))
    },
    getExam (delta = 0, y = false) {
      // TODO take care of moving these to a better place
      this.dialog = { shown: false }
      this.showHowToSubmit = false
      if (
        delta == 1 &&
        !this.exam.allow_going_back &&
        !y &&
        !confirm(
          'Sei sicuro di voler andare avanti? Se confermi, non potrai più tornare indietro.'
        )
      ) {
        return
      }
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
        .post(`/exams/${this.$route.params.examId}/${apiEntryPoint}/`, {
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

          this.exam = response.data
          if (this.currentItemIsQuestion) {
            this.pane = 'question'
          } else {
            this.pane = 'text'
            this.code =
              this.exam.submissions[0]?.code ??
              this.currentExercise.starting_code
          }
        })
        .catch(error => {
          if (error.response?.status == 401 || error.response?.status == 403) {
            this.$store.commit(
              'setRedirectToAfterLogin',
              this.$router.currentRoute.fullPath
            )
            this.$router.push('/login')
          } else if (error.response?.status == 404) {
            this.$store.commit('setSmallMessage', {
              severity: 2,
              msg: 'Esame non trovato.'
            })
            this.$router.push('/exam')
          } else {
            this.$store.commit(
              'setMessage',
              error.response?.data.message ?? error.message
            )
            // let the global handler catch this
            throw error
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    confirmSkippingExercise () {
      this.showHowToSubmit = true
      this.dialog = {
        shown: true,
        string: 'Non hai effettuato consegne!',
        confirmOnly: false,
        severity: 2,
        onYes: { callback: this.getExam, param: 1 },
        onNo: {
          callback: () => {
            this.dialog = { shown: false }
            this.showHowToSubmit = false
          }
        }
      }
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
        .post(`/exercises/${this.currentExercise.id}/submissions/`, {
          code: this.code
        })
        .then(response => {
          console.log(response.data)
          // add new submission to submission list
          this.exam.submissions.unshift(response.data)
          // hide fake "loading" submission
          this.processingSubmission = false
        })
        .catch(error => {
          console.log(JSON.stringify(error))
          throw error
        })
    },
    confirmEndExam (skip) {
      if (skip) {
        this.showHowToSubmit = true
      }
      // shows a dialog that prompts the user for confirmation to end the exam
      this.dialog = {
        shown: true,
        string: `Sei sicuro di voler ${
          skip ? "saltare l'<strong>ultimo</strong> esercizio" : 'consegnare'
        }?`,
        subText:
          'Se confermi, <strong>non potrai più tornare indietro</strong>.',
        confirmOnly: false,
        severity: 2,
        onYes: { callback: this.endExam },
        onNo: {
          callback: () => {
            this.dialog = { shown: false }
            this.showHowToSubmit = false
          }
        }
      }
    },
    endExam () {
      this.dialog = { shown: false }
      axios
        .post(`/exams/${this.exam.id}/end_exam/`, {})
        .then(() => {
          this.$store.commit(
            'setMessage',
            'Hai completato tutti gli esercizi. Puoi chiudere questa pagina.'
          )
        })
        .catch(error => {
          this.$store.commit(
            'setMessage',
            error.response?.data.message ?? error.message
          )
          throw error
        })
    },
    async sendAnswerHandler (apiActionUrl, body, oldValue) {
      // called when the answer(s) to the current question change
      // issues request to update (give/withdraw) the answer(s) to the current question
      this.loading = true
      await axios
        .post(`/exams/${this.exam.id}/${apiActionUrl}/`, body)
        .then(response => {
          console.log(response)
        })
        .catch(error => {
          this.$store.commit('setSmallMessage', {
            severity: 2,
            msg: error.response?.data.message ?? error.message
          })

          this.$refs['q-' + this.currentQuestion.id].rollBackTo(oldValue)
          // throw error back to caller for catching
          throw error
        })
        .finally(() => {
          this.loading = false
        })
    },
    openAnswerHandler (text) {
      // called when the current item is an open question and the user types text
      // in the answer textarea

      // TODO enable asking for confirmation before exiting the page
      this.openAnswer = text // save the new content of the answer
      this.throttledSendAnswerHandler(text)
    },
    throttledSendAnswerHandler: throttle(async function (text) {
      if (!this.cancelThrottledUpdate) {
        await this.sendAnswerHandler('give_answer', { text })
        // TODO disable asking for confirmation before exiting the page
      } else {
        // event was de-scheduled because user clicked forward/back before it fired
        this.cancelThrottledUpdate = false
      }
    }, 15000),
    async flushOpenAnswer (delta, endExam = false) {
      // prevent previously scheduled throttled updates from firing
      this.cancelThrottledUpdate = true

      // send the most recent answer obtained and move forward/back
      await this.sendAnswerHandler('give_answer', { text: this.openAnswer })
      if (!endExam) {
        this.getExam(delta)
      } else {
        this.confirmEndExam(false)
      }
    },
    editorInit
  },
  computed: {
    currentItemIsExercise () {
      return !!this.exam.exercise
    },
    currentItemIsQuestion () {
      return !!this.exam.question
    },
    currentExercise () {
      return this.exam.exercise
    },
    currentQuestion () {
      return this.exam.question
    },
    thereIsValidSubmission () {
      return (
        this.currentItemIsExercise &&
        this.exam.submissions.some(s => s.is_eligible)
      )
    },
    controlButtonsDisabled () {
      return this.isSendingAnswer || this.loading
    },
    dirtyOpenAnswer () {
      return (
        this.currentItemIsQuestion && this.currentQuestion.question_type == 'o'
      )
    },
    testCases () {
      if (!this.currentItemIsExercise) {
        return []
      }
      return this.currentExercise.testcases
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
