<template>
  <div>
    <PageHeader title="简历工坊" subtitle="针对不同岗位组合经历，保存内容快照，随时导出 A4 PDF。">
      <template #actions>
        <div v-if="data.resumes.length" class="relative">
          <AppIcon name="search" :size="14" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--site-muted)]" />
          <input v-model="keyword" class="input !h-[38px] w-[190px] !pl-9" placeholder="搜索简历" />
        </div>
        <button type="button" class="btn btn-primary" @click="openCreate">
          <AppIcon name="plus" :size="15" />
          新建简历
        </button>
      </template>
    </PageHeader>

    <div class="mt-6 flex items-start gap-2.5 rounded-xl border border-[color-mix(in_srgb,var(--site-accent)_16%,transparent)] bg-[color-mix(in_srgb,var(--site-accent)_5%,white)] px-4 py-3">
      <AppIcon name="sparkle" :size="15" class="mt-0.5 flex-none text-[var(--site-accent)]" />
      <p class="text-[12.5px] leading-relaxed text-[#4c4c50]">
        简历保存的是<strong class="font-semibold">独立内容快照</strong>：之后修改经历库，不会影响已经制作好的简历版本，投递记录更安心。
      </p>
    </div>

    <div v-if="data.resumes.length" class="mt-6">
      <div class="mb-3 flex items-center justify-between">
        <p class="text-[12.5px] text-muted">
          共 {{ data.resumes.length }} 份简历
          <span v-if="keyword">｜找到 {{ filteredResumes.length }} 份</span>
        </p>
        <div class="flex items-center gap-2">
          <span class="chip chip-muted">已自动保存</span>
        </div>
      </div>

      <div v-if="filteredResumes.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="resume in filteredResumes"
          :key="resume.id"
          class="card card-hover group flex cursor-pointer flex-col overflow-hidden"
          tabindex="0"
          role="button"
          :aria-label="`打开简历 ${resume.title}`"
          @click="openResume(resume)"
          @keydown.enter.prevent="openResume(resume)"
        >
          <div class="thumb-stage px-5 pb-1 pt-5">
            <ResumeThumb :template="resume.template" :accent="resume.accent" />
            <div class="thumb-actions">
              <button type="button" class="btn btn-secondary btn-sm shadow-sm" @click.stop="duplicate(resume)">
                <AppIcon name="copy" :size="12" />
                复制
              </button>
              <button type="button" class="btn btn-danger btn-sm" @click.stop="removeResume(resume)">
                <AppIcon name="trash" :size="12" />
                删除
              </button>
            </div>
          </div>

          <div class="flex flex-1 flex-col px-5 pb-4 pt-3">
            <div class="flex items-start justify-between gap-2">
              <h3 class="text-[15px] font-semibold leading-snug tracking-[-0.01em]">
                {{ resume.title || '未命名简历' }}
              </h3>
              <span class="chip chip-accent flex-none">{{ templateName(resume.template) }}</span>
            </div>
            <p class="mt-1 text-[12px] text-muted">
              {{ resume.targetRole || '未填写目标岗位' }}
            </p>
            <div class="mt-3 flex items-center justify-between border-t border-[var(--site-border)] pt-2.5 text-[11.5px] text-muted">
              <span>{{ visibleSectionCount(resume) }} 个板块，{{ itemCount(resume) }} 条内容</span>
              <span>{{ relativeTime(resume.updatedAt) }}更新</span>
            </div>
            <div class="mt-2 flex items-center gap-1 text-[12px] font-medium text-[var(--site-accent)] opacity-0 transition-opacity group-hover:opacity-100">
              打开编辑器
              <AppIcon name="arrow-right" :size="12" />
            </div>
          </div>
        </article>
      </div>

      <div v-else class="soft-panel py-14 text-center">
        <p class="text-[14px] font-medium">没有找到匹配的简历</p>
        <button type="button" class="btn-link mt-2" @click="keyword = ''">清除搜索</button>
      </div>
    </div>

    <EmptyState
      v-else
      icon="file"
      title="为不同岗位准备不同版本"
      description="从个人档案与经历库快速生成草稿，选择模板、调整板块顺序，并实时预览 A4 效果。"
      class="mt-6"
    >
      <button type="button" class="btn btn-primary" @click="openCreate">
        <AppIcon name="plus" :size="15" />
        创建第一份简历
      </button>
    </EmptyState>

    <BaseModal :open="createOpen" title="新建简历" subtitle="选择模板并命名，之后可以随时调整内容和样式。" width="lg" @close="createOpen = false">
      <div class="space-y-5">
        <div class="field-grid">
          <BaseField label="简历名称" hint="建议带上岗位或版本信息，方便区分。">
            <input v-model="newResume.title" class="input" placeholder="例如：前端开发，2027 届" />
          </BaseField>
          <BaseField label="目标岗位" optional hint="用于区分针对不同岗位的简历版本。">
            <input v-model="newResume.targetRole" class="input" placeholder="例如：前端开发工程师" />
          </BaseField>
        </div>

        <BaseField label="选择模板" hint="创建后仍可随时切换模板和配色。">
          <div class="grid grid-cols-3 gap-2.5">
            <button
              v-for="tpl in templates"
              :key="tpl.id"
              type="button"
              class="template-option"
              :class="{ 'is-selected': newResume.template === tpl.id }"
              @click="newResume.template = tpl.id"
            >
              <div class="pointer-events-none h-[104px] overflow-hidden rounded-lg border border-[var(--site-border)] bg-[#f3f3f6] p-2">
                <ResumeThumb :template="tpl.id" :accent="accentFor(tpl.id)" class="!h-full" />
              </div>
              <div class="mt-2 flex items-center justify-between">
                <span class="text-[13px] font-semibold">{{ tpl.name }}</span>
                <AppIcon v-if="newResume.template === tpl.id" name="check-circle" :size="13" class="text-[var(--site-accent)]" />
              </div>
              <span class="mt-0.5 block text-left text-[10.5px] text-muted">{{ tpl.tone }}</span>
            </button>
          </div>
        </BaseField>

        <div class="flex items-start gap-2 rounded-xl bg-[var(--site-bg)] px-3.5 py-3">
          <AppIcon name="alert" :size="14" class="mt-0.5 flex-none text-[var(--site-muted)]" />
          <p class="text-[11.5px] leading-relaxed text-muted">
            {{ data.profile.name || data.profile.educations.length
              ? '将从个人档案带入学籍、联系方式与技能；项目与经历稍后可在编辑器中选择加入。'
              : '个人档案还没有内容，先创建空白简历也可以，稍后在编辑器中直接填写。' }}
          </p>
        </div>
      </div>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="createOpen = false">取消</button>
        <button type="button" class="btn btn-primary" @click="createResume">创建并编辑</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '../components/ui/PageHeader.vue'
