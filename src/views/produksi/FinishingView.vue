<template>
  <DashboardLayout>
    <!-- ========================================
         PAGE HEADER - FINISHING THEME
         ======================================== -->
    <div class="page-header-finishing">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-finishing">
            <span class="finishing-icon">🎨</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-finishing">Proses Finishing (Pengecatan)</h1>
            <p class="page-subtitle-finishing">
              Proses pengecatan dan finishing akhir barang dari Gudang Rustik ke Gudang Finishing
              dengan tracking qty yang akurat.
            </p>
          </div>
        </div>
        <div class="header-right-section">
          <div class="process-flow-badge-finishing">
            <span class="flow-icon">🪵</span>
            <span class="flow-arrow">→</span>
            <span class="flow-icon">🎨</span>
            <span class="flow-arrow">→</span>
            <span class="flow-icon">✨</span>
          </div>
          <div class="flow-label-finishing">Rustik → Finishing → Siap Jual</div>
        </div>
      </div>
    </div>

    <!-- ========================================
         FORM CARD
         ======================================== -->
    <div class="content-card-finishing">
      <div class="card-body-finishing">
        <!-- SECTION 1: PILIH PO -->
        <div class="form-section-modern">
          <div class="section-header section-header-finishing">
            <div class="section-icon-badge finishing-po-badge">
              <span class="section-icon">📄</span>
            </div>
            <div class="section-title-group">
              <h3 class="section-title">Pilih Production Order</h3>
              <p class="section-subtitle">
                PO akan menampilkan stok yang tersedia di Gudang Rustik.
              </p>
            </div>
          </div>

          <div class="form-group-modern">
            <label class="form-label-modern">
              Production Order <span class="required-star">*</span>
            </label>
            <div class="select-wrapper-modern">
              <span class="select-icon">📄</span>
              <select v-model="selectedPoId" class="form-select-modern" @change="onPoChange">
                <option value="">-- Pilih PO --</option>
                <option v-for="po in poList" :key="po.id" :value="po.id">
                  {{ po.label }}
                </option>
              </select>
              <span class="select-arrow">▼</span>
            </div>
          </div>

          <!-- RINGKASAN KEBUTUHAN PO -->
          <div v-if="poTargets.length" class="po-hint-box-finishing">
            <div class="po-hint-header">
              <div class="po-hint-title-wrap">
                <span class="po-hint-icon">📌</span>
                <div>
                  <div class="po-hint-title">Ringkasan Kebutuhan PO</div>
                  <div class="po-hint-sub">
                    {{ poInfo.buyer_name || 'Tanpa buyer' }} •
                    {{ poInfo.so_number || 'Tanpa SO' }}
                  </div>
                </div>
              </div>
              <div class="po-hint-badge">{{ poTargets.length }} item</div>
            </div>

            <div class="po-hint-list-wrapper">
              <table class="po-hint-table">
                <thead>
                  <tr>
                    <th>ITEM</th>
                    <th class="col-qty">QTY</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="target in poTargets" :key="target.item_id">
                    <td class="cell-name">
                      {{
                        target.item_name || target.name || target.code || 'Item #' + target.item_id
                      }}
                    </td>
                    <td class="cell-qty">{{ parseInt(target.qty_planned) }} unit</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- SECTION 2: STOK & PROSES FINISHING -->
        <div v-if="selectedPoId && stocks.length > 0" class="form-section-modern">
          <div class="section-header section-header-stock">
            <div class="section-icon-badge finishing-stock-badge">
              <span class="section-icon">📦</span>
            </div>
            <div class="section-title-group">
              <h3 class="section-title">Stok di Gudang Rustik</h3>
              <p class="section-subtitle">Barang yang siap untuk proses finishing cat.</p>
            </div>
          </div>

          <div class="stock-table-wrapper">
            <table class="stock-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th class="col-center">Target PO</th>
                  <th class="col-center">Sudah Produksi</th>
                  <th class="col-center">Stok di Rustik</th>
                  <th class="col-center">Selesai Finishing</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="stock in stocks" :key="stock.detail_id">
                  <td class="cell-product">
                    <span class="product-dot"></span>
                    {{ stock.item_name }}
                  </td>
                  <td class="cell-center">{{ formatNumber(stock.qty_planned) }}</td>
                  <td class="cell-center">{{ formatNumber(stock.qty_produced) }}</td>
                  <td class="cell-center cell-stock-highlight">
                    <span class="stock-badge">{{ formatNumber(stock.stock_available) }} Pcs</span>
                  </td>
                  <td class="cell-center">
                    <input
                      v-model.number="stock.qty_finished"
                      type="number"
                      min="0"
                      :max="stock.stock_available"
                      class="qty-finishing-input"
                      placeholder="0"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- EMPTY STATE -->
        <div v-else-if="selectedPoId && stocks.length === 0" class="empty-state-card">
          <div class="empty-icon">⚠️</div>
          <div class="empty-title">Tidak Ada Stok</div>
          <div class="empty-message">
            Tidak ada stok di Gudang Rustik untuk PO ini. Pastikan proses Rustik sudah dilakukan
            terlebih dahulu.
          </div>
        </div>

        <!-- SECTION 3: RINGKASAN & AKSI -->
        <div
          v-if="selectedPoId && stocks.length > 0"
          class="form-section-modern finishing-footer-section"
        >
          <div class="finishing-summary-card">
            <div class="summary-header">
              <span class="summary-icon">📊</span>
              <div>
                <div class="summary-title">Ringkasan Finishing</div>
                <div class="summary-subtitle">
                  Total {{ totalItemsToProcess }} item siap untuk proses finishing cat
                </div>
              </div>
            </div>
            <div class="summary-grid">
              <div class="summary-block">
                <p class="summary-label">Total Item</p>
                <p class="summary-value">{{ stocks.length }}</p>
              </div>
              <div class="summary-block">
                <p class="summary-label">Akan Diproses</p>
                <p class="summary-value">{{ totalItemsToProcess }}</p>
              </div>
              <div class="summary-block">
                <p class="summary-label">Total Qty Finishing</p>
                <p class="summary-value">{{ totalQtyFinishing }}</p>
              </div>
              <div class="summary-block">
                <p class="summary-label">Status</p>
                <p
                  class="summary-value"
                  :class="{ 'text-green-600': canSubmit, 'text-gray-400': !canSubmit }"
                >
                  {{ canSubmit ? 'Siap Simpan' : 'Belum Ada Input' }}
                </p>
              </div>
            </div>
          </div>

          <div class="form-actions-modern finishing-actions">
            <button type="button" class="btn-action btn-cancel-modern" @click="resetForm">
              <span class="btn-icon">♻️</span>
              <span class="btn-text">Reset Form</span>
            </button>
            <button
              type="button"
              class="btn-action btn-submit-finishing"
              :disabled="!canSubmit || submitting"
              @click="handleSubmit"
            >
              <span class="btn-icon">
                <span v-if="submitting">⏳</span>
                <span v-else>💾</span>
              </span>
              <span class="btn-text">
                <span v-if="submitting">Menyimpan...</span>
                <span v-else>Simpan Hasil Finishing</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from '@/components/DashboardLayout.vue'
