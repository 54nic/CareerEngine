<template>
  <div v-if="!resume" class="py-10">
    <EmptyState
      icon="file"
      title="简历不存在"
      description="这份简历可能已被删除，或者链接有误。"
    >
      <RouterLink to="/resumes" class="btn btn-primary">返回简历列表</RouterLink>
    </EmptyState>
  </div>

  <div v-else class="editor-view">
    <div class="editor-topbar no-print">
      <div class="flex min-w-0 flex-1 items-start gap-2.5">
        <RouterLink to="/resumes" class="btn btn-secondary btn-icon mt-0.5 flex-none" title="返回简历列表" aria-label="返回简历列表">
          <AppIcon name="chevron-left" :size="16" />
        </RouterLink>
        <div class="min-w-0 flex-1">
          <input
            v-model="resume.title"
            class="editor-title-input"
            placeholder="简历名称"
            aria-label="简历名称"
            @input="scheduleSave"
          />
          <div class="mt-1 flex flex-wrap items-center gap-2">
            <input
              v-model="resume.targetRole"
              class="editor-role-input"
              placeholder="目标岗位（用于区分版本）"
              aria-label="目标岗位"
              @input="scheduleSave"
            />
            <span class="chip chip-muted">{{ templateName }}｜{{ resume.language === 'en' ? 'English' : '中文' }}</span>
          </div>
        </div>
      </div>
      <div class="flex flex-none items-center gap-2">
        <span class="chip hidden sm:inline-flex" :class="{ 'chip-accent': saveState === 'saving' }">
          <span
            class="h-1.5 w-1.5 rounded-full"
            :class="saveState === 'saving' ? 'animate-pulse bg-[var(--site-accent)]' : 'bg-emerald-500'"
          />
          {{ saveState === 'saving' ? '保存中…' : '已自动保存' }}
        </span>
        <button type="button" class="btn btn-primary" @click="exportPdf">
          <AppIcon name="download" :size="15" />
          导出 PDF
        </button>
      </div>
    </div>

    <div class="editor-mobile-tabs no-print lg:hidden">
      <button type="button" :class="{ 'is-active': mobilePane === 'edit' }" @click="mobilePane = 'edit'">
        <AppIcon name="edit" :size="13" />
        内容编辑
      </button>
      <button type="button" :class="{ 'is-active': mobilePane === 'preview' }" @click="mobilePane = 'preview'">
        <AppIcon name="eye" :size="13" />
        实时预览
      </button>
    </div>

    <div class="editor-layout">
      <aside class="editor-panel no-print" :class="mobilePane === 'edit' ? '' : 'hidden lg:block'">
        <div class="card editor-panel-card">
          <div class="editor-tabs">
            <button type="button" :class="{ 'is-active': tab === 'content' }" @click="tab = 'content'">内容</button>
            <button type="button" :class="{ 'is-active': tab === 'design' }" @click="tab = 'design'">设计</button>
          </div>

          <div class="editor-panel-body scroll-thin">
            <template v-if="tab === 'content'">
              <section class="editor-block">
                <button type="button" class="editor-block-head" @click="basicsOpen = !basicsOpen">
                  <span class="editor-block-icon"><AppIcon name="user" :size="14" /></span>
                  <span class="flex-1 text-left">
                    <span class="block text-[13px] font-semibold">基本信息</span>
                    <span class="block text-[10.5px] text-muted">姓名、联系方式与个人简介</span>
                  </span>
                  <AppIcon name="chevron-down" :size="14" class="text-[var(--site-muted)] transition-transform" :class="{ 'rotate-180': basicsOpen }" />
                </button>
                <div v-if="basicsOpen" class="editor-block-body" @input="scheduleSave">
                  <BaseField label="姓名" hint="会显示在简历页眉，建议填写真实姓名。">
                    <input v-model="resume.basics.name" class="input" placeholder="姓名" />
                  </BaseField>
                  <BaseField label="一句话介绍" hint="用一句话概括目标岗位与个人亮点。">
                    <input v-model="resume.basics.headline" class="input" placeholder="例如：前端开发工程师，2027 届" />
                  </BaseField>
                  <div class="grid grid-cols-2 gap-2">
                    <BaseField label="电话" hint="建议填写常用手机号。">
                      <input v-model="resume.basics.phone" class="input" placeholder="手机号" />
                    </BaseField>
                    <BaseField label="邮箱" hint="建议填写常用邮箱。">
                      <input v-model="resume.basics.email" class="input" placeholder="邮箱" />
                    </BaseField>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <BaseField label="城市" hint="当前城市或意向工作城市。">
                      <input v-model="resume.basics.city" class="input" placeholder="杭州" />
                    </BaseField>
                    <BaseField label="个人网站" optional hint="没有可以留空。">
                      <input v-model="resume.basics.website" class="input" placeholder="yourname.dev" />
                    </BaseField>
                  </div>
                  <BaseField label="GitHub / 作品集" optional hint="填写主页地址即可。">
                    <input v-model="resume.basics.github" class="input" placeholder="github.com/yourname" />
                  </BaseField>
                  <BaseField label="个人简介" hint="2–3 句话，突出背景、核心能力和求职方向。">
                    <textarea v-model="resume.basics.summary" class="textarea" rows="4" placeholder="2–3 句话说明背景、能力与方向" />
                  </BaseField>
                </div>
              </section>

              <div class="mb-2 mt-4 flex items-center justify-between px-1">
                <span class="eyebrow">内容板块</span>
                <button type="button" class="btn-link text-[11.5px]" @click="addSectionOpen = true">
                  <AppIcon name="plus" :size="12" />
                  添加板块
                </button>
              </div>

              <div class="space-y-2">
                <div
                  v-for="(section, sectionIndex) in resume.sections"
                  :key="section.id"
                  class="section-card"
                  :class="{ 'is-hidden': section.visible === false }"
                >
                  <div class="flex items-center gap-1 px-2 py-2">
                    <button type="button" class="flex min-w-0 flex-1 items-center gap-2 text-left" @click="toggleSection(section)">
                      <span class="section-grip"><AppIcon name="grip" :size="13" /></span>
                      <span class="min-w-0 flex-1">
                        <span class="block truncate text-[12.5px] font-semibold">{{ sectionTitle(section, resume.language) }}</span>
                        <span class="block text-[10px] text-muted">{{ sectionCountLabel(section) }}</span>
                      </span>
                      <AppIcon
                        name="chevron-down"
                        :size="13"
                        class="flex-none text-[var(--site-muted)] transition-transform"
                        :class="{ 'rotate-180': expandedId === section.id }"
                      />
                    </button>
                    <button
                      type="button"
                      class="icon-btn !h-7 !w-7 flex-none"
                      :title="section.visible === false ? '在简历中显示' : '在简历中隐藏'"
                      :aria-pressed="section.visible !== false"
                      @click="toggleVisible(section)"
                    >
                      <AppIcon :name="section.visible === false ? 'eye-off' : 'eye'" :size="13" />
                    </button>
                  </div>

                  <div v-if="expandedId === section.id" class="editor-block-body border-t border-[var(--site-border)]">
                    <div class="flex flex-wrap items-center gap-0.5">
                      <button type="button" class="btn btn-ghost btn-sm !px-2" :disabled="sectionIndex === 0" @click="moveSection(sectionIndex, -1)">
                        <AppIcon name="arrow-up" :size="12" />
                        上移
                      </button>
                      <button type="button" class="btn btn-ghost btn-sm !px-2" :disabled="sectionIndex === resume.sections.length - 1" @click="moveSection(sectionIndex, 1)">
                        <AppIcon name="arrow-down" :size="12" />
                        下移
                      </button>
                      <button type="button" class="btn btn-ghost btn-sm ml-auto !px-2 text-[var(--site-muted)] hover:!text-red-600" @click="removeSection(section)">
                        <AppIcon name="trash" :size="12" />
                        删除
                      </button>
                    </div>

                    <BaseField label="板块标题" hint="留空时使用默认标题。">
                      <input
                        v-model="section.titleCustom"
                        class="input"
                        :placeholder="defaultTitle(section.type)"
                        @input="scheduleSave"
                      />
                    </BaseField>

                    <div v-if="section.type === 'summary'" class="space-y-1.5">
                      <BaseField label="个人简介内容" hint="突出与目标岗位最相关的背景和能力。">
                        <textarea v-model="resume.basics.summary" class="textarea" rows="4" @input="scheduleSave" />
                      </BaseField>
                    </div>

                    <div v-else-if="section.type === 'custom'" class="space-y-1.5">
                      <BaseField label="板块内容" hint="可填写自我评价、研究兴趣或补充说明。">
                        <textarea v-model="section.content" class="textarea" rows="6" placeholder="例如：自我评价、获奖感言、研究兴趣……" @input="scheduleSave" />
                      </BaseField>
                    </div>

                    <template v-else>
                      <div v-if="section.items.length" class="space-y-1.5">
                        <div
                          v-for="(item, itemIndex) in section.items"
                          :key="item.id"
                          class="resume-item-row"
                        >
                          <div class="min-w-0 flex-1">
                            <p class="truncate text-[12px] font-medium">{{ itemSummary(section.type, item).title }}</p>
                            <p class="mt-0.5 truncate text-[10.5px] text-muted">
                              {{ itemSummary(section.type, item).subtitle || itemSummary(section.type, item).meta || '尚未填写' }}
                            </p>
                          </div>
                          <div class="flex flex-none items-center gap-0.5">
                            <button type="button" class="icon-btn !h-6 !w-6" title="上移" :disabled="itemIndex === 0" @click="moveItem(section, itemIndex, -1)">
                              <AppIcon name="chevron-up" :size="12" />
                            </button>
                            <button type="button" class="icon-btn !h-6 !w-6" title="下移" :disabled="itemIndex === section.items.length - 1" @click="moveItem(section, itemIndex, 1)">
                              <AppIcon name="chevron-down" :size="12" />
                            </button>
                            <button type="button" class="icon-btn !h-6 !w-6" title="编辑内容" @click="openItemEditor(section, item)">
                              <AppIcon name="edit" :size="12" />
                            </button>
                            <button type="button" class="icon-btn !h-6 !w-6 hover:text-red-600" title="从简历移除" @click="removeItem(section, item)">
                              <AppIcon name="trash" :size="12" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div v-else class="rounded-lg border border-dashed border-[var(--site-border)] px-3 py-4 text-center text-[11px] text-muted">
                        这个板块还没有内容
                      </div>

                      <div class="flex flex-wrap gap-1.5">
                        <button type="button" class="btn btn-secondary btn-sm" @click="openLibrary(section)">
                          <AppIcon name="download" :size="12" />
                          {{ libraryButtonLabel(section.type) }}
                        </button>
                        <button type="button" class="btn btn-ghost btn-sm" @click="addBlankItem(section)">
                          <AppIcon name="plus" :size="12" />
                          手动添加
                        </button>
                      </div>
                    </template>
                  </div>
                </div>
              </div>

              <div class="mt-4 rounded-xl border border-[color-mix(in_srgb,var(--site-accent)_14%,transparent)] bg-[color-mix(in_srgb,var(--site-accent)_4%,white)] px-3 py-2.5">
                <p class="text-[11px] leading-relaxed text-[#55555a]">
                  这份简历使用独立内容快照。编辑简历中的条目不会改动经历库，经历库的变化也不会影响已经生成的简历。
                </p>
              </div>
            </template>

            <template v-else>
              <div class="editor-block">
                <div class="editor-block-body">
                  <div>
                    <p class="label">模板</p>
                    <div class="grid grid-cols-3 gap-2">
                      <button
                        v-for="tpl in templates"
                        :key="tpl.id"
                        type="button"
                        class="template-option"
                        :class="{ 'is-selected': resume.template === tpl.id }"
                        @click="setTemplate(tpl.id)"
                      >
                        <div class="pointer-events-none h-[76px] overflow-hidden rounded-md border border-[var(--site-border)] bg-[#f4f4f7] p-1.5">
                          <ResumeThumb :template="tpl.id" :accent="accentForTemplate(tpl.id)" class="!h-full" />
                        </div>
                        <span class="mt-1.5 block text-center text-[11.5px] font-semibold">{{ tpl.name }}</span>
                      </button>
                    </div>
                    <p class="hint mt-2">双栏模板会把「教育背景」与「专业技能」放在左侧栏。</p>
                  </div>

                  <div>
                    <p class="label">主题色</p>
                    <div class="flex flex-wrap items-center gap-2">
                      <button
                        v-for="accent in accents"
                        :key="accent.value"
                        type="button"
                        class="color-dot"
                        :class="{ 'is-selected': resume.accent.toLowerCase() === accent.value.toLowerCase() }"
                        :style="{ background: accent.value }"
                        :title="accent.name"
                        :aria-label="accent.name"
                        @click="setAccent(accent.value)"
                      />
                      <label class="color-dot-custom" title="自定义颜色">
                        <input v-model="resume.accent" type="color" aria-label="自定义主题色" @input="scheduleSave" />
                        <AppIcon name="palette" :size="13" />
                      </label>
                    </div>
                    <p class="hint mt-2">主题色会用于标题、分隔线和重点信息，建议选沉稳的颜色。</p>
                  </div>

                  <div>
                    <p class="label">内容密度</p>
                    <div class="segmented">
                      <button type="button" :class="{ 'is-active': resume.density === 'cozy' }" @click="setDensity('cozy')">宽松</button>
                      <button type="button" :class="{ 'is-active': resume.density === 'compact' }" @click="setDensity('compact')">紧凑</button>
                    </div>
                    <p class="hint mt-2">内容较多时选择紧凑，能减少行距和留白，更方便放进一页。</p>
                  </div>

                  <div>
                    <div class="flex items-center justify-between">
                      <p class="label !mb-0">字号</p>
                      <span class="text-[11px] text-muted num">{{ Math.round((resume.typeScale || 1) * 100) }}%</span>
                    </div>
                    <input
                      v-model.number="resume.typeScale"
                      type="range"
                      min="0.92"
                      max="1.08"
                      step="0.01"
                      class="range mt-2"
                      @input="scheduleSave"
                    />
                    <p class="hint mt-2">建议保持在 96% 到 104% 之间，过大可能导致内容排到第二页。</p>
                  </div>

                  <div>
                    <p class="label">简历语言</p>
                    <div class="segmented">
                      <button type="button" :class="{ 'is-active': resume.language === 'zh' }" @click="setLanguage('zh')">中文</button>
                      <button type="button" :class="{ 'is-active': resume.language === 'en' }" @click="setLanguage('en')">English</button>
                    </div>
                    <p class="hint mt-2">切换后板块标题会自动使用对应语言，正文内容保持你填写的文字。</p>
                  </div>

                  <div>
                    <p class="label">导出</p>
                    <button type="button" class="btn btn-secondary w-full" @click="exportPdf">
                      <AppIcon name="download" :size="14" />
                      打印 / 另存为 PDF
                    </button>
                    <p class="hint mt-2">导出时选择「另存为 PDF」，边距设为「无」，缩放保持 100%，并关闭页眉页脚。</p>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </aside>

      <section class="preview-area" :class="mobilePane === 'preview' ? '' : 'hidden lg:block'">
        <div class="preview-shell">
          <div class="preview-toolbar no-print">
            <span class="flex items-center gap-1.5 text-[11.5px] text-muted">
              <AppIcon name="file" :size="12" />
              A4 纸张，210 × 297 mm
            </span>
            <span class="flex items-center gap-2">
              <span class="chip chip-muted">{{ templateName }}</span>
              <span class="chip">{{ visibleCount }} 个板块</span>
            </span>
          </div>
          <div ref="canvasRef" class="preview-canvas" :style="{ '--preview-zoom': zoom }">
            <div class="resume-scaler">
              <component :is="templateComponent" :resume="resume" />
            </div>
          </div>
        </div>
      </section>
    </div>

    <BaseModal
      :open="addSectionOpen"
      title="添加内容板块"
      subtitle="标准板块每个只能添加一次；自定义板块可以添加多个。"
      width="md"
      @close="addSectionOpen = false"
    >
      <div class="grid gap-2 sm:grid-cols-2">
        <button
          v-for="type in availableSectionTypes"
          :key="type"
          type="button"
          class="add-section-option"
          @click="addSection(type)"
        >
          <span class="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-[var(--site-bg)] text-[var(--site-muted)]">
            <AppIcon :name="sectionIcon(type)" :size="15" />
          </span>
          <span class="min-w-0">
            <span class="block text-[13px] font-semibold">{{ SECTION_META[type].label }}</span>
            <span class="mt-0.5 block text-[11px] leading-snug text-muted">{{ SECTION_META[type].hint }}</span>
          </span>
        </button>
      </div>
      <p v-if="!availableSectionTypes.length" class="py-4 text-center text-[13px] text-muted">
        所有标准板块都已经添加，可以继续添加自定义板块。
      </p>
    </BaseModal>

    <BaseModal
      :open="libraryOpen"
      :title="libraryTitle"
      :subtitle="librarySubtitle"
      width="lg"
      @close="libraryOpen = false"
    >
      <div v-if="libraryEntries.length">
        <div class="mb-2 flex items-center justify-between">
          <p class="text-[11.5px] text-muted">勾选需要添加到简历的内容，可多选。</p>
          <button type="button" class="btn-link text-[11.5px]" @click="selectAllLibrary">全选可添加</button>
        </div>
        <div class="space-y-1.5">
          <label
            v-for="entry in libraryEntries"
            :key="entry.id"
            class="picker-row"
            :class="{ 'is-disabled': entry.added }"
          >
            <input
              v-model="librarySelected"
              type="checkbox"
              :value="entry.id"
              :disabled="entry.added"
              class="mt-0.5 h-3.5 w-3.5 flex-none accent-[var(--site-accent)]"
            />
            <span class="min-w-0 flex-1">
              <span class="flex items-center gap-2">
                <span class="truncate text-[13px] font-medium">{{ entry.title }}</span>
                <span v-if="entry.added" class="chip chip-muted !text-[10px]">已添加</span>
              </span>
              <span v-if="entry.subtitle" class="mt-0.5 block truncate text-[11px] text-muted">{{ entry.subtitle }}</span>
            </span>
            <span v-if="entry.meta" class="flex-none text-[10.5px] text-muted num">{{ entry.meta }}</span>
          </label>
        </div>
      </div>
      <div v-else class="py-8 text-center">
        <p class="text-[13px] text-muted">{{ libraryEmptyText }}</p>
        <RouterLink v-if="libraryEmptyLink" :to="libraryEmptyLink" class="btn btn-secondary btn-sm mt-3" @click="libraryOpen = false">
          前往{{ libraryEmptyLinkName }}
        </RouterLink>
      </div>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="libraryOpen = false">取消</button>
        <button type="button" class="btn btn-primary" :disabled="!librarySelected.length" @click="addFromLibrary">
          添加所选{{ librarySelected.length ? `（${librarySelected.length}）` : '' }}
        </button>
      </template>
    </BaseModal>

    <BaseModal
      :open="itemModalOpen"
      :title="itemModalTitle"
      subtitle="只修改这份简历中的内容，不会影响原始经历库。"
      width="lg"
      @close="cancelItemEdit"
    >
      <div v-if="itemDraft" class="space-y-4">
        <template v-if="itemSectionType === 'projects'">
          <div class="field-grid">
            <BaseField label="项目名称" hint="填写能体现项目内容的名称。">
              <input v-model="itemDraft.name" class="input" placeholder="项目名称" />
            </BaseField>
            <BaseField label="担任角色" hint="例如负责人、核心开发、设计。">
              <input v-model="itemDraft.role" class="input" list="resume-project-roles" placeholder="例如：前端负责人" />
              <datalist id="resume-project-roles">
                <option v-for="role in PROJECT_ROLE_OPTIONS" :key="role" :value="role" />
              </datalist>
            </BaseField>
            <BaseField label="开始时间" hint="精确到月份即可。">
              <input v-model="itemDraft.start" class="input" type="month" />
            </BaseField>
            <BaseField label="结束时间" hint="仍在进行中可以留空。">
              <input v-model="itemDraft.end" class="input" type="month" />
            </BaseField>
          </div>
          <BaseField label="技术栈" optional hint="输入后按回车添加，可填写多项。">
            <TagInput v-model="itemDraft.stack" placeholder="Vue 3、Vite" />
          </BaseField>
          <BaseField label="成果要点" hint="写清做了什么、怎么做、结果如何，尽量带上数字。">
            <BulletListEditor v-model="itemDraft.highlights" />
          </BaseField>
          <BaseField label="项目链接" optional hint="可填写仓库、演示或作品页地址。">
            <input v-model="itemDraft.link" class="input" placeholder="https://..." />
          </BaseField>
        </template>

        <template v-else-if="itemSectionType === 'experiences'">
          <BaseField label="经历类型" hint="切换类型后，下方字段名称会同步调整。">
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="(meta, key) in EXPERIENCE_TYPES"
                :key="key"
                type="button"
                class="chip"
                :class="itemDraft.type === key ? 'chip-accent' : ''"
                @click="itemDraft.type = key"
              >
                {{ meta.label }}
              </button>
            </div>
          </BaseField>
          <div class="field-grid">
            <BaseField label="公司 / 组织" hint="填写完整名称，方便在简历中准确呈现。">
              <input v-model="itemDraft.org" class="input" placeholder="公司或组织名称" />
            </BaseField>
            <BaseField label="职位 / 角色" hint="写清身份或职责。">
              <input v-model="itemDraft.role" class="input" placeholder="例如：前端开发实习生" />
            </BaseField>
            <BaseField label="开始时间" hint="精确到月份即可。">
              <input v-model="itemDraft.start" class="input" type="month" />
            </BaseField>
            <BaseField label="结束时间" hint="仍在进行中可以留空。">
              <input v-model="itemDraft.end" class="input" type="month" />
            </BaseField>
          </div>
          <BaseField label="地点" optional hint="填写城市、校区或“远程”。">
            <input v-model="itemDraft.location" class="input" placeholder="杭州 / 远程" />
          </BaseField>
          <BaseField label="成果要点" hint="优先写清做了什么、怎么做、结果如何。">
            <BulletListEditor v-model="itemDraft.highlights" />
          </BaseField>
        </template>

        <template v-else-if="itemSectionType === 'awards'">
          <BaseField label="奖项名称" hint="填写赛事、奖学金或荣誉称号的完整名称。">
            <input v-model="itemDraft.title" class="input" placeholder="奖项名称" />
          </BaseField>
          <div class="field-grid">
            <BaseField label="级别" hint="可按颁发范围选择，也支持自己填写。">
              <input v-model="itemDraft.level" class="input" list="resume-award-levels" placeholder="国家级 / 省级" />
              <datalist id="resume-award-levels">
                <option v-for="level in AWARD_LEVEL_OPTIONS" :key="level" :value="level" />
              </datalist>
            </BaseField>
            <BaseField label="名次 / 等级" hint="例如一等奖、金奖、优秀奖。">
              <input v-model="itemDraft.rank" class="input" list="resume-award-ranks" placeholder="一等奖" />
              <datalist id="resume-award-ranks">
                <option v-for="rank in AWARD_RANK_OPTIONS" :key="rank" :value="rank" />
              </datalist>
            </BaseField>
            <BaseField label="获奖时间" hint="一般填写获奖年月。">
              <input v-model="itemDraft.date" class="input" type="month" />
            </BaseField>
            <BaseField label="颁发单位" optional hint="填写主办方、组委会或学校名称。">
              <input v-model="itemDraft.issuer" class="input" placeholder="颁发单位" />
            </BaseField>
          </div>
          <BaseField label="说明" optional hint="简要说明作品内容、个人贡献或评选范围。">
            <textarea v-model="itemDraft.description" class="textarea" rows="3" />
          </BaseField>
        </template>

        <template v-else-if="itemSectionType === 'education'">
          <div class="field-grid">
            <BaseField label="学校" hint="填写学校全称。">
              <input v-model="itemDraft.school" class="input" placeholder="学校名称" />
            </BaseField>
            <BaseField label="学历" hint="可选择常用学历，也可以自己填写。">
              <input v-model="itemDraft.degree" class="input" list="resume-degree-options" placeholder="本科 / 硕士" />
              <datalist id="resume-degree-options">
                <option v-for="degree in DEGREE_OPTIONS" :key="degree" :value="degree" />
              </datalist>
            </BaseField>
            <BaseField label="专业" hint="填写完整专业名称。">
              <input v-model="itemDraft.major" class="input" placeholder="专业名称" />
            </BaseField>
            <div class="grid grid-cols-2 gap-2">
              <BaseField label="开始" hint="精确到月份。">
                <input v-model="itemDraft.start" class="input" type="month" />
              </BaseField>
              <BaseField label="结束" hint="预计毕业可填预计时间。">
                <input v-model="itemDraft.end" class="input" type="month" />
              </BaseField>
            </div>
            <BaseField label="GPA" optional hint="例如 3.8 / 4.0。">
              <input v-model="itemDraft.gpa" class="input" placeholder="3.8 / 4.0" />
            </BaseField>
            <BaseField label="排名" optional hint="例如专业前 5%。">
              <input v-model="itemDraft.ranking" class="input" placeholder="专业前 5%" />
            </BaseField>
          </div>
          <BaseField label="补充说明" optional hint="可写课程、奖学金、学生工作等，点击下方快速添加。">
            <BulletListEditor v-model="itemDraft.highlights" placeholder="主修课程、荣誉等" />
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
        </template>

        <template v-else-if="itemSectionType === 'skills'">
          <BaseField label="分类名称" hint="可选择常用分类，或直接输入自己的分类名。">
            <input v-model="itemDraft.category" class="input" placeholder="例如：前端工程" />
            <SuggestionChips
              v-model="itemDraft.category"
              :options="SKILL_CATEGORY_OPTIONS"
              class="mt-2"
            />
          </BaseField>
          <BaseField label="技能项" hint="回车添加，可输入多个并以逗号分隔。">
            <TagInput v-model="itemDraft.items" placeholder="Vue 3、Vite" />
          </BaseField>
        </template>
      </div>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="cancelItemEdit">取消</button>
        <button type="button" class="btn btn-primary" @click="saveItemEdit">保存内容</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BaseModal from '../components/ui/BaseModal.vue'
