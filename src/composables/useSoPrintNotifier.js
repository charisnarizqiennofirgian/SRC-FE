import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import apiClient from '../api/axios'

const POLL_MS = 60000
const KNOWN_KEY = 'so_print_known'

const pendingCount = ref(0)
const pendingItems = ref([])

let timer = null
let routerRef = null
let toastRef = null

const STATUS_TEXT = {
  baru: 'SO baru, perlu dicetak',
  berubah: 'SO berubah, cetak ulang',
  batal: 'SO dibatalkan, tarik kertas dari lapangan',
}

const hasSoPermission = () => {
  try {
    return JSON.parse(localStorage.getItem('permissions') || '[]').includes('dokumen-so')
  } catch {
    return false
  }
}

const readKnown = () => {
  try {
    const raw = sessionStorage.getItem(KNOWN_KEY)
    return raw === null ? null : new Set(JSON.parse(raw))
  } catch {
    return null
  }
}

const writeKnown = (keys) => {
  try {
    sessionStorage.setItem(KNOWN_KEY, JSON.stringify([...keys]))
  } catch {}
}

const beep = () => {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    ;[0, 0.3].forEach((t) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = 880
      osc.connect(gain)
      gain.connect(ctx.destination)
      gain.gain.setValueAtTime(0.2, ctx.currentTime + t)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.25)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + 0.25)
    })
    setTimeout(() => ctx.close(), 1500)
  } catch {}
}

const goToList = () => {
  if (routerRef) routerRef.push({ name: 'SoTerbaru' })
}

const notify = (items) => {
  if (!toastRef || items.length === 0) return
  const hasBatal = items.some((i) => i.print_status === 'batal')
  let message
  if (items.length === 1) {
    const i = items[0]
    message = `${STATUS_TEXT[i.print_status] || 'SO perlu dicetak'}: ${i.so_number}${i.buyer_name ? ` (${i.buyer_name})` : ''}`
  } else {
    const list = items.slice(0, 5).map((i) => i.so_number).join(', ')
    message = `${items.length} SO perlu ditindaklanjuti: ${list}${items.length > 5 ? ', …' : ''}`
  }
  const opts = { timeout: 15000, onClick: goToList }
  if (hasBatal) toastRef.warning(`🔔 ${message}`, opts)
  else toastRef.info(`🔔 ${message}`, opts)
  beep()
}

const stop = () => {
  if (timer) clearInterval(timer)
  timer = null
}

const poll = async () => {
  if (!localStorage.getItem('token') || !hasSoPermission()) {
    stop()
    pendingCount.value = 0
    pendingItems.value = []
    return
  }
  try {
    const res = await apiClient.get('/dokumen/sales-orders/pending')
    const items = res.data.data || []
    pendingCount.value = res.data.count || 0
    pendingItems.value = items

    const keys = new Set(items.map((i) => `${i.id}:${i.print_status}`))
    const known = readKnown()
    const fresh = known === null ? items : items.filter((i) => !known.has(`${i.id}:${i.print_status}`))
    writeKnown(keys)
    notify(fresh)
  } catch {}
}

export function useSoPrintNotifier() {
  const start = (router) => {
    routerRef = router
    if (!toastRef) toastRef = useToast()
    if (!hasSoPermission()) return
    if (!timer) {
      poll()
      timer = setInterval(poll, POLL_MS)
    }
  }

  return {
    pendingCount,
    pendingItems,
    canSeeSo: hasSoPermission,
    start,
    refresh: poll,
  }
}
