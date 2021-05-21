<template>
  <div
    class="relative px-10 py-5 mt-2 mb-6 transition-shadow duration-300 transform border border-gray-300 rounded-lg shadow-sm hover:shadow-lg"
  >
    <div class="absolute right-10">
      <button
        class="mr-2 py-1.5 px-2.5 text-xs text-white shadow-inner bg-gray-600 rounded-lg disabled:opacity-50"
        @click="$emit('toggleExpand')"
      >
        <i class="fas fa-expand-alt"></i>
      </button>
      <button
        @click="$emit('delete')"
        class="py-1.5 px-2.5 text-xs text-white shadow-inner bg-red-700 rounded-lg disabled:opacity-50"
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
    <div v-show="!expanded">
      <div v-html="exerciseTextPreview"></div>
    </div>
    <div v-show="expanded">
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
          <AceEditor
            class="h-full rounded-md"
            :value="exercise.starting_code"
            @input="update('starting_code', $event)"
            @init="editorInit"
            lang="javascript"
            theme="monokai"
            width="100%"
            height="150px"
            :options="aceEditorOptions"
          />
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
            class="w-20 h-full text-white transition-colors duration-75 bg-gray-600 rounded-l-lg outline-none cursor-pointer disabled:opacity-60 focus:outline-none hover:bg-gray-700"
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
            class="w-20 h-full text-white transition-colors duration-75 bg-gray-600 rounded-r-lg outline-none cursor-pointer disabled:opacity-60 focus:outline-none hover:bg-gray-700"
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
  </div>
</template>

<script>
import { uuid } from 'vue-uuid'
import { VueEditor } from 'vue2-editor'
import AceEditor from 'vuejs-ace-editor'
import TestCaseEditor from '../components/TestCaseEditor.vue'
import { aceEditorOptions, toolbar, editorInit } from '../constants.js'
import LaTexPreview from '../components/LaTexPreview.vue'
import { highlightCode } from '../constants.js'
export default {
  name: 'ExerciseEditor',
  components: {
    VueEditor,
    AceEditor,
    TestCaseEditor,
    LaTexPreview
  },
  created () {
    //this.exercise.uuid = this.id
    this.exercise.testcases.unshift(this.newTestCase())
    // ? might need to investigate this
    this.exercise = this.$attrs.value
  },
  props: {
    id: { type: [Number, String] },
    categoryChoices: { type: Array },
    index: { type: Number },
    expanded: { type: Boolean }
  },
  watch: {
    $props: {
      handler () {
        if (!this.expanded) {
          // render LaTeX code
          setTimeout(
            () => window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub]),
            10
          )
        }
      },
      deep: true,
      immediate: true
    }
  },
  data () {
    return {
      aceEditorOptions,
      toolbar,
      exercise: {
        id: null,
        text: '',
        starting_code: '',
        min_passing_testcases: 1,
        testcases: [],
        category: null
      },
      selection: ''
    }
  },
  methods: {
    highlightCode,
    editorInit,
    setPreview (event) {
      console.log(event)
      const editor = this.$refs[this.exercise.id + '-text-editor']
      const range = editor.quill.getSelection()
      console.log(editor.quill.getText(range.index, range.length))
      console.log(editor)
      this.selection = editor.quill.getText(range.index, range.length)
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
    }
  }
}
</script>
