<template>
  <table class="items-table">
    <thead>
      <tr>
        <th>No</th>
        <th>Invoice Size (P x L x T)</th>
        <th>Cutting Size (P x L x T)</th>

        <th>Keterangan</th>

        <th>Qty (Batang)</th>
        <th>Kubikasi (m³)</th>
        <th>Harga Satuan</th>
        <th>Jumlah</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in details" :key="item.id">
        <td class="center">{{ index + 1 }}</td>
        <td class="center">
          {{ item.specifications.invoice_p }} x {{ item.specifications.invoice_l }} x
          {{ item.specifications.invoice_t }}
        </td>
        <td class="center">
          {{ item.specifications.cutting_p }} x {{ item.specifications.cutting_l }} x
          {{ item.specifications.cutting_t }}
        </td>

        <td class="center">
          <span v-if="item.specifications.is_manual_price" class="badge badge-mall"> MALL </span>
          <span v-else class="badge badge-rst"> RST </span>
        </td>

        <td class="right">{{ parseFloat(item.quantity_ordered) }}</td>
        <td class="right">{{ parseFloat(item.specifications.kubikasi) }}</td>
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

/* ✅ CSS BARU UNTUK BADGE KETERANGAN */
.badge {
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 10px;
  color: white;
}
.badge-mall {
  background-color: #f59e0b; /* Kuning/Oranye */
}
.badge-rst {
  background-color: #10b981; /* Hijau */
}
</style>
