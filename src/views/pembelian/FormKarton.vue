<template>
  <DashboardLayout>
    <div class="page-header">
      <div class="header-content">
        <div class="header-left-section">
          <div class="icon-badge">📦</div>
          <div>
            <h1 class="page-title">{{ isEditMode ? 'Edit' : 'Buat' }} PO Karton Box</h1>
            <p class="page-subtitle">
              {{
                isEditMode
                  ? `Edit PO Karton ${poNumber}`
                  : 'Isi detail untuk membuat PO Karton baru'
              }}
            </p>
          </div>
        </div>
        <router-link :to="{ name: 'PembelianKarton' }" class="btn-back">
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
      <!-- INFORMASI UTAMA -->
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
              <select v-model="form.supplier_id" class="form-control" required>
                <option disabled value="">Pilih Supplier</option>
                <option v-for="supplier in daftarSupplier" :key="supplier.id" :value="supplier.id">
                  {{ supplier.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Tanggal Pesan</label>
              <input type="date" v-model="form.order_date" class="form-control" required />
            </div>

            <!-- ✅ TAMBAH INPUT TANGGAL KIRIM -->
            <div class="form-group">
              <label class="form-label">Tanggal Kirim</label>
              <input type="date" v-model="form.delivery_date" class="form-control" required />
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

      <!-- DETAIL BARANG & SPESIFIKASI -->
      <div class="content-card">
        <div class="card-header-section">
          <div class="section-icon-wrapper">
            <div class="section-icon">📝</div>
          </div>
          <div class="section-header-text">
            <h2 class="section-title">Detail Barang & Spesifikasi</h2>
            <p class="section-subtitle">Tambahkan barang beserta spesifikasi karton box</p>
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
                  <th class="th-date">Tgl Kirim</th>
                  <th class="th-action">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(item, index) in form.details" :key="index">
                  <!-- DATA ROW -->
                  <tr class="data-row">
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
                          title="Tambah karton box baru"
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
                      {{ formatCurrency((item.quantity || 0) * (item.price || 0)) }}
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

                  <!-- SPEC ROW -->
                  <tr class="spec-row">
                    <td colspan="5" class="spec-cell">
                      <div class="spec-card">
                        <h4 class="spec-title">📐 Spesifikasi Karton Box</h4>
                        <div class="spec-grid-karton">
                          <div class="spec-field">
                            <label class="spec-label">Panjang (mm)</label>
                            <input
                              type="number"
                              v-model.number="item.specifications.panjang"
                              placeholder="0"
                              class="form-control-spec"
                            />
                          </div>
                          <div class="spec-field">
                            <label class="spec-label">Lebar (mm)</label>
                            <input
                              type="number"
                              v-model.number="item.specifications.lebar"
                              placeholder="0"
                              class="form-control-spec"
                            />
                          </div>
                          <div class="spec-field">
                            <label class="spec-label">Tinggi (mm)</label>
                            <input
                              type="number"
                              v-model.number="item.specifications.tinggi"
                              placeholder="0"
                              class="form-control-spec"
                            />
                          </div>
                          <div class="spec-field">
                            <label class="spec-label">Kualitas</label>
                            <input
                              type="text"
                              v-model="item.specifications.kualitas"
                              placeholder="B/F, C/F"
                              class="form-control-spec"
                            />
                          </div>
                          <div class="spec-field">
                            <label class="spec-label">Jenis</label>
                            <input
                              type="text"
                              v-model="item.specifications.jenis"
                              placeholder="Single/Double Wall"
                              class="form-control-spec"
                            />
                          </div>
                          <!-- ✅ TAMBAH 2 FIELD BARU -->
                          <div class="spec-field">
                            <label class="spec-label">Model</label>
                            <input
                              type="text"
                              v-model="item.specifications.model"
                              placeholder="Model karton"
                              class="form-control-spec"
                            />
                          </div>
                          <div class="spec-field">
                            <label class="spec-label">Keterangan</label>
                            <input
                              type="text"
                              v-model="item.specifications.keterangan"
                              placeholder="Keterangan tambahan"
                              class="form-control-spec"
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <div class="table-actions">
            <button @click="tambahBarang" type="button" class="btn-add-row">
              ➕ Tambah Barang
            </button>
          </div>
        </div>

        <!-- SUMMARY SECTION WITH PPN -->
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
                <!-- ✅ TAMPILAN: 12% dengan icon/badge -->
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
                <span class="value">{{ formatCurrency(totalSubtotal) }}</span>
              </div>
              <div class="summary-item-compact">
                <span class="label">PPN ({{ formatPPNDisplay(form.ppn_percentage) }}):</span>
                <span class="value ppn">{{ formatCurrency(totalPPN) }}</span>
              </div>
              <div class="summary-item-compact total">
                <span class="label">Grand Total:</span>
                <span class="value">{{ formatCurrency(grandTotal) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FORM ACTIONS -->
      <div class="form-actions">
        <button type="submit" class="btn-submit-action" :disabled="isSaving">
          {{ isSaving ? 'Menyimpan...' : 'Simpan PO Karton' }}
        </button>
      </div>
    </form>

    <!-- MODAL TAMBAH KARTON BOX BARU -->
    <div v-if="showModalTambahBarang" class="modal-overlay" @click.self="closeModalTambahBarang">
      <div class="modal-container-barang">
        <div class="modal-header-barang">
          <div class="modal-title-wrapper">
            <span class="modal-icon">📦</span>
            <h3 class="modal-title">Tambah Karton Box Baru</h3>
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
                placeholder="KRT-001"
              />
            </div>
            <div class="form-group-modal">
              <label class="form-label-modal">Nama <span class="req">*</span></label>
              <input
                v-model="formBarang.name"
                type="text"
                class="form-input-modal"
                placeholder="BOX U. AGAVE..."
              />
            </div>
            <div class="form-group-modal">
              <label class="form-label-modal">Buyer</label>
              <input
                v-model="formBarang.buyer_name"
                type="text"
                class="form-input-modal"
                placeholder="ETHIMO"
              />
            </div>
            <div class="form-group-modal">
              <label class="form-label-modal">Model</label>
              <input
                v-model="formBarang.model"
                type="text"
                class="form-input-modal"
                placeholder="AGAVE"
              />
            </div>
            <div class="form-group-modal">
              <label class="form-label-modal">Jenis Karton</label>
              <input
                v-model="formBarang.jenis_karton"
                type="text"
                class="form-input-modal"
                placeholder="RST"
              />
            </div>
            <div class="form-group-modal">
              <label class="form-label-modal">Kualitas</label>
              <input
                v-model="formBarang.kualitas"
                type="text"
                class="form-input-modal"
                placeholder="A"
              />
            </div>
            <div class="form-group-modal">
              <label class="form-label-modal">P (mm)</label>
              <input
                v-model.number="formBarang.p"
                type="number"
                min="0"
                class="form-input-modal"
                placeholder="0"
              />
            </div>
            <div class="form-group-modal">
              <label class="form-label-modal">L (mm)</label>
              <input
                v-model.number="formBarang.l"
                type="number"
                min="0"
                class="form-input-modal"
                placeholder="0"
              />
            </div>
            <div class="form-group-modal">
              <label class="form-label-modal">T (mm)</label>
              <input
                v-model.number="formBarang.t"
                type="number"
                min="0"
                class="form-input-modal"
                placeholder="0"
              />
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
            {{ isSavingBarang ? '⏳ Menyimpan...' : '💾 Simpan' }}
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
const showModalTambahBarang = ref(false)
const isSavingBarang = ref(false)
const formBarang = ref({
  code: '',
  name: '',
  buyer_name: '',
  model: '',
  jenis_karton: '',
  kualitas: '',
  p: 0,
  l: 0,
  t: 0,
  stock: 0,
})
const choicesInstances = ref([])

const form = reactive({
  supplier_id: '',
  order_date: new Date().toISOString().slice(0, 10),
  delivery_date: '', // ✅ TAMBAH INI
  notes: '',
  ppn_percentage: 12, // Default 12%
  details: [],
})

// ✅ COMPUTED: Calculate Summary
const totalSubtotal = computed(() => {
  return form.details.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.price || 0)
  }, 0)
})

const totalPPN = computed(() => {
  let ppnRate = form.ppn_percentage

  // Special case: 11.12 → hitung pakai 11%
  if (ppnRate === 11.12) {
    ppnRate = 11
  }

  return (totalSubtotal.value * ppnRate) / 100
})

const grandTotal = computed(() => {
  return totalSubtotal.value + totalPPN.value
})

const initializeChoices = async () => {
  await nextTick()

  choicesInstances.value.forEach((choice) => {
    if (choice && choice.destroy) choice.destroy()
  })
  choicesInstances.value = []

  form.details.forEach((item, index) => {
    const selectElement = document.getElementById(`select-barang-${index}`)
    if (!selectElement) return

    // Isi options imperatif — Choices.js membaca DOM saat konstruktor dipanggil
    const placeholder = document.createElement('option')
    placeholder.value = ''
    placeholder.textContent = 'Pilih Barang'
    selectElement.replaceChildren(placeholder)

    daftarBarang.value.forEach((barang) => {
      const option = document.createElement('option')
      option.value = String(barang.id)
      option.textContent = barang.code ? `${barang.code} - ${barang.name}` : barang.name
      if (item.item_id && String(barang.id) === String(item.item_id)) {
        option.selected = true // tandai sebelum Choices.js init
      }
      selectElement.appendChild(option)
    })

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
    specifications: {
      panjang: null,
      lebar: null,
      tinggi: null,
      kualitas: '',
      jenis: '',
      model: '', // ✅ TAMBAH
      keterangan: '', // ✅ TAMBAH
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
    const payload = {
      ...form,
      type: 'karton',
      details: form.details.map((d) => ({
        item_id: d.item_id,
        quantity: d.quantity,
        price: d.price,
        delivery_date: d.delivery_date || null,
        specifications: d.specifications,
      })),
    }

    if (isEditMode.value) {
      await apiClient.put(`/purchase-orders/${poId}`, payload)
      toast.success('PO Karton berhasil diupdate!')
    } else {
      await apiClient.post('/purchase-orders', payload)
      toast.success('PO Karton berhasil dibuat!')
    }
    router.push({ name: 'PembelianKarton' })
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Gagal menyimpan pesanan.'
    toast.error(errorMessage)
  } finally {
    isSaving.value = false
  }
}

const openModalTambahBarang = () => {
  formBarang.value = {
    code: '',
    name: '',
    buyer_name: '',
    model: '',
    jenis_karton: '',
    kualitas: '',
    p: 0,
    l: 0,
    t: 0,
    stock: 0,
  }
  showModalTambahBarang.value = true
}

const closeModalTambahBarang = () => {
  showModalTambahBarang.value = false
}

const simpanBarangBaru = async () => {
  if (!formBarang.value.name) {
    toast.error('Nama barang wajib diisi!')
    return
  }
  isSavingBarang.value = true
  try {
    // Cari category_id Karton Box dan unit_id PCS
    const [catRes, unitRes] = await Promise.all([
      apiClient.get('/categories/all'),
      apiClient.get('/units/all'),
    ])
    const kartonCat = catRes.data.data.find((c) => c.name === 'Karton Box')
    const pcUnit = unitRes.data.data.find((u) => u.name === 'PCS' || u.short_name === 'PCS')

    if (!kartonCat) {
      toast.error('Kategori Karton Box tidak ditemukan!')
      return
    }
    if (!pcUnit) {
      toast.error('Satuan PCS tidak ditemukan!')
      return
    }

    const p = formBarang.value.p || 0
    const l = formBarang.value.l || 0
    const t = formBarang.value.t || 0
    const m3PerPcs = p > 0 && l > 0 && t > 0 ? (p * l * t) / 1000000000 : 0

    const res = await apiClient.post('/materials', {
      code: formBarang.value.code || null,
      name: formBarang.value.name,
      category_id: kartonCat.id,
      unit_id: pcUnit.id,
      stock: formBarang.value.stock || 0,
      buyer_name: formBarang.value.buyer_name || null,
      model: formBarang.value.model || null,
      jenis_karton: formBarang.value.jenis_karton || null,
      kualitas: formBarang.value.kualitas || null,
      specifications: { p, l, t, m3_per_pcs: m3PerPcs },
    })

    // Tutup modal segera setelah 2xx berhasil
    closeModalTambahBarang()

    const barangBaru = res.data?.data ?? res.data
    if (barangBaru?.id) {
      daftarBarang.value.push({ id: barangBaru.id, code: barangBaru.code, name: barangBaru.name })

      const label = barangBaru.code
        ? `${barangBaru.code} - ${barangBaru.name}`
        : barangBaru.name
      choicesInstances.value.forEach((instance) => {
        try {
          instance.setChoices([{ value: String(barangBaru.id), label }], 'value', 'label', false)
        } catch {
          // instance sudah destroyed, abaikan
        }
      })

      toast.success(`Karton "${barangBaru.name}" berhasil ditambahkan!`)
    } else {
      toast.success('Karton berhasil ditambahkan!')
    }
  } catch (error) {
    const errData = error.response?.data
    const msg =
      errData?.message ||
      (errData?.errors ? Object.values(errData.errors).flat().join(', ') : null) ||
      error.message ||
      'Gagal menyimpan karton box'
    toast.error(msg)
  } finally {
    isSavingBarang.value = false
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
    form.delivery_date = data.delivery_date || ''
    form.notes = data.notes || ''
    form.ppn_percentage = parseFloat(data.ppn_percentage ?? 12)

    form.details = data.details.map((d) => ({
      item_id: d.item_id,
      quantity: parseFloat(d.quantity_ordered),
      price: parseFloat(d.price),
      delivery_date: d.delivery_date || '',
      specifications: d.specifications || {
        panjang: null,
        lebar: null,
        tinggi: null,
        kualitas: '',
        jenis: '',
        model: '',
        keterangan: '',
      },
    }))
  } catch {
    toast.error('Gagal memuat data PO.')
  } finally {
    // ✅ Set loading=false DULU, baru init Choices.js
    // Karena form pakai v-if="!loading", DOM select belum ada sebelum loading=false
    loading.value = false
    await nextTick()
    initializeChoices()
  }
}

const fetchDataDropdown = async () => {
  try {
    const [supplierRes, barangRes, categoryRes] = await Promise.all([
      apiClient.get('/suppliers?all=true'),
      apiClient.get('/materials?all=true'),
      apiClient.get('/categories?all=true'),
    ])
    daftarSupplier.value = supplierRes.data.data

    const allBarang = barangRes.data.data
    const allCategories = categoryRes.data.data

    const kartonCategory = allCategories.find((cat) => cat.name === 'Karton Box')

    if (kartonCategory) {
      daftarBarang.value = allBarang.filter((item) => item.category_id === kartonCategory.id)
    } else {
      daftarBarang.value = allBarang
    }
  } catch {
    toast.error('Gagal memuat data supplier atau barang.')
  }
}

onMounted(async () => {
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

// ✅ UPDATED: Tampilan PPN di summary
const formatPPNDisplay = (percentage) => {
  if (percentage === 11.12) {
    return '12% ⚡' // Tampilan konsisten dengan button
  }
  return `${percentage}%`
}
</script>

<style scoped>
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
  border-top-color: #f97316;
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
  background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%);
  padding: 32px 36px;
  border-radius: 20px;
  margin-bottom: 28px;
  box-shadow: 0 10px 30px rgba(249, 115, 22, 0.25);
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
  color: #f97316;
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
  background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.1), transparent);
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
  background: linear-gradient(90deg, #f97316, #ea580c, #dc2626);
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
  background: linear-gradient(135deg, #fed7aa, #fdba74);
  border-radius: 14px;
  box-shadow: 0 6px 16px rgba(249, 115, 22, 0.25);
  border: 2px solid #fb923c;
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
  border-color: #f97316;
  background: white;
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
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
  min-width: 1000px;
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
  width: 52%;
  min-width: 320px;
}

.th-qty {
  width: 11%;
}

.th-price {
  width: 14%;
}

.th-subtotal {
  width: 13%;
}

.th-date {
  width: 150px;
}

.th-action {
  width: 10%;
  text-align: center;
}

.detail-table tbody tr {
  transition: all 0.2s ease;
}

.data-row {
  border-bottom: 1px solid #f1f5f9;
}

.data-row:hover {
  background: linear-gradient(135deg, #ffedd5, #fed7aa);
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

.td-date input {
  padding: 8px 10px;
  font-size: 13px;
  border-radius: 8px;
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

/* ===== SPEC ROW ===== */
.spec-row {
  background: linear-gradient(135deg, #fff7ed, #ffedd5);
  border-bottom: 3px solid #fed7aa;
}

.spec-cell {
  padding: 0 20px 20px 20px !important;
}

.spec-card {
  background: white;
  border: 2px solid #fdba74;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.15);
}

.spec-title {
  font-weight: 900;
  color: #c2410c;
  margin: 0 0 20px 0;
  font-size: 17px;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: -0.2px;
}

/* ===== SPEC GRID KARTON - NEW ===== */
.spec-grid-karton {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 18px;
  align-items: start;
}

.spec-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.spec-label {
  font-weight: 700;
  color: #1e293b;
  font-size: 13px;
  white-space: nowrap;
}

.form-control-spec {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #fafbfc;
  font-weight: 500;
  box-sizing: border-box;
}

.form-control-spec:focus {
  outline: none;
  border-color: #f97316;
  background: white;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.form-control-spec::placeholder {
  color: #94a3b8;
  font-size: 13px;
}

/* ===== CHOICES.JS STYLING — pakai :deep() karena scoped ===== */
:deep(.choices) {
  margin-bottom: 0;
  font-family: inherit;
}

:deep(.choices__inner) {
  min-height: 40px;
  padding: 8px 12px;
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
  border-color: #f97316;
  background: white;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
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
  background: #fed7aa;
  color: #9a3412;
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
  border-color: #f97316;
  background: #fffbeb;
}

.ppn-radio input[type='radio'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #f97316;
  margin: 0;
}

.ppn-radio:has(input[type='radio']:checked) {
  background: #fed7aa;
  border-color: #f97316;
  color: #9a3412;
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
  color: #ea580c;
}

.summary-item-compact.total {
  background: linear-gradient(135deg, #f97316, #ea580c);
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
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.3);
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
  box-shadow: 0 8px 20px rgba(249, 115, 22, 0.45);
  background: linear-gradient(135deg, #ea580c, #dc2626);
}

.btn-submit-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1400px) {
  .spec-grid-karton {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1100px) {
  .spec-grid-karton {
    grid-template-columns: repeat(3, 1fr);
  }
}

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

  .spec-grid-karton {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .spec-card {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .spec-grid-karton {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

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
  background: #ffedd5;
  color: #ea580c;
  border: 2px solid #fdba74;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.btn-quick-add:hover {
  background: #fed7aa;
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
  max-width: 620px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}
.modal-header-barang {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  background: linear-gradient(135deg, #f97316, #ea580c);
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
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
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
  background: linear-gradient(135deg, #f97316, #ea580c);
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
</style>
