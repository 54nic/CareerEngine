import { reactive } from 'vue'

const state = reactive({
  open: false,
  title: '',
  message: '',
  confirmText: '确认',
  cancelText: '取消',
  danger: false,
})

let resolver = null

export function confirmAction(options = {}) {
  return new Promise((resolve) => {
    state.title = options.title || '请确认'
    state.message = options.message || ''
    state.confirmText = options.confirmText || '确认'
    state.cancelText = options.cancelText || '取消'
    state.danger = Boolean(options.danger)
    state.open = true
    resolver = resolve
  })
}

export function finishConfirm(result) {
  state.open = false
  const resolve = resolver
  resolver = null
  if (resolve) resolve(result)
}

export function useConfirmState() {
  return state
}
