<template>
  <div id="editor-view" ref="editorView" class="px-4 my-5">
    <div
      v-if="loading"
      class="fixed z-50"
      style="top:50%; left:50%; transform: translate(-50%,-50%); filter: drop-shadow(3px 4px 3px gray);"
    >
      <svg
        class="w-8 h-8 mr-3 -ml-1 text-black animate-spin"
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
        ></path>
      </svg>
    </div>
    <!-- main block -->
    <div class="flex flex-wrap w-full mt-5 md:flex-nowrap">
      <div
        class="w-full h-full transition-all duration-300 border border-gray-200 rounded-lg shadow-lg"
        :class="{ 'lg:w-3/5': exercise.id }"
      >
        <!-- tabs -->
        <div class="flex bg-gray-900 rounded-t-lg">
          <div
            v-if="exercise.id"
            class="px-3 py-1 mr-1 text-white transition-all duration-75 bg-gray-500 shadow-inner cursor-pointer hover:bg-gray-700 rounded-t-md"
            @click="pane = 'editor'"
            :class="{ 'bg-gray-700': pane == 'editor' }"
          >
            Editor
          </div>
          <div
            v-if="exercise.id"
            class="px-3 py-1 mr-auto text-white transition-all duration-75 bg-gray-500 shadow-inner cursor-pointer rounded-t-md hover:bg-gray-700"
            @click="pane = 'testcases'"
            :class="{
              'bg-gray-700': pane == 'testcases'
            }"
          >
            Test case
          </div>

          <!-- question controls -->
          <div
            v-if="question.id"
            class="px-3 py-1 mr-auto text-white transition-all duration-75 bg-gray-500 shadow-inner cursor-pointer hover:bg-gray-700 rounded-t-md"
            @click="pane = 'question'"
            :class="{ 'bg-gray-700': pane == 'question' }"
          >
            Domanda {{ seenQuestionCount }}
          </div>
          <button
            v-if="question.id"
            @click="confirmSkippingQuestion()"
            class="p-1 px-3 mr-1 font-medium text-white transition-all duration-75 bg-red-700 shadow-md cursor-pointer rounded-t-md hover:bg-red-800"
          >
            Salta domanda
          </button>

          <button
            v-if="question.id"
            @click="submitAnswer()"
            :disabled="selectedAnswer == null"
            class="w-40 p-1 px-3 font-medium text-white transition-all duration-75 bg-green-600 shadow-md cursor-pointer disabled:opacity-50 rounded-t-md hover:bg-green-700"
          >
            <i v-show="submitCooldown == 0" class="fas fa-chevron-right"></i>
            Invia risposta
          </button>

          <!-- exercise controls -->
          <button
            v-if="exercise.id"
            @click="pane = 'text'"
            class="p-1 px-3 mr-1 font-medium text-white transition-all duration-75 bg-indigo-700 shadow-md cursor-pointer rounded-t-md hover:bg-indigo-800"
            :class="{ 'bg-indigo-800': pane == 'text' }"
          >
            Testo dell'esercizio
          </button>
          <button
            v-if="exercise.id"
            @click="submitCode()"
            :disabled="submitCooldown != 0 || !code.length"
            class="w-40 p-1 px-3 font-medium text-white transition-all duration-75 bg-green-600 shadow-md cursor-pointer disabled:opacity-50 rounded-t-md hover:bg-green-700"
          >
            <i v-show="submitCooldown == 0" class="fas fa-chevron-right"></i>
            {{ !submitCooldown ? 'Esegui codice' : submitCooldown }}
          </button>
        </div>
        <!-- editor pane -->
        <div v-show="pane == 'editor'">
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
          class="overflow-auto bg-gray-200 border border-transparent rounded-b-lg"
          v-show="pane == 'testcases'"
        >
          <div
            class="p-4 m-2 font-medium text-gray-200 bg-yellow-600 shadow-md rounded-xl"
          >
            <i class="mr-2 fas fa-eye-slash"></i> Il tuo codice potrebbe essere
            eseguito anche con test case non presenti in questa lista.
          </div>
          <div v-for="testcase in exercise.public_testcases" :key="testcase.id">
            <TestCase :testcase="testcase" :index="testcase.id"></TestCase>
          </div>
        </div>

        <!-- exercise text pane pane -->
        <div
          :style="'height:' + editorHeight"
          class="p-3 overflow-auto bg-gray-200 border border-transparent rounded-b-lg"
          v-show="pane == 'text'"
        >
          <div class="flex w-full">
            <h1 class="my-2 text-2xl font-medium">
              {{ examName }}
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
          <div v-else v-highlight v-html="processedAssignmentText"></div>
        </div>

        <!-- question text pane  -->
        <div
          :style="'height:' + editorHeight"
          class="p-3 overflow-auto bg-gray-200 border border-transparent rounded-b-lg"
          v-show="pane == 'question'"
        >
          <MultipleChoiceQuestion
            :question="question"
            @answer="selectedAnswer = $event"
          ></MultipleChoiceQuestion>
        </div>
      </div>
      <!-- submissions sidebar -->
      <transition name="bounce-x">
        <div
          class="bg-gray-200 border rounded-lg shadow-md md:ml-3"
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
            <svg
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
            >Valutazione codice in corso...
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
                @turnIn="confirmTurnIn(submission.id)"
              ></Submission>
            </div>
          </div>
        </div>
      </transition>
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
        :title="examName"
        :content="processedAssignmentText"
        @hide="popupOpen = false"
      ></DraggablePopup>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'
