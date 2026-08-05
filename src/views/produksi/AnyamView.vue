<template>
  <DashboardLayout>
    <!-- HEADER -->
    <div class="page-header-anyam">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-anyam">
            <span class="anyam-icon">🧺</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-anyam">Produksi Anyam</h1>
            <p class="page-subtitle-anyam">
              Pindahkan produk dari Gudang Assembling, Sanding, atau Finishing ke Gudang Anyam sesuai PO.
            </p>
          </div>
        </div>
        <div class="header-badge-section">
          <div class="process-badge">
            <span class="process-icon">🪑</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">🧺</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">✨</span>
          </div>
          <div class="flow-label-anyam">Assembling / Sanding / Finishing → Anyam</div>
        </div>
      </div>
    </div>

    <!-- FORM CARD -->
    <div class="content-card-anyam">
      <div class="card-body-anyam">
        <form @submit.prevent="handleSubmit" @keydown.enter.prevent>

          <!-- SECTION 1: INFO UMUM -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge">
                <span class="section-icon">📅</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Informasi Umum</h3>
                <p class="section-subtitle">Tanggal, PO, dan catatan proses</p>
              </div>
            </div>

            <div class="form-grid-3col">
              <div class="form-group-modern">
                <label class="form-label-modern">Tanggal <span class="required-star">*</span></label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">📅</span>
                  <input v-model="form.date" type="date" class="form-input-modern" required />
                </div>
              </div>

              <div class="form-group-modern">
                <label class="form-label-modern">Production Order <span class="required-star">*</span></label>
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
                  <input v-model="form.notes" type="text" class="form-input-modern" placeholder="Catatan proses anyam..." />
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

          <!-- SECTION 2: ITEM -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge section-icon-badge--item">
                <span class="section-icon">📦</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Item yang Diproses</h3>
                <p class="section-subtitle">
                  Pilih produk dari <strong>Gudang Assembling, Sanding, atau Finishing</strong> — akan dipindah ke Gudang Anyam
                </p>
              </div>
            </div>

            <div v-if="loadingInventory" class="loading-hint">⏳ Memuat stok...</div>

            <div v-else-if="sourceInventories.length === 0" class="empty-hint">
              📭 Tidak ada stok tersedia di Gudang Assembling, Sanding, maupun Finishing
            </div>

            <template v-else>
              <div v-for="(row, index) in form.items" :key="row.local_id" class="item-row-card">
                <div class="item-row-header">
                  <span class="item-row-number">Item #{{ index + 1 }}</span>
                  <button
                    v-if="form.items.length > 1"
                    type="button"
                    class="btn-remove-row"
                    @click="removeItem(index)"
                  >✕</button>
                </div>

                <div class="form-grid-2col">
                  <div class="form-group-modern">
                    <label class="form-label-modern">Item <span class="required-star">*</span></label>
                    <vue-select
                      v-model="row.key"
                      :options="sourceInventoriesForSelect"
                      label="label"
                      placeholder="🔍 Pilih item..."
                      class="vue-select-item"
                      @option:selected="(opt) => onItemSelected(index, opt)"
                    >
                      <template #option="o">
                        <div class="item-option">
                          <span class="item-option-badge">{{ o.warehouse_code }}</span>
                          <span class="item-option-code">{{ o.item_code }}</span>
                          <span class="item-option-name">{{ o.item_name }}</span>
                          <span class="item-option-stock">Stok: {{ o.qty_pcs }} pcs</span>
                        </div>
                      </template>
                    </vue-select>
                    <div v-if="row.warehouse_name" class="source-info-anyam">
                      📦 Sumber: <strong>{{ row.warehouse_name }}</strong>
                    </div>
                  </div>

                  <div class="form-group-modern">
                    <label class="form-label-modern">
                      Qty (pcs) <span class="required-star">*</span>
                      <span v-if="row.max_qty" class="stock-hint">Tersedia: {{ row.max_qty }} pcs</span>
                    </label>
                    <div class="input-wrapper-icon">
                      <span class="input-icon">🔢</span>
                      <input
                        v-model.number="row.qty"
                        type="number" min="1" :max="row.max_qty"
                        class="form-input-modern" placeholder="0"
                      />
                    </div>
                    <p v-if="row.qty > row.max_qty && row.max_qty > 0" class="qty-warning">
                      ⚠️ Melebihi stok tersedia ({{ row.max_qty }} pcs)
                    </p>
                  </div>
                </div>
              </div>

              <button type="button" class="btn-add-item" @click="addItem">
                ➕ Tambah Item Lainnya
              </button>
            </template>
          </div>

          <!-- FORM ACTIONS -->
          <div class="form-actions-modern">
            <button type="button" class="btn-action btn-cancel-modern" @click="router.back()">
              <span>↩️</span> Batal
            </button>
            <button
              type="submit"
              class="btn-action btn-submit-modern"
              :disabled="isSubmitting || !canSubmit"
            >
              <span>💾</span>
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Anyam' }}
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
const isSubmitting     = ref(false)
const loadingInventory = ref(false)

