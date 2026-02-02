<template>
  <DashboardLayout>
    <!-- Page Header -->
    <div class="page-header">
      <div class="breadcrumb">
        <router-link to="/" class="breadcrumb-item">
          <span class="breadcrumb-icon">🏠</span>
          Dashboard
        </router-link>
        <span class="breadcrumb-separator">→</span>
        <router-link to="/admin/penjualan" class="breadcrumb-item"> Penjualan </router-link>
        <span class="breadcrumb-separator">→</span>
        <span class="breadcrumb-current">Invoice</span>
      </div>

      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge">🧾</div>
          <div class="header-text">
            <h1 class="page-title">Daftar Invoice Penjualan</h1>
            <p class="page-subtitle">Kelola dan monitor invoice penjualan kepada customer</p>
          </div>
        </div>
        <button @click="goToCreate" class="btn-primary">
          <span class="btn-icon">➕</span>
          <span class="btn-text">Buat Invoice</span>
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-container">
      <div class="stat-card stat-total">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-label">Total Invoice</div>
          <div class="stat-value">{{ invoices.data?.length || 0 }}</div>
        </div>
      </div>
      <div class="stat-card stat-draft">
        <div class="stat-icon">📝</div>
        <div class="stat-content">
          <div class="stat-label">Draft</div>
          <div class="stat-value">{{ countByStatus('DRAFT') }}</div>
        </div>
      </div>
      <div class="stat-card stat-posted">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-label">Posted</div>
          <div class="stat-value">{{ countByStatus('POSTED') }}</div>
        </div>
      </div>
      <div class="stat-card stat-unpaid">
        <div class="stat-icon">💳</div>
        <div class="stat-content">
          <div class="stat-label">Belum Lunas</div>
          <div class="stat-value">{{ countUnpaid() }}</div>
        </div>
      </div>
    </div>

    <!-- Filters Card -->
    <div class="content-card">
      <div class="card-header">
        <div class="header-left-section">
          <div class="header-icon">🔍</div>
          <div>
            <h2 class="card-title">Filter & Pencarian</h2>
            <p class="card-subtitle">Cari dan filter data invoice</p>
          </div>
        </div>
      </div>

      <div class="card-body">
        <div class="filters-grid">
          <div class="filter-group">
            <label class="filter-label">
              <span class="label-icon">🔎</span>
              <span>Pencarian</span>
            </label>
            <div class="search-input-wrapper">
              <span class="search-icon">🔍</span>
              <input
                v-model="filters.search"
                @input="loadInvoices"
                type="text"
                placeholder="Cari nomor invoice atau customer..."
                class="form-control search-input"
              />
            </div>
          </div>

          <div class="filter-group">
            <label class="filter-label">
              <span class="label-icon">📊</span>
              <span>Status Invoice</span>
            </label>
            <select v-model="filters.status" @change="loadInvoices" class="form-control">
              <option value="">Semua Status</option>
              <option value="DRAFT">📝 Draft</option>
              <option value="POSTED">✅ Posted</option>
              <option value="CANCELLED">❌ Cancelled</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">
              <span class="label-icon">💳</span>
              <span>Status Pembayaran</span>
            </label>
            <select v-model="filters.payment_status" @change="loadInvoices" class="form-control">
              <option value="">Semua Pembayaran</option>
              <option value="UNPAID">❌ Belum Bayar</option>
              <option value="PARTIAL">⚠️ Sebagian</option>
              <option value="PAID">✅ Lunas</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="content-card">
      <div class="card-header">
        <div class="header-left-section">
          <div class="header-icon">📋</div>
          <div>
            <h2 class="card-title">Data Invoice Penjualan</h2>
            <p class="card-subtitle">
              Menampilkan {{ invoices.data?.length || 0 }} dari total data
            </p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p class="loading-text">Memuat data...</p>
      </div>

      <!-- Table -->
      <div v-else class="table-container">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th class="th-invoice">
                  <div class="th-content">
                    <span class="th-icon">📄</span>
                    <span>No. Invoice</span>
                  </div>
                </th>
                <th class="th-date">
                  <div class="th-content">
                    <span class="th-icon">📅</span>
                    <span>Tanggal</span>
                  </div>
                </th>
                <th class="th-customer">
                  <div class="th-content">
                    <span class="th-icon">👤</span>
                    <span>Customer</span>
                  </div>
                </th>
                <th class="th-currency">
                  <div class="th-content">
                    <span class="th-icon">💱</span>
                    <span>Currency</span>
                  </div>
                </th>
                <th class="th-total">
                  <div class="th-content">
                    <span class="th-icon">💰</span>
                    <span>Total</span>
                  </div>
                </th>
                <th class="th-paid">
                  <div class="th-content">
                    <span class="th-icon">✅</span>
                    <span>Dibayar</span>
                  </div>
                </th>
                <th class="th-remaining">
                  <div class="th-content">
                    <span class="th-icon">💵</span>
                    <span>Sisa</span>
                  </div>
                </th>
                <th class="th-status">
                  <div class="th-content">
                    <span class="th-icon">📊</span>
                    <span>Status</span>
                  </div>
                </th>
                <th class="th-payment">
                  <div class="th-content">
                    <span class="th-icon">💳</span>
                    <span>Pembayaran</span>
                  </div>
                </th>
                <th class="th-action">
                  <div class="th-content">
                    <span class="th-icon">⚙️</span>
                    <span>Aksi</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <!-- Empty State -->
              <tr v-if="!invoices.data || invoices.data.length === 0" class="empty-row">
                <td colspan="10">
                  <div class="empty-state">
                    <span class="empty-icon">📭</span>
                    <p class="empty-text">Belum ada data invoice</p>
                    <p class="empty-hint">
                      Klik tombol "Buat Invoice" untuk menambahkan invoice baru
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Data Rows -->
              <tr
                v-for="(invoice, index) in invoices.data"
                :key="invoice.id"
                class="data-row"
                :class="{ 'row-alt': index % 2 === 1 }"
              >
                <td class="td-invoice">
                  <div class="invoice-number-badge">
                    <span class="invoice-icon">📄</span>
                    <span class="invoice-text">{{ invoice.invoice_number }}</span>
                  </div>
                </td>
                <td class="td-date">{{ formatDate(invoice.invoice_date) }}</td>
                <td class="td-customer">
                  <div class="customer-info">
                    <span class="customer-icon">👤</span>
                    <span class="customer-name">{{ invoice.buyer.name }}</span>
                  </div>
                </td>
                <td class="td-currency">
                  <span class="currency-badge">{{ invoice.currency }}</span>
                </td>
                <td class="td-total">
                  <div class="amount-cell">
                    <div class="amount-primary">
                      {{ formatCurrency(invoice.grand_total_original, invoice.currency) }}
                    </div>
                    <div class="amount-secondary">{{ formatRupiah(invoice.grand_total_idr) }}</div>
                  </div>
                </td>
                <td class="td-paid">
                  <span class="paid-amount">{{ formatRupiah(invoice.paid_amount) }}</span>
                </td>
                <td class="td-remaining">
                  <span
                    :class="[
                      'remaining-amount',
                      invoice.remaining_amount > 0 ? 'has-remaining' : 'no-remaining',
                    ]"
                  >
                    {{ formatRupiah(invoice.remaining_amount) }}
                  </span>
                </td>
                <td class="td-status">
                  <span :class="getStatusClass(invoice.status)">
                    {{ invoice.status }}
                  </span>
                </td>
                <td class="td-payment">
                  <span :class="getPaymentStatusClass(invoice.payment_status)">
                    {{ getPaymentStatusText(invoice.payment_status) }}
                  </span>
                </td>
                <td class="td-action">
                  <div class="action-buttons">
                    <button
                      @click="viewDetail(invoice.id)"
                      class="action-btn btn-view"
                      title="Detail"
                    >
                      <span>👁️</span>
                    </button>
                    <button
                      v-if="invoice.status === 'DRAFT'"
                      @click="postInvoice(invoice.id)"
                      class="action-btn btn-post"
                      title="Post"
                    >
                      <span>✅</span>
                    </button>
                    <button
                      v-if="invoice.payment_status !== 'PAID' && invoice.status === 'POSTED'"
                      @click="goToPayment(invoice.id)"
                      class="action-btn btn-payment"
                      title="Bayar"
                    >
                      <span>💳</span>
                    </button>
                    <button
                      v-if="invoice.status === 'DRAFT'"
                      @click="deleteInvoice(invoice.id)"
                      class="action-btn btn-delete"
                      title="Hapus"
                    >
                      <span>🗑️</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="invoices.data && invoices.data.length > 0" class="pagination-container">
          <button
            @click="changePage(invoices.current_page - 1)"
            :disabled="invoices.current_page === 1"
            class="pagination-btn"
            :class="{ disabled: invoices.current_page === 1 }"
          >
            <span class="pagination-icon">←</span>
            <span class="pagination-text">Previous</span>
          </button>

          <div class="pagination-info">
            <span class="page-indicator">
              Page <strong>{{ invoices.current_page }}</strong> of
              <strong>{{ invoices.last_page }}</strong>
            </span>
          </div>

          <button
            @click="changePage(invoices.current_page + 1)"
            :disabled="invoices.current_page === invoices.last_page"
            class="pagination-btn"
            :class="{ disabled: invoices.current_page === invoices.last_page }"
          >
            <span class="pagination-text">Next</span>
            <span class="pagination-icon">→</span>
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script>
import apiClient from '@/api/axios'
import DashboardLayout from '@/components/DashboardLayout.vue'

