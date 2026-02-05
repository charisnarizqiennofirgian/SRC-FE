<template>
  <DashboardLayout>
    <div class="general-ledger">
      <!-- Hero Header -->
      <div class="hero-header">
        <div class="header-left">
          <div class="header-icon">
            <i class="fas fa-book"></i>
          </div>
          <div class="header-text">
            <h1 class="page-title">Buku Besar</h1>
            <p class="page-subtitle">Laporan mutasi akun secara detail</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn btn-export" @click="exportExcel" :disabled="!hasData">
            <i class="fas fa-file-excel"></i>
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      <!-- Advanced Filter Panel -->
      <div class="filter-panel">
        <div class="filter-tabs">
          <button class="filter-tab active" @click="filterMode = 'basic'">
            <i class="fas fa-filter"></i>
            Sederhana
          </button>
          <button class="filter-tab" @click="filterMode = 'advanced'">
            <i class="fas fa-cogs"></i>
            Lanjutan
          </button>
        </div>

        <div class="filter-grid">
          <!-- Basic Filters -->
          <div v-if="filterMode === 'basic'" class="basic-filters">
            <div class="filter-group">
              <label class="filter-label">
                <i class="fas fa-building-columns"></i>
                Akun COA
              </label>
              <div class="select-wrapper">
                <select v-model="filters.account_id" class="filter-input" required>
                  <option value="">Pilih akun...</option>
                  <option v-for="account in accounts" :key="account.id" :value="account.id">
                    {{ account.code }} - {{ account.name }}
                  </option>
                </select>
                <i class="fas fa-chevron-down"></i>
              </div>
            </div>

            <div class="filter-group date-range">
              <label class="filter-label">
                <i class="fas fa-calendar"></i>
                Periode
              </label>
              <div class="date-range-inputs">
                <input
                  v-model="filters.start_date"
                  type="date"
                  class="filter-input date-input"
                  required
                />
                <i class="fas fa-arrow-right mx-2"></i>
                <input
                  v-model="filters.end_date"
                  type="date"
                  class="filter-input date-input"
                  required
                />
              </div>
            </div>

            <div class="filter-actions">
              <button class="btn btn-primary" @click="fetchData" :disabled="!canFilter || loading">
                <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-search"></i>
                {{ loading ? 'Memuat...' : 'Tampilkan' }}
              </button>
              <button class="btn btn-secondary" @click="resetFilters">
                <i class="fas fa-refresh"></i>
                Reset
              </button>
            </div>
          </div>

          <!-- Advanced Filters (Placeholder) -->
          <div v-else class="advanced-filters">
            <div class="coming-soon">
              <i class="fas fa-rocket"></i>
              <h3>Fitur Lanjutan Segera Hadir</h3>
              <p>Filter berdasarkan tipe jurnal, cabang, dan kriteria lainnya</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Header (when data loaded) -->
      <div v-if="hasData" class="account-header">
        <div class="account-info">
          <div class="account-code">
            <i class="fas fa-building-columns"></i>
            {{ ledgerData.account.code }}
          </div>
          <div class="account-name">{{ ledgerData.account.name }}</div>
        </div>

        <div class="period-info">
          <div class="period-dates">
            {{ formatDateRange(filters.start_date, filters.end_date) }}
          </div>
          <div class="saldo-awal">
            <span class="saldo-label">Saldo Awal:</span>
            <span class="saldo-value" :class="saldoClass">
              {{ formatRupiah(ledgerData.saldo_awal) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-wrapper">
        <!-- Empty State -->
        <div v-if="!hasData && !loading" class="empty-hero">
          <div class="empty-icon">
            <i class="fas fa-book-open"></i>
          </div>
          <div class="empty-content">
            <h3>Pilih akun dan periode</h3>
            <p>Gunakan filter di atas untuk melihat mutasi buku besar</p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else-if="loading" class="loading-hero">
          <div class="spinner spinner-xl"></div>
          <div class="loading-text">
            <h3>Memproses data...</h3>
            <p>Mengambil transaksi dari database</p>
          </div>
        </div>

        <!-- Data Table -->
        <div v-else class="data-section">
          <div class="table-header">
            <div class="table-title">
              <i class="fas fa-list"></i>
              <span>{{ transactions.length }} transaksi</span>
            </div>
            <div class="table-actions">
              <button class="btn btn-sm btn-secondary" @click="toggleCardView">
                <i class="fas fa-th-list"></i>
                <span>{{ cardView ? 'Tabel' : 'Card' }}</span>
              </button>
            </div>
          </div>

          <!-- Table View -->
          <div v-if="!cardView" class="table-container">
            <div class="table-wrapper">
              <table class="ledger-table">
                <thead class="table-head">
                  <tr>
                    <th>Tanggal</th>
                    <th>No. Jurnal</th>
                    <th>Keterangan</th>
                    <th>Debit</th>
                    <th>Kredit</th>
                    <th>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="transactions.length === 0">
                    <td colspan="6" class="empty-row">
                      <div class="empty-state">
                        <i class="fas fa-calendar-times"></i>
                        <p>Tidak ada transaksi pada periode ini</p>
                      </div>
                    </td>
                  </tr>
                  <tr v-else v-for="(trx, index) in transactions" :key="index" class="table-row">
                    <td class="date-cell">
                      <div class="date">{{ formatDate(trx.transaction_date) }}</div>
                    </td>
                    <td class="journal-cell">
                      <a
                        href="#"
                        @click.prevent="viewJournal(trx.journal_entry_id)"
                        class="journal-link"
                      >
                        {{ trx.journal_number }}
                      </a>
                    </td>
                    <td class="desc-cell">
                      <div class="description">{{ trx.description }}</div>
                    </td>
                    <td class="amount-cell debit">
                      {{ trx.debit > 0 ? formatRupiah(trx.debit) : '-' }}
                    </td>
                    <td class="amount-cell credit">
                      {{ trx.credit > 0 ? formatRupiah(trx.credit) : '-' }}
                    </td>
                    <td class="balance-cell">
                      <span :class="balanceClass(trx.running_balance)">
                        {{ formatRupiah(trx.running_balance) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
                <tfoot class="table-foot">
                  <tr class="total-row">
                    <td colspan="3" class="total-label">
                      <strong>Total Mutasi</strong>
                    </td>
                    <td class="total-debit">
                      <strong>{{ formatRupiah(summary.total_debit) }}</strong>
                    </td>
                    <td class="total-credit">
                      <strong>{{ formatRupiah(summary.total_credit) }}</strong>
                    </td>
                    <td></td>
                  </tr>
                  <tr class="final-row">
                    <td colspan="5" class="final-label">
                      <strong>Saldo Akhir</strong>
                    </td>
                    <td class="final-balance">
                      <strong :class="finalBalanceClass">
                        {{ formatRupiah(summary.saldo_akhir) }}
                      </strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Card View (Bonus Feature) -->
          <div v-else class="card-container">
            <div v-for="(trx, index) in transactions" :key="index" class="transaction-card">
              <div class="card-header">
                <div class="date-badge">
                  {{ formatShortDate(trx.transaction_date) }}
                </div>
                <div class="journal-link">
                  <a @click.prevent="viewJournal(trx.journal_entry_id)">
                    {{ trx.journal_number }}
                  </a>
                </div>
              </div>
              <div class="card-body">
                <div class="transaction-desc">{{ trx.description }}</div>
                <div class="amounts-row">
                  <div class="amount debit">
                    <span class="amount-label">Debit</span>
                    <span class="amount-value">{{ formatRupiah(trx.debit) }}</span>
                  </div>
                  <div class="amount credit">
                    <span class="amount-label">Kredit</span>
                    <span class="amount-value">{{ formatRupiah(trx.credit) }}</span>
                  </div>
                </div>
                <div class="balance-row">
                  <span class="balance-label">Saldo</span>
                  <span class="balance-value" :class="balanceClass(trx.running_balance)">
                    {{ formatRupiah(trx.running_balance) }}
                  </span>
                </div>
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
  name: 'GeneralLedgerView',
  components: { DashboardLayout },
  data() {
    return {
      filters: {
        account_id: '',
        start_date: '',
        end_date: '',
      },
      accounts: [],
      ledgerData: null,
      loading: false,
      error: null,
      filterMode: 'basic',
      cardView: false,
    }
  },
  computed: {
    hasData() {
      return this.ledgerData !== null
    },
    canFilter() {
      return this.filters.account_id && this.filters.start_date && this.filters.end_date
    },
    transactions() {
      return this.ledgerData?.transactions || []
    },
    summary() {
      return this.ledgerData?.summary || { total_debit: 0, total_credit: 0, saldo_akhir: 0 }
    },
  },
  mounted() {
    this.fetchAccounts()
    this.setDefaultDates()
  },
  methods: {
    async fetchAccounts() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('/api/coa/all', {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.accounts = response.data.data || response.data
      } catch (error) {
        console.error('Error fetching accounts:', error)
      }
    },
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
        const response = await axios.get('/api/general-ledger', {
          params: this.filters,
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.data.success) {
          this.ledgerData = response.data.data
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        this.loading = false
      }
    },
    resetFilters() {
      this.filters.account_id = ''
      this.setDefaultDates()
      this.ledgerData = null
    },
    viewJournal(id) {
      this.$router.push(`/admin/keuangan/jurnal-umum/${id}`)
    },
    exportExcel() {
      // Export logic here
      alert('Export Excel ready!')
    },
    formatDateRange(start, end) {
      return `${this.formatDate(start)} → ${this.formatDate(end)}`
    },
    formatDate(date) {
      return date
        ? new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '-'
    },
    formatShortDate(date) {
      return date
        ? new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'numeric',
          })
        : '-'
    },
    formatRupiah(num) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(num)
    },
    saldoClass() {
      return this.ledgerData?.saldo_awal >= 0 ? 'positive' : 'negative'
    },
    balanceClass(balance) {
      return balance >= 0 ? 'positive' : 'negative'
    },
    finalBalanceClass() {
      return this.summary.saldo_akhir >= 0 ? 'positive' : 'negative'
    },
    toggleCardView() {
      this.cardView = !this.cardView
    },
  },
}
</script>

