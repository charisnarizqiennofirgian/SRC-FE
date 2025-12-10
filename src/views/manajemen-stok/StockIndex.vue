<template>
  <DashboardLayout>
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge-report">
            <span class="report-icon">📦</span>
          </div>
          <div class="header-text">
            <h1 class="page-title">Laporan Stok</h1>
            <p class="page-subtitle">
              Ringkasan stok per kategori & gudang (Kayu Log, RST, Produk Jadi, Bahan Operasional).
            </p>
          </div>
        </div>
        <div class="header-stats">
          <div class="stat-card">
            <span class="stat-icon">📊</span>
            <div class="stat-content">
              <p class="stat-label">Total Item</p>
              <p class="stat-value">{{ pagination ? pagination.total : reportData.length }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs kategori -->
    <div class="tabs-wrapper">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        @click="setTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="loading-animation">
        <div class="spinner"></div>
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <p class="loading-text">Memuat laporan...</p>
    </div>

    <!-- Konten -->
    <div v-else class="content-card report-card">
      <div class="card-header-report">
        <div class="report-header-left">
          <span class="header-icon">📋</span>
          <h2 class="card-title">Daftar Stok - {{ currentCategory() }}</h2>
        </div>
        <div class="report-info">
          <span class="info-badge">{{ reportData.length }} Items</span>
        </div>
      </div>

      <!-- filter sederhana (search + per_page) -->
      <div class="card-filter-section">
        <div class="filter-left">
          <div class="search-wrapper">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              placeholder="Cari nama atau kode barang..."
              class="search-input"
            />
            <button v-if="searchQuery" @click="clearSearch" class="clear-btn">✕</button>
          </div>
        </div>
        <div class="filter-right">
          <div class="per-page-selector">
            <label class="per-page-label">Tampilkan:</label>
            <select v-model="perPage" @change="handlePerPageChange" class="per-page-select">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tabel -->
      <div class="card-body-table">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th class="th-no">No</th>
                <th class="th-kode">Kode</th>
                <th class="th-nama">Nama Barang</th>
                <th class="th-kategori">Kategori</th>
                <th class="th-satuan">Satuan</th>
                <th class="th-stok">Stok Saat Ini</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="reportData.length === 0" class="empty-row">
                <td colspan="6" class="empty-cell">
                  <div class="empty-state">
                    <span class="empty-icon">📭</span>
                    <p class="empty-text">
                      {{
                        searchQuery
                          ? 'Tidak ada hasil pencarian.'
                          : 'Tidak ada data stok untuk kategori ini.'
                      }}
                    </p>
                  </div>
                </td>
              </tr>
              <tr v-for="(item, index) in reportData" :key="item.id" class="data-row">
                <td class="td-no">
                  <span class="row-number">
                    {{
                      pagination
                        ? (pagination.current_page - 1) * pagination.per_page + index + 1
                        : index + 1
                    }}
                  </span>
                </td>
                <td class="td-kode">
                  <span class="code-badge">{{ item.code }}</span>
                </td>
                <td class="td-nama">
                  <div class="item-info">
                    <span class="item-icon">📦</span>
                    <span class="item-name">{{ item.name }}</span>
                  </div>
                </td>
                <td class="td-kategori">
                  <span class="badge-category">{{ item.category?.name || 'N/A' }}</span>
                </td>
                <td class="td-satuan">
                  <span class="badge-unit">{{ item.unit?.name || 'N/A' }}</span>
                </td>

                <!-- stok per gudang + total -->
                <td class="td-stok">
                  <div v-if="item.stocks && item.stocks.length">
                    <div v-for="stock in item.stocks" :key="stock.id" class="stock-per-warehouse">
                      <span class="warehouse-name">
                        {{ stock.warehouse?.name || stock.warehouse?.code || 'Gudang' }}:
                      </span>
                      <span class="stock-qty">
                        {{ formatQty(stock.quantity) }}
                      </span>
                    </div>
                    <div class="stock-total">Total: {{ formatQty(totalQty(item.stocks)) }}</div>
                  </div>
                  <div v-else>
                    <span class="stock-value">{{ parseInt(item.stock) }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- pagination -->
      <div v-if="pagination && pagination.last_page > 1" class="card-footer-pagination">
        <div class="pagination-info">
          Menampilkan {{ pagination.from || 0 }} - {{ pagination.to || 0 }} dari
          {{ pagination.total }} data
        </div>
        <div class="pagination-controls">
          <button
            @click="goToPage(pagination.current_page - 1)"
            :disabled="pagination.current_page === 1"
            class="pagination-btn pagination-prev"
          >
            ← Prev
          </button>
          <button
            v-for="page in paginationPages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'pagination-btn',
              'pagination-number',
              { active: page === pagination.current_page },
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="goToPage(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.last_page"
            class="pagination-btn pagination-next"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import DashboardLayout from '../../components/DashboardLayout.vue'
import apiClient from '../../api/axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

const tabs = [
  { key: 'logs', label: 'Kayu Log', category: 'Kayu Log' },
  { key: 'rst', label: 'Kayu RST', category: 'Kayu RST' },
  { key: 'finished', label: 'Produk Jadi', category: 'Produk Jadi' },
  { key: 'operational', label: 'Bahan Operasional', category: 'Bahan Operasional' },
]

const activeTab = ref('logs')
const reportData = ref([])
const loading = ref(false)
const pagination = ref(null)
const searchQuery = ref('')
const perPage = ref(50)
const currentPage = ref(1)
let searchTimeout = null

const currentCategory = () => {
  return tabs.find((t) => t.key === activeTab.value)?.category ?? 'Kayu Log'
}

const fetchReport = async () => {
  loading.value = true
  try {
    const params = {
      categories: currentCategory(),
      per_page: perPage.value,
      page: currentPage.value,
    }
    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    const response = await apiClient.get('/stock-report', { params })

    if (response.data.data.data) {
      reportData.value = response.data.data.data
      pagination.value = {
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
        per_page: response.data.data.per_page,
        total: response.data.data.total,
        from: response.data.data.from,
        to: response.data.data.to,
      }
    } else {
      reportData.value = response.data.data
      pagination.value = null
    }
  } catch (e) {
    toast.error('Gagal memuat laporan stok.')
    console.error(e)
  } finally {
    loading.value = false
  }
}

const setTab = (key) => {
  activeTab.value = key
  currentPage.value = 1
}

watch(activeTab, () => {
  fetchReport()
})

const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchReport()
  }, 500)
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  fetchReport()
}

