<template>
  <DashboardLayout>
    <div class="page-header">
      <div class="header-content">
        <div class="header-left-section">
          <div class="icon-badge">
            <span class="icon-3d">📦</span>
          </div>
          <div class="header-text">
            <h1 class="page-title">Data Master Barang</h1>
            <p class="page-subtitle">Daftar semua material, bahan baku, dan produk jadi.</p>
          </div>
        </div>
        <div class="header-right-section">
          <router-link :to="{ name: 'TambahMasterBarang' }" class="btn-primary">
            <span class="btn-icon">➕</span>
            <span class="btn-text">Tambah Barang Baru</span>
          </router-link>
        </div>
      </div>
    </div>

    <div class="stats-grid" v-if="!loading && pagination">
      <div class="stat-card stat-total">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ pagination.total }}</div>
          <div class="stat-label">Total Barang</div>
        </div>
      </div>
      <div class="stat-card stat-page">
        <div class="stat-icon">📄</div>
        <div class="stat-content">
          <div class="stat-value">{{ pagination.current_page }}/{{ pagination.last_page }}</div>
          <div class="stat-label">Halaman</div>
        </div>
      </div>
      <div class="stat-card stat-showing">
        <div class="stat-icon">👁️</div>
        <div class="stat-content">
          <div class="stat-value">{{ daftarBarang.length }}</div>
          <div class="stat-label">Ditampilkan</div>
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
      <p class="loading-text">Memuat data barang...</p>
    </div>

    <div v-else class="content-card">
      <div class="card-header-filter">
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
                <th class="th-nama">Nama Barang</th>
                <th class="th-kategori">Kategori Stok</th>
                <th class="th-satuan">Satuan</th>
                <th class="th-aksi">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="daftarBarang.length === 0" class="empty-row">
                <td colspan="5" class="text-center">
                  <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <p class="empty-text">
                      {{ searchQuery ? 'Tidak ada hasil pencarian.' : 'Belum ada data barang.' }}
                    </p>
                    <p class="empty-subtext">
                      {{
                        searchQuery
                          ? 'Coba kata kunci lain.'
                          : 'Klik tombol "Tambah Barang Baru" untuk memulai.'
                      }}
                    </p>
                  </div>
                </td>
              </tr>
              <tr v-for="(item, index) in daftarBarang" :key="item.id" class="data-row">
                <td class="td-no">
                  <span class="row-number">{{
                    (pagination.current_page - 1) * pagination.per_page + index + 1
                  }}</span>
                </td>
                <td class="td-nama">
                  <div class="item-name-wrapper">
                    <span class="item-icon">📦</span>
                    <span class="item-name">{{ item.name }}</span>
                  </div>
                </td>
                <td class="td-kategori">
                  <span :class="['badge', getBadgeClass(item.category?.name)]">
                    <span class="badge-dot"></span>
                    {{ item.category?.name || 'Belum Diatur' }}
                  </span>
                </td>
                <td class="td-satuan">
                  <span class="unit-badge">{{ item.unit?.name || 'N/A' }}</span>
                </td>
                <td class="td-action">
                  <div class="action-buttons">
                    <router-link
                      :to="{ name: 'EditMasterBarang', params: { id: item.id } }"
                      class="btn-action btn-edit"
                      title="Edit Barang"
                    >
                      <span class="btn-icon-action">✏️</span>
                    </router-link>
                    <button
                      @click="deleteBarang(item.id)"
                      class="btn-action btn-delete"
                      title="Hapus Barang"
                    >
                      <span class="btn-icon-action">🗑️</span>
                    </button>
                  </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useToast } from 'vue-toastification'

const loading = ref(true)
const daftarBarang = ref([])
const pagination = ref(null)
const searchQuery = ref('')
const perPage = ref(50)
const currentPage = ref(1)
let searchTimeout = null
const router = useRouter()
const toast = useToast()

const fetchBarang = async () => {
  loading.value = true

  try {
    const params = {
      include: 'unit,category',
      per_page: perPage.value,
      page: currentPage.value,
    }

    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    const response = await apiClient.get('/materials', { params })
    daftarBarang.value = response.data.data.data || []
    pagination.value = {
      current_page: response.data.data.current_page,
      last_page: response.data.data.last_page,
      per_page: response.data.data.per_page,
      total: response.data.data.total,
      from: response.data.data.from,
      to: response.data.data.to,
    }
  } catch (error) {
    console.error('❌ Error:', error)
    daftarBarang.value = []
    toast.error('Gagal memuat data barang.')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchBarang()
  }, 500)
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  fetchBarang()
}

