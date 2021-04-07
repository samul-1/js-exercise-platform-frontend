<template>
  <div class="mx-8 my-4 ">
    <h1 class="text-3xl">
      {{ $route.params.examid ? 'Aggiorna esame' : 'Crea nuovo esame' }}
    </h1>

    <div class="grid grid-cols-2 mt-8">
      <div class="mr">
        <h2 class="mb-2 text-xl">Nome esame</h2>
        <VueEditor
          v-model="exam.name"
          id="exam-name-editor"
          :editor-toolbar="toolbar"
        ></VueEditor>
      </div>

      <div class="grid grid-cols-2">
        <div class="ml-auto">
          <h2 class="mb-2 text-xl">Data e ora inizio</h2>
          <date-picker
            v-model="exam.begin_timestamp"
            :value-type="'format'"
            type="datetime"
          ></date-picker>
        </div>

        <div class="ml-auto">
          <h2 class="mb-2 text-xl">Data e ora fine</h2>
          <date-picker
            v-model="exam.end_timestamp"
            :value-type="'format'"
            type="datetime"
          ></date-picker>
        </div>
      </div>
    </div>

    <div>
      <div class="flex mt-10">
        <h2 class="mr-4 text-xl">Domande a risposta multipla</h2>
        <button
          @click="exam.questions.unshift(newQuestion())"
          class="px-3 text-white bg-green-700 rounded-md shadow-sm"
        >
          <i class="fas fa-plus-circle"></i> Aggiungi
        </button>
      </div>

      <transition-group name="bounce">
        <MultipleChoiceQuestionEditor
          v-for="(question, index) in exam.questions"
          :id="question.id"
          :key="question.id"
          v-model="exam.questions[index]"
          @delete="confirmDeletion(exam.questions, index)"
        ></MultipleChoiceQuestionEditor>
      </transition-group>
    </div>

    <div>
      <div class="flex mt-10">
        <h2 class="mr-4 text-xl">Esercizi</h2>
        <button
          @click="exam.exercises.unshift(newExercise())"
          class="px-3 text-white bg-green-700 rounded-md shadow-sm"
        >
          <i class="fas fa-plus-circle"></i> Aggiungi
        </button>
      </div>

      <transition-group name="bounce">
        <ExerciseEditor
          v-for="(exercise, index) in exam.exercises"
          :id="exercise.id"
          :key="exercise.id"
          v-model="exam.exercises[index]"
          @delete="confirmDeletion(exam.exercises, index)"
        ></ExerciseEditor>
      </transition-group>
    </div>

    <button
      @click="submit()"
      :disabled="invalidForm"
      class="px-4 py-2 mt-10 mb-2 font-medium text-white bg-green-700 rounded-lg shadow-inner disabled:opacity-50"
    >
      <i class="mr-1 fas fa-check"></i>
      {{ $route.params.examid ? 'Aggiorna' : 'Conferma e crea' }}
    </button>
  </div>
</template>

<script>
import axios from 'axios'
import ExerciseEditor from '../components/ExerciseEditor.vue'
import MultipleChoiceQuestionEditor from '../components/MultipleChoiceQuestionEditor.vue'
import { VueEditor } from 'vue2-editor'
import DatePicker from 'vue2-datepicker'
import 'vue2-datepicker/index.css'
//import { uuid } from 'vue-uuid'
import { toolbar } from '../constants.js'

export default {
  name: 'ExamEditor',
  components: {
    VueEditor,
    DatePicker,
    ExerciseEditor,
    MultipleChoiceQuestionEditor
  },
  created () {
    const id = this.$route.params.examid
    if (id) {
      axios
        .get(`/exams/${id}/`)
        .then(response => {
          console.log(response)
          this.exam = response.data
        })
        .catch(error => {
          console.log(error)
        })
    }
  },
  data () {
    return {
      toolbar,
      exam: {
        name: '',
        begin_timestamp: null,
        end_timestamp: null,
        exercises: [],
        questions: []
      }
    }
  },
  methods: {
    submit () {
      console.log(JSON.stringify(this.exam))
      const id = this.$route.params.examid
      if (id) {
        axios
          .put(`/exams/${id}/`, { ...this.exam })
          .then(response => {
            console.log(response)
          })
          .catch(error => {
            console.log(error)
          })
      } else {
        axios
          .post('/exams/', { ...this.exam })
          .then(response => {
            console.log(response)
          })
          .catch(error => {
            console.log(error)
            // if (error.response.status == 401 || error.response.status == 403) {
            //   this.$router.push('/login')
            //   // this.$store.commit('removeToken')
            // } else {
            //   this.$store.commit(
            //     'setMessage',
            //     error.response.data.message ?? error.message
            //   )
            // }
          })
      }
    },
    newExercise () {
      // returns a new empty exercise with unique id

      //const id = uuid.v4()
      const id = Math.ceil(Math.random() * (100000 - 80000) + 80000)
      return {
        id,
        text: '',
        starting_code: '',
        min_passing_testcases: 1,
        testcases: []
      }
    },
    newQuestion () {
      // returns a new empty question with unique id

      //const id = uuid.v4()
      const id = Math.ceil(Math.random() * (100000 - 80000) + 80000)
      return {
        id,
        text: '',
        answers: []
      }
    },
    confirmDeletion (arr, index) {
      if (confirm("Confermi l'eliminazione?")) {
        arr.splice(index, 1)
      }
    }
  },
  computed: {
    invalidForm () {
      return (
        !this.exam.name.length || // no name was specified for this exam
        !this.exam.exercises.length || // no exercises were added to this exam
        this.exam.exercises.some(
          e =>
            !e.text.length || // there is at least one exercise with empty text
            !e.testcases.length || // there is at least one exercise with no test cases
            e.min_passing_testcases < 0 || // there is at least one exercise with an invalid test case threshold
            e.min_passing_testcases > e.testcases.length ||
            e.testcases.some(t => !t.assertion.length) // there is at least one empty test case
        )
      )
    }
  }
}
</script>

<style>
/* hide input number arrows */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* text editor */
.ql-editor {
  min-height: 0 !important;
}
.ql-toolbar.ql-snow {
  border-top-left-radius: 0.3rem;
  border-top-right-radius: 0.3rem;
}

.ql-editor,
.ql-container.ql-snow {
  height: 50px;
  border-bottom-left-radius: 0.3rem;
  border-bottom-right-radius: 0.3rem;
}

.tall > .ql-editor,
.tall > .ql-container.ql-snow {
  height: 115px;
  border-bottom-left-radius: 0.3rem;
  border-bottom-right-radius: 0.3rem;
}

.quillWrapper .ql-snow.ql-toolbar button svg {
  width: 20px !important;
  height: 20px !important;
}
.quillWrapper .ql-snow.ql-toolbar .ql-formats {
  margin-bottom: 5px !important;
}

.quillWrapper .ql-snow.ql-toolbar {
  padding-top: 4px !important;
  padding-bottom: 0 !important;
}

/* bounce animation */
.bounce-enter-active {
  animation: bounce-in 0.2s;
}
.bounce-leave-active {
  animation: bounce-in 0.4s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.03);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}
</style>
