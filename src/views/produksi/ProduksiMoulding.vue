<template>
  <DashboardLayout>
    <div class="page-header-sawmill">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-sawmill">
            <span class="sawmill-icon">🪚</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-sawmill">Form Moulding</h1>
            <p class="page-subtitle-sawmill">
              Pindahkan stok milik PO dari Gudang Pembahanan ke Gudang Moulding.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="content-card-sawmill">
      <div class="card-body-sawmill">
        <form @submit.prevent="handleSubmit">
          <!-- 1. PILIH PO -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge">
                <span class="section-icon">📄</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Pilih PO</h3>
                <p class="section-subtitle">PO ini jadi filter stok di Gudang Pembahanan.</p>
              </div>
            </div>

            <div class="form-group-modern">
              <label class="form-label-modern">
                Production Order <span class="required-star">*</span>
              </label>
              <div class="select-wrapper-modern">
                <span class="select-icon">📄</span>
                <select
                  v-model="form.po_id"
                  class="form-select-modern"
                  required
                  @change="fetchSourceInventories"
                >
                  <option value="">-- Pilih PO On Progress --</option>
                  <option v-for="po in productionOrders" :key="po.id" :value="po.id">
                    {{ po.label }}
                  </option>
                </select>
                <span class="select-arrow">▼</span>
              </div>
            </div>

            <!-- PO INFO CARD -->
            <div v-if="selectedPo" class="po-info-card-modern">
              <div class="po-header">
                <span class="po-icon">📋</span>
                <h4 class="po-title">{{ selectedPo.po_number }}</h4>
              </div>
              <div class="po-details-grid">
                <div class="po-detail">
                  <span class="detail-label">Buyer</span>
                  <span class="detail-value">{{ selectedPo.buyer_name || '-' }}</span>
                </div>
                <div class="po-detail">
                  <span class="detail-label">Produk</span>
                  <span class="detail-value">{{ selectedPo.product_name || '-' }}</span>
                </div>
                <div class="po-detail">
                  <span class="detail-label">Status</span>
                  <span class="detail-value status-chip">
                    {{ selectedPo.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. PILIH BARANG SUMBER -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge">
                <span class="section-icon">📦</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Barang di Gudang Pembahanan</h3>
                <p class="section-subtitle">Hanya stok milik PO terpilih yang ditampilkan.</p>
              </div>
            </div>

            <div class="form-group-modern">
              <label class="form-label-modern">
                Barang Sumber <span class="required-star">*</span>
              </label>
              <div class="select-wrapper-modern">
                <span class="select-icon">📦</span>
                <select v-model="form.source_inventory_id" class="form-select-modern" required>
                  <option value="">-- Pilih Barang Gudang Pembahanan --</option>
                  <option v-for="inv in sourceInventories" :key="inv.id" :value="inv.id">
                    {{ inv.item_name }} | Sisa Stok: {{ Number(inv.available_qty) }} Pcs
                  </option>
                </select>
                <span class="select-arrow">▼</span>
              </div>
            </div>

            <div v-if="selectedSource" class="info-text">
              Maksimal bisa dipindah:
              <strong>{{ Number(selectedSource.available_qty) }}</strong> Pcs
            </div>
          </div>

          <!-- 3. INPUT & OUTPUT -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge">
                <span class="section-icon">🔢</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Qty & Item Hasil</h3>
                <p class="section-subtitle">
                  Tentukan qty yang diambil dan item hasil di Gudang Moulding.
                </p>
              </div>
            </div>

            <div class="form-grid-2col">
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Qty Input (Pcs) <span class="required-star">*</span>
                </label>
                <input
                  v-model.number="form.input_qty"
                  type="number"
                  min="1"
                  class="form-input-modern"
                  required
                />
                <p v-if="qtyError" class="error-text">
                  {{ qtyError }}
                </p>
              </div>

              <div class="form-group-modern">
                <label class="form-label-modern">
                  Item Hasil Moulding <span class="required-star">*</span>
                </label>
                <div class="select-wrapper-modern">
                  <span class="select-icon">📦</span>
                  <select v-model="form.output_item_id" class="form-select-modern" required>
                    <option value="">-- Pilih Item Hasil --</option>
                    <option v-for="item in outputItems" :key="item.id" :value="item.id">
                      {{ item.code }} - {{ item.name }}
                    </option>
                  </select>
                  <span class="select-arrow">▼</span>
                </div>
              </div>
            </div>

            <div class="form-group-modern">
              <label class="form-label-modern">
                Qty Output (Pcs) <span class="required-star">*</span>
              </label>
              <input
                v-model.number="form.output_qty"
                type="number"
                min="1"
                class="form-input-modern"
                required
              />
            </div>
          </div>

          <!-- AKSI FORM -->
          <div class="form-actions-modern">
            <button type="button" class="btn-action btn-cancel-modern" @click="router.back()">
              <span class="btn-icon">↩️</span>
              <span class="btn-text">Batal</span>
            </button>
            <button type="submit" class="btn-action btn-submit-modern">
              <span class="btn-icon">📦</span>
              <span class="btn-text">PROSES PINDAH</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'

const router = useRouter()
const { showSuccess, showError } = useNotification()

const productionOrders = ref([])
const sourceInventories = ref([])
const outputItems = ref([])

const form = reactive({
  po_id: '',
  source_inventory_id: '',
  input_qty: null,
  output_item_id: '',
  output_qty: null,
})

const qtyError = ref('')

const selectedPo = computed(() => productionOrders.value.find((po) => po.id === Number(form.po_id)))

const selectedSource = computed(() =>
  sourceInventories.value.find((inv) => inv.id === Number(form.source_inventory_id)),
)

const fetchProductionOrders = async () => {
  try {
    const res = await apiClient.get('/production-orders', {
      params: { status: 'on_progress', per_page: 100 },
    })
    const raw = res.data.data?.data || res.data.data || []
    productionOrders.value = raw
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil daftar Production Order')
  }
}

const fetchSourceInventories = async () => {
  try {
    if (!form.po_id) {
      sourceInventories.value = []
      form.source_inventory_id = ''
      return
    }

    const res = await apiClient.get('/produksi/moulding/source-inventories', {
      params: { po_id: form.po_id },
    })

    sourceInventories.value = res.data.data || []
    form.source_inventory_id = ''
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil stok Gudang Pembahanan')
  }
}

const fetchOutputItems = async () => {
  try {
    const res = await apiClient.get('/materials', {
      params: { category_name: 'Kayu RST', per_page: 100 },
    })
    const raw = res.data.data?.data || res.data.data || []
    outputItems.value = raw
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil daftar item hasil Moulding')
  }
}

const handleSubmit = async () => {
  try {
    qtyError.value = ''

    if (selectedSource.value && form.input_qty > selectedSource.value.available_qty) {
      qtyError.value = 'Stok tidak cukup!'
      return
    }

    const payload = {
      po_id: Number(form.po_id),
      source_inventory_id: Number(form.source_inventory_id),
      input_qty: Number(form.input_qty),
      output_item_id: Number(form.output_item_id),
      output_qty: Number(form.output_qty),
    }

    await apiClient.post('/produksi/moulding', payload)

    showSuccess('Sukses', 'Stok berhasil dipindahkan ke Gudang Moulding')

    form.source_inventory_id = ''
    form.input_qty = null
    form.output_item_id = ''
    form.output_qty = null
    await fetchSourceInventories()
  } catch (error) {
    const msg = error.response?.data?.message || 'Gagal memproses pemindahan stok'
    showError('Gagal', msg)
    console.error(error)
  }
}

onMounted(() => {
  fetchProductionOrders()
  fetchOutputItems()
})
</script>
