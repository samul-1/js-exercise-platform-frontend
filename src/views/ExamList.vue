<template>
  <div class="px-4">
    <h1 class="mb-10 text-3xl font-medium">Lista esami</h1>
    <div
      class="flex w-full px-2 py-6 my-2 mt-auto transition-shadow duration-75 border rounded-lg hover:shadow-md"
      v-for="exam in exams"
      :key="exam.id"
    >
      <h1 class="mr-2 text-lg" v-html="exam.name"></h1>
      <router-link :to="`/editor/${exam.id}`"
        ><button
          :disabled="new Date() >= new Date(exam.end_timestamp)"
          class="px-3 text-white align-middle bg-indigo-700 rounded-lg disabled:opacity-40 hover:bg-indigo-800"
        >
          Modifica
        </button></router-link
      >
      <router-link :to="`/reports/${exam.id}`"
        ><button
          v-if="new Date() >= new Date(exam.end_timestamp)"
          class="px-3 ml-2 text-white align-middle bg-indigo-700 rounded-lg disabled:opacity-40 hover:bg-indigo-800"
        >
          Risultati
        </button></router-link
      >
      <div class="flex ml-auto">
        <div
          class="px-2 mr-6 bg-gray-600 rounded-md "
          v-if="new Date() >= new Date(exam.end_timestamp)"
        >
          <span class="text-white align-middle">Terminato</span>
        </div>
        <div
          class="px-2 mr-6 bg-green-800 rounded-md animate-pulse"
          v-if="new Date() >= new Date(exam.begin_timestamp)"
        >
          <span class="text-white align-middle">In corso</span>
        </div>
        <p>
          <i class="mr-1 text-gray-500 far fa-calendar"></i>
          {{ formatTimestamp(exam.begin_timestamp) }} -
          {{ formatTimestamp(exam.end_timestamp) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'ExamList',
  created () {
    axios
      .get('/exams/')
      .then(response => {
        this.exams = response.data
      })
      .catch(error => {
        console.log(error)
      })
  },
  data () {
    return {
      exams: []
    }
  },
  methods: {
    //! move to constants.js
    formatTimestamp (timestamp) {
      // todo implement
      return timestamp
    }
  }
}
</script>

<style></style>
