<template>
  <DashboardLayout>
    <!-- PAGE HEADER -->
    <div class="page-header-assembling">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-assembling">
            <span class="assembling-icon">🔧</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-assembling">Proses Assembling</h1>
            <p class="page-subtitle-assembling">
              Rakit komponen menjadi barang jadi (Finish Good) untuk Production Order dengan
              tracking material yang akurat.
            </p>
          </div>
        </div>
        <div class="header-right-section">
          <div class="process-flow-badge-assembling">
            <span class="flow-icon">🔩</span>
            <span class="flow-arrow">→</span>
            <span class="flow-icon">🔧</span>
            <span class="flow-arrow">→</span>
            <span class="flow-icon">📦</span>
          </div>
          <div class="flow-label-assembling">Komponen → Assembling → FG</div>
        </div>
      </div>
    </div>

    <!-- FORM CARD -->
    <div class="content-card-assembling">
      <div class="card-body-assembling">
        <!-- SECTION 1: PILIH PO -->
        <div class="form-section-modern">
          <div class="section-header section-header-assembling">
            <div class="section-icon-badge assembling-po-badge">
              <span class="section-icon">📄</span>
            </div>
            <div class="section-title-group">
              <h3 class="section-title">Pilih Production Order</h3>
              <p class="section-subtitle">
                PO akan menampilkan target produksi dan kebutuhan komponen.
              </p>
            </div>
          </div>

          <div class="form-group-modern">
            <label class="form-label-modern">
              Production Order <span class="required-star">*</span>
            </label>
            <div class="select-wrapper-modern">
              <span class="select-icon">📄</span>
              <select v-model="selectedPOId" class="form-select-modern" @change="onPOChange">
                <option value="">-- Pilih PO --</option>
                <option v-for="po in availableOrders" :key="po.id" :value="po.id">
                  {{ po.label }}
                </option>
              </select>
              <span class="select-arrow">▼</span>
            </div>
          </div>

          <!-- RINGKASAN KEBUTUHAN PO -->
          <div v-if="poTargets.length" class="po-hint-box-assembling">
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

        <!-- SECTION 2: HASIL PRODUKSI (MULTIPLE PRODUCTS) -->
        <div v-if="poTargets.length > 0" class="form-section-modern">
          <div class="section-header section-header-output">
            <div class="section-icon-badge assembling-output-badge">
              <span class="section-icon">✅</span>
            </div>
            <div class="section-title-group">
              <h3 class="section-title">Hasil Produksi (Finish Good)</h3>
              <p class="section-subtitle">
                Tentukan jumlah barang jadi untuk setiap produk dalam PO ini.
              </p>
            </div>
          </div>

          <!-- Loop setiap produk di target PO -->
          <div class="products-list">
            <div v-for="(target, index) in poTargets" :key="target.item_id" class="product-card">
              <div class="product-card-header">
                <div class="product-info">
                  <span class="product-icon">📦</span>
                  <div>
                    <div class="product-name">{{ target.item_name || target.name }}</div>
                    <div class="product-stats">
                      Target: <strong>{{ formatNumber(target.qty_planned) }}</strong> • Sudah:
                      <strong>{{ formatNumber(target.qty_produced || 0) }}</strong> • Kurang:
                      <strong>{{
                        formatNumber(target.qty_planned - (target.qty_produced || 0))
                      }}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div class="product-card-body">
                <label class="form-label-modern">
                  Jumlah Barang Jadi <span class="required-star">*</span>
                </label>
                <div class="input-wrapper-icon slim">
                  <span class="input-icon">🔢</span>
                  <input
                    v-model.number="target.qty_to_produce"
                    type="number"
                    min="0"
                    :max="target.qty_planned - (target.qty_produced || 0)"
                    class="form-input-modern"
                    placeholder="0"
                    @input="onQtyToProduceChange(index)"
                  />
                  <span class="input-suffix">Pcs</span>
                </div>
                <p class="input-hint">
                  Maksimal {{ formatNumber(target.qty_planned - (target.qty_produced || 0)) }} pcs
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 3: PEMAKAIAN KOMPONEN (HYBRID) -->
        <div v-if="poTargets.length > 0" class="form-section-modern">
          <div class="section-header section-header-components">
            <div class="section-icon-badge assembling-comp-badge">
              <span class="section-icon">🔩</span>
            </div>
            <div class="section-title-group">
              <h3 class="section-title">Pemakaian Komponen</h3>
              <p class="section-subtitle">Komponen yang dipakai untuk semua produk dalam PO ini.</p>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loadingMaterials" class="loading-state">
            <span class="loading-icon">⏳</span>
            <span>Memuat data komponen...</span>
          </div>

          <!-- Tabel Komponen -->
          <div v-else class="components-table-wrapper">
            <table class="components-table">
              <thead>
                <tr>
                  <th>Nama Komponen</th>
                  <th class="col-stock">Stok Tersedia</th>
                  <th class="col-qty">Qty Dipakai</th>
                  <th class="col-action">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="form.used_components.length === 0">
                  <td colspan="4" class="empty-state">
                    <span class="empty-icon">📦</span>
                    <span
                      >Belum ada komponen. Gunakan dropdown/search di bawah untuk menambah.</span
                    >
                  </td>
                </tr>
                <tr v-for="(comp, index) in form.used_components" :key="index">
                  <td class="cell-name">
                    <span class="comp-dot"></span>
                    {{ comp.name }}
                  </td>
                  <td class="cell-stock">{{ formatNumber(comp.stock_available) }} Pcs</td>
                  <td class="cell-qty">
                    <input
                      v-model.number="comp.qty"
                      type="number"
                      min="0"
                      step="0.001"
                      class="qty-input"
                      placeholder="0"
                    />
                  </td>
                  <td class="cell-action">
                    <button @click="removeComponent(index)" class="btn-remove" type="button">
                      ✕
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- ✅ COMBO: DROPDOWN + SEARCH KOMPONEN -->
          <div class="search-block">
            <label class="form-label-modern">Tambah Komponen</label>

            <!-- DROPDOWN -->
            <div class="select-wrapper-modern" style="margin-bottom: 10px">
              <span class="select-icon">🔩</span>
              <select
                v-model="selectedKomponenId"
                class="form-select-modern"
                @change="addComponentFromDropdown"
              >
                <option value="">-- Pilih dari Dropdown --</option>
                <option v-for="komponen in allKomponen" :key="komponen.id" :value="komponen.id">
                  {{ komponen.name }} - Stok: {{ formatNumber(komponen.stock_qty) }} Pcs
                </option>
              </select>
              <span class="select-arrow">▼</span>
            </div>

            <!-- SEARCH BOX -->
            <div class="input-wrapper-icon">
              <span class="input-icon">🔍</span>
              <input
                v-model="searchKomponen"
                type="text"
                class="form-input-modern"
                placeholder="Atau ketik untuk search..."
                @input="onSearchKomponen"
              />
            </div>

            <!-- SEARCH RESULTS -->
            <div v-if="searchKomponenResults.length > 0" class="search-dropdown">
              <div
                v-for="komponen in searchKomponenResults"
                :key="komponen.id"
                class="search-item"
                @click="addComponent(komponen)"
              >
                <div class="search-item-main">
                  <span class="search-item-name">{{ komponen.name }}</span>
                  <span class="search-item-tag">{{ komponen.code || '-' }}</span>
                </div>
                <div class="search-item-sub">Stok: {{ formatNumber(komponen.stock_qty) }} Pcs</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ✅ SECTION 4: KOMPONEN REJECT/RUSAK -->
        <div v-if="poTargets.length > 0" class="form-section-modern">
          <div class="section-header section-header-reject">
            <div class="section-icon-badge assembling-reject-badge">
              <span class="section-icon">⚠️</span>
            </div>
            <div class="section-title-group">
              <h3 class="section-title">Komponen Rusak/Reject (Opsional)</h3>
              <p class="section-subtitle">Catat komponen yang gagal rakit untuk mengurangi stok.</p>
            </div>
          </div>

          <!-- Tabel Komponen Reject -->
          <div class="components-table-wrapper">
            <table class="components-table">
              <thead>
                <tr>
                  <th>Nama Komponen</th>
                  <th class="col-qty">Qty Rusak</th>
                  <th class="col-action">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="form.rejected_components.length === 0">
                  <td colspan="3" class="empty-state">
                    <span class="empty-icon">✅</span>
                    <span>Tidak ada komponen rusak.</span>
                  </td>
                </tr>
                <tr v-for="(reject, index) in form.rejected_components" :key="index">
                  <td class="cell-name">
                    <span class="comp-dot reject-dot"></span>
                    {{ reject.name }}
                  </td>
                  <td class="cell-qty">
                    <input
                      v-model.number="reject.qty"
                      type="number"
                      min="0"
                      step="0.001"
                      class="qty-input"
                      placeholder="0"
                    />
                  </td>
                  <td class="cell-action">
                    <button @click="removeReject(index)" class="btn-remove" type="button">✕</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Search Komponen Reject -->
          <div class="search-block">
            <label class="form-label-modern">Tambah Komponen Rusak</label>
            <div class="input-wrapper-icon">
              <span class="input-icon">🔍</span>
              <input
                v-model="searchReject"
                type="text"
                class="form-input-modern"
                placeholder="Ketik nama komponen..."
                @input="onSearchReject"
              />
            </div>

            <div v-if="searchRejectResults.length > 0" class="search-dropdown">
              <div
                v-for="komponen in searchRejectResults"
                :key="komponen.id"
                class="search-item"
                @click="addReject(komponen)"
              >
                <div class="search-item-main">
                  <span class="search-item-name">{{ komponen.name }}</span>
                  <span class="search-item-tag">{{ komponen.code || '-' }}</span>
                </div>
                <div class="search-item-sub">Stok: {{ formatNumber(komponen.stock_qty) }} Pcs</div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 5: RINGKASAN & AKSI -->
        <div v-if="poTargets.length > 0" class="form-section-modern assembling-footer-section">
          <div class="assembling-summary-card">
            <div class="summary-header">
              <span class="summary-icon">📊</span>
              <div>
                <div class="summary-title">Ringkasan Assembling</div>
                <div class="summary-subtitle">
                  {{ totalQtyToProduce }} pcs dari {{ productsWithQty }} produk
                </div>
              </div>
            </div>
            <div class="summary-grid">
              <div class="summary-block">
                <p class="summary-label">Total Barang Jadi</p>
                <p class="summary-value">{{ totalQtyToProduce }} Pcs</p>
              </div>
              <div class="summary-block">
                <p class="summary-label">Produk Dipilih</p>
                <p class="summary-value">{{ productsWithQty }} / {{ poTargets.length }}</p>
              </div>
              <div class="summary-block">
                <p class="summary-label">Komponen Dipakai</p>
                <p class="summary-value">{{ form.used_components.length }}</p>
              </div>
              <div class="summary-block">
                <p class="summary-label">Komponen Rusak</p>
                <p class="summary-value">{{ form.rejected_components.length }}</p>
              </div>
            </div>
          </div>

          <div class="form-actions-modern assembling-actions">
            <button type="button" class="btn-action btn-cancel-modern" @click="resetForm">
              <span class="btn-icon">♻️</span>
              <span class="btn-text">Reset Form</span>
            </button>
            <button
              type="button"
              class="btn-action btn-submit-assembling"
              :disabled="!canSubmit || submitting"
              @click="submitAssembling"
            >
              <span class="btn-icon">
                <span v-if="submitting">⏳</span>
                <span v-else>💾</span>
              </span>
              <span class="btn-text">
                <span v-if="submitting">Menyimpan...</span>
                <span v-else>Simpan Hasil Assembling</span>
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
import apiClient from '@/api/axios.js'

