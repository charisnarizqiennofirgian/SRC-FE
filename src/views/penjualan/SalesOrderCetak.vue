<template>
  <div class="print-page-container">
    <div class="print-controls">
      <button @click="goBack" class="btn-back">
        <span class="btn-icon">↩️</span>
        <span class="btn-text">Kembali</span>
      </button>
      <button @click="handlePrint" class="btn-print">
        <span class="btn-icon">🖨️</span>
        <span class="btn-text">Cetak</span>
      </button>
    </div>

    <div v-if="loading || !salesOrder" class="loading-container-print">
      <div class="spinner-form"></div>
      <p class="loading-text-form">Memuat data Pesanan Penjualan...</p>
    </div>

    <div v-else class="print-sheet-a4">
      <KopSuratCetak />

      <div class="document-title-container">
        <h1 class="document-title">DAFTAR PENURUNAN ORDER</h1>
        <div class="document-meta">
          <span class="meta-item">NO : {{ salesOrder.so_number }}</span>
          <span class="meta-item">TANGGAL : {{ formatDisplayDate(salesOrder.so_date) }}</span>
        </div>
      </div>

      <div class="header-info-container">
        <div class="info-row-single">
          <span class="info-label-bold">{{ salesOrder.buyer?.name || 'N/A' }}</span>
        </div>
        <div class="info-row-single">
          <span class="info-label">PO. BUYER :</span>
          <span class="info-value">{{ salesOrder.customer_po_number || '-' }}</span>
        </div>
      </div>

      <div class="table-print-container">
        <table class="table-print-bordered">
          <thead>
            <tr>
              <th>NO</th>
              <th>KODE PRODUK</th>
              <th>NAMA PRODUK</th>
              <th>QTY</th>
              <th>SAT</th>
              <th>KETERANGAN</th>
              <th>TGL.KIRIM</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!salesOrder.details || salesOrder.details.length === 0">
              <td colspan="7" class="text-center-empty">Tidak ada barang.</td>
            </tr>
            <tr v-for="(item, index) in salesOrder.details" :key="item.id">
              <td class="text-center">{{ index + 1 }}</td>
              <td>{{ item.item_code || '-' }}</td>
              <td>{{ item.item_name }}</td>
              <td class="text-center">{{ formatQuantity(item.quantity) }}</td>
              <td class="text-center">{{ item.item_unit }}</td>
              <td>{{ item.keterangan || '-' }}</td>
              <!-- ✅ FIXED: Langsung dari item.keterangan -->
              <td class="text-center">{{ formatDisplayDate(item.delivery_date) }}</td>
            </tr>
            <tr class="total-row-border">
              <td colspan="3" class="text-right-bold"></td>
              <td class="text-center-bold">{{ totalQuantity }}</td>
              <td class="text-center-bold">{{ mostCommonUnit }}</td>
              <td colspan="2"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="signature-container-three">
        <div class="signature-box-three">
          <span class="signature-label">Dibuat,</span>
          <div class="signature-space"></div>
          <span class="signature-name">{{ salesOrder.user?.name || '(___________________)' }}</span>
        </div>
        <div class="signature-box-three">
          <span class="signature-label">Mengetahui,</span>
          <div class="signature-space"></div>
          <span class="signature-name">(___________________)</span>
        </div>
        <div class="signature-box-three">
          <span class="signature-label">Penerima,</span>
          <div class="signature-space"></div>
          <span class="signature-name">(___________________)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import { useToast } from 'vue-toastification'

import KopSuratCetak from '../../components/cetak/KopSuratCetak.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const loading = ref(true)
const salesOrder = ref(null)
const soId = ref(route.params.id)

const fetchSalesOrder = async () => {
  loading.value = true
  try {
    console.log(`[CETAK SO] Memanggil API: /api/sales-orders/${soId.value}`)

    const response = await apiClient.get(`/sales-orders/${soId.value}`)
    salesOrder.value = response.data.data

    console.log('[CETAK SO] Sukses:', salesOrder.value)
    console.log('[CETAK SO] Details:', salesOrder.value.details) // ✅ Debug log
  } catch (error) {
    console.error('Error fetching sales order:', error)
    toast.error('Gagal memuat data pesanan.')
  } finally {
    loading.value = false
  }
}

const handlePrint = () => {
  window.print()
}

const goBack = () => {
  router.push({ name: 'DaftarSalesOrder' })
}

const formatDisplayDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ]
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

const formatQuantity = (value) => {
  if (!value) return 0
  return parseInt(Number(value))
}

// Total quantity
const totalQuantity = computed(() => {
  if (!salesOrder.value || !salesOrder.value.details) return 0

  return salesOrder.value.details.reduce((sum, item) => {
    return sum + (parseInt(item.quantity) || 0)
  }, 0)
})

// Most common unit (satuan paling banyak)
const mostCommonUnit = computed(() => {
  if (!salesOrder.value || !salesOrder.value.details) return ''

  const units = salesOrder.value.details.map((item) => item.item_unit)
  const unitCounts = {}

  units.forEach((unit) => {
    unitCounts[unit] = (unitCounts[unit] || 0) + 1
  })

  return Object.keys(unitCounts).reduce((a, b) => (unitCounts[a] > unitCounts[b] ? a : b), '')
})

onMounted(() => {
  fetchSalesOrder()
})
</script>

<style scoped>
/* ===== PRINT PAGE STYLES ===== */
.print-page-container {
  width: 100%;
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}

.print-controls {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-bottom: 20px;
}

