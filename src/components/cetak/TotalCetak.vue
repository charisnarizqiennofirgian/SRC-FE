<template>
  <section class="invoice-summary">
    <div class="totals">
      <table>
        <tr>
          <td>Sub Total</td>
          <td>{{ formatCurrency(po.subtotal) }}</td>
        </tr>
        <tr>
          <td>PPN {{ displayPPN }}%</td>
          <td>{{ formatCurrency(po.ppn_amount) }}</td>
        </tr>
        <tr class="grand-total">
          <td>Total</td>
          <td>{{ formatCurrency(po.grand_total) }}</td>
        </tr>
      </table>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['po'])

// Jika ppn_percentage = 11.12 → tampilkan "12", hitung tetap 11%
const displayPPN = computed(() => {
  const val = parseFloat(props.po.ppn_percentage)
  if (val === 11.12) return '12'
  return Number.isInteger(val) ? val : val
})

const formatCurrency = (value) => {
  if (value == null || isNaN(value)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}
</script>

<style scoped>
.invoice-summary {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
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
}
</style>
