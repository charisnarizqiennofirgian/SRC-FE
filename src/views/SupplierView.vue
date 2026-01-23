<template>
  <DashboardLayout>
    <!-- Page Header with Gradient -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">🚚 Data Supplier</h1>
          <p class="page-subtitle">Kelola informasi pemasok dan vendor perusahaan</p>
        </div>
        <button class="btn-add" @click="openAddModal">
          <span class="btn-icon">➕</span>
          <span>Tambah Supplier</span>
        </button>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="content-card">
      <div class="card-header">
        <div class="header-left">
          <div class="header-icon">🚚</div>
          <div>
            <h2 class="card-title">Daftar Supplier</h2>
            <p class="card-subtitle">Total {{ totalItems }} supplier terdaftar</p>
          </div>
        </div>

        <!-- Search Box -->
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Cari Supplier..."
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
              <th class="th-name">Nama Supplier</th>
              <th class="th-address">Alamat</th>
              <th class="th-phone">No. Telepon</th>
              <th class="th-coa">Akun Hutang</th>
              <th class="th-action">Action</th>
            </tr>
          </thead>
          <tbody>
            <!-- Empty State -->
            <tr v-if="suppliers.length === 0" class="empty-row">
              <td colspan="6">
                <div class="empty-state">
                  <span class="empty-icon">📭</span>
                  <p class="empty-text">Belum ada data supplier</p>
                  <p class="empty-hint">
                    Klik tombol "Tambah Supplier" untuk menambahkan supplier baru
                  </p>
                </div>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr v-for="item in suppliers" :key="item.id" class="data-row">
              <td class="td-code">
                <span class="code-badge">{{ item.code }}</span>
              </td>
              <td class="td-name">{{ item.name }}</td>
              <td class="td-address">{{ item.address || '-' }}</td>
              <td class="td-phone">{{ item.phone || '-' }}</td>
              <td class="td-coa">
                <span v-if="item.payable_account" class="coa-badge">
                  {{ item.payable_account.code }} - {{ item.payable_account.name }}
                </span>
                <span v-else class="coa-empty">Belum diatur</span>
              </td>
              <td class="td-action">
                <div class="action-buttons">
                  <button class="action-btn btn-edit" @click="openEditModal(item)" title="Edit">
                    <span>✏️</span>
                  </button>
                  <button
                    class="action-btn btn-delete"
                    @click="deleteSupplier(item.id)"
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

    <!-- Modal Add/Edit -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <div class="modal-title-wrapper">
            <span class="modal-icon">{{ isEditing ? '✏️' : '➕' }}</span>
            <h2 class="modal-title">{{ isEditing ? 'Edit Supplier' : 'Tambah Supplier Baru' }}</h2>
          </div>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-body">
            <div class="form-row">
              <div class="form-group">
                <label for="supplierCode" class="form-label">
                  <span class="label-icon">🏷️</span>
                  Kode Supplier
                  <span class="required">*</span>
                </label>
                <input
                  type="text"
                  id="supplierCode"
                  v-model="supplierForm.code"
                  placeholder="Contoh: SUP001"
                  class="form-control"
                  required
                />
              </div>

              <div class="form-group">
                <label for="supplierName" class="form-label">
                  <span class="label-icon">🏢</span>
                  Nama Supplier
                  <span class="required">*</span>
                </label>
                <input
                  type="text"
                  id="supplierName"
                  v-model="supplierForm.name"
                  placeholder="Contoh: PT Sumber Makmur"
                  class="form-control"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="supplierAddress" class="form-label">
                <span class="label-icon">📍</span>
                Alamat
              </label>
              <textarea
                id="supplierAddress"
                v-model="supplierForm.address"
                rows="3"
                placeholder="Masukkan alamat lengkap supplier (opsional)"
                class="form-control"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="supplierPhone" class="form-label">
                  <span class="label-icon">📞</span>
                  No. Telepon
                </label>
                <input
                  type="text"
                  id="supplierPhone"
                  v-model="supplierForm.phone"
                  placeholder="Contoh: 021-12345678"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="payableAccount" class="form-label">
                  <span class="label-icon">💰</span>
                  Akun Hutang
                </label>
                <select
                  id="payableAccount"
                  v-model="supplierForm.payable_account_id"
                  class="form-control"
                >
                  <option :value="null">-- Pilih Akun Hutang --</option>
                  <option v-for="coa in coaOptions" :key="coa.id" :value="coa.id">
                    {{ coa.code }} - {{ coa.name }}
                  </option>
                </select>
              </div>
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
import { ref, onMounted, watch } from 'vue'
import apiClient from '../api/axios'
import DashboardLayout from '../components/DashboardLayout.vue'
import PaginationComponent from '../components/BasePagination.vue'
import NotificationComponent from '../components/AppNotification.vue'
import { useNotification, useConfirmDialog } from '../composables/useNotification.js'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const searchQuery = ref('')
const suppliers = ref([])
const coaOptions = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const supplierForm = ref({
  id: null,
  code: '',
  name: '',
  address: '',
  phone: '',
  payable_account_id: null,
})