import BaseField from '../components/ui/BaseField.vue'
import BulletListEditor from '../components/ui/BulletListEditor.vue'
import SuggestionChips from '../components/ui/SuggestionChips.vue'
import TagInput from '../components/ui/TagInput.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import ResumeThumb from '../components/resume/ResumeThumb.vue'
import ResumeMinimal from '../components/resume/ResumeMinimal.vue'
import ResumeClassic from '../components/resume/ResumeClassic.vue'
import ResumeModern from '../components/resume/ResumeModern.vue'
import { useDataStore } from '../stores/data'
import { confirmAction } from '../composables/useConfirm'
import { toast } from '../composables/useToast'
import { deepClone, monthText, rangeText } from '../lib/utils'
import {
  ACCENTS,
  DEFAULT_TITLES,
  EXPERIENCE_TYPES,
  RESUME_TEMPLATES,
  SECTION_META,
  awardToResumeItem,
  blankItem,
  createSection,
  educationToResumeItem,
  experienceToResumeItem,
  experienceTypeLabel,
  itemHasContent,
  itemSummary,
  projectToResumeItem,
  sectionHasContent,
  sectionTitle,
  skillGroupToResumeItem,
  visibleSections,
} from '../lib/resume'
import {
  AWARD_LEVEL_OPTIONS,
  AWARD_RANK_OPTIONS,
  DEGREE_OPTIONS,
  EDUCATION_DETAIL_PRESETS,
  PROJECT_ROLE_OPTIONS,
  SKILL_CATEGORY_OPTIONS,
} from '../lib/suggestions'

