<template>
  <DashboardLayout>
    <div class="labarugi-wrap">

      <!-- PAGE HEADER -->
      <div class="page-header">
        <div class="header-left">
          <div class="icon-badge">📈</div>
          <div>
            <div class="hero-eyebrow">Laporan Keuangan</div>
            <h1 class="page-title">Laba Rugi <span class="accent">Income Statement</span></h1>
            <p class="page-subtitle">PT. Surya Bangkit Cemerlang</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-export pdf" @click="exportPDF" :disabled="!hasData">📄 Export PDF</button>
          <button class="btn-export excel" @click="exportExcel" :disabled="!hasData">📊 Export Excel</button>
        </div>
      </div>

      <!-- FILTER CARD -->
      <div class="filter-card">
        <div class="filter-inner">
          <div class="filter-field">
            <label class="filter-label">Periode Laporan</label>
            <div class="date-range">
              <input v-model="filters.start_date" type="date" class="form-control" required />
              <span class="date-sep">s/d</span>
              <input v-model="filters.end_date" type="date" class="form-control" required />
            </div>
          </div>
          <div class="filter-btns">
            <button class="btn-reset" @click="resetFilters">↺ Reset</button>
            <button class="btn-generate" @click="fetchData" :disabled="!canFilter || loading">
              <span v-if="loading">⏳ Memproses...</span>
              <span v-else>🔍 Tampilkan Laporan</span>
            </button>
          </div>
        </div>
      </div>

      <!-- EMPTY STATE -->
      <div v-if="!hasData && !loading" class="state-card empty-state">
        <div class="state-icon">📈</div>
        <div class="state-title">Pilih Periode Laporan</div>
        <div class="state-desc">Tentukan rentang tanggal untuk menampilkan Laporan Laba Rugi</div>
      </div>

      <!-- LOADING -->
      <div v-else-if="loading" class="state-card loading-state">
        <div class="spinner-ring"></div>
        <p class="state-desc">Memuat laporan laba rugi...</p>
      </div>

      <!-- REPORT -->
      <div v-else class="report-card">

        <!-- REPORT BAND -->
        <div class="report-band">
          <div class="band-identity">
            <div class="band-company">PT. Surya Bangkit Cemerlang</div>
            <div class="band-title">LAPORAN LABA RUGI</div>
            <div class="band-period">Periode: <strong>{{ formatDateRange(filters.start_date, filters.end_date) }}</strong></div>
          </div>
          <!-- Net profit preview in header -->
          <div :class="['net-preview', reportData.laba_bersih >= 0 ? 'net-profit' : 'net-loss']">
            <div class="np-label">{{ reportData.laba_bersih >= 0 ? 'Laba Bersih' : 'Rugi Bersih' }}</div>
            <div class="np-value">{{ formatRupiah(reportData.laba_bersih) }}</div>
          </div>
        </div>

        <!-- SUMMARY STRIP -->
        <div class="summary-strip">
          <div class="summary-item">
            <div class="si-label">Total Pendapatan</div>
            <div class="si-value income-val">{{ formatRupiah(reportData.pendapatan.total) }}</div>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-item">
            <div class="si-label">Total HPP</div>
            <div class="si-value hpp-val">({{ formatRupiah(reportData.hpp.total) }})</div>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-item">
            <div class="si-label">Laba Kotor</div>
            <div :class="['si-value', reportData.laba_kotor >= 0 ? 'profit-val' : 'loss-val']">{{ formatRupiah(reportData.laba_kotor) }}</div>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-item">
            <div class="si-label">Total Biaya Operasional</div>
            <div class="si-value biaya-val">({{ formatRupiah(reportData.biaya.total) }})</div>
          </div>
        </div>

        <!-- REPORT BODY -->
        <div class="report-body">

          <!-- PENDAPATAN -->
          <div class="section-block">
            <div class="section-head income-head">
              <div class="sh-indicator income-ind"></div>
              <span class="sh-label">PENDAPATAN</span>
            </div>
            <div class="account-table">
              <div class="at-head">
                <span>Nama Akun</span><span>Jumlah</span>
              </div>
              <div v-for="(acc, i) in reportData.pendapatan.accounts" :key="acc.account_id" :class="['at-row', i%2===0?'at-even':'']">
                <span class="at-name">{{ acc.account_name }}</span>
                <span class="at-amount income-amt">{{ formatRupiah(acc.amount) }}</span>
              </div>
              <div v-if="reportData.pendapatan.accounts.length===0" class="at-empty">Belum ada transaksi pendapatan</div>
            </div>
            <div class="section-total income-total">
              <span>TOTAL PENDAPATAN</span>
              <span>{{ formatRupiah(reportData.pendapatan.total) }}</span>
            </div>
          </div>

          <!-- HPP -->
          <div class="section-block">
            <div class="section-head hpp-head">
              <div class="sh-indicator hpp-ind"></div>
              <span class="sh-label">HARGA POKOK PENJUALAN (HPP)</span>
            </div>
            <div class="account-table">
              <div class="at-head">
                <span>Nama Akun</span><span>Jumlah</span>
              </div>
              <div v-for="(acc, i) in reportData.hpp.accounts" :key="acc.account_id" :class="['at-row', i%2===0?'at-even':'']">
                <span class="at-name">{{ acc.account_name }}</span>
                <span class="at-amount hpp-amt">({{ formatRupiah(acc.amount) }})</span>
              </div>
              <div v-if="reportData.hpp.accounts.length===0" class="at-empty">Belum ada transaksi HPP</div>
            </div>
            <div class="section-total hpp-total">
              <span>TOTAL HPP</span>
              <span>({{ formatRupiah(reportData.hpp.total) }})</span>
            </div>
          </div>

          <!-- LABA KOTOR -->
          <div :class="['milestone-row', reportData.laba_kotor >= 0 ? 'milestone-green' : 'milestone-red']">
            <div class="milestone-left">
              <div class="milestone-dot"></div>
              <span class="milestone-label">LABA KOTOR</span>
            </div>
            <span class="milestone-value">{{ formatRupiah(reportData.laba_kotor) }}</span>
          </div>

          <!-- BIAYA OPERASIONAL -->
          <div class="section-block">
            <div class="section-head biaya-head">
              <div class="sh-indicator biaya-ind"></div>
              <span class="sh-label">BIAYA OPERASIONAL</span>
            </div>
            <div class="account-table">
              <div class="at-head">
                <span>Nama Akun</span><span>Jumlah</span>
              </div>
              <div v-for="(acc, i) in reportData.biaya.accounts" :key="acc.account_id" :class="['at-row', i%2===0?'at-even':'']">
                <span class="at-name">{{ acc.account_name }}</span>
                <span class="at-amount biaya-amt">({{ formatRupiah(acc.amount) }})</span>
              </div>
              <div v-if="reportData.biaya.accounts.length===0" class="at-empty">Belum ada transaksi biaya operasional</div>
            </div>
            <div class="section-total biaya-total">
              <span>TOTAL BIAYA OPERASIONAL</span>
              <span>({{ formatRupiah(reportData.biaya.total) }})</span>
            </div>
          </div>

          <!-- LABA BERSIH -->
          <div :class="['net-result-bar', reportData.laba_bersih >= 0 ? 'nr-profit' : 'nr-loss']">
            <div class="nr-left">
              <div class="nr-icon">{{ reportData.laba_bersih >= 0 ? '🏆' : '📉' }}</div>
              <div>
                <div class="nr-title">{{ reportData.laba_bersih >= 0 ? 'LABA BERSIH' : 'RUGI BERSIH' }}</div>
                <div class="nr-sub">Periode {{ formatDateRange(filters.start_date, filters.end_date) }}</div>
              </div>
            </div>
            <div class="nr-amount">{{ formatRupiah(reportData.laba_bersih) }}</div>
          </div>

        </div>

        <!-- FOOTER -->
        <div class="report-footer">
          Dicetak pada {{ new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) }} · Sistem ERP SBC
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
      filters: { start_date: '', end_date: '' },
      reportData: null,
      loading: false,
    }
  },
  computed: {
    hasData() { return this.reportData !== null },
    canFilter() { return this.filters.start_date && this.filters.end_date },
  },
  mounted() { this.setDefaultDates() },
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
        if (response.data.success) this.reportData = response.data.data
      } catch (error) { console.error('Error:', error) }
      finally { this.loading = false }
    },
    resetFilters() { this.setDefaultDates(); this.reportData = null },
    exportPDF() {},
    exportExcel() {},
    formatDateRange(start, end) { return `${this.formatDate(start)} s/d ${this.formatDate(end)}` },
    formatDate(date) {
      return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    },
    formatRupiah(num) {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Math.abs(num || 0))
    },
  },
}
</script>

