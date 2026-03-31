<template>
  <DashboardLayout>
    <div class="page-header-rustik">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-rustik">
            <span class="rustik-icon">🪵</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-rustik">Proses Rustik</h1>
            <p class="page-subtitle-rustik">
              Proses rustik barang — ambil dari gudang manapun, masuk Gudang Rustik.
            </p>
          </div>
        </div>
        <div class="header-badge-section">
          <div class="process-badge">
            <span class="process-icon">📦</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">🪵</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">✨</span>
          </div>
          <div class="flow-label-rustik">Gudang → Rustik → Selesai</div>
        </div>
      </div>
    </div>

    <div class="content-card-rustik">
      <div class="card-body-rustik">
        <form @submit.prevent="handleSubmit" @keydown.enter.prevent>

          <!-- SECTION 1: INFO UMUM -->
          <div class="form-section-modern">
            <div class="section-header section-header-rustik">
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
                  <input v-model="form.notes" type="text" class="form-input-modern" placeholder="Catatan..." />
                </div>
              </div>
            </div>

            <!-- Pilih Gudang Sumber -->
            <div class="form-group-modern">
              <label class="form-label-modern">
                Gudang Sumber <span class="required-star">*</span>
              </label>
              <div class="warehouse-toggle">
                <button
                  v-for="wh in sourceWarehouses"
                  :key="wh.id"
                  type="button"
                  :class="['toggle-btn', form.source_warehouse_id === wh.id ? 'active' : '']"
                  @click="selectWarehouse(wh)"
                >
                  {{ wh.name }}
                </button>
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
            <div class="section-header section-header-rustik">
              <div class="section-icon-badge section-badge-item">
                <span class="section-icon">📦</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Item yang Diproses</h3>
                <p class="section-subtitle">
                  Stok dari <strong>{{ selectedWarehouseName || 'gudang sumber' }}</strong>
                  <span v-if="loadingItems" class="loading-inline">⏳ memuat...</span>
                </p>
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
                v-for="(row, index) in form.items"
                :key="row.local_id"
                class="item-row-card"
              >
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
                      v-model="row.item_id"
                      :options="sourceItemsForSelect"
                      :reduce="(o) => o.item_id"
                      label="label"
                      placeholder="🔍 Pilih item..."
                      class="vue-select-item"
                      @option:selected="(opt) => onItemSelected(index, opt)"
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
                      Qty (pcs) <span class="required-star">*</span>
                      <span v-if="row.max_qty > 0" class="stock-hint">Tersedia: {{ row.max_qty }} pcs</span>
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

              <button type="button" class="btn-add-row btn-add-item" @click="addItem">
                ➕ Tambah Item Lainnya
              </button>
            </template>
          </div>

          <!-- FORM ACTIONS -->
          <div class="form-actions-modern">
            <button type="button" class="btn-action btn-cancel-modern" @click="router.back()">
              <span class="btn-icon">↩️</span>
              <span class="btn-text">Batal</span>
            </button>
            <button type="submit" class="btn-action btn-submit-rustik" :disabled="isSubmitting">
              <span class="btn-icon">💾</span>
              <span class="btn-text">{{ isSubmitting ? 'Menyimpan...' : 'Simpan Rustik' }}</span>
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
const sourceWarehouses      = ref([])
const sourceItems           = ref([])
const selectedWarehouseName = ref('')
const poInfo = ref({ buyer_name: null, so_number: null })

const form = reactive({
  date:                new Date().toISOString().slice(0, 10),
  ref_po_id:           null,
  source_warehouse_id: null,
  notes:               '',
  items: [{ local_id: Date.now(), item_id: null, qty: null, max_qty: 0 }],
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
      apiClient.get('/production-orders', { params: { status_not: 'completed' } }),
      apiClient.get('/warehouses'),
    ])
    const poRaw = poRes.data.data?.data || poRes.data.data || []
    productionOrders.value = poRaw.map((po) => ({
      id: po.id, po_number: po.po_number, label: po.po_number,
      buyer_name: po.buyer_name, so_number: po.so_number,
    }))
    const excludeCodes = ['RUSTIK', 'LOG', 'RSTB', 'RSTK', 'BUFFER']
    const allWh = whRes.data.data || whRes.data || []
    sourceWarehouses.value = allWh.filter((w) => !excludeCodes.includes(w.code))
  } catch {
    showError('Gagal', 'Gagal mengambil data awal')
  }
}

