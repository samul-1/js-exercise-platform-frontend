<template>
    <div id="editor-view" ref="editorView" class="px-1 my-5">
        <!-- main editor block -->
        <div class="flex flex-wrap w-full mt-5 md:flex-nowrap">
            <div
                class="w-full h-full border border-gray-200 rounded-lg shadow-lg lg:w-3/5"
            >
                <div class="flex bg-gray-900 rounded-t-lg">
                    <div
                        class="px-3 py-1 mr-1 text-white transition-all duration-75 bg-gray-500 shadow-inner cursor-pointer hover:bg-gray-700 rounded-t-md"
                        @click="pane = 'editor'"
                        :class="{ 'bg-gray-700': pane == 'editor' }"
                    >
                        Editor
                    </div>
                    <div
                        class="px-3 py-1 mr-auto text-white transition-all duration-75 bg-gray-500 shadow-inner cursor-pointer rounded-t-md hover:bg-gray-700"
                        @click="pane = 'testcases'"
                        :class="{
                            'bg-gray-700': pane == 'testcases',
                        }"
                    >
                        Test case
                    </div>
                    <button
                        @click="pane = 'text'"
                        class="p-1 px-3 mr-1 font-medium text-white transition-all duration-75 bg-indigo-700 shadow-md cursor-pointer rounded-t-md hover:bg-indigo-800"
                        :class="{ 'bg-indigo-800': pane == 'text' }"
                    >
                        Testo dell'esercizio
                    </button>
                    <button
                        @click="submit()"
                        :disabled="
                            submitCooldown != 0 || !code.length
                        "
                        class="w-40 p-1 px-3 font-medium text-white transition-all duration-75 bg-green-600 shadow-md cursor-pointer disabled:opacity-50 rounded-t-md hover:bg-green-700"
                    >
                        <i
                            v-show="submitCooldown == 0"
                            class="fas fa-chevron-right"
                        ></i>
                        {{
                            !submitCooldown
                                ? 'Esegui codice'
                                : submitCooldown
                        }}
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
                    class="overflow-auto bg-gray-200 border border-transparent rounded-b-lg"
                    v-show="pane == 'testcases'"
                >
                    <div
                        class="p-4 m-2 font-medium text-gray-200 bg-yellow-600 shadow-md rounded-xl"
                    >
                        <i class="mr-2 fas fa-eye-slash"></i> Il tuo
                        codice potrebbe essere eseguito anche con test
                        case non presenti in questa lista.
                    </div>
                    <div
                        v-for="(testcase, index) in testcases"
                        :key="index"
                    >
                        <TestCase
                            :testcase="testcase"
                            :index="index + 1"
                        ></TestCase>
                    </div>
                </div>
                <div
                    :style="'height:' + editorHeight"
                    class="p-3 overflow-auto bg-gray-200 border border-transparent rounded-b-lg"
                    v-show="pane == 'text'"
                >
                    <h1 class="my-2 text-2xl font-medium">
                        {{ examName }}
                    </h1>
                    <div
                        v-if="!assignmentText.length"
                        class="animate-pulse"
                    >
                        <div class="py-1 space-y-2">
                            <div
                                class="w-3/4 h-4 py-2 bg-gray-300 rounded"
                            ></div>
                            <div class="space-y-2">
                                <div
                                    class="w-4/6 h-4 py-2 mt-2 mb-2 bg-gray-300 rounded"
                                ></div>
                                <div
                                    class="w-2/4 h-4 py-2 mt-4 mb-8 bg-gray-300 rounded"
                                ></div>
                                <div
                                    class="w-3/5 h-4 py-2 mt-4 bg-gray-300 rounded"
                                ></div>
                                <div
                                    class="w-4/6 h-4 py-2 mt-2 mb-2 bg-gray-300 rounded"
                                ></div>
                                <div
                                    class="w-3/4 h-4 py-2 mt-4 mb-8 bg-gray-300 rounded"
                                ></div>
                                <div
                                    class="w-4/6 h-4 py-2 mt-4 bg-gray-300 rounded"
                                ></div>
                            </div>
                        </div>
                    </div>
                    <div
                        v-else
                        v-highlight
                        v-html="processedAssignmentText"
                    ></div>
                </div>
            </div>
            <!-- submissions sidebar -->
            <div
                class="w-full bg-gray-200 border rounded-lg shadow-md md:ml-3 lg:w-2/5"
            >
                <h3
                    class="p-2 text-xl font-medium text-white bg-gray-800 rounded-t-lg"
                >
                    Sottomissioni
                </h3>
                <!-- fake submission for loading -->
                <div
                    v-show="processingSubmission"
                    class="flex p-3 m-2 mb-0 text-black bg-gray-300 rounded-md shadow-md opacity-50 text-shadow-lg"
                >
                    <svg
                        class="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
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
                        :key="submission.id"
                    >
                        <Submission
                            :canBeTurnedIn="
                                submission.is_eligible && !index
                            "
                            :index="submissions.length - index"
                            :submission="submission"
                            @turnIn="confirmTurnIn(submission.id)"
                        ></Submission>
                    </div>
                </div>
            </div>
        </div>
        <!--<transition name="bounce">-->
        <Dialog
            v-if="dialog.shown"
            :string="dialog.string"
            :subText="dialog.subText"
            :confirmOnly="dialog.confirmOnly"
            :severity="dialog.severity"
            @yes="dialog.onYes.function(dialog.onYes.param)"
            @no="dialog.onNo.function(dialog.onNo.param)"
        ></Dialog>
        <!--</transition>-->
    </div>
