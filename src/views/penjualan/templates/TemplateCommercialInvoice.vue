<template>
  <div class="template-invoice-container">
    <table class="table-invoice">
      <thead>
        <tr>
          <th rowspan="2" style="width: 3%">NO</th>
          <th colspan="2" style="width: 37%">PRODUCT</th>
          <!-- QUANTITY: colspan dinamis -->
          <th :colspan="hasCrates ? 3 : 2" style="width: 10%">QUANTITY</th>
          <th colspan="2" style="width: 12%">WOOD CONSUMED</th>
          <th colspan="2" style="width: 15%">VOLUME PACKING</th>
          <th rowspan="2" style="width: 10%">UNIT PRICE<br />(USD)</th>
          <th rowspan="2" style="width: 13%">TOTAL<br />(USD)</th>
        </tr>
        <tr>
          <th style="width: 10%">CODE</th>
          <th style="width: 27%">DESCRIPTION</th>

          <!-- CRATE hanya jika AIR -->
          <th v-if="hasCrates" style="width: 5%">CRATE</th>
          <th style="width: 5%">BOXES</th>
          <th style="width: 5%">PCS</th>

          <th style="width: 6%">/PCS</th>
          <th style="width: 6%">M3</th>
          <th style="width: 7.5%">/BOX</th>
          <th style="width: 7.5%">M3</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data.details" :key="item.id">
          <td class="text-center">{{ index + 1 }}</td>
          <td class="text-center">{{ item.item?.code || '-' }}</td>
          <td>{{ item.item_name }}</td>

          <!-- CRATE per item -->
          <td v-if="hasCrates" class="text-center">
            {{ formatNumber(item.quantity_crates) }}
          </td>

          <td class="text-center">{{ formatNumber(item.quantity_boxes) }}</td>
          <td class="text-center">{{ formatNumber(item.quantity_shipped) }}</td>

          <td class="text-center">
            {{ formatDecimal(item.wood_consumed_per_pcs || item.item?.wood_consumed_per_pcs, 4) }}
          </td>
          <td class="text-center">
            {{ formatDecimal(calculateWoodTotal(item), 4) }}
          </td>

          <td class="text-center">
            {{ formatDecimal(item.m3_per_carton || item.item?.volume_m3 || item.item?.m3_per_carton, 4) }}
          </td>
          <td class="text-center">
            {{ formatDecimal(calculateVolumeTotal(item), 4) }}
          </td>

          <td class="text-right">{{ formatMoney(getPrice(item)) }}</td>
          <td class="text-right" style="padding-right: 5px">
            {{ formatMoney(calculatePriceTotal(item)) }}
          </td>
        </tr>

        <tr class="total-row">
          <td colspan="3" class="text-right-bold">TOTAL</td>

          <!-- Total Crate -->
          <td v-if="hasCrates" class="text-center-bold">
            {{ formatNumber(totals.crates) }}
          </td>

          <td class="text-center-bold">{{ formatNumber(totals.boxes) }}</td>
          <td class="text-center-bold">{{ formatNumber(totals.pcs) }}</td>
          <td></td>
          <td class="text-center-bold">
            {{ formatDecimal(totals.woodM3, 4) }}
          </td>
          <td></td>
          <td class="text-center-bold">
            {{ formatDecimal(totals.volumeM3, 4) }}
          </td>
          <td></td>
          <td class="text-right-bold" style="padding-right: 5px">
            {{ formatMoney(totals.amountUSD) }}
          </td>
        </tr>
      </tbody>
    </table>

    <div class="say-total">
      SAY : UNITED STATES DOLLAR ({{ formatNumberWords(totals.amountUSD) }})
    </div>

    <div class="bottom-section">
      <div class="bottom-left">
        <div class="made-out">
          MADE OUT TO APPLICANT: {{ data.applicant_info?.name || '' }}
          {{ data.applicant_info?.address || '' }}
        </div>

        <div class="summary-box">
          <div class="summary-row">
            <span>Volume of Packaging (M3) =</span>
            <span>{{ formatDecimal(totals.volumeM3, 4) }}</span>
          </div>

          <div class="fc-ilw-note">The data below is exclusive to ILW :</div>

          <div class="summary-row">
            <span>Volume of Wood Consume (M3) =</span>
            <span>{{ formatDecimal(totals.woodM3, 4) }}</span>
          </div>
          <div class="summary-row">
            <span>Nett Weight (KG) =</span>
            <span>{{ formatNumber(totals.nett) }}</span>
          </div>
          <div class="summary-row">
            <span>Number of Unit (PCS) =</span>
            <span>{{ formatNumber(totals.pcs) }}</span>
          </div>
        </div>

        <div class="bank-info">
          <div style="font-weight: bold; text-decoration: underline">Payment to:</div>
          <div>BANK CENTRAL ASIA</div>
          <div>Semarang, Indonesia</div>
          <div>PT. SURYA BANGKIT CEMERLANG</div>
          <div style="font-weight: bold">USD A/C # 009 184 5678</div>
          <div>Swift Code : CENAIDJA</div>
        </div>

        <div v-if="isEthimoBuyer" style="margin-top: 10px; font-size: 10px">
          FSC100% SA-COC-012797
        </div>
      </div>

      <div class="bottom-right">
        <SignatureCompany />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { amountToWords } from '../../../utils/numberToWords'
