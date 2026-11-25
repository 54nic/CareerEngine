<template>
  <div v-if="!data.ready" class="boot-screen">
    <div class="flex flex-col items-center">
      <span class="flex h-12 w-12 items-center justify-center rounded-[15px] bg-[linear-gradient(135deg,#0b7cf0,#0742c4)] text-white shadow-[0_10px_28px_rgba(11,102,228,0.3)]">
        <AppIcon name="layers" :size="22" :stroke-width="1.9" />
      </span>
      <p class="mt-4 text-[14px] font-medium">正在载入本地资料…</p>
      <p class="mt-1 text-[12px] text-muted">你的数据只保存在这台设备上</p>
    </div>
  </div>

  <div v-else class="app-shell">
    <aside class="app-sidebar no-print">
      <SidebarNav />
    </aside>

    <Transition name="fade">
      <div v-if="drawerOpen" class="drawer-backdrop no-print" @click="drawerOpen = false" />
    </Transition>
    <aside class="app-drawer no-print" :class="{ 'is-open': drawerOpen }">
      <SidebarNav @navigate="drawerOpen = false" />
    </aside>

    <div class="app-main">
      <header class="mobile-header no-print">
        <RouterLink to="/" class="flex items-center gap-2">
          <span class="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[linear-gradient(135deg,#0b7cf0,#0742c4)] text-white">
            <AppIcon name="layers" :size="15" :stroke-width="1.9" />
          </span>
          <span class="text-[14.5px] font-semibold">履历引擎</span>
        </RouterLink>
        <button type="button" class="icon-btn" aria-label="打开导航" @click="drawerOpen = true">
          <AppIcon name="menu" :size="19" />
        </button>
      </header>

      <main class="page-wrap" :class="{ 'page-wrap-wide': route.meta.wide }">
        <RouterView v-slot="{ Component }">
          <Transition name="slide-up" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </main>
    </div>

    <ToastHost />
    <ConfirmHost />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from './components/ui/AppIcon.vue'
import SidebarNav from './components/SidebarNav.vue'
import ToastHost from './components/ui/ToastHost.vue'
import ConfirmHost from './components/ui/ConfirmHost.vue'
import { useDataStore } from './stores/data'

const data = useDataStore()
const route = useRoute()
const drawerOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    drawerOpen.value = false
    window.scrollTo({ top: 0 })
  },
)
</script>
