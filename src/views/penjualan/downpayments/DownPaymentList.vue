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
        <span class="breadcrumb-current">Uang Muka</span>
      </div>

      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge">💰</div>
          <div class="header-text">
            <h1 class="page-title">Daftar Uang Muka (Down Payment)</h1>
            <p class="page-subtitle">Kelola dan monitor penerimaan uang muka dari customer</p>
          </div>
        </div>
        <button @click="goToCreate" class="btn-primary">
          <span class="btn-icon">➕</span>
          <span class="btn-text">Terima Uang Muka</span>
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-container">
      <div class="stat-card stat-total">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-label">Total Uang Muka</div>
          <div class="stat-value">{{ downPayments.data?.length || 0 }}</div>
        </div>
      </div>
      <div class="stat-card stat-pending">
        <div class="stat-icon">⏳</div>
        <div class="stat-content">
          <div class="stat-label">Pending</div>
          <div class="stat-value">{{ countByStatus('PENDING') }}</div>
        </div>
      </div>
      <div class="stat-card stat-used">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-label">Terpakai</div>
          <div class="stat-value">{{ countByStatus('USED') }}</div>
        </div>
      </div>
      <div class="stat-card stat-refunded">
        <div class="stat-icon">↩️</div>
        <div class="stat-content">
          <div class="stat-label">Dikembalikan</div>
          <div class="stat-value">{{ countByStatus('REFUNDED') }}</div>
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
            <p class="card-subtitle">Cari dan filter data uang muka</p>
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
                @input="loadDownPayments"
                type="text"
                placeholder="Cari nomor DP atau customer..."
                class="form-control search-input"
              />
            </div>
          </div>

          <div class="filter-group">
            <label class="filter-label">
              <span class="label-icon">📊</span>
              <span>Status</span>
            </label>
            <select v-model="filters.status" @change="loadDownPayments" class="form-control">
              <option value="">Semua Status</option>
              <option value="PENDING">⏳ Pending (Belum Dipakai)</option>
              <option value="USED">✅ Sudah Dipakai</option>
              <option value="REFUNDED">↩️ Dikembalikan</option>
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
            <h2 class="card-title">Data Uang Muka</h2>
            <p class="card-subtitle">
              Menampilkan {{ downPayments.data?.length || 0 }} dari total data
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
                <th class="th-dp-number">
                  <div class="th-content">
                    <span class="th-icon">📄</span>
                    <span>No. DP</span>
                  </div>
                </th>
                <th class="th-date">
                  <div class="th-content">
                    <span class="th-icon">📅</span>
                    <span>Tanggal</span>
                  </div>
                </th>
                <th class="th-so">
                  <div class="th-content">
                    <span class="th-icon">🛒</span>
                    <span>Sales Order</span>
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
                <th class="th-amount">
                  <div class="th-content">
                    <span class="th-icon">💰</span>
                    <span>Total DP</span>
                  </div>
                </th>
                <th class="th-used">
                  <div class="th-content">
                    <span class="th-icon">✅</span>
                    <span>Dipakai</span>
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
              <tr v-if="!downPayments.data || downPayments.data.length === 0" class="empty-row">
                <td colspan="10">
                  <div class="empty-state">
                    <span class="empty-icon">📭</span>
                    <p class="empty-text">Belum ada data uang muka</p>
                    <p class="empty-hint">
                      Klik tombol "Terima Uang Muka" untuk menambahkan data baru
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Data Rows -->
              <tr
                v-for="(dp, index) in downPayments.data"
                :key="dp.id"
                class="data-row"
                :class="{ 'row-alt': index % 2 === 1 }"
              >
                <td class="td-dp-number">
                  <div class="dp-number-badge">
                    <span class="dp-icon">📄</span>
                    <span class="dp-text">{{ dp.dp_number }}</span>
                  </div>
                </td>
                <td class="td-date">{{ formatDate(dp.payment_date) }}</td>
                <td class="td-so">
                  <span class="so-badge">{{ dp.sales_order.so_number }}</span>
                </td>
                <td class="td-customer">
                  <div class="customer-info">
                    <span class="customer-icon">👤</span>
                    <span class="customer-name">{{ dp.buyer.name }}</span>
                  </div>
                </td>
                <td class="td-currency">
                  <span class="currency-badge">{{ dp.currency }}</span>
                </td>
                <td class="td-amount">
                  <div class="amount-cell">
                    <div class="amount-primary">
                      {{ formatCurrency(dp.amount_original, dp.currency) }}
                    </div>
                    <div class="amount-secondary">{{ formatRupiah(dp.amount_idr) }}</div>
                  </div>
                </td>
                <td class="td-used">
                  <span class="used-amount">{{ formatRupiah(dp.used_amount) }}</span>
                </td>
                <td class="td-remaining">
                  <span
                    :class="[
                      'remaining-amount',
                      dp.remaining_amount > 0 ? 'has-remaining' : 'no-remaining',
                    ]"
                  >
                    {{ formatRupiah(dp.remaining_amount) }}
                  </span>
                </td>
                <td class="td-status">
                  <span :class="getStatusClass(dp.status)">
                    {{ getStatusText(dp.status) }}
                  </span>
                </td>
                <td class="td-action">
                  <div class="action-buttons">
                    <button @click="viewDetail(dp.id)" class="action-btn btn-view" title="Detail">
                      <span>👁️</span>
                    </button>
                    <button
                      v-if="dp.status === 'PENDING' && dp.used_amount === 0"
                      @click="deleteDP(dp.id)"
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
        <div v-if="downPayments.data && downPayments.data.length > 0" class="pagination-container">
          <button
            @click="changePage(downPayments.current_page - 1)"
            :disabled="downPayments.current_page === 1"
            class="pagination-btn"
            :class="{ disabled: downPayments.current_page === 1 }"
          >
            <span class="pagination-icon">←</span>
            <span class="pagination-text">Previous</span>
          </button>

          <div class="pagination-info">
            <span class="page-indicator">
              Page <strong>{{ downPayments.current_page }}</strong> of
              <strong>{{ downPayments.last_page }}</strong>
            </span>
          </div>

          <button
            @click="changePage(downPayments.current_page + 1)"
            :disabled="downPayments.current_page === downPayments.last_page"
            class="pagination-btn"
            :class="{ disabled: downPayments.current_page === downPayments.last_page }"
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
  name: 'DownPaymentList',
  components: {
    DashboardLayout,
  },

  data() {
    return {
      downPayments: {
        data: [],
        current_page: 1,
        last_page: 1,
      },
      filters: {
        search: '',
        status: '',
      },
      loading: false,
    }
  },

  mounted() {
    this.loadDownPayments()
  },

  methods: {
    async loadDownPayments(page = 1) {
      this.loading = true
      try {
        const params = {
          page,
          ...this.filters,
        }

        const response = await apiClient.get('/down-payments', { params })
        this.downPayments = response.data
      } catch (error) {
        console.error('Error loading down payments:', error)
        this.$toast.error('Gagal memuat data uang muka')
      } finally {
        this.loading = false
      }
    },

    changePage(page) {
      this.loadDownPayments(page)
    },

    goToCreate() {
      this.$router.push('/admin/penjualan/down-payments/create')
    },

    viewDetail(id) {
      this.$router.push(`/admin/penjualan/down-payments/${id}`)
    },

    async deleteDP(id) {
      if (!confirm('Hapus uang muka ini? Tindakan ini tidak dapat dibatalkan.')) return

      try {
        await apiClient.delete(`/down-payments/${id}`)
        this.$toast.success('Uang muka berhasil dihapus!')
        this.loadDownPayments()
      } catch (error) {
        console.error('Error deleting down payment:', error)
        this.$toast.error(error.response?.data?.message || 'Gagal menghapus uang muka')
      }
    },

    countByStatus(status) {
      if (!this.downPayments.data) return 0
      return this.downPayments.data.filter((dp) => dp.status === status).length
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
      if (amount === null || amount === undefined) return '-'
      const number = typeof amount === 'string' ? parseFloat(amount) : amount
      if (isNaN(number)) return '-'

      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(number)
    },

    getStatusClass(status) {
      const classes = {
        PENDING: 'status-badge status-pending',
        USED: 'status-badge status-used',
        REFUNDED: 'status-badge status-refunded',
      }
      return classes[status] || 'status-badge'
    },

    getStatusText(status) {
      const texts = {
        PENDING: 'Pending',
        USED: 'Terpakai',
        REFUNDED: 'Dikembalikan',
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
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  padding: 24px 32px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.25);
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
  color: #6366f1;
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

.stat-pending .stat-icon {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.stat-used .stat-icon {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.stat-refunded .stat-icon {
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
  grid-template-columns: repeat(2, 1fr);
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
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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
  border-top-color: #6366f1;
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
  min-width: 1400px;
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

.th-amount .th-content,
.th-used .th-content,
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

/* DP Number */
.dp-number-badge {
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

.dp-icon {
  font-size: 16px;
}

/* SO Badge */
.so-badge {
  display: inline-block;
  background: #f3f4f6;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  color: #374151;
  border: 1px solid #e5e7eb;
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

/* Used Amount */
.used-amount {
  display: inline-block;
  text-align: right;
  font-weight: 600;
  color: #6b7280;
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
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 2px solid #6ee7b7;
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
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border: 2px solid #fbbf24;
}

.status-used {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 2px solid #6ee7b7;
}

.status-refunded {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
  border: 2px solid #d1d5db;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
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
  border-color: #6366f1;
  color: #6366f1;
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
