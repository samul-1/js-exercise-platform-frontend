<template>
  <div
    class="p-12 my-6 transition-shadow duration-75 border border-gray-300 rounded-lg shadow-sm hover:shadow-md"
  >
    <div class="flex mb-4 space-x-2">
      <h1 class="my-auto mr-auto text-xl font-medium">
        Domanda in
        {{
          question.category_name.slice(0, 9).toLowerCase() == 'categoria'
            ? ''
            : 'categoria'
        }}
        {{ question.category_name }}
      </h1>
      <div class="my-auto text-lg font-light text-gray-600">
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
      </div>
    </div>
    <aggregated-question-introduction
      v-if="question.introduction"
      :text="question.introduction"
    ></aggregated-question-introduction>
    <div v-highlight v-html="highlightCode(question.text)"></div>
    <div
      class="my-2 text-sm text-center text-gray-500 cursor-pointer"
      @click="expanded = !expanded"
    >
      <i
        class="mr-1 far"
        :class="{ 'fa-eye': !expanded, 'fa-eye-slash': expanded }"
      ></i>
      <span class="underline"
        >{{ expanded ? 'Nascondi' : 'Mostra' }} dettagli risposte</span
      >
    </div>
    <div v-if="expanded" class="flex">
      <div class="my-auto">
        <h1
          v-if="question.answers.length"
          class="mb-4 text-xl font-medium w-min"
        >
          Risposte
        </h1>
        <div
          v-for="(answer, index) in question.answers"
          :key="'q-' + question.id + '-a-' + answer.id"
          class="flex space-x-4"
        >
          <span class="mr-1"
            ><i
              class="mr-1 far"
              :class="{
                'text-red-700 fa-times-circle': !answer.is_right_answer,
                'text-green-700 fa-check-circle': answer.is_right_answer
              }"
            ></i>
            {{ index + 1 }}.</span
          >
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
          width="300"
          height="250"
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
import { getCorrectPercent } from '../utility.js'
import AggregatedQuestionIntroduction from '../components/AggregatedQuestionIntroduction.vue'

export default {
  name: 'QuestionWithStats',
  props: {
    question: {
      type: Object
    }
  },
  components: {
    AggregatedQuestionIntroduction
  },
  watch: {
    expanded: function (newVal) {
      if (newVal) {
        // todo make this a function (`renderTex()`) and export it to utility.js
        setTimeout(
          () => window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub]),
          10
        )
      }
    },
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
    return {
      expanded: false
    }
  },
  methods: {
    highlightCode
  },
  computed: {
    correctPercent () {
      return getCorrectPercent(this.question)
    },

    barChartData () {
      return this.question.answers.map(a => {
        return {
          data: [a.selections]
        }
      })
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
              return '#10B981'
            } else {
              return '#EF4444'
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
