<template>
  <DashboardLayout>
    <div class="page-header">
      <div class="header-content">
        <div class="header-left-section">
          <div class="icon-badge">✏️</div>
          <div>
            <h1 class="page-title">{{ isEditMode ? 'Edit' : 'Buat' }} Pesanan Pembelian (PO)</h1>
            <p class="page-subtitle">
              {{
                isEditMode ? `Edit purchase order ${poNumber}` : 'Isi detail untuk membuat PO baru'
              }}
            </p>
          </div>
        </div>
        <router-link to="/admin/pembelian" class="btn-back">
          <span class="btn-icon">←</span>
          <span>Kembali ke Daftar</span>
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p class="loading-text">Memuat data...</p>
    </div>

    <form v-else @submit.prevent="saveOrder">
      <div class="content-card">
        <div class="card-header-section">
          <div class="section-icon-wrapper">
            <div class="section-icon">ℹ️</div>
          </div>
          <div class="section-header-text">
            <h2 class="section-title">Informasi Utama</h2>
            <p class="section-subtitle">Pilih supplier, tanggal, dan catatan pemesanan</p>
          </div>
        </div>
        <div class="card-body">
          <div class="info-grid-form">
            <div class="form-group">
              <label class="form-label">Supplier</label>
              <vue-select
                v-model="form.supplier_id"
                :options="daftarSupplier"
                :reduce="s => s.id"
                label="name"
                placeholder="Pilih Supplier"
                class="vue-select-supplier"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Tanggal Pesan</label>
              <input type="date" v-model="form.order_date" class="form-control" required />
            </div>
            <div class="form-group full-width">
              <label class="form-label">Catatan (Opsional)</label>
              <textarea
                v-model="form.notes"
                class="form-control"
                rows="3"
                placeholder="Catatan untuk supplier..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="content-card">
        <div class="card-header-section">
          <div class="section-icon-wrapper">
            <div class="section-icon">📦</div>
          </div>
          <div class="section-header-text">
            <h2 class="section-title">Detail Barang</h2>
            <p class="section-subtitle">
              Tambahkan barang yang akan dipesan beserta spesifikasinya
            </p>
          </div>
        </div>
        <div class="card-body-table">
          <div class="table-wrapper">
            <table class="detail-table">
              <thead>
                <tr>
                  <th class="th-material">Barang</th>
                  <th class="th-qty">Jumlah</th>
                  <th class="th-price">Harga Satuan</th>
                  <th class="th-subtotal">Subtotal</th>
                  <th class="th-action">Aksi</th>
                </tr>
              </thead>
              <template v-for="(item, index) in form.details" :key="index">
                <tr class="data-row">
                  <td class="td-material">
                    <select
                      :id="'select-barang-' + index"
                      v-model="item.item_id"
                      class="choices-select"
                      required
                    >
                      <option disabled value="">Pilih Barang</option>
                      <option v-for="barang in daftarBarang" :key="barang.id" :value="barang.id">
                        {{ barang.code }} - {{ barang.name }}
                      </option>
                    </select>
                  </td>
                  <td class="td-qty">
                    <input
                      type="number"
                      v-model.number="item.quantity"
                      class="form-control"
                      placeholder="Jumlah"
                      required
                      min="0.01"
                      step="any"
                    />
                  </td>
                  <td class="td-price">
                    <input
                      type="number"
                      v-model.number="item.price"
                      class="form-control"
                      placeholder="Harga"
                      required
                      min="0"
                      step="any"
                    />
                  </td>
                  <td class="td-subtotal">
                    {{ formatCurrency((item.quantity || 0) * (item.price || 0)) }}
                  </td>
                  <td class="td-action">
                    <button
                      @click="hapusBarang(index)"
                      type="button"
                      class="btn-delete"
                      :disabled="form.details.length === 1"
                    >
                      <span>🗑️</span>
                    </button>
                  </td>
                </tr>

                <tr class="spec-row" v-if="isKartonBox(item.item_id) || isKayu(item.item_id)">
                  <td colspan="5" class="spec-cell">
                    <div v-if="isKartonBox(item.item_id)" class="spec-card">
                      <h4 class="spec-title">Spesifikasi Karton Box</h4>
                      <div class="spec-grid">
                        <input
                          type="number"
                          v-model="item.specifications.panjang"
                          placeholder="Panjang (mm)"
                          class="form-control-spec"
                        />
                        <input
                          type="number"
                          v-model="item.specifications.lebar"
                          placeholder="Lebar (mm)"
                          class="form-control-spec"
                        />
                        <input
                          type="number"
                          v-model="item.specifications.tinggi"
                          placeholder="Tinggi (mm)"
                          class="form-control-spec"
                        />
                        <input
                          type="text"
                          v-model="item.specifications.kwalitas"
                          placeholder="Kwalitas (B/F, C/F)"
                          class="form-control-spec"
                        />
                        <input
                          type="text"
                          v-model="item.specifications.jenis"
                          placeholder="Jenis (Single/Double Wall)"
                          class="form-control-spec"
                        />
                      </div>
                    </div>

                    <div v-if="isKayu(item.item_id)" class="spec-card">
                      <h4 class="spec-title">Spesifikasi Kayu</h4>
                      <div class="spec-grid-kayu">
                        <label class="spec-label">Invoice Size (mm):</label>
                        <input
                          type="number"
                          v-model.number="item.specifications.invoice_p"
                          placeholder="P"
                          class="form-control-spec"
                        />
                        <input
                          type="number"
                          v-model.number="item.specifications.invoice_l"
                          placeholder="L"
                          class="form-control-spec"
                        />
                        <input
                          type="number"
                          v-model.number="item.specifications.invoice_t"
                          placeholder="T"
                          class="form-control-spec"
                        />

                        <label class="spec-label">Cutting Size (mm):</label>
                        <input
                          type="number"
                          v-model="item.specifications.cutting_p"
                          placeholder="P"
                          class="form-control-spec"
                        />
                        <input
                          type="number"
                          v-model="item.specifications.cutting_l"
                          placeholder="L"
                          class="form-control-spec"
                        />
                        <input
                          type="number"
                          v-model="item.specifications.cutting_t"
                          placeholder="T"
                          class="form-control-spec"
                        />

                        <label class="spec-label">Kubikasi (Auto):</label>
                        <div class="kubikasi-wrapper">
                          <input
                            type="number"
                            :value="item.specifications.kubikasi"
                            placeholder="Auto calculate..."
                            class="form-control-spec kubikasi-auto"
                            readonly
                            step="any"
                          />
                          <span class="auto-badge" v-if="item.specifications.kubikasi">
                            🤖 AUTO
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </table>
          </div>
          <div class="table-actions">
            <button @click="tambahBarang" type="button" class="btn-add-row">
              <span class="btn-icon">➕</span> Tambah Barang
            </button>
          </div>

          <!-- ✅ FIXED: Ganti checkbox jadi dropdown -->
          <div class="summary-section">
            <div class="ppn-selector-compact">
              <label for="ppn_percentage" class="ppn-label-select">
                <span class="ppn-icon">📊</span>
                <span>PPN</span>
              </label>
              <select id="ppn_percentage" v-model.number="form.ppn_percentage" class="ppn-select">
                <option :value="0">Tanpa PPN (0%)</option>
                <option :value="11">PPN 11%</option>
                <option :value="12">PPN 12%</option>
              </select>
            </div>

            <div class="summary-compact">
              <div class="summary-row-compact">
                <span class="sum-label">Subtotal</span>
                <span class="sum-value">{{ formatCurrency(subtotal) }}</span>
              </div>

              <!-- ✅ FIXED: Badge dinamis sesuai ppn_percentage -->
              <div
                class="summary-row-compact ppn-row-compact"
                :class="{ 'ppn-active': form.ppn_percentage > 0 }"
              >
                <span class="sum-label">
                  <span class="ppn-badge-small" v-if="form.ppn_percentage > 0">
                    {{ form.ppn_percentage }}%
                  </span>
                  PPN
                </span>
                <span class="sum-value">{{ formatCurrency(ppnAmount) }}</span>
              </div>

              <div class="summary-divider-compact"></div>

              <div class="summary-row-compact summary-total-compact">
                <span class="sum-label-total">Grand Total</span>
                <span class="sum-value-total">{{ formatCurrency(grandTotal) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-submit-action" :disabled="isSaving">
          <span class="action-icon">{{ isSaving ? '⏳' : '💾' }}</span>
          <span>{{ isSaving ? 'Menyimpan...' : 'Simpan Pesanan' }}</span>
        </button>
      </div>
    </form>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '@/api/axios'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { useToast } from 'vue-toastification'
import Choices from 'choices.js'
import 'choices.js/public/assets/styles/choices.min.css'
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const isEditMode = computed(() => !!route.params.id)
const poId = route.params.id
const poNumber = ref('')
const loading = ref(true)
const isSaving = ref(false)

const daftarSupplier = ref([])
const daftarBarang = ref([])
const choicesInstances = ref([])

const form = reactive({
  supplier_id: '',
  order_date: new Date().toISOString().slice(0, 10),
  notes: '',
  ppn_percentage: 12, // ✅ GANTI apply_ppn jadi ppn_percentage (default 12%)
  details: [],
})

// ✅ COMPUTED: Calculate Subtotal
const subtotal = computed(() => {
  return form.details.reduce((acc, item) => {
    return acc + (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0)
  }, 0)
})

// ✅ COMPUTED: Calculate PPN (pakai ppn_percentage)
const ppnAmount = computed(() => {
  return subtotal.value * (form.ppn_percentage / 100)
})

// ✅ COMPUTED: Calculate Grand Total
const grandTotal = computed(() => {
  return subtotal.value + ppnAmount.value
})

// ✅ FUNCTION: Calculate Kubikasi Otomatis
const calculateKubikasi = (p, l, t) => {
  const pMm = parseFloat(p) || 0
  const lMm = parseFloat(l) || 0
  const tMm = parseFloat(t) || 0

  if (pMm === 0 || lMm === 0 || tMm === 0) {
    return null
  }

  const kubikasi = (pMm * lMm * tMm) / 1000000000
  return parseFloat(kubikasi.toFixed(6))
}

// ✅ Helper Functions
const getItemById = (itemId) => daftarBarang.value.find((b) => b.id === itemId)

const isKartonBox = (itemId) => {
  const item = getItemById(itemId)
  return item && item.name.toLowerCase().includes('karton')
}

const isKayu = (itemId) => {
  const item = getItemById(itemId)
  return item && item.name.toLowerCase().includes('kayu')
}

// ✅ WATCH: Auto-calculate kubikasi
watch(
  () =>
    form.details.map((item) => [
      item.specifications?.invoice_p,
      item.specifications?.invoice_l,
      item.specifications?.invoice_t,
    ]),
  (newValues) => {
    newValues.forEach(([p, l, t], index) => {
      if (form.details[index]?.specifications && isKayu(form.details[index].item_id)) {
        form.details[index].specifications.kubikasi = calculateKubikasi(p, l, t)
      }
    })
  },
  { deep: true },
)

// ✅ Initialize Choices.js
const initializeChoices = async () => {
  await nextTick()

  choicesInstances.value.forEach((choice) => {
    if (choice && choice.destroy) {
      choice.destroy()
    }
  })
  choicesInstances.value = []

  form.details.forEach((item, index) => {
    const selectElement = document.getElementById(`select-barang-${index}`)
    if (selectElement) {
      const choices = new Choices(selectElement, {
        searchEnabled: true,
        searchPlaceholderValue: 'Ketik untuk mencari barang...',
        noResultsText: 'Tidak ditemukan',
        noChoicesText: 'Tidak ada pilihan',
        itemSelectText: 'Klik untuk pilih',
        shouldSort: false,
        removeItemButton: false,
      })

      selectElement.addEventListener('change', (event) => {
        item.item_id = parseInt(event.target.value) || ''
      })

      choicesInstances.value.push(choices)
    }
  })
}

// ✅ WATCH: Re-initialize Choices.js
watch(
  () => form.details.length,
  () => {
    initializeChoices()
  },
)

const tambahBarang = async () => {
  form.details.push({
    item_id: '',
    quantity: 1,
    price: 0,
    specifications: {
      panjang: null,
      lebar: null,
      tinggi: null,
      kwalitas: '',
      jenis: '',
      invoice_p: null,
      invoice_l: null,
      invoice_t: null,
      cutting_p: null,
      cutting_l: null,
      cutting_t: null,
      kubikasi: null,
    },
  })
  await nextTick()
  initializeChoices()
}

const hapusBarang = (index) => {
  if (form.details.length > 1) {
    form.details.splice(index, 1)
  }
}

const saveOrder = async () => {
  isSaving.value = true
  try {
    if (form.details.some((d) => !d.item_id)) {
      toast.error('Harap pilih barang untuk semua baris.')
      isSaving.value = false
      return
    }

    const payload = {
      ...form,
      details: form.details.map((d) => ({
        item_id: d.item_id,
        quantity: d.quantity,
        price: d.price,
        specifications: d.specifications,
      })),
    }

    if (isEditMode.value) {
      await apiClient.put(`/purchase-orders/${poId}`, payload)
      toast.success('Pesanan Pembelian berhasil diupdate!')
    } else {
      await apiClient.post('/purchase-orders', payload)
      toast.success('Pesanan Pembelian berhasil dibuat!')
    }
    router.push('/admin/pembelian')
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Gagal menyimpan pesanan.'
    toast.error(errorMessage)
    console.error(error)
  } finally {
    isSaving.value = false
  }
}

const fetchDataDropdown = async () => {
  try {
    const [supplierRes, barangRes] = await Promise.all([
      apiClient.get('/suppliers?all=true'),
      apiClient.get('/materials?all=true'),
    ])
    daftarSupplier.value = supplierRes.data.data
    daftarBarang.value = barangRes.data.data
  } catch (error) {
    toast.error('Gagal memuat data supplier atau barang.')
    console.error(error)
  }
}

const fetchPOData = async () => {
  if (!isEditMode.value) {
    tambahBarang()
    loading.value = false
    return
  }

  try {
    const response = await apiClient.get(`/purchase-orders/${poId}`)
    const data = response.data.data

    poNumber.value = data.po_number
    form.supplier_id = data.supplier_id
    form.order_date = data.order_date
    form.notes = data.notes || ''
    form.ppn_percentage = parseFloat(data.ppn_percentage || 0) // ✅ GANTI apply_ppn jadi ppn_percentage

    form.details = data.details.map((d) => {
      let specs = null
      if (d.specifications) {
        specs =
          typeof d.specifications === 'string' ? JSON.parse(d.specifications) : d.specifications
      }

      return {
        item_id: d.item_id,
        quantity: parseFloat(d.quantity_ordered),
        price: parseFloat(d.price),
        specifications: specs || {
          panjang: null,
          lebar: null,
          tinggi: null,
          kwalitas: '',
          jenis: '',
          invoice_p: null,
          invoice_l: null,
          invoice_t: null,
          cutting_p: null,
          cutting_l: null,
          cutting_t: null,
          kubikasi: null,
        },
      }
    })

    await nextTick()
    initializeChoices()
  } catch (error) {
    toast.error('Gagal memuat data PO.')
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  await fetchDataDropdown()
  await fetchPOData()
})

const formatCurrency = (value) => {
  if (isNaN(value)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}
</script>

<style scoped>
/* ===== LOADING STATE ===== */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
  background: white;
  border-radius: 16px;
  padding: 60px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #fef3c7;
  border-top-color: #f59e0b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 16px;
  color: #64748b;
  font-weight: 600;
}

/* ===== PAGE HEADER ===== */
.page-header {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
  padding: 32px 36px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.25);
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.2), transparent);
  pointer-events: none;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  gap: 24px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.header-left-section {
  display: flex;
  align-items: center;
  gap: 18px;
}

