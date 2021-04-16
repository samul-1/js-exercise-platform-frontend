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
        @change="update('category', question.category)"
        v-model="question.category"
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
      <div class="flex">
        <h2 class="my-2 text-lg">Testo della domanda</h2>
        <div class="my-auto ml-auto text-xs">
          <div
            class="mr-1 w-5 h-5 px-1.5 py-0.5 my-auto bg-yellow-500 rounded-full"
          >
            <i class="far fa-lightbulb fa-inverse"></i>
          </div>
        </div>

        <p class="my-auto text-sm text-gray-600">
          Evidenzia il codice LaTeX per vederne l'anteprima
        </p>
        <p></p>
      </div>
      <la-tex-preview
        v-show="selection.length"
        :text="selection"
        @closePreview="selection = ''"
      ></la-tex-preview>
      <div class="tex2jax_ignore">
        <VueEditor
          class="tall"
          :value="question.text"
          @input="update('text', $event)"
          :id="question.id + '-text-editor'"
          :editor-toolbar="toolbar"
          @selection-change="setPreview($event)"
          :ref="question.id + '-text-editor'"
        ></VueEditor>
      </div>
    </div>

    <div class="flex mt-2">
      <h2 class="mr-4 text-lg">Risposte</h2>
      <button
        @click="question.answers.unshift(newAnswer())"
        class="px-3 text-sm text-white bg-indigo-700 rounded-md shadow-sm"
      >
        <i class="fas fa-plus-circle"></i> Aggiungi
      </button>
    </div>
    <div>
      <transition-group name="bounce">
        <AnswerEditor
          v-for="(answer, index) in question.answers"
          :key="answer.id"
          :id="answer.id"
          v-model="question.answers[index]"
          @delete="question.answers.splice(index, 1)"
          @input="updateDeep('answers', index, $event)"
        ></AnswerEditor>
      </transition-group>
    </div>
  </div>
</template>

<script>
import { toolbar } from '../constants.js'
import { VueEditor } from 'vue2-editor'
import AnswerEditor from '../components/AnswerEditor.vue'
import { uuid } from 'vue-uuid'
import LaTexPreview from '../components/LaTexPreview.vue'
export default {
  name: 'MultipleChoiceQuestionEditor',
  components: {
    VueEditor,
    AnswerEditor,
    LaTexPreview
  },
  props: ['categoryChoices'],
  created () {
    this.question = this.$attrs.value
  },
  data () {
    return {
      toolbar,
      question: {
        id: null,
        text: '',
        answers: []
      },
      selection: ''
    }
  },
  methods: {
    setPreview (event) {
      console.log(event)
      const editor = this.$refs[this.question.id + '-text-editor']
      const range = editor.quill.getSelection()
      console.log(editor.quill.getText(range.index, range.length))
      console.log(editor)
      this.selection = editor.quill.getText(range.index, range.length)
    },
    update (key, value) {
      // updates supplied key with supplied value; emits change to parent component

      this.question[key] = value
      this.$emit('input', { ...this.question, [key]: value })
    },
    updateDeep (key, index, value) {
      // updates supplied key in array item at supplied index with supplied value;
      // emits change to parent component

      this.question[key][index] = value
      const arr = this.question[key]
      arr[index] = value
      this.$emit('input', { ...this.question, [key]: arr })
    },
    newAnswer () {
      // returns a new empty answer with unique id

      //const id = Math.ceil(Math.random() * (100000 - 80000) + 80000)
      const id = uuid.v4()

      return {
        id,
        stripId: true, // indicate this id is only for local identification and needs to be stripped off when submitting to backend
        text: '',
        is_right_answer: false
      }
    }
  }
}
</script>

<style>
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active,
.fade-leave {
  transition: 0.25s opacity ease-out;
}
</style>