const currentPage = ref(1)
const perPage = ref(10)
const totalItems = ref(0)
const totalPages = ref(1)

const {
  showNotification,
  notificationType,
  notificationTitle,
  notificationMessage,
  showSuccess,
  showError,
  closeNotification,
} = useNotification()

const {
  showConfirmDialog,
  confirmTitle,
  confirmMessage,
  showConfirm,
  handleConfirm,
  handleCancel,
} = useConfirmDialog()

watch(searchQuery, () => {
  currentPage.value = 1
  fetchSuppliers()
})

const fetchSuppliers = async () => {
  try {
    const params = {
      page: currentPage.value,
      per_page: perPage.value,
      search: searchQuery.value || undefined,
    }

    const response = await apiClient.get('/suppliers', { params })

    suppliers.value = response.data.data
    totalItems.value = response.data.total
    totalPages.value = response.data.last_page
    currentPage.value = response.data.current_page
  } catch (error) {
    console.error('Gagal mengambil data Supplier:', error)
    showError('Gagal memuat data supplier', 'Terjadi kesalahan saat mengambil data')
  }
}

const fetchCoaKewajiban = async () => {
  try {
    const response = await apiClient.get('/coa/by-type/KEWAJIBAN')
    coaOptions.value = response.data.data
  } catch (error) {
    console.error('Gagal mengambil data COA:', error)
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchSuppliers()
}

const openAddModal = () => {
  isEditing.value = false
  supplierForm.value = {
    id: null,
    code: '',
    name: '',
    address: '',
    phone: '',
    payable_account_id: null,
  }
  showModal.value = true
}

const openEditModal = (supplier) => {
  isEditing.value = true
  supplierForm.value = {
    id: supplier.id,
    code: supplier.code,
    name: supplier.name,
    address: supplier.address,
    phone: supplier.phone,
    payable_account_id: supplier.payable_account_id,
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  if (isEditing.value) {
    try {
      const response = await apiClient.put(
        `/suppliers/${supplierForm.value.id}`,
        supplierForm.value,
      )
      if (response.status === 200) {
        showSuccess('Supplier berhasil diperbarui!')
        await fetchSuppliers()
        closeModal()
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal memperbarui Supplier.'
      showError('Gagal memperbarui supplier', message)
    }
  } else {
    try {
      const response = await apiClient.post('/suppliers', supplierForm.value)
      if (response.status === 201) {
        showSuccess('Supplier berhasil ditambahkan!')
        await fetchSuppliers()
        closeModal()
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menambahkan Supplier.'
      showError('Gagal menambahkan supplier', message)
    }
  }
}

const deleteSupplier = async (id) => {
  showConfirm('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus Supplier ini?', async () => {
    try {
      await apiClient.delete(`/suppliers/${id}`)
      showSuccess('Supplier berhasil dihapus!')
      await fetchSuppliers()
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menghapus Supplier.'
      showError('Gagal menghapus supplier', message)
    }
  })
}

onMounted(() => {
  fetchSuppliers()
  fetchCoaKewajiban()
})
</script>

<style scoped>
/* ===== PAGE HEADER ===== */
.page-header {
  background: linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%);
  padding: 32px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
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
  color: #ff6b6b;
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
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
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

.th-address {
  width: 250px;
}

.th-phone {
  width: 150px;
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
  background: #fff5f5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* ===== CODE BADGE ===== */
.code-badge {
  display: inline-block;
  padding: 6px 12px;
  background: #ffe3e3;
  color: #c92a2a;
  font-weight: 600;
  font-size: 13px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
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
  background: linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%);
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
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

textarea.form-control {
  resize: vertical;
  min-height: 90px;
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

  .form-row {
    grid-template-columns: 1fr;
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
