<template>
  <DashboardLayout>
    <div class="gl-wrap">

      <!-- PAGE HEADER -->
      <div class="page-header">
        <div class="header-left">
          <div class="icon-badge">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              <line x1="12" y1="6" x2="16" y2="6"/><line x1="12" y1="10" x2="16" y2="10"/><line x1="12" y1="14" x2="16" y2="14"/>
            </svg>
          </div>
          <div class="header-text">
            <div class="eyebrow">
              <span class="eyebrow-dot"></span>
              Laporan Keuangan
            </div>
            <h1 class="page-title">Buku <span class="accent">Besar</span></h1>
            <p class="page-subtitle">Laporan mutasi & saldo berjalan per akun</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-icon-text btn-outline" @click="toggleCardView" v-if="hasData">
            <svg v-if="!cardView" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            {{ cardView ? 'Tabel' : 'Kartu' }}
          </button>
          <div class="export-group">
            <div class="export-group-label">Ekspor Laporan</div>
            <div class="export-btns">
              <button class="btn-exp btn-pdf-gl" @click="exportPDF" :disabled="!hasData">
                <span class="exp-icon exp-icon-pdf-gl">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                  </svg>
                </span>
                <span class="exp-label">
                  <span class="exp-main">PDF</span>
                  <span class="exp-sub">Cetak / .pdf</span>
                </span>
              </button>
              <div class="exp-divider"></div>
              <button class="btn-exp btn-excel-gl" @click="exportExcel" :disabled="!hasData">
                <span class="exp-icon exp-icon-gl">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                    <line x1="6" y1="14" x2="8.5" y2="18"/><line x1="8.5" y1="14" x2="6" y2="18"/>
                    <line x1="13" y1="14" x2="16" y2="14"/><line x1="13" y1="18" x2="16" y2="18"/>
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
        <div class="filter-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Filter Data
        </div>
        <div class="filter-inner">
          <div class="filter-field filter-coa">
            <label class="filter-label">Akun COA</label>
            <vue-select
              v-model="filters.account_id"
              :options="accounts"
              :reduce="acc => acc.id"
              :get-option-label="acc => `${acc.code} · ${acc.name}`"
              placeholder="Cari kode atau nama akun..."
              class="coa-select"
              :clearable="true"
            />
          </div>
          <div class="filter-field">
            <label class="filter-label">Tanggal Mulai</label>
            <input v-model="filters.start_date" type="date" class="form-control" required />
          </div>
          <div class="filter-field">
            <label class="filter-label">Tanggal Akhir</label>
            <input v-model="filters.end_date" type="date" class="form-control" required />
          </div>
          <div class="filter-actions">
            <button class="btn-icon-text btn-ghost" @click="resetFilters">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>
              Reset
            </button>
            <button class="btn-icon-text btn-teal btn-generate" @click="fetchData" :disabled="!canFilter || loading">
              <span v-if="loading" class="spinner-sm"></span>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              {{ loading ? 'Memuat...' : 'Tampilkan' }}
            </button>
          </div>
        </div>
      </div>

      <!-- EMPTY STATE -->
      <div v-if="!hasData && !loading" class="state-card empty-state">
        <div class="state-graphic">
          <div class="state-circle-outer">
            <div class="state-circle-inner">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0f766e" stroke-width="1.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="state-title">Belum Ada Data</div>
        <div class="state-desc">Pilih akun COA dan tentukan periode untuk melihat laporan buku besar</div>
        <div class="state-hint">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Gunakan filter di atas kemudian klik "Tampilkan"
        </div>
      </div>

      <!-- LOADING -->
      <div v-else-if="loading" class="state-card loading-state">
        <div class="loading-dots">
          <span></span><span></span><span></span>
        </div>
        <p class="state-desc">Mengambil data transaksi...</p>
      </div>

      <!-- DATA -->
      <div v-else class="data-section">

        <!-- KPI SUMMARY STRIP -->
        <div class="kpi-strip">
          <div class="kpi-card kpi-account">
            <div class="kpi-icon kpi-icon-blue">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div class="kpi-body">
              <div class="kpi-label">Akun</div>
              <div class="kpi-val kpi-val-sm">{{ ledgerData.account.code }}</div>
              <div class="kpi-sub">{{ ledgerData.account.name }}</div>
            </div>
          </div>
          <div class="kpi-card kpi-period">
            <div class="kpi-icon kpi-icon-violet">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="kpi-body">
              <div class="kpi-label">Transaksi</div>
              <div class="kpi-val">{{ transactions.length }}</div>
              <div class="kpi-sub">{{ formatDateRange(filters.start_date, filters.end_date) }}</div>
            </div>
          </div>
          <div class="kpi-card kpi-debit">
            <div class="kpi-icon kpi-icon-green">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
            </div>
            <div class="kpi-body">
              <div class="kpi-label">Total Debit</div>
              <div class="kpi-val kpi-val-green">{{ formatRupiah(summary.total_debit) }}</div>
              <div class="kpi-sub">Periode berjalan</div>
            </div>
          </div>
          <div class="kpi-card kpi-credit">
            <div class="kpi-icon kpi-icon-orange">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            </div>
            <div class="kpi-body">
              <div class="kpi-label">Total Kredit</div>
              <div class="kpi-val kpi-val-orange">{{ formatRupiah(summary.total_credit) }}</div>
              <div class="kpi-sub">Periode berjalan</div>
            </div>
          </div>
          <div class="kpi-card kpi-saldo kpi-highlight">
            <div class="kpi-icon kpi-icon-teal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div class="kpi-body">
              <div class="kpi-label">Saldo Akhir</div>
              <div :class="['kpi-val kpi-val-lg', summary.saldo_akhir >= 0 ? 'kpi-val-teal' : 'kpi-val-red']">
                {{ formatRupiah(summary.saldo_akhir) }}
              </div>
              <div class="kpi-sub">
                <span :class="['kpi-badge', summary.saldo_akhir >= 0 ? 'badge-pos' : 'badge-neg']">
                  {{ summary.saldo_akhir >= 0 ? '▲ Positif' : '▼ Negatif' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- TABLE VIEW -->
        <div v-if="!cardView" class="report-card">
          <div class="report-header">
            <div class="report-header-left">
              <span class="report-title">Detail Transaksi</span>
              <span class="txn-badge">{{ transactions.length }} entri</span>
            </div>
            <div class="report-header-right">
              <span class="period-chip">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {{ formatDateRange(filters.start_date, filters.end_date) }}
              </span>
            </div>
          </div>
          <div class="table-wrapper">
            <table class="ledger-table">
              <thead>
                <tr>
                  <th class="th-no">#</th>
                  <th class="th-date">Tanggal</th>
                  <th class="th-journal">No. Jurnal</th>
                  <th class="th-desc">Keterangan</th>
                  <th class="th-amount">Debit</th>
                  <th class="th-amount">Kredit</th>
                  <th class="th-balance">Saldo Berjalan</th>
                </tr>
              </thead>
              <tbody>
                <!-- Saldo Awal Row -->
                <tr class="row-saldo-awal">
                  <td></td>
                  <td class="td-date">—</td>
                  <td><span class="badge-saldo-awal">SALDO AWAL</span></td>
                  <td class="td-desc">Saldo awal periode</td>
                  <td></td>
                  <td></td>
                  <td class="td-balance">
                    <span :class="['running-balance', ledgerData.saldo_awal >= 0 ? 'pos' : 'neg']">
                      {{ formatRupiah(ledgerData.saldo_awal) }}
                    </span>
                  </td>
                </tr>
                <tr v-if="transactions.length === 0">
                  <td colspan="7" class="empty-td">
                    <div class="empty-td-inner">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                      <span>Tidak ada transaksi pada periode ini</span>
                    </div>
                  </td>
                </tr>
                <tr
                  v-for="(trx, index) in transactions"
                  :key="index"
                  :class="['data-row', index % 2 === 0 ? 'row-even' : 'row-odd']"
                >
                  <td class="td-no">{{ index + 1 }}</td>
                  <td class="td-date">
                    <div class="date-cell">
                      <span class="date-day">{{ formatDateDay(trx.transaction_date) }}</span>
                      <span class="date-mon">{{ formatDateMon(trx.transaction_date) }}</span>
                    </div>
                  </td>
                  <td>
                    <a href="#" @click.prevent="viewJournal(trx.journal_entry_id)" class="journal-link">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      {{ trx.journal_number }}
                    </a>
                  </td>
                  <td class="td-desc">{{ trx.description }}</td>
                  <td class="td-amount">
                    <span v-if="trx.debit > 0" class="amt-debit">
                      <span class="amt-tag tag-d">D</span>
                      {{ formatRupiah(trx.debit) }}
                    </span>
                    <span v-else class="amt-nil">—</span>
                  </td>
                  <td class="td-amount">
                    <span v-if="trx.credit > 0" class="amt-credit">
                      <span class="amt-tag tag-k">K</span>
                      {{ formatRupiah(trx.credit) }}
                    </span>
                    <span v-else class="amt-nil">—</span>
                  </td>
                  <td class="td-balance">
                    <div class="balance-cell">
                      <span :class="['running-balance', trx.running_balance >= 0 ? 'pos' : 'neg']">
                        {{ formatRupiah(trx.running_balance) }}
                      </span>
                      <span class="balance-arrow" v-if="index > 0">
                        <svg v-if="trx.running_balance > transactions[index-1].running_balance" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="18 15 12 9 6 15"/></svg>
                        <svg v-else-if="trx.running_balance < transactions[index-1].running_balance" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg>
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="tfoot-total">
                  <td colspan="4" class="tfoot-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="4" x2="10" y2="13"/><line x1="6" y1="17" x2="1" y2="22"/><line x1="14" y1="1" x2="23" y2="10"/></svg>
                    Total Mutasi Periode
                  </td>
                  <td class="tfoot-debit">{{ formatRupiah(summary.total_debit) }}</td>
                  <td class="tfoot-credit">{{ formatRupiah(summary.total_credit) }}</td>
                  <td></td>
                </tr>
                <tr class="tfoot-final">
                  <td colspan="6" class="tfoot-final-label">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    Saldo Akhir Periode
                  </td>
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
            :class="['trx-card', trx.debit > 0 ? 'card-debit' : 'card-credit']"
          >
            <div class="card-accent-bar"></div>
            <div class="trx-head">
              <div class="trx-date-block">
                <span class="trx-dd">{{ formatDateDay(trx.transaction_date) }}</span>
                <span class="trx-mm">{{ formatDateMon(trx.transaction_date) }}</span>
              </div>
              <a href="#" @click.prevent="viewJournal(trx.journal_entry_id)" class="trx-journal">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                {{ trx.journal_number }}
              </a>
              <span :class="['card-type-badge', trx.debit > 0 ? 'type-d' : 'type-k']">
                {{ trx.debit > 0 ? 'Debit' : 'Kredit' }}
              </span>
            </div>
            <div class="trx-desc">{{ trx.description }}</div>
            <div class="trx-amounts">
              <div class="trx-amt-item">
                <div class="tai-label">Debit</div>
                <div class="tai-value debit-v">{{ trx.debit > 0 ? formatRupiah(trx.debit) : '—' }}</div>
              </div>
              <div class="trx-amt-divider"></div>
              <div class="trx-amt-item tai-right">
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
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import { escapeHtml } from '@/utils/escapeHtml'

export default {
  name: 'GeneralLedgerView',
  components: { DashboardLayout, VueSelect },
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
    exportPDF() {
      if (!this.ledgerData) return
      const account   = this.ledgerData.account
      const fmt       = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Math.abs(v || 0))
      const fmtDate   = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'
      const fmtDateSh = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
      const period    = `${fmtDateSh(this.filters.start_date)} — ${fmtDateSh(this.filters.end_date)}`
      const printDate = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })

      const txnRows = this.transactions.map((trx, i) => `
        <tr class="${i % 2 === 0 ? 'even' : ''}">
          <td class="c">${i + 1}</td>
          <td class="c">${fmtDate(trx.transaction_date)}</td>
          <td class="mono">${escapeHtml(trx.journal_number)}</td>
          <td class="desc">${trx.description ? escapeHtml(trx.description) : '-'}</td>
          <td class="r debit-c">${trx.debit > 0 ? fmt(trx.debit) : ''}</td>
          <td class="r credit-c">${trx.credit > 0 ? fmt(trx.credit) : ''}</td>
          <td class="r ${trx.running_balance >= 0 ? 'pos-c' : 'neg-c'}">${fmt(trx.running_balance)}</td>
        </tr>`).join('')

      const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<title>Buku Besar — ${escapeHtml(account.code)} ${escapeHtml(account.name)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 9.5pt; color: #1a1a1a; padding: 14mm 16mm; }

  /* KOP */
  .kop { margin-bottom: 4mm; }
  .kop-inner { display: flex; align-items: center; gap: 4mm; border-bottom: 3pt solid #1e3a5f; padding-bottom: 3.5mm; }
  .kop-logo { width: 13mm; height: 13mm; background: #1e3a5f; border-radius: 2mm; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .kop-logo span { color: #fff; font-size: 15pt; font-weight: 900; font-family: Arial, sans-serif; }
  .kop-text { flex: 1; }
  .kop-company { font-size: 12pt; font-weight: 900; color: #1e3a5f; font-family: Arial, sans-serif; line-height: 1.2; }
  .kop-tagline { font-size: 7.5pt; color: #6b7280; margin-top: 0.5mm; }
  .kop-right { text-align: right; }
  .kop-doc-title { font-size: 7.5pt; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
  .kop-doc-period { font-size: 8.5pt; color: #1e3a5f; font-weight: 700; margin-top: 0.5mm; }

  /* JUDUL */
  .report-header { margin: 3mm 0 4mm; }
  .report-title { font-size: 14pt; font-weight: 900; color: #1e3a5f; letter-spacing: 0.5px; text-transform: uppercase; font-family: Arial, sans-serif; }
  .account-badge { display: inline-block; background: #1e3a5f; color: #fff; font-size: 8pt; font-weight: 700; padding: 1.5mm 3mm; border-radius: 1mm; margin-top: 2mm; letter-spacing: 0.5px; font-family: Arial, sans-serif; }
  .report-divider { height: 1pt; background: #1e3a5f; margin: 2.5mm 0; opacity: 0.2; }

  /* TABEL */
  table { width: 100%; border-collapse: collapse; font-size: 9pt; }
  thead { display: table-header-group; }
  thead tr { background: #1e3a5f; }
  thead th { padding: 3mm 3mm; color: #fff; font-weight: 700; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.5px; border: 0.5pt solid #2d4a6f; }
  tbody tr { border-bottom: 0.5pt solid #e5e7eb; }
  tbody tr.even td { background: #f8fafc; }
  tbody td { padding: 2.5mm 3mm; vertical-align: middle; }
  tfoot tr { background: #1e293b; }
  tfoot td { padding: 2.5mm 3mm; color: #fff; font-weight: 700; font-size: 8.5pt; border: 0.5pt solid #2d4a6f; }
  tfoot tr.final { background: #1e3a5f; }
  tfoot tr.final td { font-size: 10pt; font-weight: 900; }

  /* SALDO AWAL */
  .saldo-awal { background: #fffbeb !important; }
  .saldo-awal td { font-style: italic; color: #92400e; }
  .badge-sa { background: #fef3c7; color: #92400e; border: 0.5pt solid #fde68a; padding: 1pt 4pt; border-radius: 2pt; font-size: 7.5pt; font-weight: 800; font-style: normal; }

  /* ALIGNMENT */
  .c { text-align: center; }
  .r { text-align: right; font-family: 'Courier New', monospace; font-weight: 600; }
  .mono { font-family: 'Courier New', monospace; font-size: 8.5pt; }
  .desc { max-width: 120pt; }
  .debit-c { color: #065f46; }
  .credit-c { color: #1e40af; }
  .pos-c { color: #065f46; font-weight: 800; }
  .neg-c { color: #991b1b; font-weight: 800; }

  /* FOOTER */
  .print-footer { margin-top: 5mm; border-top: 0.75pt solid #d1d5db; padding-top: 2.5mm; display: flex; justify-content: space-between; font-size: 7.5pt; color: #9ca3af; }

  /* PRINT */
  @page { size: A4 portrait; margin: 14mm 16mm; }
  @media print {
    body { padding: 0; }
    .kop { position: fixed; top: 0; left: 0; right: 0; background: #fff; padding-bottom: 2mm; margin-bottom: 0; }
    .content { padding-top: 28mm; }
    thead { display: table-header-group; }
  }
</style>
</head>
<body>

<div class="kop">
  <div class="kop-inner">
    <div class="kop-logo"><span>S</span></div>
    <div class="kop-text">
      <div class="kop-company">PT. SURYA BANGKIT CEMERLANG</div>
      <div class="kop-tagline">Perusahaan Pengolahan Kayu &amp; Moulding</div>
    </div>
    <div class="kop-right">
      <div class="kop-doc-title">Laporan Keuangan</div>
      <div class="kop-doc-period">${period}</div>
    </div>
  </div>
</div>

<div class="content">
  <div class="report-header">
    <div class="report-title">Buku Besar</div>
    <div><span class="account-badge">${escapeHtml(account.code)} &mdash; ${escapeHtml(account.name)}</span></div>
    <div class="report-divider"></div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="c" style="width:24pt">No</th>
        <th style="width:58pt">Tanggal</th>
        <th style="width:72pt">No. Jurnal</th>
        <th>Keterangan</th>
        <th class="r" style="width:72pt">Debit</th>
        <th class="r" style="width:72pt">Kredit</th>
        <th class="r" style="width:80pt">Saldo Berjalan</th>
      </tr>
    </thead>
    <tbody>
      <tr class="saldo-awal">
        <td></td>
        <td class="c">—</td>
        <td><span class="badge-sa">SALDO AWAL</span></td>
        <td>Saldo awal periode</td>
        <td></td>
        <td></td>
        <td class="r ${this.ledgerData.saldo_awal >= 0 ? 'pos-c' : 'neg-c'}">${fmt(this.ledgerData.saldo_awal)}</td>
      </tr>
      ${txnRows || '<tr><td colspan="7" style="text-align:center;color:#9ca3af;padding:6mm;font-style:italic">Tidak ada transaksi pada periode ini</td></tr>'}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4" style="color:rgba(255,255,255,0.7);font-size:7.5pt;letter-spacing:0.5px">TOTAL MUTASI PERIODE</td>
        <td class="r" style="color:#6ee7b7">${fmt(this.summary.total_debit)}</td>
        <td class="r" style="color:#93c5fd">${fmt(this.summary.total_credit)}</td>
        <td></td>
      </tr>
      <tr class="final">
        <td colspan="6" style="color:rgba(255,255,255,0.85);font-size:8pt;letter-spacing:0.8px">SALDO AKHIR PERIODE</td>
        <td class="r" style="color:${this.summary.saldo_akhir >= 0 ? '#fff' : '#fca5a5'}">${fmt(this.summary.saldo_akhir)}</td>
      </tr>
    </tfoot>
  </table>

  <div class="print-footer">
    <span>Dicetak pada ${printDate}</span>
    <span>PT. Surya Bangkit Cemerlang &mdash; Sistem ERP</span>
    <span>Dokumen ini digenerate secara otomatis</span>
  </div>
</div>

</body></html>`

      const w = window.open('', '_blank')
      w.document.write(html)
      w.document.close()
      w.focus()
      setTimeout(() => { w.print() }, 500)
    },
    exportExcel() {
      import('xlsx').then((XLSX) => {
        const account  = this.ledgerData.account
        const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'
        const num      = (v) => Number(v || 0)

        /* ── bangun array of arrays ── */
        const aoa = []

        // baris judul
        aoa.push(['BUKU BESAR'])
        aoa.push([`Akun : ${account.code} – ${account.name}`])
        aoa.push([`Periode : ${fmtDate(this.filters.start_date)}  s/d  ${fmtDate(this.filters.end_date)}`])
        aoa.push([])

        // header kolom
        aoa.push(['No', 'Tanggal', 'No. Jurnal', 'Keterangan', 'Debit', 'Kredit', 'Saldo Berjalan'])

        // saldo awal
        aoa.push(['', '—', 'SALDO AWAL', 'Saldo awal periode', '', '', num(this.ledgerData.saldo_awal)])

        // transaksi
        this.transactions.forEach((trx, i) => {
          aoa.push([
            i + 1,
            fmtDate(trx.transaction_date),
            trx.journal_number,
            trx.description,
            trx.debit  > 0 ? num(trx.debit)  : '',
            trx.credit > 0 ? num(trx.credit) : '',
            num(trx.running_balance),
          ])
        })

        aoa.push([])
        aoa.push(['', '', '', 'TOTAL MUTASI', num(this.summary.total_debit), num(this.summary.total_credit), ''])
        aoa.push(['', '', '', '', '', 'SALDO AKHIR', num(this.summary.saldo_akhir)])

        /* ── buat worksheet ── */
        const ws = XLSX.utils.aoa_to_sheet(aoa)

        /* ── lebar kolom ── */
        ws['!cols'] = [
          { wch: 4  },
          { wch: 13 },
          { wch: 20 },
          { wch: 40 },
          { wch: 18 },
          { wch: 18 },
          { wch: 20 },
        ]

        /* ── merge judul (A1:G1, A2:G2, A3:G3) ── */
        ws['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
          { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
        ]

        /* ── format angka untuk kolom Debit/Kredit/Saldo (E,F,G) ── */
        const numFmt = '#,##0'
        const dataStart = 5
        const dataEnd   = aoa.length - 1

        for (let r = dataStart; r <= dataEnd; r++) {
          ;['E', 'F', 'G'].forEach(col => {
            const cell = ws[`${col}${r + 1}`]
            if (cell && typeof cell.v === 'number') {
              cell.z = numFmt
              cell.t = 'n'
            }
          })
        }

        /* ── buat workbook & download ── */
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Buku Besar')

        const fileName = `buku-besar-${account.code}-${this.filters.start_date}-${this.filters.end_date}.xlsx`
        XLSX.writeFile(wb, fileName)
      })
    },
    toggleCardView() { this.cardView = !this.cardView },
    formatDateRange(start, end) {
      return `${this.formatDate(start)} — ${this.formatDate(end)}`
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
    },
    formatDateDay(date) {
      return date ? new Date(date).toLocaleDateString('id-ID', { day: '2-digit' }) : '-'
    },
    formatDateMon(date) {
      return date ? new Date(date).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }) : '-'
    },
    formatRupiah(num) {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0)
    },
  },
}
</script>

<style scoped>
/* ─── BASE ─────────────────────────────────────────────── */
.gl-wrap { display: flex; flex-direction: column; gap: 20px; }

/* ─── PAGE HEADER ───────────────────────────────────────── */
.page-header {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 22px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  box-shadow: 0 1px 8px rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;
}
.page-header::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #0f766e, #14b8a6);
  border-radius: 4px 0 0 4px;
}
.header-left { display: flex; align-items: center; gap: 16px; }
.icon-badge {
  width: 52px; height: 52px;
  background: linear-gradient(135deg, #ccfbf1, #99f6e4);
  border: 1.5px solid #5eead4;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  color: #0f766e;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(15,118,110,0.15);
}
.eyebrow {
  font-size: 10.5px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #0f766e;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}
.eyebrow-dot { width: 6px; height: 6px; background: #0f766e; border-radius: 50%; display: inline-block; }
.page-title { font-size: 26px; font-weight: 900; color: #111827; letter-spacing: -0.5px; margin: 0 0 3px; line-height: 1.1; }
.page-title .accent { color: #0f766e; }
.page-subtitle { font-size: 13px; color: #9ca3af; margin: 0; }
.header-actions { display: flex; gap: 10px; flex-wrap: wrap; }

/* ─── BUTTONS ───────────────────────────────────────────── */
.btn-icon-text {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 16px;
  border-radius: 9px;
  font-size: 13px; font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s ease;
  white-space: nowrap;
  border: 1.5px solid transparent;
}
.btn-outline { background: #fff; color: #374151; border-color: #e5e7eb; }
.btn-outline:hover { background: #f9fafb; border-color: #d1d5db; }
.btn-primary { background: #fff; color: #0f766e; border-color: #99f6e4; }
.btn-primary:hover:not(:disabled) { background: #f0fdfa; }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-ghost { background: transparent; color: #6b7280; border-color: #e5e7eb; }
.btn-ghost:hover { background: #f9fafb; color: #374151; }
.btn-teal { background: #0f766e; color: #fff; border-color: #0f766e; box-shadow: 0 2px 10px rgba(15,118,110,0.3); }
.btn-teal:hover:not(:disabled) { background: #0d6461; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(15,118,110,0.35); }
.btn-teal:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

/* ─── FILTER CARD ───────────────────────────────────────── */
.filter-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 18px 24px;
  box-shadow: 0 1px 8px rgba(0,0,0,0.05);
}
.filter-title {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #6b7280;
  display: flex; align-items: center; gap: 6px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}
.filter-inner { display: flex; align-items: flex-end; gap: 14px; flex-wrap: wrap; }
.filter-field { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 160px; }
.filter-coa { flex: 2.5; min-width: 220px; }
.filter-label { font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; }
.form-control {
  padding: 10px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 9px;
  font-size: 13.5px;
  font-family: inherit;
  background: #fafafa;
  color: #111827;
  transition: all 0.2s;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
.form-control:focus { border-color: #0f766e; background: #fff; box-shadow: 0 0 0 3px rgba(15,118,110,0.12); }
.filter-actions { display: flex; gap: 8px; flex-shrink: 0; align-self: flex-end; }

/* ─── SPINNER ───────────────────────────────────────────── */
.spinner-sm {
  width: 13px; height: 13px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── STATES ────────────────────────────────────────────── */
.state-card {
  background: #fff; border: 1px solid #e5e7eb;
  border-radius: 16px; padding: 70px 20px;
  text-align: center;
  box-shadow: 0 1px 8px rgba(0,0,0,0.05);
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.state-circle-outer {
  width: 96px; height: 96px;
  background: #f0fdfa; border: 2px dashed #99f6e4;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.state-circle-inner {
  width: 68px; height: 68px;
  background: #ccfbf1; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.state-title { font-size: 17px; font-weight: 800; color: #1e293b; }
.state-desc { font-size: 13.5px; color: #9ca3af; max-width: 340px; }
.state-hint {
  font-size: 12px; color: #6b7280;
  display: flex; align-items: center; gap: 5px;
  background: #f9fafb; border: 1px solid #e5e7eb;
  padding: 7px 14px; border-radius: 8px;
  margin-top: 4px;
}
.loading-dots { display: flex; gap: 6px; align-items: center; height: 36px; }
.loading-dots span {
  width: 10px; height: 10px;
  background: #0f766e; border-radius: 50%;
  animation: bounce 1.2s infinite ease-in-out;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; background: #14b8a6; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; background: #5eead4; }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }

/* ─── DATA SECTION ──────────────────────────────────────── */
.data-section { display: flex; flex-direction: column; gap: 20px; }

/* ─── KPI STRIP ─────────────────────────────────────────── */
.kpi-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}
.kpi-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px 18px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.04);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}
.kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
.kpi-highlight {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: #a7f3d0;
}
.kpi-icon {
  width: 38px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.kpi-icon-blue { background: #dbeafe; color: #2563eb; }
.kpi-icon-violet { background: #ede9fe; color: #7c3aed; }
.kpi-icon-green { background: #d1fae5; color: #059669; }
.kpi-icon-orange { background: #ffedd5; color: #ea580c; }
.kpi-icon-teal { background: #ccfbf1; color: #0f766e; }
.kpi-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.kpi-label { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #9ca3af; }
.kpi-val { font-size: 15px; font-weight: 900; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kpi-val-sm { font-size: 13px; font-family: 'Courier New', monospace; letter-spacing: 1px; }
.kpi-val-lg { font-size: 16px; }
.kpi-val-green { color: #059669; }
.kpi-val-orange { color: #ea580c; }
.kpi-val-teal { color: #0f766e; }
.kpi-val-red { color: #dc2626; }
.kpi-sub { font-size: 11px; color: #9ca3af; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kpi-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; display: inline-block; }
.badge-pos { background: #d1fae5; color: #065f46; }
.badge-neg { background: #fee2e2; color: #991b1b; }

/* ─── REPORT CARD ───────────────────────────────────────── */
.report-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 1px 8px rgba(0,0,0,0.05);
  overflow: hidden;
}
.report-header {
  padding: 14px 22px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;
}
.report-header-left { display: flex; align-items: center; gap: 10px; }
.report-title { font-size: 13px; font-weight: 800; color: #1e293b; }
.txn-badge {
  font-size: 11px; font-weight: 700;
  background: #f0fdfa; color: #0f766e;
  border: 1px solid #99f6e4;
  padding: 3px 10px; border-radius: 20px;
}
.period-chip {
  font-size: 11.5px; color: #6b7280; font-weight: 600;
  display: flex; align-items: center; gap: 5px;
  background: #f9fafb; border: 1px solid #e5e7eb;
  padding: 5px 12px; border-radius: 8px;
}

/* ─── TABLE ─────────────────────────────────────────────── */
.table-wrapper { overflow-x: auto; }
.ledger-table { width: 100%; border-collapse: collapse; min-width: 820px; }
.ledger-table thead { background: #1e293b; }
.ledger-table th {
  padding: 12px 16px;
  text-align: left;
  color: #94a3b8;
  font-weight: 700;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  white-space: nowrap;
}
.th-no { width: 40px; text-align: center; }
.th-date { width: 80px; }
.th-journal { width: 150px; }
.th-amount { width: 148px; text-align: right; }
.th-balance { width: 160px; text-align: right; }

/* saldo awal row */
.row-saldo-awal { background: #fffbeb; border-bottom: 1px solid #fde68a; }
.row-saldo-awal td { padding: 10px 16px; font-size: 13px; }
.badge-saldo-awal {
  font-size: 10px; font-weight: 800;
  background: #fef3c7; color: #92400e;
  border: 1px solid #fde68a;
  padding: 3px 8px; border-radius: 6px;
  letter-spacing: 0.5px;
}

.data-row { border-bottom: 1px solid #f1f5f9; transition: background 0.12s; }
.row-even { background: #fff; }
.row-odd { background: #fafbfc; }
.data-row:hover { background: #f0fdfa; }
.ledger-table td { padding: 12px 16px; font-size: 13.5px; vertical-align: middle; }
.ledger-table tbody td { color: #374151; }

.td-no { text-align: center; font-size: 11px; font-weight: 700; color: #9ca3af; }
.date-cell { display: flex; flex-direction: column; gap: 1px; }
.date-day { font-size: 15px; font-weight: 800; color: #1e293b; line-height: 1; }
.date-mon { font-size: 10.5px; color: #9ca3af; font-weight: 600; text-transform: uppercase; }
.td-desc { color: #4b5563; max-width: 260px; font-size: 13px; }
.td-amount { text-align: right; }
.td-balance { text-align: right; }

.journal-link {
  font-family: 'Courier New', monospace;
  font-size: 12px; font-weight: 700;
  color: #0f766e;
  text-decoration: none;
  background: #f0fdfa;
  padding: 4px 9px;
  border-radius: 7px;
  border: 1px solid #99f6e4;
  display: inline-flex; align-items: center; gap: 5px;
  transition: all 0.18s;
}
.journal-link:hover { background: #ccfbf1; transform: translateX(2px); }

.amt-debit, .amt-credit {
  font-family: 'Courier New', monospace;
  font-size: 12.5px; font-weight: 700;
  display: inline-flex; align-items: center; gap: 5px;
}
.amt-debit { color: #059669; }
.amt-credit { color: #2563eb; }
.amt-tag {
  font-size: 9px; font-weight: 900;
  padding: 1px 5px; border-radius: 4px;
  letter-spacing: 0.5px;
}
.tag-d { background: #d1fae5; color: #065f46; }
.tag-k { background: #dbeafe; color: #1e40af; }
.amt-nil { color: #e2e8f0; font-size: 16px; }

.balance-cell { display: flex; align-items: center; justify-content: flex-end; gap: 5px; }
.running-balance { font-family: 'Courier New', monospace; font-weight: 800; font-size: 13px; }
.running-balance.pos { color: #059669; }
.running-balance.neg { color: #dc2626; }
.balance-arrow { line-height: 1; }

/* tfoot */
.tfoot-total { background: #1e293b; }
.tfoot-total td { padding: 12px 16px; }
.tfoot-label {
  font-size: 11px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.8px;
  color: rgba(255,255,255,0.6);
  display: flex; align-items: center; gap: 6px;
}
.tfoot-debit { font-family: 'Courier New', monospace; font-weight: 800; color: #6ee7b7; text-align: right; font-size: 13px; }
.tfoot-credit { font-family: 'Courier New', monospace; font-weight: 800; color: #93c5fd; text-align: right; font-size: 13px; }
.tfoot-final { background: linear-gradient(90deg, #0f766e, #14b8a6); }
.tfoot-final td { padding: 14px 16px; }
.tfoot-final-label {
  font-size: 11.5px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.8px;
  color: rgba(255,255,255,0.85);
  display: flex; align-items: center; gap: 6px;
}
.tfoot-final-val { font-family: 'Courier New', monospace; font-weight: 900; font-size: 17px; text-align: right; }
.tfoot-final-val.pos { color: #fff; }
.tfoot-final-val.neg { color: #fca5a5; }

.empty-td { padding: 48px !important; text-align: center; }
.empty-td-inner { display: flex; flex-direction: column; align-items: center; gap: 10px; font-size: 13.5px; color: #9ca3af; }

/* ─── CARD GRID ─────────────────────────────────────────── */
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
.trx-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  transition: all 0.2s;
  position: relative;
}
.trx-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
.card-accent-bar { height: 3px; width: 100%; }
.card-debit .card-accent-bar { background: linear-gradient(90deg, #059669, #10b981); }
.card-credit .card-accent-bar { background: linear-gradient(90deg, #2563eb, #60a5fa); }
.trx-head {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f3f4f6;
}
.trx-date-block { display: flex; flex-direction: column; gap: 0; align-items: center; width: 34px; background: #f0fdfa; border: 1px solid #d1fae5; border-radius: 8px; padding: 5px; }
.trx-dd { font-size: 15px; font-weight: 900; color: #0f766e; line-height: 1; }
.trx-mm { font-size: 9px; color: #6b7280; font-weight: 700; text-transform: uppercase; }
.trx-journal {
  font-family: 'Courier New', monospace; font-size: 11.5px; font-weight: 700;
  color: #0f766e; text-decoration: none;
  background: #f0fdfa; padding: 3px 8px; border-radius: 6px; border: 1px solid #99f6e4;
  display: inline-flex; align-items: center; gap: 4px;
  transition: background 0.15s;
  flex: 1;
}
.trx-journal:hover { background: #ccfbf1; }
.card-type-badge { font-size: 10px; font-weight: 800; padding: 3px 9px; border-radius: 20px; flex-shrink: 0; }
.type-d { background: #d1fae5; color: #065f46; }
.type-k { background: #dbeafe; color: #1e40af; }
.trx-desc { padding: 12px 16px; font-size: 13px; color: #374151; font-weight: 500; border-bottom: 1px solid #f3f4f6; min-height: 42px; }
.trx-amounts { display: flex; align-items: center; padding: 12px 16px; border-bottom: 1px solid #f3f4f6; }
.trx-amt-item { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.tai-right { align-items: flex-end; }
.trx-amt-divider { width: 1px; height: 30px; background: #e5e7eb; margin: 0 12px; }
.tai-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; }
.tai-value { font-family: 'Courier New', monospace; font-size: 12.5px; font-weight: 800; }
.debit-v { color: #059669; }
.credit-v { color: #2563eb; }
.trx-balance { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: #fafafa; }
.tb-label { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; }
.tb-value { font-family: 'Courier New', monospace; font-size: 14px; font-weight: 900; }

/* ─── EXPORT GROUP ───────────────────────────────────────── */
.export-group { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
.export-group-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; }
.export-btns { display: flex; gap: 1px; }
.btn-exp {
  display: inline-flex; align-items: center; gap: 9px;
  padding: 9px 16px; border-radius: 9px;
  font-size: 13px; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: all 0.18s ease;
  white-space: nowrap; border: 1.5px solid transparent;
}
.btn-exp:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-pdf-gl { background: #fef2f2; color: #dc2626; border-color: #fecaca; border-radius: 9px 0 0 9px; }
.btn-pdf-gl:hover:not(:disabled) { background: #fee2e2; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(220,38,38,0.15); }
.exp-icon-pdf-gl { background: #fee2e2; color: #dc2626; }
.exp-divider { width: 1px; background: #e5e7eb; flex-shrink: 0; }
.btn-excel-gl { background: #f0fdfa; color: #0f766e; border-color: #99f6e4; border-radius: 0 9px 9px 0; }
.btn-excel-gl:hover:not(:disabled) { background: #ccfbf1; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(15,118,110,0.2); }
.exp-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.exp-icon-gl { background: #d1fae5; color: #059669; }
.exp-label { display: flex; flex-direction: column; gap: 1px; }
.exp-main { font-size: 13px; font-weight: 700; line-height: 1.2; }
.exp-sub { font-size: 10px; font-weight: 500; opacity: 0.7; }
.export-hint { font-size: 11px; color: #9ca3af; font-style: italic; }

/* ─── VUE-SELECT COA ─────────────────────────────────────── */
.coa-select :deep(.vs__dropdown-toggle) {
  border: 1.5px solid #e5e7eb;
  border-radius: 9px;
  padding: 3px 8px;
  min-height: 42px;
  background: #fafafa;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-size: 13.5px;
}
.coa-select :deep(.vs__dropdown-toggle:focus-within),
.coa-select.vs--open :deep(.vs__dropdown-toggle) {
  border-color: #0f766e;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
}
.coa-select :deep(.vs__selected) {
  font-size: 13.5px;
  font-weight: 600;
  color: #111827;
  margin: 1px 2px;
}
.coa-select :deep(.vs__search::placeholder) {
  color: #9ca3af;
  font-size: 13px;
}
.coa-select :deep(.vs__search) {
  font-size: 13.5px;
  color: #111827;
}
.coa-select :deep(.vs__dropdown-menu) {
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  margin-top: 4px;
  max-height: 280px;
  overflow-y: auto;
}
.coa-select :deep(.vs__dropdown-option) {
  padding: 9px 14px;
  font-size: 13px;
  color: #374151;
  font-family: inherit;
}
.coa-select :deep(.vs__dropdown-option--highlight) {
  background: #f0fdfa;
  color: #0f766e;
}
.coa-select :deep(.vs__clear) {
  color: #9ca3af;
}
.coa-select :deep(.vs__open-indicator) {
  color: #9ca3af;
}

/* ─── SHARED ─────────────────────────────────────────────── */
.pos { color: #059669; }
.neg { color: #dc2626; }

/* ─── RESPONSIVE ─────────────────────────────────────────── */
@media (max-width: 1200px) {
  .kpi-strip { grid-template-columns: repeat(3, 1fr); }
  .kpi-saldo { grid-column: span 2; }
}
@media (max-width: 768px) {
  .page-header { padding: 18px 20px; }
  .kpi-strip { grid-template-columns: repeat(2, 1fr); }
  .kpi-saldo { grid-column: span 2; }
  .filter-inner { flex-direction: column; align-items: stretch; }
  .filter-field { flex: auto; min-width: auto; }
  .filter-actions { flex-direction: row; }
  .card-grid { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .kpi-strip { grid-template-columns: 1fr; }
  .kpi-saldo { grid-column: span 1; }
}
</style>
