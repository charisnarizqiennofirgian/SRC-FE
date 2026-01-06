<template>
  <DashboardLayout>
    <div class="page-header-sawmill">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-sawmill">
            <span class="sawmill-icon">🪚</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-sawmill">Produksi Sawmill</h1>
            <p class="page-subtitle-sawmill">
              Catat proses pemotongan kayu log menjadi kayu RST basah untuk tracking produksi
            </p>
          </div>
        </div>
        <div class="header-badge-section">
          <div class="process-badge">
            <span class="process-icon">🪵</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">🪚</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">📦</span>
          </div>
        </div>
      </div>
    </div>

    <div class="content-card-sawmill">
      <div class="card-body-sawmill">
        <form @submit.prevent="handleSubmit" @keydown.enter.prevent>
          <!-- SECTION 1: INFO UMUM -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge">
                <span class="section-icon">📅</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Informasi Umum</h3>
                <p class="section-subtitle">Tanggal, PO, dan catatan produksi</p>
              </div>
            </div>

            <div class="form-grid-2col">
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Tanggal Produksi <span class="required-star">*</span>
                </label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">📅</span>
                  <input v-model="form.date" type="date" class="form-input-modern" required />
                </div>
              </div>

              <div class="form-group-modern">
                <label class="form-label-modern">Catatan Produksi</label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">📝</span>
                  <input
                    v-model="form.notes"
                    type="text"
                    class="form-input-modern"
                    placeholder="Contoh: Sawmill shift pagi, operator A"
                  />
                </div>
              </div>
            </div>

            <!-- PO + CONTEKAN TARGET -->
            <div class="form-grid-2col">
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Pilih Production Order <span class="required-star">*</span>
                </label>
                <div class="select-wrapper-modern">
                  <span class="select-icon">🧾</span>
                  <select
                    v-model="selectedProductionOrderId"
                    class="form-select-modern"
                    required
                    @change="handlePoChange"
                  >
                    <option value="">-- Pilih Production Order --</option>
                    <option v-for="po in productionOrders" :key="po.id" :value="po.id">
                      {{ po.label }}
                    </option>
                  </select>
                  <span class="select-arrow">▼</span>
                </div>
              </div>

              <div class="form-group-modern">
                <label class="form-label-modern">&nbsp;</label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">ℹ️</span>
                  <input
                    type="text"
                    class="form-input-modern readonly-input"
                    readonly
                    value="Pilih PO untuk melihat kebutuhan item di bawah"
                  />
                </div>
              </div>
            </div>

            <!-- KOTAK CONTEKAN TARGET DARI PO (VERSI BARU) -->
            <div v-if="poTargets.length" class="po-hint-box">
              <div class="po-hint-header">
                <div class="po-hint-title-wrap">
                  <span class="po-hint-icon">📌</span>
                  <div>
                    <div class="po-hint-title">Ringkasan Kebutuhan PO</div>
                    <div class="po-hint-sub">
                      {{ poInfo.buyer_name || 'Tanpa buyer' }} •
                      {{ poInfo.so_number || 'Tanpa SO' }}
                    </div>
                  </div>
                </div>
                <div class="po-hint-badge">{{ poTargets.length }} item</div>
              </div>

              <div class="po-hint-list-wrapper">
                <table class="po-hint-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th class="col-qty">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="t in poTargets" :key="t.item_id">
                      <td class="cell-name">
                        {{ t.name || t.code || 'Item #' + t.item_id }}
                      </td>
                      <td class="cell-qty">{{ parseInt(t.qty_planned) }} unit</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- SECTION 2: BAHAN BAKU -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge log-badge">
                <span class="section-icon">🪵</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Bahan Baku (Kayu Log)</h3>
                <p class="section-subtitle">Input material yang akan diproses</p>
              </div>
            </div>

            <div class="form-grid-2col">
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Item Kayu Log <span class="required-star">*</span>
                </label>
                <div class="select-wrapper-modern">
                  <span class="select-icon">🪵</span>
                  <select v-model="form.item_log_id" class="form-select-modern" required>
                    <option value="">-- Pilih Kayu Log --</option>
                    <option v-for="item in logItems" :key="item.id" :value="item.id">
                      {{ item.code }} - {{ item.name }}
                    </option>
                  </select>
                  <span class="select-arrow">▼</span>
                </div>
              </div>

              <div class="form-group-modern">
                <label class="form-label-modern">
                  Jumlah Log <span class="required-star">*</span>
                </label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">🔢</span>
                  <input
                    v-model.number="form.qty_log_pcs"
                    type="number"
                    min="1"
                    step="1"
                    class="form-input-modern"
                    placeholder="Masukkan jumlah batang"
                    required
                  />
                  <span class="input-suffix">batang</span>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 3: HASIL PRODUKSI -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge rst-badge">
                <span class="section-icon">📦</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Hasil Produksi (Kayu RST Basah)</h3>
                <p class="section-subtitle">Output dari proses sawmill</p>
              </div>
            </div>

            <div class="rst-items-container">
              <div v-for="(row, index) in form.rsts" :key="row.local_id" class="rst-item-card">
                <div class="rst-item-header">
                  <div class="rst-item-number">
                    <span class="item-number-badge">{{ index + 1 }}</span>
                    <span class="item-number-text">Item RST</span>
                  </div>
                  <button
                    v-if="form.rsts.length > 1"
                    type="button"
                    class="btn-remove-rst"
                    @click="removeRstRow(index)"
                  >
                    <span class="remove-icon">🗑️</span>
                    <span class="remove-text">Hapus</span>
                  </button>
                </div>

                <div class="rst-item-body">
                  <div class="form-group-modern rst-select-group">
                    <label class="form-label-modern">
                      Pilih Barang RST <span class="required-star">*</span>
                    </label>
                    <div class="select-wrapper-modern">
                      <span class="select-icon">📦</span>
                      <select
                        v-model="row.item_rst_id"
                        class="form-select-modern"
                        @change="updateRstVolume(index)"
                        required
                      >
                        <option value="">-- Pilih Kayu RST Basah --</option>
                        <option v-for="item in rstItems" :key="item.id" :value="item.id">
                          {{ item.code }} - {{ item.name }}
                        </option>
                      </select>
                      <span class="select-arrow">▼</span>
                    </div>
                    <div v-if="row.item_rst_id" class="dimension-info">
                      <span class="dimension-icon">📐</span>
                      <span class="dimension-text">
                        Dimensi Master: {{ getRstDimensionText(row.item_rst_id) }}
                      </span>
                    </div>
                  </div>

                  <div class="form-grid-2col rst-qty-grid">
                    <div class="form-group-modern">
                      <label class="form-label-modern">
                        Quantity <span class="required-star">*</span>
                      </label>
                      <div class="input-wrapper-icon">
                        <span class="input-icon">🔢</span>
                        <input
                          v-model.number="row.qty_rst_pcs"
                          type="number"
                          min="1"
                          step="1"
                          class="form-input-modern"
                          placeholder="Jumlah pcs"
                          @input="updateRstVolume(index)"
                          required
                        />
                        <span class="input-suffix">pcs</span>
                      </div>
                    </div>

                    <div class="form-group-modern">
                      <label class="form-label-modern">Volume Total</label>
                      <div class="input-wrapper-icon volume-readonly">
                        <span class="input-icon">📊</span>
                        <input
                          :value="row.volume_rst_m3"
                          type="number"
                          class="form-input-modern readonly-input"
                          readonly
                        />
                        <span class="input-suffix">m³</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="add-rst-section">
              <button type="button" class="btn-add-rst" @click="addRstRow">
                <span class="add-icon">➕</span>
                <span class="add-text">Tambah Item RST Lainnya</span>
              </button>
            </div>
          </div>

          <div class="form-actions-modern">
            <button
              type="button"
              class="btn-action btn-cancel-modern"
              @click="router.push({ name: 'admin-dashboard' })"
            >
              <span class="btn-icon">↩️</span>
              <span class="btn-text">Batal</span>
            </button>
            <button type="submit" class="btn-action btn-submit-modern">
              <span class="btn-icon">💾</span>
              <span class="btn-text">Simpan Produksi Sawmill</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'