import apiClient from '@/api/axios'

export default {
  name: 'FinishingView',
  components: { DashboardLayout },

  data() {
    return {
      poList: [],
      selectedPoId: '',
      stocks: [],
      submitting: false,

      // Data ringkasan PO
      poTargets: [],
      poInfo: {
        buyer_name: null,
        so_number: null,
      },
    }
  },

  computed: {
    canSubmit() {
      return this.selectedPoId && this.stocks.some((s) => Number(s.qty_finished) > 0)
    },

    totalItemsToProcess() {
      return this.stocks.filter((s) => Number(s.qty_finished) > 0).length
    },

    totalQtyFinishing() {
      return this.stocks.reduce((sum, s) => sum + (Number(s.qty_finished) || 0), 0)
    },
  },

  mounted() {
    this.loadPoList()
  },

  methods: {
    formatNumber(value) {
      const num = Number(value ?? 0)
      if (Number.isNaN(num)) return value
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
      })
    },

    async loadPoList() {
      try {
        const res = await apiClient.get('/production-orders', {
          params: { status_not: 'completed' },
        })
        const rawData = res.data.data?.data || res.data.data || []

        this.poList = rawData.map((po) => ({
          ...po,
          label:
            po.label ||
            `${po.po_number} - ${po.sales_order?.buyer_name || ''} - ${po.sales_order?.so_number || ''}`,
        }))
      } catch (error) {
        console.error('Error loading PO:', error)
        alert('Gagal memuat daftar PO')
      }
    },

    async onPoChange() {
      // Reset
      this.stocks = []
      this.poTargets = []
      this.poInfo = { buyer_name: null, so_number: null }

      if (!this.selectedPoId) return

      // Load detail PO untuk ringkasan
      try {
        const res = await apiClient.get(`/production-orders/${this.selectedPoId}`)
        const poData = res.data.data || {}

        this.poInfo = {
          buyer_name: poData.sales_order?.buyer_name || null,
          so_number: poData.sales_order?.so_number || null,
        }

        if (poData.targets && poData.targets.length > 0) {
          this.poTargets = poData.targets
        } else if (poData.details && poData.details.length > 0) {
          this.poTargets = poData.details.map((d) => ({
            item_id: d.item_id,
            item_name: d.item?.name || 'Unknown',
            name: d.item?.name || 'Unknown',
            code: d.item?.code,
            qty_planned: d.qty_planned,
          }))
        }
      } catch (error) {
        console.error('Error loading PO details:', error)
      }

      // Load stok
      try {
        const res = await apiClient.get('/finishing/available-stock', {
          params: { production_order_id: this.selectedPoId },
        })

        this.stocks = (res.data.data || []).map((s) => ({
          ...s,
          qty_finished: 0,
        }))
      } catch (error) {
        console.error('Error loading stock:', error)
        alert('Gagal memuat stok: ' + (error.response?.data?.message || error.message))
      }
    },

    resetForm() {
      this.stocks.forEach((s) => {
        s.qty_finished = 0
      })
    },

    async handleSubmit() {
      if (!this.canSubmit) return

      const itemsToProcess = this.stocks.filter((s) => Number(s.qty_finished) > 0)

      if (itemsToProcess.length === 0) {
        alert('Masukkan jumlah yang sudah selesai proses finishing!')
        return
      }

      this.submitting = true

      try {
        for (const stock of itemsToProcess) {
          if (Number(stock.qty_finished) > stock.stock_available) {
            alert(`Stok ${stock.item_name} tidak cukup! (Tersedia: ${stock.stock_available})`)
            this.submitting = false
            return
          }

          await apiClient.post('/finishing/process', {
            production_order_detail_id: stock.detail_id,
            qty_finished: Number(stock.qty_finished),
          })
        }

        alert('✅ Proses Finishing berhasil! Barang sudah dipindahkan ke Gudang Finishing.')

        await this.onPoChange()
      } catch (error) {
        console.error('Error:', error)
        alert('❌ ' + (error.response?.data?.message || 'Gagal menyimpan'))
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>

<style scoped>
/* HEADER – tema pink/rose */
.page-header-finishing {
  background: linear-gradient(135deg, #e11d48 0%, #f43f5e 40%, #fb7185 100%);
  padding: 2rem 2.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(225, 29, 72, 0.35);
}

.header-content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-left-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.icon-badge-finishing {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.55);
}

.finishing-icon {
  font-size: 2.5rem;
}

.header-text-content {
  flex: 1;
}

.page-title-finishing {
  font-size: 2rem;
  font-weight: 800;
  color: #f9fafb;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.page-subtitle-finishing {
  color: rgba(241, 245, 249, 0.98);
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
  line-height: 1.5;
}

.header-right-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.process-flow-badge-finishing {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgba(15, 23, 42, 0.92);
  border-radius: 999px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.5);
}

.flow-icon {
  font-size: 1.1rem;
}

.flow-arrow {
  font-size: 0.9rem;
  color: #a5f3fc;
  font-weight: 700;
}

.flow-label-finishing {
  color: #fecdd3;
  font-size: 0.875rem;
  font-weight: 600;
}

/* CONTENT CARD */
.content-card-finishing {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  width: 100%;
}

.card-body-finishing {
  padding: 2.5rem;
};

/* FORM SECTIONS */
.form-section-modern {
  margin-bottom: 2.5rem;
  padding-bottom: 2.5rem;
  border-bottom: 3px solid #e5e7eb;
}

.form-section-modern:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.75rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
}

