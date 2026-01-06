<template>
  <DashboardLayout>
    <!-- ========================================
         PAGE HEADER - ROUGH MILL THEME
         ======================================== -->
    <div class="page-header-roughmill">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-roughmill">
            <span class="roughmill-icon">🪚</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-roughmill">Produksi Pembahanan</h1>
            <p class="page-subtitle-roughmill">
              Alokasikan stok kayu kering dari Gudang Candy ke Production Order tertentu untuk
              proses Rough Mill.
            </p>
          </div>
        </div>
        <div class="header-process-flow">
          <div class="process-badge">
            <span class="flow-icon">🔥</span>
            <span class="flow-arrow">→</span>
            <span class="flow-icon">🪚</span>
            <span class="flow-label">Rough Mill</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================
         FORM CARD
         ======================================== -->
    <div class="content-card-roughmill">
      <div class="card-body-roughmill">
        <form @submit.prevent="handleSubmit">
          <!-- BLOK 1: TARGET PO -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge po-badge">
                <span class="section-icon">📄</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Target Production Order</h3>
                <p class="section-subtitle">Pilih PO yang akan menerima alokasi RST kering</p>
              </div>
            </div>

            <div class="form-group-modern">
              <label class="form-label-modern">
                Production Order <span class="required-star">*</span>
              </label>
              <div class="select-wrapper-modern">
                <span class="select-icon">📄</span>
                <select
                  v-model="form.po_id"
                  class="form-select-modern"
                  required
                  @change="handlePoChange"
                >
                  <option value="">-- Pilih PO On Progress --</option>
                  <option v-for="po in productionOrders" :key="po.id" :value="po.id">
                    {{ po.label }}
                  </option>
                </select>
                <span class="select-arrow">▼</span>
              </div>
            </div>

            <!-- HANYA RINGKASAN KEBUTUHAN PO -->
            <div v-if="poTargets.length" class="po-hint-box">
              <div class="po-hint-header">
                <div class="po-hint-title-wrap">
                  <span class="po-hint-icon">📌</span>
                  <div>
                    <div class="po-hint-title">Ringkasan Kebutuhan PO</div>
                    <div class="po-hint-sub">
                      {{ poInfo.buyer_name || '-' }} • {{ poInfo.so_number || '-' }}
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

          <!-- BLOK 2: SUMBER STOK -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge candy-badge">
                <span class="section-icon">📦</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Sumber Stok Gudang Candy</h3>
                <p class="section-subtitle">Stok kayu kering yang siap diproses pembahanan</p>
              </div>
            </div>

            <div class="form-grid-2col">
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Sumber Inventory <span class="required-star">*</span>
                </label>
                <div class="select-wrapper-modern">
                  <span class="select-icon">📦</span>
                  <select v-model="form.source_inventory_id" class="form-select-modern" required>
                    <option value="">-- Pilih Stok Gudang Candy --</option>
                    <option v-for="inv in sourceInventories" :key="inv.id" :value="inv.id">
                      {{ inv.item.name }} | {{ Number(inv.qty) }} Pcs
                    </option>
                  </select>
                  <span class="select-arrow">▼</span>
                </div>
              </div>

              <div class="form-group-modern">
                <label class="form-label-modern">
                  Qty Input Pembahanan <span class="required-star">*</span>
                </label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">🔢</span>
                  <input
                    v-model.number="form.input_qty"
                    type="number"
                    min="1"
                    class="form-input-modern"
                    placeholder="Jumlah pcs"
                    required
                  />
                  <span class="input-suffix">pcs</span>
                </div>
              </div>
            </div>
          </div>

          <!-- BLOK 3: OUTPUT RST -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge output-badge">
                <span class="section-icon">✅</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Hasil Output RST Kering</h3>
                <p class="section-subtitle">Item dan quantity hasil dari proses pembahanan</p>
              </div>
            </div>

            <div class="form-grid-2col">
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Item RST Hasil <span class="required-star">*</span>
                </label>
                <div class="select-wrapper-modern">
                  <span class="select-icon">📦</span>
                  <select v-model="form.output_item_id" class="form-select-modern" required>
                    <option value="">-- Pilih Item RST Kering --</option>
                    <option v-for="item in outputItems" :key="item.id" :value="item.id">
                      {{ item.code }} - {{ item.name }}
                    </option>
                  </select>
                  <span class="select-arrow">▼</span>
                </div>
              </div>

              <div class="form-group-modern">
                <label class="form-label-modern">
                  Qty Output (pcs) <span class="required-star">*</span>
                </label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">📊</span>
                  <input
                    v-model.number="form.output_qty"
                    type="number"
                    min="1"
                    class="form-input-modern"
                    placeholder="Hasil pcs"
                    required
                  />
                  <span class="input-suffix">pcs</span>
                </div>
              </div>
            </div>
          </div>

          <!-- FORM ACTIONS -->
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
              <span class="btn-text">Simpan Pembahanan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'

