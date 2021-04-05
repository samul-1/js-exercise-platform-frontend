<template>
  <div class="flex flex-col h-full p-10">
    <div class="w-3/4 mx-auto">
      <h1 class="mb-10 text-3xl font-medium text-center">Pannello docente</h1>
      <div class="flex flex-col w-3/4 mx-auto">
        <router-link to="/editor"
          ><button
            class="w-full p-6 my-3 text-xl text-white transition-colors duration-100 bg-indigo-800 shadow-lg hover:bg-indigo-900 rounded-2xl"
          >
            Crea esame
          </button></router-link
        >
        <router-link to="/exams"
          ><button
            class="w-full p-6 my-3 text-xl text-white transition-colors duration-100 bg-indigo-800 shadow-lg hover:bg-indigo-900 rounded-2xl"
          >
            Visualizza e modifica esami
          </button></router-link
        >
        <!--<router-link to="/results"
          >
          -->
        <button
          @click="getReport()"
          class="w-full p-6 my-3 text-xl text-white transition-colors duration-100 bg-indigo-800 shadow-lg hover:bg-indigo-900 rounded-2xl"
        >
          Esami conclusi
        </button>
        <!--</router-link
        >-->
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'TeacherDashboard',
  data () {
    return {
      csv: '',
      csvHeader: []
    }
  },
  methods: {
    getReport () {
      axios
        .post(
          '/exams/1/report/',
          {},
          {
            headers: {
              Accept: 'text/csv'
            }
          }
        )
        .then(response => {
          this.csvHeader = `answers.0.given_answer,answers.0.question,answers.1.given_answer,answers.1.question,email,submissions.0.code,submissions.0.exercise,submissions.0.passed_testcases,submissions.1.code,submissions.1.exercise,submissions.1.passed_testcases,submissions.2.code,submissions.2.exercise
,`.split(',')
          console.log(response)
          this.csv = response.data
        })
        .catch(error => {
          console.log(error)
        })
    }
  }
}
</script>

<style></style>
