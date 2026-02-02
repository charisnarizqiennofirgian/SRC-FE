<template>
  <DashboardLayout>
    <!-- HEADER -->
    <div class="page-header-sales">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge-sales">
            <span class="sales-icon">🧾</span>
          </div>
          <div class="header-text">
            <h1 class="page-title">Daftar Pesanan Penjualan</h1>
            <p class="page-subtitle">
              Monitoring seluruh Sales Order yang sudah dibuat oleh tim penjualan.
            </p>
          </div>
        </div>
        <button class="btn-create-so" @click="goToCreatePage">
          <span class="btn-icon">＋</span>
          <span class="btn-text">Buat Sales Order</span>
        </button>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="loading-container">
      <div class="loading-animation">
        <div class="spinner"></div>
        <div class="loading-dots"><span></span><span></span><span></span></div>
      </div>
      <p class="loading-text">Memuat daftar pesanan penjualan...</p>
    </div>

    <!-- CONTENT -->
    <div v-else class="content-card">
      <!-- HEADER LIST + FILTER -->
      <div class="card-header-list">
        <div class="list-header-left">
          <span class="header-icon">📋</span>
          <div>
            <h2 class="card-title">Daftar Sales Order</h2>
            <p class="card-subtitle">
              Ringkasan pesanan berdasarkan customer, status, dan nilai transaksi.
            </p>
          </div>
        </div>
        <div class="list-header-right">
          <div class="filter-inline">
            <input
              v-model="filters.search"
              @input="handleFilterChange"
              type="text"
              class="filter-input-search"
              placeholder="Cari No SO / Customer..."
            />
            <button class="btn-filter-clear" @click="clearFilters">
              <span class="btn-icon">🧹</span>
              <span class="btn-text">Bersihkan</span>
            </button>
          </div>
        </div>
      </div>

      <!-- EMPTY STATE -->
      <div v-if="paginatedOrders.length === 0" class="empty-state-container">
        <div class="empty-state">
          <span class="empty-icon">📭</span>
          <p class="empty-title">Belum ada Sales Order</p>
          <p class="empty-text">Buat Sales Order baru untuk mulai mencatat pesanan penjualan.</p>
          <button class="btn-create-empty" @click="goToCreatePage">
            <span class="btn-icon">＋</span>
            <span class="btn-text">Buat Sales Order</span>
          </button>
        </div>
      </div>

      <!-- TABLE -->
      <div v-else class="card-body-table">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th class="th-no">No</th>
                <th class="th-so-number">No. Pesanan</th>
                <th class="th-items">Nama Barang</th>
                <th class="th-customer">Customer</th>
                <th class="th-date">Tgl. Pesanan</th>
                <th class="th-status">Status</th>
                <th class="th-total">Total</th>
                <th class="th-actions">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(so, index) in paginatedOrders" :key="so.id" class="data-row">
                <td class="td-no">
                  <span class="row-number">{{ getRowNumber(index) }}</span>
                </td>
                <td class="td-so-number">
                  <span class="so-badge">{{ so.so_number }}</span>
                </td>
                <td class="td-items">
                  <div class="items-list">
                    <span v-for="(detail, idx) in so.details" :key="idx" class="item-tag">
                      {{ detail.item?.name || detail.item_name || 'N/A' }}
                    </span>
                  </div>
                </td>
                <td class="td-customer">
                  <div class="customer-info">
                    <span class="customer-icon">👤</span>
                    <span class="customer-name">
                      {{ so.buyer?.name || 'N/A' }}
                    </span>
                  </div>
                </td>
                <td class="td-date">
                  {{ formatDisplayDate(so.so_date) }}
                </td>
                <td class="td-status">
                  <span :class="getStatusClass(so.status)">{{ so.status }}</span>
                </td>
                <td class="td-total">
                  <span class="total-value">
                    {{ formatCurrency(so.grand_total, so.currency) }}
                  </span>
                </td>
                <td class="td-actions">
                  <div class="action-buttons-group">
                    <button
                      @click="generateProductionOrder(so.id, so.so_number)"
                      class="btn-action btn-po"
                      title="Generate PO Produksi"
                    >
                      🏭
                    </button>
                    <button
                      @click="goToCetakPage(so.id)"
                      class="btn-action btn-print"
                      title="Cetak"
                    >
                      🖨️
                    </button>
                    <button @click="goToEditPage(so.id)" class="btn-action btn-edit" title="Edit">
                      ✏️
                    </button>
                    <button
                      @click="deleteOrder(so.id, so.so_number)"
                      class="btn-action btn-delete"
                      title="Hapus"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PAGINATION -->
        <div class="card-footer-pagination" v-if="pagination.last_page > 1">
          <div class="pagination-info">
            Menampilkan {{ pagination.from }} - {{ pagination.to }} dari {{ pagination.total }} data
          </div>
          <div class="pagination-controls">
            <button
              class="pagination-btn"
              :disabled="pagination.current_page === 1"
              @click="goToPage(pagination.current_page - 1)"
            >
              ← Prev
            </button>
            <button
              v-for="page in paginationPages"
              :key="page"
              :class="[
                'pagination-btn',
                { active: page === pagination.current_page, dots: page === '...' },
              ]"
              :disabled="page === '...'"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <button
              class="pagination-btn"
              :disabled="pagination.current_page === pagination.last_page"
              @click="goToPage(pagination.current_page + 1)"
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import { useToast } from 'vue-toastification'
import DashboardLayout from '../../components/DashboardLayout.vue'
import Swal from 'sweetalert2'

