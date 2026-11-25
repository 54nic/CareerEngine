<template>
  <div>
    <PageHeader title="个人档案" subtitle="基本信息、教育背景与技能会成为每份简历的起点。">
      <template #actions>
        <span class="chip" :class="{ 'chip-accent': saveState === 'saving' }">
          <span
            class="h-1.5 w-1.5 rounded-full"
            :class="saveState === 'saving' ? 'animate-pulse bg-[var(--site-accent)]' : 'bg-emerald-500'"
          />
          {{ saveState === 'saving' ? '保存中…' : '已自动保存' }}
        </span>
        <RouterLink to="/resumes" class="btn btn-secondary">
          <AppIcon name="file" :size="15" />
          简历工坊
        </RouterLink>
      </template>
    </PageHeader>

    <div class="mt-7 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
      <div class="space-y-4">
        <section class="card card-pad">
          <div class="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 class="section-title">基本信息</h2>
              <p class="mt-1 text-[12.5px] text-muted">修改后自动保存，并同步到新创建的简历。</p>
            </div>
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--site-bg)] text-[var(--site-muted)]">
              <AppIcon name="user" :size="17" />
            </div>
          </div>

          <div class="space-y-4">
            <div class="field-grid">
              <BaseField label="姓名" hint="填写真实姓名，会显示在简历页眉。">
                <input v-model="data.profile.name" class="input" placeholder="例如：林知远" @input="queueSave" />
              </BaseField>
              <BaseField label="求职方向 / 一句话介绍" hint="建议包含目标岗位与届别。">
                <input
                  v-model="data.profile.headline"
                  class="input"
                  placeholder="例如：前端开发工程师，2027 届"
                  @input="queueSave"
                />
              </BaseField>
              <BaseField label="手机" hint="建议填写常用手机号。">
                <input v-model="data.profile.phone" class="input" placeholder="138 0000 0000" @input="queueSave" />
              </BaseField>
              <BaseField label="邮箱" hint="建议填写常用邮箱。">
                <input v-model="data.profile.email" class="input" type="email" placeholder="name@example.com" @input="queueSave" />
              </BaseField>
              <BaseField label="所在城市" hint="当前所在城市或意向城市。">
                <input v-model="data.profile.city" class="input" placeholder="杭州" @input="queueSave" />
              </BaseField>
              <BaseField label="个人网站" optional hint="没有可以留空。">
                <input v-model="data.profile.website" class="input" placeholder="yourname.dev" @input="queueSave" />
              </BaseField>
            </div>

            <BaseField label="GitHub / 作品集" optional hint="填写主页地址即可，例如 github.com/yourname。">
              <input v-model="data.profile.github" class="input" placeholder="github.com/yourname" @input="queueSave" />
            </BaseField>

            <BaseField label="个人简介" hint="建议 2–3 句话，说明专业背景、核心能力与求职方向。">
              <textarea
                v-model="data.profile.summary"
                class="textarea"
                rows="4"
                placeholder="例如：计算机专业 2027 届本科生，专注前端工程与产品体验……"
                @input="queueSave"
              />
            </BaseField>
          </div>
        </section>

        <section class="card card-pad">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 class="section-title">教育背景</h2>
              <p class="mt-1 text-[12.5px] text-muted">学历、专业、GPA 与排名会出现在简历的教育板块。</p>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" @click="openEducation()">
              <AppIcon name="plus" :size="13" />
              添加
            </button>
          </div>

          <div v-if="data.profile.educations.length" class="space-y-2.5">
            <div
              v-for="(edu, index) in data.profile.educations"
              :key="edu.id"
              class="group flex items-start gap-3 rounded-xl border border-[var(--site-border)] px-3.5 py-3"
            >
              <div class="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-[var(--site-bg)] text-[var(--site-muted)]">
                <AppIcon name="building" :size="16" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-baseline gap-x-2">
                  <p class="text-[14px] font-semibold">{{ edu.school || '未填写学校' }}</p>
                  <p class="text-[12.5px] text-muted">{{ [edu.degree, edu.major].filter(Boolean).join('，') }}</p>
                </div>
                <p class="mt-1 text-[12px] text-muted">
                  {{ rangeText(edu.start, edu.end) || '未填写时间' }}
                  <span v-if="edu.gpa">，GPA {{ edu.gpa }}</span>
                  <span v-if="edu.ranking">，{{ edu.ranking }}</span>
                </p>
                <p v-if="edu.details?.length" class="mt-1.5 text-[12px] text-muted">
                  {{ edu.details.filter(Boolean).length }} 条补充说明
                </p>
              </div>
              <div class="flex flex-none gap-0.5 opacity-60 transition-opacity group-hover:opacity-100">
                <button type="button" class="icon-btn" title="编辑" @click="openEducation(edu)">
                  <AppIcon name="edit" :size="14" />
                </button>
                <button type="button" class="icon-btn hover:text-red-600" title="删除" @click="deleteEducation(index)">
                  <AppIcon name="trash" :size="14" />
                </button>
              </div>
            </div>
          </div>
          <button
            v-else
            type="button"
            class="w-full rounded-xl border border-dashed border-[var(--site-border)] py-6 text-[13px] text-muted transition-colors hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]"
            @click="openEducation()"
          >
            添加教育经历，例如本科或研究生阶段
          </button>
        </section>
      </div>

      <div class="space-y-4">
        <section class="card card-pad">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 class="section-title">专业技能</h2>
              <p class="mt-1 text-[12.5px] text-muted">按分类整理，简历中自动以分组形式呈现。</p>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" @click="openSkill()">
              <AppIcon name="plus" :size="13" />
              添加
            </button>
          </div>

          <div v-if="data.profile.skills.length" class="space-y-3">
            <div
              v-for="(group, index) in data.profile.skills"
              :key="group.id"
              class="rounded-xl border border-[var(--site-border)] px-3.5 py-3"
            >
              <div class="flex items-start justify-between gap-2">
                <p class="text-[13px] font-semibold">{{ group.category || '未分类' }}</p>
                <div class="flex flex-none gap-0.5 opacity-60">
                  <button type="button" class="icon-btn" title="编辑" @click="openSkill(group)">
                    <AppIcon name="edit" :size="13" />
                  </button>
                  <button type="button" class="icon-btn hover:text-red-600" title="删除" @click="deleteSkill(index)">
                    <AppIcon name="trash" :size="13" />
                  </button>
                </div>
              </div>
              <div v-if="group.items?.length" class="mt-2 flex flex-wrap gap-1.5">
                <span v-for="item in group.items" :key="item" class="chip chip-muted">{{ item }}</span>
              </div>
              <p v-else class="mt-1.5 text-[12px] text-muted">尚未添加技能</p>
            </div>
          </div>
          <button
            v-else
            type="button"
            class="w-full rounded-xl border border-dashed border-[var(--site-border)] py-6 text-[13px] text-muted transition-colors hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]"
            @click="openSkill()"
          >
            添加技能分类，例如「前端工程」「数据分析」
          </button>
        </section>

        <section class="card overflow-hidden">
          <div class="border-b border-[var(--site-border)] px-5 py-4">
            <h2 class="section-title">档案概览</h2>
          </div>
          <div class="px-5 py-4">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#eef4ff,#dbe8fd)] text-[16px] font-semibold text-[var(--site-accent)]">
                {{ initial }}
              </div>
              <div class="min-w-0">
                <p class="truncate text-[14.5px] font-semibold">{{ data.profile.name || '还未填写姓名' }}</p>
                <p class="mt-0.5 truncate text-[12px] text-muted">{{ data.profile.headline || '填写求职方向' }}</p>
              </div>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-2">
              <div class="soft-panel px-3 py-2.5">
                <p class="text-[18px] font-semibold num">{{ data.profile.educations.length }}</p>
                <p class="mt-0.5 text-[11.5px] text-muted">教育经历</p>
              </div>
              <div class="soft-panel px-3 py-2.5">
                <p class="text-[18px] font-semibold num">{{ data.profile.skills.length }}</p>
                <p class="mt-0.5 text-[11.5px] text-muted">技能分类</p>
              </div>
            </div>
            <div class="mt-4">
              <div class="flex items-center justify-between text-[11.5px] text-muted">
                <span>档案完善度</span>
                <span class="num">{{ data.profileCompleteness }}%</span>
              </div>
              <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--site-bg)]">
                <div
                  class="h-full rounded-full bg-[var(--site-accent)] transition-[width]"
                  :style="{ width: `${data.profileCompleteness}%` }"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <BaseModal
      :open="eduOpen"
      :title="eduIndex >= 0 ? '编辑教育经历' : '添加教育经历'"
      subtitle="这些信息会用于简历中的「教育背景」板块。"
      width="md"
      @close="eduOpen = false"
    >
      <div class="space-y-4">
        <div class="field-grid">
          <BaseField label="学校" hint="填写学校全称。">
            <input v-model="eduDraft.school" class="input" placeholder="例如：浙江大学" />
          </BaseField>
          <BaseField label="学历" hint="选择当前或已获得的学历。">
            <select v-model="eduDraft.degree" class="select">
              <option value="">选择学历</option>
              <option>本科</option>
              <option>硕士</option>
              <option>博士</option>
              <option>专科</option>
              <option>高中</option>
            </select>
          </BaseField>
          <BaseField label="专业" hint="填写专业全称。">
            <input v-model="eduDraft.major" class="input" placeholder="例如：计算机科学与技术" />
          </BaseField>
          <div class="grid grid-cols-2 gap-3">
            <BaseField label="开始时间" hint="入学时间。">
              <input v-model="eduDraft.start" class="input" type="month" />
            </BaseField>
            <BaseField label="毕业时间" hint="在读可留空。">
              <input v-model="eduDraft.end" class="input" type="month" />
            </BaseField>
          </div>
          <BaseField label="GPA" optional hint="没有可以留空。">
            <input v-model="eduDraft.gpa" class="input" placeholder="3.8 / 4.0" />
          </BaseField>
          <BaseField label="专业排名" optional hint="例如：专业前 5%。">
            <input v-model="eduDraft.ranking" class="input" placeholder="专业前 5%" />
          </BaseField>
        </div>
        <BaseField label="补充说明" optional hint="可以写主修课程、奖学金、学生工作或科研经历。">
          <BulletListEditor v-model="eduDraft.details" placeholder="例如：主修数据结构、操作系统、计算机网络" />
          <div class="mt-2 flex flex-wrap items-center gap-1.5">
            <span class="text-[13px] text-muted">快速添加</span>
            <button
              v-for="preset in EDUCATION_DETAIL_PRESETS"
              :key="preset.label"
              type="button"
              class="chip chip-clickable"
              @click="addEducationDetail(preset)"
            >
              + {{ preset.label }}
            </button>
          </div>
        </BaseField>
      </div>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="eduOpen = false">取消</button>
        <button type="button" class="btn btn-primary" @click="saveEducation">保存教育经历</button>
      </template>
    </BaseModal>

    <BaseModal
      :open="skillOpen"
      :title="skillIndex >= 0 ? '编辑技能分类' : '添加技能分类'"
      subtitle="用分类让技能更清晰，例如「前端工程」「产品方法」。"
      width="sm"
      @close="skillOpen = false"
    >
      <div class="space-y-4">
        <BaseField label="分类名称" hint="选择常用分类，或直接输入自己的分类名。">
          <input v-model="skillDraft.category" class="input" placeholder="例如：前端工程" />
          <SuggestionChips
            v-model="skillDraft.category"
            :options="SKILL_CATEGORY_OPTIONS"
            class="mt-2"
          />
        </BaseField>
        <BaseField label="技能项" hint="输入后按回车添加，可一次输入多个，用逗号分隔。">
          <TagInput v-model="skillDraft.items" placeholder="Vue 3、Vite、Tailwind CSS" />
        </BaseField>
      </div>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="skillOpen = false">取消</button>
        <button type="button" class="btn btn-primary" @click="saveSkill">保存分类</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import PageHeader from '../components/ui/PageHeader.vue'