const router = useRouter()
const { showSuccess, showError } = useNotification()

const form = reactive({
  date: new Date().toISOString().slice(0, 10),
  notes: '',
  item_log_id: '',
  qty_log_pcs: null,
  rsts: [
    {
      local_id: Date.now(),
      item_rst_id: '',
      qty_rst_pcs: null,
      volume_rst_m3: 0,
    },
  ],
})

const logItems = ref([])
const rstItems = ref([])
const warehouses = ref([])

const productionOrders = ref([])
const selectedProductionOrderId = ref('')

const poTargets = ref([])
const poInfo = ref({
  buyer_name: null,
  so_number: null,
})

const fetchItems = async () => {
  try {
    const [logsRes, rstRes, whRes, poRes] = await Promise.all([
      apiClient.get('/materials', { params: { category_name: 'Kayu Log', per_page: 100 } }),
      apiClient.get('/materials', { params: { category_name: 'Kayu RST', per_page: 100 } }),
      apiClient.get('/warehouses'),
      apiClient.get('/production-orders', { params: { status_not: 'completed' } }),
    ])

    logItems.value = logsRes.data.data?.data || logsRes.data.data || []
    rstItems.value = rstRes.data.data?.data || rstRes.data.data || []
    warehouses.value = whRes.data.data || whRes.data || []

    const poData = poRes.data.data?.data || poRes.data.data || []
    productionOrders.value = poData
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil data log / RST / gudang / Production Order')
  }
}

