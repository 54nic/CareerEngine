<template>
  <section v-for="section in sections" :key="section.id" class="rp-sec">
    <div class="rp-sec-head">
      <span v-if="variant === 'classic'" class="rp-sec-rule" />
      <span v-if="variant !== 'classic'" class="rp-sec-mark" />
      <h2 class="rp-sec-title">{{ sectionTitle(section, resume.language) }}</h2>
      <span class="rp-sec-rule" />
    </div>

    <p v-if="section.type === 'summary'" class="rp-text rp-summary">{{ resume.basics.summary }}</p>

    <div v-else-if="section.type === 'skills'">
      <div v-for="item in section.items" :key="item.id" class="rp-skill-row">
        <span class="rp-skill-label">{{ item.category }}</span>
        <span class="rp-skill-value">{{ (item.items || []).join('、') }}</span>
      </div>
    </div>

    <div v-else-if="section.type === 'education'">
      <div v-for="item in section.items" :key="item.id" class="rp-item">
        <div class="rp-item-head">
          <div class="min-w-0">
            <p class="rp-item-title">{{ item.school }}</p>
            <p v-if="item.degree || item.major" class="rp-item-sub">
              {{ [item.degree, item.major].filter(Boolean).join('，') }}
            </p>
          </div>
          <span class="rp-item-meta">{{ rangeText(item.start, item.end) }}</span>
        </div>
        <p v-if="item.gpa || item.ranking" class="rp-extra">
          {{ [item.gpa ? `GPA ${item.gpa}` : '', item.ranking].filter(Boolean).join('，') }}
        </p>
        <ul v-if="clean(item.highlights).length" class="rp-bullets">
          <li v-for="(line, index) in clean(item.highlights)" :key="index">{{ line }}</li>
        </ul>
      </div>
    </div>

    <div v-else-if="section.type === 'projects'">
      <div v-for="item in section.items" :key="item.id" class="rp-item">
        <div class="rp-item-head">
          <div class="min-w-0">
            <p class="rp-item-title">{{ item.name }}</p>
            <p v-if="item.role" class="rp-item-sub">{{ item.role }}</p>
          </div>
          <span class="rp-item-meta">{{ rangeText(item.start, item.end) }}</span>
        </div>
        <p v-if="item.stack?.length" class="rp-stack">{{ (item.stack || []).join('、') }}</p>
        <ul v-if="clean(item.highlights).length" class="rp-bullets">
          <li v-for="(line, index) in clean(item.highlights)" :key="index">{{ line }}</li>
        </ul>
        <p v-if="item.link" class="rp-links">
          <a v-if="safeLink(item.link)" :href="safeLink(item.link)" target="_blank" rel="noopener">{{ displayLink(item.link) }}</a>
          <span v-else>{{ item.link }}</span>
        </p>
      </div>
    </div>

    <div v-else-if="section.type === 'experiences'">
      <div v-for="item in section.items" :key="item.id" class="rp-item">
        <div class="rp-item-head">
          <div class="min-w-0">
            <p class="rp-item-title">{{ item.org }}</p>
            <p v-if="item.role || item.type" class="rp-item-sub">
              {{ [experienceTypeLabel(item.type, resume.language), item.role].filter(Boolean).join('，') }}
            </p>
          </div>
          <span class="rp-item-meta">
            <span>{{ rangeText(item.start, item.end) }}</span>
            <span v-if="item.location" class="rp-meta-loc">{{ item.location }}</span>
          </span>
        </div>
        <ul v-if="clean(item.highlights).length" class="rp-bullets">
          <li v-for="(line, index) in clean(item.highlights)" :key="index">{{ line }}</li>
        </ul>
      </div>
    </div>

    <div v-else-if="section.type === 'awards'">
      <div v-for="item in section.items" :key="item.id" class="rp-item">
        <div class="rp-award-row">
          <div class="rp-award-main">
            <span class="rp-award-title">{{ item.title }}</span>
            <span v-if="item.level || item.rank" class="rp-award-meta">
              {{ [item.level, item.rank].filter(Boolean).join('，') }}
            </span>
          </div>
          <span class="rp-award-date">{{ monthText(item.date) }}</span>
        </div>
        <p v-if="item.issuer" class="rp-award-desc">{{ item.issuer }}</p>
        <p v-if="item.description" class="rp-award-desc">{{ item.description }}</p>
      </div>
    </div>

    <p v-else-if="section.type === 'custom'" class="rp-text">{{ section.content }}</p>
  </section>
</template>

<script setup>
import { experienceTypeLabel, sectionTitle } from '../../lib/resume'
import { monthText, rangeText } from '../../lib/utils'

defineProps({
  resume: { type: Object, required: true },
  sections: { type: Array, default: () => [] },
  variant: { type: String, default: 'minimal' },
})

function clean(list) {
  return (list || []).filter((item) => String(item ?? '').trim())
}

function safeLink(url) {
  const value = String(url || '').trim()
  return /^https?:\/\//i.test(value) ? value : ''
}

function displayLink(url) {
  return String(url || '').replace(/^https?:\/\//i, '').replace(/\/$/, '')
}
</script>
