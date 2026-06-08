<template>
  <table class="items-table">
    <thead>
      <tr>
        <th>No</th>
        <th>{{ isUSD ? 'Description' : 'Nama Barang' }}</th>
        <th>{{ isUSD ? 'Qty' : 'Qty' }}</th>
        <th>{{ isUSD ? 'Unit' : 'Satuan' }}</th>
        <th>{{ isUSD ? 'Unit Price (USD)' : 'Harga Satuan' }}</th>
        <th v-if="isUSD">Unit Price (IDR)</th>
        <th>{{ isUSD ? 'Amount (IDR)' : 'Jumlah' }}</th>
        <th>{{ isUSD ? 'Delivery Date' : 'Tanggal Kirim' }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in details" :key="item.id">
        <td class="center">{{ index + 1 }}</td>
        <td>{{ item.item.name }}</td>
        <td class="right">{{ parseFloat(item.quantity_ordered) }}</td>
        <td class="center">{{ item.item.unit.name }}</td>
        <td class="right">
          <template v-if="isUSD">
            {{ formatUSD(item.price) }}
          </template>
          <template v-else>
            {{ formatCurrency(item.price) }}
          </template>
        </td>
        <td v-if="isUSD" class="right">
          {{ formatCurrency(item.price * exchangeRate) }}
        </td>
        <td class="right">{{ formatCurrency(item.subtotal) }}</td>
        <td class="center">{{ po.delivery_date ? formatTanggal(po.delivery_date) : '-' }}</td>
      </tr>

      <!-- Total Rows -->
      <tr class="total-row">
        <td></td>
        <td :colspan="isUSD ? 5 : 4" class="left bold">{{ isUSD ? 'Sub Total' : 'Sub Total' }}</td>
        <td class="right bold">{{ formatCurrency(subTotal) }}</td>
        <td></td>
      </tr>
      <tr v-if="ppnRate > 0" class="total-row">
        <td></td>
        <td :colspan="isUSD ? 5 : 4" class="left bold">VAT {{ ppnRate }}%</td>
        <td class="right bold">{{ formatCurrency(ppn) }}</td>
        <td></td>
      </tr>
      <tr class="total-row">
        <td></td>
        <td :colspan="isUSD ? 5 : 4" class="left bold">{{ isUSD ? 'Grand Total (IDR)' : 'Total' }}</td>
        <td class="right bold">{{ formatCurrency(grandTotal) }}</td>
        <td></td>
      </tr>
      <tr v-if="isUSD" class="total-row exchange-row">
        <td></td>
        <td :colspan="isUSD ? 5 : 4" class="left bold">Exchange Rate</td>
        <td class="right bold">1 USD = {{ formatCurrency(exchangeRate) }}</td>
        <td></td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps(['details', 'po'])

const isUSD = computed(() => props.po?.currency === 'USD')
const exchangeRate = computed(() => parseFloat(props.po?.exchange_rate ?? 1))

const subTotal = computed(() => {
  return props.details.reduce((acc, item) => acc + parseFloat(item.subtotal || 0), 0)
})

const ppnRate = computed(() => {
  const raw = parseFloat(props.po?.ppn_percentage ?? 0)
  return raw === 11.12 ? 11 : raw
})

const ppn = computed(() => subTotal.value * (ppnRate.value / 100))
const grandTotal = computed(() => subTotal.value + ppn.value)

const formatCurrency = (value) => {
  if (isNaN(value)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatUSD = (value) => {
  if (isNaN(value)) return '$ 0.00'
  return '$ ' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

const formatTanggal = (tanggal) => {
  if (!tanggal) return '-'
  const locale = isUSD.value ? 'en-US' : 'id-ID'
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
.exchange-row td { background-color: #e8f4fd; font-style: italic; }
</style>
