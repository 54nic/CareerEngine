<template>
  <div>
    <PageHeader title="项目管理" subtitle="课程项目、竞赛作品、个人产品——把做过的每件事完整记录下来。">
      <template #actions>
        <div v-if="data.projects.length" class="relative">
          <AppIcon name="search" :size="14" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--site-muted)]" />
          <input v-model="keyword" class="input !h-[38px] w-[190px] !pl-9" placeholder="搜索项目、技术栈" />
        </div>
        <button type="button" class="btn btn-primary" @click="openEditor()">
          <AppIcon name="plus" :size="15" />
          新建项目
        </button>
      </template>
    </PageHeader>

    <div v-if="data.projects.length" class="mt-7">
      <div class="mb-3 flex items-center justify-between">
        <p class="text-[12.5px] text-muted">
          共 {{ data.projects.length }} 个项目
          <span v-if="keyword">｜找到 {{ filteredProjects.length }} 个</span>
        </p>
        <p class="hidden text-[12px] text-muted sm:block">点击卡片编辑项目详情</p>
      </div>

      <div v-if="filteredProjects.length" class="grid gap-3.5 md:grid-cols-2">
        <article
          v-for="project in filteredProjects"
          :key="project.id"
          class="card card-hover group flex cursor-pointer flex-col p-5"
          tabindex="0"
          role="button"
          :aria-label="`编辑项目 ${project.name}`"
          @click="openEditor(project)"
          @keydown.enter.prevent="openEditor(project)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--site-accent)_8%,white)] text-[var(--site-accent)]">
              <AppIcon name="folder" :size="18" />
            </div>
            <div class="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <button type="button" class="icon-btn" title="编辑项目" @click.stop="openEditor(project)">
                <AppIcon name="edit" :size="14" />
              </button>
              <button type="button" class="icon-btn hover:text-red-600" title="删除项目" @click.stop="removeProject(project)">
                <AppIcon name="trash" :size="14" />
              </button>
            </div>
          </div>

          <div class="mt-3.5">
            <h3 class="text-[15.5px] font-semibold leading-snug tracking-[-0.01em]">
              {{ project.name || '未命名项目' }}
            </h3>
            <p class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted">
              <span v-if="project.role">{{ project.role }}</span>
              <span v-if="rangeText(project.startDate, project.endDate)" class="num">
                {{ rangeText(project.startDate, project.endDate) }}
              </span>
            </p>
          </div>

          <p class="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-[#55555a]">
            {{ project.summary || firstHighlight(project) || '还没有项目简介，点击补充项目背景与目标。' }}
          </p>

          <div v-if="project.techStack?.length" class="mt-3 flex flex-wrap gap-1.5">
            <span v-for="tech in project.techStack.slice(0, 5)" :key="tech" class="chip chip-muted">{{ tech }}</span>
            <span v-if="project.techStack.length > 5" class="chip chip-muted">+{{ project.techStack.length - 5 }}</span>
          </div>

          <div class="mt-auto flex items-center gap-3 border-t border-[var(--site-border)] pt-3 text-[11.5px] text-muted" :class="project.techStack?.length ? 'mt-4' : 'mt-4'">
            <span class="flex items-center gap-1">
              <AppIcon name="check" :size="12" />
              {{ (project.highlights || []).filter(Boolean).length }} 条成果
            </span>
            <span v-if="project.attachments?.length" class="flex items-center gap-1">
              <AppIcon name="paperclip" :size="12" />
              {{ project.attachments.length }}
            </span>
            <span class="ml-auto">{{ relativeTime(project.updatedAt) }}更新</span>
          </div>
        </article>
      </div>

      <div v-else class="soft-panel py-14 text-center">
        <p class="text-[14px] font-medium">没有找到匹配的项目</p>
        <button type="button" class="btn-link mt-2" @click="keyword = ''">清除搜索</button>
      </div>
    </div>

    <EmptyState
      v-else
      icon="folder"
      title="从第一个项目开始"
      description="记录项目背景、你的职责、技术栈与成果。之后可以在不同简历中重复引用，无需再次录入。"
      class="mt-7"
    >
      <button type="button" class="btn btn-primary" @click="openEditor()">
        <AppIcon name="plus" :size="15" />
        新建项目
      </button>
      <button type="button" class="btn btn-secondary" @click="loadSample">
        <AppIcon name="sparkle" :size="15" />
        载入示例数据
      </button>
    </EmptyState>

    <BaseModal
      :open="editorOpen"
      :title="editingId ? '编辑项目' : '新建项目'"
      subtitle="描述你做了什么、怎么做的、结果如何。保存后可随时引用到简历。"
      width="lg"
      @close="editorOpen = false"
    >
      <div class="space-y-5">
        <div class="field-grid">
          <BaseField label="项目名称" hint="写具体一点，方便之后快速识别。">
            <input v-model="draft.name" class="input" placeholder="例如：校园二手书交易平台" />
          </BaseField>
          <BaseField label="担任角色" hint="写清你在这个项目中的主要身份。">
            <input v-model="draft.role" class="input" list="project-role-options" placeholder="例如：前端负责人" />
            <datalist id="project-role-options">
              <option v-for="role in PROJECT_ROLE_OPTIONS" :key="role" :value="role" />
            </datalist>
          </BaseField>
          <BaseField label="开始时间" hint="项目开始时间。">
            <input v-model="draft.startDate" class="input" type="month" />
          </BaseField>
          <BaseField label="结束时间" hint="进行中的项目可以留空。">
            <input v-model="draft.endDate" class="input" type="month" />
          </BaseField>
        </div>

        <BaseField label="项目简介" optional hint="一两句话说明项目解决什么问题、服务谁，以及你的核心贡献。">
          <textarea v-model="draft.summary" class="textarea" rows="3" placeholder="例如：面向校内教材流转的轻量交易平台，支持发布、搜索、收藏与站内沟通。" />
        </BaseField>

        <BaseField label="个人职责与成果" hint="建议使用「动作 + 方法 + 结果」，有数据时写出量化结果。">
          <BulletListEditor
            v-model="draft.highlights"
            placeholder="例如：主导 3 个核心页面的组件拆分，将首屏加载时间从 3.2s 降到 1.4s"
          />
        </BaseField>

        <div class="field-grid">
          <BaseField label="技术栈" optional hint="回车添加，例如 Vue 3、TypeScript、MySQL。">
            <TagInput v-model="draft.techStack" placeholder="Vue 3、Vite、Tailwind CSS" />
          </BaseField>
          <BaseField label="标签" optional hint="用于分类和搜索，可点击下方常用标签。">
            <TagInput v-model="draft.tags" placeholder="团队项目、校园产品" />
            <SuggestionChips
              :options="PROJECT_TAG_OPTIONS"
              class="mt-2"
              @update:model-value="addTag"
            />
          </BaseField>
        </div>

        <BaseField label="相关链接" optional hint="可以放 GitHub、在线演示、作品集或设计稿。">
          <div class="space-y-2">
            <div v-for="(link, index) in draft.links" :key="index" class="flex items-center gap-2">
              <input v-model="link.label" class="input !w-[130px] flex-none" placeholder="链接名称" />
              <input v-model="link.url" class="input" placeholder="https://..." />
              <button type="button" class="icon-btn flex-none" title="移除链接" @click="draft.links.splice(index, 1)">
                <AppIcon name="x" :size="14" />
              </button>
            </div>
            <button type="button" class="btn btn-ghost btn-sm -ml-2 gap-1 text-[var(--site-accent)]" @click="draft.links.push({ label: '', url: '' })">
              <AppIcon name="plus" :size="13" />
              添加链接
            </button>
          </div>
        </BaseField>

        <BaseField label="附件" optional hint="作品集 PDF、项目截图、演示视频说明等，单个文件不超过 6 MB。">
          <AttachmentInput v-model="draft.attachments" />
        </BaseField>
      </div>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="editorOpen = false">取消</button>
        <button type="button" class="btn btn-primary" :disabled="saving" @click="saveProject">
          {{ saving ? '保存中…' : '保存项目' }}
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
import AttachmentInput from '../components/ui/AttachmentInput.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { useDataStore } from '../stores/data'
import { confirmAction } from '../composables/useConfirm'
import { toast } from '../composables/useToast'
import { deepClone, relativeTime, rangeText, uid } from '../lib/utils'
import { PROJECT_ROLE_OPTIONS, PROJECT_TAG_OPTIONS } from '../lib/suggestions'

