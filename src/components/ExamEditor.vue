<template>
  <div class="mx-8 my-4">
    <Spinner v-if="loading"></Spinner>

    <h1 class="text-3xl">
      {{ $route.params.examid ? 'Aggiorna esame' : 'Crea nuovo esame' }}
    </h1>

    <!-- exam meta -->
    <div class="grid grid-cols-2 mt-8">
      <div class="mr">
        <h2 class="mb-2 text-xl">Nome esame</h2>
        <input
          class="w-full p-2 mb-6 mr-6 border"
          type="text"
          v-model="exam.name"
        />
      </div>

      <div class="grid grid-cols-2">
        <div class="ml-auto">
          <h2 class="mb-3 text-xl">Data e ora inizio</h2>
          <date-picker
            v-model="exam.begin_timestamp"
            :value-type="'format'"
            type="datetime"
          ></date-picker>
        </div>

        <div class="ml-auto">
          <h2 class="mb-3 text-xl">Data e ora fine</h2>
          <date-picker
            v-model="exam.end_timestamp"
            :value-type="'format'"
            type="datetime"
          ></date-picker>
        </div>
      </div>
      <!-- end exam meta -->
    </div>

    <!-- question categories -->
    <fieldset
      v-show="exam.questions.length"
      class="mt-4"
      :class="{ 'bordered-fieldset': exam.questionCategories.length }"
    >
      <legend class="flex">
        <h2 class="mr-4 text-xl">Categorie domande</h2>
        <!--<div class="flex mt-10">-->
        <button
          @click="
            exam.questionCategories.unshift(
              newCategory(
                'q',
                `Categoria ${exam.questionCategories.length + 1}`
              )
            )
          "
          class="px-3 text-white bg-green-700 rounded-md shadow-sm"
        >
          <i class="fas fa-plus-circle"></i> Aggiungi
        </button>
        <!--</div>-->
      </legend>

      <div class="inner">
        <transition-group name="bounce">
          <CategoryEditor
            v-for="(category, index) in exam.questionCategories"
            :id="category.id"
            :key="category.id"
            v-model="exam.questionCategories[index]"
            :class="{ 'bg-gray-70': index % 2 }"
          ></CategoryEditor>
        </transition-group>
      </div>
    </fieldset>

    <!-- end question categories -->

    <!-- questions -->
    <div>
      <div class="flex mt-10">
        <h2 class="mr-4 text-xl">Domande</h2>
        <button
          @click="exam.questions.unshift(newQuestion())"
          class="px-3 text-white bg-green-700 rounded-md shadow-sm"
        >
          <i class="fas fa-plus-circle"></i> Aggiungi
        </button>
      </div>

      <transition-group name="bounce">
        <QuestionEditor
          v-for="(question, index) in exam.questions"
          :id="question.id"
          :key="question.id"
          v-model="exam.questions[index]"
          @delete="confirmDeletion(exam.questions, index)"
          :category-choices="exam.questionCategories"
          :index="getPositionInCategory(exam.questions[index])"
        ></QuestionEditor>
      </transition-group>
    </div>
    <!-- end questions -->

    <!-- exercise categories -->
    <fieldset
      v-show="exam.exercises.length"
      class="mt-10"
      :class="{ 'bordered-fieldset': exam.exerciseCategories.length }"
    >
      <legend class="flex">
        <h2 class="mr-4 text-xl">Categorie esercizi di programmazione JS</h2>
        <button
          @click="
            exam.exerciseCategories.unshift(
              newCategory(
                'e',
                `Categoria ${exam.exerciseCategories.length + 1}`
              )
            )
          "
          class="px-3 text-white bg-green-700 rounded-md shadow-sm"
        >
          <i class="fas fa-plus-circle"></i> Aggiungi
        </button>
      </legend>

      <div class="inner">
        <transition-group name="bounce">
          <CategoryEditor
            v-for="(category, index) in exam.exerciseCategories"
            :id="category.id"
            :key="category.id"
            v-model="exam.exerciseCategories[index]"
            :class="{ 'bg-gray-70': index % 2 }"
          ></CategoryEditor>
        </transition-group>
      </div>
    </fieldset>
    <!-- end exercise categories -->

    <!-- exercises -->
    <div>
      <div class="flex mt-10">
        <h2 class="mr-4 text-xl">Esercizi di programmazione JS</h2>
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
          :category-choices="exam.exerciseCategories"
        ></ExerciseEditor>
      </transition-group>
    </div>
    <!-- end exercises -->

    <button
      @click="submit()"
      :disabled="loading || invalidForm"
      class="px-4 py-2 mt-10 mb-2 mr-4 text-white bg-green-700 rounded-lg shadow-inner disabled:opacity-50"
    >
      <i class="mr-1 fas fa-check"></i>
      {{ $route.params.examid ? 'Aggiorna' : 'Conferma e crea' }}
    </button>
    <button
      @click="submit(true)"
      :disabled="loading || invalidForm"
      class="px-4 py-2 mt-10 mb-2 text-white bg-gray-500 rounded-lg shadow-inner disabled:opacity-50"
    >
      <i class="mr-1 far fa-file"></i>
      Salva come bozza
    </button>
  </div>
