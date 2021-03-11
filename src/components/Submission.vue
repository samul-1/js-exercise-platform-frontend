<template>
  <div
    class="m-2 rounded-md shadow-md text-gray-900 text-shadow-lg"
    :class="{
      'bg-green-00': true && submission.is_eligible,
      'bg-red-00': true && !submission.is_eligible,
    }"
  >
    <div
      class="flex flex-wrap md:flex-nowrap p-3 text-gray-100"
      :class="{
        'rounded-md': !expanded,
        'rounded-t-md': expanded,
        'bg-green-500': submission.is_eligible,
        'bg-red-400': !submission.is_eligible,
      }"
    >
      <span class="mr-3 text-lg font-medium"
        ><i
          class="far mr-1"
          :class="{
            'fa-check-circle text-green-900': submission.is_eligible,
            'fa-times-circle text-red-900': !submission.is_eligible,
          }"
        ></i>
        Sottomissione #{{ index }}</span
      >
      <button
        @click="expanded = !expanded"
        class="ml-auto md:ml-0 border text-white border-gray-700 py px-3 rounded-md shadow-inner bg-gray-800"
      >
        {{ expanded ? "Nascondi" : "Dettagli" }}
      </button>
      <button
        class="py border mt-1 md:mt-0 border-green-700 ml-auto px-4 rounded-md bg-green-800 text-white shadow-lg"
        v-if="canBeTurnedIn"
      >
        <i class="fas fa-paper-plane"></i> Consegna
      </button>
    </div>

    <!-- testcase list -->
    <!--<transition name="smooth">-->
    <div class="p-3 rounded-b-md bg-gray-50" v-show="expanded">
      <div
        v-for="(testcase, index) in public_detail_testcases"
        :key="index"
        class="border-b pb-2 border-gray-300 last:border-b-0"
      >
        <div class="my-3">
          <p>
            <i
              class="far"
              :class="{
                'fa-check-circle text-green-900': testcase.passed,
                'fa-times-circle text-red-900': !testcase.passed,
              }"
            ></i>
            Test case
            <span
              class="font-semibold"
              :class="{
                'text-green-900': testcase.passed,
                'text-red-900': !testcase.passed,
              }"
              >{{ !testcase.passed ? "non " : "" }} superato</span
            >
          </p>
          <p class="font-medium mb-1">
            Input:
            <span
              class="break-all text-white font-mono bg-gray-800 py-0.5 px-2 shadow-sm rounded-md"
              >{{ testcase.parameters }}</span
            >
          </p>
          <p class="font-medium">
            Output:
            <span
              class="break-all text-white font-mono bg-gray-800 py-0.5 px-2 shadow-sm rounded-md"
              >{{ testcase.output }}</span
            >
          </p>
        </div>
      </div>
      <p class="my-3" v-if="submission.public_details.failed_secret_tests">
        <i class="far fa-times-circle text-red-900"></i> Test case
        <span class="font-semibold text-red-900">segreti falliti:</span>
        {{ submission.public_details.failed_secret_tests }}
      </p>
    </div>
    <!--</transition>-->
  </div>
</template>

<script>
export default {
  name: "Submission",
  props: {
    submission: Object,
    index: Number,
    canBeTurnedIn: Boolean,
  },
  data() {
    return {
      expanded: false,
    };
  },
  computed: {
    public_detail_testcases() {
      // get all the public_details object minus the failed_secret_tests property
      const {
        failed_secret_tests,
        ...details
      } = this.submission.public_details;

      failed_secret_tests; // evaluate variable to prevent linter from raising "no-unused"
      return details;
    },
  },
};
</script>

<style>
</style>