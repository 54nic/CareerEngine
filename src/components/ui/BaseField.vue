<template>
  <div class="min-w-0">
    <label v-if="label" class="label" :for="fieldId">
      {{ label }}
      <span v-if="optional" class="font-normal text-muted">（可选）</span>
    </label>
    <slot />
    <p v-if="hint" class="hint mt-1.5">{{ hint }}</p>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  optional: { type: Boolean, default: false },
  fieldId: { type: String, default: undefined },
})
</script>
