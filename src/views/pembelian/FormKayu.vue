<template>
  <DashboardLayout>
    <!-- PAGE HEADER -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left-section">
          <div class="icon-badge">🪵</div>
          <div>
            <div class="hero-eyebrow">Modul Pembelian</div>
            <h1 class="page-title">
              {{ isEditMode ? 'Edit' : 'Buat' }} PO <span class="accent">Kayu</span>
            </h1>
            <p class="page-subtitle">
              {{
                isEditMode ? `Edit PO Kayu ${poNumber}` : 'Isi detail untuk PO Kayu (RST & Mall)'
              }}
            </p>
          </div>
        </div>
        <router-link :to="{ name: 'PembelianKayu' }" class="btn-back">
          ← Kembali ke Daftar
        </router-link>
      </div>
    </div>

    <!-- LOADING STATE -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p class="loading-text">Memuat data...</p>
    </div>

    <!-- FORM -->
    <form v-else @submit.prevent="saveOrder">
      <!-- INFORMASI UTAMA -->
      <div class="content-card">
        <div class="card-head">
          <div class="card-head-icon">ℹ️</div>
          <div>
            <h2 class="card-title">Informasi Utama</h2>
            <p class="card-subtitle">Pilih supplier, tanggal, dan catatan pemesanan</p>
          </div>
        </div>
        <div class="card-body">
          <div class="info-grid">
            <div class="form-group">
              <label class="form-label">Supplier</label>
              <select
                id="select-supplier"
                v-model="form.supplier_id"
                class="form-control choices-select"
                required
              >
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

      <!-- DETAIL BARANG -->
      <div class="content-card">
        <div class="card-head">
          <div class="card-head-icon">📝</div>
          <div>
            <h2 class="card-title">Detail Barang & Spesifikasi Kayu</h2>
            <p class="card-subtitle">
              Gunakan "Input Manual" untuk Kayu Mall, biarkan non-aktif untuk Kayu RST
            </p>
          </div>
        </div>

        <div class="card-body-table">
          <div class="table-wrapper">
            <table class="detail-table">
              <thead>
                <tr>
                  <th class="th-material">Barang</th>
                  <th class="th-qty">Jumlah (Batang)</th>
                  <th class="th-price">Harga Satuan</th>
                  <th class="th-subtotal">Subtotal</th>
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
                          class="form-control choices-select"
                          required
                        >
                          <option value="">Pilih Barang</option>
                        </select>
                        <button
                          type="button"
                          class="btn-quick-add"
                          @click="openModalTambahBarang(index)"
                          title="Tambah Kayu RST baru"
                        >
                          ➕
                        </button>
                      </div>
                    </td>
                    <td class="td-qty">
                      <input
                        type="number"
                        v-model="item.quantity"
                        class="form-control"
                        placeholder="Jumlah"
                        required
                        min="1"
                        step="1"
                      />
                    </td>
                    <td class="td-price">
                      <input
                        v-if="item.specifications.is_manual_price"
                        type="number"
                        v-model="item.price"
                        class="form-control"
                        placeholder="Harga Manual"
                        min="0"
                      />
                      <input
                        v-else
                        type="text"
                        :value="formatCurrency(item.price)"
                        class="form-control price-readonly"
                        readonly
                        title="Harga dihitung otomatis dari kubikasi"
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
                        Hapus
                      </button>
                    </td>
                  </tr>

                  <!-- SPEC ROW -->
                  <tr class="spec-row">
                    <td colspan="5" class="spec-cell">
                      <div class="spec-card">
                        <div class="spec-header">
                          <h4 class="spec-title">🧮 Spesifikasi Kayu</h4>
                          <div class="manual-switch-wrapper">
                            <input
                              type="checkbox"
                              v-model="item.specifications.is_manual_price"
                              :id="`manual-switch-${index}`"
                              class="manual-checkbox"
                            />
                            <label :for="`manual-switch-${index}`" class="manual-label">
                              <span class="checkbox-icon"></span>
                              <span class="label-text">Input Harga Manual (Kayu Mall)</span>
                            </label>
                          </div>
                        </div>
                        <div class="spec-grid-kayu">
                          <label class="spec-label">Invoice Size (mm)</label>
                          <input
                            type="number"
                            v-model="item.specifications.invoice_p"
                            placeholder="P"
                            class="form-control-spec"
                          />
                          <input
                            type="number"
                            v-model="item.specifications.invoice_l"
                            placeholder="L"
                            class="form-control-spec"
                          />
                          <input
                            type="number"
                            v-model="item.specifications.invoice_t"
                            placeholder="T"
                            class="form-control-spec"
                          />

                          <label class="spec-label">Cutting Size (mm)</label>
                          <input
                            type="number"
                            v-model.number="item.specifications.cutting_p"
                            placeholder="P"
                            class="form-control-spec"
                            step="1"
                          />
                          <input
                            type="number"
                            v-model.number="item.specifications.cutting_l"
                            placeholder="L"
                            class="form-control-spec"
                            step="1"
                          />
                          <input
                            type="number"
                            v-model.number="item.specifications.cutting_t"
                            placeholder="T"
                            class="form-control-spec"
                            step="1"
                          />

                          <template v-if="!item.specifications.is_manual_price">
                            <label class="spec-label">Harga per m³ (Rp)</label>
                            <input
                              type="number"
                              v-model="item.specifications.harga_kubikasi"
                              placeholder="Harga per Kubik"
                              class="form-control-spec"
                            />
                            <label class="spec-label">Total Kubikasi (m³)</label>
                            <input
                              type="text"
                              :value="item.specifications.kubikasi"
                              class="form-control-spec kubikasi-readonly"
                              readonly
                            />
                          </template>

                          <template v-else>
                            <div class="spacer-label"></div>
                            <div class="manual-note">
                              <span>💡</span>
                              <span>Harga Satuan akan diinput manual di tabel atas</span>
                            </div>
                          </template>
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

        <!-- SUMMARY -->
        <div class="summary-section">
          <div class="summary-row">
            <div class="ppn-group">
              <span class="ppn-label">PPN:</span>
              <div class="ppn-options">
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

            <div class="summary-totals">
              <div class="summary-line">
                <span class="s-label">Subtotal</span>
                <span class="s-value">{{ formatCurrency(totalSubtotal) }}</span>
              </div>
              <div class="summary-line">
                <span class="s-label">PPN ({{ formatPPNDisplay(form.ppn_percentage) }})</span>
                <span class="s-value s-ppn">{{ formatCurrency(totalPPN) }}</span>
              </div>
              <div class="summary-line summary-total">
                <span class="s-label">Grand Total</span>
                <span class="s-value">{{ formatCurrency(grandTotal) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FORM ACTIONS -->
      <div class="form-actions">
        <router-link :to="{ name: 'PembelianKayu' }" class="btn-cancel">Batal</router-link>
        <button type="submit" class="btn-submit" :disabled="isSaving">
          <span v-if="!isSaving">💾 {{ isEditMode ? 'Update' : 'Simpan' }} PO Kayu</span>
          <span v-else>⏳ Menyimpan...</span>
        </button>
      </div>
    </form>

    <!-- MODAL TAMBAH KAYU RST BARU -->
    <div v-if="showModalTambahBarang" class="modal-overlay" @click.self="closeModalTambahBarang">
      <div class="modal-container-barang">
        <div class="modal-header-barang">
          <div class="modal-title-wrapper">
            <span class="modal-icon">🪵</span>
            <h3 class="modal-title">Tambah Kayu RST Baru</h3>
          </div>
          <button class="modal-close" @click="closeModalTambahBarang">✕</button>
        </div>
        <div class="modal-body-barang">
          <div class="form-grid-2">
            <div class="form-group-modal">
              <label class="form-label-modal">Kode</label>
              <input
                v-model="formBarang.kode_barang"
                type="text"
                class="form-input-modal"
                placeholder="K-JTI-001"
              />
            </div>
            <div class="form-group-modal">
              <label class="form-label-modal">Nama Dasar <span class="req">*</span></label>
              <input
                v-model="formBarang.nama_dasar"
                type="text"
                class="form-input-modal"
                placeholder="KAYU JATI RST"
              />
            </div>
            <div class="form-group-modal">
              <label class="form-label-modal">Jenis</label>
              <input
                v-model="formBarang.jenis"
                type="text"
                class="form-input-modal"
                placeholder="TEAK"
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
              <label class="form-label-modal">T (mm) <span class="req">*</span></label>
              <input
                v-model.number="formBarang.tebal_mm"
                type="number"
                min="0"
                class="form-input-modal"
                placeholder="50"
              />
            </div>
            <div class="form-group-modal">
              <label class="form-label-modal">L (mm)</label>
              <input
                v-model.number="formBarang.lebar_mm"
                type="number"
                min="0"
                class="form-input-modal"
                placeholder="80"
              />
            </div>
            <div class="form-group-modal">
              <label class="form-label-modal">P (mm)</label>
              <input
                v-model.number="formBarang.panjang_mm"
                type="number"
                min="0"
                class="form-input-modal"
                placeholder="1000"
              />
            </div>
            <div class="form-group-modal">
              <label class="form-label-modal">No Rak</label>
              <input
                v-model="formBarang.no_rak"
                type="text"
                class="form-input-modal"
                placeholder="RAK-A1"
              />
            </div>
            <div class="form-group-modal">
              <label class="form-label-modal">C.T (mm)</label>
              <input
                v-model.number="formBarang.cutting_tebal_mm"
                type="number"
                min="0"
                class="form-input-modal"
                placeholder="48"
              />
            </div>
            <div class="form-group-modal">
              <label class="form-label-modal">C.L (mm)</label>
              <input
                v-model.number="formBarang.cutting_lebar_mm"
                type="number"
                min="0"
                class="form-input-modal"
                placeholder="78"
              />
            </div>
            <div class="form-group-modal">
              <label class="form-label-modal">C.P (mm)</label>
              <input
                v-model.number="formBarang.cutting_panjang_mm"
                type="number"
                min="0"
                class="form-input-modal"
                placeholder="998"
              />
            </div>
          </div>

          <!-- Preview nama otomatis -->
          <div v-if="formBarang.nama_dasar && formBarang.tebal_mm" class="preview-nama">
            <span class="preview-label">Nama item:</span>
            <span class="preview-value">
              {{ formBarang.nama_dasar }} ({{ formBarang.tebal_mm }}x{{ formBarang.lebar_mm || 0 }}x{{
                formBarang.panjang_mm || 0
              }})
            </span>
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
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useToast } from 'vue-toastification'
import Choices from 'choices.js'
import 'choices.js/public/assets/styles/choices.min.css'
import { debounce } from 'lodash-es'

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
const clickedRowIndex = ref(null)
const formBarang = ref({
  kode_barang: '',
  nama_dasar: '',
  jenis: '',
  kualitas: '',
  tebal_mm: null,
  lebar_mm: null,
  panjang_mm: null,
  no_rak: '',
  cutting_tebal_mm: null,
  cutting_lebar_mm: null,
  cutting_panjang_mm: null,
})
const choicesMap = ref(new Map())
const supplierChoice = ref(null)

const form = reactive({
  supplier_id: '',
  order_date: new Date().toISOString().slice(0, 10),
  notes: '',
  ppn_percentage: 12,
  details: [],
})

const totalSubtotal = computed(() =>
  form.details.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0),
)
const totalPPN = computed(() => {
  let ppnRate = form.ppn_percentage === 11.12 ? 11 : form.ppn_percentage
  return (totalSubtotal.value * ppnRate) / 100
})
const grandTotal = computed(() => totalSubtotal.value + totalPPN.value)

