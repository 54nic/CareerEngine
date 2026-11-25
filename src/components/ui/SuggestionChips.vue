<template>
  <div class="flex flex-wrap gap-1.5">
    <button
      v-for="option in options"
      :key="option"
      type="button"
      class="chip chip-clickable"
      :class="{ 'chip-accent': modelValue === option }"
      @click="$emit('update:modelValue', option)"
    >
      {{ option }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  options: { type: Array, required: true },
  modelValue: { type: String, default: '' },
})

defineEmits(['update:modelValue'])
</script>
