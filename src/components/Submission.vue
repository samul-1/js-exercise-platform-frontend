<template>
  <div
    class="m-2 text-gray-900 rounded-md shadow-md text-shadow-lg"
    :class="{
      'bg-green-00': true && submission.is_eligible,
      'bg-red-00': true && !submission.is_eligible
    }"
  >
    <div
      class="flex flex-wrap p-3 text-gray-100 md:flex-nowrap"
      :class="{
        'rounded-md': !expanded,
        'rounded-t-md': expanded,
        'bg-green-500': submission.is_eligible,
        'bg-red-400': !submission.is_eligible
      }"
    >
      <span class="mr-3 font-medium text-md"
        ><i
          class="mr-1 far"
          :class="{
            'fa-check-circle text-green-900': submission.is_eligible,
            'fa-times-circle text-red-900': !submission.is_eligible
          }"
        ></i>
        Sott{{ failedTests > 0 ? '.' : 'omissione' }} #{{ index }}</span
      >
      <button
        @click="expanded = !expanded"
        class="px-3 ml-auto text-white transition-all duration-150 bg-gray-800 border border-gray-700 rounded-md shadow-inner hover:bg-gray-900 md:ml-0 py"
      >
        <i
          class="mr-1 transition-transform duration-75 transform fas fa-caret-right"
          :class="{ 'rotate-90': expanded }"
        ></i>
        {{ expanded ? 'Nascondi' : 'Dettagli' }}
      </button>
      <div v-if="failedTests" class="ml-2">
        ({{ failedTests }} test fallit{{ failedTests == 1 ? 'o' : 'i' }})
      </div>
      <button
        @click="$emit('turnInSubmissionCode')"
        class="px-3 mt-1 ml-auto text-white transition-all duration-100 bg-green-800 border border-green-700 rounded-md shadow-lg hover:bg-green-900 py md:mt-0"
        v-if="canBeTurnedIn && !submission.has_been_turned_in"
      >
        <i class="mr-1 fas fa-paper-plane"></i> Consegna
      </button>
      <p v-if="submission.has_been_turned_in" class="ml-auto font-medium">
        Consegnata
      </p>
    </div>

    <!-- testcase list -->
    <div class="p-3 rounded-b-md bg-gray-50" v-show="expanded">
      <div v-if="submission.public_details.error">
        Errore durante l'esecuzione:
        <vue-code-highlight
          language="javascript"
          class="p-2 my-1 font-mono text-xs text-white break-all bg-gray-800 rounded-md shadow-sm"
        >
          {{ submission.public_details.error }}
        </vue-code-highlight>
      </div>
      <div
        v-for="(testcase, index) in submission.public_details.tests"
        :key="index"
        class="pb-2 border-b border-gray-300 last:border-b-0"
      >
        <div class="my-3">
          <p>
            <i
              class="far"
              :class="{
                'fa-check-circle text-green-900': testcase.passed,
                'fa-times-circle text-red-900': !testcase.passed
              }"
            ></i>
            Test case
            <span
              class="font-semibold"
              :class="{
                'text-green-900': testcase.passed,
                'text-red-900': !testcase.passed
              }"
              >{{ !testcase.passed ? 'non ' : '' }} superato</span
            >
          </p>
          <p class="mb-1 font-medium">
            <vue-code-highlight
              language="javascript"
              class="p-2 my-1 font-mono text-xs text-white break-all bg-gray-800 rounded-md shadow-sm"
            >
              <pre>{{ testcase.assertion }}</pre>
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
      <p class="my-3" v-if="submission.public_details.failed_secret_tests">
        <i class="text-red-900 far fa-times-circle"></i> Test case
        <span class="font-semibold text-red-900">segreti falliti:</span>
        {{ submission.public_details.failed_secret_tests }}
      </p>
    </div>
  </div>
</template>

<script>
import { component as VueCodeHighlight } from 'vue-code-highlight'
import 'vue-code-highlight/themes/duotone-sea.css'
export default {
  name: 'Submission',
  components: {
    VueCodeHighlight
  },
  props: {
    submission: Object,
    index: Number,
    canBeTurnedIn: Boolean
  },
  data () {
    return {
      expanded: false
    }
  },
  computed: {
    failedTests () {
      if (!this.submission.public_details.tests) {
        return 0
      }
      return (
        this.submission.public_details.tests.filter(t => !t.passed).length +
        this.submission.public_details.failed_secret_tests
      )
    }
  }
}
</script>

<style>
code[class*='language-'],
pre[class*='language-'] {
  padding: 0;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
