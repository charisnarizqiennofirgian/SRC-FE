<template>
  <DashboardLayout>
    <div class="page-header">
      <div class="header-content">
        <div class="header-left-section">
          <div class="icon-badge">📦</div>
          <div>
            <h1 class="page-title">{{ isEditMode ? 'Edit' : 'Buat' }} PO Operasional</h1>
            <p class="page-subtitle">
              {{
                isEditMode
                  ? `Edit PO Operasional ${poNumber}`
                  : 'Isi detail untuk membuat PO Operasional baru'
              }}
            </p>
          </div>
        </div>
        <router-link :to="{ name: 'PembelianOperasional' }" class="btn-back">
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
                placeholder="Cari atau pilih supplier..."
                class="vue-select-supplier"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Tanggal Pesan</label>
              <input type="date" v-model="form.order_date" class="form-control" required />
            </div>

            <div class="form-group">
              <label class="form-label">Tanggal Kirim</label>
              <input type="date" v-model="form.delivery_date" class="form-control" required />
            </div>

            <div class="form-group">
              <label class="form-label">Mata Uang</label>
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
              <label class="form-label">Kurs USD → IDR</label>
              <div class="input-kurs-wrapper">
                <span class="kurs-prefix">Rp</span>
                <input
                  type="number"
                  v-model.number="form.exchange_rate"
                  class="form-control has-prefix"
                  placeholder="Contoh: 16000"
                  min="1"
                  step="any"
                  required
                />
              </div>
              <small class="form-hint-kurs">1 USD = Rp {{ formatRibuan(form.exchange_rate) }}</small>
            </div>

            <div v-if="form.currency === 'EUR'" class="form-group">
              <label class="form-label">Kurs EUR → IDR</label>
              <div class="input-kurs-wrapper">
                <span class="kurs-prefix">Rp</span>
                <input
                  type="number"
                  v-model.number="form.exchange_rate"
                  class="form-control has-prefix"
                  placeholder="Contoh: 17500"
                  min="1"
                  step="any"
                  required
                />
              </div>
              <small class="form-hint-kurs">1 EUR = Rp {{ formatRibuan(form.exchange_rate) }}</small>
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
            <div class="section-icon">📝</div>
          </div>
          <div class="section-header-text">
            <h2 class="section-title">Detail Barang</h2>
            <p class="section-subtitle">Tambahkan barang yang akan dipesan</p>
          </div>
        </div>
        <div class="card-body-table">
          <div class="table-wrapper">
            <table class="detail-table">
              <thead>
                <tr>
                  <th class="th-material">Barang</th>
                  <th class="th-qty">Jumlah</th>
                  <th class="th-price">
                    Harga Satuan
                    <span v-if="form.currency === 'USD'" class="th-currency-badge">USD</span>
                    <span v-if="form.currency === 'EUR'" class="th-currency-badge th-eur-badge">EUR</span>
                  </th>
                  <th class="th-subtotal">
                    Subtotal (IDR)
                  </th>
                  <th class="th-date">Tgl Kirim</th>
                  <th class="th-action">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in form.details" :key="index" class="data-row">
                  <td class="td-material">
                    <div class="material-select-wrapper">
                      <select
                        :id="'select-barang-' + index"
                        v-model="item.item_id"
                        class="choices-select"
                        required
                      >
                        <option value="">Pilih Barang</option>
                      </select>
                      <button
                        type="button"
                        class="btn-quick-add"
                        @click="openModalTambahBarang"
                        title="Tambah barang baru"
                      >
                        ➕
                      </button>
                    </div>
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
                    <template v-if="form.currency === 'USD'">
                      <span class="usd-price">$ {{ formatForeign((item.quantity || 0) * (item.price || 0)) }}</span>
                      <span class="idr-equiv">≈ {{ formatCurrency((item.quantity || 0) * (item.price || 0) * (form.exchange_rate || 1)) }}</span>
                    </template>
                    <template v-else-if="form.currency === 'EUR'">
                      <span class="eur-price">€ {{ formatForeign((item.quantity || 0) * (item.price || 0)) }}</span>
                      <span class="idr-equiv">≈ {{ formatCurrency((item.quantity || 0) * (item.price || 0) * (form.exchange_rate || 1)) }}</span>
                    </template>
                    <template v-else>
                      {{ formatCurrency((item.quantity || 0) * (item.price || 0)) }}
                    </template>
                  </td>
                  <td class="td-date">
                    <input
                      type="date"
                      v-model="item.delivery_date"
                      class="form-control"
                    />
                  </td>
                  <td class="td-action">
                    <button
                      @click="hapusBarang(index)"
                      type="button"
                      class="btn-delete"
                      :disabled="form.details.length === 1"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="table-actions">
            <button @click="tambahBarang" type="button" class="btn-add-row">
              ➕ Tambah Barang
            </button>
          </div>
        </div>

        <div class="summary-section">
          <div class="summary-row">
            <div class="ppn-compact">
              <label class="ppn-label-compact">PPN:</label>
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
                <label class="ppn-radio ppn-special">
                  <input type="radio" v-model.number="form.ppn_percentage" :value="11.12" />
                  <span>12% ⚡</span>
                  <small class="ppn-note">Hitung 11%</small>
                </label>
              </div>
            </div>

            <div class="summary-compact">
              <div class="summary-item-compact">
                <span class="label">Subtotal:</span>
                <span class="value">
                  <template v-if="form.currency === 'USD'">
                    $ {{ formatForeign(totalSubtotalForeign) }} <small class="idr-small">({{ formatCurrency(totalSubtotal) }})</small>
                  </template>
                  <template v-else-if="form.currency === 'EUR'">
                    € {{ formatForeign(totalSubtotalForeign) }} <small class="idr-small">({{ formatCurrency(totalSubtotal) }})</small>
                  </template>
                  <template v-else>{{ formatCurrency(totalSubtotal) }}</template>
                </span>
              </div>
              <div class="summary-item-compact">
                <span class="label">PPN ({{ formatPPNDisplay(form.ppn_percentage) }}):</span>
                <span class="value ppn">{{ formatCurrency(totalPPN) }}</span>
              </div>
              <div class="summary-item-compact total">
                <span class="label">Grand Total (IDR):</span>
                <span class="value">{{ formatCurrency(grandTotal) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-submit-action" :disabled="isSaving">
          {{ isSaving ? 'Menyimpan...' : 'Simpan PO Operasional' }}
        </button>
      </div>
    </form>

    <!-- MODAL TAMBAH BARANG BARU -->
    <div v-if="showModalTambahBarang" class="modal-overlay" @click.self="closeModalTambahBarang">
      <div class="modal-container-barang">
        <div class="modal-header-barang">
          <div class="modal-title-wrapper">
            <span class="modal-icon">📦</span>
            <h3 class="modal-title">Tambah Barang Baru</h3>
          </div>
          <button class="modal-close" @click="closeModalTambahBarang">✕</button>
        </div>
        <div class="modal-body-barang">
          <div class="form-grid-2">
            <div class="form-group-modal">
              <label class="form-label-modal">Kode</label>
              <input
                v-model="formBarang.code"
                type="text"
                class="form-input-modal"
                placeholder="Contoh: U-001"
              />
            </div>
            <div class="form-group-modal">
              <label class="form-label-modal">Nama Barang <span class="req">*</span></label>
              <input
                v-model="formBarang.name"
                type="text"
                class="form-input-modal"
                placeholder="Nama barang..."
              />
            </div>
            <div class="form-group-modal">
              <label class="form-label-modal">Kategori <span class="req">*</span></label>
              <select v-model="formBarang.category_id" class="form-input-modal">
                <option value="">Pilih Kategori</option>
                <option v-for="cat in daftarKategori" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="form-group-modal">
              <label class="form-label-modal">Satuan <span class="req">*</span></label>
              <select v-model="formBarang.unit_id" class="form-input-modal">
                <option value="">Pilih Satuan</option>
                <option v-for="unit in daftarSatuan" :key="unit.id" :value="unit.id">
                  {{ unit.name }}
                </option>
              </select>
            </div>
            <div class="form-group-modal">
              <label class="form-label-modal">Stok Awal</label>
              <input
                v-model.number="formBarang.stock"
                type="number"
                min="0"
                class="form-input-modal"
                placeholder="0"
              />
            </div>
            <div class="form-group-modal">
              <label class="form-label-modal">Harga Satuan</label>
              <input
                v-model.number="formBarang.price"
                type="number"
                min="0"
                class="form-input-modal"
                placeholder="0"
              />
            </div>
          </div>
        </div>
        <div class="modal-footer-barang">
          <button type="button" class="btn-cancel-modal" @click="closeModalTambahBarang">Batal</button>
          <button
            type="button"
            class="btn-save-modal"
            @click="simpanBarangBaru"
            :disabled="isSavingBarang"
          >
            {{ isSavingBarang ? '⏳ Menyimpan...' : '💾 Simpan Barang' }}
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
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
const daftarKategori = ref([])
const daftarSatuan = ref([])
const showModalTambahBarang = ref(false)
const isSavingBarang = ref(false)
const formBarang = ref({
  code: '',
  name: '',
  category_id: '',
  unit_id: '',
  stock: 0,
  price: 0,
})
const choicesInstances = ref([])

const form = reactive({
  supplier_id: '',
  order_date: new Date().toISOString().slice(0, 10),
  delivery_date: '',
  notes: '',
  ppn_percentage: 12,
  currency: 'IDR',
  exchange_rate: 16000,
  details: [],
})

// totalSubtotalForeign = jumlah harga dalam currency asli (USD/EUR)
const totalSubtotalForeign = computed(() => {
  return form.details.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0)
})

// totalSubtotal = selalu IDR
const totalSubtotal = computed(() => {
  const isForeign = form.currency === 'USD' || form.currency === 'EUR'
  const rate = isForeign ? (form.exchange_rate || 1) : 1
  return totalSubtotalForeign.value * rate
})

const totalPPN = computed(() => {
  let ppnRate = form.ppn_percentage
  if (ppnRate === 11.12) ppnRate = 11
  return (totalSubtotal.value * ppnRate) / 100
})

const grandTotal = computed(() => {
  return totalSubtotal.value + totalPPN.value
})

const initializeChoices = async () => {
  await nextTick()

  form.details.forEach((item, index) => {
    const selectElement = document.getElementById(`select-barang-${index}`)
    if (!selectElement) return

    // Skip jika sudah punya instance
    if (selectElement._choicesInstance) return

    const placeholder = document.createElement('option')
    placeholder.value = ''
    placeholder.textContent = 'Pilih Barang'
    selectElement.replaceChildren(placeholder)

    // Tandai option.selected = true SEBELUM Choices.js init
    // Choices.js membaca state DOM saat konstruktor dipanggil
    daftarBarang.value.forEach((barang) => {
      const option = document.createElement('option')
      option.value = String(barang.id)
      option.textContent = `${barang.code} - ${barang.name} (Stok: ${formatStock(barang.stock)})`
      if (item.item_id && String(barang.id) === String(item.item_id)) {
        option.selected = true
      }
      selectElement.appendChild(option)
    })

    const choices = new Choices(selectElement, {
      searchEnabled: true,
      searchPlaceholderValue: 'Ketik nama barang untuk mencari...',
      noResultsText: 'Barang tidak ditemukan',
      noChoicesText: 'Tidak ada barang operasional',
      itemSelectText: 'Klik untuk pilih',
      shouldSort: false,
      removeItemButton: false,
      position: 'bottom',
      searchFields: ['label'],
    })

    // Simpan instance agar tidak reinit
    selectElement._choicesInstance = choices

    selectElement.addEventListener('change', (event) => {
      item.item_id = parseInt(event.target.value) || ''
    })

    choicesInstances.value.push(choices)
  })
}

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
    delivery_date: '',
    specifications: {},
  })
  await nextTick()
  initializeChoices()
}

