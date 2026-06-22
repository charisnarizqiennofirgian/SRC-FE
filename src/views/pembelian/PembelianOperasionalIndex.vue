<template>
  <DashboardLayout>
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">🛒</div>
          <div>
            <h1 class="page-title">Daftar Pesanan Pembelian</h1>
            <p class="page-subtitle">Kelola purchase order dan pembelian bahan baku Operasional</p>
          </div>
        </div>
        <div class="header-actions">
          <router-link :to="{ name: 'BuatPembelianOperasional' }" class="btn-header btn-primary">
            <span class="btn-icon">➕</span>
            <span>Buat PO Baru</span>
          </router-link>
        </div>
      </div>
    </div>

    <div class="content-card">
      <div class="card-header">
        <div class="header-left">
          <div class="header-badge">📋</div>
          <div>
            <h2 class="card-title">Pesanan Pembelian</h2>
            <p class="card-subtitle">Total {{ totalItem }} PO terdaftar</p>
          </div>
        </div>

        <div class="header-right">
          <div class="filter-source">
            <select v-model="sourceFilter" @change="handleFilterChange" class="source-select">
              <option value="">Semua PO</option>
              <option value="direct">PO Langsung (Operasional)</option>
              <option value="pr">PO dari PR</option>
            </select>
          </div>

          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Cari No. PO atau Nama Supplier..."
              class="search-input"
              v-model="searchQuery"
            />
          </div>

          <div class="per-page-selector">
            <label class="per-page-label">Tampilkan:</label>
            <select v-model="perHalaman" @change="handlePerPageChange" class="per-page-select">
              <option :value="10">10</option>
              <option :value="15">15</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-po">Nomor PO</th>
              <th class="th-supplier">Supplier</th>
              <th class="th-date">Tanggal Pesan</th>
              <th class="th-date">Tanggal Kirim</th> <!-- ✅ TAMBAH INI -->
              <th class="th-total">Total</th>
              <th class="th-status">Status</th>
              <th class="th-action">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="daftarPesanan.length === 0" class="empty-row">
              <td colspan="7"> <!-- ✅ GANTI DARI 6 JADI 7 -->
                <div class="empty-state">
                  <span class="empty-icon">📭</span>
                  <p class="empty-text">Belum ada Pesanan Pembelian</p>
                  <p class="empty-hint">Klik tombol "Buat PO Baru" untuk membuat pesanan</p>
                </div>
              </td>
            </tr>

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
              <!-- ✅ TAMBAH KOLOM TANGGAL KIRIM -->
              <td class="td-date">
                <span class="date-text">{{
                  pesanan.delivery_date ? formatTanggal(pesanan.delivery_date) : '-'
                }}</span>
              </td>
              <td class="td-total">
                <span class="total-amount">{{ formatRupiah(pesanan.grand_total) }}</span>
              </td>
              <td class="td-status">
                <span :class="['status-badge', `status-${pesanan.status.toLowerCase()}`]">
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
                    :to="{ name: 'EditPembelianOperasional', params: { id: pesanan.id } }"
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
                    target="_blank"
                  >
                    <span>🖨️</span>
                  </router-link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
const sourceFilter = ref('')

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
      type: 'operasional',
      source_type: sourceFilter.value || undefined,
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

const handlePerPageChange = () => {
  halamanSekarang.value = 1
  fetchDaftarPesanan()
}

const handleFilterChange = () => {
  halamanSekarang.value = 1
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
.page-header {
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%);
  padding: 32px 36px;
  border-radius: 20px;
  margin-bottom: 28px;
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.25);
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15), transparent);
  border-radius: 50%;
}

.page-header::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -5%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent);
  border-radius: 50%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  gap: 24px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15));
  backdrop-filter: blur(15px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.page-title {
  font-size: 28px;
  font-weight: 900;
  margin: 0 0 6px 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 14px;
  opacity: 0.95;
  margin: 0;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.btn-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.btn-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.btn-header:hover::before {
  left: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #fff, #f0f0f0);
  color: #8b5cf6;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.3);
}

.btn-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.btn-success:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
  background: linear-gradient(135deg, #059669, #047857);
}

.btn-icon {
  font-size: 18px;
}

.content-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 36px;
  background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
  border-bottom: 3px solid #e9ecef;
  flex-wrap: wrap;
  gap: 20px;
  position: relative;
}

.card-header::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 36px;
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, #8b5cf6, #6366f1, #3b82f6);
  border-radius: 3px 3px 0 0;
}

