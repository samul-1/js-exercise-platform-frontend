<template>
  <div class="fixed top-0 left-0 flex items-center justify-center w-full h-full">
    <div class="absolute z-10 w-full h-full bg-gray-900 opacity-80"></div>

    <div class="z-20 w-3/5 px-10 py-10 bg-white rounded-lg shadow-md ">
      <div class="mb-10">
        <p class="mb-4 text-2xl">{{ string }}</p>
        <p class="mt-4 text-md">{{ subText }}</p>
      </div>
      <div class="flex mt-5">
        <button class="px-3 py-1 ml-auto mr-2 text-white bg-green-600 rounded-md " @click="$emit('yes')">{{ confirmOnly ? "Ok" : "Sì" }}</button>
        <button class="px-3 py-1 text-white bg-gray-900 rounded-md " @click="$emit('no')" v-if="!confirmOnly">No</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name: "Dialog",
    props: {
      string: String,
      subText: String,
      dismissable: Boolean,
      severity: Number,
      confirmOnly: Boolean,
    }
}
</script>

<style>

</style>