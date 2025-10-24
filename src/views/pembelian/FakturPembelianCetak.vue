<template>
  <div class="print-container">
    <div v-if="loading" class="loading-state">
      <p>Memuat data untuk dicetak...</p>
    </div>

    <div v-else-if="faktur" class="invoice-box">
      <KopSuratCetak :poNumber="faktur.bill_number" />

      <div class="po-title-section">
        <h2 class="po-title">FAKTUR PEMBELIAN (INVOICE)</h2>
        <p class="po-number-line">No. Faktur Internal: {{ faktur.bill_number }}</p>
        <p class="po-number-line">No. Faktur Supplier: {{ faktur.supplier_invoice_number }}</p>
        <p class="po-number-line" v-if="faktur.goods_receipt">
          Ref. Penerimaan: {{ faktur.goods_receipt.gr_number }}
        </p>
      </div>

      <section class="invoice-info">
        <p class="date-line">Demak, {{ formatTanggal(faktur.bill_date) }}</p>
        <div class="info-supplier">
          <p>Tagihan Dari Yth.</p>
          <p class="supplier-name">{{ faktur.supplier.name }}</p>
          <p>{{ faktur.supplier.address_city || faktur.supplier.address }}</p>
        </div>
        <p class="intro-text">Dengan hormat,</p>
        <p>Berikut adalah rincian tagihan atas barang yang telah kami terima:</p>
      </section>

      <!-- TABEL DETAIL BARANG -->
      <table class="items-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Barang</th>
            <th>Qty</th>
            <th>Satuan</th>
            <th>Harga Satuan</th>
            <th>Jumlah</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in faktur.details" :key="item.id">
            <td class="center">{{ index + 1 }}</td>
            <td>{{ item.item?.name || 'N/A' }}</td>
            <td class="right">{{ parseFloat(item.quantity) }}</td>
            <td class="center">{{ item.item?.unit?.name || '' }}</td>
            <td class="right">{{ formatCurrency(item.price) }}</td>
            <td class="right">{{ formatCurrency(item.subtotal) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- TOTAL SECTION -->
      <section class="invoice-summary">
        <div class="totals">
          <table>
            <tr>
              <td>Sub Total</td>
              <td>{{ formatCurrency(faktur.subtotal) }}</td>
            </tr>
            <tr>
              <td>PPN {{ formatPercentage(faktur.ppn_percentage) }}%</td>
              <td>{{ formatCurrency(faktur.ppn_amount) }}</td>
            </tr>
            <tr class="grand-total">
              <td>Total</td>
              <td>{{ formatCurrency(faktur.total_amount) }}</td>
            </tr>
          </table>
        </div>
      </section>

      <!-- FOOTER -->
      <FooterOperasional />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '../../api/axios'
import KopSuratCetak from '@/components/cetak/KopSuratCetak.vue'
import FooterOperasional from '@/components/cetak/FooterOperasional.vue'

const route = useRoute()
const loading = ref(true)
const faktur = ref(null)

const fetchFakturDetail = async () => {
  try {
    const fakturId = route.params.id
    const response = await apiClient.get(
      `/purchase-bills/${fakturId}?include=supplier,details.item.unit,goodsReceipt`,
    )
    faktur.value = response.data.data
    console.log('Faktur Data:', faktur.value)
  } catch (error) {
    console.error('Gagal memuat detail Faktur:', error)
  } finally {
    loading.value = false
  }
}

const formatTanggal = (tanggal) => {
  if (!tanggal) return ''
  return new Date(tanggal).toLocaleDateString('id-ID', {
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
  margin: 20px auto;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.invoice-box {
  padding: 15mm;
  font-family: Arial, sans-serif;
  font-size: 12px;
  line-height: 1.5;
  color: #333;
}

.po-title-section {
  text-align: center;
  margin: 20px 0 25px 0;
  padding-bottom: 15px;
}

.po-title {
  font-size: 16px;
  font-weight: 900;
  margin: 0 0 3px 0;
  text-decoration: underline;
  letter-spacing: 0.8px;
  color: #000;
}

.po-number-line {
  font-size: 11px;
  margin: 0;
  font-weight: 600;
  font-style: italic;
  color: #000;
}

.invoice-info {
  margin-top: 0;
  margin-bottom: 20px;
}

.date-line {
  text-align: right;
  margin-bottom: 20px;
  font-size: 11px;
  font-weight: 600;
}

.info-supplier {
  margin-bottom: 20px;
}

.info-supplier p {
  margin: 0 0 3px 0;
  line-height: 1.4;
  font-size: 11px;
}

.info-supplier .supplier-name {
  font-weight: 700;
  text-decoration: underline;
}

.intro-text {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 11px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  font-size: 11px;
}

.items-table th,
.items-table td {
  border: 1px solid #000;
  padding: 5px 7px;
  vertical-align: top;
}

.items-table th {
  background-color: #fff;
  text-align: center;
  font-weight: 700;
  font-size: 10px;
}

.items-table .center {
  text-align: center;
}

.items-table .right {
  text-align: right;
}

.invoice-summary {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  margin-bottom: 20px;
  page-break-inside: avoid;
}

.totals {
  width: 45%;
}

.totals table {
  width: 100%;
  border-collapse: collapse;
}

.totals td {
  border: 1px solid #000;
  padding: 4px 8px;
  text-align: right;
  font-size: 12px;
}

.totals td:first-child {
  text-align: left;
  font-weight: bold;
  background-color: #f2f2f2;
}

.totals .grand-total td {
  font-weight: bold;
  font-size: 14px;
  background-color: #e8e8e8;
}

@media print {
  body,
  .print-container {
    margin: 0;
    padding: 0;
    background: white;
    box-shadow: none;
  }

  .invoice-box {
    padding: 10mm;
  }

  .po-title {
    font-size: 15px;
  }

  .po-number-line {
    font-size: 10px;
  }

  .date-line,
  .info-supplier p,
  .intro-text {
    font-size: 10px;
  }

  .items-table {
    font-size: 10px;
  }

  .items-table th {
    font-size: 9px;
  }
}
</style>
