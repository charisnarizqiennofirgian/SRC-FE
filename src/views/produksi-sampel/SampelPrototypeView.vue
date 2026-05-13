<template>
  <DashboardLayout>
    <!-- HEADER -->
    <div class="page-header-prototype">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-prototype">
            <span>🔧</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-prototype">Produksi Prototype</h1>
            <p class="page-subtitle-prototype">
              Proses perakitan sampel — dari Gudang Moulding ke Gudang Prototype.
            </p>
          </div>
        </div>
        <div class="process-badge">
          <span class="process-icon">⚙️</span>
          <span class="process-arrow">→</span>
          <span class="process-icon">🔧</span>
          <span class="process-arrow">→</span>
          <span class="process-icon">✨</span>
        </div>
      </div>
    </div>

    <div class="content-card-prototype">
      <div class="card-body-prototype">
        <form @submit.prevent="handleSubmit" @keydown.enter.prevent>

          <!-- INFO UMUM -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-icon-badge">📅</div>
              <div>
                <h3 class="section-title">Informasi Umum</h3>
                <p class="section-subtitle">Tanggal, PO Sampel, dan catatan</p>
              </div>
            </div>

            <div class="form-grid-3col">
              <div class="form-group">
                <label class="form-label">Tanggal <span class="req">*</span></label>
                <input v-model="form.date" type="date" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">PO Sampel <span class="req">*</span></label>
                <vue-select
                  v-model="form.ref_po_id"
                  :options="productionOrders"
                  :reduce="(po) => po.id"
                  label="label"
                  placeholder="🔍 Cari PO Sampel..."
                  :clearable="true"
                  class="vue-select-po"
                  @option:selected="handlePoChange"
                  @option:deselected="handlePoDeselect"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Catatan</label>
                <input v-model="form.notes" type="text" class="form-input" placeholder="Catatan..." />
              </div>
            </div>

            <div v-if="poInfo.buyer_name" class="po-info-box">
              <span>👤</span>
              <div>
                <div class="po-buyer">{{ poInfo.buyer_name }}</div>
                <div class="po-so">{{ poInfo.so_number }}</div>
              </div>
            </div>
          </div>

          <!-- ITEM -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-icon-badge" style="background: #2563eb;">📦</div>
              <div>
                <h3 class="section-title">Item yang Diproses</h3>
                <p class="section-subtitle">Pilih produk dari <strong>Gudang Moulding/S4S</strong></p>
              </div>
            </div>

            <div v-if="loadingInventory" class="loading-hint">⏳ Memuat stok...</div>
            <div v-else-if="sourceInventories.length === 0" class="empty-hint">
              📭 Tidak ada stok di Gudang Moulding/S4S
            </div>

            <template v-else>
              <div v-for="(row, index) in form.items" :key="row.local_id" class="item-row">
                <div class="item-row-header">
                  <span class="item-row-no">Item #{{ index + 1 }}</span>
                  <button v-if="form.items.length > 1" type="button" class="btn-remove" @click="removeItem(index)">✕</button>
                </div>
                <div class="form-grid-2col">
                  <div class="form-group">
                    <label class="form-label">Item <span class="req">*</span></label>
                    <vue-select
                      v-model="row.item_id"
                      :options="sourceInventoriesForSelect"
                      :reduce="(o) => o.item_id"
                      label="label"
                      placeholder="🔍 Pilih item..."
                      class="vue-select-item"
                      @option:selected="(opt) => onItemSelected(index, opt)"
                    >
                      <template #option="o">
                        <div class="item-option">
                          <span class="item-code">{{ o.item_code }}</span>
                          <span class="item-name">{{ o.item_name }}</span>
                          <span class="item-stock">Stok: {{ o.qty_pcs }} pcs</span>
                        </div>
                      </template>
                    </vue-select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">
                      Qty (pcs) <span class="req">*</span>
                      <span v-if="row.max_qty" class="stock-hint">Tersedia: {{ row.max_qty }} pcs</span>
                    </label>
                    <input
                      v-model.number="row.qty"
                      type="number" min="1" :max="row.max_qty"
                      class="form-input" placeholder="0"
                    />
                    <p v-if="row.qty > row.max_qty && row.max_qty > 0" class="qty-warn">
                      ⚠️ Melebihi stok ({{ row.max_qty }} pcs)
                    </p>
                  </div>
                </div>
              </div>

              <button type="button" class="btn-add-item" @click="addItem">
                ➕ Tambah Item
              </button>
            </template>
          </div>

          <!-- ACTIONS -->
          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="router.back()">↩️ Batal</button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting || !canSubmit">
              💾 {{ isSubmitting ? 'Menyimpan...' : 'Simpan Prototype' }}
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
  items:     [{ local_id: Date.now(), item_id: null, qty: null, max_qty: 0 }],
})

