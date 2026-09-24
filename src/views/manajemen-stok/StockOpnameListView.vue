<template>
  <DashboardLayout>
    <div class="page-header-opname">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-opname">
            <span class="opname-icon">📋</span>
          </div>
          <div>
            <h1 class="page-title-opname">Stok Opname</h1>
            <p class="page-subtitle-opname">
              Hitung fisik barang per gudang, cocokkan dengan stok sistem, lalu posting untuk mengoreksi stok.
            </p>
          </div>
        </div>
        <button class="btn-create-opname" @click="openCreateModal">
          <span>➕</span>
          <span>Buat Stok Opname</span>
        </button>
      </div>
    </div>

    <div class="content-card-opname">
      <div class="filter-row">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input
            v-model="filters.search"
            type="text"
            class="search-input"
            placeholder="Cari No. Opname..."
            @keyup.enter="fetchData(1)"
          />
        </div>
        <select v-model="filters.warehouse_id" class="filter-select" @change="fetchData(1)">
          <option value="">Semua Gudang</option>
          <option v-for="wh in warehouses" :key="wh.id" :value="wh.id">{{ wh.name }}</option>
        </select>
        <select v-model="filters.status" class="filter-select" @change="fetchData(1)">
          <option value="">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="posted">Posted</option>
        </select>
        <button class="btn-search" @click="fetchData(1)">Cari</button>
      </div>

      <div v-if="isLoading" class="state-box">
        <div class="spinner"></div>
        <p>Memuat data...</p>
      </div>

      <div v-else-if="rows.length === 0" class="state-box">
        <div class="empty-icon">📭</div>
        <div class="empty-title">Belum Ada Stok Opname</div>
        <p>Klik "Buat Stok Opname" untuk memulai penghitungan fisik gudang.</p>
      </div>

      <div v-else class="table-wrapper">
        <table class="table-opname">
          <thead>
            <tr>
              <th>No. Opname</th>
              <th>Tanggal</th>
              <th>Gudang</th>
              <th class="text-center">Progres Hitung</th>
              <th class="text-center">Status</th>
              <th>Dibuat Oleh</th>
              <th>Diposting</th>
              <th class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id" class="clickable-row" @click="goToDetail(row.id)">
              <td class="cell-number">{{ row.opname_number }}</td>
              <td class="cell-muted">{{ formatDate(row.opname_date) }}</td>
              <td>{{ row.warehouse?.name || '-' }}</td>
              <td class="text-center">
                <div class="progress-cell">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: progressPercent(row) + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ row.counted_count }}/{{ row.details_count }}</span>
                </div>
              </td>
              <td class="text-center">
                <span :class="['status-badge', row.status === 'posted' ? 'status-posted' : 'status-draft']">
                  {{ row.status === 'posted' ? 'Posted' : 'Draft' }}
                </span>
              </td>
              <td class="cell-muted">{{ row.creator?.name || '-' }}</td>
              <td class="cell-muted">
                <template v-if="row.posted_at">{{ formatDateTime(row.posted_at) }}<br />{{ row.poster?.name }}</template>
                <template v-else>-</template>
              </td>
              <td class="text-center" @click.stop>
                <button class="btn-action" @click="goToDetail(row.id)">
                  {{ row.status === 'draft' ? 'Isi Hasil' : 'Lihat' }}
                </button>
                <button v-if="row.status === 'draft'" class="btn-action btn-danger" @click="deleteDraft(row)">
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="meta.last_page > 1" class="pagination-row">
          <span class="pagination-info">{{ meta.from }}–{{ meta.to }} dari {{ meta.total }} data</span>
          <div class="pagination-btns">
            <button class="page-btn" :disabled="meta.current_page === 1" @click="fetchData(meta.current_page - 1)">
              ← Prev
            </button>
            <button
              class="page-btn"
              :disabled="meta.current_page === meta.last_page"
              @click="fetchData(meta.current_page + 1)"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Buat Stok Opname</h3>
          <button class="modal-close" @click="showCreateModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p class="modal-hint">
            Sistem akan mencatat semua barang yang punya stok di gudang ini beserta stok sistemnya saat ini.
            Setelah dibuat, cetak / download lembar hitung untuk diisi admin lapangan.
          </p>
          <label class="form-label">Gudang <span class="required">*</span></label>
          <select v-model="createForm.warehouse_id" class="form-control">
            <option value="">-- Pilih Gudang --</option>
            <option v-for="wh in warehouses" :key="wh.id" :value="wh.id">{{ wh.name }}</option>
          </select>

          <label class="form-label">Tanggal Opname <span class="required">*</span></label>
          <input v-model="createForm.opname_date" type="date" class="form-control" />

          <label class="form-label">Catatan</label>
          <textarea v-model="createForm.notes" rows="2" class="form-control" placeholder="Opsional"></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showCreateModal = false">Batal</button>
          <button class="btn-primary" :disabled="isCreating || !createForm.warehouse_id || !createForm.opname_date" @click="createOpname">
            {{ isCreating ? 'Memproses...' : 'Buat' }}
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { useToast } from 'vue-toastification'
import apiClient from '@/api/axios'
import DashboardLayout from '@/components/DashboardLayout.vue'

