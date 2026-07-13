<template>
  <DashboardLayout>
    <div class="page-header-qc">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-qc">
            <span class="qc-icon">🔍</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-qc">QC Final</h1>
            <p class="page-subtitle-qc">
              Pemeriksaan kualitas akhir — item lolos masuk Gudang Packing, reject masuk Gudang Reject.
            </p>
          </div>
        </div>
        <div class="header-badge-section">
          <div class="process-badge">
            <span class="process-icon">📦</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">🔍</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">✅</span>
          </div>
          <div class="flow-label-qc">Finishing → QC → Packing</div>
        </div>
      </div>
    </div>

    <div class="content-card-qc">
      <div class="card-body-qc">
        <form @submit.prevent="handleSubmit" @keydown.enter.prevent>

          <!-- SECTION 1: INFO UMUM -->
          <div class="form-section-modern">
            <div class="section-header section-header-qc">
              <div class="section-icon-badge">
                <span class="section-icon">📅</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Informasi Umum</h3>
                <p class="section-subtitle">Tanggal, PO, gudang sumber, dan catatan</p>
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

              <div class="form-group-modern">
                <label class="form-label-modern">Catatan</label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">📝</span>
                  <input
                    v-model="form.notes"
                    type="text"
                    class="form-input-modern"
                    placeholder="Catatan QC..."
                  />
                </div>
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
          </div>

          <!-- SECTION 2: ITEM LOLOS QC -->
          <div class="form-section-modern">
            <div class="section-header section-header-qc">
              <div class="section-icon-badge section-badge-passed">
                <span class="section-icon">✅</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Item Lolos QC</h3>
                <p class="section-subtitle">
                  Item yang lolos → masuk Gudang Packing
                  <span v-if="loadingItems" class="loading-inline">⏳ memuat...</span>
                </p>
              </div>
            </div>

            <div class="form-group-modern">
              <label class="form-label-modern">
                Gudang Sumber <span class="required-star">*</span>
              </label>
              <div class="warehouse-toggle">
                <button
                  v-for="wh in sourceWarehouseOptions"
                  :key="wh.id"
                  type="button"
                  class="toggle-btn"
                  :class="{ active: form.source_warehouse_id === wh.id }"
                  @click="selectSourceWarehouse(wh)"
                >{{ wh.name }}</button>
              </div>
            </div>

            <div v-if="!form.source_warehouse_id" class="empty-hint">
              ⬆️ Pilih gudang sumber dulu
            </div>

            <div v-else-if="sourceItems.length === 0 && !loadingItems" class="empty-hint">
              📭 Tidak ada stok di {{ selectedWarehouseName }}
            </div>

            <template v-else>
              <div
                v-for="(row, index) in form.passed"
                :key="row.local_id"
                class="item-row-card item-row-card--passed"
              >
                <div class="item-row-header">
                  <span class="item-row-number">✅ Lolos #{{ index + 1 }}</span>
                  <button
                    v-if="form.passed.length > 1"
                    type="button"
                    class="btn-remove-row"
                    @click="removePassed(index)"
                  >✕</button>
                </div>
                <div class="form-grid-2col">
                  <div class="form-group-modern">
                    <label class="form-label-modern">
                      Item <span class="required-star">*</span>
                    </label>
                    <!-- Read-only kalau dari PO -->
                    <div v-if="row.item_name" class="item-readonly-box">
                      <span class="item-readonly-code">{{ row.item_code }}</span>
                      <span class="item-readonly-name">{{ row.item_name }}</span>
                      <span class="item-readonly-badge">🎯 Dari PO</span>
                    </div>
                    <!-- Manual kalau tidak ada PO -->
                    <vue-select
                      v-else
                      v-model="row.item_id"
                      :options="sourceItemsForSelect"
                      :reduce="(o) => o.item_id"
                      label="label"
                      placeholder="🔍 Pilih item..."
                      class="vue-select-item"
                      @option:selected="(opt) => onPassedItemSelected(index, opt)"
                    >
                      <template #option="o">
                        <div class="item-option">
                          <span class="item-option-code">{{ o.item_code }}</span>
                          <span class="item-option-name">{{ o.item_name }}</span>
                          <span class="item-option-stock">Stok: {{ o.qty_available }} pcs</span>
                        </div>
                      </template>
                    </vue-select>
                  </div>
                  <div class="form-group-modern">
                    <label class="form-label-modern">
                      Qty Lolos (pcs) <span class="required-star">*</span>
                      <span v-if="row.max_qty > 0" class="stock-hint">
                        Tersedia: {{ row.max_qty }} pcs
                      </span>
                    </label>
                    <div class="input-wrapper-icon">
                      <span class="input-icon">🔢</span>
                      <input
                        v-model.number="row.qty"
                        type="number"
                        min="1"
                        :max="row.max_qty"
                        class="form-input-modern"
                        placeholder="0"
                      />
                    </div>
                    <p v-if="row.qty > row.max_qty && row.max_qty > 0" class="qty-warning">
                      ⚠️ Melebihi stok tersedia
                    </p>
                  </div>
                </div>
              </div>

              <button type="button" class="btn-add-row btn-add-passed" @click="addPassed">
                ➕ Tambah Item Lolos
              </button>
            </template>
          </div>

          <!-- SECTION 3: ITEM REJECT -->
          <div class="form-section-modern">
            <div class="section-header section-header-qc">
              <div class="section-icon-badge section-badge-reject">
                <span class="section-icon">❌</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">
                  Item Reject QC
                  <span class="optional-tag">Opsional</span>
                </h3>
                <p class="section-subtitle">Item tidak lolos QC → masuk Gudang Reject</p>
              </div>
            </div>

            <div v-if="!form.source_warehouse_id" class="empty-hint">
              ⬆️ Pilih gudang sumber dulu (di section Item Lolos QC)
            </div>

            <div v-else-if="form.rejects.length === 0" class="empty-reject">
              Tidak ada reject —
              <button type="button" class="btn-link" @click="addReject">tambah reject</button>
            </div>

            <div
              v-for="(row, index) in form.rejects"
              :key="row.local_id"
              class="item-row-card item-row-card--reject"
            >
              <div class="item-row-header">
                <span class="item-row-number">❌ Reject #{{ index + 1 }}</span>
                <button type="button" class="btn-remove-row" @click="removeReject(index)">✕</button>
              </div>
              <div class="form-grid-3col">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    Item Reject <span class="required-star">*</span>
                  </label>
                  <vue-select
                    v-model="row.item_id"
                    :options="sourceItemsForSelect"
                    :reduce="(o) => o.item_id"
                    label="label"
                    placeholder="🔍 Pilih item..."
                    class="vue-select-item"
                    @option:selected="(opt) => onRejectItemSelected(index, opt)"
                  >
                    <template #option="o">
                      <div class="item-option">
                        <span class="item-option-code">{{ o.item_code }}</span>
                        <span class="item-option-name">{{ o.item_name }}</span>
                        <span class="item-option-stock">Stok: {{ o.qty_available }} pcs</span>
                      </div>
                    </template>
                  </vue-select>
                </div>
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    Qty Reject <span class="required-star">*</span>
                    <span v-if="row.max_qty > 0" class="stock-hint">
                      Tersedia: {{ row.max_qty }} pcs
                    </span>
                  </label>
                  <div class="input-wrapper-icon">
                    <span class="input-icon">🔢</span>
                    <input
                      v-model.number="row.qty"
                      type="number"
                      min="1"
                      :max="row.max_qty"
                      class="form-input-modern"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div class="form-group-modern">
                  <label class="form-label-modern">Alasan Reject <span class="required-star">*</span></label>
                  <div class="input-wrapper-icon">
                    <span class="input-icon">📝</span>
                    <input
                      v-model="row.keterangan"
                      type="text"
                      class="form-input-modern"
                      placeholder="Contoh: cacat, retak, salah ukuran..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              v-if="form.rejects.length > 0"
              type="button"
              class="btn-add-row btn-add-reject"
              @click="addReject"
            >
              ➕ Tambah Reject Lainnya
            </button>
          </div>

          <!-- SUMMARY -->
          <div v-if="form.source_warehouse_id" class="qc-summary">
            <div class="summary-item summary-passed">
              <span class="summary-icon">✅</span>
              <div>
                <div class="summary-label">Total Lolos</div>
                <div class="summary-value">
                  {{ form.passed.reduce((s, i) => s + (Number(i.qty) || 0), 0) }} pcs
                </div>
              </div>
            </div>
            <div class="summary-divider">vs</div>
            <div class="summary-item summary-reject">
              <span class="summary-icon">❌</span>
              <div>
                <div class="summary-label">Total Reject</div>
                <div class="summary-value">
                  {{ form.rejects.reduce((s, i) => s + (Number(i.qty) || 0), 0) }} pcs
                </div>
              </div>
            </div>
          </div>

          <!-- FORM ACTIONS -->
          <div class="form-actions-modern">
            <button type="button" class="btn-action btn-cancel-modern" @click="router.back()">
              <span class="btn-icon">↩️</span>
              <span class="btn-text">Batal</span>
            </button>
            <button type="submit" class="btn-action btn-submit-qc" :disabled="isSubmitting">
              <span class="btn-icon">💾</span>
              <span class="btn-text">{{ isSubmitting ? 'Menyimpan...' : 'Simpan QC Final' }}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

