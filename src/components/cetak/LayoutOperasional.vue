<template>
  <TabelCetakOperasional :details="details" :po="po" />
  <TotalCetak :po="po" />

  <div v-if="po.notes" class="notes-section">
    <span class="notes-label">Catatan:</span>
    <span class="notes-value">{{ po.notes }}</span>
  </div>

  <FooterOperasional />
</template>

<script setup>
import TabelCetakOperasional from './TabelCetakOperasional.vue'
import FooterOperasional from './FooterOperasional.vue'
import TotalCetak from './TotalCetak.vue'
defineProps(['details', 'po'])
</script>

<style scoped>
.notes-section {
  margin-top: 10px;
  font-size: 11px;
  display: flex;
  gap: 8px;
}
.notes-label {
  font-weight: 700;
  min-width: 60px;
}
.notes-value {
  color: #333;
}
</style>
