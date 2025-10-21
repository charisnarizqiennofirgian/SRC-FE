<template>
  <DashboardLayout>
    <!-- Page Header with Gradient -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">📏 Data Satuan Produk</h1>
          <p class="page-subtitle">Kelola unit of measurement untuk produk dan bahan baku</p>
        </div>
        <button class="btn-add" @click="openAddModal">
          <span class="btn-icon">➕</span>
          <span>Tambah Satuan</span>
        </button>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="content-card">
      <div class="card-header">
        <div class="header-left">
          <div class="header-icon">📏</div>
          <div>
            <h2 class="card-title">Satuan yang Ada</h2>
            <p class="card-subtitle">Total {{ totalItems }} satuan terdaftar</p>
          </div>
        </div>

        <!-- Search Box -->
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Cari satuan..."
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
              <th class="th-name">Nama Satuan</th>
              <th class="th-short">Nama Singkat</th>
              <th class="th-action">Action</th>
            </tr>
          </thead>
          <tbody>
            <!-- Empty State -->
            <tr v-if="units.length === 0" class="empty-row">
              <td colspan="3">
                <div class="empty-state">
                  <span class="empty-icon">📭</span>
                  <p class="empty-text">Belum ada data satuan</p>
                  <p class="empty-hint">
                    Klik tombol "Tambah Satuan" untuk menambahkan satuan baru
                  </p>
                </div>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr v-for="item in units" :key="item.id" class="data-row">
              <td class="td-name">
                <span class="name-text">{{ item.name }}</span>
              </td>
              <td class="td-short">
                <span class="short-badge">{{ item.short_name }}</span>
              </td>
              <td class="td-action">
                <div class="action-buttons">
                  <button class="action-btn btn-edit" @click="openEditModal(item)" title="Edit">
                    <span>✏️</span>
                  </button>
                  <button class="action-btn btn-delete" @click="deleteUnit(item.id)" title="Hapus">
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

    <!-- Modal Add/Edit -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <div class="modal-title-wrapper">
            <span class="modal-icon">{{ isEditing ? '✏️' : '➕' }}</span>
            <h2 class="modal-title">{{ isEditing ? 'Edit Satuan' : 'Tambah Satuan Baru' }}</h2>
          </div>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-body">
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">📝</span>
                Nama Satuan
                <span class="required">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Contoh: Kilogram"
                class="form-control"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">🔤</span>
                Nama Singkat
                <span class="required">*</span>
              </label>
              <input
                v-model="form.short_name"
                type="text"
                placeholder="Contoh: Kg"
                class="form-control"
                required
              />
              <small class="form-hint">Singkatan yang akan digunakan dalam sistem</small>
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

    <!-- Notification Component -->
    <NotificationComponent
      :show="showNotification"
      :type="notificationType"
      :title="notificationTitle"
      :message="notificationMessage"
      @close="closeNotification"
    />

    <!-- Confirm Dialog -->
    <ConfirmDialog
      :show="showConfirmDialog"
      :title="confirmTitle"
      :message="confirmMessage"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
import apiClient from '../api/axios'
import DashboardLayout from '../components/DashboardLayout.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import NotificationComponent from '../components/AppNotification.vue'
import PaginationComponent from '../components/BasePagination.vue'

// Hanya import satu fungsi dari composable
import { useNotification } from '../composables/useNotification.js'

// Panggil satu fungsi dan ambil semua yang kita butuhkan
const {
  showNotification,
  notificationType,
  notificationTitle,
  notificationMessage,
  showSuccess,
  showError,
  closeNotification,
  showConfirmDialog,
  confirmTitle,
  confirmMessage,
  showConfirm,
  handleConfirm,
  handleCancel,
} = useNotification()

const units = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const perPage = ref(10)
const totalItems = ref(0)
const totalPages = ref(1)

watch(searchQuery, () => {
  currentPage.value = 1
  fetchUnits()
})

const form = reactive({
  id: null,
  name: '',
  short_name: '',
})

const fetchUnits = async () => {
  try {
    const params = new URLSearchParams({
      page: currentPage.value,
      per_page: perPage.value,
    })
    if (searchQuery.value) {
      params.append('search', searchQuery.value)
    }
    const response = await apiClient.get(`/units?${params}`)
    const apiData = response.data.data || response.data
    units.value = apiData.data || apiData
    totalItems.value = apiData.total || units.value.length
    totalPages.value = apiData.last_page || Math.ceil(totalItems.value / perPage.value)
  } catch (error) {
    console.error('Gagal memuat data satuan:', error)
    showError('Gagal', 'Gagal memuat data satuan.')
    units.value = []
    totalItems.value = 0
    totalPages.value = 1
  }
}

const openAddModal = () => {
  isEditing.value = false
  // Reset form dengan benar menggunakan Object.assign
  Object.assign(form, { id: null, name: '', short_name: '' })
  showModal.value = true
}

const openEditModal = (unit) => {
  isEditing.value = true
  Object.assign(form, unit)
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await apiClient.put(`/units/${form.id}`, form)
      showSuccess('Sukses!', 'Satuan berhasil diperbarui.')
    } else {
      await apiClient.post('/units', form)
      showSuccess('Sukses!', 'Satuan berhasil ditambahkan.')
    }
    closeModal()
    fetchUnits()
  } catch (error) {
    const message = error.response?.data?.errors
      ? Object.values(error.response.data.errors).join(', ')
      : 'Gagal menyimpan data.'
    showError('Gagal', message)
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchUnits()
}

const deleteUnit = async (unitId) => {
  showConfirm('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus satuan ini?', async () => {
    try {
      await apiClient.delete(`/units/${unitId}`)
      showSuccess('Berhasil!', 'Satuan telah dihapus.')
      fetchUnits()
    } catch {
      showError('Gagal', 'Gagal menghapus data. Mungkin satuan ini masih digunakan.')
    }
  })
}

onMounted(fetchUnits)
</script>

<style scoped>
/* ===== PAGE HEADER ===== */
.page-header {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  padding: 32px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
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

.btn-add {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  color: #f59e0b;
  border: none;
  padding: 14px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-icon {
  font-size: 18px;
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
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
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

.th-name {
  width: auto;
}

.th-short {
  width: 200px;
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
  background: #fffbeb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* ===== NAME & BADGE ===== */
.name-text {
  font-weight: 600;
  color: #1a1a1a;
}

.short-badge {
  display: inline-block;
  padding: 6px 16px;
  background: #fef3c7;
  color: #92400e;
  font-weight: 700;
  font-size: 13px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  border: 1px solid #fbbf24;
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
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: modalSlideIn 0.3s ease;
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
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
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
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.form-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #6c757d;
  font-style: italic;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  background: #f8f9fa;
  border-top: 2px solid #e9ecef;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
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

.btn-submit:hover {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
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

  .btn-add {
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

  .modal-container {
    width: 95%;
  }

  .data-table th,
  .data-table td {
    padding: 12px 16px;
    font-size: 13px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
