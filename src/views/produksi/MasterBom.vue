<template>
  <DashboardLayout>
    <div class="page-header-bom">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-bom">
            <span class="bom-icon">🧾</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-bom">Master BOM / Resep</h1>
            <p class="page-subtitle-bom">
              Daftar komponen/bahan penyusun tiap produk — dipakai sebagai referensi & filter di menu Moulding, Mesin, dan Assembling.
            </p>
          </div>
        </div>
        <div class="header-right-section">
          <button class="btn-header btn-header-secondary" @click="downloadTemplate">
            ⬇️ Template Excel
          </button>
          <button class="btn-header btn-header-secondary" @click="showImportModal = true">
            📤 Import Excel
          </button>
          <button class="btn-header btn-header-primary" @click="openCreateForm">
            ➕ Tambah Resep
          </button>
        </div>
      </div>
    </div>

    <div class="content-card-bom">
      <div class="card-toolbar">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input
            v-model="tableSearch"
            type="text"
            placeholder="Cari nama/kode produk..."
            class="search-input"
          />
        </div>
      </div>

      <div v-if="loadingList" class="loading-box">⏳ Memuat daftar resep...</div>

      <div v-else class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Kode Produk</th>
              <th>Nama Produk</th>
              <th>Jumlah Komponen</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredRows.length === 0">
              <td colspan="4" class="empty-cell">
                📭 {{ tableSearch ? 'Tidak ada hasil pencarian.' : 'Belum ada resep BOM.' }}
              </td>
            </tr>
            <tr v-for="row in paginatedRows" :key="row.item_id">
              <td><span class="code-badge">{{ row.item_code || '-' }}</span></td>
              <td>{{ row.item_name }}</td>
              <td class="text-center">{{ row.components_count }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn-action btn-edit" title="Edit Resep" @click="openEditForm(row)">✏️</button>
                  <button class="btn-action btn-delete" title="Hapus Resep" @click="deleteBom(row)">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredRows.length > 0" class="pagination-bar">
        <span class="pagination-info">
          Menampilkan {{ paginationStart }}–{{ paginationEnd }} dari {{ filteredRows.length }} resep
        </span>
        <div class="pagination-controls">
          <button
            class="btn-page"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >‹ Sebelumnya</button>
          <button
            v-for="p in pageNumbers"
            :key="p"
            :class="['btn-page', 'btn-page-num', { active: p === currentPage }]"
            @click="currentPage = p"
          >{{ p }}</button>
          <button
            class="btn-page"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >Berikutnya ›</button>
        </div>
      </div>
    </div>

    <!-- MODAL: TAMBAH / EDIT RESEP -->
    <div v-if="showFormModal" class="modal-overlay" @click.self="closeForm">
      <div class="modal-content modal-content-wide">
        <div class="modal-header">
          <div class="modal-header-left">
            <span class="modal-icon">🧾</span>
            <h3 class="modal-title">{{ isEditing ? 'Edit Resep' : 'Tambah Resep Baru' }}</h3>
          </div>
          <button class="modal-close-btn" @click="closeForm">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-group-modern">
            <label class="form-label-modern">Produk <span class="required-star">*</span></label>
            <vue-select
              v-model="formParent"
              :options="parentOptionsMerged"
              :reduce="(o) => o.item_id"
              label="label"
              placeholder="🔍 Ketik nama/kode produk jadi..."
              :filterable="false"
              :disabled="isEditing"
              @search="onSearchParent"
              @option:selected="onParentSelected"
              class="vue-select-bom"
            >
              <template #no-options>Ketik untuk mencari produk...</template>
              <template #option="o">
                <div class="item-option">
                  <span class="item-option-code">{{ o.item_code }}</span>
                  <span class="item-option-name">{{ o.item_name }}</span>
                </div>
              </template>
            </vue-select>
            <p v-if="isEditing" class="field-hint">Produk tidak bisa diubah saat edit — hapus resep ini dan buat baru kalau salah pilih produk.</p>
          </div>

          <div class="components-section">
            <div class="components-header">
              <span class="components-title">Daftar Komponen / Bahan</span>
              <button type="button" class="btn-add-row" @click="addComponentRow">➕ Tambah Baris</button>
            </div>

            <div v-if="formComponents.length === 0" class="empty-hint">
              Belum ada komponen — klik "Tambah Baris" untuk mulai.
            </div>

            <div v-for="(row, index) in formComponents" :key="row.local_id" class="component-row">
              <div class="component-row-select">
                <vue-select
                  v-model="row.item_id"
                  :options="childOptionsFor(row)"
                  :reduce="(o) => o.item_id"
                  label="label"
                  placeholder="🔍 Cari item komponen (bisa cari nama produk juga)..."
                  :filterable="false"
                  @search="(s, loading) => onSearchChild(s, loading, row.local_id)"
                  @option:selected="(opt) => onChildSelected(row.local_id, opt)"
                  class="vue-select-bom"
                >
                  <template #no-options>Ketik nama item atau nama produk...</template>
                  <template #option="o">
                    <div class="item-option">
                      <span class="item-option-code">{{ o.item_code }}</span>
                      <span class="item-option-name">{{ o.item_name }}</span>
                      <span v-if="o.nama_produk" class="item-option-produk">📦 {{ o.nama_produk }}</span>
                    </div>
                  </template>
                </vue-select>
              </div>
              <div class="component-row-qty">
                <input
                  v-model.number="row.qty"
                  type="number"
                  min="0.0001"
                  step="any"
                  class="form-input-modern"
                  placeholder="Qty / unit"
                />
              </div>
              <button type="button" class="btn-remove-row" @click="removeComponentRow(index)">✕</button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-modal-secondary" @click="closeForm">Batal</button>
          <button class="btn-modal-primary" :disabled="isSaving" @click="saveForm">
            {{ isSaving ? 'Menyimpan...' : '💾 Simpan Resep' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: IMPORT EXCEL -->
    <div v-if="showImportModal" class="modal-overlay" @click.self="showImportModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-header-left">
            <span class="modal-icon">📤</span>
            <h3 class="modal-title">Import BOM dari Excel</h3>
          </div>
          <button class="modal-close-btn" @click="showImportModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p class="field-hint">
            Gunakan file sesuai template yang bisa diunduh dari tombol "Template Excel". Import bersifat tambahan
            (tidak menghapus resep yang sudah ada, cuma menambah/update baris yang cocok).
          </p>
          <input type="file" accept=".xlsx,.xls,.csv" @change="onFileChange" />
        </div>
        <div class="modal-footer">
          <button class="btn-modal-secondary" @click="showImportModal = false">Batal</button>
          <button class="btn-modal-primary" :disabled="!importFile || importing" @click="importBom">
            {{ importing ? 'Mengimpor...' : 'Upload' }}
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import DashboardLayout from '../../components/DashboardLayout.vue'
import apiClient from '../../api/axios'
import { useNotification } from '../../composables/useNotification.js'
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import { debounce } from 'lodash-es'
import Swal from 'sweetalert2'

const { showSuccess, showError } = useNotification()

const loadingList = ref(true)
const rows = ref([])
const tableSearch = ref('')

const filteredRows = computed(() => {
  if (!tableSearch.value) return rows.value
  const s = tableSearch.value.toLowerCase()
  return rows.value.filter(
    (r) => r.item_name?.toLowerCase().includes(s) || r.item_code?.toLowerCase().includes(s)
  )
})

// === PAGINATION (client-side — endpoint /production/bom tidak paginate) ===
const currentPage = ref(1)
const perPage = 20

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / perPage)))

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredRows.value.slice(start, start + perPage)
})

