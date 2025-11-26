<template>
  <div class="print-page-container">
    <div class="print-controls">
      <button @click="goBack" class="btn-back">
        <span class="btn-icon">↩️</span>
        <span class="btn-text">Kembali</span>
      </button>

      <button @click="handlePrintPL" class="btn-print">
        <span class="btn-icon">📄</span>
        <span class="btn-text">Cetak Packing List</span>
      </button>

      <button
        v-if="deliveryOrder?.barcode_image"
        @click="handlePrintBarcode"
        class="btn-print btn-secondary"
      >
        <span class="btn-icon">📷</span>
        <span class="btn-text">Cetak Lampiran</span>
      </button>
    </div>

    <div v-if="loading || !deliveryOrder" class="loading-container-print">
      <div class="spinner-form"></div>
      <p class="loading-text-form">Memuat data Pengiriman...</p>
    </div>

    <div v-else class="print-sheet-a4">
      <KopSuratCetak />

      <div class="title-main">
        <div class="title-packing">
          {{ printMode === 'barcode' ? 'LAMPIRAN KEMENDAG' : 'PACKING LIST' }}
        </div>
        <div class="title-meta">
          <div>NO. : {{ deliveryOrder.do_number }}</div>
          <div>DATE : {{ formatDisplayDateFull(deliveryOrder.delivery_date) }}</div>
        </div>
      </div>

      <table class="header-table" style="margin-bottom: 12px; margin-top: 12px">
        <tr>
          <td class="header-label">Shipper</td>
          <td class="header-value" colspan="3">
            <div style="white-space: pre-line">
              {{ deliveryOrder.shipper_info?.name || '-' }}<br />
              {{ deliveryOrder.shipper_info?.address || '-' }}
            </div>
          </td>
          <td class="header-label">Applicant</td>
          <td class="header-value" colspan="3">
            <div style="white-space: pre-line">
              {{ deliveryOrder.applicant_info?.name || '-' }}<br />
              {{ deliveryOrder.applicant_info?.address || '-' }}
            </div>
          </td>
        </tr>
        <tr>
          <td class="header-label">Consignee</td>
          <td class="header-value" colspan="3">
            <div style="white-space: pre-line">
              {{ deliveryOrder.consignee_info?.name || '-' }}<br />
              {{ deliveryOrder.consignee_info?.address || '-' }}
            </div>
          </td>
          <td class="header-label">Notify</td>
          <td class="header-value" colspan="3">
            <div style="white-space: pre-line">
              {{ deliveryOrder.notify_info?.name || '-' }}<br />
              {{ deliveryOrder.notify_info?.address || '-' }}
            </div>
          </td>
        </tr>
        <tr>
          <td class="header-label">Incoterm</td>
          <td class="header-value" colspan="3">{{ deliveryOrder.incoterm || '-' }}</td>
          <td class="header-label">EU Factory Number</td>
          <td class="header-value" colspan="3">{{ deliveryOrder.eu_factory_number || '-' }}</td>
        </tr>
        <tr>
          <td class="header-label">Freight</td>
          <td class="header-value" colspan="3">{{ deliveryOrder.freight_terms || '-' }}</td>
          <td class="header-label">Port of Loading</td>
          <td class="header-value" colspan="3">{{ deliveryOrder.port_of_loading || '-' }}</td>
        </tr>
        <tr>
          <td class="header-label">Container</td>
          <td class="header-value" colspan="3">{{ deliveryOrder.container_number || '-' }}</td>
          <td class="header-label">Port of Discharge</td>
          <td class="header-value" colspan="3">{{ deliveryOrder.port_of_discharge || '-' }}</td>
        </tr>
        <tr>
          <td class="header-label">Seal</td>
          <td class="header-value" colspan="3">{{ deliveryOrder.seal_number || '-' }}</td>
          <td class="header-label">Final Destination</td>
          <td class="header-value" colspan="3">{{ deliveryOrder.final_destination || '-' }}</td>
        </tr>
        <tr>
          <td class="header-label">BL</td>
          <td class="header-value" colspan="3">{{ deliveryOrder.bl_number || '-' }}</td>
          <td class="header-label">Feeder Vessel</td>
          <td class="header-value" colspan="3">{{ deliveryOrder.vessel_name || '-' }}</td>
        </tr>
        <tr>
          <td class="header-label">BL Date</td>
          <td class="header-value" colspan="3">{{ formatDisplayDate(deliveryOrder.bl_date) }}</td>
          <td class="header-label">Mother Vessel</td>
          <td class="header-value" colspan="3">{{ deliveryOrder.mother_vessel || '-' }}</td>
        </tr>
        <tr>
          <td class="header-label">REX</td>
          <td class="header-value" colspan="3">{{ deliveryOrder.rex_info || '-' }}</td>
          <td class="header-label">REX DATE</td>
          <td class="header-value" colspan="3">{{ formatDisplayDate(deliveryOrder.rex_date) }}</td>
        </tr>
        <tr>
          <td class="header-label">Goods</td>
          <td class="header-value" colspan="7">
            {{ deliveryOrder.goods_description || 'TEAK GARDEN FURNITURE AND ACCESSORIES' }}
          </td>
        </tr>
      </table>

      <div v-if="printMode === 'all' || printMode === 'pl'">
        <table class="table-print-packing">
          <thead>
            <tr>
              <th rowspan="2" style="width: 3%">NO</th>
              <th rowspan="2" style="width: 9%">CODE</th>
              <th rowspan="2" style="width: 31%">DESCRIPTION</th>
              <th colspan="2" style="width: 10%">QUANTITY</th>
              <th colspan="2" style="width: 13%">WOOD CONSUMED</th>
              <th colspan="2" style="width: 14%">VOLUME</th>
              <th colspan="2" style="width: 14%">WEIGHT (KG)</th>
            </tr>
            <tr>
              <th style="width: 5%">BOXES</th>
              <th style="width: 5%">PCS</th>
              <th style="width: 6.5%">PCS</th>
              <th style="width: 6.5%">M3</th>
              <th style="width: 6.5%">M3/BOX</th>
              <th style="width: 6.5%">M3</th>
              <th style="width: 7%">NETT</th>
              <th style="width: 7%">GROSS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!deliveryOrder.details || deliveryOrder.details.length === 0">
              <td colspan="11" class="text-center-empty">Tidak ada barang.</td>
            </tr>
            <tr v-for="(item, index) in deliveryOrder.details" :key="item.id">
              <td class="text-center">{{ index + 1 }}</td>
              <td class="text-center">{{ item.item?.code || '-' }}</td>
              <td>{{ item.item_name }}</td>
              <td class="text-center">{{ formatNumber(item.quantity_boxes) }}</td>
              <td class="text-center">{{ formatNumber(item.quantity_shipped) }}</td>
              <td class="text-center">{{ formatDecimal(item.item?.wood_consumed_per_pcs, 4) }}</td>
              <td class="text-center">{{ formatDecimal(calculateWoodTotal(item), 4) }}</td>

              <td class="text-center">{{ formatDecimal(item.item?.m3_per_carton, 4) }}</td>
              <td class="text-center">{{ formatDecimal(calculateVolumeTotal(item), 4) }}</td>

              <td class="text-center">{{ formatNumber(calculateNettTotal(item)) }}</td>
              <td class="text-center">{{ formatNumber(calculateGrossTotal(item)) }}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" class="text-right-bold">TOTAL</td>
              <td class="text-center-bold">{{ formatNumber(totals.boxes) }}</td>
              <td class="text-center-bold">{{ formatNumber(totals.pcs) }}</td>
              <td></td>
              <td class="text-center-bold">{{ formatDecimal(totals.woodM3, 4) }}</td>
              <td></td>
              <td class="text-center-bold">{{ formatDecimal(totals.volumeM3, 4) }}</td>
              <td class="text-center-bold">{{ formatNumber(totals.nett) }}</td>
              <td class="text-center-bold">{{ formatNumber(totals.gross) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="deliveryOrder.barcode_image && printMode === 'barcode'">
        <div class="footer-barcode-qr">
          <img
            :src="deliveryOrder.barcode_image"
            alt="Barcode Kemendag"
            class="kemendag-barcode-img"
          />
        </div>
        <div v-if="deliveryOrder.sipk_number" class="barcode-label">
          No. SIPK: {{ deliveryOrder.sipk_number }}
        </div>
      </div>

      <div class="footer-info" style="margin-top: 25px">
        <div style="display: flex; width: 100%">
          <div
            style="
              flex: 1 1 0;
              font-size: 10px;
              font-weight: 700;
              min-height: 80px;
              display: flex;
              flex-direction: column;
              justify-content: flex-end;
            "
          >
            <div>
              MADE OUT TO APPLICANT: {{ deliveryOrder.applicant_info?.name || '' }}
              {{ deliveryOrder.applicant_info?.address || '' }}
            </div>
            <div style="margin-top: 36px">FSC100%: SA-COC-012797</div>
          </div>
          <div style="flex: 1 0 0"></div>
          <div
            style="
              flex: 1 1 0;
              text-align: right;
              font-size: 10px;
              font-weight: 700;
              min-height: 80px;
              display: flex;
              flex-direction: column;
              justify-content: flex-end;
            "
          >
            <div>PT. SURYA BANGKIT CEMERLANG</div>
            <div style="height: 36px"></div>
            <div>ELLEN APRILIANA</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import { useToast } from 'vue-toastification'
import KopSuratCetak from '../../components/cetak/KopSuratCetak.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const loading = ref(true)
const deliveryOrder = ref(null)
const doId = ref(route.params.id)

// STATE MODE CETAK
const printMode = ref('all') // 'all' | 'pl' | 'barcode'

const fetchDeliveryOrder = async () => {
  loading.value = true
  try {
    const response = await apiClient.get(`/delivery-orders/${doId.value}`)
    deliveryOrder.value = response.data.data
  } catch {
    toast.error('Gagal memuat data pengiriman.')
  } finally {
    loading.value = false
  }
}

// === PERBAIKAN LOGIKA TOMBOL ===
// Menggunakan setTimeout agar Browser punya waktu untuk menyembunyikan elemen sebelum Print Dialog muncul

const handlePrintPL = async () => {
  printMode.value = 'pl' // 1. Ubah mode ke PL (Barcode hilang)
  await nextTick() // 2. Tunggu Vue update DOM
  setTimeout(() => {
    window.print() // 3. Munculkan Print Dialog setelah 500ms
    printMode.value = 'all' // 4. Reset (Setelah user tutup dialog print)
  }, 500)
}

const handlePrintBarcode = async () => {
  printMode.value = 'barcode' // 1. Ubah mode ke Barcode (Tabel hilang)
  await nextTick()
  setTimeout(() => {
    window.print()
    printMode.value = 'all'
  }, 500)
}

const goBack = () => {
  router.push({ name: 'DaftarPengiriman' })
}

// === HITUNGAN ASLI (M3 PER CARTON) ===
const calculateWoodTotal = (item) => {
  const woodPerPcs = parseFloat(item.item?.wood_consumed_per_pcs || 0)
  const qty = parseFloat(item.quantity_shipped || 0)
  return woodPerPcs * qty
}
const calculateVolumeTotal = (item) => {
  // TETAP PAKAI M3_PER_CARTON (Sesuai Request Anda)
  const m3PerCarton = parseFloat(item.item?.m3_per_carton || 0)
  const boxes = parseFloat(item.quantity_boxes || 0)
  return m3PerCarton * boxes
}
const calculateNettTotal = (item) => {
  const nwPerBox = parseFloat(item.item?.nw_per_box || 0)
  const boxes = parseFloat(item.quantity_boxes || 0)
  return nwPerBox * boxes
}
const calculateGrossTotal = (item) => {
  const gwPerBox = parseFloat(item.item?.gw_per_box || 0)
  const boxes = parseFloat(item.quantity_boxes || 0)
  return gwPerBox * boxes
}
const totals = computed(() => {
  if (!deliveryOrder.value || !deliveryOrder.value.details) {
    return { boxes: 0, pcs: 0, woodM3: 0, volumeM3: 0, nett: 0, gross: 0 }
  }
  return deliveryOrder.value.details.reduce(
    (acc, item) => {
      acc.boxes += parseFloat(item.quantity_boxes || 0)
      acc.pcs += parseFloat(item.quantity_shipped || 0)
      acc.woodM3 += calculateWoodTotal(item)
      acc.volumeM3 += calculateVolumeTotal(item)
      acc.nett += calculateNettTotal(item)
      acc.gross += calculateGrossTotal(item)
      return acc
    },
    { boxes: 0, pcs: 0, woodM3: 0, volumeM3: 0, nett: 0, gross: 0 },
  )
})
const formatDisplayDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
const formatDisplayDateFull = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date
    .toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })
    .toUpperCase()
}
const formatNumber = (value) => {
  if (!value && value !== 0) return 0
  return parseFloat(Number(value).toFixed(0))
}
const formatDecimal = (value, decimals = 4) => {
  if (!value && value !== 0) return '0.' + '0'.repeat(decimals)
  return parseFloat(Number(value).toFixed(decimals))
}
onMounted(() => {
  fetchDeliveryOrder()
})
</script>
<style scoped>
/* ========================================
   PRINT PAGE CONTAINER & CONTROLS
   ======================================== */
