<template>
  <div
    class="relative px-2 py-5 mt-2 mb-6 transition-shadow duration-300 transform border border-gray-300 rounded-lg shadow-sm md:px-10 hover:shadow-lg"
  >
    <div class="absolute md:right-10 right-4">
      <button
        class="px-2 py-1 mr-2 text-sm text-gray-900 bg-gray-200 border border-gray-900 rounded-lg shadow-inner disabled:opacity-50"
        @click="$emit('toggleExpand')"
      >
        <i
          class="fas"
          :class="{ 'fa-expand-alt': !expanded, 'fa-compress-alt': expanded }"
        ></i>
      </button>
      <button
        @click="$emit('delete')"
        class="pt-2 pb-1.5 px-2.5 text-xs text-white shadow-inner bg-red-700 rounded-lg disabled:opacity-50"
      >
        <i class="fas fa-trash"></i>
      </button>
    </div>
    <div class="mb-6">
      <h1 class="text-xl font-medium">
        <span :class="{ 'text-red-600': !categoryName }"
          >{{ categoryName ? '' : 'Senza '
          }}{{
            categoryName.slice(0, 9).toLowerCase() == 'categoria'
              ? ''
              : 'categoria'
          }}
          {{ categoryName ? categoryName : '' }}</span
        >
        <span v-if="categoryName"> esercizio {{ index }}</span>
      </h1>
    </div>
    <ul v-if="errors" class="flex flex-col mb-4 -mt-2 md:flex-row md:space-x-4">
      <li v-for="(error, index) in errors" :key="exercise.id + '-err-' + index">
        <p class="text-sm text-red-500"><strong>&#183;</strong> {{ error }}</p>
      </li>
    </ul>
    <div v-show="!expanded">
      <div v-html="exerciseTextPreview"></div>
    </div>
    <div v-if="expanded">
      <div class="mb-1">
        <span class="mr-2">Categoria</span>
        <select
          class="p-1 border rounded-md"
          @change="update('category', exercise.category)"
          v-model="exercise.category"
        >
          <option :value="null" selected disabled>Seleziona categoria</option>

          <option
            v-for="category in categoryChoices"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2">
        <div class="mr-4">
          <div class="flex">
            <h2 class="my-2 text-lg">Testo dell'esercizio</h2>
            <div class="my-auto ml-auto text-xs">
              <!--<div
                class="mr-1 w-5 h-5 px-1.5 py-0.5 my-auto bg-yellow-500 rounded-full"
              >
                <i class="far fa-lightbulb fa-inverse"></i>
              </div>-->
            </div>

            <p class="my-auto text-xs text-gray-600">
              Evidenzia il codice LaTeX per vederne l'anteprima
            </p>
            <p></p>
          </div>

          <la-tex-preview
            v-show="selection.length"
            :text="selection"
            @closePreview="selection = ''"
          ></la-tex-preview>
          <div
            class="tex2jax_ignore"
            :class="{ 'bg-gray-100 opacity-80 relative': !exercise.category }"
          >
            <div v-if="!exercise.category" class="absolute top-1/2 left-1/2">
              <p class="relative text-gray-600 -left-1/2">
                Per prima cosa, scegli una categoria
              </p>
            </div>
            <VueEditor
              class="tall"
              :value="exercise.text"
              @input="update('text', $event)"
              :id="exercise.id + '-text-editor'"
              :ref="exercise.id + '-text-editor'"
              :editor-toolbar="toolbar"
              :disabled="!exercise.category"
              @selection-change="setPreview($event)"
            ></VueEditor>
          </div>
        </div>
        <div>
          <h2 class="my-2 text-lg">Codice iniziale</h2>
          <CodeEditor
            :height="'150px'"
            :value="exercise.starting_code"
            @input="update('starting_code', $event)"
            theme="vs-dark"
            language="javascript"
          ></CodeEditor>
        </div>
        <div class="mt-2">
          <div class="flex space-x-2">
            <h2 class="my-2 text-lg">Soluzione</h2>
            <button
              @click="testSolution()"
              class="px-3 py-1 my-auto mr-auto text-sm text-white bg-green-700 rounded-md shadow-sm"
            >
              <i class="fas fa-chevron-right"></i> Testa
            </button>
          </div>
          <CodeEditor
            :height="'256px'"
            style="width: 97.5%"
            :value="exercise.solution"
            @input="update('solution', $event)"
            theme="vs-dark"
            language="javascript"
          ></CodeEditor>
        </div>
        <div class="flex flex-col mt-10 overflow-y-auto max-h-64">
          <Submission
            v-for="(submission, index) in submissions"
            :key="'s-' + index"
            :submission="submission"
          ></Submission>
        </div>
      </div>
      <div class="flex my-4">
        <p class="my-auto mr-4">
          Numero minimo di test case superati per poter consegnare
        </p>
        <div
          class="relative flex flex-row w-32 h-full bg-transparent rounded-lg"
        >
          <button
            @click="
              exercise.min_passing_testcases--
              update('min_passing_testcases', exercise.min_passing_testcases)
            "
            :disabled="exercise.min_passing_testcases <= 0"
            class="w-20 h-full text-white transition-colors duration-75 bg-gray-500 rounded-l-lg outline-none cursor-pointer disabled:opacity-60 focus:outline-none hover:bg-gray-600"
          >
            <span class="m-auto text-2xl font-thin">−</span>
          </button>
          <input
            type="number"
            class="flex items-center w-16 font-medium text-center text-gray-900 bg-gray-200 outline-none focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default"
            :class="{
              'bg-red-300':
                exercise.min_passing_testcases < 0 ||
                exercise.min_passing_testcases > exercise.testcases.length
            }"
            :value="exercise.min_passing_testcases"
            @input="update('min_passing_testcases', $event.target.value)"
          />
          <button
            :disabled="
              exercise.min_passing_testcases >= exercise.testcases.length
            "
            @click="
              exercise.min_passing_testcases++
              update('min_passing_testcases', exercise.min_passing_testcases)
            "
            class="w-20 h-full text-white transition-colors duration-75 bg-gray-500 rounded-r-lg outline-none cursor-pointer disabled:opacity-60 focus:outline-none hover:bg-gray-600"
          >
            <span class="m-auto text-2xl font-thin">+</span>
          </button>
        </div>
      </div>
      <div class="flex mt-2">
        <h2 class="mr-4 text-lg">Test case</h2>
        <button
          @click="exercise.testcases.unshift(newTestCase())"
          class="px-3 text-sm text-white bg-green-700 rounded-md shadow-sm"
        >
          <i class="fas fa-plus-circle"></i> Aggiungi
        </button>
      </div>
      <div>
        <transition-group name="bounce">
          <TestCaseEditor
            v-for="(testcase, index) in exercise.testcases"
            :key="testcase.id"
            :id="testcase.id"
            v-model="exercise.testcases[index]"
            @delete="exercise.testcases.splice(index, 1)"
            @input="updateDeep('testcases', index, $event)"
          ></TestCaseEditor>
        </transition-group>
      </div>
    </div>
    <!-- <Dialog
      v-if="testSubmission"
      @yes="testSubmission = null"
      :confirmOnly="true"
      :dismissible="true"
    >
      <Submission :submission="testSubmission"></Submission>
    </Dialog> -->
  </div>
