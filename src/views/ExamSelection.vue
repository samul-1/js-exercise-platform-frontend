<template>
  <div
    class="w-3/5 py-10 m-auto text-center border border-gray-300 rounded-lg shadow-md px-28 login-box"
  >
    <h1 class="text-2xl font-medium">
      Inserisci il codice dell'esame ottenuto dal docente
    </h1>
    <div class="mt-8">
      <input
        v-model="code"
        type="number"
        placeholder="Codice esame"
        class="w-full p-4 text-lg border-2 border-gray-200 rounded-lg shadow-inner"
      />

      <button
        @click="goToExam()"
        :disabled="!code.length"
        class="w-3/5 px-3 py-3 mx-auto mt-8 font-medium text-white bg-green-600 rounded-lg shadow-inner active:bg-green-700 btn btn-block btn-success"
      >
        <i class="mr-1 fas fa-chevron-right"></i> Vai all'esame
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExamSelection',
  data () {
    return {
      code: ''
    }
  },
  methods: {
    goToExam () {
      this.$router.push(`/exam/${this.code}`)
    }
  }
}
</script>

<style></style>
