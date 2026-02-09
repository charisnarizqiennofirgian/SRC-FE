<template>
  <DashboardLayout>
    <!-- HEADER -->
    <div class="page-header-stock">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-stock">
            <span class="stock-icon">📦</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-stock">Laporan Stok Inventory</h1>
            <p class="page-subtitle-stock">
              Real-time monitoring stok per kategori & gudang untuk manajemen inventory yang efisien
            </p>
          </div>
        </div>
        <div class="header-stats-section">
          <div class="stat-card-modern">
            <div class="stat-icon-wrapper">
              <span class="stat-icon">📊</span>
            </div>
            <div class="stat-content">
              <p class="stat-label">Total Items</p>
              <p class="stat-value">
                {{ pagination ? pagination.total : filteredReport.length }}
              </p>
            </div>
          </div>
          <div v-if="activeTab === 'logs'" class="stat-card-modern">
            <div class="stat-icon-wrapper">
              <span class="stat-icon">📦</span>
            </div>
            <div class="stat-content">
              <p class="stat-label">Total Kubikasi</p>
              <p class="stat-value">{{ formatKubikasi(totalKubikasiSum) }} m³</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TABS -->
    <div class="tabs-container-modern">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-btn-modern', { active: activeTab === tab.key }]"
        @click="setTab(tab.key)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="activeTab === tab.key" class="tab-indicator">✓</span>
      </button>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="loading-container-modern">
      <div class="loading-content">
        <div class="spinner-modern"></div>
        <p class="loading-text-modern">Memuat data stok...</p>
        <p class="loading-subtext">Mohon tunggu sebentar</p>
      </div>
    </div>

    <!-- CONTENT -->
    <div v-else class="content-card-stock">
      <!-- CARD HEADER -->
      <div class="card-header-stock">
        <div class="header-left-info">
          <div class="header-icon-badge">
            <span class="header-icon">📋</span>
          </div>
          <div class="header-title-section">
            <h2 class="card-title-stock">{{ currentCategory() }}</h2>
            <p class="card-subtitle-stock">Daftar lengkap stok barang</p>
          </div>
        </div>
        <div class="header-right-info">
          <div class="info-badge-count">
            <span class="badge-icon">📦</span>
            <span class="badge-text">{{ filteredReport.length }} Items</span>
          </div>
        </div>
      </div>

      <!-- FILTER -->
      <div class="card-filter-modern">
        <div class="filter-left-group">
          <div class="search-box-modern">
            <span class="search-icon-box">🔍</span>
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              placeholder="Cari kode atau nama barang..."
              class="search-input-modern"
            />
            <button v-if="searchQuery" @click="clearSearch" class="clear-btn-search">
              <span>✕</span>
            </button>
          </div>
        </div>
        <div class="filter-right-group">
          <div class="per-page-control">
            <label class="per-page-label-modern">Gudang:</label>
            <select v-model="selectedWarehouseId" class="per-page-select-modern">
              <option :value="null">Semua Gudang</option>
              <option v-for="wh in warehouses" :key="wh.id" :value="wh.id">
                {{ wh.name }}
              </option>
            </select>
          </div>
          <div v-if="activeTab === 'logs'" class="per-page-control">
            <label class="per-page-label-modern">TPK:</label>
            <select v-model="selectedTpk" class="per-page-select-modern">
              <option :value="null">Semua TPK</option>
              <option v-for="tpk in uniqueTpk" :key="tpk" :value="tpk">
                {{ tpk }}
              </option>
            </select>
          </div>
          <div v-if="activeTab === 'logs'" class="per-page-control">
            <label class="per-page-label-modern">Jenis Kayu:</label>
            <select v-model="selectedJenisKayu" class="per-page-select-modern">
              <option :value="null">Semua Jenis</option>
              <option v-for="jk in uniqueJenisKayu" :key="jk" :value="jk">
                {{ jk }}
              </option>
            </select>
          </div>
          <div v-if="activeTab === 'logs'" class="per-page-control">
            <label class="per-page-label-modern">Mutu:</label>
            <select v-model="selectedMutu" class="per-page-select-modern">
              <option :value="null">Semua Mutu</option>
              <option v-for="mutu in uniqueMutu" :key="mutu" :value="mutu">
                {{ mutu }}
              </option>
            </select>
          </div>
          <div class="per-page-control">
            <label class="per-page-label-modern">Tampilkan:</label>
            <select v-model="perPage" @change="handlePerPageChange" class="per-page-select-modern">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
            <span class="per-page-suffix">per halaman</span>
          </div>
        </div>
      </div>

      <!-- TABLE -->
      <div class="card-body-stock">
        <div class="table-container-modern">
          <table class="table-stock-modern">
            <thead>
              <!-- HEADER KAYU LOG -->
              <tr v-if="activeTab === 'logs'">
                <th class="th-number">No</th>
                <th class="th-code">Kode</th>
                <th class="th-small">Tanggal Terima</th>
                <th class="th-small">TPK</th>
                <th class="th-small">Jenis Kayu</th>
                <th class="th-small">NO SKSHHK</th>
                <th class="th-small">No Kapling</th>
                <th class="th-small">Panjang (m)</th>
                <th class="th-small">Diameter (cm)</th>
                <th class="th-small">Stok</th>
                <th class="th-small">Kubikasi (m³)</th>
                <th class="th-small">Mutu</th>
              </tr>

              <!-- HEADER KAYU RST -->
              <tr v-else-if="activeTab === 'rst'">
                <th class="th-number">No</th>
                <th class="th-code">Kode</th>
                <th class="th-name">Nama</th>
                <th class="th-small">Bentuk</th>
                <th class="th-small">Kualitas</th>
                <th class="th-small">T (mm)</th>
                <th class="th-small">L (mm)</th>
                <th class="th-small">P (mm)</th>
                <th class="th-small">Stok</th>
                <th class="th-small">Kubikasi (m³)</th>
              </tr>

              <!-- HEADER KATEGORI LAIN -->
              <tr v-else>
                <th class="th-number">No</th>
                <th class="th-code">Kode Item</th>
                <th class="th-name">Nama Barang</th>
                <th class="th-category">Kategori</th>
                <th class="th-unit">Satuan</th>
                <th class="th-stock">Stok</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="filteredReport.length === 0" class="empty-row-modern">
                <td
                  :colspan="activeTab === 'logs' ? 12 : activeTab === 'rst' ? 10 : 6"
                  class="empty-cell-modern"
                >
                  <div class="empty-state-content">
                    <div class="empty-icon-wrapper">
                      <span class="empty-icon">📭</span>
                    </div>
                    <p class="empty-title">Tidak Ada Data</p>
                    <p class="empty-message">
                      {{
                        searchQuery
                          ? 'Tidak ditemukan hasil yang sesuai dengan pencarian Anda'
                          : 'Belum ada data stok untuk kategori / gudang ini'
                      }}
                    </p>
                  </div>
                </td>
              </tr>

              <!-- ROWS KAYU LOG -->
              <tr
                v-else-if="activeTab === 'logs'"
                v-for="(item, index) in filteredReport"
                :key="'log-' + item.id"
                class="data-row-modern"
              >
                <td class="td-number">
                  <div class="number-badge">
                    {{
                      pagination
                        ? (pagination.current_page - 1) * pagination.per_page + index + 1
                        : index + 1
                    }}
                  </div>
                </td>
                <td class="td-code">
                  <div class="code-badge-modern">
                    <span class="code-icon">🏷️</span>
                    <span class="code-text">{{ item.code }}</span>
                  </div>
                </td>
                <td class="td-small">
                  {{ item.tanggal_terima || '-' }}
                </td>
                <td class="td-small">
                  <span class="badge-unit-modern">{{ item.tpk || '-' }}</span>
                </td>
                <td class="td-small">
                  <span class="badge-unit-modern">{{ item.jenis_kayu || '-' }}</span>
                </td>
                <td class="td-small">
                  {{ item.no_skshhk || '-' }}
                </td>
                <td class="td-small">
                  {{ item.no_kapling || '-' }}
                </td>
                <td class="td-small">
                  {{ item.panjang ? formatQty(item.panjang) : '-' }}
                </td>
                <td class="td-small">
                  {{ item.diameter ? formatQty(item.diameter) : '-' }}
                </td>
                <td class="td-small">
                  <div class="stock-total-inline">
                    <span class="stock-value">
                      {{ formatQty(totalQty(filteredStocks(item.stocks))) }}
                    </span>
                    <button type="button" class="btn-eye-inline" @click="openDetail(item)">
                      👁️
                    </button>
                  </div>
                </td>
                <td class="td-small">
                  {{ formatLogVolume(totalKubikasi(item, filteredStocks(item.stocks))) }}
                </td>
                <td class="td-small">
                  <span class="badge-unit-modern">{{ item.mutu || '-' }}</span>
                </td>
              </tr>

              <!-- ROWS KAYU RST -->
              <tr
                v-else-if="activeTab === 'rst'"
                v-for="(item, index) in filteredReport"
                :key="'rst-' + item.id"
                class="data-row-modern"
              >
                <td class="td-number">
                  <div class="number-badge">
                    {{
                      pagination
                        ? (pagination.current_page - 1) * pagination.per_page + index + 1
                        : index + 1
                    }}
                  </div>
                </td>
                <td class="td-code">
                  <div class="code-badge-modern">
                    <span class="code-icon">🏷️</span>
                    <span class="code-text">{{ item.code }}</span>
                  </div>
                </td>
                <td class="td-name">
                  <div class="item-info-modern">
                    <div class="item-icon-box">
                      <span class="item-icon">📦</span>
                    </div>
                    <div class="item-text">
                      <span class="item-name-text">{{ item.name }}</span>
                    </div>
                  </div>
                </td>
                <td class="td-small">
                  <span class="badge-unit-modern">{{ item.bentuk || '-' }}</span>
                </td>
                <td class="td-small">
                  <span class="badge-unit-modern">{{ item.kualitas || '-' }}</span>
                </td>
                <td class="td-small">
                  {{ item.specifications?.t ?? '-' }}
                </td>
                <td class="td-small">
                  {{ item.specifications?.l ?? '-' }}
                </td>
                <td class="td-small">
                  {{ item.specifications?.p ?? '-' }}
                </td>
                <td class="td-small">
                  <div class="stock-total-inline">
                    <span class="stock-value">
                      {{ formatQty(totalQty(filteredStocks(item.stocks))) }}
                    </span>
                    <button type="button" class="btn-eye-inline" @click="openDetail(item)">
                      👁️
                    </button>
                  </div>
                </td>
                <td class="td-small">
                  {{ formatKubikasi(totalKubikasi(item, filteredStocks(item.stocks))) }}
                </td>
              </tr>

              <!-- ROWS KATEGORI LAIN -->
              <tr
                v-else
                v-for="(item, index) in filteredReport"
                :key="'other-' + item.id"
                class="data-row-modern"
              >
                <td class="td-number">
                  <div class="number-badge">
                    {{
                      pagination
                        ? (pagination.current_page - 1) * pagination.per_page + index + 1
                        : index + 1
                    }}
                  </div>
                </td>
                <td class="td-code">
                  <div class="code-badge-modern">
                    <span class="code-icon">🏷️</span>
                    <span class="code-text">{{ item.code }}</span>
                  </div>
                </td>
                <td class="td-name">
                  <div class="item-info-modern">
                    <div class="item-icon-box">
                      <span class="item-icon">📦</span>
                    </div>
                    <div class="item-text">
                      <span class="item-name-text">{{ item.name }}</span>
                    </div>
                  </div>
                </td>
                <td class="td-category">
                  <span class="badge-category-modern">
                    <span class="badge-dot"></span>
                    {{ item.category?.name || 'N/A' }}
                  </span>
                </td>
                <td class="td-unit">
                  <span class="badge-unit-modern">{{ item.unit?.name || 'N/A' }}</span>
                </td>
                <td class="td-stock">
                  <div class="stock-total-inline">
                    <span class="stock-value">
                      {{
                        activeTab === 'operational'
                          ? formatQty(item.stock || 0)
                          : formatQty(
                              item.total_stock_from_stocks ??
                                totalQty(filteredStocks(item.stocks || [])),
                            )
                      }}
                    </span>
                    <button type="button" class="btn-eye-inline" @click="openDetail(item)">
                      👁️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- PAGINATION -->
      <div v-if="pagination && pagination.last_page > 1" class="card-footer-modern">
        <div class="pagination-info-modern">
          <span class="info-icon">📄</span>
          <span class="info-text">
            Menampilkan <strong>{{ pagination.from || 0 }}</strong> -
            <strong>{{ pagination.to || 0 }}</strong> dari
            <strong>{{ pagination.total }}</strong> data
          </span>
        </div>
        <div class="pagination-controls-modern">
          <button
            @click="goToPage(pagination.current_page - 1)"
            :disabled="pagination.current_page === 1"
            class="pagination-btn-modern pagination-prev"
          >
            <span class="btn-icon-nav">←</span>
            <span class="btn-text-nav">Prev</span>
          </button>
          <button
            v-for="page in paginationPages"
            :key="page"
            @click="page !== '...' && goToPage(page)"
            :class="[
              'pagination-btn-modern',
              'pagination-number',
              { active: page === pagination.current_page, dots: page === '...' },
            ]"
            :disabled="page === '...'"
          >
            {{ page }}
          </button>
          <button
            @click="goToPage(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.last_page"
            class="pagination-btn-modern pagination-next"
          >
            <span class="btn-text-nav">Next</span>
            <span class="btn-icon-nav">→</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DETAIL STOK -->
    <div v-if="isDetailOpen" class="modal-overlay">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Rincian Stok Barang</h3>
          <button class="modal-close-btn" @click="closeDetail">✕</button>
        </div>
        <div class="modal-body">
          <p class="modal-item-name">{{ detailItem?.code }} - {{ detailItem?.name }}</p>
          <table class="modal-table">
            <thead>
              <tr>
                <th>Gudang</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="detailStocks.length === 0">
                <td colspan="2" class="text-center">Tidak ada stok.</td>
              </tr>
              <tr v-for="row in detailStocks" :key="row.id">
                <td>{{ row.warehouse_name }}</td>
                <td>{{ formatQty(row.quantity) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button class="btn-modal-ok" @click="closeDetail">Tutup</button>
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
  { key: 'logs', label: 'Kayu Log', category: 'Kayu Log', icon: '🪵' },
  { key: 'rst', label: 'Kayu RST', category: 'Kayu RST', icon: '🪚' },
  { key: 'finished', label: 'Produk Jadi', category: 'Produk Jadi', icon: '🪑' },
  { key: 'operational', label: 'Bahan Operasional', category: 'Bahan Operasional', icon: '🔧' },
  { key: 'packaging', label: 'Karton Box', category: 'Karton Box', icon: '📦' },
  { key: 'component', label: 'Komponen', category: 'Komponen', icon: '🧩' },
]

const activeTab = ref('logs')
const reportData = ref([])
const loading = ref(false)
const pagination = ref(null)
const searchQuery = ref('')
const perPage = ref(50)
const currentPage = ref(1)
const warehouses = ref([])
const selectedWarehouseId = ref(null)
const selectedTpk = ref(null)
const selectedJenisKayu = ref(null)
const selectedMutu = ref(null)
const totalKubikasiSum = ref(0)
let searchTimeout = null

const isDetailOpen = ref(false)
const detailItem = ref(null)
const detailStocks = ref([])

const uniqueTpk = computed(() => {
  const tpks = reportData.value.map((item) => item.tpk).filter(Boolean)
  return [...new Set(tpks)].sort()
})

const uniqueJenisKayu = computed(() => {
  const jenisKayus = reportData.value.map((item) => item.jenis_kayu).filter(Boolean)
  return [...new Set(jenisKayus)].sort()
})

const uniqueMutu = computed(() => {
  const mutus = reportData.value.map((item) => item.mutu).filter(Boolean)
  return [...new Set(mutus)].sort()
})

const currentCategory = () => {
  return tabs.find((t) => t.key === activeTab.value)?.category ?? 'Kayu Log'
}

const currentCategoryParam = () => {
  if (activeTab.value === 'operational') {
    return 'Bahan Operasional,Bahan Penolong'
  }
  return currentCategory()
}

const fetchWarehouses = async () => {
  try {
    const res = await apiClient.get('/warehouses')
    warehouses.value = res.data.data || res.data || []
  } catch (e) {
    console.error(e)
  }
}

const fetchReport = async () => {
  loading.value = true
  try {
    const params = {
      categories: currentCategoryParam(),
      per_page: perPage.value,
      page: currentPage.value,
    }
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    if (selectedWarehouseId.value) {
      params.warehouse_id = selectedWarehouseId.value
    }
    if (selectedTpk.value) {
      params.tpk = selectedTpk.value
    }
    if (selectedJenisKayu.value) {
      params.jenis_kayu = selectedJenisKayu.value
    }
    if (selectedMutu.value) {
      params.mutu = selectedMutu.value
    }

    await apiClient.get('/stock-report', { params }).then((response) => {
      if (response.data.data?.data) {
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

      totalKubikasiSum.value = response.data.summary?.total_kubikasi || 0
    })
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
  selectedTpk.value = null
  selectedJenisKayu.value = null
  selectedMutu.value = null
}

watch(activeTab, () => {
  fetchReport()
})

watch(selectedWarehouseId, () => {
  currentPage.value = 1
  fetchReport()
})

watch([selectedTpk, selectedJenisKayu, selectedMutu], () => {
  currentPage.value = 1
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
    for (let i = 1; i <= lastPageNum; i++) pages.push(i)
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

const filteredStocks = (stocks = []) => {
  if (!selectedWarehouseId.value) return stocks
  return stocks.filter((s) => Number(s.warehouse_id) === Number(selectedWarehouseId.value))
}

const filteredReport = computed(() => {
  return reportData.value
})

const formatQty = (val) => {
  if (!val && val !== 0) return 0
  return parseFloat(val).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  })
}

const formatKubikasi = (val) => {
  if (!val && val !== 0) return 0
  return parseFloat(val).toLocaleString('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  })
}

const formatLogVolume = (val) => {
  if (!val && val !== 0) return 0
  const num = parseFloat(val)
  if (num % 1 === 0) return formatQty(num)
  return formatKubikasi(num)
}

const totalQty = (stocks) => {
  return (stocks || []).reduce((sum, s) => sum + parseFloat(s.qty || 0), 0)
}

const totalKubikasi = (item, stocksFiltered) => {
  if (!item) return 0

  if (activeTab.value === 'logs') {
    return Number(item.kubikasi || 0)
  }

  if (!item.specifications) return 0
  const t = Number(item.specifications.t || 0)
  const l = Number(item.specifications.l || 0)
  const p = Number(item.specifications.p || 0)
  if (!t || !l || !p) return 0
  const volumePerPcs = (t * l * p) / 1_000_000_000
  const qty = totalQty(stocksFiltered || [])
  return volumePerPcs * qty
}

const openDetail = (item) => {
  detailItem.value = item
  const stocks = item.stocks || []
  detailStocks.value = stocks.map((s) => ({
    id: s.id,
    warehouse_name: s.warehouse?.name || s.warehouse?.code || 'Gudang',
    quantity: s.qty || 0,
  }))
  isDetailOpen.value = true
}

const closeDetail = () => {
  isDetailOpen.value = false
  detailItem.value = null
  detailStocks.value = []
}

onMounted(() => {
  fetchWarehouses()
  fetchReport()
})
</script>

<style scoped>
/* ========================================
   PAGE HEADER - GRADIENT & MODERN
   ======================================== */
.page-header-stock {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 2.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
}

.header-content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-left-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.icon-badge-stock {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stock-icon {
  font-size: 2.5rem;
}

.header-text-content {
  flex: 1;
}

.page-title-stock {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.page-subtitle-stock {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
  line-height: 1.5;
}

.header-stats-section {
  display: flex;
  gap: 1rem;
}

.stat-card-modern {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  min-width: 160px;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea15, #764ba215);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.8125rem;
  color: #6b7280;
  font-weight: 600;
  margin: 0;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
  line-height: 1;
}

/* ========================================
   TABS - MODERN PILLS
   ======================================== */
.tabs-container-modern {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.tab-btn-modern {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  border: 2.5px solid #e5e7eb;
  background: white;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tab-btn-modern:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
}

.tab-btn-modern.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.35);
}

.tab-icon {
  font-size: 1.25rem;
}

.tab-label {
  font-weight: 700;
  letter-spacing: 0.015em;
}

.tab-indicator {
  margin-left: 0.25rem;
  font-size: 0.875rem;
}

/* ========================================
   LOADING STATE
   ======================================== */
.loading-container-modern {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.loading-content {
  text-align: center;
}

.spinner-modern {
  width: 64px;
  height: 64px;
  border: 6px solid #f3f4f6;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text-modern {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.loading-subtext {
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0;
}

/* ========================================
   CONTENT CARD
   ======================================== */
.content-card-stock {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f2f5;
  overflow: hidden;
}

/* CARD HEADER */
.card-header-stock {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 3px solid #e9ecef;
}

.header-left-info {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.header-icon-badge {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea15, #764ba215);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon {
  font-size: 1.5rem;
}

.header-title-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card-title-stock {
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
  letter-spacing: -0.25px;
}

.card-subtitle-stock {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.header-right-info {
  display: flex;
  gap: 1rem;
}

.info-badge-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 12px;
  border: 2px solid #93c5fd;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.badge-icon {
  font-size: 1.125rem;
}

.badge-text {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #1e40af;
}

/* ========================================
   FILTER SECTION
   ======================================== */
.card-filter-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: #fafbfc;
  border-bottom: 2px solid #e5e7eb;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.filter-left-group {
  flex: 1;
  min-width: 300px;
}

.search-box-modern {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon-box {
  position: absolute;
  left: 1rem;
  font-size: 1.125rem;
  pointer-events: none;
  color: #9ca3af;
}

.search-input-modern {
  width: 100%;
  padding: 0.875rem 3rem 0.875rem 3rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background: white;
  color: #111827;
}

.search-input-modern::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.search-input-modern:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
  transform: translateY(-1px);
}

.clear-btn-search {
  position: absolute;
  right: 1rem;
  width: 24px;
  height: 24px;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  transition: all 0.3s ease;
}

.clear-btn-search:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.filter-right-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.per-page-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1.25rem;
  background: white;
  border: 2.5px solid #e5e7eb;
  border-radius: 12px;
}

.per-page-label-modern {
  font-size: 0.875rem;
  font-weight: 700;
  color: #374151;
}

.per-page-select-modern {
  padding: 0.5rem 0.75rem;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.per-page-select-modern:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

.per-page-suffix {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* ========================================
   TABLE SECTION
   ======================================== */
.card-body-stock {
  padding: 0;
}

.table-container-modern {
  overflow-x: auto;
}

.table-stock-modern {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.9375rem;
}

.table-stock-modern thead {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.table-stock-modern th {
  padding: 1.25rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #374151;
  border-bottom: 3px solid #d1d5db;
  text-align: left;
  white-space: nowrap;
  letter-spacing: 0.05em;
}

.table-stock-modern td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

.data-row-modern {
  transition: all 0.2s ease;
}

.data-row-modern:hover {
  background: #f9fafb;
  box-shadow: inset 0 0 0 1px #e5e7eb;
}

/* TABLE CELLS */
.th-number {
  width: 60px;
}

.td-number {
  text-align: center;
}

.number-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.875rem;
  color: #374151;
}

.code-badge-modern {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-radius: 10px;
  border: 2px solid #93c5fd;
  font-weight: 700;
  font-size: 0.875rem;
  color: #1e40af;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.code-icon {
  font-size: 1rem;
}

.item-info-modern {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.item-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-icon {
  font-size: 1.25rem;
}

.item-text {
  display: flex;
  flex-direction: column;
}

.item-name-text {
  font-weight: 700;
  color: #111827;
  font-size: 0.9375rem;
}

.badge-category-modern {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
}

.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
}

.badge-unit-modern {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 10px;
  border: 2px solid #fcd34d;
  font-weight: 700;
  font-size: 0.875rem;
  color: #92400e;
}

/* STOCK PER WAREHOUSE */
.stock-warehouse-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stock-warehouse-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.warehouse-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.warehouse-icon {
  font-size: 1rem;
}

.warehouse-name {
  font-size: 0.875rem;
  color: #4b5563;
  font-weight: 600;
}

.stock-qty-box {
  display: flex;
  align-items: center;
}

.stock-qty {
  font-weight: 700;
  font-size: 0.9375rem;
  color: #111827;
}

.stock-total-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-radius: 8px;
  border: 2px solid #93c5fd;
  margin-top: 0.5rem;
}

.total-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e40af;
}

.total-value {
  font-size: 1rem;
  font-weight: 800;
  color: #1e3a8a;
}

.stock-simple {
  display: flex;
  justify-content: center;
}

.stock-value-simple {
  display: inline-block;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-radius: 10px;
  border: 2px solid #93c5fd;
  font-weight: 800;
  font-size: 1.125rem;
  color: #1e3a8a;
}

/* ========================================
   EMPTY STATE
   ======================================== */
.empty-row-modern .empty-cell-modern {
  padding: 5rem 2rem;
  text-align: center;
}

.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 3rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

.empty-message {
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0;
  max-width: 400px;
  line-height: 1.6;
}

/* ========================================
   PAGINATION
   ======================================== */
.card-footer-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: #fafbfc;
  border-top: 2px solid #e5e7eb;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.pagination-info-modern {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  color: #6b7280;
}

.info-icon {
  font-size: 1.125rem;
}

.info-text strong {
  color: #111827;
  font-weight: 700;
}

.pagination-controls-modern {
  display: flex;
  gap: 0.5rem;
}

.pagination-btn-modern {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 40px;
  justify-content: center;
}

.pagination-btn-modern:hover:not(:disabled):not(.dots) {
  border-color: #667eea;
  background: #f8f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.pagination-btn-modern.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
}

.pagination-btn-modern:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-btn-modern.dots {
  border-color: transparent;
  cursor: default;
}

.btn-icon-nav {
  font-size: 1rem;
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media (max-width: 1024px) {
  .header-content-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-filter-modern {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-left-group {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .page-header-stock {
    padding: 1.5rem;
  }

  .tabs-container-modern {
    gap: 0.5rem;
  }

  .tab-btn-modern {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }

  .table-stock-modern th,
  .table-stock-modern td {
    padding: 1rem;
    font-size: 0.875rem;
  }

  .card-footer-modern {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-controls-modern {
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>