</template>

<script>
import axios from 'axios'
import { uuid } from 'vue-uuid'
import { VueEditor } from 'vue2-editor'
import CodeEditor from '../components/CodeEditor.vue'
import TestCaseEditor from '../components/TestCaseEditor.vue'
import { toolbar } from '../constants.js'
import LaTexPreview from '../components/LaTexPreview.vue'
import { highlightCode } from '../constants.js'
import { renderTex } from '../utility'
//import Dialog from './Dialog.vue'
import Submission from './Submission.vue'
export default {
  name: 'ExerciseEditor',
  components: {
    VueEditor,
    //AceEditor,
    CodeEditor,
    TestCaseEditor,
    LaTexPreview,
    //Dialog,
    Submission
    //MonacoEditor
  },
  created () {
    //this.exercise.uuid = this.id
    this.exercise.testcases.unshift(this.newTestCase())
    // ? might need to investigate this
    this.exercise = this.$attrs.value
  },
  props: {
    //id: { type: [Number, String] },
    categoryChoices: { type: Array },
    index: { type: Number },
    expanded: { type: Boolean },
    errors: {
      type: Array
    }
  },
  watch: {
    $props: {
      handler () {
        if (!this.expanded) {
          // render LaTeX code
          renderTex()
        }
      },
      deep: true,
      immediate: true
    }
  },
  data () {
    return {
      toolbar,
      exercise: {
        id: null,
        text: '',
        starting_code: '',
        solution: '',
        min_passing_testcases: 1,
        testcases: [],
        category: null
      },
      selection: '',
      submissions: []
    }
  },
  methods: {
    highlightCode,
    //editorInit,
    setPreview (event) {
      console.log(event)
      const editor = this.$refs[this.exercise.id + '-text-editor']
      const range = editor.quill.getSelection()
      console.log(editor.quill.getText(range.index, range.length))
      console.log(editor)
      this.selection = editor.quill.getText(range.index, range.length)
    },
    testSolution () {
      axios
        .post('/exams/test_submission/', {
          code: this.exercise.solution,
          testcases: this.strippedIdTestCases
        })
        .then(response => {
          console.log(response)
          this.submissions.unshift(response.data)
        })
        .catch(error => {
          console.log(error)
          throw error
        })
        .finally(() => {
          // this.loading = false
          // this.loadingMessage = ''
        })
    },
    update (key, value) {
      console.log(value)
      // updates supplied key with supplied value; emits change to parent component

      this.exercise[key] = value
      this.$emit('input', { ...this.exercise, [key]: value })
    },
    updateDeep (key, index, value) {
      // updates supplied key in array item at supplied index with supplied value;
      // emits change to parent component

      this.exercise[key][index] = value
      const arr = this.exercise[key]
      arr[index] = value
      this.$emit('input', { ...this.exercise, [key]: arr })
    },
    // ! move
    newTestCase () {
      // returns a new empty test case with unique id

      const id = uuid.v4()
      //const id = Math.ceil(Math.random() * (100000 - 80000) + 80000)
      return {
        id,
        stripId: true, // indicate this id is only for local identification and needs to be stripped off when submitting to backend
        assertion: '',
        is_public: true
      }
    }
  },
  computed: {
    categoryName () {
      return (
        this.categoryChoices.find(c => c.id === this.exercise.category)?.name ??
        ''
      )
    },
    exerciseTextPreview () {
      return this.highlightCode(
        this.exercise.text.replace(/<\/?[^>]+>/g, '').slice(0, 200) +
          (this.exercise.text.replace(/<\/?[^>]+>/g, '').length > 200
            ? '...'
            : '')
      )
    },
    strippedIdTestCases () {
      return this.exercise.testcases.map(({ stripId, id, ...rest }) => {
        return {
          ...(!stripId && { id: id }),
          ...rest
        }
      })
    }
  }
}
</script>
