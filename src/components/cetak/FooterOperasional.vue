<template>
  <footer class="invoice-footer">
    <p class="closing-text">Atas perhatian dan kerjasama yang baik, kami ucapkan terima kasih.</p>

    <div class="signature-section">
      <div class="signature-col">
        <p>Hormat kami,</p>
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

<style scoped>
.invoice-footer {
  width: 100%;
  margin-top: 25px;
  font-size: 14px;
  font-family: Calibri, 'Candara', 'Segoe UI', sans-serif;
  page-break-inside: avoid;
}

.closing-text {
  margin-bottom: 20px;
}

.signature-section {
  margin-bottom: 25px;
}

.signature-col {
  width: 200px;
}

.signature-space {
  height: 60px;
}

.signature-name {
  margin-top: 5px;
}

.company-details {
  width: 100%;
  font-size: 12pt;
  line-height: 1.4;
  border-top: 2px solid #000;
  padding-top: 10px;
}

.company-details p {
  margin: 0;
}

.company-details .company-name {
  font-weight: 400;
  font-size: 12pt;
  margin-bottom: 5px;
}
</style>
