<template>
  <div class="flex flex-col h-full md:p-10">
    <div class="mx-auto md:w-3/4">
      <h1 class="mb-5 text-4xl font-medium text-center">Pannello docente</h1>
      <div class="flex flex-col mx-auto md:w-3/4">
        <router-link to="/editor"
          ><button
            class="w-full p-6 my-3 text-xl text-white transition-colors duration-100 bg-indigo-700 shadow-lg hover:bg-indigo-800 rounded-2xl"
          >
            Crea esame
          </button></router-link
        >
        <router-link to="/exams"
          ><button
            class="w-full p-6 my-3 text-xl text-white transition-colors duration-100 bg-indigo-700 shadow-lg hover:bg-indigo-800 rounded-2xl"
          >
            Visualizza e modifica esami
          </button></router-link
        >
      </div>
    </div>
  </div>
</template>

<script>
// import {
//   redirectIfNotAuthenticated,
//   redirectIfNotTeacher
// } from '../permissions'
export default {
  name: 'TeacherDashboard'
  // created () {
  //   redirectIfNotAuthenticated(this, '/login/teacher')
  //   redirectIfNotTeacher(this, '/login')
  // }
}
</script>

<style></style>
