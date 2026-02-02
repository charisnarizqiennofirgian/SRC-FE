<template>
  <div class="invoice-payment">
    <!-- Header -->
    <div class="page-header">
      <h1>Terima Pembayaran Invoice</h1>
      <button @click="goBack" class="btn btn-secondary">
        <i class="fas fa-arrow-left"></i> Kembali
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>

    <!-- Payment Form -->
    <div v-else-if="invoice.id" class="payment-content">
      <!-- Invoice Summary -->
      <div class="card">
        <div class="card-header">
          <h3>Informasi Invoice</h3>
        </div>
        <div class="card-body">
          <div class="invoice-summary">
            <div class="summary-item">
              <span class="label">No. Invoice:</span>
              <span class="value">{{ invoice.invoice_number }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Customer:</span>
              <span class="value">{{ invoice.buyer.name }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total Tagihan:</span>
              <span class="value">{{ formatRupiah(invoice.grand_total_idr) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Sudah Dibayar:</span>
              <span class="value text-success">{{ formatRupiah(invoice.paid_amount) }}</span>
            </div>
            <div class="summary-item total">
              <span class="label">Sisa Tagihan:</span>
              <span class="value text-danger">{{ formatRupiah(invoice.remaining_amount) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Type Selection -->
      <div class="card mt-3">
        <div class="card-header">
          <h3>Tipe Pembayaran</h3>
        </div>
        <div class="card-body">
          <div class="payment-type-selector">
            <button
              @click="selectPaymentType('CASH')"
              class="payment-type-btn"
              :class="{ active: paymentType === 'CASH' }"
            >
              <i class="fas fa-money-bill-wave"></i>
              <span>Tunai / Transfer</span>
            </button>
            <button
              @click="selectPaymentType('DP')"
              class="payment-type-btn"
              :class="{ active: paymentType === 'DP' }"
            >
              <i class="fas fa-piggy-bank"></i>
              <span>Potong Uang Muka (DP)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Cash Payment Form -->
      <div v-if="paymentType === 'CASH'" class="card mt-3">
        <div class="card-header">
          <h3>Form Pembayaran Tunai/Transfer</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>Tanggal Pembayaran <span class="text-danger">*</span></label>
            <input v-model="cashForm.payment_date" type="date" class="form-control" required />
          </div>

          <div class="form-group">
            <label>Jumlah Pembayaran <span class="text-danger">*</span></label>
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text">Rp</span>
              </div>
              <input
                v-model.number="cashForm.amount"
                type="number"
                step="1000"
                class="form-control"
                placeholder="0"
                :max="invoice.remaining_amount"
                required
              />
            </div>
            <small class="text-muted">
              Maksimal: {{ formatRupiah(invoice.remaining_amount) }}
            </small>
          </div>

          <div class="form-group">
            <label>Akun Kas/Bank (COA) <span class="text-danger">*</span></label>
            <select v-model="cashForm.account_id" class="form-control" required>
              <option value="">-- Pilih Akun Kas/Bank --</option>
              <option v-for="account in cashBankAccounts" :key="account.id" :value="account.id">
                {{ account.code }} - {{ account.account_name }}
              </option>
            </select>
            <small class="text-muted">Pilih akun kas atau bank untuk pencatatan</small>
          </div>

          <div class="form-group">
            <label>Catatan</label>
            <textarea
              v-model="cashForm.notes"
              class="form-control"
              rows="3"
              placeholder="Catatan pembayaran (opsional)..."
            ></textarea>
          </div>

          <div class="form-actions">
            <button
              @click="submitCashPayment"
              :disabled="submitting || !isCashFormValid"
              class="btn btn-primary btn-lg"
            >
              <i class="fas fa-save"></i>
              {{ submitting ? 'Menyimpan...' : 'Simpan Pembayaran' }}
            </button>
          </div>
        </div>
      </div>

      <!-- DP Deduction Form -->
      <div v-if="paymentType === 'DP'" class="card mt-3">
        <div class="card-header">
          <h3>Potong Uang Muka (DP)</h3>
        </div>
        <div class="card-body">
          <!-- Loading DPs -->
          <div v-if="loadingDPs" class="loading">
            <i class="fas fa-spinner fa-spin"></i> Loading down payments...
          </div>

          <!-- No Available DPs -->
          <div v-else-if="availableDPs.length === 0" class="alert alert-info">
            Tidak ada uang muka tersedia untuk customer ini
          </div>

          <!-- DP List -->
          <div v-else>
            <div class="form-group">
              <label>Pilih Uang Muka <span class="text-danger">*</span></label>
              <select
                v-model="dpForm.down_payment_id"
                @change="onDPSelected"
                class="form-control"
                required
              >
                <option value="">-- Pilih DP --</option>
                <option v-for="dp in availableDPs" :key="dp.id" :value="dp.id">
                  {{ dp.dp_number }} - Sisa: {{ formatRupiah(dp.remaining_amount) }} (Dari SO:
                  {{ dp.sales_order.so_number }})
                </option>
              </select>
            </div>

            <div v-if="selectedDP" class="dp-info">
              <h4>Informasi DP Terpilih</h4>
              <p><strong>Nomor DP:</strong> {{ selectedDP.dp_number }}</p>
              <p><strong>Tanggal:</strong> {{ formatDate(selectedDP.payment_date) }}</p>
              <p><strong>Total DP:</strong> {{ formatRupiah(selectedDP.amount_idr) }}</p>
              <p><strong>Sudah Dipakai:</strong> {{ formatRupiah(selectedDP.used_amount) }}</p>
              <p>
                <strong>Sisa DP:</strong>
                <span class="text-success">{{ formatRupiah(selectedDP.remaining_amount) }}</span>
              </p>
            </div>

            <div class="form-group">
              <label>Jumlah yang Dipotong <span class="text-danger">*</span></label>
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text">Rp</span>
                </div>
                <input
                  v-model.number="dpForm.amount"
                  type="number"
                  step="1000"
                  class="form-control"
                  placeholder="0"
                  :max="maxDPAmount"
                  required
                />
              </div>
              <small class="text-muted"> Maksimal: {{ formatRupiah(maxDPAmount) }} </small>
            </div>

            <div class="form-group">
              <label>Catatan</label>
              <textarea
                v-model="dpForm.notes"
                class="form-control"
                rows="3"
                placeholder="Catatan pemotongan DP (opsional)..."
              ></textarea>
            </div>

            <div class="form-actions">
              <button
                @click="submitDPDeduction"
                :disabled="submitting || !isDPFormValid"
                class="btn btn-primary btn-lg"
              >
                <i class="fas fa-cut"></i>
                {{ submitting ? 'Memproses...' : 'Potong DP' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment History -->
      <div v-if="invoice.id" class="card mt-3">
        <div class="card-header">
          <h3>Riwayat Pembayaran</h3>
        </div>
        <div class="card-body">
          <div v-if="loadingPayments" class="loading">
            <i class="fas fa-spinner fa-spin"></i> Loading...
          </div>
          <div v-else-if="payments.length === 0" class="alert alert-info">
            Belum ada pembayaran untuk invoice ini
          </div>
          <table v-else class="table table-bordered">
            <thead>
              <tr>
                <th>No. Pembayaran</th>
                <th>Tanggal</th>
                <th>Tipe</th>
                <th>Jumlah</th>
                <th>Akun</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in payments" :key="payment.id">
                <td>{{ payment.payment_number }}</td>
                <td>{{ formatDate(payment.payment_date) }}</td>
                <td>
                  <span v-if="payment.payment_type === 'CASH'" class="badge badge-success"
                    >Tunai</span
                  >
                  <span v-else class="badge badge-warning">Potong DP</span>
                </td>
                <td class="text-right">{{ formatRupiah(payment.amount) }}</td>
                <td>{{ payment.account?.account_name || '-' }}</td>
                <td>{{ payment.notes || '-' }}</td>
              </tr>
            </tbody>
          </table>
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
      if (!this.selectedDP) return 0
      return Math.min(this.selectedDP.remaining_amount, this.invoice.remaining_amount)
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
        this.invoice = response.data

        this.cashForm.amount = this.invoice.remaining_amount
      } catch (error) {
        console.error('Error loading invoice:', error)
        alert('Gagal memuat data invoice')
      } finally {
        this.loading = false
      }
    },

    async loadCashBankAccounts() {
      try {
        const response = await apiClient.get('/coa', {
          params: {
            account_type: 'CASH,BANK',
            is_active: 1,
          },
        })
        this.cashBankAccounts = response.data.data || response.data || []
      } catch (error) {
        console.error('Error loading COA:', error)
        this.cashBankAccounts = []
      }
    },

    async loadAvailableDPs() {
      this.loadingDPs = true
      try {
        const response = await apiClient.get(`/down-payments/available/${this.invoice.buyer_id}`)
        this.availableDPs = response.data
      } catch (error) {
        console.error('Error loading DPs:', error)
        alert('Gagal memuat data uang muka')
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
        this.payments = response.data.data || []
      } catch (error) {
        console.error('Error loading payment history:', error)
      } finally {
        this.loadingPayments = false
      }
    },

    selectPaymentType(type) {
      this.paymentType = type

      if (type === 'DP' && this.availableDPs.length === 0) {
        this.loadAvailableDPs()
      }
    },

    onDPSelected() {
      const dpId = this.dpForm.down_payment_id
      this.selectedDP = this.availableDPs.find((dp) => dp.id == dpId)

      if (this.selectedDP) {
        this.dpForm.amount = Math.min(
          this.selectedDP.remaining_amount,
          this.invoice.remaining_amount,
        )
      }
    },

    async submitCashPayment() {
      if (!this.isCashFormValid) {
        alert('Mohon lengkapi form dengan benar')
        return
      }

      this.submitting = true
      try {
        await apiClient.post('/invoice-payments/cash', this.cashForm)

        alert('Pembayaran berhasil dicatat!')
        this.$router.push(`/admin/penjualan/invoices/${this.invoice.id}`)
      } catch (error) {
        console.error('Error submitting payment:', error)
        alert(error.response?.data?.message || 'Gagal mencatat pembayaran')
      } finally {
        this.submitting = false
      }
    },

    async submitDPDeduction() {
      if (!this.isDPFormValid) {
        alert('Mohon lengkapi form dengan benar')
        return
      }

      this.submitting = true
      try {
        await apiClient.post('/invoice-payments/deduct-dp', this.dpForm)

        alert('Pemotongan DP berhasil!')
        this.$router.push(`/admin/penjualan/invoices/${this.invoice.id}`)
      } catch (error) {
        console.error('Error submitting DP deduction:', error)
        alert(error.response?.data?.message || 'Gagal memotong DP')
      } finally {
        this.submitting = false
      }
    },

    goBack() {
      this.$router.push(`/admin/penjualan/invoices/${this.invoice.id}`)
    },

    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('id-ID')
    },

    formatRupiah(amount) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount)
    },
  },
}
</script>

<style scoped>
/* CSS SAMA, tidak ada perubahan */
.invoice-payment {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ddd;
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.card-body {
  padding: 20px;
}

.invoice-summary {
  max-width: 500px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.summary-item.total {
  border-bottom: none;
  border-top: 2px solid #333;
  font-size: 1.2em;
  font-weight: bold;
  margin-top: 10px;
  padding-top: 15px;
}

.summary-item .label {
  font-weight: 600;
}

.summary-item .value {
  font-weight: bold;
}

.payment-type-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.payment-type-btn {
  padding: 20px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.payment-type-btn:hover {
  border-color: #007bff;
  background-color: #f8f9ff;
}

.payment-type-btn.active {
  border-color: #007bff;
  background-color: #e7f1ff;
}

.payment-type-btn i {
  font-size: 2em;
  color: #007bff;
}

.payment-type-btn span {
  font-weight: 600;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.text-danger {
  color: #dc3545;
}

.text-success {
  color: #28a745;
}

.text-muted {
  color: #6c757d;
  font-size: 0.9em;
}

.input-group {
  display: flex;
}

.input-group-prepend {
  display: flex;
}

.input-group-text {
  padding: 8px 12px;
  background-color: #e9ecef;
  border: 1px solid #ced4da;
  border-right: 0;
  border-radius: 4px 0 0 4px;
}

.input-group .form-control {
  border-radius: 0 4px 4px 0;
}

.dp-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
}

.dp-info h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.dp-info p {
  margin: 5px 0;
}

.form-actions {
  margin-top: 30px;
  text-align: right;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-lg {
  padding: 12px 30px;
  font-size: 1.1rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 10px;
  text-align: left;
  border: 1px solid #ddd;
}

.table thead th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.text-right {
  text-align: right;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 500;
}

.badge-success {
  background-color: #28a745;
  color: white;
}

.badge-warning {
  background-color: #ffc107;
  color: #212529;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.alert {
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.alert-info {
  background-color: #d1ecf1;
  border: 1px solid #bee5eb;
  color: #0c5460;
}

.mt-3 {
  margin-top: 1rem;
}
</style>