const paginationStart = computed(() => filteredRows.value.length === 0 ? 0 : (currentPage.value - 1) * perPage + 1)
const paginationEnd = computed(() => Math.min(currentPage.value * perPage, filteredRows.value.length))

const pageNumbers = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const range = 2
  const pages = []
  for (let p = Math.max(1, current - range); p <= Math.min(total, current + range); p++) {
    pages.push(p)
  }
  return pages
})

watch(tableSearch, () => { currentPage.value = 1 })
watch(totalPages, (t) => { if (currentPage.value > t) currentPage.value = t })

const fetchList = async () => {
  loadingList.value = true
  try {
    const res = await apiClient.get('/production/bom')
    rows.value = res.data.data || []
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil daftar resep BOM')
  } finally {
    loadingList.value = false
  }
}

// === FORM TAMBAH/EDIT ===
const showFormModal = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const formParent = ref(null)
const parentOptions = ref([])
// vue-select + :reduce + :options async butuh object opsi yang cocok dengan value terpilih
// selalu ada di :options, kalau tidak label-nya gak bisa ditampilkan (cuma nongol angka id).
// Simpan object lengkap yang terakhir dipilih terpisah, lalu selalu digabung ke opsi hasil search.
const selectedParentOption = ref(null)
const formComponents = ref([])
const childOptionsByRow = ref({})     // keyed by row.local_id — hasil search terakhir
const selectedChildByRow = ref({})    // keyed by row.local_id — object lengkap yang dipilih

