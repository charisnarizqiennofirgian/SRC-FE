<template>
  <DashboardLayout>
    <!-- PAGE HEADER -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge">📋</div>
          <div>
            <h1 class="page-title">Purchase Request</h1>
            <p class="page-subtitle">Daftar permintaan pembelian barang</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-rekap" @click="openRekapModal">
            📊 Export Rekap
          </button>
          <router-link :to="{ name: 'PurchaseRequestCreate' }" class="btn-create">
            ➕ Buat PR Baru
          </router-link>
        </div>
      </div>
    </div>

    <!-- FILTER -->
    <div class="filter-card">
      <div class="filter-row">
        <input
          v-model="search"
          type="text"
          class="input-search"
          placeholder="Cari no. PR atau catatan..."
          @input="onSearch"
        />
        <select v-model="filterStatus" class="input-filter" @change="onFilterStatusChange">
          <option value="">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>

    <!-- TABLE -->
    <div class="content-card">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Memuat data...</p>
      </div>

      <template v-else>
        <div class="table-wrapper">
          <table class="main-table">
            <thead>
              <tr>
                <th>No. PR</th>
                <th>Referensi SO</th>
                <th>Dibuat Oleh</th>
                <th>Deadline</th>
                <th>Item</th>
                <th>Status</th>
                <th class="th-action">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="rows.length === 0">
                <td colspan="7" class="empty-state">Tidak ada data Purchase Request</td>
              </tr>
              <tr v-for="pr in rows" :key="pr.id" class="data-row">
                <td>
                  <span class="pr-number">{{ pr.pr_number }}</span>
                </td>
                <td>{{ pr.sales_order?.so_number ?? '-' }}</td>
                <td>{{ pr.requested_by?.name ?? '-' }}</td>
                <td>
                  <span :class="['deadline', isOverdue(pr.deadline) && pr.status !== 'completed' ? 'overdue' : '']">
                    {{ formatDate(pr.deadline) }}
                  </span>
                </td>
                <td>{{ pr.details_count ?? pr.details?.length ?? 0 }} item</td>
                <td>
                  <span :class="['status-badge', `status-${pr.status}`]">
                    {{ statusLabel(pr.status) }}
                  </span>
                </td>
                <td class="td-action">
                  <router-link
                    :to="{ name: 'PurchaseRequestDetail', params: { id: pr.id }, query: { returnTo: route.fullPath } }"
                    class="btn-detail"
                    title="Lihat Detail"
                  >🔍</router-link>
                  <router-link
                    v-if="pr.status === 'draft' || pr.status === 'submitted'"
                    :to="{ name: 'PurchaseRequestEdit', params: { id: pr.id }, query: { returnTo: route.fullPath } }"
                    class="btn-edit"
                    title="Edit"
                  >✏️</router-link>
                  <button
                    v-if="pr.status === 'draft'"
                    class="btn-delete"
                    title="Hapus"
                    @click="confirmDelete(pr)"
                  >🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PAGINATION -->
        <div v-if="totalPages > 1" class="pagination">
          <button :disabled="page === 1" @click="goPage(page - 1)" class="page-btn">‹</button>
          <button
            v-for="p in totalPages" :key="p"
            :class="['page-btn', { active: p === page }]"
            @click="goPage(p)"
          >{{ p }}</button>
          <button :disabled="page === totalPages" @click="goPage(page + 1)" class="page-btn">›</button>
        </div>
      </template>
    </div>

    <!-- MODAL KONFIRMASI HAPUS -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal-container">
        <div class="modal-header">
          <h3>🗑️ Hapus Purchase Request</h3>
          <button class="modal-close" @click="deleteTarget = null">✕</button>
        </div>
        <div class="modal-body">
          <p>Yakin hapus <strong>{{ deleteTarget.pr_number }}</strong>? Tindakan ini tidak bisa dibatalkan.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="deleteTarget = null">Batal</button>
          <button class="btn-confirm-delete" :disabled="isDeleting" @click="doDelete">
            {{ isDeleting ? '⏳ Menghapus...' : '🗑️ Ya, Hapus' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL EXPORT REKAP -->
    <div v-if="showRekapModal" class="modal-overlay" @click.self="closeRekapModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3>📊 Export Rekap PR</h3>
          <button class="modal-close" @click="closeRekapModal">✕</button>
        </div>
        <div class="modal-body">
          <p class="rekap-hint">Pilih rentang No. PR — hasilnya berupa Excel berisi No. PR, Supplier, Item, QTY, dan Harga (sesuai PO hasil convert), lengkap dengan baris Total Keseluruhan.</p>

          <div class="rekap-field">
            <label>PR Awal <span class="required-star">*</span></label>
            <input
              v-model="rekapForm.prStart"
              type="text"
              class="rekap-input"
              placeholder="Contoh: PR-202607-091"
              list="pr-number-datalist"
              @input="rekapError = ''"
            />
          </div>

          <div class="rekap-field">
            <label>PR Akhir <span class="required-star">*</span></label>
            <input
              v-model="rekapForm.prEnd"
              type="text"
              class="rekap-input"
              placeholder="Contoh: PR-202608-002"
              list="pr-number-datalist"
              @input="rekapError = ''"
            />
          </div>

          <datalist id="pr-number-datalist">
            <option v-for="pr in prNumberOptions" :key="pr.id" :value="pr.pr_number" />
          </datalist>

          <p v-if="rekapError" class="rekap-error">⚠️ {{ rekapError }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeRekapModal">Batal</button>
          <button class="btn-confirm-rekap" :disabled="isExportingRekap" @click="doExportRekap">
            {{ isExportingRekap ? '⏳ Membuat Excel...' : '⬇️ Download Excel' }}
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../../components/DashboardLayout.vue'
import apiClient from '../../api/axios'
import { useToast } from 'vue-toastification'

const route  = useRoute()
const router = useRouter()
const toast  = useToast()

const rows         = ref([])
const loading      = ref(false)
const search       = ref(route.query.search || '')
const filterStatus = ref(route.query.status || '')
const page         = ref(parseInt(route.query.page) || 1)
const perPage      = 15
const total        = ref(0)
const deleteTarget = ref(null)
const isDeleting   = ref(false)

const showRekapModal   = ref(false)
const isExportingRekap = ref(false)
const rekapError       = ref('')
const prNumberOptions  = ref([])
const rekapForm = ref({ prStart: '', prEnd: '' })

// Sinkronkan state filter/pagination ke URL supaya tidak hilang saat kembali dari Detail/Edit.
const syncQuery = () => {
  const query = {}
  if (page.value > 1)   query.page   = page.value
  if (search.value)     query.search = search.value
  if (filterStatus.value) query.status = filterStatus.value
  router.replace({ query })
}

let searchTimer = null

const totalPages = computed(() => Math.ceil(total.value / perPage))

const fetchData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, per_page: perPage }
    if (search.value)       params.search = search.value
    if (filterStatus.value) params.status = filterStatus.value

    const res   = await apiClient.get('/purchase-requests', { params, timeout: 10000 })
    const data  = res.data
    rows.value  = data.data ?? []
    total.value = data.meta?.total ?? data.total ?? rows.value.length
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      toast.error('Server tidak merespons — endpoint /purchase-requests belum tersedia')
    } else {
      toast.error(error.response?.data?.message || 'Gagal memuat data Purchase Request')
    }
    rows.value  = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const onSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    syncQuery()
    fetchData()
  }, 400)
}

