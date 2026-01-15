<template>
  <DashboardLayout>
    <div class="machine-page-container">
      <!-- HEADER: SELARAS KONSEP SAWMILL/MOULDING -->
      <div class="page-header-machine">
        <div class="header-content-wrapper">
          <div class="header-left-section">
            <div class="icon-badge-machine">
              <span class="machine-icon">⚙️</span>
            </div>
            <div class="header-text-content">
              <h1 class="page-title-machine">Produksi Mesin</h1>
              <p class="page-subtitle-machine">
                Catat pemakaian kayu RST dan hasil komponen untuk setiap Production Order.
              </p>
            </div>
          </div>
          <div class="header-right-section">
            <div class="process-flow-badge-machine">
              <span class="flow-icon">🪵</span>
              <span class="flow-arrow">→</span>
              <span class="flow-icon">⚙️</span>
              <span class="flow-arrow">→</span>
              <span class="flow-icon">📦</span>
            </div>
            <div class="flow-label-machine">Sawmill → Mesin → Komponen</div>
          </div>
        </div>
      </div>

      <!-- CARD KONTEN UTAMA (FULL WIDTH SEPERTI MOULDING) -->
      <div class="content-card-machine">
        <div class="card-body-machine">
          <!-- SECTION 1: PILIH PO -->
          <div class="form-section-modern">
            <div class="section-header section-header-machine">
              <div class="section-icon-badge machine-po-badge">
                <span class="section-icon">📄</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Pilih Production Order / SPK</h3>
                <p class="section-subtitle">
                  Data bahan baku dan hasil komponen akan tercatat untuk PO ini.
                </p>
              </div>
            </div>

            <div class="form-grid-2col">
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Production Order <span class="required-star">*</span>
                </label>
                <div class="select-wrapper-modern">
                  <span class="select-icon">📄</span>
                  <select
                    v-model="selectedPoId"
                    class="form-select-modern"
                    @change="handlePoChange"
                  >
                    <option value="">-- Pilih PO --</option>
                    <option v-for="po in poList" :key="po.id" :value="po.id">
                      {{ po.label }}
                    </option>
                  </select>
                  <span class="select-arrow">▼</span>
                </div>
              </div>

              <div class="form-group-modern">
                <label class="form-label-modern">&nbsp;</label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">ℹ️</span>
                  <input
                    type="text"
                    class="form-input-modern readonly-input"
                    readonly
                    value="Pilih PO untuk melihat ringkasan kebutuhan dan detail stok di bawah"
                  />
                </div>
              </div>
            </div>

            <!-- RINGKASAN PO: SAMA KONSTRUKSI DENGAN SAWMILL/MOULDING -->
            <div v-if="poTargets.length" class="po-hint-box-machine">
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
                      <th>Item</th>
                      <th class="col-qty">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="t in poTargets" :key="t.item_id">
                      <td class="cell-name">
                        {{ t.name || t.code || 'Item #' + t.item_id }}
                      </td>
                      <td class="cell-qty">{{ parseInt(t.qty_planned) }} unit</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- SECTION 2 & 3: MUNCUL SETELAH PO -->
          <div v-if="selectedPoId" class="machine-main-grid">
            <!-- KIRI: BAHAN BAKU -->
            <div class="machine-column-card">
              <div class="section-header column-header-machine column-header-wood">
                <div class="section-icon-badge machine-wood-badge">
                  <span class="section-icon">🪵</span>
                </div>
                <div class="section-title-group">
                  <h3 class="section-title">Bahan Baku (Kayu RST)</h3>
                  <p class="section-subtitle">Kayu yang diambil dari stok untuk proses mesin.</p>
                </div>
              </div>

              <!-- List Bahan Baku -->
              <div v-if="form.materials.length > 0" class="item-list">
                <div
                  v-for="(material, index) in form.materials"
                  :key="'mat-' + index"
                  class="item-card"
                >
                  <div class="item-card-header">
                    <div class="item-name-line">
                      <span class="item-dot item-dot-wood"></span>
                      <span class="item-name">{{ material.name }}</span>
                    </div>
                    <button type="button" class="item-remove-btn" @click="removeMaterial(index)">
                      ✕
                    </button>
                  </div>
                  <div class="item-card-body">
                    <div class="input-wrapper-icon slim">
                      <span class="input-icon">🔢</span>
                      <input
                        v-model.number="material.qty"
                        type="number"
                        step="0.001"
                        min="0.001"
                        class="form-input-modern slim-input"
                        placeholder="Qty"
                      />
                      <span class="input-suffix">{{ material.unit }}</span>
                    </div>
                    <p class="item-hint">
                      Stok tersedia:
                      <strong>{{ formatNumber(material.stock_qty ?? 0) }}</strong>
                      {{ material.unit }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- ✅ COMBO: DROPDOWN + SEARCH KAYU -->
              <div class="search-block">
                <label class="form-label-modern">Tambah Kayu RST</label>

                <!-- DROPDOWN -->
                <div class="select-wrapper-modern" style="margin-bottom: 10px">
                  <span class="select-icon">🪵</span>
                  <select
                    v-model="selectedKayuId"
                    class="form-select-modern"
                    @change="addMaterialFromDropdown"
                  >
                    <option value="">-- Pilih dari Dropdown --</option>
                    <option v-for="kayu in allKayu" :key="kayu.id" :value="kayu.id">
                      {{ kayu.name }} - Stok: {{ formatNumber(kayu.stock_qty) }} {{ kayu.unit }}
                    </option>
                  </select>
                  <span class="select-arrow">▼</span>
                </div>

                <!-- SEARCH BOX -->
                <div class="input-wrapper-icon">
                  <span class="input-icon">🔍</span>
                  <input
                    v-model="searchKayu"
                    type="text"
                    class="form-input-modern"
                    placeholder="Atau ketik untuk search..."
                    @input="onSearchKayu"
                  />
                </div>

                <!-- SEARCH RESULTS -->
                <div v-if="searchKayuResults.length > 0" class="search-dropdown">
                  <div
                    v-for="kayu in searchKayuResults"
                    :key="kayu.id"
                    class="search-item"
                    @click="addMaterial(kayu)"
                  >
                    <div class="search-item-main">
                      <span class="search-item-name">{{ kayu.name }}</span>
                      <span class="search-item-tag">{{ kayu.unit }}</span>
                    </div>
                    <div class="search-item-sub">
                      Stok: {{ formatNumber(kayu.stock_qty) }} {{ kayu.unit }}
                      <span v-if="kayu.code" class="search-item-code">· {{ kayu.code }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- KANAN: HASIL PRODUKSI -->
            <div class="machine-column-card">
              <div class="section-header column-header-machine column-header-output">
                <div class="section-icon-badge machine-output-badge">
                  <span class="section-icon">📦</span>
                </div>
                <div class="section-title-group">
                  <h3 class="section-title">Hasil Produksi (Komponen)</h3>
                  <p class="section-subtitle">Komponen jadi dari proses mesin untuk PO ini.</p>
                </div>
              </div>

              <!-- List Komponen -->
              <div v-if="form.components.length > 0" class="item-list">
                <div
                  v-for="(component, index) in form.components"
                  :key="'comp-' + index"
                  class="item-card"
                >
                  <div class="item-card-header">
                    <div class="item-name-line">
                      <span class="item-dot item-dot-output"></span>
                      <span class="item-name">{{ component.name }}</span>
                    </div>
                    <button type="button" class="item-remove-btn" @click="removeComponent(index)">
                      ✕
                    </button>
                  </div>
                  <div class="item-card-body">
                    <div class="input-wrapper-icon slim">
                      <span class="input-icon">🔢</span>
                      <input
                        v-model.number="component.qty"
                        type="number"
                        min="0.001"
                        class="form-input-modern slim-input"
                        placeholder="Qty"
                      />
                      <span class="input-suffix">pcs</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ✅ COMBO: DROPDOWN + SEARCH KOMPONEN -->
              <div class="search-block">
                <label class="form-label-modern">Tambah Komponen</label>

                <!-- DROPDOWN -->
                <div class="select-wrapper-modern" style="margin-bottom: 10px">
                  <span class="select-icon">📦</span>
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
                    class="search-item search-item-green"
                    @click="addComponent(komponen)"
                  >
                    <div class="search-item-main">
                      <span class="search-item-name">{{ komponen.name }}</span>
                      <span class="search-item-tag">Pcs</span>
                    </div>
                    <div class="search-item-sub">
                      Stok: {{ formatNumber(komponen.stock_qty) }} Pcs
                      <span v-if="komponen.code" class="search-item-code"
                        >· {{ komponen.code }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 4: RINGKASAN & AKSI -->
          <div v-if="selectedPoId" class="form-section-modern machine-footer-section">
            <div class="machine-summary-card">
              <div class="summary-header">
                <span class="summary-icon">📊</span>
                <div>
                  <div class="summary-title">Ringkasan Produksi Mesin</div>
                  <div class="summary-subtitle">
                    Total {{ totalMaterials }} input & {{ totalComponents }} output tercatat.
                  </div>
                </div>
              </div>
              <div class="summary-grid">
                <div class="summary-block">
                  <p class="summary-label">Jenis kayu</p>
                  <p class="summary-value">{{ form.materials.length }}</p>
                </div>
                <div class="summary-block">
                  <p class="summary-label">Jenis komponen</p>
                  <p class="summary-value">{{ form.components.length }}</p>
                </div>
                <div class="summary-block">
                  <p class="summary-label">Qty kayu (sum)</p>
                  <p class="summary-value">{{ formatNumber(sumMaterialQty) }}</p>
                </div>
                <div class="summary-block">
                  <p class="summary-label">Qty komponen (sum)</p>
                  <p class="summary-value">{{ formatNumber(sumComponentQty) }}</p>
                </div>
              </div>
            </div>

            <div class="form-actions-modern machine-actions">
              <button type="button" class="btn-action btn-cancel-modern" @click="handlePoChange">
                <span class="btn-icon">♻️</span>
                <span class="btn-text">Reset Form</span>
              </button>
              <button
                type="button"
                class="btn-action btn-submit-machine"
                :disabled="!canSubmit || submitting"
                @click="handleSubmit"
              >
                <span class="btn-icon">
                  <span v-if="submitting">⏳</span>
                  <span v-else>💾</span>
                </span>
                <span class="btn-text">
                  <span v-if="submitting">Menyimpan...</span>
                  <span v-else>Simpan Produksi Mesin</span>
                </span>
              </button>
            </div>
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
  name: 'ProduksiMesin',
  components: { DashboardLayout },

  data() {
    return {
      poList: [],
      selectedPoId: '',
      submitting: false,

      form: {
        materials: [],
        components: [],
      },

      // ✅ DROPDOWN
      selectedKayuId: '',
      selectedKomponenId: '',

      // ✅ SEARCH
      searchKayu: '',
      searchKayuResults: [],
      allKayu: [],

      searchKomponen: '',
      searchKomponenResults: [],
      allKomponen: [],

      poTargets: [],
      poInfo: {
        buyer_name: null,
        so_number: null,
      },
      warehouses: [], // ✅ Added warehouses state
    }
  },

  computed: {
    canSubmit() {
      return (
        this.selectedPoId &&
        this.form.materials.length > 0 &&
        this.form.components.length > 0 &&
        this.form.materials.every((m) => m.qty > 0) &&
        this.form.components.every((c) => c.qty > 0)
      )
    },

    totalMaterials() {
      return this.form.materials.reduce((acc, m) => acc + (m.qty ? 1 : 0), 0)
    },

    totalComponents() {
      return this.form.components.reduce((acc, c) => acc + (c.qty ? 1 : 0), 0)
    },

    sumMaterialQty() {
      return this.form.materials.reduce((acc, m) => acc + Number(m.qty || 0), 0)
    },

    sumComponentQty() {
      return this.form.components.reduce((acc, c) => acc + Number(c.qty || 0), 0)
    },
  },

  async mounted() {
    this.loadPoList()
    await this.loadWarehouses() // ✅ Load warehouses first
    this.loadAllKayu()
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

    async loadPoList() {
      try {
        const res = await apiClient.get('/production-orders', {
          params: { status_not: 'completed' },
        })

        const rawData = res.data.data?.data || res.data.data || []

        this.poList = rawData.map((po) => ({
          id: po.id,
          po_number: po.po_number,
          label: po.label,
          status: po.status,
          sales_order_id: po.sales_order_id,
          buyer_name: po.buyer_name,
          so_number: po.so_number,
          product_name: po.product_name,
        }))

        console.log('✅ PO List loaded:', this.poList.length)
      } catch (error) {
        console.error('Error loading PO:', error)
        alert('Gagal memuat daftar PO')
      }
    },

    async handlePoChange() {
      this.form.materials = []
      this.form.components = []
      this.searchKayu = ''
      this.searchKomponen = ''
      this.searchKayuResults = []
      this.searchKomponenResults = []
      this.selectedKayuId = ''
      this.selectedKomponenId = ''

      this.poTargets = []
      this.poInfo = { buyer_name: null, so_number: null }

      if (!this.selectedPoId) return

      try {
        const res = await apiClient.get(`/production-orders/${this.selectedPoId}`)
        const data = res.data.data || {}

        this.poInfo = {
          buyer_name: data.sales_order?.buyer_name || null,
          so_number: data.sales_order?.so_number || null,
        }

        this.poTargets = data.targets || []
      } catch (error) {
        console.error(error)
        alert('Gagal mengambil detail Production Order')
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

    async loadAllKayu() {
      // ✅ Filter by Gudang Moulding
      const mouldingWh = this.warehouses.find((w) => w.name.toLowerCase().includes('moulding'))
      const warehouseId = mouldingWh ? mouldingWh.id : null

      if (!warehouseId) {
        console.warn('Gudang Moulding tidak ditemukan, menampilkan semua stok')
      }

      try {
        const res = await apiClient.get('/inventories', {
          params: {
            per_page: 9999,
            warehouse_id: warehouseId, // ✅ Filter by warehouse
            // item_type: 'material', // Removed based on previous fix
          },
        })

        const inventories = res.data.data?.data || res.data.data || []

        const itemMap = {}
        inventories.forEach((inv) => {
          // Filter hanya item yang relevan untuk input mesin (bisa disesuaikan jika perlu)
          // Saat ini kita ambil semua yang ada di inventory untuk memastikan 'knt' muncul
          const itemId = inv.item_id
          if (!itemMap[itemId]) {
            itemMap[itemId] = {
              id: itemId,
              name: inv.item?.name || 'Unknown',
              code: inv.item?.code,
              unit: inv.item?.unit?.name || 'Pcs',
              stock_qty: 0,
            }
          }
          itemMap[itemId].stock_qty += Number(inv.qty || 0)
        })

        this.allKayu = Object.values(itemMap)
        console.log('✅ Loaded Material/Kayu (All Types):', this.allKayu.length)
      } catch (error) {
        console.error('Error loading kayu:', error)
        alert('Gagal memuat data kayu')
      }
    },

    async loadAllKomponen() {
      try {
        const res = await apiClient.get('/inventories', {
          params: {
            per_page: 9999,
            // item_type: 'component', // Hapus filter ini agar semua muncul
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
        console.log('✅ Loaded Component (All Types):', this.allKomponen.length)
      } catch (error) {
        console.error('Error loading komponen:', error)
        alert('Gagal memuat data komponen')
      }
    },

    // ✅ DROPDOWN METHODS
    addMaterialFromDropdown() {
      if (!this.selectedKayuId) return

      const kayu = this.allKayu.find((k) => k.id === this.selectedKayuId)
      if (kayu) {
        this.addMaterial(kayu)
        this.selectedKayuId = ''
      }
    },

    addComponentFromDropdown() {
      if (!this.selectedKomponenId) return

      const komponen = this.allKomponen.find((k) => k.id === this.selectedKomponenId)
      if (komponen) {
        this.addComponent(komponen)
        this.selectedKomponenId = ''
      }
    },

    // ✅ SEARCH METHODS
    onSearchKayu() {
      if (!this.searchKayu || this.searchKayu.length < 2) {
        this.searchKayuResults = []
        return
      }

      const search = this.searchKayu.toLowerCase()
      this.searchKayuResults = this.allKayu
        .filter((k) => k.name.toLowerCase().includes(search))
        .slice(0, 10)
    },

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

    // ✅ ADD/REMOVE METHODS
    addMaterial(kayu) {
      const exists = this.form.materials.find((m) => m.id === kayu.id)
      if (exists) {
        alert('Kayu ini sudah ditambahkan!')
        return
      }

      this.form.materials.push({
        id: kayu.id,
        name: kayu.name,
        unit: kayu.unit,
        qty: 0,
        stock_qty: kayu.stock_qty,
      })

      this.searchKayu = ''
      this.searchKayuResults = []
    },

    removeMaterial(index) {
      this.form.materials.splice(index, 1)
    },

    addComponent(komponen) {
      const exists = this.form.components.find((c) => c.id === komponen.id)
      if (exists) {
        alert('Komponen ini sudah ditambahkan!')
        return
      }

      this.form.components.push({
        id: komponen.id,
        name: komponen.name,
        qty: 0,
      })

      this.searchKomponen = ''
      this.searchKomponenResults = []
    },

    removeComponent(index) {
      this.form.components.splice(index, 1)
    },

    async handleSubmit() {
      if (!this.canSubmit) return

      const payload = {
        production_order_id: Number(this.selectedPoId),
        materials: this.form.materials.map((m) => ({
          item_id: m.id,
          qty: Number(m.qty),
        })),
        components: this.form.components.map((c) => ({
          item_id: c.id,
          qty: Number(c.qty),
        })),
      }

      this.submitting = true
      try {
        await apiClient.post('/operator-mesin/produce', payload)
        alert('✅ Produksi mesin berhasil disimpan!')
        this.form.materials = []
        this.form.components = []
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
/* Lebarkan kontainer seperti halaman lain */
.machine-page-container {
  /* full width mengikuti konten DashboardLayout */
  padding: 1.5rem 2rem 2.5rem;
  max-width: none; /* ← buang batas lebar */
  width: 100%; /* ← lebar penuh */
  margin: 0; /* ← hilangkan centering */
}

/* HEADER – hijau, konsep sama */
.page-header-machine {
  background: linear-gradient(135deg, #16a34a 0%, #0ea5e9 45%, #15803d 100%);
  padding: 2rem 2.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(34, 197, 94, 0.35);
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

.icon-badge-machine {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.55);
}

.machine-icon {
  font-size: 2.5rem;
}

.header-text-content {
  flex: 1;
}

.page-title-machine {
  font-size: 2rem;
  font-weight: 800;
  color: #f9fafb;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.page-subtitle-machine {
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

.process-flow-badge-machine {
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

.flow-label-machine {
  color: #dcfce7;
  font-size: 0.875rem;
  font-weight: 600;
}

/* CARD KONTEN */
.content-card-machine {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  width: 100%;
}

.card-body-machine {
  padding: 2.5rem;
}

/* SECTION & LABEL */
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

.section-header-machine {
  background: linear-gradient(135deg, #ecfdf3, #d1fae5);
  border-left: 5px solid #16a34a;
}

.section-icon-badge {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
  background: linear-gradient(135deg, #bbf7d0, #a7f3d0);
}

.machine-po-badge {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
}

.machine-wood-badge {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
}

.machine-output-badge {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
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

/* GRID & FORM */
.form-grid-2col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.75rem;
}

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

/* INPUT + SELECT */
.input-wrapper-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper-icon.slim {
  max-width: 220px;
}

.input-icon {
  position: absolute;
  left: 1.125rem;
  font-size: 1.125rem;
  pointer-events: none;
  z-index: 1;
}

.input-suffix {
  position: absolute;
  right: 1.125rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #6b7280;
  pointer-events: none;
}

.form-input-modern {
  width: 100%;
  padding: 0.9rem 1.25rem 0.9rem 3.25rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background: white;
  color: #111827;
}

.form-input-modern.slim-input {
  padding-top: 0.7rem;
  padding-bottom: 0.7rem;
}

.form-input-modern::placeholder {
  color: #9ca3af;
}

.form-input-modern:focus {
  outline: none;
  border-color: #16a34a;
  box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.15);
  transform: translateY(-1px);
}

.readonly-input {
  background: #f9fafb;
  cursor: not-allowed;
  font-weight: 600;
  color: #374151;
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
  border-color: #16a34a;
  box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.15);
  transform: translateY(-1px);
}

.select-arrow {
  position: absolute;
  right: 1.125rem;
  font-size: 0.75rem;
  color: #6b7280;
  pointer-events: none;
}

/* PO HINT BOX – copy struktur Sawmill/Moulding, warna hijau */
.po-hint-box-machine {
  margin-top: 1rem;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #ecfdf3, #f0fdf4);
  padding: 1.25rem 1.5rem;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.12);
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
  background: rgba(22, 163, 74, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.po-hint-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #064e3b;
}

.po-hint-sub {
  font-size: 0.8rem;
  color: #047857;
}

.po-hint-badge {
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  background: #bbf7d0;
  color: #064e3b;
}

.po-hint-list-wrapper {
  max-height: 180px;
  overflow-y: auto;
  margin-top: 0.25rem;
  border-radius: 12px;
  border: 1px solid #6ee7b7;
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
  background: #ecfdf3;
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
  border-bottom: 1px solid #d1fae5;
}

.po-hint-table .col-qty {
  width: 80px;
  text-align: right;
}

.po-hint-table .cell-name {
  color: #374151;
  font-weight: 500;
}

.po-hint-table .cell-qty {
  text-align: right;
  color: #047857;
  font-weight: 700;
}

.po-hint-table tbody tr:nth-child(even) {
  background: #f9fafb;
}

/* MAIN GRID KOLOM */
.machine-main-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.75rem;
}

/* KOLOM CARD */
.machine-column-card {
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f9fafb, #ffffff);
  padding: 1.5rem 1.5rem 1.6rem;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
}

/* ITEM LIST */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.9rem;
}

.item-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 0.85rem 0.9rem;
}

.item-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.55rem;
}

.item-name-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
}

.item-dot-wood {
  background: #f97316;
}

.item-dot-output {
  background: #22c55e;
}

.item-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
}

.item-remove-btn {
  border: none;
  background: transparent;
  color: #b91c1c;
  font-size: 0.85rem;
  cursor: pointer;
}

.item-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.item-hint {
  margin: 0;
  font-size: 0.78rem;
  color: #6b7280;
}

/* SEARCH DROPDOWN */
.search-block {
  margin-top: 0.75rem;
}

.search-dropdown {
  margin-top: 0.4rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  max-height: 200px;
  overflow-y: auto;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
}

.search-item {
  padding: 0.6rem 0.85rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
}

.search-item:last-child {
  border-bottom: none;
}

.search-item:hover {
  background: #ecfdf3;
}

.search-item.search-item-green:hover {
  background: #dcfce7;
}

.search-item-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.88rem;
  margin-bottom: 0.2rem;
}

.search-item-name {
  font-weight: 600;
  color: #111827;
}

.search-item-tag {
  font-size: 0.75rem;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  background: #ecfdf3;
  color: #15803d;
}

.search-item-sub {
  font-size: 0.78rem;
  color: #6b7280;
}

.search-item-code {
  margin-left: 0.25rem;
  font-weight: 500;
}

/* RINGKASAN & AKSI */
.machine-footer-section {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

.machine-summary-card {
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #ecfdf3, #f0fdf4);
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
  background: #16a34a;
  color: #ecfdf5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-title {
  font-size: 0.98rem;
  font-weight: 700;
  color: #064e3b;
}

.summary-subtitle {
  font-size: 0.8rem;
  color: #047857;
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
.form-actions-modern.machine-actions {
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

.btn-submit-machine {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
}

.btn-submit-machine:disabled {
  background: #9ca3af;
  box-shadow: none;
  cursor: not-allowed;
}

.btn-submit-machine:not(:disabled):hover {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(34, 197, 94, 0.4);
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .page-header-machine {
    padding: 1.5rem;
  }

  .header-content-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-body-machine {
    padding: 1.5rem;
  }

  .form-grid-2col,
  .machine-main-grid {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .machine-page-container {
    padding: 1.25rem 1.25rem 2rem;
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
