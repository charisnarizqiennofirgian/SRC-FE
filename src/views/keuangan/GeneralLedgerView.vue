<template>
  <DashboardLayout>
    <div class="bukubesar-wrap">

      <!-- PAGE HEADER -->
      <div class="page-header">
        <div class="header-left">
          <div class="icon-badge">📒</div>
          <div>
            <div class="hero-eyebrow">Laporan Keuangan</div>
            <h1 class="page-title">Buku <span class="accent">Besar</span></h1>
            <p class="page-subtitle">Laporan mutasi akun secara detail</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-toggle-view" @click="toggleCardView" v-if="hasData">
            {{ cardView ? '📋 Tabel' : '🗂️ Kartu' }}
          </button>
          <button class="btn-export" @click="exportExcel" :disabled="!hasData">
            📊 Export Excel
          </button>
        </div>
      </div>

      <!-- FILTER CARD -->
      <div class="filter-card">
        <div class="filter-inner">
          <div class="filter-field filter-coa">
            <label class="filter-label">Akun COA</label>
            <select v-model="filters.account_id" class="form-control" required>
              <option value="">Pilih akun...</option>
              <option v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.code }} - {{ account.name }}
              </option>
            </select>
          </div>
          <div class="filter-field filter-date">
            <label class="filter-label">Periode</label>
            <div class="date-range">
              <input v-model="filters.start_date" type="date" class="form-control" required />
              <span class="date-sep">s/d</span>
              <input v-model="filters.end_date" type="date" class="form-control" required />
            </div>
          </div>
          <div class="filter-btns">
            <button class="btn-reset" @click="resetFilters">↺ Reset</button>
            <button class="btn-generate" @click="fetchData" :disabled="!canFilter || loading">
              <span v-if="loading">⏳ Memuat...</span>
              <span v-else>🔍 Tampilkan</span>
            </button>
          </div>
        </div>
      </div>

      <!-- EMPTY STATE -->
      <div v-if="!hasData && !loading" class="state-card empty-state">
        <div class="state-icon">📒</div>
        <div class="state-title">Pilih Akun & Periode</div>
        <div class="state-desc">Gunakan filter di atas untuk melihat mutasi buku besar</div>
      </div>

      <!-- LOADING -->
      <div v-else-if="loading" class="state-card loading-state">
        <div class="spinner-ring"></div>
        <p class="state-desc">Mengambil data transaksi...</p>
      </div>

      <!-- DATA -->
      <div v-else>

        <!-- ACCOUNT INFO BAR -->
        <div class="account-bar">
          <div class="ab-left">
            <div class="ab-code">{{ ledgerData.account.code }}</div>
            <div class="ab-name">{{ ledgerData.account.name }}</div>
            <div class="ab-period">{{ formatDateRange(filters.start_date, filters.end_date) }}</div>
          </div>
          <div class="ab-right">
            <div class="ab-stat">
              <div class="abs-label">Saldo Awal</div>
              <div :class="['abs-value', ledgerData.saldo_awal >= 0 ? 'pos' : 'neg']">
                {{ formatRupiah(ledgerData.saldo_awal) }}
              </div>
            </div>
            <div class="ab-divider"></div>
            <div class="ab-stat">
              <div class="abs-label">{{ transactions.length }} Transaksi</div>
              <div class="abs-value neutral">{{ formatDateRange(filters.start_date, filters.end_date) }}</div>
            </div>
            <div class="ab-divider"></div>
            <div class="ab-stat">
              <div class="abs-label">Saldo Akhir</div>
              <div :class="['abs-value large', summary.saldo_akhir >= 0 ? 'pos' : 'neg']">
                {{ formatRupiah(summary.saldo_akhir) }}
              </div>
            </div>
          </div>
        </div>

        <!-- TABLE VIEW -->
        <div v-if="!cardView" class="report-card">
          <div class="table-topbar">
            <span class="table-count">{{ transactions.length }} transaksi ditemukan</span>
          </div>
          <div class="table-wrapper">
            <table class="ledger-table">
              <thead>
                <tr>
                  <th class="th-date">Tanggal</th>
                  <th class="th-journal">No. Jurnal</th>
                  <th class="th-desc">Keterangan</th>
                  <th class="th-amount">Debit</th>
                  <th class="th-amount">Kredit</th>
                  <th class="th-balance">Saldo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="transactions.length === 0">
                  <td colspan="6" class="empty-td">
                    <div class="empty-td-inner">
                      <span>📅</span>
                      <span>Tidak ada transaksi pada periode ini</span>
                    </div>
                  </td>
                </tr>
                <tr
                  v-for="(trx, index) in transactions"
                  :key="index"
                  :class="['data-row', index % 2 === 0 ? 'row-even' : '']"
                >
                  <td class="td-date">{{ formatDate(trx.transaction_date) }}</td>
                  <td class="td-journal">
                    <a href="#" @click.prevent="viewJournal(trx.journal_entry_id)" class="journal-link">
                      {{ trx.journal_number }}
                    </a>
                  </td>
                  <td class="td-desc">{{ trx.description }}</td>
                  <td class="td-amount">
                    <span v-if="trx.debit > 0" class="amt-debit">{{ formatRupiah(trx.debit) }}</span>
                    <span v-else class="amt-nil">—</span>
                  </td>
                  <td class="td-amount">
                    <span v-if="trx.credit > 0" class="amt-credit">{{ formatRupiah(trx.credit) }}</span>
                    <span v-else class="amt-nil">—</span>
                  </td>
                  <td class="td-balance">
                    <span :class="['running-balance', trx.running_balance >= 0 ? 'pos' : 'neg']">
                      {{ formatRupiah(trx.running_balance) }}
                    </span>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="tfoot-total">
                  <td colspan="3" class="tfoot-label">Total Mutasi</td>
                  <td class="tfoot-debit">{{ formatRupiah(summary.total_debit) }}</td>
                  <td class="tfoot-credit">{{ formatRupiah(summary.total_credit) }}</td>
                  <td></td>
                </tr>
                <tr class="tfoot-final">
                  <td colspan="5" class="tfoot-final-label">Saldo Akhir</td>
                  <td :class="['tfoot-final-val', summary.saldo_akhir >= 0 ? 'pos' : 'neg']">
                    {{ formatRupiah(summary.saldo_akhir) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- CARD VIEW -->
        <div v-else class="card-grid">
          <div
            v-for="(trx, index) in transactions"
            :key="index"
            class="trx-card"
          >
            <div class="trx-head">
              <span class="trx-date">{{ formatDate(trx.transaction_date) }}</span>
              <a href="#" @click.prevent="viewJournal(trx.journal_entry_id)" class="trx-journal">
                {{ trx.journal_number }}
              </a>
            </div>
            <div class="trx-desc">{{ trx.description }}</div>
            <div class="trx-amounts">
              <div class="trx-amt-item">
                <div class="tai-label">Debit</div>
                <div class="tai-value debit-v">{{ trx.debit > 0 ? formatRupiah(trx.debit) : '—' }}</div>
              </div>
              <div class="trx-amt-divider"></div>
              <div class="trx-amt-item">
                <div class="tai-label">Kredit</div>
                <div class="tai-value credit-v">{{ trx.credit > 0 ? formatRupiah(trx.credit) : '—' }}</div>
              </div>
            </div>
            <div class="trx-balance">
              <span class="tb-label">Saldo Berjalan</span>
              <span :class="['tb-value', trx.running_balance >= 0 ? 'pos' : 'neg']">
                {{ formatRupiah(trx.running_balance) }}
              </span>
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
      filters: { account_id: '', start_date: '', end_date: '' },
      accounts: [],
      ledgerData: null,
      loading: false,
      cardView: false,
    }
  },
  computed: {
    hasData() { return this.ledgerData !== null },
    canFilter() { return this.filters.account_id && this.filters.start_date && this.filters.end_date },
    transactions() { return this.ledgerData?.transactions || [] },
    summary() { return this.ledgerData?.summary || { total_debit: 0, total_credit: 0, saldo_akhir: 0 } },
  },
  mounted() { this.fetchAccounts(); this.setDefaultDates() },
  methods: {
    async fetchAccounts() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('/api/coa/all', { headers: { Authorization: `Bearer ${token}` } })
        this.accounts = response.data.data || response.data
      } catch (error) { console.error('Error fetching accounts:', error) }
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
        if (response.data.success) this.ledgerData = response.data.data
      } catch (error) { console.error('Error:', error) }
      finally { this.loading = false }
    },
    resetFilters() { this.filters.account_id = ''; this.setDefaultDates(); this.ledgerData = null },
    viewJournal(id) { this.$router.push(`/admin/keuangan/jurnal-umum/${id}`) },
    exportExcel() { alert('Export Excel ready!') },
    toggleCardView() { this.cardView = !this.cardView },
    formatDateRange(start, end) { return `${this.formatDate(start)} → ${this.formatDate(end)}` },
    formatDate(date) {
      return date ? new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
    },
    formatRupiah(num) {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0)
    },
  },
}
</script>

