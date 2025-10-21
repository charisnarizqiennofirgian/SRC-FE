<template>
  <DashboardLayout>
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left-section">
          <div class="icon-badge">🧾</div>
          <div>
            <h1 class="page-title">Buat Faktur Pembelian</h1>
            <p class="page-subtitle">Catat tagihan yang diterima dari supplier</p>
          </div>
        </div>
        <router-link to="/admin/pembelian" class="btn-back">
          <span class="btn-icon">←</span>
          <span>Kembali ke Daftar</span>
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p class="loading-text">Memuat data...</p>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="saveBill">
      <!-- Informasi Faktur Card -->
      <div class="content-card">
        <div class="card-header-section">
          <div class="section-icon-wrapper">
            <div class="section-icon">ℹ️</div>
          </div>
          <div class="section-header-text">
            <h2 class="section-title">Informasi Faktur</h2>
            <p class="section-subtitle">Masukkan detail dari faktur yang Anda terima</p>
          </div>
        </div>
        <div class="card-body">
          <div class="info-grid-form">
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">🏭</span>
                <span>Supplier</span>
                <span class="required">*</span>
              </label>
              <select
                v-model="form.supplier_id"
                @change="handleSupplierChange"
                class="form-control"
                required
              >
                <option disabled value="">Pilih Supplier</option>
                <option v-for="supplier in daftarSupplier" :key="supplier.id" :value="supplier.id">
                  {{ supplier.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">📄</span>
                <span>No. Faktur Supplier</span>
                <span class="required">*</span>
              </label>
              <input
                type="text"
                v-model="form.supplier_invoice_number"
                class="form-control"
                placeholder="Contoh: INV/2025/123"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">📅</span>
                <span>Tanggal Faktur</span>
                <span class="required">*</span>
              </label>
              <input type="date" v-model="form.bill_date" class="form-control" required />
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">⏰</span>
                <span>Tanggal Jatuh Tempo</span>
                <span class="required">*</span>
              </label>
              <input type="date" v-model="form.due_date" class="form-control" required />
            </div>
          </div>
        </div>
      </div>

      <!-- Tarik Data Card -->
      <div class="content-card">
        <div class="card-header-section">
          <div class="section-icon-wrapper">
            <div class="section-icon">🔗</div>
          </div>
          <div class="section-header-text">
            <h2 class="section-title">Tarik Data dari Penerimaan Barang</h2>
            <p class="section-subtitle">
              Pilih penerimaan barang untuk mengisi detail tagihan secara otomatis
            </p>
          </div>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">📦</span>
              <span>Penerimaan Barang (Goods Receipt)</span>
            </label>
            <select
              @change="handleReceiptSelect"
              class="form-control"
              :disabled="!form.supplier_id || availableReceipts.length === 0"
            >
              <option value="">Pilih Penerimaan</option>
              <option v-for="receipt in availableReceipts" :key="receipt.id" :value="receipt.id">
                {{ receipt.receipt_number }} - Tanggal: {{ formatTanggal(receipt.receipt_date) }}
              </option>
            </select>
            <small v-if="!form.supplier_id" class="form-hint">
              <span class="hint-icon">💡</span>
              Pilih supplier terlebih dahulu untuk melihat daftar penerimaan.
            </small>
            <small
              v-if="form.supplier_id && availableReceipts.length === 0 && !loadingReceipts"
              class="form-hint warning"
            >
              <span class="hint-icon">⚠️</span>
              Tidak ada penerimaan barang yang siap ditagih untuk supplier ini.
            </small>
          </div>
        </div>
      </div>

      <!-- Detail Tagihan Card -->
      <div class="content-card">
        <div class="card-header-section">
          <div class="section-icon-wrapper">
            <div class="section-icon">📋</div>
          </div>
          <div class="section-header-text">
            <h2 class="section-title">Detail Tagihan</h2>
            <p class="section-subtitle">Rincian barang yang ditagihkan oleh supplier</p>
          </div>
        </div>
        <div class="card-body-table">
          <div class="table-container">
            <div class="table-wrapper">
              <table class="detail-table">
                <thead>
                  <tr>
                    <th class="th-material">
                      <div class="th-content">
                        <span class="th-icon">📦</span>
                        <span>Barang</span>
                      </div>
                    </th>
                    <th class="th-qty">
                      <div class="th-content">
                        <span class="th-icon">📊</span>
                        <span>Jumlah Ditagih</span>
                      </div>
                    </th>
                    <th class="th-price">
                      <div class="th-content">
                        <span class="th-icon">💰</span>
                        <span>Harga Satuan</span>
                      </div>
                    </th>
                    <th class="th-subtotal">
                      <div class="th-content">
                        <span class="th-icon">💵</span>
                        <span>Subtotal</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="form.details.length === 0" class="empty-row">
                    <td colspan="4">
                      <div class="empty-state">
                        <span class="empty-icon">📋</span>
                        <p class="empty-text">Belum ada detail tagihan</p>
                        <p class="empty-hint">
                          Pilih penerimaan barang di atas untuk mengisi detail
                        </p>
                      </div>
                    </td>
                  </tr>
                  <tr v-for="(item, index) in form.details" :key="index" class="data-row">
                    <td class="td-material">{{ item.item_name }}</td>
                    <td class="td-qty">
                      <input
                        type="number"
                        v-model="item.quantity"
                        class="table-input"
                        required
                        min="0.01"
                        step="any"
                      />
                    </td>
                    <td class="td-price">
                      <div class="input-with-currency">
                        <span class="currency-prefix">Rp</span>
                        <input
                          type="number"
                          v-model="item.price"
                          class="table-input has-prefix"
                          required
                          min="0"
                          step="any"
                        />
                      </div>
                    </td>
                    <td class="td-subtotal">
                      <span class="subtotal-value">
                        {{ formatCurrency((item.quantity || 0) * (item.price || 0)) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Summary Section -->
          <div class="summary-section">
            <div class="summary-box">
              <div class="summary-row">
                <span class="sum-label">Subtotal</span>
                <span class="sum-value">{{ formatCurrency(subtotal) }}</span>
              </div>
              <div class="summary-row ppn-row">
                <span class="sum-label">
                  <span class="ppn-badge">12%</span>
                  PPN
                </span>
                <span class="sum-value">{{ formatCurrency(ppnAmount) }}</span>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-row summary-total">
                <span class="sum-label-total">Grand Total</span>
                <span class="sum-value-total">{{ formatCurrency(grandTotal) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="cancel" class="btn-cancel-action">
          <span class="action-icon">❌</span>
          <span>Batal</span>
        </button>
        <button
          type="submit"
          class="btn-submit-action"
          :disabled="isSaving || form.details.length === 0"
        >
          <span class="action-icon">{{ isSaving ? '⏳' : '💾' }}</span>
          <span>{{ isSaving ? 'Menyimpan...' : 'Simpan Faktur' }}</span>
        </button>
      </div>
    </form>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/api/axios'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()

const loading = ref(false)
const loadingReceipts = ref(false)
const isSaving = ref(false)
const daftarSupplier = ref([])
const availableReceipts = ref([])

const today = new Date().toISOString().slice(0, 10)
const thirtyDaysFromNow = new Date()
thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
const dueDateDefault = thirtyDaysFromNow.toISOString().slice(0, 10)

const form = reactive({
  supplier_id: '',
  supplier_invoice_number: '',
  bill_date: today,
  due_date: dueDateDefault,
  notes: '',
  details: [],
})

const subtotal = computed(() => {
  return form.details.reduce((acc, item) => {
    return acc + (item.quantity || 0) * (item.price || 0)
  }, 0)
})

const ppnAmount = computed(() => {
  return subtotal.value * 0.12
})

const grandTotal = computed(() => {
  return subtotal.value + ppnAmount.value
})

const handleSupplierChange = async () => {
  form.details = []
  availableReceipts.value = []
  if (!form.supplier_id) return

  loadingReceipts.value = true
  try {
    const response = await apiClient.get(`/goods-receipts/unbilled?supplier_id=${form.supplier_id}`)
    availableReceipts.value = response.data.data
  } catch (error) {
    console.error('Gagal memuat data faktur:', error)
    toast.error('Gagal memuat data faktur.')
  } finally {
    loadingReceipts.value = false
  }
}

const formatTanggal = (tanggal) => {
  if (!tanggal) return ''
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const handleReceiptSelect = (event) => {
  const receiptId = event.target.value
  if (!receiptId) {
    form.details = []
    return
  }

  const selectedReceipt = availableReceipts.value.find((r) => r.id == receiptId)

  if (!selectedReceipt || !selectedReceipt.details) {
    toast.error('Data detail untuk penerimaan ini tidak ditemukan.')
    form.details = []
    return
  }

  // ✅ Map details dengan price yang sudah di-attach oleh backend
  form.details = selectedReceipt.details.map((detail) => {
    // ✅ Prioritas: ambil price yang udah di-attach backend
    let price = 0

    // Cek 1: Price langsung dari detail (hasil backend enrichment)
    if (detail.price !== undefined && detail.price !== null) {
      price = parseFloat(detail.price)
    }
    // Cek 2: Fallback ke purchaseOrderDetail.price
    else if (detail.purchaseOrderDetail && detail.purchaseOrderDetail.price) {
      price = parseFloat(detail.purchaseOrderDetail.price)
    }

    return {
      goods_receipt_detail_id: detail.id,
      item_id: detail.item_id,
      item_name: detail.item ? detail.item.name : 'Nama Barang Tidak Ditemukan',
      quantity: parseFloat(detail.quantity_received) || 0,
      price: price, // ✅ Harga dari backend!
    }
  })

  console.log('✅ Form details populated:', form.details)
}

const saveBill = async () => {
  isSaving.value = true
  try {
    await apiClient.post('/purchase-bills', form)
    toast.success('Faktur Pembelian berhasil disimpan!')
    router.push('/admin/pembelian')
  } catch (error) {
    toast.error('Gagal menyimpan faktur.')
    console.error(error)
  } finally {
    isSaving.value = false
  }
}

const fetchDataDropdowns = async () => {
  loading.value = true
  try {
    const supplierRes = await apiClient.get('/suppliers?all=true')
    daftarSupplier.value = supplierRes.data.data
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Gagal menyimpan faktur.'
    toast.error(errorMessage)
    console.error('Error saving invoice:', error)
  } finally {
    loading.value = false
  }
}

const cancel = () => {
  router.go(-1)
}

const formatCurrency = (value) => {
  if (isNaN(value)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

onMounted(fetchDataDropdowns)
</script>

<style scoped>
/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
  background: white;
  border-radius: 16px;
  padding: 60px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #e0e7ff;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 16px;
  color: #64748b;
  font-weight: 600;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 32px 36px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.2), transparent);
  pointer-events: none;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  gap: 24px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.header-left-section {
  display: flex;
  align-items: center;
  gap: 18px;
}

.icon-badge {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 6px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.page-subtitle {
  font-size: 14px;
  opacity: 0.95;
  margin: 0;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  color: #10b981;
  text-decoration: none;
  padding: 12px 22px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.btn-icon {
  font-size: 18px;
}

/* Content Card */
.content-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  border: 1px solid #f0f0f0;
}

.card-header-section {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px 32px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 3px solid #e9ecef;
  position: relative;
}

.card-header-section::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 32px;
  width: 70px;
  height: 3px;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 3px 3px 0 0;
}

.section-icon-wrapper {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  border: 2px solid #6ee7b7;
}

.section-icon {
  font-size: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.section-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.card-body {
  padding: 28px 32px;
}

.card-body-table {
  padding: 32px 36px;
}

/* Form */
.info-grid-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #1e293b;
  font-size: 14px;
}

.label-icon {
  font-size: 16px;
}

.required {
  color: #ef4444;
  font-weight: 800;
}

.form-control {
  width: 100%;
  padding: 13px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12);
}

.form-control:disabled {
  background: #f9fafb;
  cursor: not-allowed;
  opacity: 0.6;
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.form-hint.warning {
  color: #f59e0b;
}

.hint-icon {
  font-size: 14px;
}

/* Table */
.table-container {
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  padding: 24px;
  border-radius: 14px;
  margin-bottom: 24px;
  border: 2px solid #e9ecef;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
  background: white;
}

.detail-table thead {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
}

.detail-table th {
  padding: 18px 20px;
  text-align: left;
  color: white;
  font-weight: 800;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.th-icon {
  font-size: 16px;
}

.th-material {
  width: 40%;
}

.th-qty {
  width: 20%;
}

.th-price {
  width: 20%;
}

.th-subtotal {
  width: 20%;
  text-align: right;
}

.data-row {
  transition: all 0.2s ease;
  border-bottom: 2px solid #f1f5f9;
}

.data-row:hover {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
}

.detail-table td {
  padding: 16px 20px;
  vertical-align: middle;
}

.td-material {
  font-weight: 600;
  color: #1e293b;
}

.input-with-currency {
  position: relative;
}

.currency-prefix {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 700;
  color: #64748b;
  font-size: 14px;
  z-index: 1;
}

.table-input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  background: white;
  min-height: 46px;
}

.table-input.has-prefix {
  padding-left: 42px;
}

.table-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.td-subtotal {
  text-align: right;
}

.subtotal-value {
  font-weight: 800;
  color: #059669;
  font-size: 15px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-radius: 8px;
  border: 2px solid #6ee7b7;
  display: inline-block;
  min-width: 130px;
  text-align: right;
}

/* Empty State */
.empty-row {
  background: #fafafa;
}

.empty-state {
  text-align: center;
  padding: 48px 20px;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  font-weight: 700;
  color: #475569;
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

/* Summary */
.summary-section {
  padding: 24px 36px;
  border-top: 3px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
}

.summary-box {
  min-width: 350px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #e2e8f0;
}

.sum-label {
  font-weight: 600;
  font-size: 14px;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sum-value {
  font-weight: 700;
  font-size: 14px;
  color: #1e293b;
}

.ppn-row {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  margin: 0 -20px;
  padding: 10px 20px;
  border-radius: 6px;
}

.ppn-badge {
  display: inline-flex;
  padding: 2px 6px;
  background: #10b981;
  color: white;
  font-size: 10px;
  font-weight: 800;
  border-radius: 4px;
}

.summary-divider {
  height: 2px;
  background: linear-gradient(90deg, #e2e8f0, #cbd5e1, #e2e8f0);
  margin: 10px 0;
}

.summary-total {
  margin-top: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border-radius: 8px;
  border: 2px solid #10b981;
}

.sum-label-total {
  font-weight: 800;
  font-size: 16px;
  color: #065f46;
}

.sum-value-total {
  font-weight: 900;
  font-size: 20px;
  color: #10b981;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 24px 36px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-radius: 12px;
  border: 2px solid #e9ecef;
  margin-top: 24px;
}

.btn-cancel-action,
.btn-submit-action {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-cancel-action {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  color: #475569;
  border: 2px solid #cbd5e1;
}

.btn-submit-action {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-submit-action:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.4);
}

.btn-submit-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.action-icon {
  font-size: 18px;
}

/* Responsive */
@media (max-width: 768px) {
  .info-grid-form {
    grid-template-columns: 1fr;
  }

  .summary-section {
    padding: 20px;
  }

  .summary-box {
    min-width: auto;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-cancel-action,
  .btn-submit-action {
    justify-content: center;
  }
}
</style>
