<template>
  <div class="tag-input-wrap" @click="focusInput">
    <span v-for="(tag, index) in modelValue" :key="`${tag}-${index}`" class="chip">
      {{ tag }}
      <button type="button" class="tag-remove" :aria-label="`移除 ${tag}`" @click.stop="removeTag(index)">
        <AppIcon name="x" :size="9" />
      </button>
    </span>
    <input
      ref="inputRef"
      v-model="draft"
      class="tag-input"
      type="text"
      :placeholder="modelValue.length ? '' : placeholder"
      @keydown="onKeydown"
      @blur="commit"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  placeholder: { type: String, default: '输入后按回车添加' },
})
const emit = defineEmits(['update:modelValue'])

const inputRef = ref(null)
const draft = ref('')

function focusInput() {
  inputRef.value?.focus()
}

function commit() {
  const raw = draft.value.trim()
  draft.value = ''
  if (!raw) return
  const candidates = raw
    .split(/[,，、]/)
    .map((item) => item.trim())
    .filter(Boolean)
  if (!candidates.length) return
  const next = [...props.modelValue]
  for (const candidate of candidates) {
    if (!next.includes(candidate)) next.push(candidate)
  }
  emit('update:modelValue', next)
}

function onKeydown(event) {
  if (event.isComposing) return
  if (event.key === 'Enter' || event.key === ',' || event.key === '，') {
    event.preventDefault()
    commit()
    return
  }
  if (event.key === 'Backspace' && !draft.value && props.modelValue.length) {
    emit('update:modelValue', props.modelValue.slice(0, -1))
  }
}

function removeTag(index) {
  emit(
    'update:modelValue',
    props.modelValue.filter((_, i) => i !== index),
  )
}
</script>
