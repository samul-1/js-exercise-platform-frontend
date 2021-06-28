<template>
  <div class="p-8 mx-12 my-6 border rounded-lg shadow-md">
    <div class="flex mb-4 space-x-2">
      <h1 class="my-auto text-xl font-medium">Domanda</h1>
      <p class="my-auto font-light text-gray-500">
        <span class="mx-3">
          Vista
          <span class="font-normal text-gray-700">{{
            question.num_appearances
          }}</span>
          volt{{ question.num_appearances == 1 ? 'a' : 'e' }}
        </span>
        <span class="" v-if="question.answers.length">
          Percentuale risposte corrette:
          <span class="font-normal text-gray-700">{{ correctPercent }}%</span>
        </span>
      </p>
    </div>
    <div v-highlight v-html="highlightCode(question.text)"></div>
    <h1 v-if="question.answers.length" class="my-2 text-xl font-medium">
      Risposte
    </h1>
    <div class="flex">
      <div class="my-auto">
        <div
          v-for="(answer, index) in question.answers"
          :key="'q-' + question.id + '-a-' + answer.id"
          class="flex space-x-4"
          :class="{
            'text-red-700': !answer.is_right_answer,
            'text-green-700': answer.is_right_answer
          }"
        >
          <span class="mr-1">{{ index + 1 }}.</span>
          <span v-highlight v-html="highlightCode(answer.text)"></span>
          <span class="font-light text-gray-500 "
            >&mdash;<span class="ml-4 font-normal text-gray-700">{{
              answer.selections
            }}</span>
            selezion{{ answer.selections == 1 ? 'e' : 'i' }}</span
          >
        </div>
      </div>
      <div v-if="question.answers.length" class="ml-auto">
        <apexchart
          width="350"
          height="300"
          type="bar"
          :options="chartOptions"
          :series="barChartData"
        ></apexchart>
      </div>
    </div>
  </div>
</template>

<script>
import 'vue-code-highlight/themes/duotone-sea.css'
import { highlightCode } from '../constants.js'

export default {
  name: 'QuestionWithStats',
  props: {
    question: {
      type: Object
    }
  },
  components: {},
  watch: {
    $props: {
      handler () {
        // render LaTeX code
        setTimeout(
          () => window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub]),
          10
        )
      },
      deep: true,
      immediate: true
    }
  },
  data () {
    return {}
  },
  methods: {
    highlightCode
  },
  computed: {
    correctPercent () {
      if (
        this.question.num_appearances == 0 ||
        this.question.answers.length == 0
      ) {
        return 0
      }
      const num_selections_correct_answers = this.question.answers
        .filter(a => a.is_right_answer)
        .reduce((acc, a) => {
          return acc + a.selections
        }, 0)
      if (!this.question.accepts_multiple_answers) {
        return (
          (num_selections_correct_answers * 100) / this.question.num_appearances
        )
      }
      return (
        (num_selections_correct_answers * 100) /
        this.question.answers.reduce((acc, a) => {
          return acc + a.selections
        }, 0)
      )
    },

    barChartData () {
      return this.question.answers.map(a => {
        return {
          data: [a.selections]
        }
      })
      // {
      //   data: this.question.answers.map(a => a.selections)
      // },
      // {
      //   data: this.question.answers.map(a => a.selections)
      // }
    },
    chartOptions () {
      return {
        grid: {
          show: false
        },
        colors: [
          // eslint-disable-next-line no-unused-vars
          ({ value, seriesIndex, w }) => {
            if (this.question.answers[seriesIndex].is_right_answer) {
              return '#047857'
            } else {
              return '#B91C1C'
            }
          }
        ],
        chart: {
          toolbar: {
            show: false
          },
          id: this.question.id + '-bar-chart'
        },
        stroke: {
          colors: ['transparent'],
          width: 10
        },
        xaxis: {
          categories: [...Array(this.question.answers.length).keys()].map(
            a => a + 1
          ),
          labels: {
            show: true,
            style: {
              colors: [],
              fontSize: '15px',
              fontWeight: 400,
              cssClass: 'apexcharts-xaxis-label'
            }
          }
        },
        yaxis: {
          labels: {
            show: false
          }
        },
        legend: {
          show: false
        },
        tooltip: {
          enabled: false
        },
        dataLabels: {
          textAnchor: 'middle',
          distributed: false,
          offsetX: 0,
          offsetY: 0,
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
            colors: undefined
          },
          background: {
            enabled: true,
            opacity: 0.1
          },
          dropShadow: {
            enabled: false,
            top: 1,
            left: 1,
            blur: 1,
            color: '#000',
            opacity: 0.45
          }
        }
      }
    }
  }
}
</script>
