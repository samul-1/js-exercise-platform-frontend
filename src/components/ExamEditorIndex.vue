<template>
  <div class="fixed bottom-5 right-5">
    <v-popover :placement="'left-end'">
      <button
        class="p-1 px-2 text-white transition-opacity duration-100 bg-gray-900 rounded-md opacity-40 hover:opacity-100"
      >
        <i class="fas fa-list"></i>
      </button>
      <template slot="popover">
        <div
          style="max-height: 500px"
          class="px-5 py-3 mb-10 -mr-8 overflow-y-auto transition-opacity duration-100 bg-gray-200 border border-gray-300 rounded-md shadow-2xl opacity-90 hover:opacity-100"
        >
          <h3 class="mb-2 text-lg font-medium">Indice domande</h3>
          <ul class="">
            <li
              class=""
              v-for="(category, index) in questionIndex"
              :key="category.id"
            >
              <span class="font-medium">{{ category.category.name }}</span>
              <ul class="ml-4 list-disc">
                <li
                  class="ml-4"
                  v-for="question in questionIndex[index].questions"
                  :key="question.id"
                >
                  <a
                    v-highlight
                    class="text-blue-700 hover:underline"
                    :href="'#q-' + question.id"
                    v-html="indexPreview(question.text)"
                  ></a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </template>
    </v-popover>
  </div>
</template>

<script>
import Vue from 'vue'
import { VTooltip, VPopover, VClosePopover } from 'v-tooltip'
import { highlightCode } from '../constants'

Vue.directive('tooltip', VTooltip)
Vue.directive('close-popover', VClosePopover)
Vue.component('v-popover', VPopover)
export default {
  name: 'ExamEditorIndex',
  props: {
    questions: {
      type: Array
    },
    exercises: {
      type: Array
    },
    questionCategories: {
      type: Array
    },
    exerciseCategories: {
      type: Array
    }
  },
  data () {
    return {
      options: {
        delay: {
          show: 1000
        },
        autoHide: false,
        defaultHideOnTargetClick: false
      }
    }
  },
  methods: {
    highlightCode,
    indexPreview (text) {
      const previewLength = 80
      const processedText = text
        .replace(/<\/?[^>]+>/g, '')
        .replace(/```([^`]*)```/g, '`$1`')
        .replace(/\n/g, '')

      const preview = processedText.slice(0, previewLength)

      const apostropheOccurrences = preview.split('`').length - 1

      return this.highlightCode(
        preview +
        (apostropheOccurrences % 2 ? '`' : '') + // enclose code tag if it was cut out by `slice`
          (processedText.length > previewLength ? '...' : '')
      )
    }
  },
  computed: {
    questionIndex () {
      return this.questionCategories.map(c => {
        return {
          category: c,
          questions: this.questions.filter(q => q.category === c.id)
        }
      })
    }
  }
}
</script>

<style></style>
