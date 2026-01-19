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
              <div class="select-wrapper-modern box-auto">
                <span class="select-icon">📄</span>
                <v-select
                  v-model="form.po_id"
                  :options="productionOrders"
                  :reduce="(po) => po.id"
                  label="label"
                  placeholder="-- Pilih PO On Progress --"
                  class="form-select-modern-search"
                  @option:selected="handlePoChange"
                >
                  <template #no-options="{ search, searching }">
                    <template v-if="searching">
                      Tidak ada hasil untuk <em>{{ search }}</em
                      >.
                    </template>
                    <em v-else>Ketik untuk mencari PO...</em>
                  </template>
                </v-select>
              </div>
            </div>

            <!-- RINGKASAN PO -->
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

          <!-- ✅ 2. MULTIPLE ITEMS INPUT/OUTPUT -->
          <div class="form-section-modern">
            <div class="section-header section-header-items">
              <div class="section-icon-badge source-badge">
                <span class="section-icon">📦</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Daftar Item Moulding</h3>
                <p class="section-subtitle">Input dan output stok moulding untuk PO ini</p>
              </div>

              <!-- ✅ TOMBOL TAMBAH ITEM -->
              <button type="button" @click="addItem" class="btn-add-item" :disabled="!form.po_id">
                <span class="add-icon">➕</span>
                <span>Tambah Item</span>
              </button>
            </div>

            <!-- ✅ LOOP UNTUK SETIAP ITEM -->
            <div v-for="(item, index) in form.items" :key="index" class="item-row-wrapper">
              <!-- Header Row dengan Nomor dan Tombol Hapus -->
              <div class="item-row-header">
                <div class="item-number-badge">
                  <span class="item-icon">📦</span>
                  <span class="item-number">Item #{{ index + 1 }}</span>
                </div>
                <button
                  v-if="form.items.length > 1"
                  type="button"
                  @click="removeItem(index)"
                  class="btn-remove-item"
                >
                  <span>🗑️</span>
                  <span>Hapus</span>
                </button>
              </div>

              <!-- BARANG SUMBER (GUDANG PEMBAHANAN) -->
              <div class="sub-section-source">
                <div class="sub-section-title">
                  <span class="sub-icon">📦</span>
                  <span>Barang di Gudang Pembahanan</span>
                </div>

                <div class="form-group-modern">
                  <label class="form-label-modern">
                    Barang Sumber <span class="required-star">*</span>
                  </label>
                  <div class="select-wrapper-modern box-auto">
                    <span class="select-icon">📦</span>
                    <v-select
                      v-model="item.source_inventory_id"
                      :options="sourceInventories"
                      :reduce="(inv) => inv.id"
                      :get-option-label="
                        (inv) => `${inv.item_name} | Sisa Stok: ${Number(inv.available_qty)} pcs`
                      "
                      placeholder="-- Pilih Barang Gudang Pembahanan --"
                      class="form-select-modern-search"
                    >
                      <template #no-options="{ search, searching }">
                        <template v-if="searching">
                          Tidak ada hasil untuk <em>{{ search }}</em
                          >.
                        </template>
                        <em v-else>Ketik untuk mencari barang...</em>
                      </template>
                    </v-select>
                  </div>

                  <div v-if="getSelectedSource(index)" class="info-text-highlight">
                    Maksimal bisa dipindah:
                    <strong>{{ Number(getSelectedSource(index).available_qty) }}</strong> pcs
                  </div>
                </div>
              </div>

              <!-- QTY INPUT & OUTPUT -->
              <div class="sub-section-output">
                <div class="sub-section-title">
                  <span class="sub-icon">🔢</span>
                  <span>Qty & Item Hasil</span>
                </div>

                <div class="form-grid-2col">
                  <div class="form-group-modern">
                    <label class="form-label-modern">
                      Qty Input (pcs) <span class="required-star">*</span>
                    </label>
                    <div class="input-wrapper-icon">
                      <span class="input-icon">🔢</span>
                      <input
                        v-model.number="item.input_qty"
                        type="number"
                        min="1"
                        :max="getSelectedSource(index)?.available_qty || 9999"
                        class="form-input-modern"
                        placeholder="Jumlah pcs yang dipindah"
                        required
                      />
                      <span class="input-suffix">pcs</span>
                    </div>
                    <p v-if="getSelectedSource(index)" class="help-text">
                      Stok tersedia:
                      <strong>{{ getSelectedSource(index).available_qty }}</strong> pcs
                    </p>
                  </div>

                  <div class="form-group-modern">
                    <label class="form-label-modern">
                      Item Hasil Moulding <span class="required-star">*</span>
                    </label>
                    <div class="select-wrapper-modern box-auto">
                      <span class="select-icon">📦</span>
                      <v-select
                        v-model="item.output_item_id"
                        :options="outputItems"
                        :reduce="(out) => out.id"
                        :get-option-label="(opt) => `${opt.code} - ${opt.name}`"
                        placeholder="-- Pilih Item Hasil --"
                        class="form-select-modern-search"
                      >
                        <template #no-options="{ search, searching }">
                          <template v-if="searching">
                            Tidak ada hasil untuk <em>{{ search }}</em
                            >.
                          </template>
                          <em v-else>Ketik untuk mencari item...</em>
                        </template>
                      </v-select>
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
                      v-model.number="item.output_qty"
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
            </div>
          </div>

          <!-- AKSI FORM -->
          <div class="form-actions-modern">
            <button type="button" class="btn-action btn-cancel-modern" @click="router.back">
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'
import vSelect from 'vue-select'