const data = useDataStore()
const keyword = ref('')
const editorOpen = ref(false)
const editingId = ref('')
const saving = ref(false)
const draft = ref(blankProject())

const filteredProjects = computed(() => {
  const term = keyword.value.trim().toLowerCase()
  if (!term) return data.projects
  return data.projects.filter((project) =>
    [project.name, project.role, project.summary, ...(project.techStack || []), ...(project.tags || [])]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term)),
  )
})

function blankProject() {
  return {
    id: '',
    name: '',
    role: '',
    startDate: '',
    endDate: '',
    summary: '',
    highlights: [''],
    techStack: [],
    tags: [],
    links: [],
    attachments: [],
  }
}

function openEditor(project = null) {
  editingId.value = project?.id || ''
  draft.value = project ? deepClone(project) : { ...blankProject(), id: uid() }
  if (!draft.value.highlights?.length) draft.value.highlights = ['']
  if (!draft.value.links) draft.value.links = []
  if (!draft.value.attachments) draft.value.attachments = []
  editorOpen.value = true
}

function firstHighlight(project) {
  return (project.highlights || []).find((item) => String(item).trim())
}

function addTag(tag) {
  if (!tag) return
  if (!Array.isArray(draft.value.tags)) draft.value.tags = []
  if (!draft.value.tags.includes(tag)) draft.value.tags.push(tag)
}

async function saveProject() {
  if (!draft.value.name.trim()) {
    toast('请填写项目名称', 'error')
    return
  }
  saving.value = true
  try {
    const payload = deepClone(draft.value)
    payload.highlights = (payload.highlights || []).filter((item) => String(item).trim())
    payload.links = (payload.links || []).filter((link) => link.url.trim() || link.label.trim())
    await data.upsert('projects', payload)
    editorOpen.value = false
    toast(editingId.value ? '项目已更新' : '项目已保存')
  } finally {
    saving.value = false
  }
}

async function removeProject(project) {
  const ok = await confirmAction({
    title: '删除这个项目？',
    message: `「${project.name || '未命名项目'}」将从经历库移除，已经生成的简历不受影响。`,
    confirmText: '删除项目',
    danger: true,
  })
  if (!ok) return
  await data.remove('projects', project.id)
  toast('项目已删除')
}

async function loadSample() {
  await data.loadSample()
  toast('示例数据已载入，可在「数据与备份」中清除')
}
</script>