const route = useRoute()
const data = useDataStore()
const templates = RESUME_TEMPLATES
const accents = ACCENTS

const resume = computed(() => data.resumeById(route.params.id))
const templateName = computed(() => RESUME_TEMPLATES.find((t) => t.id === resume.value?.template)?.name || '素白')
const templateComponent = computed(() => {
  const map = { minimal: ResumeMinimal, classic: ResumeClassic, modern: ResumeModern }
  return map[resume.value?.template] || ResumeMinimal
})
const visibleCount = computed(() => (resume.value ? visibleSections(resume.value).length : 0))

const tab = ref('content')
const mobilePane = ref('edit')
const basicsOpen = ref(true)
const expandedId = ref('')
const saveState = ref('saved')
let saveTimer = null

function scheduleSave() {
  if (!resume.value) return
  saveState.value = 'saving'
  clearTimeout(saveTimer)
  saveTimer = window.setTimeout(async () => {
    await data.persistResume(resume.value)
    saveState.value = 'saved'
  }, 350)
}

async function flushSave() {
  if (!resume.value) return
  clearTimeout(saveTimer)
  saveTimer = null
  await data.persistResume(resume.value)
  saveState.value = 'saved'
}

function toggleSection(section) {
  expandedId.value = expandedId.value === section.id ? '' : section.id
}

