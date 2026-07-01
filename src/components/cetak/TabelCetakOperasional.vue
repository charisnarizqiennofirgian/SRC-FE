<template>
  <table class="items-table">
    <thead>
      <tr>
        <th>No</th>
        <th>{{ isForeign ? 'Description' : 'Nama Barang' }}</th>
        <th>Qty</th>
        <th>{{ isForeign ? 'Unit' : 'Satuan' }}</th>
        <th>{{ isUSD ? 'Unit Price (USD)' : isEUR ? 'Unit Price (EUR)' : 'Harga Satuan' }}</th>
        <th>{{ isUSD ? 'Amount (USD)' : isEUR ? 'Amount (EUR)' : 'Jumlah' }}</th>
        <th>{{ isForeign ? 'Delivery Date' : 'Tanggal Kirim' }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in details" :key="item.id">
        <td class="center">{{ index + 1 }}</td>
        <td>{{ item.item.name }}</td>
        <td class="right">{{ parseFloat(item.quantity_ordered) }}</td>
        <td class="center">{{ item.item.unit.name }}</td>
        <td class="right">
          <template v-if="isForeign">
            {{ foreignSymbol }} {{ formatForeign(item.price) }}
          </template>
          <template v-else>
            {{ formatCurrency(item.price) }}
          </template>
        </td>
        <td class="right">
          <template v-if="isForeign">{{ foreignSymbol }} {{ formatForeign(item.price * item.quantity_ordered) }}</template>
          <template v-else>{{ formatCurrency(item.subtotal) }}</template>
        </td>
        <td class="center">{{ po.delivery_date ? formatTanggal(po.delivery_date) : '-' }}</td>
      </tr>

      <!-- Total Rows -->
      <tr class="total-row">
        <td></td>
        <td colspan="4" class="left bold">Sub Total</td>
        <td class="right bold">
          <template v-if="isForeign">{{ foreignSymbol }} {{ formatForeign(subTotalForeign) }}</template>
          <template v-else>{{ formatCurrency(subTotal) }}</template>
        </td>
        <td></td>
      </tr>
      <tr v-if="ppnRate > 0" class="total-row">
        <td></td>
        <td colspan="4" class="left bold">{{ isForeign ? 'VAT' : 'PPN' }} {{ ppnRate }}%</td>
        <td class="right bold">
          <template v-if="isForeign">{{ foreignSymbol }} {{ formatForeign(ppnForeign) }}</template>
          <template v-else>{{ formatCurrency(ppn) }}</template>
        </td>
        <td></td>
      </tr>
      <tr class="total-row">
        <td></td>
        <td colspan="4" class="left bold">{{ isUSD ? 'Grand Total (USD)' : isEUR ? 'Grand Total (EUR)' : 'Total' }}</td>
        <td class="right bold">
          <template v-if="isForeign">{{ foreignSymbol }} {{ formatForeign(grandTotalForeign) }}</template>
          <template v-else>{{ formatCurrency(grandTotal) }}</template>
        </td>
        <td></td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps(['details', 'po'])

const isUSD = computed(() => props.po?.currency === 'USD')
const isEUR = computed(() => props.po?.currency === 'EUR')
const isForeign = computed(() => isUSD.value || isEUR.value)
const foreignSymbol = computed(() => isEUR.value ? '€' : '$')

const subTotal = computed(() => {
  return props.details.reduce((acc, item) => acc + parseFloat(item.subtotal || 0), 0)
})

// Foreign currency totals: sum price × qty (in USD/EUR)
const subTotalForeign = computed(() => {
  return props.details.reduce((acc, item) => acc + parseFloat(item.price || 0) * parseFloat(item.quantity_ordered || 0), 0)
})

const ppnRate = computed(() => {
  const raw = parseFloat(props.po?.ppn_percentage ?? 0)
  return raw === 11.12 ? 11 : raw
})

const ppn = computed(() => subTotal.value * (ppnRate.value / 100))
const grandTotal = computed(() => subTotal.value + ppn.value)
const ppnForeign = computed(() => subTotalForeign.value * (ppnRate.value / 100))
const grandTotalForeign = computed(() => subTotalForeign.value + ppnForeign.value)

const formatCurrency = (value) => {
  if (isNaN(value)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatForeign = (value) => {
  if (isNaN(value)) return '0.00'
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 }).format(value)
}

const formatTanggal = (tanggal) => {
  if (!tanggal) return '-'
  const locale = isForeign.value ? 'en-US' : 'id-ID'
  return new Date(tanggal).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<style scoped>
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

.center { text-align: center; }
.right  { text-align: right; }
.left   { text-align: left; }
.bold   { font-weight: 700; }
.total-row td { background-color: #f0f0f0; }
</style>