.icon-badge {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 6px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.page-subtitle {
  font-size: 14px;
  opacity: 0.95;
  margin: 0;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  color: #f59e0b;
  text-decoration: none;
  padding: 12px 22px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.btn-icon {
  font-size: 18px;
}

/* ===== CONTENT CARD ===== */
.content-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  border: 1px solid #f0f0f0;
}

.card-header-section {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px 32px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 3px solid #e9ecef;
  position: relative;
}

.card-header-section::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 32px;
  width: 70px;
  height: 3px;
  background: linear-gradient(90deg, #f59e0b, #22c55e);
  border-radius: 3px 3px 0 0;
}

.section-icon {
  font-size: 36px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
  border: 2px solid #fcd34d;
}

.section-title {
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.section-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.card-body {
  padding: 28px 32px;
}

.card-body-table {
  padding: 32px 36px;
}

/* ===== FORM GRID ===== */
.info-grid-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.form-group {
  margin-bottom: 0;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: block;
  margin-bottom: 10px;
  font-weight: 700;
  color: #1e293b;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 13px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.12);
}

textarea.form-control {
  resize: vertical;
  min-height: 90px;
  font-family: inherit;
}

/* ===== TABLE ===== */
.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
  background: white;
}

.detail-table thead {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
}

.detail-table th {
  padding: 18px 16px;
  text-align: left;
  color: white;
  font-weight: 800;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.th-material {
  width: 35%;
}

.th-qty {
  width: 15%;
}

.th-price {
  width: 20%;
}

.th-subtotal {
  width: 18%;
}

.th-action {
  width: 12%;
  text-align: center;
}

.data-row {
  transition: all 0.2s ease;
  border-bottom: 2px solid #f1f5f9;
}

.data-row:hover {
  background: linear-gradient(135deg, #fef3c7, #fef9c3);
}

.detail-table td {
  padding: 16px;
  vertical-align: middle;
}

.td-subtotal {
  font-weight: 800;
  color: #059669;
  font-size: 15px;
}

.td-action {
  text-align: center;
}

/* ===== SPECIFICATION ROW ===== */
.spec-row {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

.spec-cell {
  padding: 24px !important;
  border-bottom: 3px solid #bae6fd;
}

.spec-card {
  background: white;
  border: 2px solid #bae6fd;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}
/* ===== PPN SELECTOR (DROPDOWN) ===== */
.ppn-selector-compact {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border: 2px solid #bae6fd;
  border-radius: 10px;
}

.ppn-label-select {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 14px;
  color: #0c4a6e;
  margin: 0;
}

.ppn-icon {
  font-size: 18px;
}

.ppn-select {
  padding: 10px 16px;
  border: 2px solid #0ea5e9;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #0c4a6e;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
}

.ppn-select:hover {
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.ppn-select:focus {
  outline: none;
  border-color: #0284c7;
  box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.15);
}

.spec-title {
  font-weight: 800;
  color: #1e40af;
  margin: 0 0 16px 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.spec-title::before {
  content: '📐';
  font-size: 20px;
}

.spec-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.spec-grid-kayu {
  display: grid;
  grid-template-columns: 180px repeat(3, 1fr);
  gap: 12px;
  align-items: center;
}

.spec-label {
  font-weight: 700;
  color: #1e40af;
  font-size: 14px;
  grid-column: 1;
}

.form-control-spec {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
}

.form-control-spec:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-control-spec::placeholder {
  color: #94a3b8;
  font-size: 13px;
}

/* ===== AUTO KUBIKASI ===== */
.kubikasi-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  grid-column: 2 / -1;
}

.kubikasi-auto {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe) !important;
  border-color: #bae6fd !important;
  color: #0c4a6e !important;
  font-weight: 700 !important;
  cursor: not-allowed;
}

.kubikasi-auto:focus {
  border-color: #0ea5e9 !important;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1) !important;
}

.auto-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-size: 11px;
  font-weight: 800;
  border-radius: 20px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(0.98);
  }
}

/* ===== BUTTONS ===== */
.btn-delete {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #991b1b;
  border: 2px solid #fca5a5;
  border-radius: 10px;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s ease;
}

.btn-delete:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
  transform: scale(1.05);
}

.btn-delete:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-add-row {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn-add-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.4);
}

