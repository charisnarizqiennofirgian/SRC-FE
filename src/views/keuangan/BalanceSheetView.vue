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
          <div class="export-group">
            <div class="export-group-label">Ekspor Laporan</div>
            <div class="export-btns">
              <button class="btn-exp btn-pdf" @click="exportPDF" :disabled="!hasData">
                <span class="exp-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="9" y1="13" x2="15" y2="13"/>
                    <line x1="9" y1="17" x2="15" y2="17"/>
                  </svg>
                </span>
                <span class="exp-label">
                  <span class="exp-main">PDF</span>
                  <span class="exp-sub">Cetak laporan</span>
                </span>
              </button>

              <div class="exp-divider"></div>

              <button class="btn-exp btn-excel" @click="exportExcel" :disabled="!hasData">
                <span class="exp-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M3 9h18M9 21V9"/>
                    <line x1="6" y1="14" x2="8.5" y2="18"/>
                    <line x1="8.5" y1="14" x2="6" y2="18"/>
                    <line x1="13" y1="14" x2="16" y2="14"/>
                    <line x1="13" y1="18" x2="16" y2="18"/>
                    <line x1="14.5" y1="14" x2="14.5" y2="18"/>
                  </svg>
                </span>
                <span class="exp-label">
                  <span class="exp-main">Excel</span>
                  <span class="exp-sub">Download .xlsx</span>
                </span>
              </button>
            </div>
            <div v-if="!hasData" class="export-hint">Tampilkan data terlebih dahulu</div>
          </div>
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

          <!-- AKTIVA -->
          <div class="bs-col">
            <div class="col-title-bar aset-bar">
              <span class="ctb-label">AKTIVA</span>
              <span class="ctb-total">{{ formatRupiah(reportData.aset.total) }}</span>
            </div>

            <!-- Aktiva Lancar -->
            <div class="sub-section" v-if="reportData.aset.aktiva_lancar.accounts.length > 0">
              <div class="sub-head">
                <div class="sub-indicator lancar-indicator"></div>
                <span class="sub-label">AKTIVA LANCAR</span>
              </div>
              <div class="account-table">
                <div class="at-head"><span>Nama Akun</span><span>Jumlah</span></div>
                <div v-for="(acc, i) in reportData.aset.aktiva_lancar.accounts" :key="acc.account_id"
                  :class="['at-row', i % 2 === 0 ? 'at-row-even' : '']">
                  <span class="at-name">{{ acc.account_name }}</span>
                  <span class="at-amount">{{ formatRupiah(acc.amount) }}</span>
                </div>
              </div>
              <div class="subtotal-row">
                <span>Total Aktiva Lancar</span>
                <span>{{ formatRupiah(reportData.aset.aktiva_lancar.total) }}</span>
              </div>
            </div>

            <!-- Aktiva Tetap -->
            <div class="sub-section" v-if="reportData.aset.aktiva_tetap.accounts.length > 0">
              <div class="sub-head">
                <div class="sub-indicator tetap-indicator"></div>
                <span class="sub-label">AKTIVA TETAP</span>
              </div>
              <div class="account-table">
                <div class="at-head"><span>Nama Akun</span><span>Jumlah</span></div>
                <div v-for="(acc, i) in reportData.aset.aktiva_tetap.accounts" :key="acc.account_id"
                  :class="['at-row', i % 2 === 0 ? 'at-row-even' : '']">
                  <span class="at-name">{{ acc.account_name }}</span>
                  <span class="at-amount">{{ formatRupiah(acc.amount) }}</span>
                </div>
              </div>
              <div class="subtotal-row">
                <span>Total Aktiva Tetap</span>
                <span>{{ formatRupiah(reportData.aset.aktiva_tetap.total) }}</span>
              </div>
            </div>

            <!-- Aktiva Lainnya (belum dikategorikan) -->
            <div class="sub-section" v-if="reportData.aset.lainnya.accounts.length > 0">
              <div class="sub-head">
                <div class="sub-indicator lainnya-indicator"></div>
                <span class="sub-label">AKTIVA LAINNYA</span>
              </div>
              <div class="account-table">
                <div class="at-head"><span>Nama Akun</span><span>Jumlah</span></div>
                <div v-for="(acc, i) in reportData.aset.lainnya.accounts" :key="acc.account_id"
                  :class="['at-row', i % 2 === 0 ? 'at-row-even' : '']">
                  <span class="at-name">{{ acc.account_name }}</span>
                  <span class="at-amount">{{ formatRupiah(acc.amount) }}</span>
                </div>
              </div>
              <div class="subtotal-row">
                <span>Total Aktiva Lainnya</span>
                <span>{{ formatRupiah(reportData.aset.lainnya.total) }}</span>
              </div>
            </div>

            <div v-if="reportData.aset.accounts.length === 0" class="at-empty">Belum ada data aktiva</div>

            <div class="col-total-bar aset-total-bar">
              <span class="ctb-total-label">TOTAL AKTIVA</span>
              <span class="ctb-total-value">{{ formatRupiah(reportData.aset.total) }}</span>
            </div>
          </div>

          <!-- COLUMN DIVIDER -->
          <div class="grid-divider"></div>

          <!-- PASIVA -->
          <div class="bs-col">
            <div class="col-title-bar pasiva-bar">
              <span class="ctb-label">PASIVA</span>
              <span class="ctb-total">{{ formatRupiah(reportData.total_pasiva) }}</span>
            </div>

            <!-- Hutang Lancar -->
            <div class="sub-section" v-if="reportData.kewajiban.hutang_lancar.accounts.length > 0">
              <div class="sub-head">
                <div class="sub-indicator liab-indicator"></div>
                <span class="sub-label">HUTANG LANCAR</span>
              </div>
              <div class="account-table">
                <div class="at-head"><span>Nama Akun</span><span>Jumlah</span></div>
                <div v-for="(acc, i) in reportData.kewajiban.hutang_lancar.accounts" :key="acc.account_id"
                  :class="['at-row', i % 2 === 0 ? 'at-row-even' : '']">
                  <span class="at-name">{{ acc.account_name }}</span>
                  <span class="at-amount">{{ formatRupiah(acc.amount) }}</span>
                </div>
              </div>
              <div class="subtotal-row">
                <span>Total Hutang Lancar</span>
                <span>{{ formatRupiah(reportData.kewajiban.hutang_lancar.total) }}</span>
              </div>
            </div>

            <!-- Hutang Jangka Panjang -->
            <div class="sub-section" v-if="reportData.kewajiban.hutang_jangka_panjang.accounts.length > 0">
              <div class="sub-head">
                <div class="sub-indicator liab-jp-indicator"></div>
                <span class="sub-label">HUTANG JANGKA PANJANG</span>
              </div>
              <div class="account-table">
                <div class="at-head"><span>Nama Akun</span><span>Jumlah</span></div>
                <div v-for="(acc, i) in reportData.kewajiban.hutang_jangka_panjang.accounts" :key="acc.account_id"
                  :class="['at-row', i % 2 === 0 ? 'at-row-even' : '']">
                  <span class="at-name">{{ acc.account_name }}</span>
                  <span class="at-amount">{{ formatRupiah(acc.amount) }}</span>
                </div>
              </div>
              <div class="subtotal-row">
                <span>Total Hutang Jangka Panjang</span>
                <span>{{ formatRupiah(reportData.kewajiban.hutang_jangka_panjang.total) }}</span>
              </div>
            </div>

            <!-- Kewajiban Lainnya -->
            <div class="sub-section" v-if="reportData.kewajiban.lainnya.accounts.length > 0">
              <div class="sub-head">
                <div class="sub-indicator lainnya-indicator"></div>
                <span class="sub-label">KEWAJIBAN LAINNYA</span>
              </div>
              <div class="account-table">
                <div class="at-head"><span>Nama Akun</span><span>Jumlah</span></div>
                <div v-for="(acc, i) in reportData.kewajiban.lainnya.accounts" :key="acc.account_id"
                  :class="['at-row', i % 2 === 0 ? 'at-row-even' : '']">
                  <span class="at-name">{{ acc.account_name }}</span>
                  <span class="at-amount">{{ formatRupiah(acc.amount) }}</span>
                </div>
              </div>
              <div class="subtotal-row">
                <span>Total Kewajiban Lainnya</span>
                <span>{{ formatRupiah(reportData.kewajiban.lainnya.total) }}</span>
              </div>
            </div>

            <div class="subtotal-row kewajiban-total" v-if="reportData.kewajiban.accounts.length > 0">
              <span>TOTAL KEWAJIBAN</span>
              <span>{{ formatRupiah(reportData.kewajiban.total) }}</span>
            </div>

            <!-- Modal -->
            <div class="sub-section">
              <div class="sub-head">
                <div class="sub-indicator modal-indicator"></div>
                <span class="sub-label">MODAL</span>
              </div>
              <div class="account-table">
                <div class="at-head"><span>Nama Akun</span><span>Jumlah</span></div>
                <div v-for="(acc, i) in reportData.modal.accounts" :key="acc.account_id"
                  :class="['at-row', i % 2 === 0 ? 'at-row-even' : '']">
                  <span class="at-name">{{ acc.account_name }}</span>
                  <span class="at-amount">{{ formatRupiah(acc.amount) }}</span>
                </div>
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
              <span class="ctb-total-label">TOTAL PASIVA</span>
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
    exportPDF() {
      const d = this.reportData
      const fmt = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Math.abs(v || 0))
      const fmtDate = (dt) => new Date(dt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })

      const groupRows = (label, accounts, total) => {
        if (!accounts || accounts.length === 0) return ''
        const rows = accounts.map((a, i) =>
          `<tr class="${i % 2 === 0 ? 'even' : ''}"><td style="padding-left:12pt">${a.account_name}</td><td class="right">${fmt(a.amount)}</td></tr>`
        ).join('')
        return `<tr class="group-head"><td colspan="2">${label}</td></tr>${rows}<tr class="subtotal-row"><td>Total ${label}</td><td class="right">${fmt(total)}</td></tr>`
      }

      const modalRows = d.modal.accounts.map((a, i) =>
        `<tr class="${i % 2 === 0 ? 'even' : ''}"><td style="padding-left:12pt">${a.account_name}</td><td class="right">${fmt(a.amount)}</td></tr>`
      ).join('')

      const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>Neraca - ${fmtDate(d.as_of_date)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 10pt; color: #000; padding: 15mm 18mm; }
    h1 { font-size: 14pt; font-weight: 900; text-align: center; margin-bottom: 2mm; letter-spacing: 1px; }
    .company { text-align: center; font-size: 12pt; font-weight: 700; margin-bottom: 1mm; }
    .period  { text-align: center; font-size: 10pt; margin-bottom: 6mm; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
    .section-title { font-size: 10pt; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; background: #1e293b; color: #fff; padding: 4pt 6pt; margin-bottom: 2mm; }
    .sub-title { font-size: 9pt; font-weight: 700; text-transform: uppercase; color: #555; margin: 4mm 0 1mm; }
    table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
    th, td { border: 0.5pt solid #ccc; padding: 3pt 5pt; }
    th { background: #f3f4f6; font-weight: 700; text-align: left; }
    td.right { text-align: right; }
    tr.even td { background: #fafafa; }
    tr.group-head td { background: #dbeafe; font-weight: 700; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.5px; padding: 3pt 5pt; }
    tr.subtotal-row td { background: #eff6ff; font-weight: 700; border-top: 1pt solid #93c5fd; }
    tr.subtotal-row td:last-child { text-align: right; }
    tr.kewajiban-subtotal td { background: #fef2f2; border-top: 1.5pt solid #fca5a5; font-weight: 800; }
    tr.kewajiban-subtotal td:last-child { text-align: right; }
    .total-row td { font-weight: 700; background: #e5e7eb !important; }
    .grand-total td { font-weight: 900; font-size: 10pt; background: #1e293b !important; color: #fff; }
    .balance-status { text-align: center; margin: 4mm 0; font-size: 10pt; font-weight: 700; padding: 3mm; border: 1pt solid; border-radius: 4pt; }
    .ok  { color: #059669; border-color: #059669; background: #f0fdf4; }
    .err { color: #dc2626; border-color: #dc2626; background: #fef2f2; }
    .footer { margin-top: 8mm; font-size: 9pt; color: #666; text-align: center; border-top: 0.5pt solid #ccc; padding-top: 3mm; }
    @media print { body { padding: 0; } @page { size: A4 portrait; margin: 15mm 18mm; } }
  </style>
</head>
<body>
  <div class="company">PT. SURYA BANGKIT CEMERLANG</div>
  <h1>NERACA (BALANCE SHEET)</h1>
  <div class="period">Per Tanggal: ${fmtDate(d.as_of_date)}</div>
  <div class="balance-status ${d.is_balanced ? 'ok' : 'err'}">
    ${d.is_balanced ? '✓ Neraca Balance' : '✗ Tidak Balance — Selisih: ' + fmt(d.selisih)}
  </div>
  <div class="grid">
    <!-- AKTIVA -->
    <div>
      <div class="section-title">AKTIVA</div>
      <table>
        <thead><tr><th>Nama Akun</th><th style="text-align:right;width:120px">Jumlah</th></tr></thead>
        <tbody>
          ${groupRows('Aktiva Lancar', d.aset.aktiva_lancar.accounts, d.aset.aktiva_lancar.total)}
          ${groupRows('Aktiva Tetap', d.aset.aktiva_tetap.accounts, d.aset.aktiva_tetap.total)}
          ${groupRows('Aktiva Lainnya', d.aset.lainnya.accounts, d.aset.lainnya.total)}
          <tr class="grand-total"><td>TOTAL AKTIVA</td><td class="right">${fmt(d.aset.total)}</td></tr>
        </tbody>
      </table>
    </div>

    <!-- PASIVA -->
    <div>
      <div class="section-title">PASIVA</div>
      <table>
        <thead><tr><th>Nama Akun</th><th style="text-align:right;width:120px">Jumlah</th></tr></thead>
        <tbody>
          ${groupRows('Hutang Lancar', d.kewajiban.hutang_lancar.accounts, d.kewajiban.hutang_lancar.total)}
          ${groupRows('Hutang Jangka Panjang', d.kewajiban.hutang_jangka_panjang.accounts, d.kewajiban.hutang_jangka_panjang.total)}
          ${groupRows('Kewajiban Lainnya', d.kewajiban.lainnya.accounts, d.kewajiban.lainnya.total)}
          <tr class="kewajiban-subtotal"><td>TOTAL KEWAJIBAN</td><td>${fmt(d.kewajiban.total)}</td></tr>
          <tr class="group-head"><td colspan="2">Modal</td></tr>
          ${modalRows}
          <tr class="even"><td style="padding-left:12pt">Laba Tahun Berjalan</td><td class="right">${fmt(d.laba_tahun_berjalan)}</td></tr>
          <tr class="subtotal-row"><td>Total Modal</td><td class="right">${fmt(d.modal.total + d.laba_tahun_berjalan)}</td></tr>
          <tr class="grand-total"><td>TOTAL PASIVA</td><td class="right">${fmt(d.total_pasiva)}</td></tr>
        </tbody>
      </table>
    </div>
  </div>
  <div class="footer">Dicetak pada ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} &middot; Sistem ERP PT. SBC</div>
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`

      const win = window.open('', '_blank')
      win.document.write(html)
      win.document.close()
    },

    exportExcel() {
      import('xlsx').then((XLSX) => {
        const d = this.reportData
        const fmt = (v) => Number(Math.abs(v || 0))
        const fmtDate = (dt) => new Date(dt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })

        // Build flat list for aktiva column
        const aktiva = []
        const addGroup = (label, accounts, total) => {
          if (!accounts || accounts.length === 0) return
          aktiva.push({ name: label, amount: null, isHeader: true })
          accounts.forEach(a => aktiva.push({ name: '  ' + a.account_name, amount: fmt(a.amount) }))
          aktiva.push({ name: 'Total ' + label, amount: fmt(total), isSubtotal: true })
        }
        addGroup('Aktiva Lancar', d.aset.aktiva_lancar.accounts, d.aset.aktiva_lancar.total)
        addGroup('Aktiva Tetap', d.aset.aktiva_tetap.accounts, d.aset.aktiva_tetap.total)
        addGroup('Aktiva Lainnya', d.aset.lainnya.accounts, d.aset.lainnya.total)

        // Build flat list for pasiva column
        const pasiva = []
        const addPasivaGroup = (label, accounts, total) => {
          if (!accounts || accounts.length === 0) return
          pasiva.push({ name: label, amount: null, isHeader: true })
          accounts.forEach(a => pasiva.push({ name: '  ' + a.account_name, amount: fmt(a.amount) }))
          pasiva.push({ name: 'Total ' + label, amount: fmt(total), isSubtotal: true })
        }
        addPasivaGroup('Hutang Lancar', d.kewajiban.hutang_lancar.accounts, d.kewajiban.hutang_lancar.total)
        addPasivaGroup('Hutang Jangka Panjang', d.kewajiban.hutang_jangka_panjang.accounts, d.kewajiban.hutang_jangka_panjang.total)
        addPasivaGroup('Kewajiban Lainnya', d.kewajiban.lainnya.accounts, d.kewajiban.lainnya.total)
        pasiva.push({ name: 'TOTAL KEWAJIBAN', amount: fmt(d.kewajiban.total), isSubtotal: true })
        pasiva.push({ name: '', amount: null })
        pasiva.push({ name: 'Modal', amount: null, isHeader: true })
        d.modal.accounts.forEach(a => pasiva.push({ name: '  ' + a.account_name, amount: fmt(a.amount) }))
        pasiva.push({ name: '  Laba Tahun Berjalan', amount: fmt(d.laba_tahun_berjalan) })
        pasiva.push({ name: 'Total Modal', amount: fmt(d.modal.total + d.laba_tahun_berjalan), isSubtotal: true })

        const rows = []
        rows.push(['PT. SURYA BANGKIT CEMERLANG'])
        rows.push(['NERACA (BALANCE SHEET)'])
        rows.push([`Per Tanggal: ${fmtDate(d.as_of_date)}`])
        rows.push([])
        rows.push(['AKTIVA', '', '', 'PASIVA', ''])
        rows.push(['Nama Akun', 'Jumlah', '', 'Nama Akun', 'Jumlah'])

        const maxLen = Math.max(aktiva.length, pasiva.length)
        for (let i = 0; i < maxLen; i++) {
          const a = aktiva[i]
          const p = pasiva[i]
          rows.push([
            a ? a.name : '',
            a && a.amount !== null && a.amount !== undefined ? a.amount : '',
            '',
            p ? p.name : '',
            p && p.amount !== null && p.amount !== undefined ? p.amount : '',
          ])
        }

        rows.push([])
        rows.push(['TOTAL AKTIVA', fmt(d.aset.total), '', 'TOTAL PASIVA', fmt(d.total_pasiva)])
        rows.push([])
        rows.push([d.is_balanced ? 'Neraca Balance' : `Tidak Balance — Selisih: ${d.selisih}`])
        rows.push([`Diekspor: ${new Date().toLocaleDateString('id-ID')}`])

        const ws = XLSX.utils.aoa_to_sheet(rows)
        ws['!cols'] = [{ wch: 40 }, { wch: 20 }, { wch: 3 }, { wch: 40 }, { wch: 20 }]

        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Neraca')
        XLSX.writeFile(wb, `Neraca_${d.as_of_date}.xlsx`)
      }).catch(() => {
        alert('Gagal memuat library Excel. Pastikan package xlsx terinstal.')
      })
    },
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
.header-actions { display: flex; align-items: flex-start; }

/* ===== EXPORT GROUP ===== */
.export-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}
.export-group-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #9ca3af;
}
.export-btns {
  display: flex;
  align-items: stretch;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  background: #fff;
}
.exp-divider {
  width: 1px;
  background: #e5e7eb;
  flex-shrink: 0;
}
.btn-exp {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  border: none;
  background: transparent;
  transition: all 0.18s ease;
  position: relative;
  overflow: hidden;
}
.btn-exp::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.18s;
}
.btn-exp:hover:not(:disabled)::before { opacity: 1; }

.btn-pdf { color: #b91c1c; }
.btn-pdf::before { background: #fef2f2; }
.btn-pdf:hover:not(:disabled) { color: #991b1b; }

.btn-excel { color: #047857; }
.btn-excel::before { background: #f0fdf4; }
.btn-excel:hover:not(:disabled) { color: #065f46; }

.btn-exp:disabled { opacity: 0.35; cursor: not-allowed; }

.exp-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 7px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  transition: transform 0.18s;
}
.btn-pdf .exp-icon   { background: #fee2e2; }
.btn-excel .exp-icon { background: #d1fae5; }
.btn-exp:hover:not(:disabled) .exp-icon { transform: scale(1.08); }

.exp-label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}
.exp-main {
  font-size: 13px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.2px;
}
.exp-sub {
  font-size: 10px;
  font-weight: 500;
  opacity: 0.6;
  line-height: 1.3;
}

.export-hint {
  font-size: 10.5px;
  color: #d97706;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}
.export-hint::before {
  content: '⚠';
  font-size: 10px;
}

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
.subtotal-row.kewajiban-total { background: #fef2f2; border-color: #fecaca; color: #991b1b; letter-spacing: 0.5px; }

/* sub section */
.sub-section { display: flex; flex-direction: column; gap: 10px; }
.sub-head { display: flex; align-items: center; gap: 8px; }
.sub-indicator { width: 3px; height: 16px; border-radius: 2px; flex-shrink: 0; }
.lancar-indicator   { background: #0ea5e9; }
.tetap-indicator    { background: #f59e0b; }
.liab-indicator     { background: #dc2626; }
.liab-jp-indicator  { background: #b91c1c; }
.lainnya-indicator  { background: #6b7280; }
.modal-indicator    { background: #7c3aed; }
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