.header-badge {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #ddd6fe, #c4b5fd);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.25);
  border: 2px solid #a78bfa;
}

.card-title {
  font-size: 20px;
  font-weight: 900;
  color: #1e293b;
  margin: 0 0 6px 0;
  letter-spacing: -0.3px;
}

.card-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-source {
  display: flex;
  align-items: center;
}

.source-select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  min-width: 200px;
}

.source-select:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

.search-box {
  position: relative;
  min-width: 320px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  z-index: 1;
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 14px 18px 14px 50px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: #fafbfc;
  font-weight: 500;
}

.search-input:focus {
  outline: none;
  border-color: #8b5cf6;
  background: white;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

.search-input::placeholder {
  color: #94a3b8;
}

.per-page-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.per-page-label {
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  white-space: nowrap;
}

.per-page-select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  min-width: 80px;
}

.per-page-select:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

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
  padding: 20px 24px;
  text-align: left;
  font-size: 13px;
  font-weight: 900;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  white-space: nowrap;
}

.th-po {
  width: 180px;
}
.th-supplier {
  width: auto;
}
.th-date {
  width: 160px;
}
.th-total {
  width: 160px;
}
.th-status {
  width: 130px;
}
.th-action {
  width: 180px;
  text-align: center;
}

.data-table td {
  padding: 18px 24px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

.data-row {
  transition: all 0.2s ease;
}

.data-row:hover {
  background: linear-gradient(135deg, #faf5ff, #f5f3ff);
  transform: scale(1.001);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.08);
}

.po-badge {
  display: inline-flex;
  padding: 10px 18px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #0369a1;
  font-weight: 800;
  font-size: 14px;
  border-radius: 10px;
  font-family: 'Courier New', monospace;
  border: 2px solid #7dd3fc;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.15);
}

.supplier-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  color: #1e293b;
}

.supplier-icon {
  font-size: 20px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.date-text {
  color: #475569;
  font-size: 14px;
  font-weight: 600;
}

.total-amount {
  font-weight: 900;
  font-size: 16px;
  color: #059669;
  font-family: 'Courier New', monospace;
}

.status-badge {
  display: inline-flex;
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  text-align: center;
  letter-spacing: 0.8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-open,
.status-terbuka {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e40af;
  border: 2px solid #60a5fa;
}

.status-draft {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #374151;
  border: 2px solid #9ca3af;
}

.status-closed {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #065f46;
  border: 2px solid #34d399;
}

.td-action {
  text-align: center;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  font-size: 18px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.btn-action::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition:
    width 0.4s ease,
    height 0.4s ease;
}

.btn-action:hover::before {
  width: 200%;
  height: 200%;
}

.btn-detail {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: white;
  box-shadow: 0 4px 10px rgba(107, 114, 128, 0.3);
}

.btn-detail:hover {
  background: linear-gradient(135deg, #4b5563, #374151);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 16px rgba(107, 114, 128, 0.4);
}

.btn-edit {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
}

.btn-edit:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-receive {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
}

.btn-receive:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.btn-print {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);
}

.btn-print:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 72px;
  display: block;
  margin-bottom: 20px;
  opacity: 0.4;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.empty-text {
  font-size: 20px;
  font-weight: 800;
  color: #475569;
  margin: 0 0 10px 0;
}

.empty-hint {
  font-size: 15px;
  color: #94a3b8;
  margin: 0;
  font-weight: 500;
}

.pagination-wrapper {
  padding: 24px 36px;
  border-top: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #fafbfc, #ffffff);
}

@media (max-width: 768px) {
  .page-header {
    padding: 24px;
    border-radius: 16px;
  }
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-icon {
    width: 52px;
    height: 52px;
    font-size: 26px;
  }
  .header-actions {
    width: 100%;
  }
  .btn-header {
    flex: 1;
    justify-content: center;
    padding: 12px 18px;
    font-size: 14px;
  }
  .page-title {
    font-size: 22px;
  }
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 24px;
  }
  .header-right {
    width: 100%;
  }
  .search-box {
    width: 100%;
    min-width: auto;
  }
  .per-page-selector {
    width: 100%;
    justify-content: space-between;
  }
  .action-buttons {
    gap: 8px;
  }
  .btn-action {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  .po-badge {
    font-size: 12px;
    padding: 8px 14px;
  }
  .total-amount {
    font-size: 14px;
  }
}
</style>