.btn-back,
.btn-print {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-back {
  background: #6c757d;
  color: white;
}

.btn-back:hover {
  background: #5a6268;
}

.btn-print {
  background: #007bff;
  color: white;
}

.btn-print:hover {
  background: #0056b3;
}

.loading-container-print {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.spinner-form {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text-form {
  margin-top: 16px;
  color: #666;
  font-weight: 600;
}

/* ===== A4 PRINT SHEET ===== */
.print-sheet-a4 {
  width: 210mm;
  min-height: 297mm;
  background: white;
  margin: 0 auto;
  padding: 15mm;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* ===== DOCUMENT TITLE ===== */
.document-title-container {
  text-align: center;
  margin: 20px 0;
  border-bottom: 2px solid #000;
  padding-bottom: 10px;
}

.document-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  text-transform: uppercase;
}

.document-meta {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 8px;
  font-size: 12px;
}

.meta-item {
  font-weight: 600;
}

/* ===== HEADER INFO ===== */
.header-info-container {
  margin: 20px 0;
}

.info-row-single {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 12px;
}

.info-label-bold {
  font-weight: bold;
  font-size: 14px;
}

.info-label {
  font-weight: 600;
  min-width: 100px;
}

.info-value {
  flex: 1;
}

/* ===== TABLE PRINT ===== */
.table-print-container {
  margin: 20px 0;
}

.table-print-bordered {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.table-print-bordered th,
.table-print-bordered td {
  border: 1px solid #000;
  padding: 8px 6px;
  text-align: left;
}

.table-print-bordered th {
  background: #f8f9fa;
  font-weight: bold;
  text-align: center;
  text-transform: uppercase;
}

.table-print-bordered td {
  vertical-align: top;
}

.text-center {
  text-align: center;
}

.text-center-empty {
  text-align: center;
  font-style: italic;
  color: #999;
}

.text-right-bold {
  text-align: right;
  font-weight: bold;
}

.text-center-bold {
  text-align: center;
  font-weight: bold;
}

.total-row-border {
  border-top: 2px solid #000;
  font-weight: bold;
}

/* ===== SIGNATURE ===== */
.signature-container-three {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 40px;
  page-break-inside: avoid;
}

.signature-box-three {
  text-align: center;
  font-size: 12px;
}

.signature-label {
  display: block;
  font-weight: 600;
  margin-bottom: 60px;
}

.signature-space {
  height: 60px;
}

.signature-name {
  display: block;
  margin-top: 8px;
  font-weight: 600;
}

/* ===== PRINT MEDIA QUERY ===== */
@media print {
  .print-page-container {
    background: white;
    padding: 0;
  }

  .print-controls {
    display: none;
  }

  .print-sheet-a4 {
    width: 100%;
    margin: 0;
    padding: 10mm;
    box-shadow: none;
    page-break-after: always;
  }

  @page {
    size: A4;
    margin: 0;
  }
}
</style>

<style scoped>
/* ===== PRINT PAGE STYLES ===== */
.print-page-container {
  width: 100%;
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}

.print-controls {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-bottom: 20px;
}

.btn-back,
.btn-print {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-back {
  background: #6c757d;
  color: white;
}

.btn-back:hover {
  background: #5a6268;
}

.btn-print {
  background: #007bff;
  color: white;
}

.btn-print:hover {
  background: #0056b3;
}

.loading-container-print {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.spinner-form {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text-form {
  margin-top: 16px;
  color: #666;
  font-weight: 600;
}

/* ===== A4 PRINT SHEET ===== */
.print-sheet-a4 {
  width: 210mm;
  min-height: 297mm;
  background: white;
  margin: 0 auto;
  padding: 15mm;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* ===== DOCUMENT TITLE ===== */
.document-title-container {
  text-align: center;
  margin: 20px 0;
  border-bottom: 2px solid #000;
  padding-bottom: 10px;
}

.document-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  text-transform: uppercase;
}

.document-meta {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 8px;
  font-size: 12px;
}

.meta-item {
  font-weight: 600;
}

/* ===== HEADER INFO ===== */
.header-info-container {
  margin: 20px 0;
}

.info-row-single {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 12px;
}

.info-label-bold {
  font-weight: bold;
  font-size: 14px;
}

.info-label {
  font-weight: 600;
  min-width: 100px;
}

.info-value {
  flex: 1;
}

/* ===== TABLE PRINT ===== */
.table-print-container {
  margin: 20px 0;
}

.table-print-bordered {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.table-print-bordered th,
.table-print-bordered td {
  border: 1px solid #000;
  padding: 8px 6px;
  text-align: left;
}

.table-print-bordered th {
  background: #f8f9fa;
  font-weight: bold;
  text-align: center;
  text-transform: uppercase;
}

.table-print-bordered td {
  vertical-align: top;
}

.text-center {
  text-align: center;
}

.text-center-empty {
  text-align: center;
  font-style: italic;
  color: #999;
}

.text-right-bold {
  text-align: right;
  font-weight: bold;
}

.text-center-bold {
  text-align: center;
  font-weight: bold;
}

.total-row-border {
  border-top: 2px solid #000;
  font-weight: bold;
}

/* ===== SIGNATURE ===== */
.signature-container-three {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 40px;
  page-break-inside: avoid;
}

.signature-box-three {
  text-align: center;
  font-size: 12px;
}

.signature-label {
  display: block;
  font-weight: 600;
  margin-bottom: 60px;
}

.signature-space {
  height: 60px;
}

.signature-name {
  display: block;
  margin-top: 8px;
  font-weight: 600;
}

/* ===== PRINT MEDIA QUERY ===== */
@media print {
  .print-page-container {
    background: white;
    padding: 0;
  }

  .print-controls {
    display: none;
  }

  .print-sheet-a4 {
    width: 210mm;
    min-height: 297mm;
    background: white;
    margin: 0 auto;
    padding: 8mm 7mm 12mm 7mm;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  @page {
    size: A4;
    margin: 0;
  }
}
</style>
