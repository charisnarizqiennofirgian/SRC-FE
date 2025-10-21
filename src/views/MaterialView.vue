<template>
  <DashboardLayout>
    <!-- Page Header with Gradient -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">🧱 Data Bahan Baku</h1>
          <p class="page-subtitle">Kelola raw materials dan komponen produksi</p>
        </div>
        <div class="action-buttons">
          <button class="btn btn-download" @click="downloadTemplate">
            <span class="btn-icon">📥</span>
            <span>Download Template</span>
          </button>
          <button class="btn btn-import" @click="openImportModal">
            <span class="btn-icon">📤</span>
            <span>Import Bahan Baku</span>
          </button>
          <button class="btn btn-add" @click="openAddModal">
            <span class="btn-icon">➕</span>
            <span>Tambah Bahan Baku</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="content-card">
      <div class="card-header">
        <div class="header-left">
          <div class="header-icon">🧱</div>
          <div>
            <h2 class="card-title">Bahan Baku yang Ada</h2>
            <p class="card-subtitle">Total {{ totalItems }} bahan baku terdaftar</p>
          </div>
        </div>

        <!-- Search Box -->
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Cari bahan baku (kode/nama)..."
            class="search-input"
            v-model="searchQuery"
          />
        </div>
      </div>

      <!-- Table Wrapper -->
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-code">Kode</th>
              <th class="th-name">Nama Bahan Baku</th>
              <th class="th-category">Kategori</th>
              <th class="th-unit">Satuan</th>
              <th class="th-type">Tipe</th>
              <th class="th-stock">Stok</th>
              <th class="th-action">Action</th>
            </tr>
          </thead>
          <tbody>
            <!-- Empty State -->
            <tr v-if="materials.length === 0" class="empty-row">
              <td colspan="7">
                <div class="empty-state">
                  <span class="empty-icon">📭</span>
                  <p class="empty-text">Belum ada data bahan baku</p>
                  <p class="empty-hint">
                    Klik "Tambah Bahan Baku" atau "Import" untuk menambahkan data
                  </p>
                </div>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr v-for="item in materials" :key="item.id" class="data-row">
              <td class="td-code">
                <span class="code-badge">{{ item.code }}</span>
              </td>
              <td class="td-name">{{ item.name }}</td>
              <td class="td-category">
                <span class="category-badge">
                  {{ item.category ? item.category.name : 'N/A' }}
                </span>
              </td>
              <td class="td-unit">{{ item.unit ? item.unit.name : 'N/A' }}</td>
              <td class="td-type">
                <span
                  class="type-badge"
                  :class="item.type === 'Stok' ? 'badge-stok' : 'badge-non-stok'"
                >
                  {{ item.type }}
                </span>
              </td>
              <td class="td-stock">
                <span class="stock-value" :class="getStockClass(item.stock)">
                  {{ formatStock(item.stock) }}
                </span>
              </td>
              <td class="td-action">
                <div class="action-buttons">
                  <button class="action-btn btn-edit" @click="openEditModal(item)" title="Edit">
                    <span>✏️</span>
                  </button>
                  <button
                    class="action-btn btn-delete"
                    @click="deleteMaterial(item.id)"
                    title="Hapus"
                  >
                    <span>🗑️</span>
                  </button>
                </div>
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

    <!-- Modal Add/Edit Material -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-container modal-large" @click.stop>
        <div class="modal-header">
          <div class="modal-title-wrapper">
            <span class="modal-icon">{{ isEditing ? '✏️' : '➕' }}</span>
            <h2 class="modal-title">
              {{ isEditing ? 'Edit Bahan Baku' : 'Tambah Bahan Baku Baru' }}
            </h2>
          </div>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="label-icon">🏷️</span>
                  Kode Bahan Baku
                  <span class="required">*</span>
                </label>
                <input
                  v-model="form.code"
                  type="text"
                  placeholder="Contoh: BB-001"
                  class="form-control"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="label-icon">📝</span>
                  Nama Bahan Baku
                  <span class="required">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="Contoh: Kayu Jati"
                  class="form-control"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="label-icon">📂</span>
                  Kategori Bahan Baku
                  <span class="required">*</span>
                </label>
                <select v-model="form.category_id" class="form-control" required>
                  <option v-if="dropdownLoading" disabled value="">Memuat...</option>
                  <template v-else>
                    <option disabled value="">Pilih Kategori</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </option>
                  </template>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="label-icon">📏</span>
                  Satuan
                  <span class="required">*</span>
                </label>
                <select v-model="form.unit_id" class="form-control" required>
                  <option v-if="dropdownLoading" disabled value="">Memuat...</option>
                  <template v-else>
                    <option disabled value="">Pilih Satuan</option>
                    <option v-for="unit in units" :key="unit.id" :value="unit.id">
                      {{ unit.name }}
                    </option>
                  </template>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="label-icon">🔖</span>
                  Tipe
                  <span class="required">*</span>
                </label>
                <select v-model="form.type" class="form-control" required>
                  <option>Stok</option>
                  <option>Non-Stok</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="label-icon">📦</span>
                  Stok Awal (Opsional)
                </label>
                <input
                  v-model.number="form.stock"
                  type="number"
                  step="any"
                  placeholder="Masukkan jumlah stok awal"
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">📄</span>
                Deskripsi
              </label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="Masukkan deskripsi bahan baku (opsional)"
                class="form-control"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-cancel" @click="closeModal">
              <span>❌</span>
              <span>Batal</span>
            </button>
            <button type="submit" class="btn btn-submit">
              <span>💾</span>
              <span>{{ isEditing ? 'Simpan Perubahan' : 'Simpan' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Import -->
    <div v-if="showImportModal" class="modal-overlay" @click="closeImportModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <div class="modal-title-wrapper">
            <span class="modal-icon">📤</span>
            <h2 class="modal-title">Import Bahan Baku dari Excel</h2>
          </div>
          <button class="close-btn" @click="closeImportModal">&times;</button>
        </div>

        <div class="modal-body">
          <div class="info-box">
            <span class="info-icon">💡</span>
            <p class="info-text">
              Format file: .xlsx, .xls, .csv. Download template terlebih dahulu untuk menghindari
              error.
            </p>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">📎</span>
              Pilih File
            </label>
            <input
              type="file"
              id="fileInput"
              @change="handleFileSelect"
              accept=".xlsx, .xls, .csv"
              class="form-control file-input"
            />
            <p v-if="selectedFile" class="file-name-display">
              ✅ File terpilih: <strong>{{ selectedFile.name }}</strong>
            </p>
          </div>

          <div v-if="isUploading" class="loading-indicator">
            <span class="spinner">⏳</span>
            <p>Mengupload dan memproses file...</p>
          </div>

          <div v-if="importErrors.length > 0" class="import-errors">
            <h4>⚠️ Error Validasi:</h4>
            <ul>
              <li v-for="(error, index) in importErrors" :key="index">{{ error }}</li>
            </ul>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-cancel" @click="closeImportModal">
            <span>❌</span>
            <span>Batal</span>
          </button>
          <button
            type="button"
            class="btn btn-submit"
            @click="uploadFile"
            :disabled="!selectedFile || isUploading"
          >
            <span>{{ isUploading ? '⏳' : '📤' }}</span>
            <span>{{ isUploading ? 'Mengupload...' : 'Upload & Proses' }}</span>
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
import apiClient from '../api/axios'
import DashboardLayout from '../components/DashboardLayout.vue'
import PaginationComponent from '../components/BasePagination.vue'
import { useNotification } from '../composables/useNotification.js'

const { showSuccess, showError } = useNotification()

const materials = ref([])
const categories = ref([])
const units = ref([])

const showModal = ref(false)
const isEditing = ref(false)
const dropdownLoading = ref(false)
const materialForm = reactive({
  id: null,
  code: '',
  name: '',
  description: '',
  category_id: '',
  unit_id: '',
  type: 'Stok',
  stock: 0,
})

const form = materialForm

const showImportModal = ref(false)
const selectedFile = ref(null)
const isUploading = ref(false)
const importErrors = ref([])

const searchQuery = ref('')
const currentPage = ref(1)
const perPage = ref(10)
const totalItems = ref(0)
const totalPages = ref(1)

const fetchMaterials = async () => {
  try {
    const params = {
      page: currentPage.value,
      per_page: perPage.value,
      search: searchQuery.value || undefined,
    }
    const response = await apiClient.get('/materials', { params })
    materials.value = response.data.data.data
    totalPages.value = response.data.data.last_page
    totalItems.value = response.data.data.total
  } catch (error) {
    console.error('Gagal mengambil data bahan baku:', error)
    showError('Gagal', 'Gagal mengambil data bahan baku.')
  }
}

const fetchDropdownData = async () => {
  dropdownLoading.value = true
  try {
    const [catResponse, unitResponse] = await Promise.all([
      apiClient.get('/categories/all'),
      apiClient.get('/units/all'),
    ])

    categories.value = catResponse.data.data
    units.value = unitResponse.data.data

    console.log('✅ Categories loaded:', categories.value)
    console.log('✅ Units loaded:', units.value)
  } catch (error) {
    console.error('❌ Gagal memuat data dropdown:', error)
    console.error('Error detail:', error.response?.data)
    showError('Gagal', 'Gagal memuat data dropdown.')
  } finally {
    dropdownLoading.value = false
  }
}

const formatStock = (value) => {
  return Number(value).toLocaleString('id-ID')
}

const getStockClass = (stock) => {
  const qty = Number(stock)
  if (qty === 0) return 'stock-empty'
  if (qty < 10) return 'stock-low'
  if (qty < 50) return 'stock-medium'
  return 'stock-high'
}

const openAddModal = () => {
  isEditing.value = false
  // Reset form dengan Object.assign
  Object.assign(materialForm, {
    id: null,
    code: '',
    name: '',
    description: '',
    category_id: '',
    unit_id: '',
    type: 'Stok',
    stock: 0,
  })
  fetchDropdownData()
  showModal.value = true
}

const openEditModal = (material) => {
  isEditing.value = true
  Object.assign(materialForm, { ...material })
  showModal.value = true
  fetchDropdownData()
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await apiClient.put(`/materials/${materialForm.id}`, materialForm)
      showSuccess('Sukses', 'Bahan baku berhasil diperbarui.')
    } else {
      await apiClient.post('/materials', materialForm)
      showSuccess('Sukses', 'Bahan baku berhasil ditambahkan.')
    }
    closeModal()
    fetchMaterials()
  } catch (error) {
    console.error('Gagal menyimpan data:', error)
    showError('Gagal', 'Gagal menyimpan data. Periksa kembali input Anda.')
  }
}