const router = useRouter()
const { showSuccess, showError } = useNotification()
const isSubmitting          = ref(false)
const loadingItems          = ref(false)
const productionOrders      = ref([])
const sourceItems           = ref([])
const selectedWarehouseName = ref('')
const sourceWarehouseOptions = ref([])
const poInfo = ref({ buyer_name: null, so_number: null })

// Urutan tahap hilir sebelum QC — item bisa datang dari salah satu gudang ini
// tergantung rute produk (tidak semua produk lewat Sanding/Rustik/Finishing)
const SOURCE_WAREHOUSE_CODES = ['ASSEMBLING', 'RUSKOMP', 'SANDING', 'RUSTIK', 'FINISHING']

const form = reactive({
  date:                new Date().toISOString().slice(0, 10),
  ref_po_id:           null,
  source_warehouse_id: null,
  notes:               '',
  passed:  [{ local_id: Date.now(), item_id: null, qty: null, max_qty: 0 }],
  rejects: [],
})

const sourceItemsForSelect = computed(() =>
  sourceItems.value.map((i) => ({
    item_id:       i.item_id,
    item_code:     i.item_code,
    item_name:     i.item_name,
    qty_available: i.qty_available,
    label:         `${i.item_code} - ${i.item_name}`,
  }))
)

const fetchInitialData = async () => {
  try {
    const [poRes, whRes] = await Promise.all([
      apiClient.get('/qc-final/available-pos'),
      apiClient.get('/warehouses'),
    ])
    productionOrders.value = poRes.data.data || []

    // Gudang sumber dipilih manual oleh admin — item QC bisa datang dari salah satu
    // tahap hilir (Assembling/Ruskomp/Sanding/Rustik/Finishing) tergantung rute produk
    const whAll = whRes.data.data || whRes.data || []
    sourceWarehouseOptions.value = SOURCE_WAREHOUSE_CODES
      .map((code) => whAll.find((w) => w.code === code))
      .filter(Boolean)
  } catch (error) {
    console.error('Error in fetchInitialData:', error)
    showError('Gagal', 'Gagal mengambil data awal')
  }
}

