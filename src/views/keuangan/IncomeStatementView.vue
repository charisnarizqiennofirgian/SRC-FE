<template>
  <DashboardLayout>
    <div class="income-statement-professional">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <div class="header-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="header-text">
              <h1 class="page-title">Laporan Laba Rugi</h1>
              <p class="page-subtitle">Income Statement</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn btn-export-pdf" @click="exportPDF" :disabled="!hasData">
              <i class="fas fa-file-pdf"></i> PDF
            </button>
            <button class="btn btn-export-excel" @click="exportExcel" :disabled="!hasData">
              <i class="fas fa-file-excel"></i> Excel
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-panel">
          <div class="filter-row">
            <div class="filter-group date-group">
              <label class="form-label">Periode Laporan</label>
              <div class="date-range-container">
                <input
                  v-model="filters.start_date"
                  type="date"
                  class="form-control date-input"
                  required
                />
                <span class="date-separator">s/d</span>
                <input
                  v-model="filters.end_date"
                  type="date"
                  class="form-control date-input"
                  required
                />
              </div>
            </div>
            <div class="filter-buttons">
              <button class="btn btn-primary" @click="fetchData" :disabled="!canFilter || loading">
                <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-search"></i>
                {{ loading ? 'Memproses...' : 'Tampilkan Laporan' }}
              </button>
              <button class="btn btn-outline-secondary" @click="resetFilters">
                <i class="fas fa-refresh"></i> Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="main-content">
        <!-- Empty State -->
        <div v-if="!hasData && !loading" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <h3>Pilih Periode Tanggal</h3>
          <p>Silakan tentukan rentang tanggal untuk menampilkan Laporan Laba Rugi</p>
        </div>

        <!-- Loading -->
        <div v-else-if="loading" class="loading-state">
          <div class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Memuat Laporan Laba Rugi...</span>
          </div>
        </div>

        <!-- Report -->
        <div v-else class="report-container">
          <!-- Report Header -->
          <div class="report-header">
            <div class="report-identification">
              <h1>LAPORAN LABA RUGI</h1>
              <div class="report-period">
                <strong>Periode:</strong>
                {{ formatDateRange(filters.start_date, filters.end_date) }}
              </div>
              <div class="report-company">
                <strong>PT. Surya Bangkit Cemerlang</strong>
              </div>
            </div>
          </div>

          <!-- Income Statement Tables -->
          <div class="statement-tables">
            <!-- Pendapatan -->
            <div class="statement-table revenue-table">
              <div class="table-header">
                <h3>PENDAPATAN</h3>
              </div>
              <div class="table-body">
                <div
                  v-for="account in reportData.pendapatan.accounts"
                  :key="account.account_id"
                  class="table-row"
                >
                  <div class="account-description">{{ account.account_name }}</div>
                  <div class="amount">{{ formatRupiah(account.amount) }}</div>
                </div>
                <div v-if="reportData.pendapatan.accounts.length === 0" class="table-row empty">
                  <div class="account-description text-muted">Belum ada transaksi pendapatan</div>
                  <div class="amount">-</div>
                </div>
              </div>
              <div class="table-total">
                <div class="total-label">TOTAL PENDAPATAN</div>
                <div class="total-amount positive">
                  {{ formatRupiah(reportData.pendapatan.total) }}
                </div>
              </div>
            </div>

            <!-- HPP -->
            <div class="statement-table cogs-table">
              <div class="table-header">
                <h3>HARGA POKOK PENJUALAN (HPP)</h3>
              </div>
              <div class="table-body">
                <div
                  v-for="account in reportData.hpp.accounts"
                  :key="account.account_id"
                  class="table-row"
                >
                  <div class="account-description">{{ account.account_name }}</div>
                  <div class="amount negative">({{ formatRupiah(account.amount) }})</div>
                </div>
                <div v-if="reportData.hpp.accounts.length === 0" class="table-row empty">
                  <div class="account-description text-muted">Belum ada transaksi HPP</div>
                  <div class="amount">-</div>
                </div>
              </div>
              <div class="table-total">
                <div class="total-label">TOTAL HPP</div>
                <div class="total-amount negative">({{ formatRupiah(reportData.hpp.total) }})</div>
              </div>
            </div>

            <!-- Gross Profit -->
            <div class="statement-row gross-profit-row">
              <div class="row-label">LABA KOTOR</div>
              <div class="row-amount" :class="profitClass(reportData.laba_kotor)">
                {{ formatRupiah(reportData.laba_kotor) }}
              </div>
            </div>

            <!-- Biaya Operasional -->
            <div class="statement-table expense-table">
              <div class="table-header">
                <h3>BIAYA OPERASIONAL</h3>
              </div>
              <div class="table-body">
                <div
                  v-for="account in reportData.biaya.accounts"
                  :key="account.account_id"
                  class="table-row"
                >
                  <div class="account-description">{{ account.account_name }}</div>
                  <div class="amount negative">({{ formatRupiah(account.amount) }})</div>
                </div>
                <div v-if="reportData.biaya.accounts.length === 0" class="table-row empty">
                  <div class="account-description text-muted">Belum ada transaksi biaya</div>
                  <div class="amount">-</div>
                </div>
              </div>
              <div class="table-total">
                <div class="total-label">TOTAL BIAYA OPERASIONAL</div>
                <div class="total-amount negative">
                  ({{ formatRupiah(reportData.biaya.total) }})
                </div>
              </div>
            </div>

            <!-- Net Profit -->
            <div class="statement-row net-profit-row">
              <div class="row-label final-label">
                <strong>LABA/RUGI BERSIH</strong>
              </div>
              <div class="row-amount final-amount" :class="profitClass(reportData.laba_bersih)">
                <strong>{{ formatRupiah(reportData.laba_bersih) }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script>
import axios from 'axios'
import DashboardLayout from '@/components/DashboardLayout.vue'

export default {
  name: 'IncomeStatementView',
  components: { DashboardLayout },
  data() {
    return {
      filters: {
        start_date: '',
        end_date: '',
      },
      reportData: null,
      loading: false,
    }
  },
  computed: {
    hasData() {
      return this.reportData !== null
    },
    canFilter() {
      return this.filters.start_date && this.filters.end_date
    },
  },
  mounted() {
    this.setDefaultDates()
  },
  methods: {
    setDefaultDates() {
      const today = new Date()
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      this.filters.start_date = firstDay.toISOString().split('T')[0]
      this.filters.end_date = today.toISOString().split('T')[0]
    },
    async fetchData() {
      if (!this.canFilter) return
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('/api/income-statement', {
          params: this.filters,
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.data.success) {
          this.reportData = response.data.data
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        this.loading = false
      }
    },
    resetFilters() {
      this.setDefaultDates()
      this.reportData = null
    },
    exportPDF() {
      // PDF export logic
    },
    exportExcel() {
      // Excel export logic
    },
    formatDateRange(start, end) {
      return `${this.formatDate(start)} s/d ${this.formatDate(end)}`
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    },
    formatRupiah(num) {
      const absNum = Math.abs(num)
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(absNum)
    },
    profitClass(amount) {
      return amount >= 0 ? 'profit' : 'loss'
    },
  },
}
</script>

<style scoped>
.income-statement-professional {
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Page Header */
.page-header {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.page-subtitle {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
}

/* Export Buttons */
.btn-export-pdf,
.btn-export-excel {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 12px;
}

.btn-export-pdf {
  background: #dc3545;
  color: white;
}

.btn-export-excel {
  background: #28a745;
  color: white;
}

.btn-export-pdf:hover:not(:disabled),
.btn-export-excel:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Filter Section */
.filter-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 24px;
}

.date-group {
  flex: 1;
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  display: block;
}

.date-range-container {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.date-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
}

.date-separator {
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
}

.filter-buttons {
  display: flex;
  gap: 12px;
}

.btn-primary,
.btn-outline-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-outline-secondary {
  background: #f9fafb;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.btn-outline-secondary:hover {
  background: #f3f4f6;
}

/* Main Content */
.main-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Empty & Loading States */
.empty-state,
.loading-state {
  padding: 80px 40px;
  text-align: center;
}

.empty-icon i {
  font-size: 64px;
  color: #d1d5db;
  margin-bottom: 24px;
}

.empty-state h3 {
  color: #374151;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
}

.empty-state p {
  color: #6b7280;
  font-size: 16px;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-indicator i {
  font-size: 48px;
  color: #2563eb;
}

/* Report Container */
.report-container {
  padding: 40px;
}

.report-header {
  text-align: center;
  padding-bottom: 40px;
  border-bottom: 3px solid #e5e7eb;
  margin-bottom: 40px;
}

.report-identification h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px 0;
  letter-spacing: 1px;
}

.report-period,
.report-company {
  color: #6b7280;
  font-size: 16px;
  margin-bottom: 8px;
}

.report-company {
  font-weight: 600;
  color: #374151;
}

/* Statement Tables */
.statement-tables {
  max-width: 900px;
  margin: 0 auto;
}

.statement-table {
  margin-bottom: 32px;
}

.table-header {
  margin-bottom: 20px;
}

.table-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.table-body {
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.table-row {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #f1f3f4;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: #f8fafc;
}

.account-description {
  flex: 1;
  font-weight: 500;
  color: #374151;
  font-size: 15px;
}

.amount {
  font-family:
    'SF Pro Display',
    -apple-system,
    'Segoe UI',
    Roboto,
    sans-serif;
  font-weight: 600;
  font-size: 16px;
  min-width: 180px;
  text-align: right;
}

.positive {
  color: #16a34a;
}

.negative {
  color: #dc2626;
}

.table-row.empty {
  justify-content: center;
  text-align: center;
  padding: 32px;
}

.text-muted {
  color: #9ca3af;
  font-style: italic;
}

.table-total {
  background: white;
  padding: 20px 24px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-weight: 700;
  font-size: 16px;
  color: #1f2937;
}

.total-amount {
  font-size: 18px;
  font-weight: 700;
}

/* Statement Rows */
.statement-row {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px 32px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gross-profit-row {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-color: #22c55e;
  font-size: 18px;
  padding: 32px 40px;
}

.net-profit-row {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-color: #eab308;
  font-size: 20px;
  padding: 40px 48px;
  margin-top: 32px;
}

.row-label {
  font-weight: 700;
  color: #1f2937;
}

.final-label {
  font-size: 22px;
}

.row-amount {
  font-weight: 800;
  font-size: 24px;
}

.final-amount {
  font-size: 28px;
}

.profit {
  color: #16a34a;
}

.loss {
  color: #dc2626;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header,
  .filter-section,
  .main-content {
    margin-bottom: 16px;
  }

  .filter-row {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .report-container {
    padding: 24px;
  }

  .table-row {
    flex-direction: column;
    gap: 8px;
    padding: 20px;
  }

  .account-description {
    order: 2;
  }

  .amount {
    order: 1;
    text-align: left;
  }
}
</style>
