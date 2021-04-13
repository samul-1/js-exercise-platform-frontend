<template>
  <div class="flex flex-col h-full p-10">
    <div class="w-3/4 mx-auto">
      <h1 class="mb-5 text-3xl font-medium text-center">Pannello docente</h1>
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
        <!--<button
          @click="getReport()"
          class="w-full p-6 my-3 text-xl text-white transition-colors duration-100 bg-indigo-800 shadow-lg hover:bg-indigo-900 rounded-2xl"
        >
          Esami conclusi
        </button>-->
        <!--</router-link
        >-->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TeacherDashboard',
  data () {
    return {}
  },
  methods: {}
}
</script>

<style></style>
