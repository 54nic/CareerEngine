export const APPLICATION_STATUSES = [
  { id: 'wishlist', label: '意向收藏', short: '收藏', tone: 'gray' },
  { id: 'applied', label: '已投递', short: '投递', tone: 'blue' },
  { id: 'written', label: '笔试', short: '笔试', tone: 'amber' },
  { id: 'interview', label: '面试', short: '面试', tone: 'violet' },
  { id: 'offer', label: 'Offer', short: 'Offer', tone: 'green' },
  { id: 'rejected', label: '已结束', short: '结束', tone: 'rose' },
]

export const STATUS_META = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s.id, s]))

export const STATUS_TONE_CLASSES = {
  gray: 'bg-slate-100 text-slate-600 border-slate-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  violet: 'bg-violet-50 text-violet-700 border-violet-100',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  rose: 'bg-rose-50 text-rose-700 border-rose-100',
}

export const APPLICATION_CHANNELS = ['官网', '内推', '校园招聘', '招聘平台', '线下宣讲', '其他']

export const STATUS_DOT_COLORS = {
  gray: '#94a3b8',
  blue: '#2b7fff',
  amber: '#f59e0b',
  violet: '#8b5cf6',
  green: '#10b981',
  rose: '#f43f5e',
}