const defaultKayuSpec = () => ({
  invoice_p: null,
  invoice_l: null,
  invoice_t: null,
  cutting_p: null,
  cutting_l: null,
  cutting_t: null,
  harga_kubikasi: null,
  kubikasi: 0,
  is_manual_price: false,
})

const initSupplierChoice = async () => {
  await nextTick()
  if (supplierChoice.value) supplierChoice.value.destroy()
  const selectElement = document.getElementById('select-supplier')
  if (!selectElement) return
  supplierChoice.value = new Choices(selectElement, {
    searchEnabled: true,
    searchPlaceholderValue: 'Cari supplier...',
    noResultsText: 'Tidak ditemukan',
    noChoicesText: 'Tidak ada pilihan',
    itemSelectText: 'Klik untuk pilih',
    shouldSort: false,
    removeItemButton: false,
  })
  if (form.supplier_id) supplierChoice.value.setChoiceByValue(String(form.supplier_id))
  selectElement.addEventListener('change', (event) => {
    form.supplier_id = parseInt(event.target.value) || ''
  })
}

const initChoicesForIndex = async (index, item) => {
  await nextTick()
  if (choicesMap.value.has(index)) {
    try {
      choicesMap.value.get(index).destroy()
    } catch {}
    choicesMap.value.delete(index)
  }
  const selectElement = document.getElementById(`select-barang-${index}`)
  if (!selectElement) return

  // Populate options imperiatif (v-for sudah dihapus dari template)
  const placeholder = document.createElement('option')
  placeholder.value = ''
  placeholder.textContent = 'Pilih Barang'
  selectElement.replaceChildren(placeholder)

  daftarBarang.value.forEach((barang) => {
    const opt = document.createElement('option')
    opt.value = String(barang.id)
    opt.textContent = barang.code ? `${barang.code} - ${barang.name}` : barang.name
    if (item.item_id && String(barang.id) === String(item.item_id)) {
      opt.selected = true // tandai sebelum Choices.js init
    }
    selectElement.appendChild(opt)
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
  choicesMap.value.set(index, choices)
}

const initAllChoices = async () => {
  await nextTick()
  await Promise.all([
    initSupplierChoice(),
    ...form.details.map((item, i) => initChoicesForIndex(i, item)),
  ])
}

watch(
  () => form.details,
  debounce((newDetails) => {
    newDetails.forEach((item) => {
      // Auto-fill saat user pilih barang
      if (item.item_id) {
        const barang = daftarBarang.value.find((b) => b.id === item.item_id)
        if (barang) {
          const spec = item.specifications
          // Invoice Size dari specifications barang
          if (barang.specifications) {
            if (!spec.invoice_p && barang.specifications.p) spec.invoice_p = barang.specifications.p
            if (!spec.invoice_l && barang.specifications.l) spec.invoice_l = barang.specifications.l
            if (!spec.invoice_t && barang.specifications.t) spec.invoice_t = barang.specifications.t
          }
          // Cutting Size dari kolom baru
          if (!spec.cutting_p && barang.cutting_p) spec.cutting_p = parseInt(barang.cutting_p)
          if (!spec.cutting_l && barang.cutting_l) spec.cutting_l = parseInt(barang.cutting_l)
          if (!spec.cutting_t && barang.cutting_t) spec.cutting_t = parseInt(barang.cutting_t)
        }
      }

      // Hitung kubikasi total (per batang × qty) agar sesuai perhitungan klien
      const spec = item.specifications
      const qty = item.quantity || 1
      if (spec.invoice_p > 0 && spec.invoice_l > 0 && spec.invoice_t > 0) {
        const kubikasiPerBatang =
          (spec.invoice_p / 1000) * (spec.invoice_l / 1000) * (spec.invoice_t / 1000)
        spec.kubikasi = parseFloat((kubikasiPerBatang * qty).toFixed(6))
      } else {
        spec.kubikasi = 0
      }
      if (!spec.is_manual_price) {
        // harga per batang = kubikasi_total × harga_m3 / qty
        item.price =
          spec.kubikasi > 0 && spec.harga_kubikasi > 0 && qty > 0
            ? (spec.kubikasi * spec.harga_kubikasi) / qty
            : 0
      }
    })
  }, 100),
  { deep: true },
)

const tambahBarang = async () => {
  const newIndex = form.details.length
  form.details.push({ item_id: '', quantity: 1, price: 0, specifications: defaultKayuSpec() })
  if (!loading.value) await initChoicesForIndex(newIndex, form.details[newIndex])
}

const hapusBarang = (index) => {
  if (form.details.length <= 1) return
  if (choicesMap.value.has(index)) {
    try {
      choicesMap.value.get(index).destroy()
    } catch {}
    choicesMap.value.delete(index)
  }
  form.details.splice(index, 1)
  const newMap = new Map()
  choicesMap.value.forEach((instance, key) => {
    if (key < index) newMap.set(key, instance)
    else if (key > index) newMap.set(key - 1, instance)
  })
  choicesMap.value = newMap
}

const openModalTambahBarang = (index) => {
  clickedRowIndex.value = index
  formBarang.value = {
    kode_barang: '',
    nama_dasar: '',
    jenis: '',
    kualitas: '',
    tebal_mm: null,
    lebar_mm: null,
    panjang_mm: null,
    no_rak: '',
    cutting_tebal_mm: null,
    cutting_lebar_mm: null,
    cutting_panjang_mm: null,
  }
  showModalTambahBarang.value = true
}

const closeModalTambahBarang = () => {
  showModalTambahBarang.value = false
}

const simpanBarangBaru = async () => {
  if (!formBarang.value.nama_dasar || !formBarang.value.tebal_mm) {
    toast.error('Nama dasar dan tebal wajib diisi!')
    return
  }
  isSavingBarang.value = true
  try {
    const res = await apiClient.post('/materials/quick-store-rst', {
      nama_dasar: formBarang.value.nama_dasar,
      kode_barang: formBarang.value.kode_barang || null,
      tebal_mm: formBarang.value.tebal_mm,
      lebar_mm: formBarang.value.lebar_mm || 0,
      panjang_mm: formBarang.value.panjang_mm || 0,
      jenis: formBarang.value.jenis || null,
      kualitas: formBarang.value.kualitas || null,
      no_rak: formBarang.value.no_rak || null,
      cutting_tebal_mm: formBarang.value.cutting_tebal_mm || null,
      cutting_lebar_mm: formBarang.value.cutting_lebar_mm || null,
      cutting_panjang_mm: formBarang.value.cutting_panjang_mm || null,
    })

    // Tutup modal segera setelah 2xx berhasil
    closeModalTambahBarang()

    const barangBaru = res.data?.data ?? res.data
    if (barangBaru?.id) {
      // Simpan data lengkap agar watch bisa auto-fill spec
      daftarBarang.value.push({
        id: barangBaru.id,
        code: barangBaru.code,
        name: barangBaru.name,
        specifications: barangBaru.specifications,
        cutting_t: barangBaru.cutting_t,
        cutting_l: barangBaru.cutting_l,
        cutting_p: barangBaru.cutting_p,
      })

      const label = barangBaru.code
        ? `${barangBaru.code} - ${barangBaru.name}`
        : barangBaru.name

      // Tambahkan pilihan ke semua dropdown
      choicesMap.value.forEach((instance) => {
        try {
          instance.setChoices([{ value: String(barangBaru.id), label }], 'value', 'label', false)
        } catch {
          // instance sudah destroyed, abaikan
        }
      })

      // Auto-select di baris yang mengklik ➕
      if (clickedRowIndex.value !== null) {
        const idx = clickedRowIndex.value
        const instance = choicesMap.value.get(idx)
        if (instance) {
          try {
            instance.setChoiceByValue(String(barangBaru.id))
          } catch {}
        }
        if (form.details[idx]) {
          form.details[idx].item_id = barangBaru.id
        }
      }

      toast.success(`Kayu RST "${barangBaru.name}" berhasil ditambahkan!`)
    } else {
      toast.success('Kayu RST berhasil ditambahkan!')
    }
  } catch (error) {
    const errData = error.response?.data
    const msg =
      errData?.message ||
      (errData?.errors ? Object.values(errData.errors).flat().join(', ') : null) ||
      error.message ||
      'Gagal menyimpan kayu RST'
    toast.error(msg)
  } finally {
    isSavingBarang.value = false
  }
}

const saveOrder = async () => {
  isSaving.value = true
  try {
    const payload = {
      ...form,
      type: 'kayu',
      details: form.details.map((d) => ({
        item_id: d.item_id,
        quantity: d.quantity,
        price: d.price,
        specifications: d.specifications,
      })),
    }
    if (isEditMode.value) {
      await apiClient.put(`/purchase-orders/${poId}`, payload)
      toast.success('PO Kayu berhasil diupdate!')
    } else {
      await apiClient.post('/purchase-orders', payload)
      toast.success('PO Kayu berhasil dibuat!')
    }
    router.push({ name: 'PembelianKayu' })
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal menyimpan pesanan.')
  } finally {
    isSaving.value = false
  }
}

const fetchPOData = async () => {
  if (!isEditMode.value) {
    await tambahBarang()
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
    form.ppn_percentage = parseFloat(data.ppn_percentage ?? 12)
    form.details = data.details.map((d) => {
      const spec = d.specifications || {}
      return {
        item_id: d.item_id,
        quantity: parseFloat(d.quantity_ordered),
        price: parseFloat(d.price),
        specifications: {
          ...defaultKayuSpec(),
          ...spec,
          cutting_p: spec.cutting_p ? parseInt(spec.cutting_p) : null,
          cutting_l: spec.cutting_l ? parseInt(spec.cutting_l) : null,
          cutting_t: spec.cutting_t ? parseInt(spec.cutting_t) : null,
          invoice_p: spec.invoice_p ? parseInt(spec.invoice_p) : null,
          invoice_l: spec.invoice_l ? parseInt(spec.invoice_l) : null,
          invoice_t: spec.invoice_t ? parseInt(spec.invoice_t) : null,
        },
      }
    })
    loading.value = false
    await nextTick()
    await initAllChoices()
  } catch {
    toast.error('Gagal memuat data PO.')
    loading.value = false
  }
}

const fetchDataDropdown = async () => {
  try {
    const [supplierRes, barangRes] = await Promise.all([
      apiClient.get('/suppliers?all=true'),
      apiClient.get('/materials?all=true&category_name=Kayu RST'),
    ])
    daftarSupplier.value = supplierRes.data.data
    daftarBarang.value = barangRes.data.data
  } catch {
    toast.error('Gagal memuat data supplier atau barang.')
  }
}

onMounted(async () => {
  await fetchDataDropdown()
  await fetchPOData()
  if (!isEditMode.value) {
    loading.value = false
    await nextTick()
    await initAllChoices()
  }
})

const formatCurrency = (value) => {
  if (isNaN(value)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}
const formatPPNDisplay = (percentage) => (percentage === 11.12 ? '12% ⚡' : `${percentage}%`)
</script>

<style scoped>
/* ===== LOADING ===== */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1.5px solid #f3f4f6;
}
.spinner {
  width: 48px;
  height: 48px;
  border: 5px solid #f3f4f6;
  border-top-color: #92400e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.loading-text {
  font-size: 15px;
  color: #6b7280;
  font-weight: 600;
}

/* ===== PAGE HEADER ===== */
.page-header {
  background: #fff;
  border: 1.5px solid #f3f4f6;
  border-left: 5px solid #92400e;
  border-radius: 14px;
  padding: 24px 28px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.header-left-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-badge {
  width: 52px;
  height: 52px;
  background: #fef3c7;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  border: 1.5px solid #fde68a;
  flex-shrink: 0;
}

.hero-eyebrow {
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #92400e;
  font-weight: 700;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.hero-eyebrow::before {
  content: '';
  display: inline-block;
  width: 14px;
  height: 2px;
  background: #92400e;
  border-radius: 2px;
}

.page-title {
  font-size: 26px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.5px;
  margin: 0 0 4px;
  line-height: 1.1;
}
.page-title .accent {
  color: #92400e;
}
.page-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  color: #374151;
  text-decoration: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  border: 1.5px solid #e5e7eb;
  transition: all 0.2s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  white-space: nowrap;
}
.btn-back:hover {
  background: #fef3c7;
  border-color: #fde68a;
  color: #92400e;
  transform: translateY(-1px);
}

/* ===== CONTENT CARD ===== */
.content-card {
  background: #fff;
  border-radius: 14px;
  border: 1.5px solid #f3f4f6;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
  overflow: hidden;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 28px;
  background: #fafafa;
  border-bottom: 1.5px solid #f3f4f6;
}

.card-head-icon {
  width: 44px;
  height: 44px;
  background: #fef3c7;
  border: 1.5px solid #fde68a;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 3px;
}
.card-subtitle {
  font-size: 12.5px;
  color: #6b7280;
  margin: 0;
}

.card-body {
  padding: 24px 28px;
}
.card-body-table {
  padding: 24px 28px 0;
}

/* ===== FORM ===== */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
.form-group {
  margin: 0;
}
.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
  color: #374151;
  font-size: 13px;
}

.form-control {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: #fafafa;
  font-weight: 500;
  font-family: inherit;
  box-sizing: border-box;
  color: #111827;
}
.form-control:focus {
  outline: none;
  border-color: #92400e;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(146, 64, 14, 0.1);
}
textarea.form-control {
  resize: vertical;
  min-height: 90px;
}

/* ===== TABLE ===== */
.table-wrapper {
  overflow-x: auto;
  border-radius: 10px;
  border: 1.5px solid #f3f4f6;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 860px;
}

.detail-table thead {
  background: #1e293b;
}
.detail-table th {
  padding: 14px 18px;
  text-align: left;
  color: #e2e8f0;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  white-space: nowrap;
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
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;
}
.data-row:hover {
  background: #fffbeb;
}
.detail-table td {
  padding: 14px 18px;
  vertical-align: middle;
}

.td-subtotal {
  font-weight: 800;
  color: #059669;
  font-size: 14px;
  font-family: 'Courier New', monospace;
}
.td-action {
  text-align: center;
}
.price-readonly {
  background: #eff6ff !important;
  color: #1e40af !important;
  font-weight: 700 !important;
  cursor: not-allowed;
}

/* ===== SPEC ROW ===== */
.spec-row {
  background: #fffbeb;
  border-bottom: 1.5px solid #fde68a;
}
.spec-cell {
  padding: 0 18px 16px 18px !important;
}

.spec-card {
  background: #fff;
  border: 1.5px solid #fde68a;
  border-radius: 10px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(146, 64, 14, 0.08);
}

.spec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1.5px solid #fef3c7;
  flex-wrap: wrap;
  gap: 10px;
}

.spec-title {
  font-weight: 800;
  color: #78350f;
  margin: 0;
  font-size: 14px;
}

/* Toggle switch */
.manual-switch-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}
.manual-checkbox {
  display: none;
}
.manual-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.checkbox-icon {
  width: 44px;
  height: 22px;
  background: #e5e7eb;
  border-radius: 11px;
  position: relative;
  transition: all 0.25s ease;
  border: 1.5px solid #d1d5db;
  flex-shrink: 0;
}
.checkbox-icon::after {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: all 0.25s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}
.manual-checkbox:checked + .manual-label .checkbox-icon {
  background: #10b981;
  border-color: #059669;
}
.manual-checkbox:checked + .manual-label .checkbox-icon::after {
  left: 24px;
}
.label-text {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}
.manual-checkbox:checked + .manual-label .label-text {
  color: #059669;
}

