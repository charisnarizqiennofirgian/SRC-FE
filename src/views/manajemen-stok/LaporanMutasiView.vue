<template>
  <DashboardLayout>
    <!-- PAGE HEADER -->
    <div class="page-header-report">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-report">
            <span class="report-icon">📊</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-report">Laporan Mutasi Stok</h1>
            <p class="page-subtitle-report">
              Pantau pergerakan stok barang dengan detail transaksi masuk dan keluar yang lengkap.
            </p>
          </div>
        </div>
        <div class="header-right-section">
          <div class="stats-badge">
            <span class="stats-icon">📦</span>
            <div class="stats-content">
              <div class="stats-value">{{ pagination.total }}</div>
              <div class="stats-label">Total Transaksi</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FILTER SECTION -->
    <div class="filter-card">
      <div class="filter-header">
        <span class="filter-icon">🔍</span>
        <h3 class="filter-title">Filter & Pencarian</h3>
      </div>

      <div class="filter-grid">
        <!-- SEARCH BY PRODUK/CODE -->
        <div class="filter-group full-width">
          <label class="filter-label">Cari Produk / Kode</label>
          <div class="search-wrapper">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              v-model="filters.search"
              @input="onSearchChange"
              class="search-input"
              placeholder="Ketik nama atau kode produk..."
            />
            <button v-if="filters.search" @click="clearSearch" class="btn-clear-search">✕</button>
          </div>
        </div>

        <!-- DATE RANGE -->
        <div class="filter-group">
          <label class="filter-label">Dari Tanggal</label>
          <div class="input-wrapper-icon">
            <span class="input-icon">📅</span>
            <input type="date" v-model="filters.start_date" class="form-input-modern" />
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">Sampai Tanggal</label>
          <div class="input-wrapper-icon">
            <span class="input-icon">📅</span>
            <input type="date" v-model="filters.end_date" class="form-input-modern" />
          </div>
        </div>

        <!-- WAREHOUSE FILTER -->
        <div class="filter-group">
          <label class="filter-label">Gudang</label>
          <div class="select-wrapper-modern">
            <span class="select-icon">🏭</span>
            <select v-model="filters.warehouse_id" class="form-select-modern">
              <option value="">Semua Gudang</option>
              <option v-for="wh in warehouses" :key="wh.id" :value="wh.id">
                {{ wh.name }}
              </option>
            </select>
            <span class="select-arrow">▼</span>
          </div>
        </div>

        <!-- TRANSACTION TYPE -->
        <div class="filter-group">
          <label class="filter-label">Tipe Transaksi</label>
          <div class="select-wrapper-modern">
            <span class="select-icon">📋</span>
            <select v-model="filters.transaction_type" class="form-select-modern">
              <option value="">Semua Tipe</option>
              <option v-for="t in transactionTypes" :key="t.value" :value="t.value">
                {{ t.label }}
              </option>
            </select>
            <span class="select-arrow">▼</span>
          </div>
        </div>
      </div>

      <div class="filter-actions">
        <button @click="resetFilters" class="btn-reset-filter">
          <span class="btn-icon">♻️</span>
          <span>Reset Filter</span>
        </button>
        <button @click="fetchLogs" class="btn-apply-filter">
          <span class="btn-icon">🔍</span>
          <span>Tampilkan Data</span>
        </button>
      </div>
    </div>

    <!-- LOADING STATE -->
    <div v-if="isLoading" class="loading-state">
      <span class="loading-icon">⏳</span>
      <span class="loading-text">Memuat data...</span>
    </div>

    <!-- REPORT TABLE -->
    <div v-else class="report-table-card">
      <div class="table-header">
        <div class="table-title-wrapper">
          <span class="table-icon">📋</span>
          <h3 class="table-title">Data Mutasi Stok</h3>
        </div>
        <div class="pagination-info">
          Menampilkan {{ pagination.from }} - {{ pagination.to }} dari {{ pagination.total }} data
        </div>
      </div>

      <div v-if="logs.length === 0" class="empty-state-card">
        <div class="empty-icon">📭</div>
        <div class="empty-title">Tidak Ada Data</div>
        <div class="empty-message">Tidak ada transaksi ditemukan untuk filter yang dipilih.</div>
      </div>

      <div v-else class="table-wrapper">
        <table class="report-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>No. Bukti</th>
              <th>Nama Item</th>
              <th>Kode</th>
              <th>Tipe</th>
              <th>Gudang</th>
              <th class="col-center">Masuk</th>
              <th class="col-center">Keluar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id">
              <td class="cell-date">{{ log.tanggal }}</td>
              <td class="cell-bukti">{{ log.no_bukti }}</td>
              <td class="cell-product">
                <span class="product-dot"></span>
                {{ log.nama_item }}
              </td>
              <td class="cell-code">
                <span class="code-badge">{{ log.kode_item || '-' }}</span>
              </td>
              <td class="cell-type">
                <span :class="getTipeBadgeClass(log.tipe)">
                  {{ log.tipe }}
                </span>
              </td>
              <td class="cell-warehouse">{{ log.gudang }}</td>
              <td class="cell-in">
                <span v-if="log.masuk" class="qty-badge-in">+{{ log.masuk }}</span>
                <span v-else class="qty-empty">-</span>
              </td>
              <td class="cell-out">
                <span v-if="log.keluar" class="qty-badge-out">-{{ log.keluar }}</span>
                <span v-else class="qty-empty">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION -->
      <div v-if="logs.length > 0" class="table-footer">
        <div class="pagination-summary">
          {{ pagination.from }} - {{ pagination.to }} dari {{ pagination.total }} data
        </div>
        <div class="pagination-controls">
          <button
            @click="goToPage(pagination.currentPage - 1)"
            :disabled="pagination.currentPage === 1"
            class="btn-page"
          >
            ‹ Prev
          </button>
          <span class="page-indicator">
            {{ pagination.currentPage }} / {{ pagination.lastPage }}
          </span>
          <button
            @click="goToPage(pagination.currentPage + 1)"
            :disabled="pagination.currentPage === pagination.lastPage"
            class="btn-page"
          >
            Next ›
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from '@/api/axios'
import DashboardLayout from '@/components/DashboardLayout.vue'

