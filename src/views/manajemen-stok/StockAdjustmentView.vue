<template>
  <DashboardLayout>
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge-adj">
            <span class="adj-icon">⚖️</span>
          </div>
          <div class="header-text">
            <h1 class="page-title">Penyesuaian Stok</h1>
            <p class="page-subtitle">Sesuaikan stok manual atau upload stok awal.</p>
          </div>
        </div>
        <div class="header-right">
          <button class="btn-upload" @click="showUploadModal = true">
            <span class="btn-icon">📤</span>
            <span class="btn-text">Upload Stok Awal (Excel)</span>
          </button>
        </div>
      </div>
    </div>

    <div class="content-card filter-card">
      <div class="card-header-accent"></div>
      <div class="card-body">
        <div class="filter-container">
          <div class="filter-header">
            <span class="filter-icon">🔍</span>
            <div>
              <h3 class="filter-title">Pilih Kategori Stok</h3>
              <p class="filter-desc">Pilih kategori untuk menampilkan dan menyesuaikan stok.</p>
            </div>
          </div>
          <div class="filter-input-group">
            <div class="select-wrapper">
              <span class="select-icon">📂</span>
              <select id="kategori-filter" v-model="selectedCategory" class="form-control">
                <option :value="null" disabled>Pilih kategori...</option>
                <option v-for="kategori in daftarKategori" :key="kategori.id" :value="kategori.id">
                  {{ kategori.name }}
                </option>
              </select>
              <span class="select-arrow">▼</span>
            </div>
            <button
              @click="fetchStokBarang"
              class="btn-primary"
              :disabled="!selectedCategory || loading.stok"
            >
              <span class="btn-icon">{{ loading.stok ? '⏳' : '🔎' }}</span>
              <span class="btn-text">{{ loading.stok ? 'Memuat...' : 'Tampilkan Barang' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading.stok" class="loading-container">
      <div class="loading-animation">
        <div class="spinner"></div>
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <p class="loading-text">Memuat daftar stok...</p>
    </div>

    <div v-if="daftarStok.length > 0 && !loading.stok" class="content-card table-card">
      <div class="card-body-table">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th class="th-nama">Nama Barang</th>
                <th class="th-kategori">Kategori</th>
                <th class="th-satuan">Satuan</th>
                <th class="th-stok-saat-ini">Stok Saat Ini</th>
                <th class="th-stok-baru">Jml Penyesuaian (+/-)</th>
                <th class="th-aksi">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in daftarStok" :key="item.id" class="data-row">
                <td class="td-nama">
                  <div class="item-wrapper">
                    <span class="item-icon">📦</span>
                    <span class="item-name">{{ item.name }}</span>
                  </div>
                </td>
                <td class="td-kategori">
                  <span class="badge-category">{{ item.category?.name }}</span>
                </td>
                <td class="td-satuan">
                  <span class="badge-unit">{{ item.unit?.name }}</span>
                </td>
                <td class="td-stok-saat-ini">
                  <span class="stock-value">{{ parseFloat(item.stock) }}</span>
                </td>
                <td class="td-stok-baru">
                  <div class="input-wrapper">
                    <input
                      type="number"
                      v-model.number="item.new_stock"
                      class="form-control-table"
                      placeholder="Contoh: 5 atau -2"
                    />
                  </div>
                </td>
                <td class="td-aksi">
                  <button
                    @click="handleAdjusment(item)"
                    class="btn-action-save"
                    :disabled="!item.new_stock"
                  >
                    <span class="save-icon">💾</span>
                    <span class="save-text">Simpan</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showUploadModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-header-left">
            <span class="modal-icon">📤</span>
            <h3 class="modal-title">Upload Stok Awal (Excel)</h3>
          </div>
          <button @click="closeModal" class="modal-close-btn">✕</button>
        </div>

        <div class="modal-body">
          <div class="info-box">
            <span class="info-icon">ℹ️</span>
            <div class="info-text">
              <p class="info-main">
                Upload file Excel (.xlsx) atau CSV untuk mengatur (SET) stok awal secara massal.
              </p>
              <p class="info-sub">
                Stok barang yang ada di file akan <strong>langsung menggantikan</strong> stok di
                sistem.
              </p>
            </div>
          </div>

          <div class="template-download-box">
            <div class="template-header">
              <span class="template-icon">📄</span>
              <p class="template-title">Belum punya template?</p>
            </div>
            <a href="#" @click.prevent="downloadTemplate" class="template-link">
              <span class="download-icon">⬇️</span>
              Download template di sini
            </a>
            <p class="template-note">
              <strong>Penting:</strong> Kolom 'kategori' di template harus diisi dengan
              <strong>nama</strong> kategori yang <strong>sudah ada</strong> (Contoh: "Kayu RST",
              "Produk Jadi").
            </p>
          </div>

          <div class="form-group-upload">
            <label class="form-label-upload" for="file-upload">
              <span class="label-icon">📁</span>
              Pilih File
            </label>
            <input
              id="file-upload"
              type="file"
              @change="handleFileChange"
              class="form-control-file"
              accept=".xlsx, .xls, .csv"
            />
            <div v-if="uploadFile" class="file-info">
              <span class="file-icon">✅</span>
              File dipilih: <strong>{{ uploadFile.name }}</strong>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">
            <span class="btn-icon-sec">↩️</span>
            Batal
          </button>
          <button
            @click="handleUpload"
            class="btn-primary-modal"
            :disabled="!uploadFile || isUploading"
          >
            <span class="btn-icon-upload">{{ isUploading ? '⏳' : '📤' }}</span>
            {{ isUploading ? 'Mengupload...' : 'Upload Sekarang' }}
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useToast } from 'vue-toastification'

const toast = useToast()

const loading = ref({
  kategori: true,
  stok: false,
})
const daftarKategori = ref([])
const selectedCategory = ref(null)
const daftarStok = ref([])
const showUploadModal = ref(false)

const fetchDaftarKategori = async () => {
  loading.value.kategori = true
  try {
    const response = await apiClient.get('/categories/all')
    daftarKategori.value = response.data.data
  } catch (error) {
    toast.error('Gagal memuat daftar kategori.')
  } finally {
    loading.value.kategori = false
  }
}

const fetchStokBarang = async () => {
  if (!selectedCategory.value) {
    toast.error('Silakan pilih kategori terlebih dahulu.')
    return
  }

  loading.value.stok = true
  daftarStok.value = []
  try {
    const response = await apiClient.get('/materials', {
      params: {
        category_id: selectedCategory.value,
        include: 'unit,category',
        per_page: 9999,
      },
    })

    let items = []
    if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
      items = response.data.data.data
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      items = response.data.data
    } else if (Array.isArray(response.data)) {
      items = response.data
    }

    daftarStok.value = items.map((item) => ({
      ...item,
      new_stock: null,
    }))
  } catch (error) {
    console.error('Error:', error)
    toast.error('Gagal memuat daftar stok.')
  } finally {
    loading.value.stok = false
  }
}

