<template>
  <DashboardLayout>
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">🛒</div>
          <div>
            <h1 class="page-title">Daftar Pesanan Pembelian</h1>
            <p class="page-subtitle">Kelola purchase order dan pembelian bahan baku</p>
          </div>
        </div>
        <div class="header-actions">
          <router-link to="/admin/pembelian/buat" class="btn-header btn-primary">
            <span class="btn-icon">➕</span>
            <span>Buat PO Baru</span>
          </router-link>
          <router-link to="/admin/pembelian/faktur/buat" class="btn-header btn-success">
            <span class="btn-icon">📄</span>
            <span>Buat Faktur</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="content-card">
      <div class="card-header">
        <div class="header-left">
          <div class="header-badge">📋</div>
          <div>
            <h2 class="card-title">Pesanan Pembelian</h2>
            <p class="card-subtitle">Total {{ totalItem }} PO terdaftar</p>
          </div>
        </div>

        <!-- Search Box -->
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Cari berdasarkan No. PO..."
            class="search-input"
            v-model="searchQuery"
          />
        </div>
      </div>

      <!-- Table Wrapper -->
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-po">Nomor PO</th>
              <th class="th-supplier">Supplier</th>
              <th class="th-date">Tanggal</th>
              <th class="th-total">Total</th>
              <th class="th-status">Status</th>
              <th class="th-action">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <!-- Empty State -->
            <tr v-if="daftarPesanan.length === 0" class="empty-row">
              <td colspan="6">
                <div class="empty-state">
                  <span class="empty-icon">📭</span>
                  <p class="empty-text">Belum ada Pesanan Pembelian</p>
                  <p class="empty-hint">Klik tombol "Buat PO Baru" untuk membuat pesanan</p>
                </div>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr v-for="pesanan in daftarPesanan" :key="pesanan.id" class="data-row">
              <td class="td-po">
                <span class="po-badge">{{ pesanan.po_number }}</span>
              </td>
              <td class="td-supplier">
                <div class="supplier-info">
                  <span class="supplier-icon">🏭</span>
                  <span>{{ pesanan.supplier ? pesanan.supplier.name : 'N/A' }}</span>
                </div>
              </td>
              <td class="td-date">
                <span class="date-text">{{ formatTanggal(pesanan.order_date) }}</span>
              </td>
              <td class="td-total">
                <span class="total-amount">{{ formatRupiah(pesanan.grand_total) }}</span>
              </td>
              <td class="td-status">
                <span :class="['status-badge', `status-${pesanan.status.toLowerCase().replace(/\s+/g, '-')}`]">
                  {{ pesanan.status }}
                </span>
              </td>
              <td class="td-action">
                <div class="action-buttons">
                  <router-link
                    :to="{ name: 'detail-po', params: { id: pesanan.id } }"
                    class="btn-action btn-detail"
                    title="Lihat Detail"
                  >
                    <span>👁️</span>
                  </router-link>

                  <router-link
                    v-if="pesanan.status === 'Open' || pesanan.status === 'Terbuka'"
                    :to="{ name: 'EditPesananPembelian', params: { id: pesanan.id } }"
                    class="btn-action btn-edit"
                    title="Edit PO"
                  >
                    <span>✏️</span>
                  </router-link>

                  <router-link
                    v-if="pesanan.status === 'Open' || pesanan.status === 'Terbuka' || pesanan.status === 'Diterima Sebagian'"
                    :to="{ name: 'tambah-penerimaan-barang', params: { po_id: pesanan.id } }"
                    class="btn-action btn-receive"
                    title="Terima Barang"
                  >
                    <span>📦</span>
                  </router-link>

                  <router-link
                    :to="{ name: 'CetakPesananPembelian', params: { id: pesanan.id } }"
                    class="btn-action btn-print"
                    title="Cetak PO"
                  >
                    <span>🖨️</span>
                  </router-link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <PaginationComponent
          :current-page="halamanSekarang"
          :total-pages="totalHalaman"
          :total-items="totalItem"
          :per-page="perHalaman"
          @page-change="gantiHalaman"
        />
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import PaginationComponent from '../../components/BasePagination.vue'

const daftarPesanan = ref([])
const searchQuery = ref('')

const halamanSekarang = ref(1)
const perHalaman = ref(15)
const totalHalaman = ref(1)
const totalItem = ref(0)

