<template>
  <p class="intro-text">
    Dengan ini kami mengirim daftar pesanan kami untuk {{ extractUsername(po.supplier?.address) }} sebagai berikut :
  </p>

  <TabelCetakOperasional :details="details" :po="po" />

  <div v-if="po.notes" class="notes-section">
    <span class="notes-label">Catatan:</span>
    <span class="notes-value">{{ po.notes }}</span>
  </div>

  <FooterOperasional />
</template>

<script setup>
import TabelCetakOperasional from './TabelCetakOperasional.vue'
import FooterOperasional from './FooterOperasional.vue'

defineProps(['details', 'po'])

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
