<template>
  <DashboardLayout>
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left-section">
          <div class="icon-badge">📋</div>
          <div>
            <h1 class="page-title">Detail Pesanan Pembelian</h1>
            <p class="page-subtitle">
              Purchase Order {{ poNumber }}
              <span v-if="loading" class="loading-badge">⏳ Loading...</span>
            </p>
          </div>
        </div>
        <button class="btn-back" @click="goBackToList()">
          <span class="btn-icon">←</span>
          <span>Kembali ke Daftar</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p class="loading-text">Memuat data PO...</p>
    </div>

    <!-- Detail Content -->
    <div v-else class="detail-content">
      <!-- Informasi Utama Card -->
      <div class="content-card">
        <div class="card-header-section">
          <div class="section-icon-wrapper">
            <div class="section-icon">ℹ️</div>
          </div>
          <div class="section-header-text">
            <h2 class="section-title">Informasi Utama</h2>
            <p class="section-subtitle">Data supplier dan tanggal pemesanan</p>
          </div>
        </div>

        <div class="card-body">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">
                <span class="label-icon">🏭</span>
                <span>Supplier</span>
              </div>
              <div class="info-value">
                {{ selectedSupplier ? selectedSupplier.name : 'Tidak ditemukan' }}
              </div>
            </div>

            <div class="info-item">
              <div class="info-label">
                <span class="label-icon">📅</span>
                <span>Tanggal Pesan</span>
              </div>
              <div class="info-value">
                {{ formatTanggal(form.order_date) }}
              </div>
            </div>

            <div class="info-item">
              <div class="info-label">
                <span class="label-icon">🏷️</span>
                <span>Status</span>
              </div>
              <div class="info-value">
                <span :class="['status-badge', `status-${form.status.toLowerCase()}`]">
                  {{ form.status }}
                </span>
              </div>
            </div>

            <div class="info-item" v-if="isForeign">
              <div class="info-label">
                <span class="label-icon">💱</span>
                <span>Mata Uang</span>
              </div>
              <div class="info-value">
                <span class="status-badge status-foreign">{{ form.currency }} · Kurs {{ formatRupiah(form.exchange_rate) }}</span>
              </div>
            </div>

            <div class="info-item full-width">
              <div class="info-label">
                <span class="label-icon">📄</span>
                <span>Catatan</span>
              </div>
              <div class="info-value notes-value">
                {{ form.notes || '-' }}
              </div>
            </div>
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
              Daftar barang yang dipesan
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
                    <th class="th-no">
                      <div class="th-content">
                        <span class="th-icon">#</span>
                        <span>No</span>
                      </div>
                    </th>
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
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(item, index) in form.detail" :key="index">
                    <!-- Main Row -->
                    <tr class="data-row">
                      <td class="td-no">
                        <span class="row-number">{{ index + 1 }}</span>
                      </td>
                      <td class="td-material">
                        {{ getItemName(item.item_id) }}
                      </td>
                      <td class="td-qty">
                        <span class="qty-badge">{{ item.quantity_ordered }}</span>
                      </td>
                      <td class="td-price">
                        <span v-if="isForeign">{{ foreignSymbol }} {{ formatForeign(item.price) }}</span>
                        <span v-else>{{ formatRupiah(item.price) }}</span>
                      </td>
                      <td class="td-subtotal">
                        <div class="subtotal-wrapper">
                          <span class="subtotal-value">
                            {{ formatRupiah(item.subtotal) }}
                          </span>
                        </div>
                      </td>
                    </tr>

                    <!-- ✅ Specification Row untuk Karton Box -->
                    <tr v-if="isKartonBox(item.item_id) && item.specifications" class="spec-row">
                      <td colspan="5" class="spec-cell">
                        <div class="spec-card karton-spec">
                          <div class="spec-header">
                            <span class="spec-icon">📦</span>
                            <h4 class="spec-title">Spesifikasi Karton Box</h4>
                          </div>
                          <div class="spec-grid">
                            <div class="spec-item" v-if="item.specifications.panjang">
                              <span class="spec-label">Panjang:</span>
                              <span class="spec-value">{{ item.specifications.panjang }} mm</span>
                            </div>
                            <div class="spec-item" v-if="item.specifications.lebar">
                              <span class="spec-label">Lebar:</span>
                              <span class="spec-value">{{ item.specifications.lebar }} mm</span>
                            </div>
                            <div class="spec-item" v-if="item.specifications.tinggi">
                              <span class="spec-label">Tinggi:</span>
                              <span class="spec-value">{{ item.specifications.tinggi }} mm</span>
                            </div>
                            <div class="spec-item full-width" v-if="item.specifications.kwalitas">
                              <span class="spec-label">Kwalitas:</span>
                              <span class="spec-value highlight">{{
                                item.specifications.kwalitas
                              }}</span>
                            </div>
                            <div class="spec-item full-width" v-if="item.specifications.jenis">
                              <span class="spec-label">Jenis:</span>
                              <span class="spec-value highlight">{{
                                item.specifications.jenis
                              }}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>

                    <!-- ✅ Specification Row untuk Kayu -->
                    <tr v-if="isKayu(item.item_id) && item.specifications" class="spec-row">
                      <td colspan="5" class="spec-cell">
                        <div class="spec-card kayu-spec">
                          <div class="spec-header">
                            <span class="spec-icon">🪵</span>
                            <h4 class="spec-title">Spesifikasi Kayu</h4>
                          </div>

                          <!-- Invoice Size -->
                          <div class="spec-section">
                            <h5 class="spec-section-title">Invoice Size (mm)</h5>
                            <div class="spec-grid">
                              <div class="spec-item" v-if="item.specifications.invoice_p">
                                <span class="spec-label">Panjang:</span>
                                <span class="spec-value"
                                  >{{ item.specifications.invoice_p }} mm</span
                                >
                              </div>
                              <div class="spec-item" v-if="item.specifications.invoice_l">
                                <span class="spec-label">Lebar:</span>
                                <span class="spec-value"
                                  >{{ item.specifications.invoice_l }} mm</span
                                >
                              </div>
                              <div class="spec-item" v-if="item.specifications.invoice_t">
                                <span class="spec-label">Tinggi:</span>
                                <span class="spec-value"
                                  >{{ item.specifications.invoice_t }} mm</span
                                >
                              </div>
                            </div>
                          </div>

                          <!-- Cutting Size -->
                          <div class="spec-section">
                            <h5 class="spec-section-title">Cutting Size (mm)</h5>
                            <div class="spec-grid">
                              <div class="spec-item" v-if="item.specifications.cutting_p">
                                <span class="spec-label">Panjang:</span>
                                <span class="spec-value"
                                  >{{ item.specifications.cutting_p }} mm</span
                                >
                              </div>
                              <div class="spec-item" v-if="item.specifications.cutting_l">
                                <span class="spec-label">Lebar:</span>
                                <span class="spec-value"
                                  >{{ item.specifications.cutting_l }} mm</span
                                >
                              </div>
                              <div class="spec-item" v-if="item.specifications.cutting_t">
                                <span class="spec-label">Tinggi:</span>
                                <span class="spec-value"
                                  >{{ item.specifications.cutting_t }} mm</span
                                >
                              </div>
                            </div>
                          </div>

                          <!-- Kubikasi -->
                          <div class="spec-section" v-if="item.specifications.kubikasi">
                            <h5 class="spec-section-title">Kubikasi</h5>
                            <div class="kubikasi-display">
                              <span class="kubikasi-value"
                                >{{ item.specifications.kubikasi }} m³</span
                              >
                              <span class="kubikasi-badge">🤖 AUTO</span>
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

          <!-- Summary Section -->
          <div class="summary-section">
            <div class="ppn-info-box">
              <div class="ppn-indicator" :class="{ active: form.ppn_percentage > 0 }">
                <span class="ppn-icon">{{ form.ppn_percentage > 0 ? '✅' : '❌' }}</span>
                <span class="ppn-text">PPN {{ form.ppn_percentage }}%</span>
              </div>
            </div>

            <div class="summary-box">
              <div class="summary-row">
                <span class="sum-label">Subtotal</span>
                <span class="sum-value">{{ formatCurrency(subtotal) }}</span>
              </div>

              <div class="summary-row ppn-row" :class="{ active: form.ppn_percentage > 0 }">
                <span class="sum-label">
                  <span class="ppn-badge" v-if="form.ppn_percentage > 0"
                    >{{ form.ppn_percentage }}%</span
                  >
                  PPN
                </span>
                <span class="sum-value">{{ formatCurrency(ppnAmount) }}</span>
              </div>

              <div class="summary-row" v-if="form.other_cost > 0">
                <span class="sum-label">
                  Biaya Lain-lain
                  <span v-if="form.other_cost_description" class="other-cost-desc">({{ form.other_cost_description }})</span>
                </span>
                <span class="sum-value">{{ formatCurrency(form.other_cost) }}</span>
              </div>

              <div class="summary-divider"></div>

              <div class="summary-row summary-total">
                <span class="sum-label-total">Grand Total</span>
                <span class="sum-value-total">{{ formatCurrency(grandTotal) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Actions -->
      <div class="detail-actions">
        <router-link :to="listReturnTo || '/admin/pembelian/operasional'" class="btn-action btn-cancel">
          <span class="action-icon">←</span>
          <span>Kembali</span>
        </router-link>
        <router-link
          v-if="form.status === 'Open' || form.status === 'Terbuka'"
          :to="{ name: editRouteName, params: { id: poId } }"
          class="btn-action btn-edit"
        >
          <span class="action-icon">✏️</span>
          <span>Edit Pesanan</span>
        </router-link>
        <router-link
          v-if="form.status === 'Open' || form.status === 'Terbuka'"
          :to="{
            name: 'tambah-penerimaan-barang',
            params: { po_id: poId },
            query: listReturnTo ? { returnTo: listReturnTo } : {},
          }"
          class="btn-action btn-receive"
        >
          <span class="action-icon">📦</span>
          <span>Terima Barang</span>
        </router-link>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '../../../api/axios'
import DashboardLayout from '../../../components/DashboardLayout.vue'
import { useToast } from 'vue-toastification'

const router = useRouter()
const route = useRoute()
const toast = useToast()

// Kalau halaman ini dibuka dari list dengan ?returnTo=... (mis. Pembelian Operasional yang
// lagi di halaman pagination tertentu), kembali persis ke situ — bukan router.back() yang bisa
// meleset. Query ini juga diteruskan ke link "Terima Barang" supaya sampai ke sana pun tetap
// tahu harus balik ke halaman list mana.
const listReturnTo = route.query.returnTo || null
const goBackToList = () => {
  if (listReturnTo) {
    router.push(listReturnTo)
  } else {
    router.back()
  }
}

const poId = route.params.id
const poNumber = ref('')
const loading = ref(true)

const daftarSupplier = ref([])
const daftarBarang = ref([])

const form = reactive({
  supplier_id: '',
  order_date: '',
  notes: '',
  ppn_percentage: 12,
  status: '',
  currency: 'IDR',
  exchange_rate: 1,
  other_cost: 0,
  other_cost_description: '',
  type: '',
  detail: [],
})

// Setiap tipe PO punya form edit sendiri (FormOperasional/FormKarton/FormKayu) yang lebih
// lengkap (currency, biaya lain-lain, dll) dibanding form generik lama (EditPesananPembelian).
// Route Edit dari halaman Detail harus ikut tipe PO-nya, bukan selalu ke form generik.
const editRouteName = computed(() => {
  switch (form.type) {
    case 'operasional': return 'EditPembelianOperasional'
    case 'karton': return 'EditPembelianKarton'
    case 'kayu': return 'EditPembelianKayu'
    default: return 'EditPesananPembelian'
  }
})

const selectedSupplier = computed(() => {
  return daftarSupplier.value.find((supplier) => supplier.id === form.supplier_id)
})

const isUSD = computed(() => form.currency === 'USD')
const isEUR = computed(() => form.currency === 'EUR')
const isForeign = computed(() => isUSD.value || isEUR.value)
const foreignSymbol = computed(() => (isEUR.value ? '€' : '$'))

const formatForeign = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value || 0)
}

