<template>
  <DashboardLayout>
    <div class="page-header">
      <div class="header-content">
        <div class="header-left-section">
          <div class="icon-badge">
            <span class="icon-3d">🏭</span>
          </div>
          <div class="header-text">
            <h1 class="page-title">Daftar BOM (Resep)</h1>
            <p class="page-subtitle">Daftar resep untuk semua Produk Jadi.</p>
          </div>
        </div>

        <div class="header-right-section">
          <router-link :to="{ name: 'BomCreate' }" class="btn-primary">
            <span class="btn-icon">➕</span>
            <span class="btn-text">Tambah Resep Baru</span>
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-animation">
        <div class="spinner"></div>
        <div class="loading-dots"><span></span><span></span><span></span></div>
      </div>
      <p class="loading-text">Memuat data resep...</p>
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
              placeholder="Cari nama resep, kode, atau produk..."
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
                <th>No</th>
                <th>Kode Resep</th>
                <th>Nama Resep</th>
                <th>Produk Jadi</th>
                <th>Total Kayu (m³)</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="daftarBom.length === 0" class="empty-row">
                <td colspan="6" class="text-center">
                  <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <p class="empty-text">
                      {{ searchQuery ? 'Tidak ada hasil pencarian.' : 'Belum ada resep (BOM).' }}
                    </p>
                  </div>
                </td>
              </tr>

              <tr v-for="(bom, index) in daftarBom" :key="bom.id" class="data-row">
                <td>
                  {{ (pagination.current_page - 1) * perPage + index + 1 }}
                </td>
                <td>
                  <span class="code-badge">{{ bom.code || '-' }}</span>
                </td>
                <td>
                  <span class="item-name">{{ bom.name }}</span>
                </td>
                <td>
                  <div v-if="bom.product" class="item-name-wrapper">
                    <span class="item-icon">🏭</span>
                    <div class="item-name-group">
                      <span class="item-name">{{ bom.product.name }}</span>
                      <span class="unit-badge">{{ bom.product.unit?.short_name || 'N/A' }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="kubikasi-value">
                    {{ parseFloat(bom.total_wood_m3).toFixed(6) }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button
                      @click="openProductionModal(bom)"
                      class="btn-action btn-produce"
                      title="Jalankan Produksi"
                    >
                      🏭
                    </button>
                    <router-link
                      :to="{ name: 'BomEdit', params: { id: bom.id } }"
                      class="btn-action btn-edit"
                      title="Edit Resep"
                    >
                      ✏️
                    </router-link>
                    <button
                      @click="deleteBom(bom.id, bom.name)"
                      class="btn-action btn-delete"
                      title="Hapus Resep"
                    >
                      🗑️
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
            class="pagination-btn"
          >
            ← Prev
          </button>

          <button
            v-for="page in paginationPages"
            :key="page"
            @click="goToPage(page)"
            :class="['pagination-btn', { active: page === pagination.current_page }]"
          >
            {{ page }}
          </button>

          <button
            @click="goToPage(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.last_page"
            class="pagination-btn"
          >
            Next →
          </button>
        </div>
      </div>
    </div>

    <div v-if="showProductionModal" class="modal-overlay" @click.self="closeProductionModal">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-header-left">
            <span class="modal-icon">🏭</span>
            <h3 class="modal-title">Jalankan Produksi</h3>
          </div>
          <button @click="closeProductionModal" class="modal-close-btn">✕</button>
        </div>

        <div class="modal-body" v-if="selectedBom">
          <div class="modal-info-card">
            <div class="info-row">
              <span class="info-label">Resep:</span>
              <span class="info-value">{{ selectedBom.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Produk Jadi:</span>
              <span class="info-value">{{ selectedBom.product.name }}</span>
            </div>
          </div>

          <div class="modal-warning-box">
            <span class="warning-icon">⚠️</span>
            <p class="warning-text">
              Stok bahan baku akan <strong>langsung dipotong</strong> dan stok produk jadi akan
              <strong>langsung ditambah</strong> sesuai resep.
            </p>
          </div>

          <div class="form-group-modal">
            <label for="production-qty" class="form-label-modal"
              >Jumlah Produk Selesai Dirakit:</label
            >
            <input
              id="production-qty"
              type="number"
              v-model.number="productionQty"
              class="form-control-modal"
              placeholder="Contoh: 5"
              min="1"
            />
            <small v-if="modalError" class="form-error-modal">{{ modalError }}</small>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeProductionModal" class="btn-modal-secondary">Batal</button>
          <button
            @click="handleExecuteProduction"
            class="btn-modal-primary"
            :disabled="isExecuting"
          >
            <span v-if="isExecuting" class="btn-spinner"></span>
            <span>{{ isExecuting ? 'Memproses...' : 'Jalankan & Catat Stok' }}</span>
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'
import Swal from 'sweetalert2'
import { debounce } from 'lodash-es'

const router = useRouter()
const { showSuccess, showError, showWarning } = useNotification()

const loading = ref(true)
const daftarBom = ref([])
const pagination = ref(null)
const searchQuery = ref('')
const perPage = ref(25)
const currentPage = ref(1)

const showProductionModal = ref(false)
const selectedBom = ref(null)
const productionQty = ref(1)
const isExecuting = ref(false)
const modalError = ref(null)

const fetchBom = async () => {
  loading.value = true
  try {
    const response = await apiClient.get('/boms', {
      params: {
        page: currentPage.value,
        per_page: perPage.value,
        search: searchQuery.value,
      },
    })
    daftarBom.value = response.data.data.data
    pagination.value = response.data.data
  } catch (error) {
    console.error('Gagal mengambil data BOM:', error)
    showError('Gagal', 'Gagal mengambil data daftar resep (BOM).')
  } finally {
    loading.value = false
  }
}

const deleteBom = (id, name) => {
  Swal.fire({
    title: 'Hapus Resep?',
    text: `Anda yakin ingin menghapus "${name}"? Ini akan menghapus semua bahan di dalamnya.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/boms/${id}`)
        showSuccess('Sukses', `Resep "${name}" berhasil dihapus.`)
        fetchBom()
      } catch (error) {
        console.error('Gagal menghapus resep:', error)
        showError('Gagal', error.response?.data?.message || 'Gagal menghapus resep.')
      }
    }
  })
}

const openProductionModal = (bom) => {
  selectedBom.value = bom
  productionQty.value = 1
  modalError.value = null
  showProductionModal.value = true
}

const closeProductionModal = () => {
  showProductionModal.value = false
  selectedBom.value = null
  isExecuting.value = false
}

const handleExecuteProduction = async () => {
  isExecuting.value = true
  modalError.value = null

  if (!productionQty.value || productionQty.value <= 0) {
    modalError.value = 'Jumlah produksi harus lebih besar dari 0.'
    isExecuting.value = false
    return
  }

  try {
    const bomId = selectedBom.value.id
    const response = await apiClient.post(`/boms/${bomId}/execute`, {
      quantity: productionQty.value,
    })

    showSuccess('Produksi Berhasil', response.data.message)
    closeProductionModal()
  } catch (error) {
    console.error('Gagal menjalankan produksi:', error)
    if (error.response && error.response.status === 422) {
      modalError.value = error.response.data.errors.quantity[0]
    } else {
      showError('Produksi Gagal', error.response?.data?.message || 'Terjadi kesalahan.')
      closeProductionModal()
    }
  } finally {
    isExecuting.value = false
  }
}

const goToPage = (page) => {
  if (page === '...') return
  if (page >= 1 && page <= pagination.value.last_page) {
    currentPage.value = page
    fetchBom()
  }
}

const handlePerPageChange = () => {
  currentPage.value = 1
  fetchBom()
}

const handleSearch = debounce(() => {
  currentPage.value = 1
  fetchBom()
}, 300)

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  fetchBom()
}