const onFilterStatusChange = () => {
  page.value = 1
  syncQuery()
  fetchData()
}

const goPage = (p) => {
  page.value = p
  syncQuery()
  fetchData()
}

const confirmDelete = (pr) => {
  deleteTarget.value = pr
}

const doDelete = async () => {
  if (!deleteTarget.value) return
  isDeleting.value = true
  try {
    await apiClient.delete(`/purchase-requests/${deleteTarget.value.id}`)
    toast.success(`PR ${deleteTarget.value.pr_number} berhasil dihapus`)
    deleteTarget.value = null
    fetchData()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal menghapus PR')
  } finally {
    isDeleting.value = false
  }
}

const statusLabel = (status) => {
  const map = {
    draft:       'Draft',
    submitted:   'Submitted',
    in_progress: 'In Progress',
    completed:   'Completed',
    cancelled:   'Cancelled',
  }
  return map[status] ?? status
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const isOverdue = (deadline) => deadline && new Date(deadline) < new Date()

const PR_NUMBER_PATTERN = /^PR-\d{6}-\d{3}$/

const openRekapModal = async () => {
  showRekapModal.value = true
  rekapError.value = ''
  rekapForm.value = { prStart: '', prEnd: '' }
  if (prNumberOptions.value.length === 0) {
    try {
      const res = await apiClient.get('/purchase-requests/list-for-rekap')
      prNumberOptions.value = res.data.data || []
    } catch (error) {
      // Datalist cuma bantuan autocomplete — kalau gagal diambil, user tetap bisa ketik manual
      console.error('Gagal memuat daftar No. PR', error)
    }
  }
}

const closeRekapModal = () => {
  showRekapModal.value = false
}

const doExportRekap = async () => {
  const { prStart, prEnd } = rekapForm.value
  if (!prStart || !prEnd) {
    rekapError.value = 'PR Awal dan PR Akhir wajib diisi'
    return
  }
  if (!PR_NUMBER_PATTERN.test(prStart) || !PR_NUMBER_PATTERN.test(prEnd)) {
    rekapError.value = 'Format No. PR tidak valid (contoh: PR-202607-091)'
    return
  }

  isExportingRekap.value = true
  rekapError.value = ''
  try {
    const response = await apiClient.get('/purchase-requests/export-rekap', {
      params: { pr_start: prStart, pr_end: prEnd },
      responseType: 'blob',
    })

    const url  = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Rekap_${prStart}_${prEnd}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    toast.success('Rekap Excel berhasil didownload')
    closeRekapModal()
  } catch (error) {
    rekapError.value = error.response?.data?.message || 'Gagal membuat rekap Excel'
  } finally {
    isExportingRekap.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #0369a1, #0284c7);
  padding: 28px 32px;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(3, 105, 161, 0.25);
}
.header-content { display: flex; justify-content: space-between; align-items: center; color: white; gap: 20px; flex-wrap: wrap; }
.header-left    { display: flex; align-items: center; gap: 16px; }
.icon-badge     { width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
.page-title     { font-size: 24px; font-weight: 800; margin: 0 0 4px; }
.page-subtitle  { font-size: 13px; opacity: 0.9; margin: 0; }
.btn-create     { background: white; color: #0369a1; padding: 10px 18px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 14px; white-space: nowrap; }
.header-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.btn-rekap      { background: rgba(255,255,255,0.15); color: white; border: 2px solid rgba(255,255,255,0.5); padding: 9px 16px; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; white-space: nowrap; }
.btn-rekap:hover { background: rgba(255,255,255,0.25); }

.filter-card {
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.filter-row   { display: flex; gap: 12px; flex-wrap: wrap; }
.input-search { flex: 1; min-width: 200px; padding: 10px 14px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-family: inherit; }
.input-search:focus { outline: none; border-color: #0369a1; }
.input-filter { padding: 10px 14px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-family: inherit; background: white; }
.input-filter:focus { outline: none; border-color: #0369a1; }

.content-card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }

.loading-state { padding: 80px; text-align: center; color: #6b7280; }
.spinner { width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #0369a1; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
@keyframes spin { to { transform: rotate(360deg); } }

.table-wrapper { overflow-x: auto; }
.main-table { width: 100%; border-collapse: collapse; min-width: 700px; }
.main-table thead { background: #1e293b; }
.main-table th { padding: 13px 16px; text-align: left; color: white; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
.th-action { text-align: center; }
.main-table td { padding: 13px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.data-row:hover { background: #f0f9ff; }
.empty-state { text-align: center; color: #9ca3af; padding: 48px; font-size: 14px; }

.pr-number { font-weight: 700; color: #0369a1; font-family: 'Courier New', monospace; font-size: 13px; }
.deadline { font-size: 13px; }
.deadline.overdue { color: #dc2626; font-weight: 700; }

.status-badge       { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; white-space: nowrap; }
.status-draft       { background: #f3f4f6; color: #374151; }
.status-submitted   { background: #dbeafe; color: #1e40af; }
.status-in_progress { background: #fef3c7; color: #92400e; }
.status-completed   { background: #d1fae5; color: #065f46; }
.status-cancelled   { background: #fee2e2; color: #991b1b; }

.td-action { text-align: center; }
.btn-detail, .btn-edit {
  width: 32px; height: 32px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 7px; font-size: 14px; text-decoration: none;
  transition: background 0.15s; margin: 0 2px;
}
.btn-detail       { background: #eff6ff; color: #1d4ed8; }
.btn-detail:hover { background: #dbeafe; }
.btn-edit         { background: #fefce8; color: #854d0e; }
.btn-edit:hover   { background: #fef9c3; }
.btn-delete {
  width: 32px; height: 32px; margin: 0 2px;
  background: #fee2e2; color: #dc2626;
  border: none; border-radius: 7px; cursor: pointer; font-size: 14px;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.btn-delete:hover { background: #fecaca; }

.pagination { display: flex; justify-content: center; gap: 6px; padding: 16px; border-top: 1px solid #f1f5f9; }
.page-btn {
  min-width: 34px; height: 34px; padding: 0 10px;
  border: 2px solid #e5e7eb; border-radius: 7px;
  background: white; cursor: pointer; font-size: 14px; font-weight: 600; color: #374151;
  transition: all 0.15s;
}
.page-btn:hover:not(:disabled) { border-color: #0369a1; color: #0369a1; }
.page-btn.active { background: #0369a1; border-color: #0369a1; color: white; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.modal-overlay    { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(3px); }
.modal-container  { background: white; border-radius: 14px; width: 90%; max-width: 440px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); overflow: hidden; }
.modal-header     { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; border-bottom: 1px solid #f1f5f9; }
.modal-header h3  { font-size: 16px; font-weight: 800; margin: 0; color: #111827; }
.modal-close      { background: none; border: none; font-size: 18px; cursor: pointer; color: #6b7280; }
.modal-body       { padding: 20px; color: #374151; font-size: 14px; line-height: 1.6; }
.modal-footer     { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 20px; border-top: 1px solid #f1f5f9; }
.btn-cancel         { padding: 9px 18px; background: #e5e7eb; color: #374151; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px; }
.btn-confirm-delete { padding: 9px 18px; background: #dc2626; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px; }
.btn-confirm-delete:disabled { opacity: 0.6; cursor: not-allowed; }

.rekap-hint  { font-size: 13px; color: #6b7280; margin: 0 0 16px; line-height: 1.6; }
.rekap-field { margin-bottom: 14px; }
.rekap-field label { display: block; font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 6px; }
.required-star { color: #dc2626; }
.rekap-input { width: 100%; padding: 10px 14px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-family: 'Courier New', monospace; box-sizing: border-box; }
.rekap-input:focus { outline: none; border-color: #0369a1; }
.rekap-error { color: #dc2626; font-size: 13px; margin: 8px 0 0; font-weight: 600; }
.btn-confirm-rekap { padding: 9px 18px; background: #0369a1; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px; }
.btn-confirm-rekap:hover:not(:disabled) { background: #0284c7; }
.btn-confirm-rekap:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
