<template>
  <DashboardLayout>
    <!-- ========================================
         PAGE HEADER - GRADIENT KILN
         ======================================== -->
    <div class="page-header-candy">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-candy">
            <span class="candy-icon">🔥</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-candy">Produksi Oven / Candy</h1>
            <p class="page-subtitle-candy">
              Pindahkan stok RST basah dari Gudang Sawmill ke Gudang Candy (kering) dengan tracking
              yang rapi.
            </p>
          </div>
        </div>

        <div class="header-right-section">
          <div class="process-flow-badge">
            <span class="flow-icon">💧</span>
            <span class="flow-arrow">→</span>
            <span class="flow-icon">🔥</span>
            <span class="flow-arrow">→</span>
            <span class="flow-icon">📦</span>
          </div>
          <div class="flow-label">Basah → Oven → Kering</div>
        </div>
      </div>
    </div>

    <!-- ========================================
         FORM CARD
         ======================================== -->
    <div class="content-card-candy">
      <div class="card-body-candy">
        <form @submit.prevent="handleSubmit">
          <!-- INFO UMUM -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge">
                <span class="section-icon">📅</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Informasi Umum</h3>
                <p class="section-subtitle">Tanggal dan catatan proses oven / kiln</p>
              </div>
            </div>

            <div class="form-grid-2col">
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Tanggal Proses <span class="required-star">*</span>
                </label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">📅</span>
                  <input v-model="form.date" type="date" class="form-input-modern" required />
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
                    placeholder="Contoh: Oven batch #1, Kiln A"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- SUMBER STOK (GUDANG SAWMILL) -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge log-badge">
                <span class="section-icon">📦</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Sumber Stok (Gudang Sawmill)</h3>
                <p class="section-subtitle">
                  Pilih stok RST basah berdasarkan item, qty, dan referensi PO.
                </p>
              </div>
            </div>

            <div class="form-group-modern">
              <label class="form-label-modern">
                Pilih Stok RST Basah <span class="required-star">*</span>
              </label>
              <div class="select-wrapper-modern">
                <span class="select-icon">📦</span>
                <select v-model="form.source_inventory_id" class="form-select-modern" required>
                  <option value="">-- Pilih Stok di Gudang Sawmill --</option>
                  <option v-for="inv in sanwilInventories" :key="inv.id" :value="inv.id">
                    {{ inv.item.code }} - {{ inv.item.name }} ({{ inv.qty }} pcs) • PO:
                    {{ inv.ref_po_id || '-' }}
                  </option>
                </select>
                <span class="select-arrow">▼</span>
              </div>
              <p v-if="selectedInventory" class="helper-inline">
                Gudang: {{ selectedInventory.warehouse?.name || 'Gudang Sawmill' }} • Produk:
                {{ selectedInventory.item?.name }}
              </p>
            </div>

            <div v-if="selectedInventory" class="form-grid-2col">
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Qty yang Dioven (pcs) <span class="required-star">*</span>
                </label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">🔢</span>
                  <input
                    v-model.number="form.qty"
                    type="number"
                    min="1"
                    :max="selectedInventory.qty"
                    step="1"
                    class="form-input-modern"
                    placeholder="Jumlah pcs yang masuk oven"
                    required
                  />
                  <span class="input-suffix">pcs</span>
                </div>
                <p class="help-text">
                  Stok tersedia: <strong>{{ selectedInventory.qty }}</strong> pcs
                </p>
              </div>

              <!-- TARGET ITEM KERING -->
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Jadikan Barang Kering <span class="required-star">*</span>
                </label>
                <div class="select-wrapper-modern">
                  <span class="select-icon">🎯</span>
                  <select v-model="form.target_item_id" class="form-select-modern" required>
                    <option value="">-- Pilih Item RST Kering --</option>
                    <option v-for="item in dryItems" :key="item.id" :value="item.id">
                      {{ item.code }} - {{ item.name }}
                    </option>
                  </select>
                  <span class="select-arrow">▼</span>
                </div>
                <p v-if="form.target_item_id" class="help-text">
                  Item tujuan akan menerima stok kering di Gudang Candy.
                </p>
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
              <span class="btn-text">Simpan Proses Candy</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'

const router = useRouter()
const { showSuccess, showError } = useNotification()

const form = reactive({
  date: new Date().toISOString().slice(0, 10),
  notes: '',
  source_inventory_id: '',
  target_item_id: '',
  qty: null,
})

const warehouses = ref([])
const sanwilInventories = ref([])
const dryItems = ref([])

const selectedInventory = computed(
  () => sanwilInventories.value.find((inv) => inv.id === form.source_inventory_id) || null,
)

