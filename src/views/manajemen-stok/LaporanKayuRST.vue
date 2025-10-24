<template>
  <DashboardLayout>
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge-report">
            <span class="report-icon">🪚</span>
          </div>
          <div class="header-text">
            <h1 class="page-title">Laporan Stok Kayu RST</h1>
            <p class="page-subtitle">Daftar stok untuk kategori Kayu RST.</p>
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

    <div v-else class="content-card report-card">
      <div class="card-header-report">
        <div class="report-header-left">
          <span class="header-icon">📋</span>
          <h2 class="card-title">Daftar Stok Kayu RST</h2>
        </div>
        <div class="report-info">
          <span class="info-badge">{{ reportData.length }} Items</span>
        </div>
      </div>

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
                      {{ searchQuery ? 'Tidak ada hasil pencarian.' : 'Tidak ada data stok.' }}
                    </p>
                  </div>
                </td>
              </tr>
              <tr v-for="(item, index) in reportData" :key="item.id" class="data-row">
                <td class="td-no">
                  <span class="row-number">{{
                    pagination
                      ? (pagination.current_page - 1) * pagination.per_page + index + 1
                      : index + 1
                  }}</span>
                </td>
                <td class="td-kode">
                  <span class="code-badge">{{ item.code }}</span>
                </td>
                <td class="td-nama">
                  <div class="item-info">
                    <span class="item-icon">🌳</span>
                    <span class="item-name">{{ item.name }}</span>
                  </div>
                </td>
                <td class="td-kategori">
                  <span class="badge-category">{{ item.category?.name || 'N/A' }}</span>
                </td>
                <td class="td-satuan">
                  <span class="badge-unit">{{ item.unit?.name || 'N/A' }}</span>
                </td>
                <td class="td-stok">
                  <span class="stock-value">{{ parseInt(item.stock) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

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
import { ref, onMounted, computed } from 'vue'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useToast } from 'vue-toastification'

const loading = ref(true)
const reportData = ref([])
const pagination = ref(null)
const searchQuery = ref('')
const perPage = ref(50)
const currentPage = ref(1)
let searchTimeout = null
const toast = useToast()

const fetchReportData = async () => {
  loading.value = true
  try {
    const params = {
      categories: 'Kayu RST',
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
  } catch (error) {
    toast.error('Gagal memuat data laporan.')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchReportData()
  }, 500)
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  fetchReportData()
}

const handlePerPageChange = () => {
  currentPage.value = 1
  fetchReportData()
}

const goToPage = (page) => {
  if (page < 1 || page > pagination.value.last_page) return
  currentPage.value = page
  fetchReportData()
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

onMounted(fetchReportData)
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  padding: 32px 36px;
  border-radius: 24px;
  margin-bottom: 24px;
  box-shadow: 0 12px 40px rgba(13, 148, 136, 0.25);
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15), transparent);
  border-radius: 50%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
}

