<template>
  <div class="border shadow-md border-gray-300 m-auto w-2/5 p-10 rounded-lg">
    <div class="columns">
      <div class="column is-4 is-offset-4">
        <h1 class="font-medium text-3xl text-center">Login</h1>

        <form @submit.prevent="submitForm" class="flex-column">
          <div class="my-5 mx-auto text-center">
            <div class="control">
              <input
                name="username"
                class="border rounded-md p-2"
                placeholder="Username"
                v-model="username"
              />
            </div>
          </div>

          <div class="my-5 mx-auto text-center">
            <div class="control">
              <input
                type="password"
                name="password"
                placeholder="Password"
                class="border rounded-md p-2"
                v-model="password"
              />
            </div>
          </div>

          <div
            class="p-3 my-3 rounded-md bg-red-300 w-4/5 text-gray-800 mx-auto"
            v-if="errors.length"
          >
            <p v-for="error in errors" v-bind:key="error">{{ error }}</p>
          </div>

          <div class="text-center">
            <div class="control">
              <button
                class="bg-green-600 px-3 py-1 font-medium text-white rounded-lg shadow-inner"
              >
                Entra
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "Login",
  data() {
    return {
      username: "",
      password: "",
      errors: [],
    };
  },
  methods: {
    async submitForm(e) {
      e;
      axios.defaults.headers.common["Authorization"] = "";
      localStorage.removeItem("token");
      const formData = {
        username: this.username,
        password: this.password,
      };
      await axios
        .post("/api/v1/token/login/", formData)
        .then((response) => {
          const token = response.data.auth_token;
          this.$store.commit("setToken", token);

          axios.defaults.headers.common["Authorization"] = "Token " + token;
          localStorage.setItem("token", token);
        })
        .catch((error) => {
          if (error.response) {
            this.errors = [];
            for (const property in error.response.data) {
              this.errors.push(`${property}: ${error.response.data[property]}`);
            }
            console.log(JSON.stringify(error.response.data));
          } else if (error.message) {
            console.log(JSON.stringify(error.message));
          } else {
            console.log(JSON.stringify(error));
          }
        });
      axios
        .get("/api/v1/users/me")
        .then((response) => {
          console.log(response);
          this.$store.commit("setUser", {
            username: response.data.username,
            id: response.data.id,
          });
          localStorage.setItem("username", response.data.username);
          localStorage.setItem("userid", response.data.id);
          this.$router.push("/");
        })
        .catch((error) => {
          console.log(JSON.stringify(error));
        });
    },
  },
};
</script>

<style>
</style>