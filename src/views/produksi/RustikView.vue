✅ RUSTIK VUE - UPDATED (FULL CODE): text
<template>
  <DashboardLayout>
    <!-- ========================================
         PAGE HEADER - RUSTIK THEME
         ======================================== -->
    <div class="page-header-rustik">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-rustik">
            <span class="rustik-icon">🪵</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-rustik">Proses Rustik</h1>
            <p class="page-subtitle-rustik">
              Proses finishing rustik barang jadi dari Gudang Sanding/Assembling ke Gudang Rustik
              dengan tracking qty yang akurat.
            </p>
          </div>
        </div>
        <div class="header-right-section">
          <div class="process-flow-badge-rustik">
            <span class="flow-icon">✨</span>
            <span class="flow-arrow">→</span>
            <span class="flow-icon">🪵</span>
            <span class="flow-arrow">→</span>
            <span class="flow-icon">🎨</span>
          </div>
          <div class="flow-label-rustik">Sanding → Rustik → Finishing</div>
        </div>
      </div>
    </div>

    <!-- ========================================
         FORM CARD
         ======================================== -->
    <div class="content-card-rustik">
      <div class="card-body-rustik">
        <!-- SECTION 1: PILIH PO -->
        <div class="form-section-modern">
          <div class="section-header section-header-rustik">
            <div class="section-icon-badge rustik-po-badge">
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
          <div v-if="poTargets.length" class="po-hint-box-rustik">
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

        <!-- SECTION 2: STOK & PROSES RUSTIK -->
        <div v-if="selectedPoId && stocks.length > 0" class="form-section-modern">
          <div class="section-header section-header-stock">
            <div class="section-icon-badge rustik-stock-badge">
              <span class="section-icon">📦</span>
            </div>
            <div class="section-title-group">
              <h3 class="section-title">Stok Tersedia (Semua Gudang)</h3>
              <p class="section-subtitle">
                Sistem akan otomatis mengambil dari gudang yang tersedia.
              </p>
            </div>
          </div>

          <!-- ✅ NEW: INFO STOK PER GUDANG -->
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
                  <th class="col-center">Selesai Rustik</th>
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
                      v-model.number="stock.qty_rustik"
                      type="number"
                      min="0"
                      :max="stock.total_stock_available"
                      class="qty-rustik-input"
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
          class="form-section-modern rustik-footer-section"
        >
          <div class="rustik-summary-card">
            <div class="summary-header">
              <span class="summary-icon">📊</span>
              <div>
                <div class="summary-title">Ringkasan Rustik</div>
                <div class="summary-subtitle">
                  Total {{ totalItemsToProcess }} item siap untuk proses rustik
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
                <p class="summary-label">Total Qty Rustik</p>
                <p class="summary-value">{{ totalQtyRustik }}</p>
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

          <div class="form-actions-modern rustik-actions">
            <button type="button" class="btn-action btn-cancel-modern" @click="resetForm">
              <span class="btn-icon">♻️</span>
              <span class="btn-text">Reset Form</span>
            </button>
            <button
              type="button"
              class="btn-action btn-submit-rustik"
              :disabled="!canSubmit || submitting"
              @click="handleSubmit"
            >
              <span class="btn-icon">
                <span v-if="submitting">⏳</span>
                <span v-else>💾</span>
              </span>
              <span class="btn-text">
                <span v-if="submitting">Menyimpan...</span>
                <span v-else>Simpan Hasil Rustik</span>
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
  name: 'RustikView',
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
      return this.selectedPoId && this.stocks.some((s) => Number(s.qty_rustik) > 0)
    },

    totalItemsToProcess() {
      return this.stocks.filter((s) => Number(s.qty_rustik) > 0).length
    },

    totalQtyRustik() {
      return this.stocks.reduce((sum, s) => sum + (Number(s.qty_rustik) || 0), 0)
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

      // ✅ Load stok (tanpa parameter source_warehouse_code)
      await this.loadStock()
    },

    // ✅ NEW: Load stock method terpisah
    async loadStock() {
      try {
        const res = await apiClient.get('/rustik/available-stock', {
          params: { production_order_id: this.selectedPoId },
        })

        this.stocks = (res.data.data || []).map((s) => ({
          ...s,
          qty_rustik: 0,
        }))

        console.log('✅ Loaded Stock:', this.stocks)
      } catch (error) {
        console.error('Error loading stock:', error)
        alert('Gagal memuat stok: ' + (error.response?.data?.message || error.message))
      }
    },

    resetForm() {
      this.stocks.forEach((s) => {
        s.qty_rustik = 0
      })
    },

    async handleSubmit() {
      if (!this.canSubmit) return

      const itemsToProcess = this.stocks.filter((s) => Number(s.qty_rustik) > 0)

      if (itemsToProcess.length === 0) {
        alert('Masukkan jumlah yang sudah selesai proses rustik!')
        return
      }

      this.submitting = true

      try {
        for (const stock of itemsToProcess) {
          if (Number(stock.qty_rustik) > stock.total_stock_available) {
            alert(`Stok ${stock.item_name} tidak cukup! (Tersedia: ${stock.total_stock_available})`)
            this.submitting = false
            return
          }

          // ✅ UPDATED: Tidak kirim source_warehouse_id
          await apiClient.post('/rustik/process', {
            production_order_detail_id: stock.detail_id,
            qty_rustik: Number(stock.qty_rustik),
          })
        }

        alert('✅ Proses Rustik berhasil! Barang sudah dipindahkan ke Gudang Rustik.')

        await this.loadStock() // ✅ Reload stock
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
/* HEADER – tema brown/coklat */
.page-header-rustik {
  background: linear-gradient(135deg, #92400e 0%, #b45309 40%, #d97706 100%);
  padding: 2rem 2.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(146, 64, 14, 0.35);
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

.icon-badge-rustik {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.55);
}

.rustik-icon {
  font-size: 2.5rem;
}

.header-text-content {
  flex: 1;
}

.page-title-rustik {
  font-size: 2rem;
  font-weight: 800;
  color: #f9fafb;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.page-subtitle-rustik {
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

.process-flow-badge-rustik {
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

.flow-label-rustik {
  color: #fde68a;
  font-size: 0.875rem;
  font-weight: 600;
}

/* CONTENT CARD */
.content-card-rustik {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  width: 100%;
}

.card-body-rustik {
  padding: 2.5rem;
}

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

.section-header-rustik {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-left: 5px solid #92400e;
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
  box-shadow: 0 4px 12px rgba(146, 64, 14, 0.25);
  background: linear-gradient(135deg, #fde68a, #fcd34d);
}

.rustik-po-badge {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
}

.rustik-stock-badge {
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
  border-color: #92400e;
  box-shadow: 0 0 0 4px rgba(146, 64, 14, 0.15);
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
.po-hint-box-rustik {
  margin-top: 1rem;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #fefce8, #fef9c3);
  padding: 1.25rem 1.5rem;
  box-shadow: 0 4px 12px rgba(146, 64, 14, 0.12);
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
  background: rgba(146, 64, 14, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.po-hint-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #78350f;
}

.po-hint-sub {
  font-size: 0.8rem;
  color: #92400e;
}

.po-hint-badge {
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  background: #fde68a;
  color: #78350f;
}

.po-hint-list-wrapper {
  max-height: 180px;
  overflow-y: auto;
  margin-top: 0.25rem;
  border-radius: 12px;
  border: 1px solid #fde68a;
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
  background: #fefce8;
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
  border-bottom: 1px solid #fde68a;
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
  color: #92400e;
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
  background: #92400e;
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

.qty-rustik-input {
  width: 120px;
  padding: 0.5rem 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  transition: all 0.2s;
}

.qty-rustik-input:focus {
  outline: none;
  border-color: #92400e;
  box-shadow: 0 0 0 3px rgba(146, 64, 14, 0.1);
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
.rustik-footer-section {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

.rustik-summary-card {
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #fefce8, #fef9c3);
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
  background: #92400e;
  color: #fef9c3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-title {
  font-size: 0.98rem;
  font-weight: 700;
  color: #78350f;
}

.summary-subtitle {
  font-size: 0.8rem;
  color: #92400e;
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
.form-actions-modern.rustik-actions {
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

.btn-submit-rustik {
  background: linear-gradient(135deg, #92400e 0%, #b45309 100%);
  color: white;
}

.btn-submit-rustik:disabled {
  background: #9ca3af;
  box-shadow: none;
  cursor: not-allowed;
}

.btn-submit-rustik:not(:disabled):hover {
  background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(146, 64, 14, 0.4);
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .page-header-rustik {
    padding: 1.5rem;
  }

  .header-content-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-body-rustik {
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
