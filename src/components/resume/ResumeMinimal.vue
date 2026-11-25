<template>
  <article
    class="resume-page rp-minimal"
    :class="{ 'is-compact': resume.density === 'compact' }"
    :style="pageStyle"
  >
    <header class="rp-header">
      <div class="rp-header-top">
        <div class="rp-identity">
          <h1 class="rp-name">{{ resume.basics.name || '你的姓名' }}</h1>
          <p v-if="resume.basics.headline" class="rp-headline">{{ resume.basics.headline }}</p>
        </div>
        <div v-if="contacts.length" class="rp-contacts rp-contact-list">
          <span v-for="contact in contacts" :key="contact.key" class="rp-contact">
            <span class="rp-contact-label">{{ contactLabel(contact.key, resume.language) }}</span>
            <span class="rp-contact-value">{{ contact.value }}</span>
          </span>
        </div>
      </div>
    </header>
    <ResumeSections :resume="resume" :sections="sections" variant="minimal" />
  </article>
</template>

<script setup>
import { computed } from 'vue'
import ResumeSections from './ResumeSections.vue'
import { contactLabel, resumeContactList, visibleSections } from '../../lib/resume'

const props = defineProps({ resume: { type: Object, required: true } })

const sections = computed(() => visibleSections(props.resume))
const contacts = computed(() => resumeContactList(props.resume.basics))
const pageStyle = computed(() => ({
  '--r-accent': props.resume.accent || '#0b66e4',
  '--r-scale': String(props.resume.typeScale || 1),
}))
</script>
