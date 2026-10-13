<template>
  <DashboardLayout>
    <div class="page-header-konfirmasi">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-konfirmasi">
            <span class="konfirmasi-icon">🚚</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-konfirmasi">Konfirmasi Pengiriman</h1>
            <p class="page-subtitle-konfirmasi">
              Catat barang & qty yang benar-benar dimuat/dikirim, supaya tim Penjualan tahu tanpa perlu ditanya.
            </p>
          </div>
        </div>
        <button class="btn-create-konfirmasi" @click="goToCreate">
          <span class="btn-icon">➕</span>
          <span>Konfirmasi Pengiriman Baru</span>
        </button>
      </div>
    </div>

    <div class="content-card-konfirmasi">
      <div class="search-row">
        <div class="search-wrapper-konfirmasi">
          <span class="search-icon">🔍</span>
          <input
            v-model="search"
            type="text"
            class="search-input-konfirmasi"
            placeholder="Cari No. DO atau No. SO..."
            @keyup.enter="fetchData(1)"
          />
        </div>
        <button class="btn-search-konfirmasi" @click="fetchData(1)">Cari</button>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner-modern"></div>
        <p>Memuat riwayat...</p>
      </div>

      <div v-else-if="rows.length === 0" class="empty-state-konfirmasi">
        <div class="empty-icon">📭</div>
        <div class="empty-title">Belum Ada Riwayat</div>
        <p class="empty-message">Belum ada pengiriman yang dikonfirmasi dari sini.</p>
      </div>

      <div v-else class="table-wrapper-konfirmasi">
        <table class="table-konfirmasi">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>No. DO</th>
              <th>Buyer</th>
              <th>SO Asal</th>
              <th>Barang</th>
              <th class="text-center">Status</th>
              <th>Dicatat Oleh</th>
              <th class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td class="cell-date">{{ formatDate(row.delivery_date) }}</td>
              <td class="cell-do-number">{{ row.do_number }}</td>
              <td>{{ row.buyer?.name || '-' }}</td>
              <td>
                <span v-for="so in row.sales_orders" :key="so.id" class="so-badge">
                  {{ so.so_number }}
                </span>
              </td>
              <td class="cell-items">{{ itemSummary(row) }}</td>
              <td class="text-center">
                <span :class="['status-badge', statusClass(row.status)]">{{ statusLabel(row.status) }}</span>
              </td>
              <td class="cell-user">{{ row.user?.name || '-' }}</td>
              <td class="text-center">
                <div class="action-group">
                  <button
                    v-if="canEdit(row)"
                    class="btn-edit-konfirmasi"
                    title="Edit barang & qty yang dikirim"
                    @click="goToEdit(row)"
                  >
                    ✏️ Edit
                  </button>
                  <span v-else class="cell-user" :title="lockedReason(row)">🔒</span>
                  <button
                    class="btn-edit-konfirmasi"
                    title="Edit keterangan per barang di Delivery Order (Supir)"
                    @click="openRemarkModal(row)"
                  >
                    📝 Keterangan
                  </button>
                  <button class="btn-edit-konfirmasi" title="Cetak Delivery Order (Supir)" @click="goToPrint(row)">
                    🖨️ Cetak DO
                  </button>
                </div>
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

    <div v-if="remarkModal.open" class="modal-overlay-remark" @click.self="closeRemarkModal">
      <div class="modal-remark">
        <div class="modal-remark-header">
          <div>
            <div class="modal-remark-title">Keterangan DO Supir</div>
            <div class="modal-remark-subtitle">{{ remarkModal.doNumber }}</div>
          </div>
          <button class="modal-remark-close" @click="closeRemarkModal">✕</button>
        </div>

        <div v-if="remarkModal.loading" class="loading-state">
          <div class="spinner-modern"></div>
          <p>Memuat barang...</p>
        </div>

        <div v-else class="modal-remark-body">
          <p class="modal-remark-hint">
            Kosongkan untuk memakai keterangan otomatis (teks abu-abu). Keterangan hanya mengubah cetakan DO, tidak
            mengubah qty atau stok.
          </p>
          <table class="table-konfirmasi table-remark">
            <thead>
              <tr>
                <th>Barang</th>
                <th class="text-center">Box</th>
                <th class="text-center">Pcs</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in remarkModal.details" :key="d.id">
                <td>{{ d.item_name }}</td>
                <td class="text-center">{{ formatQty(d.quantity_boxes) }}</td>
                <td class="text-center">{{ formatQty(d.quantity_shipped) }}</td>
                <td>
                  <input
                    v-model="d.remark"
                    type="text"
                    maxlength="255"
                    class="remark-input"
                    :placeholder="autoRemark(d) || 'Keterangan...'"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-remark-footer">
          <button class="page-btn" @click="closeRemarkModal">Batal</button>
          <button
            class="btn-search-konfirmasi"
            :disabled="remarkModal.loading || remarkModal.saving"
            @click="saveRemarks"
          >
            {{ remarkModal.saving ? 'Menyimpan...' : '💾 Simpan Keterangan' }}
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/api/axios'
import { useToast } from 'vue-toastification'
import DashboardLayout from '@/components/DashboardLayout.vue'

