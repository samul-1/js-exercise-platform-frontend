<template>
  <div
    class="fixed z-50 spinner"
    :class="{
      'bg-gray-400  bg-opacity-90 shadow-xl rounded-lg px-6 py-10 flex text-gray-100': loadingMessage
    }"
    style="top:50%; left:50%; transform: translate(-50%,-50%); filter: drop-shadow(1px 2px 4px rgba(0,0,0,0.3));"
  >
    <svg
      class="w-8 h-8 mr-3 -ml-1 spinner-inner animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-40"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-100"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <p v-if="loadingMessage" v-html="loadingMessage"></p>
  </div>
</template>

<script>
export default {
  name: 'Spinner',
  props: {
    loadingMessage: {
      type: String,
      default: ''
    }
  }
}
</script>

<style>
.spinner {
  mix-blend-mode: luminosity;
}

.spinner-inner {
  color: rgb(68, 68, 75);
}
</style>