const handlePoChange = async () => {
  poTargets.value = []
  poInfo.value = { buyer_name: null, so_number: null }

  if (!selectedProductionOrderId.value) {
    return
  }

  try {
    const res = await apiClient.get(`/production-orders/${selectedProductionOrderId.value}`)
    const data = res.data.data || {}

    poInfo.value = {
      buyer_name: data.sales_order?.buyer_name || null,
      so_number: data.sales_order?.so_number || null,
    }

    poTargets.value = data.targets || []
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil detail Production Order')
  }
}

const getWarehouseIdByName = (namePart) => {
  const wh = warehouses.value.find((w) => w.name.includes(namePart))
  return wh ? wh.id : null
}

const getRstItem = (itemId) => {
  return rstItems.value.find((i) => i.id === itemId) || null
}

const getRstDimensionText = (itemId) => {
  const item = getRstItem(itemId)
  if (!item) return '-'
  const specs = item.specifications || {}
  const t = specs.t ?? null
  const l = specs.l ?? null
  const p = specs.p ?? null
  if (t && l && p) {
    return `${t} x ${l} x ${p} mm`
  }
  return item.name
}

const updateRstVolume = (index) => {
  const row = form.rsts[index]
  if (!row || !row.item_rst_id || !row.qty_rst_pcs) {
    row.volume_rst_m3 = 0
    return
  }

  const item = getRstItem(row.item_rst_id)
  if (!item || !item.volume_m3) {
    row.volume_rst_m3 = 0
    return
  }

  row.volume_rst_m3 = Number((row.qty_rst_pcs * Number(item.volume_m3)).toFixed(4))
}

const addRstRow = () => {
  form.rsts.push({
    local_id: Date.now() + Math.random(),
    item_rst_id: '',
    qty_rst_pcs: null,
    volume_rst_m3: 0,
  })
}

const removeRstRow = (index) => {
  form.rsts.splice(index, 1)
}

