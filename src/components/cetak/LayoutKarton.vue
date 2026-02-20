<template>
  <TabelCetakKarton :details="details" :po="po" />
  <FooterOperasional />
</template>

<script setup>
import TabelCetakKarton from './TabelCetakKarton.vue'
import FooterOperasional from './FooterOperasional.vue'
defineProps(['details', 'po'])
</script>