.print-page-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem;
  background: #f5f5f5;
  min-height: 100vh;
}

.print-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.btn-back,
.btn-print {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  font-size: 1.1rem;
}

.btn-back {
  background: #6c757d;
  color: white;
}

.btn-back:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.btn-print {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
}

.btn-print:hover {
  background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
  transform: translateY(-1px);
}

/* ========================================
   LOADING STATE
   ======================================== */
.loading-container-print {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.spinner-form {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top-color: #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text-form {
  margin-top: 1rem;
  color: #6c757d;
  font-size: 0.95rem;
  font-weight: 500;
}

/* ========================================
   PRINT SHEET A4
   ======================================== */
.print-sheet-a4 {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  background: #fff;
  font-family: 'Arial', 'Helvetica', sans-serif;
  font-size: 11px;
  line-height: 1.5;
  padding: 8mm 10mm;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: #000;
}

/* ========================================
   TITLE SECTION
   ======================================== */
.title-main {
  text-align: center;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 2.5px solid #000;
}

.title-packing {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 3px;
  color: #000;
  margin-bottom: 6px;
}

.title-meta {
  display: flex;
  justify-content: center;
  gap: 3rem;
  font-size: 11px;
  font-weight: 700;
  color: #000;
}

/* ========================================
   HEADER TABLE
   ======================================== */
.header-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
  margin-top: 10px;
  font-size: 10px;
}

