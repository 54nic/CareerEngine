<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <RouterLink to="/" class="flex flex-none items-center gap-2.5 px-2 pb-4 pt-1" @click="$emit('navigate')">
      <span class="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[linear-gradient(135deg,#0b7cf0,#0742c4)] text-white shadow-[0_4px_12px_rgba(11,102,228,0.28)]">
        <AppIcon name="layers" :size="18" :stroke-width="1.9" />
      </span>
      <span class="min-w-0">
        <span class="block text-[15.5px] font-semibold leading-tight tracking-[-0.01em]">履历引擎</span>
        <span class="mt-0.5 block text-[9px] font-semibold tracking-[0.19em] text-[var(--site-muted)]">CAREER ENGINE</span>
      </span>
    </RouterLink>

    <div class="sidebar-scroll scroll-thin -mx-1 px-1">
      <div class="nav-group mt-0">
        <div class="nav-group-title">工作台</div>
        <RouterLink to="/" class="nav-item" exact-active-class="is-active" @click="$emit('navigate')">
          <AppIcon name="grid" class="nav-icon" :size="16" />
          首页概览
        </RouterLink>
      </div>

      <div class="nav-group">
        <div class="nav-group-title">经历资产</div>
        <RouterLink to="/profile" class="nav-item" active-class="is-active" @click="$emit('navigate')">
          <AppIcon name="user" class="nav-icon" :size="16" />
          个人档案
        </RouterLink>
        <RouterLink to="/projects" class="nav-item" active-class="is-active" @click="$emit('navigate')">
          <AppIcon name="folder" class="nav-icon" :size="16" />
          项目管理
          <span v-if="data.projects.length" class="nav-badge">{{ data.projects.length }}</span>
        </RouterLink>
        <RouterLink to="/awards" class="nav-item" active-class="is-active" @click="$emit('navigate')">
          <AppIcon name="trophy" class="nav-icon" :size="16" />
          奖项竞赛
          <span v-if="data.awards.length" class="nav-badge">{{ data.awards.length }}</span>
        </RouterLink>
        <RouterLink to="/experiences" class="nav-item" active-class="is-active" @click="$emit('navigate')">
          <AppIcon name="briefcase" class="nav-icon" :size="16" />
          经历管理
          <span v-if="data.experiences.length" class="nav-badge">{{ data.experiences.length }}</span>
        </RouterLink>
      </div>

      <div class="nav-group">
        <div class="nav-group-title">求职</div>
        <RouterLink to="/resumes" class="nav-item" active-class="is-active" @click="$emit('navigate')">
          <AppIcon name="file" class="nav-icon" :size="16" />
          简历工坊
          <span v-if="data.resumes.length" class="nav-badge">{{ data.resumes.length }}</span>
        </RouterLink>
        <RouterLink to="/applications" class="nav-item" active-class="is-active" @click="$emit('navigate')">
          <AppIcon name="send" class="nav-icon" :size="16" />
          投递管理
          <span v-if="data.applications.length" class="nav-badge">{{ data.applications.length }}</span>
        </RouterLink>
      </div>

      <div class="nav-group">
        <div class="nav-group-title">系统</div>
        <RouterLink to="/data" class="nav-item" active-class="is-active" @click="$emit('navigate')">
          <AppIcon name="database" class="nav-icon" :size="16" />
          数据与备份
        </RouterLink>
      </div>
    </div>

    <div class="mt-3 flex-none border-t border-[var(--site-border)] pt-3">
      <div class="rounded-[13px] border border-[var(--site-border)] bg-[var(--site-surface)] px-3 py-2.5">
        <div class="flex items-center gap-1.5 text-[12px] font-medium">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.12)]" />
          {{ data.storageError ? '存储不可用' : '本地自动保存' }}
        </div>
        <p class="mt-1 text-[11px] leading-relaxed text-muted">
          {{ data.storageError ? '请检查浏览器存储权限' : '数据仅保存在此浏览器中' }}
        </p>
      </div>
      <p class="mt-3 px-1 text-[10.5px] tracking-wide text-[color-mix(in_srgb,var(--site-muted)_70%,transparent)]">
        CAREER ENGINE V1.0
      </p>
    </div>
  </div>
</template>

<script setup>
import AppIcon from './ui/AppIcon.vue'
import { useDataStore } from '../stores/data'

defineEmits(['navigate'])
const data = useDataStore()
</script>
