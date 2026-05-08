<template>
  <table class="items-table">
    <thead>
      <tr>
        <th>No</th>
        <th>Nama Barang</th>
        <th>Qty</th>
        <th>Satuan</th>
        <th>Harga Satuan</th>
        <th>Jumlah</th>
        <th>Tanggal Kirim</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in details" :key="item.id">
        <td class="center">{{ index + 1 }}</td>
        <td>{{ item.item.name }}</td>
        <td class="right">{{ parseFloat(item.quantity_ordered) }}</td>
        <td class="center">{{ item.item.unit.name }}</td>
        <td class="right">{{ formatCurrency(item.price) }}</td>
        <td class="right">{{ formatCurrency(item.subtotal) }}</td>
        <td class="center">{{ po.delivery_date ? formatTanggal(po.delivery_date) : '-' }}</td>
      </tr>
      <!-- Total Rows -->
      <tr class="total-row">
        <td></td>
        <td colspan="4" class="left bold">Sub Total</td>
        <td class="right bold">{{ formatCurrency(subTotal) }}</td>
        <td></td>
      </tr>
      <tr class="total-row">
        <td></td>
        <td colspan="4" class="left bold">PPN 11%</td>
        <td class="right bold">{{ formatCurrency(ppn) }}</td>
        <td></td>
      </tr>
      <tr class="total-row">
        <td></td>
        <td colspan="4" class="left bold">Total</td>
        <td class="right bold">{{ formatCurrency(grandTotal) }}</td>
        <td></td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps(['details', 'po'])

const subTotal = computed(() => {
  return props.details.reduce((acc, item) => acc + parseFloat(item.subtotal || 0), 0)
})

const ppn = computed(() => {
  return subTotal.value * 0.11
})

const grandTotal = computed(() => {
  return subTotal.value + ppn.value
})

const formatCurrency = (value) => {
  if (isNaN(value)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatTanggal = (tanggal) => {
  if (!tanggal) return '-'
  return new Date(tanggal).toLocaleDateString('id-ID', {
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

.center {
  text-align: center;
}
.right {
  text-align: right;
}
.left {
  text-align: left;
}
.bold {
  font-weight: 700;
}
.total-row td {
  background-color: #f0f0f0;
}
</style>