/* Spec grid */
.spec-grid-kayu {
  display: grid;
  grid-template-columns: 160px 1fr 1fr 1fr;
  gap: 12px 14px;
  align-items: center;
}
.spec-label {
  font-weight: 700;
  color: #374151;
  font-size: 12.5px;
  text-align: right;
  padding-right: 10px;
}
.form-control-spec {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  transition: all 0.2s;
  background: #fafafa;
  font-weight: 500;
  box-sizing: border-box;
  font-family: inherit;
}
.form-control-spec:focus {
  outline: none;
  border-color: #92400e;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(146, 64, 14, 0.1);
}
.form-control-spec::placeholder {
  color: #9ca3af;
}
.kubikasi-readonly {
  background: #fef3c7 !important;
  color: #78350f !important;
  font-weight: 800 !important;
  cursor: not-allowed;
}
.manual-note {
  grid-column: 2 / span 3;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ecfdf5;
  border: 1.5px solid #a7f3d0;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  color: #065f46;
  font-weight: 600;
}

/* ===== TABLE ACTIONS ===== */
.table-actions {
  padding: 16px 0 4px;
}
.btn-add-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  color: #059669;
  border: 1.5px solid #a7f3d0;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}
.btn-add-row:hover {
  background: #ecfdf5;
  border-color: #6ee7b7;
  transform: translateY(-1px);
}

