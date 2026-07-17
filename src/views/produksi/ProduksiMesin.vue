<template>
  <DashboardLayout>
    <!-- HEADER -->
    <div class="page-header-mesin">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-mesin">
            <span class="mesin-icon">⚙️</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-mesin">Produksi Mesin</h1>
            <p class="page-subtitle-mesin">
              Satu transaksi bisa banyak baris, tiap baris pilih mesinnya sendiri (Bor, CNC, dll) — input komponen S4S, output ke Gudang Mesin, dan reject.
            </p>
          </div>
        </div>
        <div class="header-badge-section">
          <div class="process-badge">
            <span class="process-icon">📦</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">⚙️</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">🔩</span>
          </div>
          <div class="flow-label-mesin">S4S → Mesin → Komponen</div>
        </div>
      </div>
    </div>

    <div class="content-card-mesin">
      <div class="card-body-mesin">
        <form @submit.prevent="handleSubmit" @keydown.enter.prevent>

          <!-- SECTION 1: INFO UMUM -->
          <div class="form-section-modern">
            <div class="section-header section-header-mesin">
              <div class="section-icon-badge">
                <span class="section-icon">📅</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Informasi Umum</h3>
                <p class="section-subtitle">Tanggal, PO, mesin yang dipakai, dan catatan</p>
              </div>
            </div>

            <div class="form-grid-3col">
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Tanggal <span class="required-star">*</span>
                </label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">📅</span>
                  <input v-model="form.date" type="date" class="form-input-modern" required />
                </div>
              </div>

              <div class="form-group-modern">
                <label class="form-label-modern">Estimasi Selesai</label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">🏁</span>
                  <input
                    v-model="form.estimated_finish_date"
                    type="date"
                    class="form-input-modern"
                  />
                </div>
              </div>

              <div class="form-group-modern">
                <label class="form-label-modern">Catatan</label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">📝</span>
                  <input
                    v-model="form.notes"
                    type="text"
                    class="form-input-modern"
                    placeholder="Catatan proses mesin..."
                  />
                </div>
              </div>
            </div>

            <div class="form-group-modern" style="margin-bottom:1.25rem;">
              <label class="form-label-modern">
                Production Order <span class="required-star">*</span>
              </label>
              <vue-select
                v-model="form.ref_po_id"
                :options="productionOrders"
                :reduce="(po) => po.id"
                label="label"
                placeholder="🔍 Cari PO..."
                :clearable="true"
                class="vue-select-po"
                @option:selected="handlePoChange"
                @option:deselected="handlePoDeselect"
              />
            </div>

            <!-- PRODUK YANG DIKERJAKAN -->
            <div v-if="form.ref_po_id" class="form-group-modern" style="margin-bottom:1.25rem;">
              <label class="form-label-modern">
                Produk yang Dikerjakan <span class="required-star">*</span>
              </label>
              <vue-select
                v-model="form.production_order_detail_id"
                :options="poDetailItems"
                :reduce="(d) => d.id"
                label="label"
                placeholder="🔍 Pilih produk..."
                :clearable="true"
                class="vue-select-po"
              >
                <template #option="d">
                  <div class="detail-option">
                    <span class="detail-option-name">{{ d.item_name }}</span>
                    <span class="detail-option-code">{{ d.item_code }}</span>
                    <span :class="['detail-option-badge', d.mesin_done ? 'badge-done' : 'badge-pending']">
                      {{ d.mesin_done ? '✓ Sudah' : '○ Belum' }}
                    </span>
                  </div>
                </template>
                <template #selected-option="d">
                  <span>{{ d.item_name }}</span>
                  <span v-if="d.mesin_done" class="badge-done-inline">✓</span>
                </template>
              </vue-select>
              <p v-if="poDetailItems.length > 0" class="detail-hint">
                {{ poDetailItems.filter(d => d.mesin_done).length }} / {{ poDetailItems.length }} produk sudah proses Mesin
              </p>
            </div>

            <!-- INFO BOM -->
            <div v-if="form.production_order_detail_id" class="form-group-modern" style="margin-bottom:1.25rem;">
              <div v-if="bomComponents.length > 0 && !showAllInputItems" class="bom-info-bar bom-info-ok">
                <span>✓ Menampilkan {{ bomComponents.length }} komponen sesuai resep BOM produk ini</span>
                <button type="button" class="btn-link-small" @click="showAllInputItems = true">Tampilkan semua item</button>
              </div>
              <div v-else-if="bomComponents.length > 0 && showAllInputItems" class="bom-info-bar bom-info-all">
                <span>Menampilkan semua item komponen (di luar resep BOM)</span>
                <button type="button" class="btn-link-small" @click="showAllInputItems = false">Kembali ke resep BOM</button>
              </div>
              <div v-else class="bom-info-bar bom-info-empty">
                ℹ️ Produk ini belum punya resep BOM — semua komponen ditampilkan.
                <router-link :to="{ name: 'MasterBom' }" class="btn-link-small">Isi resep di Master BOM</router-link>
              </div>
            </div>

            <!-- QTY PRODUK JADI -->
            <div class="form-group-modern" v-if="form.production_order_detail_id" style="margin-bottom:1.25rem;">
              <label class="form-label-modern">
                Qty Produk Jadi
                <span class="field-hint-inline">(berapa unit produk jadi setara dari batch ini)</span>
              </label>
              <div class="input-wrapper-icon">
                <span class="input-icon">📦</span>
                <input
                  v-model.number="form.qty_produk_jadi"
                  type="number"
                  min="0"
                  step="any"
                  class="form-input-modern"
                  placeholder="Contoh: 20"
                />
              </div>
            </div>

            <!-- Info PO -->
            <div v-if="poInfo.buyer_name" class="po-selected-info">
              <span class="po-info-icon">👤</span>
              <div>
                <div class="po-info-buyer">{{ poInfo.buyer_name }}</div>
                <div class="po-info-so">{{ poInfo.so_number }}</div>
              </div>
            </div>

            <!-- Target PO -->
            <div v-if="poTargets.length" class="po-hint-box">
              <div class="po-hint-header">
                <div class="po-hint-title-wrap">
                  <span class="po-hint-icon">📌</span>
                  <div>
                    <div class="po-hint-title">Target Produksi PO</div>
                    <div class="po-hint-sub">{{ poInfo.buyer_name }} • {{ poInfo.so_number }}</div>
                  </div>
                </div>
                <div class="po-hint-badge">{{ poTargets.length }} item</div>
              </div>
              <table class="po-hint-table">
                <thead>
                  <tr><th>Item</th><th>Qty Target</th></tr>
                </thead>
                <tbody>
                  <tr v-for="t in poTargets" :key="t.item_id">
                    <td>
                      <div style="font-weight:600;">{{ t.name }}</div>
                      <div style="font-size:0.78rem;color:#9ca3af;">{{ t.code }}</div>
                    </td>
                    <td>{{ Number(t.qty_planned).toLocaleString('id-ID') }} pcs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- SECTION 2: LINES (Komponen S4S → Komponen Mesin + Reject per baris) -->
          <div class="form-section-modern">
            <div class="section-header section-header-mesin">
              <div class="section-icon-badge section-badge-input">
                <span class="section-icon">🔗</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Baris Produksi</h3>
                <p class="section-subtitle">
                  Tiap baris: pilih mesin sendiri, 1 Komponen S4S → 1 Output Mesin + reject opsional
                  <span v-if="loadingS4s" class="loading-inline">⏳ memuat...</span>
                </p>
              </div>
            </div>

            <div v-if="s4sItems.length === 0 && !loadingS4s" class="empty-hint">
              📭 Tidak ada item Komponen dengan stok
            </div>

            <div
              v-for="(line, idx) in form.lines"
              :key="line.local_id"
              class="item-row-card"
            >
              <!-- Header baris -->
              <div class="item-row-header">
                <span class="item-row-number">Baris #{{ idx + 1 }}</span>
                <button v-if="form.lines.length > 1" type="button" class="btn-remove-row" @click="removeLine(idx)">✕</button>
              </div>

              <!-- MESIN per baris -->
              <div class="form-group-modern" style="margin-bottom:1rem;">
                <label class="form-label-modern">Mesin yang Dipakai <span class="required-star">*</span></label>
                <vue-select
                  v-model="line.machine_id"
                  :options="machines"
                  :reduce="(m) => m.id"
                  label="name"
                  placeholder="🔍 Pilih mesin — Bor, CNC, dll..."
                  :clearable="true"
                  class="vue-select-po"
                >
                  <template #option="m">
                    <div class="machine-option">
                      <span class="machine-code">{{ m.code }}</span>
                      <span class="machine-name">{{ m.name }}</span>
                      <span class="machine-desc">{{ m.description }}</span>
                    </div>
                  </template>
                </vue-select>
              </div>

              <!-- INPUT dari S4S -->
              <div class="line-block line-block--input">
                <span class="line-label">📥 INPUT KOMPONEN (dari S4S)</span>
                <div class="form-grid-2col">
                  <div class="form-group-modern">
                    <label class="form-label-modern">Item Komponen <span class="required-star">*</span></label>
                    <vue-select
                      v-model="line.input_item_id"
                      :options="inputS4sOptions"
                      :reduce="(o) => o.item_id"
                      :filterBy="filterS4sItem"
                      label="label"
                      placeholder="🔍 Pilih komponen dari S4S (bisa cari nama produk)..."
                      class="vue-select-item"
                      @option:selected="(opt) => onS4sItemSelected(idx, opt)"
                    >
                      <template #option="o">
                        <div class="item-option">
                          <span class="item-option-code">{{ o.item_code }}</span>
                          <span class="item-option-name">{{ o.item_name }}</span>
                          <span v-if="o.nama_produk" class="item-option-produk">{{ o.nama_produk }}</span>
                          <span class="item-option-stock">
                            Stok S4S: {{ o.qty_available }} pcs
                            <span v-if="o.qty_available <= 0" class="item-option-warning">
                              (stok ada di gudang lain, total: {{ o.qty_total }} pcs)
                            </span>
                          </span>
                        </div>
                      </template>
                    </vue-select>
                    <p v-if="isInputOutsideBom(line)" class="bom-warning-text">
                      ⚠️ Item ini di luar resep BOM produk ini
                    </p>
                  </div>
                  <div class="form-group-modern">
                    <label class="form-label-modern">
                      Qty (pcs) <span class="required-star">*</span>
                      <span v-if="line.max_qty > 0" class="stock-hint">Tersedia: {{ line.max_qty }} pcs</span>
                    </label>
                    <div class="input-wrapper-icon">
                      <span class="input-icon">🔢</span>
                      <input v-model.number="line.input_qty" type="number" min="0.01" step="0.01" :max="line.max_qty" class="form-input-modern" placeholder="0" />
                    </div>
                    <p v-if="line.input_qty > line.max_qty && line.max_qty > 0" class="qty-warning">⚠️ Melebihi stok tersedia</p>
                  </div>
                </div>
                <div class="form-group-modern">
                  <label class="form-label-modern">Jenis Finishing <span class="required-star">*</span></label>
                  <div class="finishing-toggle">
                    <label class="finishing-option">
                      <input type="radio" v-model="line.finishing" value="natural" />
                      <span>🌳 Natural</span>
                    </label>
                    <label class="finishing-option">
                      <input type="radio" v-model="line.finishing" value="warna" />
                      <span>🎨 Warna</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- OUTPUT ke MESIN -->
              <div class="line-block line-block--output">
                <span class="line-label">📤 OUTPUT KOMPONEN → Gudang MESIN</span>
                <div class="form-grid-2col">
                  <div class="form-group-modern">
                    <label class="form-label-modern">Item Komponen Hasil</label>
                    <div class="output-item-display">
                      <span v-if="getS4sItemName(line.input_item_id)" class="output-item-name">
                        {{ getS4sItemName(line.input_item_id) }}
                      </span>
                      <span v-else class="output-item-placeholder">— pilih input terlebih dahulu —</span>
                    </div>
                  </div>
                  <div class="form-group-modern">
                    <label class="form-label-modern">Qty Output (pcs) <span class="required-star">*</span></label>
                    <div class="input-wrapper-icon">
                      <span class="input-icon">🔢</span>
                      <input v-model.number="line.output_qty" type="number" min="1" class="form-input-modern" placeholder="0" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- REJECT (toggle) -->
              <div class="line-reject-toggle">
                <button type="button" class="btn-toggle-reject" @click="line.show_reject = !line.show_reject">
                  {{ line.show_reject ? '▲ Sembunyikan Reject' : '⚠️ + Tambah Reject' }}
                </button>
              </div>

              <div v-if="line.show_reject" class="line-block line-block--reject">
                <span class="line-label">♻️ REJECT KOMPONEN → Gudang REJECT</span>
                <p class="line-hint">Item reject = komponen input yang rusak di mesin</p>
                <div class="form-grid-2col">
                  <div class="form-group-modern">
                    <label class="form-label-modern">Qty Reject</label>
                    <div class="input-wrapper-icon">
                      <span class="input-icon">🔢</span>
                      <input v-model.number="line.reject_qty" type="number" min="0.01" step="0.01" class="form-input-modern" placeholder="0" />
                    </div>
                  </div>
                  <div class="form-group-modern">
                    <label class="form-label-modern">Keterangan</label>
                    <div class="input-wrapper-icon">
                      <span class="input-icon">📝</span>
                      <input v-model="line.reject_notes" type="text" class="form-input-modern" placeholder="Contoh: patah ujung, salah ukuran" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button type="button" class="btn-add-row btn-add-input" @click="addLine">
              ➕ Tambah Baris
            </button>
          </div>

          <!-- FORM ACTIONS -->
          <div class="form-actions-modern">
            <button type="button" class="btn-action btn-cancel-modern" @click="router.back()">
              <span class="btn-icon">↩️</span>
              <span class="btn-text">Batal</span>
            </button>

            <button
              v-if="form.ref_po_id"
              type="button"
              class="btn-action btn-selesai-modern"
              :disabled="isMarkingDone"
              @click="tandaiSelesai"
            >
              <span class="btn-icon">✅</span>
              <span class="btn-text">{{ isMarkingDone ? 'Memproses...' : 'Selesai Proses Mesin' }}</span>
            </button>

            <button
              type="submit"
              class="btn-action btn-submit-modern"
              :disabled="isSubmitting"
            >
              <span class="btn-icon">💾</span>
              <span class="btn-text">{{ isSubmitting ? 'Menyimpan...' : 'Simpan Proses Mesin' }}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

