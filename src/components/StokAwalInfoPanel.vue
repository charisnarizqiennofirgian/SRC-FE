<template>
  <span ref="anchorEl" class="sai-anchor">
    <Teleport to="body">
      <div ref="panelEl" class="sai-panel" :style="style">
        <div v-if="loading" class="sai-muted">Memuat stok gudang...</div>
        <div v-else-if="error" class="sai-error">{{ error }}</div>
        <template v-else-if="info">
          <div class="sai-row sai-head">
            <span>Stok fisik</span>
            <strong>{{ fmt(info.physical_total) }}</strong>
          </div>
          <div v-for="w in info.physical" :key="w.warehouse_code" class="sai-row sai-sub">
            <span>{{ w.warehouse_name }}</span>
            <span>{{ fmt(w.qty) }}</span>
          </div>
          <div class="sai-row sai-head">
            <span>Dipakai SO lain</span>
            <strong>{{ fmt(info.claimed_total) }}</strong>
          </div>
          <div v-for="c in info.claims" :key="c.production_order_detail_id" class="sai-row sai-sub">
            <span>{{ c.so_number }}</span>
            <span>{{ fmt(c.qty) }}</span>
          </div>
          <div class="sai-row sai-free">
            <span>Maksimal bisa diisi</span>
            <strong>{{ fmt(Math.max(info.free, info.current)) }}</strong>
          </div>
          <div class="sai-note">Barang di gudang bisa saja milik SO lain yang belum dikirim. Isi hanya jika stok itu memang dipakai untuk SO ini.</div>
        </template>
      </div>
    </Teleport>
  </span>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import axios from '@/api/axios'

const props = defineProps({
  detailId: { type: [Number, String], required: true },
})

const anchorEl = ref(null)
const panelEl = ref(null)
const loading = ref(true)
const error = ref('')
const info = ref(null)
const style = reactive({ left: '0px', top: '0px' })

const fmt = (n) => Number(n || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })

const position = () => {
  const cell = anchorEl.value?.closest('td') || anchorEl.value
  const panel = panelEl.value
  if (!cell || !panel) return
  const r = cell.getBoundingClientRect()
  const pad = 8
  const pw = panel.offsetWidth
  const ph = panel.offsetHeight
  let left = r.left
  if (left + pw > window.innerWidth - pad) left = Math.max(pad, window.innerWidth - pw - pad)
  let top = r.bottom + 4
  if (top + ph > window.innerHeight - pad) top = Math.max(pad, r.top - ph - 4)
  style.left = Math.round(left) + 'px'
  style.top = Math.round(top) + 'px'
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await axios.get(`/production-monitoring/detail/${props.detailId}/stock-info`)
    info.value = response.data.data
  } catch (e) {
    error.value = e.response?.data?.message || 'Gagal memuat info stok.'
  } finally {
    loading.value = false
    await nextTick()
    position()
  }
}

onMounted(() => {
  position()
  window.addEventListener('scroll', position, true)
  window.addEventListener('resize', position)
  load()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', position, true)
  window.removeEventListener('resize', position)
})
</script>

<style scoped>
.sai-anchor {
  display: none;
}

.sai-panel {
  position: fixed;
  z-index: 2000;
  width: 240px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);
  padding: 8px 10px;
  font-size: 12px;
  color: #1e293b;
  text-align: left;
}

.sai-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 2px 0;
  font-variant-numeric: tabular-nums;
}

.sai-head {
  margin-top: 4px;
}

.sai-sub {
  padding-left: 10px;
  color: #475569;
}

.sai-free {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid #e2e8f0;
  color: #0f766e;
}

.sai-note {
  margin-top: 6px;
  font-size: 11px;
  color: #64748b;
  line-height: 1.35;
}

.sai-muted {
  color: #64748b;
}

.sai-error {
  color: #dc2626;
}
</style>
