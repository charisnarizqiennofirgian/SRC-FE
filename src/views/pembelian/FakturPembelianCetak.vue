<template>
  <div class="print-container">
    <div v-if="loading" class="loading-state">
      <p>Memuat data untuk dicetak...</p>
    </div>

    <div v-else-if="faktur" class="invoice-box">
      <PrintKopWrapper>

      <div class="po-title-section">
        <h2 class="po-title">{{ isForeign ? 'PURCHASE INVOICE' : 'FAKTUR PEMBELIAN (INVOICE)' }}</h2>
        <p class="po-number-line">{{ isForeign ? 'Internal Invoice No.' : 'No. Faktur Internal' }}: {{ faktur.bill_number }}</p>
        <p class="po-number-line">{{ isForeign ? 'Supplier Invoice No.' : 'No. Faktur Supplier' }}: {{ faktur.supplier_invoice_number }}</p>
        <p class="po-number-line" v-if="faktur.goods_receipt">
          {{ isForeign ? 'Ref. Receipt' : 'Ref. Penerimaan' }}: {{ faktur.goods_receipt.gr_number }}
        </p>
      </div>

      <section class="invoice-info">
        <p class="date-line">Demak, {{ formatTanggal(faktur.bill_date) }}</p>
        <div class="info-supplier">
          <p>{{ isForeign ? 'Bill From:' : 'Tagihan Dari Yth.' }}</p>
          <p class="supplier-name">{{ faktur.supplier.name }}</p>
          <p>{{ faktur.supplier.address_city || faktur.supplier.address }}</p>
        </div>



        <p v-if="!isForeign" class="intro-text">Dengan hormat,</p>
        <p v-if="!isForeign">Berikut adalah rincian tagihan atas barang yang telah kami terima:</p>
        <p v-if="isForeign" class="intro-text">Please find below the details of the invoice for goods received:</p>
      </section>

      <!-- TABEL DETAIL BARANG -->
      <table class="items-table">
        <thead>
          <tr>
            <th>No</th>
            <th>{{ isForeign ? 'Description' : 'Nama Barang' }}</th>
            <th>Qty</th>
            <th>{{ isForeign ? 'Unit' : 'Satuan' }}</th>
            <th>{{ isForeign ? `Unit Price (${foreignCurrencyCode})` : 'Harga Satuan' }}</th>
            <th v-if="isForeign">Unit Price (IDR)</th>
            <th>{{ isForeign ? 'Amount (IDR)' : 'Jumlah' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in faktur.details" :key="item.id">
            <td class="center">{{ index + 1 }}</td>
            <td>{{ item.item?.name || 'N/A' }}</td>
            <td class="right">{{ parseFloat(item.quantity) }}</td>
            <td class="center">{{ item.item?.unit?.name || '' }}</td>
            <td class="right">
              <template v-if="isForeign">{{ foreignSymbol }} {{ formatForeign(item.price) }}</template>
              <template v-else>{{ formatCurrency(item.price) }}</template>
            </td>
            <td v-if="isForeign" class="right">{{ formatCurrency(item.price * exchangeRate) }}</td>
            <td class="right">{{ formatCurrency(item.subtotal) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- TOTAL SECTION -->
      <section class="invoice-summary">
        <div class="totals">
          <table>
            <tbody>
            <tr>
              <td>{{ isUSD ? 'Sub Total' : 'Sub Total' }}</td>
              <td>{{ formatCurrency(faktur.subtotal) }}</td>
            </tr>
            <tr>
              <td>{{ isForeign ? 'VAT' : 'PPN' }} {{ formatPercentage(faktur.ppn_percentage) }}%</td>
              <td>{{ formatCurrency(faktur.ppn_amount) }}</td>
            </tr>
            <tr class="grand-total">
              <td>{{ isForeign ? 'Grand Total (IDR)' : 'Total' }}</td>
              <td>{{ formatCurrency(faktur.total_amount) }}</td>
            </tr>
            <tr v-if="isForeign" class="exchange-row">
              <td>Exchange Rate</td>
              <td>1 {{ foreignCurrencyCode }} = {{ formatCurrency(faktur.exchange_rate) }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- FOOTER -->
      <FooterOperasional :isForeign="isForeign" />
      </PrintKopWrapper>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '../../api/axios'
import PrintKopWrapper from '@/components/cetak/PrintKopWrapper.vue'
import FooterOperasional from '@/components/cetak/FooterOperasional.vue'

const route = useRoute()
const loading = ref(true)
const faktur = ref(null)

const isUSD = computed(() => faktur.value?.currency === 'USD')
const isEUR = computed(() => faktur.value?.currency === 'EUR')
const isForeign = computed(() => isUSD.value || isEUR.value)
const foreignSymbol = computed(() => isEUR.value ? '€' : '$')
const foreignCurrencyCode = computed(() => faktur.value?.currency ?? 'USD')
const exchangeRate = computed(() => parseFloat(faktur.value?.exchange_rate ?? 1))

const fetchFakturDetail = async () => {
  try {
    const fakturId = route.params.id
    const response = await apiClient.get(
      `/purchase-bills/${fakturId}?include=supplier,details.item.unit,goodsReceipt`,
    )
    faktur.value = response.data.data
  } catch (error) {
    console.error('Gagal memuat detail Faktur:', error)
  } finally {
    loading.value = false
  }
}

const formatTanggal = (tanggal) => {
  if (!tanggal) return ''
  const locale = isForeign.value ? 'en-US' : 'id-ID'
  return new Date(tanggal).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const formatCurrency = (value) => {
  if (value == null || isNaN(value)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatForeign = (value) => {
  if (value == null || isNaN(value)) return '0.00'
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 }).format(value)
}

const formatPercentage = (value) => {
  if (value == null || isNaN(value)) return '0'
  return parseInt(value)
}

onMounted(async () => {
  await fetchFakturDetail()
  if (faktur.value) {
    await nextTick()
    window.print()
  } else {
    alert('Data Faktur tidak ditemukan atau gagal dimuat.')
  }
})
</script>

<style>
body {
  background-color: #f0f0f0;
}

.print-container {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.invoice-box {
  padding: 15mm 18mm 10mm 18mm;
  font-family: 'Times New Roman', Times, serif;
  font-size: 10pt;
  line-height: 1.4;
  color: #000;
}

.po-title-section {
  text-align: center;
  margin: 5mm 0 4mm 0;
  padding-bottom: 3mm;
  border-bottom: 1pt solid #000;
}

.po-title {
  font-family: 'Times New Roman', Times, serif;
  font-size: 13pt;
  font-weight: 900;
  margin: 0 0 1mm 0;
  text-decoration: underline;
  letter-spacing: 0.5pt;
  color: #000;
}

.po-number-line {
  font-family: 'Times New Roman', Times, serif;
  font-size: 10pt;
  margin: 0.5mm 0 0 0;
  font-weight: 600;
  font-style: italic;
  color: #000;
}

.invoice-info {
  margin: 4mm 0;
}

.date-line {
  text-align: left;
  margin-bottom: 3mm;
  font-family: 'Times New Roman', Times, serif;
  font-size: 11pt;
  font-weight: 400;
}

.info-supplier {
  margin-bottom: 3mm;
}

.info-supplier p {
  margin: 0 0 1mm 0;
  line-height: 1.4;
  font-family: 'Times New Roman', Times, serif;
  font-size: 11pt;
}

.info-supplier .supplier-name {
  font-weight: 700;
  text-decoration: underline;
}

.intro-text {
  font-weight: 400;
  margin-bottom: 3mm;
  font-family: 'Times New Roman', Times, serif;
  font-size: 10pt;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 5mm;
  font-size: 10pt;
  font-family: 'Times New Roman', Times, serif;
}

.items-table th,
.items-table td {
  border: 0.75pt solid #000;
  padding: 3pt 5pt;
  vertical-align: top;
}

.items-table th {
  background-color: #f0f0f0;
  text-align: center;
  font-weight: bold;
  font-size: 9pt;
  text-transform: uppercase;
  letter-spacing: 0.3pt;
}

.items-table .center { text-align: center; }
.items-table .right  { text-align: right; }

.invoice-summary {
  display: flex;
  justify-content: flex-end;
  margin-top: 5mm;
  margin-bottom: 5mm;
  page-break-inside: avoid;
}

.totals {
  width: 55%;
}

.totals table {
  width: 100%;
  border-collapse: collapse;
}

.totals td {
  border: 0.75pt solid #000;
  padding: 3pt 5pt;
  text-align: right;
  font-size: 10pt;
  font-family: 'Times New Roman', Times, serif;
}

.totals td:first-child {
  text-align: left;
  font-weight: bold;
  background-color: #f0f0f0;
}

.totals .grand-total td {
  font-weight: bold;
  font-size: 11pt;
  background-color: #e8e8e8;
}

.totals .exchange-row td {
  background-color: #eff6ff;
  font-style: italic;
  font-size: 9pt;
}

@page {
  size: A4 portrait;
  margin: 15mm 20mm;
}

@media print {
  html, body, #app {
    height: auto !important;
    min-height: auto !important;
    overflow: visible !important;
    background: white !important;
  }

  .print-container {
    width: 100% !important;
    min-height: auto !important;
    margin: 0 !important;
    box-shadow: none !important;
    overflow: visible !important;
  }

  .invoice-box {
    padding: 0 !important;
  }
}
</style>
