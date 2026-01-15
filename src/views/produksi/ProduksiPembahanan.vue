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

          <!-- ✅ BLOK 2: MULTIPLE ITEMS INPUT/OUTPUT -->
          <div class="form-section-modern">
            <div class="section-header section-header-items">
              <div class="section-icon-badge candy-badge">
                <span class="section-icon">📦</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Daftar Item Pembahanan</h3>
                <p class="section-subtitle">Input dan output stok pembahanan</p>
              </div>

              <!-- ✅ TOMBOL TAMBAH ITEM -->
              <button type="button" @click="addItem" class="btn-add-item">
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

              <!-- SUMBER STOK GUDANG CANDY -->
              <div class="sub-section-candy">
                <div class="sub-section-title">
                  <span class="sub-icon">🔥</span>
                  <span>Sumber Stok Gudang Candy</span>
                </div>

                <div class="form-grid-2col">
                  <div class="form-group-modern">
                    <label class="form-label-modern">
                      Sumber Inventory <span class="required-star">*</span>
                    </label>
                    <div class="select-wrapper-modern">
                      <span class="select-icon">📦</span>
                      <select
                        v-model="item.item_id"
                        @change="item.warehouse_id = getWarehouseIdByName('Gudang Candy')"
                        class="form-select-modern"
                        required
                      >
                        <option value="">-- Pilih Stok Gudang Candy --</option>
                        <option
                          v-for="inv in candyInventories"
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
                      Produk: {{ getSelectedInventory(index).item?.name }} • Total Stok:
                      <strong>{{ getSelectedInventory(index).qty }} pcs</strong>
                    </p>
                  </div>

                  <div class="form-group-modern">
                    <label class="form-label-modern">
                      Qty Input Pembahanan <span class="required-star">*</span>
                    </label>
                    <div class="input-wrapper-icon">
                      <span class="input-icon">🔢</span>
                      <input
                        v-model.number="item.input_qty"
                        type="number"
                        min="1"
                        :max="getSelectedInventory(index)?.qty || 9999"
                        class="form-input-modern"
                        placeholder="Jumlah pcs"
                        required
                      />
                      <span class="input-suffix">pcs</span>
                    </div>
                    <p v-if="getSelectedInventory(index)" class="help-text">
                      Stok tersedia: <strong>{{ getSelectedInventory(index).qty }}</strong> pcs
                    </p>
                  </div>
                </div>
              </div>

              <!-- HASIL OUTPUT RST KERING -->
              <div class="sub-section-output">
                <div class="sub-section-title">
                  <span class="sub-icon">✅</span>
                  <span>Hasil Output RST Kering</span>
                </div>

                <div class="form-grid-2col">
                  <div class="form-group-modern">
                    <label class="form-label-modern">
                      Item RST Hasil <span class="required-star">*</span>
                    </label>
                    <div class="select-wrapper-modern">
                      <span class="select-icon">📦</span>
                      <select v-model="item.output_item_id" class="form-select-modern" required>
                        <option value="">-- Pilih Item RST Kering --</option>
                        <option
                          v-for="outItem in outputItems"
                          :key="outItem.id"
                          :value="outItem.id"
                        >
                          {{ outItem.code }} - {{ outItem.name }}
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
                        v-model.number="item.output_qty"
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'

const router = useRouter()
const route = useRoute()
const { showSuccess, showError } = useNotification()

// ✅ FORM DENGAN MULTIPLE ITEMS
const form = reactive({
  po_id: '',
  items: [
    {
      warehouse_id: '',
      item_id: '',
      input_qty: null,
      output_item_id: '',
      output_qty: null,
    },
  ],
})

const productionOrders = ref([])
const candyInventories = ref([])
const outputItems = ref([])
const warehouses = ref([])

const poTargets = ref([])
const poInfo = ref({
  buyer_name: null,
  so_number: null,
})