const sourceInventoriesForSelect = computed(() =>
  sourceInventories.value.map((inv) => ({
    item_id:   inv.item_id,
    item_code: inv.item_code,
    item_name: inv.item_name,
    qty_pcs:   inv.qty_pcs,
    label:     `${inv.item_code} - ${inv.item_name}`,
  }))
)

const canSubmit = computed(() =>
  form.ref_po_id && form.items.some((i) => i.item_id && i.qty > 0)
)

const fetchInitialData = async () => {
  try {
    const [poRes, whRes] = await Promise.all([
      apiClient.get('/produksi/prototype/available-pos'),
      apiClient.get('/warehouses'),
    ])
    productionOrders.value = poRes.data.data || []

    // Cari gudang S4S (output moulding)
    const warehouses = whRes.data.data || whRes.data || []
    const wS4S = warehouses.find(w => w.code === 'S4S')
    if (wS4S) await fetchSourceInventories(wS4S.id)
  } catch {
    showError('Gagal', 'Gagal mengambil data awal')
  }
}

const fetchSourceInventories = async (warehouseId) => {
  loadingInventory.value = true
  try {
    const res = await apiClient.get('/produksi/prototype/source-inventories', {
      params: { warehouse_id: warehouseId }
    })
    sourceInventories.value = res.data.data || []
  } finally {
    loadingInventory.value = false
  }
}

const handlePoChange = (opt) => {
  poInfo.value = { buyer_name: opt?.buyer_name ?? null, so_number: opt?.so_number ?? null }
}

const handlePoDeselect = () => {
  poInfo.value = { buyer_name: null, so_number: null }
}

const onItemSelected = (index, opt) => {
  form.items[index].max_qty = opt?.qty_pcs ?? 0
}

const addItem = () => {
  form.items.push({ local_id: Date.now() + Math.random(), item_id: null, qty: null, max_qty: 0 })
}

const removeItem = (index) => {
  form.items.splice(index, 1)
}

