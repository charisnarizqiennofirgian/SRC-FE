<template>
  <DashboardLayout>
    <!-- ✅ HEADER SECTION -->
    <div class="page-header-form">
      <div class="header-content-form">
        <div class="header-left-form">
          <div class="icon-badge-form-so">
            <span class="form-icon-so">{{ isEditMode ? '✏️' : '📝' }}</span>
          </div>
          <div class="header-text-form">
            <h1 class="page-title-form">{{ pageTitle }}</h1>
            <p class="page-subtitle-form">
              {{ isEditMode ? 'Perbarui detail sales order' : 'Buat pesanan penjualan baru' }}
            </p>
          </div>
        </div>
        <div class="header-badge-form">
          <span class="mode-badge-form" :class="isEditMode ? 'mode-edit' : 'mode-create'">
            {{ isEditMode ? '✏️ Mode Edit' : '➕ Mode Tambah' }}
          </span>
        </div>
      </div>
    </div>

    <!-- ✅ LOADING STATE -->
    <div v-if="loading" class="loading-container-form">
      <div class="loading-animation-form">
        <div class="spinner-form"></div>
        <div class="loading-dots-form">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <p class="loading-text-form">Memuat data...</p>
    </div>

    <!-- ✅ FORM CONTENT -->
    <form v-else @submit.prevent="handleSubmit" class="form-container-so">
      <!-- SECTION 1: INFO CUSTOMER -->
      <div class="form-section-so">
        <div class="section-header-so">
          <span class="section-icon-so">👤</span>
          <h3 class="section-title-so">Informasi Customer</h3>
        </div>
        <div class="section-content-so">
          <div class="form-grid-2">
            <div class="form-group-so">
              <label class="form-label-so">
                Customer (Buyer)
                <span class="required-mark">*</span>
              </label>
              <select v-model="form.buyer_id" class="form-input-so form-select-so" required>
                <option disabled value="">Pilih customer...</option>
                <option v-for="buyer in masterData.buyers" :key="buyer.id" :value="buyer.id">
                  {{ buyer.name }}
                </option>
              </select>
            </div>

            <div class="form-group-so">
              <label class="form-label-so">No. PO Customer</label>
              <input
                v-model="form.customer_po_number"
                type="text"
                placeholder="Opsional"
                class="form-input-so"
              />
            </div>
          </div>

          <div class="form-grid-3">
            <div class="form-group-so">
              <label class="form-label-so">
                Tanggal SO
                <span class="required-mark">*</span>
              </label>
              <input v-model="form.so_date" type="date" class="form-input-so" required />
            </div>

            <div class="form-group-so">
              <label class="form-label-so">Tanggal Kirim (Estimasi)</label>
              <input v-model="form.delivery_date" type="date" class="form-input-so" />
            </div>

            <div class="form-group-so">
              <label class="form-label-so">
                Status
                <span class="required-mark">*</span>
              </label>
              <select v-model="form.status" class="form-input-so form-select-so" required>
                <option value="Draft">Draft</option>
                <option value="Confirmed">Confirmed</option>
              </select>
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group-so">
              <label class="form-label-so">
                Mata Uang
                <span class="required-mark">*</span>
              </label>
              <select v-model="form.currency" class="form-input-so form-select-so" required>
                <option value="IDR">IDR (Rupiah)</option>
                <option value="USD">USD (Dolar)</option>
              </select>
            </div>

            <div v-if="form.currency === 'USD'" class="form-group-so">
              <label class="form-label-so">
                Kurs (Rate)
                <span class="required-mark">*</span>
              </label>
              <input
                v-model.number="form.exchange_rate"
                type="number"
                min="1"
                class="form-input-so"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 2: DETAIL BARANG -->
      <div class="form-section-so">
        <div class="section-header-so">
          <span class="section-icon-so">📦</span>
          <h3 class="section-title-so">Rincian Barang</h3>
        </div>
        <div class="section-content-so">
          <div class="table-wrapper-so">
            <table class="data-table-so">
              <thead>
                <tr>
                  <th class="th-item">Nama Barang</th>
                  <th class="th-qty">Qty</th>
                  <th class="th-price">Harga Satuan ({{ form.currency }})</th>
                  <th class="th-total">Total Baris</th>
                  <th class="th-action"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in form.details" :key="index" class="data-row-so">
                  <td>
                    <select
                      v-model="item.item_id"
                      @change="onItemSelect(index)"
                      class="form-input-so form-select-so form-input-sm"
                      required
                    >
                      <option disabled value="">Pilih produk...</option>
                      <option
                        v-for="masterItem in masterData.items"
                        :key="masterItem.id"
                        :value="masterItem.id"
                      >
                        {{ masterItem.name }} (Stok: {{ formatStock(masterItem.stock) }})
                      </option>
                    </select>
                  </td>
                  <td>
                    <input
                      v-model.number="item.quantity"
                      type="number"
                      min="0.01"
                      step="0.01"
                      class="form-input-so form-input-sm"
                      required
                    />
                  </td>
                  <td>
                    <input
                      v-model.number="item.unit_price"
                      type="number"
                      min="0"
                      class="form-input-so form-input-sm"
                      required
                    />
                  </td>
                  <td class="td-total-so">
                    <span class="total-line-value">{{
                      formatCurrency(item.line_total || 0, form.currency)
                    }}</span>
                  </td>
                  <td class="td-action-so">
                    <button
                      @click.prevent="removeItemRow(index)"
                      class="btn-remove-row"
                      title="Hapus baris"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <button @click.prevent="addItemRow" class="btn-add-row-so">
            <span class="btn-icon">➕</span>
            <span class="btn-text">Tambah Baris Barang</span>
          </button>
        </div>
      </div>

      <!-- SECTION 3: TOTAL & CATATAN -->
      <div class="form-section-so">
        <div class="section-header-so">
          <span class="section-icon-so">💰</span>
          <h3 class="section-title-so">Total & Catatan</h3>
        </div>
        <div class="section-content-so">
          <div class="form-grid-2-gap">
            <!-- LEFT: CATATAN -->
            <div class="notes-container-so">
              <div class="form-group-so">
                <label class="form-label-so">Catatan</label>
                <textarea
                  v-model="form.notes"
                  class="form-textarea-so"
                  rows="8"
                  placeholder="Catatan internal atau untuk customer..."
                ></textarea>
              </div>
            </div>

            <!-- RIGHT: SUMMARY -->
            <div class="summary-container-so">
              <div class="summary-row-so">
                <span class="summary-label-so">Subtotal</span>
                <span class="summary-value-so">{{
                  formatCurrency(form.subtotal, form.currency)
                }}</span>
              </div>

              <div class="summary-row-so summary-row-input">
                <label class="summary-label-so">PPN</label>
                <select v-model.number="ppnRate" class="form-input-so form-select-so form-input-sm">
                  <option value="0">0%</option>
                  <option value="0.11">11%</option>
                  <option value="0.12">12%</option>
                </select>
              </div>

              <div class="summary-row-so">
                <span class="summary-label-so">PPN ({{ (ppnRate * 100).toFixed(0) }}%)</span>
                <span class="summary-value-so">{{ formatCurrency(taxAmount, form.currency) }}</span>
              </div>

              <div class="summary-row-so summary-row-input">
                <span class="summary-label-so">Diskon (Global)</span>
                <input
                  v-model.number="form.discount"
                  type="number"
                  class="form-input-so form-input-sm summary-input-discount"
                  placeholder="0"
                />
              </div>

              <div class="summary-divider-so"></div>

              <div class="summary-row-so summary-row-grand">
                <span class="summary-label-grand">Grand Total</span>
                <span class="summary-value-grand">{{
                  formatCurrency(grandTotal, form.currency)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FORM ACTIONS -->
      <div class="form-actions-so">
        <button @click.prevent="goBack" type="button" class="btn-cancel-so">
          <span class="btn-icon">↩️</span>
          <span class="btn-text">Batal</span>
        </button>
        <button type="submit" class="btn-submit-so" :disabled="isSaving">
          <span v-if="isSaving" class="loading-spinner-inline"></span>
          <span v-else class="btn-icon">💾</span>
          <span class="btn-text">{{ isEditMode ? 'Update' : 'Simpan' }} Sales Order</span>
        </button>
      </div>
    </form>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '../../api/axios'
import { useToast } from 'vue-toastification'
import DashboardLayout from '../../components/DashboardLayout.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const loading = ref(true)
const isSaving = ref(false)
const isEditMode = ref(false)
const soId = ref(null)

const form = reactive({
  buyer_id: '',
  so_date: new Date().toISOString().split('T')[0],
  delivery_date: null,
  customer_po_number: '',
  notes: '',
  status: 'Draft',
  currency: 'IDR',
  exchange_rate: 1,
  details: [],
  subtotal: 0,
  discount: 0,
  tax_ppn: 0,
  grand_total: 0,
})

const masterData = reactive({
  buyers: [],
  items: [],
})

const ppnRate = ref(0.11)

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([fetchBuyers(), fetchItems()])

    if (route.params.id) {
      isEditMode.value = true
      soId.value = route.params.id
      await fetchSalesOrder(soId.value)
    }
  } catch (error) {
    toast.error('Gagal memuat data master.')
  } finally {
    loading.value = false
    if (!isEditMode.value) {
      addItemRow()
    }
  }
})