// ✅ FUNCTION: Tambah item baru
const addItem = () => {
  form.items.push({
    warehouse_id: '',
    item_id: '',
    input_qty: null,
    output_item_id: '',
    output_qty: null,
  })
}

// ✅ FUNCTION: Hapus item
const removeItem = (index) => {
  form.items.splice(index, 1)
}

// ✅ FUNCTION: Get warehouse_id by name
const getWarehouseIdByName = (name) => {
  const wh = warehouses.value.find((w) => w.name.toLowerCase().includes(name.toLowerCase()))
  return wh ? wh.id : null
}

// ✅ FUNCTION: Get selected inventory for specific item index
const getSelectedInventory = (index) => {
  const item = form.items[index]
  return (
    candyInventories.value.find(
      (inv) => inv.item_id === item.item_id && inv.warehouse_id === item.warehouse_id,
    ) || null
  )
}

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

const fetchCandyInventories = async () => {
  try {
    // 1. Fetch warehouses
    const whRes = await apiClient.get('/warehouses')
    warehouses.value = whRes.data.data || whRes.data || []

    const candyId = getWarehouseIdByName('Gudang Candy')
    if (!candyId) {
      showError('Konfigurasi', 'Gudang Candy tidak ditemukan di master')
      return
    }

    // 2. Fetch inventories dari Gudang Candy
    const invRes = await apiClient.get('/inventories', {
      params: {
        warehouse_id: candyId,
        per_page: 9999,
      },
    })

    const raw = invRes.data.data?.data || invRes.data.data || []

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
        }
      }

      groupedMap[key].qty += Number(inv.qty || 0)
    })

    candyInventories.value = Object.values(groupedMap)

    // Set default warehouse_id untuk item pertama
    if (form.items.length > 0 && !form.items[0].warehouse_id) {
      form.items[0].warehouse_id = candyId
    }
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
    // ✅ VALIDASI
    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i]

      if (!item.item_id) {
        showError('Validasi', `Item #${i + 1}: Sumber stok wajib dipilih`)
        return
      }

      const selectedInv = getSelectedInventory(i)
      if (!selectedInv) {
        showError('Validasi', `Item #${i + 1}: Data inventory tidak ditemukan`)
        return
      }

      if (item.input_qty > selectedInv.qty) {
        showError(
          'Validasi',
          `Item #${i + 1}: Qty input (${item.input_qty} pcs) melebihi stok tersedia (${selectedInv.qty} pcs)`,
        )
        return
      }
    }

    // ✅ PAYLOAD BARU (MULTIPLE ITEMS)
    const payload = {
      po_id: Number(form.po_id),
      items: form.items.map((item) => ({
        warehouse_id: item.warehouse_id,
        item_id: item.item_id,
        input_qty: Number(item.input_qty),
        output_item_id: Number(item.output_item_id),
        output_qty: Number(item.output_qty),
      })),
    }

    console.log('📤 PAYLOAD PEMBAHANAN:', payload)

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
  fetchCandyInventories()
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
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
}

.section-icon-badge.po-badge {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}

.section-icon-badge.candy-badge {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
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
  background: linear-gradient(135deg, #059669, #047857);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
}

.btn-add-item:hover {
  background: linear-gradient(135deg, #047857, #065f46);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(5, 150, 105, 0.35);
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
  background: linear-gradient(135deg, #059669, #047857);
  color: white;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
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
.sub-section-candy,
.sub-section-output {
  margin-bottom: 1.75rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.sub-section-candy {
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

.helper-inline,
.help-text {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.helper-inline strong,
.help-text strong {
  color: #059669;
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
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
}

.btn-submit-modern:hover {
  background: linear-gradient(135deg, #047857 0%, #065f46 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(5, 150, 105, 0.35);
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media (max-width: 768px) {
  .form-grid-2col {
    grid-template-columns: 1fr;
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

  .item-row-wrapper {
    padding: 1.25rem;
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
}
</style>
