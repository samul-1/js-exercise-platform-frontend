<template>
  <div class="grid my-8 mt-2 md:grid-cols-5 md:my-2">
    <div class="col-span-4">
      <CodeEditor
        :small="true"
        :value="testcase.assertion"
        @input="update('assertion', $event)"
      ></CodeEditor>
    </div>
    <div class="self-center mt-1 md:mt-0 md:ml-auto">
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
import CodeEditor from '../components/CodeEditor.vue'
export default {
  name: 'TestCaseEditor',
  components: {
    CodeEditor
  },
  props: {
    id: {
      type: [String, Number]
    }
  },
  created () {
    this.testcase = this.$attrs.value
  },
  data () {
    return {
      testcase: { id: null, assertion: '', is_public: true }
    }
  },
  methods: {
    update (key, value) {
      this.testcase[key] = value
      this.$emit('input', { ...this.testcase, [key]: value })
    }
  }
}
</script>

<style></style>
