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
      <!-- Total Rows -->
      <tr class="total-row">
        <td></td>
        <td colspan="6" class="left bold">Sub Total</td>
        <td class="right bold">{{ formatCurrency(subTotal) }}</td>
      </tr>
      <tr class="total-row">
        <td></td>
        <td colspan="6" class="left bold">Ppn 11%</td>
        <td class="right bold">{{ formatCurrency(ppn) }}</td>
      </tr>
      <tr class="total-row">
        <td></td>
        <td colspan="6" class="left bold">Total</td>
        <td class="right bold">{{ formatCurrency(grandTotal) }}</td>
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
</script>

<style scoped>
.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  font-size: 14px;
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
  font-weight: 700;
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
  font-weight: bold;
}
.total-row td {
  background-color: #ffffff;
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
