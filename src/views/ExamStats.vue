<template>
  <div class="w-9/12">
    <question-with-stats
      v-for="question in exam.questions"
      :key="question.id"
      :question="question"
    ></question-with-stats>
  </div>
</template>

<script>
import axios from 'axios'
import QuestionWithStats from '../components/QuestionWithStats.vue'
export default {
  name: 'ExamStats',
  created () {
    this.getData()
  },
  components: {
    QuestionWithStats
  },
  data () {
    return {
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
      }
    }
  },
  methods: {
    getData () {
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
  }
}
</script>

<style></style>
