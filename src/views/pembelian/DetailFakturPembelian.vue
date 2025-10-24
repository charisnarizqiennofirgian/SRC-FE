<template>
  <DashboardLayout>
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">🧾</div>
          <div>
            <h1 class="page-title">Detail Faktur Pembelian</h1>
            <p v-if="!loading && faktur" class="page-subtitle">
              {{ faktur.bill_number }} • {{ faktur.supplier?.name }}
            </p>
          </div>
        </div>
        <div class="header-actions">
          <router-link :to="{ name: 'DaftarFakturPembelian' }" class="btn-header btn-back">
            <span class="btn-icon">←</span>
            <span>Kembali</span>
          </router-link>
          <router-link
            v-if="!loading && faktur"
            :to="{ name: 'CetakFakturPembelian', params: { id: faktur.id } }"
            class="btn-header btn-primary"
            target="_blank"
          >
            <span class="btn-icon">🖨️</span>
            <span>Cetak</span>
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="loading" class="skeleton-wrapper">
      <div class="skeleton-card">
        <div class="skeleton-header"></div>
        <div class="skeleton-body">
          <div class="skeleton-item" v-for="i in 6" :key="i"></div>
        </div>
      </div>
      <div class="skeleton-card">
        <div class="skeleton-header"></div>
        <div class="skeleton-table">
          <div class="skeleton-row" v-for="i in 4" :key="i"></div>
        </div>
      </div>
    </div>

    <div v-else-if="faktur" class="content-wrapper">
      <div class="content-card">
        <div class="card-header">
          <div class="header-badge">ℹ️</div>
          <div>
            <h2 class="card-title">Informasi Faktur</h2>
            <p class="card-subtitle">Data utama tagihan pembelian</p>
          </div>
        </div>
        <div class="card-body">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">No. Faktur Internal</span>
              <span class="info-value highlight">{{ faktur.bill_number }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">No. Faktur Supplier</span>
              <span class="info-value">{{ faktur.supplier_invoice_number }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Supplier</span>
              <span class="info-value">{{ faktur.supplier?.name || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Ref. Penerimaan</span>
              <span class="info-value">{{ faktur.goods_receipt?.gr_number || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Tanggal Faktur</span>
              <span class="info-value">{{ formatTanggal(faktur.bill_date) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Jatuh Tempo</span>
              <span class="info-value">{{ formatTanggal(faktur.due_date) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status Pembayaran</span>
              <span :class="['status-badge', `status-${faktur.status.toLowerCase()}`]">
                {{ faktur.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="content-card">
        <div class="card-header">
          <div class="header-badge">📦</div>
          <div>
            <h2 class="card-title">Detail Barang</h2>
            <p class="card-subtitle">{{ itemCount }} item ditagih</p>
          </div>
        </div>
        <div class="card-body no-padding">
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 50px">No</th>
                  <th>Nama Barang</th>
                  <th style="width: 150px">Jumlah</th>
                  <th style="width: 180px">Harga Satuan</th>
                  <th style="width: 180px">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!detailItems.length">
                  <td colspan="5" class="text-center empty-row">
                    <span class="empty-icon">📭</span>
                    <p>Data detail barang tidak ditemukan</p>
                  </td>
                </tr>
                <tr v-for="(item, index) in detailItems" :key="item.id" class="data-row">
                  <td class="td-center">{{ index + 1 }}</td>
                  <td class="td-item">
                    <span class="item-name">{{ item.item?.name || 'N/A' }}</span>
                  </td>
                  <td class="td-center">
                    <span class="qty-badge">
                      {{ item.quantity }} {{ item.item?.unit?.name || '' }}
                    </span>
                  </td>
                  <td class="td-right">{{ formatCurrency(item.price) }}</td>
                  <td class="td-right">
                    <strong>
                      {{ formatCurrency(item.quantity * item.price) }}
                    </strong>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="summary-row">
                  <td colspan="3" rowspan="3" class="notes-cell">
                    <div class="notes-wrapper">
                      <strong>📝 Catatan:</strong>
                      <p>{{ faktur.notes || 'Tidak ada catatan tambahan.' }}</p>
                    </div>
                  </td>
                  <td class="summary-label">Subtotal</td>
                  <td class="summary-value">{{ formatCurrency(faktur.subtotal) }}</td>
                </tr>
                <tr class="summary-row">
                  <td class="summary-label">PPN {{ formatPercentage(faktur.ppn_percentage) }}%</td>
                  <td class="summary-value">{{ formatCurrency(faktur.ppn_amount) }}</td>
                </tr>
                <tr class="summary-row total-row">
                  <td class="summary-label">Grand Total</td>
                  <td class="summary-value total-highlight">
                    {{ formatCurrency(faktur.total_amount) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error-state">
      <span class="error-icon">⚠️</span>
      <h3>Data tidak ditemukan</h3>
      <p>Faktur yang Anda cari tidak tersedia atau telah dihapus</p>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/api/axios'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const loading = ref(true)
const faktur = ref(null)

const detailItems = computed(() => {
  return faktur.value?.details || []
})

const itemCount = computed(() => detailItems.value.length)

// OPTIMIZED: Fetch dengan select fields spesifik
const fetchFakturDetail = async () => {
  loading.value = true
  try {
    const fakturId = route.params.id

    // OPTIMASI: Hanya ambil field yang diperlukan
    const response = await apiClient.get(`/purchase-bills/${fakturId}`, {
      params: {
        include: 'supplier,details.item.unit,goodsReceipt',
      },
    })

    faktur.value = response.data.data
  } catch (error) {
    console.error('Gagal memuat detail Faktur:', error)
    toast.error('Gagal memuat detail faktur')
    setTimeout(() => {
      router.push({ name: 'DaftarFakturPembelian' })
    }, 1500)
  } finally {
    loading.value = false
  }
}

const formatTanggal = (tanggal) => {
  if (!tanggal) return '-'
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatCurrency = (value) => {
  if (value == null || isNaN(value)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatPercentage = (value) => {
  // PPN akan tampil dengan benar sekarang karena data utama 'faktur'
  // sudah ditarik dengan benar
  if (value == null || isNaN(value)) return '0'
  return parseInt(value)
}

onMounted(fetchFakturDetail)
</script>
<style scoped>
/* HEADER */
.page-header {
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%);
  padding: 28px 32px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  gap: 20px;
  flex-wrap: wrap;
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
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
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
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 12px;
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
}

.btn-back {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, #fff, #f0f0f0);
  color: #8b5cf6;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 255, 255, 0.3);
}

.btn-icon {
  font-size: 18px;
}

/* SKELETON LOADING */
.skeleton-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skeleton-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.skeleton-header {
  width: 200px;
  height: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
  margin-bottom: 20px;
}

.skeleton-body {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.skeleton-item {
  height: 60px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}

.skeleton-table {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-row {
  height: 50px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* CONTENT CARDS */
.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.content-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #fafbfc, #ffffff);
  border-bottom: 2px solid #e9ecef;
}

.header-badge {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ddd6fe, #c4b5fd);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
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
  font-weight: 600;
}

.card-body {
  padding: 28px;
}

.card-body.no-padding {
  padding: 0;
}

/* INFO GRID */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #8b5cf6;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: #f0f4ff;
  transform: translateX(4px);
}

.info-label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

.info-value.highlight {
  color: #8b5cf6;
  font-size: 16px;
  font-family: 'Courier New', monospace;
}

/* STATUS BADGE */
.status-badge {
  display: inline-flex;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: fit-content;
}

.status-paid,
.status-lunas {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #065f46;
  border: 2px solid #34d399;
}

.status-unpaid,
.status-belum {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #991b1b;
  border: 2px solid #f87171;
}

.status-partial {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  border: 2px solid #fbbf24;
}

/* TABLE */
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: linear-gradient(135deg, #1e293b, #334155);
}

.data-table th {
  padding: 16px 20px;
  text-align: left;
  font-size: 12px;
  font-weight: 800;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.data-table td {
  padding: 16px 20px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.data-row {
  transition: all 0.2s ease;
}

.data-row:hover {
  background: linear-gradient(135deg, #faf5ff, #f5f3ff);
}

.td-center {
  text-align: center;
  color: #64748b;
  font-weight: 600;
}

.td-item {
  font-weight: 700;
}

.item-name {
  color: #1e293b;
}

.qty-badge {
  display: inline-flex;
  padding: 6px 12px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e40af;
  font-weight: 800;
  font-size: 13px;
  border-radius: 8px;
  border: 2px solid #60a5fa;
}

.td-right {
  text-align: right;
  font-weight: 600;
  color: #059669;
  font-family: 'Courier New', monospace;
}

.empty-row {
  text-align: center;
  padding: 60px 20px !important;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
  opacity: 0.4;
}

/* FOOTER TABLE */
.data-table tfoot {
  background: #f8f9fa;
  border-top: 3px solid #dee2e6;
}

.summary-row td {
  border-bottom: 1px solid #e9ecef;
  padding: 12px 20px;
}

.summary-label {
  font-weight: 700;
  text-align: right;
  color: #495057;
  font-size: 14px;
}

.summary-value {
  font-weight: 800;
  text-align: right;
  color: #1e293b;
  font-family: 'Courier New', monospace;
  font-size: 15px;
}

.total-row {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}

.total-row .summary-label,
.total-row .summary-value {
  font-size: 17px;
  color: #000;
  border-top: 3px solid #f59e0b;
}

.total-highlight {
  color: #f59e0b !important;
  font-weight: 900 !important;
}

.notes-cell {
  text-align: left;
  vertical-align: top;
  padding: 16px 20px !important;
}

.notes-wrapper {
  background: white;
  padding: 16px;
  border-radius: 10px;
  border-left: 4px solid #8b5cf6;
}

.notes-wrapper strong {
  display: block;
  margin-bottom: 8px;
  color: #1e293b;
  font-size: 14px;
}

.notes-wrapper p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  font-style: italic;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* ERROR STATE */
.error-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.error-icon {
  font-size: 72px;
  display: block;
  margin-bottom: 20px;
  opacity: 0.4;
}

.error-state h3 {
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.error-state p {
  font-size: 15px;
  color: #64748b;
  margin: 0;
}

/* RESPONSIVE */
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

  .info-grid {
    grid-template-columns: 1fr;
  }

  .data-table {
    font-size: 12px;
  }

  .data-table th,
  .data-table td {
    padding: 12px;
  }
}
</style>
