<template>
  <DashboardLayout>
    <div class="neraca-wrap">

      <!-- PAGE HEADER -->
      <div class="page-header">
        <div class="header-left">
          <div class="icon-badge">⚖️</div>
          <div>
            <div class="hero-eyebrow">Laporan Keuangan</div>
            <h1 class="page-title">Neraca <span class="accent">Balance Sheet</span></h1>
            <p class="page-subtitle">PT. Surya Bangkit Cemerlang</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-export pdf" @click="exportPDF" :disabled="!hasData">
            <span class="btn-icon-sm">📄</span> Export PDF
          </button>
          <button class="btn-export excel" @click="exportExcel" :disabled="!hasData">
            <span class="btn-icon-sm">📊</span> Export Excel
          </button>
        </div>
      </div>

      <!-- FILTER CARD -->
      <div class="filter-card">
        <div class="filter-inner">
          <div class="filter-field">
            <label class="filter-label">Per Tanggal <span class="req">*</span></label>
            <input v-model="filters.as_of_date" type="date" class="form-control" required />
          </div>
          <div class="filter-btns">
            <button class="btn-reset" @click="resetFilters">↺ Reset</button>
            <button class="btn-generate" @click="fetchData" :disabled="!canFilter || loading">
              <span v-if="loading" class="loading-dots">Memproses<span class="dot-anim">...</span></span>
              <span v-else>🔍 Tampilkan Neraca</span>
            </button>
          </div>
        </div>
      </div>

      <!-- EMPTY STATE -->
      <div v-if="!hasData && !loading" class="state-card empty-state">
        <div class="state-icon">⚖️</div>
        <div class="state-title">Pilih Tanggal Neraca</div>
        <div class="state-desc">Tentukan tanggal untuk menampilkan posisi keuangan perusahaan</div>
      </div>

      <!-- LOADING -->
      <div v-else-if="loading" class="state-card loading-state">
        <div class="spinner-ring"></div>
        <p class="state-desc">Memuat data neraca...</p>
      </div>

      <!-- REPORT -->
      <div v-else class="report-card">

        <!-- REPORT HEADER BAND -->
        <div class="report-band">
          <div class="band-identity">
            <div class="band-company">PT. Surya Bangkit Cemerlang</div>
            <div class="band-title">NERACA</div>
            <div class="band-period">Per Tanggal: <strong>{{ formatDate(reportData.as_of_date) }}</strong></div>
          </div>
          <div :class="['balance-badge', reportData.is_balanced ? 'badge-ok' : 'badge-err']">
            <span class="badge-dot"></span>
            <span>{{ reportData.is_balanced ? 'Neraca Balance' : 'Tidak Balance' }}</span>
            <span v-if="!reportData.is_balanced" class="badge-selisih">Selisih: {{ formatRupiah(reportData.selisih) }}</span>
          </div>
        </div>

        <!-- SUMMARY STRIP -->
        <div class="summary-strip">
          <div class="summary-item">
            <div class="si-label">Total Aset</div>
            <div class="si-value aset-val">{{ formatRupiah(reportData.aset.total) }}</div>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-item">
            <div class="si-label">Total Kewajiban</div>
            <div class="si-value liab-val">{{ formatRupiah(reportData.kewajiban.total) }}</div>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-item">
            <div class="si-label">Total Modal</div>
            <div class="si-value modal-val">{{ formatRupiah(reportData.modal.total + reportData.laba_tahun_berjalan) }}</div>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-item">
            <div class="si-label">Laba Tahun Berjalan</div>
            <div :class="['si-value', reportData.laba_tahun_berjalan >= 0 ? 'profit-val' : 'loss-val']">
              {{ reportData.laba_tahun_berjalan >= 0 ? '+' : '' }}{{ formatRupiah(reportData.laba_tahun_berjalan) }}
            </div>
          </div>
        </div>

        <!-- TWO-COLUMN TABLE -->
        <div class="bs-grid">

          <!-- ASET -->
          <div class="bs-col">
            <div class="col-title-bar aset-bar">
              <span class="ctb-label">ASET</span>
              <span class="ctb-total">{{ formatRupiah(reportData.aset.total) }}</span>
            </div>

            <div class="account-table">
              <div class="at-head">
                <span>Nama Akun</span>
                <span>Jumlah</span>
              </div>
              <div
                v-for="(account, i) in reportData.aset.accounts"
                :key="account.account_id"
                :class="['at-row', i % 2 === 0 ? 'at-row-even' : '']"
              >
                <span class="at-name">{{ account.account_name }}</span>
                <span class="at-amount">{{ formatRupiah(account.amount) }}</span>
              </div>
              <div v-if="reportData.aset.accounts.length === 0" class="at-empty">
                <span>Belum ada data aset</span>
              </div>
            </div>

            <div class="col-total-bar aset-total-bar">
              <span class="ctb-total-label">TOTAL ASET</span>
              <span class="ctb-total-value">{{ formatRupiah(reportData.aset.total) }}</span>
            </div>
          </div>

          <!-- COLUMN DIVIDER -->
          <div class="grid-divider"></div>

          <!-- PASIVA -->
          <div class="bs-col">
            <div class="col-title-bar pasiva-bar">
              <span class="ctb-label">KEWAJIBAN &amp; MODAL</span>
              <span class="ctb-total">{{ formatRupiah(reportData.total_pasiva) }}</span>
            </div>

            <!-- Kewajiban -->
            <div class="sub-section">
              <div class="sub-head">
                <div class="sub-indicator liab-indicator"></div>
                <span class="sub-label">KEWAJIBAN</span>
              </div>
              <div class="account-table">
                <div class="at-head">
                  <span>Nama Akun</span>
                  <span>Jumlah</span>
                </div>
                <div
                  v-for="(account, i) in reportData.kewajiban.accounts"
                  :key="account.account_id"
                  :class="['at-row', i % 2 === 0 ? 'at-row-even' : '']"
                >
                  <span class="at-name">{{ account.account_name }}</span>
                  <span class="at-amount">{{ formatRupiah(account.amount) }}</span>
                </div>
                <div v-if="reportData.kewajiban.accounts.length === 0" class="at-empty">
                  <span>Belum ada data kewajiban</span>
                </div>
              </div>
              <div class="subtotal-row">
                <span>Total Kewajiban</span>
                <span>{{ formatRupiah(reportData.kewajiban.total) }}</span>
              </div>
            </div>

            <!-- Modal -->
            <div class="sub-section">
              <div class="sub-head">
                <div class="sub-indicator modal-indicator"></div>
                <span class="sub-label">MODAL</span>
              </div>
              <div class="account-table">
                <div class="at-head">
                  <span>Nama Akun</span>
                  <span>Jumlah</span>
                </div>
                <div
                  v-for="(account, i) in reportData.modal.accounts"
                  :key="account.account_id"
                  :class="['at-row', i % 2 === 0 ? 'at-row-even' : '']"
                >
                  <span class="at-name">{{ account.account_name }}</span>
                  <span class="at-amount">{{ formatRupiah(account.amount) }}</span>
                </div>
                <!-- Laba Row -->
                <div class="at-row laba-row">
                  <span class="at-name laba-name">Laba Tahun Berjalan</span>
                  <span :class="['at-amount', reportData.laba_tahun_berjalan >= 0 ? 'profit-text' : 'loss-text']">
                    {{ formatRupiah(reportData.laba_tahun_berjalan) }}
                  </span>
                </div>
              </div>
              <div class="subtotal-row">
                <span>Total Modal</span>
                <span>{{ formatRupiah(reportData.modal.total + reportData.laba_tahun_berjalan) }}</span>
              </div>
            </div>

            <div class="col-total-bar pasiva-total-bar">
              <span class="ctb-total-label">TOTAL KEWAJIBAN &amp; MODAL</span>
              <span class="ctb-total-value">{{ formatRupiah(reportData.total_pasiva) }}</span>
            </div>
          </div>

        </div>
        <!-- FOOTER NOTE -->
        <div class="report-footer">
          <span>Dicetak pada {{ new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) }} · Sistem ERP SBC</span>
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
      filters: { as_of_date: '' },
      reportData: null,
      loading: false,
    }
  },
  computed: {
    hasData() { return this.reportData !== null },
    canFilter() { return this.filters.as_of_date !== '' },
  },
  mounted() { this.setDefaultDate() },
  methods: {
    setDefaultDate() {
      const today = new Date()
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      this.filters.as_of_date = lastDay.toISOString().split('T')[0]
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
        if (response.data.success) this.reportData = response.data.data
      } catch (error) {
        console.error('Error:', error)
      } finally {
        this.loading = false
      }
    },
    resetFilters() { this.setDefaultDate(); this.reportData = null },
    exportPDF() {},
    exportExcel() {},
    formatDate(date) {
      return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    },
    formatRupiah(num) {
      const absNum = Math.abs(num || 0)
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(absNum)
    },
  },
}
</script>