const router = useRouter()
const { showSuccess, showError } = useNotification()
const isSubmitting   = ref(false)
const isMarkingDone  = ref(false)
const loadingS4s     = ref(false)

// === DATA ===
const productionOrders = ref([])
const machines         = ref([])
const s4sItems         = ref([])
const poInfo           = ref({ buyer_name: null, so_number: null })
const poTargets        = ref([])
const poDetailItems    = ref([])

// === BOM (resep) — filter dropdown Item Komponen sesuai produk yang dikerjakan ===
const bomComponents     = ref([]) // [{item_id, item_code, item_name, qty}]
const showAllInputItems = ref(false)

const newLine = () => ({
  local_id:        Date.now() + Math.random(),
  machine_id:      null,
  input_item_id:   null,
  input_qty:       null,
  finishing:       'natural',
  max_qty:         0,
  output_item_id:  null,
  output_qty:      null,
  reject_qty:      null,
  reject_notes:    '',
  show_reject:     false,
})

const form = reactive({
  date:                        new Date().toISOString().slice(0, 10),
  estimated_finish_date:       '',
  ref_po_id:                   null,
  production_order_detail_id:  null,
  qty_produk_jadi:             null,
  notes:                       '',
  lines: [newLine()],
})

// === COMPUTED ===
const s4sItemsForSelect = computed(() =>
  s4sItems.value.map((i) => ({
    item_id:       i.item_id,
    item_code:     i.item_code,
    item_name:     i.item_name,
    nama_produk:   i.nama_produk ?? null,
    qty_available: i.qty_available,
    qty_total:     i.qty_total ?? i.qty_available,
    label:         `${i.item_code} - ${i.item_name}`,
  }))
)

