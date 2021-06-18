<template>
  <div class="px-10">
    <!--<h1 v-if="data.questions.length" class="text-3xl font-semibold">
      Simulazione domande
    </h1>
    <p class="mt-2">
      <i class="text-yellow-700 fas fa-exclamation-circle"></i> Nota: anche se
      le domande sono mostrate tutte insieme in questo documento, ricorda che
      allo studente verranno mostrate sequenzialmente, una alla volta.
    </p>-->
    <div
      class="py-2 my-2 border-b border-gray-300 last:border-b-0 atomic-box"
      v-for="(question, index) in data.questions"
      :key="'q-' + question.id"
    >
      <h1 class="text-2xl font-medium">Domanda {{ index + 1 }}</h1>
      <AggregatedQuestionIntroduction
        class="my-2"
        v-if="question.introduction"
        :text="question.introduction"
      ></AggregatedQuestionIntroduction>
      <Question :question="question" :preview="true"></Question>
      <!--<div class="html2pdf__page-break"></div>-->
    </div>
    <!-- // todo make an actual exercise preview component -->
    <h1 v-if="data.exercises.length" class="text-3xl font-semibold">
      Simulazione esercizi
    </h1>
    <div
      class="py-2 my-2 border-b border-gray-300 last:border-b-0 atomic-box"
      v-for="(exercise, index) in data.exercises"
      :key="'e-' + exercise.id"
    >
      <h1 class="text-2xl font-medium">Esercizio {{ index + 1 }}</h1>
      <p v-html="highlightCode(exercise.text)"></p>
      <!--<div class="html2pdf__page-break"></div>-->
    </div>
  </div>
</template>

<script>
import AggregatedQuestionIntroduction from '../components/AggregatedQuestionIntroduction.vue'
import Question from '../components/Question.vue'
import { highlightCode } from '../constants.js'
export default {
  name: 'MockExam',
  components: {
    Question,
    AggregatedQuestionIntroduction
  },
  props: { data: { type: Object } },

  data () {
    return {}
  },
  methods: {
    highlightCode
  }
}
</script>

<style>
.atomic-box {
  break-inside: avoid;
}
</style>