</template>

<script>
import axios from 'axios'
import ExerciseEditor from '../components/ExerciseEditor.vue'
import CategoryEditor from '../components/CategoryEditor.vue'
import QuestionEditor from './QuestionEditor.vue'
import DatePicker from 'vue2-datepicker'
import 'vue2-datepicker/index.css'
import { uuid } from 'vue-uuid'
import Spinner from '../components/Spinner.vue'

export default {
  name: 'ExamEditor',
  components: {
    DatePicker,
    ExerciseEditor,
    QuestionEditor,
    CategoryEditor,
    Spinner
  },
  watch: {
    // automatically add a category when a question/exercise is added for the first
    // time and no categories exist yet for that type of item
    exerciseLen (newVal, oldVal) {
      if (newVal == 1 && !oldVal && !this.exam.exerciseCategories.length) {
        this.exam.exerciseCategories.unshift(
          this.newCategory('e', 'Categoria 1')
        )
      }
    },
    questionsLen (newVal, oldVal) {
      if (newVal == 1 && !oldVal && !this.exam.questionCategories.length) {
        this.exam.questionCategories.unshift(
          this.newCategory('q', 'Categoria 1')
        )
      }
    }
  },
  created () {
    if (!this.$store.state.isAuthenticated) {
      this.$store.commit(
        'setRedirectToAfterLogin',
        this.$router.currentRoute.fullPath
      )
      this.$router.push('/login/teacher')
    }
    if (!this.$store.state.user.is_teacher) {
      this.$router.push('/login')
    }
    const id = this.$route.params.examid
    if (id) {
      this.loading = true
      axios
        .get(`/exams/${id}/`)
        .then(response => {
          console.log(response)
          const { categories, exercises, questions, ...rest } = response.data
          this.exam = {
            // separate categories (which server sees as a single type of resource) into
            // question categories and exercise categories
            questionCategories: categories.filter(c => c.item_type == 'q'),
            exerciseCategories: categories.filter(c => c.item_type == 'e'),
            exercises: exercises.reverse(), // reverse items as the most recent ones are at the top of the list
            questions: questions.reverse(),
            ...rest
          }
        })
        .catch(error => {
          if (error.response.status == 401 || error.response.status == 403) {
            this.$store.commit(
              'setRedirectToAfterLogin',
              this.$router.currentRoute.fullPath
            )
            this.$router.push('/login/teacher')
          } else {
            this.$store.commit(
              'setMessage',
              error.response.data.message ?? error.message
            )
          }
        })
        .finally(() => {
          this.loading = false
        })
    }
  },
  data () {
    return {
      //toolbar,
      loading: false,
      exam: {
        name: '',
        begin_timestamp: null,
        end_timestamp: null,
        exercises: [],
        questions: [],
        questionCategories: [],
        exerciseCategories: []
      }
    }
  },
  methods: {
    submit (draft = false) {
      const id = this.$route.params.examid

      // if no exam id is supplied, we're creating an exam; otherwise we're upading one
      const action = id ? axios.put : axios.post
      this.loading = true
      action('/exams/' + (id ? `${id}/` : ''), {
        ...this.strippedIdExam,
        draft
      })
        .then(response => {
          console.log(response)
          this.$store.commit('setSmallMessage', {
            severity: 1,
            msg: 'Operazione avvenuta con successo.'
          })
          this.$router.push('/exams')
        })
        .catch(error => {
          console.log(error)
          console.log(error.data)
        })
        .finally(() => {
          this.loading = false
        })
    },
    getPositionInCategory (question) {
      // returns the index (1-indexed) of `question` in its current category
      // TODO implement for exercises
      return (
        this.exam.questions
          .filter(q => q.category === question.category)
          .reverse()
          .indexOf(question) + 1
      )
    },
    newExercise () {
      // returns a new empty exercise with unique id

      const id = uuid.v4()
      //const id = Math.ceil(Math.random() * (100000 - 80000) + 80000)
      return {
        id,
        stripId: true, // indicate this id is only for local identification and needs to be stripped off when submitting to backend
        text: '',
        starting_code: '',
        min_passing_testcases: 1,
        testcases: [],
        category: null
      }
    },
    newQuestion () {
      // returns a new empty question with unique id

      const id = uuid.v4()
      return {
        id,
        stripId: true, // indicate this id is only for local identification and needs to be stripped off when submitting to backend
        text: '',
        answers: [],
        category: null,
        question_type: 'm'
      }
    },
    confirmDeletion (arr, index) {
      if (confirm("Confermi l'eliminazione?")) {
        arr.splice(index, 1)
      }
    },
    newCategory (item_type, name = '') {
      // returns a new category with given type and an unique id
      const id = uuid.v4()
      return {
        id,
        item_type,
        _new: true, // indicate this category has just been created in the frontend
        name,
        amount: 1,
        is_aggregated_question: false,
        introduction_text: ''
      }
    }
  },
  computed: {
    exerciseLen () {
      return this.exam.exercises.length
    },
    questionsLen () {
      return this.exam.questions.length
    },
    strippedIdExam () {
      /*
      Returns the exam object without all the local id's generated for questions, their answers,
      exercises, and their testcases.
      Merges questionCategories and exerciseCategories into a single array, and renames the
      relevant id fields for locally-generated objects to tell the server they aren't "real" db id's.
      Reverses both `questions` and `exercises` arrays to have the backend create them in the same order they
      were added in the frontend.

      It's used to send data to the server without sending the local identifiers that
      are only needed by the frontend, and providing the temporary links for questions/exercises
      to reference categories that don't yet exist on the db
      */
      function _stripId (arr) {
        // takes in an array of objects with the keys `stripId` and `id`;
        // returns the same objects without those two keys

        // we might be passed a "normal" array or a vue array, which contains extra keys
        const _arr = arr['__ob__']?.value ?? arr

        // keep id's where `stripId` property is absent (or falsy)
        const dontStrip = _arr.filter(e => !e.stripId)

        return [
          ..._arr
            .filter(e => e.stripId)
            // eslint-disable-next-line no-unused-vars
            .map(({ stripId, id, ...rest }) => rest), // strip off the `id` and `stripId` properties
          ...dontStrip
        ]
      }

      const _processCategories = arr => {
        /*
        Takes in an array of category objects.

        For each category, if it has the `is_aggregated_question` property set to true, changes the `amount` property
        to be equal to the number of questions that belong to that category (overwrites whatever value was in place before).

        Then, for each category, if it has the `_new` property set to true, renames its `id` field to `tmp_uuid`
        so that the backend knows to use that id for temporary referencing during the concurrent creation of
        both categories and questions/exercises, and it strips off the `_new` property
        */

        const _arr = arr['__ob__'].value

        const ret = [
          ..._arr.filter(c => c.item_type != 'q' || !c.is_aggregated_question), // leave exercise categories and categories that aren't aggregated questions alone
          ..._arr
            .filter(c => c.item_type == 'q' && c.is_aggregated_question) // filter for aggregate questions
            // eslint-disable-next-line no-unused-vars
            .map(({ amount, id, ...rest }) => {
              return {
                amount: this.exam.questions.filter(q => q.category === id)
                  .length, // the `amount` must be equal to the number of questions belonging to this category
                id,
                ...rest
              }
            })
        ]

        const dontStrip = ret.filter(e => !e._new) // no change needed for categories that aren't new

        return [
          ...ret
            .filter(e => e._new)
            // eslint-disable-next-line no-unused-vars
            .map(({ id, _new, ...rest }) => {
              return { tmp_uuid: id, ...rest } // rename `id` prop to `tmp_uuid`
            }),
          ...dontStrip
        ]
      }

      const _remapCategoryIds = obj => {
        // _renameCategoryProperties
        /*
        Takes in a question/exericise object.

        Looks up the category referenced in the `category` property:
        If the referenced category has the property `_new` set (and therefore its id is a locally-generated
        uuid and not its id as in the backend db), then the `category` property of the exercise/question is
        renamed to `category_uuid`, to tell the server to use that uuid for temporary referencing

        Otherwise, the object is returned unchanged
        */

        const { category, ...rest } = obj // separate category property from rest of object

        const _category = [
          ...this.exam.exerciseCategories,
          ...this.exam.questionCategories
        ].find(c => c.id == category) // get object's referenced category

        // rename `category` property to `category_uuid` if the category is `_new`,
        // otherwise return object unchanged
        return _category._new ? { category_uuid: _category.id, ...rest } : obj
      }

      function _stripExtraTags (obj) {
        // removes the unwanted <p> tags vue2editor adds to every line, and substitues in <br />
        // tags to keep consistency with user-typed newlines; also substitutes <pre> tags with ```
        const { text, ...rest } = obj
        return {
          text: text
            .replace(/<\/p>/g, '<br />')
            .replace(/<p>/g, '')
            .replace(/<br\s*\/?>(<br\s*\/?>)+/g, '<br />')
            .replace(/<\/?pre[^>]*>/g, '```'),
          ...rest
        }
      }

      function _stripExtraTagsArr (arr) {
        // wrapper to apply _stripExtraTags to a vue array
        const _arr = arr['__ob__'].value
        return _arr.map(a => _stripExtraTags(a))
      }

      const {
        questions,
        exercises,
        questionCategories,
        exerciseCategories,
        ...exam
      } = this.exam

      // remove locally-generated id's
      const strippedQuestions = _stripId(questions)
      const strippedExercises = _stripId(exercises)

      return {
        questions: strippedQuestions
          .map(({ answers, ...question }) => {
            return {
              answers: _stripId(_stripExtraTagsArr(answers)), // remove locally-generated id's from answers
              ..._remapCategoryIds(_stripExtraTags(question)) // change `category` property name to `category_uuid` if it points to a new category
            }
          })
          .reverse(),
        exercises: strippedExercises
          .map(({ testcases, ...exercise }) => {
            return {
              testcases: _stripId(testcases), // remove locally-generated id's from testcases
              ..._remapCategoryIds(_stripExtraTags(exercise)) // change `category` property name to `category_uuid` if it points to a new category
            }
          })
          .reverse(),
        categories: [
          // merge question and exercise categories and rename `id` property
          // name to `uuid` for new categories
          ..._processCategories(questionCategories).reverse(),
          ..._processCategories(exerciseCategories).reverse()
        ],
        ...exam
      }
    },
    invalidForm () {
      return (
        /* exam fields checks */
        !this.exam.name.length || // no name specified
        !this.exam.begin_timestamp ||
        !this.exam.end_timestamp ||
        (!this.exam.exercises.length && !this.exam.questions.length) || // no exercises and no questions
        /* exercise checks */
        this.exam.exercises.some(
          e =>
            !e.text.length || // there is at least one exercise with empty text
            e.min_passing_testcases < 0 || // there is at least one exercise with an invalid test case threshold
            e.min_passing_testcases > e.testcases.length ||
            e.testcases.some(t => !t.assertion.length) || // there is at least one empty test case
            !e.category
        ) ||
        /* question checks */
        this.exam.questions.some(
          q =>
            !q.category || // no category
            !q.text.length || // there is at least a question with empty text
            (q.question_type === 'm' &&
              !q.answers.filter(a => a.is_right_answer).length) || // multiple choice question with no (correct) answers
            q.answers.some(a => !a.text.length) // answers with empty text
        ) ||
        /* category checks */
        this.exam.exerciseCategories.some(
          c =>
            c.amount >
            this.exam.exercises.filter(e => e.category == c.id).length
        ) || // there are categories with a higher `amount` than the number of items actually in that category
        this.exam.questionCategories.some(
          c =>
            c.amount >
            this.exam.questions.filter(q => q.category == c.id).length
        )
      )
    }
  }
}
</script>

<style>
.bordered-fieldset {
  border: 1px solid rgb(209, 213, 219);
  box-shadow: 1px 1px 3px rgba(209, 213, 219, 0.2);
  border-radius: 0.3rem;
  margin: 0;
  padding-left: 1rem;
}

.bordered-fieldset .inner {
  margin-left: -1rem !important;
}

.bg-gray-70 {
  background-color: rgba(243, 244, 246, 0.9);
}

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
