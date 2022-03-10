<template>
  <div :class="{ 'overflow-hidden rounded-t-lg': !standalone }">
    <MonacoEditor
      :style="'height:' + height"
      class="w-full"
      :value="value"
      @change="$emit('input', $event)"
      theme="vs-dark"
      language="typescript"
      :options="monacoOptions"
    />
  </div>
</template>

<script>
import MonacoEditor from "vue-monaco";

export default {
  name: "CodeEditor",
  props: {
    value: { type: String },
    small: { type: Boolean, default: false },
    height: { type: String, default: "60px" },
    standalone: { type: Boolean, default: false },
  },
  components: {
    MonacoEditor,
  },
  data() {
    return {
      monacoOptions: {
        quickSuggestions: false,
        //renderLineHighlight: 'none',
        minimap: {
          enabled: !this.small,
          scale: 1.5,
          renderCharacters: false,
          size: "fill",
        },
        lineNumbersMinChars: this.small ? 2 : 3,
      },
    };
  },
  methods: {
    update(event) {
      console.log(event);
      this.$emit("input", event);
    },
  },
};
</script>

<style>
.monaco-editor .suggest-widget {
  opacity: 0;
}

.visible {
  opacity: 100% !important;
  visibility: visible !important;
}

.overflow-guard,
.monaco-editor {
  /* monaco editor inner container */
  border-bottom-left-radius: 0.5rem !important;
  border-bottom-right-radius: 0.5rem !important;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}
</style>