const getS4sItemName = (itemId) => {
  if (!itemId) return null
  const found = s4sItems.value.find((i) => i.item_id === itemId)
  return found ? `${found.item_code} - ${found.item_name}` : null
}

const filterS4sItem = (option, label, search) => {
  const s = search.toLowerCase()
  return (
    option.item_code?.toLowerCase().includes(s) ||
    option.item_name?.toLowerCase().includes(s) ||
    option.nama_produk?.toLowerCase().includes(s)
  )
}

const bomComponentIds = computed(() => new Set(bomComponents.value.map((c) => c.item_id)))

// Dropdown "Item Komponen" (Input) — sesuai resep BOM produk yang dikerjakan kalau ada,
// fallback ke semua item S4S kalau BOM belum diisi atau operator klik "Tampilkan semua item"
const inputS4sOptions = computed(() => {
  if (showAllInputItems.value || bomComponents.value.length === 0) return s4sItemsForSelect.value
  // Item yang sudah kepilih di baris manapun tetap dipertahankan di daftar opsi (walau di luar BOM) —
  // vue-select pakai :reduce, kalau opsinya hilang dari :options, label jadi gak bisa ditampilkan (cuma nongol id).
  const selectedIds = new Set(form.lines.map((l) => l.input_item_id).filter(Boolean))
  return s4sItemsForSelect.value.filter((o) => bomComponentIds.value.has(o.item_id) || selectedIds.has(o.item_id))
})