const hapusBarang = (index) => {
  if (form.details.length <= 1) return

  const selectElement = document.getElementById(`select-barang-${index}`)
  if (selectElement?._choicesInstance) {
    selectElement._choicesInstance.destroy()
    selectElement._choicesInstance = null
  }

  form.details.splice(index, 1)
}

const saveOrder = async () => {
  isSaving.value = true
  try {
    const payload = {
      ...form,
      type: 'operasional',
      currency: form.currency,
      exchange_rate: (form.currency === 'USD' || form.currency === 'EUR') ? form.exchange_rate : 1,
      details: form.details.map((d) => ({
        item_id:        d.item_id,
        quantity:       d.quantity,
        price:          d.price,
        delivery_date:  d.delivery_date || null,
        specifications: d.specifications,
      })),
    }

    if (isEditMode.value) {
      await apiClient.put(`/purchase-orders/${poId}`, payload)
      toast.success('PO Operasional berhasil diupdate!')
    } else {
      await apiClient.post('/purchase-orders', payload)
      toast.success('PO Operasional berhasil dibuat!')
    }
    router.push({ name: 'PembelianOperasional' })
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Gagal menyimpan pesanan.'
    toast.error(errorMessage)
  } finally {
    isSaving.value = false
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
    form.supplier_id   = data.supplier_id
    form.order_date    = data.order_date
    form.delivery_date = data.delivery_date || ''
    form.notes         = data.notes || ''
    form.ppn_percentage = parseFloat(data.ppn_percentage ?? 12)
    form.currency      = data.currency || 'IDR'
    form.exchange_rate = parseFloat(data.exchange_rate ?? 16000)

    form.details = data.details.map((d) => ({
      item_id:       d.item_id,
      quantity:      parseFloat(d.quantity_ordered),
      price:         parseFloat(d.price),
      delivery_date: d.delivery_date || '',
      specifications: d.specifications || {},
    }))

    // Pastikan semua item di PO ada di daftarBarang (bisa saja beda kategori)
    const existingIds = form.details.map((d) => d.item_id).filter(Boolean)
    const missingIds = existingIds.filter((id) => !daftarBarang.value.find((b) => b.id === id))
    if (missingIds.length > 0) {
      try {
        const res = await apiClient.get('/materials?all=true')
        const allItems = res.data.data
        missingIds.forEach((id) => {
          const found = allItems.find((b) => b.id === id)
          if (found && !daftarBarang.value.find((b) => b.id === found.id)) {
            daftarBarang.value.push(found)
          }
        })
      } catch {
        // silent fallback
      }
    }
  } catch (error) {
    console.error('Gagal memuat data PO:', error)
    toast.error('Gagal memuat data PO.')
  } finally {
    // WAJIB: loading=false dulu agar <form v-else> ter-render ke DOM,
    // baru nextTick + initializeChoices bisa menemukan elemen select
    loading.value = false
    await nextTick()
    initializeChoices()
  }
}

