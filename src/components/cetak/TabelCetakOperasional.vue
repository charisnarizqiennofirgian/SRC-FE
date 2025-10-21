<template>
  <table class="items-table">
    <thead>
      <tr>
        <th class="col-no">No</th>
        <th class="col-name">Nama Barang</th>
        <th class="col-qty">Qty</th>
        <th class="col-unit">Satuan</th>
        <th class="col-price">Harga Satuan</th>
        <th class="col-total">Jumlah</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in details" :key="item.id">
        <td class="center">{{ index + 1 }}</td>
        <td class="left">{{ item.item.name }}</td>
        <td class="center">{{ parseFloat(item.quantity_ordered) }}</td>
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
/* ===== TABLE ===== */
.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0;
  font-size: 10px;
}

.items-table th,
.items-table td {
  border: 1px solid #000;
  padding: 5px 6px;
}

.items-table thead th {
  background-color: #fff;
  font-weight: 700;
  text-align: center;
  font-size: 10px;
  border: 1px solid #000;
}

/* Column widths */
.col-no {
  width: 5%;
}

.col-name {
  width: 35%;
}

.col-qty {
  width: 10%;
}

.col-unit {
  width: 15%;
}

.col-price {
  width: 17%;
}

.col-total {
  width: 18%;
}

/* Cell alignment */
.center {
  text-align: center;
}

.left {
  text-align: left;
}

.right {
  text-align: right;
}

/* ===== PRINT SPECIFIC ===== */
@media print {
  .items-table {
    font-size: 9px;
  }

  .items-table th,
  .items-table td {
    padding: 4px 5px;
  }
}
</style>
