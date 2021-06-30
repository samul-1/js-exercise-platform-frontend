<template>
  <div class="p-2.5 mb-2 bg-gray-200 rounded-md">
    <div v-highlight v-html="highlightCode(text)"></div>
  </div>
</template>

<script>
import { highlightCode } from '../constants'

export default {
  name: 'AggregatedQuestionIntroduction',
  props: {
    text: {
      type: String
    }
  },
  methods: {
    highlightCode
  }
}
</script>

<style></style>
