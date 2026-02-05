<template>
  <DashboardLayout>
    <div class="balance-sheet-professional">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <div class="header-icon">
              <i class="fas fa-balance-scale"></i>
            </div>
            <div class="header-text">
              <h1 class="page-title">Neraca</h1>
              <p class="page-subtitle">Balance Sheet</p>
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
            <div class="filter-group">
              <label class="form-label">Per Tanggal <span class="required">*</span></label>
              <input v-model="filters.as_of_date" type="date" class="form-control" required />
            </div>
            <div class="filter-buttons">
              <button class="btn btn-primary" @click="fetchData" :disabled="!canFilter || loading">
                <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-search"></i>
                {{ loading ? 'Memproses...' : 'Tampilkan Neraca' }}
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
            <i class="fas fa-balance-scale"></i>
          </div>
          <h3>Pilih Tanggal Neraca</h3>
          <p>Silakan tentukan tanggal untuk menampilkan posisi keuangan</p>
        </div>

        <!-- Loading -->
        <div v-else-if="loading" class="loading-state">
          <div class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Memuat Neraca...</span>
          </div>
        </div>

        <!-- Report -->
        <div v-else class="report-container">
          <!-- Report Header -->
          <div class="report-header">
            <div class="report-identification">
              <h1>NERACA</h1>
              <div class="report-period">
                <strong>Per Tanggal:</strong> {{ formatDate(reportData.as_of_date) }}
              </div>
              <div class="report-company">
                <strong>PT.Surya Bangkit Cemerlang</strong>
              </div>
            </div>

            <!-- Balance Status -->
            <div class="balance-status" :class="reportData.is_balanced ? 'balanced' : 'imbalanced'">
              <div class="status-icon">
                <i v-if="reportData.is_balanced" class="fas fa-check-circle"></i>
                <i v-else class="fas fa-exclamation-triangle"></i>
              </div>
              <div class="status-text">
                {{ reportData.is_balanced ? 'Neraca Balance' : 'Neraca Tidak Balance' }}
                <span v-if="!reportData.is_balanced" class="selisih">
                  (Selisih: {{ formatRupiah(reportData.selisih) }})
                </span>
              </div>
            </div>
          </div>

          <!-- Balance Sheet Grid -->
          <div class="balance-sheet-grid">
            <!-- ASET Column -->
            <div class="balance-column assets-column">
              <div class="column-header">
                <h3>ASET</h3>
              </div>
              <div class="balance-table">
                <div
                  v-for="account in reportData.aset.accounts"
                  :key="account.account_id"
                  class="table-row"
                >
                  <div class="account-description">{{ account.account_name }}</div>
                  <div class="amount">{{ formatRupiah(account.amount) }}</div>
                </div>
                <div v-if="reportData.aset.accounts.length === 0" class="table-row empty">
                  <div class="account-description text-muted">Belum ada data aset</div>
                  <div class="amount">-</div>
                </div>
                <div class="table-total">
                  <div class="total-label">TOTAL ASET</div>
                  <div class="total-amount primary">{{ formatRupiah(reportData.aset.total) }}</div>
                </div>
              </div>
            </div>

            <!-- PASIVA Column -->
            <div class="balance-column liabilities-column">
              <div class="column-header">
                <h3>KEWAJIBAN DAN MODAL</h3>
              </div>

              <!-- Kewajiban -->
              <div class="sub-section">
                <h4 class="sub-title">KEWAJIBAN</h4>
                <div class="balance-table">
                  <div
                    v-for="account in reportData.kewajiban.accounts"
                    :key="account.account_id"
                    class="table-row"
                  >
                    <div class="account-description">{{ account.account_name }}</div>
                    <div class="amount">{{ formatRupiah(account.amount) }}</div>
                  </div>
                  <div v-if="reportData.kewajiban.accounts.length === 0" class="table-row empty">
                    <div class="account-description text-muted">Belum ada data kewajiban</div>
                    <div class="amount">-</div>
                  </div>
                  <div class="table-subtotal">
                    <div class="subtotal-label">Total Kewajiban</div>
                    <div class="subtotal-amount">
                      {{ formatRupiah(reportData.kewajiban.total) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Modal -->
              <div class="sub-section">
                <h4 class="sub-title">MODAL</h4>
                <div class="balance-table">
                  <div
                    v-for="account in reportData.modal.accounts"
                    :key="account.account_id"
                    class="table-row"
                  >
                    <div class="account-description">{{ account.account_name }}</div>
                    <div class="amount">{{ formatRupiah(account.amount) }}</div>
                  </div>
                  <div class="table-row laba-row">
                    <div class="account-description">Laba Tahun Berjalan</div>
                    <div class="amount" :class="profitClass(reportData.laba_tahun_berjalan)">
                      {{ formatRupiah(reportData.laba_tahun_berjalan) }}
                    </div>
                  </div>
                  <div
                    v-if="reportData.modal.accounts.length === 0 && !reportData.laba_tahun_berjalan"
                    class="table-row empty"
                  >
                    <div class="account-description text-muted">Belum ada data modal</div>
                    <div class="amount">-</div>
                  </div>
                  <div class="table-subtotal">
                    <div class="subtotal-label">Total Modal</div>
                    <div class="subtotal-amount">
                      {{ formatRupiah(reportData.modal.total + reportData.laba_tahun_berjalan) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Total Pasiva -->
              <div class="table-total">
                <div class="total-label">TOTAL KEWAJIBAN DAN MODAL</div>
                <div class="total-amount primary">{{ formatRupiah(reportData.total_pasiva) }}</div>
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
  name: 'BalanceSheetView',
  components: { DashboardLayout },
  data() {
    return {
      filters: {
        as_of_date: '',
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
      return this.filters.as_of_date !== ''
    },
  },
  mounted() {
    this.setDefaultDate()
  },
  methods: {
    setDefaultDate() {
      const today = new Date()
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      this.filters.as_of_date = lastDayOfMonth.toISOString().split('T')[0]
    },
    async fetchData() {
      if (!this.canFilter) return
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('/api/balance-sheet', {
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
      this.setDefaultDate()
      this.reportData = null
    },
    exportPDF() {
      // PDF export logic
    },
    exportExcel() {
      // Excel export logic
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
.balance-sheet-professional {
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
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
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

.filter-group {
  flex: 1;
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  display: block;
}

.required {
  color: #dc3545;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
}

.filter-buttons {
  display: flex;
  gap: 12px;
}

/* Main Content */
.main-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* States */
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 32px;
  border-bottom: 3px solid #e5e7eb;
  margin-bottom: 40px;
  gap: 24px;
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

.balance-status {
  padding: 16px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}

.balance-status.balanced {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.balance-status.imbalanced {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.status-icon i {
  font-size: 20px;
}

.selisih {
  font-size: 14px;
  font-weight: 500;
}

/* Balance Sheet Grid */
.balance-sheet-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.balance-column {
  display: flex;
  flex-direction: column;
}

.column-header {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: white;
  border-radius: 8px;
  margin-bottom: 24px;
}

.column-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

/* Balance Tables */
.balance-table {
  background: #fafbfc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 16px;
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
  min-width: 200px;
  text-align: right;
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

.table-subtotal,
.table-total {
  background: white;
  padding: 20px 24px;
  border-top: 2px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.subtotal-label,
.total-label {
  font-weight: 700;
  font-size: 16px;
  color: #1f2937;
}

.subtotal-amount,
.total-amount {
  font-size: 18px;
  font-weight: 700;
}

.primary {
  color: #7c3aed;
}

.profit {
  color: #16a34a;
}

.loss {
  color: #dc2626;
}

.laba-row {
  background: #fef3c7;
}

/* Sub-sections */
.sub-section {
  margin-bottom: 24px;
}

.sub-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

/* Responsive */
@media (max-width: 992px) {
  .balance-sheet-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .report-header {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .balance-sheet-professional {
    padding: 16px;
  }

  .filter-row {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .table-row {
    flex-direction: column;
    gap: 8px;
    padding: 20px;
  }
}
</style>