.header-table td {
  padding: 5px 7px;
  border: 1.2px solid #000;
  vertical-align: top;
  line-height: 1.4;
}

.header-label {
  width: 18%;
  font-weight: 700;
  background: #f5f5f5;
  color: #000;
}

.header-value {
  width: 32%;
  color: #000;
  font-weight: 500;
  white-space: pre-line;
}

/* ========================================
   PACKING LIST TABLE
   ======================================== */
.table-print-packing {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
  font-size: 10px;
}

.table-print-packing thead {
  background: #e0e0e0;
  font-weight: bold;
}

.table-print-packing th,
.table-print-packing td {
  border: 1.2px solid #000;
  padding: 6px 5px;
  text-align: center;
  vertical-align: middle;
}

.table-print-packing th {
  font-weight: 800;
  color: #000;
  font-size: 9.5px;
  text-transform: uppercase;
}

.table-print-packing td {
  color: #000;
  font-size: 10px;
  font-weight: 500;
}

.text-center {
  text-align: center;
}

.text-center-empty {
  text-align: center;
  padding: 20px !important;
  color: #666;
  font-style: italic;
}

.text-right-bold {
  text-align: right;
  font-weight: 800;
  padding-right: 10px !important;
  color: #000;
}

.text-center-bold {
  text-align: center;
  font-weight: 800;
  background: #f0f0f0;
  color: #000;
}