const logs = ref([])
const warehouses = ref([])
const transactionTypes = ref([])
const isLoading = ref(false)

const today = new Date().toISOString().split('T')[0]

const filters = reactive({
  start_date: today,
  end_date: today,
  warehouse_id: '',
  transaction_type: '',
  search: '', // ✅ NEW: Search field
})

const pagination = reactive({
  currentPage: 1,
  lastPage: 1,
  from: 0,
  to: 0,
  total: 0,
})

let searchTimeout = null

const onSearchChange = () => {
  // Debounce search
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchLogs(1)
  }, 500)
}

const clearSearch = () => {
  filters.search = ''
  fetchLogs(1)
}

const fetchLogs = async (page = 1) => {
  isLoading.value = true

  try {
    const params = {
      page,
      per_page: 50,
      ...filters,
    }

    // Remove empty params
    Object.keys(params).forEach((key) => {
      if (params[key] === '') delete params[key]
    })

    const response = await axios.get('/inventory-logs', { params })

    if (response.data.success) {
      const data = response.data.data
      logs.value = data.data || []

      pagination.currentPage = data.current_page
      pagination.lastPage = data.last_page
      pagination.from = data.from || 0
      pagination.to = data.to || 0
      pagination.total = data.total || 0
    }
  } catch (error) {
    console.error('Error fetching logs:', error)
  } finally {
    isLoading.value = false
  }
}

const fetchWarehouses = async () => {
  try {
    const response = await axios.get('/inventory-logs/warehouses')
    if (response.data.success) {
      warehouses.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching warehouses:', error)
  }
}

const fetchTransactionTypes = async () => {
  try {
    const response = await axios.get('/inventory-logs/transaction-types')
    if (response.data.success) {
      transactionTypes.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching transaction types:', error)
  }
}

const resetFilters = () => {
  filters.start_date = today
  filters.end_date = today
  filters.warehouse_id = ''
  filters.transaction_type = ''
  filters.search = ''
  fetchLogs(1)
}

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.lastPage) {
    fetchLogs(page)
  }
}

