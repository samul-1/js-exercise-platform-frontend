<template>
  <div class="mx-8 my-6">
    <Spinner v-if="loading"></Spinner>
    <header class="flex">
      <router-link class="my-auto mr-2 " to="/exams"
        ><button
          class="pl-1.5 pr-2 text-white bg-gray-900 rounded-lg shadow-inner hover:bg-gray-700 py"
        >
          <i class="fas fa-chevron-left"></i></button
      ></router-link>
      <h1 class="text-3xl">Statistiche {{ exam.name }}</h1>
    </header>
    <div class="flex my-10 space-x-12 text-xl">
      <h3>
        <i class="mr-2 text-gray-900 fas fa-user"></i>Numero partecipanti:
        <span class="ml-1">{{ numParticipants }}</span>
      </h3>
      <h3>
        <i class="mr-1 text-gray-900 fas fa-tasks"></i> Progresso medio:
        <progress
          class="mt-auto -ml-2"
          max="100"
          :value="(averageProgress * 100) / totalItemsCount"
        ></progress>
        <span class="-ml-3 text-md"
          >{{ Math.round((+averageProgress * 100) / totalItemsCount) }}%</span
        ><span class="font-light text-gray-400">
          ({{ Math.round(averageProgress) }} esercizi{{
            averageProgress == 1 ? 'o' : ''
          }}
          su {{ totalItemsCount }})</span
        >
      </h3>
      <h3>
        <i class="mr-1 fas fa-clipboard-check"></i> Esami terminati:
        <span class="ml-1">{{ numCompleted }}</span
        ><span class="font-light text-gray-400">
          (su {{ numParticipants }})</span
        >
      </h3>
    </div>
    <div class="flex items-center">
      <h2 class="text-2xl ">Domande più sbagliate</h2>
      <span class="my-auto ml-3 font-light text-gray-600"
        >(Sono escluse le domande aperte e quelle che non sono state
        visualizzate da alcuno studente)</span
      >
    </div>
    <div class="w-full">
      <question-with-stats
        v-for="question in sortedNonOpenQuestions"
        :key="'q-stats-' + question.id"
        :question="question"
      ></question-with-stats>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Spinner from '../components/Spinner.vue'
import QuestionWithStats from '../components/QuestionWithStats.vue'
import { getCorrectPercent } from '../utility'
export default {
  name: 'ExamStats',
  created () {
    this.getGlobalData()
    this.getQuestionsData()
  },
  components: {
    QuestionWithStats,
    Spinner
  },
  data () {
    return {
      loading: false,
      exam: {
        name: '',
        begin_timestamp: null,
        end_timestamp: null,
        exercises: [],
        questions: [],
        questionCategories: [],
        exerciseCategories: [],
        randomize_questions: true,
        randomize_exercises: true,
        allowed_teachers: []
      },
      numParticipants: 0,
      averageProgress: 0,
      numCompleted: 0,
      totalItemsCount: 0
    }
  },
  methods: {
    getGlobalData () {
      this.loading = true
      axios
        .get(`/exams/${this.$route.params.examid}/progress_info/?global_only`)
        .then(response => {
          //console.log(response)
          this.numParticipants = response.data.participants_count
          this.averageProgress = response.data.average_progress
          this.numCompleted = response.data.completed_count
          this.totalItemsCount = response.data.total_items_count
        })
        .catch(error => {
          console.log(error)
        })
        .finally(() => {
          this.loading = false
        })
    },
    getQuestionsData () {
      axios
        .get(`/exams/${this.$route.params.examid}/`)
        .then(response => {
          console.log(response.data)
          const { categories, exercises, questions, ...rest } = response.data
          this.exam = {
            // separate categories (which server sees as a single type of resource) into
            // question categories and exercise categories
            questionCategories: categories
              .filter(c => c.item_type == 'q')
              .reverse(),
            exerciseCategories: categories
              .filter(c => c.item_type == 'e')
              .reverse(),
            exercises: exercises.reverse(), // reverse items as the most recent ones are at the top of the list
            questions: questions.reverse(),
            ...rest
          }

          // todo is there a better way to do this?
          // strip off the "inline-block" style attribute from <p> tags to prevent issues with text editor
          ;[...this.exam.questions, ...this.exam.exercises].forEach(item => {
            item.text = item.text.replace(
              /<p\s+style="display:\s*inline-block">/g,
              '<p>'
            )
          })
          ;[
            ...this.exam.questionCategories,
            ...this.exam.exerciseCategories
          ].forEach(item => {
            item.introduction_text = item.introduction_text.replace(
              /<p\s+style="display:\s*inline-block">/g,
              '<p>'
            )
          })
        })
        .catch(error => {
          // todo see if you can factor this out
          if (error.response.status == 401 || error.response.status == 403) {
            this.$store.commit(
              'setRedirectToAfterLogin',
              this.$router.currentRoute.fullPath
            )
            this.$router.push('/login/teacher')
          } else {
            this.$store.commit(
              'setMessage',
              error.response.data.message ?? error.message
            )
          }
        })
        .finally(() => {
          this.loading = false
        })
    }
  },
  computed: {
    sortedNonOpenQuestions () {
      return [
        ...this.exam.questions.filter(
          q => q.answers.length && q.num_appearances > 0
        )
      ].sort((a, b) => {
        return getCorrectPercent(a) - getCorrectPercent(b)
      })
    }
  }
}
</script>

<style></style>