const router = useRouter()
const route = useRoute()
const { showSuccess, showError } = useNotification()

const form = reactive({
  po_id: '',
  source_inventory_id: '',
  input_qty: null,
  output_item_id: '',
  output_qty: null,
})

const productionOrders = ref([])
const sourceInventories = ref([])
const outputItems = ref([])

const selectedPo = computed(() => productionOrders.value.find((po) => po.id === Number(form.po_id)))

const poTargets = ref([])
const poInfo = ref({
  buyer_name: null,
  so_number: null,
})

const autoSelectPoFromSo = () => {
  const soId = Number(route.query.so_id)
  if (!soId || !productionOrders.value.length) return
  const po = productionOrders.value.find((p) => Number(p.sales_order_id) === soId)
  if (po) {
    form.po_id = po.id
    handlePoChange()
  }
}

const fetchPoOnProgress = async () => {
  try {
    const res = await apiClient.get('/production-orders', {
      params: { status_not: 'completed', per_page: 100 },
    })
    const raw = res.data.data?.data || res.data.data || []
    productionOrders.value = raw
    autoSelectPoFromSo()
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil daftar Production Order')
  }
}

const handlePoChange = async () => {
  poTargets.value = []
  poInfo.value = { buyer_name: null, so_number: null }

  if (!form.po_id) return

  try {
    const res = await apiClient.get(`/production-orders/${form.po_id}`)
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

const fetchSourceInventories = async () => {
  try {
    const res = await apiClient.get('/produksi/pembahanan/source-inventories')
    sourceInventories.value = res.data.data || []
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil daftar stok Gudang Candy')
  }
}

const fetchOutputItems = async () => {
  try {
    const res = await apiClient.get('/materials', {
      params: { category_name: 'Kayu RST', per_page: 100 },
    })
    const raw = res.data.data?.data || res.data.data || []
    outputItems.value = raw
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil daftar item Kayu RST')
  }
}

const handleSubmit = async () => {
  try {
    const payload = {
      po_id: Number(form.po_id),
      source_inventory_id: Number(form.source_inventory_id),
      input_qty: Number(form.input_qty),
      output_item_id: Number(form.output_item_id),
      output_qty: Number(form.output_qty),
    }

    await apiClient.post('/produksi/pembahanan', payload)

    showSuccess('Sukses', 'Proses pembahanan berhasil disimpan, lanjut ke Produksi Moulding.')
    router.push({ name: 'ProduksiMoulding' })
  } catch (error) {
    const msg = error.response?.data?.message || 'Gagal menyimpan proses pembahanan'
    showError('Gagal', msg)
    console.error(error)
  }
}

onMounted(() => {
  fetchPoOnProgress()
  fetchSourceInventories()
  fetchOutputItems()
})
</script>

<style scoped>
/* ========================================
   PAGE HEADER - ROUGH MILL THEME
   ======================================== */
.page-header-roughmill {
  background: linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%);
  padding: 2rem 2.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(5, 150, 105, 0.35);
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

.icon-badge-roughmill {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.roughmill-icon {
  font-size: 2.5rem;
}

.header-text-content {
  flex: 1;
}

.page-title-roughmill {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.page-subtitle-roughmill {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
  line-height: 1.5;
}

.header-process-flow {
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

.flow-icon {
  font-size: 1.5rem;
}

.flow-arrow {
  font-size: 1.25rem;
  color: #059669;
  font-weight: 700;
}

.flow-label {
  font-weight: 700;
  color: #065f46;
}

/* ========================================
   CONTENT CARD
   ======================================== */
.content-card-roughmill {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f2f5;
  overflow: hidden;
}

.card-body-roughmill {
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
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-radius: 14px;
  border-left: 5px solid #059669;
}

.section-icon-badge {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
}

.section-icon-badge.po-badge {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}

.section-icon-badge.candy-badge {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
}

.section-icon-badge.output-badge {
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
}

.section-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* ========================================
   PO INFO CARD – MIRIP SAWMILL
   ======================================== */
.po-info-card-modern {
  margin-top: 1.25rem;
  border-radius: 18px;
  border: 2px solid #f59e0b;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  padding: 1.25rem 1.5rem 1.5rem;
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.25);
}

.po-row {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr) auto;
  align-items: center;
  column-gap: 2rem;
}

.po-main-block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.po-main-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.po-main-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(245, 158, 11, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.po-main-text {
  flex: 1;
}

.po-number {
  font-weight: 800;
  font-size: 1.05rem;
  color: #92400e;
}

.po-sub {
  font-size: 0.85rem;
  color: #78350f;
}

.po-main-buyer {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.po-info-label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #92400e;
  font-weight: 700;
}

.po-info-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}

/* kolom tengah & kanan */
.po-middle-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  justify-self: stretch;
}

.po-status-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35rem;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.85);
  color: #92400e;
}

