<template>
  <DashboardLayout>
    <div class="page-header-rekap">
      <div class="header-left">
        <div class="icon-badge">📑</div>
        <div>
          <h1 class="page-title">Rekap PO per Supplier</h1>
          <p class="page-subtitle">
            Rekap pesanan pembelian Operasional &amp; Karton Box: jumlah pesanan, harga, tanggal kirim, dan sisa barang
            yang belum dikirim supplier.
          </p>
        </div>
      </div>
      <button class="btn-export" :disabled="isExporting || isLoading || rows.length === 0" @click="downloadExcel">
        {{ isExporting ? 'Menyiapkan...' : '⬇️ Download Excel' }}
      </button>
    </div>

    <div class="content-card">
      <div class="filter-grid">
        <div class="filter-item filter-supplier">
          <label class="filter-label">Supplier</label>
          <vue-select
            v-model="filters.supplier_id"
            :options="suppliers"
            :reduce="(s) => s.id"
            label="name"
            placeholder="Semua Supplier (ketik untuk cari...)"
            class="supplier-select"
            :clearable="true"
          >
            <template #no-options>Supplier tidak ditemukan</template>
          </vue-select>
        </div>
        <div class="filter-item">
          <label class="filter-label">Jenis Pembelian</label>
          <select v-model="filters.type" class="filter-control">
            <option value="">Semua</option>
            <option v-if="allowedTypes.includes('operasional')" value="operasional">Operasional</option>
            <option v-if="allowedTypes.includes('karton')" value="karton">Karton Box</option>
          </select>
        </div>
        <div class="filter-item">
          <label class="filter-label">Tgl. PO Dari</label>
          <input v-model="filters.date_from" type="date" class="filter-control" />
        </div>
        <div class="filter-item">
          <label class="filter-label">Sampai</label>
          <input v-model="filters.date_to" type="date" class="filter-control" />
        </div>
        <div class="filter-item filter-search">
          <label class="filter-label">Cari No. PO / Item</label>
          <input
            v-model="filters.search"
            type="text"
            class="filter-control"
            placeholder="Contoh: PO-SBC atau lem"
            @keyup.enter="fetchData"
          />
        </div>
      </div>
      <div class="filter-actions">
        <label class="toggle-outstanding">
          <input v-model="filters.outstanding" type="checkbox" />
          Hanya yang masih ada sisa belum dikirim
        </label>
        <div class="filter-buttons">
          <button class="btn-reset" @click="resetFilters">Reset</button>
          <button class="btn-apply" :disabled="isLoading" @click="fetchData">Tampilkan</button>
        </div>
      </div>

      <div class="summary-row">
        <div class="summary-chip">
          <span class="chip-label">Baris item</span><strong>{{ formatQty(rows.length) }}</strong>
        </div>
        <div class="summary-chip">
          <span class="chip-label">Jumlah PO</span><strong>{{ formatQty(poCount) }}</strong>
        </div>
        <div class="summary-chip chip-warning">
          <span class="chip-label">Masih ada sisa</span><strong>{{ formatQty(outstandingCount) }}</strong>
        </div>
      </div>

      <div v-if="isLoading" class="state-box">
        <div class="spinner"></div>
        <p>Memuat rekap...</p>
      </div>

      <div v-else-if="rows.length === 0" class="state-box">
        <div class="empty-icon">📭</div>
        <p>Tidak ada data PO yang cocok dengan filter.</p>
      </div>

      <template v-else>
        <div class="table-wrapper">
          <table class="table-rekap">
            <thead>
              <tr>
                <th class="col-no">No</th>
                <th>No. PO</th>
                <th>Supplier</th>
                <th>Item</th>
                <th class="text-right">Jumlah Pesanan</th>
                <th class="text-right">Harga</th>
                <th>Tanggal Kirim</th>
                <th class="text-right">Sudah Diterima</th>
                <th class="text-right">Sisa Belum Dikirim</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in pagedRows" :key="row.id" :class="{ 'row-outstanding': row.qty_remaining > 0 }">
                <td class="col-no">{{ (page - 1) * perPage + idx + 1 }}</td>
                <td>
                  <div class="po-number">{{ row.po_number }}</div>
                  <div class="cell-sub">
                    {{ row.type === 'karton' ? 'Karton Box' : 'Operasional' }} · {{ formatDate(row.order_date) }}
                  </div>
                </td>
                <td class="cell-supplier">{{ row.supplier_name }}</td>
                <td>
                  <div class="item-name">{{ row.item_name || '-' }}</div>
                  <div class="cell-sub">{{ row.item_code }}</div>
                </td>
                <td class="text-right nowrap">
                  {{ formatQty(row.qty_ordered) }} <span class="unit">{{ row.unit_name }}</span>
                </td>
                <td class="text-right nowrap">{{ formatMoney(row.price, row.currency) }}</td>
                <td class="nowrap">{{ formatDate(row.delivery_date) }}</td>
                <td class="text-right nowrap">{{ formatQty(row.qty_received) }}</td>
                <td class="text-right nowrap">
                  <span v-if="row.qty_remaining > 0" class="badge-remaining">
                    {{ formatQty(row.qty_remaining) }} {{ row.unit_name }}
                  </span>
                  <span v-else class="badge-done">Lengkap</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-row">
          <span class="pagination-info">
            {{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, rows.length) }} dari {{ formatQty(rows.length) }} baris
          </span>
          <div class="pagination-btns">
            <button class="page-btn" :disabled="page === 1" @click="page--">← Prev</button>
            <span class="page-indicator">Hal {{ page }} / {{ totalPages }}</span>
            <button class="page-btn" :disabled="page >= totalPages" @click="page++">Next →</button>
          </div>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import apiClient from '@/api/axios'
