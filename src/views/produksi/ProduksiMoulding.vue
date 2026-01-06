<template>
  <DashboardLayout>
    <!-- ========================================
         PAGE HEADER - MOULDING THEME
         ======================================== -->
    <div class="page-header-moulding">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-moulding">
            <span class="moulding-icon">🪚</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-moulding">Produksi Moulding</h1>
            <p class="page-subtitle-moulding">
              Pindahkan stok milik PO dari Gudang Pembahanan ke Gudang Moulding dengan kontrol qty
              yang rapi.
            </p>
          </div>
        </div>
        <div class="header-right-section">
          <div class="process-flow-badge">
            <span class="flow-icon">📦</span>
            <span class="flow-arrow">→</span>
            <span class="flow-icon">🪚</span>
          </div>
          <div class="flow-label">Pembahanan → Moulding</div>
        </div>
      </div>
    </div>

    <!-- ========================================
         FORM CARD
         ======================================== -->
    <div class="content-card-moulding">
      <div class="card-body-moulding">
        <form @submit.prevent="handleSubmit">
          <!-- 1. PILIH PO -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge po-badge">
                <span class="section-icon">📄</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Pilih Production Order</h3>
                <p class="section-subtitle">PO akan menjadi filter stok di Gudang Pembahanan.</p>
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
                  @change="fetchSourceInventories"
                >
                  <option value="">-- Pilih PO On Progress --</option>
                  <option v-for="po in productionOrders" :key="po.id" :value="po.id">
                    {{ po.label }}
                  </option>
                </select>
                <span class="select-arrow">▼</span>
              </div>
            </div>

            <!-- PO INFO CARD – GAYA KUNING PERSIS SAWMILL -->
            <div v-if="selectedPo" class="po-info-card-simple">
              <div class="po-line po-number-line">
                <span class="po-main-icon">📋</span>
                <span class="po-number-text">{{ selectedPo.po_number }}</span>
              </div>
              <div class="po-line">
                <span class="po-label">Production Order aktif untuk proses moulding</span>
              </div>
              <div class="po-line">
                <span class="po-label">Buyer</span>
                <span class="po-value">{{ selectedPo.buyer_name || '-' }}</span>
              </div>
              <div class="po-line">
                <span class="po-label">Produk</span>
                <span class="po-value">{{ selectedPo.product_name || '-' }}</span>
              </div>
              <div class="po-line">
                <span class="po-label">Status</span>
                <span class="status-chip-simple">{{ selectedPo.status }}</span>
              </div>
            </div>
          </div>

          <!-- 2. PILIH BARANG SUMBER -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge source-badge">
                <span class="section-icon">📦</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Barang di Gudang Pembahanan</h3>
                <p class="section-subtitle">Hanya stok milik PO terpilih yang ditampilkan.</p>
              </div>
            </div>

            <div class="form-group-modern">
              <label class="form-label-modern">
                Barang Sumber <span class="required-star">*</span>
              </label>
              <div class="select-wrapper-modern">
                <span class="select-icon">📦</span>
                <select v-model="form.source_inventory_id" class="form-select-modern" required>
                  <option value="">-- Pilih Barang Gudang Pembahanan --</option>
                  <option v-for="inv in sourceInventories" :key="inv.id" :value="inv.id">
                    {{ inv.item_name }} | Sisa Stok: {{ Number(inv.available_qty) }} pcs
                  </option>
                </select>
                <span class="select-arrow">▼</span>
              </div>
            </div>

            <div v-if="selectedSource" class="info-text-highlight">
              Maksimal bisa dipindah:
              <strong>{{ Number(selectedSource.available_qty) }}</strong> pcs
            </div>
          </div>

          <!-- 3. INPUT & OUTPUT -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge qty-badge">
                <span class="section-icon">🔢</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Qty & Item Hasil</h3>
                <p class="section-subtitle">
                  Tentukan qty yang diambil dan item hasil di Gudang Moulding.
                </p>
              </div>
            </div>

            <div class="form-grid-2col">
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Qty Input (pcs) <span class="required-star">*</span>
                </label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">🔢</span>
                  <input
                    v-model.number="form.input_qty"
                    type="number"
                    min="1"
                    class="form-input-modern"
                    placeholder="Jumlah pcs yang dipindah"
                    required
                  />
                  <span class="input-suffix">pcs</span>
                </div>
                <p v-if="qtyError" class="error-text">
                  {{ qtyError }}
                </p>
              </div>

              <div class="form-group-modern">
                <label class="form-label-modern">
                  Item Hasil Moulding <span class="required-star">*</span>
                </label>
                <div class="select-wrapper-modern">
                  <span class="select-icon">📦</span>
                  <select v-model="form.output_item_id" class="form-select-modern" required>
                    <option value="">-- Pilih Item Hasil --</option>
                    <option v-for="item in outputItems" :key="item.id" :value="item.id">
                      {{ item.code }} - {{ item.name }}
                    </option>
                  </select>
                  <span class="select-arrow">▼</span>
                </div>
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
                  placeholder="Qty hasil moulding"
                  required
                />
                <span class="input-suffix">pcs</span>
              </div>
            </div>
          </div>

          <!-- AKSI FORM -->
          <div class="form-actions-modern">
            <button type="button" class="btn-action btn-cancel-modern" @click="router.back()">
              <span class="btn-icon">↩️</span>
              <span class="btn-text">Batal</span>
            </button>
            <button type="submit" class="btn-action btn-submit-modern">
              <span class="btn-icon">📦</span>
              <span class="btn-text">Proses Pindah ke Moulding</span>
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

