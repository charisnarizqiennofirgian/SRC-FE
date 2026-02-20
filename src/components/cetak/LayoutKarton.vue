<template>
  <TabelCetakKarton :details="details" :po="po" />
  <TotalCetak :po="po" />
  <FooterOperasional />
</template>

<script setup>
import TabelCetakKarton from './TabelCetakKarton.vue'
import FooterOperasional from './FooterOperasional.vue'
import TotalCetak from './TotalCetak.vue'
defineProps(['details', 'po'])
</script>
