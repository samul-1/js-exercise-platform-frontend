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
    highlightCode (text) {
      return text
        ?.replace(
          /```([^`]*)```/g,
          `
        <div
        class="p-2 my-1 text-xs text-white break-all bg-gray-800 rounded-md shadow-sm -mono"
        >
          <pre class=" language-javascript"><code class=" language-javascript">$1</code></pre>
        </div>
      `
        )
        ?.replace(
          /`([^`]*)`/g,
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
