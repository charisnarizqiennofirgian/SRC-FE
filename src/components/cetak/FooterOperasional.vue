<template>
  <footer class="invoice-footer">
    <p class="closing-text">
      <template v-if="isUSD">
        Thank you for your attention and cooperation.
      </template>
      <template v-else>
        Atas perhatian dan kerjasama yang baik, kami ucapkan terima kasih.
      </template>
    </p>

    <div class="signature-section">
      <div class="signature-col">
        <p>{{ isUSD ? 'Yours sincerely,' : 'Hormat kami,' }}</p>
        <div class="signature-space"></div>
        <p class="signature-name">Louis Sebastian Agussoegito</p>
      </div>
    </div>

    <div class="company-details">
      <p class="company-name">PT. SURYA BANGKIT CEMERLANG</p>
      <p>
        Jl. Raya Semarang Purwodadi KM. 18 Kec. Karangawen, Kab. Demak, Prov. Jawa Tengah – Indonesia.
      </p>
      <p>PHONE : +62 24 76583167</p>
      <p>FAX : +62 24 766412468</p>
      <p>EMAIL : purchasing@sunbcfurni.com</p>
    </div>
  </footer>
</template>

<script setup>
defineProps({
  isUSD: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.invoice-footer {
  width: 100%;
  margin-top: 5mm;
  font-size: 10pt;
  font-family: 'Times New Roman', Times, serif;
  page-break-inside: avoid;
}

.closing-text {
  margin-bottom: 4mm;
}

.signature-section {
  margin-bottom: 5mm;
}

.signature-col {
  width: 55mm;
}

.signature-space {
  height: 18mm;
}

.signature-name {
  margin-top: 1mm;
  border-top: 0.75pt solid #000;
  padding-top: 1mm;
  font-weight: 700;
}

.company-details {
  width: 100%;
  font-size: 10pt;
  line-height: 1.4;
  border-top: 1.5pt solid #000;
  padding-top: 3mm;
}

.company-details p {
  margin: 0;
}

.company-details .company-name {
  font-weight: 700;
  font-size: 10pt;
  margin-bottom: 1mm;
}
</style>