<style scoped>
.general-ledger {
  padding: 32px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

/* Hero Header */
.hero-header {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  padding: 48px;
  border-radius: 32px;
  margin-bottom: 40px;
  box-shadow: 0 35px 60px -12px rgba(30, 41, 59, 0.4);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.page-title {
  font-size: 40px;
  font-weight: 800;
  margin: 0 0 12px 0;
  line-height: 1.1;
}

.page-subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
  font-weight: 500;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 32px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: 20px;
  font-weight: 700;
  font-size: 15px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
}

.btn-export:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(16, 185, 129, 0.4);
}

.btn-export:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Filter Panel */
.filter-panel {
  background: white;
  border-radius: 28px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 24px;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  border: none;
  background: none;
  color: #64748b;
  font-weight: 600;
  border-radius: 16px 16px 0 0;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-tab:hover {
  color: #3b82f6;
}

.filter-tab.active {
  color: #3b82f6;
  background: #eff6ff;
  border-bottom: 3px solid #3b82f6;
}

.filter-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 24px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.date-range {
  grid-column: span 2;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
  font-size: 15px;
}

.label-icon {
  width: 20px;
  font-size: 14px;
  opacity: 0.8;
}

.filter-input {
  padding: 18px 24px;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s;
  background: #fafbff;
}

.filter-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.date-range-inputs {
  display: flex;
  gap: 16px;
  align-items: center;
}

.date-input {
  flex: 1;
}

.filter-actions {
  display: flex;
  gap: 12px;
  align-self: end;
}

.btn-filter,
.btn-reset {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 18px 24px;
  border-radius: 20px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-filter {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.btn-filter:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(59, 130, 246, 0.4);
}

.btn-reset {
  background: #f1f5f9;
  color: #64748b;
}

.btn-reset:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

/* Account Header */
.account-header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.account-info h3 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.account-code {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 8px;
}

.account-code i {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.period-info {
  text-align: right;
}

.period-dates {
  font-size: 15px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
}

.saldo-awal {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
}

.saldo-label {
  color: #64748b;
  font-weight: 600;
}

.saldo-value {
  font-weight: 800;
  font-size: 24px;
}

.saldo-value.positive {
  color: #10b981;
}
.saldo-value.negative {
  color: #ef4444;
}

/* Content States */
.empty-hero,
.loading-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  background: white;
  border-radius: 28px;
  padding: 60px 40px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

.empty-icon,
.loading-icon {
  font-size: 96px;
  margin-bottom: 32px;
  opacity: 0.1;
}

.loading-hero .spinner-xl {
  width: 80px;
  height: 80px;
  border: 6px solid #f3f4f6;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 32px;
}

/* Data Section */
.data-section {
  background: white;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 40px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.table-title i {
  color: #10b981;
  font-size: 24px;
}

.table-actions .btn-sm {
  padding: 10px 20px;
  font-size: 14px;
}

/* Table */
.table-container {
  padding: 0 40px 40px;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 20px;
  margin: 24px 0;
}

.ledger-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  min-width: 900px;
}

.table-head th {
  padding: 24px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-weight: 700;
  color: #374151;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border-bottom: 3px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.table-row {
  transition: all 0.3s;
  border-bottom: 1px solid #f8fafc;
}

.table-row:hover {
  background: linear-gradient(135deg, #fafbff 0%, #f0f9ff 100%);
  transform: scale(1.01);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.table-row td {
  padding: 24px 20px;
  vertical-align: middle;
}

.date-cell {
  width: 120px;
  font-weight: 600;
  color: #1e293b;
}

.journal-cell {
  width: 160px;
}

.journal-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s;
  display: inline-block;
}

.journal-link:hover {
  background: rgba(59, 130, 246, 0.1);
  transform: translateX(4px);
}

.desc-cell {
  min-width: 300px;
  color: #475569;
  font-weight: 500;
}

.amount-cell {
  font-weight: 800;
  font-size: 16px;
  text-align: right;
  position: relative;
}

.amount-cell.debit .amount-value {
  color: #3b82f6;
}

.amount-cell.credit .amount-value {
  color: #10b981;
}

.balance-cell {
  font-weight: 900;
  font-size: 17px;
  padding-right: 8px;
}

.balance-cell .positive {
  color: #10b981;
}
.balance-cell .negative {
  color: #ef4444;
}

/* Table Footer */
.table-foot {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
}

.table-foot th,
.table-foot td {
  padding: 24px 20px;
  border: none;
  font-weight: 700;
}

.total-row {
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

.total-label {
  color: rgba(255, 255, 255, 0.9);
}

.total-debit strong {
  color: #60a5fa;
}
.total-credit strong {
  color: #34d399;
}

.final-row {
  font-size: 18px;
}

.final-balance strong.positive {
  color: #10b981;
}
.final-balance strong.negative {
  color: #f87171;
}

/* Card View */
.card-container {
  padding: 40px;
  display: grid;
  gap: 20px;
}

.transaction-card {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  transition: all 0.3s;
}

.transaction-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.date-badge {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 13px;
}

.card-body .transaction-desc {
  color: #1e293b;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 24px;
  line-height: 1.6;
}

.amounts-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 16px;
}

.amount {
  text-align: center;
  flex: 1;
}

.amount-label {
  display: block;
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.amount-value {
  font-size: 24px;
  font-weight: 800;
}

.amount.debit .amount-value {
  color: #3b82f6;
}
.amount.credit .amount-value {
  color: #10b981;
}

.balance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 16px;
  border: 1px solid #bbf7d0;
}

.balance-label {
  font-weight: 700;
  color: #166534;
  font-size: 15px;
}

.balance-value {
  font-size: 22px;
  font-weight: 900;
}

.balance-value.positive {
  color: #059669;
}
.balance-value.negative {
  color: #dc2626;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%) !important;
}

/* Empty States */
.empty-hero .empty-icon,
.empty-row .empty-state i {
  font-size: 64px;
  color: #cbd5e1;
  margin-bottom: 20px;
}

.empty-hero h3,
.empty-row h3 {
  color: #64748b;
  font-weight: 600;
  margin-bottom: 8px;
}

/* Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.table-row {
  animation: fadeInUp 0.5s ease forwards;
}

/* Responsive */
@media (max-width: 1200px) {
  .filter-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .date-range {
    grid-column: 1;
  }
}

@media (max-width: 768px) {
  .general-ledger {
    padding: 20px 0;
  }

  .hero-header {
    flex-direction: column;
    gap: 32px;
    text-align: center;
    padding: 32px 24px;
  }

  .account-header {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }

  .table-wrapper {
    margin: 16px -16px;
  }
  .ledger-table {
    font-size: 14px;
    min-width: 700px;
  }

  .amounts-row {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