const router = useRouter()
const toast = useToast()

const rows = ref([])
const isLoading = ref(true)
const search = ref('')
const meta = ref({ current_page: 1, last_page: 1, from: 0, to: 0, total: 0 })

const fetchData = async (page = 1) => {
  isLoading.value = true
  try {
    const response = await apiClient.get('/production/shipment-confirmations', {
      params: { page, search: search.value || undefined },
    })
    if (response.data.success) {
      const d = response.data.data
      rows.value = d.data || []
      meta.value = {
        current_page: d.current_page,
        last_page: d.last_page,
        from: d.from,
        to: d.to,
        total: d.total,
      }
    }
  } catch (error) {
    console.error('Error fetching shipment confirmations:', error)
    toast.error('Gagal memuat riwayat konfirmasi pengiriman.')
  } finally {
    isLoading.value = false
  }
}

const itemSummary = (row) => {
  const names = (row.details || []).map((d) => d.item_name).filter(Boolean)
  if (names.length === 0) return '-'
  if (names.length <= 2) return names.join(', ')
  return `${names.slice(0, 2).join(', ')} +${names.length - 2} lainnya`
}

const statusLabel = (status) => {
  const map = { DRAFT: 'Draft', SHIPPED: 'Terkirim', DELIVERED: 'Diterima Buyer' }
  return map[status] || status
}