// Subtotal per baris (item.subtotal) sudah dihitung backend dalam IDR (qty × price × exchange_rate)
// — jangan hitung ulang dari qty × price mentah di sini, karena untuk PO USD/EUR itu masih
// dalam mata uang asing, bukan IDR (lihat catatan Foreign Currency Purchase di CLAUDE.md).
const subtotal = computed(() => {
  return form.detail.reduce((acc, item) => acc + (parseFloat(item.subtotal) || 0), 0)
})

const ppnAmount = computed(() => {
  return subtotal.value * (form.ppn_percentage / 100)
})

const grandTotal = computed(() => {
  return subtotal.value + ppnAmount.value + (parseFloat(form.other_cost) || 0)
})

const formatTanggal = (tanggal) => {
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

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

const getItemName = (itemId) => {
  const item = daftarBarang.value.find((b) => b.id === itemId)
  return item ? `${item.code} - ${item.name}` : 'Item tidak ditemukan'
}

// ✅ TAMBAH: Helper functions untuk cek jenis barang
const getItemById = (itemId) => {
  return daftarBarang.value.find((b) => b.id === itemId)
}

const isKartonBox = (itemId) => {
  const item = getItemById(itemId)
  return item && item.name.toLowerCase().includes('karton')
}

const isKayu = (itemId) => {
  const item = getItemById(itemId)
  return item && item.name.toLowerCase().includes('kayu')
}

const fetchPOData = async () => {
  try {
    const response = await apiClient.get(`/purchase-orders/${poId}`)
    const data = response.data.data

    poNumber.value = data.po_number
    form.supplier_id = data.supplier_id
    form.order_date = data.order_date
    form.notes = data.notes || ''
    form.ppn_percentage = parseFloat(data.ppn_percentage || 0)
    form.status = data.status || 'Draft'
    form.currency = data.currency || 'IDR'
    form.other_cost = parseFloat(data.other_cost || 0)
    form.other_cost_description = data.other_cost_description || ''
    form.type = data.type || ''
    form.exchange_rate = parseFloat(data.exchange_rate || 1)

    // ✅ PERBAIKAN: Ambil specifications dari database
    form.detail = data.details.map((detail) => ({
      id: detail.id,
      item_id: detail.item_id,
      quantity_ordered: parseFloat(detail.quantity_ordered),
      price: parseFloat(detail.price),
      // subtotal sudah dihitung backend dalam IDR (qty × price × exchange_rate) — fallback
      // dihitung manual cuma untuk data lama yang kebetulan belum punya nilai subtotal tersimpan.
      subtotal:
        detail.subtotal != null
          ? parseFloat(detail.subtotal)
          : parseFloat(detail.quantity_ordered) * parseFloat(detail.price) * form.exchange_rate,
      specifications: detail.specifications || null, // ✅ TAMBAH INI
    }))

    loading.value = false
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

onMounted(async () => {
  await fetchDataDropdown()
  await fetchPOData()
})
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
  border: 6px solid #e0e7ff;
  border-top-color: #6366f1;
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
  background: #e0e7ff;
  color: #4338ca;
  font-size: 12px;
  font-weight: 700;
  border-radius: 12px;
  margin-left: 10px;
}

/* ===== PAGE HEADER ===== */
.page-header {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #7c3aed 100%);
  padding: 32px 36px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.25);
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
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  color: #6366f1;
  text-decoration: none;
  padding: 12px 22px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: none;
  cursor: pointer;
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
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 3px 3px 0 0;
}

.section-icon {
  font-size: 36px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  border: 2px solid #a5b4fc;
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
  background: linear-gradient(135deg, #6366f1, #4f46e5);
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

/* ===== INFO GRID ===== */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-radius: 12px;
  border: 2px solid #e9ecef;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #64748b;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.label-icon {
  font-size: 16px;
}

.info-value {
  font-size: 16px;
  color: #1e293b;
  font-weight: 600;
}

.notes-value {
  font-weight: 500;
  line-height: 1.6;
  color: #475569;
}

.status-badge {
  display: inline-flex;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-open,
.status-terbuka {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e40af;
  border: 2px solid #93c5fd;
}

.status-draft {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #4b5563;
  border: 2px solid #d1d5db;
}

.status-closed {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #15803d;
  border: 2px solid #86efac;
}

.status-foreign {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  border: 2px solid #fcd34d;
  text-transform: none;
  letter-spacing: normal;
}

/* ===== TABLE ===== */
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

.th-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.th-icon {
  font-size: 16px;
}

.th-no {
  width: 8%;
  text-align: center;
}

.th-material {
  width: 40%;
}

.th-qty {
  width: 15%;
  text-align: center;
}

.th-price {
  width: 18%;
  text-align: right;
}

.th-subtotal {
  width: 19%;
  text-align: right;
}

.data-row {
  transition: all 0.2s ease;
  border-bottom: 2px solid #f1f5f9;
}

.data-row:hover {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
}

.detail-table td {
  padding: 16px;
  vertical-align: middle;
}

.td-no {
  text-align: center;
}

.row-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  font-weight: 800;
  font-size: 14px;
  border-radius: 8px;
}

.td-material {
  font-weight: 600;
  color: #1e293b;
}

.td-qty {
  text-align: center;
}

.qty-badge {
  display: inline-flex;
  padding: 8px 16px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: #4338ca;
  font-weight: 700;
  font-size: 14px;
  border-radius: 8px;
  border: 2px solid #a5b4fc;
}

.td-price {
  text-align: right;
  font-weight: 600;
  color: #475569;
}

.subtotal-wrapper {
  display: flex;
  justify-content: flex-end;
}

.subtotal-value {
  font-weight: 800;
  color: #059669;
  font-size: 15px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-radius: 8px;
  border: 2px solid #6ee7b7;
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
    max-height: 800px;
  }
}

.spec-cell {
  padding: 24px !important;
  border-bottom: 3px solid #bae6fd;
}

/* ===== SPEC CARD ===== */
.spec-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin: 0 auto;
  max-width: 900px;
}

