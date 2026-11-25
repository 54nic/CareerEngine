import { reactive } from 'vue'

const state = reactive({ items: [] })
let seed = 0

export function dismissToast(id) {
  const index = state.items.findIndex((item) => item.id === id)
  if (index >= 0) state.items.splice(index, 1)
}

export function toast(message, type = 'success', duration = 2800) {
  const id = ++seed
  state.items.push({ id, message, type })
  window.setTimeout(() => dismissToast(id), duration)
  return id
}

export function useToastState() {
  return state
}