import BaseField from '../components/ui/BaseField.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import BulletListEditor from '../components/ui/BulletListEditor.vue'
import SuggestionChips from '../components/ui/SuggestionChips.vue'
import TagInput from '../components/ui/TagInput.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import { useDataStore } from '../stores/data'
import { confirmAction } from '../composables/useConfirm'
import { toast } from '../composables/useToast'
import { deepClone, rangeText, uid } from '../lib/utils'
import { EDUCATION_DETAIL_PRESETS, SKILL_CATEGORY_OPTIONS } from '../lib/suggestions'

const data = useDataStore()
const saveState = ref('saved')
let saveTimer = null

const initial = computed(() => (data.profile.name || '履').trim().slice(0, 1).toUpperCase())

function queueSave() {
  saveState.value = 'saving'
  clearTimeout(saveTimer)
  saveTimer = window.setTimeout(async () => {
    await data.persistProfile()
    saveState.value = 'saved'
  }, 450)
}

onBeforeUnmount(() => {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveState.value = 'saved'
    data.persistProfile()
  }
})

const eduOpen = ref(false)
const eduIndex = ref(-1)
const eduDraft = ref(blankEducation())

function blankEducation() {
  return { id: uid(), school: '', degree: '本科', major: '', start: '', end: '', gpa: '', ranking: '', details: [] }
}