export default {
  name: 'InvoiceList',
  components: {
    DashboardLayout,
  },

  data() {
    return {
      invoices: {
        data: [],
        current_page: 1,
        last_page: 1,
      },
      filters: {
        search: '',
        status: '',
        payment_status: '',
      },
      loading: false,
    }
  },

  mounted() {
    this.loadInvoices()
  },

  methods: {
    async loadInvoices(page = 1) {
      this.loading = true
      try {
        const params = {
          page,
          ...this.filters,
        }

        const response = await apiClient.get('/sales-invoices', { params })
        this.invoices = response.data
      } catch (error) {
        console.error('Error loading invoices:', error)
        this.$toast.error('Gagal memuat data invoice')
      } finally {
        this.loading = false
      }
    },

    changePage(page) {
      this.loadInvoices(page)
    },

    goToCreate() {
      this.$router.push('/admin/penjualan/invoices/create')
    },

    viewDetail(id) {
      this.$router.push(`/admin/penjualan/invoices/${id}`)
    },

    goToPayment(id) {
      this.$router.push(`/admin/penjualan/invoices/${id}/payment`)
    },

    async postInvoice(id) {
      if (!confirm('Post invoice ini? Jurnal akan otomatis dibuat dan tidak dapat diubah lagi.'))
        return

      try {
        await apiClient.post(`/sales-invoices/${id}/post`)
        this.$toast.success('Invoice berhasil di-post!')
        this.loadInvoices()
      } catch (error) {
        console.error('Error posting invoice:', error)
        this.$toast.error(error.response?.data?.message || 'Gagal posting invoice')
      }
    },

    async deleteInvoice(id) {
      if (!confirm('Hapus invoice ini? Tindakan ini tidak dapat dibatalkan.')) return

      try {
        await apiClient.delete(`/sales-invoices/${id}`)
        this.$toast.success('Invoice berhasil dihapus!')
        this.loadInvoices()
      } catch (error) {
        console.error('Error deleting invoice:', error)
        this.$toast.error(error.response?.data?.message || 'Gagal menghapus invoice')
      }
    },

    countByStatus(status) {
      if (!this.invoices.data) return 0
      return this.invoices.data.filter((inv) => inv.status === status).length
    },

    countUnpaid() {
      if (!this.invoices.data) return 0
      return this.invoices.data.filter(
        (inv) => inv.payment_status !== 'PAID' && inv.status === 'POSTED',
      ).length
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    },

    formatRupiah(amount) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount)
    },

    formatCurrency(amount, currency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount)
    },

    getStatusClass(status) {
      const classes = {
        DRAFT: 'status-badge status-draft',
        POSTED: 'status-badge status-posted',
        CANCELLED: 'status-badge status-cancelled',
      }
      return classes[status] || 'status-badge'
    },

    getPaymentStatusClass(status) {
      const classes = {
        UNPAID: 'payment-badge payment-unpaid',
        PARTIAL: 'payment-badge payment-partial',
        PAID: 'payment-badge payment-paid',
      }
      return classes[status] || 'payment-badge'
    },

    getPaymentStatusText(status) {
      const texts = {
        UNPAID: 'Belum Bayar',
        PARTIAL: 'Sebagian',
        PAID: 'Lunas',
      }
      return texts[status] || status
    },
  },
}
</script>