const fetchDataDropdown = async () => {
  try {
    // Step 1: Fetch supplier & kategori parallel
    const [supplierRes, categoryRes] = await Promise.all([
      apiClient.get('/suppliers?all=true'),
      apiClient.get('/categories?all=true'),
    ])
    daftarSupplier.value = supplierRes.data.data

    // Step 2: Cari ID kategori operasional
    const operasionalIds = categoryRes.data.data
      .filter((cat) => {
        const catName = (cat.name || '').toLowerCase().trim()
        return catName === 'bahan penolong' || catName === 'bahan operasional'
      })
      .map((cat) => cat.id)

    if (operasionalIds.length === 0) {
      console.warn('⚠️ Kategori operasional tidak ditemukan!')
      const barangRes = await apiClient.get('/materials?all=true')
      daftarBarang.value = barangRes.data.data
      return
    }

    // Step 3: Fetch material dengan filter category_ids langsung di BE
    const barangRes = await apiClient.get('/materials?all=true', {
      params: { category_ids: operasionalIds.join(',') },
    })
    daftarBarang.value = barangRes.data.data
    console.log(`✅ Loaded ${daftarBarang.value.length} barang operasional`)
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal memuat data.')
    console.error('❌ Error fetchDataDropdown:', error)
  }
}

const openModalTambahBarang = () => {
  formBarang.value = { code: '', name: '', category_id: '', unit_id: '', stock: 0, price: 0 }
  showModalTambahBarang.value = true
}

