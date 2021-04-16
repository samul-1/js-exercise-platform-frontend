<template>
  <transition name="fade">
    <div class="absolute z-10 -top-10 left-1/2" style="max-width: 800px">
      <div
        class="relative px-10 py-8 overflow-auto border rounded-md bg-gray-50 huge-shadow -left-1/2"
      >
        <button @click="$emit('closePreview')" class="absolute top-0 right-2">
          <i class="text-xs text-red-500 fas fa-times"></i>
        </button>

        <vue-mathjax :formula="text" :safe="false"></vue-mathjax>
      </div>
    </div>
  </transition>
</template>

<script>
import { VueMathjax } from 'vue-mathjax'

export default {
  name: 'LaTexPreview',
  props: ['text'],
  components: {
    'vue-mathjax': VueMathjax
  }
}
</script>

<style>
.huge-shadow {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.45);
}
</style>
