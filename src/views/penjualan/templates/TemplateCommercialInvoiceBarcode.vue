<template>
  <div class="template-invoice-barcode-container">
    <!-- ✅ HANYA BAGIAN SAY TOTAL + BOTTOM SECTION -->

    <!-- SAY TOTAL -->
    <div class="say-total">
      SAY : UNITED STATES DOLLAR ({{ formatNumberWords(totals.amountUSD) }})
    </div>

    <!-- BOTTOM SECTION -->
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

          <div style="font-weight: bold; margin: 5px 0; text-decoration: underline">
            The data below is exclusive to ILW :
          </div>

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

        <div style="margin-top: 10px; font-size: 10px">FSC100% SA-COC-012797</div>
      </div>

      <div class="bottom-right">
        <div class="company-name">PT. SURYA BANGKIT CEMERLANG</div>
        <div class="signature-space"></div>
        <div class="signer-name">ELLEN APRILIANA</div>
      </div>
    </div>

    <!-- ✅ BARCODE SECTION -->
    <div class="barcode-footer-section" style="margin-top: 30px">
      <div class="barcode-wrapper" style="text-align: center">
        <img
          v-if="data.barcode_image"
          :src="data.barcode_image"
          alt="Barcode Kemendag"
          class="barcode-img"
          style="max-width: 80%; max-height: 300px; object-fit: contain"
        />
        <div v-else class="empty-state" style="color: red; font-style: italic">
          ⚠️ Gambar Barcode belum di-upload di form pengiriman.
        </div>
      </div>

      <div
        v-if="data.sipk_number"
        class="sipk-label"
        style="text-align: center; font-weight: bold; margin-top: 5px"
      >
        No. SIPK: {{ data.sipk_number }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Object, required: true },
})

const formatNumber = (value) => {
  if (!value && value !== 0) return 0
  return parseFloat(Number(value).toFixed(0))
}

const formatDecimal = (value, decimals = 4) => {
  if (!value && value !== 0) return '0.' + '0'.repeat(decimals)
  return Number(value).toFixed(decimals)
}

const formatNumberWords = (amount) => {
  return Math.round(amount).toLocaleString('en-US')
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
  return parseFloat(item.sales_order_detail?.unit_price || 0)
}

const calculatePriceTotal = (item) => {
  const qty = parseFloat(item.quantity_shipped || 0)
  const price = getPrice(item)
  return qty * price
}

const totals = computed(() => {
  if (!props.data || !props.data.details)
    return { boxes: 0, pcs: 0, woodM3: 0, volumeM3: 0, amountUSD: 0, nett: 0 }

  return props.data.details.reduce(
    (acc, item) => {
      acc.boxes += parseFloat(item.quantity_boxes || 0)
      acc.pcs += parseFloat(item.quantity_shipped || 0)
      acc.woodM3 += parseFloat(item.total_wood_consumed || 0) || calculateWoodTotal(item)
      acc.volumeM3 += parseFloat(item.total_m3 || 0) || calculateVolumeTotal(item)
      acc.amountUSD += calculatePriceTotal(item)
      acc.nett += parseFloat(item.total_nw || 0) || calculateNettTotal(item)
      return acc
    },
    { boxes: 0, pcs: 0, woodM3: 0, volumeM3: 0, amountUSD: 0, nett: 0 },
  )
})
</script>

<style scoped>
.template-invoice-barcode-container {
  font-family: 'Arial Narrow', Arial, sans-serif;
  font-size: 9px;
  color: #000;
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
  align-items: flex-end;
  justify-content: flex-end;
}

.made-out {
  margin-bottom: 8px;
  font-weight: bold;
  font-size: 8.5px;
}

.summary-box {
  border: 2px solid #000;
  padding: 5px 8px;
  margin-bottom: 10px;
  font-size: 8.5px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin: 2px 0;
}

.bank-info {
  font-size: 9px;
  line-height: 1.4;
}

.company-name {
  font-weight: bold;
  margin-bottom: 50px;
  text-align: right;
  font-size: 9px;
}

.signature-space {
  width: 140px;
  border-bottom: 1px solid #000;
  margin-bottom: 3px;
}

.signer-name {
  font-weight: bold;
  text-align: right;
  font-size: 9px;
}

/* ✅ BARCODE SECTION */
.barcode-footer-section {
  margin-top: 30px;
  text-align: right;
}

.barcode-wrapper {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  margin-top: 20px;
  margin-bottom: 20px;
  min-height: 150px;
}

.barcode-img {
  display: block;
  max-width: 45%;
  max-height: 250px;
  width: auto;
  height: auto;
  object-fit: contain;
  border: 1px solid #333;
  padding: 8px;
}

.empty-state {
  color: red;
  font-style: italic;
  border: 1px dashed red;
  padding: 20px;
  text-align: center;
  width: 50%;
  margin-left: auto;
}

.sipk-label {
  text-align: right;
  font-weight: bold;
  font-size: 10px;
  margin-top: 8px;
}
</style>
