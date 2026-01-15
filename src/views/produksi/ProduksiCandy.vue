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

          <!-- ✅ SUMBER STOK (GUDANG SAWMILL) - MULTIPLE ITEMS -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge log-badge">
                <span class="section-icon">📦</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Sumber Stok (Gudang Sawmill)</h3>
                <p class="section-subtitle">
                  Pilih stok RST basah berdasarkan item dan qty total tersedia.
                </p>
              </div>

              <!-- ✅ TOMBOL TAMBAH ITEM -->
              <button type="button" @click="addItem" class="btn-add-item">
                <span class="add-icon">➕</span> Tambah Item
              </button>
            </div>

            <!-- ✅ LOOP UNTUK SETIAP ITEM -->
            <div v-for="(item, index) in form.items" :key="index" class="item-row-wrapper">
              <!-- Header Row dengan Nomor dan Tombol Hapus -->
              <div class="item-row-header">
                <h4 class="item-number">📦 Item #{{ index + 1 }}</h4>
                <button
                  v-if="form.items.length > 1"
                  type="button"
                  @click="removeItem(index)"
                  class="btn-remove-item"
                >
                  🗑️ Hapus
                </button>
              </div>

              <!-- ✅ PILIH STOK RST BASAH -->
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Pilih Stok RST Basah <span class="required-star">*</span>
                </label>
                <div class="select-wrapper-modern">
                  <span class="select-icon">📦</span>
                  <select
                    v-model="item.item_id"
                    @change="item.warehouse_id = getWarehouseIdByName('Gudang Sanwil (RST Basah)')"
                    class="form-select-modern"
                    required
                  >
                    <option value="">-- Pilih Stok di Gudang Sawmill --</option>
                    <option
                      v-for="inv in sanwilInventories"
                      :key="`wh${inv.warehouse_id}_item${inv.item_id}`"
                      :value="inv.item_id"
                    >
                      {{ inv.item?.code || 'N/A' }} - {{ inv.item?.name || 'N/A' }} ({{
                        inv.qty
                      }}
                      pcs)
                    </option>
                  </select>
                  <span class="select-arrow">▼</span>
                </div>

                <p v-if="getSelectedInventory(index)" class="helper-inline">
                  Gudang: {{ getSelectedInventory(index).warehouse?.name || 'Gudang Sawmill' }} •
                  Produk: {{ getSelectedInventory(index).item?.name }} • Total Stok:
                  <strong>{{ getSelectedInventory(index).qty }} pcs</strong>
                </p>
              </div>

              <!-- Qty dan Target Item (2 kolom) -->
              <div v-if="getSelectedInventory(index)" class="form-grid-2col">
                <!-- Qty yang Dioven -->
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    Qty yang Dioven (pcs) <span class="required-star">*</span>
                  </label>
                  <div class="input-wrapper-icon">
                    <span class="input-icon">🔢</span>
                    <input
                      v-model.number="item.qty"
                      type="number"
                      min="1"
                      :max="getSelectedInventory(index).qty"
                      step="1"
                      class="form-input-modern"
                      placeholder="Jumlah pcs"
                      required
                    />
                    <span class="input-suffix">pcs</span>
                  </div>
                  <p class="help-text">
                    Stok tersedia: <strong>{{ getSelectedInventory(index).qty }}</strong> pcs
                  </p>
                </div>

                <!-- Target Item Kering -->
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    Jadikan Barang Kering <span class="required-star">*</span>
                  </label>
                  <div class="select-wrapper-modern">
                    <span class="select-icon">🎯</span>
                    <select v-model="item.target_item_id" class="form-select-modern" required>
                      <option value="">-- Pilih Item RST Kering --</option>
                      <option v-for="dryItem in dryItems" :key="dryItem.id" :value="dryItem.id">
                        {{ dryItem.code }} - {{ dryItem.name }}
                      </option>
                    </select>
                    <span class="select-arrow">▼</span>
                  </div>
                  <p v-if="item.target_item_id" class="help-text">
                    Item tujuan akan menerima stok kering di Gudang Candy.
                  </p>
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
              <span class="btn-text">Simpan Proses Candy</span>
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
  items: [
    {
      item_id: '',
      warehouse_id: '',
      target_item_id: '',
      qty: null,
    },
  ],
})

const warehouses = ref([])
const sanwilInventories = ref([])
const dryItems = ref([])

const getSelectedInventory = (index) => {
  const item = form.items[index]
  return (
    sanwilInventories.value.find(
      (inv) => inv.item_id === item.item_id && inv.warehouse_id === item.warehouse_id,
    ) || null
  )
}

const getWarehouseIdByName = (name) => {
  const wh = warehouses.value.find((w) => w.name === name)
  return wh ? wh.id : null
}

const addItem = () => {
  const sanwilId = getWarehouseIdByName('Gudang Sanwil (RST Basah)')
  form.items.push({
    item_id: '',
    warehouse_id: sanwilId || '',
    target_item_id: '',
    qty: null,
  })
  showSuccess('Berhasil', 'Item baru ditambahkan')
}

const removeItem = (index) => {
  if (form.items.length > 1) {
    form.items.splice(index, 1)
    showSuccess('Berhasil', `Item #${index + 1} dihapus`)
  } else {
    showError('Validasi', 'Minimal harus ada 1 item')
  }
}

