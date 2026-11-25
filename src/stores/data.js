import { defineStore } from 'pinia'
import {
  appendData,
  clearAllData,
  deleteRecord,
  loadAll,
  replaceAllData,
  saveProfile,
  saveRecord,
} from '../lib/db'
import {
  buildBackup,
  normalizeApplication,
  normalizeAward,
  normalizeExperience,
  normalizeProfile,
  normalizeProject,
  parseBackup,
} from '../lib/backup'
import { createResume, duplicateResume } from '../lib/resume'
import { buildSampleData } from '../lib/sample'
import { nowISO, sortByUpdated } from '../lib/utils'

const NORMALIZERS = {
  projects: normalizeProject,
  awards: normalizeAward,
  experiences: normalizeExperience,
  applications: normalizeApplication,
}

export function makeProfile() {
  return {
    id: 'me',
    name: '',
    headline: '',
    phone: '',
    email: '',
    city: '',
    website: '',
    github: '',
    summary: '',
    educations: [],
    skills: [],
    updatedAt: nowISO(),
  }
}

export const useDataStore = defineStore('data', {
  state: () => ({
    ready: false,
    storageError: false,
    profile: makeProfile(),
    projects: [],
    awards: [],
    experiences: [],
    resumes: [],
    applications: [],
    lastSavedAt: null,
  }),

  getters: {
    isEmpty(state) {
      return (
        !state.profile.name.trim() &&
        state.projects.length === 0 &&
        state.awards.length === 0 &&
        state.experiences.length === 0 &&
        state.resumes.length === 0 &&
        state.applications.length === 0
      )
    },
    totalRecords(state) {
      return (
        state.projects.length +
        state.awards.length +
        state.experiences.length +
        state.resumes.length +
        state.applications.length
      )
    },
    profileCompleteness(state) {
      const checks = [
        Boolean(state.profile.name.trim()),
        Boolean(state.profile.headline.trim()),
        Boolean(state.profile.phone.trim() || state.profile.email.trim()),
        Boolean(state.profile.summary.trim()),
        state.profile.educations.length > 0,
        state.profile.skills.length > 0,
        state.projects.length > 0,
        state.experiences.length > 0,
        state.awards.length > 0,
        state.resumes.length > 0,
      ]
      return Math.round((checks.filter(Boolean).length / checks.length) * 100)
    },
    resumeById(state) {
      return (id) => state.resumes.find((r) => r.id === id) || null
    },
    applicationStats(state) {
      const stats = {}
      for (const app of state.applications) stats[app.status] = (stats[app.status] || 0) + 1
      return stats
    },
  },

  actions: {
    async init() {
      try {
        const data = await loadAll()
        this.applyData(data)
      } catch (error) {
        console.error('无法读取本地数据库', error)
        this.storageError = true
      } finally {
        this.ready = true
      }
    },

    applyData(data) {
      this.profile = data.profile ? normalizeProfile(data.profile) : makeProfile()
      this.projects = sortByUpdated((data.projects || []).map(normalizeProject))
      this.awards = sortByUpdated((data.awards || []).map(normalizeAward))
      this.experiences = sortByUpdated((data.experiences || []).map(normalizeExperience))
      this.resumes = sortByUpdated((data.resumes || []).filter(Boolean))
      this.applications = sortByUpdated((data.applications || []).map(normalizeApplication))
    },

    async _reload() {
      try {
        const data = await loadAll()
        this.applyData(data)
      } catch (error) {
        console.error('无法重新读取本地数据库', error)
        this.storageError = true
      }
    },

    _markSaved() {
      if (!this.storageError) this.lastSavedAt = Date.now()
    },

    async _write(task) {
      if (this.storageError) return
      try {
        await task()
        this._markSaved()
      } catch (error) {
        console.error('写入本地数据库失败', error)
        this.storageError = true
      }
    },

    async updateProfile(patch) {
      this.profile = normalizeProfile({ ...this.profile, ...patch })
      await this._write(() => saveProfile(this.profile))
    },

    async persistProfile() {
      this.profile.updatedAt = nowISO()
      await this._write(() => saveProfile(this.profile))
    },

    async upsert(collection, payload) {
      if (!NORMALIZERS[collection]) throw new Error('未知的数据集合')
      const record = NORMALIZERS[collection](payload)
      record.createdAt = payload.createdAt || record.createdAt || nowISO()
      record.updatedAt = nowISO()
      const list = this[collection]
      const index = list.findIndex((item) => item.id === record.id)
      if (index >= 0) list.splice(index, 1, record)
      else list.unshift(record)
      this[collection] = sortByUpdated(list)
      await this._write(() => saveRecord(collection, record))
      return record
    },

    async remove(collection, id) {
      this[collection] = this[collection].filter((item) => item.id !== id)
      await this._write(() => deleteRecord(collection, id))
    },

    async persistResume(resume) {
      resume.updatedAt = nowISO()
      await this._write(() => saveRecord('resumes', resume))
    },

    async addResume(resume) {
      this.resumes.unshift(resume)
      await this._write(() => saveRecord('resumes', resume))
      return resume
    },

    createResumeFromProfile(overrides = {}) {
      return createResume(this.profile, overrides)
    },

    async duplicateResumeById(id) {
      const source = this.resumes.find((r) => r.id === id)
      if (!source) return null
      const copy = duplicateResume(source)
      this.resumes.unshift(copy)
      await this._write(() => saveRecord('resumes', copy))
      return copy
    },

    async deleteResume(id) {
      await this.remove('resumes', id)
      for (const app of this.applications.filter((a) => a.resumeId === id)) {
        await this.upsert('applications', { ...app, resumeId: '' })
      }
    },

    async clearAll() {
      await clearAllData()
      this.storageError = false
      this.profile = makeProfile()
      this.projects = []
      this.awards = []
      this.experiences = []
      this.resumes = []
      this.applications = []
      this.lastSavedAt = Date.now()
    },

    async importBackup(payload) {
      const data = parseBackup(payload)
      await replaceAllData(data)
      await this._reload()
      this._markSaved()
      return data
    },

    async loadSample() {
      const sample = buildSampleData()
      const keepProfile =
        Boolean(this.profile.name.trim()) ||
        Boolean(this.profile.headline.trim()) ||
        this.profile.educations.length > 0
      if (keepProfile) delete sample.profile
      await appendData(sample)
      await this._reload()
      this._markSaved()
    },

    exportBackup() {
      return buildBackup(this.$state)
    },
  },
})
