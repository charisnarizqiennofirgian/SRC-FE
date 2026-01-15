<template>
  <DashboardLayout>
    <!-- PAGE HEADER -->
    <div class="page-header-packing">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-packing">
            <span class="packing-icon">📦</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-packing">Proses Packing (Barang Jadi)</h1>
            <p class="page-subtitle-packing">
              Proses packing barang jadi dari Gudang Finishing/Rustik/Sanding/Assembling ke Gudang
              Barang Jadi dengan tracking qty yang akurat.
            </p>
          </div>
        </div>
        <div class="header-right-section">
          <div class="process-flow-badge-packing">
            <span class="flow-icon">🎨</span>
            <span class="flow-arrow">→</span>
            <span class="flow-icon">📦</span>
            <span class="flow-arrow">→</span>
            <span class="flow-icon">✅</span>
          </div>
          <div class="flow-label-packing">Finishing → Packing → Ready</div>
        </div>
      </div>
    </div>

    <!-- FORM CARD -->
    <div class="content-card-packing">
      <div class="card-body-packing">
        <!-- SECTION 1: PILIH PO -->
        <div class="form-section-modern">
          <div class="section-header section-header-packing">
            <div class="section-icon-badge packing-po-badge">
              <span class="section-icon">📄</span>
            </div>
            <div class="section-title-group">
              <h3 class="section-title">Pilih Production Order</h3>
              <p class="section-subtitle">
                PO akan menampilkan stok yang tersedia di semua gudang.
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
          <div v-if="poTargets.length" class="po-hint-box-packing">
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
                    <td class="col-qty">{{ parseInt(target.qty_planned) }} unit</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- SECTION 2: STOK & PROSES PACKING -->
        <div v-if="selectedPoId && stocks.length > 0" class="form-section-modern">
          <div class="section-header section-header-stock">
            <div class="section-icon-badge packing-stock-badge">
              <span class="section-icon">📦</span>
            </div>
            <div class="section-title-group">
              <h3 class="section-title">Stok Tersedia (Semua Gudang)</h3>
              <p class="section-subtitle">
                Sistem akan otomatis mengambil dari gudang yang tersedia.
              </p>
            </div>
          </div>

          <!-- INFO STOK PER GUDANG -->
          <div v-if="stocks.length > 0 && stocks[0].source_details" class="stock-info-card">
            <div class="stock-info-header">
              <span class="info-icon">📊</span>
              <span class="info-title">Rincian Stok Per Gudang</span>
            </div>
            <div class="stock-info-grid">
              <div
                v-for="source in stocks[0].source_details"
                :key="source.warehouse_code"
                class="stock-info-item"
              >
                <div class="warehouse-name">{{ source.warehouse_name }}</div>
                <div
                  class="warehouse-stock"
                  :class="{ 'stock-zero': source.stock_available === 0 }"
                >
                  {{ formatNumber(source.stock_available) }} pcs
                </div>
              </div>
            </div>
            <div class="stock-info-total">
              <span>Total Stok:</span>
              <strong>{{ formatNumber(stocks[0].total_stock_available) }} pcs</strong>
            </div>
          </div>

          <div class="stock-table-wrapper">
            <table class="stock-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th class="col-center">Target PO</th>
                  <th class="col-center">Sudah Produksi</th>
                  <th class="col-center">Total Stok</th>
                  <th class="col-center">Selesai Packing</th>
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
                    <span class="stock-badge">
                      {{ formatNumber(stock.total_stock_available) }} Pcs
                    </span>
                  </td>
                  <td class="cell-center">
                    <input
                      v-model.number="stock.qty_packed"
                      type="number"
                      min="0"
                      :max="stock.total_stock_available"
                      class="qty-packing-input"
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
          <div class="empty-message">Tidak ada stok tersedia untuk PO ini.</div>
        </div>

        <!-- SECTION 3: RINGKASAN & AKSI -->
        <div
          v-if="selectedPoId && stocks.length > 0"
          class="form-section-modern packing-footer-section"
        >
          <div class="packing-summary-card">
            <div class="summary-header">
              <span class="summary-icon">📊</span>
              <div>
                <div class="summary-title">Ringkasan Packing</div>
                <div class="summary-subtitle">
                  Total {{ totalItemsToProcess }} item siap untuk proses packing
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
                <p class="summary-label">Total Qty Packing</p>
                <p class="summary-value">{{ totalQtyPacking }}</p>
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

          <div class="form-actions-modern packing-actions">
            <button type="button" class="btn-action btn-cancel-modern" @click="resetForm">
              <span class="btn-icon">♻️</span>
              <span class="btn-text">Reset Form</span>
            </button>
            <button
              type="button"
              class="btn-action btn-submit-packing"
              :disabled="!canSubmit || submitting"
              @click="handleSubmit"
            >
              <span class="btn-icon">
                <span v-if="submitting">⏳</span>
                <span v-else">💾</span>
              </span>
              <span class="btn-text">
                <span v-if="submitting">Menyimpan...</span>
                <span v-else>Simpan Hasil Packing</span>
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
  name: 'PackingView',
  components: { DashboardLayout },

  data() {
    return {
      poList: [],
      selectedPoId: '',
      stocks: [],
      submitting: false,

      poTargets: [],
      poInfo: {
        buyer_name: null,
        so_number: null,
      },
    }
  },

  computed: {
    canSubmit() {
      return this.selectedPoId && this.stocks.some((s) => Number(s.qty_packed) > 0)
    },

    totalItemsToProcess() {
      return this.stocks.filter((s) => Number(s.qty_packed) > 0).length
    },

    totalQtyPacking() {
      return this.stocks.reduce((sum, s) => sum + (Number(s.qty_packed) || 0), 0)
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
          label: po.label || `${po.po_number} - ${po.sales_order?.buyer_name || ''} - ${po.sales_order?.so_number || ''}`,
        }))
      } catch (error) {
        console.error('Error loading PO:', error)
        alert('Gagal memuat daftar PO')
      }
    },

    async onPoChange() {
      this.stocks = []
      this.poTargets = []
      this.poInfo = { buyer_name: null, so_number: null }

      if (!this.selectedPoId) return

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

      await this.loadStock()
    },

    async loadStock() {
      try {
        const res = await apiClient.get('/packing/available-stock', {
          params: { production_order_id: this.selectedPoId },
        })

        this.stocks = (res.data.data || []).map((s) => ({
          ...s,
          qty_packed: 0,
        }))

        console.log('✅ Loaded Stock:', this.stocks)
      } catch (error) {
        console.error('Error loading stock:', error)
        alert('Gagal memuat stok: ' + (error.response?.data?.message || error.message))
      }
    },

    resetForm() {
      this.stocks.forEach((s) => {
        s.qty_packed = 0
      })
    },

    async handleSubmit() {
      if (!this.canSubmit) return

      const itemsToProcess = this.stocks.filter((s) => Number(s.qty_packed) > 0)

      if (itemsToProcess.length === 0) {
        alert('Masukkan jumlah yang sudah selesai packing!')
        return
      }

      this.submitting = true

      try {
        for (const stock of itemsToProcess) {
          if (Number(stock.qty_packed) > stock.total_stock_available) {
            alert(`Stok ${stock.item_name} tidak cukup! (Tersedia: ${stock.total_stock_available})`)
            this.submitting = false
            return
          }

          await apiClient.post('/packing/process', {
            production_order_detail_id: stock.detail_id,
            qty_packed: Number(stock.qty_packed),
          })
        }

        alert('✅ Proses Packing berhasil! Barang sudah masuk ke Gudang Barang Jadi.')

        await this.loadStock()
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
/* ========== HEADER ========== */
.page-header-packing {
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%);
  padding: 2.5rem 3rem;
  border-radius: 24px;
  margin-bottom: 2.5rem;
  box-shadow: 0 12px 48px rgba(22, 163, 74, 0.35);
}

.header-content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2.5rem;
}