.table-actions {
  padding: 20px 0 0 0;
  text-align: left;
}

/* ===== CHOICES.JS STYLING ===== */
.choices {
  margin-bottom: 0;
  font-family: inherit;
}

.choices__inner {
  min-height: 46px;
  padding: 10px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  transition: all 0.2s ease;
}

.choices__inner:hover {
  border-color: #cbd5e1;
}

.choices.is-open .choices__inner,
.choices.is-focused .choices__inner {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.choices__list--dropdown {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  margin-top: 6px;
}

.choices__item--selectable {
  padding: 14px 16px;
  font-size: 14px;
  transition: all 0.15s ease;
}

.choices__item--selectable.is-highlighted {
  background: #fef3c7;
  color: #92400e;
}

.choices__input {
  font-size: 14px;
  padding: 8px;
  background: white;
  margin-bottom: 0;
}

.choices__input::placeholder {
  color: #94a3b8;
}

/* ===== PPN & SUMMARY SECTION ===== */
.summary-section {
  margin-top: 28px;
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  flex-wrap: wrap;
}

.ppn-checkbox-compact {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #f0f9ff;
  border: 2px solid #bae6fd;
  border-radius: 8px;
  cursor: pointer;
}

.ppn-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #0ea5e9;
}

.ppn-label {
  font-weight: 600;
  font-size: 14px;
  color: #0c4a6e;
  cursor: pointer;
  margin: 0;
}

