<template>
  <BaseModal
    :open="state.open"
    :title="state.title"
    width="sm"
    :close-on-backdrop="false"
    @close="finishConfirm(false)"
  >
    <p class="text-[14px] leading-relaxed text-[#4c4c50]">{{ state.message }}</p>
    <template #footer>
      <button type="button" class="btn btn-secondary" @click="finishConfirm(false)">{{ state.cancelText }}</button>
      <button
        type="button"
        class="btn"
        :class="state.danger ? 'btn-danger' : 'btn-primary'"
        @click="finishConfirm(true)"
      >
        {{ state.confirmText }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue'
import { finishConfirm, useConfirmState } from '../../composables/useConfirm'

const state = useConfirmState()
</script>
