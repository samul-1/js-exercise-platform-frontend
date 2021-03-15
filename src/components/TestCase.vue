<template>
  <div class="mx-4 my-6">
    <h3 class="font-semibold text-md">Test case #{{ index }}</h3>
    <p class="mb-1">
      <vue-code-highlight
        language="javascript"
        class="break-all text-white font-mono text-xs bg-gray-800 rounded-md my-1 p-2 shadow-sm"
      >
        <pre>{{ testcase.assertion }}</pre>
      </vue-code-highlight>
    </p>
    <!-- <p class="">
      Output:
      <span
        class="break-all text-white font-mono bg-gray-800 py-0.5 px-2 shadow-sm rounded-md"
        >{{ testcase.output }}</span
      >
    </p> -->
  </div>
</template>

<script>
import { component as VueCodeHighlight } from "vue-code-highlight";
import "vue-code-highlight/themes/duotone-sea.css";
export default {
  name: "TestCase",
  components: {
    VueCodeHighlight,
  },
  props: {
    testcase: Object,
    index: Number,
  },
};
</script>

<style>
pre[class*="language-"] {
  padding: 0;
  margin: 0;
  overflow: auto;
}
</style>