import { deepClone, monthText, nowISO, rangeText, uid } from './utils'

export const RESUME_TEMPLATES = [
  { id: 'minimal', name: '素白', desc: '单栏排版，克制留白', tone: '通用岗位' },
  { id: 'classic', name: '雅致', desc: '衬线标题，经典气质', tone: '学术 / 研究' },
  { id: 'modern', name: '双栏', desc: '侧栏分区，信息清楚', tone: '技术 / 产品' },
]

export const ACCENTS = [
  { value: '#0b66e4', name: '标准蓝' },
  { value: '#1d1d1f', name: '石墨黑' },
  { value: '#35507d', name: '藏青' },
  { value: '#0f6b5c', name: '松绿' },
  { value: '#8a5a2b', name: '赭石' },
]

export const SECTION_META = {
  summary: { label: '个人简介', hint: '一段话概括方向与优势' },
  education: { label: '教育背景', hint: '学校、专业与学业表现' },
  skills: { label: '专业技能', hint: '按分类整理技能与工具' },
  projects: { label: '项目经历', hint: '项目职责、技术与成果' },
  experiences: { label: '实习与科研', hint: '实习、科研、校园等经历' },
  awards: { label: '荣誉奖项', hint: '竞赛、奖学金与证书' },
  custom: { label: '自定义板块', hint: '补充其他信息' },
}

export const EXPERIENCE_TYPES = {
  internship: { label: '实习', en: 'Internship', tone: 'blue' },
  research: { label: '科研', en: 'Research', tone: 'violet' },
  paper: { label: '论文', en: 'Publication', tone: 'amber' },
  campus: { label: '校园', en: 'Campus', tone: 'green' },
  other: { label: '其他', en: 'Experience', tone: 'gray' },
}

export function experienceTypeLabel(id, language = 'zh') {
  const meta = EXPERIENCE_TYPES[id] || EXPERIENCE_TYPES.other
  return language === 'en' ? meta.en : meta.label
}

const CONTACT_LABELS = {
  zh: { phone: '电话', email: '邮箱', city: '城市', website: '网站', github: 'GitHub' },
  en: { phone: 'Phone', email: 'Email', city: 'City', website: 'Website', github: 'GitHub' },
}

export function contactLabel(key, language = 'zh') {
  return CONTACT_LABELS[language]?.[key] || CONTACT_LABELS.zh[key] || ''
}

export const DEFAULT_TITLES = {
  zh: {
    summary: '个人简介',
    education: '教育背景',
    skills: '专业技能',
    projects: '项目经历',
    experiences: '实习与科研',
    awards: '荣誉奖项',
    custom: '补充信息',
  },
  en: {
    summary: 'Summary',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    experiences: 'Experience',
    awards: 'Honors & Awards',
    custom: 'Additional',
  },
}

export function sectionTitle(section, language = 'zh') {
  if (section?.titleCustom && section.titleCustom.trim()) return section.titleCustom.trim()
  return DEFAULT_TITLES[language]?.[section?.type] || ''
}

function text(value) {
  return String(value ?? '').trim().length > 0
}

export function itemHasContent(type, item) {
  if (!item) return false
  switch (type) {
    case 'projects':
      return text(item.name) || text(item.role) || (item.highlights || []).some(text)
    case 'experiences':
      return text(item.org) || text(item.role) || (item.highlights || []).some(text)
    case 'awards':
      return text(item.title) || text(item.issuer) || text(item.description)
    case 'education':
      return text(item.school) || text(item.major) || text(item.degree)
    case 'skills':
      return (item.items || []).some(text) || text(item.category)
    default:
      return false
  }
}

export function sectionHasContent(section, resume) {
  if (!section) return false
  switch (section.type) {
    case 'summary':
      return text(resume?.basics?.summary)
    case 'custom':
      return text(section.content)
    default:
      return (section.items || []).some((item) => itemHasContent(section.type, item))
  }
}

export function visibleSections(resume) {
  return (resume?.sections || []).filter((s) => s.visible !== false && sectionHasContent(s, resume))
}

export function blankItem(type) {
  switch (type) {
    case 'projects':
      return {
        id: uid(),
        sourceId: null,
        name: '',
        role: '',
        start: '',
        end: '',
        link: '',
        stack: [],
        highlights: [''],
      }
    case 'experiences':
      return {
        id: uid(),
        sourceId: null,
        type: 'internship',
        org: '',
        role: '',
        location: '',
        start: '',
        end: '',
        highlights: [''],
      }
    case 'awards':
      return {
        id: uid(),
        sourceId: null,
        title: '',
        level: '',
        rank: '',
        date: '',
        issuer: '',
        description: '',
      }
    case 'education':
      return {
        id: uid(),
        sourceId: null,
        school: '',
        degree: '',
        major: '',
        start: '',
        end: '',
        gpa: '',
        ranking: '',
        highlights: [],
      }
    case 'skills':
      return { id: uid(), sourceId: null, category: '', items: [] }
    default:
      return { id: uid(), sourceId: null }
  }
}

export function projectToResumeItem(project) {
  return {
    id: uid(),
    sourceId: project.id,
    name: project.name || '',
    role: project.role || '',
    start: project.startDate || '',
    end: project.endDate || '',
    link: project.links?.[0]?.url || '',
    stack: deepClone(project.techStack || []),
    highlights: deepClone((project.highlights || []).filter((h) => String(h).trim())),
  }
}

export function experienceToResumeItem(exp) {
  return {
    id: uid(),
    sourceId: exp.id,
    type: exp.type || 'other',
    org: exp.org || '',
    role: exp.title || '',
    location: exp.location || '',
    start: exp.startDate || '',
    end: exp.endDate || '',
    highlights: deepClone((exp.highlights || []).filter((h) => String(h).trim())),
  }
}

