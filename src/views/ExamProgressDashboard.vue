<template>
  <div class="mx-8">
    <h1 class="text-2xl">Esame NOME ESAME in corso</h1>
    <div class="flex my-10 space-x-12 text-xl">
      <h3>
        <i class="mr-1 text-gray-900 fas fa-user"></i>Numero partecipanti: 22
      </h3>
      <h3>
        <i class="mr-1 text-gray-900 fas fa-percentage"></i> Progresso medio:
        <progress class="mt-auto " max="100" value="22"></progress>
        <span class="-ml-2 text-md">22%</span>
      </h3>
    </div>
    <div class="mb-1">
      <div class="flex">
        <h3 class="mr-6">Filtra per:</h3>
        <div class="mt-auto mr-6" v-for="col in columns" :key="col.label">
          <input
            :id="'col-' + col.label"
            type="radio"
            :value="col.field"
            v-model="selectedSearchCol"
            @dblclick="selectedSearchCol = ''"
          />
          <label
            class="select-none"
            @dblclick="selectedSearchCol = ''"
            :for="'col-' + col.label"
            ><span class="ml-1">{{ col.label }}</span></label
          >
        </div>
      </div>
    </div>
    <vue-good-table
      class="shadow-md"
      :columns="columns"
      :rows="rows"
      :search-options="{
        enabled: true,
        skipDiacritics: true,
        searchFn
      }"
    >
      <template slot="table-row" slot-scope="props">
        <span v-if="props.column.field == 'progress'">
          <progress
            class="rounded-2xl"
            max="100"
            :value="+props.row[props.column.field] * 100"
          ></progress>
          <span> {{ props.row[props.column.field] * 100 }}% </span>
        </span>
        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>
    </vue-good-table>
  </div>
</template>

<script>
import 'vue-good-table/dist/vue-good-table.css'
import { VueGoodTable } from 'vue-good-table'
export default {
  name: 'ExamProgressDashboard',
  components: {
    VueGoodTable
  },
  data () {
    return {
      selectedSearchCol: '',
      columns: [
        {
          label: 'Corso',
          field: 'course'
        },
        {
          label: 'Email',
          field: 'email'
        },
        {
          label: 'Nome e cognome',
          field: 'fullName'
        },
        {
          label: 'Progresso',
          field: 'progress',
          type: 'percentage'
        }
      ],
      rows: [
        {
          id: 1,
          course: 'B',
          email: 'abcdef1@gmail.com',
          fullName: 'abcdef',
          progress: '0.5'
        },
        {
          id: 2,
          course: 'B',
          email: 'abcdef2@gmail.com',
          fullName: 'abcdef',
          progress: '0.12'
        },
        {
          id: 3,
          course: 'B',
          email: 'abcdef3@gmail.com',
          fullName: 'Samuele',
          progress: '0.12'
        },
        {
          id: 4,
          course: 'B',
          email: 'abcdef4@gmail.com',
          fullName: 'Andrea',
          progress: '0.12'
        }
      ]
    }
  },
  methods: {
    searchFn (row, col, cellValue, searchTerm) {
      console.log({
        row,
        col,
        cellValue,
        searchTerm
      })
      return (
        col.field == this.selectedSearchCol &&
        cellValue.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
  },
  computed: {}
}
</script>

<style>
.vgt-table thead th {
  color: #606266;
  vertical-align: bottom;
  border-bottom: 1px solid #dcdfe6;
  padding-right: 1.5em;
  background: linear-gradient(#ffffff, #ffffffc5);
}
.vgt-global-search {
  padding: 10px 0;
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  border: 1px solid #dcdfe6;
  border-bottom: 0;
  background: linear-gradient(#fdfeff, #ffffff);
}
.vgt-table.bordered td,
.vgt-table.bordered th {
  border: none /*1px solid rgba(209, 213, 219, 0)*/;
}

.vgt-global-search {
  padding: 10px 0;
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  border: 1px solid #dcdfe6;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;

  border-bottom: 0;
  background: linear-gradient(#fdfeff, #ffffff);
}
.vgt-table thead th {
  color: #606266;
  vertical-align: bottom;
  border-bottom: 1px solid #dcdfe6;
  padding-right: 1.5em;
  background: linear-gradient(#ffffff, #ffffffc5);
  font-weight: 500;
}

progress {
  display: inline-block;
  width: 190px;
  height: 20px;
  padding: 6px 0 0 0;
  margin: 0;
  background: none;
  border: 0;
  border-radius: 5px;
  text-align: left;
  position: relative;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 0.8em;
}
progress::-webkit-progress-bar {
  height: 15px;
  width: 150px;
  margin: 0 auto;
  background-color: #ccc;
  border-radius: 5px;
  box-shadow: 0px 0px 5px rgb(199, 199, 199) inset;
}
progress::-webkit-progress-value {
  /*display: inline-block;*/
  float: left;
  height: 15px;
  margin: 0px -10px 0 0;
  background: rgb(67, 56, 202);
  border-radius: 5px;
  box-shadow: 0px 0px 6px rgb(55, 45, 165) inset;
}
/* progress:after {
  margin: -26px 0 0 -7px;
  padding: 0;
  display: inline-block;
  float: left;
  content: attr(value) '%';
} */
</style>