const handleAdjusment = async (item) => {
  const adjustmentAmount = item.new_stock

  if (adjustmentAmount == null || adjustmentAmount === 0) {
    toast.error('Jumlah penyesuaian tidak boleh nol.')
    return
  }

  try {
    const currentStock = parseFloat(item.stock) || 0
    const newStock = currentStock + adjustmentAmount

    if (newStock < 0) {
      toast.error('Stok tidak boleh negatif.')
      return
    }

    const type = adjustmentAmount > 0 ? 'Stok Masuk' : 'Stok Keluar'
    const quantity = Math.abs(adjustmentAmount)

    const response = await apiClient.post('/stock-adjustments', {
      item_id: item.id,
      type: type,
      quantity: quantity,
      notes: `Penyesuaian manual: ${adjustmentAmount > 0 ? '+' : ''}${adjustmentAmount}. Dari ${currentStock} menjadi ${newStock}.`,
    })

    item.stock = response.data.new_stock
    item.new_stock = null
    toast.success(`${item.name} berhasil disesuaikan.`)
  } catch (error) {
    console.error('Error:', error)
    toast.error(error.response?.data?.message || 'Gagal menyimpan penyesuaian stok.')
  }
}

onMounted(fetchDaftarKategori)

const uploadFile = ref(null)
const isUploading = ref(false)

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadFile.value = file
  }
}

const closeModal = () => {
  showUploadModal.value = false
  uploadFile.value = null
}