const router = useRouter()
const { showSuccess, showError } = useNotification()

const productionOrders = ref([])
const sourceInventories = ref([])
const outputItems = ref([])

const form = reactive({
  po_id: '',
  source_inventory_id: '',
  input_qty: null,
  output_item_id: '',
  output_qty: null,
})

const qtyError = ref('')

const selectedPo = computed(() => productionOrders.value.find((po) => po.id === Number(form.po_id)))

const selectedSource = computed(() =>
  sourceInventories.value.find((inv) => inv.id === Number(form.source_inventory_id)),
)

const fetchProductionOrders = async () => {
  try {
    const res = await apiClient.get('/production-orders', {
      params: { status: 'on_progress', per_page: 100 },
    })
    const raw = res.data.data?.data || res.data.data || []
    productionOrders.value = raw
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil daftar Production Order')
  }
}

const fetchSourceInventories = async () => {
  try {
    if (!form.po_id) {
      sourceInventories.value = []
      form.source_inventory_id = ''
      return
    }

    const res = await apiClient.get('/produksi/moulding/source-inventories', {
      params: { po_id: form.po_id },
    })

    sourceInventories.value = res.data.data || []
    form.source_inventory_id = ''
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil stok Gudang Pembahanan')
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
    showError('Gagal', 'Gagal mengambil daftar item hasil Moulding')
  }
}

const handleSubmit = async () => {
  try {
    qtyError.value = ''

    if (selectedSource.value && form.input_qty > selectedSource.value.available_qty) {
      qtyError.value = 'Stok tidak cukup!'
      return
    }

    const payload = {
      po_id: Number(form.po_id),
      source_inventory_id: Number(form.source_inventory_id),
      input_qty: Number(form.input_qty),
      output_item_id: Number(form.output_item_id),
      output_qty: Number(form.output_qty),
    }

    await apiClient.post('/produksi/moulding', payload)

    showSuccess('Sukses', 'Stok berhasil dipindahkan ke Gudang Moulding, lanjut ke Produksi Mesin.')

    router.push({ name: 'ProduksiMesin' })
  } catch (error) {
    const msg = error.response?.data?.message || 'Gagal memproses pemindahan stok'
    showError('Gagal', msg)
    console.error(error)
  }
}

