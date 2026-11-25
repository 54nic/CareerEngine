<template>
  <div class="resume-thumb-big" :class="`is-${template}`" :style="{ '--thumb-accent': accent || '#0b66e4' }">
    <div class="rt-page">
      <div v-if="template === 'modern'" class="rt-side">
        <span class="rt-name !w-[80%]" />
        <span class="rt-sub !w-[65%]" />
        <span class="rt-gap" />
        <span class="rt-head !w-[60%]" />
        <span class="rt-line" />
        <span class="rt-line short" />
        <span class="rt-line" />
        <span class="rt-gap" />
        <span class="rt-head !w-[55%]" />
        <span class="rt-line" />
        <span class="rt-line short" />
      </div>
      <div class="rt-body">
        <template v-if="template !== 'modern'">
          <span class="rt-name" :class="{ 'mx-auto': template === 'classic' }" />
          <span class="rt-sub" :class="{ 'mx-auto': template === 'classic' }" />
          <span v-if="template === 'classic'" class="rt-divider-line" />
        </template>
        <div v-for="index in 3" :key="index" class="rt-sec">
          <span class="rt-head" :class="{ 'mx-auto': template === 'classic' }" />
          <span class="rt-line" />
          <span class="rt-line short" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  template: { type: String, default: 'minimal' },
  accent: { type: String, default: '#0b66e4' },
})
</script>
