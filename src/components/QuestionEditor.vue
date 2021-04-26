<template>
  <div
    class="relative px-10 py-5 mt-2 mb-6 transition-shadow duration-300 transform border border-gray-300 rounded-lg shadow-sm hover:shadow-lg"
  >
    <div class="absolute right-10">
      <button
        class="mr-2 py-1.5 px-2.5 text-xs text-white shadow-inner bg-gray-500 rounded-lg disabled:opacity-50"
        @click="$emit('toggleExpand')"
      >
        <i class="fas fa-expand-alt"></i>
      </button>
      <button
        @click="$emit('delete')"
        class="py-1.5 px-2.5 text-xs text-white shadow-inner bg-red-700 rounded-lg disabled:opacity-50"
      >
        <i class="fas fa-trash"></i>
      </button>
    </div>
    <div class="mb-6">
      <h1 class="text-xl font-medium">
        Domanda {{ index }}
        <span :class="{ 'text-red-600': !categoryName }"
          >{{ categoryName ? '' : 'senza '
          }}{{
            categoryName.slice(0, 9).toLowerCase() == 'categoria'
              ? ''
              : 'categoria'
          }}
          {{ categoryName ? categoryName : '' }}</span
        >
      </h1>
    </div>
    <div v-show="!expanded">
      <div v-highlight v-html="questionTextPreview"></div>
    </div>
    <div v-show="expanded">
      <div class="mb-4">
        <div class="flex mb-1">
          <span class="my-auto mr-2">Categoria</span>
          <select
            class="p-1 border rounded-md"
            @change="update('category', question.category)"
            v-model="question.category"
          >
            <option :value="null" selected disabled>Seleziona categoria</option>

            <option
              v-for="category in categoryChoices"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
          <div class="ml-6">
            <span
              >Domanda
              <strong>
                {{
                  question.question_type == 'm' ? 'a scelta multipla' : 'aperta'
                }}</strong
              ></span
            >
            <button
              @click="
                switchQuestionType(question.question_type == 'm' ? 'o' : 'm')
              "
              class="px-3 py-1.5 ml-2 text-sm text-white bg-indigo-700 rounded-md shadow-sm"
            >
              <i class="mr-1 fas fa-exchange-alt"></i> Cambia in domanda
              {{
                question.question_type == 'o' ? 'a scelta multipla' : 'aperta'
              }}
            </button>
            <input
              class="ml-6 mr-2"
              type="checkbox"
              v-model="question.accepts_multiple_answers"
              :id="question.id + '-accepts-multiple-answers'"
              @change="
                update('accepts_multiple_answers', $event.target.checked)
              "
            />
            <label :for="question.id + '-accepts-multiple-answers'"
              >Accetta risposte multiple</label
            >
          </div>
        </div>
        <div class="flex">
          <h2 class="my-2 text-lg">Testo della domanda</h2>
          <div class="my-auto ml-auto text-xs">
            <div
              class="mr-1 w-5 h-5 px-1.5 py-0.5 my-auto bg-yellow-500 rounded-full"
            >
              <i class="far fa-lightbulb fa-inverse"></i>
            </div>
          </div>

          <p class="my-auto text-sm text-gray-600">
            Evidenzia il codice LaTeX per vederne l'anteprima
          </p>
          <p></p>
        </div>
        <la-tex-preview
          v-show="selection.length"
          :text="selection"
          @closePreview="selection = ''"
        ></la-tex-preview>
        <div
          class="tex2jax_ignore"
          :class="{ 'bg-gray-100 opacity-80 relative': !question.category }"
        >
          <div v-if="!question.category" class="absolute top-1/2 left-1/2">
            <p class="relative text-gray-600 -left-1/2">
              Per prima cosa, scegli una categoria
            </p>
          </div>
          <VueEditor
            class="tall"
            :value="question.text"
            @input="update('text', $event)"
            :id="question.id + '-text-editor'"
            :editor-toolbar="toolbar"
            :disabled="!question.category"
            @selection-change="setPreview($event)"
            :ref="question.id + '-text-editor'"
          ></VueEditor>
        </div>
      </div>
      <div v-show="question.question_type == 'm'">
        <div class="flex mt-2">
          <h2 class="mr-4 text-lg">Risposte</h2>
          <button
            @click="question.answers.unshift(newAnswer())"
            class="px-3 text-sm text-white bg-indigo-700 rounded-md shadow-sm"
          >
            <i class="fas fa-plus-circle"></i> Aggiungi
          </button>
        </div>
        <div>
          <transition-group name="bounce">
            <AnswerEditor
              v-for="(answer, index) in question.answers"
              :key="answer.id"
              :id="answer.id"
              v-model="question.answers[index]"
              @delete="question.answers.splice(index, 1)"
              @input="updateDeep('answers', index, $event)"
            ></AnswerEditor>
          </transition-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { toolbar } from '../constants.js'
