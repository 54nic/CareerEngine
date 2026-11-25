<template>
  <div class="flex flex-col items-center justify-center rounded-[var(--site-radius)] border border-dashed border-[var(--site-border)] bg-[color-mix(in_srgb,var(--site-surface)_55%,transparent)] px-6 py-14 text-center">
    <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--site-surface)] text-[var(--site-muted)] shadow-sm ring-1 ring-[var(--site-border)]">
      <AppIcon :name="icon" :size="21" />
    </div>
    <h3 class="text-[15.5px] font-semibold">{{ title }}</h3>
    <p v-if="description" class="mt-1.5 max-w-[420px] text-[13.5px] leading-relaxed text-muted">{{ description }}</p>
    <div v-if="$slots.default" class="mt-5 flex flex-wrap items-center justify-center gap-2">
      <slot />
    </div>
  </div>
</template>

<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  icon: { type: String, default: 'inbox' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>