.section-header-finishing {
  background: linear-gradient(135deg, #ffe4e6, #fecdd3);
  border-left: 5px solid #e11d48;
}

.section-header-stock {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-left: 5px solid #3b82f6;
}

.section-icon-badge {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(225, 29, 72, 0.25);
  background: linear-gradient(135deg, #fecdd3, #fda4af);
}

.finishing-po-badge {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
}

.finishing-stock-badge {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.section-icon {
  font-size: 1.75rem;
}

.section-title-group {
  flex: 1;
}

.section-title {
  font-size: 1.375rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.section-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* FORM ELEMENTS */
.form-group-modern {
  margin-bottom: 0;
}

.form-label-modern {
  display: block;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.75rem;
}

.required-star {
  color: #ef4444;
  margin-left: 0.15rem;
}

.select-wrapper-modern {
  position: relative;
  display: flex;
  align-items: center;
}

.select-icon {
  position: absolute;
  left: 1.125rem;
  font-size: 1.125rem;
  pointer-events: none;
  z-index: 1;
}

.form-select-modern {
  width: 100%;
  padding: 0.9rem 3.25rem 0.9rem 3.25rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  background: white;
  color: #111827;
  appearance: none;
  cursor: pointer;
}

.form-select-modern:focus {
  outline: none;
  border-color: #e11d48;
  box-shadow: 0 0 0 4px rgba(225, 29, 72, 0.15);
  transform: translateY(-1px);
}

.select-arrow {
  position: absolute;
  right: 1.125rem;
  font-size: 0.75rem;
  color: #6b7280;
  pointer-events: none;
}

/* PO HINT BOX */
.po-hint-box-finishing {
  margin-top: 1rem;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #fff1f2, #ffe4e6);
  padding: 1.25rem 1.5rem;
  box-shadow: 0 4px 12px rgba(225, 29, 72, 0.12);
}

.po-hint-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.po-hint-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.po-hint-icon {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: rgba(225, 29, 72, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.po-hint-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #881337;
}

.po-hint-sub {
  font-size: 0.8rem;
  color: #e11d48;
}

.po-hint-badge {
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  background: #fecdd3;
  color: #881337;
}

.po-hint-list-wrapper {
  max-height: 180px;
  overflow-y: auto;
  margin-top: 0.25rem;
  border-radius: 12px;
  border: 1px solid #fecdd3;
  background: white;
}

.po-hint-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.po-hint-table thead {
  position: sticky;
  top: 0;
  background: #fff1f2;
  z-index: 1;
}

.po-hint-table th,
.po-hint-table td {
  padding: 0.45rem 0.75rem;
}

.po-hint-table th {
  text-align: left;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6b7280;
  border-bottom: 1px solid #fecdd3;
}

.po-hint-table .col-qty {
  width: 100px;
  text-align: right;
}

.po-hint-table .cell-name {
  color: #374151;
  font-weight: 500;
}

.po-hint-table .cell-qty {
  text-align: right;
  color: #e11d48;
  font-weight: 700;
}

.po-hint-table tbody tr:nth-child(even) {
  background: #fafafa;
}

/* STOCK TABLE */
.stock-table-wrapper {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin-bottom: 1rem;
}

.stock-table {
  width: 100%;
  border-collapse: collapse;
}

.stock-table thead {
  background: #f9fafb;
}

.stock-table th {
  padding: 0.85rem 1rem;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e5e7eb;
}

.stock-table .col-center {
  text-align: center;
}

.stock-table td {
  padding: 0.95rem 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.stock-table tbody tr:hover {
  background: #fafafa;
}

.cell-product {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #111827;
}

.product-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #e11d48;
}

.cell-center {
  text-align: center;
  color: #6b7280;
  font-weight: 500;
}

.cell-stock-highlight {
  font-weight: 700;
}

.stock-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 700;
}

.qty-finishing-input {
  width: 120px;
  padding: 0.5rem 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  transition: all 0.2s;
}

.qty-finishing-input:focus {
  outline: none;
  border-color: #e11d48;
  box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.1);
}

/* EMPTY STATE */
.empty-state-card {
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #fef9c3, #fef08a);
  border-radius: 16px;
  border: 1px solid #fde047;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #713f12;
  margin-bottom: 0.5rem;
}

.empty-message {
  font-size: 0.95rem;
  color: #854d0e;
  line-height: 1.5;
}

/* SUMMARY */
.finishing-footer-section {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

.finishing-summary-card {
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #fff1f2, #ffe4e6);
  padding: 1.1rem 1.25rem 1.25rem;
  margin-bottom: 1.5rem;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.6rem;
}

.summary-icon {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #e11d48;
  color: #ffe4e6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-title {
  font-size: 0.98rem;
  font-weight: 700;
  color: #881337;
}

.summary-subtitle {
  font-size: 0.8rem;
  color: #e11d48;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;
}

.summary-block {
  border-radius: 12px;
  background: #ffffff;
  padding: 0.6rem 0.7rem;
  border: 1px solid #e5e7eb;
}

.summary-label {
  margin: 0 0 0.2rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.summary-value {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
}

/* BUTTONS */
.form-actions-modern.finishing-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1.25rem;
  margin-top: 1.75rem;
  padding-top: 1.75rem;
  border-top: 3px solid #e5e7eb;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2.1rem;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  font-size: 1.15rem;
}

.btn-cancel-modern {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #374151;
  border: 2.5px solid #d1d5db;
}

.btn-cancel-modern:hover {
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn-submit-finishing {
  background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%);
  color: white;
}

.btn-submit-finishing:disabled {
  background: #9ca3af;
  box-shadow: none;
  cursor: not-allowed;
}

.btn-submit-finishing:not(:disabled):hover {
  background: linear-gradient(135deg, #be123c 0%, #e11d48 100%);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(225, 29, 72, 0.4);
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .page-header-finishing {
    padding: 1.5rem;
  }

  .header-content-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-body-finishing {
    padding: 1.5rem;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .header-right-section {
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
