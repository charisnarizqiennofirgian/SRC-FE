<template>
  <DashboardLayout>
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge-sales">
            <span class="sales-icon">🧾</span>
          </div>
          <div class="header-text">
            <h1 class="page-title">Daftar Sales Order</h1>
            <p class="page-subtitle">Kelola pesanan penjualan dari customer</p>
          </div>
        </div>
        <div class="header-actions">
          <button @click="goToCreatePage" class="btn-create-so">
            <span class="btn-icon">➕</span>
            <span class="btn-text">Tambah SO Baru</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-animation">
        <div class="spinner"></div>
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <p class="loading-text">Memuat daftar sales order...</p>
    </div>

    <div v-else class="content-card">
      <div class="card-header-list">
        <div class="list-header-left">
          <span class="header-icon">📋</span>
          <h2 class="card-title">Daftar Sales Order</h2>
        </div>
        <div class="list-info">
          <span class="info-badge">{{ pagination.total || 0 }} SO</span>
        </div>
      </div>

      <!-- ✅ FILTER SECTION -->
      <div class="card-filter-section">
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">
              <span class="label-icon">📅</span>
              Dari Tanggal
            </label>
            <input
              v-model="filters.startDate"
              type="date"
              class="filter-input-date"
              @change="handleFilterChange"
            />
          </div>
          <div class="filter-group">
            <label class="filter-label">
              <span class="label-icon">📅</span>
              Sampai Tanggal
            </label>
            <input
              v-model="filters.endDate"
              type="date"
              class="filter-input-date"
              @change="handleFilterChange"
            />
          </div>
          <div class="filter-group">
            <label class="filter-label">
              <span class="label-icon">🔍</span>
              Cari Customer
            </label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Nama customer atau No. SO..."
              class="filter-input-search"
              @input="handleFilterChange"
            />
          </div>
          <div class="filter-actions">
            <button @click="clearFilters" class="btn-filter-clear">
              <span class="btn-icon">🔄</span>
              Reset
            </button>
          </div>
        </div>
      </div>

      <div v-if="paginatedOrders.length === 0" class="empty-state-container">
        <div class="empty-state">
          <span class="empty-icon">📭</span>
          <h3 class="empty-title">
            {{ filters.search || filters.startDate ? 'Tidak Ada Hasil' : 'Belum Ada Sales Order' }}
          </h3>
          <p class="empty-text">
            {{
              filters.search || filters.startDate
                ? 'Coba ubah filter pencarian'
                : 'Mulai buat sales order pertama Anda'
            }}
          </p>
          <button
            v-if="!filters.search && !filters.startDate"
            @click="goToCreatePage"
            class="btn-create-empty"
          >
            <span class="btn-icon">➕</span>
            Tambah SO Baru
          </button>
          <button v-else @click="clearFilters" class="btn-create-empty">
            <span class="btn-icon">🔄</span>
            Reset Filter
          </button>
        </div>
      </div>

      <div v-else class="card-body-table">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th class="th-no">No</th>
                <th class="th-so-number">No. SO</th>
                <th class="th-customer">Customer</th>
                <th class="th-date">Tgl. SO</th>
                <th class="th-date">Tgl. Kirim</th>
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
                <td class="td-customer">
                  <div class="customer-info">
                    <span class="customer-icon">👤</span>
                    <span class="customer-name">{{ so.buyer?.name || 'N/A' }}</span>
                  </div>
                </td>
                <td class="td-date">{{ formatDisplayDate(so.so_date) }}</td>
                <td class="td-date">
                  {{ so.delivery_date ? formatDisplayDate(so.delivery_date) : '-' }}
                </td>
                <td class="td-status">
                  <span :class="getStatusClass(so.status)">
                    {{ so.status }}
                  </span>
                </td>
                <td class="td-total">
                  <span class="total-value">{{ formatCurrency(so.grand_total, so.currency) }}</span>
                </td>
                <td class="td-actions">
                  <button @click="goToEditPage(so.id)" class="btn-action-edit">
                    <span class="action-icon">✏️</span>
                    <span class="action-text">Edit</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ✅ PAGINATION -->
      <div v-if="pagination && pagination.last_page > 1" class="card-footer-pagination">
        <div class="pagination-info">
          Menampilkan {{ pagination.from }} - {{ pagination.to }} dari {{ pagination.total }} data
        </div>
        <div class="pagination-controls">
          <button
            @click="goToPage(pagination.current_page - 1)"
            :disabled="pagination.current_page === 1"
            class="pagination-btn pagination-prev"
          >
            ← Prev
          </button>
          <button
            v-for="page in paginationPages"
            :key="page"
            @click="page !== '...' && goToPage(page)"
            :class="[
              'pagination-btn',
              'pagination-number',
              { active: page === pagination.current_page },
              { dots: page === '...' },
            ]"
            :disabled="page === '...'"
          >
            {{ page }}
          </button>
          <button
            @click="goToPage(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.last_page"
            class="pagination-btn pagination-next"
          >
            Next →
          </button>
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