import AceEditor from 'vuejs-ace-editor'
import Submission from '../components/Submission.vue'
import TestCase from '../components/TestCase.vue'
import MultipleChoiceQuestion from '../components/MultipleChoiceQuestion.vue'
import Skeleton from '../components/Skeleton.vue'
import 'vue-code-highlight/themes/duotone-sea.css'
import Dialog from '../components/Dialog.vue'
import DraggablePopup from '../components/DraggablePopup.vue'
export default {
  name: 'ExamPage',
  components: {
    AceEditor,
    Submission,
    TestCase,
    Dialog,
    MultipleChoiceQuestion,
    Skeleton,
    DraggablePopup
  },
  created () {
    this.getExam()
  },
  mounted () {
    // set the editor height to approximately 70% of parent height
    this.editorHeight = this.$parent.$refs.app.clientHeight / 1.4 + 'px'

    // set editor options asynchronously because the editor height isn't known at create time
    // and without doing this the font size gets screwed up for some reason
    setTimeout(
      () =>
        (this.editorOptions = {
          // ! import this from constants.js
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          fontSize: 17,
          highlightActiveLine: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2,
          showPrintMargin: false,
          showGutter: true
        })
    )
  },
  data () {
    return {
      dialog: {
        shown: false
      },

      loading: false,

      editorElement: document.getElementById('app'),
      editorHeight: null,

      submitCooldown: 0,
      submitCooldownHandle: null,
      editorOptions: {},

      examName: null,

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

      seenQuestionCount: 0,

      code: '',
      selectedAnswer: null,

      processingSubmission: false,
      submissions: [],
      pane: 'text',
      popupOpen: false
    }
  },
  methods: {
    getExam () {
      console.log('getting exam')
      this.loading = true
      axios
        .post('/exams/my_exam/')
        .then(response => {
          console.log(response)
          this.loading = false
          // server will return 204 if all exercises and questions have been completed
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
            this.seenQuestionCount++ // ! save this to local storage
          } else this.question.id = null

          // save exercise
          if (response.data.exercise) {
            const { starting_code, ...exercise } = response.data.exercise
            this.code = starting_code // set initial editor code to that specified in the exercise
            this.exercise = exercise
            // move to assignment text pane
            this.pane = 'text'
          } else this.exercise.id = null

          // copy rest of response data into the corresponding fields
          this.examName = response.data.name
          this.submissions = response.data.submissions
        })
        .catch(error => {
          if (error.response.status == 401) {
            this.$router.push('/login')
            this.$store.commit('removeToken')
          } else {
            this.$store.commit(
              'setMessage',
              error.response.data.message ?? error.message
            )
          }
        })
    },
    submitCode () {
      // submits code to the server, temporarily disables submit button for cooldown,
      // and shows the submission details upon receiving them back from the server,
      // then loads next question or exercise
      this.submitCooldown = 10
      this.submitCooldownHandle = setInterval(() => {
        this.submitCooldown--
        if (!this.submitCooldown) {
          clearInterval(this.submitCooldownHandle)
          this.submitCooldownHandle = null
        }
      }, 1000)
      this.processingSubmission = true
      axios
        .post(`/exercises/${this.exercise.id}/submissions/`, {
          code: this.code
        })
        .then(response => {
          console.log(response.data)
          this.submissions.unshift(response.data)
          this.processingSubmission = false
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
    },
    submitAnswer (resetAnswer = false) {
      // submits answer to the server, then loads next question or exercise. When
      // a question is skipped, this function is called with `resetAnswer` set to true, to
      // send a null answer even if the user had clicked on an answer before deciding to skip
      if (resetAnswer) {
        this.selectedAnswer = null
      }

      // close confirmation dialog if it had been opened
      this.dialog = { shown: false }

      axios
        .post(`/questions/${this.question.id}/given_answers/`, {
          answer: this.selectedAnswer
        })
        .then(response => {
          console.log(response.data)
          // ask for next exercise or question
          this.getExam()
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
    },
    confirmTurnIn (id) {
      // shows a dialog that prompts the user for confirmation to turn in a submission
      id
      this.dialog = {
        shown: true,
        string: 'Sei sicuro di voler consegnare?',
        subText:
          'Una volta confermata, la consegna non potrà più essere modificata.',
        confirmOnly: false,
        onYes: { callback: this.turnIn, param: id },
        onNo: {
          callback: () => (this.dialog = { shown: false })
        }
      }
    },
    confirmSkippingQuestion () {
      // shows a dialog that prompts the user for confirmation to submit an answer
      this.dialog = {
        shown: true,
        string: 'Sei sicuro di voler saltare questa domanda?',
        subText: 'Se confermi, non potrai più tornare indietro.',
        confirmOnly: false,
        severity: 2,
        onYes: { callback: this.submitAnswer, param: true },
        onNo: {
          callback: () => (this.dialog = { shown: false })
        }
      }
    },
    turnIn (id) {
      // makes a PUT request to the server asking to turn in an eligible submission
      this.dialog = { shown: false }
      console.log(id)
      axios
        .put(`/exercises/${this.exerciseId}/submissions/${id}/turn_in/`, {})
        .then(() => {
          // ask for next exercise
          this.getExam()
        })
        .catch(error => {
          this.$store.commit(
            'setMessage',
            error.response.data.message ?? error.message
          )
          console.log(JSON.stringify(error))
        })
    },
    editorInit () {
      // ! import this from constants.js
      require('brace/ext/language_tools') //language extension prerequsite...
      require('brace/mode/html')
      require('brace/mode/javascript') //language
      require('brace/mode/less')
      require('brace/theme/monokai')
      require('brace/snippets/javascript') //snippet
    }
  },
  computed: {
    processedAssignmentText () {
      // repaces `'s inside the assignment text with highlighted js code
      return this.exercise.text
        ?.replace(
          /```(.*)```/g,
          `
        <div
        class="p-2 my-1 font-mono text-xs text-white break-all bg-gray-800 rounded-md shadow-sm"
        >
          <pre class=" language-javascript"><code class=" language-javascript">$1</code></pre>
        </div>
      `
        )
        ?.replace(
          /`(.*)`/g,
          `
        <div
        class="inline-block p-1 font-mono text-xs text-white break-all bg-gray-800 rounded-md shadow-sm"
        >
          <pre style="line-height: 0.95; overflow-y: hidden" class=" language-javascript"><code style="line-height: 0.5" class=" language-javascript">$1</code></pre>
        </div>
      `
        )
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
