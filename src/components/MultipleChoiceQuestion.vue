<template>
  <div class="text-lg">
    <div class="mb-10">{{ question.text }}</div>
    <div v-for="answer in question.answers" :key="answer.id" class="my-1">
      <input
        type="radio"
        :id="'ans-' + answer.id"
        :value="answer.id"
        v-model="selected"
        class="mr-1"
      />
      <label :for="'ans-' + answer.id">{{ answer.text }}</label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MultipleChoiceQuestion',
  props: ['question'],
  watch: {
    selected (newValue) {
      this.$emit('answer', newValue)
    }
  },
  data () {
    return {
      selected: null
    }
  }
}
</script>

<style></style>
