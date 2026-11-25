<template>
  <div>
    <div v-if="modelValue.length" class="space-y-2">
      <div v-for="(item, index) in modelValue" :key="index" class="flex items-start gap-2">
        <span class="mt-[13px] h-1 w-1 flex-none rounded-full bg-[var(--site-muted)]" />
        <textarea
          class="textarea"
          rows="2"
          style="min-height: 40px"
          :value="item"
          :placeholder="placeholder"
          @input="updateItem(index, $event.target.value)"
        />
        <button type="button" class="icon-btn mt-1" aria-label="删除这条要点" @click="removeItem(index)">
          <AppIcon name="x" :size="14" />
        </button>
      </div>
    </div>
    <button type="button" class="btn btn-ghost btn-sm mt-1 -ml-2 gap-1 text-[var(--site-accent)]" @click="addItem">
      <AppIcon name="plus" :size="13" />
      添加一条要点
    </button>
  </div>
</template>

<script setup>
import AppIcon from './AppIcon.vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  placeholder: { type: String, default: '描述职责、方法或可量化的成果' },
})
const emit = defineEmits(['update:modelValue'])

function updateItem(index, value) {
  const next = [...props.modelValue]
  next[index] = value
  emit('update:modelValue', next)
}

function addItem() {
  emit('update:modelValue', [...props.modelValue, ''])
}

function removeItem(index) {
  emit(
    'update:modelValue',
    props.modelValue.filter((_, i) => i !== index),
  )
}
</script>
