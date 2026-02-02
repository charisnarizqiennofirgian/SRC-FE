<template>
  <DashboardLayout>
    <!-- Page Header -->
    <div class="page-header">
      <div class="breadcrumb">
        <router-link to="/" class="breadcrumb-item">
          <span class="breadcrumb-icon">🏠</span>
          Dashboard
        </router-link>
        <span class="breadcrumb-separator">→</span>
        <router-link to="/admin/penjualan/invoices" class="breadcrumb-item">
          Sales Invoice
        </router-link>
        <span class="breadcrumb-separator">→</span>
        <span class="breadcrumb-current">Buat Invoice</span>
      </div>

      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge">📄</div>
          <div class="header-text">
            <h1 class="page-title">Buat Invoice Penjualan</h1>
            <p class="page-subtitle">Buat invoice dari delivery order yang sudah diterima</p>
          </div>
        </div>
        <button @click="goBack" class="btn-secondary">
          <span class="btn-icon">←</span>
          <span class="btn-text">Kembali</span>
        </button>
      </div>
    </div>

    <!-- Step 1: Pilih Delivery Order -->
    <div class="content-card">
      <div class="card-header">
        <div class="header-left-section">
          <div class="header-icon">🚚</div>
          <div>
            <h2 class="card-title">Pilih Delivery Order</h2>
            <p class="card-subtitle">Pilih surat jalan yang sudah diterima customer</p>
          </div>
        </div>
      </div>

      <div class="card-body">
        <!-- Loading -->
        <div v-if="loadingDO" class="loading-container">
          <div class="spinner"></div>
          <p class="loading-text">Memuat delivery orders...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="deliveryOrders.length === 0" class="empty-state">
          <span class="empty-icon">📭</span>
          <h3 class="empty-title">Tidak Ada Delivery Order</h3>
          <p class="empty-text">
            Belum ada Delivery Order dengan status DELIVERED yang siap di-invoice
          </p>
        </div>

        <!-- List DO -->
        <div v-else class="do-grid">
          <div
            v-for="do_item in deliveryOrders"
            :key="do_item.id"
            class="do-card"
            :class="{ selected: selectedDO && selectedDO.id === do_item.id }"
            @click="selectDO(do_item)"
          >
            <div class="do-card-header">
              <div class="do-number">{{ do_item.do_number }}</div>
              <div class="do-badge">
                <span class="currency-badge">{{ do_item.sales_order?.currency || '-' }}</span>
              </div>
            </div>
            <div class="do-card-body">
              <div class="do-info-row">
                <span class="info-label">Sales Order:</span>
                <span class="info-value">{{ do_item.sales_order?.so_number || '-' }}</span>
              </div>
              <div class="do-info-row">
                <span class="info-label">Customer:</span>
                <span class="info-value customer-name">{{ do_item.buyer?.name || '-' }}</span>
              </div>
              <div class="do-info-row">
                <span class="info-label">Tanggal Kirim:</span>
                <span class="info-value">{{ formatDate(do_item.delivery_date) }}</span>
              </div>
              <div class="do-info-row">
                <span class="info-label">Total Items:</span>
                <span class="info-value"
                  >{{ formatNumber(do_item.details?.length || 0) }} item</span
                >
              </div>
            </div>
            <div v-if="selectedDO && selectedDO.id === do_item.id" class="do-selected-badge">
              <span>✓ Dipilih</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Form Invoice -->
    <div v-if="selectedDO" class="content-card mt-3">
      <div class="card-header">
        <div class="header-left-section">
          <div class="header-icon">📝</div>
          <div>
            <h2 class="card-title">Data Invoice</h2>
            <p class="card-subtitle">Lengkapi informasi invoice</p>
          </div>
        </div>
      </div>

      <div class="card-body">
        <div class="form-section">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">📅</span>
                Tanggal Invoice
                <span class="required">*</span>
              </label>
              <input v-model="form.invoice_date" type="date" class="form-control" required />
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">⏰</span>
                Tanggal Jatuh Tempo
              </label>
              <input v-model="form.due_date" type="date" class="form-control" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">💱</span>
              Kurs (Exchange Rate)
              <span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <span class="input-prefix">{{ selectedDO.sales_order?.currency || '-' }} → IDR</span>
              <input
                v-model.number="form.exchange_rate"
                type="number"
                step="0.01"
                class="form-control"
                placeholder="Contoh: 16000"
                required
              />
            </div>
            <small class="form-hint">
              Masukkan kurs BI/pajak hari ini (1 {{ selectedDO.sales_order?.currency || '-' }} =
              berapa IDR)
            </small>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">📝</span>
              Catatan
            </label>
            <textarea
              v-model="form.notes"
              class="form-control"
              rows="3"
              placeholder="Catatan tambahan untuk invoice ini..."
            ></textarea>
          </div>
        </div>

        <!-- Preview Items -->
        <div class="preview-section">
          <h3 class="section-title">
            <span class="title-icon">📦</span>
            Preview Items
          </h3>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th class="text-right">Harga ({{ selectedDO.sales_order?.currency || '-' }})</th>
                  <th class="text-right">
                    Subtotal ({{ selectedDO.sales_order?.currency || '-' }})
                  </th>
                  <th class="text-right">Subtotal (IDR)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="detail in selectedDO.details" :key="detail.id">
                  <td>
                    <div class="item-info">
                      <span class="item-name">{{ detail.item_name }}</span>
                    </div>
                  </td>
                  <td>{{ formatNumber(detail.quantity_shipped) }}</td>
                  <td>{{ detail.item_unit }}</td>
                  <td class="text-right">
                    {{
                      formatCurrency(
                        detail.sales_order_detail?.unit_price || 0,
                        selectedDO.sales_order?.currency,
                      )
                    }}
                  </td>
                  <td class="text-right">
                    {{
                      formatCurrency(
                        detail.quantity_shipped * (detail.sales_order_detail?.unit_price || 0),
                        selectedDO.sales_order?.currency,
                      )
                    }}
                  </td>
                  <td class="text-right">
                    {{
                      formatRupiah(
                        detail.quantity_shipped *
                          (detail.sales_order_detail?.unit_price || 0) *
                          form.exchange_rate,
                      )
                    }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="subtotal-row">
                  <td colspan="4" class="text-right"><strong>Subtotal:</strong></td>
                  <td class="text-right">
                    <strong>{{
                      formatCurrency(totals.subtotal_original, selectedDO.sales_order?.currency)
                    }}</strong>
                  </td>
                  <td class="text-right">
                    <strong>{{ formatRupiah(totals.subtotal_idr) }}</strong>
                  </td>
                </tr>
                <tr class="tax-row">
                  <td colspan="4" class="text-right">
                    <strong>PPN {{ totals.tax_rate }}%:</strong>
                  </td>
                  <td class="text-right">
                    <strong>{{
                      formatCurrency(totals.ppn_original, selectedDO.sales_order?.currency)
                    }}</strong>
                  </td>
                  <td class="text-right">
                    <strong>{{ formatRupiah(totals.ppn_idr) }}</strong>
                  </td>
                </tr>
                <tr class="total-row">
                  <td colspan="4" class="text-right"><strong>GRAND TOTAL:</strong></td>
                  <td class="text-right">
                    <strong>{{
                      formatCurrency(totals.grand_total_original, selectedDO.sales_order?.currency)
                    }}</strong>
                  </td>
                  <td class="text-right">
                    <strong>{{ formatRupiah(totals.grand_total_idr) }}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="form-actions">
          <button
            @click="submitInvoice"
            :disabled="submitting || !isFormValid"
            class="btn-primary btn-lg"
          >
            <span class="btn-icon">💾</span>
            <span class="btn-text">{{ submitting ? 'Menyimpan...' : 'Simpan Invoice' }}</span>
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script>
import apiClient from '@/api/axios'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { useToast } from 'vue-toastification'

export default {
  name: 'BuatInvoice',
  components: { DashboardLayout },

  data() {
    return {
      deliveryOrders: [],
      selectedDO: null,
      loadingDO: false,
      submitting: false,
      form: {
        delivery_order_id: null,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        exchange_rate: 1,
        notes: '',
      },
    }
  },

  computed: {
    isFormValid() {
      return this.selectedDO && this.form.invoice_date && this.form.exchange_rate > 0
    },

    totals() {
      if (!this.selectedDO) {
        return {
          subtotal_original: 0,
          ppn_original: 0,
          grand_total_original: 0,
          subtotal_idr: 0,
          ppn_idr: 0,
          grand_total_idr: 0,
          tax_rate: 0,
        }
      }

      let subtotal = 0
      const details = this.selectedDO.details || []

      details.forEach((detail) => {
        const price = detail?.sales_order_detail?.unit_price || 0
        const qty = detail?.quantity_shipped || 0
        subtotal += qty * price
      })

      const taxRate = parseFloat(this.selectedDO.sales_order?.tax_rate) || 0
      const ppn = subtotal * (taxRate / 100)
      const grandTotal = subtotal + ppn
      const rate = this.form.exchange_rate || 1

      return {
        subtotal_original: subtotal,
        ppn_original: ppn,
        grand_total_original: grandTotal,
        subtotal_idr: subtotal * rate,
        ppn_idr: ppn * rate,
        grand_total_idr: grandTotal * rate,
        tax_rate: taxRate,
      }
    },
  },

  setup() {
    const toast = useToast()
    return { toast }
  },

  mounted() {
    this.loadAvailableDeliveryOrders()
  },

  methods: {
    async loadAvailableDeliveryOrders() {
      this.loadingDO = true
      try {
        console.log('Fetching delivery orders...')
        const response = await apiClient.get('/delivery-orders/available-for-invoice')
        console.log('Raw Response:', response.data)

        const responseData = response.data
        if (responseData && Array.isArray(responseData.data)) {
          this.deliveryOrders = responseData.data
        } else if (Array.isArray(responseData)) {
          this.deliveryOrders = responseData
        } else if (responseData && typeof responseData === 'object') {
          const actualData = responseData.data || responseData
          this.deliveryOrders =
            actualData.delivery_orders ||
            actualData.items ||
            (Array.isArray(actualData) ? actualData : [])
        } else {
          this.deliveryOrders = []
        }

        // DEBUG: Log DO yang sudah diload
        console.log('Loaded Delivery Orders:', this.deliveryOrders)
        if (this.deliveryOrders.length > 0) {
          console.log('First DO Sales Order:', this.deliveryOrders[0].sales_order)
          console.log('First DO Tax Rate:', this.deliveryOrders[0].sales_order?.tax_rate)
        }
      } catch (error) {
        console.error('Error loading delivery orders:', error)
        console.error('Error response:', error.response)
        const message = error.response?.data?.message || error.message || 'Gagal memuat data'
        this.toast.error('Gagal memuat data delivery orders: ' + message)
      } finally {
        this.loadingDO = false
      }
    },
    selectDO(doItem) {
      this.selectedDO = doItem
      this.form.delivery_order_id = doItem.id

      if (doItem.sales_order && doItem.sales_order.exchange_rate) {
        this.form.exchange_rate = doItem.sales_order.exchange_rate
      }
    },

    async submitInvoice() {
      if (!this.isFormValid) {
        this.toast.error('Mohon lengkapi form dengan benar')
        return
      }

      this.submitting = true
      try {
        const response = await apiClient.post('/sales-invoices', this.form)

        this.toast.success('Invoice berhasil dibuat!')
        this.$router.push(`/admin/penjualan/invoices/${response.data.data.id}`)
      } catch (error) {
        console.error('Error creating invoice:', error)
        const message = error.response?.data?.message || error.message || 'Gagal membuat invoice'
        this.toast.error(message)
      } finally {
        this.submitting = false
      }
    },

    goBack() {
      this.$router.push('/admin/penjualan/invoices')
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
      if (amount === null || amount === undefined) return '-'
      const number = typeof amount === 'string' ? parseFloat(amount) : amount
      if (isNaN(number)) return '-'

      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(number)
    },

    formatNumber(num) {
      if (num === null || num === undefined) return '0'
      const number = typeof num === 'string' ? parseFloat(num) : num
      if (isNaN(number)) return '0'

      if (Number.isInteger(number)) {
        return number.toLocaleString('id-ID')
      }
      return number.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    },
  },
}
</script>

<style scoped>
/* Page Header */
.page-header {
  margin-bottom: 24px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-item:hover {
  color: #10b981;
}

.breadcrumb-current {
  color: #1f2937;
  font-weight: 600;
}

.breadcrumb-separator {
  color: #d1d5db;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-badge {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.page-subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #6b7280;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 2px solid #e5e7eb;
  color: #374151;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #10b981;
  color: #10b981;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Content Card */
.content-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.mt-3 {
  margin-top: 24px;
}

.card-header {
  padding: 24px;
  background: linear-gradient(to right, #f9fafb, #ffffff);
  border-bottom: 2px solid #e5e7eb;
}

.header-left-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.card-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.card-subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #6b7280;
}

.card-body {
  padding: 24px;
}

/* Loading */
.loading-container {
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

.loading-text {
  color: #6b7280;
  font-weight: 600;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.empty-text {
  color: #6b7280;
  margin: 0;
}

/* DO Grid */
.do-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.do-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
  position: relative;
}

.do-card:hover {
  border-color: #10b981;
  background: #f0fdf4;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
}

.do-card.selected {
  border-color: #10b981;
  background: #d1fae5;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.do-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.do-number {
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
}

.currency-badge {
  background: #fef3c7;
  color: #92400e;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  border: 2px solid #fbbf24;
}

.do-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.do-info-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.info-label {
  color: #6b7280;
  font-weight: 600;
}

.info-value {
  color: #1f2937;
  font-weight: 500;
}

.customer-name {
  color: #10b981;
  font-weight: 700;
}

.do-selected-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #10b981;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* Form Section */
.form-section {
  margin-bottom: 32px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.label-icon {
  font-size: 16px;
}

.required {
  color: #ef4444;
}

.form-control {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.input-wrapper {
  display: flex;
  align-items: stretch;
}

.input-prefix {
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  border-right: 0;
  padding: 12px 16px;
  border-radius: 8px 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
}

.input-wrapper .form-control {
  border-radius: 0 8px 8px 0;
}

.form-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

/* Preview Section */
.preview-section {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 2px solid #e5e7eb;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 20px;
}

.title-icon {
  font-size: 24px;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.data-table thead th {
  background: #f9fafb;
  font-weight: 700;
  color: #374151;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.item-name {
  font-weight: 600;
  color: #1f2937;
}

.text-right {
  text-align: right;
}

.data-table tfoot tr {
  background: #f9fafb;
  font-weight: 600;
}

.subtotal-row td {
  padding-top: 20px;
}

.total-row {
  background: #d1fae5 !important;
  font-size: 16px;
}

.total-row td {
  padding: 20px 16px;
  color: #065f46;
}

/* Form Actions */
.form-actions {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-lg {
  padding: 16px 32px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .do-grid {
    grid-template-columns: 1fr;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>
