<template>
  <DashboardLayout>
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left-section">
          <div class="icon-badge">🧾</div>
          <div>
            <h1 class="page-title">Daftar Faktur Pembelian</h1>
            <p class="page-subtitle">Semua tagihan dari supplier yang telah dicatat</p>
          </div>
        </div>
        <div class="header-right-section">
          <router-link :to="{ name: 'BuatFakturPembelian' }" class="btn-primary">
            <span class="btn-icon">➕</span>
            <span>Buat Faktur Baru</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p class="loading-text">Memuat daftar faktur...</p>
    </div>

    <!-- Content Card -->
    <div v-else class="content-card">
      <div class="card-header">
        <div class="header-left">
          <div class="header-badge">📋</div>
          <div>
            <h2 class="card-title">Faktur Pembelian</h2>
            <p class="card-subtitle">Total {{ daftarFaktur.length }} faktur terdaftar</p>
          </div>
        </div>
      </div>

      <div class="card-body-table">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th class="th-invoice">
                  <div class="th-content">
                    <span class="th-icon">🧾</span>
                    <span>No. Faktur</span>
                  </div>
                </th>
                <th class="th-supplier">
                  <div class="th-content">
                    <span class="th-icon">🏭</span>
                    <span>Supplier</span>
                  </div>
                </th>
                <th class="th-date">
                  <div class="th-content">
                    <span class="th-icon">📅</span>
                    <span>Tgl. Faktur</span>
                  </div>
                </th>
                <th class="th-amount">
                  <div class="th-content">
                    <span class="th-icon">💰</span>
                    <span>Total Tagihan</span>
                  </div>
                </th>
                <th class="th-status">
                  <div class="th-content">
                    <span class="th-icon">📊</span>
                    <span>Status</span>
                  </div>
                </th>
                <th class="th-action">
                  <div class="th-content">
                    <span>Aksi</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <!-- Empty State -->
              <tr v-if="daftarFaktur.length === 0" class="empty-row">
                <td colspan="6">
                  <div class="empty-state">
                    <span class="empty-icon">📭</span>
                    <p class="empty-text">Belum ada faktur yang dicatat</p>
                    <p class="empty-hint">Klik tombol "Buat Faktur Baru" untuk membuat faktur</p>
                  </div>
                </td>
              </tr>

              <!-- Data Rows -->
              <tr v-for="faktur in daftarFaktur" :key="faktur.id" class="data-row">
                <td class="td-invoice">
                  <span class="invoice-badge">{{ faktur.bill_number }}</span>
                </td>
                <td class="td-supplier">
                  <div class="supplier-info">
                    <span class="supplier-icon">🏭</span>
                    <span>{{ faktur.supplier.name }}</span>
                  </div>
                </td>
                <td class="td-date">
                  <span class="date-text">{{ formatTanggal(faktur.bill_date) }}</span>
                </td>
                <td class="td-amount">
                  <span class="amount-value">{{ formatCurrency(faktur.total_amount) }}</span>
                </td>
                <td class="td-status">
                  <span :class="['status-badge', `status-${faktur.status.toLowerCase()}`]">
                    {{ faktur.status }}
                  </span>
                </td>
                <td class="td-action">
                  <div class="action-buttons">
                    <button class="btn-action btn-view" title="Lihat Detail">
                      <span>👁️</span>
                    </button>
                    <button class="btn-action btn-print" title="Cetak Faktur">
                      <span>🖨️</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '@/api/axios'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const loading = ref(true)
const daftarFaktur = ref([])

const fetchFaktur = async () => {
  loading.value = true
  try {
    const response = await apiClient.get('/purchase-bills')
    daftarFaktur.value = response.data.data.data
  } catch (error) {
    console.error('Error fetching purchase bills:', error)
    toast.error('Gagal memuat daftar faktur pembelian.')
  } finally {
    loading.value = false
  }
}

const formatTanggal = (tanggal) => {
  if (!tanggal) return ''
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const formatCurrency = (value) => {
  if (isNaN(value)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

onMounted(fetchFaktur)
</script>

<style scoped>
/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
  background: white;
  border-radius: 16px;
  padding: 60px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #dbeafe;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 16px;
  color: #64748b;
  font-weight: 600;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  padding: 28px 32px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.25);
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

.header-left-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-badge {
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

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  color: #3b82f6;
  text-decoration: none;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.btn-icon {
  font-size: 16px;
}

/* Content Card */
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
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-badge {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  border: 2px solid #93c5fd;
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

/* Table */
.card-body-table {
  padding: 0;
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
  padding: 18px 20px;
  text-align: left;
  color: white;
  font-weight: 800;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.th-icon {
  font-size: 16px;
}

.th-invoice {
  width: 180px;
}

.th-supplier {
  width: auto;
}

.th-date {
  width: 160px;
}

.th-amount {
  width: 170px;
}

.th-status {
  width: 130px;
}

.th-action {
  width: 120px;
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

/* Table Cells */
.invoice-badge {
  display: inline-flex;
  padding: 8px 14px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e40af;
  font-weight: 700;
  font-size: 13px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  border: 2px solid #93c5fd;
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

.amount-value {
  font-weight: 800;
  font-size: 15px;
  color: #059669;
}

/* Status Badge */
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

.status-posted {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  border: 2px solid #fcd34d;
}

.status-paid {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #15803d;
  border: 2px solid #86efac;
}

.status-unpaid {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #991b1b;
  border: 2px solid #fca5a5;
}

/* Action Buttons */
.td-action {
  text-align: center;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
  cursor: pointer;
}

.btn-view {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: white;
  box-shadow: 0 2px 6px rgba(107, 114, 128, 0.3);
  border: none;
}

.btn-view:hover {
  background: linear-gradient(135deg, #4b5563, #374151);
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(107, 114, 128, 0.4);
}

.btn-print {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
  border: none;
}

.btn-print:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
}

/* Empty State */
.empty-row {
  background: #fafafa;
}

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

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    padding: 20px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .page-title {
    font-size: 20px;
  }

  .card-header {
    padding: 20px;
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