export function awardToResumeItem(award) {
  return {
    id: uid(),
    sourceId: award.id,
    title: award.title || '',
    level: award.level || '',
    rank: award.rank || '',
    date: award.date || '',
    issuer: award.issuer || '',
    description: award.description || '',
  }
}

export function educationToResumeItem(edu) {
  return {
    id: uid(),
    sourceId: edu.id,
    school: edu.school || '',
    degree: edu.degree || '',
    major: edu.major || '',
    start: edu.start || '',
    end: edu.end || '',
    gpa: edu.gpa || '',
    ranking: edu.ranking || '',
    highlights: deepClone((edu.details || []).filter((h) => String(h).trim())),
  }
}

export function skillGroupToResumeItem(group) {
  return {
    id: uid(),
    sourceId: group.id,
    category: group.category || '',
    items: deepClone((group.items || []).filter((i) => String(i).trim())),
  }
}

export function createSection(type, items = []) {
  return {
    id: uid(),
    type,
    titleCustom: '',
    visible: true,
    content: '',
    items,
  }
}

export function createResume(profile, overrides = {}) {
  const timestamp = nowISO()
  const basics = {
    name: profile?.name || '',
    headline: profile?.headline || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    city: profile?.city || '',
    website: profile?.website || '',
    github: profile?.github || '',
    summary: profile?.summary || '',
  }
  const resume = {
    id: uid(),
    title: overrides.title || '未命名简历',
    targetRole: overrides.targetRole || profile?.headline || '',
    template: 'minimal',
    language: 'zh',
    accent: '#0b66e4',
    typeScale: 1,
    density: 'cozy',
    basics,
    sections: [
      createSection('summary'),
      createSection('education', (profile?.educations || []).map(educationToResumeItem)),
      createSection('skills', (profile?.skills || []).map(skillGroupToResumeItem)),
      createSection('projects'),
      createSection('experiences'),
      createSection('awards'),
    ],
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  return Object.assign(resume, overrides)
}

export function itemSummary(type, item) {
  if (!item) return { title: '', subtitle: '', meta: '' }
  switch (type) {
    case 'projects':
      return {
        title: item.name || '未命名项目',
        subtitle: [item.role, (item.stack || []).slice(0, 3).join('、')].filter(Boolean).join('｜'),
        meta: rangeText(item.start, item.end),
      }
    case 'experiences':
      return {
        title: item.org || '未命名经历',
        subtitle: [EXPERIENCE_TYPES[item.type]?.label, item.role].filter(Boolean).join('｜'),
        meta: rangeText(item.start, item.end),
      }
    case 'awards':
      return {
        title: item.title || '未命名奖项',
        subtitle: [item.level, item.rank].filter(Boolean).join('，'),
        meta: monthText(item.date),
      }
    case 'education':
      return {
        title: item.school || '未命名学校',
        subtitle: [item.degree, item.major].filter(Boolean).join('，'),
        meta: rangeText(item.start, item.end),
      }
    case 'skills':
      return {
        title: item.category || '未分类',
        subtitle: (item.items || []).join('、'),
        meta: '',
      }
    default:
      return { title: '', subtitle: '', meta: '' }
  }
}

export function resumeContactList(basics) {
  if (!basics) return []
  return [
    { key: 'phone', value: basics.phone },
    { key: 'email', value: basics.email },
    { key: 'city', value: basics.city },
    { key: 'website', value: basics.website },
    { key: 'github', value: basics.github },
  ].filter((entry) => text(entry.value))
}

export function duplicateResume(resume) {
  const copy = deepClone(resume)
  copy.id = uid()
  copy.title = `${resume.title || '未命名简历'} 副本`
  copy.createdAt = nowISO()
  copy.updatedAt = nowISO()
  copy.sections = (copy.sections || []).map((section) => ({
    ...section,
    id: uid(),
    items: (section.items || []).map((item) => ({ ...item, id: uid() })),
  }))
  return copy
}

export function normalizeResume(raw) {
  if (!raw || typeof raw !== 'object') return null
  const template = RESUME_TEMPLATES.some((t) => t.id === raw.template) ? raw.template : 'minimal'
  const language = raw.language === 'en' ? 'en' : 'zh'
  const sections = Array.isArray(raw.sections)
    ? raw.sections
        .filter((s) => s && Object.prototype.hasOwnProperty.call(SECTION_META, s.type))
        .map((s) => ({
          id: s.id || uid(),
          type: s.type,
          titleCustom: typeof s.titleCustom === 'string' ? s.titleCustom : '',
          visible: s.visible !== false,
          content: typeof s.content === 'string' ? s.content : '',
          items: Array.isArray(s.items)
            ? s.items.map((item) => ({ ...blankItem(s.type), ...item, id: item?.id || uid() }))
            : [],
        }))
    : createResume(null).sections
  const basics = raw.basics && typeof raw.basics === 'object' ? raw.basics : {}
  return {
    id: raw.id || uid(),
    title: text(raw.title) ? raw.title : '未命名简历',
    targetRole: typeof raw.targetRole === 'string' ? raw.targetRole : '',
    template,
    language,
    accent: typeof raw.accent === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(raw.accent) ? raw.accent : '#0b66e4',
    typeScale: Number(raw.typeScale) >= 0.9 && Number(raw.typeScale) <= 1.1 ? Number(raw.typeScale) : 1,
    density: raw.density === 'compact' ? 'compact' : 'cozy',
    basics: {
      name: '',
      headline: '',
      phone: '',
      email: '',
      city: '',
      website: '',
      github: '',
      summary: '',
      ...basics,
    },
    sections,
    createdAt: raw.createdAt || nowISO(),
    updatedAt: raw.updatedAt || nowISO(),
  }
}
