<template>
  <DashboardLayout>
    <!-- Page Header with Gradient -->
    <div class="page-header">
      <div class="breadcrumb">
        <router-link to="/" class="breadcrumb-item">
          <span class="breadcrumb-icon">🏠</span>
          Dashboard
        </router-link>
        <span class="breadcrumb-separator">→</span>
        <span class="breadcrumb-current">Chart of Account</span>
      </div>
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">
            <span class="title-icon">💰</span>
            Chart of Account
          </h1>
          <p class="page-subtitle">Kelola daftar akun keuangan perusahaan</p>
        </div>
        <div class="header-actions">
          <button class="btn-action btn-download" @click="downloadTemplate">
            <span class="btn-icon">📄</span>
            <span class="btn-text">Template</span>
          </button>
          <button class="btn-action btn-import" @click="openImportModal">
            <span class="btn-icon">📥</span>
            <span class="btn-text">Import</span>
          </button>
          <button class="btn-action btn-export" @click="exportData">
            <span class="btn-icon">📤</span>
            <span class="btn-text">Export</span>
          </button>
          <button class="btn-primary" @click="openAddModal">
            <span class="btn-icon">➕</span>
            <span class="btn-text">Tambah Akun</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-container">
      <div class="stat-card stat-total">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ totalItems }}</div>
          <div class="stat-label">Total Akun</div>
        </div>
      </div>
      <div class="stat-card stat-asset">
        <div class="stat-icon">🏢</div>
        <div class="stat-content">
          <div class="stat-value">{{ countByType('ASET') }}</div>
          <div class="stat-label">Aset</div>
        </div>
      </div>
      <div class="stat-card stat-liability">
        <div class="stat-icon">📋</div>
        <div class="stat-content">
          <div class="stat-value">{{ countByType('KEWAJIBAN') }}</div>
          <div class="stat-label">Kewajiban</div>
        </div>
      </div>
      <div class="stat-card stat-equity">
        <div class="stat-icon">💎</div>
        <div class="stat-content">
          <div class="stat-value">{{ countByType('MODAL') }}</div>
          <div class="stat-label">Modal</div>
        </div>
      </div>
      <div class="stat-card stat-revenue">
        <div class="stat-icon">💵</div>
        <div class="stat-content">
          <div class="stat-value">{{ countByType('PENDAPATAN') }}</div>
          <div class="stat-label">Pendapatan</div>
        </div>
      </div>
      <div class="stat-card stat-expense">
        <div class="stat-icon">💸</div>
        <div class="stat-content">
          <div class="stat-value">{{ countByType('BIAYA') }}</div>
          <div class="stat-label">Biaya</div>
        </div>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="content-card">
      <div class="card-header">
        <div class="header-left">
          <div class="header-icon">📋</div>
          <div class="header-info">
            <h2 class="card-title">Daftar Akun</h2>
            <p class="card-subtitle">{{ filteredAccounts.length }} dari {{ totalItems }} akun</p>
          </div>
        </div>

        <!-- Search Box -->
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Cari kode atau nama akun..."
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
              <th class="th-code">
                <div class="th-content">
                  <span class="th-icon">🏷️</span>
                  <span>Kode</span>
                </div>
              </th>
              <th class="th-name">
                <div class="th-content">
                  <span class="th-icon">📝</span>
                  <span>Nama Akun</span>
                </div>
              </th>
              <th class="th-type">
                <div class="th-content">
                  <span class="th-icon">📂</span>
                  <span>Tipe</span>
                </div>
              </th>
              <th class="th-currency">
                <div class="th-content">
                  <span class="th-icon">💰</span>
                  <span>Mata Uang</span>
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
            <tr v-if="filteredAccounts.length === 0" class="empty-row">
              <td colspan="6">
                <div class="empty-state">
                  <span class="empty-icon">📭</span>
                  <p class="empty-text">
                    {{ searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada data akun' }}
                  </p>
                  <p class="empty-hint" v-if="!searchQuery">
                    Klik tombol "Tambah Akun" atau "Import" untuk menambahkan akun
                  </p>
                  <button v-else @click="searchQuery = ''" class="btn-reset-search">
                    Reset Pencarian
                  </button>
                </div>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr
              v-for="(item, index) in filteredAccounts"
              :key="item.id"
              class="data-row"
              :class="{ 'row-even': index % 2 === 0 }"
            >
              <td class="td-code">
                <span class="code-badge">{{ item.code }}</span>
              </td>
              <td class="td-name">
                <div class="name-wrapper">
                  <span class="name-text">{{ item.name }}</span>
                </div>
              </td>
              <td class="td-type">
                <span :class="['type-badge', 'type-' + item.type.toLowerCase()]">
                  <span class="badge-icon">{{ getTypeIcon(item.type) }}</span>
                  <span class="badge-text">{{ getTypeLabel(item.type) }}</span>
                </span>
              </td>
              <td class="td-currency">
                <span class="currency-badge">{{ item.currency }}</span>
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
                    @click="deleteAccount(item.id)"
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
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <div class="modal-title-wrapper">
            <span class="modal-icon">{{ isEditing ? '✏️' : '➕' }}</span>
            <div class="modal-title-content">
              <h2 class="modal-title">{{ isEditing ? 'Edit Akun' : 'Tambah Akun Baru' }}</h2>
              <p class="modal-subtitle">
                {{ isEditing ? 'Perbarui informasi akun' : 'Isi formulir untuk menambah akun' }}
              </p>
            </div>
          </div>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label for="accountCode" class="form-label">
                  <span class="label-icon">🏷️</span>
                  <span class="label-text">Kode Akun</span>
                  <span class="required">*</span>
                </label>
                <input
                  type="text"
                  id="accountCode"
                  v-model="accountForm.code"
                  placeholder="Contoh: 110.01.000"
                  class="form-control"
                  required
                />
              </div>

              <div class="form-group">
                <label for="accountName" class="form-label">
                  <span class="label-icon">📝</span>
                  <span class="label-text">Nama Akun</span>
                  <span class="required">*</span>
                </label>
                <input
                  type="text"
                  id="accountName"
                  v-model="accountForm.name"
                  placeholder="Contoh: Kas Besar"
                  class="form-control"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="accountType" class="form-label">
                  <span class="label-icon">📂</span>
                  <span class="label-text">Tipe Akun</span>
                  <span class="required">*</span>
                </label>
                <select id="accountType" v-model="accountForm.type" class="form-control" required @change="accountForm.sub_type = ''">
                  <option value="">-- Pilih Tipe --</option>
                  <option v-for="(label, value) in accountTypes" :key="value" :value="value">
                    {{ label }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="accountCurrency" class="form-label">
                  <span class="label-icon">💰</span>
                  <span class="label-text">Mata Uang</span>
                </label>
                <select id="accountCurrency" v-model="accountForm.currency" class="form-control">
                  <option value="IDR">IDR - Rupiah</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>

            <div class="form-group" v-if="accountForm.type === 'ASET' || accountForm.type === 'KEWAJIBAN'">
              <label for="accountSubType" class="form-label">
                <span class="label-icon">🗂️</span>
                <span class="label-text">Sub Tipe</span>
                <span class="label-hint">(untuk pengelompokan di Neraca)</span>
              </label>
              <select id="accountSubType" v-model="accountForm.sub_type" class="form-control">
                <option value="">-- Tanpa Sub Tipe --</option>
                <template v-if="accountForm.type === 'ASET'">
                  <option value="aktiva_lancar">Aktiva Lancar</option>
                  <option value="aktiva_tetap">Aktiva Tetap</option>
                </template>
                <template v-if="accountForm.type === 'KEWAJIBAN'">
                  <option value="hutang_lancar">Hutang Lancar</option>
                  <option value="hutang_jangka_panjang">Hutang Jangka Panjang</option>
                </template>
              </select>
            </div>

            <div class="form-group" v-if="isEditing">
              <label class="form-label">
                <span class="label-icon">✅</span>
                <span class="label-text">Status Akun</span>
              </label>
              <div class="toggle-wrapper">
                <label class="toggle-switch">
                  <input type="checkbox" v-model="accountForm.is_active" />
                  <span class="toggle-slider"></span>
                </label>
                <span class="toggle-label">
                  {{ accountForm.is_active ? '🟢 Aktif' : '⚪ Nonaktif' }}
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

    <!-- Modal Import -->
    <div v-if="showImportModal" class="modal-overlay" @click="closeImportModal">
      <div class="modal-container modal-import" @click.stop>
        <div class="modal-header">
          <div class="modal-title-wrapper">
            <span class="modal-icon">📥</span>
            <div class="modal-title-content">
              <h2 class="modal-title">Import Data COA</h2>
              <p class="modal-subtitle">Upload file Excel untuk import massal</p>
            </div>
          </div>
          <button class="modal-close" @click="closeImportModal">&times;</button>
        </div>

        <form @submit.prevent="handleImport">
          <div class="modal-body">
            <div class="import-guide">
              <div class="guide-header">
                <span class="guide-icon">💡</span>
                <span class="guide-title">Petunjuk Import</span>
              </div>
              <ul class="guide-list">
                <li>
                  <span class="list-icon">1️⃣</span>
                  Download template terlebih dahulu
                </li>
                <li>
                  <span class="list-icon">2️⃣</span>
                  Isi data sesuai format template
                </li>
                <li>
                  <span class="list-icon">3️⃣</span>
                  Kolom TYPE: ASET, KEWAJIBAN, MODAL, PENDAPATAN, BIAYA
                </li>
                <li>
                  <span class="list-icon">⚠️</span>
                  Data dengan kode duplikat akan dilewati
                </li>
              </ul>
            </div>

            <div class="form-group">
              <label for="importFile" class="form-label">
                <span class="label-icon">📁</span>
                <span class="label-text">Pilih File Excel</span>
                <span class="required">*</span>
              </label>
              <div class="file-input-wrapper">
                <input
                  type="file"
                  id="importFile"
                  ref="importFileInput"
                  accept=".xlsx,.xls"
                  class="file-input"
                  @change="handleFileChange"
                  required
                />
                <label for="importFile" class="file-input-label">
                  <span class="file-icon">📎</span>
                  <span class="file-text">
                    {{ importFile ? importFile.name : 'Pilih file...' }}
                  </span>
                </label>
              </div>
              <small class="form-hint">Format: .xlsx, .xls (Maks. 5MB)</small>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-cancel" @click="closeImportModal">
              <span class="btn-icon">❌</span>
              <span>Batal</span>
            </button>
            <button type="submit" class="btn btn-submit" :disabled="!importFile || isImporting">
              <span class="btn-icon">{{ isImporting ? '⏳' : '📥' }}</span>
              <span>{{ isImporting ? 'Mengimport...' : 'Import Sekarang' }}</span>
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
const accounts = ref([])
const showModal = ref(false)
const showImportModal = ref(false)
const isEditing = ref(false)
const isImporting = ref(false)
const importFile = ref(null)
const importFileInput = ref(null)

const accountForm = ref({
  id: null,
  code: '',
  name: '',
  type: '',
  currency: 'IDR',
  is_active: true,
})

const accountTypes = {
  ASET: 'Aset (Harta)',
  KEWAJIBAN: 'Kewajiban (Hutang)',
  MODAL: 'Modal (Ekuitas)',
  PENDAPATAN: 'Pendapatan',
  HPP: 'HPP (Harga Pokok Penjualan)',
  BIAYA: 'Biaya (Beban)',
}

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

const totalItems = computed(() => accounts.value.length)

const filteredAccounts = computed(() => {
  if (!searchQuery.value) return accounts.value

  const query = searchQuery.value.toLowerCase()
  return accounts.value.filter(
    (item) =>
      item.code.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query),
  )
})

const countByType = (type) => {
  return accounts.value.filter((item) => item.type === type).length
}

const getTypeLabel = (type) => {
  return accountTypes[type] || type
}

const getTypeIcon = (type) => {
  const icons = {
    ASET: '🏢',
    KEWAJIBAN: '📋',
    MODAL: '💎',
    PENDAPATAN: '💵',
    HPP: '📦',
    BIAYA: '💸',
  }
  return icons[type] || '📂'
}

const fetchAccounts = async () => {
  try {
    const response = await apiClient.get('/coa')
    accounts.value = response.data.data
  } catch (error) {
    console.error('Gagal mengambil data COA:', error)
    showError('Gagal memuat data', 'Terjadi kesalahan saat mengambil data akun')
  }
}

const openAddModal = () => {
  isEditing.value = false
  accountForm.value = {
    id: null,
    code: '',
    name: '',
    type: '',
    sub_type: '',
    currency: 'IDR',
    is_active: true,
  }
  showModal.value = true
}

const openEditModal = (account) => {
  isEditing.value = true
  accountForm.value = { ...account }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  if (isEditing.value) {
    try {
      const response = await apiClient.put(`/coa/${accountForm.value.id}`, accountForm.value)
      if (response.data.success) {
        showSuccess('Akun berhasil diperbarui!')
        await fetchAccounts()
        closeModal()
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal memperbarui akun.'
      showError('Gagal memperbarui akun', message)
    }
  } else {
    try {
      const response = await apiClient.post('/coa', accountForm.value)
      if (response.data.success) {
        showSuccess('Akun berhasil ditambahkan!')
        await fetchAccounts()
        closeModal()
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menambahkan akun.'
      showError('Gagal menambahkan akun', message)
    }
  }
}

const deleteAccount = async (id) => {
  showConfirm('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus akun ini?', async () => {
    try {
      const response = await apiClient.delete(`/coa/${id}`)
      if (response.data.success) {
        showSuccess('Akun berhasil dihapus!')
        await fetchAccounts()
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menghapus akun.'
      showError('Gagal menghapus akun', message)
    }
  })
}

const downloadTemplate = async () => {
  try {
    const response = await apiClient.get('/coa/template', {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'template_coa.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    showSuccess('Template berhasil didownload!')
  } catch (error) {
    console.error('Gagal download template:', error)
    showError('Gagal download', 'Terjadi kesalahan saat download template')
  }
}

const openImportModal = () => {
  importFile.value = null
  if (importFileInput.value) {
    importFileInput.value.value = ''
  }
  showImportModal.value = true
}

const closeImportModal = () => {
  showImportModal.value = false
  importFile.value = null
}

const handleFileChange = (event) => {
  importFile.value = event.target.files[0] || null
}

const handleImport = async () => {
  if (!importFile.value) return

  isImporting.value = true

  try {
    const formData = new FormData()
    formData.append('file', importFile.value)

    const response = await apiClient.post('/coa/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.data.success) {
      const { imported, skipped } = response.data.data
      showSuccess(`Import berhasil! ${imported} data diimport, ${skipped} data dilewati (duplikat)`)
      await fetchAccounts()
      closeImportModal()
    }
  } catch (error) {
    const message = error.response?.data?.message || 'Gagal import data.'
    showError('Gagal import', message)
  } finally {
    isImporting.value = false
  }
}

const exportData = async () => {
  try {
    const response = await apiClient.get('/coa/export', {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `chart_of_accounts_${new Date().toISOString().slice(0, 10)}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    showSuccess('Data berhasil diexport!')
  } catch (error) {
    console.error('Gagal export data:', error)
    showError('Gagal export', 'Terjadi kesalahan saat export data')
  }
}

onMounted(() => {
  fetchAccounts()
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 28px 32px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
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

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
  color: white;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-action:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  color: #059669;
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
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
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
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.stat-asset .stat-icon {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.stat-liability .stat-icon {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.stat-equity .stat-icon {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
}

.stat-revenue .stat-icon {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.stat-expense .stat-icon {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
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
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
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
.th-currency,
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
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reset-search:hover {
  background: #059669;
  transform: translateY(-2px);
}

/* Table Cell Styles */
.code-badge {
  display: inline-block;
  padding: 6px 12px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
  font-weight: 700;
  font-size: 13px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  border: 1px solid #d1d5db;
}

.name-wrapper {
  display: flex;
  align-items: center;
}

.name-text {
  font-weight: 500;
  color: #1f2937;
}

.td-type,
.td-currency,
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

.type-aset {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 2px solid #10b981;
}

.type-kewajiban {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 2px solid #ef4444;
}

.type-modal {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border: 2px solid #3b82f6;
}

.type-pendapatan {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border: 2px solid #f59e0b;
}

.type-biaya {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  color: #6b21a8;
  border: 2px solid #a855f7;
}

.currency-badge {
  display: inline-block;
  padding: 5px 12px;
  background: #f3f4f6;
  color: #4b5563;
  font-weight: 600;
  font-size: 12px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
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
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

.modal-import {
  max-width: 600px;
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
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

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
.label-hint {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 400;
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
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
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
  background: #10b981;
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(24px);
}

.toggle-label {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
}

.import-guide {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2px solid #3b82f6;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.guide-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.guide-icon {
  font-size: 24px;
}

.guide-title {
  font-weight: 700;
  font-size: 15px;
  color: #1e40af;
}

.guide-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.guide-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: #1e40af;
  line-height: 1.5;
}

.list-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.file-input-wrapper {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.file-input-label {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border: 2px dashed #cbd5e1;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.file-input-label:hover {
  border-color: #10b981;
  background: #f0fdf4;
}

.file-icon {
  font-size: 24px;
}

.file-text {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.form-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    width: 100%;
  }

  .btn-action,
  .btn-primary {
    flex: 1;
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

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