.karton-spec {
  border: 2px solid #bae6fd;
}

.kayu-spec {
  border: 2px solid #fed7aa;
}

/* ===== SPEC HEADER ===== */
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

/* ===== SPEC SECTION ===== */
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

/* ===== SPEC GRID ===== */
.spec-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  background: white;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: all 0.2s ease;
}

.spec-item:hover {
  border-color: #0ea5e9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(14, 165, 233, 0.1);
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

.spec-value {
  font-weight: 700;
  font-size: 15px;
  color: #1e293b;
}

.spec-value.highlight {
  color: #0ea5e9;
  font-size: 16px;
}

/* ===== KUBIKASI DISPLAY ===== */
.kubikasi-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: 10px;
  border: 2px solid #7dd3fc;
}

.kubikasi-value {
  font-weight: 900;
  font-size: 20px;
  color: #0c4a6e;
  flex: 1;
}

.kubikasi-badge {
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
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(0.98);
  }
}

/* ===== SUMMARY ===== */
.summary-section {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 20px;
}

.other-cost-desc {
  font-size: 11px;
  font-weight: 500;
  color: #9ca3af;
  margin-left: 4px;
}

.ppn-info-box {
  padding: 16px 20px;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border: 2px solid #bae6fd;
  border-radius: 12px;
}