const closeModalTambahBarang = () => {
  showModalTambahBarang.value = false
}

const simpanBarangBaru = async () => {
  if (!formBarang.value.name || !formBarang.value.category_id || !formBarang.value.unit_id) {
    toast.error('Nama, kategori, dan satuan wajib diisi!')
    return
  }
  isSavingBarang.value = true
  try {
    const res = await apiClient.post('/materials', {
      code: formBarang.value.code || null,
      name: formBarang.value.name,
      category_id: formBarang.value.category_id,
      unit_id: formBarang.value.unit_id,
      stock: formBarang.value.stock || 0,
      price: formBarang.value.price || 0,
    })

    // Tutup modal segera setelah request 2xx berhasil
    closeModalTambahBarang()

    // Ekstrak data dari response (support { data: {...} } maupun langsung {...})
    const barangBaru = res.data?.data ?? res.data

    if (barangBaru?.id) {
      const label = barangBaru.code
        ? `${barangBaru.code} - ${barangBaru.name} (Stok: 0)`
        : `${barangBaru.name} (Stok: 0)`

      // Tambahkan ke daftarBarang (tidak memicu v-for lagi karena sudah dihapus dari template)
      daftarBarang.value.push({ id: barangBaru.id, code: barangBaru.code, name: barangBaru.name, stock: 0 })

      // Update semua Choices instance langsung via API Choices.js
      choicesInstances.value.forEach((instance) => {
        try {
          instance.setChoices([{ value: String(barangBaru.id), label }], 'value', 'label', false)
        } catch {
          // instance sudah destroyed, abaikan
        }
      })

      toast.success(`Barang "${barangBaru.name}" berhasil ditambahkan!`)
    } else {
      // 201 tapi response tidak berisi id — tidak ada yang perlu diupdate
      toast.success('Barang berhasil ditambahkan!')
    }
  } catch (error) {
    const errData = error.response?.data
    const msg =
      errData?.message ||
      (errData?.errors ? Object.values(errData.errors).flat().join(', ') : null) ||
      error.message ||
      'Gagal menyimpan barang'
    toast.error(msg)
  } finally {
    isSavingBarang.value = false
  }
}

