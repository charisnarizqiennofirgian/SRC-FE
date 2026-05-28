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
              <td class="text-center ppic-cell">DI SESUAIKAN DENGAN PPIC</td>
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
    const response = await apiClient.get(`/sales-orders/${soId.value}`)
    salesOrder.value = response.data.data
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

const totalQuantity = computed(() => {
  if (!salesOrder.value || !salesOrder.value.details) return 0
  return salesOrder.value.details.reduce((sum, item) => {
    return sum + (parseInt(item.quantity) || 0)
  }, 0)
})

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
  padding: 15mm 18mm;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: 'Times New Roman', Times, serif;
  color: #000;
}

/* ===== DOCUMENT TITLE ===== */
.document-title-container {
  text-align: center;
  margin: 5mm 0 4mm 0;
  border-bottom: 2pt solid #000;
  padding-bottom: 3mm;
}

.document-title {
  font-size: 13pt;
  font-weight: bold;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5pt;
  font-family: 'Times New Roman', Times, serif;
}

.document-meta {
  display: flex;
  justify-content: center;
  gap: 30mm;
  margin-top: 2mm;
  font-size: 10pt;
}

.meta-item {
  font-weight: 600;
}

/* ===== HEADER INFO ===== */
.header-info-container {
  margin: 4mm 0;
  padding: 3mm 0;
  border-bottom: 1pt solid #000;
}

.info-row-single {
  display: flex;
  gap: 4mm;
  margin-bottom: 1.5mm;
  font-size: 10pt;
  align-items: baseline;
}

.info-label-bold {
  font-weight: bold;
  font-size: 11pt;
}

.info-label {
  font-weight: 700;
  min-width: 28mm;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
}

/* ===== TABLE PRINT ===== */
.table-print-container {
  margin: 4mm 0;
}

.table-print-bordered {
  width: 100%;
  border-collapse: collapse;
  font-size: 10pt;
  font-family: 'Times New Roman', Times, serif;
}

.table-print-bordered th,
.table-print-bordered td {
  border: 0.75pt solid #000;
  padding: 3pt 5pt;
  text-align: left;
}

.table-print-bordered th {
  background: #f0f0f0;
  font-weight: bold;
  text-align: center;
  text-transform: uppercase;
  font-size: 9pt;
  letter-spacing: 0.3pt;
}

.table-print-bordered td {
  vertical-align: middle;
}

.text-center {
  text-align: center;
}

.text-center-empty {
  text-align: center;
  font-style: italic;
  color: #666;
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
  border-top: 1.5pt solid #000;
  font-weight: bold;
  background: #f8f8f8;
}

.ppic-cell {
  font-style: italic;
  font-size: 8pt;
  color: #555;
}

/* ===== SIGNATURE ===== */
.signature-container-three {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10mm;
  margin-top: 10mm;
  page-break-inside: avoid;
}

.signature-box-three {
  text-align: center;
  font-size: 10pt;
  font-family: 'Times New Roman', Times, serif;
}

.signature-label {
  display: block;
  font-weight: 700;
  margin-bottom: 18mm;
  font-size: 10pt;
}

.signature-space {
  height: 18mm;
}

.signature-name {
  display: block;
  margin-top: 2mm;
  font-weight: 700;
  font-size: 10pt;
  border-top: 1pt solid #000;
  padding-top: 1mm;
}

/* ===== PRINT MEDIA QUERY ===== */
@media print {
  .print-controls {
    display: none !important;
  }

  .print-page-container {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    height: auto !important;
    min-height: auto !important;
    overflow: visible !important;
    position: static !important;
  }

  .print-sheet-a4 {
    width: 100% !important;
    height: auto !important;
    min-height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    overflow: visible !important;
    position: static !important;
  }

  @page {
    size: A4 portrait;
    margin: 15mm 20mm;
  }
}
</style>

<!-- Reset global: html/body/#app masih punya height:100% dari base.css -->
<style>
@media print {
  html,
  body,
  #app {
    height: auto !important;
    min-height: auto !important;
    overflow: visible !important;
    background: white !important;
  }
}
</style>