import BaseField from '../components/ui/BaseField.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import ResumeThumb from '../components/resume/ResumeThumb.vue'
import { useDataStore } from '../stores/data'
import { confirmAction } from '../composables/useConfirm'
import { toast } from '../composables/useToast'
import { relativeTime } from '../lib/utils'
import { RESUME_TEMPLATES, sectionHasContent } from '../lib/resume'

const data = useDataStore()
const router = useRouter()
const keyword = ref('')
const createOpen = ref(false)
const templates = RESUME_TEMPLATES

const newResume = ref(defaultDraft())

const filteredResumes = computed(() => {
  const term = keyword.value.trim().toLowerCase()
  if (!term) return data.resumes
  return data.resumes.filter((resume) =>
    [resume.title, resume.targetRole, resume.basics?.name]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term)),
  )
})

function defaultDraft() {
  return {
    title: '',
    targetRole: data.profile.headline || '',
    template: 'minimal',
  }
}

function openCreate() {
  newResume.value = defaultDraft()
  createOpen.value = true
}

function accentFor(templateId) {
  if (templateId === 'classic') return '#1d1d1f'
  if (templateId === 'modern') return '#35507d'
  return '#0b66e4'
}

function templateName(id) {
  return RESUME_TEMPLATES.find((t) => t.id === id)?.name || '素白'
}

function visibleSectionCount(resume) {
  return (resume.sections || []).filter((section) => section.visible !== false && sectionHasContent(section, resume)).length
}

function itemCount(resume) {
  return (resume.sections || []).reduce((total, section) => {
    if (section.type === 'custom') return total + (String(section.content || '').trim() ? 1 : 0)
    if (section.type === 'summary') return total + (String(resume.basics?.summary || '').trim() ? 1 : 0)
    return total + (section.items || []).length
  }, 0)
}

function openResume(resume) {
  router.push(`/resumes/${resume.id}`)
}

async function createResume() {
  const title = newResume.value.title.trim() || `${data.profile.name || '我的'}的简历`
  const resume = data.createResumeFromProfile({
    title,
    targetRole: newResume.value.targetRole.trim(),
    template: newResume.value.template,
    accent: accentFor(newResume.value.template),
  })
  await data.addResume(resume)
  createOpen.value = false
  toast('简历已创建')
  router.push(`/resumes/${resume.id}`)
}

async function duplicate(resume) {
  const copy = await data.duplicateResumeById(resume.id)
  if (copy) toast('已复制一份简历')
}

async function removeResume(resume) {
  const ok = await confirmAction({
    title: '删除这份简历？',
    message: `「${resume.title || '未命名简历'}」将被永久删除，关联的投递记录会解除简历引用。此操作不可撤销。`,
    confirmText: '删除简历',
    danger: true,
  })
  if (!ok) return
  await data.deleteResume(resume.id)
  toast('简历已删除')
}
</script>
