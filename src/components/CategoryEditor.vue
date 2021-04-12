<template>
  <div class="flex m-2">
    <label class="my-auto mr-2" :for="id + '-cat-name'">Nome categoria</label>
    <input
      class="p-2 my-2 mr-6 border"
      @input="update('name', $event.target.value)"
      type="text"
      v-model="category.name"
      :id="id + '-cat-name'"
    />
    <p class="my-auto mr-2">
      Numero di {{ category.item_type == 'e' ? 'esercizi' : 'domande' }} per
      questa categoria
    </p>
    <div
      class="relative flex flex-row w-32 h-full my-auto bg-transparent rounded-lg"
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
  </div>
</template>

<script>
export default {
  name: 'CategoryEditor',
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
      category: {
        id: null,
        name: '',
        amount: 1
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
