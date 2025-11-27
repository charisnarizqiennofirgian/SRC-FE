<template>
  <div class="template-do-container">
    <div class="do-header">
      <div class="do-title">DELIVERY ORDER</div>
      <div class="do-number">NO : {{ data.do_number }}</div>
    </div>

    <div class="do-info-section">
      <div class="info-left">
        <div style="font-weight: bold; margin-bottom: 5px">
          To : {{ data.buyer?.name || 'ETHIMO S.R.L.' }}
        </div>
        <div style="white-space: pre-line; text-transform: uppercase">
          {{ data.consignee_info?.address || data.buyer?.address || '-' }}
        </div>
      </div>
      <div class="info-right">
        <div style="font-weight: bold">{{ formatDisplayDateFull(data.delivery_date) }}</div>
      </div>
    </div>

    <div class="do-intro">
      <p>
        With this Delivery Order, we send goods for "{{ data.buyer?.name || 'BUYER' }}" as follow:
      </p>
      <div class="container-info">
        CONT. {{ data.container_number || '................' }} /
        {{ data.seal_number || '................' }}
      </div>
    </div>

    <table class="table-do">
      <thead>
        <tr>
          <th style="width: 5%">NO</th>
          <th style="width: 15%">CODE</th>
          <th style="width: 45%">PRODUCTS</th>
          <th style="width: 8%">BOX</th>
          <th style="width: 8%">PCS</th>
          <th style="width: 19%">KETERANGAN</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data.details" :key="item.id">
          <td class="text-center">{{ index + 1 }}</td>
          <td>{{ item.item?.code || '-' }}</td>
          <td>{{ item.item_name }}</td>
          <td class="text-center">{{ formatNumber(item.quantity_boxes) }}</td>
          <td class="text-center">{{ formatNumber(item.quantity_shipped) }}</td>
          <td class="text-center remark-col">
            <span v-if="item.quantity_boxes > 0">
              1 BOX = {{ formatNumber(item.quantity_shipped / item.quantity_boxes) }} PCS
            </span>
          </td>
        </tr>
        <tr class="total-row">
          <td colspan="3" class="text-center-bold">TOTAL</td>
          <td class="text-center-bold">{{ formatNumber(totals.boxes) }}</td>
          <td class="text-center-bold">{{ formatNumber(totals.pcs) }}</td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <div class="footer-signatures">
      <div class="sig-box">
        <div class="sig-title">RECEIVER</div>
        <div class="sig-space">( .............................. )</div>
      </div>
      <div class="sig-box">
        <div class="sig-title">DRIVER</div>
        <div class="sig-space">( .............................. )</div>
      </div>
      <div class="sig-box">
        <div class="sig-title">SECURITY SBC</div>
        <div class="sig-space">( .............................. )</div>
      </div>
      <div class="sig-box">
        <div class="sig-title">AGREED BY</div>
        <div class="sig-space">( YULI )</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Object, required: true },
})

const formatNumber = (val) => {
  if (!val) return 0
  return parseFloat(val).toFixed(0)
}

const formatDisplayDateFull = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    .toUpperCase()
}

const totals = computed(() => {
  if (!props.data || !props.data.details) return { boxes: 0, pcs: 0 }
  return props.data.details.reduce(
    (acc, item) => {
      acc.boxes += parseFloat(item.quantity_boxes || 0)
      acc.pcs += parseFloat(item.quantity_shipped || 0)
      return acc
    },
    { boxes: 0, pcs: 0 },
  )
})
</script>

<style scoped>
/* === STYLING KHUSUS DO === */
.template-do-container {
  font-family: 'Arial', sans-serif;
  color: #000;
}

.do-header {
  text-align: center;
  margin-bottom: 20px;
}
.do-title {
  font-size: 18px;
  font-weight: 900;
  text-decoration: underline;
}
.do-number {
  font-size: 14px;
  font-weight: 700;
  margin-top: 5px;
}

.do-info-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.info-left {
  width: 60%;
  font-size: 12px;
}
.info-right {
  width: 30%;
  text-align: right;
  font-size: 12px;
}

.do-intro {
  font-size: 12px;
  margin-bottom: 10px;
}
.container-info {
  font-weight: 800;
  margin-top: 5px;
  text-transform: uppercase;
}

/* TABEL STYLE */
.table-do {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  margin-bottom: 30px;
}
.table-do th {
  background-color: #e8e6d1; /* Warna Cream Khas DO */
  border: 1px solid #000;
  padding: 6px;
  font-weight: 800;
}
.table-do td {
  border: 1px solid #000;
  padding: 5px;
  vertical-align: middle;
}
.text-center {
  text-align: center;
}
.text-center-bold {
  text-align: center;
  font-weight: 800;
}
.remark-col {
  font-size: 10px;
  font-style: italic;
}

/* FOOTER */
.footer-signatures {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
.sig-box {
  width: 22%;
  text-align: center;
}
.sig-title {
  font-weight: 800;
  font-size: 11px;
  margin-bottom: 50px;
  text-transform: uppercase;
}
.sig-space {
  font-weight: 700;
  font-size: 12px;
}
</style>
