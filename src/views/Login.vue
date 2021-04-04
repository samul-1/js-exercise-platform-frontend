<template>
  <div
    class="w-3/5 px-32 py-10 m-auto text-center border border-gray-300 rounded-lg shadow-md"
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
export default {
  name: 'Login',
  components: {},
  mounted () {
    this.$store.commit('removeToken')
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
    async onGoogleSignInSuccess (resp) {
      console.log('successfully signed in with google:', resp)

      // get access token from google
      const token = resp.tc?.access_token ?? resp.uc?.access_token // ? what's going on here?

      // log in with access token
      await axios
        .post('http://localhost:8000/users/auth/convert-token', {
          grant_type: 'convert_token',
          client_id: 'j19J7lrby2t6WVOa9LxWs9fW6IgAX7GH8cuRjJhn',
          client_secret:
            'UXzLJpaW8n1G4yR45CwJbGR4IztwxomCioheiSoRlhkSn3KTm5caBghWVTzx5nmKdcYCVYiSy8O2JeP2MeDAEZoqhMKtjbBI7bScLta5jUXSewyCKw2PX1b7D8twpe9V',
          backend: 'google-oauth2',
          token: token
        })
        .then(resp => {
          console.log('successfully logged in to service:', resp)
          console.log(resp.data)

          // save login key to store and set it to axios headers
          this.$store.commit('setToken', resp.data.access_token)
          axios.defaults.headers.common['Authorization'] =
            'Bearer ' + resp.data.access_token
        })
        .catch(err => {
          console.log(err)
        })

      // get user info from backend
      axios
        .get('/api/v1/users/me')
        .then(response => {
          console.log('user info:', response)
          // save user details to store and local storage
          this.$store.commit('setUser', {
            email: response.data.email,
            id: response.data.id,
            is_teacher: response.data.is_teacher
          })

          // redirect to correct view depending on user type
          this.redirectToMainView()
        })
        .catch(error => {
          alert(
            'Si è verificato un errore con il login. Ricarica la pagina e riprova.'
          )
          console.log('error getting user info', JSON.stringify(error))
        })
    },
    onGoogleSignInError (error) {
      alert(
        'I cookie devono essere abilitati per utilizzare questo servizio. Esci dalla modalità incognito se la stai attualmente utilizzando, o abilita i cookie.'
      )
      console.log('google sign in error', error)
    },
    redirectToMainView () {
      // If the logged in user is a teacher, redirects the user to the teacher dashboard
      // If the logged in user a student, redirects the student to the exam page
      // TODO implement
      if (this.$store.state.user.is_teacher) {
        this.$router.push('/create')
      } else {
        this.$router.push('/exam')
      }
    }
  }
}
</script>