const handlePerPageChange = () => {
  currentPage.value = 1
  fetchReport()
}

const goToPage = (page) => {
  if (!pagination.value) return
  if (page < 1 || page > pagination.value.last_page) return
  currentPage.value = page
  fetchReport()
}

const paginationPages = computed(() => {
  if (!pagination.value) return []

  const pages = []
  const currentPageNum = pagination.value.current_page
  const lastPageNum = pagination.value.last_page

  if (lastPageNum <= 7) {
    for (let i = 1; i <= lastPageNum; i++) {
      pages.push(i)
    }
  } else {
    if (currentPageNum <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(lastPageNum)
    } else if (currentPageNum >= lastPageNum - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = lastPageNum - 4; i <= lastPageNum; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = currentPageNum - 1; i <= currentPageNum + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(lastPageNum)
    }
  }

  return pages
})

// helper stok per gudang
const formatQty = (val) => {
  if (!val && val !== 0) return 0
  return parseFloat(val).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  })
}

const totalQty = (stocks) => {
  return stocks.reduce((sum, s) => sum + parseFloat(s.quantity || 0), 0)
}

onMounted(fetchReport)
</script>

<style scoped>
/* pakai gaya serupa LaporanKayuLogs + tab */

.page-header {
  margin-bottom: 16px;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.icon-badge-report {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: #fffbeb;
  display: flex;
  align-items: center;
  justify-content: center;
}
.report-icon {
  font-size: 22px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
}
.page-subtitle {
  color: #64748b;
  font-size: 14px;
}
.header-stats {
  display: flex;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f9fafb;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
}
.stat-icon {
  font-size: 18px;
}
.stat-label {
  font-size: 12px;
  color: #6b7280;
}
.stat-value {
  font-size: 16px;
  font-weight: 700;
}

.tabs-wrapper {
  display: flex;
  gap: 8px;
  margin: 16px 0;
}
.tab-btn {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #f9fafb;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.tab-btn.active {
  background: #92400e;
  color: white;
  border-color: #92400e;
}

.content-card.report-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 16px;
}

.card-header-report {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.report-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-icon {
  font-size: 18px;
}
.card-title {
  font-size: 18px;
  font-weight: 600;
}
.info-badge {
  padding: 4px 10px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
}

/* filter */
.card-filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.search-wrapper {
  position: relative;
}
.search-input {
  padding: 6px 26px 6px 26px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  font-size: 13px;
}
.search-icon {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
}
.clear-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
}
.per-page-selector {
  display: flex;
  align-items: center;
  gap: 6px;
}
.per-page-label {
  font-size: 12px;
}
.per-page-select {
  padding: 4px 6px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  font-size: 12px;
}

/* table */
.table-wrapper {
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.data-table thead {
  background: #f9fafb;
}
.data-table th,
.data-table td {
  padding: 8px 10px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}
.th-no {
  width: 40px;
}
.td-no {
  text-align: center;
}
.code-badge {
  padding: 2px 8px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
}
.item-info {
  display: flex;
  align-items: center;
  gap: 6px;
}
.item-icon {
  font-size: 16px;
}
.badge-category,
.badge-unit {
  padding: 2px 8px;
  border-radius: 999px;
  background: #f3f4f6;
  font-size: 12px;
}

/* stok per gudang */
.stock-per-warehouse {
  display: flex;
  justify-content: space-between;
}
.warehouse-name {
  font-size: 12px;
  color: #4b5563;
}
.stock-qty {
  font-weight: 600;
}
.stock-total {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #111827;
}
.stock-value {
  font-weight: 600;
}

/* empty state */
.empty-row .empty-cell {
  text-align: center;
  padding: 24px 0;
}
.empty-icon {
  font-size: 24px;
}
.empty-text {
  color: #6b7280;
  font-size: 13px;
}

/* loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
}
.loading-text {
  font-size: 13px;
  color: #6b7280;
}

/* pagination */
.card-footer-pagination {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination-info {
  font-size: 12px;
  color: #6b7280;
}
.pagination-controls {
  display: flex;
  gap: 4px;
}
.pagination-btn {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  cursor: pointer;
}
.pagination-number.active {
  background: #92400e;
  color: white;
  border-color: #92400e;
}
</style>
