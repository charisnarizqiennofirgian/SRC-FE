<template>
  <DashboardLayout>
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge-sales" style="background-color: #e6f7ff; color: #007bff">
            <span class="sales-icon">🚚</span>
          </div>
          <div class="header-text">
            <h1 class="page-title">Daftar Pengiriman Barang</h1>
            <p class="page-subtitle">Kelola surat jalan (SJ) dan pengiriman barang</p>
          </div>
        </div>
        <div class="header-actions">
          <button @click="goToCreatePage" class="btn-create-so" style="background-color: #007bff">
            <span class="btn-icon">➕</span>
            <span class="btn-text">Buat Pengiriman Baru</span>
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
      <p class="loading-text">Memuat daftar pengiriman...</p>
    </div>

    <div v-else class="content-card">
      <div class="card-header-list">
        <div class="list-header-left">
          <span class="header-icon">📋</span>
          <h2 class="card-title">Daftar Pengiriman Barang</h2>
        </div>
        <div class="list-info">
          <span class="info-badge">{{ pagination.total || 0 }} SJ</span>
        </div>
      </div>

      <div class="card-filter-section">
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">
              <span class="label-icon">🔍</span>
              Cari No. SJ / No. Pesanan
            </label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="No. SJ atau No. Pesanan..."
              class="filter-input-search"
              @keyup.enter="fetchDeliveryOrders"
            />
          </div>
          <div class="filter-actions">
            <button @click="fetchDeliveryOrders(1)" class="btn-filter-apply">
              <span class="btn-icon">🔍</span>
              Cari
            </button>
            <button @click="clearFilters" class="btn-filter-clear">
              <span class="btn-icon">🔄</span>
              Reset
            </button>
          </div>
        </div>
      </div>

      <div v-if="deliveryOrders.length === 0" class="empty-state-container">
        <div class="empty-state">
          <span class="empty-icon">📭</span>
          <h3 class="empty-title">
            {{ filters.search ? 'Tidak Ada Hasil' : 'Belum Ada Pengiriman' }}
          </h3>
          <p class="empty-text">
            {{
              filters.search
                ? 'Coba ubah filter pencarian'
                : 'Mulai buat pengiriman (Surat Jalan) pertama Anda'
            }}
          </p>
          <button @click="goToCreatePage" class="btn-create-empty">
            <span class="btn-icon">➕</span>
            Buat Pengiriman Baru
          </button>
        </div>
      </div>

      <div v-else class="card-body-table">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th class="th-no">No</th>
                <th class="th-so-number">No. SJ</th>
                <th class="th-date">Tgl. Kirim</th>
                <th class="th-so-number">No. Pesanan (SO)</th>
                <th class="th-items">Nama Barang</th>
                <th class="th-customer">Customer</th>
                <th class="th-status">Status</th>
                <th class="th-actions">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(sj, index) in deliveryOrders" :key="sj.id" class="data-row">
                <td class="td-no">
                  <span class="row-number">{{ getRowNumber(index) }}</span>
                </td>
                <td class="td-so-number">
                  <span class="so-badge" style="background-color: #d6eaff; color: #0056b3">{{
                    sj.do_number
                  }}</span>
                </td>
                <td class="td-date">{{ formatDisplayDate(sj.delivery_date) }}</td>
                <td class="td-so-number">
                  <span class="so-badge">{{ sj.sales_order?.so_number || 'N/A' }}</span>
                </td>
                <td class="td-items">
                  <div class="items-list-compact">
                    <template v-if="sj.details && sj.details.length > 0">
                      <span class="item-name-primary">{{ sj.details[0].item_name }}</span>
                      <span v-if="sj.details.length > 1" class="item-name-secondary">
                        {{ sj.details[1].item_name }}
                      </span>
                      <span v-if="sj.details.length > 2" class="item-more">
                        +{{ sj.details.length - 2 }} lainnya
                      </span>
                    </template>
                    <span v-else class="no-items">-</span>
                  </div>
                </td>
                <td class="td-customer">
                  <div class="customer-info">
                    <span class="customer-icon">👤</span>
                    <span class="customer-name">{{ sj.buyer?.name || 'N/A' }}</span>
                  </div>
                </td>
                <td class="td-status">
                  <span :class="getStatusClass(sj.status)">
                    {{ sj.status }}
                  </span>
                </td>
                <td class="td-actions">
                  <div class="action-buttons-group">
                    <button
                      @click="goToCetakPage(sj.id)"
                      class="btn-action btn-print"
                      title="Cetak / Lihat"
                    >
                      🖨️
                    </button>
                    <!-- Tambahkan tombol baru di sini -->

                    <!-- (Tombol edit dan delete tetap ada seperti biasa) -->
                    <button
                      @click="goToEditPage(sj.id)"
                      class="btn-action btn-edit"
                      title="Edit SJ"
                    >
                      ✏️
                    </button>
                    <button
                      @click="cancelShipment(sj.id, sj.do_number)"
                      class="btn-action btn-delete"
                      title="Batal Kirim"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="pagination && pagination.last_page > 1" class="card-footer-pagination">
        <div class="pagination-info">
          Menampilkan {{ pagination.from }} - {{ pagination.to }} dari {{ pagination.total }} data
        </div>
        <div class="pagination-controls">
          <button
            @click="fetchDeliveryOrders(pagination.current_page - 1)"
            :disabled="pagination.current_page === 1"
            class="pagination-btn pagination-prev"
          >
            ← Prev
          </button>
          <button
            v-for="page in paginationPages"
            :key="page"
            @click="page !== '...' && fetchDeliveryOrders(page)"
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
            @click="fetchDeliveryOrders(pagination.current_page + 1)"
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
import Swal from 'sweetalert2'