const handleSubmit = async () => {
  try {
    if (!form.item_log_id) {
      showError('Validasi', 'Item log wajib dipilih')
      return
    }

    if (!form.qty_log_pcs || form.qty_log_pcs <= 0) {
      showError('Validasi', 'Qty log wajib lebih dari 0')
      return
    }

    if (!selectedProductionOrderId.value) {
      showError('Validasi', 'Production Order wajib dipilih')
      return
    }

    const validRsts = form.rsts.filter(
      (row) => row.item_rst_id && row.qty_rst_pcs && row.qty_rst_pcs > 0,
    )

    if (validRsts.length === 0) {
      showError('Validasi', 'Minimal satu baris hasil RST wajib diisi')
      return
    }

    const warehouseFromId = getWarehouseIdByName('Gudang Log')
    const warehouseToId = getWarehouseIdByName('Gudang Sanwil')

    if (!warehouseFromId || !warehouseToId) {
      showError('Konfigurasi', 'Gudang Log / Gudang Sanwil tidak ditemukan di master')
      return
    }

    const payload = {
      date: form.date,
      warehouse_from_id: warehouseFromId,
      warehouse_to_id: warehouseToId,
      notes: form.notes || null,
      ref_po_id: Number(selectedProductionOrderId.value),
      ref_product_id: null,
      logs: [
        {
          item_log_id: form.item_log_id,
          qty_log_pcs: form.qty_log_pcs,
        },
      ],
      rsts: validRsts.map((row) => ({
        item_rst_id: row.item_rst_id,
        qty_rst_pcs: row.qty_rst_pcs,
        volume_rst_m3: row.volume_rst_m3,
      })),
    }

    await apiClient.post('/sawmill-productions', payload)
    showSuccess('Sukses', 'Produksi Sawmill berhasil dicatat')
    router.push({ name: 'SawmillReport' })
  } catch (error) {
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors && JSON.stringify(error.response.data.errors)) ||
      'Gagal mencatat produksi Sawmill'
    showError('Gagal', message)
  }
}

onMounted(() => {
  fetchItems()
})
</script>

<style scoped>
/* ========================================
   PAGE HEADER - GRADIENT
   ======================================== */
.page-header-sawmill {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  padding: 2rem 2.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(245, 158, 11, 0.3);
}

.header-content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-left-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.icon-badge-sawmill {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.sawmill-icon {
  font-size: 2.5rem;
}

.header-text-content {
  flex: 1;
}

.page-title-sawmill {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.page-subtitle-sawmill {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
  line-height: 1.5;
}

.header-badge-section {
  display: flex;
}

.process-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.process-icon {
  font-size: 1.5rem;
}

.process-arrow {
  font-size: 1.25rem;
  color: #d97706;
  font-weight: 700;
}

/* ========================================
   CONTENT CARD
   ======================================== */
.content-card-sawmill {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f2f5;
  overflow: hidden;
}

.card-body-sawmill {
  padding: 2.5rem;
}

/* ========================================
   FORM SECTIONS
   ======================================== */
.form-section-modern {
  margin-bottom: 2.5rem;
  padding-bottom: 2.5rem;
  border-bottom: 3px solid #e5e7eb;
}

.form-section-modern:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.75rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #f9fafb, #f3f4f6);
  border-radius: 14px;
  border-left: 5px solid #f59e0b;
}

.section-icon-badge {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.section-icon-badge.log-badge {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}

.section-icon-badge.rst-badge {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.section-icon {
  font-size: 1.75rem;
}

.section-title-group {
  flex: 1;
}

.section-title {
  font-size: 1.375rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.25px;
}

.section-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

/* ========================================
   PO HINT BOX (BARU)
   ======================================== */
.po-hint-box {
  margin-top: 1rem;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #fefce8, #fffbeb);
  padding: 1.25rem 1.5rem;
  box-shadow: 0 4px 12px rgba(250, 204, 21, 0.12);
}

.po-hint-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.po-hint-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.po-hint-icon {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: rgba(250, 204, 21, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.po-hint-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #92400e;
}

.po-hint-sub {
  font-size: 0.8rem;
  color: #6b7280;
}

.po-hint-badge {
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  background: #fef3c7;
  color: #92400e;
}

.po-hint-list-wrapper {
  max-height: 180px;
  overflow-y: auto;
  margin-top: 0.25rem;
  border-radius: 12px;
  border: 1px solid #facc15;
  background: white;
}

.po-hint-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.po-hint-table thead {
  position: sticky;
  top: 0;
  background: #fefce8;
  z-index: 1;
}

.po-hint-table th,
.po-hint-table td {
  padding: 0.45rem 0.75rem;
}

.po-hint-table th {
  text-align: left;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6b7280;
  border-bottom: 1px solid #feeeb2;
}

.po-hint-table .col-qty {
  width: 80px;
  text-align: right;
}

.po-hint-table .cell-name {
  color: #374151;
  font-weight: 500;
}

.po-hint-table .cell-qty {
  text-align: right;
  color: #92400e;
  font-weight: 700;
}

.po-hint-table tbody tr:nth-child(even) {
  background: #f9fafb;
}

/* ========================================
   FORM GRID
   ======================================== */
.form-grid-2col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.75rem;
}

@media (max-width: 768px) {
  .form-grid-2col {
    grid-template-columns: 1fr;
  }
}

/* ========================================
   FORM ELEMENTS
   ======================================== */
.form-group-modern {
  margin-bottom: 0;
}

.form-label-modern {
  display: block;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.75rem;
  letter-spacing: 0.015em;
}

.required-star {
  color: #ef4444;
  margin-left: 0.25rem;
}

.input-wrapper-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1.125rem;
  font-size: 1.125rem;
  pointer-events: none;
  z-index: 1;
}

.form-input-modern {
  width: 100%;
  padding: 1rem 1.25rem 1rem 3.25rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background: white;
  color: #111827;
}

.form-input-modern::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.form-input-modern:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
  transform: translateY(-1px);
}

.input-suffix {
  position: absolute;
  right: 1.125rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #6b7280;
  pointer-events: none;
}

.readonly-input {
  background: #f9fafb;
  cursor: not-allowed;
  font-weight: 700;
  color: #374151;
}

.volume-readonly .input-suffix {
  color: #059669;
}

.select-wrapper-modern {
  position: relative;
  display: flex;
  align-items: center;
}

.select-icon {
  position: absolute;
  left: 1.125rem;
  font-size: 1.125rem;
  pointer-events: none;
  z-index: 1;
}

.form-select-modern {
  width: 100%;
  padding: 1rem 3.25rem 1rem 3.25rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  background: white;
  color: #111827;
  appearance: none;
  cursor: pointer;
}

.form-select-modern:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
  transform: translateY(-1px);
}