function openEducation(edu = null) {
  const index = edu ? data.profile.educations.findIndex((item) => item.id === edu.id) : -1
  eduIndex.value = index
  eduDraft.value = index >= 0 ? deepClone(data.profile.educations[index]) : blankEducation()
  eduOpen.value = true
}

function addEducationDetail(preset) {
  if (!Array.isArray(eduDraft.value.details)) eduDraft.value.details = []
  const prefix = preset.text.split('：')[0]
  const exists = eduDraft.value.details.some((item) => String(item).trim().startsWith(prefix))
  if (!exists) eduDraft.value.details.push(preset.text)
}

async function saveEducation() {
  if (!eduDraft.value.school.trim()) {
    toast('请填写学校名称', 'error')
    return
  }
  const next = deepClone(eduDraft.value)
  next.details = (next.details || []).filter((item) => String(item).trim())
  if (eduIndex.value >= 0) data.profile.educations.splice(eduIndex.value, 1, next)
  else data.profile.educations.push(next)
  eduOpen.value = false
  saveState.value = 'saving'
  await data.persistProfile()
  saveState.value = 'saved'
  toast('教育经历已保存')
}

async function deleteEducation(index) {
  const ok = await confirmAction({
    title: '删除教育经历？',
    message: '删除后，新创建的简历将不再包含这段经历。已经生成的简历不受影响。',
    confirmText: '删除',
    danger: true,
  })
  if (!ok) return
  data.profile.educations.splice(index, 1)
  await data.persistProfile()
  toast('已删除')
}

