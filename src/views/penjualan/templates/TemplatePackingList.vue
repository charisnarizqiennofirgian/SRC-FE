<template>
  <div class="template-packing-container">
    <table class="table-print-packing">
      <thead>
        <tr>
          <th rowspan="2" style="width: 3%">NO</th>
          <th rowspan="2" style="width: 8%">CODE</th>
          <th rowspan="2" style="width: 10%">HS CODE</th>
          <th rowspan="2" style="width: 25%">DESCRIPTION</th>

          <!-- ✅ QUANTITY: colspan dinamis -->
          <th :colspan="hasCrates ? 3 : 2" style="width: 10%">QUANTITY</th>

          <th colspan="2" style="width: 13%">WOOD CONSUMED</th>
          <th colspan="2" style="width: 13%">VOLUME</th>
          <th colspan="2" style="width: 12%">WEIGHT (KG)</th>
        </tr>
        <tr>
          <!-- ✅ Header CRATE hanya jika AIR -->
          <th v-if="hasCrates" style="width: 5%">CRATE</th>
          <th style="width: 5%">BOXES</th>
          <th style="width: 5%">PCS</th>

          <th style="width: 6.5%">PCS</th>
          <th style="width: 6.5%">M3</th>
          <th style="width: 6.5%">M3/BOX</th>
          <th style="width: 6.5%">M3</th>
          <th style="width: 6%">NETT</th>
          <th style="width: 6%">GROSS</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!data.details || data.details.length === 0">
          <td :colspan="hasCrates ? 13 : 12" class="text-center-empty">Tidak ada barang.</td>
        </tr>

        <tr v-for="(item, index) in data.details" :key="item.id">
          <td class="text-center">{{ index + 1 }}</td>
          <td class="text-center">{{ item.item?.code || '-' }}</td>

          <td class="text-center hs-code-cell">
            {{ item.item?.hs_code ? formatHsCode(item.item.hs_code) : '-' }}
          </td>

          <td>{{ item.item_name }}</td>

          <!-- ✅ Kolom CRATE per item (hanya jika AIR) -->
          <td v-if="hasCrates" class="text-center">
            {{ formatNumber(item.quantity_crates) }}
          </td>

          <td class="text-center">{{ formatNumber(item.quantity_boxes) }}</td>
          <td class="text-center">{{ formatNumber(item.quantity_shipped) }}</td>

          <td class="text-center">
            {{ formatDecimal(item.item?.wood_consumed_per_pcs, 4) }}
          </td>
          <td class="text-center">
            {{ formatDecimal(calculateWoodTotal(item), 4) }}
          </td>

          <td class="text-center">
            {{ formatDecimal(item.item?.volume_m3 || item.item?.m3_per_carton || 0, 4) }}
          </td>

          <td class="text-center">
            {{ formatDecimal(calculateVolumeTotal(item), 4) }}
          </td>

          <td class="text-center">{{ formatNumber(calculateNettTotal(item)) }}</td>
          <td class="text-center">{{ formatNumber(calculateGrossTotal(item)) }}</td>
        </tr>

        <tr class="total-row">
          <td colspan="2" class="text-right-bold">TOTAL</td>
          <td></td>
          <td></td>

          <!-- ✅ Total CRATE kalau AIR -->
          <td v-if="hasCrates" class="text-center-bold">
            {{ formatNumber(totals.crates) }}
          </td>

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

const props = defineProps({
  data: { type: Object, required: true },
})

const hasCrates = computed(() => {
  const mode = props.data?.shipment_mode || 'SEA'
  if (mode === 'AIR') return true
  const details = props.data?.details || []
  return details.some((d) => parseFloat(d.quantity_crates || 0) > 0)
})

const formatNumber = (value) => {
  if (!value && value !== 0) return 0
  return parseFloat(Number(value).toFixed(0))
}

const formatDecimal = (value, decimals = 4) => {
  if (!value && value !== 0) return '0.' + '0'.repeat(decimals)
  return Number(value).toFixed(decimals)
}

const formatHsCode = (hsCode) => {
  if (!hsCode) return '-'
  let cleaned = hsCode.replace(/[^0-9.]/g, '')
  if (!cleaned.includes('.') && cleaned.length >= 6) {
    cleaned = cleaned.substring(0, 4) + '.' + cleaned.substring(4)
  }
  return cleaned
}

const calculateWoodTotal = (item) => {
  const woodPerPcs = parseFloat(item.wood_consumed_per_pcs || item.item?.wood_consumed_per_pcs || 0)
  const qty = parseFloat(item.quantity_shipped || 0)
  return woodPerPcs * qty
}

const calculateVolumeTotal = (item) => {
  const volPerBox = parseFloat(item.m3_per_carton || item.item?.m3_per_carton || item.item?.volume_m3 || 0)
  const boxes = parseFloat(item.quantity_boxes || 0)
  return volPerBox * boxes
}

const calculateNettTotal = (item) => {
  const nwPerBox = parseFloat(item.nw_per_box || item.item?.nw_per_box || 0)
  const boxes = parseFloat(item.quantity_boxes || 0)
  return nwPerBox * boxes
}

const calculateGrossTotal = (item) => {
  const gwPerBox = parseFloat(item.gw_per_box || item.item?.gw_per_box || 0)
  const boxes = parseFloat(item.quantity_boxes || 0)
  return gwPerBox * boxes
}

const totals = computed(() => {
  if (!props.data || !props.data.details) {
    return { crates: 0, boxes: 0, pcs: 0, woodM3: 0, volumeM3: 0, nett: 0, gross: 0 }
  }
  return props.data.details.reduce(
    (acc, item) => {
      acc.crates += parseFloat(item.quantity_crates || 0)
      acc.boxes += parseFloat(item.quantity_boxes || 0)
      acc.pcs += parseFloat(item.quantity_shipped || 0)
      acc.woodM3 += parseFloat(item.total_wood_consumed || 0) || calculateWoodTotal(item)
      acc.volumeM3 += parseFloat(item.total_m3 || 0) || calculateVolumeTotal(item)
      acc.nett += parseFloat(item.total_nw || 0) || calculateNettTotal(item)
      acc.gross += parseFloat(item.total_gw || 0) || calculateGrossTotal(item)
      return acc
    },
    { crates: 0, boxes: 0, pcs: 0, woodM3: 0, volumeM3: 0, nett: 0, gross: 0 },
  )
})
</script>
<style scoped>
.table-print-packing {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
  font-size: 11px; /* 🔹 diperjelas */
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
  font-weight: 900; /* 🔹 lebih tebal */
  color: #000;
  font-size: 11px; /* 🔹 lebih besar */
  text-transform: uppercase;
}
.table-print-packing td {
  color: #000;
  font-size: 11px; /* 🔹 lebih besar */
  font-weight: 600; /* 🔹 lebih tebal */
}

/* HS CODE */
.hs-code-cell {
  font-weight: 700;
  background-color: #f8f9fa;
  font-family: 'Courier New', monospace;
}
.hs-code-cell::before {
  content: 'HS ';
  color: #000; /* lebih gelap */
  font-weight: 700; /* lebih tebal */
  letter-spacing: 0.5px;
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
  font-size: 11px;
  color: #000;
}
</style>
