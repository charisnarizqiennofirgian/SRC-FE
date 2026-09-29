import { nextTick } from 'vue'

const FOCUSABLE = '.vs__search, input:not([type="radio"]):not([type="checkbox"]), textarea'

export function useEnterAddRow() {
  const onFormEnter = (e) => {
    const t = e.target
    if (t.tagName === 'BUTTON' && t.type === 'button') return
    e.preventDefault()
  }

  const onEnterAdd = (e, addFn, scopeSelector, rowSelector) => {
    const t = e.target
    if (t.tagName !== 'INPUT' || t.type === 'radio' || t.type === 'checkbox' || t.closest('.v-select')) return
    e.preventDefault()
    e.stopPropagation()
    const scope = e.currentTarget.closest(scopeSelector)
    addFn()
    nextTick(() => {
      if (!scope) return
      const rows = scope.querySelectorAll(rowSelector)
      const last = rows[rows.length - 1]
      last?.querySelector(FOCUSABLE)?.focus()
    })
  }

  return { onFormEnter, onEnterAdd }
}
