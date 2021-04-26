<template>
  <div class="p-2 mb-2 bg-gray-300 rounded-md">
    <div v-highlight v-html="highlightCode(text)"></div>
  </div>
</template>

<script>
import { highlightCode } from '../constants.js'

export default {
  name: 'AggregatedQuestionIntroduction',
  props: ['text'],
  methods: {
    highlightCode
  }
}
</script>

<style></style>
