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

const props = defineProps(['details', 'po'])

const extractUsername = (address) => {
  if (!address) return ''
  const match = address.match(/\(([^)]+)\)/)
  return match ? match[1] : ''
}
</script>

<style scoped>
.intro-text {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 11px;
  font-family: Arial, sans-serif;
}
.notes-section {
  margin-top: 10px;
  font-size: 14px;
  font-family: Arial, sans-serif;
  display: flex;
  gap: 8px;
}
.notes-label {
  font-weight: 700;
  min-width: 60px;
}
.notes-value {
  color: #333;
  font-weight: 400;
}
</style>