function toggleVisible(section) {
  section.visible = section.visible === false
  scheduleSave()
}

function moveSection(index, direction) {
  const target = index + direction
  if (target < 0 || target >= resume.value.sections.length) return
  const list = resume.value.sections
  const [item] = list.splice(index, 1)
  list.splice(target, 0, item)
  scheduleSave()
}

function defaultTitle(type) {
  return DEFAULT_TITLES[resume.value?.language || 'zh']?.[type] || ''
}

function sectionCountLabel(section) {
  if (section.type === 'summary') return sectionHasContent(section, resume.value) ? '一段简介' : '尚未填写'
  if (section.type === 'custom') {
    const length = String(section.content || '').trim().length
    return length ? `${length} 字` : '尚未填写'
  }
  const count = (section.items || []).length
  return count ? `${count} 条内容` : '尚未添加内容'
}

async function removeSection(section) {
  const ok = await confirmAction({
    title: '删除这个板块？',
    message: `「${sectionTitle(section, resume.value.language)}」中的内容会从这份简历移除，原始经历库不受影响。`,
    confirmText: '删除板块',
    danger: true,
  })
  if (!ok) return
  resume.value.sections = resume.value.sections.filter((item) => item.id !== section.id)
  if (expandedId.value === section.id) expandedId.value = ''
  scheduleSave()
}

