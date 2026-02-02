<template>
  <DashboardLayout>
    <div class="page-container">
      <div class="page-header">
        <div class="header-left">
          <h1>Detail Uang Muka</h1>
          <p class="subtitle">{{ downPayment.dp_number }}</p>
        </div>
        <button @click="goBack" class="btn-secondary">
          <i class="fas fa-arrow-left"></i> Kembali
        </button>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Memuat data...</p>
      </div>

      <div v-else-if="downPayment.id" class="content">
        <div class="card">
          <div class="card-header">
            <h2>Informasi Uang Muka</h2>
            <span :class="getStatusClass(downPayment.status)">
              {{ getStatusText(downPayment.status) }}
            </span>
          </div>
          <div class="card-body">
            <div class="info-grid">
              <div class="info-item">
                <label>Nomor DP</label>
                <div class="value">{{ downPayment.dp_number }}</div>
              </div>
              <div class="info-item">
                <label>Tanggal Terima</label>
                <div class="value">{{ formatDate(downPayment.payment_date) }}</div>
              </div>
              <div class="info-item">
                <label>Customer</label>
                <div class="value">{{ downPayment.buyer?.name }}</div>
              </div>
              <div class="info-item">
                <label>Sales Order</label>
                <div class="value">{{ downPayment.sales_order?.so_number }}</div>
              </div>
              <div class="info-item">
                <label>Akun Kas/Bank</label>
                <div class="value">
                  {{ downPayment.account?.code }} - {{ downPayment.account?.name }}
                </div>
              </div>
              <div class="info-item">
                <label>Currency</label>
                <div class="value">{{ downPayment.currency }}</div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="amount-section">
              <div class="amount-item">
                <label>Total Uang Muka</label>
                <div class="amount-value primary">
                  {{ formatRupiah(downPayment.amount_idr) }}
                </div>
                <div class="amount-original">
                  {{ formatCurrency(downPayment.amount_original, downPayment.currency) }}
                </div>
              </div>
              <div class="amount-item">
                <label>Sudah Dipotong</label>
                <div class="amount-value used">
                  {{ formatRupiah(downPayment.used_amount) }}
                </div>
              </div>
              <div class="amount-item">
                <label>Sisa yang Tersedia</label>
                <div class="amount-value remaining">
                  {{ formatRupiah(downPayment.remaining_amount) }}
                </div>
              </div>
            </div>

            <div v-if="downPayment.notes" class="notes-section">
              <label>Catatan</label>
              <p>{{ downPayment.notes }}</p>
            </div>
          </div>
        </div>

        <div v-if="downPayment.journal_entry" class="card">
          <div class="card-header">
            <h2>Jurnal Akuntansi</h2>
          </div>
          <div class="card-body">
            <p class="journal-info">
              <strong>Nomor Jurnal:</strong> {{ downPayment.journal_entry.journal_number }}
            </p>
            <p class="journal-info">
              <strong>Tanggal:</strong> {{ formatDate(downPayment.journal_entry.date) }}
            </p>

            <table class="table">
              <thead>
                <tr>
                  <th>Akun</th>
                  <th>Deskripsi</th>
                  <th class="text-right">Debit</th>
                  <th class="text-right">Kredit</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="line in downPayment.journal_entry.lines" :key="line.id">
                  <td>
                    <strong>{{ line.account?.code }}</strong
                    ><br />
                    <small>{{ line.account?.name }}</small>
                  </td>
                  <td>{{ line.description }}</td>
                  <td class="text-right">{{ formatRupiah(line.debit) }}</td>
                  <td class="text-right">{{ formatRupiah(line.credit) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" class="text-right"><strong>Total:</strong></td>
                  <td class="text-right">
                    <strong>{{ formatRupiah(getTotalDebit()) }}</strong>
                  </td>
                  <td class="text-right">
                    <strong>{{ formatRupiah(getTotalCredit()) }}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div v-else class="alert alert-danger">Data uang muka tidak ditemukan</div>
    </div>
  </DashboardLayout>
</template>

<script>
import apiClient from '@/api/axios'
import DashboardLayout from '@/components/DashboardLayout.vue'

export default {
  name: 'DownPaymentDetail',
  components: { DashboardLayout },

  data() {
    return {
      downPayment: {},
      loading: false,
    }
  },

  mounted() {
    this.loadDownPayment()
  },

  methods: {
    async loadDownPayment() {
      this.loading = true
      try {
        const id = this.$route.params.id
        const response = await apiClient.get(`/down-payments/${id}`)
        this.downPayment = response.data
      } catch (error) {
        console.error('Error:', error)
        this.$toast.error('Gagal memuat data')
      } finally {
        this.loading = false
      }
    },

    goBack() {
      this.$router.push('/admin/penjualan/down-payments')
    },

    getTotalDebit() {
      if (!this.downPayment.journal_entry?.lines) return 0
      return this.downPayment.journal_entry.lines.reduce(
        (sum, line) => sum + parseFloat(line.debit || 0),
        0,
      )
    },

    getTotalCredit() {
      if (!this.downPayment.journal_entry?.lines) return 0
      return this.downPayment.journal_entry.lines.reduce(
        (sum, line) => sum + parseFloat(line.credit || 0),
        0,
      )
    },

    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    },

    formatRupiah(amount) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount || 0)
    },

    formatCurrency(amount, currency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount || 0)
    },

    getStatusClass(status) {
      const classes = {
        PENDING: 'badge badge-warning',
        USED: 'badge badge-success',
        REFUNDED: 'badge badge-secondary',
      }
      return classes[status] || 'badge badge-secondary'
    },

    getStatusText(status) {
      const texts = {
        PENDING: 'Pending (Belum Dipakai)',
        USED: 'Sudah Dipakai',
        REFUNDED: 'Dikembalikan',
      }
      return texts[status] || status
    },
  },
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left h1 {
  margin: 0;
  font-size: 24px;
  color: #1f2937;
}