const isInputOutsideBom = (line) => {
  if (bomComponents.value.length === 0 || !line.input_item_id) return false
  return !bomComponentIds.value.has(line.input_item_id)
}

const fetchBomForDetail = async (detailId) => {
  bomComponents.value     = []
  showAllInputItems.value = false
  if (!detailId) return

  const detail = poDetailItems.value.find((d) => d.id === detailId)
  if (!detail) return

  try {
    const res = await apiClient.get(`/production/bom/${detail.item_id}`)
    bomComponents.value = res.data.data?.components || []
  } catch (error) {
    console.error('Gagal memuat BOM produk:', error)
    bomComponents.value = []
  }
}

watch(() => form.production_order_detail_id, (val) => {
  fetchBomForDetail(val)
})

// === FETCH DATA ===
const fetchInitialData = async () => {
  loadingS4s.value = true
  try {
    const [poRes, machineRes, s4sRes] = await Promise.all([
      apiClient.get('/operator-mesin/available-pos'),
      apiClient.get('/operator-mesin/machines'),
      apiClient.get('/operator-mesin/s4s-items'),
    ])
    productionOrders.value = poRes.data.data     || []
    machines.value         = machineRes.data.data || []
    s4sItems.value         = s4sRes.data.data     || []
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil data awal')
  } finally {
    loadingS4s.value = false
  }
}

