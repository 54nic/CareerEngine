<template>
  <div class="space-y-6">
    <section class="hero-card">
      <div class="hero-glow" aria-hidden="true" />
      <div class="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-[660px]">
          <p class="flex items-center gap-2 text-[12px] font-medium text-[var(--site-muted)]">
            <span class="h-1.5 w-1.5 rounded-full bg-[var(--site-accent)]" />
            {{ greeting }}，{{ dateText }}
          </p>
          <h1 class="mt-3 text-[30px] font-semibold leading-[1.22] tracking-[-0.035em] sm:text-[34px]">
            {{ data.profile.name ? `${data.profile.name}，` : '' }}把每一段经历，<br class="hidden sm:block" />
            变成可复用的资产。
          </h1>
          <p class="mt-3 max-w-[520px] text-[14px] leading-relaxed text-[var(--site-muted)]">
            {{
              data.isEmpty
                ? '先从一份个人档案开始。录入项目、奖项与实习经历，之后可以针对不同岗位自由组合，生成专属简历。'
                : `已沉淀 ${data.totalRecords} 条经历与求职记录，其中 ${data.resumes.length} 份简历可以随时更新和导出。`
            }}
          </p>
          <div class="mt-6 flex flex-wrap items-center gap-2">
            <button type="button" class="btn btn-primary" @click="createResume">
              <AppIcon name="plus" :size="15" />
              新建简历
            </button>
            <RouterLink to="/projects" class="btn btn-secondary">
              <AppIcon name="folder" :size="15" />
              录入项目
            </RouterLink>
            <RouterLink to="/applications" class="btn btn-ghost">
              投递看板
              <AppIcon name="arrow-right" :size="14" />
            </RouterLink>
          </div>
        </div>

        <div class="flex items-center gap-4 rounded-2xl border border-[var(--site-border)] bg-[color-mix(in_srgb,var(--site-surface)_78%,transparent)] px-5 py-4 shadow-[0_10px_30px_rgba(20,20,30,0.04)] backdrop-blur">
          <div
            class="relative h-[72px] w-[72px] flex-none rounded-full"
            :style="{ background: `conic-gradient(var(--site-accent) ${data.profileCompleteness * 3.6}deg, #e9e9ee 0)` }"
          >
            <div class="absolute inset-[6px] flex flex-col items-center justify-center rounded-full bg-[var(--site-surface)]">
              <span class="text-[18px] font-semibold tracking-tight">{{ data.profileCompleteness }}%</span>
              <span class="text-[9.5px] text-muted">完善度</span>
            </div>
          </div>
          <div>
            <p class="text-[13px] font-semibold">档案完善度</p>
            <p class="mt-1 max-w-[150px] text-[11.5px] leading-relaxed text-muted">
              {{ completenessHint }}
            </p>
            <RouterLink to="/profile" class="btn-link mt-2 text-[12px]">
              去完善档案
              <AppIcon name="arrow-right" :size="12" />
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <RouterLink
        v-for="stat in stats"
        :key="stat.label"
        :to="stat.to"
        class="card card-hover flex items-center gap-3.5 p-4"
      >
        <span
          class="flex h-10 w-10 flex-none items-center justify-center rounded-xl"
          :style="{ background: stat.bg, color: stat.color }"
        >
          <AppIcon :name="stat.icon" :size="18" />
        </span>
        <span class="min-w-0">
          <span class="block text-[24px] font-semibold leading-none tracking-tight num">{{ stat.value }}</span>
          <span class="mt-1.5 block text-[12px] text-muted">{{ stat.label }}</span>
        </span>
        <AppIcon name="chevron-right" :size="14" class="ml-auto flex-none text-[#c3c3c9]" />
      </RouterLink>
    </section>

    <section v-if="data.isEmpty" class="card card-pad">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="eyebrow">开始使用</p>
          <h2 class="mt-1.5 text-[18px] font-semibold tracking-[-0.01em]">三步建立你的经历资产库</h2>
          <p class="mt-1.5 text-[13.5px] text-muted">先录入，再组合，最后导出。示例数据随时可以清除。</p>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" :disabled="loadingSample" @click="loadSample">
          <AppIcon name="sparkle" :size="14" />
          {{ loadingSample ? '正在载入…' : '载入示例数据' }}
        </button>
      </div>
      <div class="mt-6 grid gap-3 md:grid-cols-3">
        <div v-for="(step, index) in steps" :key="step.title" class="soft-panel flex flex-col p-4">
          <div class="flex items-center gap-2">
            <span class="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--site-fg)] text-[11px] font-semibold text-white">
              {{ index + 1 }}
            </span>
            <p class="text-[13.5px] font-semibold">{{ step.title }}</p>
          </div>
          <p class="mt-2 flex-1 text-[12.5px] leading-relaxed text-muted">{{ step.desc }}</p>
          <RouterLink :to="step.to" class="btn-link mt-3 text-[12.5px]">
            {{ step.action }}
            <AppIcon name="arrow-right" :size="12" />
          </RouterLink>
        </div>
      </div>
    </section>

    <div class="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <section class="card overflow-hidden">
        <div class="flex items-center justify-between border-b border-[var(--site-border)] px-5 py-4">
          <div>
            <h2 class="section-title">最近的简历</h2>
            <p class="mt-0.5 text-[12px] text-muted">为不同岗位维护不同版本</p>
          </div>
          <RouterLink to="/resumes" class="btn-link text-[12.5px]">
            全部简历
            <AppIcon name="chevron-right" :size="12" />
          </RouterLink>
        </div>

        <div v-if="recentResumes.length" class="divide-y divide-[var(--site-border)]">
          <RouterLink
            v-for="resume in recentResumes"
            :key="resume.id"
            :to="`/resumes/${resume.id}`"
            class="group flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-[color-mix(in_srgb,var(--site-bg)_55%,transparent)]"
          >
            <div class="resume-thumb" :style="{ '--thumb-accent': resume.accent }">
              <span class="resume-thumb-name" />
              <span class="resume-thumb-line w-[70%]" />
              <span class="resume-thumb-line w-[88%]" />
              <span class="resume-thumb-line w-[52%]" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-[14px] font-semibold">{{ resume.title || '未命名简历' }}</p>
              <p class="mt-0.5 truncate text-[12px] text-muted">
                {{ resume.targetRole || '未填写目标岗位' }}｜{{ templateName(resume.template) }}
              </p>
            </div>
            <div class="hidden text-right sm:block">
              <p class="text-[11.5px] text-muted">{{ relativeTime(resume.updatedAt) }}更新</p>
              <p class="mt-0.5 text-[11.5px] text-muted">{{ resume.sections?.length || 0 }} 个板块</p>
            </div>
            <AppIcon name="chevron-right" :size="14" class="text-[#c3c3c9] transition-transform group-hover:translate-x-0.5" />
          </RouterLink>
        </div>
        <div v-else class="px-5 py-10 text-center">
          <p class="text-[13.5px] text-muted">还没有简历。经历库里的内容可以随时组合进来。</p>
          <button type="button" class="btn btn-secondary btn-sm mt-3" @click="createResume">
            <AppIcon name="plus" :size="13" />
            创建第一份简历
          </button>
        </div>
      </section>

      <section class="card flex flex-col overflow-hidden">
        <div class="flex items-center justify-between border-b border-[var(--site-border)] px-5 py-4">
          <div>
            <h2 class="section-title">投递进展</h2>
            <p class="mt-0.5 text-[12px] text-muted">{{ data.applications.length }} 条投递记录</p>
          </div>
          <RouterLink to="/applications" class="btn-link text-[12.5px]">
            看板
            <AppIcon name="chevron-right" :size="12" />
          </RouterLink>
        </div>

        <div class="px-5 py-4">
          <div v-if="data.applications.length" class="flex h-2 overflow-hidden rounded-full bg-[var(--site-bg)]">
            <span
              v-for="segment in pipeline"
              :key="segment.id"
              :style="{ width: `${segment.percent}%`, background: segment.color }"
              :title="`${segment.label} ${segment.count}`"
            />
          </div>
          <div v-if="pipeline.some((s) => s.count)" class="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            <span v-for="segment in pipeline.filter((s) => s.count)" :key="segment.id" class="flex items-center gap-1.5 text-[11.5px] text-muted">
              <span class="h-1.5 w-1.5 rounded-full" :style="{ background: segment.color }" />
              {{ segment.label }} {{ segment.count }}
            </span>
          </div>
          <p v-else class="text-[12.5px] text-muted">记录投递后，这里会显示进度分布。</p>
        </div>

        <div class="mt-auto border-t border-[var(--site-border)] px-5 py-4">
          <p class="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-muted">近期节点</p>
          <div v-if="upcoming.length" class="mt-2.5 space-y-2.5">
            <div v-for="app in upcoming" :key="app.id" class="flex items-center gap-3">
              <span class="flex h-8 w-8 flex-none flex-col items-center justify-center rounded-lg bg-[var(--site-bg)] text-[9.5px] leading-none text-muted">
                <span class="font-semibold text-[var(--site-fg)]">{{ dueDay(app.nextStepDate) }}</span>
                <span>{{ dueMonth(app.nextStepDate) }}月</span>
              </span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-[12.5px] font-medium">{{ app.company }}｜{{ app.nextStep }}</p>
                <p class="truncate text-[11.5px] text-muted">{{ app.role || '未填写岗位' }}</p>
              </div>
              <span class="chip chip-muted">{{ statusLabel(app.status) }}</span>
            </div>
          </div>
          <p v-else class="mt-2 text-[12.5px] text-muted">
            {{ data.applications.length ? '近期没有待办节点。' : '还没有投递记录。' }}
          </p>
          <RouterLink to="/applications" class="btn-link mt-3 text-[12px]">
            {{ data.applications.length ? '管理投递' : '添加第一条投递' }}
            <AppIcon name="arrow-right" :size="12" />
          </RouterLink>
        </div>
      </section>
    </div>

    <section v-if="!data.isEmpty && data.resumes.length === 0" class="card flex flex-wrap items-center justify-between gap-4 px-5 py-4">
      <div class="flex items-center gap-3">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--site-accent)_9%,white)] text-[var(--site-accent)]">
          <AppIcon name="sparkle" :size="16" />
        </span>
        <div>
          <p class="text-[13.5px] font-semibold">经历库已经有内容了，生成第一份简历试试</p>
          <p class="text-[12px] text-muted">从档案和经历库快速生成草稿，再针对岗位微调。</p>
        </div>
      </div>
      <button type="button" class="btn btn-primary btn-sm" @click="createResume">生成简历</button>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '../components/ui/AppIcon.vue'
