<template>
  <div id="editor-view" ref="editorView" class="my-5 px-1">
    <!-- main editor block -->
    <div class="flex mt-5 w-full flex-wrap md:flex-nowrap">
      <div
        class="w-full lg:w-3/5 h-full border border-gray-200 rounded-lg shadow-lg"
      >
        <div class="flex bg-gray-900 rounded-t-lg">
          <div
            class="transition-all duration-75 bg-gray-500 hover:bg-gray-700 cursor-pointer text-white rounded-t-md py-1 px-3 mr-1 shadow-inner"
            @click="pane = 'editor'"
            :class="{ 'bg-gray-700': pane == 'editor' }"
          >
            Editor
          </div>
          <div
            class="transition-all duration-75 rounded-t-md bg-gray-500 hover:bg-gray-700 cursor-pointer text-white py-1 px-3 shadow-inner mr-auto"
            @click="pane = 'testcases'"
            :class="{ 'bg-gray-700': pane == 'testcases' }"
          >
            Test case
          </div>
          <button
            class="transition-all duration-75 mr-1 rounded-t-md p-1 px-3 font-medium bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white shadow-md"
          >
            Testo dell'esercizio
          </button>
          <button
            @click="fakeSubmission()"
            :disabled="submitCooldown != 0"
            class="w-40 transition-all disabled:opacity-50 duration-75 rounded-t-md p-1 px-3 font-medium bg-green-600 hover:bg-green-700 cursor-pointer text-white shadow-md"
          >
            <i v-show="submitCooldown == 0" class="fas fa-chevron-right"></i>
            {{ !submitCooldown ? "Esegui codice" : submitCooldown }}
          </button>
        </div>
        <div v-show="pane == 'editor'">
          <AceEditor
            class="rounded-b-lg"
            id="editor-el"
            v-model="code"
            @init="editorInit"
            lang="javascript"
            theme="monokai"
            width="100%"
            :height="editorHeight"
            :options="editorOptions"
          />
        </div>
        <div
          :style="'height:' + editorHeight"
          class="border overflow-auto border-transparent bg-gray-200 rounded-b-lg"
          v-show="pane == 'testcases'"
        >
          <div
            class="bg-yellow-600 text-gray-200 font-medium rounded-xl p-4 m-2 shadow-md"
          >
            <i class="fas fa-eye-slash mr-2"></i> Il tuo codice potrebbe essere
            eseguito anche con test case non presenti in questa lista.
          </div>
          <div v-for="(testcase, index) in testcases" :key="index">
            <TestCase :testcase="testcase" :index="index + 1"></TestCase>
          </div>
        </div>
      </div>

      <!-- submissions sidebar -->
      <div
        class="md:ml-3 w-full lg:w-2/5 bg-gray-200 border rounded-lg shadow-md"
      >
        <h3 class="bg-gray-800 font-medium p-2 rounded-t-lg text-white text-xl">
          Sottomissioni
        </h3>
        <!-- fake submission for loading -->
        <div
          v-show="processingSubmission"
          class="flex m-2 mb-0 p-3 opacity-50 bg-gray-400 rounded-md shadow-md text-black text-shadow-lg"
        >
          <svg
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path></svg
          >Valutazione codice in corso...
        </div>
        <div class="overflow-auto">
          <div
            class=""
            v-for="(submission, index) in submissions"
            :key="submission"
          >
            <Submission
              :canBeTurnedIn="submission.is_eligible && !index"
              :index="submissions.length - index"
              :submission="submission"
            ></Submission>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AceEditor from "vuejs-ace-editor";
import Submission from "../components/Submission.vue";
import TestCase from "../components/TestCase.vue";
export default {
  name: "Editor",
  components: { AceEditor, Submission, TestCase },
  props: {
    // exerciseText: String,
    // testcases: Array,
  },
  mounted() {
    this.testcases = [
      {
        parameters: "1, 2",
        output: 2,
        is_public: true,
        passed: true,
      },
      {
        parameters: "-1, 0",
        output: -1,
        is_public: true,
        passed: false,
      },
      {
        parameters: "1, 2",
        output: 2,
        is_public: true,
        passed: true,
      },
      {
        parameters: "-1, 0",
        output: -1,
        is_public: true,
        passed: false,
      },
    ];

    // set the editor height to approximately 70% of parent height
    this.editorHeight = this.$parent.$refs.app.clientHeight / 1.4 + "px";

    // set editor options asynchronously because the editor height isn't known at create time
    // and without doing this the font size gets screwed up for some reason
    setTimeout(
      () =>
        (this.editorOptions = {
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          fontSize: 17,
          highlightActiveLine: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2,
          showPrintMargin: false,
          showGutter: true,
        })
    );
  },
  data() {
    return {
      testcases: [],
      assignmentText: "",
      editorElement: document.getElementById("app"),
      editorHeight: null,
      code: "",
      submitCooldown: 0,
      submitCooldownHandle: null,
      editorOptions: {},
      processingSubmission: false,
      submissions: [
        // {
        //   id: 1,
        //   user: 2,
        //   code: "function max(a,b) { return a>b?a:b }",
        //   timestamp: "2021-03-05T21:54:23.744126Z",
        //   is_eligible: false,
        //   has_been_turned_in: false,
        //   public_details: {
        //     1: {
        //       parameters: ["1", "2"],
        //       output: 2,
        //       is_public: true,
        //       passed: false,
        //     },
        //     3: {
        //       parameters: ["-1", "0"],
        //       output: 0,
        //       is_public: true,
        //       passed: false,
        //     },
        //     failed_secret_tests: 1,
        //   },
        // },
      ],
      pane: "editor",
    };
  },
  methods: {
    fakeSubmission() {
      this.submitCooldown = 10;
      this.submitCooldownHandle = setInterval(() => {
        this.submitCooldown--;
        if (!this.submitCooldown) {
          clearInterval(this.submitCooldownHandle);
          this.submitCooldownHandle = null;
        }
      }, 1000);
      this.processingSubmission = true;
      setTimeout(() => {
        this.submissions.unshift({
          id: Math.random(),
          user: 2,
          code: "function max(a,b) { return a>b?a:b }",
          timestamp: "2021-03-05T21:54:23.744126Z",
          is_eligible: Math.random() > 0.5,
          has_been_turned_in: false,
          public_details: {
            1: {
              parameters: "1, 2",
              output: 2,
              is_public: true,
              passed: true,
            },
            3: {
              parameters: "-1, 0",
              output: -1,
              is_public: true,
              passed: false,
            },
            failed_secret_tests: 0,
          },
        });
        this.processingSubmission = false;
      }, 2000);
    },
    editorInit: function () {
      require("brace/ext/language_tools"); //language extension prerequsite...
      require("brace/mode/html");
      require("brace/mode/javascript"); //language
      require("brace/mode/less");
      require("brace/theme/monokai");
      require("brace/snippets/javascript"); //snippet
    },
  },
};
</script>
<style>
.ace_scroller.ace_scroll-left {
  box-shadow: 10px 0 10px -10px rgb(0 0 0 / 20%) inset;
}
</style>