const router = useRouter()
const { showSuccess, showError } = useNotification()

const productionOrders = ref([])
const sourceInventories = ref([])
const outputItems = ref([])

// ✅ FORM DENGAN MULTIPLE ITEMS
const form = reactive({
  po_id: '',
  items: [
    {
      source_inventory_id: '',
      input_qty: null,
      output_item_id: '',
      output_qty: null,
    },
  ],
})

// Data tambahan untuk ringkasan PO
const poTargets = ref([])
const poInfo = ref({
  buyer_name: null,
  so_number: null,
})

// ✅ FUNCTION: Tambah item baru
const addItem = () => {
  form.items.push({
    source_inventory_id: '',
    input_qty: null,
    output_item_id: '',
    output_qty: null,
  })
}

// ✅ FUNCTION: Hapus item
const removeItem = (index) => {
  form.items.splice(index, 1)
}

// ✅ FUNCTION: Get selected source untuk specific item index
const getSelectedSource = (index) => {
  const item = form.items[index]
  return sourceInventories.value.find((inv) => inv.id === Number(item.source_inventory_id)) || null
}

const fetchProductionOrders = async () => {
  try {
    const res = await apiClient.get('/production-orders', {
      params: { status: 'on_progress', per_page: 100 },
    })
    const raw = res.data.data?.data || res.data.data || []
    productionOrders.value = raw.map((p) => ({
      ...p,
      label: p.label || `${p.po_number} - ${p.buyer?.name || '-'}`,
    }))
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil daftar Production Order')
  }
}

const fetchSourceInventories = async () => {
  try {
    if (!form.po_id) {
      sourceInventories.value = []
      // Reset semua source_inventory_id di items
      form.items.forEach((item) => {
        item.source_inventory_id = ''
      })
      return
    }

    const res = await apiClient.get('/produksi/moulding/source-inventories', {
      params: { po_id: form.po_id },
    })

    sourceInventories.value = res.data.data || []

    // Reset semua source_inventory_id di items
    form.items.forEach((item) => {
      item.source_inventory_id = ''
    })
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil stok Gudang Pembahanan')
  }
}