const fetchBuyers = async () => {
  try {
    const response = await apiClient.get('/buyers')
    masterData.buyers = response.data.data
  } catch (error) {
    console.error('Error fetch buyers:', error)
    toast.error('Gagal mengambil daftar customer.')
  }
}

const fetchItems = async () => {
  try {
    const response = await apiClient.get('/materials?category_name=Produk Jadi&all=true')
    let items = []
    if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
      items = response.data.data.data
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      items = response.data.data
    } else if (Array.isArray(response.data)) {
      items = response.data
    }
    masterData.items = items
  } catch (error) {
    console.error('Error fetch items:', error)
    toast.error('Gagal mengambil daftar produk jadi.')
  }
}

const fetchSalesOrder = async (id) => {
  try {
    const response = await apiClient.get(`/sales-orders/${id}`)
    const so = response.data.data

    form.buyer_id = so.buyer_id
    form.so_date = so.so_date
    form.delivery_date = so.delivery_date
    form.customer_po_number = so.customer_po_number
    form.notes = so.notes
    form.status = so.status
    form.discount = so.discount
    form.currency = so.currency
    form.exchange_rate = so.exchange_rate

    if (so.tax_ppn > 0) {
      const calculatedRate = so.tax_ppn / so.subtotal
      if (calculatedRate.toFixed(2) == '0.12') ppnRate.value = 0.12
      else if (calculatedRate.toFixed(2) == '0.11') ppnRate.value = 0.11
      else ppnRate.value = 0
    } else {
      ppnRate.value = 0
    }

    form.details = so.details.map((detail) => ({
      item_id: detail.item_id,
      item_name: detail.item_name,
      item_unit: detail.item_unit,
      quantity: detail.quantity,
      unit_price: detail.unit_price,
      discount: detail.discount,
      line_total: detail.line_total,
      specifications: detail.specifications,
    }))
  } catch (error) {
    console.error('Error fetch SO:', error)
    toast.error('Gagal memuat data Sales Order.')
    router.push({ name: 'DaftarSalesOrder' })
  }
}