const handleSubmit = async () => {
  if (!form.ref_po_id) { showError('Validasi', 'PO Sampel wajib dipilih'); return }
  const validItems = form.items.filter(i => i.item_id && i.qty > 0)
  if (validItems.length === 0) { showError('Validasi', 'Minimal satu item harus diisi'); return }
  for (let i = 0; i < validItems.length; i++) {
    if (validItems[i].qty > validItems[i].max_qty) {
      showError('Validasi', `Item #${i + 1}: Qty melebihi stok (${validItems[i].max_qty} pcs)`)
      return
    }
  }

  isSubmitting.value = true
  try {
    await apiClient.post('/produksi/prototype', {
      date:      form.date,
      ref_po_id: Number(form.ref_po_id),
      notes:     form.notes || null,
      items:     validItems.map(i => ({ item_id: Number(i.item_id), qty: Number(i.qty) })),
    })
    showSuccess('Sukses', 'Proses Prototype berhasil dicatat')
    router.push({ name: 'SampelSanding' })
  } catch (error) {
    showError('Gagal', error.response?.data?.message || 'Gagal menyimpan prototype')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchInitialData)
</script>

<style scoped>
.page-header-prototype {
  background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
  padding: 2rem 2.5rem; border-radius: 20px; margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(124,58,237,0.3);
}
.header-content-wrapper { display:flex; justify-content:space-between; align-items:center; gap:2rem; }
.header-left-section { display:flex; align-items:center; gap:1.5rem; }
.icon-badge-prototype { width:72px; height:72px; border-radius:18px; background:rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center; font-size:2.5rem; }
.page-title-prototype { font-size:2rem; font-weight:800; color:white; margin:0 0 0.5rem; }
.page-subtitle-prototype { color:rgba(255,255,255,0.9); font-size:1rem; margin:0; }
.process-badge { display:flex; align-items:center; gap:0.75rem; padding:0.75rem 1.25rem; background:rgba(255,255,255,0.95); border-radius:16px; }
.process-icon { font-size:1.5rem; }
.process-arrow { font-size:1.25rem; color:#5b21b6; font-weight:700; }

.content-card-prototype { background:white; border-radius:20px; box-shadow:0 4px 16px rgba(0,0,0,0.08); overflow:hidden; }
.card-body-prototype { padding:2.5rem; }

.form-section { margin-bottom:2.5rem; padding-bottom:2.5rem; border-bottom:3px solid #e5e7eb; }
.form-section:last-child { border-bottom:none; margin-bottom:0; padding-bottom:0; }

.section-header { display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem; padding:1rem 1.25rem; background:#f5f3ff; border-radius:12px; border-left:5px solid #7c3aed; }
.section-icon-badge { width:40px; height:40px; border-radius:10px; background:#7c3aed; display:flex; align-items:center; justify-content:center; font-size:1.1rem; color:white; flex-shrink:0; }
.section-title { font-size:1rem; font-weight:700; color:#111827; margin:0 0 2px; }
.section-subtitle { font-size:0.85rem; color:#6b7280; margin:0; }

.form-grid-2col { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; }
.form-grid-3col { display:grid; grid-template-columns:1fr 1fr 1fr; gap:1.25rem; }
.form-group { display:flex; flex-direction:column; gap:6px; }
.form-label { font-size:0.875rem; font-weight:600; color:#374151; }
.req { color:#ef4444; }
.stock-hint { margin-left:8px; font-size:0.75rem; color:#7c3aed; font-weight:600; }
.form-input { padding:0.875rem 1rem; border:2.5px solid #e5e7eb; border-radius:10px; font-size:0.95rem; font-family:inherit; transition:all 0.2s; }
.form-input:focus { outline:none; border-color:#7c3aed; box-shadow:0 0 0 3px rgba(124,58,237,0.15); }

.po-info-box { display:flex; align-items:center; gap:10px; padding:12px 16px; background:#f5f3ff; border:1px solid #ddd6fe; border-radius:10px; margin-top:8px; font-size:0.9rem; }
.po-buyer { font-weight:700; color:#111827; }
.po-so { font-size:0.8rem; color:#6b7280; }

.item-row { background:#fafafa; border:1px solid #e5e7eb; border-radius:12px; padding:1.25rem; margin-bottom:1rem; }
.item-row-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
.item-row-no { font-size:0.8rem; font-weight:700; color:#6b7280; text-transform:uppercase; }
.btn-remove { background:#fee2e2; color:#ef4444; border:none; border-radius:6px; padding:3px 10px; cursor:pointer; font-weight:700; font-size:0.8rem; }
.qty-warn { font-size:0.8rem; color:#ef4444; margin-top:4px; }
.empty-hint { padding:2rem; text-align:center; color:#9ca3af; background:#f9fafb; border-radius:12px; border:1px dashed #d1d5db; }
.loading-hint { padding:1.5rem; text-align:center; color:#6b7280; }
.btn-add-item { padding:0.75rem 1.25rem; background:#f5f3ff; border:2px dashed #7c3aed; border-radius:10px; color:#5b21b6; font-weight:600; cursor:pointer; margin-top:0.5rem; }
.btn-add-item:hover { background:#ede9fe; }

.form-actions { display:flex; justify-content:flex-end; gap:1rem; padding-top:1.5rem; border-top:2px solid #e5e7eb; }
.btn-cancel { padding:0.875rem 1.5rem; background:#f3f4f6; color:#374151; border:none; border-radius:10px; font-weight:600; cursor:pointer; }
.btn-submit { padding:0.875rem 1.75rem; background:linear-gradient(135deg,#7c3aed,#5b21b6); color:white; border:none; border-radius:10px; font-weight:700; cursor:pointer; }
.btn-submit:disabled { opacity:0.6; cursor:not-allowed; }

.vue-select-po :deep(.vs__dropdown-toggle),
.vue-select-item :deep(.vs__dropdown-toggle) { padding:0.75rem 1rem; border:2.5px solid #e5e7eb; border-radius:10px; min-height:50px; }
.vue-select-po.vs--open :deep(.vs__dropdown-toggle),
.vue-select-item.vs--open :deep(.vs__dropdown-toggle) { border-color:#7c3aed; }
.item-option { display:flex; flex-direction:column; gap:2px; padding:6px 10px; }
.item-code { font-size:0.78rem; font-weight:700; color:#7c3aed; }
.item-name { font-size:0.875rem; color:#111827; }
.item-stock { font-size:0.75rem; color:#6b7280; }

@media (max-width:768px) {
  .form-grid-2col, .form-grid-3col { grid-template-columns:1fr; }
  .card-body-prototype { padding:1.25rem; }
}
</style>