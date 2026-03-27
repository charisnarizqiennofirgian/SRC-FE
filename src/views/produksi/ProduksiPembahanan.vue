<template>
  <DashboardLayout>
    <!-- HEADER -->
    <div class="page-header-pembahanan">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-pembahanan">
            <span class="pembahanan-icon">🪚</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-pembahanan">Produksi Pembahanan</h1>
            <p class="page-subtitle-pembahanan">
              Pindahkan stok RST dari Gudang KD atau Sanwil ke Gudang Pembahanan sesuai PO.
            </p>
          </div>
        </div>
        <div class="header-badge-section">
          <div class="process-badge">
            <span class="process-icon">🔥</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">🪚</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">📦</span>
          </div>
          <div class="flow-label-pembahanan">KD / Sanwil → Pembahanan</div>
        </div>
      </div>
    </div>

    <!-- FORM CARD -->
    <div class="content-card-pembahanan">
      <div class="card-body-pembahanan">
        <form @submit.prevent="handleSubmit" @keydown.enter.prevent>

          <!-- SECTION 1: INFO UMUM -->
          <div class="form-section-modern">
            <div class="section-header section-header-pembahanan">
              <div class="section-icon-badge">
                <span class="section-icon">📅</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Informasi Umum</h3>
                <p class="section-subtitle">Tanggal, PO, gudang sumber, dan estimasi selesai</p>
              </div>
            </div>

            <!-- ROW 1: Tanggal, Estimasi, Catatan -->
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
                  <input v-model="form.estimated_finish_date" type="date" class="form-input-modern" />
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
                    placeholder="Catatan proses pembahanan..."
                  />
                </div>
              </div>
            </div>

            <!-- ROW 2: PO + Gudang Sumber -->
            <div class="form-grid-2col">
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Production Order <span class="required-star">*</span>
                </label>
                <vue-select
                  v-model="form.ref_po_id"
                  :options="productionOrders"
                  :reduce="(po) => po.id"
                  label="label"
                  placeholder="🔍 Cari Production Order..."
                  :clearable="true"
                  class="vue-select-po"
                  @option:selected="handlePoChange"
                  @option:deselected="handlePoDeselect"
                >
                  <template #no-options="{ search }">
                    <span v-if="search">Tidak ditemukan "{{ search }}"</span>
                    <span v-else>Ketik untuk mencari PO...</span>
                  </template>
                </vue-select>
              </div>

              <div class="form-group-modern">
                <label class="form-label-modern">
                  Gudang Sumber <span class="required-star">*</span>
                </label>
                <div class="source-warehouse-toggle">
                  <button
                    type="button"
                    :class="['toggle-btn', form.source_warehouse_id === warehouseKdId ? 'active' : '']"
                    @click="selectSourceWarehouse(warehouseKdId, 'KD')"
                  >
                    🔥 Gudang KD (RST Kering)
                  </button>
                  <button
                    type="button"
                    :class="['toggle-btn', form.source_warehouse_id === warehouseSanwilId ? 'active' : '']"
                    @click="selectSourceWarehouse(warehouseSanwilId, 'Sanwil')"
                  >
                    💧 Gudang Sanwil (RST Basah)
                  </button>
                </div>
              </div>
            </div>

            <!-- Info PO yang dipilih -->
            <div v-if="form.ref_po_id && poInfo.buyer_name" class="po-selected-info">
              <span class="po-info-icon">👤</span>
              <div>
                <div class="po-info-buyer">{{ poInfo.buyer_name }}</div>
                <div class="po-info-so">{{ poInfo.so_number }}</div>
              </div>
            </div>

            <!-- Ringkasan kebutuhan PO -->
            <div v-if="poTargets.length" class="po-hint-box" style="margin-top:1rem;">
              <div class="po-hint-header">
                <div class="po-hint-title-wrap">
                  <span class="po-hint-icon">📌</span>
                  <div>
                    <div class="po-hint-title">Ringkasan Kebutuhan PO</div>
                    <div class="po-hint-sub">{{ poInfo.buyer_name }} • {{ poInfo.so_number }}</div>
                  </div>
                </div>
                <div class="po-hint-badge">{{ poTargets.length }} item</div>
              </div>
              <table class="po-hint-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty Target</th>
                  </tr>
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

          <!-- SECTION 2: ITEM -->
          <div class="form-section-modern">
            <div class="section-header section-header-pembahanan">
              <div class="section-icon-badge section-icon-badge--item">
                <span class="section-icon">📦</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Item yang Dipindahkan</h3>
                <p class="section-subtitle">
                  Pilih item dari
                  <strong>{{ sourceWarehouseName || 'gudang sumber' }}</strong>
                  — stok akan dipindah ke Gudang Pembahanan
                </p>
              </div>
            </div>

            <!-- Belum pilih gudang sumber -->
            <div v-if="!form.source_warehouse_id" class="empty-hint">
              ⬆️ Pilih gudang sumber dulu di atas
            </div>

            <!-- Loading stok -->
            <div v-else-if="loadingInventory" class="loading-hint">
              ⏳ Memuat stok...
            </div>

            <!-- Tidak ada stok -->
            <div v-else-if="sourceInventories.length === 0" class="empty-hint">
              📭 Tidak ada stok tersedia di {{ sourceWarehouseName }}
            </div>

            <!-- List item rows -->
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
                    <label class="form-label-modern">
                      Item <span class="required-star">*</span>
                    </label>
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
                          <span class="item-option-code">{{ o.item_code }}</span>
                          <span class="item-option-name">{{ o.item_name }}</span>
                          <span class="item-option-stock">Stok: {{ o.qty_pcs }} pcs</span>
                        </div>
                      </template>
                    </vue-select>
                  </div>

                  <div class="form-group-modern">
                    <label class="form-label-modern">
                      Qty (pcs) <span class="required-star">*</span>
                      <span v-if="row.max_qty" class="stock-hint">
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
                    <!-- Warning kalau melebihi stok -->
                    <p v-if="row.qty > row.max_qty && row.max_qty > 0" class="qty-warning">
                      ⚠️ Melebihi stok tersedia ({{ row.max_qty }} pcs)
                    </p>
                  </div>
                </div>
              </div>

              <!-- Tombol tambah item -->
              <button type="button" class="btn-add-item" @click="addItem">
                ➕ Tambah Item Lainnya
              </button>
            </template>
          </div>

          <!-- FORM ACTIONS -->
          <div class="form-actions-modern">
            <button
              type="button"
              class="btn-action btn-cancel-modern"
              @click="router.back()"
            >
              <span class="btn-icon">↩️</span>
              <span class="btn-text">Batal</span>
            </button>
            <button
              type="submit"
              class="btn-action btn-submit-modern"
              :disabled="isSubmitting || !canSubmit"
            >
              <span class="btn-icon">💾</span>
              <span class="btn-text">{{ isSubmitting ? 'Menyimpan...' : 'Simpan Pembahanan' }}</span>
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