.header-left-section {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  flex: 1;
}

.icon-badge-packing {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.packing-icon {
  font-size: 2.75rem;
}

.header-text-content {
  flex: 1;
}

.page-title-packing {
  font-size: 2.25rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0 0 0.6rem 0;
  letter-spacing: -0.6px;
}

.page-subtitle-packing {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.05rem;
  margin: 0;
  font-weight: 500;
  line-height: 1.6;
}

.header-right-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.6rem;
}

.process-flow-badge-packing {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.9rem 1.75rem;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  border-radius: 999px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.flow-icon {
  font-size: 1.25rem;
}

.flow-arrow {
  font-size: 1rem;
  color: #d1fae5;
  font-weight: 800;
}

.flow-label-packing {
  color: #d1fae5;
  font-size: 0.9rem;
  font-weight: 700;
}

/* ========== CONTENT CARD ========== */
.content-card-packing {
  background: white;
  border-radius: 24px;
  box-shadow: 0 6px 24px rgba(15, 23, 42, 0.1);
  border: 1px solid #f3f4f6;
  overflow: hidden;
}

.card-body-packing {
  padding: 3rem;
}

/* ========== FORM SECTIONS ========== */
.form-section-modern {
  margin-bottom: 3rem;
  padding-bottom: 3rem;
  border-bottom: 2px solid #f3f4f6;
}

.form-section-modern:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem 1.75rem;
  border-radius: 18px;
}

