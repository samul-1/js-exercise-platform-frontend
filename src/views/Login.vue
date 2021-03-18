<template>
  <div class="w-3/5 px-32 py-10 m-auto text-center border border-gray-300 rounded-lg shadow-md">
    <h1 class="text-3xl font-medium">Login</h1>
    <div class="mt-5">
      <p class="">Effettua l'accesso con la tua email <strong>@studenti.unipi.it</strong></p>

      <g-signin-button
          class=""
          :params="googleSignInParams"
          @success="onGoogleSignInSuccess"
          @error="onGoogleSignInError"
        >
          <button class="w-3/5 px-3 py-3 mx-auto mt-10 font-medium text-white bg-green-600 rounded-lg shadow-inner active:bg-green-700 btn btn-block btn-success">
            <i class="mr-1 fas fa-lock"></i> Entra
          </button>
        </g-signin-button>
    </div>
  </div>
</template>

<script>

import axios from "axios";
export default {
  name: "Login",
  components: {
    
  },
  mounted() {
    this.$store.commit("removeToken")
    localStorage.removeItem("token");
  },
  data() {
    return {
      user: {},
      username: "",
      password: "",
      errors: [],
      googleSignInParams: {
        client_id: '956826904172-mcsaj1bqcllv93bpad7dmd0e3oil4758.apps.googleusercontent.com' // '600729137370-h25svjos6nbofm48mmtacd3hjq6ogu95.apps.googleusercontent.com'
      },
    };
  },
  methods: {
     async onGoogleSignInSuccess (resp) {
      console.log('successfully signed in with google:', resp)

      // get access token from google
      const token =  resp.tc?.access_token ?? resp.uc?.access_token // ? what's going on here?

      // log in with access token
      await axios.post('http://localhost:8000/users/auth/convert-token',
      {
        "grant_type": "convert_token", 
        "client_id": "j19J7lrby2t6WVOa9LxWs9fW6IgAX7GH8cuRjJhn",
        "client_secret": "UXzLJpaW8n1G4yR45CwJbGR4IztwxomCioheiSoRlhkSn3KTm5caBghWVTzx5nmKdcYCVYiSy8O2JeP2MeDAEZoqhMKtjbBI7bScLta5jUXSewyCKw2PX1b7D8twpe9V",
        "backend": "google-oauth2",
        "token": token
      })
      .then(resp => {
        console.log('successfully logged in to service:', resp)
        console.log(resp.data)

        // save login key to store, local storage, and set it to axios headers
        this.$store.commit("setToken", resp.data.access_token);
        axios.defaults.headers.common["Authorization"] = "Bearer " + resp.data.access_token;
        localStorage.setItem("token", resp.data.access_token);
      })
      .catch(err => {
        console.log(err)
      })

      // get user info from service
      axios.get("/api/v1/users/me")
      .then((response) => {
        console.log('user info:', response);
        // save user details to store and local storage
        this.$store.commit("setUser", {
          email: response.data.email,
          id: response.data.id,
        });
        localStorage.setItem("email", response.data.email);
        localStorage.setItem("userid", response.data.id);

        // redirect to main view
        this.$router.push("/");
      })
      .catch((error) => {
        console.log("error getting user info", JSON.stringify(error));
      });
    },
    onGoogleSignInError (error) {
      alert("I cookie devono essere abilitati per utilizzare questo servizio. Esci dalla modalità incognito se la stai attualmente utilizzando, o abilita i cookie.")
      console.log('google sign in error', error)
    },
  },
};
</script>