const skillOpen = ref(false)
const skillIndex = ref(-1)
const skillDraft = ref({ id: '', category: '', items: [] })

function openSkill(group = null) {
  const index = group ? data.profile.skills.findIndex((item) => item.id === group.id) : -1
  skillIndex.value = index
  skillDraft.value = index >= 0 ? deepClone(data.profile.skills[index]) : { id: uid(), category: '', items: [] }
  skillOpen.value = true
}

async function saveSkill() {
  if (!skillDraft.value.category.trim()) {
    toast('请填写分类名称', 'error')
    return
  }
  if (!skillDraft.value.items.length) {
    toast('请至少添加一项技能', 'error')
    return
  }
  const next = deepClone(skillDraft.value)
  if (skillIndex.value >= 0) data.profile.skills.splice(skillIndex.value, 1, next)
  else data.profile.skills.push(next)
  skillOpen.value = false
  saveState.value = 'saving'
  await data.persistProfile()
  saveState.value = 'saved'
  toast('技能分类已保存')
}

async function deleteSkill(index) {
  const ok = await confirmAction({
    title: '删除技能分类？',
    message: '删除后，新创建的简历将不再包含这组技能。已经生成的简历不受影响。',
    confirmText: '删除',
    danger: true,
  })
  if (!ok) return
  data.profile.skills.splice(index, 1)
  await data.persistProfile()
  toast('已删除')
}
</script>
