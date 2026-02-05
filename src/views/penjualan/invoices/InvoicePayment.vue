<template>
  <div class="invoice-payment">
    <!-- Hero Header -->
    <div class="hero-header">
      <div class="header-content">
        <div class="header-icon">
          <i class="fas fa-credit-card"></i>
        </div>
        <div>
          <h1 class="page-title">Terima Pembayaran</h1>
          <p class="page-subtitle">Invoice #{{ invoice.invoice_number || 'Loading...' }}</p>
        </div>
      </div>
      <button @click="goBack" class="btn btn-secondary btn-icon-left">
        <i class="fas fa-arrow-left"></i>
        <span>Kembali</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-hero">
      <div class="spinner spinner-xl"></div>
      <p>Memuat invoice...</p>
    </div>

    <!-- Main Content -->
    <div v-else-if="invoice.id" class="main-content">
      <!-- Invoice Summary Hero -->
      <div class="summary-hero">
        <div class="summary-left">
          <div class="customer-info">
            <div class="customer-avatar">
              <i class="fas fa-user"></i>
            </div>
            <h3>{{ invoice.buyer.name }}</h3>
            <p>{{ invoice.invoice_number }}</p>
          </div>
        </div>

        <div class="summary-right">
          <div class="amount-card total-due">
            <div class="amount-label">Sisa Tagihan</div>
            <div class="amount-value danger">
              {{ formatRupiah(invoice.remaining_amount) }}
            </div>
          </div>
          <div class="amount-progress">
            <div class="progress-bg">
              <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
            <div class="progress-labels">
              <span>{{ formatRupiah(invoice.paid_amount) }} <small>terbayar</small></span>
              <span>/ {{ formatRupiah(invoice.grand_total_idr) }} <small>total</small></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Type Tabs -->
      <div class="payment-tabs-card">
        <div class="tabs-header">
          <button
            @click="selectPaymentType('CASH')"
            class="tab-btn"
            :class="{ active: paymentType === 'CASH' }"
          >
            <i class="fas fa-money-bill-wave"></i>
            <span>Tunai / Transfer</span>
          </button>
          <button
            @click="selectPaymentType('DP')"
            class="tab-btn"
            :class="{ active: paymentType === 'DP' }"
          >
            <i class="fas fa-piggy-bank"></i>
            <span>Potong DP</span>
          </button>
        </div>

        <!-- Cash Payment Form -->
        <div v-if="paymentType === 'CASH'" class="payment-form">
          <div class="form-section">
            <div class="form-header">
              <i class="fas fa-cash-register"></i>
              <h3>Pembayaran Tunai / Transfer</h3>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label required">Tanggal</label>
                <input v-model="cashForm.payment_date" type="date" class="form-input" required />
              </div>

              <div class="form-group">
                <label class="form-label required">Jumlah</label>
                <div class="input-group">
                  <span class="input-prefix">Rp</span>
                  <input
                    v-model.number="cashForm.amount"
                    type="number"
                    class="form-input"
                    :max="Math.round(invoice.remaining_amount)"
                    placeholder="0"
                    required
                  />
                  <small class="input-hint"
                    >Max: {{ formatRupiah(invoice.remaining_amount) }}</small
                  >
                </div>
              </div>

              <div class="form-group">
                <label class="form-label required">Akun Kas/Bank</label>
                <div class="select-wrapper">
                  <select v-model="cashForm.account_id" class="form-input" required>
                    <option value="">Pilih akun...</option>
                    <option
                      v-for="account in cashBankAccounts"
                      :key="account.id"
                      :value="account.id"
                    >
                      {{ account.code }} - {{ account.name }}
                    </option>
                  </select>
                  <i class="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>

            <div class="form-group full">
              <label class="form-label">Catatan</label>
              <textarea
                v-model="cashForm.notes"
                class="form-input textarea"
                rows="3"
                placeholder="Catatan pembayaran..."
              ></textarea>
            </div>

            <div class="form-actions">
              <button
                @click="submitCashPayment"
                :disabled="submitting || !isCashFormValid"
                class="btn btn-primary btn-lg"
              >
                <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-save"></i>
                {{ submitting ? 'Menyimpan...' : 'Simpan Pembayaran' }}
              </button>
            </div>
          </div>
        </div>

        <!-- DP Deduction Form -->
        <div v-if="paymentType === 'DP'" class="payment-form">
          <div class="form-section">
            <div class="form-header">
              <i class="fas fa-piggy-bank"></i>
              <h3>Potong Uang Muka</h3>
            </div>

            <!-- DP Selection -->
            <div v-if="loadingDPs" class="loading-section">
              <div class="spinner spinner-md"></div>
              <p>Memuat uang muka...</p>
            </div>

            <div v-else-if="availableDPs.length === 0" class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>Tidak ada uang muka tersedia</p>
            </div>

            <div v-else class="dp-selector-section">
              <div class="form-group">
                <label class="form-label required">Pilih DP</label>
                <div class="select-wrapper">
                  <select
                    v-model="dpForm.down_payment_id"
                    @change="onDPSelected"
                    class="form-input"
                    required
                  >
                    <option value="">Pilih uang muka...</option>
                    <option v-for="dp in availableDPs" :key="dp.id" :value="dp.id">
                      {{ dp.dp_number }} - Sisa: {{ formatRupiah(dp.remaining_amount) }} (SO:
                      {{ dp.sales_order?.so_number || '-' }})
                    </option>
                  </select>
                  <i class="fas fa-chevron-down"></i>
                </div>
              </div>

              <!-- Selected DP Info -->
              <div v-if="selectedDP" class="selected-dp-card">
                <div class="dp-header">
                  <h4>{{ selectedDP.dp_number }}</h4>
                  <div class="dp-remaining">
                    Sisa: {{ formatRupiah(selectedDP.remaining_amount) }}
                  </div>
                </div>
                <div class="dp-details-grid">
                  <div class="dp-detail">
                    <span>Total DP</span>
                    <span>{{ formatRupiah(selectedDP.amount_idr) }}</span>
                  </div>
                  <div class="dp-detail">
                    <span>Sudah Dipakai</span>
                    <span>{{ formatRupiah(selectedDP.used_amount) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Amount Input -->
            <div class="form-group">
              <label class="form-label required">Jumlah Dipotong</label>
              <div class="input-group">
                <span class="input-prefix">Rp</span>
                <input
                  v-model.number="dpForm.amount"
                  type="number"
                  class="form-input"
                  :max="Math.round(maxDPAmount)"
                  placeholder="0"
                  required
                />
                <small class="input-hint">Max: {{ formatRupiah(maxDPAmount) }}</small>
              </div>
            </div>

            <div class="form-group full">
              <label class="form-label">Catatan</label>
              <textarea
                v-model="dpForm.notes"
                class="form-input textarea"
                rows="3"
                placeholder="Catatan pemotongan..."
              ></textarea>
            </div>

            <div class="form-actions">
              <button
                @click="submitDPDeduction"
                :disabled="submitting || !isDPFormValid"
                class="btn btn-warning btn-lg"
              >
                <i class="fas fa-cut"></i>
                {{ submitting ? 'Memproses...' : 'Potong DP' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment History -->
      <div class="history-card">
        <div class="history-header">
          <div class="history-left">
            <i class="fas fa-history"></i>
            <h3>Riwayat Pembayaran</h3>
          </div>
          <span class="history-count">{{ payments.length }} transaksi</span>
        </div>

        <div v-if="loadingPayments" class="loading-section">
          <div class="spinner spinner-md"></div>
          <p>Memuat riwayat...</p>
        </div>

        <div v-else-if="payments.length === 0" class="empty-state">
          <i class="fas fa-receipt"></i>
          <p>Belum ada pembayaran</p>
        </div>

        <div v-else class="history-list">
          <div v-for="payment in payments" :key="payment.id" class="history-item">
            <div class="history-main">
              <div class="history-icon" :class="payment.payment_type">
                <i v-if="payment.payment_type === 'CASH'" class="fas fa-money-bill"></i>
                <i v-else class="fas fa-piggy-bank"></i>
              </div>
              <div class="history-content">
                <div class="history-title">{{ payment.payment_number }}</div>
                <div class="history-meta">
                  <span>{{ formatDate(payment.payment_date) }}</span>
                  <span>{{ payment.account?.account_name || '-' }}</span>
                </div>
              </div>
            </div>
            <div class="history-amount">
              {{ formatRupiah(payment.amount) }}
              <div class="history-type" :class="payment.payment_type.toLowerCase()">
                {{ payment.payment_type === 'CASH' ? 'Tunai' : 'DP' }}
              </div>
            </div>
            <div v-if="payment.notes" class="history-notes">
              {{ payment.notes }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from '@/api/axios'

export default {
  name: 'InvoicePayment',

  data() {
    return {
      invoice: {},
      cashBankAccounts: [],
      availableDPs: [],
      selectedDP: null,
      payments: [],
      loading: false,
      loadingDPs: false,
      loadingPayments: false,
      submitting: false,
      paymentType: 'CASH',
      cashForm: {
        sales_invoice_id: null,
        payment_date: new Date().toISOString().split('T')[0],
        amount: 0,
        account_id: '',
        notes: '',
      },
      dpForm: {
        sales_invoice_id: null,
        down_payment_id: '',
        amount: 0,
        notes: '',
      },
    }
  },

  computed: {
    isCashFormValid() {
      return (
        this.cashForm.payment_date &&
        this.cashForm.amount > 0 &&
        this.cashForm.amount <= this.invoice.remaining_amount &&
        this.cashForm.account_id
      )
    },

    isDPFormValid() {
      return (
        this.dpForm.down_payment_id &&
        this.dpForm.amount > 0 &&
        this.dpForm.amount <= this.maxDPAmount
      )
    },

    maxDPAmount() {
      return Math.min(this.selectedDP?.remaining_amount || 0, this.invoice.remaining_amount || 0)
    },

    progressPercentage() {
      if (!this.invoice.total_idr || this.invoice.total_idr === 0) return 0
      return (this.invoice.paid_amount / this.invoice.total_idr) * 100
    },
  },

  mounted() {
    const invoiceId = this.$route.params.id
    this.cashForm.sales_invoice_id = invoiceId
    this.dpForm.sales_invoice_id = invoiceId
    this.loadInvoice()
    this.loadCashBankAccounts()
    this.loadPaymentHistory()
  },

  methods: {
    async loadInvoice() {
      this.loading = true
      try {
        const id = this.$route.params.id
        const response = await apiClient.get(`/sales-invoices/${id}`)

        // Handle response format
        this.invoice = response.data.data || response.data

        console.log('Invoice loaded:', this.invoice)

        // Set default cash amount
        this.cashForm.amount = Math.round(this.invoice.remaining_amount || 0)
      } catch (error) {
        console.error('Error loading invoice:', error)
        this.$toast?.error('Gagal memuat invoice')
      } finally {
        this.loading = false
      }
    },

    async loadCashBankAccounts() {
      try {
        // Try different endpoints
        let response
        try {
          response = await apiClient.get('/chart-of-accounts', {
            params: { type: 'ASET', is_active: 1 },
          })
        } catch {
          response = await apiClient.get('/coa', {
            params: { is_active: 1 },
          })
        }

        const accounts = response.data.data || response.data || []

        // Filter kas/bank accounts
        this.cashBankAccounts = accounts.filter(
          (acc) =>
            acc.code?.startsWith('1-1') || // Kas & Bank codes usually start with 1-1
            acc.name?.toLowerCase().includes('kas') ||
            acc.name?.toLowerCase().includes('bank'),
        )

        console.log('Cash/Bank accounts:', this.cashBankAccounts)
      } catch (error) {
        console.error('Error loading cash/bank accounts:', error)
      }
    },

    async loadAvailableDPs() {
      this.loadingDPs = true
      try {
        console.log('Loading DPs for invoice:', this.$route.params.id)

        // Use the correct endpoint
        const response = await apiClient.get(
          `/sales-invoices/${this.$route.params.id}/down-payments`,
        )

        console.log('DP Response:', response.data)

        this.availableDPs = response.data.data || response.data || []

        console.log('Available DPs:', this.availableDPs)

        if (this.availableDPs.length === 0) {
          console.log('No DPs available for this invoice')
        }
      } catch (error) {
        console.error('Error loading DPs:', error)
        console.error('Error response:', error.response)
        this.$toast?.error('Gagal memuat data uang muka')
      } finally {
        this.loadingDPs = false
      }
    },

    async loadPaymentHistory() {
      this.loadingPayments = true
      try {
        const response = await apiClient.get('/invoice-payments', {
          params: { sales_invoice_id: this.$route.params.id },
        })
        this.payments = response.data.data || response.data || []
      } catch (error) {
        console.error('Error loading payment history:', error)
      } finally {
        this.loadingPayments = false
      }
    },

    selectPaymentType(type) {
      this.paymentType = type
      if (type === 'DP' && this.availableDPs.length === 0 && !this.loadingDPs) {
        this.loadAvailableDPs()
      }
    },

    onDPSelected() {
      const dpId = this.dpForm.down_payment_id
      this.selectedDP = this.availableDPs.find((dp) => dp.id == dpId)
      if (this.selectedDP) {
        this.dpForm.amount = Math.round(
          Math.min(this.selectedDP.remaining_amount, this.invoice.remaining_amount),
        )
      }
    },

    async submitCashPayment() {
      if (!this.isCashFormValid) {
        this.$toast?.error('Lengkapi form pembayaran')
        return
      }

      this.submitting = true
      try {
        await apiClient.post('/invoice-payments/cash', this.cashForm)
        this.$toast?.success('Pembayaran berhasil dicatat!')
        this.$router.push(`/admin/penjualan/invoices`)
      } catch (error) {
        console.error('Error submitting payment:', error)
        this.$toast?.error(error.response?.data?.message || 'Gagal mencatat pembayaran')
      } finally {
        this.submitting = false
      }
    },

    async submitDPDeduction() {
      if (!this.isDPFormValid) {
        this.$toast?.error('Lengkapi form pemotongan DP')
        return
      }

      this.submitting = true
      try {
        await apiClient.post('/invoice-payments/down-payment', this.dpForm)
        this.$toast?.success('Pemotongan DP berhasil!')
        this.$router.push(`/admin/penjualan/invoices`)
      } catch (error) {
        console.error('Error submitting DP deduction:', error)
        this.$toast?.error(error.response?.data?.message || 'Gagal memotong DP')
      } finally {
        this.submitting = false
      }
    },

    goBack() {
      this.$router.push('/admin/penjualan/invoices')
    },

    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('id-ID')
    },

    formatRupiah(amount) {
      if (!amount) return 'Rp 0'
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    },
  },
}
</script>

<style scoped>
.invoice-payment {
  padding: 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

/* Hero Header */
.hero-header {
  background: white;
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.page-subtitle {
  color: #64748b;
  font-size: 16px;
  margin: 0;
}

/* Summary Hero */
.summary-hero {
  background: white;
  border-radius: 24px;
  padding: 40px;
  margin-bottom: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.customer-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  flex-shrink: 0;
}

.customer-info h3 {
  margin: 0;
  font-size: 24px;
  color: #1e293b;
}

.customer-info p {
  margin: 4px 0 0 0;
  color: #64748b;
  font-size: 16px;
}

.amount-card {
  text-align: right;
}

.amount-label {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
}

.amount-value {
  font-size: 48px;
  font-weight: 800;
  line-height: 1;
}

.amount-value.danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.amount-progress {
  margin-top: 24px;
}

.progress-bg {
  height: 12px;
  background: #f1f5f9;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 6px;
  transition: width 0.5s ease;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #64748b;
}

.progress-labels small {
  font-weight: 500;
}

/* Payment Tabs */
.payment-tabs-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
}

.tabs-header {
  display: flex;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
}

.tab-btn {
  flex: 1;
  padding: 20px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: #64748b;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
}

.tab-btn:hover {
  color: #3b82f6;
}

.tab-btn.active {
  color: #3b82f6;
  background: white;
  border-bottom-color: #3b82f6;
}

.tab-btn i {
  font-size: 20px;
  width: 24px;
}

/* Payment Forms */
.payment-form {
  padding: 40px;
}

.form-section {
  max-width: 600px;
  margin: 0 auto;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.form-header i {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.form-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

.required::after {
  content: ' *';
  color: #ef4444;
}

.form-input {
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.textarea {
  resize: vertical;
  min-height: 100px;
}

.input-group {
  position: relative;
}

.input-prefix {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-weight: 600;
  pointer-events: none;
}

.input-hint {
  margin-top: 8px;
  font-size: 13px;
  color: #9ca3af;
  font-weight: 500;
}

.select-wrapper {
  position: relative;
}

.select-wrapper i {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}

.form-input option {
  padding: 12px;
}

/* Selected DP Card */
.selected-dp-card {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1px solid #10b981;
  border-radius: 16px;
  padding: 24px;
  margin: 24px 0;
}

.dp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.dp-header h4 {
  margin: 0;
  color: #166534;
  font-weight: 700;
}

.dp-remaining {
  background: rgba(16, 185, 129, 0.2);
  color: #166534;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 13px;
}

.dp-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  font-size: 14px;
}

.dp-detail span:first-child {
  color: #64748b;
  font-weight: 500;
}

.dp-detail span:last-child {
  font-weight: 700;
  color: #1e293b;
}

/* Empty & Loading States */
.loading-section,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  text-align: center;
  color: #64748b;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.spinner-md {
  width: 36px;
  height: 36px;
  border-width: 3px;
}

.loading-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #64748b;
}

.spinner-xl {
  width: 72px;
  height: 72px;
  border-width: 5px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  box-shadow: 0 4px 14px 0 rgba(0, 0, 0, 0.1);
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.btn-secondary {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
}

.btn-lg {
  padding: 20px 40px;
  font-size: 16px;
}

.form-actions {
  margin-top: 40px;
  text-align: center;
}

/* History Card */
.history-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
}

.history-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.history-left i {
  color: #64748b;
  font-size: 20px;
}

.history-left h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.history-count {
  background: #e2e8f0;
  color: #64748b;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
}

.history-list {
  padding: 40px;
}

.history-item {
  display: flex;
  flex-direction: column;
  padding: 24px;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  margin-bottom: 16px;
  transition: all 0.3s;
}

.history-item:hover {
  border-color: #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.history-main {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.history-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
}

.history-icon.cash {
  background: linear-gradient(135deg, #10b981, #059669);
}
.history-icon.dp {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.history-content {
  flex: 1;
}

.history-title {
  font-weight: 700;
  color: #1e293b;
  font-size: 16px;
  margin-bottom: 4px;
}

.history-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #64748b;
}

.history-amount {
  font-size: 24px;
  font-weight: 800;
  color: #059669;
  margin-bottom: 8px;
}

.history-type {
  background: rgba(16, 185, 129, 0.2);
  color: #166534;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  width: fit-content;
}

.history-notes {
  color: #64748b;
  font-size: 14px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

/* Responsive */
@media (max-width: 768px) {
  .invoice-payment {
    padding: 20px;
  }

  .summary-hero {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 32px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .hero-header {
    flex-direction: column;
    gap: 24px;
    align-items: stretch;
  }

  .history-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .tabs-header {
    flex-direction: column;
  }
}
</style>