const handlePoChange = async (opt) => {
  poInfo.value                      = { buyer_name: null, so_number: null }
  poTargets.value                   = []
  poDetailItems.value               = []
  form.production_order_detail_id   = null
  form.qty_produk_jadi              = null
  if (!opt) return
  try {
    const [poRes, detailRes] = await Promise.all([
      apiClient.get(`/production-orders/${opt.id}`),
      apiClient.get(`/operator-mesin/po-detail-items/${opt.id}`),
    ])
    const data = poRes.data.data || {}
    poInfo.value = {
      buyer_name: data.sales_order?.buyer_name || opt.buyer_name || null,
      so_number:  data.sales_order?.so_number  || opt.so_number  || null,
    }
    poTargets.value = data.targets || []

    const details = detailRes.data.data || []
    poDetailItems.value = details.map((d) => ({ ...d, label: d.item_name }))
  } catch (e) { console.error(e) }
}

const handlePoDeselect = () => {
  poInfo.value                    = { buyer_name: null, so_number: null }
  poTargets.value                 = []
  poDetailItems.value             = []
  form.production_order_detail_id = null
  form.qty_produk_jadi            = null
  bomComponents.value              = []
  showAllInputItems.value          = false
}

const onS4sItemSelected = (lineIdx, opt) => {
  form.lines[lineIdx].max_qty        = opt?.qty_available ?? 0
  form.lines[lineIdx].output_item_id = opt?.item_id ?? null
}

// Sync output_qty mengikuti input_qty per baris
watch(
  () => form.lines.map((l) => l.input_qty),
  (newVals) => {
    newVals.forEach((qty, idx) => {
      if (qty > 0) form.lines[idx].output_qty = qty
    })
  }
)

// === LINES ===
const addLine    = () => form.lines.push(newLine())
const removeLine = (i) => form.lines.splice(i, 1)

// === TANDAI SELESAI ===
const tandaiSelesai = async () => {
  if (!form.ref_po_id) return

  const pending = poDetailItems.value.filter((d) => !d.mesin_done)
  if (pending.length > 0) {
    const names = pending.map((d) => d.item_name).join(', ')
    showError('Belum Selesai', `Produk berikut belum selesai proses Mesin: ${names}`)
    return
  }

  if (!confirm('Semua produk sudah selesai proses Mesin. Lanjut ke Assembling?')) return

  isMarkingDone.value = true
  try {
    await apiClient.post(`/operator-mesin/selesai/${form.ref_po_id}`)
    showSuccess('Selesai', 'PO berhasil ditandai selesai proses Mesin, lanjut ke Assembling')
    router.push({ name: 'AssemblingView' })
  } catch (error) {
    const msg = error.response?.data?.message || 'Gagal menandai selesai'
    showError('Gagal', msg)
    // Refresh status
    if (form.ref_po_id) {
      try {
        const res = await apiClient.get(`/operator-mesin/po-detail-items/${form.ref_po_id}`)
        poDetailItems.value = (res.data.data || []).map((d) => ({ ...d, label: d.item_name }))
      } catch (_) {}
    }
  } finally {
    isMarkingDone.value = false
  }
}