const router      = useRouter()
const { showSuccess, showError } = useNotification()
const isSubmitting   = ref(false)
const loadingInventory = ref(false)

// === DATA ===
const productionOrders   = ref([])
const sourceInventories  = ref([])
const warehouses         = ref([])
const warehouseKdId      = ref(null)
const warehouseSanwilId  = ref(null)
const sourceWarehouseName = ref('')

const poInfo = ref({ buyer_name: null, so_number: null })
const poTargets = ref([])

const form = reactive({
  date:                   new Date().toISOString().slice(0, 10),
  estimated_finish_date:  '',
  notes:                  '',
  ref_po_id:              null,
  source_warehouse_id:    null,
  items: [
    { local_id: Date.now(), item_id: null, qty: null, max_qty: 0 }
  ],
})

// === COMPUTED ===
const sourceInventoriesForSelect = computed(() =>
  sourceInventories.value.map((inv) => ({
    item_id:   inv.item_id,
    item_code: inv.item_code,
    item_name: inv.item_name,
    qty_pcs:   inv.qty_pcs,
    label:     `${inv.item_code} - ${inv.item_name}`,
  }))
)

const canSubmit = computed(() => {
  if (!form.ref_po_id || !form.source_warehouse_id) return false
  return form.items.some((i) => i.item_id && i.qty > 0)
})

// === METHODS ===
const fetchInitialData = async () => {
  try {
    const [poRes, whRes] = await Promise.all([
      apiClient.get('/produksi/pembahanan/available-pos'),
      apiClient.get('/warehouses'),
    ])

    productionOrders.value = poRes.data.data || []
    warehouses.value       = whRes.data.data || whRes.data || []

    // Cari ID gudang KD dan Sanwil
    const wKd     = warehouses.value.find((w) => w.code === 'RSTK')
    const wSanwil = warehouses.value.find((w) => w.code === 'RSTB')

    warehouseKdId.value     = wKd?.id ?? null
    warehouseSanwilId.value = wSanwil?.id ?? null

    // Default pilih KD
    if (warehouseKdId.value) {
      selectSourceWarehouse(warehouseKdId.value, 'Gudang KD (RST Kering)')
    }
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil data awal')
  }
}

