<template>
  <div
    class="w-full h-4 rounded-lg bg-gradient-to-tl from-gray-100 to-gray-200"
  >
    <div
      class="h-4 rounded-lg"
      :class="{
        'bg-red-400': widthAsPercentage < 45,
        'bg-yellow-400': widthAsPercentage >= 45 && widthAsPercentage <= 50,
        'bg-green-400': widthAsPercentage > 50
      }"
      :style="'width:' + widthAsPercentage + '%;'"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'ProgressBar',
  props: {
    value: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  computed: {
    widthAsPercentage () {
      return (this.value * 100) / this.max
    }
  }
}
</script>

<style></style>