import DashboardLayout from '@/components/DashboardLayout.vue'
import VueSelect from 'vue-select'

const toast = useToast()

const suppliers = ref([])
const allowedTypes = ref([])
const rows = ref([])
const isLoading = ref(false)
const isExporting = ref(false)
const page = ref(1)
const perPage = 50

const emptyFilters = () => ({ supplier_id: null, type: '', date_from: '', date_to: '', search: '', outstanding: false })
const filters = reactive(emptyFilters())

const totalPages = computed(() => Math.max(1, Math.ceil(rows.value.length / perPage)))
const pagedRows = computed(() => rows.value.slice((page.value - 1) * perPage, page.value * perPage))
const poCount = computed(() => new Set(rows.value.map((r) => r.po_number)).size)
const outstandingCount = computed(() => rows.value.filter((r) => r.qty_remaining > 0).length)

const queryParams = () => ({
  supplier_id: filters.supplier_id || undefined,
  type: filters.type || undefined,
  date_from: filters.date_from || undefined,
  date_to: filters.date_to || undefined,
  search: filters.search.trim() || undefined,
  outstanding: filters.outstanding ? 1 : undefined,
})

const fetchOptions = async () => {
  try {
    const response = await apiClient.get('/purchase-orders/rekap-supplier/options')
    suppliers.value = response.data.data.suppliers || []
    allowedTypes.value = response.data.data.types || []
  } catch (error) {
    console.error('Error fetching rekap options:', error)
    toast.error('Gagal memuat daftar supplier.')
  }
}

const fetchData = async () => {
  isLoading.value = true
  try {
    const response = await apiClient.get('/purchase-orders/rekap-supplier', { params: queryParams() })
    rows.value = response.data.data || []
    page.value = 1
  } catch (error) {
    console.error('Error fetching rekap:', error)
    toast.error(error.response?.data?.message || 'Gagal memuat rekap PO.')
  } finally {
    isLoading.value = false
  }
}

watch(
  () => filters.supplier_id,
  () => fetchData(),
)

const resetFilters = () => {
  const supplierChanged = filters.supplier_id !== null
  Object.assign(filters, emptyFilters())
  if (!supplierChanged) fetchData()
}

const downloadExcel = async () => {
  isExporting.value = true
  try {
    const response = await apiClient.get('/purchase-orders/rekap-supplier/export', {
      params: queryParams(),
      responseType: 'blob',
    })
    const supplier = suppliers.value.find((s) => s.id === filters.supplier_id)
    const label = (supplier?.name || 'Semua-Supplier').replace(/[^A-Za-z0-9]+/g, '-')
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Rekap-PO-${label}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting rekap:', error)
    toast.error('Gagal download Excel.')
  } finally {
    isExporting.value = false
  }
}

const formatQty = (value) => (parseFloat(value) || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })

const formatMoney = (value, currency) => {
  const number = (parseFloat(value) || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })
  return currency && currency !== 'IDR' ? `${currency} ${number}` : `Rp ${number}`
}

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

onMounted(() => {
  fetchOptions()
  fetchData()
})
</script>