const parentOptionsMerged = computed(() => {
  if (!selectedParentOption.value) return parentOptions.value
  const already = parentOptions.value.some((o) => o.item_id === selectedParentOption.value.item_id)
  return already ? parentOptions.value : [selectedParentOption.value, ...parentOptions.value]
})

const childOptionsFor = (row) => {
  const searched  = childOptionsByRow.value[row.local_id] || []
  const selected  = selectedChildByRow.value[row.local_id]
  if (!selected) return searched
  const already = searched.some((o) => o.item_id === selected.item_id)
  return already ? searched : [selected, ...searched]
}

const onParentSelected = (opt) => {
  selectedParentOption.value = opt || null
}

const onChildSelected = (localId, opt) => {
  selectedChildByRow.value[localId] = opt || null
}

const onSearchParent = debounce(async (search, loading) => {
  if (!search) { parentOptions.value = []; return }
  loading(true)
  try {
    const res = await apiClient.get('/production/bom/search-items', { params: { role: 'parent', search } })
    parentOptions.value = (res.data.data || []).map((i) => ({
      item_id: i.item_id,
      item_code: i.item_code,
      item_name: i.item_name,
      label: `${i.item_code} - ${i.item_name}`,
    }))
  } catch (error) {
    console.error(error)
  } finally {
    loading(false)
  }
}, 300)

const onSearchChild = debounce(async (search, loading, localId) => {
  if (!search) { childOptionsByRow.value[localId] = []; return }
  loading(true)
  try {
    const res = await apiClient.get('/production/bom/search-items', { params: { role: 'child', search } })
    childOptionsByRow.value[localId] = (res.data.data || []).map((i) => ({
      item_id: i.item_id,
      item_code: i.item_code,
      item_name: i.item_name,
      nama_produk: i.nama_produk || null,
      label: `${i.item_code} - ${i.item_name}`,
    }))
  } catch (error) {
    console.error(error)
  } finally {
    loading(false)
  }
}, 300)

const addComponentRow = () => {
  formComponents.value.push({ local_id: Date.now() + Math.random(), item_id: null, qty: null })
}
const removeComponentRow = (index) => {
  const row = formComponents.value[index]
  if (row) {
    delete childOptionsByRow.value[row.local_id]
    delete selectedChildByRow.value[row.local_id]
  }
  formComponents.value.splice(index, 1)
}

const openCreateForm = () => {
  isEditing.value = false
  formParent.value = null
  parentOptions.value = []
  selectedParentOption.value = null
  formComponents.value = [{ local_id: Date.now(), item_id: null, qty: null }]
  childOptionsByRow.value = {}
  selectedChildByRow.value = {}
  showFormModal.value = true
}

const openEditForm = async (row) => {
  isEditing.value = true
  showFormModal.value = true
  formParent.value = row.item_id
  selectedParentOption.value = { item_id: row.item_id, item_code: row.item_code, item_name: row.item_name, label: `${row.item_code} - ${row.item_name}` }
  parentOptions.value = []
  formComponents.value = []
  childOptionsByRow.value = {}
  selectedChildByRow.value = {}

  try {
    const res = await apiClient.get(`/production/bom/${row.item_id}`)
    const data = res.data.data
    formComponents.value = (data.components || []).map((c, idx) => {
      const localId = Date.now() + idx
      selectedChildByRow.value[localId] = { item_id: c.item_id, item_code: c.item_code, item_name: c.item_name, nama_produk: c.nama_produk || null, label: `${c.item_code} - ${c.item_name}` }
      return { local_id: localId, item_id: c.item_id, qty: c.qty }
    })
    if (formComponents.value.length === 0) {
      formComponents.value = [{ local_id: Date.now(), item_id: null, qty: null }]
    }
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil detail resep')
  }
}

const closeForm = () => {
  showFormModal.value = false
}

const saveForm = async () => {
  if (!formParent.value) { showError('Validasi', 'Produk wajib dipilih'); return }

  const validComponents = formComponents.value.filter((c) => c.item_id && c.qty > 0)
  if (validComponents.length === 0) { showError('Validasi', 'Minimal 1 komponen wajib diisi dengan qty > 0'); return }

  if (validComponents.some((c) => Number(c.item_id) === Number(formParent.value))) {
    showError('Validasi', 'Komponen tidak boleh sama dengan produk itu sendiri'); return
  }

  isSaving.value = true
  try {
    await apiClient.post('/production/bom', {
      parent_item_id: Number(formParent.value),
      components: validComponents.map((c) => ({ item_id: Number(c.item_id), qty: Number(c.qty) })),
    })
    showSuccess('Sukses', 'Resep BOM berhasil disimpan')
    showFormModal.value = false
    fetchList()
  } catch (error) {
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors && JSON.stringify(error.response.data.errors)) ||
      'Gagal menyimpan resep BOM'
    showError('Gagal', message)
  } finally {
    isSaving.value = false
  }
}

