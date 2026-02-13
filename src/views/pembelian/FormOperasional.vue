<template>
  <DashboardLayout>
    <!-- HEADER -->
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

    <!-- LOADING -->
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
            <!-- ✅ TAMBAH 2 INPUT TANGGAL -->
            <div class="form-group">
              <label class="form-label">Tanggal Pesan</label>
              <input type="date" v-model="form.order_date" class="form-control" required />
            </div>

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

      <!-- DETAIL BARANG -->
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
                  <th class="th-price">Harga Satuan</th>
                  <th class="th-subtotal">Subtotal</th>
                  <th class="th-action">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in form.details" :key="index" class="data-row">
                  <td class="td-material">
                    <select
                      :id="'select-barang-' + index"
                      v-model="item.item_id"
                      class="choices-select"
                      required
                    >
                      <option disabled value="">Pilih Barang</option>
                      <option v-for="barang in daftarBarang" :key="barang.id" :value="barang.id">
                        {{ barang.code }} - {{ barang.name }} (Stok:
                        {{ formatStock(barang.stock) }})
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

        <!-- SUMMARY SECTION -->
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
              </div>
            </div>

            <div class="summary-compact">
              <div class="summary-item-compact">
                <span class="label">Subtotal:</span>
                <span class="value">{{ formatCurrency(totalSubtotal) }}</span>
              </div>
              <div class="summary-item-compact">
                <span class="label">PPN ({{ form.ppn_percentage }}%):</span>
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
          {{ isSaving ? 'Menyimpan...' : 'Simpan PO Operasional' }}
        </button>
      </div>
    </form>
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
const choicesInstances = ref([])

const form = reactive({
  supplier_id: '',
  order_date: new Date().toISOString().slice(0, 10),
  delivery_date: '', // ✅ TAMBAH INI
  notes: '',
  ppn_percentage: 12,
  details: [],
})

const totalSubtotal = computed(() => {
  return form.details.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.price || 0)
  }, 0)
})

const totalPPN = computed(() => {
  return (totalSubtotal.value * form.ppn_percentage) / 100
})

const grandTotal = computed(() => {
  return totalSubtotal.value + totalPPN.value
})

// ✅ PERBAIKAN: Rebuild dropdown dengan data yang sudah difilter
const initializeChoices = async () => {
  await nextTick()

  // ✅ Destroy semua Choices.js instance lama
  choicesInstances.value.forEach((choice) => {
    if (choice && choice.destroy) {
      choice.destroy()
    }
  })
  choicesInstances.value = []

  // ✅ Buat Choices.js baru untuk setiap row
  form.details.forEach((item, index) => {
    const selectElement = document.getElementById(`select-barang-${index}`)
    if (selectElement) {
      // ✅ HAPUS semua option lama
      selectElement.innerHTML = '<option disabled value="">Pilih Barang</option>'

      // ✅ TAMBAH option dari daftarBarang YANG SUDAH DIFILTER
      daftarBarang.value.forEach((barang) => {
        const option = document.createElement('option')
        option.value = barang.id
        option.textContent = `${barang.code} - ${barang.name} (Stok: ${formatStock(barang.stock)})`
        selectElement.appendChild(option)
      })

      // ✅ PERBAIKAN: Set value ke kosong (tidak auto-select)
      selectElement.value = ''

      // ✅ Reset v-model jika item baru
      if (!item.item_id) {
        item.item_id = ''
      }

      // ✅ Inisialisasi Choices.js
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

      // ✅ Event listener untuk update v-model
      selectElement.addEventListener('change', (event) => {
        item.item_id = parseInt(event.target.value) || ''
      })

      choicesInstances.value.push(choices)
    }
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
    specifications: {},
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
      type: 'operasional',
      details: form.details.map((d) => ({
        item_id: d.item_id,
        quantity: d.quantity,
        price: d.price,
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
    form.supplier_id = data.supplier_id
    form.order_date = data.order_date
    form.delivery_date = data.delivery_date || '' // ✅ TAMBAH INI
    form.notes = data.notes || ''
    form.ppn_percentage = parseFloat(data.ppn_percentage ?? 12)

    form.details = data.details.map((d) => ({
      item_id: d.item_id,
      quantity: parseFloat(d.quantity_ordered),
      price: parseFloat(d.price),
      specifications: d.specifications || {},
    }))

    await nextTick()
    initializeChoices()
  } catch (error) {
    console.error('Gagal memuat data PO:', error)
    toast.error('Gagal memuat data PO.')
  } finally {
    loading.value = false
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

    // ✅ FILTER: Hanya kategori "Bahan Operasional" atau "Bahan Penolong"
    const operationalCategories = allCategories.filter((cat) => {
      const catName = (cat.name || '').toLowerCase().trim()
      return catName === 'bahan penolong' || catName === 'bahan operasional'
    })

    const operationalCategoryIds = operationalCategories.map((cat) => cat.id)

    // ✅ FILTER: Hanya barang dengan kategori operasional
    if (operationalCategoryIds.length > 0) {
      daftarBarang.value = allBarang.filter((item) => {
        return operationalCategoryIds.includes(item.category_id)
      })
      
      console.log(`✅ Filter aktif: Hanya menampilkan ${daftarBarang.value.length} barang dari kategori Bahan Operasional/Penolong`)
    } else {
      console.warn('⚠️ TIDAK ADA kategori operasional! Menampilkan semua barang.')
      daftarBarang.value = allBarang
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Gagal memuat data.'
    toast.error(errorMessage)
    console.error('❌ Error fetchDataDropdown:', error)
  }
}

onMounted(async () => {
  await fetchDataDropdown()
  await fetchPOData()
})

// ✅ HELPER: Format stok
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
  padding: 20px 20px;
  text-align: left;
  color: white;
  font-weight: 900;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
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
  padding: 18px 20px;
  vertical-align: middle;
}

.td-subtotal {
  font-weight: 900;
  color: #059669;
  font-size: 16px;
  font-family: 'Courier New', monospace;
}

.td-action {
  text-align: center;
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
  border-radius: 10px;
  background: #fafbfc;
  font-size: 14px;
  transition: all 0.2s ease;
}

.choices__inner:hover {
  border-color: #cbd5e1;
}

.choices.is-open .choices__inner,
.choices.is-focused .choices__inner {
  border-color: #7c3aed;
  background: white;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.choices__list--dropdown {
  border: 2px solid #e2e8f0;
  border-radius: 10px;
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
  background: #f3e8ff;
  color: #5b21b6;
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

.td-material .choices {
  width: 100%;
}

.td-material .choices__inner {
  min-height: 42px;
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
</style>