const paginationPages = computed(() => {
  if (!pagination.value) return []
  const { current_page, last_page } = pagination.value
  const delta = 2
  const range = []
  for (
    let i = Math.max(2, current_page - delta);
    i <= Math.min(last_page - 1, current_page + delta);
    i++
  ) {
    range.push(i)
  }
  if (current_page - delta > 2) range.unshift('...')
  if (current_page + delta < last_page - 1) range.push('...')
  range.unshift(1)
  if (last_page > 1) range.push(last_page)
  return range
})

onMounted(fetchBom)
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.header-left-section {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.icon-badge {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.icon-3d {
  font-size: 2rem;
}

.header-text {
  color: white;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: white;
}

.page-subtitle {
  font-size: 0.95rem;
  margin: 0.25rem 0 0 0;
  color: rgba(255, 255, 255, 0.9);
}

.header-right-section {
  display: flex;
  gap: 0.75rem;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  color: #667eea;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-decoration: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  background: #f8f9ff;
}

.btn-icon {
  font-size: 1rem;
}

.btn-text {
  font-size: 0.9375rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.loading-animation {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f4f6;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-dots {
  display: flex;
  gap: 6px;
  margin-top: 1rem;
  justify-content: center;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
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
  }
  40% {
    transform: scale(1);
  }
}

.loading-text {
  margin-top: 1rem;
  color: #6b7280;
  font-weight: 500;
}

.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%);
  border-bottom: 2px solid #e5e7eb;
  gap: 1rem;
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
  left: 1rem;
  font-size: 1.125rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.clear-btn {
  position: absolute;
  right: 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.filter-right {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.per-page-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.per-page-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.per-page-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  background: white;
  transition: all 0.2s ease;
}

.per-page-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.card-body-table {
  padding: 1.5rem;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table thead {
  background: #f9fafb;
}

.data-table th {
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.data-table tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.15s ease;
}

.data-table tbody tr:hover {
  background-color: #f9fafb;
}

.data-table td {
  padding: 1rem;
  color: #4b5563;
  vertical-align: middle;
}

.code-badge {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8125rem;
}

.item-name-wrapper {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.item-icon {
  font-size: 1.25rem;
}

.item-name-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-weight: 500;
  color: #1f2937;
}

.unit-badge {
  display: inline-block;
  background: #e5e7eb;
  color: #6b7280;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  width: fit-content;
}

.kubikasi-value {
  font-weight: 700;
  color: #10b981;
  font-size: 0.9375rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-action {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-produce {
  background: white;
  color: #10b981;
  border: 1px solid #10b981;
}

.btn-produce:hover {
  background: #10b981;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.btn-edit {
  background: white;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.btn-edit:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.btn-delete {
  background: white;
  color: #ef4444;
  border: 1px solid #ef4444;
}

.btn-delete:hover {
  background: #ef4444;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.empty-row {
  background: white;
}

.empty-state {
  padding: 3rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-text {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

.card-footer-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  gap: 1rem;
  flex-wrap: wrap;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.pagination-btn {
  padding: 0.5rem 0.875rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 40px;
}

.pagination-btn:hover:not(:disabled):not(.active) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%);
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-icon {
  font-size: 1.75rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.modal-close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.25rem;
  color: #6b7280;
}

.modal-close-btn:hover {
  background: #fef2f2;
  border-color: #ef4444;
  color: #ef4444;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.modal-info-card {
  background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
}

.info-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-warning-box {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: 12px;
}

.warning-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.warning-text {
  font-size: 0.875rem;
  color: #92400e;
  margin: 0;
  line-height: 1.5;
}

.form-group-modal {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label-modal {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-control-modal {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-control-modal:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-error-modal {
  color: #ef4444;
  font-size: 0.8125rem;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-modal-secondary,
.btn-modal-primary {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-modal-secondary {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-modal-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-modal-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.btn-modal-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4);
}

.btn-modal-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@media (max-width: 768px) {
  .page-header {
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .card-header-filter {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-left {
    min-width: 100%;
  }

  .filter-right {
    justify-content: space-between;
  }

  .card-body-table {
    padding: 1rem;
  }

  .data-table {
    font-size: 0.8125rem;
  }

  .data-table th,
  .data-table td {
    padding: 0.75rem 0.5rem;
  }

  .card-footer-pagination {
    flex-direction: column;
    align-items: flex-start;
  }

  .pagination-controls {
    width: 100%;
    overflow-x: auto;
  }

  .modal-content {
    margin: 1rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn-modal-secondary,
  .btn-modal-primary {
    width: 100%;
    justify-content: center;
  }
}
</style>