const loading = ref(true)
const allSalesOrders = ref([])
const toast = useToast()
const router = useRouter()

const filters = ref({
  startDate: '',
  endDate: '',
  search: '',
})

const currentPage = ref(1)
const perPage = ref(15)

const filteredOrders = computed(() => {
  let filtered = [...allSalesOrders.value]

  if (filters.value.startDate) {
    filtered = filtered.filter((so) => so.so_date >= filters.value.startDate)
  }

  if (filters.value.endDate) {
    filtered = filtered.filter((so) => so.so_date <= filters.value.endDate)
  }

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(
      (so) =>
        so.buyer?.name?.toLowerCase().includes(search) ||
        so.so_number?.toLowerCase().includes(search),
    )
  }

  return filtered
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredOrders.value.slice(start, end)
})

const pagination = computed(() => {
  const total = filteredOrders.value.length
  const lastPage = Math.ceil(total / perPage.value)
  const from = total > 0 ? (currentPage.value - 1) * perPage.value + 1 : 0
  const to = Math.min(currentPage.value * perPage.value, total)

  return {
    current_page: currentPage.value,
    last_page: lastPage,
    per_page: perPage.value,
    total,
    from,
    to,
  }
})

const paginationPages = computed(() => {
  const pages = []
  const lastPage = pagination.value.last_page

  if (lastPage <= 7) {
    for (let i = 1; i <= lastPage; i++) pages.push(i)
  } else {
    const current = currentPage.value
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(lastPage)
    } else if (current >= lastPage - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = lastPage - 4; i <= lastPage; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(lastPage)
    }
  }

  return pages
})

const fetchSalesOrders = async () => {
  loading.value = true
  try {
    const response = await apiClient.get('/sales-orders')

    if (response.data.data?.data) {
      allSalesOrders.value = response.data.data.data
    } else {
      allSalesOrders.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching sales orders:', error)
    toast.error('Gagal memuat daftar Pesanan Penjualan.')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  currentPage.value = 1
}

const clearFilters = () => {
  filters.value.startDate = ''
  filters.value.endDate = ''
  filters.value.search = ''
  currentPage.value = 1
}

const goToPage = (page) => {
  if (page === '...' || page < 1 || page > pagination.value.last_page) return
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const getRowNumber = (index) => {
  return pagination.value.from + index
}

const goToCreatePage = () => {
  router.push({ name: 'BuatSalesOrder' })
}

const goToEditPage = (id) => {
  router.push({ name: 'EditSalesOrder', params: { id } })
}

const goToCetakPage = (id) => {
  const routeData = router.resolve({ name: 'CetakSalesOrder', params: { id } })
  window.open(routeData.href, '_blank')
}

const deleteOrder = (id, soNumber) => {
  Swal.fire({
    title: 'Hapus Pesanan?',
    text: `Anda yakin ingin menghapus pesanan "${soNumber}"? Tindakan ini tidak dapat dibatalkan.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/sales-orders/${id}`)
        toast.success(`Pesanan "${soNumber}" berhasil dihapus.`)
        fetchSalesOrders()
      } catch (error) {
        console.error('Gagal menghapus pesanan:', error)
        toast.error(error.response?.data?.message || 'Gagal menghapus pesanan.')
      }
    }
  })
}

