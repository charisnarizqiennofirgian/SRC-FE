<template>
  <DashboardLayout>
    <div class="page-header-so">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge">🧾</div>
          <div>
            <h1 class="page-title">SO Terbaru</h1>
            <p class="page-subtitle">
              Sales Order yang sudah final dari tim Penjualan. Cetak versi PPIC lalu antar ke lapangan.
            </p>
          </div>
        </div>
        <button class="btn-refresh-header" :disabled="loading" @click="reload">🔄 Muat Ulang</button>
      </div>
    </div>

    <div class="filter-card">
      <div class="filter-row">
        <div class="chip-group">
          <button :class="['chip', { active: filter.mode === 'perlu' }]" @click="setMode('perlu')">
            🔔 Perlu Ditindaklanjuti
            <span class="chip-count">{{ counts.perlu }}</span>
          </button>
          <button :class="['chip', { active: filter.mode === 'semua' }]" @click="setMode('semua')">
            📋 Semua
            <span class="chip-count">{{ counts.semua }}</span>
          </button>
        </div>
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="filter.search"
            type="text"
            placeholder="Cari No SO, No PI, PO Buyer, atau Buyer..."
            class="search-input"
            @keyup.enter="reload"
          />
          <button v-if="filter.search" class="btn-clear-search" @click="clearSearch">✕</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat SO...</p>
    </div>

    <div v-else-if="rows.length === 0" class="empty-state">
      <span class="empty-icon">{{ filter.mode === 'perlu' ? '✅' : '📭' }}</span>
      <p class="empty-title">
        {{ filter.mode === 'perlu' ? 'Semua SO sudah dicetak' : 'Belum ada SO' }}
      </p>
      <p class="empty-sub">
        {{ filter.mode === 'perlu' ? 'Tidak ada SO baru, berubah, atau dibatalkan saat ini.' : 'SO final akan muncul di sini.' }}
      </p>
    </div>

    <div v-else class="table-card">
      <div class="table-wrap">
        <table class="so-table">
          <thead>
            <tr>
              <th>No SO</th>
              <th>No PI</th>
              <th>Buyer</th>
              <th>PO Buyer</th>
              <th>Tgl SO</th>
              <th>Tgl Kirim</th>
              <th>Status Cetak</th>
              <th class="th-aksi">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id" :class="'row-' + row.print_status">
              <td class="td-so">{{ row.so_number }}</td>
              <td>{{ row.no_pi || '-' }}</td>
              <td>{{ row.buyer_name || '-' }}</td>
              <td>{{ row.customer_po_number || '-' }}</td>
              <td>{{ formatDate(row.so_date) }}</td>
              <td>{{ formatDate(row.delivery_date) }}</td>
              <td>
                <span :class="['status-badge', 'badge-' + row.print_status]">
                  {{ statusLabel(row) }}
                </span>
                <div class="status-sub">{{ statusSub(row) }}</div>
              </td>
              <td class="td-aksi">
                <button
                  v-if="row.print_status !== 'batal' && row.print_status !== 'ditarik'"
                  class="btn-act btn-print"
                  @click="cetak(row)"
                >
                  🖨️ {{ row.print_status === 'sudah' ? 'Cetak Lagi' : 'Cetak' }}
                </button>
                <button
                  v-if="row.print_status === 'batal'"
                  class="btn-act btn-withdraw"
                  :disabled="savingId === row.id"
                  @click="tandaiDitarik(row)"
                >
                  ✋ Sudah Ditarik
                </button>
                <button class="btn-act btn-history" @click="openHistory(row)">📜 Riwayat</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.last_page > 1" class="pagination-bar">
        <span class="pagination-info">
          {{ pagination.from }}–{{ pagination.to }} dari {{ pagination.total }} SO
        </span>
        <div class="pagination-btns">
          <button :disabled="pagination.current_page <= 1" @click="goToPage(pagination.current_page - 1)">← Prev</button>
          <span class="page-now">{{ pagination.current_page }} / {{ pagination.last_page }}</span>
          <button :disabled="pagination.current_page >= pagination.last_page" @click="goToPage(pagination.current_page + 1)">Next →</button>
        </div>
      </div>
    </div>

    <div v-if="history.open" class="modal-overlay" @click.self="history.open = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>📜 Riwayat Cetak — {{ history.soNumber }}</h3>
          <button class="modal-close" @click="history.open = false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="history.loading" class="history-empty">Memuat...</div>
          <div v-else-if="history.items.length === 0" class="history-empty">Belum pernah dicetak.</div>
          <table v-else class="history-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Aksi</th>
                <th>Oleh</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in history.items" :key="h.id">
                <td>{{ formatDateTime(h.created_at) }}</td>
                <td>{{ actionLabel(h.action) }}</td>
                <td>{{ h.user_name || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { useToast } from 'vue-toastification'
import DashboardLayout from '../../components/DashboardLayout.vue'
import apiClient from '../../api/axios'
import { useSoPrintNotifier } from '../../composables/useSoPrintNotifier'

const router = useRouter()
const toast = useToast()
const { pendingCount, refresh: refreshNotifier } = useSoPrintNotifier()

const loading = ref(false)
const rows = ref([])
const counts = ref({ perlu: 0, semua: 0 })
const pagination = ref({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0 })
const filter = reactive({ mode: 'perlu', search: '', page: 1 })
const savingId = ref(null)
const history = reactive({ open: false, loading: false, soNumber: '', items: [] })

const fetchRows = async () => {
  loading.value = true
  try {
    const res = await apiClient.get('/dokumen/sales-orders', {
      params: { filter: filter.mode, search: filter.search || undefined, page: filter.page, per_page: 20 },
    })
    rows.value = res.data.data || []
    counts.value = res.data.counts || { perlu: 0, semua: 0 }
    pagination.value = res.data.pagination || pagination.value
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal memuat daftar SO.')
  } finally {
    loading.value = false
  }
}

const reload = () => {
  filter.page = 1
  fetchRows()
  refreshNotifier()
}

const setMode = (mode) => {
  if (filter.mode === mode) return
  filter.mode = mode
  reload()
}

const clearSearch = () => {
  filter.search = ''
  reload()
}

const goToPage = (page) => {
  filter.page = page
  fetchRows()
}

const cetak = (row) => {
  router.push({ name: 'CetakSoDrafter', params: { id: row.id } })
}

const tandaiDitarik = async (row) => {
  const result = await Swal.fire({
    title: 'Kertas SO sudah ditarik?',
    html: `Pastikan cetakan <b>${row.so_number}</b> sudah diambil kembali dari lapangan.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, sudah ditarik',
    cancelButtonText: 'Batal',
  })
  if (!result.isConfirmed) return
  savingId.value = row.id
  try {
    await apiClient.post(`/dokumen/sales-orders/${row.id}/withdrawn`)
    toast.success(`${row.so_number} ditandai sudah ditarik.`)
    await fetchRows()
    refreshNotifier()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal menyimpan.')
  } finally {
    savingId.value = null
  }
}

const openHistory = async (row) => {
  history.open = true
  history.loading = true
  history.soNumber = row.so_number
  history.items = []
  try {
    const res = await apiClient.get(`/dokumen/sales-orders/${row.id}/history`)
    history.items = res.data.data || []
  } catch {
    toast.error('Gagal memuat riwayat.')
  } finally {
    history.loading = false
  }
}

const statusLabel = (row) => {
  switch (row.print_status) {
    case 'baru':
      return '🆕 Baru'
    case 'berubah':
      return '⚠️ Ada perubahan — cetak ulang'
    case 'batal':
      return '❌ Dibatalkan — tarik kertas'
    case 'ditarik':
      return '📤 Sudah ditarik'
    default:
      return '✅ Sudah dicetak'
  }
}

const statusSub = (row) => {
  if (row.print_status === 'batal') {
    return row.is_deleted ? 'SO dihapus oleh Penjualan' : `SO kembali ke status ${row.so_status}`
  }
  if (!row.last_action) return ''
  if (row.last_action === 'baseline') return 'SO lama (sebelum fitur ini)'
  const who = row.last_action_by ? ` oleh ${row.last_action_by}` : ''
  const verb = row.last_action === 'withdrawn' ? 'Ditarik' : 'Terakhir dicetak'
  return `${verb}${who}, ${formatDateTime(row.last_action_at)}`
}

const actionLabel = (action) =>
  ({ print: '🖨️ Dicetak', withdrawn: '✋ Kertas ditarik', baseline: '📌 Data awal sistem' })[action] || action

const formatDate = (value) => {
  if (!value) return '-'
  const [y, m, d] = String(value).slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

const formatDateTime = (value) => {
  if (!value) return '-'
  const [date, time] = String(value).split(' ')
  return `${formatDate(date)} ${time || ''}`.trim()
}

watch(pendingCount, () => {
  fetchRows()
})

onMounted(() => {
  fetchRows()
  refreshNotifier()
})
</script>

<style scoped>
.page-header-so {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  padding: 32px 36px;
  border-radius: 20px;
  margin-bottom: 24px;
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.25);
}
.header-content { display: flex; justify-content: space-between; align-items: center; color: white; gap: 20px; flex-wrap: wrap; }
.header-left { display: flex; align-items: center; gap: 20px; }
.icon-badge { width: 64px; height: 64px; background: rgba(255, 255, 255, 0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; }
.page-title { font-size: 28px; font-weight: 900; margin: 0 0 6px; color: white; }
.page-subtitle { font-size: 14px; opacity: 0.95; margin: 0; color: white; max-width: 560px; }
.btn-refresh-header { padding: 12px 22px; background: white; color: #1e40af; border: none; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15); }
.btn-refresh-header:disabled { opacity: 0.6; cursor: not-allowed; }

.filter-card { background: white; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06); }
.filter-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
.chip-group { display: flex; gap: 10px; flex-wrap: wrap; }
.chip { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border: 2px solid #e5e7eb; border-radius: 12px; background: white; font-weight: 700; font-size: 14px; color: #374151; cursor: pointer; }
.chip.active { border-color: #2563eb; background: #eff6ff; color: #1e40af; }
.chip-count { background: #e5e7eb; color: #374151; border-radius: 10px; padding: 1px 8px; font-size: 12px; }
.chip.active .chip-count { background: #2563eb; color: white; }
.search-box { position: relative; flex: 1; min-width: 250px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 16px; }
.search-input { width: 100%; padding: 12px 40px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 14px; box-sizing: border-box; }
.search-input:focus { outline: none; border-color: #2563eb; }
.btn-clear-search { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: #ef4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 11px; cursor: pointer; }

.loading-state { text-align: center; padding: 80px; background: white; border-radius: 16px; }
.spinner { width: 48px; height: 48px; border: 4px solid #e5e7eb; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 80px 20px; background: white; border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06); }
.empty-icon { font-size: 48px; }
.empty-title { font-size: 18px; font-weight: 800; color: #111827; margin: 12px 0 4px; }
.empty-sub { color: #6b7280; margin: 0; }

.table-card { background: white; border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06); overflow: hidden; }
.table-wrap { overflow-x: auto; }
.so-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.so-table th { background: #f8fafc; text-align: left; padding: 14px 16px; font-weight: 800; color: #475569; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
.so-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; color: #1f2937; }
.td-so { font-weight: 800; white-space: nowrap; }
.row-baru { background: #f0f9ff; }
.row-berubah { background: #fffbeb; }
.row-batal { background: #fef2f2; }
.status-badge { display: inline-block; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 800; white-space: nowrap; }
.badge-baru { background: #dbeafe; color: #1e40af; }
.badge-berubah { background: #fef3c7; color: #92400e; }
.badge-batal { background: #fee2e2; color: #991b1b; }
.badge-sudah { background: #dcfce7; color: #166534; }
.badge-ditarik { background: #e5e7eb; color: #374151; }
.status-sub { font-size: 12px; color: #6b7280; margin-top: 4px; }
.th-aksi, .td-aksi { white-space: nowrap; }
.btn-act { padding: 7px 12px; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; margin-right: 6px; }
.btn-act:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-print { background: #2563eb; color: white; }
.btn-withdraw { background: #dc2626; color: white; }
.btn-history { background: #f1f5f9; color: #334155; }

.pagination-bar { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-top: 1px solid #f1f5f9; flex-wrap: wrap; gap: 10px; }
.pagination-info { color: #6b7280; font-size: 13px; }
.pagination-btns { display: flex; align-items: center; gap: 10px; }
.pagination-btns button { padding: 7px 14px; border: 1px solid #e5e7eb; background: white; border-radius: 8px; cursor: pointer; font-weight: 700; }
.pagination-btns button:disabled { opacity: 0.5; cursor: not-allowed; }
.page-now { font-weight: 700; color: #374151; }

.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.modal-card { background: white; border-radius: 16px; width: 100%; max-width: 520px; max-height: 80vh; display: flex; flex-direction: column; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 22px; border-bottom: 1px solid #e5e7eb; }
.modal-header h3 { margin: 0; font-size: 17px; }
.modal-close { background: none; border: none; font-size: 18px; cursor: pointer; }
.modal-body { padding: 18px 22px; overflow-y: auto; }
.history-empty { color: #6b7280; text-align: center; padding: 20px; }
.history-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.history-table th, .history-table td { padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: left; }
.history-table th { color: #475569; font-weight: 800; }

@media (max-width: 768px) {
  .page-header-so { padding: 22px; }
  .page-title { font-size: 22px; }
}
</style>
