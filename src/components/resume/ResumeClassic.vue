<template>
  <article
    class="resume-page rp-classic"
    :class="{ 'is-compact': resume.density === 'compact' }"
    :style="pageStyle"
  >
    <header class="rp-header">
      <h1 class="rp-name">{{ resume.basics.name || '你的姓名' }}</h1>
      <p v-if="resume.basics.headline" class="rp-headline">{{ resume.basics.headline }}</p>
      <div class="rp-classic-divider" aria-hidden="true"><span /></div>
      <div v-if="contacts.length" class="rp-contacts">
        <span v-for="contact in contacts" :key="contact.key" class="rp-contact">{{ contact.value }}</span>
      </div>
    </header>
    <ResumeSections :resume="resume" :sections="sections" variant="classic" />
  </article>
</template>

<script setup>
import { computed } from 'vue'
import ResumeSections from './ResumeSections.vue'
import { resumeContactList, visibleSections } from '../../lib/resume'

const props = defineProps({ resume: { type: Object, required: true } })

const sections = computed(() => visibleSections(props.resume))
const contacts = computed(() => resumeContactList(props.resume.basics))
const pageStyle = computed(() => ({
  '--r-accent': props.resume.accent || '#0b66e4',
  '--r-scale': String(props.resume.typeScale || 1),
}))
</script>