const router = useRouter()
const toast = useToast()

const rows = ref([])
const warehouses = ref([])
const isLoading = ref(true)
const meta = ref({ current_page: 1, last_page: 1, from: 0, to: 0, total: 0 })
const filters = reactive({ search: '', warehouse_id: '', status: '' })

const showCreateModal = ref(false)
const isCreating = ref(false)
const createForm = reactive({ warehouse_id: '', opname_date: '', notes: '' })

const today = () => new Date().toISOString().split('T')[0]

const fetchWarehouses = async () => {
  try {
    const response = await apiClient.get('/warehouses')
    warehouses.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching warehouses:', error)
  }
}

const fetchData = async (page = 1) => {
  isLoading.value = true
  try {
    const response = await apiClient.get('/stock-opnames', {
      params: {
        page,
        search: filters.search || undefined,
        warehouse_id: filters.warehouse_id || undefined,
        status: filters.status || undefined,
      },
    })
    const d = response.data.data
    rows.value = d.data || []
    meta.value = { current_page: d.current_page, last_page: d.last_page, from: d.from, to: d.to, total: d.total }
  } catch (error) {
    console.error('Error fetching stock opnames:', error)
    toast.error('Gagal memuat daftar stok opname.')
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  createForm.warehouse_id = ''
  createForm.opname_date = today()
  createForm.notes = ''
  showCreateModal.value = true
}

const createOpname = async () => {
  isCreating.value = true
  try {
    const response = await apiClient.post('/stock-opnames', { ...createForm })
    toast.success(response.data.message)
    showCreateModal.value = false
    goToDetail(response.data.data.id)
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal membuat stok opname.')
  } finally {
    isCreating.value = false
  }
}

const deleteDraft = async (row) => {
  const result = await Swal.fire({
    title: 'Hapus draft opname?',
    text: `${row.opname_number} (${row.warehouse?.name}) akan dihapus. Stok tidak berubah.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#dc2626',
  })
  if (!result.isConfirmed) return
  try {
    const response = await apiClient.delete(`/stock-opnames/${row.id}`)
    toast.success(response.data.message)
    fetchData(meta.value.current_page)
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal menghapus stok opname.')
  }
}

const goToDetail = (id) => router.push({ name: 'StockOpnameDetail', params: { id } })

const progressPercent = (row) => (row.details_count ? Math.round((row.counted_count / row.details_count) * 100) : 0)

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-'

onMounted(() => {
  fetchWarehouses()
  fetchData()
})
</script>

<style scoped>
.page-header-opname {
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  padding: 2rem 2.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(13, 148, 136, 0.3);
}
.header-content-wrapper { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
.header-left-section { display: flex; align-items: center; gap: 1.5rem; }
.icon-badge-opname { width: 64px; height: 64px; border-radius: 18px; background: rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; }
.opname-icon { font-size: 2rem; }
.page-title-opname { font-size: 1.75rem; font-weight: 800; color: white; margin: 0 0 0.35rem; }
.page-subtitle-opname { color: rgba(255,255,255,0.95); font-size: 0.95rem; margin: 0; font-weight: 500; }
.btn-create-opname {
  display: flex; align-items: center; gap: 0.6rem; padding: 0.9rem 1.5rem; background: white; color: #0f766e;
  border: none; border-radius: 14px; font-weight: 800; font-size: 0.95rem; cursor: pointer; transition: all 0.2s;
}
.btn-create-opname:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }

.content-card-opname {
  background: white; border-radius: 20px; box-shadow: 0 6px 24px rgba(15,23,42,0.08);
  border: 1px solid #f3f4f6; padding: 1.5rem 2rem 2rem;
}
.filter-row { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.search-wrapper { position: relative; flex: 1 1 240px; display: flex; align-items: center; }
.search-icon { position: absolute; left: 1rem; pointer-events: none; }
.search-input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.8rem; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 0.95rem; }
.search-input:focus, .filter-select:focus { outline: none; border-color: #0d9488; }
.filter-select { padding: 0.75rem 1rem; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 0.9rem; background: white; }
.btn-search { padding: 0.75rem 1.5rem; background: #0d9488; color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; }
.btn-search:hover { background: #0f766e; }

.state-box { text-align: center; padding: 3rem 2rem; color: #6b7280; }
.spinner { width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #0d9488; border-radius: 50%; margin: 0 auto 1rem; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; }
.empty-title { font-size: 1.2rem; font-weight: 800; color: #374151; margin-bottom: 0.5rem; }

.table-wrapper { overflow-x: auto; }
.table-opname { width: 100%; border-collapse: collapse; min-width: 860px; }
.table-opname thead { background: #f9fafb; }
.table-opname th {
  padding: 0.9rem 1rem; text-align: left; font-size: 0.78rem; font-weight: 800; color: #374151;
  text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e5e7eb;
}
.table-opname td { padding: 0.9rem 1rem; border-bottom: 1px solid #f3f4f6; font-size: 0.9rem; }
.clickable-row { cursor: pointer; }
.clickable-row:hover { background: #f0fdfa; }
.text-center { text-align: center; }
.cell-number { font-weight: 700; color: #111827; white-space: nowrap; }
.cell-muted { color: #6b7280; font-size: 0.85rem; }

.progress-cell { display: flex; align-items: center; gap: 0.6rem; justify-content: center; }
.progress-bar { width: 90px; height: 8px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
.progress-fill { height: 100%; background: #0d9488; }
.progress-text { font-size: 0.8rem; font-weight: 700; color: #374151; min-width: 70px; text-align: left; }

.status-badge { padding: 0.3rem 0.75rem; border-radius: 999px; font-size: 0.78rem; font-weight: 800; }
.status-draft { background: #fef3c7; color: #92400e; }
.status-posted { background: #dcfce7; color: #166534; }

.btn-action {
  padding: 0.4rem 0.85rem; margin: 0 0.2rem; border: 1px solid #0d9488; background: white; color: #0f766e;
  border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer;
}
.btn-action:hover { background: #f0fdfa; }
.btn-action.btn-danger { border-color: #fca5a5; color: #b91c1c; }
.btn-action.btn-danger:hover { background: #fef2f2; }

.pagination-row { display: flex; align-items: center; justify-content: space-between; padding: 1rem 0.25rem 0; }
.pagination-info { font-size: 0.85rem; color: #6b7280; font-weight: 600; }
.pagination-btns { display: flex; gap: 0.5rem; }
.page-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid #e5e7eb; background: white; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.page-btn:disabled { opacity: 0.4; cursor: default; }

.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 1rem; }
.modal-box { background: white; border-radius: 16px; width: 100%; max-width: 480px; box-shadow: 0 20px 50px rgba(0,0,0,0.25); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f3f4f6; }
.modal-header h3 { margin: 0; font-size: 1.15rem; font-weight: 800; color: #111827; }
.modal-close { border: none; background: transparent; font-size: 1.1rem; cursor: pointer; color: #6b7280; }
.modal-body { padding: 1.25rem 1.5rem; }
.modal-hint { font-size: 0.85rem; color: #4b5563; background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 10px; padding: 0.75rem 0.9rem; margin: 0 0 1rem; }
.form-label { display: block; font-size: 0.85rem; font-weight: 700; color: #374151; margin: 0.85rem 0 0.35rem; }
.required { color: #dc2626; }
.form-control { width: 100%; padding: 0.65rem 0.85rem; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 0.9rem; box-sizing: border-box; }
.form-control:focus { outline: none; border-color: #0d9488; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.6rem; padding: 1rem 1.5rem 1.25rem; }
.btn-secondary { padding: 0.65rem 1.2rem; border: 1px solid #d1d5db; background: white; border-radius: 10px; font-weight: 700; cursor: pointer; }
.btn-primary { padding: 0.65rem 1.4rem; border: none; background: #0d9488; color: white; border-radius: 10px; font-weight: 700; cursor: pointer; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 700px) {
  .page-header-opname { padding: 1.5rem; }
  .content-card-opname { padding: 1.25rem; }
}
</style>