.section-header-packing {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-left: 5px solid #16a34a;
}

.section-header-stock {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-left: 5px solid #3b82f6;
}

.section-icon-badge {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(22, 163, 74, 0.25);
  background: linear-gradient(135deg, #bbf7d0, #86efac);
}

.packing-po-badge {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  box-shadow: 0 4px 16px rgba(234, 179, 8, 0.3);
}

.packing-stock-badge {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.section-icon {
  font-size: 2rem;
}

.section-title-group {
  flex: 1;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 900;
  color: #111827;
  margin: 0 0 0.35rem 0;
}

.section-subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
}

/* ========== FORM INPUTS ========== */
.form-group-modern {
  margin-bottom: 0;
}

.form-label-modern {
  display: block;
  font-size: 1rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.85rem;
}

.required-star {
  color: #ef4444;
  margin-left: 0.2rem;
}

.select-wrapper-modern {
  position: relative;
  display: flex;
  align-items: center;
}

.select-icon {
  position: absolute;
  left: 1.25rem;
  font-size: 1.2rem;
  pointer-events: none;
  z-index: 1;
}

.form-select-modern {
  width: 100%;
  padding: 1rem 3.5rem 1rem 3.5rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 14px;
  font-size: 1.05rem;
  font-weight: 700;
  transition: all 0.25s ease;
  background: white;
  color: #111827;
  appearance: none;
  cursor: pointer;
}

.form-select-modern:focus {
  outline: none;
  border-color: #16a34a;
  box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.15);
  transform: translateY(-1px);
}

.select-arrow {
  position: absolute;
  right: 1.25rem;
  font-size: 0.8rem;
  color: #6b7280;
  pointer-events: none;
}

/* ========== PO HINT BOX ========== */
.po-hint-box-packing {
  margin-top: 1.25rem;
  border-radius: 18px;
  border: 1.5px solid #bbf7d0;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  padding: 1.5rem 1.75rem;
  box-shadow: 0 4px 16px rgba(22, 163, 74, 0.12);
}

.po-hint-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.po-hint-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.po-hint-icon {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: rgba(22, 163, 74, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.po-hint-title {
  font-weight: 800;
  font-size: 1rem;
  color: #14532d;
}

.po-hint-sub {
  font-size: 0.85rem;
  color: #16a34a;
  font-weight: 600;
}

.po-hint-badge {
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 800;
  background: #bbf7d0;
  color: #14532d;
}

.po-hint-list-wrapper {
  max-height: 200px;
  overflow-y: auto;
  margin-top: 0.5rem;
  border-radius: 14px;
  border: 1.5px solid #d1fae5;
  background: white;
}

.po-hint-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.po-hint-table thead {
  position: sticky;
  top: 0;
  background: #f0fdf4;
  z-index: 1;
}

.po-hint-table th,
.po-hint-table td {
  padding: 0.55rem 0.9rem;
}

.po-hint-table th {
  text-align: left;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  border-bottom: 1.5px solid #d1fae5;
  font-weight: 800;
}

.po-hint-table .col-qty {
  width: 110px;
  text-align: right;
}

.po-hint-table .cell-name {
  color: #374151;
  font-weight: 600;
}

.po-hint-table .cell-qty {
  text-align: right;
  color: #16a34a;
  font-weight: 800;
}

.po-hint-table tbody tr:nth-child(even) {
  background: #fafafa;
}

/* ========== STOCK INFO CARD ========== */
.stock-info-card {
  margin-bottom: 1.5rem;
  border-radius: 18px;
  border: 1.5px solid #dbeafe;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  padding: 1.5rem 1.75rem;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.12);
}

.stock-info-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.info-icon {
  font-size: 1.5rem;
}

.info-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #1e40af;
}

.stock-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.85rem;
  margin-bottom: 1rem;
}

