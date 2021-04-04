<template>
  <div class="mx-8 my-4 ">
    <h1 class="text-3xl">Crea nuovo esame</h1>

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
            type="datetime"
          ></date-picker>
        </div>

        <div class="ml-auto">
          <h2 class="mb-2 text-xl">Data e ora fine</h2>
          <date-picker
            v-model="exam.end_timestamp"
            type="datetime"
          ></date-picker>
        </div>
      </div>
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
          :id="exercise.uuid"
          :key="exercise.uuid"
          v-model="exam.exercises[index]"
          @delete="confirmDeletion(index)"
        ></ExerciseEditor>
      </transition-group>
    </div>

    <button
      @click="submit()"
      :disabled="invalidForm"
      class="px-4 py-2 mt-10 mb-2 font-medium text-white bg-green-700 rounded-lg shadow-inner disabled:opacity-50"
    >
      <i class="mr-1 fas fa-check"></i> Conferma e crea
    </button>
  </div>
</template>

<script>
import axios from 'axios'
import ExerciseEditor from '../components/ExerciseEditor.vue'
import { VueEditor } from 'vue2-editor'
import DatePicker from 'vue2-datepicker'
import 'vue2-datepicker/index.css'
import { uuid } from 'vue-uuid'
import { toolbar } from '../constants.js'

export default {
  name: 'ExamEditor',
  components: {
    VueEditor,
    DatePicker,
    ExerciseEditor
  },
  created () {
    // this.exam.exercises.unshift(this.newExercise())

    // for debugging
    setTimeout(() => {
      this.exam = {
        name: '<p>Secondo appello</p>',
        begin_timestamp: '2021-04-21T22:01:00.000Z',
        end_timestamp: '2021-05-11T22:10:00.000Z',
        questions: [],
        exercises: [
          {
            uuid: 'aab0823c-324d-48fe-a79f-2cc9fbc63c6a',
            text: '<p>Testo es2</p>',
            starting_code: 'cod2',
            min_passing_testcases: 2,
            testcases: [
              {
                uuid: '4a15b134-834e-4d81-a9b9-18860a1e1290',
                assertion: 'assert 22',
                is_public: false
              },
              {
                uuid: 'f2ee9563-7021-43dc-a08f-07a570738220',
                assertion: 'assert 21',
                is_public: true
              }
            ]
          },
          {
            uuid: 'd6c9dc69-88cc-437c-a538-913bdfcf9225',
            text: '<p>Testo es1</p>',
            starting_code: 'cod',
            min_passing_testcases: 1,
            testcases: [
              {
                uuid: 'f320af07-6cbf-4468-9d2e-2fd499d9c408',
                assertion: 'assert 1 2',
                is_public: false
              },
              {
                uuid: '0833ee44-8b03-48c5-bb1f-f07a241c7cb5',
                assertion: 'assert 1 1',
                is_public: true
              }
            ]
          }
        ]
      }
    }, 100)
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
    },
    newExercise () {
      // returns a new empty exercise with unique id

      const id = uuid.v4()
      return {
        uuid: id,
        text: '',
        starting_code: '',
        min_passing_testcases: 1,
        testcases: []
      }
    },
    confirmDeletion (exerciseIndex) {
      if (confirm('Sei sicuro di voler eliminare questo esercizio?')) {
        this.exam.exercises.splice(exerciseIndex, 1)
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
