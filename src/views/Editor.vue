<template>
  <div id="editor-view" ref="editorView" class="my-5 px-1">
    <!-- <div class="p-2 bg-gray-100 rounded-lg shadow-sm">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam
        pariatur laboriosam eius. Vero provident vitae recusandae perferendis et
        fugit eligendi dolorem obcaecati in sint! Totam quam aspernatur cum
        culpa ea esse impedit, libero, delectus quas praesentium, repudiandae
        perferendis pariatur tenetur dolorum error. Temporibus excepturi id
        reprehenderit! Quod, impedit error! Est.
      </p>
    </div>-->
    <div class="flex mt-5 w-full flex-wrap md:flex-nowrap">
      <div class="w-full lg:w-3/5 h-full border border-gray-200 rounded-t-lg">
        <div class="flex bg-gray-800 rounded-t-lg">
          <div
            class="bg-gray-400 hover:bg-gray-600 cursor-pointer text-white rounded-t-md py-1 px-3 mr-1 shadow-inner"
            @click="pane = 'editor'"
            :class="{ 'bg-gray-600': pane == 'editor' }"
          >
            Editor
          </div>
          <div
            class="rounded-t-md bg-gray-400 hover:bg-gray-600 cursor-pointer text-white py-1 px-3 shadow-inner mr-auto"
            @click="pane = 'testcases'"
            :class="{ 'bg-gray-600': pane == 'testcases' }"
          >
            Test case
          </div>
          <button
            class="mr-1 rounded-t-md p-1 px-3 font-medium bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white shadow-md"
          >
            Mostra testo dell'esercizio
          </button>
          <button
            class="rounded-t-md p-1 px-3 font-medium bg-green-600 hover:bg-green-700 cursor-pointer text-white shadow-md"
          >
            <i class="fas fa-chevron-right"></i> Esegui codice
          </button>
        </div>
        <div v-show="pane == 'editor'">
          <AceEditor
            v-model="content"
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
          class="border border-gray-400"
          v-show="pane == 'testcases'"
        >
          <p>Test case</p>
        </div>
      </div>
      <div
        class="md:ml-3 w-full lg:w-2/5 bg-gray-200 border rounded-lg shadow-md"
      >
        <h3 class="bg-gray-800 font-medium p-2 rounded-t-lg text-white text-xl">
          Sottomissioni
        </h3>
        <div v-for="(submission, index) in submissions" :key="index">
          <Submission :index="index + 1" :submission="submission"></Submission>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AceEditor from "vuejs-ace-editor";
import Submission from "../components/Submission.vue";

export default {
  name: "Editor",
  components: { AceEditor, Submission },
  props: {
    exerciseText: String,
    testCases: Array,
  },
  mounted() {
    // set the editor height to approximately 70% of parent height
    this.editorHeight = this.$parent.$refs.app.clientHeight / 1.4 + "px";

    // set editor options asynchronously because the editor height isn't known at create time
    // and without doing this the font size gets screwed up for some reason
    setTimeout(
      () =>
        (this.editorOptions = {
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          fontSize: 18,
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
      editorElement: document.getElementById("app"),
      editorHeight: null,
      code: "",
      editorOptions: {},
      submissions: [
        {
          id: 1,
          user: 2,
          code: "function max(a,b) { return a>b?a:b }",
          timestamp: "2021-03-05T21:54:23.744126Z",
          is_eligible: true,
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
        },
        {
          id: 1,
          user: 2,
          code: "function max(a,b) { return a>b?a:b }",
          timestamp: "2021-03-05T21:54:23.744126Z",
          is_eligible: false,
          has_been_turned_in: false,
          public_details: {
            1: {
              parameters: ["1", "2"],
              output: 2,
              is_public: true,
              passed: false,
            },
            3: {
              parameters: ["-1", "0"],
              output: 0,
              is_public: true,
              passed: false,
            },
            failed_secret_tests: 1,
          },
        },
      ],
      pane: "editor",
    };
  },
  methods: {
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