// === SUBMIT ===
const handleSubmit = async () => {
  if (!form.ref_po_id)                   { showError('Validasi', 'Production Order wajib dipilih'); return }
  if (!form.production_order_detail_id)  { showError('Validasi', 'Produk yang dikerjakan wajib dipilih'); return }

  const validLines = form.lines.filter((l) => l.input_item_id && l.input_qty > 0 && l.output_item_id && l.output_qty > 0)
  if (validLines.length === 0) { showError('Validasi', 'Minimal satu baris Komponen → Output wajib diisi'); return }

  for (let i = 0; i < validLines.length; i++) {
    if (!validLines[i].machine_id) {
      showError('Validasi', `Baris #${i + 1}: Mesin wajib dipilih`)
      return
    }
    if (validLines[i].input_qty > validLines[i].max_qty && validLines[i].max_qty > 0) {
      showError('Validasi', `Baris #${i + 1}: Qty melebihi stok S4S tersedia (${validLines[i].max_qty} pcs)`)
      return
    }
  }

  isSubmitting.value = true
  try {
    const payload = {
      date:                       form.date,
      ref_po_id:                  Number(form.ref_po_id),
      production_order_detail_id: Number(form.production_order_detail_id),
      qty_produk_jadi:            form.qty_produk_jadi !== null && form.qty_produk_jadi !== '' ? Number(form.qty_produk_jadi) : null,
      notes:                      form.notes || null,
      lines: validLines.map((l) => ({
        machine_id:     Number(l.machine_id),
        input_item_id:  Number(l.input_item_id),
        input_qty:      Number(l.input_qty),
        finishing:      l.finishing || 'natural',
        output_item_id: Number(l.output_item_id),
        output_qty:     Number(l.output_qty),
        reject_qty:     l.reject_qty > 0 ? Number(l.reject_qty) : null,
        reject_notes:   l.reject_notes || null,
      })),
    }

    await apiClient.post('/operator-mesin/store', payload)
    showSuccess('Sukses', 'Proses Mesin berhasil dicatat, lanjut ke Assembling')

    router.push({ name: 'AssemblingView' })
  } catch (error) {
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors && JSON.stringify(error.response.data.errors)) ||
      'Gagal menyimpan proses mesin'
    showError('Gagal', message)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchInitialData)
</script>

