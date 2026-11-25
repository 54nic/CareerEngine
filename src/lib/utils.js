export function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(16).slice(2, 10)
}

export function nowISO() {
  return new Date().toISOString()
}

export function deepClone(value) {
  return JSON.parse(JSON.stringify(value))
}

export function monthText(month) {
  if (!month) return ''
  const parts = String(month).split('-')
  if (parts.length < 2) return String(month)
  return `${parts[0]}.${parts[1]}`
}

export function rangeText(start, end) {
  const s = monthText(start)
  const e = monthText(end)
  if (s && e) return `${s} – ${e}`
  return s || e
}

export function todayMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function todayDate() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatFullDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
}

export function formatDateShort(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export function relativeTime(iso) {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < 30 * day) return `${Math.floor(diff / day)} 天前`
  return formatDateShort(iso)
}

export function timeText(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  downloadBlob(filename, blob)
}

export function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error || new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i += 1
  }
  const digits = value >= 100 || i === 0 ? 0 : value >= 10 ? 1 : 2
  return `${value.toFixed(digits)} ${units[i]}`
}

export function sortByUpdated(list) {
  return [...list].sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
}

export function firstLine(text, fallback = '') {
  const value = String(text || '').trim()
  if (!value) return fallback
  return value
}

export function safeFileName(name, fallback = 'file') {
  const cleaned = String(name || '')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned || fallback
}