const handlePerPageChange = () => {
  currentPage.value = 1
  fetchBarang()
}

const goToPage = (page) => {
  if (page < 1 || page > pagination.value.last_page) return
  currentPage.value = page
  fetchBarang()
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

const getBadgeClass = (categoryName) => {
  if (!categoryName) return 'badge-default'
  const normalized = categoryName.toLowerCase().replace(/\s+/g, '-')
  return `badge-${normalized}`
}

const deleteBarang = async (id) => {
  if (!confirm('Apakah Anda yakin ingin menghapus barang ini?')) return

  try {
    await apiClient.delete(`/materials/${id}`)
    toast.success('Barang berhasil dihapus.')
    await fetchBarang()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal menghapus barang.')
  }
}

onMounted(fetchBarang)
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  padding: 32px 36px;
  border-radius: 24px;
  margin-bottom: 24px;
  box-shadow: 0 20px 60px rgba(30, 64, 175, 0.3);
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
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent);
  border-radius: 50%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  gap: 24px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.header-left-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-badge {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(20px);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.icon-3d {
  font-size: 36px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
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
  font-size: 32px;
  font-weight: 900;
  margin: 0 0 6px 0;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 15px;
  opacity: 0.95;
  margin: 0;
  font-weight: 500;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  color: #1e40af;
  text-decoration: none;
  padding: 16px 28px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 800;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border: 2px solid transparent;
}

.btn-primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  border-color: rgba(30, 64, 175, 0.2);
}

.btn-icon {
  font-size: 18px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 36px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 900;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 450px;
  gap: 32px;
}

.loading-animation {
  position: relative;
}

.spinner {
  width: 72px;
  height: 72px;
  border: 7px solid #f0f0f0;
  border-top-color: #1e40af;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
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
  background: #3b82f6;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}
.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 2px solid #f0f0f0;
}

.card-header-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-bottom: 2px solid #e2e8f0;
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
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
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
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 700px;
}

.data-table thead {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
}

.data-table th {
  padding: 20px 24px;
  text-align: left;
  color: white;
  font-weight: 900;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-row {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.data-row:hover {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  transform: scale(1.005);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.data-table td {
  padding: 18px 24px;
  vertical-align: middle;
}

.row-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e40af;
  border-radius: 10px;
  font-weight: 900;
  font-size: 13px;
}

.item-name-wrapper {
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

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.badge-bahan-baku {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e40af;
}
.badge-bahan-penolong {
  background: linear-gradient(135deg, #fce7f3, #fbcfe8);
  color: #be185d;
}
.badge-bahan-operasional {
  background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
  color: #7e22ce;
}
.badge-produk-jadi {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #166534;
}
.badge-default {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  color: #64748b;
}

.unit-badge {
  display: inline-block;
  padding: 6px 14px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  border-radius: 10px;
  font-weight: 700;
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn-action {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.btn-action::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%);
  transition:
    width 0.6s,
    height 0.6s;
}

.btn-action:hover::before {
  width: 100px;
  height: 100px;
}

.btn-icon-action {
  font-size: 18px;
  position: relative;
  z-index: 1;
}

.btn-edit {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  box-shadow: 0 4px 14px rgba(251, 191, 36, 0.3);
}

.btn-edit:hover {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  transform: translateY(-3px) rotate(5deg);
  box-shadow: 0 8px 20px rgba(251, 191, 36, 0.4);
}

.btn-delete {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
}

.btn-delete:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-3px) rotate(-5deg);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}

.empty-state {
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
  animation: swing 2s ease-in-out infinite;
}

@keyframes swing {
  0%,
  100% {
    transform: rotate(-5deg);
  }
  50% {
    transform: rotate(5deg);
  }
}

.empty-text {
  font-size: 18px;
  font-weight: 700;
  color: #64748b;
  margin: 0 0 8px 0;
}

.empty-subtext {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

.card-footer-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-top: 2px solid #e2e8f0;
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
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-btn.active {
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  color: white;
  border-color: #3b82f6;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
}

@media (max-width: 768px) {
  .page-header {
    padding: 24px 20px;
  }
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  .icon-badge {
    width: 60px;
    height: 60px;
  }
  .icon-3d {
    font-size: 30px;
  }
  .page-title {
    font-size: 24px;
  }
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .card-header-filter {
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