const handleUpload = async () => {
  if (!uploadFile.value) {
    toast.error('Silakan pilih file Excel terlebih dahulu.')
    return
  }

  isUploading.value = true

  const formData = new FormData()
  formData.append('file', uploadFile.value)

  try {
    await apiClient.post('/materials/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    toast.success('Stok awal berhasil di-import! Memuat ulang data...')
    closeModal()

    if (selectedCategory.value) {
      await fetchStokBarang()
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Gagal meng-upload file.'
    toast.error(errorMsg)
    console.error('Error Upload:', error.response?.data)
  } finally {
    isUploading.value = false
  }
}

const downloadTemplate = async () => {
  try {
    const response = await apiClient.get('/materials/template', {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url

    const contentDisposition = response.headers['content-disposition']
    let fileName = 'template_stok_awal.csv'
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
      if (fileNameMatch && fileNameMatch.length === 2) fileName = fileNameMatch[1]
    }

    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    toast.error('Gagal men-download template.')
  }
}
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 32px 36px;
  border-radius: 24px;
  margin-bottom: 24px;
  box-shadow: 0 12px 40px rgba(16, 185, 129, 0.25);
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

.icon-badge-adj {
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

.adj-icon {
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

.btn-upload {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  color: #10b981;
  padding: 14px 24px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 800;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border: none;
  cursor: pointer;
}

.btn-upload:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.filter-card {
  margin-bottom: 24px;
}

.card-header-accent {
  height: 4px;
  background: linear-gradient(90deg, #10b981, #059669);
}

.content-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 2px solid #f0f0f0;
}

.card-body {
  padding: 28px;
}

.filter-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
}

.filter-icon {
  font-size: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.filter-title {
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
}

.filter-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.filter-input-group {
  display: flex;
  gap: 16px;
  align-items: center;
}

.select-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.select-icon {
  position: absolute;
  left: 16px;
  font-size: 20px;
  pointer-events: none;
  z-index: 1;
}

.form-control {
  width: 100%;
  padding: 14px 20px 14px 50px;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.3s ease;
  appearance: none;
  background: #f9fafb;
  cursor: pointer;
}

.form-control:hover {
  border-color: #cbd5e1;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #10b981;
  background: white;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.select-arrow {
  position: absolute;
  right: 16px;
  font-size: 10px;
  color: #9ca3af;
  pointer-events: none;
  transition: transform 0.3s ease;
}

.form-control:focus + .select-arrow {
  transform: rotate(180deg);
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 14px 28px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 800;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  border-top-color: #10b981;
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
  background: #10b981;
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

.table-card {
  margin-top: 24px;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1000px;
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

.th-nama {
  width: 30%;
}
.th-kategori {
  width: 15%;
}
.th-satuan {
  width: 10%;
}
.th-stok-saat-ini {
  width: 12%;
  text-align: center;
}
.th-stok-baru {
  width: 18%;
}
.th-aksi {
  width: 15%;
  text-align: center;
}

.data-row {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.25s ease;
}

.data-row:hover {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  transform: scale(1.002);
  box-shadow: 0 2px 12px rgba(16, 185, 129, 0.1);
}

.data-table td {
  padding: 16px 20px;
  vertical-align: middle;
}

.item-wrapper {
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
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e40af;
  border-radius: 12px;
  font-weight: 800;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-unit {
  display: inline-block;
  padding: 6px 14px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  border-radius: 12px;
  font-weight: 700;
  font-size: 12px;
}

.td-stok-saat-ini {
  text-align: center;
}

.stock-value {
  display: inline-block;
  padding: 8px 16px;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #1e293b;
  border-radius: 10px;
  font-weight: 900;
  font-size: 16px;
  min-width: 60px;
}

.input-wrapper {
  position: relative;
}

.form-control-table {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: #f9fafb;
}

.form-control-table:hover {
  border-color: #cbd5e1;
  background: white;
}

.form-control-table:focus {
  outline: none;
  border-color: #10b981;
  background: white;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.btn-action-save {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 800;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
  white-space: nowrap;
}

.btn-action-save:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-action-save:disabled {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  cursor: not-allowed;
  opacity: 0.6;
}

.save-icon {
  font-size: 16px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 650px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
  overflow: hidden;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 24px 32px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.modal-icon {
  font-size: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.modal-title {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.5px;
}

.modal-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 32px;
  line-height: 1.6;
}

.info-box {
  display: flex;
  gap: 16px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  padding: 20px;
  border-radius: 16px;
  border-left: 4px solid #1e40af;
  margin-bottom: 24px;
}

.info-icon {
  font-size: 28px;
}

.info-text {
  flex: 1;
}

.info-main {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.info-sub {
  font-size: 14px;
  color: #334155;
  margin: 0;
}

.template-download-box {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 2px solid #10b981;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 28px;
}

.template-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.template-icon {
  font-size: 28px;
}

.template-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.template-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #10b981;
  font-weight: 800;
  font-size: 15px;
  text-decoration: none;
  padding: 12px 20px;
  background: white;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
  margin-bottom: 16px;
}

.template-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
}

.download-icon {
  font-size: 18px;
}

.template-note {
  font-size: 13px;
  color: #166534;
  margin: 0;
  line-height: 1.5;
}

.form-group-upload {
  margin-top: 0;
}

.form-label-upload {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-weight: 800;
  font-size: 16px;
  color: #1e293b;
}

.label-icon {
  font-size: 20px;
}

.form-control-file {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.form-control-file:hover {
  border-color: #10b981;
}

.file-info {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-radius: 12px;
  font-size: 14px;
  color: #166534;
  font-weight: 600;
}

.file-icon {
  font-size: 20px;
}

.modal-footer {
  padding: 24px 32px;
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  border-top: 2px solid #f3f4f6;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f3f4f6;
  color: #374151;
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 800;
  font-size: 15px;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.btn-icon-sec {
  font-size: 18px;
}

.btn-primary-modal {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 12px 28px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 800;
  font-size: 15px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

.btn-primary-modal:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-primary-modal:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon-upload {
  font-size: 18px;
}

@media (max-width: 768px) {
  .page-header {
    padding: 24px 20px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-upload {
    width: 100%;
    justify-content: center;
  }

  .filter-input-group {
    flex-direction: column;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-body {
    padding: 24px 20px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-primary-modal {
    width: 100%;
    justify-content: center;
  }
}
</style>