/* ========================================
   RINGKASAN KEBUTUHAN PO (TABEL)
   ======================================== */
.po-hint-box {
  margin-top: 1.5rem;
  border-radius: 16px;
  border: 1px solid #facc15;
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
  max-height: 220px;
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
  width: 90px;
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
   FORM GRID & FIELDS
   ======================================== */
.form-grid-2col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.75rem;
}

.form-label-modern {
  display: block;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.75rem;
}

.required-star {
  color: #ef4444;
}

.input-wrapper-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1.125rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.125rem;
  z-index: 1;
}

.input-suffix {
  position: absolute;
  right: 1.125rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.875rem;
  font-weight: 700;
  color: #6b7280;
}

.form-input-modern,
.form-select-modern {
  width: 100%;
  padding: 1rem 1.25rem 1rem 3.25rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background: white;
}

.form-select-modern {
  padding-right: 3.25rem;
  appearance: none;
}

.form-input-modern:focus,
.form-select-modern:focus {
  outline: none;
  border-color: #059669;
  box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.15);
  transform: translateY(-1px);
}

.select-wrapper-modern {
  position: relative;
}

.select-icon {
  position: absolute;
  left: 1.125rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.125rem;
  z-index: 1;
}

.select-arrow {
  position: absolute;
  right: 1.125rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  color: #6b7280;
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

.btn-submit-modern {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media (max-width: 1024px) {
  .po-row {
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    row-gap: 1rem;
  }

  .po-status-block {
    grid-column: 1 / -1;
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .form-grid-2col {
    grid-template-columns: 1fr;
  }

  .po-row {
    grid-template-columns: 1fr;
  }

  .po-status-block {
    align-items: flex-start;
  }

  .form-actions-modern {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }

  .page-header-roughmill {
    padding: 1.5rem;
  }

  .card-body-roughmill {
    padding: 1.5rem;
  }
}
</style>
