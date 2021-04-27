<template>
  <div class="m-2 border border-gray-300 rounded-lg shadow-sm padding-2">
    <div class="flex">
      <label for="filter-bar mr-2">Cerca utente:</label>
      <input type="text" v-model="searchText" />
    </div>
    <div class="flex" v-for="user in users" :key="user.id">
      <p class="mr-2">{{ getUserFullName(user) }}</p>
      <button @click="toggleSelection(user.id)">
        <i
          :class="{
            'fas fa-circle-plus text-green-800':
              selected.indexOf(user.id) === -1,
            'fas fa-circle-minus text-red-800': selected.indexOf(user.id) !== -1
          }"
        ></i>
      </button>
    </div>
  </div>
</template>

<script>
import { getUserFullName } from '../utility'
export default {
  name: 'SelectableUserList',
  // todo emit on change to `selected`
  props: {
    users: {
      type: Array
    }
  },
  data () {
    return {
      searchText: '',
      selected: []
    }
  },
  methods: {
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
      return this.users.filter(
        u =>
          getUserFullName(u).includes(this.searchText) ||
          getUserFullName(u)
            .split(' ')
            .reverse()
            .join(' ')
            .includes(this.searchText)
      )
    }
  }
}
</script>

<style></style>
