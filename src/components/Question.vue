<template>
  <div class="text-md">
    <div class="mb-5">
      <div v-highlight v-html="highlightCode(question.text)"></div>
    </div>
    <div v-if="question.question_type == 'm'">
      <div v-for="answer in question.answers" :key="answer.id" class="my-1">
        <input
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
        :rows="preview ? 2 : 10"
        style="width:98%"
        v-model="answerText"
      ></textarea>
    </div>
  </div>
</template>

<script>
import 'vue-code-highlight/themes/duotone-sea.css'
import { highlightCode } from '../constants.js'

export default {
  name: 'Question',
  props: {
    question: {
      type: Object
    },
    preview: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    selected: {
      deep: true,
      handler (newValue) {
        this.$emit('answer', newValue)
      }
    },
    answerText (newValue) {
      this.$emit('text', newValue)
    },
    //! can this be done in a centralized way?
    $props: {
      handler () {
        // render LaTeX code
        setTimeout(
          () => window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub]),
          10
        )
        // reset answer selection
        this.selected = []
        this.answerText = ''
      },
      deep: true,
      immediate: true
    }
  },

  data () {
    return {
      selected: [],
      answerText: ''
    }
  },
  methods: {
    highlightCode
  }
}
</script>
