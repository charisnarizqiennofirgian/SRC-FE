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
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