watch(
  () => form.currency,
  (newCurrency) => {
    if (newCurrency === 'IDR') {
      form.exchange_rate = 1
    }
  },
)

const addItemRow = () => {
  form.details.push({
    item_id: '',
    item_name: '',
    item_unit: '',
    quantity: 1,
    unit_price: 0,
    line_total: 0,
    specifications: null,
  })
}

const removeItemRow = (index) => {
  form.details.splice(index, 1)
}

const onItemSelect = (index) => {
  const selectedItem = masterData.items.find((item) => item.id === form.details[index].item_id)
  if (selectedItem) {
    form.details[index].item_name = selectedItem.name
    form.details[index].item_unit = selectedItem.unit?.name || 'N/A'
  }
}

watch(
  () => form.details,
  (newDetails) => {
    let subtotal = 0
    newDetails.forEach((item) => {
      item.line_total = (item.quantity || 0) * (item.unit_price || 0)
      subtotal += item.line_total
    })
    form.subtotal = subtotal
  },
  { deep: true },
)

const taxAmount = computed(() => {
  const amount = form.subtotal * ppnRate.value
  form.tax_ppn = amount
  return amount
})

const grandTotal = computed(() => {
  const total = form.subtotal - (form.discount || 0) + taxAmount.value
  form.grand_total = total
  return total
})

const handleSubmit = async () => {
  isSaving.value = true

  if (form.details.length === 0) {
    toast.error('Harus ada minimal 1 barang dalam Sales Order.')
    isSaving.value = false
    return
  }

  try {
    if (isEditMode.value) {
      await apiClient.put(`/sales-orders/${soId.value}`, form)
      toast.success('Sales Order berhasil diperbarui!')
    } else {
      await apiClient.post('/sales-orders', form)
      toast.success('Sales Order baru berhasil disimpan!')
    }
    router.push({ name: 'DaftarSalesOrder' })
  } catch (error) {
    console.error('Error saving SO:', error)
    toast.error(error.response?.data?.message || 'Gagal menyimpan data.')
  } finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.push({ name: 'DaftarSalesOrder' })
}

const pageTitle = computed(() => {
  return isEditMode.value ? 'Edit Sales Order' : 'Buat Sales Order Baru'
})

const formatCurrency = (value, currency) => {
  if (!value) value = 0
  const options = {
    style: 'currency',
    currency: currency || 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }

  if (currency === 'USD') {
    options.currencyDisplay = 'symbol'
  }

  return new Intl.NumberFormat('id-ID', options).format(value)
}

const formatStock = (value) => {
  if (!value) return 0
  return parseFloat(Number(value).toFixed(4))
}
</script>