onMounted(async () => {
  await fetchDataDropdown()
  await fetchPOData()
  // Fetch kategori & satuan untuk modal
  try {
    const [katRes, satRes] = await Promise.all([
      apiClient.get('/categories/all'),
      apiClient.get('/units/all'),
    ])
    daftarKategori.value = katRes.data.data
    daftarSatuan.value = satRes.data.data
  } catch {
    /* silent */
  }
})

const formatStock = (stock) => {
  if (stock === null || stock === undefined) return '0'
  return parseFloat(stock).toLocaleString('id-ID')
}

const formatCurrency = (value) => {
  if (isNaN(value)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatForeign = (value) => {
  if (isNaN(value)) return '0.00'
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

const formatRibuan = (value) => {
  if (!value || isNaN(value)) return '0'
  return new Intl.NumberFormat('id-ID').format(value)
}

// ✅ UPDATED: Tampilan PPN di summary
const formatPPNDisplay = (percentage) => {
  if (percentage === 11.12) {
    return '12% ⚡' // Tampilan konsisten dengan button
  }
  return `${percentage}%`
}
</script>
<style scoped>
/* ✅ SPECIAL STYLING UNTUK 12% ⚡ (HITUNG 11%) */
.ppn-radio.ppn-special {
  position: relative;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  font-weight: 600;
  padding: 10px 16px;
}

.ppn-radio.ppn-special:has(input:checked) {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-color: #d97706;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.ppn-radio.ppn-special span {
  color: #92400e;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
}

.ppn-radio.ppn-special:has(input:checked) span {
  color: white;
}

/* ✅ CATATAN KECIL "Hitung 11%" */
.ppn-note {
  position: absolute;
  bottom: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: #92400e;
  background: #fef3c7;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.2s;
}

.ppn-radio.ppn-special:hover .ppn-note {
  opacity: 1;
}

.ppn-radio.ppn-special:has(input:checked) .ppn-note {
  opacity: 1;
  background: #fbbf24;
  color: white;
}

/* ===== LOADING STATE ===== */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  gap: 24px;
  background: linear-gradient(135deg, #fafbfc, #ffffff);
  border-radius: 20px;
  padding: 80px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.spinner {
  width: 64px;
  height: 64px;
  border: 6px solid #f0f0f0;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 17px;
  color: #64748b;
  font-weight: 700;
}

/* ===== PAGE HEADER ===== */
.page-header {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%);
  padding: 32px 36px;
  border-radius: 20px;
  margin-bottom: 28px;
  box-shadow: 0 10px 30px rgba(124, 58, 237, 0.25);
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15), transparent);
  border-radius: 50%;
}

.page-header::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -5%;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent);
  border-radius: 50%;
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
  gap: 20px;
}

