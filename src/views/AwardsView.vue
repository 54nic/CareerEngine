<template>
  <div>
    <PageHeader title="奖项竞赛" subtitle="竞赛、奖学金与证书集中管理，证书文件也一并留存。">
      <template #actions>
        <button type="button" class="btn btn-primary" @click="openEditor()">
          <AppIcon name="plus" :size="15" />
          记录奖项
        </button>
      </template>
    </PageHeader>

    <div v-if="data.awards.length" class="mt-7">
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <button
          v-for="level in levelOptions"
          :key="level"
          type="button"
          class="chip transition-colors"
          :class="activeLevel === level ? 'chip-accent' : 'hover:border-[var(--site-accent)]'"
          @click="activeLevel = level"
        >
          {{ level }}
          <span class="num">{{ countByLevel(level) }}</span>
        </button>
        <span class="ml-auto text-[12px] text-muted">共 {{ data.awards.length }} 项荣誉</span>
      </div>

      <div class="grid gap-3.5 md:grid-cols-2">
        <article
          v-for="award in filteredAwards"
          :key="award.id"
          class="card card-hover group flex items-start gap-4 p-5"
        >
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-1.5">
              <span v-if="award.level" class="chip chip-accent">{{ award.level }}</span>
              <span v-if="award.rank" class="chip">{{ award.rank }}</span>
              <span v-if="award.date" class="chip chip-muted num">{{ monthText(award.date) }}</span>
            </div>
            <h3 class="mt-2.5 text-[15px] font-semibold leading-snug tracking-[-0.01em]">
              {{ award.title || '未命名奖项' }}
            </h3>
            <p v-if="award.issuer" class="mt-1 text-[12px] text-muted">{{ award.issuer }}</p>
            <p v-if="award.description" class="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#55555a]">
              {{ award.description }}
            </p>
            <div class="mt-3 flex items-center gap-1">
              <button type="button" class="btn btn-ghost btn-sm -ml-2 gap-1" @click="openEditor(award)">
                <AppIcon name="edit" :size="13" />
                编辑
              </button>
              <button v-if="award.certificate" type="button" class="btn btn-ghost btn-sm gap-1" @click="previewCertificate(award.certificate)">
                <AppIcon name="paperclip" :size="13" />
                查看证书
              </button>
              <button type="button" class="btn btn-ghost btn-sm ml-auto !px-2 text-[var(--site-muted)] hover:!text-red-600" title="删除奖项" @click="removeAward(award)">
                <AppIcon name="trash" :size="13" />
              </button>
            </div>
          </div>

          <button
            v-if="award.certificate"
            type="button"
            class="cert-thumb flex-none"
            :title="`查看 ${award.certificate.name}`"
            @click="previewCertificate(award.certificate)"
          >
            <img v-if="isImage(award.certificate)" :src="award.certificate.dataUrl" :alt="award.certificate.name" />
            <AppIcon v-else name="file" :size="20" />
          </button>
          <div v-else class="cert-placeholder flex-none">
            <AppIcon name="trophy" :size="19" />
          </div>
        </article>
      </div>

      <div v-if="!filteredAwards.length" class="soft-panel mt-3 py-12 text-center">
        <p class="text-[14px] text-muted">这个级别下还没有奖项</p>
      </div>
    </div>

    <EmptyState
      v-else
      icon="trophy"
      title="记录值得被看见的荣誉"
      description="竞赛、奖学金、荣誉称号都可以记录，并上传证书图片或 PDF，方便在投递时快速核对。"
      class="mt-7"
    >
      <button type="button" class="btn btn-primary" @click="openEditor()">
        <AppIcon name="plus" :size="15" />
        记录第一个奖项
      </button>
      <button type="button" class="btn btn-secondary" @click="loadSample">
        <AppIcon name="sparkle" :size="15" />
        载入示例数据
      </button>
    </EmptyState>

    <BaseModal
      :open="editorOpen"
      :title="editingId ? '编辑奖项' : '记录奖项'"
      subtitle="填写奖项信息，并可选上传证书文件。"
      width="md"
      @close="editorOpen = false"
    >
      <div class="space-y-4">
        <BaseField label="奖项名称" hint="填写赛事、奖学金或荣誉称号的完整名称。">
          <input v-model="draft.title" class="input" placeholder="例如：中国大学生计算机设计大赛" />
        </BaseField>
        <div class="field-grid">
          <BaseField label="级别" hint="可按颁发范围选择，也支持自己填写。">
            <input v-model="draft.level" class="input" list="award-levels" placeholder="国家级 / 省级 / 校级" />
            <datalist id="award-levels">
              <option v-for="level in AWARD_LEVEL_OPTIONS" :key="level" :value="level" />
            </datalist>
            <SuggestionChips
              v-model="draft.level"
              :options="AWARD_LEVEL_OPTIONS"
              class="mt-2"
            />
          </BaseField>
          <BaseField label="名次 / 等级" optional hint="例如一等奖、金奖、优秀奖。">
            <input v-model="draft.rank" class="input" list="award-ranks" placeholder="一等奖 / 金奖 / 优秀奖" />
            <datalist id="award-ranks">
              <option v-for="rank in AWARD_RANK_OPTIONS" :key="rank" :value="rank" />
            </datalist>
          </BaseField>
          <BaseField label="获奖时间" hint="一般填写获奖年月。">
            <input v-model="draft.date" class="input" type="month" />
          </BaseField>
          <BaseField label="颁发单位" optional hint="填写主办方、组委会或学校名称。">
            <input v-model="draft.issuer" class="input" placeholder="例如：大赛组委会" />
          </BaseField>
        </div>
        <BaseField label="说明" optional hint="简要说明作品内容、个人贡献或评选范围。">
          <textarea v-model="draft.description" class="textarea" rows="3" placeholder="作品内容、个人贡献或评选范围" />
        </BaseField>
        <BaseField label="证书文件" optional hint="支持图片或 PDF，文件仅保存在本地浏览器。">
          <AttachmentInput v-model="draft.certificate" :multiple="false" />
        </BaseField>
      </div>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="editorOpen = false">取消</button>
        <button type="button" class="btn btn-primary" :disabled="saving" @click="saveAward">
          {{ saving ? '保存中…' : '保存奖项' }}
        </button>
      </template>
    </BaseModal>

    <BaseModal
      :open="certOpen"
      :title="certItem?.name || '证书预览'"
      width="xl"
      @close="certOpen = false"
    >
      <img
        v-if="certItem && isImage(certItem)"
        :src="certItem.dataUrl"
        :alt="certItem.name"
        class="mx-auto max-h-[70vh] rounded-lg object-contain"
      />
      <div v-else class="py-10 text-center">
        <p class="text-[13.5px] text-muted">该文件无法直接预览，请下载后查看。</p>
      </div>
      <template #footer>
        <a v-if="certItem" :href="certItem.dataUrl" :download="certItem.name" class="btn btn-secondary">
          <AppIcon name="download" :size="14" />
          下载证书
        </a>
        <button type="button" class="btn btn-primary" @click="certOpen = false">关闭</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import PageHeader from '../components/ui/PageHeader.vue'