.subtitle {
  margin: 4px 0 0 0;
  color: #6b7280;
  font-size: 14px;
}

.btn-secondary {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.2s;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #10b981;
  color: #10b981;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
}

.card-body {
  padding: 24px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item label {
  display: block;
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 6px;
}

.info-item .value {
  font-size: 15px;
  color: #1f2937;
  font-weight: 500;
}

.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 24px 0;
}

.amount-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
}

.amount-item label {
  display: block;
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 8px;
}

.amount-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.amount-value.primary {
  color: #10b981;
}

.amount-value.used {
  color: #6b7280;
}

.amount-value.remaining {
  color: #3b82f6;
}

.amount-original {
  font-size: 13px;
  color: #9ca3af;
}

.notes-section {
  margin-top: 20px;
  padding: 16px;
  background: #fef3c7;
  border-radius: 8px;
  border: 1px solid #fbbf24;
}

.notes-section label {
  display: block;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 8px;
}

.notes-section p {
  margin: 0;
  color: #78350f;
}

.badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-warning {
  background: #fef3c7;
  color: #92400e;
  border: 2px solid #fbbf24;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
  border: 2px solid #6ee7b7;
}

.badge-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 2px solid #d1d5db;
}

.journal-info {
  margin-bottom: 12px;
  color: #374151;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.table th,
.table td {
  padding: 12px;
  text-align: left;
  border: 1px solid #e5e7eb;
}

.table thead th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 13px;
}

.table tbody tr:hover {
  background: #f9fafb;
}

.table tfoot tr {
  background: #f9fafb;
  font-weight: 600;
}

.text-right {
  text-align: right;
}

.alert {
  padding: 16px;
  border-radius: 8px;
  margin: 20px 0;
}

.alert-danger {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #991b1b;
}

@media (max-width: 768px) {
  .info-grid,
  .amount-section {
    grid-template-columns: 1fr;
  }
}
</style>