// ✅ COMPUTED: Filter di frontend
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

// ✅ COMPUTED: Pagination di frontend
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
    total: total,
    from: from,
    to: to,
  }
})

const paginationPages = computed(() => {
  const pages = []
  const lastPage = pagination.value.last_page

  if (lastPage <= 7) {
    for (let i = 1; i <= lastPage; i++) {
      pages.push(i)
    }
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

    if (response.data.data.data) {
      allSalesOrders.value = response.data.data.data
    } else {
      allSalesOrders.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching sales orders:', error)
    toast.error('Gagal memuat daftar Sales Order.')
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
    maximumFractionDigits: 0,
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
/* ========== FILTER SECTION ========== */
.card-filter-section {
  padding: 1.5rem 2rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.label-icon {
  font-size: 1rem;
}

.filter-input-date,
.filter-input-search {
  padding: 0.625rem 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.filter-input-date:focus,
.filter-input-search:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-actions {
  display: flex;
  align-items: flex-end;
}

.btn-filter-clear {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-filter-clear:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

/* ========== PAGINATION ========== */
.card-footer-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  gap: 1rem;
  flex-wrap: wrap;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.pagination-btn {
  padding: 0.5rem 0.875rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 40px;
}

.pagination-btn:hover:not(:disabled):not(.dots) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.pagination-btn.dots {
  border: none;
  cursor: default;
}

.pagination-btn.dots:hover {
  background: white;
}

/* ========== EXISTING STYLES ========== */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.sales-icon {
  font-size: 2rem;
}

.header-text {
  color: white;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: white;
}

.page-subtitle {
  font-size: 0.95rem;
  margin: 0.25rem 0 0 0;
  color: rgba(255, 255, 255, 0.9);
}

.btn-create-so {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  color: #667eea;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-create-so:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  background: #f8f9ff;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.loading-animation {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f4f6;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-dots {
  display: flex;
  gap: 6px;
  margin-top: 1rem;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}
.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
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
  font-weight: 500;
}

.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header-list {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%);
  border-bottom: 2px solid #e5e7eb;
}

.list-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  font-size: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.info-badge {
  background: #667eea;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.empty-state-container {
  padding: 4rem 2rem;
}

.empty-state {
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 5rem;
  display: block;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.empty-text {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
}

.btn-create-empty {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-create-empty:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

.card-body-table {
  padding: 1.5rem;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table thead {
  background: #f9fafb;
}

.data-table th {
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.th-no {
  width: 60px;
  text-align: center;
}
.th-actions {
  width: 100px;
  text-align: center;
}
.th-total {
  text-align: right;
}

.data-table tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.15s ease;
}

.data-table tbody tr:hover {
  background-color: #f9fafb;
}

.data-table td {
  padding: 1rem;
  color: #4b5563;
}

.td-no {
  text-align: center;
}

.row-number {
  display: inline-block;
  min-width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background: #e5e7eb;
  color: #374151;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.75rem;
}

.so-badge {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8125rem;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.customer-icon {
  font-size: 1.25rem;
}

.customer-name {
  font-weight: 500;
  color: #1f2937;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-draft {
  background: #f3f4f6;
  color: #6b7280;
}

.status-confirmed {
  background: #10b981;
  color: white;
}

.status-shipped {
  background: #3b82f6;
  color: white;
}

.status-cancelled {
  background: #ef4444;
  color: white;
}

.status-default {
  background: #6b7280;
  color: white;
}

.td-total {
  text-align: right;
}

.total-value {
  font-weight: 700;
  color: #10b981;
  font-size: 0.9375rem;
}

.td-actions {
  text-align: center;
}

.btn-action-edit {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: white;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action-edit:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

@media (max-width: 768px) {
  .page-header {
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .filter-row {
    grid-template-columns: 1fr;
  }

  .card-body-table {
    padding: 1rem;
  }

  .data-table {
    font-size: 0.8125rem;
  }

  .data-table th,
  .data-table td {
    padding: 0.75rem 0.5rem;
  }

  .card-footer-pagination {
    flex-direction: column;
    align-items: flex-start;
  }

  .pagination-controls {
    width: 100%;
    overflow-x: auto;
  }
}
</style>