<style scoped>
.finishing-toggle { display: flex; gap: 0.75rem; margin-top: 0.25rem; }
.finishing-option {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.6rem 1.1rem; border: 2px solid #d1d5db; border-radius: 10px;
  cursor: pointer; font-weight: 600; font-size: 0.9rem; color: #374151;
  transition: all 0.15s;
}
.finishing-option:has(input:checked) {
  border-color: #0891b2; background: #ecfeff; color: #0e7490;
}
.finishing-option input { accent-color: #0891b2; }
.page-header-mesin {
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
  padding: 2rem 2.5rem; border-radius: 20px; margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(8,145,178,0.3);
}
.header-content-wrapper { display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
.header-left-section { display: flex; align-items: center; gap: 1.5rem; flex: 1; }
.icon-badge-mesin { width: 72px; height: 72px; border-radius: 18px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; }
.mesin-icon { font-size: 2.5rem; }
.page-title-mesin { font-size: 2rem; font-weight: 800; color: white; margin: 0 0 0.5rem; }
.page-subtitle-mesin { color: rgba(255,255,255,0.95); font-size: 1rem; margin: 0; font-weight: 500; }
.process-badge { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; background: rgba(255,255,255,0.95); border-radius: 16px; }
.process-icon { font-size: 1.5rem; }
.process-arrow { font-size: 1.25rem; color: #0e7490; font-weight: 700; }
.flow-label-mesin { color: rgba(255,255,255,0.9); font-size: 0.85rem; font-weight: 600; margin-top: 6px; text-align: center; }

.content-card-mesin { background: white; border-radius: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #f0f2f5; overflow: hidden; }
.card-body-mesin { padding: 2.5rem; }

.form-section-modern { margin-bottom: 2.5rem; padding-bottom: 2.5rem; border-bottom: 3px solid #e5e7eb; }
.form-section-modern:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }

.section-header { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.75rem; padding: 1.25rem 1.5rem; background: linear-gradient(135deg, #f9fafb, #ecfeff); border-radius: 14px; border-left: 5px solid #0891b2; }
.section-icon-badge { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #0891b2, #0e7490); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.section-badge-input  { background: linear-gradient(135deg, #d97706, #b45309) !important; }
.section-badge-output { background: linear-gradient(135deg, #16a34a, #15803d) !important; }
.section-badge-reject { background: linear-gradient(135deg, #dc2626, #b91c1c) !important; }
.section-icon { font-size: 1.25rem; }
.section-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0 0 0.2rem; display: flex; align-items: center; gap: 0.5rem; }
.section-subtitle { font-size: 0.875rem; color: #6b7280; margin: 0; }

.form-grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.form-grid-3col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.form-group-modern { display: flex; flex-direction: column; }
.form-label-modern { font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
.field-hint-inline { font-size: 0.78rem; font-weight: 400; color: #9ca3af; margin-left: 4px; }
.required-star { color: #ef4444; }
.input-wrapper-icon { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 1.125rem; font-size: 1rem; z-index: 1; pointer-events: none; }
.form-input-modern { width: 100%; padding: 0.9rem 1.25rem 0.9rem 3.25rem; border: 2.5px solid #e5e7eb; border-radius: 12px; font-size: 1rem; font-weight: 500; transition: all 0.3s ease; background: white; }
.form-input-modern:focus { outline: none; border-color: #0891b2; box-shadow: 0 0 0 4px rgba(8,145,178,0.15); }

.po-selected-info { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #ecfeff; border: 1px solid #a5f3fc; border-radius: 10px; margin-bottom: 1rem; }
.po-info-icon { font-size: 1.25rem; }
.po-info-buyer { font-weight: 700; font-size: 0.95rem; color: #111827; }
.po-info-so { font-size: 0.82rem; color: #6b7280; }

.po-hint-box { border-radius: 16px; border: 1px solid #a5f3fc; background: linear-gradient(135deg, #ecfeff, #cffafe); padding: 1.25rem 1.5rem; }
.po-hint-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.po-hint-title-wrap { display: flex; align-items: center; gap: 0.75rem; }
.po-hint-icon { font-size: 1.25rem; }
.po-hint-title { font-weight: 700; font-size: 0.95rem; color: #0e7490; }
.po-hint-sub { font-size: 0.82rem; color: #0891b2; }
.po-hint-badge { background: #0891b2; color: white; border-radius: 999px; padding: 2px 12px; font-size: 0.8rem; font-weight: 700; }
.po-hint-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.po-hint-table th { padding: 6px 10px; text-align: left; color: #0e7490; font-size: 0.78rem; text-transform: uppercase; border-bottom: 1px solid #a5f3fc; }
.po-hint-table td { padding: 6px 10px; color: #374151; border-bottom: 1px solid #cffafe; }

.machine-option { display: flex; flex-direction: column; gap: 2px; padding: 8px 12px; }
.machine-code { font-size: 0.82rem; font-weight: 700; color: #0891b2; }
.machine-name { font-size: 0.9rem; color: #111827; font-weight: 600; }
.machine-desc { font-size: 0.78rem; color: #6b7280; }

.item-row-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; }
.item-row-card--output { border-color: #bbf7d0; background: #f0fdf4; }
.item-row-card--reject { border-color: #fecaca; background: #fff5f5; }
.item-row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.item-row-number { font-size: 0.82rem; font-weight: 700; color: #6b7280; text-transform: uppercase; }
.btn-remove-row { background: #fee2e2; color: #ef4444; border: none; border-radius: 6px; padding: 3px 10px; font-size: 0.82rem; cursor: pointer; font-weight: 700; }

.stock-hint { margin-left: 8px; font-size: 0.78rem; color: #0891b2; font-weight: 600; }
.qty-warning { margin-top: 4px; font-size: 0.82rem; color: #ef4444; }
.loading-inline { font-size: 0.82rem; color: #6b7280; margin-left: 8px; }

/* Line blocks */
.line-block { padding: 0.75rem 1rem; border-radius: 10px; margin-bottom: 0.75rem; }
.line-block--input  { background: #ecfdf5; border: 1px solid #a7f3d0; }
.line-block--output { background: #eff6ff; border: 1px solid #bfdbfe; }
.line-block--reject { background: #fff7ed; border: 1px solid #fed7aa; }
.line-label { display: inline-block; font-size: 0.75rem; font-weight: 800; color: #374151; margin-bottom: 0.5rem; letter-spacing: 0.05em; }
.line-hint  { font-size: 0.78rem; color: #92400e; margin: 0 0 0.6rem; }
.line-reject-toggle { margin-bottom: 0.5rem; }
.btn-toggle-reject { background: none; border: 1px dashed #d1d5db; color: #6b7280; border-radius: 8px; padding: 5px 14px; font-size: 0.8rem; cursor: pointer; transition: all 0.15s; }
.btn-toggle-reject:hover { border-color: #0891b2; color: #0891b2; }

.btn-add-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; margin-top: 0.5rem; border: 2px dashed; }
.btn-add-input  { background: #fef3c7; border-color: #f59e0b; color: #92400e; }
.btn-add-input:hover { background: #fde68a; }
.btn-add-output { background: #f0fdf4; border-color: #16a34a; color: #15803d; }
.btn-add-output:hover { background: #dcfce7; }
.btn-add-reject { background: #fff5f5; border-color: #dc2626; color: #b91c1c; }
.btn-add-reject:hover { background: #fecaca; }

.optional-tag { display: inline-block; padding: 1px 8px; border-radius: 999px; background: #e0f2fe; color: #0369a1; font-size: 0.72rem; font-weight: 600; vertical-align: middle; }
.empty-reject { padding: 1rem; text-align: center; color: #9ca3af; font-size: 0.9rem; }
.empty-hint { padding: 2rem; text-align: center; color: #9ca3af; font-size: 0.95rem; background: #f9fafb; border-radius: 12px; border: 1px dashed #d1d5db; }
.btn-link { background: none; border: none; color: #0891b2; font-weight: 600; cursor: pointer; text-decoration: underline; font-size: 0.9rem; }

.form-actions-modern { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb; }
.btn-action { display: flex; align-items: center; gap: 0.5rem; padding: 0.875rem 1.75rem; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
.btn-cancel-modern { background: #f3f4f6; color: #374151; }
.btn-cancel-modern:hover { background: #e5e7eb; }
.btn-selesai-modern { background: linear-gradient(135deg, #16a34a, #15803d); color: white; box-shadow: 0 4px 12px rgba(22,163,74,0.35); }
.btn-selesai-modern:hover:not(:disabled) { transform: translateY(-1px); }
.btn-selesai-modern:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-submit-modern { background: linear-gradient(135deg, #0891b2, #0e7490); color: white; box-shadow: 0 4px 12px rgba(8,145,178,0.35); }
.btn-submit-modern:hover:not(:disabled) { transform: translateY(-1px); }
.btn-submit-modern:disabled { opacity: 0.6; cursor: not-allowed; }

.vue-select-po :deep(.vs__dropdown-toggle),
.vue-select-item :deep(.vs__dropdown-toggle) { padding: 0.875rem 1.25rem; border: 2.5px solid #e5e7eb; border-radius: 12px; min-height: 54px; }
.vue-select-po.vs--open :deep(.vs__dropdown-toggle),
.vue-select-item.vs--open :deep(.vs__dropdown-toggle) { border-color: #0891b2; box-shadow: 0 0 0 4px rgba(8,145,178,0.15); }

.item-option { display: flex; flex-direction: column; gap: 2px; padding: 8px 12px; }
.item-option-code { font-size: 0.82rem; font-weight: 700; color: #0891b2; }
.item-option-name { font-size: 0.9rem; color: #111827; font-weight: 500; }
.item-option-produk { font-size: 0.78rem; color: #7c3aed; font-style: italic; }
.item-option-produk { font-size: 0.78rem; color: #2563eb; font-weight: 600; }
.item-option-stock { font-size: 0.78rem; color: #6b7280; }
.item-option-warning { color: #d97706; font-weight: 600; }

/* Detail item dropdown */
.detail-option { display: flex; align-items: center; gap: 0.5rem; padding: 6px 12px; flex-wrap: wrap; }
.detail-option-name { font-size: 0.9rem; font-weight: 600; color: #111827; flex: 1; }
.detail-option-code { font-size: 0.78rem; color: #6b7280; }
.detail-option-badge { font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; flex-shrink: 0; }
.badge-done { background: #dcfce7; color: #15803d; }
.badge-pending { background: #f3f4f6; color: #6b7280; }
.badge-done-inline { font-size: 0.75rem; font-weight: 700; color: #15803d; margin-left: 4px; }
.detail-hint { font-size: 0.78rem; color: #6b7280; margin: 4px 0 0; }

.bom-info-bar { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; padding: 0.6rem 1rem; border-radius: 10px; font-size: 0.82rem; font-weight: 600; }
.bom-info-ok { background: #ecfeff; border: 1px solid #a5f3fc; color: #0e7490; }
.bom-info-all { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; }
.bom-info-empty { background: #f9fafb; border: 1px dashed #d1d5db; color: #6b7280; }
.btn-link-small { background: none; border: none; padding: 0; color: inherit; text-decoration: underline; font-weight: 700; font-size: 0.82rem; cursor: pointer; }
.bom-warning-text { margin: 4px 0 0; font-size: 0.78rem; color: #b45309; font-weight: 600; }

.output-item-display { display: flex; align-items: center; min-height: 54px; padding: 0.9rem 1.25rem; border: 2.5px solid #bfdbfe; border-radius: 12px; background: #eff6ff; }
.output-item-name { font-size: 0.95rem; font-weight: 600; color: #1e40af; }
.output-item-placeholder { font-size: 0.875rem; color: #9ca3af; font-style: italic; }

@media (max-width: 768px) {
  .form-grid-2col, .form-grid-3col { grid-template-columns: 1fr; }
  .card-body-mesin { padding: 1.25rem; }
}
</style>