const generateProductionOrder = async (id, soNumber) => {
  const result = await Swal.fire({
    title: 'Generate PO Produksi?',
    text: `Buat PO Produksi dari SO "${soNumber}"?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Buat',
    cancelButtonText: 'Batal',
  })

  if (!result.isConfirmed) return

  try {
    const { data } = await apiClient.post(`/sales-orders/${id}/production-orders`, {})

    toast.success(`PO Produksi ${data.data.po_number} berhasil dibuat untuk ${soNumber}.`)

    const nextStep = await Swal.fire({
      title: 'Lanjut ke mana?',
      text: 'Pilih proses lanjutan untuk PO ini.',
      icon: 'info',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Ke Sawmill',
      denyButtonText: 'Ke Pembahanan',
      cancelButtonText: 'Tutup saja',
    })

    if (nextStep.isConfirmed) {
      router.push({
        name: 'ProduksiSawmill',
        query: { so_id: id },
      })
    } else if (nextStep.isDenied) {
      router.push({
        name: 'ProduksiPembahanan',
        query: { so_id: id },
      })
    }
  } catch (error) {
    console.error('Gagal generate PO Produksi:', error)
    toast.error(error.response?.data?.message || 'Gagal membuat PO Produksi.')
  }
}

const formatDisplayDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatCurrency = (value, currency) => {
  if (!value) value = 0
  const options = {
    style: 'currency',
    currency: currency || 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }

  if (currency === 'USD') {
    options.currencyDisplay = 'symbol'
  }

  return new Intl.NumberFormat('id-ID', options).format(value)
}

const getStatusClass = (status) => {
  switch (status) {
    case 'Draft':
      return 'status-badge status-draft'
    case 'Confirmed':
      return 'status-badge status-confirmed'
    case 'Shipped':
      return 'status-badge status-shipped'
    case 'Cancelled':
      return 'status-badge status-cancelled'
    default:
      return 'status-badge status-default'
  }
}

onMounted(() => {
  fetchSalesOrders()
})
</script>

<style scoped>
/* HEADER */
.page-header-sales {
  background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #4f46e5 100%);
  border-radius: 16px;
  padding: 1.75rem 2rem;
  margin-bottom: 1.75rem;
  box-shadow: 0 10px 30px rgba(79, 70, 229, 0.35);
  color: white;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.icon-badge-sales {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sales-icon {
  font-size: 2rem;
}

.header-text .page-title {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.03em;
}

.header-text .page-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.95rem;
  opacity: 0.95;
}

/* BUTTON CREATE TOP */
.btn-create-so {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  color: #4f46e5;
  border: none;
  padding: 0.7rem 1.4rem;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
}

.btn-create-so:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.2);
}

.btn-icon {
  font-size: 1rem;
}

/* LOADING */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1.5rem;
  background: white;
  border-radius: 12px;
}

.loading-animation {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-dots {
  display: flex;
  gap: 6px;
  margin-top: 1rem;
  justify-content: center;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: #4f46e5;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}
.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.loading-text {
  margin-top: 1rem;
  color: #6b7280;
}

/* CARD */
.content-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

/* LIST HEADER */
.card-header-list {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.75rem;
  background: linear-gradient(135deg, #f9fafb 0%, #eef2ff 100%);
  border-bottom: 1px solid #e5e7eb;
}

.list-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  color: #111827;
}

.card-subtitle {
  margin: 0.15rem 0 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.list-header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-inline .filter-input-search {
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  font-size: 0.85rem;
  min-width: 220px;
}

/* EMPTY STATE */
.empty-state-container {
  padding: 3rem 1.75rem;
}

.empty-state {
  text-align: center;
  max-width: 420px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 0.75rem;
}

.empty-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 0.4rem;
}

.empty-text {
  margin: 0 0 1.5rem;
  color: #6b7280;
}

.btn-create-empty {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #4f46e5;
  color: white;
  border-radius: 999px;
  padding: 0.7rem 1.5rem;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* TABLE */
.card-body-table {
  padding: 1.25rem;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.data-table thead {
  background: #f9fafb;
}

.data-table th,
.data-table td {
  padding: 0.8rem 0.9rem;
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  font-weight: 600;
  color: #4b5563;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.th-no {
  width: 60px;
  text-align: center;
}

.th-actions {
  width: 150px;
  text-align: center;
}

.th-total,
.td-total {
  text-align: right;
}

.td-no {
  text-align: center;
}

.row-number {
  display: inline-block;
  min-width: 26px;
  height: 26px;
  line-height: 26px;
  border-radius: 999px;
  background: #e5e7eb;
  color: #111827;
  font-size: 0.75rem;
  font-weight: 600;
}

/* SO badge */
.so-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Items */
.items-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.item-tag {
  padding: 0.25rem 0.55rem;
  border-radius: 4px;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 0.75rem;
}

/* Customer */
.customer-info {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

/* Status */
.status-badge {
  display: inline-block;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-draft {
  background: #f3f4f6;
  color: #6b7280;
}
.status-confirmed {
  background: #dcfce7;
  color: #15803d;
}
.status-shipped {
  background: #dbeafe;
  color: #1d4ed8;
}
.status-cancelled {
  background: #fee2e2;
  color: #b91c1c;
}
.status-default {
  background: #e5e7eb;
  color: #374151;
}

/* Total */
.total-value {
  font-weight: 700;
  color: #059669;
}

/* ACTION BUTTONS */
.action-buttons-group {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
}

.btn-action {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: white;
  cursor: pointer;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-po {
  border-color: #0ea5e9;
  color: #0ea5e9;
}

.btn-print {
  border-color: #8b5cf6;
  color: #8b5cf6;
}

.btn-edit {
  border-color: #3b82f6;
  color: #3b82f6;
}

.btn-delete {
  border-color: #ef4444;
  color: #ef4444;
}

.btn-action:hover {
  color: white;
  transform: translateY(-2px);
}

.btn-po:hover {
  background: #0ea5e9;
}
.btn-print:hover {
  background: #8b5cf6;
}
.btn-edit:hover {
  background: #3b82f6;
}
.btn-delete:hover {
  background: #ef4444;
}

/* PAGINATION */
.card-footer-pagination {
  padding: 1.1rem 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.pagination-info {
  font-size: 0.85rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  gap: 0.4rem;
}

.pagination-btn {
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: white;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pagination-btn.active {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.pagination-btn.dots {
  cursor: default;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .page-header-sales {
    padding: 1.5rem;
  }
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  .card-body-table {
    padding: 0.9rem;
  }
}
</style>
