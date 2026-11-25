<template>
  <div>
    <PageHeader title="投递管理" subtitle="记录每一家公司、岗位与进度，把求职过程变得有条理。">
      <template #actions>
        <div v-if="data.applications.length" class="relative">
          <AppIcon name="search" :size="14" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--site-muted)]" />
          <input v-model="keyword" class="input !h-[38px] w-[190px] !pl-9" placeholder="搜索公司、岗位" />
        </div>
        <button type="button" class="btn btn-primary" @click="openEditor()">
          <AppIcon name="plus" :size="15" />
          新建投递
        </button>
      </template>
    </PageHeader>

    <div v-if="data.applications.length" class="mt-7">
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="card px-4 py-3.5">
          <p class="text-[11.5px] text-muted">投递总数</p>
          <p class="mt-1 text-[24px] font-semibold leading-none tracking-tight num">{{ data.applications.length }}</p>
        </div>
        <div class="card px-4 py-3.5">
          <p class="text-[11.5px] text-muted">面试中</p>
          <p class="mt-1 text-[24px] font-semibold leading-none tracking-tight num">{{ countBy('interview') }}</p>
        </div>
        <div class="card px-4 py-3.5">
          <p class="text-[11.5px] text-muted">Offer</p>
          <p class="mt-1 text-[24px] font-semibold leading-none tracking-tight num">{{ countBy('offer') }}</p>
        </div>
        <div class="card px-4 py-3.5">
          <p class="text-[11.5px] text-muted">近期节点</p>
          <p class="mt-1 text-[24px] font-semibold leading-none tracking-tight num">{{ upcomingCount }}</p>
        </div>
      </div>

      <div class="mb-2 mt-5 flex items-center justify-between">
        <p class="text-[12.5px] text-muted">拖拽卡片可以改变阶段，移动端也可在卡片底部切换。</p>
        <span class="hidden text-[11.5px] text-muted sm:block">横向滑动查看全部阶段</span>
      </div>

      <div class="board-scroll scroll-thin -mx-1 px-1 pb-3">
        <div class="flex items-start gap-3">
          <section
            v-for="status in statuses"
            :key="status.id"
            class="board-col"
            :class="{ 'is-dragover': dragOver === status.id }"
            @dragover.prevent="onDragOver(status.id)"
            @dragleave="onDragLeave(status.id)"
            @drop.prevent="onDrop(status.id)"
          >
            <header class="flex items-center gap-2 px-1 pb-2.5">
              <span class="h-2 w-2 rounded-full" :style="{ background: dotColor(status.tone) }" />
              <span class="text-[13px] font-semibold">{{ status.label }}</span>
              <span class="chip chip-muted !px-1.5 !text-[10.5px]">{{ appsByStatus(status.id).length }}</span>
              <button
                type="button"
                class="icon-btn ml-auto !h-6 !w-6"
                :title="`在「${status.label}」中添加`"
                @click="openEditor(null, status.id)"
              >
                <AppIcon name="plus" :size="13" />
              </button>
            </header>

            <div class="space-y-2.5">
              <article
                v-for="app in appsByStatus(status.id)"
                :key="app.id"
                class="app-card group"
                draggable="true"
                @dragstart="onDragStart(app, $event)"
                @dragend="onDragEnd"
                @click="openEditor(app)"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="truncate text-[13.5px] font-semibold">{{ app.company || '未填写公司' }}</p>
                    <p class="mt-0.5 truncate text-[12px] text-muted">{{ app.role || '未填写岗位' }}</p>
                  </div>
                  <div class="flex flex-none items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <button type="button" class="icon-btn !h-6 !w-6" title="编辑" @click.stop="openEditor(app)">
                      <AppIcon name="edit" :size="12" />
                    </button>
                    <button type="button" class="icon-btn !h-6 !w-6 hover:text-red-600" title="删除" @click.stop="removeApp(app)">
                      <AppIcon name="trash" :size="12" />
                    </button>
                  </div>
                </div>

                <div class="mt-2 flex flex-wrap gap-1.5">
                  <span v-if="app.city" class="chip chip-muted !text-[10.5px]">{{ app.city }}</span>
                  <span v-if="app.channel" class="chip chip-muted !text-[10.5px]">{{ app.channel }}</span>
                  <span v-if="app.appliedAt" class="chip chip-muted !text-[10.5px] num">投递 {{ app.appliedAt.slice(5) }}</span>
                </div>

                <div v-if="app.nextStep" class="mt-2.5 rounded-lg bg-[var(--site-bg)] px-2.5 py-2">
                  <p class="text-[11.5px] font-medium leading-snug">{{ app.nextStep }}</p>
                  <p v-if="app.nextStepDate" class="mt-0.5 text-[10.5px] text-muted num">计划 {{ app.nextStepDate }}</p>
                </div>

                <div v-if="app.notes" class="mt-2 line-clamp-2 text-[11px] leading-relaxed text-muted">{{ app.notes }}</div>

                <div class="mt-2.5 flex items-center justify-between gap-2 border-t border-[var(--site-border)] pt-2">
                  <RouterLink
                    v-if="resumeTitle(app.resumeId)"
                    :to="`/resumes/${app.resumeId}`"
                    class="flex min-w-0 items-center gap-1 text-[10.5px] text-[var(--site-accent)] hover:underline"
                    @click.stop
                  >
                    <AppIcon name="file" :size="10" />
                    <span class="truncate">{{ resumeTitle(app.resumeId) }}</span>
                  </RouterLink>
                  <span v-else class="text-[10.5px] text-muted">未关联简历</span>
                  <select
                    class="status-select"
                    :value="app.status"
                    :aria-label="`修改 ${app.company} 的投递状态`"
                    @click.stop
                    @change.stop="changeStatus(app, $event)"
                  >
                    <option v-for="option in statuses" :key="option.id" :value="option.id">{{ option.short }}</option>
                  </select>
                </div>
              </article>

              <div v-if="!appsByStatus(status.id).length" class="rounded-xl border border-dashed border-[var(--site-border)] py-6 text-center text-[11.5px] text-muted">
                {{ keyword ? '无匹配记录' : '暂无记录，可拖入卡片' }}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <EmptyState
      v-else
      icon="send"
      title="让每一次投递都有迹可循"
      description="记录公司、岗位、渠道和进度，关联对应简历，重要节点一目了然。"
      class="mt-7"
    >
      <button type="button" class="btn btn-primary" @click="openEditor()">
        <AppIcon name="plus" :size="15" />
        新建投递
      </button>
      <button type="button" class="btn btn-secondary" @click="loadSample">
        <AppIcon name="sparkle" :size="15" />
        载入示例数据
      </button>
    </EmptyState>

    <BaseModal
      :open="editorOpen"
      :title="editingId ? '编辑投递' : '新建投递'"
      subtitle="记录岗位信息和下一步计划，避免错过关键节点。"
      width="md"
      @close="editorOpen = false"
    >
      <div class="space-y-4">
        <div class="field-grid">
          <BaseField label="公司" hint="填写公司或组织全称。">
            <input v-model="draft.company" class="input" placeholder="例如：字节跳动" />
          </BaseField>
          <BaseField label="岗位" hint="建议与招聘信息中的岗位名称保持一致。">
            <input v-model="draft.role" class="input" placeholder="例如：前端开发实习生" />
          </BaseField>
          <BaseField label="城市" optional hint="填写工作城市，远程可写“远程”。">
            <input v-model="draft.city" class="input" placeholder="北京 / 远程" />
          </BaseField>
          <BaseField label="投递渠道" optional hint="记录投递来源，方便之后复盘渠道效果。">
            <select v-model="draft.channel" class="select">
              <option value="">选择渠道</option>
              <option v-for="channel in channels" :key="channel" :value="channel">{{ channel }}</option>
            </select>
          </BaseField>
          <BaseField label="当前阶段" hint="也可以直接拖动卡片到其他阶段。">
            <select v-model="draft.status" class="select">
              <option v-for="status in statuses" :key="status.id" :value="status.id">{{ status.label }}</option>
            </select>
          </BaseField>
          <BaseField label="投递日期" optional hint="用于统计投递节奏，选填。">
            <input v-model="draft.appliedAt" class="input" type="date" />
          </BaseField>
        </div>

        <div class="field-grid">
          <BaseField label="下一步" optional hint="例如二面、笔试、HR 沟通。">
            <input v-model="draft.nextStep" class="input" placeholder="例如：二面 / 等笔试结果" />
          </BaseField>
          <BaseField label="计划日期" optional hint="设置日期后会在概览中提醒。">
            <input v-model="draft.nextStepDate" class="input" type="date" />
          </BaseField>
        </div>

        <BaseField label="关联简历" optional hint="关联后可从投递卡片直接打开对应简历。">
          <select v-model="draft.resumeId" class="select">
            <option value="">不关联简历</option>
            <option v-for="resume in data.resumes" :key="resume.id" :value="resume.id">
              {{ resume.title || '未命名简历' }}｜{{ resume.targetRole || '未填写岗位' }}
            </option>
          </select>
        </BaseField>

        <BaseField label="岗位链接" optional hint="粘贴招聘页面地址，方便随时回看 JD。">
          <input v-model="draft.link" class="input" placeholder="https://..." />
        </BaseField>

        <BaseField label="备注" optional hint="记录面试反馈、联系人或待办事项。">
          <textarea v-model="draft.notes" class="textarea" rows="3" placeholder="面试反馈、待办事项、联系人等" />
        </BaseField>
      </div>
      <template #footer>
        <button v-if="editingId" type="button" class="btn btn-danger mr-auto" @click="deleteFromEditor">删除</button>
        <button type="button" class="btn btn-secondary" @click="editorOpen = false">取消</button>
        <button type="button" class="btn btn-primary" :disabled="saving" @click="saveApp">
          {{ saving ? '保存中…' : '保存投递' }}
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
import AppIcon from '../components/ui/AppIcon.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { useDataStore } from '../stores/data'
import { confirmAction } from '../composables/useConfirm'
import { toast } from '../composables/useToast'
import { deepClone, todayDate, uid } from '../lib/utils'
import {
  APPLICATION_CHANNELS,
  APPLICATION_STATUSES,
  STATUS_DOT_COLORS,
} from '../lib/applications'