onMounted(() => {
  fetchProductionOrders()
  fetchOutputItems()
})
</script>

<style scoped>
/* ========================================
   PAGE HEADER - MOULDING GRADIENT
   ======================================== */
.page-header-moulding {
  background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 50%, #0f766e 100%);
  padding: 2rem 2.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(14, 165, 233, 0.35);
}

.header-content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

/* ========================================
   PO INFO CARD SIMPLE (SAMA SEPERTI GAMBAR)
   ======================================== */
.po-info-card-simple {
  margin-top: 1.25rem;
  border-radius: 18px;
  border: 2px solid #f59e0b;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  padding: 1.25rem 1.75rem 1.5rem;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.25);
  width: 100%;
}

.po-number-line {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 800;
  font-size: 1.05rem;
  color: #92400e;
  margin-bottom: 0.75rem;
}

.po-main-icon {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.po-number-text {
  font-weight: 800;
}

.po-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #111827;
  margin-bottom: 0.25rem;
}

.po-label {
  min-width: 70px;
  font-weight: 600;
  color: #92400e;
}

.po-value {
  font-weight: 600;
  color: #111827;
}

.status-chip-simple {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.85rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  background: #ffffff;
  color: #92400e;
  box-shadow: 0 2px 4px rgba(148, 163, 184, 0.45);
}

/* ========================================
   HEADER
   ======================================== */
.header-left-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.icon-badge-moulding {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.35);
}

.moulding-icon {
  font-size: 2.5rem;
}

.header-text-content {
  flex: 1;
}

.page-title-moulding {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.page-subtitle-moulding {
  color: rgba(241, 245, 249, 0.98);
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
  line-height: 1.5;
}

.header-right-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.process-flow-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 999px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.18);
}

.flow-icon {
  font-size: 1.25rem;
}

.flow-arrow {
  font-size: 1rem;
  color: #0284c7;
  font-weight: 700;
}

.flow-label {
  color: #e0f2fe;
  font-size: 0.875rem;
  font-weight: 600;
}

/* ========================================
   CONTENT CARD
   ======================================== */
.content-card-moulding {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.card-body-moulding {
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
  background: linear-gradient(135deg, #eff6ff, #ecfeff);
  border-radius: 14px;
  border-left: 5px solid #0ea5e9;
}

.section-icon-badge {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.section-icon-badge.po-badge {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
}

.section-icon-badge.source-badge {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  box-shadow: 0 4px 12px rgba(248, 113, 113, 0.28);
}

.section-icon-badge.qty-badge {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);
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
   PO INFO CARD (LAMA, MASIH BISA DIPAKAI DI HALAMAN LAIN)
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

.form-group-modern {
  margin-bottom: 0;
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
  margin-left: 0.15rem;
}

/* INPUT WITH ICON */
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

.input-suffix {
  position: absolute;
  right: 1.125rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #6b7280;
  pointer-events: none;
}

/* TEXT INPUT & SELECT */
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
  border-color: #0ea5e9;
  box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.15);
  transform: translateY(-1px);
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
  border-color: #0ea5e9;
  box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.15);
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
   INFO & ERROR TEXT
   ======================================== */
.info-text-highlight {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: #0369a1;
  background: #e0f2fe;
  border-radius: 10px;
  padding: 0.75rem 1rem;
}

.error-text {
  margin-top: 0.4rem;
  font-size: 0.8125rem;
  color: #b91c1c;
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
  min-width: 190px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
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
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.22);
}

.btn-submit-modern {
  background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 50%, #0f766e 100%);
  color: white;
}

.btn-submit-modern:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(14, 165, 233, 0.45);
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media (max-width: 768px) {
  .page-header-moulding {
    padding: 1.5rem;
  }

  .header-content-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-body-moulding {
    padding: 1.5rem;
  }

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

  .header-right-section {
    align-items: flex-start;
  }
}
</style>
