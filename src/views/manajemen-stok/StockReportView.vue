<template>
  <DashboardLayout>
    <!-- Page Header dengan Gradient -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">📊 Laporan Stok Barang</h1>
        <p class="page-subtitle">
          Pantau ketersediaan stok produk jadi dan bahan baku secara real-time
        </p>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="content-card">
      <div class="card-header">
        <div class="header-left">
          <div class="header-icon">📦</div>
          <div>
            <h2 class="card-title">Stok Saat Ini</h2>
            <p class="card-subtitle">Total {{ totalItems }} item barang</p>
          </div>
        </div>

        <!-- ✅ FILTER & SEARCH BOX -->
        <div class="filter-search-container">
          <!-- Filter Dropdown -->
          <div class="filter-box">
            <span class="filter-icon">🔖</span>
            <select v-model="filterType" class="filter-select">
              <option value="">📦 Semua Barang</option>
              <option value="bahan_baku">🏭 Bahan Baku</option>
              <option value="produk_jadi">✅ Produk Jadi</option>
            </select>
          </div>

          <!-- Search Box -->
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Cari barang (kode/nama)..."
              class="search-input"
              v-model="searchQuery"
            />
          </div>
        </div>
      </div>

      <!-- Table Wrapper -->
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-code">Kode</th>
              <th class="th-name">Nama Barang</th>
              <th class="th-type">Jenis Barang</th>
              <th class="th-stock">Stok</th>
            </tr>
          </thead>
          <tbody>
            <!-- Empty State -->
            <tr v-if="stockItems.length === 0" class="empty-row">
              <td colspan="4">
                <div class="empty-state">
                  <span class="empty-icon">📭</span>
                  <p class="empty-text">Tidak ada data stok</p>
                  <p class="empty-hint">
                    {{
                      filterType
                        ? 'Tidak ada barang dengan filter yang dipilih'
                        : 'Silakan tambahkan data stok melalui menu Stok Adjustment'
                    }}
                  </p>
                </div>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr v-for="(item, index) in stockItems" :key="index" class="data-row">
              <td class="td-code">
                <span class="code-badge">{{ item.code }}</span>
              </td>
              <td class="td-name">{{ item.name }}</td>
              <td class="td-type">
                <span class="type-badge" :class="getBadgeClass(item.category?.name)">
                  {{ item.category ? item.category.name : 'N/A' }}
                </span>
              </td>
              <td class="td-stock">
                <span class="stock-value" :class="getStockClass(item.stock)">
                  {{ formatStock(item.stock) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <PaginationComponent
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="totalItems"
          :per-page="perPage"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import PaginationComponent from '../../components/BasePagination.vue'

const stockItems = ref([])
const searchQuery = ref('')
const filterType = ref('') // ✅ TAMBAH: Filter jenis barang

const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const perPage = ref(15)

// ✅ FETCH DATA dengan Filter
const fetchStockReport = async () => {
  try {
    const params = {
      page: currentPage.value,
      search: searchQuery.value || undefined,
      type: filterType.value || undefined, // ✅ Kirim filter type
    }
    const response = await apiClient.get('/stock-report', { params })

    stockItems.value = response.data.data.data
    totalPages.value = response.data.data.last_page
    totalItems.value = response.data.data.total
    currentPage.value = response.data.data.current_page
    perPage.value = response.data.data.per_page

    console.log('📊 Stock Report Data:', stockItems.value)
  } catch (error) {
    console.error('❌ Gagal mengambil laporan stok:', error)
  }
}

// ✅ Format stock dengan null check
const formatStock = (value) => {
  if (value === null || value === undefined || value === '') {
    return '0'
  }

  const numValue = Number(value)

  if (isNaN(numValue)) {
    return '0'
  }

  return numValue.toLocaleString('id-ID')
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchStockReport()
}

// ✅ PERBAIKAN: Deteksi badge berdasarkan nama category
const getBadgeClass = (categoryName) => {
  if (!categoryName) return 'badge-default'

  const name = categoryName.toLowerCase()

  // Produk Jadi
  if (name.includes('produk jadi')) {
    return 'badge-product'
  }

  // Bahan Baku (termasuk Bahan Penolong, Bahan Operasional)
  if (name.includes('bahan') || name.includes('penolong') || name.includes('operasional')) {
    return 'badge-material'
  }

  return 'badge-default'
}

// ✅ Get stock class dengan null check
const getStockClass = (stock) => {
  const qty = Number(stock) || 0
  if (qty === 0) return 'stock-empty'
  if (qty < 10) return 'stock-low'
  if (qty < 50) return 'stock-medium'
  return 'stock-high'
}

// ✅ WATCH: Reset page saat search atau filter berubah
watch([searchQuery, filterType], () => {
  currentPage.value = 1
  fetchStockReport()
})

onMounted(fetchStockReport)
</script>

<style scoped>
/* ===== PAGE HEADER ===== */
.page-header {
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  padding: 32px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.header-content {
  color: white;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-subtitle {
  font-size: 14px;
  opacity: 0.95;
  margin: 0;
  font-weight: 400;
}

/* ===== CONTENT CARD ===== */
.content-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
}

.content-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(to right, #f8f9fa, #fff);
  border-bottom: 2px solid #e9ecef;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #212529;
  margin: 0 0 4px 0;
}

.card-subtitle {
  font-size: 13px;
  color: #6c757d;
  margin: 0;
}

/* ===== FILTER & SEARCH CONTAINER ===== */
.filter-search-container {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

/* ===== FILTER BOX ===== */
.filter-box {
  position: relative;
  min-width: 220px;
  display: flex;
  align-items: center;
}

.filter-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  z-index: 1;
  pointer-events: none;
}

.filter-select {
  width: 100%;
  padding: 12px 16px 12px 42px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
}

.filter-select:hover {
  border-color: #4caf50;
}

.filter-select:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.filter-select option {
  padding: 10px;
  font-weight: 600;
}

/* ===== SEARCH BOX ===== */
.search-box {
  position: relative;
  min-width: 300px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 42px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

/* ===== TABLE ===== */
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: linear-gradient(to bottom, #fafafa, #f5f5f5);
  border-bottom: 2px solid #e0e0e0;
}

.data-table th {
  padding: 18px 24px;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  color: #424242;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.th-code {
  width: 120px;
}

.th-name {
  width: auto;
}

.th-type {
  width: 160px;
}

.th-stock {
  width: 120px;
  text-align: right;
}

.data-table td {
  padding: 16px 24px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.data-row {
  transition: all 0.2s ease;
}

.data-row:hover {
  background: #f8faf9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* ===== CODE BADGE ===== */
.code-badge {
  display: inline-block;
  padding: 6px 12px;
  background: #e3f2fd;
  color: #1565c0;
  font-weight: 600;
  font-size: 13px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
}

/* ===== TYPE BADGE ===== */
.type-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

.badge-product {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.badge-material {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  color: #e65100;
  border: 1px solid #ffcc80;
}

.badge-default {
  background: #f5f5f5;
  color: #616161;
  border: 1px solid #e0e0e0;
}

/* ===== STOCK VALUE ===== */
.td-stock {
  text-align: right;
}

.stock-value {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 15px;
}

.stock-high {
  background: #e8f5e9;
  color: #2e7d32;
}

.stock-medium {
  background: #fff8e1;
  color: #f57c00;
}

.stock-low {
  background: #ffebee;
  color: #c62828;
}

.stock-empty {
  background: #fafafa;
  color: #9e9e9e;
  font-style: italic;
}

/* ===== EMPTY STATE ===== */
.empty-row {
  background: #fafafa;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: #616161;
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: #9e9e9e;
  margin: 0;
}

/* ===== PAGINATION ===== */
.pagination-wrapper {
  padding: 20px 32px;
  border-top: 2px solid #f0f0f0;
  background: #fafafa;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .page-header {
    padding: 24px 20px;
  }

  .page-title {
    font-size: 22px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-search-container {
    width: 100%;
    flex-direction: column;
  }

  .filter-box {
    width: 100%;
    min-width: auto;
  }

  .search-box {
    width: 100%;
    min-width: auto;
  }

  .data-table th,
  .data-table td {
    padding: 12px 16px;
    font-size: 13px;
  }

  .th-stock,
  .td-stock {
    text-align: left;
  }

  .code-badge {
    padding: 4px 8px;
    font-size: 12px;
  }

  .stock-value {
    padding: 6px 12px;
    font-size: 14px;
  }

  .pagination-wrapper {
    padding: 16px 20px;
  }
}
</style>
