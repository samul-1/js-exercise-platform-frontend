<template>
  <div class="pt-3 mt-1 mb-8 border border-gray-300 rounded-lg shadow-sm">
    <div class="flex px-3 mb-4">
      <label class="my-auto" for="filter-bar"
        ><i class="fas fa-search mr-0.5"></i> Cerca docente:</label
      >
      <input
        class="ml-2 px-1 py-0.5 border border-gray-300 rounded-md"
        type="text"
        v-model="searchText"
        id="filter-bar"
      />
    </div>
    <div class="grid grid-cols-2">
      <div
        class="flex py-2 px-14"
        v-for="(user, index) in filteredUserList"
        :class="{
          'pl-6': index % 2 == 0,
          'bg-gray-50': index % 4 < 2,
          'rounded-b-md': index === filteredUserList.length - 1
        }"
        :key="user.id"
      >
        <div class="w-2/3">
          <span
            :class="{
              'font-semibold': selected.indexOf(user.id) !== -1
            }"
          >
            {{ getUserFullName(user) }}
          </span>
          <span v-if="selected.indexOf(user.id) !== -1 || lockedId == user.id">
            <i
              class="ml-2"
              :class="{
                'text-green-900 fas fa-check': selected.indexOf(user.id) !== -1,
                'text-gray-600 fas fa-lock': user.id == lockedId
              }"
            ></i>
          </span>
        </div>
        <button
          v-if="lockedId != user.id"
          v-cloak
          @click="toggleSelection(user.id)"
        >
          <i
            :class="{
              'fas fa-plus-circle text-green-800':
                selected.indexOf(user.id) === -1,
              'fas fa-minus-circle text-red-800':
                selected.indexOf(user.id) !== -1
            }"
          ></i>
          {{ selected.indexOf(user.id) === -1 ? 'Aggiungi' : 'Rimuovi' }}
        </button>
        <p v-else class="text-gray-600"><em>Creatore esame</em></p>
      </div>
    </div>
  </div>
</template>

<script>
import { getUserFullName } from '../utility'
export default {
  name: 'SelectableUserList',
  props: {
    users: {
      type: Array
    },
    lockedId: {
      type: [Number, String]
    }
  },

  data () {
    return {
      searchText: '',
      selected: []
    }
  },
  watch: {
    $attrs: {
      handler () {
        this.selected = this.$attrs.value
      },
      deep: true,
      immediate: true
    },
    selected: {
      deep: true,
      immediate: true,
      handler (newValue) {
        console.log(newValue)
        this.$emit('input', newValue)
      }
    }
  },
  methods: {
    getUserFullName,
    toggleSelection (userId) {
      const idx = this.selected.indexOf(userId)
      if (idx === -1) {
        this.selected.push(userId)
      } else {
        this.selected.splice(idx, 1)
      }
    }
  },
  computed: {
    filteredUserList () {
      if (!this.searchText.length) {
        return this.users
      }
      // todo improve (can give issues with people with middle names)
      return this.users.filter(
        u =>
          getUserFullName(u)
            .toLowerCase()
            .includes(this.searchText.toLowerCase()) ||
          getUserFullName(u)
            .split(' ')
            .reverse()
            .join(' ')
            .toLowerCase()
            .includes(this.searchText.toLowerCase())
      )
    }
  }
}
</script>

<style>
[v-cloak] {
  display: none;
}
</style>