.icon-badge {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15));
  backdrop-filter: blur(15px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.page-title {
  font-size: 28px;
  font-weight: 900;
  margin: 0 0 6px 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 14px;
  opacity: 0.95;
  margin: 0;
  font-weight: 500;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #fff, #f0f0f0);
  color: #7c3aed;
  text-decoration: none;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.btn-back::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.1), transparent);
  transition: left 0.5s ease;
}

.btn-back:hover::before {
  left: 100%;
}

.btn-back:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.btn-icon {
  font-size: 18px;
}

/* ===== CONTENT CARD ===== */
.content-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  border: 1px solid #f0f0f0;
}

.card-header-section {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 28px 36px;
  background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
  border-bottom: 3px solid #e9ecef;
  position: relative;
}

.card-header-section::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 36px;
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, #7c3aed, #6d28d9, #5b21b6);
  border-radius: 3px 3px 0 0;
}

.section-icon-wrapper {
  display: flex;
}

.section-icon {
  font-size: 28px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ddd6fe, #c4b5fd);
  border-radius: 14px;
  box-shadow: 0 6px 16px rgba(124, 58, 237, 0.25);
  border: 2px solid #a78bfa;
}

.section-title {
  font-size: 20px;
  font-weight: 900;
  color: #1e293b;
  margin: 0 0 6px 0;
  letter-spacing: -0.3px;
}

.section-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  font-weight: 600;
}

.card-body {
  padding: 32px 36px;
}

.card-body-table {
  padding: 32px 36px 0 36px;
}

/* ===== FORM GRID ===== */
.info-grid-form {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  font-weight: 800;
  color: #1e293b;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: #fafbfc;
  font-weight: 500;
}

.form-control:focus {
  outline: none;
  border-color: #7c3aed;
  background: white;
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

/* ===== TABLE ===== */
.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
  background: white;
}

.detail-table thead {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
}

