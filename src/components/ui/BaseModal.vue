<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" ref="backdrop" class="modal-backdrop no-print" @mousedown.self="onBackdrop">
        <div
          ref="panel"
          class="modal-card"
          role="dialog"
          aria-modal="true"
          :aria-label="title || '对话框'"
          tabindex="-1"
          :style="{ maxWidth: widthMap[width] || widthMap.md }"
          @mousedown.stop
        >
          <div class="modal-head">
            <div class="min-w-0">
              <h2 class="text-[18px] font-semibold tracking-[-0.01em]">{{ title }}</h2>
              <p v-if="subtitle" class="mt-1 text-[13px] leading-relaxed text-muted">{{ subtitle }}</p>
            </div>
            <button v-if="!hideClose" type="button" class="icon-btn -mr-1 -mt-1" aria-label="关闭" @click="close">
              <AppIcon name="x" :size="17" />
            </button>
          </div>
          <div class="modal-body scroll-thin">
            <slot />
          </div>
          <div v-if="$slots.footer" class="modal-foot">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  width: { type: String, default: 'md' },
  closeOnBackdrop: { type: Boolean, default: true },
  hideClose: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])
const backdrop = ref(null)
const panel = ref(null)

const widthMap = {
  sm: '440px',
  md: '580px',
  lg: '740px',
  xl: '940px',
  xxl: '1080px',
}

let lockCount = 0
let previousOverflow = ''

function lockScroll() {
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  lockCount += 1
}

function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) document.body.style.overflow = previousOverflow
}

function close() {
  emit('close')
}

function onBackdrop() {
  if (props.closeOnBackdrop) close()
}

function onKeydown(event) {
  if (event.key !== 'Escape') return
  const layers = document.querySelectorAll('.modal-backdrop')
  const isTop = layers.length > 0 && layers[layers.length - 1] === backdrop.value
  if (isTop) close()
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      lockScroll()
      document.addEventListener('keydown', onKeydown)
      nextTick(() => panel.value?.focus())
    } else {
      unlockScroll()
      document.removeEventListener('keydown', onKeydown)
    }
  },
)

onBeforeUnmount(() => {
  if (props.open) unlockScroll()
  document.removeEventListener('keydown', onKeydown)
})
</script>