const addSectionOpen = ref(false)
const availableSectionTypes = computed(() => {
  const existing = new Set((resume.value?.sections || []).map((section) => section.type))
  return Object.keys(SECTION_META).filter((type) => type === 'custom' || !existing.has(type))
})

const sectionIcons = {
  summary: 'user',
  education: 'building',
  skills: 'layers',
  projects: 'folder',
  experiences: 'briefcase',
  awards: 'trophy',
  custom: 'file',
}

function sectionIcon(type) {
  return sectionIcons[type] || 'file'
}

function addSection(type) {
  const section = createSection(type)
  resume.value.sections.push(section)
  expandedId.value = section.id
  addSectionOpen.value = false
  tab.value = 'content'
  scheduleSave()
  toast(`已添加「${SECTION_META[type].label}」板块`)
}

function moveItem(section, index, direction) {
  const target = index + direction
  if (target < 0 || target >= section.items.length) return
  const [item] = section.items.splice(index, 1)
  section.items.splice(target, 0, item)
  scheduleSave()
}

function libraryButtonLabel(type) {
  if (type === 'education' || type === 'skills') return '从档案导入'
  if (type === 'projects') return '从项目库添加'
  if (type === 'awards') return '从奖项库添加'
  return '从经历库添加'
}

const libraryOpen = ref(false)
const libraryType = ref('projects')
const libraryTargetId = ref('')
const librarySelected = ref([])