export default {
  name: 'AssemblingView',
  components: { DashboardLayout },

  data() {
    return {
      availableOrders: [],
      selectedPOId: null,
      loadingMaterials: false,
      submitting: false,

      form: {
        used_components: [],
        rejected_components: [],
      },

      // Dropdown + Search Komponen
      selectedKomponenId: '',
      searchKomponen: '',
      searchKomponenResults: [],
      allKomponen: [],

      // Search Reject
      searchReject: '',
      searchRejectResults: [],

      poTargets: [],
      poInfo: {
        buyer_name: null,
        so_number: null,
      },
      warehouses: [], // ✅ Added warehouses
    }
  },

  computed: {
    canSubmit() {
      return (
        this.poTargets.some((t) => (t.qty_to_produce || 0) > 0) &&
        this.form.used_components.length > 0 &&
        this.form.used_components.every((c) => c.qty > 0)
      )
    },

    totalQtyToProduce() {
      return this.poTargets.reduce((sum, t) => sum + (Number(t.qty_to_produce) || 0), 0)
    },

    productsWithQty() {
      return this.poTargets.filter((t) => (t.qty_to_produce || 0) > 0).length
    },
  },

  async mounted() {
    this.fetchAvailableOrders()
    await this.loadWarehouses() // ✅ Load warehouses first
    this.loadAllKomponen()
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

    async fetchAvailableOrders() {
      try {
        const response = await apiClient.get('/production-orders', {
          params: { status_not: 'completed' },
        })

        const rawData = response.data.data?.data || response.data.data || response.data || []

        this.availableOrders = rawData.map((po) => ({
          id: po.id,
          po_number: po.po_number,
          label: po.label || `${po.po_number} - ${po.buyer_name || ''} - ${po.so_number || ''}`,
          status: po.status,
          sales_order_id: po.sales_order_id,
          buyer_name: po.buyer_name,
          so_number: po.so_number,
          product_name: po.product_name,
        }))

        console.log('✅ Loaded PO Assembling:', this.availableOrders.length)
      } catch (error) {
        console.error('Error fetching orders:', error)
        alert('Gagal mengambil data PO')
      }
    },

    async loadWarehouses() {
      try {
        const res = await apiClient.get('/warehouses')
        this.warehouses = res.data.data || res.data || []
      } catch (error) {
        console.error('Error loading warehouses:', error)
      }
    },

    async loadAllKomponen() {
      // ✅ Filter by Gudang Mesin
      const mesinWh = this.warehouses.find((w) => w.name.toLowerCase().includes('mesin'))
      const warehouseId = mesinWh ? mesinWh.id : null

      if (!warehouseId) {
        console.warn('Gudang Mesin tidak ditemukan, menampilkan semua stok')
      }

      try {
        const res = await apiClient.get('/inventories', {
          params: {
            per_page: 9999,
            item_type: 'component',
            warehouse_id: warehouseId, // ✅ Filter by warehouse
          },
        })

        const inventories = res.data.data?.data || res.data.data || []

        const itemMap = {}
        inventories.forEach((inv) => {
          const itemId = inv.item_id
          if (!itemMap[itemId]) {
            itemMap[itemId] = {
              id: itemId,
              name: inv.item?.name || 'Unknown',
              code: inv.item?.code,
              stock_qty: 0,
            }
          }
          itemMap[itemId].stock_qty += Number(inv.qty || 0)
        })

        this.allKomponen = Object.values(itemMap)
        console.log('✅ Loaded Component:', this.allKomponen.length)
      } catch (error) {
        console.error('Error loading komponen:', error)
      }
    },

    async onPOChange() {
      this.form.used_components = []
      this.form.rejected_components = []
      this.poTargets = []
      this.poInfo = { buyer_name: null, so_number: null }

      if (!this.selectedPOId) return

      try {
        const res = await apiClient.get(`/production-orders/${this.selectedPOId}`)
        const poData = res.data.data || {}

        this.poInfo = {
          buyer_name: poData.sales_order?.buyer_name || null,
          so_number: poData.sales_order?.so_number || null,
        }

        if (poData.details && poData.details.length > 0) {
          this.poTargets = poData.details.map((d) => ({
            detail_id: d.id,
            item_id: d.item_id,
            item_name: d.item?.name || 'Unknown',
            name: d.item?.name || 'Unknown',
            code: d.item?.code,
            qty_planned: d.qty_planned,
            qty_produced: d.qty_produced || 0,
            qty_to_produce: 0,
          }))
        }
      } catch (error) {
        console.error('Error loading PO details:', error)
        alert('Gagal memuat detail PO')
      }
    },

    async onQtyToProduceChange(index) {
      const target = this.poTargets[index]

      // ✅ AUTO-HITUNG TOTAL KEBUTUHAN KOMPONEN DARI SEMUA PRODUK
      if (target.qty_to_produce >= 0) {
        await this.recalculateComponents()
      }
    },

    // ✅ METHOD BARU: HITUNG TOTAL KEBUTUHAN KOMPONEN
    async recalculateComponents() {
      this.loadingMaterials = true
      const componentMap = {}

      try {
        // Loop semua produk yang qty_to_produce > 0
        for (const target of this.poTargets) {
          if (target.qty_to_produce <= 0) continue

          const response = await apiClient.post('/assembling/check-material', {
            detail_id: target.detail_id,
          })

          const bomData = response.data.components || []

          // Akumulasi kebutuhan komponen
          bomData.forEach((bom) => {
            const qtyNeeded = bom.qty_needed_per_unit * target.qty_to_produce

            if (!componentMap[bom.component_id]) {
              componentMap[bom.component_id] = {
                id: bom.component_id,
                name: bom.component_name,
                stock_available: bom.stock_available,
                qty: 0,
              }
            }

            componentMap[bom.component_id].qty += qtyNeeded
          })
        }

        // Update form.used_components dengan hasil akumulasi
        this.form.used_components = Object.values(componentMap)
      } catch (error) {
        console.error('Error recalculating components:', error)
      } finally {
        this.loadingMaterials = false
      }
    },

    // ✅ DROPDOWN KOMPONEN
    addComponentFromDropdown() {
      if (!this.selectedKomponenId) return

      const komponen = this.allKomponen.find((k) => k.id === this.selectedKomponenId)
      if (komponen) {
        this.addComponent(komponen)
        this.selectedKomponenId = ''
      }
    },

    // ✅ SEARCH KOMPONEN
    onSearchKomponen() {
      if (!this.searchKomponen || this.searchKomponen.length < 2) {
        this.searchKomponenResults = []
        return
      }

      const search = this.searchKomponen.toLowerCase()
      this.searchKomponenResults = this.allKomponen
        .filter((k) => k.name.toLowerCase().includes(search))
        .slice(0, 10)
    },

    addComponent(komponen) {
      const exists = this.form.used_components.find((c) => c.id === komponen.id)
      if (exists) {
        alert('Komponen ini sudah ditambahkan!')
        return
      }

      this.form.used_components.push({
        id: komponen.id,
        name: komponen.name,
        stock_available: komponen.stock_qty,
        qty: 0,
      })

      this.searchKomponen = ''
      this.searchKomponenResults = []
    },

    removeComponent(index) {
      this.form.used_components.splice(index, 1)
    },

    // ✅ SEARCH REJECT
    onSearchReject() {
      if (!this.searchReject || this.searchReject.length < 2) {
        this.searchRejectResults = []
        return
      }

      const search = this.searchReject.toLowerCase()
      this.searchRejectResults = this.allKomponen
        .filter((k) => k.name.toLowerCase().includes(search))
        .slice(0, 10)
    },

    addReject(komponen) {
      const exists = this.form.rejected_components.find((c) => c.id === komponen.id)
      if (exists) {
        alert('Komponen ini sudah ditambahkan ke reject!')
        return
      }

      this.form.rejected_components.push({
        id: komponen.id,
        name: komponen.name,
        qty: 0,
      })

      this.searchReject = ''
      this.searchRejectResults = []
    },

    removeReject(index) {
      this.form.rejected_components.splice(index, 1)
    },

    async submitAssembling() {
      const productsToAssemble = this.poTargets
        .filter((t) => (t.qty_to_produce || 0) > 0)
        .map((t) => ({
          detail_id: t.detail_id,
          qty_good: t.qty_to_produce,
        }))

      if (productsToAssemble.length === 0) {
        alert('Belum ada produk yang diisi qty-nya!')
        return
      }

      // ✅ Validasi komponen
      if (this.form.used_components.length === 0) {
        alert('Belum ada komponen yang dipilih!')
        return
      }

      for (const comp of this.form.used_components) {
        if (comp.qty <= 0) {
          alert(`Qty komponen ${comp.name} harus lebih dari 0!`)
          return
        }
        if (comp.qty > comp.stock_available) {
          alert(`Stok ${comp.name} tidak cukup! (Tersedia: ${comp.stock_available})`)
          return
        }
      }

      const payload = {
        production_order_id: this.selectedPOId,
        products: productsToAssemble,
        used_components: this.form.used_components.map((c) => ({
          item_id: c.id,
          qty: Number(c.qty),
        })),
        rejected_components: this.form.rejected_components
          .filter((r) => r.qty > 0)
          .map((r) => ({
            item_id: r.id,
            qty: Number(r.qty),
          })),
      }

      this.submitting = true
      try {
        const response = await apiClient.post('/assembling/store', payload)
        alert('✅ ' + (response.data.message || 'Berhasil menyimpan!'))
        this.resetForm()
        this.fetchAvailableOrders()
      } catch (error) {
        console.error('Error:', error)
        alert('❌ Gagal menyimpan: ' + (error.response?.data?.error || 'Unknown error'))
      } finally {
        this.submitting = false
      }
    },

    resetForm() {
      this.selectedPOId = null
      this.form.used_components = []
      this.form.rejected_components = []
      this.poTargets = []
      this.poInfo = { buyer_name: null, so_number: null }
    },
  },
}
</script>

