<template>
  <transition name="fade" @after-enter="showContent = true" appear>
    <div
      class="fixed top-0 left-0 flex items-center justify-center w-full h-full"
    >
      <div
        @click="chooseAndHide(confirmOnly ? 'yes' : 'no')"
        style="width: 100vw !important; height: 100vh !important"
        class="absolute z-10 w-full h-full transition-none bg-gray-900 opacity-80"
      ></div>
      <transition name="bounce" @after-leave="$emit(choice)">
        <div
          v-if="showContent"
          class="z-20 w-3/5 px-10 py-10 bg-white rounded-lg shadow-lg "
        >
          <div class="mb-10">
            <p class="mb-4 text-2xl">{{ string }}</p>
            <p class="mt-4 text-md">{{ subText }}</p>
          </div>
          <div class="flex mt-5">
            <button
              class="px-5 py-2 ml-auto mr-2 text-lg text-white transition-all duration-100 rounded-md"
              :class="{
                'bg-green-600 hover:bg-green-800': severity == 1,
                'bg-red-600 hover:bg-red-800': severity == 2
              }"
              @click="chooseAndHide('yes')"
            >
              {{ confirmOnly ? 'Ok' : 'Sì' }}
            </button>
            <button
              class="px-5 py-2 text-lg transition-all duration-150 border border-gray-200 rounded-md shadow hover:text-white hover:bg-gray-800"
              @click="chooseAndHide('no')"
              v-if="!confirmOnly"
            >
              No
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Dialog',
  props: {
    string: String,
    subText: String,
    dismissable: Boolean,
    severity: {
      type: Number,
      default: 1
    },
    confirmOnly: Boolean
  },
  data () {
    return {
      choice: '',
      showContent: false
    }
  },
  methods: {
    // make a method that, upon clicking button, puts in a 'selection' variable either
    // 'yes' or 'no', then does showContent = false, and the @after-leave will emit the value
    chooseAndHide (choice) {
      this.choice = choice
      this.showContent = false
    }
  }
}
</script>

<style>
.bounce-enter-active {
  animation: bounce-in 0.2s;
}
.bounce-leave-active {
  animation: bounce-in 0.25s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  50% {
    transform: scale(1.03);
    opacity: 0.9;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: 0.1s opacity ease-out;
}
</style>