.detail-table th {
  padding: 14px 16px;
  text-align: left;
  color: white;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.th-material {
  width: 40%;
}

.th-qty {
  width: 13%;
}

.th-price {
  width: 18%;
}

.th-subtotal {
  width: 17%;
}

.th-action {
  width: 12%;
  text-align: center;
}

.detail-table tbody tr {
  transition: all 0.2s ease;
}

.data-row {
  border-bottom: 1px solid #f1f5f9;
}

.data-row:hover {
  background: linear-gradient(135deg, #faf5ff, #f3e8ff);
}

.detail-table td {
  padding: 12px 16px;
  vertical-align: middle;
}

.td-qty .form-control,
.td-price .form-control {
  padding: 9px 12px;
  font-size: 13px;
  border-radius: 8px;
  min-width: 0;
}

.td-subtotal {
  font-weight: 700;
  color: #059669;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  white-space: nowrap;
}

.td-action {
  text-align: center;
}

/* ===== CHOICES.JS STYLING — pakai :deep() karena scoped ===== */
:deep(.choices) {
  margin-bottom: 0;
  font-family: inherit;
}

:deep(.choices__inner) {
  min-height: 42px;
  padding: 9px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: #fafbfc;
  font-size: 13px;
  transition: all 0.2s ease;
}

:deep(.choices__inner:hover) {
  border-color: #cbd5e1;
}

:deep(.choices.is-open .choices__inner),
:deep(.choices.is-focused .choices__inner) {
  border-color: #7c3aed;
  background: white;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

:deep(.choices__list--dropdown) {
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  margin-top: 6px;
}

:deep(.choices__item--selectable) {
  padding: 10px 14px;
  font-size: 13px;
  transition: all 0.15s ease;
}

:deep(.choices__item--selectable.is-highlighted) {
  background: #f3e8ff;
  color: #5b21b6;
}

:deep(.choices__input) {
  font-size: 13px;
  padding: 6px 8px;
  background: white;
  margin-bottom: 0;
}

:deep(.choices__input::placeholder) {
  color: #94a3b8;
}

.td-material :deep(.choices) {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.td-material :deep(.choices__inner) {
  min-height: 40px;
  padding: 8px 10px;
}

.td-material :deep(.choices__list--single) {
  padding: 0;
}

.td-material :deep(.choices__placeholder) {
  font-size: 13px;
  opacity: 0.6;
}

/* ===== BUTTONS ===== */
.btn-delete {
  padding: 10px 18px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
}

.btn-delete:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

.btn-delete:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-add-row {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
  margin-top: 20px;
}

.btn-add-row:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.table-actions {
  padding: 20px 0 0 0;
  text-align: left;
}

/* ===== SUMMARY SECTION - COMPACT ===== */
.summary-section {
  padding: 28px 36px;
  background: #f8f9fa;
  border-top: 2px solid #e9ecef;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
}

/* PPN Selector - Compact */
.ppn-compact {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ppn-label-compact {
  font-weight: 700;
  color: #475569;
  font-size: 13px;
  white-space: nowrap;
}

.ppn-options-compact {
  display: flex;
  gap: 8px;
}

.ppn-radio {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  font-size: 13px;
}

.ppn-radio:hover {
  border-color: #7c3aed;
  background: #faf5ff;
}

.ppn-radio input[type='radio'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #7c3aed;
  margin: 0;
}

.ppn-radio:has(input[type='radio']:checked) {
  background: #f3e8ff;
  border-color: #7c3aed;
  color: #5b21b6;
}

/* Summary Values - Compact */
.summary-compact {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.summary-item-compact {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  background: white;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  white-space: nowrap;
}

.summary-item-compact .label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.summary-item-compact .value {
  font-size: 14px;
  font-weight: 800;
  color: #1e293b;
  font-family: 'Courier New', monospace;
}

.summary-item-compact .value.ppn {
  color: #6d28d9;
}

.summary-item-compact.total {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  border: none;
  padding: 9px 16px;
}

.summary-item-compact.total .label,
.summary-item-compact.total .value {
  color: white;
  font-size: 14px;
}

/* ===== FORM ACTIONS ===== */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 28px;
  padding: 28px 36px;
  background: linear-gradient(135deg, #fafbfc, #ffffff);
  border-radius: 20px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.btn-submit-action {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: white;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
  position: relative;
  overflow: hidden;
}

.btn-submit-action::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.btn-submit-action:hover::before {
  left: 100%;
}

.btn-submit-action:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(124, 58, 237, 0.45);
  background: linear-gradient(135deg, #6d28d9, #5b21b6);
}

.btn-submit-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .info-grid-form {
    grid-template-columns: 1fr;
  }

  .page-header {
    padding: 24px;
    border-radius: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .icon-badge {
    width: 52px;
    height: 52px;
    font-size: 26px;
  }

  .page-title {
    font-size: 22px;
  }

  .btn-back {
    width: 100%;
    justify-content: center;
    padding: 12px 18px;
  }

  .card-header-section {
    padding: 24px;
  }

  .card-body,
  .card-body-table {
    padding: 24px;
  }

  .summary-section {
    padding: 24px;
  }

  .summary-row {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .ppn-compact {
    flex-direction: column;
    align-items: flex-start;
  }

  .ppn-options-compact {
    width: 100%;
    flex-wrap: wrap;
  }

  .ppn-radio {
    flex: 1;
    min-width: 80px;
    justify-content: center;
  }

  .summary-compact {
    flex-direction: column;
    gap: 10px;
  }

  .summary-item-compact {
    width: 100%;
    justify-content: space-between;
  }

  .form-actions {
    flex-direction: column;
    padding: 24px;
  }

  .btn-submit-action {
    width: 100%;
    justify-content: center;
  }
}
.material-select-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  min-width: 0;
}
.btn-quick-add {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  background: #dbeafe;
  color: #1e40af;
  border: 2px solid #93c5fd;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.btn-quick-add:hover {
  background: #bfdbfe;
  transform: scale(1.1);
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}
.modal-container-barang {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 580px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}
.modal-header-barang {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: white;
}
.modal-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}
.modal-icon {
  font-size: 28px;
}
.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}
.modal-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}
.modal-body-barang {
  padding: 28px;
}
.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.form-group-modal {
  display: flex;
  flex-direction: column;
}
.form-label-modal {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 6px;
}
.req {
  color: #ef4444;
}
.form-input-modal {
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}
.form-input-modal:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}
.modal-footer-barang {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  background: #f9fafb;
  border-top: 2px solid #e5e7eb;
}
.btn-cancel-modal {
  padding: 10px 20px;
  background: #e5e7eb;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}
.btn-cancel-modal:hover {
  background: #d1d5db;
}
.btn-save-modal {
  padding: 10px 24px;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}
.btn-save-modal:hover:not(:disabled) {
  transform: translateY(-1px);
}
.btn-save-modal:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
/* Vue Select - Supplier */
.vue-select-supplier :deep(.vs__dropdown-toggle) {
  padding: 4px 8px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  min-height: 42px;
  font-size: 14px;
  background: white;
}
.vue-select-supplier.vs--open :deep(.vs__dropdown-toggle) {
  border-color: #0369a1;
}
.vue-select-supplier :deep(.vs__selected) {
  font-weight: 600;
  color: #111827;
}
.vue-select-supplier :deep(.vs__search::placeholder) {
  color: #9ca3af;
  font-weight: 400;
}
.vue-select-supplier :deep(.vs__dropdown-menu) {
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.th-date { width: 150px; }
.td-date input { padding: 8px 10px; font-size: 13px; border-radius: 8px; }

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
.form-control.has-prefix { border: none; background: transparent; box-shadow: none; border-radius: 0; }
.form-hint-kurs { font-size: 12px; color: #6d28d9; font-weight: 600; margin-top: 6px; display: block; }

/* ===== FOREIGN CURRENCY SUBTOTAL IN TABLE ===== */
.usd-price { display: block; font-weight: 700; color: #1d4ed8; font-size: 13px; }
.eur-price { display: block; font-weight: 700; color: #7c3aed; font-size: 13px; }
.idr-equiv { display: block; font-size: 11px; color: #059669; font-weight: 600; }
.th-currency-badge {
  display: inline-block;
  background: #1d4ed8;
  color: white;
  font-size: 9px;
  padding: 2px 5px;
  border-radius: 4px;
  margin-left: 4px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.th-eur-badge { background: #7c3aed; }

/* ===== SUMMARY IDR SMALL ===== */
.idr-small { font-size: 11px; color: rgba(255,255,255,0.8); margin-left: 4px; }
</style>