const selectSourceWarehouse = async (warehouseId, name) => {
  form.source_warehouse_id = warehouseId
  sourceWarehouseName.value = name
  // Reset items
  form.items = [{ local_id: Date.now(), item_id: null, qty: null, max_qty: 0 }]
  await fetchSourceInventories()
}

const fetchSourceInventories = async () => {
  if (!form.source_warehouse_id) return
  loadingInventory.value = true
  try {
    const res = await apiClient.get('/produksi/pembahanan/source-inventories', {
      params: { warehouse_id: form.source_warehouse_id },
    })
    sourceInventories.value = res.data.data || []
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil stok gudang sumber')
  } finally {
    loadingInventory.value = false
  }
}

const handlePoChange = async (opt) => {
  poInfo.value   = { buyer_name: null, so_number: null }
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
  } catch (error) {
    console.error(error)
  }
}

const handlePoDeselect = () => {
  poInfo.value    = { buyer_name: null, so_number: null }
  poTargets.value = []
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
  if (!form.ref_po_id) {
    showError('Validasi', 'Production Order wajib dipilih')
    return
  }
  if (!form.source_warehouse_id) {
    showError('Validasi', 'Gudang sumber wajib dipilih')
    return
  }

  const validItems = form.items.filter((i) => i.item_id && i.qty > 0)
  if (validItems.length === 0) {
    showError('Validasi', 'Minimal satu item harus diisi')
    return
  }

  // Cek qty tidak melebihi stok
  for (let i = 0; i < validItems.length; i++) {
    if (validItems[i].qty > validItems[i].max_qty) {
      showError('Validasi', `Item #${i + 1}: Qty melebihi stok tersedia (${validItems[i].max_qty} pcs)`)
      return
    }
  }

  isSubmitting.value = true
  try {
    const payload = {
      date:                   form.date,
      estimated_finish_date:  form.estimated_finish_date || null,
      notes:                  form.notes || null,
      ref_po_id:              Number(form.ref_po_id),
      source_warehouse_id:    Number(form.source_warehouse_id),
      items: validItems.map((i) => ({
        item_id: Number(i.item_id),
        qty:     Number(i.qty),
      })),
    }

    await apiClient.post('/produksi/pembahanan', payload)
    showSuccess('Sukses', 'Proses Pembahanan berhasil dicatat')
    router.push({ name: 'ProduksiMoulding' })
  } catch (error) {
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors && JSON.stringify(error.response.data.errors)) ||
      'Gagal menyimpan pembahanan'
    showError('Gagal', message)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchInitialData)
</script>