.btn-delete {
  padding: 8px 14px;
  background: #fff;
  color: #dc2626;
  border: 1.5px solid #fecaca;
  border-radius: 7px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.2s ease;
  font-family: inherit;
}
.btn-delete:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #f87171;
}
.btn-delete:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* ===== CHOICES.JS STYLING — pakai :deep() karena scoped ===== */
:deep(.choices) {
  margin: 0;
  font-family: inherit;
  width: 100%;
}

:deep(.choices__inner) {
  min-height: 40px;
  padding: 8px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
:deep(.choices__inner:hover) {
  border-color: #d1d5db;
}
:deep(.choices.is-open .choices__inner),
:deep(.choices.is-focused .choices__inner) {
  border-color: #92400e;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(146, 64, 14, 0.1);
}
:deep(.choices__list--single) {
  padding: 0;
  font-size: 13px;
  font-weight: 500;
  color: #111827;
}
:deep(.choices__placeholder) {
  color: #9ca3af;
  font-weight: 400;
  opacity: 1;
}
:deep(.choices__list--dropdown) {
  border: 1.5px solid #fde68a;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 9999;
  margin-top: 4px;
  overflow: hidden;
}
:deep(.choices__input) {
  font-size: 13px;
  padding: 9px 12px;
  background: #fafafa;
  border: 1.5px solid #e5e7eb !important;
  border-radius: 7px !important;
  margin: 8px !important;
  width: calc(100% - 16px) !important;
  box-sizing: border-box;
  font-family: inherit;
}
:deep(.choices__input:focus) {
  background: #fff;
  border-color: #92400e !important;
  outline: none;
  box-shadow: 0 0 0 3px rgba(146, 64, 14, 0.1);
}
:deep(.choices__list--dropdown .choices__item) {
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  transition: all 0.15s ease;
}
:deep(.choices__list--dropdown .choices__item--selectable.is-highlighted) {
  background: #fef3c7;
  color: #92400e;
}
:deep(.choices__list--dropdown .choices__item.is-selected) {
  background: #92400e;
  color: white;
  font-weight: 700;
}
:deep(.choices[data-type*='select-one']::after) {
  border-color: #9ca3af transparent transparent transparent;
  border-width: 5px;
  right: 14px;
  transition: all 0.2s ease;
}
:deep(.choices.is-open[data-type*='select-one']::after) {
  border-color: #92400e transparent transparent transparent;
  transform: rotate(180deg);
  margin-top: -5px;
}

.td-material :deep(.choices) {
  flex: 1;
  min-width: 0;
  width: 100%;
}
.td-material :deep(.choices__inner) {
  min-height: 40px;
  font-size: 13px;
}

/* ===== SUMMARY ===== */
.summary-section {
  padding: 20px 28px;
  border-top: 1.5px solid #f3f4f6;
  background: #fafafa;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.ppn-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.ppn-label {
  font-weight: 700;
  color: #374151;
  font-size: 13px;
  white-space: nowrap;
}
.ppn-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ppn-radio {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  position: relative;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
}
.ppn-radio:hover {
  border-color: #92400e;
  background: #fffbeb;
  color: #92400e;
}
.ppn-radio input[type='radio'] {
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: #92400e;
  margin: 0;
}
.ppn-radio:has(input:checked) {
  background: #fef3c7;
  border-color: #92400e;
  color: #78350f;
}

.ppn-radio.ppn-special {
  background: #fffbeb;
  border-color: #fde68a;
}
.ppn-radio.ppn-special:has(input:checked) {
  background: #fef3c7;
  border-color: #f59e0b;
}
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
.ppn-radio.ppn-special:hover .ppn-note,
.ppn-radio.ppn-special:has(input:checked) .ppn-note {
  opacity: 1;
}

.summary-totals {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #fff;
  border: 1.5px solid #f3f4f6;
  border-radius: 10px;
  padding: 14px 18px;
  min-width: 260px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
.s-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}
.s-value {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  font-family: 'Courier New', monospace;
}
.s-ppn {
  color: #78350f;
}

.summary-total {
  padding-top: 8px;
  margin-top: 4px;
  border-top: 1.5px solid #f3f4f6;
}
.summary-total .s-label {
  font-weight: 700;
  color: #111827;
  font-size: 14px;
}
.summary-total .s-value {
  font-size: 15px;
  color: #92400e;
}

/* ===== FORM ACTIONS ===== */
.form-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 20px 28px;
  background: #fff;
  border-radius: 14px;
  border: 1.5px solid #f3f4f6;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.btn-cancel {
  display: inline-flex;
  align-items: center;
  padding: 11px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  background: #fff;
  color: #374151;
  border: 1.5px solid #e5e7eb;
  transition: all 0.2s;
}
.btn-cancel:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-submit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  font-family: inherit;
  background: #92400e;
  color: white;
  box-shadow: 0 4px 12px rgba(146, 64, 14, 0.3);
  transition: all 0.2s ease;
}
.btn-submit:hover:not(:disabled) {
  background: #78350f;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(146, 64, 14, 0.4);
}
.btn-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  .btn-back {
    width: 100%;
    justify-content: center;
  }
  .spec-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .spec-grid-kayu {
    grid-template-columns: 1fr;
  }
  .spec-label {
    text-align: left;
    padding-right: 0;
  }
  .summary-row {
    flex-direction: column;
    align-items: stretch;
  }
  .summary-totals {
    min-width: auto;
  }
  .ppn-options {
    flex-wrap: wrap;
  }
  .form-actions {
    flex-direction: column;
  }
  .btn-cancel,
  .btn-submit {
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
  background: #fef3c7;
  color: #92400e;
  border: 1.5px solid #fde68a;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.btn-quick-add:hover {
  background: #fde68a;
  transform: scale(1.1);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  backdrop-filter: blur(4px);
}
.modal-container-barang {
  background: white;
  border-radius: 14px;
  width: 90%;
  max-width: 640px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header-barang {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  background: #92400e;
  color: white;
  position: sticky;
  top: 0;
  z-index: 1;
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
  gap: 14px;
}
.form-group-modal {
  display: flex;
  flex-direction: column;
}
.form-label-modal {
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 5px;
}
.req {
  color: #ef4444;
}
.form-input-modal {
  padding: 9px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 7px;
  font-size: 13px;
  transition: all 0.2s;
  font-family: inherit;
}
.form-input-modal:focus {
  outline: none;
  border-color: #92400e;
  box-shadow: 0 0 0 3px rgba(146, 64, 14, 0.1);
}

.preview-nama {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fef3c7;
  border: 1.5px solid #fde68a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.preview-label {
  font-size: 12px;
  font-weight: 700;
  color: #92400e;
}
.preview-value {
  font-size: 13px;
  font-weight: 600;
  color: #78350f;
}

.modal-footer-barang {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  background: #f9fafb;
  border-top: 1.5px solid #e5e7eb;
  position: sticky;
  bottom: 0;
}
.btn-cancel-modal {
  padding: 10px 20px;
  background: #e5e7eb;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.btn-cancel-modal:hover {
  background: #d1d5db;
}
.btn-save-modal {
  padding: 10px 24px;
  background: #92400e;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.btn-save-modal:hover:not(:disabled) {
  background: #78350f;
  transform: translateY(-1px);
}
.btn-save-modal:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
