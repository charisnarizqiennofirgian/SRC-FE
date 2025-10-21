<template>
  <TabelCetakKayu :details="details" />
  <TotalCetak :po="po" />
  <FooterKayu />
</template>

<script setup>
import TabelCetakKayu from './TabelCetakKayu.vue'
import FooterKayu from './FooterKayu.vue'
import TotalCetak from './TotalCetak.vue'
defineProps(['details', 'po'])
</script>
