<template>
  <div class="print-page-container">
    <div class="print-controls">
      <button @click="goBack" class="btn-back">↩ Kembali</button>
      <button @click="handlePrint" class="btn-print">🖨 Cetak / PDF</button>
    </div>

    <div v-if="loading || !so" class="loading-container-print">
      <div class="spinner-form"></div>
      <p class="loading-text-form">Memuat data Proforma Invoice...</p>
    </div>

    <div v-else class="print-sheet-a4">

      <!-- KOP SURAT -->
      <KopSuratCetak />

      <!-- JUDUL + NOMOR -->
      <div class="pi-title-section">
        <h1 class="pi-title">PROFORMA INVOICE</h1>
        <div class="pi-meta-block">
          <div class="pi-meta-row">
            <span class="pi-meta-label">No.</span>
            <span class="pi-meta-sep">:</span>
            <span class="pi-meta-value">{{ noPi || '-' }}</span>
          </div>
          <div class="pi-meta-row">
            <span class="pi-meta-label">Date</span>
            <span class="pi-meta-sep">:</span>
            <span class="pi-meta-value">{{ formatDisplayDate(so.so_date) }}</span>
          </div>
        </div>
      </div>

      <!-- INFO BUYER -->
      <div class="pi-buyer-section">
        <div class="pi-info-row">
          <span class="pi-info-label">To</span>
          <span class="pi-info-sep">:</span>
          <span class="pi-info-value pi-buyer-name">{{ so.buyer?.name || '-' }}</span>
        </div>
        <div class="pi-info-row" v-if="so.buyer?.address">
          <span class="pi-info-label"></span>
          <span class="pi-info-sep"></span>
          <span class="pi-info-value pi-buyer-address">{{ so.buyer.address }}</span>
        </div>
        <div class="pi-info-row">
          <span class="pi-info-label">PO Number</span>
          <span class="pi-info-sep">:</span>
          <span class="pi-info-value">{{ so.customer_po_number || so.so_number }}</span>
        </div>
      </div>

      <!-- TABEL BARANG -->
      <div class="pi-table-wrap">
        <table class="pi-table">
          <thead>
            <tr>
              <th class="col-no"     rowspan="2">NO</th>
              <th class="col-prod"   colspan="2">PRODUCT</th>
              <th class="col-hs"     rowspan="2">HS CODE</th>
              <th class="col-qty"    rowspan="2">QTY<br />(PCS)</th>
              <th class="col-price"  rowspan="2">UNIT PRICE<br />($)</th>
              <th class="col-total"  rowspan="2">TOTAL<br />($)</th>
              <th class="col-ship"   rowspan="2">SHIPMENT<br />DATE</th>
            </tr>
            <tr>
              <th class="col-code">CODE</th>
              <th class="col-desc">DESCRIPTION</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!so.details || so.details.length === 0">
              <td colspan="8" class="td-empty">Tidak ada barang.</td>
            </tr>
            <tr
              v-for="(detail, index) in so.details"
              :key="detail.id"
              :class="index % 2 === 1 ? 'tr-stripe' : ''"
            >
              <td class="td-center">{{ index + 1 }}</td>
              <td class="td-code">{{ detail.item_code || detail.item?.code || '-' }}</td>
              <td>{{ detail.item_name }}</td>
              <td class="td-center">{{ detail.item?.hs_code || '-' }}</td>
              <td class="td-right">{{ formatQty(detail.quantity) }}</td>
              <td class="td-right td-money">$ {{ formatUsd(detail.unit_price) }}</td>
              <td class="td-right td-money">$ {{ formatUsd(detail.line_total) }}</td>
              <td class="td-center td-ship">{{ formatDisplayDate(detail.delivery_date) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="tr-total">
              <td colspan="4" class="td-total-label">TOTAL</td>
              <td class="td-center td-total-val">{{ formatQty(totalQty) }}</td>
              <td></td>
              <td class="td-right td-total-val td-money">$ {{ formatUsd(so.grand_total) }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- FOOTER 2 KOLOM -->
      <div class="pi-footer-grid">

        <!-- KIRI ATAS: Spec & Condition -->
        <div class="fc fc-top fc-left">
          <p class="fc-title">Specification And Condition :</p>
          <ul class="fc-list">
            <li>Machine made, fine sanding</li>
            <li>Delivery address : provided by buyer</li>
            <li>Incoterm : FOB Semarang Port</li>
            <li>Tolerance QTY item : +- 10%</li>
            <li>All items are certified FSC 100% SA-COC-012797</li>
            <li>
              Payment term :
              <span class="fc-payment-term">{{ so.payment_term || '-' }}</span>
            </li>
          </ul>
        </div>

        <!-- KANAN ATAS: Payment To -->
        <div class="fc fc-top fc-right">
          <p class="fc-title">Payment to :</p>
          <p class="fc-line fc-line-bold">PT SURYA BANGKIT CEMERLANG</p>
          <p class="fc-line">Bank Central Asia, Semarang</p>
          <p class="fc-line">Indonesia</p>
          <p class="fc-line">A/C # 009 184 5678</p>
          <p class="fc-line">Swift Code : CENAIDJA</p>
        </div>

        <!-- KIRI BAWAH: TTD Buyer -->
        <div class="fc fc-bottom fc-left">
          <p class="sign-label">CONFIRMED</p>
          <div class="sign-line"></div>
          <p class="sign-name">JACOPO</p>
        </div>

        <!-- KANAN BAWAH: TTD SBC -->
        <div class="fc fc-bottom fc-right">
          <p class="sign-city-date">Semarang, {{ formatSignDate(so.so_date) }}</p>
          <div class="sign-line"></div>
          <p class="sign-name">Ellen Apriliana</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import { useToast } from 'vue-toastification'
import KopSuratCetak from '../../components/cetak/KopSuratCetak.vue'

const route  = useRoute()
const router = useRouter()
const toast  = useToast()

const loading = ref(true)
const so      = ref(null)
const noPi    = ref('')

onMounted(async () => {
  const id = route.params.id
  try {
    const [soRes, piRes] = await Promise.all([
      apiClient.get(`/sales-orders/${id}`),
      apiClient.get(`/sales-orders/${id}/generate-pi-number`),
    ])
    so.value    = soRes.data.data
    noPi.value  = piRes.data.no_pi || ''
  } catch (err) {
    console.error('Gagal memuat data PI:', err)
    toast.error('Gagal memuat data Proforma Invoice.')
  } finally {
    loading.value = false
  }
})

const totalQty = computed(() =>
  so.value?.details?.reduce((s, d) => s + parseFloat(d.quantity || 0), 0) ?? 0
)

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const formatDisplayDate = (v) => {
  if (!v) return '-'
  const d = new Date(v)
  if (isNaN(d)) return v
  return `${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

const formatSignDate = (v) => {
  if (!v) return '-'
  const d = new Date(v)
  if (isNaN(d)) return v
  return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2,'0')}, ${d.getFullYear()}`
}

const formatUsd = (v) =>
  v == null ? '-' : new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(v))

const formatQty = (v) => {
  if (!v) return '0'
  const n = parseFloat(v)
  return Number.isInteger(n) ? n.toLocaleString('en-US') : n.toFixed(2)
}

const handlePrint = () => window.print()
const goBack      = () => router.push({ name: 'DaftarSalesOrder' })
</script>

<style scoped>
/* ─── WRAPPER LAYAR ─────────────────────────────────── */
.print-page-container {
  width: 100%;
  min-height: 100vh;
  background: #e8e8e8;
  padding: 24px 16px;
  box-sizing: border-box;
}

/* ─── TOOLBAR ───────────────────────────────────────── */
.print-controls {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 20px;
}

.btn-back,
.btn-print {
  padding: 9px 22px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.3px;
  transition: background 0.2s;
}
.btn-back  { background: #6c757d; color: #fff; }
.btn-back:hover  { background: #5a6268; }
.btn-print { background: #1d6fd8; color: #fff; }
.btn-print:hover { background: #155db5; }

/* ─── LOADING ───────────────────────────────────────── */
.loading-container-print {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 420px;
  gap: 16px;
  color: #555;
}
.spinner-form {
  width: 48px; height: 48px;
  border: 4px solid #ddd;
  border-top-color: #1d6fd8;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text-form { font-size: 14px; font-weight: 600; margin: 0; }

/* ─── KERTAS A4 ─────────────────────────────────────── */
.print-sheet-a4 {
  width: 210mm;
  min-height: 297mm;
  background: #fff;
  margin: 0 auto;
  padding: 14mm 18mm 16mm;
  box-shadow: 0 6px 30px rgba(0,0,0,.18);
  font-family: 'Times New Roman', Times, serif;
  font-size: 10pt;
  color: #000;
  box-sizing: border-box;
}

/* ─── JUDUL PI ──────────────────────────────────────── */
.pi-title-section {
  margin: 5mm 0 3mm;
  padding-bottom: 3mm;
  border-bottom: 2pt solid #000;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.pi-title {
  font-size: 16pt;
  font-weight: 900;
  letter-spacing: 2pt;
  text-transform: uppercase;
  margin: 0;
  font-family: 'Times New Roman', Times, serif;
  align-self: center;
}

.pi-meta-block {
  border: 0.75pt solid #aaa;
  padding: 3mm 5mm;
  min-width: 56mm;
  background: #fafafa;
}

.pi-meta-row {
  display: grid;
  grid-template-columns: 14mm 5mm 1fr;
  font-size: 9.5pt;
  line-height: 1.8;
}

.pi-meta-label { font-weight: 700; }
.pi-meta-sep   { text-align: center; }
.pi-meta-value { font-weight: 600; }

/* ─── BUYER INFO ────────────────────────────────────── */
.pi-buyer-section {
  margin: 3mm 0;
  padding: 3mm 0 3mm;
  border-bottom: 1pt solid #000;
}

.pi-info-row {
  display: grid;
  grid-template-columns: 22mm 5mm 1fr;
  margin-bottom: 1mm;
  font-size: 10pt;
  align-items: baseline;
}

.pi-info-label { font-weight: 700; }
.pi-info-sep   { text-align: center; }

.pi-buyer-name {
  font-weight: 700;
  font-size: 11pt;
}

.pi-buyer-address {
  font-size: 9.5pt;
  color: #222;
  white-space: pre-line;
  line-height: 1.5;
}

/* ─── TABEL ─────────────────────────────────────────── */
.pi-table-wrap {
  margin: 4mm 0;
}

.pi-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9pt;
  font-family: 'Times New Roman', Times, serif;
}

.pi-table th,
.pi-table td {
  border: 0.75pt solid #666;
  padding: 4pt 5pt;
}

/* header baris 1 & 2 */
.pi-table thead th {
  background: #f0f0f0;
  color: #000;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  font-size: 8pt;
  letter-spacing: 0.5pt;
  line-height: 1.4;
}

/* baris data */
.pi-table tbody td {
  vertical-align: middle;
  line-height: 1.4;
}

.tr-stripe td { background: #f7f7f7; }

/* tfoot */
.tr-total td {
  background: #f0f0f0;
  border-top: 1.5pt solid #000;
  padding: 4pt 5pt;
}
.td-total-label {
  text-align: right;
  font-weight: 700;
  font-size: 9pt;
  letter-spacing: 0.5pt;
}
.td-total-val {
  font-weight: 700;
  font-size: 9.5pt;
}

/* kolom lebar */
.col-no    { width: 8mm;  }
.col-prod  { /* colspan 2 — lebar otomatis */ }
.col-code  { width: 24mm; }
.col-desc  { min-width: 40mm; }
.col-hs    { width: 20mm; }
.col-qty   { width: 17mm; }
.col-price { width: 26mm; }
.col-total { width: 26mm; }
.col-ship  { width: 22mm; }

/* helper alignment */
.td-center { text-align: center; }
.td-right  { text-align: right;  }
.td-code   { font-size: 8.5pt; }
.td-money  { font-family: 'Courier New', Courier, monospace; font-size: 9pt; }
.td-ship   { font-size: 8.5pt; white-space: nowrap; }
.td-empty  { text-align: center; font-style: italic; color: #888; padding: 6pt; }

/* ─── FOOTER 2×2 ────────────────────────────────────── */
.pi-footer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  margin-top: 6mm;
  page-break-inside: avoid;
}

/* setiap sel */
.fc { padding: 0 4mm 0 0; }
.fc.fc-right { padding: 0 0 0 4mm; }

/* baris atas */
.fc-top {
  padding-bottom: 4mm;
}

/* baris bawah */
.fc-bottom {
  padding-top: 4mm;
}

/* judul sub-seksi */
.fc-title {
  font-weight: 700;
  font-size: 9.5pt;
  margin: 0 0 2mm 0;
  letter-spacing: 0.2pt;
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* list spec */
.fc-list {
  margin: 0;
  padding-left: 4.5mm;
  font-size: 9pt;
  line-height: 1.75;
  list-style: disc;
}

.fc-payment-term {
  display: block;
  padding-left: 3mm;
  font-style: italic;
}

/* baris payment to */
.fc-line {
  margin: 0;
  font-size: 9pt;
  line-height: 1.75;
}
.fc-line-bold {
  font-weight: 700;
  font-size: 9.5pt;
}

/* tanda tangan */
.sign-label,
.sign-city-date {
  font-size: 9.5pt;
  margin: 0 0 1mm 0;
  font-weight: 600;
}

.sign-line {
  width: 48mm;
  height: 16mm;
  border-bottom: 0.75pt solid #000;
  margin: 0 0 2mm 0;
}

.fc-right .sign-line {
  margin-left: auto;
}

.sign-name {
  font-weight: 700;
  font-size: 10pt;
  margin: 0;
}

/* ─── PRINT ─────────────────────────────────────────── */
@media print {
  .print-controls { display: none !important; }

  .print-page-container {
    background: #fff !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    min-height: auto !important;
    overflow: visible !important;
    position: static !important;
  }

  .print-sheet-a4 {
    width: 100% !important;
    min-height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    overflow: visible !important;
    position: static !important;
  }

  @page { size: A4 portrait; margin: 14mm 18mm; }
}
</style>

<!-- Reset global html/body saat print -->
<style>
@media print {
  html, body, #app {
    height: auto !important;
    min-height: auto !important;
    overflow: visible !important;
    background: white !important;
  }
}
</style>