const selectSourceWarehouse = async (wh) => {
  form.source_warehouse_id = wh.id
  selectedWarehouseName.value = wh.name
  await fetchSourceItems()
}

const fetchSourceItems = async () => {
  if (!form.source_warehouse_id) return
  loadingItems.value = true
  try {
    const res = await apiClient.get('/qc-final/source-items', {
      params: { warehouse_id: form.source_warehouse_id }
    })
    sourceItems.value = res.data.data || []
  } catch (error) {
    console.error('Error in fetchSourceItems:', error)
    showError('Gagal', 'Gagal mengambil stok gudang')
  } finally {
    loadingItems.value = false
  }
}

const poTargets = ref([])

const handlePoChange = async (opt) => {
  poInfo.value    = { buyer_name: null, so_number: null }
  poTargets.value = []
  if (!opt) return
  try {
    const res  = await apiClient.get(`/production-orders/${opt.id}`)
    const data = res.data.data || {}
    poInfo.value = {
      buyer_name: data.sales_order?.buyer_name || opt.buyer_name || null,
      so_number:  data.sales_order?.so_number  || opt.so_number  || null,
    }
    poTargets.value = data.targets || []

    // Auto-fill items (untuk lolos QC) dari detail PO
    if (data.targets?.length > 0) {
      form.passed = data.targets.map((t, i) => ({
        local_id:  Date.now() + i,
        item_id:   t.item_id,
        item_name: t.name,
        item_code: t.code,
        qty:       null,
        max_qty:   0,
      }))
    }
  } catch (error) {
    console.error('Error in handlePoChange:', error)
  }
}

