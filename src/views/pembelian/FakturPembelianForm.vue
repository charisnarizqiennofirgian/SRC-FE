<template>
  <DashboardLayout>
    <!-- Page Header -->
    <div class="page-header">
      <div class="breadcrumb">
        <router-link to="/" class="breadcrumb-item">
          <span class="breadcrumb-icon">🏠</span>
          Dashboard
        </router-link>
        <span class="breadcrumb-separator">→</span>
        <router-link to="/admin/pembelian/faktur" class="breadcrumb-item">
          Faktur Pembelian
        </router-link>
        <span class="breadcrumb-separator">→</span>
        <span class="breadcrumb-current">Buat Faktur</span>
      </div>

      <div class="header-content">
        <div class="header-left-section">
          <div class="icon-badge">🧾</div>
          <div class="header-text">
            <h1 class="page-title">Buat Faktur Pembelian</h1>
            <p class="page-subtitle">Catat tagihan yang diterima dari supplier</p>
          </div>
        </div>
        <router-link to="/admin/pembelian/faktur" class="btn-back">
          <span class="btn-icon">←</span>
          <span class="btn-text">Kembali</span>
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p class="loading-text">Memuat data...</p>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="saveBill" class="purchase-form">
      <!-- Informasi Faktur Card -->
      <div class="content-card">
        <div class="card-header-section">
          <div class="section-icon-wrapper">
            <div class="section-icon">ℹ️</div>
          </div>
          <div class="section-header-text">
            <h2 class="section-title">Informasi Faktur</h2>
            <p class="section-subtitle">Masukkan detail dari faktur yang Anda terima</p>
          </div>
        </div>
        <div class="card-body">
          <div class="info-grid-form">
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">🏭</span>
                <span class="label-text">Supplier</span>
                <span class="required">*</span>
              </label>
              <select
                id="supplier-select"
                v-model="form.supplier_id"
                class="form-control"
                required
              >
                <option value="">Pilih Supplier</option>
                <option v-for="supplier in daftarSupplier" :key="supplier.id" :value="supplier.id">
                  {{ supplier.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">📄</span>
                <span class="label-text">No. Faktur Supplier</span>
                <span class="required">*</span>
              </label>
              <input
                type="text"
                v-model="form.supplier_invoice_number"
                class="form-control"
                placeholder="Contoh: INV/2025/123"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">📅</span>
                <span class="label-text">Tanggal Faktur</span>
                <span class="required">*</span>
              </label>
              <input type="date" v-model="form.bill_date" class="form-control" required />
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">⏰</span>
                <span class="label-text">Tanggal Jatuh Tempo</span>
                <span class="required">*</span>
              </label>
              <input type="date" v-model="form.due_date" class="form-control" required />
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">💱</span>
                <span class="label-text">Mata Uang</span>
              </label>
              <div class="currency-toggle">
                <label class="currency-option" :class="{ active: form.currency === 'IDR' }">
                  <input type="radio" v-model="form.currency" value="IDR" />
                  <span>IDR (Rupiah)</span>
                </label>
                <label class="currency-option" :class="{ active: form.currency === 'USD' }">
                  <input type="radio" v-model="form.currency" value="USD" />
                  <span>USD (Dollar)</span>
                </label>
                <label class="currency-option" :class="{ active: form.currency === 'EUR' }">
                  <input type="radio" v-model="form.currency" value="EUR" />
                  <span>EUR (Euro)</span>
                </label>
              </div>
            </div>

            <div v-if="form.currency === 'USD'" class="form-group">
              <label class="form-label">
                <span class="label-icon">📈</span>
                <span class="label-text">Kurs USD → IDR</span>
                <span class="required">*</span>
              </label>
              <div class="input-kurs-wrapper">
                <span class="kurs-prefix">Rp</span>
                <input
                  type="number"
                  v-model.number="form.exchange_rate"
                  class="form-control"
                  placeholder="Contoh: 16000"
                  min="1"
                  step="any"
                  required
                />
              </div>
              <small class="form-hint info">
                <span class="hint-icon">💡</span>
                1 USD = Rp {{ new Intl.NumberFormat('id-ID').format(form.exchange_rate) }}
              </small>
            </div>

            <div v-if="form.currency === 'EUR'" class="form-group">
              <label class="form-label">
                <span class="label-icon">📈</span>
                <span class="label-text">Kurs EUR → IDR</span>
                <span class="required">*</span>
              </label>
              <div class="input-kurs-wrapper">
                <span class="kurs-prefix">Rp</span>
                <input
                  type="number"
                  v-model.number="form.exchange_rate"
                  class="form-control"
                  placeholder="Contoh: 17500"
                  min="1"
                  step="any"
                  required
                />
              </div>
              <small class="form-hint info">
                <span class="hint-icon">💡</span>
                1 EUR = Rp {{ new Intl.NumberFormat('id-ID').format(form.exchange_rate) }}
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Tarik Data Card -->
      <div class="content-card">
        <div class="card-header-section">
          <div class="section-icon-wrapper warning">
            <div class="section-icon">🔗</div>
          </div>
          <div class="section-header-text">
            <h2 class="section-title">Tarik Data dari Penerimaan Barang</h2>
            <p class="section-subtitle">
              Pilih penerimaan barang untuk mengisi detail tagihan secara otomatis
            </p>
          </div>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">📦</span>
              <span class="label-text">Penerimaan Barang (Goods Receipt)</span>
            </label>
            <select
              @change="handleReceiptSelect"
              class="form-control"
              :disabled="!form.supplier_id || availableReceipts.length === 0"
            >
              <option value="">Pilih Penerimaan</option>
              <option v-for="receipt in availableReceipts" :key="receipt.id" :value="receipt.id">
                {{ receipt.receipt_number }} - Tanggal: {{ formatTanggal(receipt.receipt_date) }}
              </option>
            </select>
            <small v-if="!form.supplier_id" class="form-hint info">
              <span class="hint-icon">💡</span>
              Pilih supplier terlebih dahulu untuk melihat daftar penerimaan.
            </small>
            <small
              v-if="form.supplier_id && availableReceipts.length === 0 && !loadingReceipts"
              class="form-hint warning"
            >
              <span class="hint-icon">⚠️</span>
              Tidak ada penerimaan barang yang siap ditagih untuk supplier ini.
            </small>
          </div>
        </div>
      </div>

      <!-- Detail Tagihan Card -->
      <div class="content-card">
        <div class="card-header-section">
          <div class="section-icon-wrapper primary">
            <div class="section-icon">📋</div>
          </div>
          <div class="section-header-text">
            <h2 class="section-title">Detail Tagihan</h2>
            <p class="section-subtitle">Rincian barang yang ditagihkan oleh supplier</p>
          </div>
        </div>
        <div class="card-body-table">
          <div class="table-scroll-wrapper">
            <table class="detail-table">
              <thead>
                <tr>
                  <th class="th-material">
                    <div class="th-content">
                      <span class="th-icon">📦</span>
                      <span>Barang</span>
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
                      <span>Harga Satuan <span v-if="form.currency === 'USD'" class="th-usd-badge">USD</span><span v-if="form.currency === 'EUR'" class="th-usd-badge th-eur-badge">EUR</span></span>
                    </div>
                  </th>
                  <th class="th-subtotal">
                    <div class="th-content">
                      <span class="th-icon">💵</span>
                      <span>Subtotal (IDR)</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="form.details.length === 0" class="empty-row">
                  <td colspan="4">
                    <div class="empty-state">
                      <span class="empty-icon">📋</span>
                      <p class="empty-text">Belum ada detail tagihan</p>
                      <p class="empty-hint">Pilih penerimaan barang di atas untuk mengisi detail</p>
                    </div>
                  </td>
                </tr>
                <tr
                  v-for="(item, index) in form.details"
                  :key="index"
                  class="data-row"
                  :class="{ 'row-even': index % 2 === 0 }"
                >
                  <td class="td-material">
                    <div class="material-info">
                      <span class="material-icon">📦</span>
                      <span class="material-name">{{ item.item_name }}</span>
                    </div>
                  </td>
                  <td class="td-qty">
                    <input
                      type="number"
                      v-model="item.quantity"
                      class="table-input"
                      required
                      min="0.01"
                      step="any"
                    />
                  </td>
                  <td class="td-price">
                    <div class="input-with-currency">
                      <span class="currency-prefix">Rp</span>
                      <input
                        type="text"
                        :value="formatPriceInput(item.price)"
                        @input="handlePriceInput($event, item)"
                        @blur="handlePriceBlur($event, item)"
                        class="table-input has-prefix"
                        placeholder="0"
                        required
                      />
                    </div>
                  </td>
                  <td class="td-subtotal">
                    <span class="subtotal-value">
                      <template v-if="form.currency === 'USD'">
                        <span style="display:block;font-size:11px;color:#1d4ed8;font-weight:700;">
                          $ {{ new Intl.NumberFormat('en-US',{minimumFractionDigits:2}).format((item.quantity||0)*(item.price||0)) }}
                        </span>
                        {{ formatCurrency((item.quantity||0)*(item.price||0)*(form.exchange_rate||1)) }}
                      </template>
                      <template v-else-if="form.currency === 'EUR'">
                        <span style="display:block;font-size:11px;color:#7c3aed;font-weight:700;">
                          € {{ new Intl.NumberFormat('en-US',{minimumFractionDigits:2}).format((item.quantity||0)*(item.price||0)) }}
                        </span>
                        {{ formatCurrency((item.quantity||0)*(item.price||0)*(form.exchange_rate||1)) }}
                      </template>
                      <template v-else>
                        {{ formatCurrency((item.quantity || 0) * (item.price || 0)) }}
                      </template>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Summary Section -->
          <div class="summary-section">
            <div class="summary-box">
              <div class="summary-row">
                <span class="sum-label">Subtotal</span>
                <span class="sum-value">{{ formatCurrency(subtotal) }}</span>
              </div>
              <div class="summary-row ppn-selector-row">
                <span class="sum-label">Tarif PPN</span>
                <div class="ppn-options-compact">
                  <label class="ppn-radio">
                    <input type="radio" v-model.number="ppnPercentage" :value="0" />
                    <span>0%</span>
                  </label>
                  <label class="ppn-radio">
                    <input type="radio" v-model.number="ppnPercentage" :value="11" />
                    <span>11%</span>
                  </label>
                  <label class="ppn-radio">
                    <input type="radio" v-model.number="ppnPercentage" :value="12" />
                    <span>12%</span>
                  </label>
                  <label class="ppn-radio ppn-special">
                    <input type="radio" v-model.number="ppnPercentage" :value="11.12" />
                    <span>12% ⚡</span>
                    <small class="ppn-note">Hitung 11%</small>
                  </label>
                </div>
              </div>
              <div class="summary-row ppn-row">
                <span class="sum-label">
                  <span class="ppn-badge">{{ ppnPercentage }}%</span>
                  PPN
                </span>
                <span class="sum-value">{{ formatCurrency(ppnAmount) }}</span>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-row summary-total">
                <span class="sum-label-total">Grand Total</span>
                <span class="sum-value-total">{{ formatCurrency(grandTotal) }}</span>
              </div>
            </div>
          </div>

          <!-- COA Section -->
          <div class="coa-selection-section">
            <!-- Akun Persediaan/Beban -->
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">📦</span>
                <span class="label-text">Akun Persediaan / Beban</span>
                <span class="required">*</span>
              </label>
              <select
                id="coa-select"
                v-model="form.coa_id"
                class="form-control"
                required>
                <option :value="null">-- Pilih Akun --</option>
                <option v-for="coa in coaAccounts" :key="coa.id" :value="coa.id">
                  {{ coa.code }} - {{ coa.name }}
                </option>
              </select>
              <small class="form-hint info">
                <span class="hint-icon">💡</span>
                Pilih akun <strong>Persediaan</strong> (untuk barang stok) atau <strong>Biaya</strong> (untuk beban langsung)
              </small>
            </div>

            <!-- Akun Kas/Bank — hanya muncul untuk TUNAI dan DP -->
            <div v-if="form.payment_type === 'TUNAI' || form.payment_type === 'DP'" class="form-group">
              <label class="form-label">
                <span class="label-icon">🏦</span>
                <span class="label-text">Akun Kas / Bank Pembayaran</span>
                <span class="required">*</span>
              </label>
              <select
                id="kas-select"
                v-model="form.kas_account_id"
                class="form-control"
                required>
                <option :value="null">-- Pilih Akun Kas/Bank --</option>
                <option v-for="coa in kasAccounts" :key="coa.id" :value="coa.id">
                  {{ coa.code }} - {{ coa.name }}
                </option>
              </select>
              <small class="form-hint info">
                <span class="hint-icon">💡</span>
                Pilih rekening <strong>Kas</strong> atau <strong>Bank</strong> yang digunakan untuk membayar
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Pembayaran Card -->
      <div class="content-card">
        <div class="card-header-section">
          <div class="section-icon-wrapper payment">
            <div class="section-icon">💳</div>
          </div>
          <div class="section-header-text">
            <h2 class="section-title">Pembayaran</h2>
            <p class="section-subtitle">Pilih tipe pembayaran untuk faktur ini</p>
          </div>
        </div>
        <div class="card-body">
          <!-- Payment Type Selection -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">💰</span>
              <span class="label-text">Tipe Pembayaran</span>
              <span class="required">*</span>
            </label>
            <div class="payment-type-grid">
              <label class="payment-card" :class="{ active: form.payment_type === 'TEMPO' }">
                <input type="radio" v-model="form.payment_type" value="TEMPO" />
                <div class="payment-card-content">
                  <span class="payment-icon">📅</span>
                  <span class="payment-label">Tempo (Hutang)</span>
                  <span class="payment-desc">Bayar nanti sesuai jatuh tempo</span>
                </div>
              </label>
              <label class="payment-card" :class="{ active: form.payment_type === 'TUNAI' }">
                <input type="radio" v-model="form.payment_type" value="TUNAI" />
                <div class="payment-card-content">
                  <span class="payment-icon">💵</span>
                  <span class="payment-label">Tunai (Lunas)</span>
                  <span class="payment-desc">Bayar langsung saat ini</span>
                </div>
              </label>
              <label class="payment-card" :class="{ active: form.payment_type === 'DP' }">
                <input type="radio" v-model="form.payment_type" value="DP" />
                <div class="payment-card-content">
                  <span class="payment-icon">💳</span>
                  <span class="payment-label">Uang Muka (DP)</span>
                  <span class="payment-desc">Bayar sebagian, sisanya hutang</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Nominal DP (untuk DP saja) -->
          <div v-if="form.payment_type === 'DP'" class="form-group">
            <label class="form-label">
              <span class="label-icon">💰</span>
              <span class="label-text">Nominal Uang Muka</span>
              <span class="required">*</span>
            </label>
            <div class="input-with-currency">
              <span class="currency-prefix">Rp</span>
              <input
                type="number"
                v-model="form.paid_amount"
                class="form-control has-prefix"
                placeholder="Masukkan nominal DP"
                required
                min="0"
                :max="grandTotal"
                step="any"
              />
            </div>
            <small class="form-hint info">
              <span class="hint-icon">💡</span>
              Sisa hutang:
              <strong>{{ formatCurrency(grandTotal - (form.paid_amount || 0)) }}</strong>
            </small>
          </div>

          <!-- Payment Summary -->
          <div class="payment-summary">
            <div class="payment-summary-header">
              <span class="summary-title">💰 Ringkasan Pembayaran</span>
            </div>
            <div class="payment-summary-row">
              <span class="psum-label">Total Tagihan</span>
              <span class="psum-value">{{ formatCurrency(grandTotal) }}</span>
            </div>
            <div class="payment-summary-row paid">
              <span class="psum-label">Dibayar</span>
              <span class="psum-value">{{ formatCurrency(paidAmount) }}</span>
            </div>
            <div class="payment-summary-divider"></div>
            <div class="payment-summary-row remaining">
              <span class="psum-label">Sisa Hutang</span>
              <span class="psum-value">{{ formatCurrency(remainingAmount) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="cancel" class="btn-cancel-action">
          <span class="action-icon">❌</span>
          <span class="action-text">Batal</span>
        </button>
        <button
          type="submit"
          class="btn-submit-action"
          :disabled="isSaving || form.details.length === 0"
        >
          <span class="action-icon">{{ isSaving ? '⏳' : '💾' }}</span>
          <span class="action-text">{{ isSaving ? 'Menyimpan...' : 'Simpan Faktur' }}</span>
        </button>
      </div>
    </form>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/api/axios'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { useToast } from 'vue-toastification'
import Choices from 'choices.js'
import 'choices.js/public/assets/styles/choices.min.css'

const router = useRouter()
const toast = useToast()

const loading = ref(false)
const loadingReceipts = ref(false)
const isSaving = ref(false)
const daftarSupplier = ref([])
const availableReceipts = ref([])
const coaAccounts = ref([])
const ppnPercentage = ref(12)
const coaChoicesInstance = ref(null)
const kasChoicesInstance = ref(null)
const supplierChoicesInstance = ref(null)

const today = new Date().toISOString().slice(0, 10)
const thirtyDaysFromNow = new Date()
thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
const dueDateDefault = thirtyDaysFromNow.toISOString().slice(0, 10)

const form = reactive({
  supplier_id: '',
  supplier_invoice_number: '',
  bill_date: today,
  due_date: dueDateDefault,
  notes: '',
  details: [],
  coa_id: null,
  kas_account_id: null,
  payment_type: 'TEMPO',
  paid_amount: 0,
  ppn_percentage: 12,
  currency: 'IDR',
  exchange_rate: 16000,
})

// Hanya akun ASET untuk pilihan Kas/Bank
const kasAccounts = computed(() =>
  coaAccounts.value.filter((c) => c.type === 'ASET')
)

// subtotalCurrency = nominal dalam currency asli (USD atau IDR)
const subtotalCurrency = computed(() => {
  return form.details.reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0)
})

// subtotal selalu IDR
const subtotal = computed(() => {
  const isForeign = form.currency === 'USD' || form.currency === 'EUR'
  const rate = isForeign ? (form.exchange_rate || 1) : 1
  return subtotalCurrency.value * rate
})

const ppnAmount = computed(() => {
  let rate = ppnPercentage.value
  if (rate === 11.12) rate = 11
  return subtotal.value * (rate / 100)
})

const grandTotal = computed(() => {
  return subtotal.value + ppnAmount.value
})

const paidAmount = computed(() => {
  switch (form.payment_type) {
    case 'TUNAI':
      return grandTotal.value
    case 'DP':
      return form.paid_amount || 0
    case 'TEMPO':
    default:
      return 0
  }
})

const remainingAmount = computed(() => {
  return grandTotal.value - paidAmount.value
})

const handleSupplierChange = async () => {
  form.details = []
  availableReceipts.value = []
  if (!form.supplier_id) return

  loadingReceipts.value = true
  try {
    const response = await apiClient.get(`/goods-receipts/unbilled?supplier_id=${form.supplier_id}`)
    availableReceipts.value = response.data.data
  } catch (error) {
    console.error('Gagal memuat data penerimaan:', error)
    toast.error('Gagal memuat data penerimaan barang.')
  } finally {
    loadingReceipts.value = false
  }
}

const formatTanggal = (tanggal) => {
  if (!tanggal) return ''
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const handleReceiptSelect = (event) => {
  const receiptId = event.target.value
  if (!receiptId) {
    form.details = []
    return
  }

  const selectedReceipt = availableReceipts.value.find((r) => r.id == receiptId)

  if (!selectedReceipt || !selectedReceipt.details) {
    toast.error('Data detail untuk penerimaan ini tidak ditemukan.')
    form.details = []
    return
  }

  form.details = selectedReceipt.details.map((detail) => {
    let price = 0

    if (detail.price !== undefined && detail.price !== null) {
      price = parseFloat(detail.price)
    } else if (detail.purchaseOrderDetail && detail.purchaseOrderDetail.price) {
      price = parseFloat(detail.purchaseOrderDetail.price)
    }

    return {
      goods_receipt_detail_id: detail.id,
      item_id: detail.item_id,
      item_name: detail.item ? detail.item.name : 'Nama Barang Tidak Ditemukan',
      quantity: parseFloat(detail.quantity_received) || 0,
      price: price,
    }
  })
}

const saveBill = async () => {
  if (!form.coa_id) {
    toast.error('Pilih akun Persediaan/Beban!')
    return
  }

  if ((form.payment_type === 'TUNAI' || form.payment_type === 'DP') && !form.kas_account_id) {
    toast.error('Pilih akun Kas/Bank untuk pembayaran!')
    return
  }

  if (form.payment_type === 'DP' && (!form.paid_amount || form.paid_amount <= 0)) {
    toast.error('Masukkan nominal uang muka!')
    return
  }

  isSaving.value = true
  try {
    const payload = {
      ...form,
      ppn_percentage: ppnPercentage.value,
      currency: form.currency,
      exchange_rate: (form.currency === 'USD' || form.currency === 'EUR') ? form.exchange_rate : 1,
    }

    await apiClient.post('/purchase-bills', payload)
    toast.success('Faktur Pembelian berhasil disimpan!')
    router.push('/admin/pembelian/faktur')
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Gagal menyimpan faktur.'
    toast.error(errorMessage)
    console.error('Error saving invoice:', error)
  } finally {
    isSaving.value = false
  }
}

const fetchFormData = async () => {
  loading.value = true
  try {
    const supplierRes = await apiClient.get('/suppliers?per_page=9999')
    const rawSupplier = supplierRes.data.data
    daftarSupplier.value = Array.isArray(rawSupplier) ? rawSupplier : (rawSupplier?.data ?? [])

    const formDataRes = await apiClient.get('/purchase-bills/form-data')
    coaAccounts.value = formDataRes.data.data.coa_accounts

    await nextTick()
    initializeSupplierDropdown()
    initializeCoaDropdown()
  } catch (error) {
    console.error('Gagal memuat data form:', error)
    toast.error('Gagal memuat data form.')
  } finally {
    loading.value = false
  }
}

const initializeSupplierDropdown = () => {
  setTimeout(() => {
    const supplierSelect = document.getElementById('supplier-select')
    if (supplierSelect && !supplierChoicesInstance.value) {
      try {
        supplierChoicesInstance.value = new Choices(supplierSelect, {
          searchEnabled: true,
          searchPlaceholderValue: 'Ketik untuk mencari supplier...',
          noResultsText: 'Supplier tidak ditemukan',
          noChoicesText: 'Tidak ada pilihan',
          itemSelectText: 'Klik untuk pilih',
          shouldSort: false,
          position: 'bottom',
          renderChoiceLimit: -1,
          searchResultLimit: 200,
        })
        supplierSelect.addEventListener('change', () => {
          handleSupplierChange()
        })
      } catch (error) {
        console.error('Error initializing supplier Choices.js:', error)
      }
    }
  }, 100)
}

const initializeKasDropdown = () => {
  setTimeout(() => {
    const kasSelect = document.getElementById('kas-select')
    if (kasSelect && !kasChoicesInstance.value) {
      try {
        kasChoicesInstance.value = new Choices(kasSelect, {
          searchEnabled: true,
          searchPlaceholderValue: 'Ketik untuk mencari akun Kas/Bank...',
          noResultsText: 'Akun tidak ditemukan',
          noChoicesText: 'Tidak ada pilihan',
          itemSelectText: 'Klik untuk pilih',
          shouldSort: false,
          position: 'bottom',
          renderChoiceLimit: -1,
          searchResultLimit: 100,
        })
      } catch (error) {
        console.error('Error initializing Kas Choices.js:', error)
      }
    }
  }, 100)
}

const initializeCoaDropdown = () => {
  // Use setTimeout to ensure DOM is fully rendered
  setTimeout(() => {
    const coaSelect = document.getElementById('coa-select')
    console.log('🔍 Trying to initialize COA dropdown...', coaSelect)
    
    if (coaSelect && !coaChoicesInstance.value) {
      try {
        coaChoicesInstance.value = new Choices(coaSelect, {
          searchEnabled: true,
          searchPlaceholderValue: 'Ketik untuk mencari akun COA...',
          noResultsText: 'Akun tidak ditemukan',
          noChoicesText: 'Tidak ada pilihan',
          itemSelectText: 'Klik untuk pilih',
          shouldSort: false,
          position: 'bottom',
          renderChoiceLimit: -1, // Render all choices
          searchResultLimit: 100, // Limit search results
        })
        console.log('✅ COA Choices.js initialized successfully')
      } catch (error) {
        console.error('❌ Error initializing Choices.js:', error)
      }
    } else {
      console.warn('⚠️ COA select element not found or already initialized')
    }
  }, 100)
}

const formatPriceInput = (value) => {
  if (!value || value === 0) return ''
  return parseFloat(value).toLocaleString('id-ID')
}

const handlePriceInput = (event, item) => {
  // Remove non-numeric characters except comma and dot
  let value = event.target.value.replace(/[^0-9.,]/g, '')
  
  // Replace comma with dot for decimal
  value = value.replace(/,/g, '')
  
  // Update the raw number value
  item.price = parseFloat(value) || 0
}

const handlePriceBlur = (event, item) => {
  // Format the display value when user leaves the input
  event.target.value = formatPriceInput(item.price)
}

watch(() => form.payment_type, async (newType) => {
  if (newType === 'TEMPO') {
    form.kas_account_id = null
    if (kasChoicesInstance.value) {
      kasChoicesInstance.value.destroy()
      kasChoicesInstance.value = null
    }
  } else {
    await nextTick()
    initializeKasDropdown()
  }
})

const cancel = () => {
  router.go(-1)
}

const formatCurrency = (value) => {
  if (isNaN(value)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

onMounted(fetchFormData)
</script>

<style scoped>
/* ============================================
   VARIABLES & BASE
   ============================================ */
* {
  box-sizing: border-box;
}

.purchase-form {
  max-width: 1400px;
  margin: 0 auto;
}

/* ============================================
   BREADCRUMB
   ============================================ */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 13px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.breadcrumb-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.breadcrumb-icon {
  font-size: 14px;
}

.breadcrumb-separator {
  color: rgba(255, 255, 255, 0.5);
}

.breadcrumb-current {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

/* ============================================
   LOADING STATE
   ============================================ */
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
  border-top-color: #10b981;
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

/* ============================================
   PAGE HEADER
   ============================================ */
.page-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 24px 32px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
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
  background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.15), transparent);
  pointer-events: none;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  gap: 20px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.header-left-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.icon-badge {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-subtitle {
  font-size: 14px;
  opacity: 0.95;
  margin: 0;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  color: #10b981;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.btn-icon {
  font-size: 16px;
}

/* ============================================
   CONTENT CARD
   ============================================ */
.content-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
}

.card-header-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(to right, #fafbfc 0%, #ffffff 100%);
  border-bottom: 2px solid #f3f4f6;
}

.section-icon-wrapper {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  border: 2px solid #6ee7b7;
  flex-shrink: 0;
}

.section-icon-wrapper.warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #fbbf24;
}

.section-icon-wrapper.primary {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #3b82f6;
}

.section-icon-wrapper.payment {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  border-color: #6366f1;
}

.section-icon {
  font-size: 28px;
}

.section-header-text {
  flex: 1;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
}

.section-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.card-body {
  padding: 24px;
}

.card-body-table {
  padding: 24px;
}

/* ============================================
   FORM ELEMENTS
   ============================================ */
.info-grid-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #374151;
  font-size: 13px;
}

.label-icon {
  font-size: 16px;
}

.required {
  color: #ef4444;
  font-weight: 700;
}

.form-control {
  width: 100%;
  padding: 11px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-control:disabled {
  background: #f9fafb;
  cursor: not-allowed;
  opacity: 0.6;
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
  color: #6b7280;
  font-size: 14px;
  z-index: 1;
}

.form-control.has-prefix {
  padding-left: 42px;
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.form-hint.info {
  color: #3b82f6;
}

.form-hint.warning {
  color: #f59e0b;
}

.hint-icon {
  font-size: 14px;
}

/* ============================================
   TABLE
   ============================================ */
.table-scroll-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
  background: white;
}

.detail-table thead {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  position: sticky;
  top: 0;
  z-index: 10;
}

.detail-table th {
  padding: 16px 16px;
  text-align: left;
  color: white;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.th-icon {
  font-size: 16px;
}

.th-subtotal .th-content {
  justify-content: flex-end;
}

.data-row {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
}

.data-row:hover {
  background: #f9fafb;
}

.row-even {
  background: #fafbfc;
}

.detail-table td {
  padding: 14px 16px;
  vertical-align: middle;
}

.material-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.material-icon {
  font-size: 20px;
  background: #f3f4f6;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;
}

.material-name {
  font-weight: 600;
  color: #1f2937;
}

.table-input,
.table-select {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  background: white;
  transition: all 0.2s ease;
}

.table-input:focus,
.table-select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.table-input.has-prefix {
  padding-left: 48px;
}

.td-subtotal {
  text-align: right;
}

.subtotal-value {
  font-weight: 700;
  color: #059669;
  font-size: 14px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: 8px;
  border: 2px solid #6ee7b7;
  display: inline-block;
  min-width: 120px;
  text-align: right;
}

/* Empty State */
.empty-row {
  background: #fafafa;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
  opacity: 0.4;
}

.empty-text {
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

/* ============================================
   SUMMARY SECTION
   ============================================ */
.summary-section {
  display: flex;
  justify-content: flex-end;
  padding: 20px 0 0 0;
}

.summary-box {
  min-width: 350px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #e5e7eb;
}

.sum-label {
  font-weight: 600;
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sum-value {
  font-weight: 700;
  font-size: 14px;
  color: #1f2937;
}

.ppn-row {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  margin: 0 -20px;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
}

.ppn-badge {
  display: inline-flex;
  padding: 2px 6px;
  background: #f59e0b;
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 4px;
}

.ppn-selector-row {
  padding: 8px 0;
  border-bottom: 1px dashed #e5e7eb;
  margin-bottom: 4px;
}

.ppn-options-compact {
  display: flex;
  gap: 8px;
}

.ppn-radio {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 4px 10px;
  border: 1.5px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.15s;
}

.ppn-radio:has(input:checked) {
  border-color: #f59e0b;
  background: #fef3c7;
  color: #92400e;
}

.ppn-radio input[type="radio"] {
  display: none;
}

.ppn-radio.ppn-special {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #fbbf24;
  position: relative;
}

.ppn-radio.ppn-special:has(input:checked) {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-color: #d97706;
}

.ppn-radio.ppn-special span {
  color: #92400e;
}

.ppn-radio.ppn-special:has(input:checked) span {
  color: white;
}

.ppn-note {
  display: block;
  font-size: 10px;
  color: #92400e;
  opacity: 0.8;
  font-weight: 400;
  margin-top: 1px;
}

.summary-divider {
  height: 2px;
  background: linear-gradient(90deg, #e5e7eb, #cbd5e1, #e5e7eb);
  margin: 8px 0;
}

.summary-total {
  margin-top: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: 10px;
  border: 2px solid #10b981;
}

.sum-label-total {
  font-weight: 700;
  font-size: 15px;
  color: #065f46;
}

.sum-value-total {
  font-weight: 800;
  font-size: 18px;
  color: #10b981;
}

/* ============================================
   PAYMENT TYPE SELECTION
   ============================================ */
.payment-type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.payment-card {
  position: relative;
  cursor: pointer;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
  background: white;
}

.payment-card:hover {
  border-color: #10b981;
  background: #f9fafb;
  transform: translateY(-2px);
}

.payment-card.active {
  border-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.payment-card input[type='radio'] {
  position: absolute;
  opacity: 0;
}

.payment-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.payment-icon {
  font-size: 32px;
  margin-bottom: 4px;
}

.payment-label {
  font-weight: 700;
  font-size: 14px;
  color: #1f2937;
}

.payment-desc {
  font-size: 11px;
  color: #6b7280;
  line-height: 1.4;
}

/* ============================================
   PAYMENT SUMMARY
   ============================================ */
.payment-summary {
  margin-top: 24px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.payment-summary-header {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  padding: 12px 20px;
  border-bottom: 2px solid #a5b4fc;
}

.summary-title {
  font-weight: 700;
  font-size: 14px;
  color: #3730a3;
}

.payment-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px dashed #e5e7eb;
}

.payment-summary-row:last-child {
  border-bottom: none;
}

.psum-label {
  font-weight: 600;
  font-size: 14px;
  color: #6b7280;
}

.psum-value {
  font-weight: 700;
  font-size: 14px;
  color: #1f2937;
}

.payment-summary-row.paid {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
}

.payment-summary-row.paid .psum-value {
  color: #059669;
}

.payment-summary-divider {
  height: 2px;
  background: linear-gradient(90deg, #e5e7eb, #cbd5e1, #e5e7eb);
}

.payment-summary-row.remaining {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  padding: 16px 20px;
}

.payment-summary-row.remaining .psum-label {
  font-size: 15px;
  font-weight: 700;
  color: #92400e;
}

.payment-summary-row.remaining .psum-value {
  font-size: 18px;
  font-weight: 800;
  color: #f59e0b;
}

/* ============================================
   FORM ACTIONS
   ============================================ */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  position: sticky;
  bottom: 20px;
  z-index: 100;
}

.btn-cancel-action,
.btn-submit-action {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.btn-cancel-action {
  background: #f3f4f6;
  color: #4b5563;
}

.btn-cancel-action:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.btn-submit-action {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-submit-action:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.4);
}

.btn-submit-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.action-icon {
  font-size: 16px;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 1024px) {
  .info-grid-form {
    grid-template-columns: 1fr;
  }

  .payment-type-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-back {
    width: 100%;
    justify-content: center;
  }

  .card-body,
  .card-body-table {
    padding: 16px;
  }

  .summary-box {
    min-width: auto;
    width: 100%;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-cancel-action,
  .btn-submit-action {
    justify-content: center;
  }
}

/* ============================================
   CHOICES.JS CUSTOM STYLING
   ============================================ */
/* Force scrollbar on dropdown list */
:deep(.choices__list--dropdown),
:deep(.choices__list[aria-expanded]),
.choices__list--dropdown,
.choices__list[aria-expanded] {
  max-height: 300px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
}

:deep(.choices[data-type*="select-one"] .choices__list--dropdown),
.choices[data-type*="select-one"] .choices__list--dropdown {
  max-height: 300px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
}

/* Ensure the inner list also has proper height */
:deep(.choices__list--dropdown .choices__list),
.choices__list--dropdown .choices__list {
  max-height: 300px !important;
  overflow-y: auto !important;
}

:deep(.choices__list--dropdown .choices__item),
.choices__list--dropdown .choices__item {
  padding: 12px 16px;
  font-size: 14px;
}

:deep(.choices__list--dropdown .choices__item--selectable.is-highlighted),
.choices__list--dropdown .choices__item--selectable.is-highlighted {
  background-color: #10b981 !important;
}

</style>

<style>
/* ============================================
   CHOICES.JS GLOBAL STYLING (UNSCOPED)
   ============================================ */
.choices__list--dropdown {
  max-height: 300px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
}

.choices[data-type*="select-one"] .choices__list--dropdown {
  max-height: 300px !important;
  overflow-y: auto !important;
}

.choices__list--dropdown .choices__list {
  max-height: 300px !important;
}

.choices__list--dropdown .choices__item--selectable {
  padding: 12px 16px;
  font-size: 14px;
}

.choices__list--dropdown .choices__item--selectable.is-highlighted {
  background-color: #10b981 !important;
  color: white;
}

/* Supplier dropdown search input */
#supplier-select + .choices .choices__inner,
.choices[data-type*="select-one"] .choices__inner {
  min-height: 44px;
}

/* ===== CURRENCY TOGGLE ===== */
.currency-toggle {
  display: flex;
  gap: 10px;
}
.currency-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  background: #fafbfc;
}
.currency-option:hover { border-color: #7c3aed; background: #faf5ff; }
.currency-option.active { border-color: #7c3aed; background: #f3e8ff; color: #5b21b6; }
.currency-option input { display: none; }

/* ===== KURS INPUT ===== */
.input-kurs-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #fafbfc;
  transition: all 0.2s;
}
.input-kurs-wrapper:focus-within { border-color: #7c3aed; background: white; box-shadow: 0 0 0 4px rgba(124,58,237,0.1); }
.kurs-prefix { padding: 0 14px; font-weight: 700; color: #64748b; font-size: 14px; white-space: nowrap; }

.th-usd-badge {
  display: inline-block;
  background: #1d4ed8;
  color: white;
  font-size: 9px;
  padding: 2px 5px;
  border-radius: 4px;
  margin-left: 4px;
  font-weight: 700;
  letter-spacing: 0.5px;
  vertical-align: middle;
}
.th-eur-badge { background: #7c3aed; }
</style>