const data = useDataStore()
const keyword = ref('')
const editorOpen = ref(false)
const editingId = ref('')
const saving = ref(false)
const draft = ref(blankApp())
const dragId = ref('')
const dragOver = ref('')

const statuses = APPLICATION_STATUSES
const channels = APPLICATION_CHANNELS

const upcomingCount = computed(
  () =>
    data.applications.filter(
      (app) => app.nextStepDate && app.status !== 'rejected' && app.status !== 'wishlist',
    ).length,
)

const filteredApps = computed(() => {
  const term = keyword.value.trim().toLowerCase()
  if (!term) return data.applications
  return data.applications.filter((app) =>
    [app.company, app.role, app.city, app.channel, app.notes]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term)),
  )
})

function appsByStatus(statusId) {
  return filteredApps.value.filter((app) => app.status === statusId)
}

function dotColor(tone) {
  return STATUS_DOT_COLORS[tone] || '#94a3b8'
}

function countBy(status) {
  return data.applications.filter((app) => app.status === status).length
}

function resumeTitle(id) {
  if (!id) return ''
  return data.resumeById(id)?.title || ''
}

function blankApp() {
  return {
    id: '',
    company: '',
    role: '',
    city: '',
    channel: '',
    appliedAt: '',
    status: 'wishlist',
    nextStep: '',
    nextStepDate: '',
    resumeId: '',
    link: '',
    notes: '',
  }
}

