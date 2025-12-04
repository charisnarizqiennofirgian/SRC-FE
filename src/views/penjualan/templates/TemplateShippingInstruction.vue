<template>
  <div class="shipping-instruction">
    <div class="si-title">
      <h2>SHIPPING INSTRUCTION</h2>
      <div class="si-number">
        No : {{ data.do_number || '-' }}/{{ formatDate(data.delivery_date) }}
      </div>
    </div>

    <div class="si-row">
      <div class="si-label">Messrs</div>
      <div class="si-content">
        <div style="white-space: pre-line">{{ data.forwarder_name || '-' }}</div>
      </div>
    </div>

    <div class="si-row">
      <div class="si-label">Dear Sirs / Ms.</div>
      <div class="si-content">
        <strong>We herewith request to effect the following shipment :</strong>
      </div>
    </div>

    <div class="si-row">
      <div class="si-label">Container</div>
      <div class="si-content">
        <div>
          <strong>
            : {{ data.container_type || '' }}
            {{ data.container_number ? ', CONTAINER NO. - ' + data.container_number : '' }}
          </strong>
        </div>
        <div><strong>SEAL NO.</strong> : {{ data.seal_number || '-' }}</div>
        <div>
          <strong>PEB NO.</strong> : {{ data.peb_number || data.bl_number || '-' }}
          <strong style="margin-left: 10px">DATE :</strong> {{ formatDateDMY(data.bl_date) }}
        </div>
        <div v-if="uniqueHsCodes.length > 0">
          <span v-for="(code, index) in uniqueHsCodes" :key="index">
            <strong>HS {{ code }}</strong>
            <span v-if="index < uniqueHsCodes.length - 1"> / </span>
          </span>
        </div>
      </div>
    </div>

    <div class="si-row">
      <div class="si-label">Shipper</div>
      <div class="si-content">
        <div><strong>: PT SURYA BANGKIT CEMERLANG</strong></div>
        <div><strong>JL. RAYA SEMARANG - PURWODADI KM18</strong></div>
        <div><strong>KARANGAWEN, DEMAK</strong></div>
        <div><strong>CENTRAL JAVA - INDONESIA</strong></div>
      </div>
    </div>

    <div class="si-row">
      <div class="si-label">Consignee</div>
      <div class="si-content">
        <div>: {{ data.consignee_info?.name || '-' }}</div>
      </div>
    </div>

    <div class="si-row">
      <div class="si-label">Notify</div>
      <div class="si-content">
        <div>: {{ data.notify_info?.name || '-' }}</div>
        <div v-if="data.notify_info?.address">{{ data.notify_info.address }}</div>
      </div>
    </div>

    <div class="si-row">
      <div class="si-label">Port Of Loading</div>
      <div class="si-content">: {{ data.port_of_loading || '-' }}</div>
    </div>

    <div class="si-row">
      <div class="si-label">Port Of Destination</div>
      <div class="si-content">: {{ data.port_of_discharge || '-' }}</div>
    </div>

    <div class="si-row">
      <div class="si-label">Description Of<br />Goods</div>
      <div class="si-content">
        <div>: {{ data.goods_description || 'TEAK GARDEN FURNITURE AND ACCESSORIES' }}</div>
      </div>
    </div>

    <div class="si-row">
      <div class="si-label"></div>
      <div class="si-content">
        <table class="weight-table">
          <tr>
            <td style="width: 30%; text-align: right"><strong>GROSS</strong></td>
            <td style="width: 25%; text-align: right">{{ formatNumber(totals.grossWeight) }}</td>
            <td style="width: 15%; text-align: left">KGS</td>
            <td style="width: 30%"></td>
          </tr>
          <tr>
            <td style="text-align: right"><strong>NETT</strong></td>
            <td style="text-align: right">{{ formatNumber(totals.nettWeight) }}</td>
            <td style="text-align: left">KGS</td>
            <td></td>
          </tr>
          <tr>
            <td style="text-align: right"><strong>Meas</strong></td>
            <td style="text-align: right">{{ formatVolume(totals.volume) }}</td>
            <td style="text-align: left">M3</td>
            <td></td>
          </tr>
        </table>
      </div>
    </div>

    <div class="si-row">
      <div class="si-label">Shipping mark</div>
      <div class="si-content"></div>
    </div>

    <div class="si-row">
      <div class="si-label">Letter Of Credit</div>
      <div class="si-content si-split">
        <div style="flex: 1"></div>
        <div style="width: 200px">
          <strong>Dated of issue</strong>
        </div>
      </div>
    </div>

    <div class="si-row">
      <div class="si-label">Issuing Bank</div>
      <div class="si-content"></div>
    </div>

    <div class="si-row">
      <div class="si-label">Marked</div>
      <div class="si-content"></div>
    </div>

    <div class="si-row">
      <div class="si-label">Stuffing</div>
      <div class="si-content si-split">
        <div style="flex: 1">: {{ formatStuffingDate(data.delivery_date) }}</div>
        <div style="width: 200px; text-align: center">
          <strong>Collect</strong><br />
          <u style="display: inline-block; min-width: 150px; margin-top: 5px">Yours Faithfully</u>
        </div>
      </div>
    </div>

    <div class="si-row">
      <div class="si-label"></div>
      <div class="si-content">
        <p style="margin: 10px 0 0 0">Thank you for your kind assistance.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

