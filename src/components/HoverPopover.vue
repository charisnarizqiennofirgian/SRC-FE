<template>
  <span
    ref="triggerEl"
    class="hp-trigger"
    :class="{ 'hp-active': enabled }"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <slot />
    <Teleport to="body">
      <div
        v-if="open"
        ref="popEl"
        class="hp-pop"
        :style="style"
        @mouseenter="cancelClose"
        @mouseleave="startClose"
      >
        <slot name="content" />
      </div>
    </Teleport>
  </span>
</template>

<script setup>
import { ref, reactive, nextTick, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  enabled: { type: Boolean, default: true },
  width: { type: Number, default: 260 },
})

const triggerEl = ref(null)
const popEl = ref(null)
const open = ref(false)
const style = reactive({ left: '0px', top: '0px', width: props.width + 'px' })

let closeTimer = null

const cancelClose = () => {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

const startClose = () => {
  cancelClose()
  closeTimer = setTimeout(() => {
    open.value = false
  }, 140)
}

const position = () => {
  const t = triggerEl.value
  const p = popEl.value
  if (!t || !p) return
  const r = t.getBoundingClientRect()
  const pad = 8
  const gap = 8
  const vw = window.innerWidth
  const vh = window.innerHeight
  const pw = p.offsetWidth
  const ph = p.offsetHeight

  let left = r.right + gap
  if (left + pw > vw - pad) {
    left = r.left - gap - pw
    if (left < pad) left = Math.max(pad, vw - pw - pad)
  }

  let top = r.top
  if (top + ph > vh - pad) top = vh - ph - pad
  if (top < pad) top = pad

  style.left = Math.round(left) + 'px'
  style.top = Math.round(top) + 'px'
}

const onEnter = () => {
  if (!props.enabled) return
  cancelClose()
  open.value = true
  nextTick(position)
}

const onLeave = () => {
  if (!props.enabled) return
  startClose()
}

watch(open, (v) => {
  if (v) {
    window.addEventListener('scroll', position, true)
    window.addEventListener('resize', position)
  } else {
    window.removeEventListener('scroll', position, true)
    window.removeEventListener('resize', position)
  }
})

onBeforeUnmount(() => {
  cancelClose()
  window.removeEventListener('scroll', position, true)
  window.removeEventListener('resize', position)
})
</script>

<style scoped>
.hp-trigger {
  display: inline;
}

.hp-active {
  cursor: help;
}

.hp-pop {
  position: fixed;
  z-index: 9999;
  background: #1f2937;
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.45;
  text-align: left;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  max-height: min(70vh, 360px);
  overflow-y: auto;
  overscroll-behavior: contain;
}
</style>
