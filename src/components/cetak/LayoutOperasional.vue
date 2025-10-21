<template>
  <TabelCetakOperasional :details="details" />
  <TotalCetak :po="po" />
  <FooterOperasional />
</template>

<script setup>
import TabelCetakOperasional from './TabelCetakOperasional.vue'
import FooterOperasional from './FooterOperasional.vue'
import TotalCetak from './TotalCetak.vue'
defineProps(['details', 'po'])
</script>