.ppn-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: #94a3b8;
}

.ppn-indicator.active {
  color: #0369a1;
}

.ppn-icon {
  font-size: 20px;
}

.ppn-text {
  font-size: 14px;
}

.summary-box {
  min-width: 320px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.summary-row {
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

.ppn-row.active {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  margin: 0 -20px;
  padding: 10px 20px;
  border-radius: 6px;
}

.ppn-badge {
  display: inline-flex;
  padding: 2px 6px;
  background: #10b981;
  color: white;
  font-size: 10px;
  font-weight: 800;
  border-radius: 4px;
}

.summary-divider {
  height: 2px;
  background: linear-gradient(90deg, #e2e8f0, #cbd5e1, #e2e8f0);
  margin: 10px 0;
}

.summary-total {
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

/* ===== ACTIONS ===== */
.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-radius: 12px;
  border: 2px solid #e9ecef;
}

.btn-action {
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
  border: none;
}

.btn-cancel {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  color: #475569;
  border: 2px solid #cbd5e1;
}

.btn-edit {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-receive {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-action:hover {
  transform: translateY(-2px);
}

.btn-edit:hover {
  box-shadow: 0 6px 18px rgba(59, 130, 246, 0.4);
}

.btn-receive:hover {
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.4);
}

.action-icon {
  font-size: 18px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .spec-grid {
    grid-template-columns: 1fr;
  }

  .spec-card {
    padding: 16px;
  }

  .spec-section {
    padding: 12px;
  }

  .kubikasi-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .kubikasi-value {
    font-size: 18px;
  }

  .summary-section {
    flex-direction: column;
    align-items: stretch;
  }

  .summary-box {
    min-width: auto;
  }

  .detail-actions {
    flex-direction: column;
  }

  .btn-action {
    justify-content: center;
  }
}
</style>