<style scoped>
.bukubesar-wrap { display: flex; flex-direction: column; gap: 18px; }

/* ===== PAGE HEADER ===== */
.page-header {
  background: #fff; border: 1.5px solid #f3f4f6; border-left: 5px solid #0f766e;
  border-radius: 14px; padding: 22px 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;
}
.header-left { display: flex; align-items: center; gap: 16px; }
.icon-badge { width: 50px; height: 50px; background: #ccfbf1; border: 1.5px solid #99f6e4; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
.hero-eyebrow { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #0f766e; font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
.hero-eyebrow::before { content: ''; display: inline-block; width: 14px; height: 2px; background: #0f766e; border-radius: 2px; }
.page-title { font-size: 24px; font-weight: 800; color: #111827; letter-spacing: -0.5px; margin: 0 0 3px; line-height: 1.1; }
.page-title .accent { color: #0f766e; }
.page-subtitle { font-size: 13px; color: #6b7280; margin: 0; }
.header-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.btn-toggle-view { padding: 9px 16px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; background: #fff; color: #374151; border: 1.5px solid #e5e7eb; transition: all 0.2s; font-family: inherit; }
.btn-toggle-view:hover { background: #f0fdfa; border-color: #99f6e4; color: #0f766e; }
.btn-export { padding: 9px 16px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; background: #f0fdfa; color: #0f766e; border: 1.5px solid #99f6e4; transition: all 0.2s; font-family: inherit; }
.btn-export:hover:not(:disabled) { background: #ccfbf1; }
.btn-export:disabled { opacity: 0.4; cursor: not-allowed; }

/* ===== FILTER CARD ===== */
.filter-card { background: #fff; border: 1.5px solid #f3f4f6; border-radius: 14px; padding: 18px 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.filter-inner { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
.filter-field { display: flex; flex-direction: column; gap: 6px; }
.filter-coa { flex: 2; min-width: 200px; }
.filter-date { flex: 3; min-width: 240px; }
.filter-label { font-size: 11.5px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; }
.date-range { display: flex; align-items: center; gap: 10px; }
.date-sep { font-size: 12px; font-weight: 700; color: #9ca3af; white-space: nowrap; }
.form-control { padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-family: inherit; background: #fafafa; color: #111827; transition: all 0.2s; outline: none; box-sizing: border-box; width: 100%; }
.form-control:focus { border-color: #0f766e; background: #fff; box-shadow: 0 0 0 3px rgba(15,118,110,0.1); }
.filter-btns { display: flex; gap: 10px; flex-shrink: 0; align-self: flex-end; }
.btn-reset { padding: 10px 16px; border-radius: 8px; font-size: 13.5px; font-weight: 600; cursor: pointer; background: #fff; color: #374151; border: 1.5px solid #e5e7eb; transition: all 0.2s; font-family: inherit; }
.btn-reset:hover { background: #f9fafb; }
.btn-generate { padding: 10px 20px; border-radius: 8px; font-size: 13.5px; font-weight: 700; cursor: pointer; background: #0f766e; color: #fff; border: none; transition: all 0.2s; font-family: inherit; box-shadow: 0 3px 10px rgba(15,118,110,0.25); }
.btn-generate:hover:not(:disabled) { background: #0d6b63; transform: translateY(-1px); }
.btn-generate:disabled { opacity: 0.4; cursor: not-allowed; }

/* ===== STATES ===== */
.state-card { background: #fff; border: 1.5px solid #f3f4f6; border-radius: 14px; padding: 80px 20px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.06); display: flex; flex-direction: column; align-items: center; gap: 12px; }
.state-icon { font-size: 52px; opacity: 0.15; }
.state-title { font-size: 18px; font-weight: 800; color: #374151; }
.state-desc { font-size: 13.5px; color: #9ca3af; }
.spinner-ring { width: 44px; height: 44px; border: 4px solid #f3f4f6; border-top-color: #0f766e; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== ACCOUNT BAR ===== */
.account-bar {
  background: linear-gradient(135deg, #042f2e 0%, #0f4c45 50%, #0f766e 100%);
  border-radius: 14px; padding: 22px 28px;
  display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap;
  box-shadow: 0 4px 16px rgba(15,118,110,0.25);
}
.ab-left { display: flex; flex-direction: column; gap: 4px; }
.ab-code { font-family: 'Courier New', monospace; font-size: 12px; font-weight: 700; color: #5eead4; letter-spacing: 1px; }
.ab-name { font-size: 18px; font-weight: 800; color: #fff; letter-spacing: -0.3px; }
.ab-period { font-size: 12px; color: rgba(255,255,255,0.6); }
.ab-right { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
.ab-stat { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
.abs-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.55); font-weight: 700; }
.abs-value { font-family: 'Courier New', monospace; font-size: 14px; font-weight: 700; }
.abs-value.pos { color: #6ee7b7; }
.abs-value.neg { color: #fca5a5; }
.abs-value.neutral { color: rgba(255,255,255,0.7); font-size: 11px; }
.abs-value.large { font-size: 18px; font-weight: 900; }
.ab-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.15); }

/* ===== REPORT CARD (TABLE) ===== */
.report-card { background: #fff; border: 1.5px solid #f3f4f6; border-radius: 14px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; }
.table-topbar { padding: 14px 22px; background: #fafafa; border-bottom: 1.5px solid #f3f4f6; display: flex; align-items: center; justify-content: space-between; }
.table-count { font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
.table-wrapper { overflow-x: auto; }
.ledger-table { width: 100%; border-collapse: collapse; min-width: 800px; }
.ledger-table thead { background: #1e293b; }
.ledger-table th { padding: 13px 18px; text-align: left; color: #e2e8f0; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; white-space: nowrap; }
.th-amount, .th-balance { text-align: right; }
.th-date { width: 110px; }
.th-journal { width: 140px; }
.th-desc { }
.th-amount { width: 140px; }
.th-balance { width: 150px; }

.data-row { border-bottom: 1px solid #f9fafb; transition: background 0.15s; }
.row-even { background: #fcfcfd; }
.data-row:hover { background: #f0fdfa; }
.ledger-table td { padding: 13px 18px; font-size: 13.5px; color: #374151; vertical-align: middle; }
.td-date { font-size: 13px; font-weight: 600; color: #1e293b; white-space: nowrap; }
.td-journal { }
.td-desc { color: #6b7280; max-width: 280px; }
.td-amount { text-align: right; }
.td-balance { text-align: right; }
.journal-link { font-family: 'Courier New', monospace; font-size: 12.5px; font-weight: 700; color: #0f766e; text-decoration: none; background: #f0fdfa; padding: 4px 8px; border-radius: 6px; border: 1px solid #99f6e4; display: inline-block; transition: all 0.2s; }
.journal-link:hover { background: #ccfbf1; transform: translateX(2px); }
.amt-debit { font-family: 'Courier New', monospace; font-weight: 700; color: #059669; font-size: 13px; }
.amt-credit { font-family: 'Courier New', monospace; font-weight: 700; color: #2563eb; font-size: 13px; }
.amt-nil { color: #d1d5db; font-size: 16px; }
.running-balance { font-family: 'Courier New', monospace; font-weight: 800; font-size: 13px; }
.running-balance.pos { color: #059669; }
.running-balance.neg { color: #dc2626; }

/* tfoot */
.tfoot-total { background: #1e293b; }
.tfoot-total td { padding: 13px 18px; }
.tfoot-label { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: rgba(255,255,255,0.7); }
.tfoot-debit { font-family: 'Courier New', monospace; font-weight: 800; color: #6ee7b7; text-align: right; font-size: 13px; }
.tfoot-credit { font-family: 'Courier New', monospace; font-weight: 800; color: #93c5fd; text-align: right; font-size: 13px; }
.tfoot-final { background: #0f766e; }
.tfoot-final td { padding: 14px 18px; }
.tfoot-final-label { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: rgba(255,255,255,0.8); }
.tfoot-final-val { font-family: 'Courier New', monospace; font-weight: 900; font-size: 16px; text-align: right; }
.tfoot-final-val.pos { color: #fff; }
.tfoot-final-val.neg { color: #fca5a5; }

.empty-td { padding: 40px !important; text-align: center; }
.empty-td-inner { display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 14px; color: #9ca3af; }
.empty-td-inner span:first-child { font-size: 28px; opacity: 0.4; }

/* ===== CARD GRID ===== */
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.trx-card { background: #fff; border: 1.5px solid #f3f4f6; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: all 0.2s; }
.trx-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.1); border-color: #99f6e4; }
.trx-head { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fafafa; border-bottom: 1.5px solid #f3f4f6; }
.trx-date { font-size: 12px; font-weight: 700; color: #374151; }
.trx-journal { font-family: 'Courier New', monospace; font-size: 12px; font-weight: 700; color: #0f766e; text-decoration: none; background: #f0fdfa; padding: 3px 8px; border-radius: 6px; border: 1px solid #99f6e4; }
.trx-desc { padding: 12px 16px; font-size: 13.5px; color: #374151; font-weight: 500; border-bottom: 1px solid #f9fafb; }
.trx-amounts { display: flex; align-items: center; padding: 12px 16px; border-bottom: 1px solid #f9fafb; }
.trx-amt-item { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.trx-amt-item:last-child { align-items: flex-end; }
.trx-amt-divider { width: 1px; height: 32px; background: #f3f4f6; margin: 0 12px; }
.tai-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; }
.tai-value { font-family: 'Courier New', monospace; font-size: 13px; font-weight: 800; }
.debit-v { color: #059669; }
.credit-v { color: #2563eb; }
.trx-balance { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fafafa; }
.tb-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; }
.tb-value { font-family: 'Courier New', monospace; font-size: 14px; font-weight: 900; }
.tb-value.pos { color: #059669; }
.tb-value.neg { color: #dc2626; }

/* SHARED */
.pos { color: #059669; }
.neg { color: #dc2626; }

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .page-header { padding: 18px 20px; }
  .filter-inner { flex-direction: column; align-items: stretch; }
  .filter-coa, .filter-date { flex: auto; }
  .date-range { flex-wrap: wrap; }
  .filter-btns { flex-direction: row; }
  .account-bar { flex-direction: column; align-items: flex-start; }
  .ab-right { width: 100%; justify-content: space-between; }
  .card-grid { grid-template-columns: 1fr; }
}
</style>