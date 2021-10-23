<template>
  <div class="text-md">
    <div class="mb-5">
      <div v-highlight v-html="highlightCode(question.text)"></div>
    </div>
    <div v-if="question.question_type == 'm'">
      <div
        v-for="answer in question.answers"
        :key="answer.id"
        class="flex my-1 space-x-1"
      >
        <input
          :disabled="disableInputs"
          :type="question.accepts_multiple_answers ? 'checkbox' : 'radio'"
          :value="question.accepts_multiple_answers ? answer.id : [answer.id]"
          :id="'ans-' + answer.id"
          class="block mt-1 mb-auto"
          v-model="selected"
        />
        <label :for="'ans-' + answer.id" class="block"
          ><span v-highlight v-html="highlightCode(answer.text)"></span>
        </label>
      </div>
    </div>
    <div v-else>
      <textarea
        placeholder="Scrivi qui la tua risposta..."
        class="p-2 mx-auto border border-gray-200 rounded-md shadow-sm "
        rows="10"
        style="width: 98%"
        v-model="answerText"
      ></textarea>
      <div class="my-2" v-if="errorWhileUpdatingAnswerText">
        <span class="inline text-red-500">
          Si è verificato un errore e parte della tua risposta non è stata
          salvata.
        </span>
        <button
          @click="sendAnswerText"
          class="mr-auto px-3 py-0.5 my-auto ml-2 text-lg text-white transition-all duration-100 bg-red-700 rounded-md hover:bg-red-800"
        >
          Riprova
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import 'vue-code-highlight/themes/duotone-sea.css'
import { highlightCode } from '../constants.js'
// import { renderTex } from '../utility.js'

export default {
  name: 'NewQuestionTest',
  props: {
    question: {
      type: Object
    },
    examId: {
      type: [Number, String]
    },
    disableInputs: {
      type: Boolean
      //default: false
    }
  },
  watch: {
    async selectedStringified (_newValue, _oldValue) {
      if (this.ignoreWatchers) {
        return
      }
      const newValue = JSON.parse(_newValue)
      const oldValue = JSON.parse(_oldValue)

      let apiAction, body

      if (!this.question.accepts_multiple_answers) {
        // question accepts a single answer and the selected answer changed: send
        // server request to (create or) update the answer given to this question
        apiAction = 'give_answer'
        body = {
          answer: newValue[0]
        }
      }

      // if the question accepts multiple answers, then either a new answer was checked
      // or a checked answer was un-checked - the assumption here is when this watcher is
      // called `oldValue` and `newValue` will differ by one and only one element
      else if (newValue.length > oldValue.length) {
        // a new answer was checked: send server request to record the given answer
        apiAction = 'give_answer'
        body = {
          answer: newValue.slice(-1)[0]
        }
      } else {
        // a previously selected answer was unchecked: send server request to delete the answer
        const uncheckedAnswer = oldValue.filter(a => !newValue.includes(a))[0]
        apiAction = 'withdraw_answer'
        body = {
          answer: uncheckedAnswer
        }
      }

      this.$emit('sendAnswer', { apiAction, body })
      // TODO error detection and handling
    },
    // eslint-disable-next-line no-unused-vars
    answerText (newVal, oldVal) {
      if (oldVal.length > 0) {
        this.$emit('sendOpenAnswer', newVal)
      }
    },
    question: {
      handler (newVal) {
        // set answers that had previously been selected (i.e. before refreshing
        // the page or coming back to a question the user had already answered)
        const alreadySelected = newVal.answers
          .filter(a => a.is_selected)
          .map(a => a.id)

        this.noWatcherSetSelectedAnswers(alreadySelected)
        this.noWatcherSetAnswerText(newVal.answer_text)
      },
      deep: true,
      immediate: true
    }
  },
  data () {
    return {
      selected: [],
      answerText: '',
      answerTextDirty: false,
      ignoreWatchers: false,
      savedAnswerText: '',
      errorWhileUpdatingAnswerText: false
    }
  },
  methods: {
    highlightCode,
    noWatcherSetSelectedAnswers (value) {
      // sets the flag to ignore watchers for `selected`, then sets `selected` to the passed value,
      // and finally resets the flag. this is used to roll back the value of `selected` when a server
      // error occurs or when the propr `question` changes
      this.ignoreWatchers = true
      this.selected = [...value]
      this.$nextTick(() => {
        this.ignoreWatchers = false
      })
    },
    noWatcherSetAnswerText (value) {
      this.ignoreWatchers = true
      this.answerText = value
      this.$nextTick(() => {
        this.ignoreWatchers = false
      })
    }
  },
  computed: {
    selectedStringified () {
      // stringify array to be able to get old value in watcher
      return JSON.stringify(this.selected)
    }
  }
}
</script>

<style>
input[type='radio'],
input[type='checkbox'] {
  min-width: 20px !important;
}
</style>
