<template>
  <div class="invoice-summary">
    <div class="totals">
      <table>
        <tr>
          <td class="bg-light font-bold">Sub Total</td>
          <td class="font-bold">{{ formatCurrency(po.subtotal) }}</td>
        </tr>
        <tr>
          <td class="bg-light font-bold">PPN {{ displayPPN }}%</td>
          <td class="font-bold">{{ formatCurrency(po.ppn_amount) }}</td>
        </tr>
        <tr class="grand-total">
          <td class="bg-light font-bold">Total</td>
          <td class="font-bold">{{ formatCurrency(po.grand_total) }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['po'])

const displayPPN = computed(() => {
  const val = parseFloat(props.po.ppn_percentage)
  // Logic to handle 11.12% -> 12% display if that was what you were doing
  if (val === 11.12) return '12'
  return Number.isInteger(val) ? val : val
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
.invoice-summary {
  display: flex;
  justify-content: flex-end;
  margin-top: 0;
  page-break-inside: avoid;
}
.totals {
  width: 45%;
  border-top: none;
}

.totals table {
  width: 100%;
  border-collapse: collapse;
  border-top: none;
}

.totals td {
  border: 1px solid #000;
  border-top: none;
  padding: 4px 8px;
  text-align: right;
  font-size: 11px;
}

.bg-light {
  background-color: #f9f9f9;
}

.font-bold {
  font-weight: 700;
}

.grand-total td {
  background-color: #eee;
  font-size: 13px;
}
</style>