<style scoped>
.page-header-rekap {
  display: flex; justify-content: space-between; align-items: center; gap: 1.25rem; flex-wrap: wrap;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  padding: 1.75rem 2rem; border-radius: 20px; margin-bottom: 1.5rem; color: white;
  box-shadow: 0 10px 30px rgba(217, 119, 6, 0.3);
}
.header-left { display: flex; align-items: center; gap: 1.25rem; }
.icon-badge { width: 60px; height: 60px; border-radius: 16px; background: rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; font-size: 1.9rem; }
.page-title { font-size: 1.6rem; font-weight: 800; margin: 0 0 0.3rem; }
.page-subtitle { margin: 0; font-size: 0.92rem; opacity: 0.95; max-width: 640px; }
.btn-export { padding: 0.8rem 1.4rem; background: white; color: #b45309; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; }
.btn-export:disabled { opacity: 0.6; cursor: not-allowed; }

.content-card { background: white; border-radius: 20px; box-shadow: 0 6px 24px rgba(15,23,42,0.08); border: 1px solid #f3f4f6; padding: 1.5rem; }
.filter-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr; gap: 0.85rem; }
.filter-label { display: block; font-size: 0.78rem; font-weight: 700; color: #4b5563; margin-bottom: 0.3rem; }
.filter-control { width: 100%; box-sizing: border-box; padding: 0.6rem 0.75rem; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 0.88rem; background: white; }
.filter-control:focus { outline: none; border-color: #f59e0b; }
.supplier-select :deep(.vs__dropdown-toggle) {
  min-height: 40px;
  padding: 0 0.4rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
}
.supplier-select.vs--open :deep(.vs__dropdown-toggle) { border-color: #f59e0b; }
.supplier-select :deep(.vs__search),
.supplier-select :deep(.vs__selected) { font-size: 0.88rem; }
.supplier-select :deep(.vs__search::placeholder) { color: #6b7280; }
.supplier-select :deep(.vs__dropdown-menu) { max-height: 280px; font-size: 0.88rem; }
.supplier-select :deep(.vs__dropdown-option--highlight) { background: #f59e0b; }

.filter-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 0.9rem; gap: 1rem; flex-wrap: wrap; }
.toggle-outstanding { display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; font-weight: 600; color: #374151; cursor: pointer; }
.filter-buttons { display: flex; gap: 0.5rem; }
.btn-reset { padding: 0.6rem 1.1rem; border: 1px solid #d1d5db; background: white; border-radius: 10px; font-weight: 700; cursor: pointer; }
.btn-apply { padding: 0.6rem 1.4rem; border: none; background: #d97706; color: white; border-radius: 10px; font-weight: 700; cursor: pointer; }
.btn-apply:disabled { opacity: 0.6; }

.summary-row { display: flex; gap: 0.75rem; margin: 1.25rem 0 1rem; flex-wrap: wrap; }
.summary-chip { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.9rem; border-radius: 999px; background: #f3f4f6; font-size: 0.85rem; color: #111827; }
.chip-label { color: #6b7280; }
.summary-chip.chip-warning { background: #fef3c7; }

.state-box { text-align: center; padding: 3rem 1rem; color: #6b7280; }
.spinner { width: 38px; height: 38px; border: 4px solid #e5e7eb; border-top-color: #d97706; border-radius: 50%; margin: 0 auto 1rem; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }

.table-wrapper { overflow-x: auto; }
.table-rekap { width: 100%; border-collapse: collapse; min-width: 1050px; }
.table-rekap thead { background: #f9fafb; }
.table-rekap th { padding: 0.75rem 0.8rem; text-align: left; font-size: 0.74rem; font-weight: 800; color: #374151; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid #e5e7eb; white-space: nowrap; }
.table-rekap td { padding: 0.7rem 0.8rem; border-bottom: 1px solid #f3f4f6; font-size: 0.87rem; vertical-align: top; }
.table-rekap tbody tr:hover { background: #fffbeb; }
.row-outstanding td:first-child { box-shadow: inset 3px 0 0 #f59e0b; }
.text-right { text-align: right !important; }
.nowrap { white-space: nowrap; }
.col-no { width: 44px; color: #9ca3af; font-size: 0.8rem; }
.po-number { font-weight: 700; color: #111827; white-space: nowrap; }
.cell-sub { font-size: 0.75rem; color: #6b7280; margin-top: 0.15rem; }
.cell-supplier { font-weight: 600; color: #374151; min-width: 140px; }
.item-name { font-weight: 600; color: #1f2937; min-width: 200px; }
.unit { font-size: 0.75rem; color: #6b7280; }
.badge-remaining { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px; background: #fef3c7; color: #92400e; font-weight: 800; }
.badge-done { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px; background: #dcfce7; color: #166534; font-weight: 700; font-size: 0.78rem; }

.pagination-row { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; flex-wrap: wrap; gap: 0.5rem; }
.pagination-info { font-size: 0.85rem; color: #6b7280; font-weight: 600; }
.pagination-btns { display: flex; gap: 0.5rem; align-items: center; }
.page-indicator { font-size: 0.85rem; font-weight: 600; color: #374151; }
.page-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid #e5e7eb; background: white; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.page-btn:disabled { opacity: 0.4; cursor: default; }

@media (max-width: 1100px) {
  .filter-grid { grid-template-columns: 1fr 1fr; }
  .filter-supplier, .filter-search { grid-column: span 2; }
}
</style>
