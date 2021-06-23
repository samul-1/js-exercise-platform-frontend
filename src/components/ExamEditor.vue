<template>
  <div class="mx-8 my-4">
    <Spinner v-if="loading" :loadingMessage="loadingMessage"></Spinner>
    <h1 class="text-3xl">
      {{ $route.params.examid ? 'Aggiorna esame' : 'Crea nuovo esame' }}
    </h1>

    <!-- exam meta -->
    <div class="grid grid-cols-2 mt-8">
      <div class="mr">
        <h2 class="mb-2 text-xl">Nome esame</h2>
        <input
          class="w-full p-2 mb-6 mr-6 border border-gray-300 rounded-md"
          type="text"
          v-model="exam.name"
        />
      </div>

      <div class="grid grid-cols-2">
        <div class="ml-auto">
          <h2 class="mb-3 text-xl">Data e ora inizio</h2>
          <DatePicker
            v-model="exam.begin_timestamp"
            :value-type="'format'"
            type="datetime"
          ></DatePicker>
        </div>

        <div class="ml-auto">
          <h2 class="mb-3 text-xl">Data e ora fine</h2>
          <DatePicker
            v-model="exam.end_timestamp"
            :value-type="'format'"
            type="datetime"
          ></DatePicker>
        </div>
      </div>
      <!-- end exam meta -->
    </div>

    <div class="flex">
      <h2 class="mb-1 text-xl">
        Insegnanti referenti
      </h2>
      <help-text-button :helpText="HELP_TXTS.REF_TEACHER"></help-text-button>
    </div>
    <SelectableUserList
      :users="teachers"
      :lockedId="exam.created_by ? exam.created_by.id : $store.state.user.id"
      v-model="exam.allowed_teachers"
    ></SelectableUserList>

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
        <input
          class="my-auto ml-6 mr-2"
          type="checkbox"
          v-model="exam.randomize_questions"
          id="randomize-questions"
        />
        <label class="my-auto" for="randomize-questions"
          >Randomizza ordine categorie domande</label
        >
        <help-text-button
          :helpText="HELP_TXTS.RAND_GLOBAL_TXT"
        ></help-text-button>
      </legend>

      <div class="inner">
        <transition-group name="bounce">
          <CategoryEditor
            v-for="(category, index) in exam.questionCategories"
            :id="'c-' + category.id"
            :key="'c-' + category.id"
            v-model="exam.questionCategories[index]"
            @delete="exam.questionCategories.splice(index, 1)"
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
          :id="'q-' + question.id"
          :key="'q-' + question.id"
          v-model="exam.questions[index]"
          @delete="confirmDeletion(exam.questions, index)"
          @toggleExpand="toggleExpand('q-' + question.id)"
          :expanded="expandedItems.indexOf('q-' + question.id) != -1"
          :category-choices="exam.questionCategories"
          :index="getPositionInCategory('q', exam.questions[index])"
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
        <input
          class="my-auto ml-6 mr-2"
          type="checkbox"
          v-model="exam.randomize_exercises"
          id="randomize-exercises"
        />
        <label class="my-auto" for="randomize-exercises"
          >Randomizza ordine categorie esercizi</label
        >
        <help-text-button
          :helpText="HELP_TXTS.RAND_GLOBAL_TXT"
        ></help-text-button>
      </legend>

      <div class="inner">
        <transition-group name="bounce">
          <CategoryEditor
            v-for="(category, index) in exam.exerciseCategories"
            :id="'c-' + category.id"
            :key="'c-' + category.id"
            v-model="exam.exerciseCategories[index]"
            @delete="exam.exerciseCategories.splice(index, 1)"
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
          :id="'e-' + exercise.id"
          :key="'e-' + exercise.id"
          v-model="exam.exercises[index]"
          @delete="confirmDeletion(exam.exercises, index)"
          @toggleExpand="toggleExpand('e-' + exercise.id)"
          :expanded="expandedItems.indexOf('e-' + exercise.id) != -1"
          :category-choices="exam.exerciseCategories"
          :index="getPositionInCategory('e', exam.exercises[index])"
        ></ExerciseEditor>
      </transition-group>
    </div>
    <!-- end exercises -->

    <button
      @click="submit()"
      :disabled="loading || invalidForm"
      class="px-4 py-2 mt-10 mb-2 mr-2 text-white bg-green-700 rounded-lg shadow-inner disabled:opacity-50"
    >
      <i class="mr-1 fas fa-check"></i>
      {{ $route.params.examid ? 'Aggiorna' : 'Conferma e crea' }}
    </button>
    <button
      @click="submit(true)"
      :disabled="loading || invalidForm"
      class="px-4 py-2 mt-10 mb-2 mr-2 text-white bg-gray-500 rounded-lg shadow-inner disabled:opacity-50"
    >
      <i class="mr-1.5 far fa-file"></i>
      Salva come bozza
    </button>
    <router-link to="/exams">
      <button
        class="px-4 py-2 mt-10 mb-2 text-white bg-gray-900 rounded-lg shadow-inner hover:bg-gray-800"
      >
        <i class="mr-1.5 fas fa-chevron-left"></i>

        Annulla
      </button></router-link
    >
    <ExamEditorIndex
      :questions="exam.questions"
      :exercises="exam.exercises"
      :questionCategories="exam.questionCategories"
      :exerciseCategories="exam.exerciseCategories"
    ></ExamEditorIndex>
  </div>