.icon-badge-report {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(20px);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.report-icon {
  font-size: 36px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.page-title {
  font-size: 30px;
  font-weight: 900;
  margin: 0 0 6px 0;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 15px;
  opacity: 0.95;
  margin: 0;
  font-weight: 500;
}

.header-stats {
  display: flex;
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 16px 24px;
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: white;
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.9;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 24px;
  font-weight: 900;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 32px;
}

.loading-animation {
  position: relative;
}

.spinner {
  width: 70px;
  height: 70px;
  border: 6px solid #f0f0f0;
  border-top-color: #0d9488;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;
}

.loading-dots span {
  width: 10px;
  height: 10px;
  background: #0d9488;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}
.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-text {
  font-size: 18px;
  color: #64748b;
  font-weight: 700;
}

.content-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 2px solid #f0f0f0;
}

.card-header-report {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, #ccfbf1, #99f6e4);
  border-bottom: 2px solid #5eead4;
}

.report-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.card-title {
  font-size: 20px;
  font-weight: 900;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.5px;
}

.report-info {
  display: flex;
  gap: 12px;
}

.info-badge {
  display: inline-block;
  padding: 8px 16px;
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: white;
  border-radius: 12px;
  font-weight: 800;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}

.card-filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: white;
  border-bottom: 2px solid #f3f4f6;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-left {
  flex: 1;
  min-width: 300px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  font-size: 20px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 14px 50px 14px 50px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.search-input:focus {
  outline: none;
  border-color: #0d9488;
  background: white;
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
}

.clear-btn {
  position: absolute;
  right: 12px;
  width: 28px;
  height: 28px;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: #dc2626;
  transform: rotate(90deg);
}

.filter-right {
  display: flex;
  gap: 16px;
  align-items: center;
}

.per-page-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.per-page-label {
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
}

.per-page-select {
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.per-page-select:focus {
  outline: none;
  border-color: #0d9488;
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 800px;
}

.data-table thead {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
}

.data-table th {
  padding: 18px 20px;
  text-align: left;
  color: white;
  font-weight: 900;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.th-no {
  width: 8%;
  text-align: center;
}
.th-kode {
  width: 12%;
}
.th-nama {
  width: 30%;
}
.th-kategori {
  width: 18%;
}
.th-satuan {
  width: 12%;
}
.th-stok {
  width: 20%;
  text-align: center;
}

.data-row {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.25s ease;
}

.data-row:hover {
  background: linear-gradient(135deg, #ccfbf1, #99f6e4);
  transform: scale(1.002);
  box-shadow: 0 2px 12px rgba(13, 148, 136, 0.1);
}

.data-table td {
  padding: 16px 20px;
  vertical-align: middle;
}

.td-no {
  text-align: center;
}

.row-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  color: #475569;
  border-radius: 8px;
  font-weight: 900;
  font-size: 14px;
}

.code-badge {
  display: inline-block;
  padding: 6px 12px;
  background: linear-gradient(135deg, #99f6e4, #5eead4);
  color: #115e59;
  border-radius: 10px;
  font-weight: 800;
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-icon {
  font-size: 20px;
}

.item-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 15px;
}

.badge-category {
  display: inline-block;
  padding: 6px 14px;
  background: linear-gradient(135deg, #ccfbf1, #99f6e4);
  color: #0f766e;
  border-radius: 12px;
  font-weight: 800;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-unit {
  display: inline-block;
  padding: 6px 14px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: #3730a3;
  border-radius: 12px;
  font-weight: 700;
  font-size: 12px;
}

.td-stok {
  text-align: center;
}

.stock-value {
  display: inline-block;
  padding: 10px 18px;
  background: linear-gradient(135deg, #99f6e4, #5eead4);
  color: #115e59;
  border-radius: 12px;
  font-weight: 900;
  font-size: 17px;
  min-width: 70px;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.2);
}

.empty-row {
  background: #f9fafb;
}

.empty-cell {
  padding: 60px 20px !important;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-icon {
  font-size: 64px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  color: #9ca3af;
  font-weight: 600;
  margin: 0;
}

.card-footer-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, #ccfbf1, #99f6e4);
  border-top: 2px solid #5eead4;
  gap: 20px;
  flex-wrap: wrap;
}

.pagination-info {
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
}

.pagination-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.pagination-btn {
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 42px;
}

.pagination-btn:hover:not(:disabled) {
  background: #0d9488;
  color: white;
  border-color: #0d9488;
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-btn.active {
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: white;
  border-color: #0d9488;
  box-shadow: 0 4px 14px rgba(13, 148, 136, 0.3);
}

@media (max-width: 768px) {
  .page-header {
    padding: 24px 20px;
  }
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-stats {
    width: 100%;
  }
  .stat-card {
    flex: 1;
  }
  .card-header-report {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .card-filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-left {
    min-width: 100%;
  }
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
  .card-footer-pagination {
    flex-direction: column;
    text-align: center;
  }
}
</style>
