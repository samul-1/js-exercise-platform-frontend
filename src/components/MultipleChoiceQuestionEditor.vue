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
      <h2 class="my-2 text-lg">Testo della domanda</h2>
      <VueEditor
        class="tall"
        :value="question.text"
        @input="update('text', $event)"
        :id="question.id + '-text-editor'"
        :editor-toolbar="toolbar"
      ></VueEditor>
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

export default {
  name: 'MultipleChoiceQuestionEditor',
  components: {
    VueEditor,
    AnswerEditor
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
      }
    }
  },
  methods: {
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

<style></style>
