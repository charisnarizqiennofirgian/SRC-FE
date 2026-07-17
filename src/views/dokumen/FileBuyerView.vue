<template>
  <DashboardLayout>
    <!-- HEADER -->
    <div class="page-header-filebuyer">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge">🗂️</div>
          <div>
            <h1 class="page-title">File Buyer</h1>
            <p class="page-subtitle">Upload dan simpan file PDF per Buyer (kontrak, PO buyer, dokumen lain) supaya tidak hilang</p>
          </div>
        </div>
        <button
          v-if="hasPermission('dokumen-upload')"
          class="btn-upload-header"
          @click="showModalUpload = true"
        >
          📤 Upload File Buyer
        </button>
      </div>
    </div>

    <!-- FILTER -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="filter.search"
            type="text"
            placeholder="Cari nama file atau keterangan..."
            class="search-input"
            @keyup.enter="fetchDokumen"
          />
          <button v-if="filter.search" class="btn-clear-search" @click="clearSearch">✕</button>
        </div>
        <div class="buyer-filter-wrap">
          <select v-model="filter.buyer_id" class="buyer-filter-select" @change="onBuyerFilterChange">
            <option value="">👥 Semua Buyer</option>
            <option v-for="b in buyers" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat file...</p>
    </div>

    <!-- EMPTY -->
    <div v-else-if="daftarDokumen.length === 0" class="empty-state">
      <span class="empty-icon">📭</span>
      <p class="empty-title">Belum ada file buyer</p>
      <p class="empty-sub">Upload file PDF pertama menggunakan tombol di atas</p>
    </div>

    <!-- GRID -->
    <div v-else class="dokumen-grid">
      <div
        v-for="dok in daftarDokumen"
        :key="dok.id"
        class="dokumen-card"
      >
        <div class="dok-preview">
          <span class="dok-icon">📕</span>
          <span class="dok-ext">PDF</span>
        </div>

        <div class="dok-info">
          <div class="dok-buyer-badge">👥 {{ dok.buyer?.name || '-' }}</div>
          <div class="dok-nama" :title="dok.nama_file">{{ dok.nama_file }}</div>
          <div class="dok-keterangan" v-if="dok.keterangan">{{ dok.keterangan }}</div>
          <div class="dok-footer">
            <span class="dok-uploader">👤 {{ dok.uploader?.name || '-' }}</span>
            <span class="dok-ukuran">{{ formatUkuran(dok.ukuran_file) }}</span>
            <span class="dok-tanggal">{{ formatTanggal(dok.created_at) }}</span>
          </div>
        </div>

        <div class="dok-actions">
          <button class="btn-view" @click="bukaPreview(dok)" title="Lihat">
            👁️ Lihat
          </button>
          <button class="btn-download" @click="downloadDokumen(dok)" title="Download">
            ⬇️ Download
          </button>
          <button
            v-if="hasPermission('dokumen-upload') || dok.diupload_oleh === userId"
            class="btn-revisi"
            @click="bukaModalRevisi(dok)"
            title="Ganti file — buyer & nama tetap sama"
          >
            🔄 Ganti
          </button>
          <button
            v-if="hasPermission('dokumen-hapus') || dok.diupload_oleh === userId"
            class="btn-hapus"
            @click="konfirmasiHapus(dok)"
            title="Hapus"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- PAGINATION -->
    <div v-if="pagination.last_page > 1" class="pagination-wrapper">
      <button
        class="btn-page"
        :disabled="pagination.current_page === 1"
        @click="goToPage(pagination.current_page - 1)"
      >← Prev</button>
      <span class="page-info">
        Halaman {{ pagination.current_page }} dari {{ pagination.last_page }}
        ({{ pagination.total }} file)
      </span>
      <button
        class="btn-page"
        :disabled="pagination.current_page === pagination.last_page"
        @click="goToPage(pagination.current_page + 1)"
      >Next →</button>
    </div>

    <!-- MODAL PREVIEW (selalu PDF) -->
    <div v-if="modalPreview.show" class="preview-overlay" @click.self="tutupPreview">
      <div class="modal-preview">
        <div class="preview-header">
          <div class="preview-title-wrap">
            <span class="preview-icon-head">📕</span>
            <span class="preview-nama">{{ modalPreview.dok?.nama_file }}</span>
            <span class="preview-buyer-badge">👥 {{ modalPreview.dok?.buyer?.name }}</span>
          </div>
          <div class="preview-head-actions">
            <button class="btn-dl-preview" @click="downloadDokumen(modalPreview.dok)">⬇️ Download</button>
            <button class="preview-close" @click="tutupPreview">✕</button>
          </div>
        </div>

        <div class="preview-body">
          <div v-if="modalPreview.loading" class="preview-loading">
            <div class="spinner"></div>
            <p>Memuat file...</p>
          </div>
          <iframe
            v-else-if="modalPreview.url"
            :src="modalPreview.url"
            class="preview-iframe"
          ></iframe>
          <div v-else class="preview-unsupported">
            <div class="unsupported-icon">📕</div>
            <p class="unsupported-title">Gagal memuat preview</p>
            <p class="unsupported-desc">Silakan download untuk membuka file ini.</p>
            <button class="btn-dl-big" @click="downloadDokumen(modalPreview.dok)">⬇️ Download File</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL UPLOAD -->
    <div v-if="showModalUpload" class="modal-overlay" @click.self="tutupModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>📤 Upload File Buyer</h3>
          <button class="btn-tutup-modal" @click="tutupModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group-dok">
            <label class="form-label-dok">Buyer <span class="req">*</span></label>
            <select v-model="formUpload.buyer_id" class="form-input-dok">
              <option value="">Pilih Buyer</option>
              <option v-for="b in buyers" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
          </div>

          <!-- DROP ZONE -->
          <div
            class="drop-zone"
            :class="{ 'drag-over': isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="handleDrop"
            @click="$refs.inputFile.click()"
          >
            <input
              ref="inputFile"
              type="file"
              hidden
              accept=".pdf"
              @change="handleFileChange"
            />
            <div v-if="!formUpload.file" class="drop-placeholder">
              <span class="drop-icon">📕</span>
              <p class="drop-text">Klik atau drag file PDF ke sini</p>
              <p class="drop-hint">Hanya PDF (maks. 50MB)</p>
            </div>
            <div v-else class="file-selected">
              <span class="file-icon">📕</span>
              <div class="file-detail">
                <p class="file-name">{{ formUpload.file.name }}</p>
                <p class="file-size">{{ formatUkuran(formUpload.file.size) }}</p>
              </div>
              <button class="btn-ganti-file" @click.stop="$refs.inputFile.click()">Ganti</button>
            </div>
          </div>

          <div class="form-upload">
            <div class="form-group-dok">
              <label class="form-label-dok">Nama File <span class="req">*</span></label>
              <input
                v-model="formUpload.nama_file"
                type="text"
                class="form-input-dok"
                placeholder="Contoh: Kontrak Ethimo 2026"
              />
            </div>
            <div class="form-group-dok">
              <label class="form-label-dok">Keterangan</label>
              <textarea
                v-model="formUpload.keterangan"
                class="form-input-dok"
                rows="3"
                placeholder="Keterangan tambahan (opsional)..."
              ></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-batal" @click="tutupModal">Batal</button>
          <button
            class="btn-simpan-upload"
            @click="uploadDokumen"
            :disabled="isUploading || !formUpload.file || !formUpload.nama_file || !formUpload.buyer_id"
          >
            {{ isUploading ? '⏳ Mengupload...' : '💾 Upload' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL GANTI FILE (Revisi) -->
    <div v-if="showModalRevisi" class="modal-overlay" @click.self="tutupModalRevisi">
      <div class="modal-card">
        <div class="modal-header">
          <h3>🔄 Ganti File</h3>
          <button class="btn-tutup-modal" @click="tutupModalRevisi">✕</button>
        </div>
        <div class="modal-body">
          <div class="revisi-info">
            <span class="revisi-label">File:</span>
            <strong>{{ dokumenTarget?.nama_file }}</strong>
            <span class="revisi-badge">👥 {{ dokumenTarget?.buyer?.name }}</span>
          </div>
          <p class="revisi-hint">⚠️ File lama akan diganti otomatis. Buyer dan nama tetap sama.</p>

          <div
            class="drop-zone"
            :class="{ 'drag-over': isDraggingRevisi }"
            @dragover.prevent="isDraggingRevisi = true"
            @dragleave="isDraggingRevisi = false"
            @drop.prevent="handleDropRevisi"
            @click="$refs.inputFileRevisi.click()"
          >
            <input
              ref="inputFileRevisi"
              type="file"
              hidden
              accept=".pdf"
              @change="handleFileChangeRevisi"
            />
            <div v-if="!formRevisi.file" class="drop-placeholder">
              <span class="drop-icon">📕</span>
              <p class="drop-text">Klik atau drag file PDF pengganti ke sini</p>
              <p class="drop-hint">Hanya PDF (maks. 50MB)</p>
            </div>
            <div v-else class="file-selected">
              <span class="file-icon">📕</span>
              <div class="file-detail">
                <p class="file-name">{{ formRevisi.file.name }}</p>
                <p class="file-size">{{ formatUkuran(formRevisi.file.size) }}</p>
              </div>
              <button class="btn-ganti-file" @click.stop="$refs.inputFileRevisi.click()">Ganti</button>
            </div>
          </div>

          <div class="form-upload">
            <div class="form-group-dok">
              <label class="form-label-dok">Keterangan <span class="hint-opt">(opsional)</span></label>
              <textarea
                v-model="formRevisi.keterangan"
                class="form-input-dok"
                rows="2"
                placeholder="Contoh: Update kontrak terbaru..."
              ></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-batal" @click="tutupModalRevisi">Batal</button>
          <button
            class="btn-simpan-upload"
            @click="submitRevisi"
            :disabled="isRevising || !formRevisi.file"
          >
            {{ isRevising ? '⏳ Mengupload...' : '🔄 Ganti File' }}
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'
import Swal from 'sweetalert2'

const { showSuccess, showError } = useNotification()

const userId = computed(() => {
  try { return JSON.parse(localStorage.getItem('user') || '{}')?.id } catch { return null }
})
const hasPermission = (perm) => {
  try { return JSON.parse(localStorage.getItem('permissions') || '[]').includes(perm) } catch { return false }
}

const loading         = ref(false)
const isUploading     = ref(false)
const showModalUpload = ref(false)
const isDragging      = ref(false)
const inputFile       = ref(null)
const daftarDokumen   = ref([])
const buyers          = ref([])

const modalPreview = ref({ show: false, dok: null, url: null, loading: false })

const showModalRevisi  = ref(false)
const isRevising       = ref(false)
const isDraggingRevisi = ref(false)
const inputFileRevisi  = ref(null)
const dokumenTarget    = ref(null)
const formRevisi       = reactive({ file: null, keterangan: '' })

const pagination = reactive({
  current_page: 1,
  last_page:    1,
  total:        0,
  per_page:     20,
})

const filter = reactive({
  search:   '',
  buyer_id: '',
  page:     1,
})

const formUpload = reactive({
  file:       null,
  nama_file:  '',
  buyer_id:   '',
  keterangan: '',
})

const fetchBuyers = async () => {
  try {
    const res = await apiClient.get('/buyers', { params: { per_page: 200 } })
    buyers.value = res.data.data || []
  } catch (error) {
    console.error(error)
  }
}

const fetchDokumen = async () => {
  loading.value = true
  try {
    const res = await apiClient.get('/dokumen', {
      params: {
        kategori: 'File Buyer',
        search:   filter.search   || undefined,
        buyer_id: filter.buyer_id || undefined,
        page:     filter.page,
        per_page: pagination.per_page,
      }
    })
    daftarDokumen.value    = res.data.data.data || []
    pagination.current_page = res.data.data.current_page
    pagination.last_page    = res.data.data.last_page
    pagination.total        = res.data.data.total
  } catch {
    showError('Gagal', 'Gagal memuat file buyer')
  } finally {
    loading.value = false
  }
}

const onBuyerFilterChange = () => {
  filter.page = 1
  fetchDokumen()
}

const clearSearch = () => {
  filter.search = ''
  filter.page   = 1
  fetchDokumen()
}

const goToPage = (page) => {
  filter.page = page
  fetchDokumen()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const isPdfFile = (file) => {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  if (!isPdfFile(file)) { showError('Validasi', 'File harus berupa PDF'); return }
  formUpload.file = file
  if (!formUpload.nama_file) {
    formUpload.nama_file = file.name.replace(/\.[^/.]+$/, '')
  }
}

const handleDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (!file) return
  if (!isPdfFile(file)) { showError('Validasi', 'File harus berupa PDF'); return }
  formUpload.file = file
  if (!formUpload.nama_file) {
    formUpload.nama_file = file.name.replace(/\.[^/.]+$/, '')
  }
}

const uploadDokumen = async () => {
  if (!formUpload.file || !formUpload.nama_file || !formUpload.buyer_id) return

  isUploading.value = true
  try {
    const fd = new FormData()
    fd.append('file',       formUpload.file)
    fd.append('nama_file',  formUpload.nama_file)
    fd.append('kategori',   'File Buyer')
    fd.append('buyer_id',   formUpload.buyer_id)
    fd.append('keterangan', formUpload.keterangan || '')

    await apiClient.post('/dokumen/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    showSuccess('Berhasil', 'File buyer berhasil diupload!')
    tutupModal()
    fetchDokumen()
  } catch (error) {
    showError('Gagal', error.response?.data?.message || 'Gagal upload file buyer')
  } finally {
    isUploading.value = false
  }
}

const downloadDokumen = async (dok) => {
  try {
    const res = await apiClient.get(`/dokumen/${dok.id}/download`, {
      responseType: 'blob'
    })
    const url  = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href  = url
    link.setAttribute('download', dok.nama_asli)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch {
    showError('Gagal', 'Gagal mengunduh file')
  }
}

const bukaPreview = async (dok) => {
  modalPreview.value = { show: true, dok, url: null, loading: true }
  try {
    const res  = await apiClient.get(`/dokumen/${dok.id}/download`, { responseType: 'blob' })
    const blob = new Blob([res.data], { type: 'application/pdf' })
    modalPreview.value.url = URL.createObjectURL(blob)
  } catch {
    showError('Gagal', 'Gagal memuat preview')
  } finally {
    modalPreview.value.loading = false
  }
}

const tutupPreview = () => {
  if (modalPreview.value.url) URL.revokeObjectURL(modalPreview.value.url)
  modalPreview.value = { show: false, dok: null, url: null, loading: false }
}

const konfirmasiHapus = async (dok) => {
  const result = await Swal.fire({
    title:             'Hapus File?',
    text:              `"${dok.nama_file}" akan dihapus permanen!`,
    icon:              'warning',
    showCancelButton:  true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText:  'Batal',
    confirmButtonColor:'#ef4444',
  })
  if (!result.isConfirmed) return

  try {
    await apiClient.delete(`/dokumen/${dok.id}`)
    showSuccess('Berhasil', 'File berhasil dihapus!')
    fetchDokumen()
  } catch (error) {
    showError('Gagal', error.response?.data?.message || 'Gagal menghapus file')
  }
}

const tutupModal = () => {
  showModalUpload.value  = false
  formUpload.file        = null
  formUpload.nama_file   = ''
  formUpload.buyer_id    = ''
  formUpload.keterangan  = ''
  isDragging.value       = false
}

const bukaModalRevisi = (dok) => {
  dokumenTarget.value    = dok
  formRevisi.file        = null
  formRevisi.keterangan  = ''
  isDraggingRevisi.value = false
  showModalRevisi.value  = true
}

const tutupModalRevisi = () => {
  showModalRevisi.value  = false
  dokumenTarget.value    = null
  formRevisi.file        = null
  formRevisi.keterangan  = ''
  isDraggingRevisi.value = false
}

const handleFileChangeRevisi = (e) => {
  const file = e.target.files[0]
  if (!file) return
  if (!isPdfFile(file)) { showError('Validasi', 'File harus berupa PDF'); return }
  formRevisi.file = file
}

const handleDropRevisi = (e) => {
  isDraggingRevisi.value = false
  const file = e.dataTransfer.files[0]
  if (!file) return
  if (!isPdfFile(file)) { showError('Validasi', 'File harus berupa PDF'); return }
  formRevisi.file = file
}

const submitRevisi = async () => {
  if (!formRevisi.file || !dokumenTarget.value) return
  isRevising.value = true
  try {
    const fd = new FormData()
    fd.append('file',       formRevisi.file)
    fd.append('keterangan', formRevisi.keterangan || '')

    await apiClient.post(`/dokumen/${dokumenTarget.value.id}/revisi`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    showSuccess('Berhasil', 'File berhasil diganti!')
    tutupModalRevisi()
    fetchDokumen()
  } catch (error) {
    showError('Gagal', error.response?.data?.message || 'Gagal ganti file')
  } finally {
    isRevising.value = false
  }
}

const formatUkuran = (bytes) => {
  if (!bytes) return '0 B'
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB'
  if (bytes >= 1024)    return (bytes / 1024).toFixed(1) + ' KB'
  return bytes + ' B'
}

const formatTanggal = (tgl) => {
  if (!tgl) return '-'
  return new Date(tgl).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

onMounted(() => {
  fetchBuyers()
  fetchDokumen()
})
</script>

<style scoped>
.page-header-filebuyer {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  padding: 32px 36px; border-radius: 20px; margin-bottom: 24px;
  box-shadow: 0 10px 30px rgba(217,119,6,0.25);
}
.header-content { display:flex; justify-content:space-between; align-items:center; color:white; gap:20px; flex-wrap:wrap; }
.header-left { display:flex; align-items:center; gap:20px; }
.icon-badge { width:64px; height:64px; background:rgba(255,255,255,0.2); border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:32px; }
.page-title { font-size:28px; font-weight:900; margin:0 0 6px; color:white; }
.page-subtitle { font-size:14px; opacity:0.95; margin:0; color:white; max-width: 560px; }
.btn-upload-header { padding:14px 24px; background:white; color:#b45309; border:none; border-radius:12px; font-weight:800; font-size:15px; cursor:pointer; box-shadow:0 4px 14px rgba(0,0,0,0.15); transition:all 0.2s; white-space: nowrap; }
.btn-upload-header:hover { transform:translateY(-2px); }

.filter-card { background:white; border-radius:16px; padding:20px 24px; margin-bottom:24px; box-shadow:0 4px 16px rgba(0,0,0,0.06); }
.filter-row { display:flex; gap:16px; align-items:center; flex-wrap:wrap; }
.search-box { position:relative; flex:1; min-width:250px; }
.search-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:16px; }
.search-input { width:100%; padding:12px 40px; border:2px solid #e5e7eb; border-radius:12px; font-size:14px; box-sizing:border-box; }
.search-input:focus { outline:none; border-color:#d97706; }
.btn-clear-search { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:#ef4444; color:white; border:none; border-radius:50%; width:20px; height:20px; font-size:11px; cursor:pointer; }
.buyer-filter-wrap { min-width: 220px; }
.buyer-filter-select { width:100%; padding:11px 14px; border:2px solid #e5e7eb; border-radius:12px; font-size:14px; background:white; cursor:pointer; }
.buyer-filter-select:focus { outline:none; border-color:#d97706; }

.loading-state { text-align:center; padding:80px; background:white; border-radius:16px; }
.spinner { width:48px; height:48px; border:4px solid #e5e7eb; border-top-color:#d97706; border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 16px; }
@keyframes spin { to { transform:rotate(360deg); } }

.empty-state { text-align:center; padding:80px; background:white; border-radius:16px; box-shadow:0 4px 16px rgba(0,0,0,0.06); }
.empty-icon { font-size:64px; display:block; margin-bottom:16px; opacity:0.3; }
.empty-title { font-size:20px; font-weight:800; color:#374151; margin:0 0 8px; }
.empty-sub { font-size:14px; color:#9ca3af; margin:0; }

.dokumen-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:20px; margin-bottom:24px; }

.dokumen-card { background:white; border-radius:16px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.06); border:1px solid #f0f0f0; transition:all 0.2s; display:flex; flex-direction:column; }
.dokumen-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,0.12); }

.dok-preview { height:100px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; background:linear-gradient(135deg,#fee2e2,#fecaca); }
.dok-icon { font-size:40px; }
.dok-ext { font-size:11px; font-weight:800; color:white; background:rgba(0,0,0,0.3); padding:2px 8px; border-radius:6px; }

.dok-info { padding:16px; flex:1; }
.dok-buyer-badge { display:inline-block; padding:3px 10px; border-radius:6px; font-size:11px; font-weight:700; background:#fef3c7; color:#92400e; margin-bottom:8px; }
.dok-nama { font-size:14px; font-weight:800; color:#111827; margin-bottom:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.dok-keterangan { font-size:12px; color:#6b7280; margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.dok-footer { display:flex; flex-wrap:wrap; gap:6px; font-size:11px; color:#9ca3af; }

.dok-actions { padding:12px 16px; border-top:1px solid #f0f0f0; display:flex; gap:8px; flex-wrap: wrap; }
.btn-view { flex:1; padding:9px; background:#fffbeb; color:#92400e; border:1.5px solid #fde68a; border-radius:8px; font-weight:700; font-size:13px; cursor:pointer; transition:all 0.2s; }
.btn-view:hover { background:#fef3c7; }
.btn-download { flex:1; padding:9px; background:#d97706; color:white; border:none; border-radius:8px; font-weight:700; font-size:13px; cursor:pointer; transition:all 0.2s; }
.btn-download:hover { background:#b45309; }
.btn-revisi { padding:9px 12px; background:#fef3c7; color:#92400e; border:none; border-radius:8px; cursor:pointer; font-size:14px; transition:all 0.2s; }
.btn-revisi:hover { background:#fde68a; }
.btn-hapus { padding:9px 12px; background:#fee2e2; color:#ef4444; border:none; border-radius:8px; cursor:pointer; font-size:14px; transition:all 0.2s; }
.btn-hapus:hover { background:#fecaca; }

.revisi-info  { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:8px; font-size:14px; }
.revisi-label { color:#6b7280; }
.revisi-badge { padding:2px 10px; background:#fef3c7; color:#92400e; border-radius:12px; font-size:12px; font-weight:700; }
.revisi-hint  { font-size:12px; color:#92400e; background:#fef3c7; border:1px solid #fde68a; border-radius:7px; padding:8px 12px; margin-bottom:14px; }
.hint-opt     { font-weight:400; color:#9ca3af; font-size:12px; }

.pagination-wrapper { display:flex; justify-content:center; align-items:center; gap:16px; padding:20px; background:white; border-radius:16px; box-shadow:0 4px 16px rgba(0,0,0,0.06); }
.btn-page { padding:10px 20px; border:2px solid #e5e7eb; border-radius:10px; background:white; font-weight:700; cursor:pointer; transition:all 0.2s; }
.btn-page:hover:not(:disabled) { border-color:#d97706; color:#d97706; }
.btn-page:disabled { opacity:0.4; cursor:not-allowed; }
.page-info { font-size:14px; color:#6b7280; font-weight:600; }

.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:9999; backdrop-filter:blur(4px); }
.modal-card { background:white; border-radius:20px; width:90%; max-width:560px; box-shadow:0 20px 60px rgba(0,0,0,0.3); overflow:hidden; }
.modal-header { display:flex; justify-content:space-between; align-items:center; padding:20px 28px; background:linear-gradient(135deg,#d97706,#b45309); color:white; }
.modal-header h3 { margin:0; font-size:18px; font-weight:800; }
.btn-tutup-modal { background:rgba(255,255,255,0.2); border:none; color:white; width:32px; height:32px; border-radius:50%; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.btn-tutup-modal:hover { background:rgba(255,255,255,0.3); }
.modal-body { padding:28px; }
.modal-footer { display:flex; justify-content:flex-end; gap:12px; padding:20px 28px; background:#f9fafb; border-top:1px solid #e5e7eb; }

.drop-zone { border:3px dashed #cbd5e1; border-radius:14px; padding:32px; text-align:center; cursor:pointer; transition:all 0.2s; margin-bottom:20px; }
.drop-zone:hover, .drop-zone.drag-over { border-color:#d97706; background:#fffbeb; }
.drop-icon { font-size:48px; display:block; margin-bottom:12px; }
.drop-text { font-size:15px; font-weight:700; color:#374151; margin:0 0 6px; }
.drop-hint { font-size:12px; color:#9ca3af; margin:0; }
.file-selected { display:flex; align-items:center; gap:16px; }
.file-icon { font-size:36px; }
.file-detail { flex:1; text-align:left; }
.file-name { font-weight:700; color:#111827; margin:0 0 4px; font-size:14px; word-break:break-all; }
.file-size { font-size:12px; color:#6b7280; margin:0; }
.btn-ganti-file { padding:6px 14px; background:#e5e7eb; border:none; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; }

.form-group-dok { margin-bottom:16px; }
.form-label-dok { display:block; font-size:13px; font-weight:700; color:#374151; margin-bottom:6px; }
.req { color:#ef4444; }
.form-input-dok { width:100%; padding:11px 14px; border:2px solid #e5e7eb; border-radius:10px; font-size:14px; font-family:inherit; box-sizing:border-box; background: white; }
.form-input-dok:focus { outline:none; border-color:#d97706; }

.btn-batal { padding:10px 20px; background:#e5e7eb; color:#374151; border:none; border-radius:10px; font-weight:700; cursor:pointer; }
.btn-simpan-upload { padding:10px 24px; background:#d97706; color:white; border:none; border-radius:10px; font-weight:800; cursor:pointer; }
.btn-simpan-upload:disabled { opacity:0.5; cursor:not-allowed; }

@media (max-width:768px) {
  .dokumen-grid { grid-template-columns:1fr; }
  .filter-row { flex-direction:column; }
  .search-box { width:100%; }
  .buyer-filter-wrap { width: 100%; }
}

.preview-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; padding: 16px;
}
.modal-preview {
  background: white; border-radius: 16px;
  width: 95vw; height: 92vh;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 25px 80px rgba(0,0,0,0.4);
}
.preview-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 20px; background: #0f172a; color: white;
  flex-shrink: 0; gap: 12px;
}
.preview-title-wrap { display: flex; align-items: center; gap: 10px; min-width: 0; }
.preview-icon-head  { font-size: 22px; flex-shrink: 0; }
.preview-nama       { font-weight: 700; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.preview-buyer-badge { background: rgba(217,119,6,0.3); padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; flex-shrink: 0; white-space: nowrap; }
.preview-head-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.btn-dl-preview {
  background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.3);
  padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;
  white-space: nowrap; transition: background 0.15s;
}
.btn-dl-preview:hover { background: rgba(255,255,255,0.25); }
.preview-close {
  background: rgba(255,255,255,0.15); border: none; color: white;
  width: 32px; height: 32px; border-radius: 50%; font-size: 18px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: background 0.15s;
}
.preview-close:hover { background: rgba(239,68,68,0.7); }

.preview-body { flex: 1; overflow: hidden; background: #1e293b; position: relative; }

.preview-loading {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; gap: 14px; color: #94a3b8;
}

.preview-iframe {
  width: 100%; height: 100%; border: none; display: block;
}

.preview-unsupported {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; gap: 16px; padding: 40px; text-align: center; color: #94a3b8;
}
.unsupported-icon  { font-size: 72px; line-height: 1; }
.unsupported-title { font-size: 20px; font-weight: 700; color: #e2e8f0; margin: 0; }
.unsupported-desc  { font-size: 14px; line-height: 1.7; color: #94a3b8; margin: 0; }
.btn-dl-big {
  margin-top: 8px; padding: 12px 28px;
  background: #d97706; color: white; border: none; border-radius: 10px;
  font-size: 15px; font-weight: 700; cursor: pointer; transition: background 0.2s;
}
.btn-dl-big:hover { background: #b45309; }
</style>
