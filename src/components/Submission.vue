<template>
  <div
    class="m-2 text-gray-900 bg-gray-200 border border-gray-300 rounded-md shadow-md"
  >
    <div
      class="flex flex-wrap items-center p-3 text-gray-100 md:flex-nowrap"
      :class="{
        'rounded-md': !expanded,
        'rounded-t-md': expanded,
        'bg-green-500': false && submission.is_eligible,
        'bg-red-400': false && !submission.is_eligible,
      }"
    >
      <p class="mr-3 font-medium text-md">
        <i
          class="far"
          :class="{
            'fa-check-circle text-green-900': submission.is_eligible,
            'fa-times-circle text-red-900': !submission.is_eligible,
          }"
        ></i>
        <!-- Sott{{ failedTests > 0 ? '.' : 'omissione' }} #{{ index }} -->
      </p>
      <button
        @click="expanded = !expanded"
        class="pr-2 pl-2.5 text-white transition-all duration-150 bg-gray-800 border border-gray-700 rounded-md shadow-inner hover:bg-gray-900 md:ml-0 py"
      >
        <i
          class="my-auto mr-0.5 text-sm transform fas fa-caret-right"
          :class="{ 'rotate-90 -ml-1 mr-px': expanded }"
        ></i>
        {{ expanded ? "Nascondi" : "Dettagli" }}
      </button>
      <div class="w-1/3 ml-2 mr-4">
        <progress-bar
          :value="passedTests"
          :max="submission.total_testcases"
        ></progress-bar>
      </div>
      <p class="text-gray-900">
        {{ passedTests }} su {{ submission.total_testcases }}
      </p>
      <p
        v-if="submission.is_eligible"
        :class="[pulseOkText ? 'animate-pulse-fast' : '']"
        class="ml-auto font-semibold text-green-900"
      >
        OK!
      </p>
    </div>

    <!-- testcase list -->
    <div class="p-3 rounded-b-md bg-gray-50" v-show="expanded">
      <div v-if="submissionError">
        Errore durante l'esecuzione:
        <vue-code-highlight
          language="javascript"
          class="p-2 my-1 font-mono text-xs text-white break-all bg-gray-800 rounded-md shadow-sm"
        >
          {{ submissionError }}
        </vue-code-highlight>
      </div>
      <div v-if="compilationErrors">
        Errori durante la compilazione:
        <vue-code-highlight
          language="javascript"
          class="p-2 my-1 font-mono text-xs text-white break-all bg-gray-800 rounded-md shadow-sm"
        >
          {{ compilationErrors }}
        </vue-code-highlight>
      </div>
      <div
        v-for="(testcase, index) in testCasesDetails"
        :key="index"
        class="pb-2 border-b border-gray-300 last:border-b-0"
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
          <p
            class="my-2 text-sm font-light text-gray-500"
            v-if="!testcase.is_public"
          >
            Solo gli insegnanti possono vedere questo test case
          </p>
          <p class="mb-1 font-medium">
            <vue-code-highlight
              language="javascript"
              class="p-2 my-1 font-mono text-xs text-white break-all bg-gray-800 rounded-md shadow-sm"
            >
              {{ testcase.assertion }}
            </vue-code-highlight>
          </p>
          <p v-if="!testcase.passed" class="mb-1 break-all">
            Errore:
            <vue-code-highlight
              language="javascript"
              class="p-2 my-1 font-mono text-xs text-white break-all bg-gray-800 rounded-md shadow-sm"
            >
              {{ testcase.error }}
            </vue-code-highlight>
          </p>
        </div>
      </div>
      <p class="my-3" v-if="failedSecretTests">
        <i class="text-red-900 far fa-times-circle"></i> Test case
        <span class="font-semibold text-red-900">segreti falliti:</span>
        {{ failedSecretTests }}
      </p>
    </div>
  </div>
</template>

<script>
import { component as VueCodeHighlight } from "vue-code-highlight";
import "vue-code-highlight/themes/duotone-sea.css";
import ProgressBar from "./ProgressBar.vue";
export default {
  name: "Submission",
  components: {
    VueCodeHighlight,
    ProgressBar,
  },
  props: {
    submission: Object,
    index: Number,
  },
  created() {
    if (this.submission.is_eligible) {
      this.pulseOkText = true;
      setTimeout(() => {
        this.pulseOkText = false;
      }, 2990);
    }
  },
  data() {
    return {
      expanded: false,
      pulseOkText: false,
    };
  },
  computed: {
    failedTests() {
      if (!this.testCasesDetails) {
        return 0;
      }
      return (
        this.testCasesDetails.filter((t) => !t.passed).length +
        this.failedSecretTests
      );
    },
    failedSecretTests() {
      return this.submission.details?.failed_secret_tests ?? 0;
    },
    passedTests() {
      if (
        this.submission.details?.error ||
        this.submission.details?.compilation_errors
      ) {
        // if there was a global error, no test cases passed
        return 0;
      }
      return this.submission.total_testcases - this.failedTests;
    },
    testCasesDetails() {
      return this.submission.details?.tests;
    },
    submissionError() {
      return this.submission.details?.error;
    },
    compilationErrors() {
      return this.submission.details?.compilation_errors;
    },
  },
};
</script>

<style>
code[class*="language-"],
pre[class*="language-"] {
  padding: 0;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.animate-pulse-fast {
  animation: pulse 0.8s cubic-bezier(0.1, 0, 0.6, 1) infinite;
}
</style>