.stock-info-item {
  background: white;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  border: 1.5px solid #e0e7ff;
}

.warehouse-name {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.35rem;
  font-weight: 600;
}

.warehouse-stock {
  font-size: 1.05rem;
  font-weight: 800;
  color: #1e40af;
}

.warehouse-stock.stock-zero {
  color: #9ca3af;
}

.stock-info-total {
  padding-top: 1rem;
  border-top: 1.5px solid #bfdbfe;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  color: #374151;
}

.stock-info-total strong {
  font-size: 1.1rem;
  font-weight: 900;
  color: #1e40af;
}

/* ========== STOCK TABLE ========== */
.stock-table-wrapper {
  border-radius: 14px;
  border: 1.5px solid #e5e7eb;
  overflow: hidden;
  margin-bottom: 1.25rem;
}

.stock-table {
  width: 100%;
  border-collapse: collapse;
}

.stock-table thead {
  background: #f9fafb;
}

.stock-table th {
  padding: 0.9rem 1.25rem;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 800;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 2px solid #e5e7eb;
}

.stock-table .col-center {
  text-align: center;
}

.stock-table td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
}

.stock-table tbody tr:hover {
  background: #fafafa;
}

.cell-product {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 700;
  color: #111827;
}

.product-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #16a34a;
}

.cell-center {
  text-align: center;
  color: #6b7280;
  font-weight: 600;
}

.cell-stock-highlight {
  font-weight: 800;
}

.stock-badge {
  display: inline-block;
  padding: 0.4rem 0.85rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 800;
}

.qty-packing-input {
  width: 130px;
  padding: 0.6rem 0.85rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  text-align: center;
  font-weight: 700;
  transition: all 0.2s;
}

.qty-packing-input:focus {
  outline: none;
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
}

/* ========== EMPTY STATE ========== */
.empty-state-card {
  text-align: center;
  padding: 3.5rem 2.5rem;
  background: linear-gradient(135deg, #fef9c3, #fef08a);
  border-radius: 18px;
  border: 1.5px solid #fde047;
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #713f12;
  margin-bottom: 0.6rem;
}

.empty-message {
  font-size: 1rem;
  color: #854d0e;
  line-height: 1.6;
  font-weight: 600;
}

/* ========== SUMMARY ========== */
.packing-footer-section {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

.packing-summary-card {
  border-radius: 18px;
  border: 1.5px solid #e5e7eb;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  padding: 1.5rem 1.75rem;
  margin-bottom: 2rem;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 0.9rem;
}

.summary-icon {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: #16a34a;
  color: #dcfce7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.summary-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #14532d;
}

.summary-subtitle {
  font-size: 0.85rem;
  color: #16a34a;
  font-weight: 600;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.summary-block {
  border-radius: 14px;
  background: #ffffff;
  padding: 0.75rem 0.9rem;
  border: 1.5px solid #d1fae5;
}

.summary-label {
  margin: 0 0 0.3rem;
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 700;
}

.summary-value {
  margin: 0;
  font-size: 1rem;
  font-weight: 900;
  color: #111827;
}

.text-green-600 {
  color: #16a34a;
}

.text-gray-400 {
  color: #9ca3af;
}

/* ========== BUTTONS ========== */
.form-actions-modern.packing-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1.5rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #f3f4f6;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  padding: 1.1rem 2.4rem;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  border: none;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.btn-icon {
  font-size: 1.25rem;
}

.btn-cancel-modern {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #374151;
  border: 2px solid #d1d5db;
}

.btn-cancel-modern:hover {
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.16);
}

.btn-submit-packing {
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  color: white;
}

.btn-submit-packing:disabled {
  background: #9ca3af;
  box-shadow: none;
  cursor: not-allowed;
}

.btn-submit-packing:not(:disabled):hover {
  background: linear-gradient(135deg, #15803d 0%, #16a34a 100%);
  transform: translateY(-3px);
  box-shadow: 0 10px 32px rgba(22, 163, 74, 0.4);
}

/* ========== RESPONSIVE ========== */
@media (max-width: 900px) {
  .page-header-packing {
    padding: 2rem;
  }

  .header-content-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-body-packing {
    padding: 2rem;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .header-right-section {
    align-items: flex-start;
  }

  .stock-info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
