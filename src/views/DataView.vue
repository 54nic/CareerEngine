<template>
  <div>
    <PageHeader title="数据与备份" subtitle="数据默认保存在本机浏览器中。建议定期导出备份，换设备时也可以快速恢复。">
      <template #actions>
        <input ref="importInput" type="file" accept=".json,application/json" class="hidden" @change="onFileSelected" />
        <button type="button" class="btn btn-secondary" @click="importInput?.click()">
          <AppIcon name="upload" :size="15" />
          导入备份
        </button>
        <button type="button" class="btn btn-primary" @click="exportData">
          <AppIcon name="download" :size="15" />
          导出备份
        </button>
      </template>
    </PageHeader>

    <div v-if="data.storageError" class="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <AppIcon name="alert" :size="16" class="mt-0.5 flex-none text-amber-600" />
      <div>
        <p class="text-[13px] font-semibold text-amber-900">本地存储暂时不可用</p>
        <p class="mt-0.5 text-[12px] leading-relaxed text-amber-800">
          当前浏览器的 IndexedDB 无法写入，修改可能不会保存。请检查浏览器隐私设置，或更换浏览器后重试。
        </p>
      </div>
    </div>

    <div class="mt-6 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
      <div class="space-y-4">
        <section class="card card-pad">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="section-title">数据概览</h2>
              <p class="mt-1 text-[12.5px] text-muted">所有记录保存在本机 IndexedDB，不上传服务器。</p>
            </div>
            <span class="chip">{{ lastSavedText }}</span>
          </div>

          <div class="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            <div v-for="item in recordSummary" :key="item.label" class="soft-panel px-3 py-3">
              <AppIcon :name="item.icon" :size="15" class="text-[var(--site-muted)]" />
              <p class="mt-2 text-[21px] font-semibold leading-none tracking-tight num">{{ item.count }}</p>
              <p class="mt-1 text-[11.5px] text-muted">{{ item.label }}</p>
            </div>
          </div>

          <div class="mt-5 rounded-xl border border-[var(--site-border)] px-4 py-3.5">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="text-[12.5px] font-semibold">本地存储占用</p>
              <p class="text-[11.5px] text-muted num">
                {{ usage ? `${formatBytes(usage.usage)} / ${formatBytes(usage.quota)}` : '正在读取…' }}
              </p>
            </div>
            <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--site-bg)]">
              <div
                class="h-full rounded-full bg-[var(--site-accent)] transition-[width]"
                :style="{ width: `${usagePercent}%` }"
              />
            </div>
            <div class="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
              <span>{{ recordCount }} 条记录</span>
              <span>{{ attachmentInfo.count }} 个附件，{{ formatBytes(attachmentInfo.size) }}</span>
              <span>含快照简历 {{ data.resumes.length }} 份</span>
            </div>
          </div>
        </section>

        <section class="card card-pad">
          <h2 class="section-title">备份与恢复</h2>
          <p class="mt-1 text-[12.5px] text-muted">
            备份文件包含全部经历、简历快照、投递记录与附件，可在其他浏览器中恢复。
          </p>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div class="backup-tile">
              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(43,127,255,0.09)] text-[#2b7fff]">
                <AppIcon name="download" :size="17" />
              </div>
              <p class="mt-3 text-[13.5px] font-semibold">导出备份</p>
              <p class="mt-1 flex-1 text-[12px] leading-relaxed text-muted">
                生成一个 JSON 文件，包含当前全部数据。建议每次重要修改后导出一份。
              </p>
              <button type="button" class="btn btn-secondary btn-sm mt-3 self-start" @click="exportData">
                下载备份文件
              </button>
            </div>
            <div class="backup-tile">
              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(139,92,246,0.10)] text-[#7c4ddb]">
                <AppIcon name="upload" :size="17" />
              </div>
              <p class="mt-3 text-[13.5px] font-semibold">导入备份</p>
              <p class="mt-1 flex-1 text-[12px] leading-relaxed text-muted">
                从 JSON 备份恢复数据。导入会替换当前全部内容，建议先导出备份。
              </p>
              <button type="button" class="btn btn-secondary btn-sm mt-3 self-start" @click="importInput?.click()">
                选择备份文件
              </button>
            </div>
          </div>
          <p class="hint mt-3">导出文件名格式：履历引擎-备份-日期.json。文件中的附件以 Base64 内嵌。</p>
        </section>

        <section class="card card-pad">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="section-title">示例数据</h2>
              <p class="mt-1 text-[12.5px] text-muted">载入一份示例档案、项目、奖项和简历，快速体验完整流程。</p>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" :disabled="loadingSample" @click="loadSample">
              <AppIcon name="sparkle" :size="14" />
              {{ loadingSample ? '正在载入…' : '载入示例数据' }}
            </button>
          </div>
          <p class="hint mt-2">示例会以追加方式写入，不覆盖已有记录；可在下方「清空所有数据」中移除。</p>
        </section>

        <section class="card overflow-hidden border-[#f1d6d6]">
          <div class="border-b border-[#f5e2e2] bg-[#fdf7f7] px-5 py-4">
            <h2 class="section-title text-[#9f2d2d]">危险操作</h2>
            <p class="mt-1 text-[12px] text-[#a65d5d]">清空后无法恢复，请务必先导出备份。</p>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p class="text-[13.5px] font-semibold">清空所有本地数据</p>
              <p class="mt-0.5 text-[12px] text-muted">删除档案、项目、奖项、经历、简历与投递记录。</p>
            </div>
            <button type="button" class="btn btn-danger btn-sm" @click="clearAll">
              <AppIcon name="trash" :size="13" />
              清空所有数据
            </button>
          </div>
        </section>
      </div>

      <div class="space-y-4">
        <section class="card card-pad">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(16,185,129,0.10)] text-emerald-600">
            <AppIcon name="database" :size="19" />
          </div>
          <h2 class="mt-3 text-[15px] font-semibold">数据存在哪里？</h2>
          <p class="mt-2 text-[12.5px] leading-relaxed text-[#55555a]">
            履历引擎不需要注册登录。所有内容保存在当前浏览器的 IndexedDB 中，不会上传到任何服务器。
          </p>
          <ul class="mt-3 space-y-2 text-[12px] leading-relaxed text-muted">
            <li class="flex gap-2"><span class="mt-[7px] h-1 w-1 flex-none rounded-full bg-[var(--site-muted)]" />换浏览器、更换设备或清除浏览器数据后，本地内容不会自动迁移。</li>
            <li class="flex gap-2"><span class="mt-[7px] h-1 w-1 flex-none rounded-full bg-[var(--site-muted)]" />使用「导出备份」保存 JSON 文件，即可迁移或在其他设备恢复。</li>
            <li class="flex gap-2"><span class="mt-[7px] h-1 w-1 flex-none rounded-full bg-[var(--site-muted)]" />无痕模式下关闭窗口可能清除数据，请避免在无痕窗口中长期使用。</li>
          </ul>
        </section>

        <section class="card card-pad">
          <h2 class="section-title">备份包含什么</h2>
          <div class="mt-3 space-y-2.5">
            <div v-for="item in backupContents" :key="item.title" class="flex items-start gap-2.5">
              <AppIcon :name="item.icon" :size="14" class="mt-0.5 flex-none text-[var(--site-muted)]" />
              <div>
                <p class="text-[12.5px] font-medium">{{ item.title }}</p>
                <p class="mt-0.5 text-[11.5px] leading-relaxed text-muted">{{ item.desc }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="card card-pad">
          <div class="flex items-center gap-2">
            <AppIcon name="clock" :size="14" class="text-[var(--site-muted)]" />
            <h2 class="text-[13px] font-semibold">最近保存</h2>
          </div>
          <p class="mt-2 text-[12px] leading-relaxed text-muted">
            {{ data.lastSavedAt ? `${formatFullDate(new Date(data.lastSavedAt).toISOString())} ${timeText(new Date(data.lastSavedAt).toISOString())}` : '还没有保存记录' }}
          </p>
          <p class="mt-1 text-[11.5px] leading-relaxed text-muted">
            每次修改都会自动写入本地数据库，无需手动点击保存。
          </p>
        </section>
      </div>
    </div>

    <BaseModal
      :open="previewOpen"
      title="确认导入备份"
      subtitle="导入操作会替换当前全部数据，请确认文件内容。"
      width="md"
      @close="previewOpen = false"
    >
      <div v-if="pending" class="space-y-4">
        <div class="rounded-xl border border-[var(--site-border)] bg-[var(--site-bg)] px-4 py-3">
          <p class="text-[12px] text-muted">备份文件</p>
          <p class="mt-1 truncate text-[13.5px] font-medium">{{ pending.fileName }}</p>
          <p v-if="pending.exportedAt" class="mt-0.5 text-[11.5px] text-muted">导出于 {{ formatFullDate(pending.exportedAt) }}</p>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div v-for="item in pending.counts" :key="item.label" class="soft-panel px-3 py-2.5 text-center">
            <p class="text-[17px] font-semibold num">{{ item.count }}</p>
            <p class="mt-0.5 text-[11px] text-muted">{{ item.label }}</p>
          </div>
        </div>
        <div class="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
          <AppIcon name="alert" :size="14" class="mt-0.5 flex-none text-amber-600" />
          <p class="text-[12px] leading-relaxed text-amber-900">
            当前浏览器中的全部数据将被替换。若还没导出备份，建议先取消并导出一份。
          </p>
        </div>
      </div>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="previewOpen = false">取消</button>
        <button type="button" class="btn btn-primary" :disabled="importing" @click="confirmImport">
          {{ importing ? '正在导入…' : '确认替换并导入' }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import PageHeader from '../components/ui/PageHeader.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import { useDataStore } from '../stores/data'
import { confirmAction } from '../composables/useConfirm'
import { toast } from '../composables/useToast'
import { parseBackup } from '../lib/backup'
import { downloadJSON, formatBytes, formatFullDate, timeText, todayDate } from '../lib/utils'

const data = useDataStore()
const importInput = ref(null)
const usage = ref(null)
const previewOpen = ref(false)
const importing = ref(false)
const loadingSample = ref(false)
const pending = ref(null)

const recordSummary = computed(() => [
  { label: '项目', count: data.projects.length, icon: 'folder' },
  { label: '奖项', count: data.awards.length, icon: 'trophy' },
  { label: '经历', count: data.experiences.length, icon: 'briefcase' },
  { label: '简历', count: data.resumes.length, icon: 'file' },
  { label: '投递', count: data.applications.length, icon: 'send' },
])

const recordCount = computed(() => recordSummary.value.reduce((total, item) => total + item.count, 0))

const attachmentInfo = computed(() => {
  let count = 0
  let size = 0
  for (const project of data.projects) {
    for (const file of project.attachments || []) {
      count += 1
      size += Number(file.size) || 0
    }
  }
  for (const award of data.awards) {
    if (award.certificate) {
      count += 1
      size += Number(award.certificate.size) || 0
    }
  }
  return { count, size }
})

const usagePercent = computed(() => {
  if (!usage.value?.quota) return 0
  return Math.min(100, Math.max(0.6, (usage.value.usage / usage.value.quota) * 100))
})

const lastSavedText = computed(() => {
  if (!data.lastSavedAt) return '尚未保存'
  return `已保存 ${timeText(new Date(data.lastSavedAt).toISOString())}`
})

const backupContents = [
  { icon: 'user', title: '个人档案', desc: '基本信息、教育背景、技能分类与个人简介。' },
  { icon: 'folder', title: '经历资产', desc: '项目、奖项、实习科研经历，以及项目附件与证书。' },
  { icon: 'file', title: '简历快照', desc: '每份简历的独立内容与排版设置，完全按照保存时的状态恢复。' },
  { icon: 'send', title: '投递记录', desc: '公司、岗位、进度、下一步计划与关联简历。' },
]

async function refreshUsage() {
  if (!navigator.storage?.estimate) return
  try {
    usage.value = await navigator.storage.estimate()
  } catch {
    usage.value = null
  }
}

onMounted(refreshUsage)
watch(() => data.lastSavedAt, refreshUsage)

function exportData() {
  const backup = data.exportBackup()
  downloadJSON(`履历引擎-备份-${todayDate()}.json`, backup)
  toast('备份文件已开始下载')
}

async function onFileSelected(event) {
  const file = event.target.files?.[0]
  if (event.target) event.target.value = ''
  if (!file) return
  try {
    const text = await file.text()
    const raw = JSON.parse(text)
    const normalized = parseBackup(raw)
    pending.value = {
      fileName: file.name,
      exportedAt: raw.exportedAt || '',
      data: normalized,
      counts: [
        { label: '项目', count: normalized.projects.length },
        { label: '奖项', count: normalized.awards.length },
        { label: '经历', count: normalized.experiences.length },
        { label: '简历', count: normalized.resumes.length },
        { label: '投递', count: normalized.applications.length },
        { label: '档案', count: normalized.profile ? 1 : 0 },
      ],
    }
    previewOpen.value = true
  } catch (error) {
    toast(error instanceof SyntaxError ? '文件不是有效的 JSON' : error.message || '无法读取备份', 'error')
  }
}

async function confirmImport() {
  if (!pending.value) return
  importing.value = true
  try {
    await data.importBackup(pending.value.data)
    previewOpen.value = false
    toast('数据已从备份恢复')
    refreshUsage()
  } catch (error) {
    toast(error.message || '导入失败', 'error')
  } finally {
    importing.value = false
  }
}

async function clearAll() {
  const ok = await confirmAction({
    title: '清空所有本地数据？',
    message: '档案、项目、奖项、经历、简历与投递记录都会被永久删除，且无法恢复。建议先导出备份。',
    confirmText: '确认清空',
    danger: true,
  })
  if (!ok) return
  await data.clearAll()
  toast('本地数据已清空')
  refreshUsage()
}

async function loadSample() {
  if (!data.isEmpty) {
    const ok = await confirmAction({
      title: '载入示例数据？',
      message: '示例内容会追加到现有数据中，不会覆盖已有记录。稍后可在「清空所有数据」中移除。',
      confirmText: '载入示例',
    })
    if (!ok) return
  }
  loadingSample.value = true
  try {
    await data.loadSample()
    toast('示例数据已载入')
    refreshUsage()
  } finally {
    loadingSample.value = false
  }
}
</script>