// === FORMATTERS ===
// Format angka bulat (1,386)
const formatNumber = (val) => {
  return val ? parseFloat(val).toLocaleString('en-US', { maximumFractionDigits: 0 }) : 0
}

// Format volume (3.267) - Menghilangkan 0 tidak perlu di belakang
const formatVolume = (val) => {
  if (!val) return 0
  return parseFloat(parseFloat(val).toFixed(4))
}

// Format Tanggal
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${month}/${year}`
}

const formatDateDMY = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const formatStuffingDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const month = months[date.getMonth()]
  const year = String(date.getFullYear()).slice(-2)
  return `${day}-${month}-${year}`
}

// === LOGIKA KALKULATOR (SAMA SEPERTI PL) ===
const calculateVolumeItem = (item) => {
  const volPerBox = parseFloat(item.item?.volume_m3 || item.item?.m3_per_carton || 0)
  const boxes = parseFloat(item.quantity_boxes || 0)
  return volPerBox * boxes
}

const calculateGrossItem = (item) => {
  const gwPerBox = parseFloat(item.item?.gw_per_box || 0)
  const boxes = parseFloat(item.quantity_boxes || 0)
  return gwPerBox * boxes
}

const calculateNettItem = (item) => {
  const nwPerBox = parseFloat(item.item?.nw_per_box || 0)
  const boxes = parseFloat(item.quantity_boxes || 0)
  return nwPerBox * boxes
}

// === COMPUTED TOTALS ===
const totals = computed(() => {
  const items = props.data?.details || []

  if (items.length === 0) {
    return { grossWeight: 0, nettWeight: 0, volume: 0 }
  }

  return items.reduce(
    (acc, item) => {
      acc.grossWeight += calculateGrossItem(item)
      acc.nettWeight += calculateNettItem(item)
      acc.volume += calculateVolumeItem(item)
      return acc
    },
    { grossWeight: 0, nettWeight: 0, volume: 0 },
  )
})

// === FILTER HS CODE UNIK ===
const uniqueHsCodes = computed(() => {
  const items = props.data?.details || []
  if (items.length === 0) return []

  const hsCodes = items
    .map((item) => item.item?.hs_code)
    .filter((code) => code && code.trim() !== '')

  return [...new Set(hsCodes)]
})
</script>

<style scoped>
.shipping-instruction {
  font-family: Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.6;
  padding: 0;
}

/* TITLE */
.si-title {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #000;
}

.si-title h2 {
  font-size: 16pt;
  font-weight: bold;
  margin: 0 0 5px 0;
  text-decoration: underline;
}

.si-number {
  font-size: 11pt;
  margin: 5px 0 0 0;
}

/* ROW LAYOUT */
.si-row {
  display: flex;
  min-height: 30px;
  margin: 0;
  border-bottom: 1px solid #e0e0e0;
}

.si-row:last-child {
  border-bottom: none;
}

.si-label {
  width: 180px;
  flex-shrink: 0;
  padding: 8px 10px;
  font-weight: normal;
  font-size: 10.5pt;
  line-height: 1.5;
}

.si-content {
  flex: 1;
  padding: 8px 10px;
  font-size: 10.5pt;
  line-height: 1.5;
}

.si-split {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

/* WEIGHT TABLE */
.weight-table {
  width: 100%;
  margin: 5px 0;
  border-collapse: collapse;
}

.weight-table td {
  padding: 3px 5px;
  font-size: 10.5pt;
}

/* PRINT */
@media print {
  .shipping-instruction {
    padding: 0;
  }

  .si-row {
    page-break-inside: avoid;
  }
}
</style>
