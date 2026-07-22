<template>
  <div class="print-page-container">
    <!-- ✅ CONTROL PANEL DIPERBAIKI -->
    <div class="print-controls-modern">
      <button @click="goBack" class="btn-control btn-back-modern">
        <span class="btn-icon">↩️</span>
        <span class="btn-text">Kembali</span>
      </button>

      <div class="document-selector-modern">
        <label for="doc-select" class="selector-label">
          <span class="label-icon">📑</span>
          <span class="label-text">Pilih Dokumen:</span>
        </label>
        <select id="doc-select" v-model="selectedDocument" class="form-select-modern">
          <option value="pl">Packing List</option>
          <option value="invoice">Commercial Invoice</option>
          <option value="invoice-barcode">Commercial Invoice Barcode</option>
          <option value="do">Delivery Order (Supir)</option>
          <option value="barcode">Packing List Barcode</option>
          <option value="si">🚢 Shipping Instruction</option>
          <option value="pi">📄 Proforma Invoice (sesuai isi pengiriman ini)</option>
        </select>
      </div>

      <button @click="handlePrint" class="btn-control btn-print-modern">
        <span class="btn-icon">🖨️</span>
        <span class="btn-text">Cetak Dokumen Ini</span>
      </button>
    </div>

    <div v-if="loading || !deliveryOrder" class="loading-container-print">
      <div class="spinner-form"></div>
      <p class="loading-text-form">Memuat data...</p>
    </div>

    <div v-else class="print-sheet-a4">
      <KopSuratCetak />

      <!-- ✅ KONDISI HEADER: Sembunyikan header panjang kalau pilih SI atau DO -->
      <div v-if="selectedDocument !== 'do' && selectedDocument !== 'si'">
        <div
          v-if="['pl', 'barcode', 'invoice', 'invoice-barcode'].includes(selectedDocument)"
          class="title-main"
        >
          <div class="title-packing">
            {{ isInvoiceDocument ? 'COMMERCIAL INVOICE' : 'PACKING LIST' }}
          </div>
          <div class="title-meta">
            <div>NO. : {{ isInvoiceDocument ? commercialInvoiceNumber : packingListNumber }}</div>
            <div>DATE : {{ formatDisplayDateFull(deliveryOrder.delivery_date) }}</div>
          </div>
        </div>

        <table class="header-table">
          <tbody>
          <tr>
            <td class="header-label">Shipper</td>
            <td class="header-value" colspan="3">
              <div style="white-space: pre-line; font-weight: bold">
                PT. SURYA BANGKIT CEMERLANG JL. RAYA SEMARANG PURWODADI KM 18 KARANGAWEN DEMAK 59566
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
            <td class="header-value" colspan="3">
              {{ formatDisplayDate(deliveryOrder.rex_date) }}
            </td>
          </tr>
          <tr>
            <td class="header-label">Goods</td>
            <td class="header-value" colspan="7">
              {{ deliveryOrder.goods_description || 'TEAK GARDEN FURNITURE AND ACCESSORIES' }}
            </td>
          </tr>
          </tbody>
        </table>

        <hr style="border: 1px solid #000; margin: 15px 0" />
      </div>

      <!-- ✅ TEMPLATE ROUTING -->
      <div v-if="selectedDocument === 'pl'">
        <TemplatePackingList :data="deliveryOrder" />
      </div>

      <div v-if="selectedDocument === 'invoice'">
        <TemplateCommercialInvoice :data="deliveryOrder" />
      </div>

      <div v-if="selectedDocument === 'invoice-barcode'">
        <TemplateCommercialInvoiceBarcode :data="deliveryOrder" />
      </div>

      <div v-if="selectedDocument === 'do'">
        <TemplateDeliveryOrder :data="deliveryOrder" />
      </div>

      <!-- ✅ TEMPLATE SHIPPING INSTRUCTION BARU -->
      <div v-if="selectedDocument === 'si'">
        <TemplateShippingInstruction :data="deliveryOrder" />
      </div>

      <!-- Footer tetap untuk PL & Barcode -->
      <div
        v-if="selectedDocument === 'pl' || selectedDocument === 'barcode'"
        class="footer-section"
      >
        <div class="footer-columns">
          <div class="footer-col">
            <div class="applicant-label">MADE OUT TO APPLICANT:</div>
            <div class="applicant-name">{{ deliveryOrder.applicant_info?.name || '-' }}</div>
            <div class="applicant-address">{{ deliveryOrder.applicant_info?.address || '' }}</div>
            <div v-if="isEthimoBuyer" class="fsc-label">FSC100%: SA-COC-012797</div>
          </div>

          <div class="footer-col footer-col-signature">
            <SignatureCompany />
          </div>
        </div>

        <div
          v-if="selectedDocument === 'barcode'"
          class="barcode-footer-section"
          style="margin-top: 20px"
        >
          <div class="barcode-wrapper" style="text-align: center">
            <img
              v-if="deliveryOrder.barcode_image"
              :src="deliveryOrder.barcode_image"
              alt="Barcode Kemendag"
              class="barcode-img"
              style="max-width: 80%; max-height: 300px; object-fit: contain"
            />
            <div v-else class="empty-state" style="color: red; font-style: italic">
              ⚠️ Gambar Barcode belum di-upload di form pengiriman.
            </div>
          </div>

          <div
            v-if="deliveryOrder.sipk_number"
            class="sipk-label"
            style="text-align: center; font-weight: bold; margin-top: 5px"
          >
            No. SIPK: {{ deliveryOrder.sipk_number }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import { useToast } from 'vue-toastification'
import KopSuratCetak from '../../components/cetak/KopSuratCetak.vue'
import SignatureCompany from '../../components/cetak/SignatureCompany.vue'

// ✅ IMPORT TEMPLATE ANAK
import TemplatePackingList from './templates/TemplatePackingList.vue'
import TemplateDeliveryOrder from './templates/TemplateDeliveryOrder.vue'
import TemplateCommercialInvoice from './templates/TemplateCommercialInvoice.vue'
import TemplateCommercialInvoiceBarcode from './templates/TemplateCommercialInvoiceBarcode.vue'
import TemplateShippingInstruction from './templates/TemplateShippingInstruction.vue' // ✅ BARU

const route = useRoute()
const router = useRouter()
const toast = useToast()

const loading = ref(true)
const deliveryOrder = ref(null)
const doId = ref(route.params.id)
const selectedDocument = ref('pl')

// Nomor DO (DO-2026-07-0001) dipakai sebagai nomor Packing List / Commercial Invoice,
// cuma prefiksnya diganti PL-/CI- khusus di masing-masing dokumen — nomor DO asli tetap
// dipakai di dokumen lain (Delivery Order/Supir, Shipping Instruction, dst).
const packingListNumber = computed(() => {
  const doNumber = deliveryOrder.value?.do_number || ''
  return doNumber.replace(/^DO/, 'PL')
})

const commercialInvoiceNumber = computed(() => {
  const doNumber = deliveryOrder.value?.do_number || ''
  return doNumber.replace(/^DO/, 'CI')
})

const isInvoiceDocument = computed(() =>
  selectedDocument.value === 'invoice' || selectedDocument.value === 'invoice-barcode',
)

// Klaim sertifikasi FSC cuma ditampilkan untuk buyer Ethimo — buyer lain tidak
// mensyaratkan/tidak boleh mencantumkan klaim ini di dokumen ekspor.
const isEthimoBuyer = computed(() =>
  (deliveryOrder.value?.buyer?.name || '').toLowerCase().includes('ethimo'),
)

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

// "Proforma Invoice" bukan template inline di halaman ini — dokumennya beda layout
// (ProformaInvoiceCetak.vue). Pilih opsi ini langsung pindah ke halaman itu, dengan
// do_id supaya daftar barangnya ikut isi pengiriman ini (bisa gabungan lintas SO),
// bukan seluruh isi SO aslinya.
watch(selectedDocument, (val) => {
  if (val === 'pi' && deliveryOrder.value) {
    router.push({
      name: 'ProformaInvoice',
      params: { id: deliveryOrder.value.sales_order_id },
      query: { do_id: deliveryOrder.value.id },
    })
  }
})

const goBack = () => {
  router.push({ name: 'DaftarPengiriman' })
}

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

onMounted(() => {
  fetchDeliveryOrder()
})
</script>

<style scoped>
/* ========================================
   CONTAINER & BACKGROUND
   ======================================== */
.print-page-container {
  width: 100%;
  min-height: 100vh;
  background: #eef1f5;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ========================================
   CONTROL PANEL — flat, rapi
   ======================================== */
.print-controls-modern {
  width: 100%;
  max-width: 210mm;
  background: #fff;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  border-radius: 10px;
  border: 1px solid #dde1e6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* BUTTON CONTROL */
.btn-control {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border: 1px solid transparent;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-icon {
  font-size: 1rem;
  line-height: 1;
}

.btn-text {
  font-weight: 600;
}

/* BUTTON BACK */
.btn-back-modern {
  background: #fff;
  color: #495057;
  border-color: #ced4da;
}

.btn-back-modern:hover {
  background: #f1f3f5;
  border-color: #adb5bd;
}

/* BUTTON PRINT */
.btn-print-modern {
  background: #2563eb;
  color: #fff;
}

.btn-print-modern:hover {
  background: #1d4ed8;
}

/* ========================================
   DOCUMENT SELECTOR
   ======================================== */
.document-selector-modern {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.selector-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  color: #495057;
  font-size: 0.875rem;
  white-space: nowrap;
}

.label-icon {
  font-size: 1.1rem;
}

.label-text {
  font-weight: 600;
}

/* SELECT DROPDOWN */
.form-select-modern {
  flex: 1;
  min-width: 0;
  padding: 0.6rem 0.85rem;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  color: #212529;
  cursor: pointer;
  transition: border-color 0.15s ease;
  background: #fff;
}

.form-select-modern:hover {
  border-color: #adb5bd;
}

.form-select-modern:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

/* ========================================
   LOADING STATE
   ======================================== */
.loading-container-print {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 3rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #dde1e6;
  margin-top: 24px;
}

.spinner-form {
  width: 48px;
  height: 48px;
  border: 5px solid #e9ecef;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text-form {
  margin: 0;
  color: #495057;
  font-size: 1.125rem;
  font-weight: 700;
}

/* ========================================
   PRINT SHEET A4
   ======================================== */
.print-sheet-a4 {
  width: 210mm;
  min-height: 297mm;
  background: #fff;
  padding: 8mm 10mm;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.25);
  font-family: 'Arial', 'Helvetica', sans-serif;
  font-size: 9px;
  line-height: 1.3;
  color: #000;
  margin-bottom: 30px;
  box-sizing: border-box;
  border-radius: 8px;
}

/* ========================================
   DOCUMENT COMPONENTS
   ======================================== */
.title-main {
  text-align: center;
  margin: 10px 0 12px 0;
  padding-bottom: 10px;
  border-bottom: 2.5px solid #000;
}

.title-packing {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 2.5px;
  color: #000;
  margin: 0 0 8px 0;
  text-transform: uppercase;
}

.title-meta {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1.5px solid #dee2e6;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
}

.header-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  margin-bottom: 12px;
  font-size: 9.5px; /* sedikit lebih besar */
  font-weight: 600;
}

.header-table td {
  padding: 4px 6px;
  border: 1.8px solid #000; /* garis sedikit lebih tebal */
  vertical-align: top;
  line-height: 1.4;
  overflow-wrap: break-word;
  word-break: break-word;
}

.header-label {
  width: 18%;
  font-weight: 900; /* seperti header tabel PL/Invoice */
  background: #f0f0f0;
  color: #000;
  text-transform: uppercase;
}

.header-value {
  width: 32%;
  font-weight: 600; /* sedikit ditebalkan */
  color: #000;
}

/* ========================================
   FOOTER — APPLICANT & SIGNATURE
   ======================================== */
.footer-columns {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 40px;
  margin-top: 25px;
}

.footer-col {
  flex: 1 1 0;
  font-size: 10px;
  line-height: 1.5;
}

.applicant-label {
  font-weight: 700;
  text-decoration: underline;
  margin-bottom: 4px;
}

.applicant-name {
  font-weight: 700;
}

.applicant-address {
  font-weight: 400;
  margin-bottom: 10px;
}

.fsc-label {
  font-weight: 700;
}

/* ========================================
   BARCODE FOOTER
   ======================================== */
.barcode-footer-section {
  margin-top: 30px;
  text-align: right;
}

.barcode-wrapper {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  margin-top: 20px;
  margin-bottom: 20px;
  min-height: 150px;
}

.barcode-img {
  display: block;
  max-width: 45%;
  max-height: 250px;
  width: auto;
  height: auto;
  object-fit: contain;
  border: 1px solid #333;
  padding: 8px;
}

.empty-state {
  color: red;
  font-style: italic;
  border: 1px dashed red;
  padding: 20px;
  text-align: center;
  width: 50%;
  margin-left: auto;
}

.sipk-label {
  text-align: right;
  font-weight: bold;
  font-size: 10px;
  margin-top: 8px;
}

/* ========================================
   PRINT MODE
   ======================================== */
@media print {
  @page {
    size: A4 portrait;
    margin: 8mm;
  }

  .print-page-container {
    width: 100% !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
    background-image: none !important;
    display: block !important;
  }

  .print-controls-modern,
  .loading-container-print {
    display: none !important;
  }

  .print-sheet-a4 {
    width: 100%;
    max-width: 210mm;
    margin: 0 auto !important;
    padding: 6mm 8mm;
    box-shadow: none !important;
    box-sizing: border-box;
    border-radius: 0 !important;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .header-table td {
    border: 1.5px solid #000 !important;
    padding: 3px 5px !important;
  }

  table {
    page-break-inside: avoid;
  }

  .print-sheet-a4 {
    font-size: 8.5px !important;
  }

  .header-table {
    font-size: 8px !important;
  }
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media screen and (max-width: 768px) {
  .print-page-container {
    padding: 1rem 0.75rem;
  }

  .print-controls-modern {
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
  }

  .document-selector-modern {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .selector-label {
    justify-content: center;
  }

  .btn-control {
    width: 100%;
    min-width: auto;
  }

  .print-sheet-a4 {
    width: 100%;
    padding: 6mm;
  }
}
</style>
