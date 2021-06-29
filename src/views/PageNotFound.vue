<template>
  <div class="text-center">
    <h1 style="letter-spacing: -8px" class="mb-4 text-9xl">
      4
      <div
        class="inline-block transition-all duration-500"
        :class="{ 'animate-spin': spin }"
      >
        0
      </div>
      4
    </h1>
    <h2 class="text-4xl">Pagina non trovata.</h2>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PageNotFound',
  created () {
    setTimeout(() => {
      this.spin = true
      setTimeout(() => {
        this.spin = false
      }, 1000)
    }, 300)

    axios
      .post('/frontend_errors/', {
        additional_info: `404 on ${window.location}`
      })
      .then(response => {
        console.log(response)
      })
      .catch(error => {
        console.log(error)
      })
  },
  data () {
    return {
      spin: false
    }
  }
}
</script>

<style></style>
