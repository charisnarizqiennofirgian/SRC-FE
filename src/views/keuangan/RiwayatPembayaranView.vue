<template>
  <DashboardLayout>
    <!-- HEADER -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge">
            <span class="icon">📋</span>
          </div>
          <div class="header-text">
            <h1 class="page-title">Riwayat Pembayaran Hutang</h1>
            <p class="page-subtitle">Daftar semua pembayaran hutang supplier</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" @click="router.push({ name: 'PembayaranHutang' })">
            <span class="btn-icon">💰</span>
            <span class="btn-text">Bayar Hutang</span>
          </button>
        </div>
      </div>
    </div>

    <!-- FILTER -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">
            <span class="label-icon">📅</span>
            Dari Tanggal
          </label>
          <input v-model="filters.start_date" type="date" class="filter-input" />
        </div>

        <div class="filter-group">
          <label class="filter-label">
            <span class="label-icon">📅</span>
            Sampai Tanggal
          </label>
          <input v-model="filters.end_date" type="date" class="filter-input" />
        </div>

        <div class="filter-group">
          <label class="filter-label">
            <span class="label-icon">🏢</span>
            Supplier
          </label>
          <select v-model="filters.supplier_id" class="filter-input">
            <option value="">Semua Supplier</option>
            <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
              {{ supplier.name }}
            </option>
          </select>
        </div>

        <div class="filter-actions">
          <button class="btn btn-filter" @click="fetchPayments">
            <span class="btn-icon">🔍</span>
            <span class="btn-text">Filter</span>
          </button>
          <button class="btn btn-reset" @click="resetFilters">
            <span class="btn-icon">🔄</span>
          </button>
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <div class="content-card">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>No. Pembayaran</th>
              <th>Tanggal</th>
              <th>Supplier</th>
              <th>No. Invoice</th>
              <th class="text-right">Nominal</th>
              <th>Via</th>
              <th>Dibuat Oleh</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="text-center">
                <div class="loading-spinner">⏳ Memuat data...</div>
              </td>
            </tr>
            <tr v-else-if="payments.length === 0">
              <td colspan="8" class="text-center">
                <div class="empty-state">
                  <span class="empty-icon">📭</span>
                  <p>Belum ada riwayat pembayaran</p>
                </div>
              </td>
            </tr>
            <tr v-else v-for="payment in payments" :key="payment.id">
              <td class="font-mono">{{ payment.payment_number }}</td>
              <td>{{ formatDate(payment.payment_date) }}</td>
              <td>{{ payment.purchase_bill?.supplier?.name || '-' }}</td>
              <td class="font-mono">{{ payment.purchase_bill?.bill_number || '-' }}</td>
              <td class="text-right text-success font-bold">{{ formatRupiah(payment.amount) }}</td>
              <td>
                <span class="badge badge-info">{{ payment.payment_method?.name }}</span>
              </td>
              <td>{{ payment.created_by?.name || '-' }}</td>
              <td>
                <button
                  class="btn-icon-action"
                  @click="viewDetail(payment.id)"
                  title="Lihat Detail"
                >
                  👁️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION -->
      <div class="pagination" v-if="payments.length > 0">
        <button class="btn-page" @click="prevPage" :disabled="currentPage === 1">◀️ Prev</button>
        <span class="page-info"> Halaman {{ currentPage }} dari {{ totalPages }} </span>
        <button class="btn-page" @click="nextPage" :disabled="currentPage === totalPages">
          Next ▶️
        </button>
      </div>
    </div>

    <!-- MODAL DETAIL -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Detail Pembayaran: {{ selectedPayment?.payment_number }}</h3>
          <button class="btn-close" @click="closeModal">✖️</button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h4>Informasi Pembayaran</h4>
            <div class="detail-row">
              <span class="detail-label">Tanggal:</span>
              <span class="detail-value">{{ formatDate(selectedPayment?.payment_date) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Supplier:</span>
              <span class="detail-value">{{ selectedPayment?.purchase_bill?.supplier?.name }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Invoice:</span>
              <span class="detail-value font-mono">{{
                selectedPayment?.purchase_bill?.bill_number
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Nominal:</span>
              <span class="detail-value text-success font-bold">{{
                formatRupiah(selectedPayment?.amount)
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Via:</span>
              <span class="detail-value">{{ selectedPayment?.payment_method?.name }}</span>
            </div>
            <div class="detail-row" v-if="selectedPayment?.notes">
              <span class="detail-label">Keterangan:</span>
              <span class="detail-value">{{ selectedPayment?.notes }}</span>
            </div>
          </div>

          <div class="detail-section" v-if="selectedPayment?.journal_entry">
            <h4>Jurnal Akuntansi</h4>
            <table class="detail-table">
              <thead>
                <tr>
                  <th>Akun</th>
                  <th>Keterangan</th>
                  <th class="text-right">Debit</th>
                  <th class="text-right">Kredit</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="line in selectedPayment.journal_entry.lines" :key="line.id">
                  <td>{{ line.account?.code }} - {{ line.account?.name }}</td>
                  <td>{{ line.description }}</td>
                  <td class="text-right text-success">{{ formatRupiah(line.debit) }}</td>
                  <td class="text-right text-danger">{{ formatRupiah(line.credit) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="2"><strong>TOTAL</strong></td>
                  <td class="text-right text-success">
                    <strong>{{ formatRupiah(selectedPayment.journal_entry.total_debit) }}</strong>
                  </td>
                  <td class="text-right text-danger">
                    <strong>{{ formatRupiah(selectedPayment.journal_entry.total_credit) }}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'

const router = useRouter()
const { showError } = useNotification()

const payments = ref([])
const suppliers = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const showModal = ref(false)
const selectedPayment = ref(null)

const filters = ref({
  start_date: '',
  end_date: '',
  supplier_id: '',
})

const fetchPayments = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      ...filters.value,
    }

    const response = await apiClient.get('/purchase-payments', { params })
    payments.value = response.data.data.data || response.data.data
    totalPages.value = response.data.data.last_page || 1
  } catch (error) {
    console.error('Error fetching payments:', error)
    showError('Gagal', 'Gagal memuat data pembayaran')
  } finally {
    loading.value = false
  }
}

const fetchSuppliers = async () => {
  try {
    const response = await apiClient.get('/suppliers')
    suppliers.value = response.data.data || response.data
  } catch (error) {
    console.error('Error fetching suppliers:', error)
  }
}

const viewDetail = async (id) => {
  try {
    const response = await apiClient.get(`/purchase-payments/${id}`)
    selectedPayment.value = response.data.data
    showModal.value = true
  } catch (error) {
    showError('Gagal', 'Gagal memuat detail pembayaran')
  }
}

const closeModal = () => {
  showModal.value = false
  selectedPayment.value = null
}

const resetFilters = () => {
  filters.value = {
    start_date: '',
    end_date: '',
    supplier_id: '',
  }
  fetchPayments()
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchPayments()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchPayments()
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatRupiah = (amount) => {
  if (!amount) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

onMounted(() => {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  filters.value.start_date = firstDay.toISOString().split('T')[0]
  filters.value.end_date = now.toISOString().split('T')[0]

  fetchPayments()
  fetchSuppliers()
})
</script>

<style scoped>
/* Gunakan style yang sama dengan JurnalUmum.vue */
.page-header {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  padding: 32px 36px;
  border-radius: 24px;
  margin-bottom: 24px;
  box-shadow: 0 12px 40px rgba(139, 92, 246, 0.25);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  flex-wrap: wrap;
  gap: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-badge {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.icon {
  font-size: 36px;
}

.page-title {
  font-size: 30px;
  font-weight: 900;
  margin: 0 0 6px 0;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.page-subtitle {
  font-size: 15px;
  opacity: 0.95;
  margin: 0;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.btn-primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.filter-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 14px;
  color: #374151;
}

.label-icon {
  font-size: 16px;
}

.filter-input {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.filter-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

.filter-actions {
  display: flex;
  gap: 12px;
}

.btn-filter {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  flex: 1;
}

.btn-reset {
  background: #f3f4f6;
  color: #374151;
  padding: 12px 16px;
}

.content-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
}

.data-table th {
  padding: 16px;
  text-align: left;
  font-weight: 800;
  font-size: 13px;
  color: #475569;
  text-transform: uppercase;
  border-bottom: 2px solid #e2e8f0;
}

.data-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  color: #1e293b;
}

.data-table tbody tr:hover {
  background: #faf5ff;
}

.font-mono {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #8b5cf6;
}

.text-right {
  text-align: right;
}

.text-success {
  color: #10b981;
  font-weight: 700;
}

.text-danger {
  color: #ef4444;
  font-weight: 700;
}

.font-bold {
  font-weight: 700;
}

.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
}

.badge-info {
  background: #dbeafe;
  color: #1e40af;
}

.btn-icon-action {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  padding: 4px 8px;
  transition: transform 0.2s ease;
}

.btn-icon-action:hover {
  transform: scale(1.2);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border-top: 2px solid #f1f5f9;
}

.btn-page {
  padding: 10px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.3s ease;
}

.btn-page:hover:not(:disabled) {
  background: #8b5cf6;
  color: white;
  border-color: #8b5cf6;
}

.btn-page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-weight: 700;
  color: #475569;
}

.loading-spinner {
  padding: 40px;
  font-size: 18px;
  color: #64748b;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 900px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-bottom: 2px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px 8px;
  transition: transform 0.2s ease;
}

.btn-close:hover {
  transform: rotate(90deg);
}

.modal-body {
  padding: 32px;
  overflow-y: auto;
  max-height: 60vh;
}

.detail-section {
  margin-bottom: 32px;
}

.detail-section h4 {
  font-size: 16px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-label {
  font-weight: 600;
  color: #64748b;
}

.detail-value {
  font-weight: 600;
  color: #1e293b;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.detail-table th,
.detail-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.detail-table th {
  font-weight: 800;
  font-size: 13px;
  color: #475569;
  background: #f8fafc;
}

.total-row {
  background: #f8fafc;
  font-size: 16px;
}

.total-row td {
  padding: 16px 12px;
  border-top: 2px solid #8b5cf6;
}
</style>
