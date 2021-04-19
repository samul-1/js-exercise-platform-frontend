<template>
  <div>
    <div class="flex m-2">
      <label class="my-auto mr-2" :for="id + '-cat-name'">Nome categoria</label>
      <input
        class="p-2 my-2 mr-6 border w-60"
        @input="update('name', $event.target.value)"
        type="text"
        v-model="category.name"
        :id="id + '-cat-name'"
      />
      <p v-if="!category.is_aggregated_question" class="my-auto ml-2 mr-2">
        Numero di {{ category.item_type == 'e' ? 'esercizi' : 'domande' }} per
        questa categoria
      </p>
      <div
        v-if="!category.is_aggregated_question"
        class="relative flex flex-row w-32 h-full my-auto mr-6 bg-transparent rounded-lg"
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
        >Utilizza come domanda aggregata</label
      >
    </div>
    <div
      v-if="category.is_aggregated_question"
      class="w-full pl-2 mt-2 mb-4 pr-7"
    >
      <h2 class="mb-2 text-lg">Testo introduttivo</h2>
      <div class="tex2jax_ignore">
        <VueEditor
          class="tall"
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
export default {
  name: 'CategoryEditor',
  components: {
    VueEditor
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
      toolbar,
      category: {
        id: null,
        name: '',
        amount: 1,
        is_aggregated_question: false,
        introduction_text: ''
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
