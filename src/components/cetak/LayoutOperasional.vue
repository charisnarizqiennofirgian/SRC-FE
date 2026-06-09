<template>
  <p class="intro-text">
    <template v-if="isForeign">
      We hereby submit our purchase order to
      <strong>{{ po.supplier?.name }}</strong> as follows:
    </template>
    <template v-else>
      Dengan ini kami mengirim daftar pesanan kami untuk {{ extractUsername(po.supplier?.address) }} sebagai berikut :
    </template>
  </p>

  <TabelCetakOperasional :details="details" :po="po" />

  <div v-if="po.notes" class="notes-section">
    <span class="notes-label">{{ isForeign ? 'Notes:' : 'Catatan:' }}</span>
    <span class="notes-value">{{ po.notes }}</span>
  </div>

  <FooterOperasional :isForeign="isForeign" />
</template>

<script setup>
import { computed } from 'vue'
import TabelCetakOperasional from './TabelCetakOperasional.vue'
import FooterOperasional from './FooterOperasional.vue'

const props = defineProps(['details', 'po'])

const isUSD = computed(() => props.po?.currency === 'USD')
const isForeign = computed(() => props.po?.currency === 'USD' || props.po?.currency === 'EUR')

const extractUsername = (address) => {
  if (!address) return ''
  const match = address.match(/\(([^)]+)\)/)
  return match ? match[1] : ''
}
</script>

<style scoped>
.intro-text {
  font-weight: 400;
  margin-bottom: 3mm;
  font-size: 10pt;
  font-family: 'Times New Roman', Times, serif;
}
.notes-section {
  margin-top: 3mm;
  font-size: 10pt;
  font-family: 'Times New Roman', Times, serif;
  display: flex;
  gap: 3mm;
}
.notes-label {
  font-weight: 700;
  min-width: 18mm;
}
.notes-value {
  color: #000;
  font-weight: 400;
}
</style>
