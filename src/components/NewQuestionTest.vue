<template>
  <div class="text-md">
    <div class="mb-5">
      <div v-highlight v-html="highlightCode(question.text)"></div>
    </div>
    <div v-if="question.question_type == 'm'">
      <div v-for="answer in question.answers" :key="answer.id" class="my-1">
        <input
          :disabled="loading"
          :type="question.accepts_multiple_answers ? 'checkbox' : 'radio'"
          :id="'ans-' + answer.id"
          :value="question.accepts_multiple_answers ? answer.id : [answer.id]"
          v-model="selected"
          class="mr-1"
        />
        <label :for="'ans-' + answer.id"
          ><span v-highlight v-html="highlightCode(answer.text)"></span>
        </label>
      </div>
    </div>
    <div class="flex" v-else>
      <textarea
        placeholder="Scrivi qui la tua risposta..."
        class="p-2 mx-auto border border-gray-200 rounded-md shadow-sm "
        rows="10"
        style="width:98%"
        v-model="answerText"
        v-debounce:1500ms.lock="sendAnswerText"
      ></textarea>
    </div>
  </div>
</template>

<script>
import 'vue-code-highlight/themes/duotone-sea.css'
import { highlightCode } from '../constants.js'
import { renderTex } from '../utility.js'
import axios from 'axios'
import { getDirective } from 'vue-debounce'

export default {
  name: 'NewQuestionTest',
  props: {
    question: {
      type: Object
    },
    examId: {
      type: [Number, String]
    }
  },
  directives: { debounce: getDirective() },
  watch: {
    selectedStringified (_newValue, _oldValue) {
      if (this.ignoreWatchers) {
        return
      }
      const newValue = JSON.parse(_newValue)
      const oldValue = JSON.parse(_oldValue)

      console.log('new', newValue, 'old', oldValue)

      if (!this.question.accepts_multiple_answers) {
        // question accepts a single answer and the selected answer changed: send
        // server request to (create or) update the answer given to this question
        this.sendAnswer(newValue[0])
        return
      }

      // if the question accepts multiple answers, then either a new answer was checked
      // or a checked answer was un-checked - the assumption here is when this watcher is
      // called `oldValue` and `newValue` will differ by one and only one element
      if (newValue.length > oldValue.length) {
        // a new answer was checked: send server request to record the given answer
        this.sendAnswer(newValue.slice(-1)[0])
      } else {
        const uncheckedAnswer = oldValue.filter(a => !newValue.includes(a))[0]
        this.withdrawAnswer(uncheckedAnswer)
      }
    },
    answerText () {
      console.log('setting dirty to true')
      this.answerTextDirty = true
      // TODO you probably need to emit some event to tell the parent to lock "forward/back" buttons
    },
    question: {
      handler (newVal) {
        renderTex()
        this.ignoreWatchers = true // prevent `selectedStringified` watcher from firing
        this.selected = [] // TODO this will make the watcher for `selectedStringified` fire--how to avoid?
        this.answerText = ''

        const alreadySelected = newVal.answers
          .filter(a => a.is_selected)
          .map(a => a.id)

        this.selected = [...alreadySelected]

        this.$nextTick(() => {
          this.ignoreWatchers = false
        })
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
      loading: false,
      ignoreWatchers: false
    }
  },
  methods: {
    highlightCode,
    // TODO factor the three functions below into one
    sendAnswer (answer) {
      // issue request to give an answer to this question
      this.loading = true
      this.$emit('sendingAnswer')
      axios
        .post(`/exams/${this.examId}/give_answer/`, {
          answer
        })
        .then(response => {
          console.log(response)
        })
        .catch(error => {
          console.log(error)
        })
        .finally(() => {
          this.loading = false
          this.$emit('sentAnswer')
        })
    },
    sendAnswerText (text) {
      this.loading = true
      axios
        .post(`/exams/${this.examId}/give_answer/`, {
          text
        })
        .then(response => {
          console.log(response)
          this.answerTextDirty = false // TODO you probably need to emit some event to tell the parent to unlock "forward/back" buttons
        })
        .catch(error => {
          console.log(error)
        })
        .finally(() => {
          this.loading = false
          // todo remove this in production
          console.log('setting dirty to false')
          this.answerTextDirty = false
        })
    },
    withdrawAnswer (answer) {
      // issue request to delete an answer given to this question
      this.loading = true
      axios
        .post(`/exams/${this.examId}/withdraw_answer/`, {
          answer
        })
        .then(response => {
          console.log(response)
        })
        .catch(error => {
          console.log(error)
        })
        .finally(() => {
          this.loading = false
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
