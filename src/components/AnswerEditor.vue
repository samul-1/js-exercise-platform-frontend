<template>
  <div class="relative flex mt-2">
    <div class="w-4/5">
      <la-tex-preview
        v-show="selection.length"
        :text="selection"
        @closePreview="selection = ''"
      ></la-tex-preview>
      <div class="tex2jax_ignore">
        <VueEditor
          class="tall"
          :value="answer.text"
          @input="update('text', $event)"
          :id="answer.id + '-text-editor'"
          :ref="answer.id + '-text-editor'"
          @selection-change="setPreview($event)"
          :editor-toolbar="toolbar"
        ></VueEditor>
      </div>
    </div>

    <div class="self-center ml-auto">
      <input
        type="checkbox"
        class="cursor-pointer"
        :checked="answer.is_right_answer"
        :id="answer.id + '-right-check'"
        @input="update('is_right_answer', $event.target.checked)"
      />

      <label
        :for="answer.id + '-right-check'"
        class="mx-1 cursor-pointer select-none"
        >Risposta corretta</label
      >

      <button
        @click="$emit('delete')"
        class="ml-4 py-1.5 px-2.5 text-xs text-white shadow-inner bg-red-700 rounded-lg"
      >
        <i class="fas fa-trash"></i>
      </button>
    </div>
  </div>
</template>

<script>
import LaTexPreview from '../components/LaTexPreview.vue'
import { toolbar } from '../constants'
import { VueEditor } from 'vue2-editor'
export default {
  name: 'AnswerEditor',
  created () {
    this.answer = this.$attrs.value
  },
  components: {
    VueEditor,
    LaTexPreview
  },
  data () {
    return {
      toolbar,
      answer: {
        id: null,
        text: '',
        is_right_answer: false
      },
      selection: ''
    }
  },
  methods: {
    update (key, value) {
      //console.log(value);
      this.answer[key] = value
      this.$emit('input', { ...this.answer, [key]: value })
    },
    setPreview (event) {
      console.log(event)
      const editor = this.$refs[this.answer.id + '-text-editor']
      const range = editor.quill.getSelection()
      console.log(editor.quill.getText(range.index, range.length))
      console.log(editor)
      this.selection = editor.quill.getText(range.index, range.length)
    }
  }
}
</script>

<style></style>
