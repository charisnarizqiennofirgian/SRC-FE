<template>
  <DashboardLayout>
    <div class="page-header-candy">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-candy">
            <span class="candy-icon">🔥</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-candy">Produksi Oven / KD</h1>
            <p class="page-subtitle-candy">
              Pindahkan stok RST basah dari Gudang Sanwil ke Gudang KD (kering) dengan tracking yang
              rapi.
            </p>
          </div>
        </div>

        <div class="header-right-section">
          <div class="process-flow-badge">
            <span class="flow-icon">💧</span>
            <span class="flow-arrow">→</span>
            <span class="flow-icon">🔥</span>
            <span class="flow-arrow">→</span>
            <span class="flow-icon">📦</span>
          </div>
          <div class="flow-label">Basah → Oven → Kering</div>
        </div>
      </div>
    </div>

    <div class="content-card-candy">
      <div class="card-body-candy">
        <form @submit.prevent="handleSubmit">
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge">
                <span class="section-icon">📅</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Informasi Umum</h3>
                <p class="section-subtitle">Tanggal, Production Order, dan catatan proses oven</p>
              </div>
            </div>

            <div class="form-grid-2col">
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Tanggal Proses <span class="required-star">*</span>
                </label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">📅</span>
                  <input v-model="form.date" type="date" class="form-input-modern" required />
                </div>
              </div>

              <div class="form-group-modern">
                <label class="form-label-modern">
                  Production Order <span class="required-star">*</span>
                </label>
                <div class="select-wrapper-modern">
                  <span class="select-icon">📋</span>
                  <select
                    v-model="form.ref_po_id"
                    @change="onPoChange"
                    class="form-select-modern"
                    required
                  >
                    <option value="">-- Pilih Production Order --</option>
                    <option v-for="po in productionOrders" :key="po.id" :value="po.id">
                      {{ po.label }}
                    </option>
                  </select>
                  <span class="select-arrow">▼</span>
                </div>
                <!-- RINGKASAN KEBUTUHAN PO (SEPERTI SAWMILL) -->
                <div v-if="poTargets.length" class="po-hint-box">
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
            </div>

            <div class="form-group-modern">
              <label class="form-label-modern">Catatan</label>
              <div class="input-wrapper-icon">
                <span class="input-icon">📝</span>
                <input
                  v-model="form.notes"
                  type="text"
                  class="form-input-modern"
                  placeholder="Contoh: Oven batch #1, Kiln A"
                />
              </div>
            </div>
          </div>

          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge log-badge">
                <span class="section-icon">📦</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Sumber Stok (Gudang Sanwil)</h3>
                <p class="section-subtitle">
                  Pilih stok RST basah berdasarkan item dan qty total tersedia.
                </p>
              </div>

              <button type="button" @click="addItem" class="btn-add-item">
                <span class="add-icon">➕</span> Tambah Item
              </button>
            </div>

            <div v-for="(item, index) in form.items" :key="index" class="item-row-wrapper">
              <div class="item-row-header">
                <h4 class="item-number">📦 Item #{{ index + 1 }}</h4>
                <button
                  v-if="form.items.length > 1"
                  type="button"
                  @click="removeItem(index)"
                  class="btn-remove-item"
                >
                  🗑️ Hapus
                </button>
              </div>

              <!-- ✅ SEARCH PRODUK -->
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Cari Produk <span class="required-star">*</span>
                </label>
                <div class="search-wrapper-product">
                  <span class="search-icon-product">🔍</span>
                  <input
                    v-model="item.searchQuery"
                    @input="onProductSearch(index)"
                    @focus="onProductSearch(index)"
                    type="text"
                    class="search-input-product"
                    placeholder="Ketik nama atau kode produk..."
                  />
                  <div class="search-actions-product">
                    <button
                      v-if="item.item_id"
                      @click="clearProductSelection(index)"
                      class="btn-clear-product"
                      type="button"
                      title="Hapus pilihan"
                    >
                      ✕
                    </button>
                    <button
                      @click="toggleDropdown(index)"
                      class="btn-toggle-dropdown"
                      type="button"
                      :class="{ active: item.showDropdown }"
                    >
                      <span class="chevron-icon">▼</span>
                    </button>
                  </div>

                  <!-- DROPDOWN SEARCH RESULTS -->
                  <div
                    v-if="item.showDropdown && item.searchResults.length > 0"
                    class="product-dropdown"
                  >
                    <div
                      v-for="inv in item.searchResults"
                      :key="`wh${inv.warehouse_id}_item${inv.item_id}`"
                      class="product-option"
                      @click="selectProduct(index, inv)"
                    >
                      <div class="product-option-main">
                        <span class="product-code">[{{ inv.item?.code || 'N/A' }}]</span>
                        <span class="product-name">{{ inv.item?.name || 'N/A' }}</span>
                      </div>
                      <div class="product-option-sub">
                        Stok: <strong>{{ inv.qty_pcs }} pcs</strong>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="
                      item.showDropdown &&
                      item.searchQuery &&
                      item.searchResults.length === 0 &&
                      !isSearching
                    "
                    class="product-dropdown-empty"
                  >
                    <span class="empty-icon">🔍</span>
                    <span>Produk tidak ditemukan</span>
                  </div>
                </div>

                <p v-if="getSelectedInventory(index)" class="helper-inline">
                  Gudang: {{ getSelectedInventory(index).warehouse?.name || 'Gudang Sanwil' }} •
                  Produk: {{ getSelectedInventory(index).item?.name }} • Total Stok:
                  <strong>{{ getSelectedInventory(index).qty_pcs }} pcs</strong>
                </p>
              </div>

              <div v-if="getSelectedInventory(index)" class="form-grid-2col">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    Qty yang Dioven (pcs) <span class="required-star">*</span>
                  </label>
                  <div class="input-wrapper-icon">
                    <span class="input-icon">🔢</span>
                    <input
                      v-model.number="item.qty"
                      type="number"
                      min="1"
                      :max="getSelectedInventory(index).qty_pcs"
                      step="1"
                      class="form-input-modern"
                      placeholder="Jumlah pcs"
                      required
                    />
                    <span class="input-suffix">pcs</span>
                  </div>
                  <p class="help-text">
                    Stok tersedia: <strong>{{ getSelectedInventory(index).qty_pcs }}</strong> pcs
                  </p>
                </div>

                <div class="form-group-modern">
                  <label class="form-label-modern">
                    Jadikan Barang Kering <span class="required-star">*</span>
                  </label>
                  <div class="search-wrapper-product">
                    <span class="search-icon-product">🎯</span>
                    <input
                      v-model="item.searchTargetQuery"
                      @input="onTargetSearch(index)"
                      @focus="onTargetSearch(index)"
                      type="text"
                      class="search-input-product"
                      placeholder="Cari item RST Kering..."
                    />
                    <div class="search-actions-product">
                      <button
                        v-if="item.target_item_id"
                        @click="clearTargetSelection(index)"
                        class="btn-clear-product"
                        type="button"
                        title="Hapus pilihan"
                      >
                        ✕
                      </button>
                      <button
                        @click="toggleTargetDropdown(index)"
                        class="btn-toggle-dropdown"
                        type="button"
                        :class="{ active: item.showTargetDropdown }"
                      >
                        <span class="chevron-icon">▼</span>
                      </button>
                    </div>

                    <!-- DROPDOWN TARGET RESULTS -->
                    <div
                      v-if="item.showTargetDropdown && item.targetSearchResults.length > 0"
                      class="product-dropdown"
                    >
                      <div
                        v-for="dryItem in item.targetSearchResults"
                        :key="dryItem.id"
                        class="product-option"
                        @click="selectTargetItem(index, dryItem)"
                      >
                        <div class="product-option-main">
                          <span class="product-code">[{{ dryItem.code }}]</span>
                          <span class="product-name">{{ dryItem.name }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p v-if="item.target_item_id" class="help-text">
                    Item tujuan akan menerima stok kering di Gudang KD.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions-modern">
            <button
              type="button"
              class="btn-action btn-cancel-modern"
              @click="router.push({ name: 'admin-dashboard' })"
            >
              <span class="btn-icon">↩️</span>
              <span class="btn-text">Batal</span>
            </button>
            <button type="submit" class="btn-action btn-submit-modern" :disabled="isSubmitting">
              <span class="btn-icon">💾</span>
              <span class="btn-text">{{ isSubmitting ? 'Menyimpan...' : 'Simpan Proses KD' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'

const router = useRouter()
const { showSuccess, showError } = useNotification()

const form = reactive({
  date: new Date().toISOString().slice(0, 10),
  notes: '',
  ref_po_id: '',
  items: [
    {
      item_id: '',
      warehouse_id: '',
      target_item_id: '',
      qty: null,
      searchQuery: '', 
      showDropdown: false, 
      searchResults: [],
      searchTargetQuery: '', // ✅ NEW
      showTargetDropdown: false, // ✅ NEW
      targetSearchResults: [], // ✅ NEW
    },
  ],
})

const warehouses = ref([])
const sanwilInventories = ref([])
const dryItems = ref([])
const productionOrders = ref([])
const isSubmitting = ref(false)
const isSearching = ref(false)

const poTargets = ref([])
const poInfo = ref({ buyer_name: null, so_number: null })

let searchTimeout = null

const selectedPO = computed(() => {
  if (!form.ref_po_id) return null
  return productionOrders.value.find((po) => po.id === form.ref_po_id) || null
})

// ✅ COMPUTED: Filter inventory berdasarkan PO yang dipilih
const filteredInventoriesByPO = computed(() => {
  if (!form.ref_po_id || !selectedPO.value) {
    return sanwilInventories.value
  }

  // Filter berdasarkan product_id dari PO
  const poProductId = selectedPO.value.product_id
  if (!poProductId) return sanwilInventories.value

  return sanwilInventories.value.filter((inv) => inv.item?.product_id === poProductId)
})

const getSelectedInventory = (index) => {
  const item = form.items[index]
  return (
    sanwilInventories.value.find(
      (inv) => inv.item_id === item.item_id && inv.warehouse_id === item.warehouse_id,
    ) || null
  )
}

const getWarehouseIdByName = (name) => {
  const wh = warehouses.value.find((w) => w.name.includes(name))
  return wh ? wh.id : null
}

// ✅ NEW: Search produk dengan debounce
const onProductSearch = (index) => {
  clearTimeout(searchTimeout)
  const item = form.items[index]
  item.showDropdown = true

  // Jika query kosong, tampilkan 15 item pertama
  if (!item.searchQuery || item.searchQuery.length < 1) {
    item.searchResults = filteredInventoriesByPO.value.slice(0, 15)
    return
  }

  isSearching.value = true

  searchTimeout = setTimeout(() => {
    const query = item.searchQuery.toLowerCase()

    // Search dari inventory yang sudah difilter by PO
    item.searchResults = filteredInventoriesByPO.value.filter((inv) => {
      const name = inv.item?.name?.toLowerCase() || ''
      const code = inv.item?.code?.toLowerCase() || ''
      return name.includes(query) || code.includes(query)
    })

    isSearching.value = false
  }, 300)
}

// ✅ NEW: Toggle dropdown manual
const toggleDropdown = (index) => {
  const item = form.items[index]
  if (item.showDropdown) {
    item.showDropdown = false
  } else {
    onProductSearch(index)
  }
}

// ✅ NEW: Select produk dari dropdown
const selectProduct = (index, inv) => {
  const item = form.items[index]
  item.item_id = inv.item_id
  item.warehouse_id = inv.warehouse_id
  item.searchQuery = `[${inv.item?.code}] ${inv.item?.name}`
  item.showDropdown = false
  item.searchResults = []

  // ✅ AUTO-FILL: cari item kering yang cocok berdasarkan code yang sama
  const sourceCode = inv.item?.code || ''
  const matchedDryItem = dryItems.value.find(
    (di) => di.code === sourceCode
  )

  if (matchedDryItem) {
    item.target_item_id = matchedDryItem.id
    item.searchTargetQuery = `[${matchedDryItem.code}] ${matchedDryItem.name}`
  } else {
    // Tidak ada match persis — coba cocokkan berdasarkan nama yang mirip
    const sourceName = inv.item?.name?.toLowerCase() || ''
    const loosematch = dryItems.value.find(
      (di) => di.name?.toLowerCase() === sourceName
    )
    if (loosematch) {
      item.target_item_id = loosematch.id
      item.searchTargetQuery = `[${loosematch.code}] ${loosematch.name}`
    }
    // Jika benar-benar tidak ditemukan, biarkan kosong untuk diisi manual
  }
}

// ✅ NEW: Clear product selection
const clearProductSelection = (index) => {
  const item = form.items[index]
  item.item_id = ''
  item.warehouse_id = ''
  item.searchQuery = ''
  item.searchResults = []
  item.showDropdown = false
}

const onPoChange = async () => {
  console.log('✅ PO dipilih:', form.ref_po_id, selectedPO.value)

  // Reset semua item search saat PO berubah
  form.items.forEach((item) => {
    clearProductSelection(form.items.indexOf(item))
  })

  // Ambil detail PO untuk ringkasan
  poTargets.value = []
  poInfo.value = { buyer_name: null, so_number: null }

  if (form.ref_po_id) {
    try {
      const res = await apiClient.get(`/production-orders/${form.ref_po_id}`)
      const data = res.data.data || {}
      poInfo.value = {
        buyer_name: data.sales_order?.buyer_name || null,
        so_number: data.sales_order?.so_number || null,
      }
      poTargets.value = data.targets || []
    } catch (e) {
      console.error('Gagal ambil detail PO:', e)
    }
  }

  showSuccess('Berhasil', 'PO dipilih. Silakan pilih produk yang sesuai dengan PO ini.')
}

// ✅ NEW: Search target (Barang Kering)
const onTargetSearch = (index) => {
  const item = form.items[index]
  item.showTargetDropdown = true

  const query = item.searchTargetQuery.toLowerCase()

  if (!query) {
    item.targetSearchResults = dryItems.value.slice(0, 15)
    return
  }

  item.targetSearchResults = dryItems.value.filter((di) => {
    const name = di.name?.toLowerCase() || ''
    const code = di.code?.toLowerCase() || ''
    return name.includes(query) || code.includes(query)
  })
}

// ✅ NEW: Toggle target dropdown manual
const toggleTargetDropdown = (index) => {
  const item = form.items[index]
  if (item.showTargetDropdown) {
    item.showTargetDropdown = false
  } else {
    onTargetSearch(index)
  }
}

// ✅ NEW: Select target item
const selectTargetItem = (index, dryItem) => {
  const item = form.items[index]
  item.target_item_id = dryItem.id
  item.searchTargetQuery = `[${dryItem.code}] ${dryItem.name}`
  item.showTargetDropdown = false
}

// ✅ NEW: Clear target selection
const clearTargetSelection = (index) => {
  const item = form.items[index]
  item.target_item_id = ''
  item.searchTargetQuery = ''
  item.targetSearchResults = []
  item.showTargetDropdown = false
}

const addItem = () => {
  const sanwilId = getWarehouseIdByName('Gudang Sanwil')
  form.items.push({
    item_id: '',
    warehouse_id: sanwilId || '',
    target_item_id: '',
    qty: null,
    searchQuery: '',
    showDropdown: false,
    searchResults: [],
    searchTargetQuery: '',
    showTargetDropdown: false,
    targetSearchResults: [],
  })
  showSuccess('Berhasil', 'Item baru ditambahkan')
}

const removeItem = (index) => {
  if (form.items.length > 1) {
    form.items.splice(index, 1)
    showSuccess('Berhasil', `Item #${index + 1} dihapus`)
  } else {
    showError('Validasi', 'Minimal harus ada 1 item')
  }
}

const fetchData = async () => {
  try {
    const whRes = await apiClient.get('/warehouses')
    warehouses.value = whRes.data.data || whRes.data || []

    const poRes = await apiClient.get('/production-orders')
    productionOrders.value = poRes.data.data || poRes.data || []
    console.log('✅ Production Orders:', productionOrders.value.length, 'items')

    const sanwilId = getWarehouseIdByName('Gudang Sanwil')
    if (!sanwilId) {
      showError('Konfigurasi', 'Gudang Sanwil tidak ditemukan di master')
      console.log('❌ WAREHOUSES:', warehouses.value)
      return
    }

    console.log('✅ Gudang Sanwil ID:', sanwilId)

    const invRes = await apiClient.get('/inventories', {
      params: {
        warehouse_id: sanwilId,
        per_page: 9999,
      },
    })

    const raw = invRes.data.data?.data || invRes.data.data || []

    console.log('📦 RAW INVENTORIES dari API:', raw)
    console.log('📦 Total baris inventory:', raw.length)

    const groupedMap = {}

    raw.forEach((inv) => {
      const key = `${inv.warehouse_id}_${inv.item_id}`

      if (!groupedMap[key]) {
        groupedMap[key] = {
          warehouse_id: inv.warehouse_id,
          item_id: inv.item_id,
          qty_pcs: 0,
          item: inv.item,
          warehouse: inv.warehouse,
          inventory_ids: [],
        }
      }

     groupedMap[key].qty_pcs += Number(inv.qty || 0)
      groupedMap[key].inventory_ids.push(inv.id)
    })

    sanwilInventories.value = Object.values(groupedMap)

    console.log('✅ SANWIL INVENTORIES (GROUPED):', sanwilInventories.value)
    console.log('✅ Total item setelah grouping:', sanwilInventories.value.length)

    if (form.items.length > 0 && !form.items[0].warehouse_id) {
      form.items[0].warehouse_id = sanwilId
    }

    const dryRes = await apiClient.get('/materials', {
      params: { category_name: 'Kayu RST', per_page: 200 },
    })
    dryItems.value = dryRes.data.data?.data || dryRes.data.data || []

    console.log('✅ DRY ITEMS:', dryItems.value.length, 'items')
  } catch (error) {
    console.error('❌ ERROR fetchData:', error)
    showError('Gagal', 'Gagal mengambil data gudang / inventory')
  }
}

const handleSubmit = async () => {
  try {
    if (!form.ref_po_id) {
      showError('Validasi', 'Production Order wajib dipilih')
      return
    }

    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i]
      const selectedInv = getSelectedInventory(i)

      if (!item.item_id) {
        showError('Validasi', `Item #${i + 1}: Stok sumber wajib dipilih`)
        return
      }
      if (!item.target_item_id) {
        showError('Validasi', `Item #${i + 1}: Barang kering tujuan wajib dipilih`)
        return
      }
      if (!item.qty || item.qty <= 0) {
        showError('Validasi', `Item #${i + 1}: Qty wajib lebih dari 0`)
        return
      }
      if (selectedInv && item.qty > selectedInv.qty_pcs) {
        showError(
          'Validasi',
          `Item #${i + 1}: Qty (${item.qty} pcs) melebihi stok tersedia (${selectedInv.qty_pcs} pcs)`,
        )
        return
      }
    }

    isSubmitting.value = true

    const payload = {
      date: form.date,
      notes: form.notes || null,
      ref_po_id: form.ref_po_id,
      items: form.items.map((item) => ({
        warehouse_id: item.warehouse_id,
        item_id: item.item_id,
        target_item_id: item.target_item_id,
        qty: item.qty,
      })),
    }

    console.log('📤 PAYLOAD YANG DIKIRIM:', payload)

    const response = await apiClient.post('/candy-productions', payload)

    console.log('✅ RESPONSE DARI SERVER:', response.data)

    showSuccess('Sukses', `Proses KD berhasil dicatat untuk ${form.items.length} item.`)
    router.push({ name: 'ProduksiPembahanan' })
  } catch (error) {
    console.error('❌ ERROR SUBMIT:', error)
    const msg =
      error.response?.data?.message ||
      (error.response?.data?.errors && JSON.stringify(error.response.data.errors)) ||
      'Gagal mencatat proses KD'
    showError('Gagal', msg)
  } finally {
    isSubmitting.value = false
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  form.items.forEach((item, index) => {
    if (!event.target.closest(`.search-wrapper-product`)) {
      item.showDropdown = false
      item.showTargetDropdown = false
    }
  })
}

onMounted(() => {
  fetchData()
  document.addEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* ========================================
   EXISTING STYLES (TETAP SAMA)
   ======================================== */
.page-header-candy {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #b91c1c 100%);
  padding: 2rem 2.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(248, 113, 113, 0.35);
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

.icon-badge-candy {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.candy-icon {
  font-size: 2.5rem;
}

.header-text-content {
  flex: 1;
}

.page-title-candy {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.page-subtitle-candy {
  color: rgba(255, 255, 255, 0.95);
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

.process-flow-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 999px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.flow-icon {
  font-size: 1.25rem;
}

.flow-arrow {
  font-size: 1rem;
  color: #b91c1c;
  font-weight: 700;
}

.flow-label {
  color: #fef2f2;
  font-size: 0.875rem;
  font-weight: 600;
}

.content-card-candy {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f2f5;
  overflow: hidden;
}

.card-body-candy {
  padding: 2.5rem;
}

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
  background: linear-gradient(135deg, #f9fafb, #fef2f2);
  border-radius: 14px;
  border-left: 5px solid #f97316;
}

.section-icon-badge {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(248, 113, 113, 0.3);
}

.section-icon-badge.log-badge {
  background: linear-gradient(135deg, #e0f2fe, #bfdbfe);
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
  letter-spacing: -0.25px;
}

.section-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.form-grid-2col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.75rem;
}

@media (max-width: 768px) {
  .form-grid-2col {
    grid-template-columns: 1fr;
  }
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
  letter-spacing: 0.015em;
}

.required-star {
  color: #ef4444;
  margin-left: 0.25rem;
}

.input-wrapper-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1.125rem;
  font-size: 1.125rem;
  pointer-events: none;
  z-index: 1;
}

.form-input-modern {
  width: 100%;
  padding: 1rem 1.25rem 1rem 3.25rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background: white;
  color: #111827;
}

.form-input-modern::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.form-input-modern:focus {
  outline: none;
  border-color: #f97316;
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.15);
  transform: translateY(-1px);
}

.input-suffix {
  position: absolute;
  right: 1.125rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #6b7280;
  pointer-events: none;
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
  padding: 1rem 3.25rem 1rem 3.25rem;
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
  border-color: #f97316;
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.15);
  transform: translateY(-1px);
}

.select-arrow {
  position: absolute;
  right: 1.125rem;
  font-size: 0.75rem;
  color: #6b7280;
  pointer-events: none;
}

.help-text {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.helper-inline {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: #4b5563;
  font-weight: 600;
}

.form-actions-modern {
  display: flex;
  justify-content: flex-end;
  gap: 1.25rem;
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 3px solid #e5e7eb;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.125rem 2.25rem;
  border: none;
  border-radius: 14px;
  font-size: 1.0625rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  font-size: 1.25rem;
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

.btn-submit-modern {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #b91c1c 100%);
  color: white;
}

.btn-submit-modern:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(248, 113, 113, 0.4);
}

/* ========================================
   ✅ NEW STYLES FOR MULTIPLE ITEMS
   ======================================== */

/* Tombol Tambah Item */
.btn-add-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9375rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  margin-left: auto;
}

.btn-add-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.add-icon {
  font-size: 1.125rem;
}

/* Item Row Wrapper */
.item-row-wrapper {
  margin-bottom: 2rem;
  padding: 1.75rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff, #fafafa);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.item-row-wrapper:hover {
  border-color: #f97316;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.15);
}

.item-row-wrapper:last-child {
  margin-bottom: 0;
}

/* Item Row Header */
.item-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px dashed #e5e7eb;
}

.item-number {
  margin: 0;
  color: #111827;
  font-weight: 700;
  font-size: 1.125rem;
  letter-spacing: -0.25px;
}

/* Tombol Hapus Item */
.btn-remove-item {
  background: linear-gradient(135deg, #ff4444, #cc0000);
  color: white;
  border: none;
  padding: 0.625rem 1.125rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 68, 68, 0.3);
}

.btn-remove-item:hover {
  background: linear-gradient(135deg, #cc0000, #990000);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 68, 68, 0.5);
}

/* ========================================
   ✅ SEARCH PRODUCT STYLES
   ======================================== */
.search-wrapper-product {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon-product {
  position: absolute;
  left: 1.125rem;
  font-size: 1.125rem;
  pointer-events: none;
  z-index: 1;
}

.search-input-product {
  width: 100%;
  padding: 1rem 5rem 1rem 3.25rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  background: white;
  color: #111827;
}

.search-input-product::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.search-input-product:focus {
  outline: none;
  border-color: #f97316;
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.15);
  transform: translateY(-1px);
}

.btn-clear-product {
  position: absolute;
  right: 1.125rem;
  padding: 0.35rem 0.6rem;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 6px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  z-index: 2;
}

.btn-clear-product:hover {
  background: #fecaca;
  transform: scale(1.1);
}

.search-actions-product {
  position: absolute;
  right: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 2;
}

.btn-toggle-dropdown {
  background: #f1f5f9;
  color: #64748b;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-toggle-dropdown:hover {
  background: #e2e8f0;
  color: #f97316;
}

.btn-toggle-dropdown.active {
  background: #fef3c7;
  color: #f97316;
  transform: rotate(180deg);
}

.chevron-icon {
  font-size: 0.75rem;
  transition: transform 0.3s ease;
}

.product-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.15);
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
}

.product-option {
  padding: 0.85rem 1.25rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.15s ease;
}

.product-option:last-child {
  border-bottom: none;
}

.product-option:hover {
  background: #fef3c7;
}

.product-option-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
}

.product-code {
  font-weight: 800;
  color: #f97316;
  font-size: 0.9rem;
  font-family: monospace;
}

.product-name {
  font-weight: 700;
  color: #111827;
  font-size: 0.95rem;
  flex: 1;
}

.product-option-sub {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 600;
}

.product-dropdown-empty {
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
  font-weight: 600;
}

.empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .page-header-candy {
    padding: 1.5rem;
  }

  .header-content-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-body-candy {
    padding: 1.5rem;
  }

  .form-actions-modern {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }

  .header-right-section {
    align-items: flex-start;
  }

  .btn-add-item {
    width: 100%;
    justify-content: center;
    margin-left: 0;
    margin-top: 1rem;
  }

  .item-row-wrapper {
    padding: 1.25rem;
  }

  .item-row-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .btn-remove-item {
    width: 100%;
  }
}

/* ========================================
   PO HINT BOX (RINGKASAN KEBUTUHAN PO)
   ======================================== */
.po-hint-box {
  margin-top: 1.25rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #fefce8, #fef9c3);
  border: 2px solid #facc15;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(250, 204, 21, 0.15);
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
  background: rgba(250, 204, 21, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.po-hint-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #92400e;
}

.po-hint-sub {
  font-size: 0.8rem;
  color: #6b7280;
}

.po-hint-badge {
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  background: #fef3c7;
  color: #92400e;
}

.po-hint-list-wrapper {
  max-height: 180px;
  overflow-y: auto;
  margin-top: 0.25rem;
  border-radius: 12px;
  border: 1px solid #facc15;
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
  border-bottom: 1px solid #feeeb2;
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
  color: #92400e;
  font-weight: 700;
}

.po-hint-table tbody tr:nth-child(even) {
  background: #f9fafb;
}
</style>

