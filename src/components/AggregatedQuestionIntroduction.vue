<template>
  <div class="p-2 mb-2 bg-gray-300 rounded-md">
    <div v-html="text"></div>
  </div>
</template>

<script>
export default {
  name: 'AggregatedQuestionIntroduction',
  props: ['text']
  // TODO import the code highlight function and use it on the text
}
</script>

<style></style>
