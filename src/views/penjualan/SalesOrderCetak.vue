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
      <PrintKopWrapper>

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
          <colgroup>
            <col class="col-no" />
            <col class="col-kode" />
            <col class="col-nama" />
            <col class="col-qty" />
            <col class="col-sat" />
            <col class="col-ket" />
            <col class="col-tgl" />
          </colgroup>
          <thead>
            <tr>
              <th>NO</th>
              <th>KODE PRODUK</th>
              <th>NAMA PRODUK</th>
              <th>QTY</th>
              <th>SAT</th>
              <th>KETERANGAN</th>
              <th>TGL. KIRIM</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!salesOrder.details || salesOrder.details.length === 0">
              <td colspan="7" class="text-center-empty">Tidak ada barang.</td>
            </tr>
            <tr v-for="(item, index) in salesOrder.details" :key="item.id" class="data-row">
              <td class="text-center">{{ index + 1 }}</td>
              <td class="td-kode">{{ item.item_code || '-' }}</td>
              <td class="td-nama">{{ item.item_name }}</td>
              <td class="text-center">{{ formatQuantity(item.quantity) }}</td>
              <td class="text-center">{{ item.item_unit }}</td>
              <td class="td-ket">{{ item.keterangan || '-' }}</td>
              <td class="text-center td-tgl">{{ formatDisplayDate(item.delivery_date) }}</td>
            </tr>
            <tr class="total-row-border">
              <td colspan="3" class="text-right-bold">TOTAL</td>
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
          <span class="signature-name">Ellen Apriliana</span>
        </div>
        <div class="signature-box-three">
          <span class="signature-label">Penerima,</span>
          <div class="signature-space"></div>
          <span class="signature-name">(___________________)</span>
        </div>
      </div>
      </PrintKopWrapper>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import { useToast } from 'vue-toastification'

import PrintKopWrapper from '../../components/cetak/PrintKopWrapper.vue'

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

<style>
/* ── POLA SAMA DENGAN PesananPembelianCetak.vue ── */

/* Tombol floating — tidak masuk flow dokumen */
.print-controls {
  position: fixed;
  top: 16px;
  right: 24px;
  display: flex;
  gap: 10px;
  z-index: 100;
}

.print-controls .btn-back,
.print-controls .btn-print {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 20px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.print-controls .btn-back  { background: #6c757d; color: white; }
.print-controls .btn-back:hover  { background: #5a6268; }
.print-controls .btn-print { background: #1d6fd8; color: white; }
.print-controls .btn-print:hover { background: #155db5; }

/* Loading */
.loading-container-print {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 16px;
}

.spinner-form {
  width: 48px;
  height: 48px;
  border: 4px solid #ddd;
  border-top-color: #1d6fd8;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
.loading-text-form { font-size: 14px; font-weight: 600; color: #555; margin: 0; }

/* Container — sama dengan .print-container di PO cetak */
.print-page-container {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

/* Content box — sama dengan .invoice-box di PO cetak */
.print-sheet-a4 {
  padding: 15mm 18mm 12mm 18mm;
  font-family: 'Times New Roman', Times, serif;
  font-size: 10pt;
  line-height: 1.4;
  color: #000;
}

/* ===== DOCUMENT TITLE ===== */
.document-title-container {
  text-align: center;
  margin: 4mm 0 3mm 0;
  border-bottom: 2pt solid #000;
  padding-bottom: 2.5mm;
}

.document-title {
  font-size: 12pt;
  font-weight: bold;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1pt;
}

.document-meta {
  display: flex;
  justify-content: center;
  gap: 20mm;
  margin-top: 2mm;
  font-size: 9.5pt;
}

.meta-item { font-weight: 600; }

/* ===== HEADER INFO ===== */
.header-info-container {
  margin: 3mm 0;
  padding: 2.5mm 0;
  border-bottom: 1pt solid #000;
}

.info-row-single {
  display: flex;
  gap: 3mm;
  margin-bottom: 1mm;
  font-size: 9.5pt;
  align-items: baseline;
}

.info-label-bold { font-weight: bold; font-size: 10.5pt; }
.info-label { font-weight: 700; min-width: 25mm; flex-shrink: 0; }
.info-value { flex: 1; }

/* ===== TABLE ===== */
.table-print-container { margin: 3mm 0 4mm 0; }

.table-print-bordered {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 9pt;
  font-family: 'Times New Roman', Times, serif;
}

.col-no   { width: 8mm; }
.col-kode { width: 24mm; }
.col-nama { width: 52mm; }
.col-qty  { width: 13mm; }
.col-sat  { width: 12mm; }
.col-ket  { width: 34mm; }
.col-tgl  { width: 27mm; }

.table-print-bordered th {
  border: 0.75pt solid #000;
  padding: 3.5pt 4pt;
  background-color: #f0f0f0;
  font-weight: bold;
  text-align: center;
  text-transform: uppercase;
  font-size: 8.5pt;
  letter-spacing: 0.2pt;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.table-print-bordered td {
  border: 0.75pt solid #000;
  padding: 3pt 4pt;
  text-align: left;
  vertical-align: middle;
  word-break: break-word;
  line-height: 1.3;
  font-size: 9pt;
}

.td-kode { font-size: 8.5pt; }
.td-tgl  { font-size: 8.5pt; }

.text-center      { text-align: center !important; }
.text-right-bold  { text-align: right; font-weight: bold; font-size: 8.5pt; padding-right: 4pt; }
.text-center-bold { text-align: center; font-weight: bold; }
.text-center-empty { text-align: center; font-style: italic; color: #666; padding: 6pt; }

.total-row-border {
  border-top: 1.5pt solid #000;
  font-weight: bold;
  background-color: #f0f0f0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ===== SIGNATURE ===== */
.signature-container-three {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8mm;
  margin-top: 8mm;
  page-break-inside: avoid;
  break-inside: avoid;
}

.signature-box-three {
  text-align: center;
  font-size: 9.5pt;
  font-family: 'Times New Roman', Times, serif;
}

.signature-label { display: block; font-weight: 700; font-size: 9.5pt; margin-bottom: 16mm; }
.signature-space { height: 16mm; }
.signature-name {
  display: block;
  margin-top: 1.5mm;
  font-weight: 700;
  font-size: 9.5pt;
  border-top: 1pt solid #000;
  padding-top: 1mm;
}

/* ===== @page — sama persis dengan PO cetak ===== */
@page {
  size: A4 portrait;
  margin: 15mm 20mm;
}

/* ===== @media print — sama persis dengan PO cetak ===== */
@media print {
  html, body, #app {
    height: auto !important;
    min-height: auto !important;
    overflow: visible !important;
    background: white !important;
  }

  .print-controls { display: none !important; }

  .print-page-container {
    width: 100% !important;
    min-height: auto !important;
    margin: 0 !important;
    box-shadow: none !important;
    overflow: visible !important;
  }

  .print-sheet-a4 { padding: 0 !important; }

  thead { display: table-header-group; }
  tbody tr { page-break-inside: avoid; break-inside: avoid; }
  .signature-container-three { page-break-inside: avoid; break-inside: avoid; }
}
</style>
