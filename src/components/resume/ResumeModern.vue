<template>
  <article
    class="resume-page rp-modern"
    :class="{ 'is-compact': resume.density === 'compact' }"
    :style="pageStyle"
  >
    <aside class="rp-side">
      <header class="rp-side-header">
        <div class="rp-monogram" aria-hidden="true">{{ monogram }}</div>
        <h1 class="rp-name">{{ resume.basics.name || '你的姓名' }}</h1>
        <p v-if="resume.basics.headline" class="rp-headline">{{ resume.basics.headline }}</p>
        <div v-if="contacts.length" class="rp-contacts">
          <span v-for="contact in contacts" :key="contact.key" class="rp-contact">
            <span class="rp-contact-label">{{ contactLabel(contact.key, resume.language) }}</span>
            <span class="rp-contact-value">{{ contact.value }}</span>
          </span>
        </div>
      </header>
      <ResumeSections :resume="resume" :sections="sideSections" variant="modern-side" />
    </aside>
    <main class="rp-main">
      <ResumeSections :resume="resume" :sections="mainSections" variant="modern-main" />
    </main>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import ResumeSections from './ResumeSections.vue'
import { contactLabel, resumeContactList, visibleSections } from '../../lib/resume'

const props = defineProps({ resume: { type: Object, required: true } })

const allSections = computed(() => visibleSections(props.resume))
const sideSections = computed(() =>
  allSections.value.filter((section) => ['skills', 'education'].includes(section.type)),
)
const mainSections = computed(() =>
  allSections.value.filter((section) => !['skills', 'education'].includes(section.type)),
)
const contacts = computed(() => resumeContactList(props.resume.basics))
const monogram = computed(() => {
  const name = String(props.resume.basics?.name || '').trim()
  if (!name) return 'CV'
  const latin = name.match(/[A-Za-z]/g)
  if (latin?.length) return latin.slice(0, 2).join('').toUpperCase()
  return name.slice(0, 1)
})
const pageStyle = computed(() => ({
  '--r-accent': props.resume.accent || '#0b66e4',
  '--r-scale': String(props.resume.typeScale || 1),
}))
</script>
