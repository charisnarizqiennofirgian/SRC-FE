<template>
  <DashboardLayout>
    <div class="page-header-batal">
      <div class="header-left-section">
        <div class="icon-badge-batal">
          <span class="batal-icon">↩️</span>
        </div>
        <div>
          <h1 class="page-title-batal">Pembatalan Transaksi Produksi</h1>
          <p class="page-subtitle-batal">
            Batalkan dokumen produksi yang salah input. Stok otomatis dikembalikan, lalu input ulang dengan angka yang benar.
          </p>
        </div>
      </div>
    </div>

    <div class="tab-row">
      <button :class="['tab-btn', { active: tab === 'documents' }]" @click="switchTab('documents')">Dokumen Produksi</button>
      <button :class="['tab-btn', { active: tab === 'history' }]" @click="switchTab('history')">Riwayat Pembatalan</button>
    </div>

    <div class="content-card-batal">
      <template v-if="tab === 'documents'">
        <div class="filter-row">
          <select v-model="filters.stage" class="filter-input">
            <option value="">Semua Tahap</option>
            <option v-for="s in stages" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
          <input
            v-model="filters.search"
            type="text"
            class="filter-input filter-search"
            placeholder="Cari No. Dokumen / PO / SO..."
            @keyup.enter="fetchDocuments(1)"
          />
          <input v-model="filters.date_from" type="date" class="filter-input" title="Dari tanggal" />
          <input v-model="filters.date_to" type="date" class="filter-input" title="Sampai tanggal" />
          <button class="btn-primary-batal" @click="fetchDocuments(1)">Cari</button>
        </div>

        <div v-if="isLoading" class="state-box">
          <div class="spinner-modern"></div>
          <p>Memuat dokumen...</p>
        </div>
        <div v-else-if="documents.length === 0" class="state-box">
          <div class="empty-icon">📭</div>
          <p>Tidak ada dokumen yang cocok.</p>
        </div>
        <div v-else class="table-wrapper">
          <table class="table-batal">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>No. Dokumen</th>
                <th>Tahap</th>
                <th>PO</th>
                <th>Hasil</th>
                <th>Dicatat Oleh</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="doc in documents" :key="doc.document_number">
                <td class="cell-date">{{ formatDate(doc.document_date) }}</td>
                <td class="cell-doc">{{ doc.document_number }}</td>
                <td><span class="stage-badge">{{ doc.stage_label }}</span></td>
                <td class="cell-po">{{ doc.po_number || '-' }}</td>
                <td class="cell-items">
                  <div v-for="o in doc.outputs" :key="o.item_name">{{ o.item_name }} <b>× {{ formatNumber(o.qty) }}</b></div>
                  <span v-if="!doc.outputs.length">-</span>
                </td>
                <td>{{ doc.user_name || '-' }}</td>
                <td class="text-center">
                  <button class="btn-detail" @click="openDetail(doc.document_number)">Detail / Batalkan</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="meta.total > 0" class="pagination-row">
          <span>{{ meta.from }}–{{ meta.to }} dari {{ meta.total }} dokumen</span>
          <div class="pagination-buttons">
            <button :disabled="meta.current_page <= 1" @click="fetchDocuments(meta.current_page - 1)">‹ Sebelumnya</button>
            <button :disabled="meta.current_page >= meta.last_page" @click="fetchDocuments(meta.current_page + 1)">Berikutnya ›</button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="filter-row">
          <input
            v-model="historySearch"
            type="text"
            class="filter-input filter-search"
            placeholder="Cari No. Dokumen / PO / alasan..."
            @keyup.enter="fetchHistory(1)"
          />
          <button class="btn-primary-batal" @click="fetchHistory(1)">Cari</button>
        </div>

        <div v-if="isLoading" class="state-box">
          <div class="spinner-modern"></div>
          <p>Memuat riwayat...</p>
        </div>
        <div v-else-if="history.length === 0" class="state-box">
          <div class="empty-icon">🗂️</div>
          <p>Belum ada dokumen yang dibatalkan.</p>
        </div>
        <div v-else class="table-wrapper">
          <table class="table-batal">
            <thead>
              <tr>
                <th>Dibatalkan</th>
                <th>No. Dokumen</th>
                <th>Tahap</th>
                <th>PO</th>
                <th>Alasan</th>
                <th>Oleh</th>
                <th class="text-center">Isi</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="h in history" :key="h.id">
                <tr>
                  <td class="cell-date">{{ h.cancelled_at }}</td>
                  <td class="cell-doc">{{ h.document_number }}</td>
                  <td><span class="stage-badge">{{ h.stage_label }}</span></td>
                  <td class="cell-po">{{ h.po_number || '-' }}</td>
                  <td class="cell-reason">{{ h.reason }}</td>
                  <td>{{ h.cancelled_by || '-' }}</td>
                  <td class="text-center">
                    <button class="btn-detail" @click="toggleHistory(h.id)">{{ expandedHistory === h.id ? 'Tutup' : 'Lihat' }}</button>
                  </td>
                </tr>
                <tr v-if="expandedHistory === h.id" class="row-expanded">
                  <td colspan="7">
                    <table class="table-lines">
                      <tbody>
                        <tr v-for="(l, idx) in h.lines" :key="idx">
                          <td><span :class="['dir-badge', l.direction === 'IN' ? 'dir-in' : 'dir-out']">{{ l.direction === 'IN' ? 'Masuk' : 'Keluar' }}</span></td>
                          <td>{{ l.item_name }} <span v-if="l.is_reject" class="reject-tag">reject</span></td>
                          <td>{{ l.warehouse_name }}</td>
                          <td class="text-right">{{ formatNumber(l.qty) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <div v-if="historyMeta.total > 0" class="pagination-row">
          <span>{{ historyMeta.from }}–{{ historyMeta.to }} dari {{ historyMeta.total }} pembatalan</span>
          <div class="pagination-buttons">
            <button :disabled="historyMeta.current_page <= 1" @click="fetchHistory(historyMeta.current_page - 1)">‹ Sebelumnya</button>
            <button :disabled="historyMeta.current_page >= historyMeta.last_page" @click="fetchHistory(historyMeta.current_page + 1)">Berikutnya ›</button>
          </div>
        </div>
      </template>
    </div>

    <div v-if="detailOpen" class="modal-overlay" @click.self="closeDetail">
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <div class="modal-title">{{ detail?.document_number || 'Memuat...' }}</div>
            <div v-if="detail" class="modal-subtitle">
              {{ detail.stage_label }} · {{ formatDate(detail.document_date) }} · {{ detail.po_number || '-' }}
            </div>
          </div>
          <button class="btn-close" @click="closeDetail">✕</button>
        </div>

        <div v-if="detailLoading" class="state-box">
          <div class="spinner-modern"></div>
        </div>

        <template v-else-if="detail">
          <div v-if="detail.notes" class="detail-notes">Catatan: {{ detail.notes }}</div>

          <table class="table-lines">
            <thead>
              <tr>
                <th>Arah</th>
                <th>Barang</th>
                <th>Gudang</th>
                <th class="text-right">Qty</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in detail.lines" :key="l.id">
                <td><span :class="['dir-badge', l.direction === 'IN' ? 'dir-in' : 'dir-out']">{{ l.direction === 'IN' ? 'Masuk' : 'Keluar' }}</span></td>
                <td>
                  {{ l.item_name }}
                  <span v-if="l.is_reject" class="reject-tag">reject</span>
                  <span v-if="l.finishing" class="finishing-tag">{{ l.finishing }}</span>
                </td>
                <td>{{ l.warehouse_name }}</td>
                <td class="text-right">{{ formatNumber(l.qty) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="effect-box">
            Kalau dibatalkan: barang <b>Masuk</b> akan ditarik lagi dari gudangnya, barang <b>Keluar</b> dikembalikan ke gudang asal,
            dan dokumen ini hilang dari dashboard &amp; laporan (salinannya disimpan di Riwayat Pembatalan).
          </div>

          <div v-if="!detail.can_cancel" class="blocker-box">
            <div class="blocker-title">Dokumen ini belum bisa dibatalkan:</div>
            <ul>
              <li v-for="(b, i) in detail.blockers" :key="i">{{ b }}</li>
            </ul>
          </div>

          <template v-else>
            <label class="reason-label">Alasan pembatalan <span class="required">*</span></label>
            <textarea
              v-model="reason"
              class="reason-input"
              rows="3"
              placeholder="Contoh: salah input qty, harusnya 31 bukan 62"
            ></textarea>
          </template>

          <div class="modal-actions">
            <button class="btn-secondary-batal" @click="closeDetail">Tutup</button>
            <button
              v-if="detail.can_cancel"
              class="btn-danger-batal"
              :disabled="reason.trim().length < 5 || isCancelling"
              @click="confirmCancel"
            >
              {{ isCancelling ? 'Membatalkan...' : confirmStep ? 'Ya, batalkan sekarang' : 'Batalkan Dokumen' }}
            </button>
          </div>
          <div v-if="confirmStep && !isCancelling" class="confirm-hint">
            Klik sekali lagi untuk memastikan. Pembatalan tidak bisa diurungkan.
          </div>
        </template>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import apiClient from '@/api/axios'
import { useToast } from 'vue-toastification'
import DashboardLayout from '@/components/DashboardLayout.vue'

const toast = useToast()

const tab = ref('documents')
const stages = ref([])
const isLoading = ref(false)

const filters = reactive({ stage: '', search: '', date_from: '', date_to: '' })
const documents = ref([])
const meta = ref({ current_page: 1, last_page: 1, from: 0, to: 0, total: 0 })

const historySearch = ref('')
const history = ref([])
const historyMeta = ref({ current_page: 1, last_page: 1, from: 0, to: 0, total: 0 })
const expandedHistory = ref(null)

const detailOpen = ref(false)
const detailLoading = ref(false)
const detail = ref(null)
const reason = ref('')
const confirmStep = ref(false)
const isCancelling = ref(false)

const toMeta = (d) => ({
  current_page: d.current_page,
  last_page: d.last_page,
  from: d.from || 0,
  to: d.to || 0,
  total: d.total,
})

const fetchStages = async () => {
  try {
    const res = await apiClient.get('/production-cancellations/stages')
    if (res.data.success) stages.value = res.data.data
  } catch (error) {
    console.error('Error fetching stages:', error)
  }
}

const fetchDocuments = async (page = 1) => {
  isLoading.value = true
  try {
    const res = await apiClient.get('/production-cancellations/documents', {
      params: {
        page,
        stage: filters.stage || undefined,
        search: filters.search || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
      },
    })
    if (res.data.success) {
      documents.value = res.data.data.data || []
      meta.value = toMeta(res.data.data)
    }
  } catch (error) {
    console.error('Error fetching documents:', error)
    toast.error('Gagal memuat dokumen produksi.')
  } finally {
    isLoading.value = false
  }
}

const fetchHistory = async (page = 1) => {
  isLoading.value = true
  try {
    const res = await apiClient.get('/production-cancellations/history', {
      params: { page, search: historySearch.value || undefined },
    })
    if (res.data.success) {
      history.value = res.data.data.data || []
      historyMeta.value = toMeta(res.data.data)
    }
  } catch (error) {
    console.error('Error fetching history:', error)
    toast.error('Gagal memuat riwayat pembatalan.')
  } finally {
    isLoading.value = false
  }
}

const switchTab = (name) => {
  tab.value = name
  if (name === 'documents') fetchDocuments(meta.value.current_page)
  else fetchHistory(1)
}

const toggleHistory = (id) => {
  expandedHistory.value = expandedHistory.value === id ? null : id
}

const openDetail = async (documentNumber) => {
  detailOpen.value = true
  detailLoading.value = true
  detail.value = null
  reason.value = ''
  confirmStep.value = false
  try {
    const res = await apiClient.get(`/production-cancellations/documents/${encodeURIComponent(documentNumber)}`)
    if (res.data.success) detail.value = res.data.data
  } catch (error) {
    console.error('Error fetching document detail:', error)
    toast.error(error.response?.data?.message || 'Gagal memuat detail dokumen.')
    detailOpen.value = false
  } finally {
    detailLoading.value = false
  }
}

const closeDetail = () => {
  if (isCancelling.value) return
  detailOpen.value = false
  detail.value = null
}

const confirmCancel = async () => {
  if (!confirmStep.value) {
    confirmStep.value = true
    return
  }
  isCancelling.value = true
  try {
    const res = await apiClient.post(
      `/production-cancellations/documents/${encodeURIComponent(detail.value.document_number)}/cancel`,
      { reason: reason.value.trim() },
    )
    toast.success(res.data.message || 'Dokumen berhasil dibatalkan.')
    isCancelling.value = false
    closeDetail()
    fetchDocuments(meta.value.current_page)
  } catch (error) {
    console.error('Error cancelling document:', error)
    const errors = error.response?.data?.errors
    const firstError = errors ? Object.values(errors).flat()[0] : null
    toast.error(firstError || error.response?.data?.message || 'Gagal membatalkan dokumen.')
    confirmStep.value = false
    isCancelling.value = false
    openDetail(detail.value.document_number)
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatNumber = (n) => {
  const v = parseFloat(n || 0)
  return v.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

onMounted(() => {
  fetchStages()
  fetchDocuments(1)
})
</script>

<style scoped>
.page-header-batal {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  padding: 2rem 2.5rem;
  border-radius: 20px;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 40px rgba(220, 38, 38, 0.25);
}
.header-left-section { display: flex; align-items: center; gap: 1.5rem; }
.icon-badge-batal {
  width: 64px; height: 64px; border-radius: 18px; flex-shrink: 0;
  background: rgba(255, 255, 255, 0.25);
  display: flex; align-items: center; justify-content: center;
}
.batal-icon { font-size: 2rem; }
.page-title-batal { font-size: 1.75rem; font-weight: 800; color: white; margin: 0 0 0.35rem; }
.page-subtitle-batal { color: rgba(255, 255, 255, 0.95); font-size: 0.95rem; margin: 0; font-weight: 500; }

.tab-row { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.tab-btn {
  padding: 0.7rem 1.3rem; border-radius: 12px; border: 2px solid #e5e7eb;
  background: white; color: #374151; font-weight: 700; cursor: pointer;
}
.tab-btn.active { background: #b91c1c; border-color: #b91c1c; color: white; }

.content-card-batal {
  background: white; border-radius: 20px; box-shadow: 0 6px 24px rgba(15, 23, 42, 0.08);
  border: 1px solid #f3f4f6; padding: 1.5rem 2rem 2rem;
}
.filter-row { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.filter-input {
  padding: 0.7rem 0.9rem; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 0.92rem;
  background: white;
}
.filter-input:focus { outline: none; border-color: #dc2626; }
.filter-search { flex: 1; min-width: 220px; }
.btn-primary-batal {
  padding: 0.7rem 1.5rem; background: #b91c1c; color: white; border: none;
  border-radius: 12px; font-weight: 700; cursor: pointer;
}
.btn-primary-batal:hover { background: #991b1b; }

.state-box { text-align: center; padding: 3rem 2rem; color: #6b7280; }
.empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
.spinner-modern {
  width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #dc2626;
  border-radius: 50%; margin: 0 auto 1rem; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.table-wrapper { overflow-x: auto; }
.table-batal { width: 100%; border-collapse: collapse; min-width: 860px; }
.table-batal thead { background: #f9fafb; }
.table-batal th {
  padding: 0.85rem 1rem; text-align: left; font-size: 0.76rem; font-weight: 800;
  color: #374151; text-transform: uppercase; letter-spacing: 0.05em;
  border-bottom: 2px solid #e5e7eb;
}
.table-batal td { padding: 0.8rem 1rem; border-bottom: 1px solid #f3f4f6; font-size: 0.9rem; vertical-align: top; }
.cell-date { white-space: nowrap; color: #6b7280; }
.cell-doc { font-weight: 800; color: #111827; white-space: nowrap; }
.cell-po { font-size: 0.82rem; color: #4b5563; max-width: 240px; }
.cell-items { font-size: 0.85rem; max-width: 320px; }
.cell-reason { max-width: 280px; }
.stage-badge {
  display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px;
  background: #fee2e2; color: #991b1b; font-size: 0.78rem; font-weight: 700; white-space: nowrap;
}
.text-center { text-align: center; }
.text-right { text-align: right; }
.btn-detail {
  padding: 0.45rem 0.9rem; border-radius: 10px; border: 2px solid #dc2626;
  background: white; color: #b91c1c; font-weight: 700; font-size: 0.82rem; cursor: pointer; white-space: nowrap;
}
.btn-detail:hover { background: #fef2f2; }
.row-expanded td { background: #fafafa; }

.pagination-row {
  display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem;
  color: #6b7280; font-size: 0.88rem; flex-wrap: wrap; gap: 0.75rem;
}
.pagination-buttons { display: flex; gap: 0.5rem; }
.pagination-buttons button {
  padding: 0.5rem 1rem; border-radius: 10px; border: 2px solid #e5e7eb;
  background: white; font-weight: 600; cursor: pointer;
}
.pagination-buttons button:disabled { opacity: 0.45; cursor: not-allowed; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.55); z-index: 1000;
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.modal-box {
  background: white; border-radius: 18px; width: 100%; max-width: 820px; max-height: 90vh;
  overflow-y: auto; padding: 1.5rem 1.75rem; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
.modal-title { font-size: 1.3rem; font-weight: 800; color: #111827; }
.modal-subtitle { color: #6b7280; font-size: 0.88rem; margin-top: 0.2rem; }
.btn-close { border: none; background: #f3f4f6; border-radius: 10px; width: 36px; height: 36px; cursor: pointer; font-size: 1rem; }
.detail-notes { background: #f9fafb; border-radius: 10px; padding: 0.6rem 0.9rem; margin-bottom: 0.9rem; font-size: 0.88rem; color: #374151; }

.table-lines { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.table-lines th {
  text-align: left; padding: 0.55rem 0.7rem; background: #f9fafb; font-size: 0.75rem;
  text-transform: uppercase; color: #6b7280; border-bottom: 1px solid #e5e7eb;
}
.table-lines td { padding: 0.5rem 0.7rem; border-bottom: 1px solid #f3f4f6; }
.dir-badge { padding: 0.15rem 0.55rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.dir-in { background: #dcfce7; color: #166534; }
.dir-out { background: #fef3c7; color: #92400e; }
.reject-tag, .finishing-tag {
  margin-left: 0.35rem; padding: 0.05rem 0.45rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700;
}
.reject-tag { background: #fee2e2; color: #b91c1c; }
.finishing-tag { background: #e0e7ff; color: #3730a3; text-transform: capitalize; }

.effect-box {
  margin-top: 1rem; padding: 0.75rem 1rem; border-radius: 12px; background: #eff6ff;
  color: #1e3a8a; font-size: 0.86rem; line-height: 1.5;
}
.blocker-box {
  margin-top: 1rem; padding: 0.85rem 1rem; border-radius: 12px; background: #fef2f2;
  border: 1px solid #fecaca; color: #991b1b; font-size: 0.88rem;
}
.blocker-title { font-weight: 800; margin-bottom: 0.4rem; }
.blocker-box ul { margin: 0; padding-left: 1.2rem; }
.blocker-box li { margin-bottom: 0.3rem; }
.reason-label { display: block; margin-top: 1rem; font-weight: 700; color: #374151; font-size: 0.9rem; }
.required { color: #dc2626; }
.reason-input {
  width: 100%; margin-top: 0.4rem; padding: 0.7rem 0.9rem; border: 2px solid #e5e7eb;
  border-radius: 12px; font-size: 0.92rem; resize: vertical; box-sizing: border-box;
}
.reason-input:focus { outline: none; border-color: #dc2626; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem; }
.btn-secondary-batal {
  padding: 0.7rem 1.3rem; border-radius: 12px; border: 2px solid #e5e7eb;
  background: white; font-weight: 700; cursor: pointer;
}
.btn-danger-batal {
  padding: 0.7rem 1.4rem; border-radius: 12px; border: none;
  background: #dc2626; color: white; font-weight: 800; cursor: pointer;
}
.btn-danger-batal:disabled { opacity: 0.5; cursor: not-allowed; }
.confirm-hint { text-align: right; color: #b91c1c; font-size: 0.82rem; margin-top: 0.5rem; font-weight: 600; }

@media (max-width: 640px) {
  .page-header-batal { padding: 1.25rem; }
  .content-card-batal { padding: 1rem; }
  .page-title-batal { font-size: 1.3rem; }
}
</style>
