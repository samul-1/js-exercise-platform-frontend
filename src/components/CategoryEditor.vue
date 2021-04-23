<template>
  <div>
    <div class="flex px-4 py-2">
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
        class="p-2 my-2 mr-4 border w-60"
        @input="update('name', $event.target.value)"
        type="text"
        v-model="category.name"
        :id="id + '-cat-name'"
      />
      <p
        v-if="!category.is_aggregated_question && category.randomize"
        class="my-auto ml-2"
      >
        N. {{ category.item_type == 'e' ? 'esercizi' : 'domande' }} per questa
        categoria
      </p>
      <help-text-button
        v-if="!category.is_aggregated_question && category.randomize"
        :helpText="HELP_TXTS.NUM_ITEMS_PER_CAT_TXT"
      ></help-text-button>
      <div
        v-if="!category.is_aggregated_question && category.randomize"
        class="relative flex flex-row w-32 h-full my-auto ml-1 mr-4 bg-transparent rounded-lg"
      >
        <button
          @click="
            category.amount--
            update('amount', category.amount)
          "
          :disabled="category.amount <= 0"
          class="w-20 h-full text-white transition-colors duration-75 bg-gray-800 rounded-l-lg outline-none cursor-pointer disabled:opacity-80 focus:outline-none hover:bg-gray-900"
        >
          <span class="m-auto text-2xl font-thin">−</span>
        </button>
        <input
          type="number"
          class="flex items-center w-16 font-medium text-center text-gray-900 bg-gray-300 outline-none focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default"
          :class="{
            'bg-red-400': category.amount < 0
          }"
          :value="category.amount"
          @input="update('amount', $event.target.value)"
        />
        <button
          @click="
            category.amount++
            update('amount', category.amount)
          "
          class="w-20 h-full text-white transition-colors duration-75 bg-gray-800 rounded-r-lg outline-none cursor-pointer disabled:opacity-80 focus:outline-none hover:bg-gray-900"
        >
          <span class="m-auto text-2xl font-thin">+</span>
        </button>
      </div>
      <input
        v-if="category.item_type == 'q'"
        v-model="category.is_aggregated_question"
        @input="update('is_aggregated_question', $event.target.checked)"
        class="my-auto ml-4"
        type="checkbox"
        :id="id + '-aggr-quest'"
      />
      <label
        v-if="category.item_type == 'q'"
        :for="id + '-aggr-quest'"
        class="my-auto ml-2"
        >Usa come domanda aggregata</label
      >
      <help-text-button
        v-if="category.item_type == 'q'"
        :helpText="HELP_TXTS.AGGR_QUEST_TXT"
      ></help-text-button
      ><input
        v-model="category.randomize"
        @input="update('randomize', $event.target.checked)"
        class="my-auto ml-6"
        type="checkbox"
        :id="id + '-randomize'"
      />
      <label :for="id + '-randomize'" class="my-auto ml-2">Randomizza</label>
      <help-text-button
        :helpText="HELP_TXTS.RAND_CAT_TXT"
        :width="category.item_type == 'q' ? 40 : 80"
      ></help-text-button>
    </div>
    <div
      v-if="category.is_aggregated_question"
      class="w-full pb-4 pl-6 mt-1 pr-7"
    >
      <h2 class="mb-2 ml-1 text-lg">Testo introduttivo</h2>
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
import { toolbar } from '../constants.js'
import { VueEditor } from 'vue2-editor'
import HelpTextButton from '../components/HelpTextButton.vue'
import { HELP_TXTS } from '../help_txts.js'
export default {
  name: 'CategoryEditor',
  components: {
    VueEditor,
    HelpTextButton
  },
  props: {
    id: {
      type: [String, Number]
    }
  },
  created () {
    this.category = this.$attrs.value
  },
  data () {
    return {
      HELP_TXTS,
      toolbar,
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
    }
  }
}
</script>

<style></style>
