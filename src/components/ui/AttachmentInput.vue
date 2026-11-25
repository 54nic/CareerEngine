<template>
  <div>
    <div v-if="items.length" class="mb-2 space-y-2">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex items-center gap-2.5 rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] p-2"
      >
        <div class="flex h-9 w-9 flex-none items-center justify-center overflow-hidden rounded-lg bg-[var(--site-bg)] text-[var(--site-muted)]">
          <img v-if="isImage(item)" :src="item.dataUrl" :alt="item.name" class="h-full w-full object-cover" />
          <AppIcon v-else name="file" :size="16" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-[13px] font-medium">{{ item.name }}</p>
          <p class="text-[11.5px] text-muted">{{ formatBytes(item.size) }}</p>
        </div>
        <a :href="item.dataUrl" :download="item.name" class="icon-btn" title="下载附件">
          <AppIcon name="download" :size="14" />
        </a>
        <button type="button" class="icon-btn hover:text-red-600" title="移除附件" @click="removeItem(item.id)">
          <AppIcon name="trash" :size="14" />
        </button>
      </div>
    </div>

    <label
      class="attach-drop"
      :class="{ 'is-dragging': dragging }"
      @dragenter.prevent="dragging = true"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        :multiple="multiple"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.txt,.zip"
        @change="onChange"
      />
      <AppIcon name="upload" :size="15" />
      <span>{{ uploading ? '正在读取…' : multiple ? '添加附件' : '上传文件' }}</span>
      <span class="text-[11.5px] text-muted">{{ multiple ? '支持多选，也可拖入' : '选择文件，也可拖入' }}</span>
    </label>
    <p class="hint mt-1.5">单个文件不超过 6 MB，文件保存在本机浏览器中。</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { formatBytes, readFileAsDataURL, uid, safeFileName } from '../../lib/utils'
import { toast } from '../../composables/useToast'

const props = defineProps({
  modelValue: { type: [Array, Object], default: null },
  multiple: { type: Boolean, default: true },
})
const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const uploading = ref(false)
const dragging = ref(false)
const MAX_SIZE = 6 * 1024 * 1024

const items = computed(() => {
  if (props.multiple) return Array.isArray(props.modelValue) ? props.modelValue : []
  return props.modelValue ? [props.modelValue] : []
})

function isImage(item) {
  return String(item?.type || '').startsWith('image/')
}

function commit(list) {
  emit('update:modelValue', props.multiple ? list : list[0] || null)
}

async function addFiles(fileList) {
  const files = Array.from(fileList || [])
  if (!files.length) return
  const accepted = []
  for (const file of files) {
    if (file.size > MAX_SIZE) {
      toast(`「${file.name}」超过 6 MB，未添加`, 'error')
      continue
    }
    try {
      const dataUrl = await readFileAsDataURL(file)
      accepted.push({
        id: uid(),
        name: safeFileName(file.name, '附件'),
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl,
      })
    } catch {
      toast(`「${file.name}」读取失败`, 'error')
    }
  }
  if (!accepted.length) return
  commit(props.multiple ? [...items.value, ...accepted] : accepted.slice(-1))
  if (fileInput.value) fileInput.value.value = ''
}

async function onChange(event) {
  uploading.value = true
  await addFiles(event.target.files)
  uploading.value = false
}

async function onDrop(event) {
  dragging.value = false
  uploading.value = true
  await addFiles(event.dataTransfer?.files)
  uploading.value = false
}

function removeItem(id) {
  commit(items.value.filter((item) => item.id !== id))
}
</script>
