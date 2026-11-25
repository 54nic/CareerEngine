<template>
  <div>
    <PageHeader title="经历管理" subtitle="实习、科研、论文与校园经历——按时间线整理你的成长路径。">
      <template #actions>
        <button type="button" class="btn btn-primary" @click="openEditor()">
          <AppIcon name="plus" :size="15" />
          添加经历
        </button>
      </template>
    </PageHeader>

    <div v-if="data.experiences.length" class="mt-7">
      <div class="mb-4 flex flex-wrap items-center gap-1.5">
        <button
          v-for="option in typeOptions"
          :key="option.id"
          type="button"
          class="chip transition-colors"
          :class="activeType === option.id ? 'chip-accent' : 'hover:border-[var(--site-accent)]'"
          @click="activeType = option.id"
        >
          {{ option.label }}
          <span class="num">{{ countByType(option.id) }}</span>
        </button>
        <span class="ml-auto text-[12px] text-muted">共 {{ data.experiences.length }} 段经历</span>
      </div>

      <div class="relative space-y-3 pl-0">
        <article
          v-for="exp in filteredExperiences"
          :key="exp.id"
          class="card group flex items-start gap-4 p-5"
        >
          <div
            class="flex h-10 w-10 flex-none items-center justify-center rounded-xl"
            :style="{ background: toneStyle(exp.type).bg, color: toneStyle(exp.type).color }"
          >
            <AppIcon :name="typeIcon(exp.type)" :size="18" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="chip chip-muted">{{ typeLabel(exp.type) }}</span>
              <span class="text-[11.5px] text-muted num">{{ rangeText(exp.startDate, exp.endDate) || '未填写时间' }}</span>
              <span v-if="exp.location" class="text-[11.5px] text-muted">｜{{ exp.location }}</span>
            </div>
            <h3 class="mt-2 text-[15px] font-semibold leading-snug tracking-[-0.01em]">
              {{ exp.title || '未填写职位 / 角色' }}
            </h3>
            <p class="mt-0.5 text-[12.5px] text-muted">{{ exp.org || '未填写组织' }}</p>

            <ul v-if="exp.highlights?.filter(Boolean).length" class="mt-2.5 space-y-1">
              <li
                v-for="(item, index) in exp.highlights.filter(Boolean).slice(0, 3)"
                :key="index"
                class="flex gap-2 text-[12.5px] leading-relaxed text-[#55555a]"
              >
                <span class="mt-[7px] h-1 w-1 flex-none rounded-full bg-[#b5b5bc]" />
                <span>{{ item }}</span>
              </li>
            </ul>
            <p v-if="(exp.highlights?.filter(Boolean).length || 0) > 3" class="mt-1 text-[11.5px] text-muted">
              还有 {{ exp.highlights.filter(Boolean).length - 3 }} 条成果
            </p>
            <p v-else-if="!exp.highlights?.filter(Boolean).length && exp.description" class="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-[#55555a]">
              {{ exp.description }}
            </p>

            <div class="mt-3 flex items-center gap-1">
              <button type="button" class="btn btn-ghost btn-sm -ml-2 gap-1" @click="openEditor(exp)">
                <AppIcon name="edit" :size="13" />
                编辑
              </button>
              <button type="button" class="btn btn-ghost btn-sm !px-2 text-[var(--site-muted)] hover:!text-red-600" title="删除经历" @click="removeExperience(exp)">
                <AppIcon name="trash" :size="13" />
              </button>
              <span class="ml-auto text-[11px] text-muted">{{ relativeTime(exp.updatedAt) }}更新</span>
            </div>
          </div>
        </article>

        <div v-if="!filteredExperiences.length" class="soft-panel py-12 text-center">
          <p class="text-[14px] text-muted">这个分类下还没有经历</p>
        </div>
      </div>
    </div>

    <EmptyState
      v-else
      icon="briefcase"
      title="把经历串成一条线"
      description="实习、科研、论文、学生工作都值得记录。每条经历都可以被不同岗位的简历重复使用。"
      class="mt-7"
    >
      <button type="button" class="btn btn-primary" @click="openEditor()">
        <AppIcon name="plus" :size="15" />
        添加第一段经历
      </button>
      <button type="button" class="btn btn-secondary" @click="loadSample">
        <AppIcon name="sparkle" :size="15" />
        载入示例数据
      </button>
    </EmptyState>

    <BaseModal
      :open="editorOpen"
      :title="editingId ? '编辑经历' : '添加经历'"
      subtitle="写清楚角色、职责与结果，简历中可以按岗位挑选展示。"
      width="lg"
      @close="editorOpen = false"
    >
      <div class="space-y-4">
        <BaseField label="经历类型" hint="切换类型后，下方字段名称和建议会同步调整。">
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="(meta, key) in EXPERIENCE_TYPES"
              :key="key"
              type="button"
              class="chip transition-colors"
              :class="draft.type === key ? 'chip-accent' : 'hover:border-[var(--site-accent)]'"
              @click="draft.type = key"
            >
              {{ meta.label }}
            </button>
          </div>
        </BaseField>

        <div class="field-grid">
          <BaseField :label="orgLabel" hint="填写完整名称，方便在简历中准确呈现。">
            <input v-model="draft.org" class="input" :placeholder="orgPlaceholder" />
          </BaseField>
          <BaseField :label="roleLabel" hint="写清身份或职责，例如负责人、第二作者。">
            <input v-model="draft.title" class="input" :placeholder="rolePlaceholder" />
          </BaseField>
          <BaseField label="开始时间" hint="精确到月份即可。">
            <input v-model="draft.startDate" class="input" type="month" />
          </BaseField>
          <BaseField label="结束时间" hint="仍在进行中可以留空。">
            <input v-model="draft.endDate" class="input" type="month" />
          </BaseField>
          <BaseField label="地点" optional hint="填写城市、校区或“远程”。">
            <input v-model="draft.location" class="input" placeholder="杭州 / 远程" />
          </BaseField>
          <BaseField label="标签" optional hint="输入后按回车添加，也可以点击常用标签。">
            <TagInput v-model="draft.tags" placeholder="研发、用户研究" />
            <SuggestionChips
              :options="EXPERIENCE_TAG_OPTIONS"
              class="mt-2"
              @update:model-value="addTag"
            />
          </BaseField>
        </div>

        <BaseField label="内容要点" hint="优先写清做了什么、怎么做、结果如何，尽量带上数字。">
          <BulletListEditor v-model="draft.highlights" placeholder="例如：独立负责 6 个业务模块的组件封装与联调" />
        </BaseField>

        <BaseField label="补充描述" optional hint="补充团队规模、研究背景、论文摘要等背景信息。">
          <textarea v-model="draft.description" class="textarea" rows="3" placeholder="可以补充团队规模、研究背景或论文摘要。" />
        </BaseField>
      </div>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="editorOpen = false">取消</button>
        <button type="button" class="btn btn-primary" :disabled="saving" @click="saveExperience">
          {{ saving ? '保存中…' : '保存经历' }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import PageHeader from '../components/ui/PageHeader.vue'
import BaseField from '../components/ui/BaseField.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import BulletListEditor from '../components/ui/BulletListEditor.vue'
import SuggestionChips from '../components/ui/SuggestionChips.vue'
import TagInput from '../components/ui/TagInput.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { useDataStore } from '../stores/data'
import { confirmAction } from '../composables/useConfirm'
import { toast } from '../composables/useToast'
import { deepClone, rangeText, relativeTime, uid } from '../lib/utils'
import { EXPERIENCE_TYPES } from '../lib/resume'
import { EXPERIENCE_TAG_OPTIONS } from '../lib/suggestions'

const data = useDataStore()
const activeType = ref('all')
const editorOpen = ref(false)
const editingId = ref('')
const saving = ref(false)
const draft = ref(blankExperience())

const typeOptions = computed(() => [
  { id: 'all', label: '全部' },
  ...Object.entries(EXPERIENCE_TYPES).map(([id, meta]) => ({ id, label: meta.label })),
])

const typeTones = {
  blue: { bg: 'rgba(43,127,255,0.09)', color: '#2b7fff' },
  violet: { bg: 'rgba(139,92,246,0.10)', color: '#7c4ddb' },
  amber: { bg: 'rgba(245,158,11,0.11)', color: '#b47408' },
  green: { bg: 'rgba(16,185,129,0.10)', color: '#0f9d76' },
  gray: { bg: 'rgba(100,116,139,0.10)', color: '#64748b' },
}

const typeIcons = {
  internship: 'briefcase',
  research: 'sparkle',
  paper: 'file',
  campus: 'user',
  other: 'layers',
}

const filteredExperiences = computed(() =>
  activeType.value === 'all' ? data.experiences : data.experiences.filter((exp) => exp.type === activeType.value),
)

const orgLabel = computed(() =>
  draft.value.type === 'paper' ? '期刊 / 会议' : draft.value.type === 'campus' ? '组织 / 社团' : '公司 / 组织',
)
const roleLabel = computed(() => (draft.value.type === 'paper' ? '作者身份' : '职位 / 角色'))
const orgPlaceholder = computed(() => {
  if (draft.value.type === 'paper') return '例如：CHCI 2026'
  if (draft.value.type === 'campus') return '例如：计算机学院学生会'
  return '例如：某科技有限公司'
})
const rolePlaceholder = computed(() => {
  if (draft.value.type === 'paper') return '第二作者'
  if (draft.value.type === 'research') return '科研助理'
  return '前端开发实习生'
})

function typeLabel(id) {
  return EXPERIENCE_TYPES[id]?.label || '其他'
}

function toneStyle(id) {
  const tone = EXPERIENCE_TYPES[id]?.tone || 'gray'
  return typeTones[tone] || typeTones.gray
}

function typeIcon(id) {
  return typeIcons[id] || 'layers'
}

function addTag(tag) {
  if (!tag) return
  if (!Array.isArray(draft.value.tags)) draft.value.tags = []
  if (!draft.value.tags.includes(tag)) draft.value.tags.push(tag)
}

function countByType(id) {
  if (id === 'all') return data.experiences.length
  return data.experiences.filter((exp) => exp.type === id).length
}

function blankExperience() {
  return {
    id: '',
    type: 'internship',
    org: '',
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    highlights: [''],
    tags: [],
  }
}

function openEditor(exp = null) {
  editingId.value = exp?.id || ''
  draft.value = exp ? deepClone(exp) : { ...blankExperience(), id: uid() }
  if (!draft.value.highlights?.length) draft.value.highlights = ['']
  editorOpen.value = true
}

async function saveExperience() {
  if (!draft.value.org.trim()) {
    toast('请填写组织或公司名称', 'error')
    return
  }
  saving.value = true
  try {
    const payload = deepClone(draft.value)
    payload.highlights = (payload.highlights || []).filter((item) => String(item).trim())
    await data.upsert('experiences', payload)
    editorOpen.value = false
    toast(editingId.value ? '经历已更新' : '经历已保存')
  } finally {
    saving.value = false
  }
}

async function removeExperience(exp) {
  const ok = await confirmAction({
    title: '删除这段经历？',
    message: `「${exp.org || '未命名经历'}」将从经历库移除，已经生成的简历不受影响。`,
    confirmText: '删除经历',
    danger: true,
  })
  if (!ok) return
  await data.remove('experiences', exp.id)
  toast('经历已删除')
}

async function loadSample() {
  await data.loadSample()
  toast('示例数据已载入，可在「数据与备份」中清除')
}
</script>
