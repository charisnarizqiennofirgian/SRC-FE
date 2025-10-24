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
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps(['details'])
const formatCurrency = (value) => {
  if (isNaN(value)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}
</script>
<style scoped>
.center {
  text-align: center;
}
.right {
  text-align: right;
}
</style>