<style scoped>
/* ============================================
   VARIABLES & BASE
   ============================================ */
* {
  box-sizing: border-box;
}

/* ============================================
   BREADCRUMB
   ============================================ */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 13px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.breadcrumb-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.breadcrumb-icon {
  font-size: 14px;
}

.breadcrumb-separator {
  color: rgba(255, 255, 255, 0.5);
}

.breadcrumb-current {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

/* ============================================
   PAGE HEADER
   ============================================ */
.page-header {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  padding: 24px 32px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(14, 165, 233, 0.25);
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
  background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.15), transparent);
  pointer-events: none;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  gap: 20px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.icon-badge {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-subtitle {
  font-size: 14px;
  opacity: 0.95;
  margin: 0;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  color: #0ea5e9;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.btn-icon {
  font-size: 16px;
}

/* ============================================
   STATS CARDS
   ============================================ */
.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-total .stat-icon {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.stat-draft .stat-icon {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
}

.stat-posted .stat-icon {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.stat-unpaid .stat-icon {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

/* ============================================
   CONTENT CARD
   ============================================ */
.content-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(to right, #fafbfc 0%, #ffffff 100%);
  border-bottom: 2px solid #f3f4f6;
}

.header-left-section {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 2px solid #93c5fd;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.card-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.card-body {
  padding: 24px;
}

/* ============================================
   FILTERS
   ============================================ */
.filters-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #374151;
  font-size: 13px;
}

.label-icon {
  font-size: 16px;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  z-index: 1;
}

.search-input {
  padding-left: 42px;
}

.form-control {
  width: 100%;
  padding: 11px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

/* ============================================
   LOADING
   ============================================ */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #e5e7eb;
  border-top-color: #0ea5e9;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 15px;
  color: #6b7280;
  font-weight: 600;
}

/* ============================================
   TABLE
   ============================================ */
.table-container {
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1500px;
  background: white;
}

.data-table thead {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table th {
  padding: 16px;
  text-align: left;
  color: white;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.th-icon {
  font-size: 16px;
}

.th-total .th-content,
.th-paid .th-content,
.th-remaining .th-content {
  justify-content: flex-end;
}

.data-row {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
}

.data-row:hover {
  background: #f9fafb;
}

.row-alt {
  background: #fafbfc;
}

.data-table td {
  padding: 16px;
  vertical-align: middle;
  font-size: 14px;
}

/* Invoice Number */
.invoice-number-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  padding: 6px 12px;
  border-radius: 8px;
  border: 2px solid #93c5fd;
  font-weight: 600;
  color: #1e40af;
}

.invoice-icon {
  font-size: 16px;
}

/* Customer Info */
.customer-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.customer-icon {
  font-size: 20px;
  background: #f3f4f6;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.customer-name {
  font-weight: 600;
  color: #1f2937;
}

/* Currency Badge */
.currency-badge {
  display: inline-block;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 700;
  color: #92400e;
  font-size: 12px;
  border: 2px solid #fbbf24;
}

/* Amount Cell */
.amount-cell {
  text-align: right;
}

.amount-primary {
  font-weight: 700;
  color: #1f2937;
  font-size: 14px;
  margin-bottom: 2px;
}

.amount-secondary {
  font-size: 12px;
  color: #6b7280;
}

/* Paid Amount */
.paid-amount {
  display: inline-block;
  text-align: right;
  font-weight: 600;
  color: #059669;
}

/* Remaining Amount */
.remaining-amount {
  display: inline-block;
  text-align: right;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 6px;
}

.has-remaining {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 2px solid #fca5a5;
}

.no-remaining {
  background: #f3f4f6;
  color: #9ca3af;
  border: 1px solid #e5e7eb;
}

/* Status Badge */
.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-draft {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
  border: 2px solid #d1d5db;
}

.status-posted {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 2px solid #6ee7b7;
}

.status-cancelled {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 2px solid #fca5a5;
}

/* Payment Badge */
.payment-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.payment-unpaid {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 2px solid #fca5a5;
}

.payment-partial {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border: 2px solid #fbbf24;
}

.payment-paid {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 2px solid #6ee7b7;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
}

.btn-view {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 2px solid #93c5fd;
}

.btn-view:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-post {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 2px solid #6ee7b7;
}

.btn-post:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-payment {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #fbbf24;
}

.btn-payment:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-delete {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border: 2px solid #fca5a5;
}

.btn-delete:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* Empty State */
.empty-row {
  background: #fafafa;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-text {
  font-size: 18px;
  font-weight: 700;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
}

/* ============================================
   PAGINATION
   ============================================ */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 2px solid #f3f4f6;
  background: linear-gradient(to right, #fafbfc 0%, #ffffff 100%);
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(.disabled) {
  background: #f9fafb;
  border-color: #0ea5e9;
  color: #0ea5e9;
  transform: translateY(-2px);
}

.pagination-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-icon {
  font-size: 16px;
}

.pagination-info {
  text-align: center;
}

.page-indicator {
  font-size: 14px;
  color: #6b7280;
}

.page-indicator strong {
  color: #1f2937;
  font-weight: 700;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 1200px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .pagination-container {
    flex-direction: column;
    gap: 12px;
  }

  .pagination-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