const fetchDaftarPesanan = async () => {
  try {
    const params = {
      page: halamanSekarang.value,
      per_page: perHalaman.value,
      search: searchQuery.value || undefined,
    }
    const response = await apiClient.get('/purchase-orders', { params })
    const data = response.data.data
    daftarPesanan.value = data.data
    totalHalaman.value = data.last_page
    totalItem.value = data.total
  } catch (error) {
    console.error('Gagal mengambil daftar pesanan pembelian:', error)
  }
}

const gantiHalaman = (page) => {
  halamanSekarang.value = page
  fetchDaftarPesanan()
}

watch(searchQuery, () => {
  halamanSekarang.value = 1
  fetchDaftarPesanan()
})

onMounted(fetchDaftarPesanan)

const formatTanggal = (tanggal) => {
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const formatRupiah = (angka) => {
  if (angka === null || angka === undefined || angka === '') return 'Rp 0'
  const numValue = Number(angka)
  if (isNaN(numValue)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numValue)
}
</script>

<style scoped>
/* ===== PAGE HEADER ===== */
.page-header {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  padding: 28px 32px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.25);
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.15), transparent);
  pointer-events: none;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  gap: 20px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 4px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-subtitle {
  font-size: 14px;
  opacity: 0.95;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
}

.btn-primary {
  background: white;
  color: #6366f1;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-header:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.btn-icon {
  font-size: 16px;
}

/* ===== CONTENT CARD ===== */
.content-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 3px solid #e9ecef;
  flex-wrap: wrap;
  gap: 16px;
}

.header-badge {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  border: 2px solid #a5b4fc;
}

.card-title {
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.card-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

/* ===== SEARCH BOX ===== */
.search-box {
  position: relative;
  min-width: 320px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 42px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

/* ===== TABLE ===== */
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.data-table thead {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
}

.data-table th {
  padding: 18px 20px;
  text-align: left;
  font-size: 13px;
  font-weight: 800;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.th-po {
  width: 170px;
}

.th-supplier {
  width: auto;
}

.th-date {
  width: 180px;
}

.th-total {
  width: 150px;
}

.th-status {
  width: 120px;
}

.th-action {
  width: 140px;
  text-align: center;
}

.data-table td {
  padding: 16px 20px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

.data-row {
  transition: all 0.2s ease;
}

.data-row:hover {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
}

/* ===== TABLE CELLS ===== */
.po-badge {
  display: inline-flex;
  padding: 8px 14px;
  background: linear-gradient(135deg, #e0f2fe, #bae6fd);
  color: #0369a1;
  font-weight: 700;
  font-size: 13px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  border: 2px solid #7dd3fc;
}

.supplier-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #1e293b;
}

.supplier-icon {
  font-size: 18px;
}

.date-text {
  color: #475569;
  font-size: 14px;
  font-weight: 500;
}

.total-amount {
  font-weight: 800;
  font-size: 15px;
  color: #059669;
}

/* ===== STATUS BADGE ===== */
.status-badge {
  display: inline-flex;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  text-align: center;
  letter-spacing: 0.5px;
}

.status-open,
.status-terbuka {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e40af;
  border: 2px solid #93c5fd;
}

.status-draft {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #4b5563;
  border: 2px solid #d1d5db;
}

.status-closed {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #15803d;
  border: 2px solid #86efac;
}

.status-diterima-sebagian {
  background: linear-gradient(135deg, #fef9c3, #fef08a);
  color: #854d0e;
  border: 2px solid #facc15;
}

/* ===== ACTION BUTTONS ===== */
.td-action {
  text-align: center;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 16px;
  text-decoration: none;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.btn-detail {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: white;
  box-shadow: 0 2px 6px rgba(107, 114, 128, 0.3);
}

.btn-detail:hover {
  background: linear-gradient(135deg, #4b5563, #374151);
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(107, 114, 128, 0.4);
}

.btn-edit {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}

.btn-edit:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
}

.btn-receive {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
}

.btn-receive:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4);
}

.btn-print {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
}

.btn-print:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(139, 92, 246, 0.4);
}

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 18px;
  font-weight: 700;
  color: #475569;
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

/* ===== PAGINATION ===== */
.pagination-wrapper {
  padding: 20px 32px;
  border-top: 2px solid #f0f0f0;
  background: #fafafa;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .page-header {
    padding: 20px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .btn-header {
    flex: 1;
    justify-content: center;
  }

  .page-title {
    font-size: 20px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
  }

  .search-box {
    width: 100%;
    min-width: auto;
  }

  .action-buttons {
    gap: 6px;
  }

  .btn-action {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}
</style>