const selectWarehouse = async (wh) => {
  form.source_warehouse_id = wh.id
  selectedWarehouseName.value = wh.name
  form.items = [{ local_id: Date.now(), item_id: null, qty: null, max_qty: 0 }]
  await fetchSourceItems()
}

const fetchSourceItems = async () => {
  if (!form.source_warehouse_id) return
  loadingItems.value = true
  try {
    const res = await apiClient.get('/produksi/transfer/source-items', {
      params: { warehouse_id: form.source_warehouse_id }
    })
    sourceItems.value = res.data.data || []
  } catch {
    showError('Gagal', 'Gagal mengambil stok gudang')
  } finally {
    loadingItems.value = false
  }
}

const handlePoChange = async (opt) => {
  poInfo.value = { buyer_name: null, so_number: null }
  if (!opt) return
  try {
    const res = await apiClient.get(`/production-orders/${opt.id}`)
    const data = res.data.data || {}
    poInfo.value = {
      buyer_name: data.sales_order?.buyer_name || opt.buyer_name || null,
      so_number:  data.sales_order?.so_number  || opt.so_number  || null,
    }
  } catch (e) { console.error(e) }
}

const handlePoDeselect = () => { poInfo.value = { buyer_name: null, so_number: null } }
const onItemSelected = (index, opt) => { form.items[index].max_qty = opt?.qty_available ?? 0 }
const addItem    = () => form.items.push({ local_id: Date.now() + Math.random(), item_id: null, qty: null, max_qty: 0 })
const removeItem = (i) => form.items.splice(i, 1)

