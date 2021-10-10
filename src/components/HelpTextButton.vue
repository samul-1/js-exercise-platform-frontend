<template>
  <div class="hidden md:inline relative mx-0.5 my-auto bottom-2">
    <div class="mb-auto text-xs" v-tooltip="tooltip">
      <i class="text-gray-400 fas fa-question-circle"></i>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { VTooltip, VPopover, VClosePopover } from 'v-tooltip'

Vue.directive('tooltip', VTooltip)
Vue.directive('close-popover', VClosePopover)
Vue.component('v-popover', VPopover)
export default {
  name: 'HelpTextButton',
  props: {
    helpText: {
      type: String
    },
    width: {
      type: Number,
      default: 80
    }
  },
  data () {
    return {
      widths: 'w-40, w-80', // need to explicitly mention them to avoid Tailwind CSS purging them in production
      tooltip: {
        content: this.helpText,
        classes: `bg-gray-50 p-3 rounded-md shadow-2xl border border-gray-300 w-${this.width} tooltip`,
        delay: { show: 100, hide: 600 }
      }
    }
  }
}
</script>

<style>
.tooltip {
  display: block !important;
  z-index: 10000;
}

.tooltip[aria-hidden='true'] {
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.15s, visibility 0.15s;
}

.tooltip[aria-hidden='false'] {
  visibility: visible;
  opacity: 1;
  transition: opacity 0.35s;
}
</style>