import { VueEditor } from 'vue2-editor'
import AnswerEditor from './AnswerEditor.vue'
import { uuid } from 'vue-uuid'
import LaTexPreview from './LaTexPreview.vue'
import { highlightCode } from '../constants.js'
export default {
  name: 'QuestionEditor',
  components: {
    VueEditor,
    AnswerEditor,
    LaTexPreview
  },
  props: ['categoryChoices', 'index', 'expanded'],
  watch: {
    $props: {
      handler () {
        if (!this.expanded) {
          // render LaTeX code
          setTimeout(
            () => window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub]),
            10
          )
        }
      },
      deep: true,
      immediate: true
    }
  },
  created () {
    this.question = this.$attrs.value
  },
  data () {
    return {
      toolbar,
      // todo take a closer look at the options
      options: {
        theme: 'snow',
        formats: [
          'bold',
          'header',
          'italic',
          'link',
          'list',
          'blockquote',
          'image',
          'indent'
        ],
        modules: {
          toolbar: [
            [{ header: 1 }, { header: 2 }],
            ['bold', 'italic', 'link'],
            ['blockquote', { list: 'ordered' }, { list: 'bullet' }],
            ['image']
          ],
          clipboard: {
            matchVisual: false // https://quilljs.com/docs/modules/clipboard/#matchvisual
          }
        }
      },
      question: {
        id: null,
        text: '',
        answers: [],
        category: null,
        question_type: 'm',
        accepts_multiple_answers: false
      },
      selection: ''
    }
  },
  methods: {
    highlightCode,
    switchQuestionType (newType) {
      if (newType != 'm' && this.question.answers.length > 0) {
        if (
          !confirm(
            'Hai già aggiunto delle risposte a questa domanda. Cambiando modalità, le risposte verranno cancellate.'
          )
        ) {
          return
        }
        this.question.answers = []
      }
      this.question.question_type = newType
      this.update('question_type', this.question.question_type)
    },
    setPreview (event) {
      console.log(event)
      const editor = this.$refs[this.question.id + '-text-editor']
      const range = editor.quill.getSelection()
      this.selection = editor.quill.getText(range.index, range.length)
    },
    update (key, value) {
      // updates supplied key with supplied value; emits change to parent component

      this.question[key] = value
      this.$emit('input', { ...this.question, [key]: value })
    },
    updateDeep (key, index, value) {
      // updates supplied key in array item at supplied index with supplied value;
      // emits change to parent component

      this.question[key][index] = value
      const arr = this.question[key]
      arr[index] = value
      this.$emit('input', { ...this.question, [key]: arr })
    },
    newAnswer () {
      // returns a new empty answer with unique id

      //const id = Math.ceil(Math.random() * (100000 - 80000) + 80000)
      const id = uuid.v4()

      return {
        id,
        stripId: true, // indicate this id is only for local identification and needs to be stripped off when submitting to backend
        text: '',
        is_right_answer: false
      }
    }
  },
  computed: {
    categoryName () {
      return (
        this.categoryChoices.find(c => c.id === this.question.category)?.name ??
        ''
      )
    },
    questionTextPreview () {
      return this.highlightCode(
        (
          this.question.text.replace(/<\/?[^>]+>/g, '') +
          (this.question.text.replace(/<\/?[^>]+>/g, '').length > 200
            ? '...'
            : '')
        ).slice(0, 200)
      )
    }
  }
}
</script>

<style>
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active,
.fade-leave {
  transition: 0.25s opacity ease-out;
}
</style>
