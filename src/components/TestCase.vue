<template>
  <div class="mx-4 my-6">
    <h3 class="font-semibold text-lg">Test case #{{ index }}</h3>
    <p class="mb-1">
      Input:
      <span
        class="break-all text-white font-mono bg-gray-800 py-0.5 px-2 shadow-sm rounded-md"
        >{{ testcase.parameters }}</span
      >
    </p>
    <p class="">
      Output:
      <span
        class="break-all text-white font-mono bg-gray-800 py-0.5 px-2 shadow-sm rounded-md"
        >{{ testcase.output }}</span
      >
    </p>
  </div>
</template>

<script>
export default {
  name: "TestCase",
  props: {
    testcase: Object,
    index: Number,
  },
};
</script>

<style>
</style>