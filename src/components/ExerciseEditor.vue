<template>
  <div
    class="relative px-10 py-5 mt-2 mb-6 transition-shadow duration-300 transform border border-gray-200 rounded-lg shadow-sm hover:shadow-lg"
  >
    <div class="absolute right-10">
      <button
        @click="$emit('delete')"
        class="py-1.5 px-2.5 text-xs text-white shadow-inner bg-red-700 rounded-lg disabled:opacity-50"
      >
        <i class="fas fa-trash"></i>
      </button>
    </div>
    <div class="mb-4">
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
        <h2 class="my-2 text-lg">Testo dell'esercizio</h2>
        <VueEditor
          class="tall"
          :value="exercise.text"
          @input="update('text', $event)"
          :id="exercise.id + '-text-editor'"
          :editor-toolbar="toolbar"
        ></VueEditor>
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
      <div class="relative flex flex-row w-32 h-full bg-transparent rounded-lg">
        <button
          @click="
            exercise.min_passing_testcases--
            update('min_passing_testcases', exercise.min_passing_testcases)
          "
          :disabled="exercise.min_passing_testcases <= 0"
          class="w-20 h-full text-white transition-colors duration-75 bg-gray-800 rounded-l-lg outline-none cursor-pointer disabled:opacity-80 focus:outline-none hover:bg-gray-900"
        >
          <span class="m-auto text-2xl font-thin">−</span>
        </button>
        <input
          type="number"
          class="flex items-center w-16 font-medium text-center text-gray-900 bg-gray-300 outline-none focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default"
          :class="{
            'bg-red-400':
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
          class="w-20 h-full text-white transition-colors duration-75 bg-gray-800 rounded-r-lg outline-none cursor-pointer disabled:opacity-80 focus:outline-none hover:bg-gray-900"
        >
          <span class="m-auto text-2xl font-thin">+</span>
        </button>
      </div>
    </div>
    <div class="flex mt-2">
      <h2 class="mr-4 text-lg">Test case</h2>
      <button
        @click="exercise.testcases.unshift(newTestCase())"
        class="px-3 text-sm text-white bg-indigo-700 rounded-md shadow-sm"
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
</template>

<script>
import { uuid } from 'vue-uuid'
import { VueEditor } from 'vue2-editor'
import AceEditor from 'vuejs-ace-editor'
import TestCaseEditor from '../components/TestCaseEditor.vue'
import { aceEditorOptions, toolbar, editorInit } from '../constants.js'

export default {
  name: 'ExerciseEditor',
  components: {
    VueEditor,
    AceEditor,
    TestCaseEditor
  },
  created () {
    //this.exercise.uuid = this.id
    this.exercise.testcases.unshift(this.newTestCase())
    // ? might need to investigate this
    this.exercise = this.$attrs.value
  },
  props: ['id', 'categoryChoices'],
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
      }
    }
  },
  methods: {
    editorInit,
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
  }
}
</script>
