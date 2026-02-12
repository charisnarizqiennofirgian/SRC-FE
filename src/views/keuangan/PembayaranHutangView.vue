<template>
  <DashboardLayout>
    <!-- HEADER -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge">
            <span class="icon">💰</span>
          </div>
          <div class="header-text">
            <h1 class="page-title">Pembayaran Hutang Supplier</h1>
            <p class="page-subtitle">Lunasi tagihan pembelian dengan status tempo</p>
          </div>
        </div>
        <div class="header-actions">
          <button
            class="btn btn-secondary"
            @click="router.push({ name: 'RiwayatPembayaranHutang' })"
          >
            <span class="btn-icon">📋</span>
            <span class="btn-text">Riwayat Pembayaran</span>
          </button>
        </div>
      </div>
    </div>

    <!-- FORM CARD -->
    <div class="content-card">
      <div class="card-header-accent">
        <h2 class="card-title">Form Pembayaran</h2>
      </div>

      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <!-- STEP 1: PILIH SUPPLIER -->
          <div class="form-section">
            <div class="section-title">
              <span class="section-icon">🏢</span>
              <h3>Step 1: Pilih Supplier</h3>
            </div>

            <div class="form-group">
              <label class="form-label">
                Supplier
                <span class="required">*</span>
              </label>
              <select
                v-model="selectedSupplierId"
                class="form-control"
                required
                @change="loadOutstandingBills"
              >
                <option value="">-- Pilih Supplier --</option>
                <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                  {{ supplier.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- STEP 2: PILIH TAGIHAN -->
          <div v-if="selectedSupplierId" class="form-section">
            <div class="section-title">
              <span class="section-icon">📄</span>
              <h3>Step 2: Pilih Tagihan yang Akan Dibayar</h3>
            </div>

            <div v-if="loadingBills" class="loading-state">
              <span class="spinner">⏳</span>
              <p>Memuat tagihan...</p>
            </div>

            <div v-else-if="outstandingBills.length === 0" class="empty-state">
              <span class="empty-icon">✅</span>
              <p>Tidak ada tagihan yang belum lunas dari supplier ini</p>
            </div>

            <div v-else class="bills-table">
              <table class="data-table">
                <thead>
                  <tr>
                    <th class="th-check">Pilih</th>
                    <th>No. Invoice</th>
                    <th>Tanggal</th>
                    <th>Jatuh Tempo</th>
                    <th class="text-right">Total</th>
                    <th class="text-right">Sudah Dibayar</th>
                    <th class="text-right">Sisa Hutang</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="bill in outstandingBills" :key="bill.id">
                    <td class="td-check">
                      <input
                        type="radio"
                        name="selected_bill"
                        :value="bill.id"
                        v-model="selectedBillId"
                        @change="selectBill(bill)"
                      />
                    </td>
                    <td class="font-mono">{{ bill.bill_number }}</td>
                    <td>{{ formatDate(bill.bill_date) }}</td>
                    <td :class="{ 'text-danger': isOverdue(bill.due_date) }">
                      {{ formatDate(bill.due_date) }}
                      <span v-if="isOverdue(bill.due_date)" class="badge badge-danger"
                        >Overdue</span
                      >
                    </td>
                    <td class="text-right">{{ formatRupiah(bill.total_amount) }}</td>
                    <td class="text-right">{{ formatRupiah(bill.paid_amount) }}</td>
                    <td class="text-right text-danger font-bold">
                      {{ formatRupiah(bill.remaining_amount) }}
                    </td>
                    <td>
                      <span class="badge" :class="getStatusClass(bill.payment_status)">
                        {{ bill.payment_status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- STEP 3: INPUT PEMBAYARAN -->
          <div v-if="selectedBill" class="form-section">
            <div class="section-title">
              <span class="section-icon">💵</span>
              <h3>Step 3: Detail Pembayaran</h3>
            </div>

            <div class="info-card">
              <div class="info-row">
                <span class="info-label">Invoice:</span>
                <span class="info-value font-mono">{{ selectedBill.bill_number }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Total Tagihan:</span>
                <span class="info-value">{{ formatRupiah(selectedBill.total_amount) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Sudah Dibayar:</span>
                <span class="info-value text-success">{{
                  formatRupiah(selectedBill.paid_amount)
                }}</span>
              </div>
              <div class="info-row highlight">
                <span class="info-label">Sisa Hutang:</span>
                <span class="info-value text-danger font-bold">{{
                  formatRupiah(selectedBill.remaining_amount)
                }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  Tanggal Pembayaran
                  <span class="required">*</span>
                </label>
                <input
                  type="date"
                  v-model="form.payment_date"
                  class="form-control"
                  required
                  :max="today"
                />
              </div>

              <div class="form-group">
                <label class="form-label">
                  Nominal Bayar
                  <span class="required">*</span>
                  <span class="label-hint"
                    >(Maksimal: {{ formatRupiah(selectedBill.remaining_amount) }})</span
                  >
                </label>
                <div class="input-wrapper-rupiah">
                  <span class="rupiah-prefix">Rp</span>
                  <input
                    type="text"
                    v-model="formattedAmount"
                    class="form-control form-control-rupiah"
                    placeholder="0"
                    required
                    @input="handleAmountInput"
                    @blur="formatAmountOnBlur"
                  />
                </div>
                <div class="quick-actions">
                  <button
                    type="button"
                    class="btn-quick"
                    @click="setAmount(selectedBill.remaining_amount)"
                  >
                    💰 Bayar Lunas
                  </button>
                  <button
                    type="button"
                    class="btn-quick"
                    @click="setAmount(selectedBill.remaining_amount / 2)"
                  >
                    💵 Bayar 50%
                  </button>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  Akun Pembayaran (COA)
                  <span class="required">*</span>
                </label>
                <select id="coa-select" v-model="form.account_id" class="form-control" required>
                  <option value="">-- Pilih Akun Kas/Bank --</option>
                  <option v-for="account in coaAccounts" :key="account.id" :value="account.id">
                    {{ account.code }} - {{ account.name }} ({{ account.currency }})
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Keterangan</label>
                <textarea
                  v-model="form.notes"
                  class="form-control"
                  rows="3"
                  placeholder="Keterangan tambahan (opsional)"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- ACTIONS -->
          <div v-if="selectedBill" class="form-actions">
            <button type="button" class="btn btn-cancel" @click="resetForm">
              <span class="btn-icon">↩️</span>
              <span class="btn-text">Reset</span>
            </button>
            <button type="submit" class="btn btn-submit" :disabled="submitting">
              <span class="btn-icon">💾</span>
              <span class="btn-text">{{ submitting ? 'Memproses...' : 'Proses Pembayaran' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'
import Choices from 'choices.js'
import 'choices.js/public/assets/styles/choices.min.css'

const router = useRouter()
const { showSuccess, showError } = useNotification()

const suppliers = ref([])
const selectedSupplierId = ref('')
const outstandingBills = ref([])
const loadingBills = ref(false)
const selectedBillId = ref(null)
const selectedBill = ref(null)
const coaAccounts = ref([])
const coaChoicesInstance = ref(null)
const submitting = ref(false)

const form = ref({
  payment_date: new Date().toISOString().split('T')[0],
  amount: 0,
  account_id: '',
  notes: '',
})

const formattedAmount = ref('0')

const today = computed(() => new Date().toISOString().split('T')[0])

const fetchSuppliers = async () => {
  try {
    const response = await apiClient.get('/suppliers')
    suppliers.value = response.data.data || response.data
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    showError('Gagal', 'Gagal memuat data supplier')
  }
}

const fetchCoaAccounts = async () => {
  try {
    const response = await apiClient.get('/coa', {
      params: { 
        is_active: 1 
      }
    })
    coaAccounts.value = response.data.data || []
    
    await nextTick()
    initializeCoaDropdown()
  } catch (error) {
    console.error('Error fetching COA accounts:', error)
    showError('Gagal', 'Gagal memuat data akun COA')
  }
}

const initializeCoaDropdown = () => {
  setTimeout(() => {
    const coaSelect = document.getElementById('coa-select')
    
    // Destroy existing instance if it exists
    if (coaChoicesInstance.value) {
      coaChoicesInstance.value.destroy()
      coaChoicesInstance.value = null
    }

    if (coaSelect) {
      coaChoicesInstance.value = new Choices(coaSelect, {
        searchEnabled: true,
        searchPlaceholderValue: 'Cari akun COA...',
        noResultsText: 'Akun tidak ditemukan',
        noChoicesText: 'Tidak ada pilihan',
        itemSelectText: 'Klik untuk pilih',
        shouldSort: false,
        position: 'bottom',
        renderChoiceLimit: -1,
        searchResultLimit: 100,
      })
    }
  }, 100)
}

const loadOutstandingBills = async () => {
  if (!selectedSupplierId.value) return

  loadingBills.value = true
  selectedBillId.value = null
  selectedBill.value = null

  try {
    const response = await apiClient.get('/purchase-payments/outstanding-bills', {
      params: { supplier_id: selectedSupplierId.value },
    })
    outstandingBills.value = response.data.data
  } catch (error) {
    console.error('Error fetching outstanding bills:', error)
    showError('Gagal', 'Gagal memuat tagihan supplier')
  } finally {
    loadingBills.value = false
  }
}

const formatAmountDisplay = (value) => {
  if (!value || value === 0) return '0'
  return new Intl.NumberFormat('id-ID').format(value)
}

const handleAmountInput = (e) => {
  let value = e.target.value.replace(/[^\d]/g, '')
  form.value.amount = parseFloat(value) || 0
  formattedAmount.value = formatAmountDisplay(value)
}

const formatAmountOnBlur = () => {
  formattedAmount.value = formatAmountDisplay(form.value.amount)
}

const setAmount = (amount) => {
  const rounded = Math.round(amount)
  form.value.amount = rounded
  formattedAmount.value = formatAmountDisplay(rounded)
}

const selectBill = async (bill) => {
  selectedBill.value = bill
  const rounded = Math.round(bill.remaining_amount)
  form.value.amount = rounded
  formattedAmount.value = formatAmountDisplay(rounded)
  
  await nextTick()
  initializeCoaDropdown()
}

const handleSubmit = async () => {
  if (form.value.amount > selectedBill.value.remaining_amount) {
    showError('Validasi Gagal', 'Nominal bayar melebihi sisa hutang!')
    return
  }

  submitting.value = true

  try {
    const payload = {
      purchase_bill_id: selectedBillId.value,
      payment_date: form.value.payment_date,
      amount: form.value.amount,
      account_id: form.value.account_id,
      notes: form.value.notes,
    }

    await apiClient.post('/purchase-payments', payload)

    showSuccess('Berhasil', 'Pembayaran hutang berhasil diproses!')
    resetForm()
  } catch (error) {
    console.error('Error processing payment:', error)
    const message = error.response?.data?.message || 'Gagal memproses pembayaran'
    showError('Gagal', message)
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  selectedSupplierId.value = ''
  selectedBillId.value = null
  selectedBill.value = null
  outstandingBills.value = []
  form.value = {
    payment_date: new Date().toISOString().split('T')[0],
    amount: 0,
    account_id: '',
    notes: '',
  }
  formattedAmount.value = '0'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatRupiah = (amount) => {
  if (!amount) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const isOverdue = (dueDate) => {
  return new Date(dueDate) < new Date()
}

const getStatusClass = (status) => {
  const classes = {
    UNPAID: 'badge-danger',
    PARTIAL: 'badge-warning',
    PAID: 'badge-success',
  }
  return classes[status] || 'badge-secondary'
}

onMounted(() => {
  fetchSuppliers()
  fetchCoaAccounts()
})
</script>

<style scoped>
/* Gunakan style yang sama dengan MasterBarangForm */
.page-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 32px 36px;
  border-radius: 24px;
  margin-bottom: 24px;
  box-shadow: 0 12px 40px rgba(16, 185, 129, 0.25);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  flex-wrap: wrap;
  gap: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-badge {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.icon {
  font-size: 36px;
}

.page-title {
  font-size: 30px;
  font-weight: 900;
  margin: 0 0 6px 0;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.page-subtitle {
  font-size: 15px;
  opacity: 0.95;
  margin: 0;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.content-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.card-header-accent {
  padding: 24px 32px;
  background: linear-gradient(to right, #f8f9fa, #fff);
  border-bottom: 2px solid #e9ecef;
}

.card-title {
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.card-body {
  padding: 32px;
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 2px solid #f3f4f6;
}

.form-section:last-of-type {
  border-bottom: none;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-icon {
  font-size: 24px;
}

.section-title h3 {
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-weight: 700;
  font-size: 14px;
  color: #374151;
}

.required {
  color: #ef4444;
  font-weight: 900;
}

.label-hint {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  font-style: italic;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.spinner,
.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.bills-table {
  overflow-x: auto;
  margin: 20px 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
}

.data-table th {
  padding: 14px 12px;
  text-align: left;
  font-weight: 800;
  font-size: 12px;
  color: #475569;
  text-transform: uppercase;
  border-bottom: 2px solid #e2e8f0;
}

.data-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.data-table tbody tr:hover {
  background: #f8fafc;
}

.th-check,
.td-check {
  width: 60px;
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-danger {
  color: #ef4444;
}

.text-success {
  color: #10b981;
}

.font-mono {
  font-family: 'Courier New', monospace;
  font-weight: 700;
}

.font-bold {
  font-weight: 700;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-danger {
  background: #fee2e2;
  color: #991b1b;
}

.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.info-card {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 2px solid #bbf7d0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #bbf7d0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row.highlight {
  background: white;
  margin: 12px -20px -20px;
  padding: 16px 20px;
  border-radius: 0 0 10px 10px;
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #166534;
}

.info-value {
  font-weight: 700;
  color: #14532d;
}

.quick-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn-quick {
  padding: 6px 12px;
  background: #e0e7ff;
  color: #3730a3;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-quick:hover {
  background: #c7d2fe;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #f3f4f6;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.input-wrapper-rupiah {
  position: relative;
  display: flex;
  align-items: center;
}

.rupiah-prefix {
  position: absolute;
  left: 16px;
  font-weight: 700;
  color: #10b981;
  font-size: 16px;
  z-index: 1;
  pointer-events: none;
}

.form-control-rupiah {
  padding-left: 48px !important;
  font-weight: 700;
  font-size: 18px;
  color: #10b981;
  text-align: right;
  letter-spacing: 0.5px;
}

.form-control-rupiah:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
}

.form-control-rupiah::placeholder {
  color: #d1d5db;
  font-weight: 400;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

<style>
/* ============================================
   CHOICES.JS GLOBAL STYLING (UNSCOPED)
   ============================================ */
.choices__list--dropdown,
.choices__list[aria-expanded] {
  max-height: 300px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
}

.choices[data-type*="select-one"] .choices__list--dropdown {
  max-height: 300px !important;
  overflow-y: auto !important;
}

.choices__list--dropdown .choices__list {
  max-height: 300px !important;
}

.choices__list--dropdown .choices__item--selectable {
  padding: 12px 16px;
  font-size: 14px;
}

.choices__list--dropdown .choices__item--selectable.is-highlighted {
  background-color: #10b981 !important;
  color: white;
}
</style>
