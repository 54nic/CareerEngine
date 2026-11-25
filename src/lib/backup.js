import { COLLECTIONS } from './db'
import { EXPERIENCE_TYPES, normalizeResume } from './resume'
import { APPLICATION_STATUSES } from './applications'
import { nowISO, uid } from './utils'

export function buildBackup(state) {
  const data = { profile: state.profile }
  for (const name of COLLECTIONS) data[name] = state[name] || []
  return {
    app: 'career-engine',
    version: 1,
    exportedAt: nowISO(),
    data,
  }
}

function str(value) {
  return typeof value === 'string' ? value : ''
}

function list(value) {
  return Array.isArray(value) ? value : []
}

function strings(value) {
  return list(value).map((v) => String(v ?? '')).filter((v) => v.trim())
}

function normalizeAttachments(value) {
  return list(value)
    .filter((a) => a && typeof a.dataUrl === 'string' && a.dataUrl)
    .map((a) => ({
      id: a.id || uid(),
      name: str(a.name) || '附件',
      size: Number(a.size) || 0,
      type: str(a.type) || 'application/octet-stream',
      dataUrl: a.dataUrl,
    }))
}

export function normalizeProfile(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: 'me',
    name: str(raw.name),
    headline: str(raw.headline),
    phone: str(raw.phone),
    email: str(raw.email),
    city: str(raw.city),
    website: str(raw.website),
    github: str(raw.github),
    summary: str(raw.summary),
    educations: list(raw.educations).map((edu) => ({
      id: edu?.id || uid(),
      school: str(edu?.school),
      degree: str(edu?.degree),
      major: str(edu?.major),
      start: str(edu?.start),
      end: str(edu?.end),
      gpa: str(edu?.gpa),
      ranking: str(edu?.ranking),
      details: strings(edu?.details),
    })),
    skills: list(raw.skills)
      .map((group) => ({
        id: group?.id || uid(),
        category: str(group?.category),
        items: strings(group?.items),
      }))
      .filter((group) => group.category || group.items.length),
    updatedAt: str(raw.updatedAt) || nowISO(),
  }
}

export function normalizeProject(raw) {
  return {
    id: raw?.id || uid(),
    name: str(raw?.name),
    role: str(raw?.role),
    startDate: str(raw?.startDate),
    endDate: str(raw?.endDate),
    summary: str(raw?.summary),
    highlights: strings(raw?.highlights),
    techStack: strings(raw?.techStack),
    tags: strings(raw?.tags),
    links: list(raw?.links)
      .map((link) => ({ label: str(link?.label) || '链接', url: str(link?.url) }))
      .filter((link) => link.url),
    attachments: normalizeAttachments(raw?.attachments),
    createdAt: str(raw?.createdAt) || nowISO(),
    updatedAt: str(raw?.updatedAt) || nowISO(),
  }
}

export function normalizeAward(raw) {
  const cert = normalizeAttachments(raw?.certificate ? [raw.certificate] : [])
  return {
    id: raw?.id || uid(),
    title: str(raw?.title),
    level: str(raw?.level),
    rank: str(raw?.rank),
    date: str(raw?.date),
    issuer: str(raw?.issuer),
    description: str(raw?.description),
    certificate: cert[0] || null,
    createdAt: str(raw?.createdAt) || nowISO(),
    updatedAt: str(raw?.updatedAt) || nowISO(),
  }
}

export function normalizeExperience(raw) {
  const type = Object.prototype.hasOwnProperty.call(EXPERIENCE_TYPES, raw?.type) ? raw.type : 'other'
  return {
    id: raw?.id || uid(),
    type,
    org: str(raw?.org),
    title: str(raw?.title),
    location: str(raw?.location),
    startDate: str(raw?.startDate),
    endDate: str(raw?.endDate),
    description: str(raw?.description),
    highlights: strings(raw?.highlights),
    tags: strings(raw?.tags),
    createdAt: str(raw?.createdAt) || nowISO(),
    updatedAt: str(raw?.updatedAt) || nowISO(),
  }
}

export function normalizeApplication(raw) {
  const validStatus = APPLICATION_STATUSES.some((s) => s.id === raw?.status)
  return {
    id: raw?.id || uid(),
    company: str(raw?.company),
    role: str(raw?.role),
    city: str(raw?.city),
    channel: str(raw?.channel),
    appliedAt: str(raw?.appliedAt),
    status: validStatus ? raw.status : 'wishlist',
    nextStep: str(raw?.nextStep),
    nextStepDate: str(raw?.nextStepDate),
    resumeId: str(raw?.resumeId),
    link: str(raw?.link),
    notes: str(raw?.notes),
    createdAt: str(raw?.createdAt) || nowISO(),
    updatedAt: str(raw?.updatedAt) || nowISO(),
  }
}

export function parseBackup(input) {
  if (!input || typeof input !== 'object') {
    throw new Error('备份文件内容无效')
  }
  const source = input.data && typeof input.data === 'object' ? input.data : input
  if (!source.profile && !COLLECTIONS.some((name) => Array.isArray(source[name]) && source[name].length)) {
    throw new Error('备份文件里没有可识别的数据')
  }
  return {
    profile: normalizeProfile(source.profile),
    projects: list(source.projects).map(normalizeProject),
    awards: list(source.awards).map(normalizeAward),
    experiences: list(source.experiences).map(normalizeExperience),
    resumes: list(source.resumes).map(normalizeResume).filter(Boolean),
    applications: list(source.applications).map(normalizeApplication),
  }
}
