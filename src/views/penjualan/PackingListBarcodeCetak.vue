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
    <div v-if="loading || !deliveryOrder" class="loading-container-print">
      <div class="spinner-form"></div>
      <p class="loading-text-form">Memuat data Pengiriman...</p>
    </div>
    <div v-else class="print-sheet-a4">
      <KopSuratCetak />
      <div class="title-main">
        <div class="title-packing">PACKING LIST</div>
        <div class="title-meta">
          <div>NO. : {{ deliveryOrder.do_number }}</div>
          <div>DATE : {{ formatDisplayDateFull(deliveryOrder.delivery_date) }}</div>
        </div>
      </div>
      <table class="header-table">
        <tr>
          <td class="header-label">Shipper</td>
          <td class="header-value" colspan="3">
            <div style="white-space: pre-line">
              PT. SURYA BANGKIT CEMERLANG<br />
              JL.RAYA SEMARANG PURWODADI KM 18<br />
              KARANGAWEN DEMAK 59566<br />
              INDONESIA
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
      <!-- BAGIAN KHUSUS BARCODE SAJA -->
      <div class="footer-info" style="margin-top: 40px">
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
        <div class="footer-barcode-qr" v-if="deliveryOrder.barcode_image">
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
const handlePrint = () => {
  window.print()
}
const goBack = () => {
  router.push({ name: 'DaftarPengiriman' })
}

const formatDisplayDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
const formatDisplayDateFull = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date
    .toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    })
    .toUpperCase()
}
onMounted(() => {
  fetchDeliveryOrder()
})
</script>

<style scoped>
/* ========================================
   1. CONTAINER & TOMBOL (TIDAK DICETAK)
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
  justify-content: center;
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

/* Tombol Secondary (Hijau) untuk Cetak Lampiran */
.btn-secondary {
  background: linear-gradient(135deg, #28a745 0%, #218838 100%);
  color: white;
}
.btn-secondary:hover {
  background: linear-gradient(135deg, #218838 0%, #1e7e34 100%);
}

/* ========================================
   2. LOADING STATE
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
   3. KERTAS A4 (AREA UTAMA)
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
   4. JUDUL & META DATA
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
   5. TABEL HEADER (INFO PENGIRIMAN)
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
   6. TABEL BARANG (PACKING LIST)
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
   7. FOOTER & TANDA TANGAN
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
   8. BARCODE KEMENDAG (PERBAIKAN UTAMA)
   ======================================== */
.footer-barcode-qr {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 15px;
  min-height: 120px; /* Biar ada space */
}

.kemendag-barcode-img {
  display: block;
  /* Agar responsif tapi tidak gepeng */
  max-width: 85%;
  max-height: 300px;
  width: auto;
  height: auto;
  object-fit: contain; /* KUNCI AGAR TIDAK GEPENG */

  /* Kosmetik */
  border: 1px solid #333;
  padding: 5px;
  background: #fff;
}

.barcode-label {
  text-align: center;
  font-size: 11px;
  margin-top: 8px;
  color: #000;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* ========================================
   9. MODE CETAK (PRINT MEDIA)
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

  /* Settingan Barcode Khusus Print */
  .kemendag-barcode-img {
    max-width: 400px !important; /* Ukuran optimal di kertas A4 */
    max-height: 180px !important;
    border: none !important; /* Hilangkan border kotak saat print biar bersih */
  }

  .footer-barcode-qr {
    page-break-inside: avoid; /* Jangan terpotong halaman */
  }
}

/* ========================================
   10. RESPONSIVE MOBILE
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
    max-width: 100%;
    max-height: 150px;
  }
}
</style>