const getWarehouseIdByName = (name) => {
  const wh = warehouses.value.find((w) => w.name === name)
  return wh ? wh.id : null
}

const fetchData = async () => {
  try {
    const whRes = await apiClient.get('/warehouses')
    warehouses.value = whRes.data.data || whRes.data || []

    const sanwilId = getWarehouseIdByName('Gudang Sanwil (RST Basah)')
    if (!sanwilId) {
      showError('Konfigurasi', 'Gudang Sawmill tidak ditemukan di master')
      console.log('WAREHOUSES', warehouses.value)
      return
    }

    const invRes = await apiClient.get('/inventories', {
      params: {
        warehouse_id: sanwilId,
        per_page: 200,
      },
    })

    const raw = invRes.data.data?.data || invRes.data.data || []

    sanwilInventories.value = raw.map((inv) => ({
      id: inv.id,
      warehouse_id: inv.warehouse_id,
      item_id: inv.item_id,
      qty: Number(inv.qty),
      ref_po_id: inv.ref_po_id,
      ref_product_id: inv.ref_product_id,
      item: inv.item,
      warehouse: inv.warehouse,
    }))

    const dryRes = await apiClient.get('/materials', {
      params: { category_name: 'Kayu RST', per_page: 200 },
    })
    dryItems.value = dryRes.data.data?.data || dryRes.data.data || []

    console.log('WAREHOUSES', warehouses.value)
    console.log('SANWIL INVENTORIES', sanwilInventories.value)
    console.log('DRY ITEMS', dryItems.value)
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil data gudang / inventory Sawmill / item kering')
  }
}

const handleSubmit = async () => {
  try {
    if (!selectedInventory.value) {
      showError('Validasi', 'Stok sumber wajib dipilih')
      return
    }
    if (!form.target_item_id) {
      showError('Validasi', 'Barang kering tujuan wajib dipilih')
      return
    }
    if (!form.qty || form.qty <= 0) {
      showError('Validasi', 'Qty pcs wajib lebih dari 0')
      return
    }
    if (form.qty > selectedInventory.value.qty) {
      showError('Validasi', 'Qty pcs melebihi stok di Gudang Sawmill')
      return
    }

    const payload = {
      date: form.date,
      notes: form.notes || null,
      source_inventory_id: form.source_inventory_id,
      target_item_id: form.target_item_id,
      qty: form.qty,
    }

    await apiClient.post('/candy-productions', payload)

    showSuccess('Sukses', 'Proses Candy berhasil dicatat')

    form.source_inventory_id = ''
    form.target_item_id = ''
    form.qty = null
    await fetchData()
  } catch (error) {
    console.error(error)
    const msg =
      error.response?.data?.message ||
      (error.response?.data?.errors && JSON.stringify(error.response.data.errors)) ||
      'Gagal mencatat proses Candy'
    showError('Gagal', msg)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* ========================================
   PAGE HEADER - KILN GRADIENT
   ======================================== */
.page-header-candy {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #b91c1c 100%);
  padding: 2rem 2.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(248, 113, 113, 0.35);
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

.icon-badge-candy {
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

.candy-icon {
  font-size: 2.5rem;
}

.header-text-content {
  flex: 1;
}

.page-title-candy {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.page-subtitle-candy {
  color: rgba(255, 255, 255, 0.95);
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
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.flow-icon {
  font-size: 1.25rem;
}

.flow-arrow {
  font-size: 1rem;
  color: #b91c1c;
  font-weight: 700;
}

.flow-label {
  color: #fef2f2;
  font-size: 0.875rem;
  font-weight: 600;
}

/* ========================================
   CONTENT CARD
   ======================================== */
.content-card-candy {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f2f5;
  overflow: hidden;
}

.card-body-candy {
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
  background: linear-gradient(135deg, #f9fafb, #fef2f2);
  border-radius: 14px;
  border-left: 5px solid #f97316;
}

.section-icon-badge {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(248, 113, 113, 0.3);
}

.section-icon-badge.log-badge {
  background: linear-gradient(135deg, #e0f2fe, #bfdbfe);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
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
  border-color: #f97316;
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.15);
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

/* SELECT WITH ICON */
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
  border-color: #f97316;
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.15);
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
   HELPER TEXT
   ======================================== */
.help-text {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.helper-inline {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: #4b5563;
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
  background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #b91c1c 100%);
  color: white;
}

.btn-submit-modern:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(248, 113, 113, 0.4);
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media (max-width: 768px) {
  .page-header-candy {
    padding: 1.5rem;
  }

  .header-content-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-body-candy {
    padding: 1.5rem;
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
