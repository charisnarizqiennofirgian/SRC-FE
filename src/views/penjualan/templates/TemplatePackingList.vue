<template>
  <div class="template-packing-container">
    <table class="table-print-packing">
      <thead>
        <tr>
          <th rowspan="2" style="width: 3%">NO</th>
          <th rowspan="2" style="width: 9%">CODE</th>
          <th rowspan="2" style="width: 31%">DESCRIPTION</th>
          <th colspan="2" style="width: 10%">QUANTITY</th>
          <th colspan="2" style="width: 13%">WOOD CONSUMED</th>
          <th colspan="2" style="width: 14%">VOLUME</th>
          <th colspan="2" style="width: 14%">WEIGHT (KG)</th>
        </tr>
        <tr>
          <th style="width: 5%">BOXES</th>
          <th style="width: 5%">PCS</th>
          <th style="width: 6.5%">PCS</th>
          <th style="width: 6.5%">M3</th>
          <th style="width: 6.5%">M3/BOX</th>
          <th style="width: 6.5%">M3</th>
          <th style="width: 7%">NETT</th>
          <th style="width: 7%">GROSS</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!data.details || data.details.length === 0">
          <td colspan="11" class="text-center-empty">Tidak ada barang.</td>
        </tr>

        <tr v-for="(item, index) in data.details" :key="item.id">
          <td class="text-center">{{ index + 1 }}</td>
          <td class="text-center">{{ item.item?.code || '-' }}</td>
          <td>{{ item.item_name }}</td>
          <td class="text-center">{{ formatNumber(item.quantity_boxes) }}</td>
          <td class="text-center">{{ formatNumber(item.quantity_shipped) }}</td>
          <td class="text-center">{{ formatDecimal(item.item?.wood_consumed_per_pcs, 4) }}</td>
          <td class="text-center">{{ formatDecimal(calculateWoodTotal(item), 4) }}</td>

          <td class="text-center">{{ formatDecimal(item.item?.m3_per_carton, 4) }}</td>
          <td class="text-center">{{ formatDecimal(calculateVolumeTotal(item), 4) }}</td>

          <td class="text-center">{{ formatNumber(calculateNettTotal(item)) }}</td>
          <td class="text-center">{{ formatNumber(calculateGrossTotal(item)) }}</td>
        </tr>

        <tr class="total-row">
          <td colspan="3" class="text-right-bold">TOTAL</td>
          <td class="text-center-bold">{{ formatNumber(totals.boxes) }}</td>
          <td class="text-center-bold">{{ formatNumber(totals.pcs) }}</td>
          <td></td>
          <td class="text-center-bold">{{ formatDecimal(totals.woodM3, 4) }}</td>
          <td></td>
          <td class="text-center-bold">{{ formatDecimal(totals.volumeM3, 4) }}</td>
          <td class="text-center-bold">{{ formatNumber(totals.nett) }}</td>
          <td class="text-center-bold">{{ formatNumber(totals.gross) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Menerima data 'deliveryOrder' dari Parent
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

// === SEMUA LOGIKA HITUNGAN DIPINDAH KESINI (Biar Rapi) ===

const formatNumber = (value) => {
  if (!value && value !== 0) return 0
  return parseFloat(Number(value).toFixed(0))
}

const formatDecimal = (value, decimals = 4) => {
  if (!value && value !== 0) return '0.' + '0'.repeat(decimals)
  return parseFloat(Number(value).toFixed(decimals))
}

const calculateWoodTotal = (item) => {
  const woodPerPcs = parseFloat(item.item?.wood_consumed_per_pcs || 0)
  const qty = parseFloat(item.quantity_shipped || 0)
  return woodPerPcs * qty
}

const calculateVolumeTotal = (item) => {
  // Rumus: M3/Box * Jml Box (Sesuai request Anda)
  const m3PerCarton = parseFloat(item.item?.m3_per_carton || 0)
  const boxes = parseFloat(item.quantity_boxes || 0)
  return m3PerCarton * boxes
}

const calculateNettTotal = (item) => {
  const nwPerBox = parseFloat(item.item?.nw_per_box || 0)
  const boxes = parseFloat(item.quantity_boxes || 0)
  return nwPerBox * boxes
}

const calculateGrossTotal = (item) => {
  const gwPerBox = parseFloat(item.item?.gw_per_box || 0)
  const boxes = parseFloat(item.quantity_boxes || 0)
  return gwPerBox * boxes
}

// Computed Totals
const totals = computed(() => {
  if (!props.data || !props.data.details) {
    return { boxes: 0, pcs: 0, woodM3: 0, volumeM3: 0, nett: 0, gross: 0 }
  }
  return props.data.details.reduce(
    (acc, item) => {
      acc.boxes += parseFloat(item.quantity_boxes || 0)
      acc.pcs += parseFloat(item.quantity_shipped || 0)
      acc.woodM3 += calculateWoodTotal(item)
      acc.volumeM3 += calculateVolumeTotal(item)
      acc.nett += calculateNettTotal(item)
      acc.gross += calculateGrossTotal(item)
      return acc
    },
    { boxes: 0, pcs: 0, woodM3: 0, volumeM3: 0, nett: 0, gross: 0 },
  )
})
</script>

<style scoped>
.table-print-packing {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
  font-size: 10px;
}
.table-print-packing thead {
  background: #e0e0e0;
  font-weight: bold;
}
.table-print-packing th,
.table-print-packing td {
  border: 1.2px solid #000;
  padding: 6px 5px;
  text-align: center;
  vertical-align: middle;
}
.table-print-packing th {
  font-weight: 800;
  color: #000;
  font-size: 9.5px;
  text-transform: uppercase;
}
.table-print-packing td {
  color: #000;
  font-size: 10px;
  font-weight: 500;
}
.text-center {
  text-align: center;
}
.text-center-empty {
  text-align: center;
  padding: 20px !important;
  color: #666;
  font-style: italic;
}
.text-right-bold {
  text-align: right;
  font-weight: 800;
  padding-right: 10px !important;
  color: #000;
}
.text-center-bold {
  text-align: center;
  font-weight: 800;
  background: #f0f0f0;
  color: #000;
}
.total-row td {
  font-weight: 800;
  background: #e8e8e8;
  border-top: 2.5px solid #000;
  padding: 7px 5px !important;
  font-size: 10.5px;
  color: #000;
}
</style>