const handlePoChange = async () => {
  poTargets.value = []
  poInfo.value = { buyer_name: null, so_number: null }

  if (!form.po_id) {
    await fetchSourceInventories()
    return
  }

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

  await fetchSourceInventories()
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
    // ✅ VALIDASI
    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i]

      if (!item.source_inventory_id) {
        showError('Validasi', `Item #${i + 1}: Barang sumber wajib dipilih`)
        return
      }

      const selectedSource = getSelectedSource(i)
      if (!selectedSource) {
        showError('Validasi', `Item #${i + 1}: Data inventory tidak ditemukan`)
        return
      }

      if (item.input_qty > selectedSource.available_qty) {
        showError(
          'Validasi',
          `Item #${i + 1}: Qty input (${item.input_qty} pcs) melebihi stok tersedia (${selectedSource.available_qty} pcs)`,
        )
        return
      }
    }

    // ✅ PAYLOAD BARU (MULTIPLE ITEMS)
    const payload = {
      po_id: Number(form.po_id),
      items: form.items.map((item) => ({
        source_inventory_id: Number(item.source_inventory_id),
        input_qty: Number(item.input_qty),
        output_item_id: Number(item.output_item_id),
        output_qty: Number(item.output_qty),
      })),
    }

    console.log('📤 PAYLOAD MOULDING:', payload)

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

.section-header-items {
  position: relative;
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
   TOMBOL TAMBAH ITEM
   ======================================== */
.btn-add-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #0ea5e9, #0369a1);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
}

.btn-add-item:hover:not(:disabled) {
  background: linear-gradient(135deg, #0369a1, #0f766e);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(14, 165, 233, 0.35);
}

.btn-add-item:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
}

.add-icon {
  font-size: 1.125rem;
}

/* ========================================
   ITEM ROW WRAPPER
   ======================================== */
.item-row-wrapper {
  margin-bottom: 2rem;
  padding: 1.75rem;
  background: linear-gradient(135deg, #fafafa, #f5f5f5);
  border-radius: 16px;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.item-row-wrapper:last-child {
  margin-bottom: 0;
}

.item-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.item-number-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1.25rem;
  background: linear-gradient(135deg, #0ea5e9, #0369a1);
  color: white;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
}

.item-icon {
  font-size: 1.25rem;
}

.item-number {
  font-weight: 800;
}

.btn-remove-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

.btn-remove-item:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.35);
}

/* ========================================
   SUB-SECTIONS
   ======================================== */
.sub-section-source,
.sub-section-output {
  margin-bottom: 1.75rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.sub-section-source {
  background: linear-gradient(135deg, #fef3c7, #fef9c3);
  border-color: #fde68a;
}

.sub-section-output {
  background: linear-gradient(135deg, #dbeafe, #e0f2fe);
  border-color: #bfdbfe;
}

.sub-section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
}

.sub-icon {
  font-size: 1.5rem;
}

/* ========================================
   PO HINT BOX
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

.help-text {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.help-text strong {
  color: #0ea5e9;
  font-weight: 700;
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
  background: linear-gradient(135deg, #0369a1 0%, #0f766e 100%);
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

  .form-actions-modern {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }

  .header-right-section {
    align-items: flex-start;
  }

  .section-header {
    flex-wrap: wrap;
  }

  .btn-add-item {
    width: 100%;
    justify-content: center;
  }

  .item-row-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .btn-remove-item {
    width: 100%;
    justify-content: center;
  }

  .item-row-wrapper {
    padding: 1.25rem;
  }
}

/* V-SELECT CUSTOMIZATION */
.form-select-modern-search {
  background: white;
  border-radius: 12px;
  box-sizing: border-box;
  width: 100%;
}
:deep(.form-select-modern-search .vs__dropdown-toggle) {
  border: 2.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.4rem 0.5rem 0.4rem 3.5rem;
  min-height: 54px;
  background: white;
}
:deep(.form-select-modern-search.vs--open .vs__dropdown-toggle) {
  border-color: #0ea5e9;
}
:deep(.form-select-modern-search .vs__search::placeholder) {
  color: #9ca3af;
}
:deep(.form-select-modern-search .vs__selected) {
  margin-top: 4px;
  padding-left: 0;
}
:deep(.form-select-modern-search .vs__dropdown-menu) {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  z-index: 999;
}
:deep(.form-select-modern-search .vs__dropdown-option) {
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
}
:deep(.form-select-modern-search .vs__dropdown-option--highlight) {
  background: #0ea5e9;
  color: white;
}

.select-icon {
  position: absolute;
  left: 1.125rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.125rem;
  z-index: 2;
  pointer-events: none;
}

.form-input-modern,
.form-select-modern {
  box-sizing: border-box;
}
</style>
