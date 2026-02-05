<template>
  <div class="invoice-detail">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <i class="fas fa-file-invoice-dollar"></i>
        </div>
        <div class="header-text">
          <h1 class="page-title">Detail Invoice</h1>
          <p class="page-subtitle">#{{ invoice.invoice_number || 'Loading...' }}</p>
        </div>
      </div>

      <div class="header-actions">
        <button @click="goBack" class="btn btn-secondary btn-icon-left">
          <i class="fas fa-arrow-left"></i>
          <span>Kembali</span>
        </button>

        <button
          v-if="invoice.status === 'DRAFT'"
          @click="postInvoice"
          :disabled="loading"
          class="btn btn-success"
        >
          <i class="fas fa-spinner fa-spin" v-if="loading"></i>
          <i class="fas fa-check-circle" v-else></i>
          <span v-if="loading">Memproses...</span>
          <span v-else>Post Invoice</span>
        </button>

        <button
          v-if="invoice.status === 'POSTED' && invoice.payment_status !== 'PAID'"
          @click="goToPayment"
          class="btn btn-primary btn-lg"
        >
          <i class="fas fa-money-bill-wave"></i>
          Terima Pembayaran
        </button>

        <div
          v-if="invoice.status"
          class="status-badge-large"
          :class="getStatusClass(invoice.status)"
        >
          {{ getStatusText(invoice.status) }}
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner spinner-lg"></div>
      <p>Memuat detail invoice...</p>
    </div>

    <!-- Main Content -->
    <div v-else-if="invoice.id" class="main-content">
      <!-- Invoice Header Card -->
      <div class="invoice-header-card">
        <div class="invoice-header-top">
          <div class="invoice-info">
            <h2 class="invoice-number">{{ invoice.invoice_number }}</h2>
            <div class="invoice-meta">
              <span class="meta-item">
                <i class="fas fa-calendar"></i>
                {{ formatDate(invoice.invoice_date) }}
              </span>
              <span class="meta-item">
                <i class="fas fa-calendar-alt"></i>
                Jatuh Tempo: {{ formatDate(invoice.due_date) }}
              </span>
              <span class="meta-item">
                <i class="fas fa-dollar-sign"></i>
                {{ invoice.currency }}
              </span>
            </div>
          </div>

          <div class="status-container">
            <div class="status-badge" :class="getPaymentStatusClass(invoice.payment_status)">
              {{ getPaymentStatusText(invoice.payment_status) }}
            </div>
            <div class="status-badge" :class="getStatusClass(invoice.status)">
              {{ getStatusText(invoice.status) }}
            </div>
          </div>
        </div>

        <!-- Customer & Info Grid -->
        <div class="info-grid">
          <div class="info-card customer-card">
            <div class="info-card-header">
              <i class="fas fa-user"></i>
              <h4>Customer</h4>
            </div>
            <div class="info-content">
              <div class="info-row">
                <span class="info-label">Nama</span>
                <span class="info-value">{{ invoice.buyer?.name || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">{{ invoice.buyer?.email || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Telepon</span>
                <span class="info-value">{{ invoice.buyer?.phone || '-' }}</span>
              </div>
              <div class="info-row full-width">
                <span class="info-label">Alamat</span>
                <div class="info-value multiline">{{ invoice.buyer?.address || '-' }}</div>
              </div>
            </div>
          </div>

          <div class="info-card">
            <div class="info-card-header">
              <i class="fas fa-info-circle"></i>
              <h4>Informasi Invoice</h4>
            </div>
            <div class="info-content">
              <div class="info-row">
                <span class="info-label">Kurs</span>
                <span class="info-value">{{ formatKurs(invoice.exchange_rate) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Sales Order</span>
                <span class="info-value">{{ invoice.sales_order?.so_number || '-' }}</span>
              </div>
              <div class="info-row" v-if="invoice.delivery_order">
                <span class="info-label">Delivery Order</span>
                <span class="info-value">{{ invoice.delivery_order.do_number }}</span>
              </div>
              <div class="info-row" v-if="invoice.notes">
                <span class="info-label">Catatan</span>
                <div class="info-value multiline">{{ invoice.notes }}</div>
              </div>
            </div>
          </div>

          <!-- Payment Summary Card -->
          <div class="info-card summary-card">
            <div class="info-card-header">
              <i class="fas fa-chart-pie"></i>
              <h4>Ringkasan Pembayaran</h4>
            </div>
            <div class="summary-content">
              <div class="summary-item">
                <span class="summary-label">Total Tagihan</span>
                <span class="summary-value primary">{{ formatRupiah(invoice.total_idr) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Sudah Dibayar</span>
                <span class="summary-value success">{{ formatRupiah(invoice.paid_amount) }}</span>
              </div>
              <div class="summary-item total-row">
                <span class="summary-label bold">Sisa Tagihan</span>
                <span
                  class="summary-value"
                  :class="invoice.remaining_amount > 0 ? 'danger' : 'success'"
                >
                  {{ formatRupiah(invoice.remaining_amount) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div class="table-card">
        <div class="table-header">
          <div class="table-header-left">
            <i class="fas fa-list"></i>
            <h3>Detail Items</h3>
          </div>
          <div class="table-stats">
            <span class="stat-item">{{ invoice.details?.length || 0 }} items</span>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Kode</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Harga ({{ invoice.currency }})</th>
                <th>Subtotal ({{ invoice.currency }})</th>
                <th>Subtotal IDR</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="detail in invoice.details" :key="detail.id" class="table-row">
                <td class="item-name">{{ detail.item_name }}</td>
                <td>{{ detail.item_code }}</td>
                <td class="qty">{{ formatQty(detail.quantity) }}</td>
                <td>{{ detail.item_unit }}</td>
                <td class="price">
                  {{ formatCurrency(detail.unit_price_original, invoice.currency) }}
                </td>
                <td class="subtotal">
                  {{ formatCurrency(detail.subtotal_original, invoice.currency) }}
                </td>
                <td class="subtotal-idr">{{ formatRupiah(detail.subtotal_idr) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Totals Footer -->
        <div class="totals-footer">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>{{ formatCurrency(subtotalCurrency, invoice.currency) }}</span>
            <span>{{ formatRupiah(invoice.subtotal_idr) }}</span>
          </div>
          <div class="totals-row">
            <span>PPN {{ taxRate }}%</span>
            <span>{{ formatCurrency(taxAmountCurrency, invoice.currency) }}</span>
            <span>{{ formatRupiah(invoice.tax_amount_idr) }}</span>
          </div>
          <div class="totals-row grand-total">
            <span>GRAND TOTAL</span>
            <span>{{ formatCurrency(totalCurrency, invoice.currency) }}</span>
            <span>{{ formatRupiah(invoice.total_idr) }}</span>
          </div>
        </div>
      </div>

      <!-- Journal Entry (if exists) -->
      <div v-if="invoice.journal_entry" class="journal-card">
        <div class="table-header">
          <div class="table-header-left">
            <i class="fas fa-book"></i>
            <h3>Jurnal Akuntansi</h3>
          </div>
          <div class="table-stats">
            <span class="stat-item">{{ invoice.journal_entry.journal_number }}</span>
            <span class="stat-item">{{ formatDate(invoice.journal_entry.journal_date) }}</span>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Akun</th>
                <th>Deskripsi</th>
                <th class="text-right">Debit</th>
                <th class="text-right">Kredit</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="detail in invoice.journal_entry.details" :key="detail.id">
                <td class="account">
                  {{ detail.account.code }} - {{ detail.account.account_name }}
                </td>
                <td>{{ detail.description }}</td>
                <td class="text-right debit">{{ formatRupiah(detail.debit) }}</td>
                <td class="text-right credit">{{ formatRupiah(detail.credit) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="totals-row">
                <td colspan="2" class="text-right">Total</td>
                <td class="text-right">{{ formatRupiah(getTotalDebit()) }}</td>
                <td class="text-right">{{ formatRupiah(getTotalCredit()) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-file-invoice-slash"></i>
      </div>
      <h3>Invoice Tidak Ditemukan</h3>
      <p>Data invoice tidak ditemukan atau sudah dihapus</p>
    </div>
  </div>
</template>

<script>
import apiClient from '@/api/axios'

export default {
  name: 'InvoiceDetail',

  data() {
    return {
      invoice: {},
      loading: false,
    }
  },

  computed: {
    subtotalCurrency() {
      return this.invoice.subtotal_currency || 0
    },
    taxAmountCurrency() {
      return this.invoice.tax_amount_currency || 0
    },
    totalCurrency() {
      return this.invoice.total_currency || 0
    },
    taxRate() {
      return this.invoice.sales_order?.tax_rate || 11
    },
  },

  mounted() {
    this.loadInvoice()
  },

  methods: {
    async loadInvoice() {
      this.loading = true
      try {
        const id = this.$route.params.id
        const response = await apiClient.get(`/sales-invoices/${id}`)
        this.invoice = response.data.data || response.data
      } catch (error) {
        console.error('Error loading invoice:', error)
      } finally {
        this.loading = false
      }
    },

    async postInvoice() {
      if (!confirm('Post invoice ini? Jurnal akan otomatis dibuat dan tidak bisa diubah lagi.')) {
        return
      }

      this.loading = true // Set loading true

      try {
        await apiClient.post(`/sales-invoices/${this.invoice.id}/post`)
        this.$toast.success('Invoice berhasil di-post!')
        await this.loadInvoice() // Reload data
      } catch (error) {
        console.error('Error posting invoice:', error)
        this.$toast.error(error.response?.data?.message || 'Gagal posting invoice')
      } finally {
        this.loading = false // Set loading false
      }
    },

    goToPayment() {
      this.$router.push(`/admin/penjualan/invoices/${this.invoice.id}/payment`)
    },

    goBack() {
      this.$router.push('/admin/penjualan/invoices')
    },

    getTotalDebit() {
      return (
        this.invoice.journal_entry?.details?.reduce(
          (sum, d) => sum + parseFloat(d.debit || 0),
          0,
        ) || 0
      )
    },

    getTotalCredit() {
      return (
        this.invoice.journal_entry?.details?.reduce(
          (sum, d) => sum + parseFloat(d.credit || 0),
          0,
        ) || 0
      )
    },

    formatDate(date) {
      return date
        ? new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })
        : '-'
    },

    formatKurs(num) {
      return num ? new Intl.NumberFormat('id-ID').format(num) : '-'
    },

    formatQty(num) {
      return num ? new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(num) : '0'
    },

    formatRupiah(amount) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount || 0)
    },

    formatCurrency(amount, currency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount || 0)
    },

    getStatusClass(status) {
      return (
        {
          DRAFT: 'draft',
          POSTED: 'posted',
          CANCELLED: 'cancelled',
        }[status] || 'draft'
      )
    },

    getStatusText(status) {
      return { DRAFT: 'Draft', POSTED: 'Posted', CANCELLED: 'Cancelled' }[status] || status
    },

    getPaymentStatusClass(status) {
      return (
        {
          UNPAID: 'danger',
          PARTIAL: 'warning',
          PAID: 'success',
        }[status] || 'secondary'
      )
    },

    getPaymentStatusText(status) {
      return { UNPAID: 'Belum Bayar', PARTIAL: 'Sebagian', PAID: 'Lunas' }[status] || status
    },
  },
}
</script>

<style scoped>
.invoice-detail {
  padding: 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 40px;
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.page-subtitle {
  color: #64748b;
  font-size: 16px;
  margin: 0;
  font-weight: 500;
}

.header-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
}

.status-badge-large {
  padding: 12px 24px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.status-badge-large.draft {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #374151;
}
.status-badge-large.posted {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}
.status-badge-large.cancelled {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.btn:active {
  transform: translateY(0);
}

.btn-secondary {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #374151;
}
.btn-secondary:hover {
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
}
.btn-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}
.btn-success:hover {
  background: linear-gradient(135deg, #059669, #047857);
}
.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}
.btn-primary:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
}
.btn-lg {
  padding: 16px 32px;
  font-size: 15px;
}

.btn-icon-left span {
  font-weight: 500;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #64748b;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f1f5f9;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-lg {
  width: 64px;
  height: 64px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Main Content */
.main-content {
  display: grid;
  gap: 32px;
}

/* Invoice Header Card */
.invoice-header-card {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.invoice-header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.invoice-number {
  font-size: 40px;
  font-weight: 800;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 12px 0;
  line-height: 1.1;
}

.invoice-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f8fafc;
  border-radius: 12px;
  font-weight: 500;
  color: #475569;
  font-size: 14px;
}

.status-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
}

.status-badge {
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.status-badge.danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}
.status-badge.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}
.status-badge.success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr;
  gap: 24px;
}

.info-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.info-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.info-card-header i {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 14px;
}

.info-card-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.info-row.full-width .info-value {
  flex: 1;
}

.info-label {
  font-weight: 600;
  color: #64748b;
  font-size: 13px;
  min-width: 100px;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  color: #374151;
  font-weight: 500;
}

.info-value.multiline {
  line-height: 1.6;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.summary-item.total-row {
  border-top: 3px solid #3b82f6;
  margin-top: 8px;
  padding-top: 16px;
  font-size: 16px;
}

.summary-label {
  color: #64748b;
  font-weight: 500;
}

.summary-label.bold {
  font-weight: 700;
  color: #1e293b;
}

.summary-value {
  font-weight: 700;
  font-size: 16px;
}

.summary-value.primary {
  color: #1e293b;
}
.summary-value.success {
  color: #10b981;
}
.summary-value.danger {
  color: #ef4444;
}

/* Table Cards */
.table-card,
.journal-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
}

.table-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-header-left i {
  color: #64748b;
  font-size: 18px;
}

.table-header-left h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.table-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.table-wrapper {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.modern-table th {
  padding: 20px 16px;
  text-align: left;
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.modern-table td {
  padding: 20px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.table-row:hover {
  background: #f8fafc;
}

.item-name {
  font-weight: 500;
  color: #1e293b;
  min-width: 200px;
}
.qty,
.price,
.subtotal,
.subtotal-idr {
  font-weight: 600;
  text-align: right;
}
.account {
  font-family: 'Monaco', monospace;
  font-weight: 500;
}
.debit {
  color: #10b981;
}
.credit {
  color: #3b82f6;
}

.text-right {
  text-align: right;
}

/* Totals Footer */
.totals-footer {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  padding: 24px 32px;
}

.totals-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 32px 48px;
  padding: 12px 0;
  color: white;
  font-size: 15px;
}

.totals-row:last-child {
  font-size: 20px;
  font-weight: 700;
  border-top: 2px solid rgba(255, 255, 255, 0.2);
  padding-top: 20px;
  margin-top: 12px;
}

.totals-row span:first-child {
  min-width: 120px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  color: #64748b;
}

.empty-icon {
  width: 96px;
  height: 96px;
  background: #f1f5f9;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.empty-icon i {
  font-size: 48px;
  color: #cbd5e1;
}

.empty-state h3 {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}

/* Responsive */
@media (max-width: 1024px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  .invoice-header-top {
    flex-direction: column;
    gap: 24px;
    align-items: stretch;
  }
  .status-container {
    align-items: stretch;
    flex-direction: row;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .invoice-detail {
    padding: 20px;
  }
  .page-header {
    flex-direction: column;
    gap: 24px;
    align-items: stretch;
  }
  .header-actions {
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }
  .totals-row {
    gap: 16px 24px;
    font-size: 14px;
    flex-wrap: wrap;
  }
}
</style>