<style scoped>
/* ===== WRAPPER ===== */
.neraca-wrap { display: flex; flex-direction: column; gap: 18px; }

/* ===== PAGE HEADER ===== */
.page-header {
  background: #fff; border: 1.5px solid #f3f4f6; border-left: 5px solid #7c3aed;
  border-radius: 14px; padding: 22px 28px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;
}
.header-left { display: flex; align-items: center; gap: 16px; }
.icon-badge { width: 50px; height: 50px; background: #ede9fe; border: 1.5px solid #ddd6fe; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
.hero-eyebrow { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #7c3aed; font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
.hero-eyebrow::before { content: ''; display: inline-block; width: 14px; height: 2px; background: #7c3aed; border-radius: 2px; }
.page-title { font-size: 24px; font-weight: 800; color: #111827; letter-spacing: -0.5px; margin: 0 0 3px; line-height: 1.1; }
.page-title .accent { color: #7c3aed; }
.page-subtitle { font-size: 13px; color: #6b7280; margin: 0; }
.header-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.btn-export { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; border: 1.5px solid; transition: all 0.2s; font-family: inherit; }
.btn-export:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-export.pdf { background: #fff5f5; color: #dc2626; border-color: #fecaca; }
.btn-export.pdf:hover:not(:disabled) { background: #fee2e2; }
.btn-export.excel { background: #f0fdf4; color: #059669; border-color: #a7f3d0; }
.btn-export.excel:hover:not(:disabled) { background: #d1fae5; }
.btn-icon-sm { font-size: 14px; }

/* ===== FILTER CARD ===== */
.filter-card {
  background: #fff; border: 1.5px solid #f3f4f6; border-radius: 14px;
  padding: 18px 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.filter-inner { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
.filter-field { display: flex; flex-direction: column; gap: 6px; min-width: 200px; flex: 1; max-width: 280px; }
.filter-label { font-size: 11.5px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; }
.req { color: #dc2626; }
.form-control { padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-family: inherit; background: #fafafa; color: #111827; transition: all 0.2s; outline: none; box-sizing: border-box; }
.form-control:focus { border-color: #7c3aed; background: #fff; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
.filter-btns { display: flex; gap: 10px; flex-shrink: 0; }
.btn-reset { padding: 10px 16px; border-radius: 8px; font-size: 13.5px; font-weight: 600; cursor: pointer; background: #fff; color: #374151; border: 1.5px solid #e5e7eb; transition: all 0.2s; font-family: inherit; }
.btn-reset:hover { background: #f9fafb; }
.btn-generate { padding: 10px 20px; border-radius: 8px; font-size: 13.5px; font-weight: 700; cursor: pointer; background: #7c3aed; color: #fff; border: none; transition: all 0.2s; font-family: inherit; box-shadow: 0 3px 10px rgba(124,58,237,0.25); }
.btn-generate:hover:not(:disabled) { background: #6d28d9; transform: translateY(-1px); }
.btn-generate:disabled { opacity: 0.4; cursor: not-allowed; }

/* ===== STATE CARDS ===== */
.state-card { background: #fff; border: 1.5px solid #f3f4f6; border-radius: 14px; padding: 80px 20px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.06); display: flex; flex-direction: column; align-items: center; gap: 12px; }
.state-icon { font-size: 52px; opacity: 0.15; }
.state-title { font-size: 18px; font-weight: 800; color: #374151; }
.state-desc { font-size: 13.5px; color: #9ca3af; }
.spinner-ring { width: 44px; height: 44px; border: 4px solid #f3f4f6; border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== REPORT CARD ===== */
.report-card { background: #fff; border: 1.5px solid #f3f4f6; border-radius: 14px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; }

/* ===== REPORT BAND ===== */
.report-band {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
  padding: 28px 32px;
  display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap;
}
.band-company { font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(255,255,255,0.6); font-weight: 700; margin-bottom: 8px; }
.band-title { font-size: 30px; font-weight: 900; color: #fff; letter-spacing: 2px; margin-bottom: 6px; }
.band-period { font-size: 13px; color: rgba(255,255,255,0.75); }
.band-period strong { color: #fff; }
.balance-badge { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 700; }
.badge-ok { background: rgba(16,185,129,0.2); color: #6ee7b7; border: 1px solid rgba(16,185,129,0.3); }
.badge-err { background: rgba(239,68,68,0.2); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }
.badge-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.badge-ok .badge-dot { background: #10b981; box-shadow: 0 0 8px rgba(16,185,129,0.8); }
.badge-err .badge-dot { background: #ef4444; box-shadow: 0 0 8px rgba(239,68,68,0.8); }
.badge-selisih { font-size: 11px; font-weight: 500; opacity: 0.8; }

/* ===== SUMMARY STRIP ===== */
.summary-strip {
  display: flex; align-items: stretch;
  border-bottom: 1.5px solid #f3f4f6;
  background: #fafafa;
}
.summary-item { flex: 1; padding: 18px 24px; display: flex; flex-direction: column; gap: 5px; }
.summary-divider { width: 1px; background: #f3f4f6; }
.si-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; font-weight: 700; }
.si-value { font-family: 'Courier New', monospace; font-size: 15px; font-weight: 800; }
.aset-val { color: #1e293b; }
.liab-val { color: #dc2626; }
.modal-val { color: #7c3aed; }
.profit-val { color: #059669; }
.loss-val { color: #dc2626; }

/* ===== BS GRID ===== */
.bs-grid { display: grid; grid-template-columns: 1fr 1px 1fr; padding: 28px 32px; gap: 0; }
.grid-divider { background: #f3f4f6; margin: 0 28px; }
.bs-col { display: flex; flex-direction: column; gap: 20px; }

/* column title bar */
.col-title-bar { display: flex; justify-content: space-between; align-items: center; padding: 11px 16px; border-radius: 8px; }
.aset-bar { background: #1e293b; }
.pasiva-bar { background: #4c1d95; }
.ctb-label { font-size: 11.5px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.9); }
.ctb-total { font-family: 'Courier New', monospace; font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.75); }

/* account table */
.account-table { border: 1.5px solid #f3f4f6; border-radius: 10px; overflow: hidden; }
.at-head { display: flex; justify-content: space-between; padding: 9px 16px; background: #f8f9fa; border-bottom: 1.5px solid #f3f4f6; }
.at-head span { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #9ca3af; }
.at-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #f9fafb; transition: background 0.15s; }
.at-row:last-child { border-bottom: none; }
.at-row:hover { background: #f5f3ff; }
.at-row-even { background: #fcfcfd; }
.at-row-even:hover { background: #f5f3ff; }
.at-name { font-size: 13.5px; font-weight: 500; color: #374151; flex: 1; }
.at-amount { font-family: 'Courier New', monospace; font-size: 13.5px; font-weight: 700; color: #111827; min-width: 130px; text-align: right; }
.at-empty { padding: 24px; text-align: center; font-size: 13px; color: #9ca3af; font-style: italic; }
.laba-row { background: #fffbeb !important; }
.laba-name { font-weight: 700; color: #78350f; }
.profit-text { color: #059669 !important; }
.loss-text { color: #dc2626 !important; }

/* subtotal row */
.subtotal-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 16px; background: #f8f9fa; border: 1.5px solid #f3f4f6; border-radius: 8px; font-size: 13px; font-weight: 700; color: #374151; }
.subtotal-row span:last-child { font-family: 'Courier New', monospace; font-size: 13.5px; color: #111827; }

/* sub section */
.sub-section { display: flex; flex-direction: column; gap: 10px; }
.sub-head { display: flex; align-items: center; gap: 8px; }
.sub-indicator { width: 3px; height: 16px; border-radius: 2px; flex-shrink: 0; }
.liab-indicator { background: #dc2626; }
.modal-indicator { background: #7c3aed; }
.sub-label { font-size: 10.5px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #9ca3af; }

/* col total bar */
.col-total-bar { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-radius: 10px; }
.aset-total-bar { background: linear-gradient(135deg, #1e293b, #334155); }
.pasiva-total-bar { background: linear-gradient(135deg, #4c1d95, #6d28d9); }
.ctb-total-label { font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.8); }
.ctb-total-value { font-family: 'Courier New', monospace; font-size: 16px; font-weight: 800; color: #fff; }

/* ===== REPORT FOOTER ===== */
.report-footer { padding: 14px 32px; border-top: 1.5px solid #f3f4f6; background: #fafafa; font-size: 11.5px; color: #9ca3af; text-align: center; }

/* ===== RESPONSIVE ===== */
@media (max-width: 1100px) {
  .bs-grid { grid-template-columns: 1fr; gap: 28px; }
  .grid-divider { display: none; }
}
@media (max-width: 768px) {
  .page-header { padding: 18px 20px; }
  .report-band { padding: 22px 20px; }
  .bs-grid { padding: 20px; }
  .summary-strip { flex-wrap: wrap; }
  .summary-item { min-width: 50%; border-bottom: 1px solid #f3f4f6; }
  .filter-inner { flex-direction: column; align-items: stretch; }
  .filter-field { max-width: 100%; }
}
</style>