const productionOrders  = ref([])
const sourceInventories = ref([])
const poInfo = ref({ buyer_name: null, so_number: null })

const form = reactive({
  date:      new Date().toISOString().slice(0, 10),
  ref_po_id: null,
  notes:     '',
  items: [{ local_id: Date.now(), key: null, item_id: null, warehouse_id: null, warehouse_name: '', qty: null, max_qty: 0 }],
})

const sourceInventoriesForSelect = computed(() =>
  sourceInventories.value.map((inv) => ({
    key:            `${inv.item_id}-${inv.warehouse_id}`,
    item_id:        inv.item_id,
    item_code:      inv.item_code,
    item_name:      inv.item_name,
    qty_pcs:        inv.qty_pcs,
    warehouse_id:   inv.warehouse_id,
    warehouse_code: inv.warehouse_code,
    warehouse_name: inv.warehouse_name,
    label:          `${inv.item_code} - ${inv.item_name}`,
  }))
)

const canSubmit = computed(() => {
  if (!form.ref_po_id) return false
  return form.items.some((i) => i.item_id && i.warehouse_id && i.qty > 0)
})

const fetchInitialData = async () => {
  try {
    const [poRes, invRes] = await Promise.all([
      apiClient.get('/produksi/anyam/available-pos'),
      apiClient.get('/produksi/anyam/source-inventories'),
    ])
    productionOrders.value  = poRes.data.data  || []
    sourceInventories.value = invRes.data.data || []
  } catch (error) {
    showError('Gagal', 'Gagal mengambil data awal')
  }
}

const handlePoChange = (opt) => {
  poInfo.value = { buyer_name: opt?.buyer_name ?? null, so_number: opt?.so_number ?? null }
}

const handlePoDeselect = () => {
  poInfo.value = { buyer_name: null, so_number: null }
}

const onItemSelected = (index, opt) => {
  form.items[index].item_id        = opt?.item_id       ?? null
  form.items[index].warehouse_id   = opt?.warehouse_id  ?? null
  form.items[index].warehouse_name = opt?.warehouse_name ?? ''
  form.items[index].max_qty        = opt?.qty_pcs ?? 0
}

const addItem = () => {
  form.items.push({ local_id: Date.now() + Math.random(), key: null, item_id: null, warehouse_id: null, warehouse_name: '', qty: null, max_qty: 0 })
}

const removeItem = (index) => {
  form.items.splice(index, 1)
}