const libraryTarget = computed(() => resume.value?.sections.find((section) => section.id === libraryTargetId.value) || null)

const libraryTitle = computed(() => {
  const map = {
    education: '从档案导入教育背景',
    skills: '从档案导入技能',
    projects: '从项目库添加',
    awards: '从奖项库添加',
    experiences: '从经历库添加',
  }
  return map[libraryType.value] || '添加内容'
})

const librarySubtitle = computed(() => {
  const target = libraryTarget.value
  return target ? `添加到「${sectionTitle(target, resume.value.language)}」板块，加入后可在简历中单独编辑。` : ''
})

const librarySource = computed(() => {
  if (libraryType.value === 'education') return data.profile.educations || []
  if (libraryType.value === 'skills') return data.profile.skills || []
  if (libraryType.value === 'projects') return data.projects
  if (libraryType.value === 'awards') return data.awards
  if (libraryType.value === 'experiences') return data.experiences
  return []
})

const libraryEntries = computed(() => {
  const existing = new Set((libraryTarget.value?.items || []).map((item) => item.sourceId).filter(Boolean))
  return librarySource.value.map((source) => {
    let title = ''
    let subtitle = ''
    let meta = ''
    if (libraryType.value === 'education') {
      title = source.school || '未命名学校'
      subtitle = [source.degree, source.major].filter(Boolean).join('｜')
      meta = rangeText(source.start, source.end)
    } else if (libraryType.value === 'skills') {
      title = source.category || '未分类'
      subtitle = (source.items || []).join('、')
    } else if (libraryType.value === 'projects') {
      title = source.name || '未命名项目'
      subtitle = [source.role, (source.techStack || []).slice(0, 3).join('、')].filter(Boolean).join('｜')
      meta = rangeText(source.startDate, source.endDate)
    } else if (libraryType.value === 'awards') {
      title = source.title || '未命名奖项'
      subtitle = [source.level, source.rank].filter(Boolean).join('｜')
      meta = monthText(source.date)
    } else if (libraryType.value === 'experiences') {
      title = source.org || '未命名经历'
      subtitle = [experienceTypeLabel(source.type, resume.value.language), source.title].filter(Boolean).join('｜')
      meta = rangeText(source.startDate, source.endDate)
    }
    return { id: source.id, title, subtitle, meta, added: existing.has(source.id) }
  })
})

