<template>
  <DashboardLayout>
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">📦 Stok Adjusment</h1>
        <p class="page-subtitle">Kelola stok awal dan lakukan adjustment inventory</p>
      </div>
    </div>

    <!-- Upload Section -->
    <div class="content-card">
      <div class="card-header">
        <div class="header-icon">📤</div>
        <div>
          <h2 class="card-title">Upload Stok Awal Massal (Excel)</h2>
          <p class="card-subtitle">Import data stok dalam jumlah besar menggunakan file Excel</p>
        </div>
      </div>

      <div class="card-body">
        <div class="info-box">
          <span class="info-icon">💡</span>
          <p class="info-text">
            Gunakan fitur ini untuk mengatur stok awal atau melakukan stok opname massal. Unduh
            template, isi datanya, lalu unggah kembali ke sistem.
          </p>
        </div>

        <div class="upload-actions">
          <a href="/template_stok_awal.xlsx" download class="btn btn-secondary">
            <span class="btn-icon">📥</span>
            <span>Unduh Template</span>
          </a>

          <input
            type="file"
            ref="fileInput"
            @change="handleFileUpload"
            accept=".xlsx, .xls"
            style="display: none"
          />

          <button
            @click="triggerFileInput"
            class="btn btn-primary"
            :disabled="isUploading"
            :class="{ 'btn-loading': isUploading }"
          >
            <span class="btn-icon">{{ isUploading ? '⏳' : '📤' }}</span>
            <span>{{ isUploading ? 'Mengunggah...' : 'Unggah File Excel' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Manual Adjustment Form -->
    <div class="content-card">
      <div class="card-header">
        <div class="header-icon">✏️</div>
        <div>
          <h2 class="card-title">Penyesuaian Stok Manual (Satu per Satu)</h2>
          <p class="card-subtitle">Input adjustment stok secara manual untuk item tertentu</p>
        </div>
      </div>

      <div class="card-body">
        <form @submit.prevent="submitAdjustment" class="adjustment-form">
          <div class="form-row">
            <div class="form-group">
              <label for="itemType" class="form-label">
                <span class="label-icon">📦</span>
                Jenis Barang
              </label>
              <select
                id="itemType"
                v-model="form.item_type"
                @change="resetItemSelection"
                class="form-control"
              >
                <option value="product">Produk Jadi</option>
                <option value="material">Bahan Baku</option>
              </select>
            </div>

            <div class="form-group">
              <label for="item" class="form-label">
                <span class="label-icon">🔍</span>
                Pilih Barang
              </label>
              <select id="item" v-model="form.item_id" required class="form-control">
                <option disabled value="">-- Pilih salah satu --</option>
                <option v-for="item in items" :key="item.id" :value="item.id">
                  {{ item.name }} (Stok: {{ formatStock(item.stock) }})
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="type" class="form-label">
                <span class="label-icon">📝</span>
                Jenis Penyesuaian
              </label>
              <select id="type" v-model="form.type" required class="form-control">
                <option>Stok Awal</option>
                <option>Stok Opname</option>
                <option>Barang Rusak</option>
                <option>Barang Hilang</option>
                <option>Lainnya</option>
              </select>
            </div>

            <div class="form-group">
              <label for="quantity" class="form-label">
                <span class="label-icon">🔢</span>
                Jumlah
              </label>
              <input
                id="quantity"
                v-model="form.quantity"
                type="number"
                step="any"
                placeholder="Gunakan - (minus) untuk mengurangi stok"
                required
                class="form-control"
              />
              <small class="form-hint">Gunakan angka negatif (-) untuk mengurangi stok</small>
            </div>
          </div>

          <div class="form-group">
            <label for="notes" class="form-label">
              <span class="label-icon">📄</span>
              Catatan (Wajib Diisi)
            </label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="4"
              placeholder="Contoh: Stok awal gudang A per 13 Oktober 2025"
              required
              class="form-control"
            ></textarea>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-success btn-lg"
              :disabled="isSubmitting"
              :class="{ 'btn-loading': isSubmitting }"
            >
              <span class="btn-icon">{{ isSubmitting ? '⏳' : '💾' }}</span>
              <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan Penyesuaian' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const isSubmitting = ref(false)
const isUploading = ref(false)
const fileInput = ref(null)

const form = reactive({
  item_type: 'product',
  item_id: '',
  type: 'Stok Awal',
  quantity: '',
  notes: '',
})

const items = ref([])

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  isUploading.value = true
  const formData = new FormData()
  formData.append('file', file)

  try {
    await apiClient.post('/stock-adjustments/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    toast.success('File berhasil diunggah dan stok sedang diproses.')
    fetchItems()
  } catch (error) {
    console.error('Gagal mengunggah file:', error)
    const message = error.response?.data?.message || 'Terjadi kesalahan saat mengunggah file.'
    toast.error(message)
  } finally {
    isUploading.value = false
    fileInput.value.value = ''
  }
}

const fetchItems = async () => {
  try {
    const endpoint = form.item_type === 'product' ? '/products' : '/materials'
    const response = await apiClient.get(endpoint, { params: { all: true } })
    items.value = response.data.data
  } catch (error) {
    console.error(`Gagal mengambil data ${form.item_type}:`, error)
    toast.error('Gagal memuat data barang.')
  }
}

const resetItemSelection = () => {
  form.item_id = ''
  items.value = []
  fetchItems()
}

const submitAdjustment = async () => {
  isSubmitting.value = true
  try {
    await apiClient.post('/stock-adjustments', form)
    toast.success('Penyesuaian stok berhasil disimpan!')
    Object.assign(form, {
      item_type: 'product',
      item_id: '',
      type: 'Stok Awal',
      quantity: '',
      notes: '',
    })
    fetchItems()
  } catch (error) {
    console.error('Gagal menyimpan penyesuaian stok:', error)
    toast.error('Gagal menyimpan. Periksa kembali isian Anda.')
  } finally {
    isSubmitting.value = false
  }
}

const formatStock = (value) => Number(value).toLocaleString('id-ID')

onMounted(fetchItems)
</script>

<style scoped>
/* ===== PAGE HEADER ===== */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 32px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.content-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card-header {
  background: linear-gradient(to right, #f8f9fa, #fff);
  border-bottom: 2px solid #e9ecef;
  padding: 24px 32px;
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
  font-weight: 400;
}

.card-body {
  padding: 32px;
}

/* ===== INFO BOX ===== */
.info-box {
  background: linear-gradient(135deg, #fff5e6 0%, #ffe6cc 100%);
  border-left: 4px solid #ff9800;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 28px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.info-icon {
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-text {
  color: #664d03;
  line-height: 1.6;
  margin: 0;
  font-size: 14px;
}

/* ===== UPLOAD ACTIONS ===== */
.upload-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

/* ===== BUTTONS - STYLE BARU SESUAI GAMBAR ===== */
.btn {
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  font-size: 20px;
}

/* Button Secondary - Orange/Kuning untuk Download */
.btn-secondary {
  background: #ffb84d;
  color: #1a1a1a;
}

.btn-secondary:hover {
  background: #ffa726;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 152, 38, 0.3);
}

/* Button Primary - Orange untuk Upload */
.btn-primary {
  background: #ff9500;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #e68600;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 149, 0, 0.3);
}

.btn-success {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: linear-gradient(135deg, #1e7e34 0%, #155724 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-lg {
  padding: 16px 32px;
  font-size: 15px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-loading {
  position: relative;
}

/* ===== FORM ===== */
.adjustment-form {
  max-width: 100%;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
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

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-control:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

.form-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #6c757d;
  font-style: italic;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #f1f3f5;
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
    padding: 20px;
    flex-direction: column;
    align-items: flex-start;
  }

  .header-icon {
    width: 48px;
    height: 48px;
    font-size: 28px;
  }

  .card-body {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .upload-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
