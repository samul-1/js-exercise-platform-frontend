<template>
  <div class="mx-2 my-5 md:mx-8">
    <Spinner v-if="loading"></Spinner>
    <header class="flex flex-col md:flex-row">
      <div class="flex">
        <router-link class="my-auto mr-2 " to="/exams"
          ><button
            class="pl-1.5 pr-2 text-white bg-gray-900 rounded-lg shadow-inner hover:bg-gray-700 py"
          >
            <i class="fas fa-chevron-left"></i></button
        ></router-link>
        <h1 class="text-2xl">Esame {{ exam.name }} in corso</h1>
      </div>
      <span class="my-auto font-light pt-0.5 ml-4 text-sm text-gray-600"
        ><i class="far fa-clock"></i> Termine previsto:
        <strong class="font-medium">{{
          formatTimestamp(exam.end_timestamp)
        }}</strong></span
      >
    </header>
    <div
      class="flex flex-col my-10 space-y-4 text-xl md:space-y-0 md:space-x-12 md:flex-row"
    >
      <h3>
        <i class="mr-2 text-gray-900 fas fa-user"></i>Numero partecipanti:
        <span class="ml-1">{{ numParticipants }}</span>
      </h3>
      <h3>
        <i class="mr-1 text-gray-900 fas fa-tasks"></i> Progresso medio:
        <progress
          class="mt-auto -ml-2"
          max="100"
          :value="(averageProgress * 100) / totalItemsCount"
        ></progress>
        <span class="md:-ml-3 text-md"
          >{{ Math.round((+averageProgress * 100) / totalItemsCount) }}%</span
        ><span class="font-light text-gray-400">
          ({{ Math.round(averageProgress) }} esercizi{{
            averageProgress == 1 ? 'o' : ''
          }}
          su {{ totalItemsCount }})</span
        >
      </h3>
      <h3>
        <i class="mr-1 fas fa-clipboard-check"></i> Esami terminati:
        <span class="ml-1">{{ numCompleted }}</span
        ><span class="font-light text-gray-400">
          (su {{ numParticipants }})</span
        >
      </h3>
    </div>
    <div class="mb-1">
      <div class="grid grid-cols-2 md:flex">
        <h3 class="col-span-2 mr-6">Filtra per:</h3>
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
      class="mt-2 mb-10 shadow-md"
      :columns="columns"
      :rows="rows"
      :search-options="{
        enabled: true,
        skipDiacritics: true,
        placeholder: 'Cerca...',
        searchFn
      }"
      :pagination-options="paginationOptions"
    >
      >
      <template slot="table-row" slot-scope="props">
        <div class="flex justify-end" v-if="props.column.field == 'progress'">
          <div class="">
            <progress
              class="rounded-2xl"
              max="100"
              :value="(+props.row[props.column.field] * 100) / totalItemsCount"
            ></progress>
          </div>
          <div class="w-36">
            <span>
              {{
                Math.round(
                  (+props.row[props.column.field] * 100) / totalItemsCount
                )
              }}%
              <span class="font-light text-gray-400">
                ({{ props.row[props.column.field] }} esercizi{{
                  props.row[props.column.field] == 1 ? 'o' : ''
                }})</span
              >
            </span>
          </div>
        </div>
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
import {
  formatTimestamp,
  redirectIfPermissionErrorOrSetMessage
} from '../utility'
import 'vue-good-table/dist/vue-good-table.css'
import { VueGoodTable } from 'vue-good-table'
export default {
  name: 'ExamProgressDashboard',
  components: {
    VueGoodTable,
    Spinner
  },
  created () {
    axios
      .get(`/exams/${this.$route.params.examid}/`)
      .then(response => {
        this.exam = response.data
      })
      .catch(error => {
        redirectIfPermissionErrorOrSetMessage(
          this,
          error,
          '/login/teacher',
          'Si è verificato un errore. Riprova.'
        )
      })
      .finally(() => {
        this.loading = false
      })
    this.getData(true)
    this.setIntervalHandle = setInterval(this.getData, 5000)
  },
  beforeRouteLeave (_to, _from, next) {
    if (this.setIntervalHandle) {
      clearInterval(this.setIntervalHandle)
    }
    next()
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
      totalItemsCount: 0,
      numParticipants: 0,
      numCompleted: 0,
      exam: { end_timestamp: '0' }, // default value to prevent it from complaining about calling `formatTimestamp' on undefined initially
      loading: false,
      setIntervalHandle: null,
      paginationOptions: {
        enabled: true,
        mode: 'pages',
        perPage: 10,
        position: 'top',
        perPageDropdown: [10, 20, 50],
        dropdownAllowAll: true,
        setCurrentPage: 1,
        nextLabel: 'prossima',
        prevLabel: 'precedente',
        rowsPerPageLabel: 'Righe per pagina',
        ofLabel: 'di',
        pageLabel: 'pagina', // for 'pages' mode
        allLabel: 'Tutte'
      }
    }
  },
  methods: {
    formatTimestamp,
    getData (showLoading = false) {
      if (showLoading) {
        this.loading = true
      }
      axios
        .get(`/exams/${this.$route.params.examid}/progress_info`)
        .then(response => {
          //console.log(response)
          this.examName = response.data.exam_name
          this.numParticipants = response.data.participants_count
          this.averageProgress = response.data.average_progress
          this.numCompleted = response.data.completed_count
          this.totalItemsCount = response.data.total_items_count
          this.rows = response.data.participants_progress
        })
        .catch(error => {
          redirectIfPermissionErrorOrSetMessage(
            this,
            error,
            '/login/teacher',
            'Si è verificato un errore scaricando i nuovi dati.',
            false
          )
        })
        .finally(() => {
          this.loading = false
        })
    },
    searchFn (row, col, cellValue, searchTerm) {
      if (this.selectedSearchCol == 'progress') {
        if (col.field != 'progress') {
          return false
        }
        //console.log(Math.round(+cellValue.slice(0, -4) / this.totalItemsCount))

        let conditions = searchTerm?.split(/([<>]=?\s*\d+),?\s*/)
        // we only want the first two odd tokens as we're taking in two conditions and there's
        // one empty token before and after each condition
        conditions = conditions.filter((el, idx) => idx % 2 && idx < 4)
        const conditionStr = conditions
          .map(
            s =>
              'Math.round(+cellValue.slice(0, -4) / this.totalItemsCount) ' + s
          )
          .join(' && ')
        if (!conditionStr.length) {
          return true
        }
        return eval(conditionStr)
      }
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
.vgt-wrap__footer {
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  background: linear-gradient(#fdfeff, #ffffff);
  border-bottom: 0;
}
.vgt-global-search {
  padding: 10px 0;
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  border: 1px solid #dcdfe6;
  /* border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem; */

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
  width: 160px;
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
  width: 120px;
  margin: 0 auto;
  background-color: rgb(221, 221, 221);
  border-radius: 5px;
  box-shadow: 0px 0px 5px rgba(199, 199, 199, 0.7) inset;
}

@-moz-document url-prefix() {
  progress {
    display: inline-block;
    width: 120px;
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
  border-radius: 25px;
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