import BaseField from '../components/ui/BaseField.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import AttachmentInput from '../components/ui/AttachmentInput.vue'
import SuggestionChips from '../components/ui/SuggestionChips.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { useDataStore } from '../stores/data'
import { confirmAction } from '../composables/useConfirm'
import { toast } from '../composables/useToast'
import { deepClone, monthText, uid } from '../lib/utils'
import { AWARD_LEVEL_OPTIONS, AWARD_RANK_OPTIONS } from '../lib/suggestions'

const data = useDataStore()
const activeLevel = ref('全部')
const editorOpen = ref(false)
const editingId = ref('')
const saving = ref(false)
const draft = ref(blankAward())
const certOpen = ref(false)
const certItem = ref(null)

const levelOptions = computed(() => ['全部', ...new Set(data.awards.map((a) => a.level).filter(Boolean))])

const filteredAwards = computed(() =>
  activeLevel.value === '全部' ? data.awards : data.awards.filter((a) => a.level === activeLevel.value),
)

function countByLevel(level) {
  if (level === '全部') return data.awards.length
  return data.awards.filter((a) => a.level === level).length
}

function blankAward() {
  return {
    id: '',
    title: '',
    level: '',
    rank: '',
    date: '',
    issuer: '',
    description: '',
    certificate: null,
  }
}

function isImage(item) {
  return String(item?.type || '').startsWith('image/')
}

function openEditor(award = null) {
  editingId.value = award?.id || ''
  draft.value = award ? deepClone(award) : { ...blankAward(), id: uid() }
  editorOpen.value = true
}

async function saveAward() {
  if (!draft.value.title.trim()) {
    toast('请填写奖项名称', 'error')
    return
  }
  saving.value = true
  try {
    await data.upsert('awards', deepClone(draft.value))
    editorOpen.value = false
    toast(editingId.value ? '奖项已更新' : '奖项已保存')
  } finally {
    saving.value = false
  }
}

async function removeAward(award) {
  const ok = await confirmAction({
    title: '删除这个奖项？',
    message: `「${award.title || '未命名奖项'}」将从经历库移除，已经生成的简历不受影响。`,
    confirmText: '删除奖项',
    danger: true,
  })
  if (!ok) return
  await data.remove('awards', award.id)
  toast('奖项已删除')
}

function previewCertificate(item) {
  certItem.value = item
  certOpen.value = true
}

async function loadSample() {
  await data.loadSample()
  toast('示例数据已载入，可在「数据与备份」中清除')
}
</script>
