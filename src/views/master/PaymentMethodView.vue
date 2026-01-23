<template>
  <DashboardLayout>
    <!-- Page Header -->
    <div class="page-header">
      <div class="breadcrumb">
        <router-link to="/" class="breadcrumb-item">
          <span class="breadcrumb-icon">🏠</span>
          Dashboard
        </router-link>
        <span class="breadcrumb-separator">→</span>
        <span class="breadcrumb-current">Metode Pembayaran</span>
      </div>
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">
            <span class="title-icon">💳</span>
            Metode Pembayaran
          </h1>
          <p class="page-subtitle">Kelola metode pembayaran (Kas & Bank)</p>
        </div>
        <button class="btn-primary" @click="openAddModal">
          <span class="btn-icon">➕</span>
          <span class="btn-text">Tambah Metode</span>
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-container">
      <div class="stat-card stat-total">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ paymentMethods.length }}</div>
          <div class="stat-label">Total Metode</div>
        </div>
      </div>
      <div class="stat-card stat-bank">
        <div class="stat-icon">🏦</div>
        <div class="stat-content">
          <div class="stat-value">{{ countByType('BANK') }}</div>
          <div class="stat-label">Bank</div>
        </div>
      </div>
      <div class="stat-card stat-cash">
        <div class="stat-icon">💵</div>
        <div class="stat-content">
          <div class="stat-value">{{ countByType('CASH') }}</div>
          <div class="stat-label">Kas</div>
        </div>
      </div>
      <div class="stat-card stat-active">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-value">{{ countActive }}</div>
          <div class="stat-label">Aktif</div>
        </div>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="content-card">
      <div class="card-header">
        <div class="header-left">
          <div class="header-icon">💳</div>
          <div class="header-info">
            <h2 class="card-title">Daftar Metode Pembayaran</h2>
            <p class="card-subtitle">
              {{ filteredMethods.length }} dari {{ paymentMethods.length }} metode
            </p>
          </div>
        </div>

        <!-- Search Box -->
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Cari metode pembayaran..."
            class="search-input"
            v-model="searchQuery"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search" title="Clear">
            ✕
          </button>
        </div>
      </div>

      <!-- Table Wrapper -->
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-name">
                <div class="th-content">
                  <span class="th-icon">📝</span>
                  <span>Nama Metode</span>
                </div>
              </th>
              <th class="th-type">
                <div class="th-content">
                  <span class="th-icon">📂</span>
                  <span>Tipe</span>
                </div>
              </th>
              <th class="th-account">
                <div class="th-content">
                  <span class="th-icon">📊</span>
                  <span>Akun COA</span>
                </div>
              </th>
              <th class="th-status">
                <div class="th-content">
                  <span class="th-icon">✅</span>
                  <span>Status</span>
                </div>
              </th>
              <th class="th-action">
                <div class="th-content">
                  <span class="th-icon">⚙️</span>
                  <span>Action</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Empty State -->
            <tr v-if="filteredMethods.length === 0" class="empty-row">
              <td colspan="5">
                <div class="empty-state">
                  <span class="empty-icon">📭</span>
                  <p class="empty-text">
                    {{ searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada metode pembayaran' }}
                  </p>
                  <p class="empty-hint" v-if="!searchQuery">
                    Klik tombol "Tambah Metode" untuk menambahkan metode baru
                  </p>
                  <button v-else @click="searchQuery = ''" class="btn-reset-search">
                    Reset Pencarian
                  </button>
                </div>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr
              v-for="(item, index) in filteredMethods"
              :key="item.id"
              class="data-row"
              :class="{ 'row-even': index % 2 === 0 }"
            >
              <td class="td-name">
                <div class="name-wrapper">
                  <span class="name-icon">💳</span>
                  <span class="name-text">{{ item.name }}</span>
                </div>
              </td>
              <td class="td-type">
                <span :class="['type-badge', 'type-' + item.type.toLowerCase()]">
                  <span class="badge-icon">{{ item.type === 'BANK' ? '🏦' : '💵' }}</span>
                  <span class="badge-text">{{ item.type === 'BANK' ? 'Bank' : 'Kas' }}</span>
                </span>
              </td>
              <td class="td-account">
                <div v-if="item.account" class="account-wrapper">
                  <span class="account-code">{{ item.account.code }}</span>
                  <span class="account-name">{{ item.account.name }}</span>
                </div>
                <span v-else class="account-empty">Tidak terhubung</span>
              </td>
              <td class="td-status">
                <span
                  :class="['status-badge', item.is_active ? 'status-active' : 'status-inactive']"
                >
                  <span class="status-dot"></span>
                  <span>{{ item.is_active ? 'Aktif' : 'Nonaktif' }}</span>
                </span>
              </td>
              <td class="td-action">
                <div class="action-buttons">
                  <button class="action-btn btn-edit" @click="openEditModal(item)" title="Edit">
                    <span class="action-icon">✏️</span>
                  </button>
                  <button
                    class="action-btn btn-delete"
                    @click="deleteMethod(item.id)"
                    title="Hapus"
                  >
                    <span class="action-icon">🗑️</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Add/Edit -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-container modal-payment" @click.stop>
        <div class="modal-header">
          <div class="modal-title-wrapper">
            <span class="modal-icon">{{ isEditing ? '✏️' : '➕' }}</span>
            <div class="modal-title-content">
              <h2 class="modal-title">{{ isEditing ? 'Edit Metode' : 'Tambah Metode Baru' }}</h2>
              <p class="modal-subtitle">
                {{
                  isEditing
                    ? 'Perbarui informasi metode pembayaran'
                    : 'Isi formulir untuk menambah metode'
                }}
              </p>
            </div>
          </div>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="form-group">
              <label for="methodName" class="form-label">
                <span class="label-icon">📝</span>
                <span class="label-text">Nama Metode</span>
                <span class="required">*</span>
              </label>
              <input
                type="text"
                id="methodName"
                v-model="methodForm.name"
                placeholder="Contoh: Transfer Mandiri IDR"
                class="form-control"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">📂</span>
                <span class="label-text">Tipe Metode</span>
                <span class="required">*</span>
              </label>
              <div class="radio-group">
                <label class="radio-card" :class="{ active: methodForm.type === 'BANK' }">
                  <input type="radio" v-model="methodForm.type" value="BANK" />
                  <div class="radio-content">
                    <span class="radio-icon">🏦</span>
                    <span class="radio-text">Bank</span>
                  </div>
                </label>
                <label class="radio-card" :class="{ active: methodForm.type === 'CASH' }">
                  <input type="radio" v-model="methodForm.type" value="CASH" />
                  <div class="radio-content">
                    <span class="radio-icon">💵</span>
                    <span class="radio-text">Kas</span>
                  </div>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label for="accountId" class="form-label">
                <span class="label-icon">📊</span>
                <span class="label-text">Link ke Akun COA</span>
                <span class="required">*</span>
              </label>
              <select id="accountId" v-model="methodForm.account_id" class="form-control" required>
                <option :value="null">-- Pilih Akun COA --</option>
                <option v-for="coa in coaOptions" :key="coa.id" :value="coa.id">
                  {{ coa.code }} - {{ coa.name }}
                </option>
              </select>
              <small class="form-hint">
                <span class="hint-icon">ℹ️</span>
                Hanya menampilkan akun tipe ASET
              </small>
            </div>

            <div class="form-group" v-if="isEditing">
              <label class="form-label">
                <span class="label-icon">✅</span>
                <span class="label-text">Status Metode</span>
              </label>
              <div class="toggle-wrapper">
                <label class="toggle-switch">
                  <input type="checkbox" v-model="methodForm.is_active" />
                  <span class="toggle-slider"></span>
                </label>
                <span class="toggle-label">
                  {{ methodForm.is_active ? '🟢 Aktif' : '⚪ Nonaktif' }}
                </span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-cancel" @click="closeModal">
              <span class="btn-icon">❌</span>
              <span>Batal</span>
            </button>
            <button type="submit" class="btn btn-submit">
              <span class="btn-icon">💾</span>
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
import { ref, computed, onMounted } from 'vue'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import NotificationComponent from '../../components/AppNotification.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import { useNotification, useConfirmDialog } from '../../composables/useNotification.js'

const searchQuery = ref('')
const paymentMethods = ref([])
const coaOptions = ref([])
const showModal = ref(false)
const isEditing = ref(false)

const methodForm = ref({
  id: null,
  name: '',
  type: 'BANK',
  account_id: null,
  is_active: true,
})

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

const filteredMethods = computed(() => {
  if (!searchQuery.value) return paymentMethods.value

  const query = searchQuery.value.toLowerCase()
  return paymentMethods.value.filter(
    (item) =>
      item.name.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      (item.account && item.account.name.toLowerCase().includes(query)),
  )
})

const countByType = (type) => {
  return paymentMethods.value.filter((item) => item.type === type).length
}

const countActive = computed(() => {
  return paymentMethods.value.filter((item) => item.is_active).length
})

const fetchPaymentMethods = async () => {
  try {
    const response = await apiClient.get('/payment-methods')
    paymentMethods.value = response.data.data
  } catch (error) {
    console.error('Gagal mengambil data:', error)
    showError('Gagal memuat data', 'Terjadi kesalahan saat mengambil data')
  }
}

const fetchCoaAset = async () => {
  try {
    const response = await apiClient.get('/coa/by-type/ASET')
    coaOptions.value = response.data.data
  } catch (error) {
    console.error('Gagal mengambil data COA:', error)
  }
}

const openAddModal = () => {
  isEditing.value = false
  methodForm.value = {
    id: null,
    name: '',
    type: 'BANK',
    account_id: null,
    is_active: true,
  }
  showModal.value = true
}

const openEditModal = (method) => {
  isEditing.value = true
  methodForm.value = {
    id: method.id,
    name: method.name,
    type: method.type,
    account_id: method.account_id,
    is_active: method.is_active,
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
        `/payment-methods/${methodForm.value.id}`,
        methodForm.value,
      )
      if (response.data.success) {
        showSuccess('Metode pembayaran berhasil diperbarui!')
        await fetchPaymentMethods()
        closeModal()
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal memperbarui data.'
      showError('Gagal memperbarui', message)
    }
  } else {
    try {
      const response = await apiClient.post('/payment-methods', methodForm.value)
      if (response.data.success) {
        showSuccess('Metode pembayaran berhasil ditambahkan!')
        await fetchPaymentMethods()
        closeModal()
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menambahkan data.'
      showError('Gagal menambahkan', message)
    }
  }
}

const deleteMethod = async (id) => {
  showConfirm(
    'Konfirmasi Hapus',
    'Apakah Anda yakin ingin menghapus metode pembayaran ini?',
    async () => {
      try {
        const response = await apiClient.delete(`/payment-methods/${id}`)
        if (response.data.success) {
          showSuccess('Metode pembayaran berhasil dihapus!')
          await fetchPaymentMethods()
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Gagal menghapus data.'
        showError('Gagal menghapus', message)
      }
    },
  )
}

onMounted(() => {
  fetchPaymentMethods()
  fetchCoaAset()
})
</script>

<style scoped>
/* ============================================
   PAGE LAYOUT
   ============================================ */
.page-header {
  margin-bottom: 24px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 13px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.breadcrumb-item:hover {
  background: #eff6ff;
  color: #2563eb;
}

.breadcrumb-icon {
  font-size: 14px;
}

.breadcrumb-separator {
  color: #cbd5e1;
}

.breadcrumb-current {
  color: #64748b;
  font-weight: 600;
}

.header-content {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 28px 32px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.25);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.header-text {
  flex: 1;
  min-width: 250px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title-icon {
  font-size: 36px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.95);
  font-size: 15px;
  margin: 0;
  font-weight: 400;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background: white;
  color: #6366f1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.btn-icon {
  font-size: 16px;
}

.btn-text {
  white-space: nowrap;
}

/* ============================================
   STATS CARDS
   ============================================ */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 40px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.stat-total .stat-icon {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
}

.stat-bank .stat-icon {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.stat-cash .stat-icon {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.stat-active .stat-icon {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  color: #1f2937;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* ============================================
   CONTENT CARD
   ============================================ */
.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(to right, #fafbfc 0%, #ffffff 100%);
  border-bottom: 2px solid #f3f4f6;
  gap: 20px;
  flex-wrap: wrap;
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
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  letter-spacing: -0.3px;
}

.card-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 320px;
}

.search-icon {
  position: absolute;
  left: 14px;
  font-size: 16px;
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 11px 40px 11px 42px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.clear-search {
  position: absolute;
  right: 12px;
  background: #e5e7eb;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  color: #6b7280;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-search:hover {
  background: #d1d5db;
}

/* ============================================
   TABLE
   ============================================ */
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.data-table thead {
  background: linear-gradient(180deg, #1f2937 0%, #111827 100%);
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table th {
  padding: 16px 20px;
  text-align: left;
  font-weight: 700;
  font-size: 12px;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.th-icon {
  font-size: 16px;
}

.th-type,
.th-status,
.th-action {
  text-align: center !important;
}

.th-action .th-content {
  justify-content: center;
}

.data-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #1f2937;
}

.data-row {
  background: white;
  transition: all 0.2s ease;
}

.data-row:hover {
  background: #f9fafb;
  transform: scale(1.001);
}

.row-even {
  background: #fafbfc;
}

/* Empty State */
.empty-row td {
  padding: 80px 20px !important;
}

.empty-state {
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.4;
}

.empty-text {
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 16px;
}

.btn-reset-search {
  padding: 10px 20px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reset-search:hover {
  background: #4f46e5;
  transform: translateY(-2px);
}

/* Table Cell Styles */
.name-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.name-icon {
  font-size: 20px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;
}

.name-text {
  font-weight: 600;
  color: #1f2937;
}

.td-type,
.td-status,
.td-action {
  text-align: center !important;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.type-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.badge-icon {
  font-size: 14px;
}

.type-bank {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border: 2px solid #3b82f6;
}

.type-cash {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 2px solid #10b981;
}

.account-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.account-code {
  font-weight: 700;
  font-size: 12px;
  color: #374151;
  font-family: 'Courier New', monospace;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}

.account-name {
  font-size: 13px;
  color: #6b7280;
}

.account-empty {
  color: #9ca3af;
  font-style: italic;
  font-size: 13px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
  animation: pulse 2s ease-in-out infinite;
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

.status-active {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 2px solid #10b981;
}

.status-inactive {
  background: #f3f4f6;
  color: #6b7280;
  border: 2px solid #d1d5db;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.action-icon {
  font-size: 16px;
}

.btn-edit {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.btn-delete {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

/* ============================================
   MODAL STYLES
   ============================================ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 28px;
  border-bottom: 2px solid #f3f4f6;
  background: linear-gradient(to right, #fafbfc 0%, #ffffff 100%);
}

.modal-title-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.modal-icon {
  font-size: 40px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  flex-shrink: 0;
}

.modal-title-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  letter-spacing: -0.3px;
}

.modal-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  font-size: 24px;
  color: #6b7280;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-close:hover {
  background: #ef4444;
  color: white;
  transform: rotate(90deg);
}

.modal-body {
  padding: 28px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 13px;
  color: #374151;
}

.label-icon {
  font-size: 16px;
}

.required {
  color: #ef4444;
  font-weight: 700;
}

.form-control {
  padding: 11px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.radio-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.radio-card {
  position: relative;
  cursor: pointer;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  transition: all 0.2s ease;
  background: white;
}

.radio-card:hover {
  border-color: #6366f1;
  background: #f9fafb;
}

.radio-card.active {
  border-color: #6366f1;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.radio-card input[type='radio'] {
  position: absolute;
  opacity: 0;
}

.radio-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.radio-icon {
  font-size: 32px;
}

.radio-text {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.hint-icon {
  font-size: 14px;
}

.toggle-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
}

.toggle-switch {
  position: relative;
  width: 52px;
  height: 28px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background: #d1d5db;
  border-radius: 28px;
  transition: all 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background: #6366f1;
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(24px);
}

.toggle-label {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  background: #f9fafb;
  border-top: 2px solid #f3f4f6;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 24px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.btn-cancel {
  background: #f3f4f6;
  color: #4b5563;
}

.btn-cancel:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.btn-submit {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-wrapper {
    min-width: auto;
  }

  .radio-group {
    grid-template-columns: 1fr;
  }
}
</style>