const loading = ref(true)
const deliveryOrders = ref([])
const pagination = ref({})
const toast = useToast()
const router = useRouter()

const filters = ref({
  search: '',
})

const fetchDeliveryOrders = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      page: page,
      per_page: 15,
      search: filters.value.search,
    }
    const response = await apiClient.get('/delivery-orders', { params })
    deliveryOrders.value = response.data.data.data
    pagination.value = response.data.data
  } catch (error) {
    console.error('Error fetching delivery orders:', error)
    toast.error('Gagal memuat daftar pengiriman.')
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value.search = ''
  fetchDeliveryOrders(1)
}

const getRowNumber = (index) => {
  return (pagination.value.current_page - 1) * pagination.value.per_page + index + 1
}

const goToCreatePage = () => {
  router.push({ name: 'BuatPengiriman' })
}

const goToEditPage = (id) => {
  router.push({ name: 'EditPengiriman', params: { id } })
}

const goToCetakPage = (id) => {
  const routeData = router.resolve({ name: 'CetakPengiriman', params: { id } })
  window.open(routeData.href, '_blank')
}

const goToCetakBarcodePage = (id) => {
  router.push({ name: 'CetakBarcodeKemendag', params: { id } })
}

const cancelShipment = (id, doNumber) => {
  Swal.fire({
    title: 'Batalkan Pengiriman?',
    text: `Anda yakin ingin membatalkan SJ "${doNumber}"? Stok barang akan dikembalikan ke gudang.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Batalkan!',
    cancelButtonText: 'Tidak',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await apiClient.delete(`/delivery-orders/${id}`)
        toast.success(response.data.message || 'Pengiriman berhasil dibatalkan.')
        fetchDeliveryOrders(pagination.value.current_page)
      } catch (error) {
        console.error('Gagal membatalkan pengiriman:', error)
        toast.error(error.response?.data?.message || 'Gagal membatalkan pengiriman.')
      }
    }
  })
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

const getStatusClass = (status) => {
  if (status === 'Shipped') return 'status-badge status-shipped'
  if (status === 'Cancelled') return 'status-badge status-cancelled'
  return 'status-badge status-default'
}

const paginationPages = computed(() => {
  if (!pagination.value.last_page) return []
  const pages = []
  const lastPage = pagination.value.last_page
  const current = pagination.value.current_page

  if (lastPage <= 7) {
    for (let i = 1; i <= lastPage; i++) pages.push(i)
  } else {
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

onMounted(() => {
  fetchDeliveryOrders()
})
</script>

<style scoped>
.page-header {
  margin-bottom: 1.5rem;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.icon-badge-sales {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fcefe6;
  color: #ff6a00;
}
.sales-icon {
  font-size: 1.5rem;
}
.header-text .page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: #333;
}
.header-text .page-subtitle {
  font-size: 1rem;
  color: #777;
  margin: 0;
}
.btn-create-so {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background-color: #ff6a00;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.btn-create-so:hover {
  background-color: #e05c00;
}
.btn-icon {
  font-size: 1.1rem;
  margin-right: 0.5rem;
}

.content-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.card-header-list {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #eef2f7;
}
.list-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.header-icon {
  font-size: 1.2rem;
}
.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}
.info-badge {
  background-color: #eef2f7;
  color: #555;
  padding: 0.4rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.card-filter-section {
  padding: 1.5rem;
  border-bottom: 1px solid #eef2f7;
}
.filter-row {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #555;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.filter-input-search {
  padding: 0.6rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  width: 250px;
}
.filter-actions {
  display: flex;
  gap: 0.5rem;
}
.btn-filter-apply,
.btn-filter-clear {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.btn-filter-apply {
  background-color: #007bff;
  color: white;
}
.btn-filter-clear {
  background-color: #f1f1f1;
  color: #555;
  border: 1px solid #ddd;
}

.table-wrapper {
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th,
.data-table td {
  padding: 1rem 1.25rem;
  text-align: left;
  vertical-align: middle;
  border-bottom: 1px solid #eef2f7;
}
.data-table th {
  font-size: 0.875rem;
  font-weight: 600;
  color: #777;
  text-transform: uppercase;
  background-color: #fcfcfd;
}
.td-no .row-number {
  font-weight: 600;
  color: #555;
}
.so-badge {
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  background-color: #fdeee6;
  color: #d95300;
}
.customer-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.customer-name {
  font-weight: 600;
  color: #333;
}
.status-badge {
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: capitalize;
}
.status-shipped {
  background-color: #e6f7ff;
  color: #007bff;
}
.status-cancelled {
  background-color: #fdeeee;
  color: #d90000;
}
.status-default {
  background-color: #f1f1f1;
  color: #555;
}

.items-list-compact {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.item-name-primary {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}
.item-name-secondary {
  font-size: 0.85rem;
  color: #6c757d;
}
.item-more {
  font-size: 0.8rem;
  color: #007bff;
  font-weight: 600;
  font-style: italic;
}
.no-items {
  color: #999;
  font-style: italic;
}

.action-buttons-group {
  display: flex;
  gap: 6px;
  justify-content: center;
}
.btn-action {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-print {
  background: #17a2b8;
  color: white;
}
.btn-print:hover {
  background: #138496;
  transform: scale(1.1);
}
.btn-edit {
  background: #ffc107;
  color: white;
}
.btn-edit:hover {
  background: #e0a800;
  transform: scale(1.1);
}
.btn-delete {
  background: #dc3545;
  color: white;
}
.btn-delete:hover {
  background: #c82333;
  transform: scale(1.1);
}

.th-items {
  min-width: 180px;
}
.td-items {
  padding: 12px 8px;
}

.card-footer-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #eef2f7;
}
.pagination-info {
  font-size: 0.9rem;
  color: #777;
}
.pagination-controls {
  display: flex;
  gap: 0.25rem;
}
.pagination-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
  font-size: 0.9rem;
  cursor: pointer;
}
.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pagination-number.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.loading-container {
  text-align: center;
  padding: 4rem;
}
.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.loading-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}
.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #007bff;
  animation: bounce 1.4s infinite ease-in-out both;
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
  margin-top: 16px;
  color: #666;
  font-weight: 600;
}

.empty-state-container {
  padding: 3rem;
  text-align: center;
}
.empty-icon {
  font-size: 3rem;
}
.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1rem;
}
.empty-text {
  color: #777;
  margin-bottom: 1.5rem;
}
.btn-create-empty {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background-color: #007bff;
  cursor: pointer;
}
</style>