const handlePoDeselect = () => {
  poInfo.value    = { buyer_name: null, so_number: null }
  poTargets.value = []
  form.passed     = [{ local_id: Date.now(), item_id: null, qty: null, max_qty: 0 }]
}

const onPassedItemSelected = (index, opt) => {
  form.passed[index].max_qty = opt?.qty_available ?? 0
}

const onRejectItemSelected = (index, opt) => {
  form.rejects[index].max_qty = opt?.qty_available ?? 0
}

const addPassed    = () => form.passed.push({ local_id: Date.now() + Math.random(), item_id: null, qty: null, max_qty: 0 })
const removePassed = (i) => form.passed.splice(i, 1)
const addReject    = () => form.rejects.push({ local_id: Date.now() + Math.random(), item_id: null, qty: null, max_qty: 0, keterangan: '' })
const removeReject = (i) => form.rejects.splice(i, 1)

const handleSubmit = async () => {
  if (!form.ref_po_id)           { showError('Validasi', 'PO wajib dipilih'); return }


  const validPassed = form.passed.filter((i) => i.item_id && i.qty > 0)
  if (validPassed.length === 0)  { showError('Validasi', 'Minimal satu item lolos QC wajib diisi'); return }

  for (let i = 0; i < validPassed.length; i++) {
    if (validPassed[i].qty > validPassed[i].max_qty && validPassed[i].max_qty > 0) {
      showError('Validasi', `Lolos #${i + 1}: Qty melebihi stok (${validPassed[i].max_qty} pcs)`)
      return
    }
  }

  const validRejects = form.rejects.filter((r) => r.item_id && r.qty > 0)
  for (let i = 0; i < validRejects.length; i++) {
    if (!validRejects[i].keterangan) {
      showError('Validasi', `Reject #${i + 1}: Alasan reject wajib diisi`)
      return
    }
  }

  isSubmitting.value = true
  try {
    await apiClient.post('/qc-final/store', {
      date:                form.date,
      ref_po_id:           Number(form.ref_po_id),
      source_warehouse_id: Number(form.source_warehouse_id),
      notes:               form.notes || null,
      passed:  validPassed.map((i)  => ({ item_id: Number(i.item_id), qty: Number(i.qty) })),
      rejects: validRejects.map((r) => ({
        item_id:    Number(r.item_id),
        qty:        Number(r.qty),
        keterangan: r.keterangan,
      })),
    })

    showSuccess('Sukses', 'QC Final berhasil dicatat — item lolos masuk Gudang Packing')

    // Reset form
    form.ref_po_id           = null
    form.source_warehouse_id = null
    form.notes               = ''
    form.passed              = [{ local_id: Date.now(), item_id: null, qty: null, max_qty: 0 }]
    form.rejects             = []
    sourceItems.value        = []
    selectedWarehouseName.value = ''
    poInfo.value             = { buyer_name: null, so_number: null }

  } catch (error) {
    const message = error.response?.data?.message ||
      (error.response?.data?.errors && JSON.stringify(error.response.data.errors)) ||
      'Gagal menyimpan QC Final'
    showError('Gagal', message)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchInitialData)
</script>

<style scoped>
.page-header-qc {
  background: linear-gradient(135deg, #065f46 0%, #047857 100%);
  padding: 2rem 2.5rem; border-radius: 20px; margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(6,95,70,0.3);
}
.header-content-wrapper { display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
.header-left-section { display: flex; align-items: center; gap: 1.5rem; flex: 1; }
.icon-badge-qc { width: 72px; height: 72px; border-radius: 18px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; }
.qc-icon { font-size: 2.5rem; }
.page-title-qc { font-size: 2rem; font-weight: 800; color: white; margin: 0 0 0.5rem; }
.page-subtitle-qc { color: rgba(255,255,255,0.95); font-size: 1rem; margin: 0; font-weight: 500; }
.process-badge { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; background: rgba(255,255,255,0.95); border-radius: 16px; }
.process-icon { font-size: 1.5rem; }
.process-arrow { font-size: 1.25rem; color: #047857; font-weight: 700; }
.flow-label-qc { color: rgba(255,255,255,0.9); font-size: 0.85rem; font-weight: 600; margin-top: 6px; text-align: center; }
.header-badge-section { display: flex; flex-direction: column; align-items: center; }

.content-card-qc { background: white; border-radius: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #f0f2f5; overflow: hidden; }
.card-body-qc { padding: 2.5rem; }

.form-section-modern { margin-bottom: 2.5rem; padding-bottom: 2.5rem; border-bottom: 3px solid #e5e7eb; }
.form-section-modern:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }

.section-header { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.75rem; padding: 1.25rem 1.5rem; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-radius: 14px; border-left: 5px solid #065f46; }
.section-icon-badge { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #065f46, #047857); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.section-badge-passed { background: linear-gradient(135deg, #16a34a, #15803d) !important; }
.section-badge-reject { background: linear-gradient(135deg, #dc2626, #b91c1c) !important; }
.section-icon { font-size: 1.25rem; }
.section-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0 0 0.2rem; display: flex; align-items: center; gap: 0.5rem; }
.section-subtitle { font-size: 0.875rem; color: #6b7280; margin: 0; }

.form-grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.form-grid-3col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.form-group-modern { display: flex; flex-direction: column; }
.form-label-modern { font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
.required-star { color: #ef4444; }
.input-wrapper-icon { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 1.125rem; font-size: 1rem; z-index: 1; pointer-events: none; }
.form-input-modern { width: 100%; padding: 0.9rem 1.25rem 0.9rem 3.25rem; border: 2.5px solid #e5e7eb; border-radius: 12px; font-size: 1rem; font-weight: 500; transition: all 0.3s ease; background: white; }
.form-input-modern:focus { outline: none; border-color: #065f46; box-shadow: 0 0 0 4px rgba(6,95,70,0.15); }

.warehouse-toggle { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.toggle-btn { padding: 0.6rem 1rem; border: 2px solid #e5e7eb; border-radius: 10px; background: white; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; color: #374151; }
.toggle-btn:hover { border-color: #065f46; color: #065f46; }
.toggle-btn.active { border-color: #065f46; background: #f0fdf4; color: #065f46; }

.po-selected-info { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; margin-top: 1rem; }
.po-info-icon { font-size: 1.25rem; }
.po-info-buyer { font-weight: 700; font-size: 0.95rem; color: #111827; }
.po-info-so { font-size: 0.82rem; color: #6b7280; }

.item-row-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; }
.item-row-card--passed { border-color: #bbf7d0; background: #f0fdf4; }
.item-row-card--reject { border-color: #fecaca; background: #fff5f5; }
.item-row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.item-row-number { font-size: 0.82rem; font-weight: 700; color: #6b7280; text-transform: uppercase; }
.btn-remove-row { background: #fee2e2; color: #ef4444; border: none; border-radius: 6px; padding: 3px 10px; font-size: 0.82rem; cursor: pointer; font-weight: 700; }

.stock-hint { margin-left: 8px; font-size: 0.78rem; color: #065f46; font-weight: 600; }
.qty-warning { margin-top: 4px; font-size: 0.82rem; color: #ef4444; }
.loading-inline { font-size: 0.82rem; color: #6b7280; margin-left: 8px; }
.empty-hint { padding: 2rem; text-align: center; color: #9ca3af; font-size: 0.95rem; background: #f9fafb; border-radius: 12px; border: 1px dashed #d1d5db; }
.empty-reject { padding: 1rem; text-align: center; color: #9ca3af; font-size: 0.9rem; }
.btn-link { background: none; border: none; color: #065f46; font-weight: 600; cursor: pointer; text-decoration: underline; font-size: 0.9rem; }

.btn-add-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; margin-top: 0.5rem; border: 2px dashed; }
.btn-add-passed { background: #f0fdf4; border-color: #16a34a; color: #15803d; }
.btn-add-passed:hover { background: #dcfce7; }
.btn-add-reject { background: #fff5f5; border-color: #dc2626; color: #b91c1c; }
.btn-add-reject:hover { background: #fecaca; }

.optional-tag { display: inline-block; padding: 1px 8px; border-radius: 999px; background: #e0f2fe; color: #0369a1; font-size: 0.72rem; font-weight: 600; vertical-align: middle; }

.qc-summary { display: flex; align-items: center; justify-content: center; gap: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #f9fafb, #f0fdf4); border-radius: 16px; border: 1px solid #d1fae5; margin-bottom: 1.5rem; }
.summary-item { display: flex; align-items: center; gap: 1rem; }
.summary-icon { font-size: 2rem; }
.summary-label { font-size: 0.82rem; color: #6b7280; font-weight: 600; }
.summary-value { font-size: 1.5rem; font-weight: 800; color: #111827; }
.summary-divider { font-size: 1rem; font-weight: 700; color: #9ca3af; }
.summary-passed .summary-value { color: #16a34a; }
.summary-reject .summary-value { color: #dc2626; }

.form-actions-modern { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb; }
.btn-action { display: flex; align-items: center; gap: 0.5rem; padding: 0.875rem 1.75rem; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
.btn-cancel-modern { background: #f3f4f6; color: #374151; }
.btn-cancel-modern:hover { background: #e5e7eb; }
.btn-submit-qc { background: linear-gradient(135deg, #065f46, #047857); color: white; box-shadow: 0 4px 12px rgba(6,95,70,0.35); }
.btn-submit-qc:hover:not(:disabled) { transform: translateY(-1px); }
.btn-submit-qc:disabled { opacity: 0.6; cursor: not-allowed; }

.item-option { display: flex; flex-direction: column; gap: 2px; padding: 8px 12px; }
.item-option-code { font-size: 0.82rem; font-weight: 700; color: #065f46; }
.item-option-name { font-size: 0.9rem; color: #111827; font-weight: 500; }
.item-option-stock { font-size: 0.78rem; color: #6b7280; }

.vue-select-po :deep(.vs__dropdown-toggle),
.vue-select-item :deep(.vs__dropdown-toggle) { padding: 0.875rem 1.25rem; border: 2.5px solid #e5e7eb; border-radius: 12px; min-height: 54px; }
.vue-select-po.vs--open :deep(.vs__dropdown-toggle),
.vue-select-item.vs--open :deep(.vs__dropdown-toggle) { border-color: #065f46; box-shadow: 0 0 0 4px rgba(6,95,70,0.15); }

@media (max-width: 768px) {
  .form-grid-2col, .form-grid-3col { grid-template-columns: 1fr; }
  .warehouse-toggle { flex-direction: column; }
  .qc-summary { flex-direction: column; gap: 1rem; }
  .card-body-qc { padding: 1.25rem; }
}

.item-readonly-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0.9rem 1.25rem;
  border: 2.5px solid #bbf7d0;
  border-radius: 12px;
  background: #f0fdf4;
  min-height: 54px;
  justify-content: center;
}
.item-readonly-code {
  font-size: 0.78rem;
  font-weight: 700;
  color: #16a34a;
}
.item-readonly-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}
.item-readonly-badge {
  font-size: 0.72rem;
  color: #15803d;
  font-weight: 600;
}
</style>