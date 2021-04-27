<template>
  <div class="grid grid-cols-5 mt-2">
    <div class="col-span-4">
      <AceEditor
        class="h-full rounded-md"
        :value="testcase.assertion"
        @input="update('assertion', $event)"
        @init="editorInit"
        lang="javascript"
        theme="monokai"
        width="100%"
        height="50px"
        :options="aceEditorOptions"
      />
    </div>
    <div class="self-center ml-auto">
      <input
        type="checkbox"
        class="cursor-pointer"
        :checked="testcase.is_public"
        :id="testcase.id + '-public-check'"
        @input="update('is_public', $event.target.checked)"
      />

      <label
        :for="testcase.id + '-public-check'"
        class="mx-1 cursor-pointer select-none"
        >Test case pubblico</label
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
import AceEditor from 'vuejs-ace-editor'
import { aceEditorOptions, editorInit } from '../constants'

export default {
  name: 'TestCaseEditor',
  components: {
    AceEditor
  },
  props: ['id'],
  created () {
    this.testcase = this.$attrs.value
  },
  data () {
    return {
      aceEditorOptions,
      testcase: { id: null, assertion: '', is_public: true }
    }
  },
  methods: {
    editorInit,
    update (key, value) {
      this.testcase[key] = value
      this.$emit('input', { ...this.testcase, [key]: value })
    }
  }
}
</script>

<style></style>