const statusClass = (status) => {
  const map = { DRAFT: 'status-draft', SHIPPED: 'status-shipped', DELIVERED: 'status-delivered' }
  return map[status] || ''
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const goToCreate = () => {
  router.push({ name: 'KonfirmasiPengirimanCreate' })
}

const canEdit = (row) => ['DRAFT', 'SHIPPED'].includes(row.status)

const lockedReason = (row) =>
  row.status === 'DELIVERED' ? 'Sudah diterima buyer / siap invoice, tidak bisa diedit' : 'Tidak bisa diedit'

const goToEdit = (row) => {
  router.push({ name: 'KonfirmasiPengirimanEdit', params: { id: row.id } })
}

const goToPrint = (row) => {
  router.push({ name: 'KonfirmasiPengirimanCetakDo', params: { id: row.id } })
}

const remarkModal = reactive({
  open: false,
  loading: false,
  saving: false,
  id: null,
  doNumber: '',
  details: [],
})

const formatQty = (val) => (val ? parseFloat(val).toFixed(0) : 0)

const autoRemark = (d) => {
  const boxes = parseFloat(d.quantity_boxes) || 0
  const pcs = parseFloat(d.quantity_shipped) || 0
  if (boxes <= 0) return ''
  return `1 BOX = ${(pcs / boxes).toFixed(0)} PCS`
}

const openRemarkModal = async (row) => {
  Object.assign(remarkModal, { open: true, loading: true, saving: false, id: row.id, doNumber: row.do_number, details: [] })
  try {
    const response = await apiClient.get(`/production/shipment-confirmations/${row.id}`)
    remarkModal.details = (response.data.data?.details || []).map((d) => ({
      id: d.id,
      item_name: d.item_name,
      quantity_boxes: d.quantity_boxes,
      quantity_shipped: d.quantity_shipped,
      remark: d.remark || '',
    }))
  } catch {
    toast.error('Gagal memuat barang pengiriman.')
    remarkModal.open = false
  } finally {
    remarkModal.loading = false
  }
}

const closeRemarkModal = () => {
  if (remarkModal.saving) return
  remarkModal.open = false
}

const saveRemarks = async () => {
  remarkModal.saving = true
  try {
    const response = await apiClient.put(`/production/shipment-confirmations/${remarkModal.id}/remarks`, {
      details: remarkModal.details.map((d) => ({ id: d.id, remark: (d.remark || '').trim() })),
    })
    toast.success(response.data.message || 'Keterangan berhasil disimpan.')
    remarkModal.saving = false
    remarkModal.open = false
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal menyimpan keterangan.')
    remarkModal.saving = false
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
.page-header-konfirmasi {
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
  padding: 2rem 2.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
}
.header-content-wrapper { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
.header-left-section { display: flex; align-items: center; gap: 1.5rem; }
.icon-badge-konfirmasi { width: 64px; height: 64px; border-radius: 18px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; }
.konfirmasi-icon { font-size: 2rem; }
.page-title-konfirmasi { font-size: 1.75rem; font-weight: 800; color: white; margin: 0 0 0.35rem; }
.page-subtitle-konfirmasi { color: rgba(255,255,255,0.95); font-size: 0.95rem; margin: 0; font-weight: 500; }

.btn-create-konfirmasi {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.9rem 1.5rem; background: white; color: #0e7490;
  border: none; border-radius: 14px; font-weight: 800; font-size: 0.95rem;
  cursor: pointer; transition: all 0.2s;
}
.btn-create-konfirmasi:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }

.content-card-konfirmasi {
  background: white; border-radius: 20px; box-shadow: 0 6px 24px rgba(15,23,42,0.08);
  border: 1px solid #f3f4f6; padding: 1.5rem 2rem 2rem;
}

.search-row { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; }
.search-wrapper-konfirmasi { position: relative; flex: 1; display: flex; align-items: center; }
.search-icon { position: absolute; left: 1rem; font-size: 1.1rem; pointer-events: none; }
.search-input-konfirmasi {
  width: 100%; padding: 0.8rem 1rem 0.8rem 2.8rem; border: 2px solid #e5e7eb;
  border-radius: 12px; font-size: 0.95rem;
}
.search-input-konfirmasi:focus { outline: none; border-color: #0891b2; }
.btn-search-konfirmasi {
  padding: 0.8rem 1.5rem; background: #0891b2; color: white; border: none;
  border-radius: 12px; font-weight: 700; cursor: pointer;
}
.btn-search-konfirmasi:hover { background: #0e7490; }

.loading-state, .empty-state-konfirmasi { text-align: center; padding: 3rem 2rem; color: #6b7280; }
.spinner-modern {
  width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #0891b2;
  border-radius: 50%; margin: 0 auto 1rem; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; }
.empty-title { font-size: 1.2rem; font-weight: 800; color: #374151; margin-bottom: 0.5rem; }
.empty-message { font-size: 0.95rem; }

.table-wrapper-konfirmasi { overflow-x: auto; }
.table-konfirmasi { width: 100%; border-collapse: collapse; min-width: 720px; }
.table-konfirmasi thead { background: #f9fafb; }
.table-konfirmasi th {
  padding: 0.9rem 1.1rem; text-align: left; font-size: 0.78rem; font-weight: 800;
  color: #374151; text-transform: uppercase; letter-spacing: 0.05em;
  border-bottom: 2px solid #e5e7eb;
}
.table-konfirmasi td { padding: 0.95rem 1.1rem; border-bottom: 1px solid #f3f4f6; font-size: 0.9rem; }
.table-konfirmasi tbody tr:hover { background: #f9fafb; }
.text-center { text-align: center; }

.cell-date { color: #6b7280; white-space: nowrap; }
.cell-do-number { font-weight: 700; color: #111827; white-space: nowrap; }
.cell-items { color: #374151; max-width: 320px; }
.cell-user { color: #6b7280; }

.so-badge {
  display: inline-block; padding: 0.15rem 0.55rem; margin: 0.1rem 0.2rem 0.1rem 0;
  background: #e0f2fe; color: #0369a1; border-radius: 999px; font-size: 0.75rem; font-weight: 700;
}

.btn-edit-konfirmasi {
  padding: 0.4rem 0.85rem; border: 1px solid #0891b2; background: white; color: #0e7490;
  border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; white-space: nowrap;
}
.btn-edit-konfirmasi:hover { background: #ecfeff; }
.action-group { display: flex; gap: 0.4rem; justify-content: center; align-items: center; flex-wrap: wrap; }

.modal-overlay-remark {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); z-index: 1000;
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.modal-remark {
  background: white; border-radius: 16px; width: 100%; max-width: 820px; max-height: 90vh;
  display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
.modal-remark-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb;
}
.modal-remark-title { font-size: 1.15rem; font-weight: 800; color: #111827; }
.modal-remark-subtitle { font-size: 0.9rem; color: #0e7490; font-weight: 700; margin-top: 0.2rem; }
.modal-remark-close { border: none; background: none; font-size: 1.2rem; cursor: pointer; color: #6b7280; }
.modal-remark-body { padding: 1rem 1.5rem; overflow-y: auto; }
.modal-remark-hint { font-size: 0.85rem; color: #6b7280; margin: 0 0 1rem; }
.table-remark { min-width: 0; }
.remark-input {
  width: 100%; min-width: 200px; padding: 0.5rem 0.7rem; border: 2px solid #e5e7eb;
  border-radius: 8px; font-size: 0.9rem; box-sizing: border-box;
}
.remark-input:focus { outline: none; border-color: #0891b2; }
.modal-remark-footer {
  display: flex; justify-content: flex-end; gap: 0.75rem;
  padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb;
}
.modal-remark-footer .btn-search-konfirmasi:disabled { opacity: 0.6; cursor: default; }

.status-badge { padding: 0.3rem 0.75rem; border-radius: 999px; font-size: 0.78rem; font-weight: 800; }
.status-draft { background: #f3f4f6; color: #6b7280; }
.status-shipped { background: #dbeafe; color: #1e40af; }
.status-delivered { background: #dcfce7; color: #166534; }

.pagination-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 0.25rem 0; margin-top: 0.5rem;
}
.pagination-info { font-size: 0.85rem; color: #6b7280; font-weight: 600; }
.pagination-btns { display: flex; gap: 0.5rem; }
.page-btn {
  padding: 6px 14px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;
  font-size: 0.85rem; font-weight: 600; cursor: pointer; color: #374151;
}
.page-btn:hover:not(:disabled) { background: #f0f9ff; border-color: #0891b2; }
.page-btn:disabled { opacity: 0.4; cursor: default; }

@media (max-width: 700px) {
  .page-header-konfirmasi { padding: 1.5rem; }
  .content-card-konfirmasi { padding: 1.25rem 1.25rem 1.75rem; }
  .search-row { flex-direction: column; }
}
</style>
