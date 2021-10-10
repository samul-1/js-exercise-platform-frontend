<template>
  <div>
    <ul
      v-if="errors"
      class="flex flex-col px-4 pt-2 mt-2 md:space-x-4 md:flex-row"
    >
      <li v-for="(error, index) in errors" :key="category.id + '-err-' + index">
        <p class="text-sm text-red-500"><strong>&#183;</strong> {{ error }}</p>
      </li>
    </ul>
    <div class="flex flex-col px-2 py-2 md:px-4 md:flex-row">
      <div v-if="category._new" class="order-12 my-auto ml-auto">
        <button
          @click="$emit('delete')"
          class="py-1.5 px-2.5 text-xs text-white shadow-inner bg-red-700 rounded-lg disabled:opacity-50"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
      <label class="my-auto mr-2" :for="id + '-cat-name'">Nome</label>
      <input
        class="w-full px-2 py-1 my-2 mr-4 border border-gray-300 rounded-md md:w-56"
        @input="update('name', $event.target.value)"
        type="text"
        v-model="category.name"
        :id="id + '-cat-name'"
      />
      <p
        v-if="!category.is_aggregated_question && category.randomize"
        class="w-full my-auto text-sm md:ml-5 md:w-60"
      >
        Numero di
        {{ category.item_type == 'e' ? 'esercizi' : 'domande' }} scelt{{
          category.item_type == 'e' ? 'i' : 'e'
        }}
        a caso da<br />
        questa categoria per ogni studente
      </p>
      <help-text-button
        v-if="!category.is_aggregated_question && category.randomize"
        :helpText="HELP_TXTS.NUM_ITEMS_PER_CAT_TXT"
      ></help-text-button>
      <div
        v-if="!category.is_aggregated_question && category.randomize"
        class="relative flex flex-row w-32 h-full my-auto mt-2 mb-4 mr-4 bg-transparent rounded-lg md:mb-0 md:mt-0 md:ml-2"
      >
        <button
          @click="
            category.amount--
            update('amount', category.amount)
          "
          :disabled="category.amount <= 0"
          class="w-20 h-full text-white transition-colors duration-75 bg-gray-500 rounded-l-lg outline-none cursor-pointer disabled:opacity-60 focus:outline-none hover:bg-gray-600"
        >
          <span class="m-auto text-2xl font-thin">−</span>
        </button>
        <input
          type="number"
          class="flex items-center w-16 font-medium text-center text-gray-900 bg-gray-200 outline-none focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default"
          :class="{
            'bg-red-300': category.amount < 0
          }"
          :value="category.amount"
          @input="update('amount', $event.target.value)"
        />
        <button
          @click="
            category.amount++
            update('amount', category.amount)
          "
          class="w-20 h-full text-white transition-colors duration-75 bg-gray-500 rounded-r-lg outline-none cursor-pointer disabled:opacity-60 focus:outline-none hover:bg-gray-600"
        >
          <span class="m-auto text-2xl font-thin">+</span>
        </button>
      </div>
      <div class="my-auto">
        <input
          v-if="category.item_type == 'q'"
          v-model="category.is_aggregated_question"
          @input="update('is_aggregated_question', $event.target.checked)"
          class="my-auto md:ml-5"
          type="checkbox"
          :id="id + '-aggr-quest'"
        />
        <label
          v-if="category.item_type == 'q'"
          :for="id + '-aggr-quest'"
          class="my-auto ml-2"
          >Usa come domanda aggregata</label
        >
      </div>
      <help-text-button
        v-if="category.item_type == 'q'"
        :helpText="HELP_TXTS.AGGR_QUEST_TXT"
      ></help-text-button>
      <div class="my-auto">
        <input
          v-model="category.randomize"
          @input="update('randomize', $event.target.checked)"
          class="my-auto md:ml-5"
          type="checkbox"
          :id="id + '-randomize'"
        />
        <label :for="id + '-randomize'" class="my-auto ml-2">Randomizza</label>
      </div>
      <help-text-button
        :helpText="HELP_TXTS.RAND_CAT_TXT"
        :width="category.item_type == 'q' ? 40 : 80"
      ></help-text-button>
    </div>
    <div
      v-if="category.is_aggregated_question"
      class="relative w-full pb-4 pl-6 mt-1 pr-7"
    >
      <h2 class="mb-2 ml-1 text-lg">Testo introduttivo</h2>
      <la-tex-preview
        v-show="selection.length"
        :text="selection"
        @closePreview="selection = ''"
      ></la-tex-preview>
      <div class="tex2jax_ignore">
        <VueEditor
          class="bg-white tall"
          :value="category.introduction_text"
          @input="update('introduction_text', $event)"
          :id="category.id + '-text-editor'"
          :ref="category.id + '-text-editor'"
          @selection-change="setPreview($event)"
          :editor-toolbar="toolbar"
        ></VueEditor>
      </div>
    </div>
  </div>
</template>

<script>
import { toolbar } from '../constants'
import { VueEditor } from 'vue2-editor'
import HelpTextButton from '../components/HelpTextButton.vue'
import LaTexPreview from './LaTexPreview.vue'
import { HELP_TXTS } from '../help_txts'
export default {
  name: 'CategoryEditor',
  components: {
    VueEditor,
    HelpTextButton,
    LaTexPreview
  },
  props: {
    id: {
      type: [String, Number]
    },
    errors: {
      type: Array
    }
  },
  created () {
    this.category = this.$attrs.value
  },
  data () {
    return {
      HELP_TXTS,
      toolbar,
      selection: '',
      category: {
        id: null,
        name: '',
        amount: 1,
        is_aggregated_question: false,
        introduction_text: '',
        randoimze: true
      }
    }
  },
  methods: {
    update (key, value) {
      // updates supplied key with supplied value; emits change to parent component
      console.log(value)
      this.category[key] = value
      this.$emit('input', { ...this.category, [key]: value })
    },
    setPreview (event) {
      console.log(event)
      const editor = this.$refs[this.category.id + '-text-editor']
      const range = editor.quill.getSelection()
      this.selection = editor.quill.getText(range.index, range.length)
    }
  }
}
</script>

<style></style>