<style scoped>
/* ========== HEADER ========== */
.page-header-assembling {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #7c3aed 100%);
  padding: 2.5rem 3rem;
  border-radius: 24px;
  margin-bottom: 2.5rem;
  box-shadow: 0 12px 48px rgba(139, 92, 246, 0.3);
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

.icon-badge-assembling {
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

.assembling-icon {
  font-size: 2.75rem;
}

.header-text-content {
  flex: 1;
}

.page-title-assembling {
  font-size: 2.25rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0 0 0.6rem 0;
  letter-spacing: -0.6px;
}

.page-subtitle-assembling {
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

.process-flow-badge-assembling {
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
  color: #ddd6fe;
  font-weight: 800;
}

.flow-label-assembling {
  color: #f3e8ff;
  font-size: 0.9rem;
  font-weight: 700;
}

/* ========== CONTENT CARD ========== */
.content-card-assembling {
  background: white;
  border-radius: 24px;
  box-shadow: 0 6px 24px rgba(15, 23, 42, 0.1);
  border: 1px solid #f3f4f6;
  overflow: hidden;
}

.card-body-assembling {
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

.section-header-assembling {
  background: linear-gradient(135deg, #faf5ff, #f3e8ff);
  border-left: 5px solid #8b5cf6;
}

.section-header-output {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-left: 5px solid #22c55e;
}

.section-header-components {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-left: 5px solid #3b82f6;
}

.section-icon-badge {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.25);
  background: linear-gradient(135deg, #e9d5ff, #d8b4fe);
}

.assembling-po-badge {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  box-shadow: 0 4px 16px rgba(234, 179, 8, 0.3);
}

.assembling-output-badge {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
}

.assembling-comp-badge {
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

.input-wrapper-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper-icon.slim {
  max-width: 320px;
}

.input-icon {
  position: absolute;
  left: 1.25rem;
  font-size: 1.2rem;
  pointer-events: none;
  z-index: 1;
}

.input-suffix {
  position: absolute;
  right: 1.25rem;
  font-size: 0.9rem;
  font-weight: 800;
  color: #6b7280;
  pointer-events: none;
}

.form-input-modern {
  width: 100%;
  padding: 1rem 4rem 1rem 3.5rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 14px;
  font-size: 1.05rem;
  font-weight: 600;
  transition: all 0.25s ease;
  background: white;
  color: #111827;
}

.form-input-modern::placeholder {
  color: #9ca3af;
}

.form-input-modern:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15);
  transform: translateY(-1px);
}

.input-hint {
  margin: 0.6rem 0 0;
  font-size: 0.85rem;
  color: #6b7280;
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
  border-color: #8b5cf6;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15);
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
.po-hint-box-assembling {
  margin-top: 1.25rem;
  border-radius: 18px;
  border: 1.5px solid #e9d5ff;
  background: linear-gradient(135deg, #faf5ff, #f5f3ff);
  padding: 1.5rem 1.75rem;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.12);
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
  background: rgba(139, 92, 246, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.po-hint-title {
  font-weight: 800;
  font-size: 1rem;
  color: #6b21a8;
}

.po-hint-sub {
  font-size: 0.85rem;
  color: #8b5cf6;
  font-weight: 600;
}

.po-hint-badge {
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 800;
  background: #e9d5ff;
  color: #6b21a8;
}

.po-hint-list-wrapper {
  max-height: 200px;
  overflow-y: auto;
  margin-top: 0.5rem;
  border-radius: 14px;
  border: 1.5px solid #f3e8ff;
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
  background: #faf5ff;
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
  border-bottom: 1.5px solid #f3e8ff;
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
  color: #8b5cf6;
  font-weight: 800;
}

.po-hint-table tbody tr:nth-child(even) {
  background: #fafafa;
}

/* ========== PRODUCTS LIST ========== */
.products-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.product-card {
  border-radius: 16px;
  border: 2px solid #e5e7eb;
  background: linear-gradient(135deg, #fafafa, #ffffff);
  padding: 1.5rem 1.75rem;
  transition: all 0.25s ease;
}

.product-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.product-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.product-icon {
  font-size: 1.5rem;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.3rem;
}

.product-stats {
  font-size: 0.85rem;
  color: #6b7280;
}

.product-stats strong {
  font-weight: 800;
  color: #111827;
}

.btn-select-product {
  padding: 0.6rem 1.4rem;
  border-radius: 999px;
  border: 2px solid #e5e7eb;
  background: white;
  font-size: 0.9rem;
  font-weight: 800;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-select-product:hover {
  border-color: #8b5cf6;
  color: #8b5cf6;
}

.btn-select-product.active {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
  border-color: #8b5cf6;
  color: white;
}

.product-card-body {
  padding-top: 1.25rem;
  border-top: 1.5px solid #f3f4f6;
}

/* ========== LOADING & EMPTY ========== */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
  padding: 2.5rem;
  color: #6b7280;
  font-weight: 600;
}

.loading-icon {
  font-size: 1.75rem;
}

/* ========== COMPONENTS TABLE ========== */
.components-table-wrapper {
  border-radius: 14px;
  border: 1.5px solid #e5e7eb;
  overflow: hidden;
  margin-bottom: 1.25rem;
}

.components-table {
  width: 100%;
  border-collapse: collapse;
}

.components-table thead {
  background: #f9fafb;
}

.components-table th {
  padding: 0.9rem 1.25rem;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 800;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 2px solid #e5e7eb;
}

.components-table .col-stock,
.components-table .col-qty,
.components-table .col-action {
  text-align: center;
}

.components-table td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
}

.components-table tbody tr:hover {
  background: #fafafa;
}

.empty-state {
  text-align: center;
  padding: 2.5rem !important;
  color: #9ca3af;
  font-weight: 600;
}

.empty-icon {
  font-size: 2.25rem;
  display: block;
  margin-bottom: 0.6rem;
}

.cell-name {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 700;
  color: #111827;
}

.comp-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #8b5cf6;
}

.cell-stock {
  color: #6b7280;
  font-weight: 600;
}

.cell-qty {
  text-align: center;
}

.qty-input {
  width: 110px;
  padding: 0.6rem 0.85rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  text-align: center;
  font-weight: 700;
  transition: all 0.2s;
}

.qty-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
}

.cell-action {
  text-align: center;
}

.btn-remove {
  padding: 0.5rem 0.85rem;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #fecaca;
  transform: scale(1.08);
}

/* ========== SEARCH ========== */
.search-block {
  margin-top: 1rem;
}

.search-dropdown {
  margin-top: 0.6rem;
  border-radius: 14px;
  border: 1.5px solid #e5e7eb;
  max-height: 220px;
  overflow-y: auto;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.15);
}

.search-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.15s ease;
}

.search-item:last-child {
  border-bottom: none;
}

.search-item:hover {
  background: #faf5ff;
}

.search-item-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  margin-bottom: 0.3rem;
}

.search-item-name {
  font-weight: 700;
  color: #111827;
}

.search-item-tag {
  font-size: 0.8rem;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: #f3e8ff;
  color: #8b5cf6;
  font-weight: 700;
}

.search-item-sub {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 600;
}

/* ========== SUMMARY ========== */
.assembling-footer-section {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

.assembling-summary-card {
  border-radius: 18px;
  border: 1.5px solid #e5e7eb;
  background: linear-gradient(135deg, #faf5ff, #f5f3ff);
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
  background: #8b5cf6;
  color: #f3e8ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.summary-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #6b21a8;
}

.summary-subtitle {
  font-size: 0.85rem;
  color: #8b5cf6;
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
  border: 1.5px solid #e9d5ff;
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
.form-actions-modern.assembling-actions {
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

.btn-submit-assembling {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.btn-submit-assembling:disabled {
  background: #9ca3af;
  box-shadow: none;
  cursor: not-allowed;
}

.btn-submit-assembling:not(:disabled):hover {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  transform: translateY(-3px);
  box-shadow: 0 10px 32px rgba(139, 92, 246, 0.4);
}

/* ========== RESPONSIVE ========== */
@media (max-width: 900px) {
  .page-header-assembling {
    padding: 2rem;
  }

  .header-content-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-body-assembling {
    padding: 2rem;
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