import SignatureCompany from '../../../components/cetak/SignatureCompany.vue'

const props = defineProps({
  data: { type: Object, required: true },
})

// Klaim sertifikasi FSC cuma ditampilkan untuk buyer Ethimo — lihat CetakPengiriman.vue.
const isEthimoBuyer = computed(() =>
  (props.data?.buyer?.name || '').toLowerCase().includes('ethimo'),
)

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

const formatMoney = (val) =>
  val
    ? parseFloat(val).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : '0'

const formatNumberWords = (amount) => {
  return amountToWords(amount)
}

const calculateWoodTotal = (item) => {
  const woodPerPcs = parseFloat(item.wood_consumed_per_pcs || item.item?.wood_consumed_per_pcs || 0)
  const qty = parseFloat(item.quantity_shipped || 0)
  return woodPerPcs * qty
}

const calculateVolumeTotal = (item) => {
  const m3PerCarton = parseFloat(item.m3_per_carton || item.item?.m3_per_carton || 0)
  const boxes = parseFloat(item.quantity_boxes || 0)
  return m3PerCarton * boxes
}

const calculateNettTotal = (item) => {
  const nwPerBox = parseFloat(item.nw_per_box || item.item?.nw_per_box || 0)
  const boxes = parseFloat(item.quantity_boxes || 0)
  return nwPerBox * boxes
}

const getPrice = (item) => {
  return parseFloat(item.current_unit_price ?? item.sales_order_detail?.unit_price ?? 0)
}

const calculatePriceTotal = (item) => {
  const qty = parseFloat(item.quantity_shipped || 0)
  const price = getPrice(item)
  return qty * price
}

const totals = computed(() => {
  if (!props.data || !props.data.details)
    return { crates: 0, boxes: 0, pcs: 0, woodM3: 0, volumeM3: 0, amountUSD: 0, nett: 0 }

  return props.data.details.reduce(
    (acc, item) => {
      acc.crates += parseFloat(item.quantity_crates || 0)
      acc.boxes += parseFloat(item.quantity_boxes || 0)
      acc.pcs += parseFloat(item.quantity_shipped || 0)
      acc.woodM3 += parseFloat(item.total_wood_consumed || 0) || calculateWoodTotal(item)
      acc.volumeM3 += parseFloat(item.total_m3 || 0) || calculateVolumeTotal(item)
      acc.amountUSD += calculatePriceTotal(item)
      acc.nett += parseFloat(item.total_nw || 0) || calculateNettTotal(item)
      return acc
    },
    { crates: 0, boxes: 0, pcs: 0, woodM3: 0, volumeM3: 0, amountUSD: 0, nett: 0 },
  )
})
</script>

<style scoped>
.template-invoice-container {
  font-family: 'Arial Narrow', Arial, sans-serif;
  font-size: 9px;
  color: #000;
}

/* ✅ TABLE PRODUCT */
.table-invoice {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px; /* 🔹 lebih besar */
  margin-bottom: 5px;
}

.table-invoice th,
.table-invoice td {
  border: 1px solid #000;
  padding: 4px 5px; /* sedikit lebih lega */
  vertical-align: middle;
  overflow-wrap: break-word;
  word-break: break-word;
}

.table-invoice th {
  text-align: center;
  font-weight: 900; /* 🔹 lebih tebal */
  background: #e0e0e0;
  font-size: 9px; /* 🔹 lebih besar */
}

.table-invoice td {
  font-size: 9px;
  font-weight: 600; /* 🔹 sedikit ditebalkan */
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-right-bold {
  text-align: right;
  font-weight: bold;
  padding-right: 8px;
}

.text-center-bold {
  text-align: center;
  font-weight: bold;
  background: #f0f0f0;
}

.total-row td {
  font-weight: 800;
  background: #e8e8e8;
  border-top: 2px solid #000;
  padding: 5px 4px;
}

/* ✅ SAY TOTAL */
.say-total {
  border: 1px solid #000;
  padding: 5px 8px;
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 9px;
}

/* ✅ BOTTOM SECTION */
.bottom-section {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  gap: 20px;
}

.bottom-left {
  width: 60%;
}

.bottom-right {
  width: 35%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.made-out {
  margin-bottom: 8px;
  font-weight: bold;
  font-size: 8.5px;
}

.summary-box {
  border: 1.5px solid #000;
  padding: 3px 6px;
  margin-bottom: 6px;
  font-size: 7.5px;
  max-width: 70mm;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  font-weight: bold;
  margin: 1px 0;
  white-space: nowrap;
}

.summary-box .fc-ilw-note {
  font-weight: bold;
  margin: 3px 0;
  text-decoration: underline;
  font-size: 7.5px;
}

.bank-info {
  font-size: 9px;
  line-height: 1.4;
}
</style>