.summary-compact {
  min-width: 320px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.summary-row-compact {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #e2e8f0;
}

.sum-label {
  font-weight: 600;
  font-size: 14px;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sum-value {
  font-weight: 700;
  font-size: 14px;
  color: #1e293b;
}

.ppn-row-compact.ppn-active {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  margin: 0 -20px;
  padding: 10px 20px;
  border-radius: 6px;
}

.ppn-badge-small {
  display: inline-flex;
  padding: 2px 6px;
  background: #10b981;
  color: white;
  font-size: 10px;
  font-weight: 800;
  border-radius: 4px;
}

.summary-divider-compact {
  height: 2px;
  background: linear-gradient(90deg, #e2e8f0, #cbd5e1, #e2e8f0);
  margin: 10px 0;
}

.summary-total-compact {
  margin-top: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-radius: 8px;
  border: 2px solid #0ea5e9;
}

.sum-label-total {
  font-weight: 800;
  font-size: 16px;
  color: #0c4a6e;
}

.sum-value-total {
  font-weight: 900;
  font-size: 20px;
  color: #0ea5e9;
}

/* ===== FORM ACTIONS ===== */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 28px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-radius: 12px;
  border: 2px solid #e9ecef;
}

.btn-submit-action {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-submit-action:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.45);
}

.btn-submit-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-icon {
  font-size: 18px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .info-grid-form {
    grid-template-columns: 1fr;
  }

  .spec-grid {
    grid-template-columns: 1fr;
  }

  .spec-grid-kayu {
    grid-template-columns: 1fr;
  }

  .spec-label {
    grid-column: auto;
  }

  .kubikasi-wrapper {
    grid-column: auto;
  }

  .summary-section {
    flex-direction: column;
    align-items: stretch;
  }

  .summary-compact {
    min-width: auto;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-submit-action {
    width: 100%;
    justify-content: center;
  }
}
/* Vue Select Styling */
.vue-select-supplier :deep(.vs__dropdown-toggle) {
  padding: 6px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  min-height: 48px;
  font-size: 15px;
  background-color: white;
}
.vue-select-supplier.vs--open :deep(.vs__dropdown-toggle) {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}
.vue-select-supplier :deep(.vs__selected) {
  font-weight: 600;
  color: #1e293b;
}
.vue-select-supplier :deep(.vs__search::placeholder) {
  color: #94a3b8;
}
</style>