const getTipeBadgeClass = (tipe) => {
  const classes = {
    BELI: 'type-badge-green',
    JUAL: 'type-badge-orange',
    PROD: 'type-badge-blue',
    PAKAI: 'type-badge-red',
    ADJUST: 'type-badge-purple',
    MASUK: 'type-badge-teal',
    KELUAR: 'type-badge-yellow',
  }
  return classes[tipe] || 'type-badge-gray'
}

onMounted(() => {
  fetchWarehouses()
  fetchTransactionTypes()
  fetchLogs()
})
</script>

<style scoped>
/* ========== HEADER ========== */
.page-header-report {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  padding: 2.5rem 3rem;
  border-radius: 24px;
  margin-bottom: 2.5rem;
  box-shadow: 0 12px 48px rgba(99, 102, 241, 0.35);
}

.header-content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2.5rem;
}

.header-left-section {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  flex: 1;
}

.icon-badge-report {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.report-icon {
  font-size: 2.75rem;
}

.header-text-content {
  flex: 1;
}

.page-title-report {
  font-size: 2.25rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0 0 0.6rem 0;
  letter-spacing: -0.6px;
}

.page-subtitle-report {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.05rem;
  margin: 0;
  font-weight: 500;
  line-height: 1.6;
}

.header-right-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stats-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stats-icon {
  font-size: 2rem;
}

.stats-content {
  text-align: left;
}

.stats-value {
  font-size: 1.75rem;
  font-weight: 900;
  color: #ffffff;
  line-height: 1;
}

.stats-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 600;
  margin-top: 0.25rem;
}

/* ========== FILTER CARD ========== */
.filter-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 6px 24px rgba(15, 23, 42, 0.1);
  border: 1px solid #f3f4f6;
  padding: 2rem 2.5rem;
  margin-bottom: 2.5rem;
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.75rem;
  padding-bottom: 1.25rem;
  border-bottom: 2px solid #f3f4f6;
}

.filter-icon {
  font-size: 1.75rem;
}

.filter-title {
  font-size: 1.35rem;
  font-weight: 900;
  color: #111827;
  margin: 0;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.75rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group.full-width {
  grid-column: 1 / -1;
}

.filter-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.75rem;
}

/* SEARCH INPUT */
.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1.25rem;
  font-size: 1.2rem;
  pointer-events: none;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 1rem 3.5rem 1rem 3.5rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 14px;
  font-size: 1.05rem;
  font-weight: 600;
  transition: all 0.25s ease;
  background: white;
  color: #111827;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
  transform: translateY(-1px);
}

.btn-clear-search {
  position: absolute;
  right: 1.25rem;
  padding: 0.35rem 0.6rem;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 6px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.btn-clear-search:hover {
  background: #fecaca;
  transform: scale(1.1);
}

/* FORM INPUTS */
.input-wrapper-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1.25rem;
  font-size: 1.2rem;
  pointer-events: none;
  z-index: 1;
}

.form-input-modern {
  width: 100%;
  padding: 1rem 3.5rem 1rem 3.5rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 14px;
  font-size: 1.05rem;
  font-weight: 600;
  transition: all 0.25s ease;
  background: white;
  color: #111827;
}

.form-input-modern:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
  transform: translateY(-1px);
}

.select-wrapper-modern {
  position: relative;
  display: flex;
  align-items: center;
}

.select-icon {
  position: absolute;
  left: 1.25rem;
  font-size: 1.2rem;
  pointer-events: none;
  z-index: 1;
}

.form-select-modern {
  width: 100%;
  padding: 1rem 3.5rem 1rem 3.5rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 14px;
  font-size: 1.05rem;
  font-weight: 700;
  transition: all 0.25s ease;
  background: white;
  color: #111827;
  appearance: none;
  cursor: pointer;
}

.form-select-modern:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
  transform: translateY(-1px);
}

.select-arrow {
  position: absolute;
  right: 1.25rem;
  font-size: 0.8rem;
  color: #6b7280;
  pointer-events: none;
}

/* FILTER ACTIONS */
.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f3f4f6;
}

.btn-reset-filter,
.btn-apply-filter {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.9rem 1.75rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  border: none;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  font-size: 1.1rem;
}

.btn-reset-filter {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #374151;
  border: 2px solid #d1d5db;
}

.btn-reset-filter:hover {
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn-apply-filter {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.btn-apply-filter:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(99, 102, 241, 0.4);
}

/* ========== LOADING ========== */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem;
  background: white;
  border-radius: 24px;
  box-shadow: 0 6px 24px rgba(15, 23, 42, 0.1);
  border: 1px solid #f3f4f6;
}