const deleteMaterial = async (id) => {
  if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
    try {
      await apiClient.delete(`/materials/${id}`)
      showSuccess('Sukses', 'Bahan baku berhasil dihapus.')
      fetchMaterials()
    } catch (error) {
      console.error('Gagal menghapus data:', error)
      showError('Gagal', 'Gagal menghapus data.')
    }
  }
}

const downloadTemplate = async () => {
  try {
    // 1. Telepon backend untuk meminta file template
    const response = await apiClient.get('/materials/template', {
      responseType: 'blob', // Penting: minta response sebagai file
    })

    // 2. Buat URL sementara dari file yang diterima
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url

    // 3. Beri nama file dan "klik" link untuk memulai download
    link.setAttribute('download', 'template_bahan_baku.csv')
    document.body.appendChild(link)
    link.click()

    // 4. Hapus link setelah selesai
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Gagal men-download template:', error)
    showError('Gagal', 'Tidak dapat men-download template dari server.')
  }
}

const openImportModal = () => {
  selectedFile.value = null
  importErrors.value = []
  showImportModal.value = true
}

const closeImportModal = () => {
  showImportModal.value = false
}

const handleFileSelect = (event) => {
  selectedFile.value = event.target.files[0]
}

const uploadFile = async () => {
  if (!selectedFile.value) return showError('File tidak dipilih', 'Silakan pilih file.')
  isUploading.value = true
  const formData = new FormData()
  formData.append('file', selectedFile.value)
  try {
    await apiClient.post('/materials/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    showSuccess('Sukses', 'Bahan baku berhasil di-import!')
    closeImportModal()
    fetchMaterials()
  } catch (error) {
    console.error('Gagal import:', error)
    if (error.response && error.response.status === 422) {
      importErrors.value = error.response.data.errors || []
      showError('Validasi Gagal', 'Terdapat kesalahan pada file yang diupload.')
    } else {
      showError('Upload Gagal', 'Terjadi kesalahan saat mengupload file.')
    }
  } finally {
    isUploading.value = false
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchMaterials()
}

watch(searchQuery, () => {
  currentPage.value = 1
  fetchMaterials()
})

onMounted(fetchMaterials)
</script>

<style scoped>
/* ===== PAGE HEADER ===== */
.page-header {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  padding: 32px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
  position: relative;
  z-index: 1;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  gap: 20px;
  flex-wrap: wrap;
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
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* ===== BUTTONS ===== */
.btn {
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 10;
  pointer-events: auto;
}

.btn-icon {
  font-size: 18px;
}

.btn-add {
  background: white;
  color: #8b5cf6;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-download {
  background: #ffb84d;
  color: #1a1a1a;
}

.btn-download:hover {
  background: #ffa726;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 152, 38, 0.3);
}

.btn-import {
  background: #ff9500;
  color: white;
}

.btn-import:hover {
  background: #e68600;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 149, 0, 0.3);
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
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
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
  width: 100px;
}

.th-name {
  width: auto;
}

.th-category,
.th-unit,
.th-type {
  width: 140px;
}

.th-stock {
  width: 100px;
  text-align: right;
}

.th-action {
  width: 120px;
  text-align: center;
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
  background: #f8f7ff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* ===== BADGES ===== */
.code-badge {
  display: inline-block;
  padding: 6px 12px;
  background: #ede9fe;
  color: #6d28d9;
  font-weight: 600;
  font-size: 13px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
}

.category-badge {
  display: inline-block;
  padding: 6px 12px;
  background: #e0e7ff;
  color: #4338ca;
  font-weight: 600;
  font-size: 12px;
  border-radius: 6px;
}

.type-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.badge-stok {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #86efac;
}

.badge-non-stok {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
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

/* ===== ACTION BUTTONS ===== */
.td-action {
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
}

.btn-edit {
  background: #fff3cd;
  color: #856404;
}

.btn-edit:hover {
  background: #ffc107;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 193, 7, 0.3);
}

.btn-delete {
  background: #f8d7da;
  color: #721c24;
}

.btn-delete:hover {
  background: #dc3545;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
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

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s ease;
}

.modal-large {
  max-width: 700px;
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
  padding: 24px 28px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  flex-shrink: 0;
}

.modal-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  font-size: 28px;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 28px;
  color: white;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.form-body {
  padding: 28px;
  overflow-y: auto;
  flex: 1;
}

.modal-body {
  padding: 28px;
  overflow-y: auto;
  flex: 1;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.label-icon {
  font-size: 16px;
}

.required {
  color: #ef4444;
  font-weight: 700;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

textarea.form-control {
  resize: vertical;
  min-height: 90px;
}

.file-input {
  cursor: pointer;
}

.file-name-display {
  font-size: 13px;
  color: #666;
  margin-top: 8px;
}

/* ===== INFO BOX ===== */
.info-box {
  background: linear-gradient(135deg, #fff5e6 0%, #ffe6cc 100%);
  border-left: 4px solid #ff9800;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.info-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.info-text {
  color: #664d03;
  line-height: 1.6;
  margin: 0;
  font-size: 14px;
}

/* ===== LOADING & ERRORS ===== */
.loading-indicator {
  text-align: center;
  color: #666;
  font-size: 14px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.spinner {
  font-size: 24px;
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

.import-errors {
  background: #ffebee;
  border: 2px solid #f44336;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.import-errors h4 {
  margin: 0 0 12px 0;
  color: #c62828;
  font-size: 14px;
  font-weight: 700;
}

.import-errors ul {
  margin: 0;
  padding-left: 20px;
}

.import-errors li {
  color: #c62828;
  font-size: 13px;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  background: #f8f9fa;
  border-top: 2px solid #e9ecef;
  flex-shrink: 0;
}

.btn-cancel {
  background: #e5e7eb;
  color: #374151;
}

.btn-cancel:hover {
  background: #d1d5db;
}

.btn-submit {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .page-header {
    padding: 24px 20px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-buttons {
    width: 100%;
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
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
    width: 100%;
  }

  .search-box {
    width: 100%;
    min-width: auto;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-container {
    width: 95%;
    max-height: 95vh;
  }

  .data-table th,
  .data-table td {
    padding: 12px 16px;
    font-size: 13px;
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style>
