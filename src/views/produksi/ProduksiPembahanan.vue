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
                <select v-model="form.po_id" class="form-select-modern" required>
                  <option value="">-- Pilih PO On Progress --</option>
                  <option v-for="po in productionOrders" :key="po.id" :value="po.id">
                    {{ po.label }}
                  </option>
                </select>
                <span class="select-arrow">▼</span>
              </div>
            </div>

            <!-- PO INFO CARD -->
            <div v-if="selectedPo" class="po-info-card-modern">
              <div class="po-header">
                <span class="po-icon">📋</span>
                <h4 class="po-title">{{ selectedPo.po_number }}</h4>
              </div>
              <div class="po-details-grid">
                <div class="po-detail">
                  <span class="detail-label">Buyer</span>
                  <span class="detail-value">{{ selectedPo.buyer_name || '-' }}</span>
                </div>
                <div class="po-detail">
                  <span class="detail-label">Produk</span>
                  <span class="detail-value">{{ selectedPo.product_name || '-' }}</span>
                </div>
                <div class="po-detail">
                  <span class="detail-label">Status</span>
                  <span class="detail-value status-chip">
                    {{ selectedPo.status }}
                  </span>
                </div>
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
/* SCRIPT TETAP SAMA PERSIS - TIDAK DIUBAH */
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

const autoSelectPoFromSo = () => {
  const soId = Number(route.query.so_id)
  if (!soId || !productionOrders.value.length) return

  const po = productionOrders.value.find((p) => Number(p.sales_order_id) === soId)

  if (po) {
    form.po_id = po.id
  }
}

const fetchPoOnProgress = async () => {
  try {
    const res = await apiClient.get('/production-orders', {
      params: { status: 'on_progress', per_page: 100 },
    })
    const raw = res.data.data?.data || res.data.data || []
    productionOrders.value = raw
    autoSelectPoFromSo()
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil daftar Production Order')
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
    showSuccess('Sukses', 'Proses pembahanan berhasil disimpan')

    form.source_inventory_id = ''
    form.input_qty = null
    form.output_item_id = ''
    form.output_qty = null
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
   PAGE HEADER - ROUGH MILL GRADIENT
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
   PO INFO CARD
   ======================================== */
.po-info-card-modern {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.po-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.po-icon {
  font-size: 1.25rem;
  background: rgba(245, 158, 11, 0.2);
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.po-title {
  font-size: 1.125rem;
  font-weight: 800;
  color: #92400e;
  margin: 0;
}

.po-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.po-detail {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.8125rem;
  color: #92400e;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111827;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.875rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.7);
}

/* ========================================
   FORM GRID & ELEMENTS
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

.btn-cancel-modern {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #374151;
  border: 2.5px solid #d1d5db;
}

.btn-cancel-modern:hover {
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  transform: translateY(-2px);
}

.btn-submit-modern {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
}

.btn-submit-modern:hover {
  background: linear-gradient(135deg, #047857 0%, #065f46 100%);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(5, 150, 105, 0.4);
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media (max-width: 768px) {
  .form-grid-2col {
    grid-template-columns: 1fr;
  }

  .po-details-grid {
    grid-template-columns: 1fr;
  }

  .form-actions-modern {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }
}
</style>