const handleSubmit = async () => {
  if (!form.ref_po_id)           { showError('Validasi', 'PO wajib dipilih'); return }
  if (!form.source_warehouse_id) { showError('Validasi', 'Gudang sumber wajib dipilih'); return }
  const validItems = form.items.filter((i) => i.item_id && i.qty > 0)
  if (validItems.length === 0)   { showError('Validasi', 'Minimal satu item wajib diisi'); return }
  for (let i = 0; i < validItems.length; i++) {
    if (validItems[i].qty > validItems[i].max_qty && validItems[i].max_qty > 0) {
      showError('Validasi', `Item #${i + 1}: Qty melebihi stok (${validItems[i].max_qty} pcs)`); return
    }
  }
  isSubmitting.value = true
  try {
    await apiClient.post('/produksi/rustik/store', {
      date:                form.date,
      ref_po_id:           Number(form.ref_po_id),
      source_warehouse_id: Number(form.source_warehouse_id),
      notes:               form.notes || null,
      items: validItems.map((i) => ({ item_id: Number(i.item_id), qty: Number(i.qty) })),
    })
    showSuccess('Sukses', 'Proses Rustik berhasil dicatat')
    router.back()
  } catch (error) {
    showError('Gagal', error.response?.data?.message || 'Gagal menyimpan rustik')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchInitialData)
</script>

<style scoped>
.page-header-rustik {
  background: linear-gradient(135deg, #7c2d12 0%, #6b2309 100%);
  padding: 2rem 2.5rem; border-radius: 20px; margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(124,45,18,0.3);
}
.header-content-wrapper { display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
.header-left-section { display: flex; align-items: center; gap: 1.5rem; flex: 1; }
.icon-badge-rustik { width: 72px; height: 72px; border-radius: 18px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; }
.rustik-icon { font-size: 2.5rem; }
.page-title-rustik { font-size: 2rem; font-weight: 800; color: white; margin: 0 0 0.5rem; }
.page-subtitle-rustik { color: rgba(255,255,255,0.95); font-size: 1rem; margin: 0; font-weight: 500; }
.process-badge { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; background: rgba(255,255,255,0.95); border-radius: 16px; }
.process-icon { font-size: 1.5rem; }
.process-arrow { font-size: 1.25rem; color: #6b2309; font-weight: 700; }
.flow-label-rustik { color: rgba(255,255,255,0.9); font-size: 0.85rem; font-weight: 600; margin-top: 6px; text-align: center; }
.header-badge-section { display: flex; flex-direction: column; align-items: center; }
.content-card-rustik { background: white; border-radius: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #f0f2f5; overflow: hidden; }
.card-body-rustik { padding: 2.5rem; }
.form-section-modern { margin-bottom: 2.5rem; padding-bottom: 2.5rem; border-bottom: 3px solid #e5e7eb; }
.form-section-modern:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
.section-header { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.75rem; padding: 1.25rem 1.5rem; background: linear-gradient(135deg, #f9fafb, #fff7ed); border-radius: 14px; border-left: 5px solid #7c2d12; }
.section-icon-badge { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #7c2d12, #6b2309); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.section-badge-item { background: linear-gradient(135deg, #16a34a, #15803d) !important; }
.section-icon { font-size: 1.25rem; }
.section-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0 0 0.2rem; }
.section-subtitle { font-size: 0.875rem; color: #6b7280; margin: 0; }
.form-grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.form-grid-3col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.form-group-modern { display: flex; flex-direction: column; }
.form-label-modern { font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
.required-star { color: #ef4444; }
.input-wrapper-icon { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 1.125rem; font-size: 1rem; z-index: 1; pointer-events: none; }
.form-input-modern { width: 100%; padding: 0.9rem 1.25rem 0.9rem 3.25rem; border: 2.5px solid #e5e7eb; border-radius: 12px; font-size: 1rem; font-weight: 500; transition: all 0.3s ease; background: white; }
.form-input-modern:focus { outline: none; border-color: #7c2d12; box-shadow: 0 0 0 4px rgba(124,45,18,0.15); }
.warehouse-toggle { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.toggle-btn { padding: 0.6rem 1rem; border: 2px solid #e5e7eb; border-radius: 10px; background: white; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; color: #374151; }
.toggle-btn:hover { border-color: #7c2d12; color: #7c2d12; }
.toggle-btn.active { border-color: #7c2d12; background: #fff7ed; color: #7c2d12; }
.po-selected-info { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; margin-top: 1rem; }
.po-info-icon { font-size: 1.25rem; }
.po-info-buyer { font-weight: 700; font-size: 0.95rem; color: #111827; }
.po-info-so { font-size: 0.82rem; color: #6b7280; }
.item-row-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; }
.item-row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.item-row-number { font-size: 0.82rem; font-weight: 700; color: #6b7280; text-transform: uppercase; }
.btn-remove-row { background: #fee2e2; color: #ef4444; border: none; border-radius: 6px; padding: 3px 10px; font-size: 0.82rem; cursor: pointer; font-weight: 700; }
.stock-hint { margin-left: 8px; font-size: 0.78rem; color: #7c2d12; font-weight: 600; }
.qty-warning { margin-top: 4px; font-size: 0.82rem; color: #ef4444; }
.loading-inline { font-size: 0.82rem; color: #6b7280; margin-left: 8px; }
.empty-hint { padding: 2rem; text-align: center; color: #9ca3af; font-size: 0.95rem; background: #f9fafb; border-radius: 12px; border: 1px dashed #d1d5db; }
.btn-add-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; margin-top: 0.5rem; border: 2px dashed; }
.btn-add-item { background: #fff7ed; border-color: #7c2d12; color: #6b2309; }
.btn-add-item:hover { background: #fed7aa; }
.form-actions-modern { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb; }
.btn-action { display: flex; align-items: center; gap: 0.5rem; padding: 0.875rem 1.75rem; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
.btn-cancel-modern { background: #f3f4f6; color: #374151; }
.btn-cancel-modern:hover { background: #e5e7eb; }
.btn-submit-rustik { background: linear-gradient(135deg, #7c2d12, #6b2309); color: white; box-shadow: 0 4px 12px rgba(124,45,18,0.35); }
.btn-submit-rustik:hover:not(:disabled) { transform: translateY(-1px); }
.btn-submit-rustik:disabled { opacity: 0.6; cursor: not-allowed; }
.item-option { display: flex; flex-direction: column; gap: 2px; padding: 8px 12px; }
.item-option-code { font-size: 0.82rem; font-weight: 700; color: #7c2d12; }
.item-option-name { font-size: 0.9rem; color: #111827; font-weight: 500; }
.item-option-stock { font-size: 0.78rem; color: #6b7280; }
.vue-select-po :deep(.vs__dropdown-toggle),
.vue-select-item :deep(.vs__dropdown-toggle) { padding: 0.875rem 1.25rem; border: 2.5px solid #e5e7eb; border-radius: 12px; min-height: 54px; }
.vue-select-po.vs--open :deep(.vs__dropdown-toggle),
.vue-select-item.vs--open :deep(.vs__dropdown-toggle) { border-color: #7c2d12; box-shadow: 0 0 0 4px rgba(124,45,18,0.15); }
@media (max-width: 768px) {
  .form-grid-2col, .form-grid-3col { grid-template-columns: 1fr; }
  .warehouse-toggle { flex-direction: column; }
  .card-body-rustik { padding: 1.25rem; }
}
</style>