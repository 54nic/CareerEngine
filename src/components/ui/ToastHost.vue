<template>
  <Teleport to="body">
    <div class="toast-host no-print" aria-live="polite">
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2">
        <button
          v-for="item in state.items"
          :key="item.id"
          type="button"
          class="toast text-left"
          :class="{ 'toast-error': item.type === 'error' }"
          @click="dismissToast(item.id)"
        >
          <AppIcon
            :name="item.type === 'error' ? 'alert' : 'check-circle'"
            :size="15"
            class="mt-0.5 flex-none"
            :class="item.type === 'error' ? 'text-rose-300' : 'text-emerald-300'"
          />
          <span class="flex-1">{{ item.message }}</span>
        </button>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import AppIcon from './AppIcon.vue'
import { dismissToast, useToastState } from '../../composables/useToast'

const state = useToastState()
</script>
