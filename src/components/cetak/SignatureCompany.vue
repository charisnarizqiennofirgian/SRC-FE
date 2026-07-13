<template>
  <div class="signature-block">
    <p v-if="dateLine" class="sig-date">{{ dateLine }}</p>
    <p class="sig-company">PT. SURYA BANGKIT CEMERLANG</p>
    <div class="sig-line"></div>
    <p class="sig-name">Ellen Apriliana</p>
  </div>
</template>

<script setup>
defineProps({
  // Baris opsional di atas nama perusahaan, mis. "Semarang, July 09, 2026" — kosongkan
  // kalau dokumen tidak butuh baris tempat/tanggal (Packing List, Commercial Invoice, dst).
  dateLine: { type: String, default: '' },
})
</script>

<style scoped>
.signature-block {
  text-align: center;
  font-size: 10px;
}

.sig-date {
  margin: 0 0 4px 0;
  font-weight: 400;
}

.sig-company {
  font-weight: 700;
  margin: 0 0 45px 0;
}

.sig-line {
  border-top: 1.2px solid #000;
  width: 75%;
  margin: 0 auto;
}

.sig-name {
  font-weight: 700;
  margin: 4px 0 0 0;
}
</style>
