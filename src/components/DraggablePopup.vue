<template>
  <div
    ref="draggableContainer"
    id="draggable-container"
    style="top: 12%; left: 55%;"
    class="absolute z-10 w-2/6 overflow-y-auto transition-opacity duration-75 bg-gray-200 border border-gray-300 rounded-lg shadow-xl cursor-move resize opacity-80 hover:opacity-100 h-4/5"
    draggable="true"
  >
    <div
      :style="overlayStyle"
      class="absolute bg-transparent "
      @mousedown="dragMouseDown"
    ></div>
    <div class="flex w-full px-4 pt-3">
      <h1 class="mb-2 text-2xl font-medium">{{ title }}</h1>

      <button
        @click="$emit('hide')"
        class="z-30 ml-auto w-5 h-5 text-xs bg-red-400 rounded-full pt-0.5 text-white"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="px-4 pb-4">
      <div v-html="content"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DraggablePopup',
  props: {
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    }
  },
  mounted () {
    // keep draggable area in sync with actual scroll width and height of the popup
    setInterval(() => {
      // todo add check that the element actually exists to prevent annoying errors in console
      this.overlayHeight =
        window.document.getElementById('draggable-container').scrollHeight - 10
      this.overlayWidth =
        window.document.getElementById('draggable-container').scrollWidth - 10
    }, 1000)
  },
  data () {
    return {
      overlayHeight: null,
      overlayWidth: null,
      positions: {
        clientX: undefined,
        clientY: undefined,
        movementX: 0,
        movementY: 0
      }
    }
  },
  methods: {
    dragMouseDown: function (event) {
      event.preventDefault()
      // get the mouse cursor position at startup:
      this.positions.clientX = event.clientX
      this.positions.clientY = event.clientY
      document.onmousemove = this.elementDrag
      document.onmouseup = this.closeDragElement
    },
    elementDrag: function (event) {
      event.preventDefault()
      this.positions.movementX = this.positions.clientX - event.clientX
      this.positions.movementY = this.positions.clientY - event.clientY
      this.positions.clientX = event.clientX
      this.positions.clientY = event.clientY
      const maxX = window.innerWidth
      const maxY = window.innerHeight

      // prevent scrolling past the top or left of the page
      const resX = Math.max(
        this.$refs.draggableContainer.offsetLeft - this.positions.movementX,
        0
      )
      const resY = Math.max(
        this.$refs.draggableContainer.offsetTop - this.positions.movementY,
        0
      )
      const popup = window.document.getElementById('draggable-container')
      const popupW = popup.offsetWidth
      const popupH = popup.offsetHeight
      // set the element's new position:
      // prevent scrolling out of page from the right or bottom
      this.$refs.draggableContainer.style.top =
        (resY < maxY - popupH ? resY : maxY - popupH) + 'px'
      this.$refs.draggableContainer.style.left =
        (resX < maxX - popupW ? resX : maxX - popupW) + 'px'
    },
    closeDragElement () {
      document.onmouseup = null
      document.onmousemove = null
    },
    resize () {
      console.log('resizing')
    }
  },
  computed: {
    overlayStyle () {
      return `width: ${this.overlayWidth}px; height: ${this.overlayHeight}px;`
    }
  }
}
</script>

<style></style>