.loading-icon {
  font-size: 2.5rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1.05rem;
  font-weight: 700;
  color: #6b7280;
}

/* ========== REPORT TABLE ========== */
.report-table-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 6px 24px rgba(15, 23, 42, 0.1);
  border: 1px solid #f3f4f6;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2.5rem;
  background: linear-gradient(135deg, #f9fafb, #f3f4f6);
  border-bottom: 2px solid #e5e7eb;
}

.table-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.table-icon {
  font-size: 1.75rem;
}

.table-title {
  font-size: 1.35rem;
  font-weight: 900;
  color: #111827;
  margin: 0;
}

.pagination-info {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 600;
}

/* EMPTY STATE */
.empty-state-card {
  text-align: center;
  padding: 4rem 2.5rem;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  margin: 2rem;
  border-radius: 18px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #374151;
  margin-bottom: 0.6rem;
}

.empty-message {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 600;
}

/* TABLE */
.table-wrapper {
  overflow-x: auto;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.report-table thead {
  background: linear-gradient(135deg, #f9fafb, #f3f4f6);
}

.report-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 800;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.report-table .col-center {
  text-align: center;
}

.report-table td {
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.report-table tbody tr:hover {
  background: #fafafa;
}

.cell-date {
  color: #6b7280;
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;
}

.cell-bukti {
  color: #374151;
  font-weight: 700;
  font-size: 0.9rem;
}

.cell-product {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 700;
  color: #111827;
}

.product-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #6366f1;
  flex-shrink: 0;
}

.cell-code {
  text-align: center;
}

.code-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  background: #f3f4f6;
  color: #374151;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 800;
  font-family: monospace;
}

.cell-type {
  text-align: center;
}

/* TYPE BADGES */
.type-badge-green {
  display: inline-block;
  padding: 0.4rem 0.85rem;
  background: #d1fae5;
  color: #065f46;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
}

.type-badge-orange {
  display: inline-block;
  padding: 0.4rem 0.85rem;
  background: #fed7aa;
  color: #9a3412;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
}

.type-badge-blue {
  display: inline-block;
  padding: 0.4rem 0.85rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
}

.type-badge-red {
  display: inline-block;
  padding: 0.4rem 0.85rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
}

.type-badge-purple {
  display: inline-block;
  padding: 0.4rem 0.85rem;
  background: #f3e8ff;
  color: #6b21a8;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
}

.type-badge-teal {
  display: inline-block;
  padding: 0.4rem 0.85rem;
  background: #ccfbf1;
  color: #115e59;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
}

.type-badge-yellow {
  display: inline-block;
  padding: 0.4rem 0.85rem;
  background: #fef3c7;
  color: #854d0e;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
}

.type-badge-gray {
  display: inline-block;
  padding: 0.4rem 0.85rem;
  background: #f3f4f6;
  color: #374151;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
}

.cell-warehouse {
  color: #6b7280;
  font-weight: 600;
  font-size: 0.95rem;
}

.cell-in,
.cell-out {
  text-align: center;
}

.qty-badge-in {
  display: inline-block;
  padding: 0.4rem 0.85rem;
  background: #d1fae5;
  color: #065f46;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 900;
}

.qty-badge-out {
  display: inline-block;
  padding: 0.4rem 0.85rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 900;
}

.qty-empty {
  color: #d1d5db;
  font-weight: 700;
}

/* PAGINATION */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2.5rem;
  background: #fafafa;
  border-top: 2px solid #e5e7eb;
}

.pagination-summary {
  font-size: 0.95rem;
  color: #6b7280;
  font-weight: 600;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-page {
  padding: 0.6rem 1.25rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-weight: 700;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #6366f1;
  color: #6366f1;
}

.btn-page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-indicator {
  padding: 0.6rem 1rem;
  font-weight: 800;
  color: #111827;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 900px) {
  .page-header-report {
    padding: 2rem;
  }

  .header-content-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-card {
    padding: 1.5rem;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    flex-direction: column;
  }

  .btn-reset-filter,
  .btn-apply-filter {
    width: 100%;
    justify-content: center;
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .table-footer {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