<style scoped>
.labarugi-wrap { display: flex; flex-direction: column; gap: 18px; }

/* ===== PAGE HEADER ===== */
.page-header {
  background: #fff; border: 1.5px solid #f3f4f6; border-left: 5px solid #0ea5e9;
  border-radius: 14px; padding: 22px 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;
}
.header-left { display: flex; align-items: center; gap: 16px; }
.icon-badge { width: 50px; height: 50px; background: #e0f2fe; border: 1.5px solid #bae6fd; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
.hero-eyebrow { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #0ea5e9; font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
.hero-eyebrow::before { content: ''; display: inline-block; width: 14px; height: 2px; background: #0ea5e9; border-radius: 2px; }
.page-title { font-size: 24px; font-weight: 800; color: #111827; letter-spacing: -0.5px; margin: 0 0 3px; line-height: 1.1; }
.page-title .accent { color: #0ea5e9; }
.page-subtitle { font-size: 13px; color: #6b7280; margin: 0; }
.header-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.btn-export { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; border: 1.5px solid; transition: all 0.2s; font-family: inherit; }
.btn-export:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-export.pdf { background: #fff5f5; color: #dc2626; border-color: #fecaca; }
.btn-export.pdf:hover:not(:disabled) { background: #fee2e2; }
.btn-export.excel { background: #f0fdf4; color: #059669; border-color: #a7f3d0; }
.btn-export.excel:hover:not(:disabled) { background: #d1fae5; }

/* ===== FILTER CARD ===== */
.filter-card { background: #fff; border: 1.5px solid #f3f4f6; border-radius: 14px; padding: 18px 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.filter-inner { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
.filter-field { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.filter-label { font-size: 11.5px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; }
.date-range { display: flex; align-items: center; gap: 10px; }
.date-sep { font-size: 12px; font-weight: 700; color: #9ca3af; white-space: nowrap; }
.form-control { padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-family: inherit; background: #fafafa; color: #111827; transition: all 0.2s; outline: none; box-sizing: border-box; }
.form-control:focus { border-color: #0ea5e9; background: #fff; box-shadow: 0 0 0 3px rgba(14,165,233,0.1); }
.filter-btns { display: flex; gap: 10px; flex-shrink: 0; }
.btn-reset { padding: 10px 16px; border-radius: 8px; font-size: 13.5px; font-weight: 600; cursor: pointer; background: #fff; color: #374151; border: 1.5px solid #e5e7eb; transition: all 0.2s; font-family: inherit; }
.btn-reset:hover { background: #f9fafb; }
.btn-generate { padding: 10px 20px; border-radius: 8px; font-size: 13.5px; font-weight: 700; cursor: pointer; background: #0ea5e9; color: #fff; border: none; transition: all 0.2s; font-family: inherit; box-shadow: 0 3px 10px rgba(14,165,233,0.25); }
.btn-generate:hover:not(:disabled) { background: #0284c7; transform: translateY(-1px); }
.btn-generate:disabled { opacity: 0.4; cursor: not-allowed; }

/* ===== STATES ===== */
.state-card { background: #fff; border: 1.5px solid #f3f4f6; border-radius: 14px; padding: 80px 20px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.06); display: flex; flex-direction: column; align-items: center; gap: 12px; }
.state-icon { font-size: 52px; opacity: 0.15; }
.state-title { font-size: 18px; font-weight: 800; color: #374151; }
.state-desc { font-size: 13.5px; color: #9ca3af; }
.spinner-ring { width: 44px; height: 44px; border: 4px solid #f3f4f6; border-top-color: #0ea5e9; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== REPORT CARD ===== */
.report-card { background: #fff; border: 1.5px solid #f3f4f6; border-radius: 14px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; }

/* ===== REPORT BAND ===== */
.report-band {
  background: linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0ea5e9 100%);
  padding: 28px 32px;
  display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap;
}
.band-company { font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(255,255,255,0.6); font-weight: 700; margin-bottom: 8px; }
.band-title { font-size: 28px; font-weight: 900; color: #fff; letter-spacing: 1.5px; margin-bottom: 6px; }
.band-period { font-size: 13px; color: rgba(255,255,255,0.75); }
.band-period strong { color: #fff; }

.net-preview { padding: 14px 20px; border-radius: 12px; text-align: right; }
.net-profit { background: rgba(16,185,129,0.2); border: 1px solid rgba(16,185,129,0.35); }
.net-loss { background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.35); }
.np-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.7); font-weight: 700; margin-bottom: 5px; }
.np-value { font-family: 'Courier New', monospace; font-size: 20px; font-weight: 900; color: #fff; }

/* ===== SUMMARY STRIP ===== */
.summary-strip { display: flex; align-items: stretch; border-bottom: 1.5px solid #f3f4f6; background: #fafafa; }
.summary-item { flex: 1; padding: 16px 22px; display: flex; flex-direction: column; gap: 5px; }
.summary-divider { width: 1px; background: #f3f4f6; }
.si-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; font-weight: 700; }
.si-value { font-family: 'Courier New', monospace; font-size: 14px; font-weight: 800; }
.income-val { color: #059669; }
.hpp-val { color: #dc2626; }
.biaya-val { color: #d97706; }
.profit-val { color: #059669; }
.loss-val { color: #dc2626; }

/* ===== REPORT BODY ===== */
.report-body { padding: 28px 32px; display: flex; flex-direction: column; gap: 24px; }

/* ===== SECTION BLOCK ===== */
.section-block { display: flex; flex-direction: column; gap: 12px; }
.section-head { display: flex; align-items: center; gap: 10px; }
.sh-indicator { width: 3px; height: 18px; border-radius: 2px; flex-shrink: 0; }
.sh-label { font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #374151; }
.income-ind { background: #059669; }
.hpp-ind { background: #dc2626; }
.biaya-ind { background: #d97706; }

/* ACCOUNT TABLE */
.account-table { border: 1.5px solid #f3f4f6; border-radius: 10px; overflow: hidden; }
.at-head { display: flex; justify-content: space-between; padding: 9px 16px; background: #f8f9fa; border-bottom: 1.5px solid #f3f4f6; }
.at-head span { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #9ca3af; }
.at-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #f9fafb; transition: background 0.15s; }
.at-row:last-child { border-bottom: none; }
.at-even { background: #fcfcfd; }
.at-row:hover { background: #f0f9ff; }
.at-name { font-size: 13.5px; font-weight: 500; color: #374151; flex: 1; }
.at-amount { font-family: 'Courier New', monospace; font-size: 13.5px; font-weight: 700; min-width: 140px; text-align: right; }
.income-amt { color: #059669; }
.hpp-amt { color: #dc2626; }
.biaya-amt { color: #d97706; }
.at-empty { padding: 20px 16px; text-align: center; font-size: 13px; color: #9ca3af; font-style: italic; }

/* SECTION TOTAL */
.section-total { display: flex; justify-content: space-between; align-items: center; padding: 11px 16px; border-radius: 8px; font-size: 13px; font-weight: 800; }
.income-total { background: #f0fdf4; color: #059669; border: 1.5px solid #a7f3d0; }
.income-total span:last-child { font-family: 'Courier New', monospace; font-size: 14px; }
.hpp-total { background: #fff5f5; color: #dc2626; border: 1.5px solid #fecaca; }
.hpp-total span:last-child { font-family: 'Courier New', monospace; font-size: 14px; }
.biaya-total { background: #fffbeb; color: #d97706; border: 1.5px solid #fde68a; }
.biaya-total span:last-child { font-family: 'Courier New', monospace; font-size: 14px; }

/* MILESTONE ROW (Laba Kotor) */
.milestone-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-radius: 10px; border: 1.5px solid;
}
.milestone-green { background: #f0fdf4; border-color: #a7f3d0; }
.milestone-red { background: #fff5f5; border-color: #fecaca; }
.milestone-left { display: flex; align-items: center; gap: 10px; }
.milestone-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.milestone-green .milestone-dot { background: #10b981; box-shadow: 0 0 6px rgba(16,185,129,0.5); }
.milestone-red .milestone-dot { background: #ef4444; box-shadow: 0 0 6px rgba(239,68,68,0.5); }
.milestone-label { font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
.milestone-green .milestone-label { color: #065f46; }
.milestone-red .milestone-label { color: #991b1b; }
.milestone-value { font-family: 'Courier New', monospace; font-size: 15px; font-weight: 800; }
.milestone-green .milestone-value { color: #059669; }
.milestone-red .milestone-value { color: #dc2626; }

/* NET RESULT BAR */
.net-result-bar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 22px 24px; border-radius: 12px; border: 2px solid;
}
.nr-profit { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-color: #86efac; }
.nr-loss { background: linear-gradient(135deg, #fff5f5, #fee2e2); border-color: #fca5a5; }
.nr-left { display: flex; align-items: center; gap: 14px; }
.nr-icon { font-size: 28px; }
.nr-title { font-size: 14px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 3px; }
.nr-profit .nr-title { color: #065f46; }
.nr-loss .nr-title { color: #991b1b; }
.nr-sub { font-size: 11.5px; }
.nr-profit .nr-sub { color: #6ee7b7; }
.nr-loss .nr-sub { color: #fca5a5; }
.nr-amount { font-family: 'Courier New', monospace; font-size: 22px; font-weight: 900; }
.nr-profit .nr-amount { color: #059669; }
.nr-loss .nr-amount { color: #dc2626; }

/* ===== REPORT FOOTER ===== */
.report-footer { padding: 14px 32px; border-top: 1.5px solid #f3f4f6; background: #fafafa; font-size: 11.5px; color: #9ca3af; text-align: center; }

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .page-header { padding: 18px 20px; }
  .report-band { padding: 20px; flex-direction: column; align-items: flex-start; }
  .report-body { padding: 20px; gap: 18px; }
  .summary-strip { flex-wrap: wrap; }
  .summary-item { min-width: 50%; border-bottom: 1px solid #f3f4f6; }
  .filter-inner { flex-direction: column; align-items: stretch; }
  .date-range { flex-direction: column; gap: 8px; }
  .nr-result-bar { flex-direction: column; align-items: flex-start; gap: 12px; }
}
</style>