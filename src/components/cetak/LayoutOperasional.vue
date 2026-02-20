<template>
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
</script>

<style scoped>
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