import { useDataStore } from '../stores/data'
import { toast } from '../composables/useToast'
import { relativeTime } from '../lib/utils'
import { APPLICATION_STATUSES, STATUS_DOT_COLORS } from '../lib/applications'
import { RESUME_TEMPLATES } from '../lib/resume'

const data = useDataStore()
const router = useRouter()
const loadingSample = ref(false)

const now = new Date()
const greeting = now.getHours() < 6 ? '夜深了' : now.getHours() < 12 ? '早上好' : now.getHours() < 18 ? '下午好' : '晚上好'
const dateText = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(now)

const stats = computed(() => [
  { label: '项目', value: data.projects.length, icon: 'folder', to: '/projects', bg: 'rgba(43,127,255,0.09)', color: '#2b7fff' },
  { label: '奖项', value: data.awards.length, icon: 'trophy', to: '/awards', bg: 'rgba(245,158,11,0.11)', color: '#b47408' },
  { label: '经历', value: data.experiences.length, icon: 'briefcase', to: '/experiences', bg: 'rgba(139,92,246,0.10)', color: '#7c4ddb' },
  { label: '简历', value: data.resumes.length, icon: 'file', to: '/resumes', bg: 'rgba(16,185,129,0.10)', color: '#0f9d76' },
])

const completenessHint = computed(() => {
  if (data.profileCompleteness >= 100) return '档案信息完整，可以专注打磨内容。'
  if (data.profileCompleteness >= 70) return '只差少量信息，补齐后简历会更完整。'
  if (data.profileCompleteness >= 30) return '继续补充经历，让简历更有说服力。'
  return '填写基本信息与教育背景，快速开始。'
})

