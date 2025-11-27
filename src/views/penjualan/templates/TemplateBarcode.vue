<template>
  <div class="template-barcode-container">
    <div class="title-section">
      <div class="title-text">PACKING LIST KEMENDAG</div>
    </div>

    <div class="barcode-wrapper">
      <img
        v-if="data.barcode_image"
        :src="data.barcode_image"
        alt="Barcode Kemendag"
        class="barcode-img"
      />

      <div v-else class="empty-state">⚠️ Gambar Barcode belum di-upload di form pengiriman.</div>
    </div>

    <div v-if="data.sipk_number" class="sipk-label">No. SIPK: {{ data.sipk_number }}</div>
  </div>
</template>

<script setup>
// Menerima data 'deliveryOrder' dari Parent
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
/* === STYLING JUDUL === */
.title-section {
  text-align: center;
  margin-bottom: 20px;
  margin-top: 10px;
}

.title-text {
  font-size: 18px;
  font-weight: 900;
  text-decoration: underline;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* === STYLING GAMBAR BARCODE === */
.barcode-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  margin-bottom: 20px;
  min-height: 200px; /* Menjaga area agar tidak gepeng */
}

.barcode-img {
  display: block;
  max-width: 80%; /* Responsif: Max 80% lebar kertas */
  max-height: 400px; /* Batasi tinggi agar tidak menabrak footer */
  width: auto;
  height: auto;
  object-fit: contain; /* KUNCI: Gambar tidak akan gepeng */
  border: 1px solid #333; /* Opsional: Bingkai tipis biar rapi */
  padding: 10px;
}

.empty-state {
  color: red;
  font-style: italic;
  border: 1px dashed red;
  padding: 20px;
  text-align: center;
  width: 100%;
}

.sipk-label {
  text-align: center;
  font-weight: bold;
  font-size: 12px;
  margin-top: 10px;
}
</style>