function openEditor(app = null, presetStatus = '') {
  editingId.value = app?.id || ''
  if (app) {
    draft.value = deepClone(app)
  } else {
    draft.value = { ...blankApp(), id: uid(), status: presetStatus || 'wishlist' }
    if (presetStatus && presetStatus !== 'wishlist') draft.value.appliedAt = todayDate()
  }
  editorOpen.value = true
}

async function saveApp() {
  if (!draft.value.company.trim()) {
    toast('请填写公司名称', 'error')
    return
  }
  saving.value = true
  try {
    await data.upsert('applications', deepClone(draft.value))
    editorOpen.value = false
    toast(editingId.value ? '投递记录已更新' : '投递记录已创建')
  } finally {
    saving.value = false
  }
}

async function removeApp(app) {
  const ok = await confirmAction({
    title: '删除这条投递记录？',
    message: `「${app.company}｜${app.role || '未填写岗位'}」将被永久删除。`,
    confirmText: '删除记录',
    danger: true,
  })
  if (!ok) return
  await data.remove('applications', app.id)
  toast('投递记录已删除')
}

async function deleteFromEditor() {
  const app = data.applications.find((item) => item.id === editingId.value)
  if (!app) return
  editorOpen.value = false
  await removeApp(app)
}

async function changeStatus(app, event) {
  const status = event.target.value
  if (status === app.status) return
  await data.upsert('applications', { ...app, status })
  toast(`已移动到「${statuses.find((s) => s.id === status)?.label || '新阶段'}」`)
}

function onDragStart(app, event) {
  dragId.value = app.id
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', app.id)
  }
}

function onDragOver(status) {
  dragOver.value = status
}

function onDragLeave(status) {
  if (dragOver.value === status) dragOver.value = ''
}

async function onDrop(status) {
  dragOver.value = ''
  const id = dragId.value
  dragId.value = ''
  if (!id) return
  const app = data.applications.find((item) => item.id === id)
  if (!app || app.status === status) return
  await data.upsert('applications', { ...app, status })
  toast(`已移动到「${statuses.find((s) => s.id === status)?.label || '新阶段'}」`)
}

function onDragEnd() {
  dragOver.value = ''
  dragId.value = ''
}

async function loadSample() {
  await data.loadSample()
  toast('示例数据已载入，可在「数据与备份」中清除')
}
</script>