const steps = [
  { title: '完善个人档案', desc: '姓名、联系方式、教育背景与技能，会成为每份简历的基础信息。', to: '/profile', action: '填写档案' },
  { title: '录入经历资产', desc: '项目、竞赛奖项、科研与实习经历统一保存，可被不同简历重复引用。', to: '/projects', action: '添加经历' },
  { title: '生成并导出简历', desc: '针对岗位选择内容与模板，实时预览后打印为 A4 PDF。', to: '/resumes', action: '进入简历工坊' },
]

const recentResumes = computed(() => data.resumes.slice(0, 3))

function templateName(id) {
  return RESUME_TEMPLATES.find((t) => t.id === id)?.name || '素白'
}

const pipeline = computed(() => {
  const total = data.applications.length || 1
  return APPLICATION_STATUSES.map((status) => {
    const count = data.applicationStats[status.id] || 0
    return {
      ...status,
      count,
      percent: (count / total) * 100,
      color: STATUS_DOT_COLORS[status.tone],
    }
  })
})

function statusLabel(id) {
  return APPLICATION_STATUSES.find((s) => s.id === id)?.short || ''
}

const upcoming = computed(() =>
  data.applications
    .filter((app) => app.nextStepDate && app.status !== 'rejected' && app.status !== 'wishlist')
    .sort((a, b) => a.nextStepDate.localeCompare(b.nextStepDate))
    .slice(0, 3),
)

function dueDay(date) {
  return date ? String(Number(date.slice(8, 10))) : '—'
}

function dueMonth(date) {
  return date ? String(Number(date.slice(5, 7))) : ''
}

async function createResume() {
  const resume = data.createResumeFromProfile()
  await data.addResume(resume)
  router.push(`/resumes/${resume.id}`)
}

async function loadSample() {
  loadingSample.value = true
  try {
    await data.loadSample()
    toast('示例数据已载入，可在「数据与备份」中清除')
  } finally {
    loadingSample.value = false
  }
}
</script>