const handleSubmit = async () => {
  if (!form.ref_po_id) { showError('Validasi', 'Production Order wajib dipilih'); return }

  const validItems = form.items.filter((i) => i.item_id && i.warehouse_id && i.qty > 0)
  if (validItems.length === 0) { showError('Validasi', 'Minimal satu item harus diisi'); return }

  for (let i = 0; i < validItems.length; i++) {
    if (validItems[i].qty > validItems[i].max_qty) {
      showError('Validasi', `Item #${i + 1}: Qty melebihi stok tersedia (${validItems[i].max_qty} pcs)`)
      return
    }
  }

  isSubmitting.value = true
  try {
    const payload = {
      date:      form.date,
      ref_po_id: Number(form.ref_po_id),
      notes:     form.notes || null,
      items:     validItems.map((i) => ({
        item_id:      Number(i.item_id),
        warehouse_id: Number(i.warehouse_id),
        qty:          Number(i.qty),
      })),
    }

    await apiClient.post('/produksi/anyam', payload)
    showSuccess('Sukses', 'Proses Anyam berhasil dicatat')
    router.push({ name: 'ProduksiFinishing' })
  } catch (error) {
    const message = error.response?.data?.message || 'Gagal menyimpan anyam'
    showError('Gagal', message)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchInitialData)
</script>

<style scoped>
.page-header-anyam {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  padding: 2rem 2.5rem; border-radius: 20px; margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(217,119,6,0.3);
}
.header-content-wrapper { display:flex; justify-content:space-between; align-items:center; gap:2rem; }
.header-left-section { display:flex; align-items:center; gap:1.5rem; flex:1; }
.icon-badge-anyam { width:72px; height:72px; border-radius:18px; background:rgba(255,255,255,0.25); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; }
.anyam-icon { font-size:2.5rem; }
.page-title-anyam { font-size:2rem; font-weight:800; color:white; margin:0 0 0.5rem; }
.page-subtitle-anyam { color:rgba(255,255,255,0.95); font-size:1rem; margin:0; }
.process-badge { display:flex; align-items:center; gap:0.75rem; padding:0.75rem 1.25rem; background:rgba(255,255,255,0.95); border-radius:16px; }
.process-icon { font-size:1.5rem; }
.process-arrow { font-size:1.25rem; color:#b45309; font-weight:700; }
.flow-label-anyam { color:rgba(255,255,255,0.9); font-size:0.85rem; font-weight:600; margin-top:6px; text-align:center; }

.content-card-anyam { background:white; border-radius:20px; box-shadow:0 4px 16px rgba(0,0,0,0.08); border:1px solid #f0f2f5; overflow:hidden; }
.card-body-anyam { padding:2.5rem; }

.form-section-modern { margin-bottom:2.5rem; padding-bottom:2.5rem; border-bottom:3px solid #e5e7eb; }
.form-section-modern:last-child { margin-bottom:0; padding-bottom:0; border-bottom:none; }

.section-header { display:flex; align-items:center; gap:1.25rem; margin-bottom:1.75rem; padding:1.25rem 1.5rem; background:linear-gradient(135deg,#fffbeb,#fef3c7); border-radius:14px; border-left:5px solid #d97706; }
.section-icon-badge { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,#d97706,#b45309); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.section-icon-badge--item { background:linear-gradient(135deg,#2563eb,#1d4ed8) !important; }
.section-icon { font-size:1.25rem; }
.section-title { font-size:1.1rem; font-weight:700; color:#111827; margin:0 0 0.2rem; }
.section-subtitle { font-size:0.875rem; color:#6b7280; margin:0; }

.form-grid-2col { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; margin-bottom:1.25rem; }
.form-grid-3col { display:grid; grid-template-columns:1fr 1fr 1fr; gap:1.25rem; margin-bottom:1.25rem; }
.form-group-modern { display:flex; flex-direction:column; }
.form-label-modern { font-size:0.875rem; font-weight:600; color:#374151; margin-bottom:0.5rem; }
.required-star { color:#ef4444; }
.stock-hint { margin-left:8px; font-size:0.78rem; color:#d97706; font-weight:600; }
.input-wrapper-icon { position:relative; display:flex; align-items:center; }
.input-icon { position:absolute; left:1.125rem; font-size:1rem; z-index:1; pointer-events:none; }
.form-input-modern { width:100%; padding:0.9rem 1.25rem 0.9rem 3.25rem; border:2.5px solid #e5e7eb; border-radius:12px; font-size:1rem; font-weight:500; transition:all 0.3s; background:white; }
.form-input-modern:focus { outline:none; border-color:#d97706; box-shadow:0 0 0 4px rgba(217,119,6,0.15); }

.po-selected-info { display:flex; align-items:center; gap:10px; padding:12px 16px; background:#fffbeb; border:1px solid #fde68a; border-radius:10px; margin-top:4px; }
.po-info-icon { font-size:1.25rem; }
.po-info-buyer { font-weight:700; font-size:0.95rem; color:#111827; }
.po-info-so { font-size:0.82rem; color:#6b7280; }

.item-row-card { background:#fffbeb; border:1px solid #fde68a; border-radius:12px; padding:1.25rem; margin-bottom:1rem; }
.item-row-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
.item-row-number { font-size:0.82rem; font-weight:700; color:#92400e; text-transform:uppercase; }
.btn-remove-row { background:#fee2e2; color:#ef4444; border:none; border-radius:6px; padding:3px 10px; font-size:0.82rem; cursor:pointer; font-weight:700; }

.qty-warning { margin-top:4px; font-size:0.82rem; color:#ef4444; }
.empty-hint { padding:2rem; text-align:center; color:#9ca3af; font-size:0.95rem; background:#f9fafb; border-radius:12px; border:1px dashed #d1d5db; }
.loading-hint { padding:1.5rem; text-align:center; color:#6b7280; }

.btn-add-item { display:flex; align-items:center; gap:0.5rem; padding:0.75rem 1.25rem; background:#fef3c7; border:2px dashed #d97706; border-radius:10px; color:#92400e; font-weight:600; font-size:0.9rem; cursor:pointer; transition:all 0.2s; margin-top:0.5rem; }
.btn-add-item:hover { background:#fde68a; }

.form-actions-modern { display:flex; justify-content:flex-end; gap:1rem; padding-top:1.5rem; border-top:2px solid #e5e7eb; }
.btn-action { display:flex; align-items:center; gap:0.5rem; padding:0.875rem 1.75rem; border-radius:12px; font-size:1rem; font-weight:600; cursor:pointer; transition:all 0.2s; border:none; }
.btn-cancel-modern { background:#f3f4f6; color:#374151; }
.btn-cancel-modern:hover { background:#e5e7eb; }
.btn-submit-modern { background:linear-gradient(135deg,#d97706,#b45309); color:white; box-shadow:0 4px 12px rgba(217,119,6,0.35); }
.btn-submit-modern:hover:not(:disabled) { transform:translateY(-1px); }
.btn-submit-modern:disabled { opacity:0.6; cursor:not-allowed; }

.vue-select-po :deep(.vs__dropdown-toggle),
.vue-select-item :deep(.vs__dropdown-toggle) { padding:0.875rem 1.25rem; border:2.5px solid #e5e7eb; border-radius:12px; min-height:54px; }
.vue-select-po.vs--open :deep(.vs__dropdown-toggle),
.vue-select-item.vs--open :deep(.vs__dropdown-toggle) { border-color:#d97706; box-shadow:0 0 0 4px rgba(217,119,6,0.15); }

.item-option { display:flex; flex-direction:column; gap:2px; padding:8px 12px; }
.item-option-badge { display:inline-block; padding:1px 6px; background:#d97706; color:white; border-radius:4px; font-size:0.72rem; font-weight:700; width:fit-content; }
.item-option-code { font-size:0.82rem; font-weight:700; color:#d97706; }
.item-option-name { font-size:0.9rem; color:#111827; font-weight:500; }
.item-option-stock { font-size:0.78rem; color:#6b7280; }

.source-info-anyam { margin-top:6px; font-size:0.82rem; color:#92400e; background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:6px 10px; }

@media (max-width:768px) {
  .form-grid-2col, .form-grid-3col { grid-template-columns:1fr; }
  .card-body-anyam { padding:1.25rem; }
}
</style>