const deleteBom = (row) => {
  Swal.fire({
    title: 'Hapus Resep?',
    text: `Semua komponen resep "${row.item_name}" akan dihapus. Lanjutkan?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal',
  }).then(async (result) => {
    if (!result.isConfirmed) return
    try {
      await apiClient.delete(`/production/bom/${row.item_id}`)
      showSuccess('Sukses', `Resep "${row.item_name}" berhasil dihapus`)
      fetchList()
    } catch (error) {
      console.error(error)
      showError('Gagal', 'Gagal menghapus resep')
    }
  })
}

// === IMPORT EXCEL ===
const showImportModal = ref(false)
const importFile = ref(null)
const importing = ref(false)

const onFileChange = (e) => {
  importFile.value = e.target.files[0] || null
}

const importBom = async () => {
  if (!importFile.value) return
  importing.value = true
  const formData = new FormData()
  formData.append('file', importFile.value)
  try {
    await apiClient.post('/production/bom/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    showSuccess('Sukses', 'Import BOM berhasil diproses')
    showImportModal.value = false
    importFile.value = null
    fetchList()
  } catch (error) {
    showError('Gagal', error.response?.data?.message || 'Gagal import BOM')
  } finally {
    importing.value = false
  }
}

const downloadTemplate = async () => {
  try {
    const response = await apiClient.get('/stock-adjustments/template-bom', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    let fileName = 'template_bom_produk.xlsx'
    const contentDisposition = response.headers['content-disposition']
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/)
      if (match && match.length === 2) fileName = match[1]
    }
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mendownload template BOM')
  }
}

onMounted(fetchList)
</script>

<style scoped>
.page-header-bom {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 2.5rem; border-radius: 20px; margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(102,126,234,0.3);
}
.header-content-wrapper { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
.header-left-section { display: flex; align-items: center; gap: 1.5rem; flex: 1; min-width: 280px; }
.icon-badge-bom { width: 64px; height: 64px; border-radius: 16px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.bom-icon { font-size: 2rem; }
.page-title-bom { font-size: 1.75rem; font-weight: 800; color: white; margin: 0 0 0.4rem; }
.page-subtitle-bom { color: rgba(255,255,255,0.92); font-size: 0.9rem; margin: 0; font-weight: 500; max-width: 520px; }
.header-right-section { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.btn-header { display: flex; align-items: center; gap: 0.4rem; padding: 0.7rem 1.1rem; border-radius: 10px; font-weight: 600; font-size: 0.875rem; cursor: pointer; border: none; transition: all 0.2s; white-space: nowrap; }
.btn-header-secondary { background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4); }
.btn-header-secondary:hover { background: rgba(255,255,255,0.3); }
.btn-header-primary { background: white; color: #667eea; }
.btn-header-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 10px rgba(0,0,0,0.15); }

.content-card-bom { background: white; border-radius: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #f0f2f5; overflow: hidden; }
.card-toolbar { padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
.search-wrapper { position: relative; max-width: 360px; }
.search-icon { position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%); font-size: 0.9rem; }
.search-input { width: 100%; padding: 0.65rem 1rem 0.65rem 2.5rem; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 0.9rem; }
.search-input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.12); }

.loading-box { padding: 3rem; text-align: center; color: #6b7280; }

.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.data-table thead { background: #f9fafb; }
.data-table th { text-align: left; padding: 0.9rem 1.25rem; font-weight: 700; color: #374151; border-bottom: 2px solid #e5e7eb; white-space: nowrap; }
.data-table td { padding: 0.9rem 1.25rem; color: #374151; border-bottom: 1px solid #f3f4f6; }
.data-table tbody tr:hover { background: #f9fafb; }
.text-center { text-align: center; }
.empty-cell { text-align: center; padding: 2.5rem; color: #9ca3af; }

.pagination-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; }
.pagination-info { font-size: 0.82rem; color: #6b7280; }
.pagination-controls { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
.btn-page { padding: 0.45rem 0.8rem; border-radius: 8px; border: 1px solid #e5e7eb; background: white; color: #374151; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.btn-page:hover:not(:disabled) { background: #f3f4f6; border-color: #d1d5db; }
.btn-page:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-page-num.active { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-color: transparent; }

.code-badge { display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 0.3rem 0.7rem; border-radius: 6px; font-weight: 700; font-size: 0.78rem; }

.action-buttons { display: flex; gap: 0.5rem; }
.btn-action { padding: 0.45rem 0.65rem; border-radius: 8px; border: none; cursor: pointer; font-size: 0.9rem; transition: all 0.15s; }
.btn-edit { background: #eff6ff; color: #3b82f6; }
.btn-edit:hover { background: #3b82f6; color: white; }
.btn-delete { background: #fef2f2; color: #ef4444; }
.btn-delete:hover { background: #ef4444; color: white; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-content { background: white; border-radius: 16px; max-width: 520px; width: 100%; max-height: 90vh; overflow-y: auto; }
.modal-content-wide { max-width: 680px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 2px solid #e5e7eb; background: linear-gradient(135deg, #f8f9ff, #e8ecff); position: sticky; top: 0; z-index: 1; }
.modal-header-left { display: flex; align-items: center; gap: 0.75rem; }
.modal-icon { font-size: 1.5rem; }
.modal-title { font-size: 1.1rem; font-weight: 700; color: #1f2937; margin: 0; }
.modal-close-btn { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; background: white; border: 1px solid #d1d5db; border-radius: 50%; cursor: pointer; }
.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1.25rem 1.5rem; border-top: 1px solid #e5e7eb; }

.form-group-modern { display: flex; flex-direction: column; gap: 0.5rem; }
.form-label-modern { font-size: 0.875rem; font-weight: 600; color: #374151; }
.required-star { color: #ef4444; }
.field-hint { font-size: 0.8rem; color: #9ca3af; margin: 0; }

.components-section { display: flex; flex-direction: column; gap: 0.75rem; }
.components-header { display: flex; justify-content: space-between; align-items: center; }
.components-title { font-size: 0.9rem; font-weight: 700; color: #374151; }
.btn-add-row { background: #ecfeff; border: 2px dashed #0891b2; color: #0e7490; padding: 0.5rem 0.9rem; border-radius: 8px; font-weight: 600; font-size: 0.82rem; cursor: pointer; }
.btn-add-row:hover { background: #cffafe; }

.empty-hint { padding: 1.5rem; text-align: center; color: #9ca3af; font-size: 0.875rem; background: #f9fafb; border-radius: 10px; border: 1px dashed #d1d5db; }

.component-row { display: flex; align-items: center; gap: 0.75rem; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 0.75rem; }
.component-row-select { flex: 1; min-width: 0; }
.component-row-qty { width: 120px; flex-shrink: 0; }
.form-input-modern { width: 100%; padding: 0.6rem 0.8rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; }
.form-input-modern:focus { outline: none; border-color: #667eea; }
.btn-remove-row { background: #fee2e2; color: #ef4444; border: none; border-radius: 6px; width: 32px; height: 32px; font-weight: 700; cursor: pointer; flex-shrink: 0; }
.btn-remove-row:hover { background: #fecaca; }

.btn-modal-secondary, .btn-modal-primary { padding: 0.7rem 1.4rem; border-radius: 10px; font-weight: 600; font-size: 0.9rem; cursor: pointer; border: none; }
.btn-modal-secondary { background: #f3f4f6; color: #374151; }
.btn-modal-secondary:hover { background: #e5e7eb; }
.btn-modal-primary { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
.btn-modal-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 10px rgba(102,126,234,0.35); }
.btn-modal-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.vue-select-bom :deep(.vs__dropdown-toggle) { padding: 0.4rem 0.5rem; border: 2px solid #e5e7eb; border-radius: 8px; min-height: 44px; }
.vue-select-bom.vs--open :deep(.vs__dropdown-toggle) { border-color: #667eea; }
.item-option { display: flex; flex-direction: column; gap: 2px; padding: 6px 10px; }
.item-option-code { font-size: 0.78rem; font-weight: 700; color: #667eea; }
.item-option-name { font-size: 0.875rem; color: #111827; }
.item-option-produk { font-size: 0.78rem; color: #7c3aed; font-weight: 600; }

@media (max-width: 768px) {
  .header-content-wrapper { flex-direction: column; align-items: flex-start; }
  .component-row { flex-wrap: wrap; }
  .component-row-select { flex-basis: 100%; }
  .component-row-qty { flex: 1; }
}
</style>
