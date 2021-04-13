<template>
  <div class="text-lg">
    <div class="mb-10">
      <div v-highlight v-html="highlightCode(question.text)"></div>
    </div>
    <div v-for="answer in question.answers" :key="answer.id" class="my-1">
      <input
        type="radio"
        :id="'ans-' + answer.id"
        :value="answer.id"
        v-model="selected"
        class="mr-1"
      />
      <label :for="'ans-' + answer.id"
        ><span v-highlight v-html="highlightCode(answer.text)"></span>
      </label>
    </div>
  </div>
</template>

<script>
import 'vue-code-highlight/themes/duotone-sea.css'
import { highlightCode } from '../constants.js'

export default {
  name: 'MultipleChoiceQuestion',
  props: ['question'],
  watch: {
    selected (newValue) {
      this.$emit('answer', newValue)
    },
    $props: {
      handler () {
        // render LaTex code
        setTimeout(
          () => window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub]),
          10
        )
      },
      deep: true,
      immediate: true
    }
  },

  data () {
    return {
      selected: null
    }
  },
  methods: {
    highlightCode
  }
}
</script>