const libraryEmptyText = computed(() => {
  const map = {
    education: '档案中还没有教育背景。',
    skills: '档案中还没有技能分类。',
    projects: '项目库中还没有项目。',
    awards: '奖项库中还没有奖项。',
    experiences: '经历库中还没有经历。',
  }
  return map[libraryType.value] || '暂无可添加的内容。'
})

const libraryEmptyLink = computed(() => {
  const map = {
    education: '/profile',
    skills: '/profile',
    projects: '/projects',
    awards: '/awards',
    experiences: '/experiences',
  }
  return map[libraryType.value] || ''
})

const libraryEmptyLinkName = computed(() => {
  const map = {
    education: '个人档案',
    skills: '个人档案',
    projects: '项目管理',
    awards: '奖项竞赛',
    experiences: '经历管理',
  }
  return map[libraryType.value] || ''
})

function openLibrary(section) {
  libraryType.value = section.type
  libraryTargetId.value = section.id
  librarySelected.value = []
  libraryOpen.value = true
}

function selectAllLibrary() {
  librarySelected.value = libraryEntries.value.filter((entry) => !entry.added).map((entry) => entry.id)
}

const sourceMappers = {
  education: educationToResumeItem,
  skills: skillGroupToResumeItem,
  projects: projectToResumeItem,
  awards: awardToResumeItem,
  experiences: experienceToResumeItem,
}

async function addFromLibrary() {
  const target = libraryTarget.value
  const mapper = sourceMappers[libraryType.value]
  if (!target || !mapper) return
  const chosen = librarySource.value.filter((source) => librarySelected.value.includes(source.id))
  for (const source of chosen) target.items.push(mapper(source))
  libraryOpen.value = false
  expandedId.value = target.id
  scheduleSave()
  toast(`已添加 ${chosen.length} 条内容到简历`)
}

const itemModalOpen = ref(false)
const itemDraft = ref(null)
const itemCtx = ref({ sectionId: '', itemId: '', isNew: false, sectionType: '' })

const itemSectionType = computed(() => itemCtx.value.sectionType)

const itemModalTitle = computed(() => {
  const map = {
    projects: '编辑项目经历',
    experiences: '编辑实习 / 科研经历',
    awards: '编辑奖项',
    education: '编辑教育背景',
    skills: '编辑技能分类',
  }
  return map[itemSectionType.value] || '编辑内容'
})

function addEducationDetail(preset) {
  if (!itemDraft.value) return
  if (!Array.isArray(itemDraft.value.highlights)) itemDraft.value.highlights = []
  const prefix = preset.text.split('：')[0]
  const exists = itemDraft.value.highlights.some((item) => String(item).trim().startsWith(prefix))
  if (!exists) itemDraft.value.highlights.push(preset.text)
}

