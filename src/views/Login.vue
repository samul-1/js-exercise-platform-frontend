<template>
  <div
    class="px-4 py-10 m-auto mx-4 text-center border border-gray-300 rounded-lg shadow-md md:mx-auto md:w-3/5 md:px-32 login-box"
  >
    <h1 class="text-3xl font-medium">
      Login {{ $route.params.role == 'teacher' ? ' docente' : '' }}
    </h1>
    <div class="mt-5">
      <p>
        Effettua l'accesso con la tua email
        <strong
          >@{{
            $route.params.role != 'teacher' ? 'studenti.' : ''
          }}unipi.it</strong
        >.
      </p>
      <p class="mt-3">
        <i class="mr-1 text-red-700 fas fa-exclamation-circle"></i>
        <span class="font-semibold text-red-700">Attenzione:</span> i cookie
        devono essere abilitati per effettuare il login, e non si deve essere in
        modalità incognito.
      </p>
      <div class="mt-4 ">
        <span class="mr-3 font-medium">Browser supportati:</span>
        <img
          class="inline-block w-5 h-5 my-auto mr-2 drop-shadow"
          src="../assets/chrome.png"
        />
        <img
          class="inline-block w-5 h-5 my-auto drop-shadow"
          src="../assets/firefox.png"
        />
      </div>
      <g-signin-button
        class=""
        :params="googleSignInParams"
        @success="onGoogleSignInSuccess"
        @error="onGoogleSignInError"
      >
        <button
          class="w-3/5 px-3 py-3 mx-auto mt-6 font-medium text-white bg-green-600 rounded-lg shadow-inner active:bg-green-700 btn btn-block btn-success"
        >
          <i class="mr-1 fas fa-lock"></i> Entra
        </button>
      </g-signin-button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { redirectToMainView } from '../permissions'
export default {
  name: 'Login',
  components: {},
  mounted () {
    this.$store.commit('removeToken')
    axios.defaults.headers.common['Authorization'] = ''
  },
  data () {
    return {
      user: {},
      username: '',
      password: '',
      errors: [],
      googleSignInParams: {
        client_id:
          '956826904172-mcsaj1bqcllv93bpad7dmd0e3oil4758.apps.googleusercontent.com', // '600729137370-h25svjos6nbofm48mmtacd3hjq6ogu95.apps.googleusercontent.com'
        hosted_domain:
          this.$route.params.role == 'teacher'
            ? 'unipi.it'
            : 'studenti.unipi.it'
      }
    }
  },
  methods: {
    redirectToMainView,
    async onGoogleSignInSuccess (resp) {
      //console.log('successfully signed in with google:', resp)

      // get access token from google
      const token = resp.getAuthResponse(true).access_token

      // log in with access token
      await axios
        .post('/users/auth/convert-token', {
          grant_type: 'convert_token',
          client_id: process.env.VUE_APP_GOOGLE_OAUTH_CLIENT_ID,
          client_secret: process.env.VUE_APP_GOOGLE_OAUTH_CLIENT_SECRET,
          backend: 'google-oauth2',
          token: token
        })
        .then(resp => {
          console.log('Success converting token:', resp)

          // save login key to store and set it to axios headers
          this.$store.commit('setToken', resp.data.access_token)
          axios.defaults.headers.common['Authorization'] =
            'Bearer ' + resp.data.access_token
        })
        .catch(error => {
          alert(
            'Si è verificato un errore con il login. Ricarica la pagina e riprova.'
          )
          console.log('Error converting token:')
          console.log(error)
          throw error
        })

      // get user info from backend
      axios
        .get('/api/v1/users/me/')
        .then(response => {
          console.log('user info:', response)
          // save user details to store and local storage
          this.$store.commit('setUser', {
            email: response.data.email,
            id: response.data.id,
            is_teacher: response.data.is_teacher,
            course: response.data.course
          })

          // redirect to correct view depending on user type
          this.redirectToMainView(this)
        })
        .catch(error => {
          alert(
            'Si è verificato un errore con il login. Ricarica la pagina e riprova.'
          )
          console.log('error getting user info', JSON.stringify(error))
          // let the global error handler log this to server
          throw error
        })
    },
    onGoogleSignInError (error) {
      alert(
        'I cookie devono essere abilitati per utilizzare questo servizio. Esci dalla modalità incognito se la stai attualmente utilizzando, o abilita i cookie.'
      )
      console.log('google sign in error', error)
      // let the global error handler log this to server
      throw error
    }
  }
}
</script>

<style>
.drop-shadow {
  filter: drop-shadow(1px 1px 2px rgba(134, 125, 125, 0.4));
}
</style>
