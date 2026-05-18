<template>
  <DashboardLayout>
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left-section">
          <div class="icon-badge">✏️</div>
          <div>
            <h1 class="page-title">Edit Pesanan Pembelian (PO)</h1>
            <p class="page-subtitle">
              Edit purchase order {{ poNumber }}
              <span v-if="loading" class="loading-badge">⏳ Loading...</span>
            </p>
          </div>
        </div>
        <router-link to="/admin/pembelian" class="btn-back">
          <span class="btn-icon">←</span>
          <span>Kembali ke Daftar</span>
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p class="loading-text">Memuat data PO...</p>
    </div>

    <!-- Form (Hidden saat loading) -->
    <form v-else @submit.prevent="updateOrder">
      <!-- Informasi Utama Card -->
      <div class="content-card">
        <div class="card-header-section">
          <div class="section-icon-wrapper">
            <div class="section-icon">ℹ️</div>
          </div>
          <div class="section-header-text">
            <h2 class="section-title">Informasi Utama</h2>
            <p class="section-subtitle">Edit data supplier dan tanggal pemesanan</p>
          </div>
        </div>

        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">🏭</span>
                <span>Supplier</span>
                <span class="required">*</span>
              </label>
              <select v-model="form.supplier_id" class="form-control" required>
                <option disabled value="">Pilih Supplier</option>
                <option v-for="supplier in daftarSupplier" :key="supplier.id" :value="supplier.id">
                  {{ supplier.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">📅</span>
                <span>Tanggal Pesan</span>
                <span class="required">*</span>
              </label>
              <input type="date" v-model="form.order_date" class="form-control" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">📄</span>
              <span>Catatan (Opsional)</span>
            </label>
            <textarea
              v-model="form.notes"
              rows="3"
              class="form-control"
              placeholder="Contoh: Pengiriman prioritas, instruksi khusus, dll."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Detail Barang Card -->
      <div class="content-card">
        <div class="card-header-section">
          <div class="section-icon-wrapper">
            <div class="section-icon">📦</div>
          </div>
          <div class="section-header-text">
            <h2 class="section-title">Detail Barang</h2>
            <p class="section-subtitle">
              Edit bahan baku yang dipesan
              <span class="item-badge">{{ form.detail.length }} item</span>
            </p>
          </div>
        </div>

        <div class="card-body-table">
          <div class="table-container">
            <div class="table-wrapper">
              <table class="detail-table">
                <thead>
                  <tr>
                    <th class="th-material">
                      <div class="th-content">
                        <span class="th-icon">📦</span>
                        <span>Barang (Bahan Baku)</span>
                      </div>
                    </th>
                    <th class="th-qty">
                      <div class="th-content">
                        <span class="th-icon">📊</span>
                        <span>Jumlah</span>
                      </div>
                    </th>
                    <th class="th-price">
                      <div class="th-content">
                        <span class="th-icon">💰</span>
                        <span>Harga Satuan</span>
                      </div>
                    </th>
                    <th class="th-subtotal">
                      <div class="th-content">
                        <span class="th-icon">💵</span>
                        <span>Subtotal</span>
                      </div>
                    </th>
                    <th class="th-action">
                      <div class="th-content">
                        <span>Aksi</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(item, index) in form.detail" :key="index">
                    <!-- Main Row -->
                    <tr class="detail-row">
                      <td class="td-material">
                        <select
                          :id="'select-barang-' + index"
                          v-model="item.item_id"
                          class="choices-select"
                          required
                        >
                          <option value="">Pilih Barang...</option>
                          <option
                            v-for="barang in daftarBarang"
                            :key="barang.id"
                            :value="barang.id"
                          >
                            {{ barang.code }} - {{ barang.name }}
                          </option>
                        </select>
                      </td>

                      <td class="td-qty">
                        <input
                          v-model.number="item.quantity_ordered"
                          type="number"
                          step="any"
                          min="0.01"
                          class="table-input"
                          required
                        />
                      </td>

                      <td class="td-price">
                        <div class="input-with-currency">
                          <span class="currency-prefix">Rp</span>
                          <input
                            v-model.number="item.price"
                            type="number"
                            step="any"
                            min="0"
                            class="table-input has-prefix"
                            required
                          />
                        </div>
                      </td>

                      <td class="td-subtotal">
                        <div class="subtotal-wrapper">
                          <span class="subtotal-value">{{
                            formatRupiah((item.quantity_ordered || 0) * (item.price || 0))
                          }}</span>
                        </div>
                      </td>

                      <td class="td-action">
                        <button
                          type="button"
                          @click="hapusBarang(index)"
                          class="btn-delete-row"
                          :disabled="form.detail.length === 1"
                          title="Hapus baris"
                        >
                          <span>🗑️</span>
                        </button>
                      </td>
                    </tr>

                    <!-- ✅ SPECIFICATION ROW - KARTON BOX -->
                    <tr v-if="isKartonBox(item.item_id)" class="spec-row">
                      <td colspan="5" class="spec-cell">
                        <div class="spec-card karton-spec">
                          <div class="spec-header">
                            <span class="spec-icon">📦</span>
                            <h4 class="spec-title">Spesifikasi Karton Box</h4>
                          </div>
                          <div class="spec-grid">
                            <div class="spec-item">
                              <span class="spec-label">Panjang (mm):</span>
                              <input
                                v-model.number="item.specifications.panjang"
                                type="number"
                                step="any"
                                class="form-control-spec"
                                placeholder="Contoh: 1200"
                              />
                            </div>
                            <div class="spec-item">
                              <span class="spec-label">Lebar (mm):</span>
                              <input
                                v-model.number="item.specifications.lebar"
                                type="number"
                                step="any"
                                class="form-control-spec"
                                placeholder="Contoh: 2400"
                              />
                            </div>
                            <div class="spec-item">
                              <span class="spec-label">Tinggi (mm):</span>
                              <input
                                v-model.number="item.specifications.tinggi"
                                type="number"
                                step="any"
                                class="form-control-spec"
                                placeholder="Contoh: 150"
                              />
                            </div>
                            <div class="spec-item full-width">
                              <span class="spec-label">Kwalitas:</span>
                              <input
                                v-model="item.specifications.kwalitas"
                                type="text"
                                class="form-control-spec"
                                placeholder="Contoh: B/F, C/F, dll"
                              />
                            </div>
                            <div class="spec-item full-width">
                              <span class="spec-label">Jenis:</span>
                              <input
                                v-model="item.specifications.jenis"
                                type="text"
                                class="form-control-spec"
                                placeholder="Contoh: Single Wall, Double Wall"
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>

                    <!-- ✅ SPECIFICATION ROW - KAYU -->
                    <tr v-if="isKayu(item.item_id)" class="spec-row">
                      <td colspan="5" class="spec-cell">
                        <div class="spec-card kayu-spec">
                          <div class="spec-header">
                            <span class="spec-icon">🪵</span>
                            <h4 class="spec-title">Spesifikasi Kayu</h4>
                          </div>

                          <!-- Invoice Size -->
                          <div class="spec-section">
                            <h5 class="spec-section-title">Invoice Size (mm)</h5>
                            <div class="spec-grid-kayu">
                              <span class="spec-label">Ukuran:</span>
                              <input
                                v-model.number="item.specifications.invoice_p"
                                type="number"
                                step="any"
                                class="form-control-spec"
                                placeholder="P"
                              />
                              <input
                                v-model.number="item.specifications.invoice_l"
                                type="number"
                                step="any"
                                class="form-control-spec"
                                placeholder="L"
                              />
                              <input
                                v-model.number="item.specifications.invoice_t"
                                type="number"
                                step="any"
                                class="form-control-spec"
                                placeholder="T"
                              />
                            </div>
                          </div>

                          <!-- Cutting Size -->
                          <div class="spec-section">
                            <h5 class="spec-section-title">Cutting Size (mm)</h5>
                            <div class="spec-grid-kayu">
                              <span class="spec-label">Ukuran:</span>
                              <input
                                v-model.number="item.specifications.cutting_p"
                                type="number"
                                step="any"
                                class="form-control-spec"
                                placeholder="P"
                              />
                              <input
                                v-model.number="item.specifications.cutting_l"
                                type="number"
                                step="any"
                                class="form-control-spec"
                                placeholder="L"
                              />
                              <input
                                v-model.number="item.specifications.cutting_t"
                                type="number"
                                step="any"
                                class="form-control-spec"
                                placeholder="T"
                              />
                            </div>
                          </div>

                          <!-- Kubikasi -->
                          <div class="spec-section">
                            <h5 class="spec-section-title">Kubikasi</h5>
                            <div class="kubikasi-wrapper">
                              <input
                                :value="item.specifications.kubikasi"
                                type="text"
                                class="form-control-spec kubikasi-auto"
                                placeholder="Auto calculate"
                                readonly
                              />
                              <span class="auto-badge">🤖 AUTO</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>

          <button type="button" @click="tambahBarang" class="btn-add-row">
            <span class="btn-icon">➕</span>
            <span>Tambah Barang</span>
          </button>

          <!-- Summary Section -->
          <div class="summary-section">
            <div class="ppn-options-compact">
              <label class="ppn-radio">
                <input type="radio" v-model.number="form.ppn_percentage" :value="0" />
                <span>0%</span>
              </label>
              <label class="ppn-radio">
                <input type="radio" v-model.number="form.ppn_percentage" :value="11" />
                <span>11%</span>
              </label>
              <label class="ppn-radio">
                <input type="radio" v-model.number="form.ppn_percentage" :value="12" />
                <span>12%</span>
              </label>
            </div>

            <div class="summary-compact">
              <div class="summary-row-compact">
                <span class="sum-label">Subtotal</span>
                <span class="sum-value">{{ formatCurrency(subtotal) }}</span>
              </div>

              <div
                class="summary-row-compact ppn-row-compact"
                :class="{ 'ppn-active': form.ppn_percentage > 0 }"
              >
                <span class="sum-label">
                  <span class="ppn-badge-small" v-if="form.ppn_percentage > 0"
                    >{{ form.ppn_percentage }}%</span
                  >
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

      <!-- Form Actions -->
      <div class="form-actions">
        <router-link to="/admin/pembelian" class="btn-cancel-action">
          <span class="action-icon">❌</span>
          <span>Batalkan</span>
        </router-link>
        <button type="submit" class="btn-submit-action" :disabled="sedangMenyimpan">
          <span class="action-icon">{{ sedangMenyimpan ? '⏳' : '💾' }}</span>
          <span>{{ sedangMenyimpan ? 'Menyimpan...' : 'Update Pesanan Pembelian' }}</span>
        </button>
      </div>
    </form>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '../../../api/axios'
import DashboardLayout from '../../../components/DashboardLayout.vue'
import { useToast } from 'vue-toastification'
import Choices from 'choices.js'
import 'choices.js/public/assets/styles/choices.min.css'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const poId = route.params.id
const poNumber = ref('')
const loading = ref(true)
const poType = ref('operasional')
const sedangMenyimpan = ref(false)
const choicesInstances = ref([])
const daftarSupplier = ref([])
const daftarBarang = ref([])

const form = reactive({
  supplier_id: '',
  order_date: '',
  notes: '',
  ppn_percentage: 12,
  detail: [],
})

// COMPUTED: Calculations
const subtotal = computed(() => {
  return form.detail.reduce((acc, item) => {
    return acc + (parseFloat(item.quantity_ordered) || 0) * (parseFloat(item.price) || 0)
  }, 0)
})

const ppnAmount = computed(() => {
  return subtotal.value * (form.ppn_percentage / 100)
})

const grandTotal = computed(() => {
  return subtotal.value + ppnAmount.value
})

// FUNCTION: Calculate Kubikasi
const calculateKubikasi = (p, l, t) => {
  const pMm = parseFloat(p) || 0
  const lMm = parseFloat(l) || 0
  const tMm = parseFloat(t) || 0

  if (pMm === 0 || lMm === 0 || tMm === 0) return null

  const kubikasi = (pMm * lMm * tMm) / 1000000000
  return parseFloat(kubikasi.toFixed(6))
}

// Helper Functions
const getItemById = (itemId) => daftarBarang.value.find((b) => b.id === itemId)

const isKartonBox = (itemId) => {
  const item = getItemById(itemId)
  return item && item.name.toLowerCase().includes('karton')
}

const isKayu = (itemId) => {
  const item = getItemById(itemId)
  return item && item.name.toLowerCase().includes('kayu')
}

// WATCH: Auto-calculate kubikasi
watch(
  () =>
    form.detail.map((item) => [
      item.specifications?.invoice_p,
      item.specifications?.invoice_l,
      item.specifications?.invoice_t,
    ]),
  (newValues) => {
    newValues.forEach(([p, l, t], index) => {
      if (form.detail[index]?.specifications && isKayu(form.detail[index].item_id)) {
        form.detail[index].specifications.kubikasi = calculateKubikasi(p, l, t)
      }
    })
  },
  { deep: true },
)

// Initialize Choices.js
const initializeChoices = async () => {
  await nextTick()

  choicesInstances.value.forEach((choice) => {
    if (choice && choice.destroy) {
      choice.destroy()
    }
  })
  choicesInstances.value = []

  form.detail.forEach((item, index) => {
    const selectElement = document.getElementById(`select-barang-${index}`)
    if (selectElement) {
      const choices = new Choices(selectElement, {
        searchEnabled: true,
        searchPlaceholderValue: 'Cari barang...',
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

watch(
  () => form.detail.length,
  () => {
    initializeChoices()
  },
)

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka)
}

// Fetch PO Data
const fetchPOData = async () => {
  try {
    const response = await apiClient.get(`/purchase-orders/${poId}`)
    const data = response.data.data

    poNumber.value = data.po_number
    poType.value = data.type // Simpan Tipe PO saat data dimuat
    form.supplier_id = data.supplier_id
    form.order_date = data.order_date
    form.notes = data.notes || ''
    form.ppn_percentage = parseFloat(data.ppn_percentage || 0) // Parse specifications

    form.detail = data.details.map((detail) => {
      let specs = null
      if (detail.specifications) {
        specs =
          typeof detail.specifications === 'string'
            ? JSON.parse(detail.specifications)
            : detail.specifications
      }

      return {
        id: detail.id,
        item_id: detail.item_id,
        // ✅ PERBAIKAN: Huruf 'i' dihapus
        quantity_ordered: parseFloat(detail.quantity_ordered),
        price: parseFloat(detail.price),
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

    loading.value = false
    await nextTick()
    initializeChoices()
  } catch (error) {
    toast.error('Gagal memuat data PO.')
    console.error(error)
    router.push('/admin/pembelian/operasional')
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

const tambahBarang = async () => {
  form.detail.push({
    item_id: '',
    quantity_ordered: 1,
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
      // ✅ PERBAIKAN: Huruf 's' dihapus
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
  if (form.detail.length > 1) {
    form.detail.splice(index, 1)
  }
}

const updateOrder = async () => {
  sedangMenyimpan.value = true
  try {
    const payload = {
      supplier_id: form.supplier_id,
      order_date: form.order_date,
      notes: form.notes,
      type: poType.value, // Gunakan Tipe PO yang sudah disimpan
      // ✅ PERBAIKAN: Huruf 't' dihapus
      ppn_percentage: form.ppn_percentage,
      details: form.detail.map((d) => ({
        id: d.id || null,
        item_id: d.item_id,
        quantity: d.quantity_ordered,
        price: d.price,
        specifications: d.specifications,
      })),
    }

    await apiClient.put(`/purchase-orders/${poId}`, payload)
    toast.success('Pesanan Pembelian berhasil diupdate!')
    router.push('/admin/pembelian')
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      const errorMessages = Object.values(error.response.data.errors).flat().join('\n')
      toast.error(errorMessages)
    } else {
      toast.error('Gagal mengupdate pesanan pembelian.')
      //
    }
    console.error('Error:', error)
  } finally {
    sedangMenyimpan.value = false
  }
}

onMounted(async () => {
  await fetchDataDropdown()
  await fetchPOData()
})
</script>
<style scoped>
/* Loading State */
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

.loading-badge {
  display: inline-flex;
  padding: 4px 10px;
  background: #fef3c7;
  color: #92400e;
  font-size: 12px;
  font-weight: 700;
  border-radius: 12px;
  margin-left: 10px;
}

/* Page Header */
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
  border: 2px solid rgba(25, 255, 255, 0.3);
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
  display: flex;
  align-items: center;
  gap: 10px;
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

/* Content Card */
.content-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  border: 1px solid #f0f0;
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
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-badge {
  display: inline-flex;
  padding: 3px 8px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 12px;
}

.card-body {
  padding: 28px 32px;
}

.card-body-table {
  padding: 32px 36px;
}

/* Form */
.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-weight: 700;
  color: #1e293b;
  font-size: 14px;
}

.label-icon {
  font-size: 16px;
}

.required {
  color: #ef4444;
  font-weight: 800;
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
}

/* Table */
.table-container {
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  padding: 24px;
  border-radius: 14px;
  margin-bottom: 24px;
  border: 2px solid #e9ecef;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
  background: white;
}

.detail-table thead {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
}

.detail-table th {
  padding: 20px;
  text-align: left;
  color: white;
  font-weight: 800;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.th-icon {
  font-size: 18px;
}

.th-material {
  width: 45%;
  min-width: 450px;
}
.th-qty {
  width: 12%;
  min-width: 120px;
}
.th-price {
  width: 18%;
  min-width: 170px;
}
.th-subtotal {
  width: 18%;
  min-width: 170px;
}
.th-action {
  width: 7%;
  min-width: 90px;
  text-align: center;
}

.detail-row {
  transition: all 0.2s ease;
}

.detail-row:hover {
  background: #fef3c7;
}

.detail-table td {
  padding: 16px 18px;
  border-bottom: 2px solid #f1f5f9;
  vertical-align: middle;
}

.input-with-currency {
  position: relative;
}

.currency-prefix {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 700;
  color: #64748b;
  font-size: 14px;
  z-index: 1;
}

.table-input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  background: white;
  min-height: 46px;
}

.table-input.has-prefix {
  padding-left: 42px;
}

.table-input:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.subtotal-wrapper {
  display: flex;
  justify-content: flex-end;
}

.subtotal-value {
  font-weight: 800;
  color: #059669;
  font-size: 16px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-radius: 8px;
  border: 2px solid #6ee7b7;
  min-width: 130px;
  text-align: right;
}

.btn-delete-row {
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

.btn-delete-row:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
  transform: scale(1.05);
}

.btn-delete-row:disabled {
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
}

.btn-add-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.4);
}

/* Choices.js */
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

/* Summary */
.summary-section {
  margin-top: 28px;
  display: flex;
  justify-content: flex-end;
  gap: 20px;
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
/* ===== SPECIFICATION STYLING ===== */
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
    max-height: 1000px;
  }
}

.spec-cell {
  padding: 24px !important;
  border-bottom: 3px solid #bae6fd;
}

.spec-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin: 0 auto;
  max-width: 1000px;
}

.karton-spec {
  border: 2px solid #bae6fd;
}

.kayu-spec {
  border: 2px solid #fed7aa;
}

.spec-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
}

.spec-icon {
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #e0f2fe, #bae6fd);
  border-radius: 10px;
  border: 2px solid #7dd3fc;
}

.kayu-spec .spec-icon {
  background: linear-gradient(135deg, #fef3c7, #fed7aa);
  border-color: #fbbf24;
}

.spec-title {
  font-weight: 800;
  color: #0c4a6e;
  margin: 0;
  font-size: 18px;
}

.kayu-spec .spec-title {
  color: #92400e;
}

.spec-section {
  margin-bottom: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 10px;
  border: 2px solid #e2e8f0;
}

.spec-section:last-child {
  margin-bottom: 0;
}

.spec-section-title {
  font-weight: 700;
  color: #475569;
  margin: 0 0 12px 0;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.spec-section-title::before {
  content: '▸';
  font-size: 16px;
  color: #0ea5e9;
}

.spec-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.spec-item.full-width {
  grid-column: 1 / -1;
}

.spec-label {
  font-weight: 600;
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-control-spec {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  background: white;
  transition: all 0.2s ease;
}

.form-control-spec:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.spec-grid-kayu {
  display: grid;
  grid-template-columns: auto repeat(3, 1fr);
  gap: 10px;
  align-items: center;
}

.spec-grid-kayu .spec-label {
  margin: 0;
}

.kubikasi-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.kubikasi-auto {
  flex: 1;
  background: #f0f9ff !important;
  color: #0c4a6e;
  font-weight: 700;
  cursor: not-allowed;
}

.auto-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-size: 12px;
  font-weight: 800;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  white-space: nowrap;
}

/* Responsive Spec */
@media (max-width: 768px) {
  .spec-grid {
    grid-template-columns: 1fr;
  }

  .spec-grid-kayu {
    grid-template-columns: 1fr;
  }

  .spec-card {
    padding: 16px;
  }

  .spec-section {
    padding: 12px;
  }

  .kubikasi-wrapper {
    flex-direction: column;
    align-items: stretch;
  }
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

/* Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 28px;
}

.btn-cancel-action,
.btn-submit-action {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-cancel-action {
  background: #f8f9fa;
  color: #475569;
  border: 2px solid #cbd5e1;
}

.btn-submit-action {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: none;
}

.btn-submit-action:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(245, 158, 11, 0.45);
}

.action-icon {
  font-size: 18px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  .summary-section {
    flex-direction: column;
    align-items: stretch;
  }
  .summary-compact {
    min-width: auto;
  }
}
</style>