.select-arrow {
  position: absolute;
  right: 1.125rem;
  font-size: 0.75rem;
  color: #6b7280;
  pointer-events: none;
}

/* ========================================
   RST ITEMS CONTAINER
   ======================================== */
.rst-items-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.rst-item-card {
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border: 2.5px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.rst-item-card:hover {
  border-color: #f59e0b;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.15);
  transform: translateY(-2px);
}

.rst-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.rst-item-number {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.item-number-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 10px;
  font-weight: 800;
  font-size: 1.125rem;
  color: #92400e;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
}

.item-number-text {
  font-size: 1rem;
  font-weight: 700;
  color: #374151;
}

.btn-remove-rst {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.125rem;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border: 2px solid #fca5a5;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 700;
  color: #dc2626;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-remove-rst:hover {
  background: linear-gradient(135deg, #fecaca, #fca5a5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
}

.remove-icon {
  font-size: 1rem;
}

.rst-item-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.rst-select-group {
  margin-bottom: 0;
}

.dimension-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-radius: 10px;
  border: 2px solid #bfdbfe;
}

.dimension-icon {
  font-size: 1rem;
}

.dimension-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e40af;
}

.rst-qty-grid {
  margin-top: 0;
}

/* ========================================
   ADD RST BUTTON
   ======================================== */
.add-rst-section {
  margin-top: 1.5rem;
}

.btn-add-rst {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1.125rem 2rem;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 3px dashed #93c5fd;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 700;
  color: #1e40af;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add-rst:hover {
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
  border-color: #60a5fa;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.25);
}

.add-icon {
  font-size: 1.25rem;
}

/* ========================================
   FORM ACTIONS
   ======================================== */
.form-actions-modern {
  display: flex;
  justify-content: flex-end;
  gap: 1.25rem;
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 3px solid #e5e7eb;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.125rem 2.25rem;
  border: none;
  border-radius: 14px;
  font-size: 1.0625rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  font-size: 1.25rem;
}

.btn-cancel-modern {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #374151;
  border: 2.5px solid #d1d5db;
}

.btn-cancel-modern:hover {
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn-submit-modern {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.btn-submit-modern:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.4);
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media (max-width: 768px) {
  .page-header-sawmill {
    padding: 1.5rem;
  }

  .header-content-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-body-sawmill {
    padding: 1.5rem;
  }

  .form-actions-modern {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }
}
</style>
