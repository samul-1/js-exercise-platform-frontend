<template>
  <div class="mx-4 my-6">
    <div class="flex space-x-2">
      <h3 class="font-semibold text-md">Test case #{{ index }}</h3>
      <p
        class="my-auto text-sm font-light text-gray-500"
        v-if="!testcase.is_public"
      >
        Solo gli insegnanti possono vedere questo test case
      </p>
    </div>
    <p class="mb-1">
      <vue-code-highlight
        language="javascript"
        class="p-2 my-1 font-mono text-xs text-white break-all bg-gray-800 rounded-md shadow-sm"
      >
        <pre>{{ testcase.assertion }}</pre>
      </vue-code-highlight>
    </p>
  </div>
</template>

<script>
import { component as VueCodeHighlight } from 'vue-code-highlight'
import 'vue-code-highlight/themes/duotone-sea.css'
export default {
  name: 'TestCase',
  components: {
    VueCodeHighlight
  },
  props: {
    testcase: Object,
    index: Number
  }
}
</script>

<style>
pre[class*='language-'] {
  padding: 0;
  margin: 0;
  overflow: auto;
}
</style>