const fetchData = async () => {
  try {
    const whRes = await apiClient.get('/warehouses')
    warehouses.value = whRes.data.data || whRes.data || []

    const sanwilId = getWarehouseIdByName('Gudang Sanwil (RST Basah)')
    if (!sanwilId) {
      showError('Konfigurasi', 'Gudang Sawmill tidak ditemukan di master')
      console.log('❌ WAREHOUSES:', warehouses.value)
      return
    }

    console.log('✅ Gudang Sanwil ID:', sanwilId)

    const invRes = await apiClient.get('/inventories', {
      params: {
        warehouse_id: sanwilId,
        per_page: 9999,
      },
    })

    const raw = invRes.data.data?.data || invRes.data.data || []

    console.log('📦 RAW INVENTORIES dari API:', raw)
    console.log('📦 Total baris inventory:', raw.length)

    // ✅ GROUP BY item_id + warehouse_id dan SUM qty
    const groupedMap = {}

    raw.forEach((inv) => {
      const key = `${inv.warehouse_id}_${inv.item_id}`

      if (!groupedMap[key]) {
        groupedMap[key] = {
          warehouse_id: inv.warehouse_id,
          item_id: inv.item_id,
          qty: 0,
          item: inv.item,
          warehouse: inv.warehouse,
          inventory_ids: [],
        }
      }

      // Sum qty
      groupedMap[key].qty += Number(inv.qty || 0)
      groupedMap[key].inventory_ids.push(inv.id)

      console.log(
        `➕ Menambahkan ${inv.qty} pcs ke item_id ${inv.item_id}, total sekarang: ${groupedMap[key].qty}`,
      )
    })

    sanwilInventories.value = Object.values(groupedMap)

    console.log('✅ SANWIL INVENTORIES (GROUPED):', sanwilInventories.value)
    console.log('✅ Total item setelah grouping:', sanwilInventories.value.length)

    // Set default warehouse_id untuk item pertama
    if (form.items.length > 0 && !form.items[0].warehouse_id) {
      form.items[0].warehouse_id = sanwilId
    }

    const dryRes = await apiClient.get('/materials', {
      params: { category_name: 'Kayu RST', per_page: 200 },
    })
    dryItems.value = dryRes.data.data?.data || dryRes.data.data || []

    console.log('✅ DRY ITEMS:', dryItems.value.length, 'items')
  } catch (error) {
    console.error('❌ ERROR fetchData:', error)
    showError('Gagal', 'Gagal mengambil data gudang / inventory')
  }
}

const handleSubmit = async () => {
  try {
    // Validasi setiap item
    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i]
      const selectedInv = getSelectedInventory(i)

      if (!item.item_id) {
        showError('Validasi', `Item #${i + 1}: Stok sumber wajib dipilih`)
        return
      }
      if (!item.target_item_id) {
        showError('Validasi', `Item #${i + 1}: Barang kering tujuan wajib dipilih`)
        return
      }
      if (!item.qty || item.qty <= 0) {
        showError('Validasi', `Item #${i + 1}: Qty wajib lebih dari 0`)
        return
      }
      if (selectedInv && item.qty > selectedInv.qty) {
        showError(
          'Validasi',
          `Item #${i + 1}: Qty (${item.qty} pcs) melebihi stok tersedia (${selectedInv.qty} pcs)`,
        )
        return
      }
    }

    const payload = {
      date: form.date,
      notes: form.notes || null,
      items: form.items.map((item) => ({
        warehouse_id: item.warehouse_id,
        item_id: item.item_id,
        target_item_id: item.target_item_id,
        qty: item.qty,
      })),
    }

    console.log('📤 PAYLOAD YANG DIKIRIM:', payload)

    const response = await apiClient.post('/candy-productions', payload)

    console.log('✅ RESPONSE DARI SERVER:', response.data)

    showSuccess('Sukses', `Proses Candy berhasil dicatat untuk ${form.items.length} item.`)
    router.push({ name: 'ProduksiPembahanan' })
  } catch (error) {
    console.error('❌ ERROR SUBMIT:', error)
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
   EXISTING STYLES (TETAP SAMA)
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

.help-text {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.helper-inline {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: #4b5563;
  font-weight: 600;
}

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
   ✅ NEW STYLES FOR MULTIPLE ITEMS
   ======================================== */

/* Tombol Tambah Item */
.btn-add-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9375rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  margin-left: auto;
}

.btn-add-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.add-icon {
  font-size: 1.125rem;
}

/* Item Row Wrapper */
.item-row-wrapper {
  margin-bottom: 2rem;
  padding: 1.75rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff, #fafafa);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.item-row-wrapper:hover {
  border-color: #f97316;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.15);
}

.item-row-wrapper:last-child {
  margin-bottom: 0;
}

/* Item Row Header */
.item-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px dashed #e5e7eb;
}

.item-number {
  margin: 0;
  color: #111827;
  font-weight: 700;
  font-size: 1.125rem;
  letter-spacing: -0.25px;
}

/* Tombol Hapus Item */
.btn-remove-item {
  background: linear-gradient(135deg, #ff4444, #cc0000);
  color: white;
  border: none;
  padding: 0.625rem 1.125rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 68, 68, 0.3);
}

.btn-remove-item:hover {
  background: linear-gradient(135deg, #cc0000, #990000);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 68, 68, 0.5);
}

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

  .btn-add-item {
    width: 100%;
    justify-content: center;
    margin-left: 0;
    margin-top: 1rem;
  }

  .item-row-wrapper {
    padding: 1.25rem;
  }

  .item-row-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .btn-remove-item {
    width: 100%;
  }
}
</style>