<style scoped>
/* ========== PAGE HEADER ========== */
.page-header-form {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-content-form {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.header-left-form {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.icon-badge-form-so {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.form-icon-so {
  font-size: 2rem;
}

.header-text-form {
  color: white;
}

.page-title-form {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: white;
}

.page-subtitle-form {
  font-size: 0.95rem;
  margin: 0.25rem 0 0 0;
  color: rgba(255, 255, 255, 0.9);
}

.header-badge-form {
  display: flex;
  align-items: center;
}

.mode-badge-form {
  padding: 0.625rem 1.25rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.mode-edit {
  background: rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.5);
}

.mode-create {
  background: rgba(16, 185, 129, 0.3);
  border-color: rgba(16, 185, 129, 0.5);
}

/* ========== LOADING ========== */
.loading-container-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.loading-animation-form {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner-form {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f4f6;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-dots-form {
  display: flex;
  gap: 6px;
  margin-top: 1rem;
}

.loading-dots-form span {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.loading-dots-form span:nth-child(1) {
  animation-delay: -0.32s;
}
.loading-dots-form span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.loading-text-form {
  margin-top: 1rem;
  color: #6b7280;
  font-weight: 500;
}

/* ========== FORM CONTAINER ========== */
.form-container-so {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ========== FORM SECTION ========== */
.form-section-so {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.section-header-so {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%);
  border-bottom: 2px solid #e5e7eb;
}

.section-icon-so {
  font-size: 1.5rem;
}

.section-title-so {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.section-content-so {
  padding: 1.5rem;
}

/* ========== FORM GRIDS ========== */
.form-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.form-grid-2-gap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

/* ========== FORM ELEMENTS ========== */
.form-group-so {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label-so {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.required-mark {
  color: #ef4444;
  font-weight: 700;
}

.form-input-so {
  padding: 0.625rem 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: white;
}

.form-input-so:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-select-so {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.form-input-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
}

.form-textarea-so {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  resize: vertical;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-textarea-so:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* ========== TABLE ========== */
.table-wrapper-so {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 1rem;
}

.data-table-so {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table-so thead {
  background: #f9fafb;
}

.data-table-so th {
  text-align: left;
  padding: 0.875rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.th-item {
  min-width: 300px;
}
.th-qty {
  width: 100px;
}
.th-price {
  width: 180px;
}
.th-total {
  width: 150px;
  text-align: right;
}
.th-action {
  width: 60px;
  text-align: center;
}

.data-table-so tbody tr {
  border-bottom: 1px solid #f3f4f6;
}

.data-table-so td {
  padding: 0.75rem;
  vertical-align: middle;
}

.td-total-so {
  text-align: right;
}

.total-line-value {
  font-weight: 600;
  color: #10b981;
}

.td-action-so {
  text-align: center;
}

.btn-remove-row {
  padding: 0.375rem 0.625rem;
  background: white;
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn-remove-row:hover {
  background: #ef4444;
  color: white;
}

.btn-add-row-so {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: white;
  color: #667eea;
  border: 2px dashed #667eea;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-add-row-so:hover {
  background: #f8f9ff;
  border-color: #5568d3;
  color: #5568d3;
}

/* ========== SUMMARY ========== */
.notes-container-so {
  display: flex;
  flex-direction: column;
}

.summary-container-so {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-row-so {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.summary-row-input {
  align-items: flex-start;
}

.summary-label-so {
  font-size: 0.9375rem;
  color: #4b5563;
  font-weight: 500;
  flex-shrink: 0;
}

.summary-value-so {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  text-align: right;
}

.summary-input-discount {
  max-width: 140px;
  text-align: right;
}

.summary-divider-so {
  height: 2px;
  background: linear-gradient(to right, #e5e7eb, #d1d5db, #e5e7eb);
  margin: 0.5rem 0;
}

.summary-row-grand {
  padding-top: 0.5rem;
}

.summary-label-grand {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.summary-value-grand {
  font-size: 1.5rem;
  font-weight: 800;
  color: #10b981;
}

/* ========== FORM ACTIONS ========== */
.form-actions-so {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn-cancel-so,
.btn-submit-so {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-cancel-so {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-cancel-so:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-submit-so {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

.btn-submit-so:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
}

.btn-submit-so:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner-inline {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 1024px) {
  .form-grid-2-gap {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .page-header-form {
    padding: 1.5rem;
  }

  .header-content-form {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title-form {
    font-size: 1.5rem;
  }

  .form-grid-2,
  .form-grid-3 {
    grid-template-columns: 1fr;
  }

  .section-content-so {
    padding: 1rem;
  }

  .table-wrapper-so {
    border: none;
  }

  .data-table-so {
    font-size: 0.8125rem;
  }

  .data-table-so th,
  .data-table-so td {
    padding: 0.5rem;
  }

  .form-actions-so {
    flex-direction: column;
  }

  .btn-cancel-so,
  .btn-submit-so {
    width: 100%;
    justify-content: center;
  }
}
</style>
