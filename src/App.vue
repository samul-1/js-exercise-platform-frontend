<template>
  <div id="app" ref="app" class="flex flex-col h-screen">
    <link
      rel="stylesheet"
      href="https://use.fontawesome.com/releases/v5.15.2/css/all.css"
      integrity="sha384-vSIIfh2YWi9wW0r9iZe7RJPrKwp6bG+s9QZMoITbCckVJqGCCRhc+ccxNcdpHuYu"
      crossorigin="anonymous"
    />
    <nav class="flex w-full px-6 py-2 text-white bg-gray-900">
      <img
        class="w-32"
        src="https://di.unipi.it/wp-content/themes/unipi/images/cherubino-white.svg"
      />
      <div class="my-auto ml-auto">
        <template v-if="$store.state.isAuthenticated">
          <p>
            <i class="mr-2 far fa-user"></i>{{ $store.state.user.email }}
          </p>
        </template>
        <!-- <template v-else>
          <router-link to="/login">Login</router-link>
        </template> -->
      </div>
    </nav>

    <main class="my-auto">
      <div v-if="$store.state.msg" class="py-12 mx-auto text-white bg-gray-900 rounded-lg shadow-md px-36 w-max">
        <h1 class="text-xl text-center">
          {{ $store.state.msg }}
        </h1>
      </div>
      <router-view v-else />
    </main>
    <footer class="flex w-full px-6 py-3 text-sm text-white bg-gray-900">
      <p>
        Powered by
        <a
          target="_blank"
          class="font-medium text-blue-300 hover:underline"
          href="http://bsamu.it"
          >Samuele Bonini</a
        >
      </p>
    </footer>
  </div>
</template>
<script>
import axios from "axios";
export default {
  name: "App",
  beforeCreate() {
    this.$store.commit("initializeStore");

    // get data about user authentication from the store if user is logged in
    const token = this.$store.state.token;

    if (token) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
    } else {
      // redirect to login view if user isn't authenticated
      this.$router.push("/login");
      axios.defaults.headers.common["Authorization"] = "";
    }
  },

};
</script>
<style>
.token.property,
.token.function {
  color: #a0b4ff !important;
}
</style>