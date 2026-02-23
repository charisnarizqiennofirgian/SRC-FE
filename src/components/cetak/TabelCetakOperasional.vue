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
  margin-bottom: 20px;
  font-size: 12pt;
  font-family: Calibri, 'Candara', 'Segoe UI', sans-serif;
}

.items-table th,
.items-table td {
  border: 1px solid #000;
  padding: 8px 10px;
  vertical-align: middle;
}

.items-table th {
  background-color: #f2f2f2;
  text-align: center;
  font-weight: 400;
  font-size: 12pt;
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
  font-weight: 400;
}
.total-row td {
  background-color: #ffffff;
}
</style>
```