</template>

<script>
import axios from 'axios'
import ExerciseEditor from '../components/ExerciseEditor.vue'
import CategoryEditor from '../components/CategoryEditor.vue'
import SelectableUserList from '../components/SelectableUserList.vue'
import QuestionEditor from './QuestionEditor.vue'
import DatePicker from 'vue2-datepicker'
import 'vue2-datepicker/index.css'
import { uuid } from 'vue-uuid'
import Spinner from '../components/Spinner.vue'
import ExamEditorIndex from '../components/ExamEditorIndex.vue'
import HelpTextButton from '../components/HelpTextButton.vue'
import { HELP_TXTS } from '../help_txts'
import {
  redirectIfNotAuthenticated,
  redirectIfNotTeacher
} from '../permissions'
import { redirectAndSetMessage } from '../utility'

export default {
  name: 'ExamEditor',
  components: {
    DatePicker,
    ExerciseEditor,
    QuestionEditor,
    CategoryEditor,
    Spinner,
    SelectableUserList,
    HelpTextButton,
    ExamEditorIndex
  },
  watch: {
    // automatically add a category when a question/exercise is added for the first
    // time and no categories exist yet for that type of item
    exerciseLen (newVal, oldVal) {
      // todo see if you can factor these out
      // create new category when first exercise is added
      if (newVal == 1 && !oldVal && !this.exam.exerciseCategories.length) {
        this.exam.exerciseCategories.unshift(
          this.newCategory('e', 'Categoria 1')
        )
      }

      if (newVal - oldVal == 1) {
        // automatically expand newly added exercise
        // do this for manually added items, not the whole exam retrieved from the db
        this.toggleExpand(
          'e-' + this.exam.exercises.slice().reverse()[newVal - 1].id
        )
      }
    },
    questionsLen (newVal, oldVal) {
      // create new category when first question is added
      if (newVal == 1 && !oldVal && !this.exam.questionCategories.length) {
        this.exam.questionCategories.unshift(
          this.newCategory('q', 'Categoria 1')
        )
      }

      if (newVal - oldVal == 1) {
        // automatically expand newly added question
        // do this for manually added items, not the whole exam retrieved from the db
        this.toggleExpand(
          'q-' + this.exam.questions.slice().reverse()[newVal - 1].id
        )
      }
    }
  },
  created () {
    redirectIfNotAuthenticated(this, '/login/teacher')
    redirectIfNotTeacher(this, '/login')

    this.getTeachers()

    const id = this.$route.params.examid
    if (id) {
      // lock exam
      this.connectToSocket()

      this.loading = true
      // get exam data
      axios
        .get(`/exams/${id}/`)
        .then(response => {
          const { categories, exercises, questions, ...rest } = response.data
          this.exam = {
            // separate categories (which server sees as a single type of resource) into
            // question categories and exercise categories
            questionCategories: categories
              .filter(c => c.item_type == 'q')
              .reverse(),
            exerciseCategories: categories
              .filter(c => c.item_type == 'e')
              .reverse(),
            exercises: exercises.reverse(), // reverse items as the most recent ones are at the top of the list
            questions: questions.reverse(),
            ...rest
          }

          // todo is there a better way to do this?
          // strip off the "inline-block" style attribute from <p> tags to prevent issues with text editor
          ;[...this.exam.questions, ...this.exam.exercises].forEach(item => {
            item.text = item.text.replace(
              /<p\s+style="display:\s*inline-block">/g,
              '<p>'
            )
          })
          ;[
            ...this.exam.questionCategories,
            ...this.exam.exerciseCategories
          ].forEach(item => {
            item.introduction_text = item.introduction_text.replace(
              /<p\s+style="display:\s*inline-block">/g,
              '<p>'
            )
          })
        })
        .catch(error => {
          // todo see if you can factor this out
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
  beforeRouteLeave (to, from, next) {
    if (this.socket) {
      // unlock the exam before leaving
      this.socket.close()
    }
    next()
  },
  data () {
    return {
      HELP_TXTS,
      expandedItems: [],
      teachers: [],
      loading: false,
      socket: null,
      exam: {
        name: '',
        begin_timestamp: null,
        end_timestamp: null,
        exercises: [],
        questions: [],
        questionCategories: [],
        exerciseCategories: [],
        randomize_questions: true,
        randomize_exercises: true,
        allowed_teachers: []
      }
    }
  },
  methods: {
    getTeachers () {
      axios
        .get('/users/teachers/')
        .then(resp => {
          this.teachers = resp.data
        })
        .catch(err => {
          console.log(err)
        })
    },
    toggleExpand (id) {
      let itemIdx = this.expandedItems.indexOf(id)
      if (itemIdx != -1) {
        this.expandedItems.splice(itemIdx, 1)
      } else {
        this.expandedItems.push(id)
      }
    },
    submit (draft = false) {
      const id = this.$route.params.examid

      // if no exam id is supplied, we're creating an exam; otherwise we're updating one
      const action = id ? axios.put : axios.post
      this.loading = true
      this.loadingMessage =
        "Il salvataggio potrebbe richiedere un po' di tempo se sono presenti tante formule LaTeX nelle domande o risposte.<br />Attendi..."
      action('/exams/' + (id ? `${id}/` : ''), {
        ...this.processedExamObject,
        draft
      })
        .then(response => {
          console.log(response)
          redirectAndSetMessage(
            this,
            '/exams',
            'Operazione avvenuta con successo.',
            1
          )
        })
        .catch(error => {
          console.log(error)
        })
        .finally(() => {
          this.loading = false
          this.loadingMessage = ''
        })
    },
    getPositionInCategory (itemType, item) {
      // returns the index *1-indexed* of `question` in its current category
      const scope = itemType == 'q' ? this.exam.questions : this.exam.exercises
      return (
        scope
          .filter(i => i.category === item.category)
          .reverse()
          .indexOf(item) + 1
      )
    },
    // ! move
    newExercise () {
      // returns a new empty exercise with unique id
      const id = uuid.v4()
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
    // ! move
    newQuestion () {
      // returns a new empty question with unique id
      const id = uuid.v4()
      return {
        id,
        stripId: true, // indicate this id is only for local identification and needs to be stripped off when submitting to backend
        text: '',
        answers: [],
        category: null,
        accepts_multiple_answers: false,
        question_type: 'm'
      }
    },
    // ! move
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
        introduction_text: '',
        randomize: true
      }
    },
    confirmDeletion (arr, index) {
      if (confirm("Confermi l'eliminazione?")) {
        arr.splice(index, 1)
      }
    },
    // todo refactor
    connectToSocket () {
      const wsScheme = window.location.protocol == 'https:' ? 'wss' : 'ws'
      this.socket = new WebSocket(
        wsScheme +
          '://' +
          axios.defaults.baseURL.split('://')[1] +
          '/ws/exam_lock/' +
          this.$route.params.examid +
          '/?token=' +
          this.$store.state.token
      )
      this.socket.onmessage = e => {
        {
          const jsonData = JSON.parse(e.data)
          console.log(jsonData)
          if (jsonData.msg_type === 'exit') {
            redirectAndSetMessage(this, '/exams', 'Sessione terminata.', 2)
          }
        }
      }
      this.socket.onerror = () => {
        redirectAndSetMessage(
          this,
          '/exams',
          "È in corso una modifica all'esame da parte di un altro insegnante.",
          2
        )
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
    // ! move out
    processedExamObject () {
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

        For each category, if it has the `is_aggregated_question` property set to true or `randomize` to false, changes the `amount` property
        to be equal to the number of items that belong to that category (overwrites whatever value was in place before).

        Then, for each category, if it has the `_new` property set to true, renames its `id` field to `tmp_uuid`
        so that the backend knows to use that id for temporary referencing during the concurrent creation of
        both categories and questions/exercises, and it strips off the `_new` property
        */

        const _arr = arr['__ob__'].value

        const ret = [
          ..._arr.filter(c => c.randomize && !c.is_aggregated_question), // leave alone randomized and non-aggregated-question categories
          ..._arr
            .filter(c => c.is_aggregated_question || !c.randomize) // filter for aggregate questions and non-randomized categories
            // eslint-disable-next-line no-unused-vars
            .map(({ amount, id, ...rest }) => {
              return {
                amount:
                  this.exam.questions.filter(q => q.category === id).length ||
                  this.exam.exercises.filter(e => e.category === id).length, // the `amount` must be equal to the number of questions belonging to this category
                id,
                ...rest
              }
            })
        ]

        const dontStrip = ret.filter(e => !e._new) // no change needed for categories that aren't new

        return _fixPresentationTagsArr([
          ...ret
            .filter(e => e._new)
            // eslint-disable-next-line no-unused-vars
            .map(({ id, _new, ...rest }) => {
              return { tmp_uuid: id, ...rest } // rename `id` prop to `tmp_uuid`
            }),
          ...dontStrip
        ])
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

      function _fixPresentationTags (obj) {
        // adds `inline-block` style to the first paragraph of the text/introduction_text to prevent layout issues
        // when showing in exam page; also substitutes <pre> tags with ```
        const { text, introduction_text, ...rest } = obj

        return {
          text:
            text &&
            text
              .replace(/<p[^>]*>/, `<p style="display: inline-block">`)
              .replace(/<\/?pre[^>]*>/g, '```'),
          introduction_text:
            introduction_text &&
            introduction_text
              .replace(/<p[^>]*>/, `<p style="display: inline-block">`)
              .replace(/<\/?pre[^>]*>/g, '```'),
          ...rest
        }
      }

      function _fixPresentationTagsArr (arr) {
        // wrapper to apply _fixPresentationTags to a vue array
        const _arr = arr['__ob__']?.value ?? arr
        return _arr.map(a => _fixPresentationTags(a))
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
              answers: _stripId(_fixPresentationTagsArr(answers)), // remove locally-generated id's from answers
              ..._remapCategoryIds(_fixPresentationTags(question)) // change `category` property name to `category_uuid` if it points to a new category
            }
          })
          .reverse(),
        exercises: strippedExercises
          .map(({ testcases, ...exercise }) => {
            return {
              testcases: _stripId(testcases), // remove locally-generated id's from testcases
              ..._remapCategoryIds(_fixPresentationTags(exercise)) // change `category` property name to `category_uuid` if it points to a new category
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
    // todo add error reporting
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
        [...this.exam.exerciseCategories, ...this.exam.questionCategories].some(
          c => c.amount < 0 || !c.name.length
        ) || // no unnamed categories or categories with a negative `amount`
        this.exam.exerciseCategories.some(
          c =>
            c.randomize &&
            c.amount >
              this.exam.exercises.filter(e => e.category == c.id).length
        ) || // there are categories with a higher `amount` than the number of items actually in that category
        this.exam.questionCategories.some(
          c =>
            !c.is_aggregated_question &&
            c.randomize &&
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
