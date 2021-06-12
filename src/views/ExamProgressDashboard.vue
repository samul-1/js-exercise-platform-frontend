<template>
  <div class="mx-8">
    <Spinner v-if="loading"></Spinner>
    <h1 class="text-2xl">Esame {{ examName }} in corso</h1>
    <div class="flex my-10 space-x-12 text-xl">
      <h3>
        <i class="mr-2 text-gray-900 fas fa-user"></i>Numero partecipanti:
        <span class="ml-1">{{ numParticipants }}</span>
      </h3>
      <h3>
        <i class="mr-1 text-gray-900 fas fa-percentage"></i> Progresso medio:
        <progress
          class="mt-auto -ml-2"
          max="100"
          :value="averageProgress * 100"
        ></progress>
        <span class="-ml-2 text-md">{{ averageProgress * 100 }}%</span>
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
        <span v-else-if="props.column.field == 'course'">
          <span>
            {{
              props.row[props.column.field]
                ? props.row[props.column.field].toUpperCase()
                : '?'
            }}</span
          >
        </span>
        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>
    </vue-good-table>
  </div>
</template>

<script>
import axios from 'axios'
import Spinner from '../components/Spinner.vue'

import 'vue-good-table/dist/vue-good-table.css'
import { VueGoodTable } from 'vue-good-table'
export default {
  name: 'ExamProgressDashboard',
  components: {
    VueGoodTable,
    Spinner
  },
  created () {
    this.getData(true)
    setInterval(this.getData, 2000)
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
          field: 'full_name'
        },
        {
          label: 'Progresso',
          field: 'progress',
          type: 'percentage'
        }
      ],
      rows: [],
      averageProgress: 0,
      numParticipants: 0,
      examName: '',
      loading: false
    }
  },
  methods: {
    getData (showLoading = false) {
      if (showLoading) {
        this.loading = true
      }
      axios
        .get(`/exams/${this.$route.params.examid}/progress_info`)
        .then(response => {
          console.log(response)
          this.examName = response.data.exam_name
          this.numParticipants = response.data.participants_count
          this.averageProgress = response.data.average_progress
          this.rows = response.data.participants_progress
        })
        .catch(error => {
          console.log(error)
        })
        .finally(() => {
          this.loading = false
        })
    },
    searchFn (row, col, cellValue, searchTerm) {
      console.log({
        row,
        col,
        cellValue,
        searchTerm
      })
      return (
        !this.selectedSearchCol ||
        (col.field == this.selectedSearchCol &&
          cellValue.toLowerCase().includes(searchTerm.toLowerCase()))
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

@-moz-document url-prefix() {
  progress {
    display: inline-block;
    width: 150px;
    height: 15px;
    padding: 0;
    margin: 0 20px;
    background: #ccc;
    border: 0;
    border-radius: 5px;
    text-align: left;
    position: relative;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.8em;
  }
}

::-moz-progress-bar {
  background: rgb(67, 56, 202);
  border-radius: 5px;
}
progress::-webkit-progress-value {
  /*display: inline-block;*/
  float: left;
  height: 15px;
  margin: 0px -10px 0 0;
  background: rgb(67, 56, 202);
  border-radius: 5px;
  box-shadow: 0px 0px 6px rgb(55, 45, 165) inset;
  transition: width 0.5s;
}
</style>