</template>

<script>
import axios from 'axios';
import AceEditor from 'vuejs-ace-editor';
import Submission from '../components/Submission.vue';
import TestCase from '../components/TestCase.vue';
import 'vue-code-highlight/themes/duotone-sea.css';
import Dialog from '../components/Dialog.vue';
export default {
    name: 'Editor',
    components: { AceEditor, Submission, TestCase, Dialog },

    props: {
        // exerciseText: String,
        // testcases: Array,
    },
    created() {
        this.getExam();
    },
    mounted() {
        // set the editor height to approximately 70% of parent height
        this.editorHeight =
            this.$parent.$refs.app.clientHeight / 1.4 + 'px';

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
            dialog: {
                shown: false,
            },
            examName: null,
            exerciseId: null,
            testcases: [],
            assignmentText: '',
            editorElement: document.getElementById('app'),
            editorHeight: null,
            code: '',
            submitCooldown: 0,
            submitCooldownHandle: null,
            editorOptions: {},
            processingSubmission: false,
            submissions: [],
            pane: 'text',
        };
    },
    methods: {
        getExam() {
            axios
                .get('/exams/my_exam')
                .then((response) => {
                    console.log(response);
                    this.testcases =
                        response.data.exercise.public_testcases;
                    this.exerciseId = response.data.exercise.id;
                    this.code = response.data.exercise.starting_code;
                    this.assignmentText = response.data.exercise.text;
                    this.submissions = response.data.submissions;
                    this.examName = response.data.name;
                })
                .catch((error) => {
                    if (error.response.status == 401) {
                        this.$router.push('/login');
                        this.$store.commit('removeToken');
                    } else {
                        this.$store.commit(
                            'setMessage',
                            error.response.data.message ??
                                error.message
                        );
                    }
                });
        },
        submit() {
            this.submitCooldown = 10;
            this.submitCooldownHandle = setInterval(() => {
                this.submitCooldown--;
                if (!this.submitCooldown) {
                    clearInterval(this.submitCooldownHandle);
                    this.submitCooldownHandle = null;
                }
            }, 1000);
            this.processingSubmission = true;
            axios
                .post(`/exercises/${this.exerciseId}/submissions/`, {
                    code: this.code,
                })
                .then((response) => {
                    console.log(response.data);
                    this.submissions.unshift(response.data);
                    this.processingSubmission = false;
                })
                .catch((error) => {
                    console.log(JSON.stringify(error));
                });
        },
        confirmTurnIn(id) {
            id;
            this.dialog = {
                shown: true,
                string: 'Sei sicuro di voler consegnare?',
                subText:
                    'Una volta confermata, la consegna non potrà più essere modificata.',
                confirmOnly: false,
                onYes: { function: this.turnIn, param: id },
                onNo: {
                    function: () => (this.dialog = { shown: false }),
                },
            };
        },
        turnIn(id) {
            this.dialog = { shown: false };
            console.log(id);
            axios
                .put(
                    `/exercises/${this.exerciseId}/submissions/${id}/turn_in/`,
                    {}
                )
                .then(() => {
                    this.$store.commit(
                        'setMessage',
                        'Consegna avvenuta con successo. Puoi chiudere questa pagina.'
                    );
                })
                .catch((error) => {
                    this.$store.commit(
                        'setMessage',
                        error.response.data.message ?? error.message
                    );
                    console.log(JSON.stringify(error));
                });
        },
        editorInit() {
            require('brace/ext/language_tools'); //language extension prerequsite...
            require('brace/mode/html');
            require('brace/mode/javascript'); //language
            require('brace/mode/less');
            require('brace/theme/monokai');
            require('brace/snippets/javascript'); //snippet
        },
    },
    computed: {
        processedAssignmentText() {
            // repaces `'s inside the assignment text with highlighted js code
            return this.assignmentText
                ?.replaceAll(
                    /```(.*)```/g,
                    `
        <div
        class="p-2 my-1 font-mono text-xs text-white break-all bg-gray-800 rounded-md shadow-sm"
        >
          <pre class=" language-javascript"><code class=" language-javascript">$1</code></pre>
        </div>
      `
                )
                ?.replaceAll(
                    /`(.*)`/g,
                    `
        <div
        class="inline-block p-1 font-mono text-xs text-white break-all bg-gray-800 rounded-md shadow-sm"
        >
          <pre style="line-height: 0.95; overflow-y: hidden" class=" language-javascript"><code style="line-height: 0.5" class=" language-javascript">$1</code></pre>
        </div>
      `
                );
        },
    },
};
</script>
<style>
.ace_scroller.ace_scroll-left {
    box-shadow: 10px 0 10px -10px rgb(0 0 0 / 20%) inset;
}
code[class*='language-'],
pre[class*='language-'] {
    padding: 0 !important;
    margin: 0 !important;
    white-space: pre-wrap;
    word-break: break-all;
}
</style>