<style scoped>
.page-header-pembahanan {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  padding: 2rem 2.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(124, 58, 237, 0.3);
}
.header-content-wrapper { display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
.header-left-section { display: flex; align-items: center; gap: 1.5rem; flex: 1; }
.icon-badge-pembahanan { width: 72px; height: 72px; border-radius: 18px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; }
.pembahanan-icon { font-size: 2.5rem; }
.page-title-pembahanan { font-size: 2rem; font-weight: 800; color: white; margin: 0 0 0.5rem; }
.page-subtitle-pembahanan { color: rgba(255,255,255,0.95); font-size: 1rem; margin: 0; font-weight: 500; }
.process-badge { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; background: rgba(255,255,255,0.95); border-radius: 16px; }
.process-icon { font-size: 1.5rem; }
.process-arrow { font-size: 1.25rem; color: #6d28d9; font-weight: 700; }
.flow-label-pembahanan { color: rgba(255,255,255,0.9); font-size: 0.85rem; font-weight: 600; margin-top: 6px; text-align: center; }

.content-card-pembahanan { background: white; border-radius: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #f0f2f5; overflow: hidden; }
.card-body-pembahanan { padding: 2.5rem; }

.form-section-modern { margin-bottom: 2.5rem; padding-bottom: 2.5rem; border-bottom: 3px solid #e5e7eb; }
.form-section-modern:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }

.section-header { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.75rem; padding: 1.25rem 1.5rem; background: linear-gradient(135deg, #f9fafb, #f3f4f6); border-radius: 14px; border-left: 5px solid #7c3aed; }
.section-icon-badge { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #7c3aed, #6d28d9); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.section-icon-badge--item { background: linear-gradient(135deg, #2563eb, #1d4ed8); }
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
.form-input-modern:focus { outline: none; border-color: #7c3aed; box-shadow: 0 0 0 4px rgba(124,58,237,0.15); }

.source-warehouse-toggle { display: flex; gap: 0.75rem; }
.toggle-btn { flex: 1; padding: 0.75rem 1rem; border: 2px solid #e5e7eb; border-radius: 10px; background: white; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; color: #374151; }
.toggle-btn:hover { border-color: #7c3aed; color: #7c3aed; }
.toggle-btn.active { border-color: #7c3aed; background: #f5f3ff; color: #7c3aed; }

.po-selected-info { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 10px; margin-top: 4px; }
.po-info-icon { font-size: 1.25rem; }
.po-info-buyer { font-weight: 700; font-size: 0.95rem; color: #111827; }
.po-info-so { font-size: 0.82rem; color: #6b7280; }

.item-row-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; }
.item-row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.item-row-number { font-size: 0.82rem; font-weight: 700; color: #6b7280; text-transform: uppercase; }
.btn-remove-row { background: #fee2e2; color: #ef4444; border: none; border-radius: 6px; padding: 3px 10px; font-size: 0.82rem; cursor: pointer; font-weight: 700; }

.stock-hint { margin-left: 8px; font-size: 0.78rem; color: #7c3aed; font-weight: 600; }
.qty-warning { margin-top: 4px; font-size: 0.82rem; color: #ef4444; }

.empty-hint { padding: 2rem; text-align: center; color: #9ca3af; font-size: 0.95rem; background: #f9fafb; border-radius: 12px; border: 1px dashed #d1d5db; }
.loading-hint { padding: 1.5rem; text-align: center; color: #6b7280; }

.btn-add-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: #ede9fe; border: 2px dashed #7c3aed; border-radius: 10px; color: #6d28d9; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; margin-top: 0.5rem; }
.btn-add-item:hover { background: #ddd6fe; }

.form-actions-modern { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb; }
.btn-action { display: flex; align-items: center; gap: 0.5rem; padding: 0.875rem 1.75rem; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
.btn-cancel-modern { background: #f3f4f6; color: #374151; }
.btn-cancel-modern:hover { background: #e5e7eb; }
.btn-submit-modern { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; box-shadow: 0 4px 12px rgba(124,58,237,0.35); }
.btn-submit-modern:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(124,58,237,0.45); }
.btn-submit-modern:disabled { opacity: 0.6; cursor: not-allowed; }

.vue-select-po :deep(.vs__dropdown-toggle),
.vue-select-item :deep(.vs__dropdown-toggle) { padding: 0.875rem 1.25rem; border: 2.5px solid #e5e7eb; border-radius: 12px; min-height: 54px; }
.vue-select-po.vs--open :deep(.vs__dropdown-toggle),
.vue-select-item.vs--open :deep(.vs__dropdown-toggle) { border-color: #7c3aed; box-shadow: 0 0 0 4px rgba(124,58,237,0.15); }

.item-option { display: flex; flex-direction: column; gap: 2px; padding: 8px 12px; }
.item-option-code { font-size: 0.82rem; font-weight: 700; color: #7c3aed; }
.item-option-name { font-size: 0.9rem; color: #111827; font-weight: 500; }
.item-option-stock { font-size: 0.78rem; color: #6b7280; }

@media (max-width: 768px) {
  .form-grid-2col, .form-grid-3col { grid-template-columns: 1fr; }
  .source-warehouse-toggle { flex-direction: column; }
  .card-body-pembahanan { padding: 1.25rem; }
}

.po-hint-box {
  border-radius: 16px;
  border: 1px solid #ddd6fe;
  background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  padding: 1.25rem 1.5rem;
}
.po-hint-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.po-hint-title-wrap { display: flex; align-items: center; gap: 0.75rem; }
.po-hint-icon { font-size: 1.25rem; }
.po-hint-title { font-weight: 700; font-size: 0.95rem; color: #5b21b6; }
.po-hint-sub { font-size: 0.82rem; color: #7c3aed; }
.po-hint-badge { background: #7c3aed; color: white; border-radius: 999px; padding: 2px 12px; font-size: 0.8rem; font-weight: 700; }
.po-hint-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.po-hint-table th { padding: 6px 10px; text-align: left; color: #5b21b6; font-size: 0.78rem; text-transform: uppercase; border-bottom: 1px solid #ddd6fe; }
.po-hint-table td { padding: 6px 10px; color: #374151; border-bottom: 1px solid #ede9fe; }
</style>