function openItemEditor(section, item, isNew = false) {
  const draft = deepClone(item)
  if (!Array.isArray(draft.highlights)) draft.highlights = []
  if (section.type === 'projects' && !draft.highlights.length) draft.highlights = ['']
  if (section.type === 'skills' && !Array.isArray(draft.items)) draft.items = []
  itemDraft.value = draft
  itemCtx.value = { sectionId: section.id, itemId: item.id, isNew, sectionType: section.type }
  itemModalOpen.value = true
}

function addBlankItem(section) {
  const item = blankItem(section.type)
  section.items.push(item)
  expandedId.value = section.id
  scheduleSave()
  openItemEditor(section, item, true)
}

function cancelItemEdit() {
  if (itemCtx.value.isNew) {
    const section = resume.value.sections.find((item) => item.id === itemCtx.value.sectionId)
    if (section) section.items = section.items.filter((item) => item.id !== itemCtx.value.itemId)
    scheduleSave()
  }
  itemModalOpen.value = false
}

async function saveItemEdit() {
  const section = resume.value.sections.find((item) => item.id === itemCtx.value.sectionId)
  if (!section || !itemDraft.value) return
  const type = section.type
  const draft = deepClone(itemDraft.value)
  draft.id = itemCtx.value.itemId
  draft.highlights = (draft.highlights || []).filter((item) => String(item).trim())

  if (type === 'projects' && !String(draft.name || '').trim()) {
    toast('请填写项目名称', 'error')
    return
  }
  if (type === 'experiences' && !String(draft.org || '').trim()) {
    toast('请填写公司或组织名称', 'error')
    return
  }
  if (type === 'awards' && !String(draft.title || '').trim()) {
    toast('请填写奖项名称', 'error')
    return
  }
  if (type === 'education' && !String(draft.school || '').trim()) {
    toast('请填写学校名称', 'error')
    return
  }
  if (type === 'skills' && !String(draft.category || '').trim()) {
    toast('请填写技能分类名称', 'error')
    return
  }

  const index = section.items.findIndex((item) => item.id === itemCtx.value.itemId)
  if (index >= 0) section.items.splice(index, 1, draft)
  else section.items.push(draft)
  itemModalOpen.value = false
  scheduleSave()
  toast('简历内容已保存')
}

async function removeItem(section, item) {
  const ok = await confirmAction({
    title: '从简历中移除这条内容？',
    message: '只会从这份简历中移除，经历库中的原始记录不受影响。',
    confirmText: '移除',
    danger: true,
  })
  if (!ok) return
  section.items = section.items.filter((entry) => entry.id !== item.id)
  scheduleSave()
  toast('已从简历中移除')
}

function accentForTemplate(id) {
  if (id === 'classic') return resume.value?.accent || '#1d1d1f'
  if (id === 'modern') return '#35507d'
  return '#0b66e4'
}

function setTemplate(id) {
  resume.value.template = id
  scheduleSave()
}

function setAccent(value) {
  resume.value.accent = value
  scheduleSave()
}

function setDensity(value) {
  resume.value.density = value
  scheduleSave()
}

function setLanguage(value) {
  resume.value.language = value
  scheduleSave()
}

const canvasRef = ref(null)
const zoom = ref(1)
let resizeObserver = null

function updateZoom() {
  const node = canvasRef.value
  if (!node) return
  const available = node.clientWidth - 56
  if (available <= 0) return
  zoom.value = Math.max(0.35, Math.min(1, available / 794))
}

onMounted(async () => {
  await nextTick()
  updateZoom()
  if (typeof ResizeObserver !== 'undefined' && canvasRef.value) {
    resizeObserver = new ResizeObserver(updateZoom)
    resizeObserver.observe(canvasRef.value)
  }
  if (resume.value?.sections?.length) expandedId.value = resume.value.sections[0].id
})

watch(mobilePane, async () => {
  await nextTick()
  updateZoom()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
    if (resume.value) data.persistResume(resume.value)
  }
})

const A4_HEIGHT_PX = (297 / 25.4) * 96
let printRestoreTimer = null

function measurePrintScale() {
  const pageEl = document.querySelector('.resume-page')
  if (!pageEl) return 1
  document.body.classList.add('is-measuring-print')
  const height = pageEl.scrollHeight
  document.body.classList.remove('is-measuring-print')
  if (height <= A4_HEIGHT_PX) return 1
  const scale = (A4_HEIGHT_PX - 8) / height
  return scale >= 0.84 ? Number(scale.toFixed(3)) : 1
}

async function exportPdf() {
  await flushSave()
  await nextTick()
  const root = document.documentElement
  const previousTitle = document.title
  const name = resume.value.basics.name || '简历'
  document.title = `${name}-${resume.value.title || '履历引擎'}`

  const scale = measurePrintScale()
  root.style.setProperty('--print-scale', String(scale))
  root.style.setProperty('--print-page-width', `${(210 / scale).toFixed(3)}mm`)

  let restored = false
  const restore = () => {
    if (restored) return
    restored = true
    document.title = previousTitle
    document.body.classList.remove('is-measuring-print')
    root.style.removeProperty('--print-scale')
    root.style.removeProperty('--print-page-width')
    if (printRestoreTimer) {
      window.clearTimeout(printRestoreTimer)
      printRestoreTimer = null
    }
  }
  if (printRestoreTimer) window.clearTimeout(printRestoreTimer)
  window.addEventListener('afterprint', restore, { once: true })
  window.print()
  printRestoreTimer = window.setTimeout(restore, 5000)
}
</script>