.total-row td {
  font-weight: 800;
  background: #e8e8e8;
  border-top: 2.5px solid #000;
  padding: 7px 5px !important;
  font-size: 10.5px;
  color: #000;
}

/* ========================================
   FOOTER SECTION - PERBAIKAN UTAMA
   ======================================== */
.footer-info {
  margin-top: 12px;
}

.footer-text {
  font-size: 10px;
  font-weight: 700;
  margin-bottom: 6px;
  color: #000;
  line-height: 1.5;
  letter-spacing: 0.3px;
}

.footer-cert-row {
  font-size: 10px;
  font-weight: 700;
  color: #000;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

.footer-signature-table {
  width: 100%;
  margin: 15px 0;
  font-size: 10px;
  border-collapse: collapse;
}

.footer-signature-table td {
  padding-top: 30px;
  vertical-align: bottom;
  font-weight: 700;
  color: #000;
  line-height: 1.6;
}

/* ========================================
   BARCODE SECTION - LEBIH JELAS
   ======================================== */
.footer-barcode-qr {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 15px;
  margin-bottom: 8px;
}

.kemendag-barcode-img {
  display: block;
  margin: 0 auto;
  max-width: 360px;
  max-height: 130px;
  border: 2px solid #000;
  background: #fff;
  padding: 5px;
}

.barcode-label {
  text-align: center;
  font-size: 11px;
  margin-top: 6px;
  color: #000;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* ========================================
   PRINT OPTIMIZATION
   ======================================== */
@media print {
  body {
    margin: 0;
    padding: 0;
  }

  .print-page-container {
    background: none;
    padding: 0;
  }

  .print-controls {
    display: none !important;
  }

  .print-sheet-a4 {
    width: 210mm;
    min-height: 297mm;
    margin: 0;
    padding: 8mm 10mm;
    box-shadow: none;
    page-break-after: always;
  }

  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .header-table td,
  .table-print-packing th,
  .table-print-packing td {
    border: 1.2px solid #000;
  }

  .kemendag-barcode-img {
    max-width: 350px;
    max-height: 120px;
    border: 2px solid #000;
  }
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media screen and (max-width: 768px) {
  .print-sheet-a4 {
    width: 100%;
    padding: 6mm;
    font-size: 10px;
  }

  .title-packing {
    font-size: 18px;
  }

  .kemendag-barcode-img {
    max-width: 300px;
  }
}
</style>
