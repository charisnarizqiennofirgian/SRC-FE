<template>
  <TabelCetakKayu :details="details" :po="po" />
  <FooterKayu />
</template>

<script setup>
import TabelCetakKayu from './TabelCetakKayu.vue'
import FooterKayu from './FooterKayu.vue'
defineProps(['details', 'po'])
</script>
