<template>
  <footer class="invoice-footer">
    <p class="closing-text">Atas perhatian dan kerjasama yang baik, kami ucapkan terima kasih.</p>

    <div class="signature-block">
      <div class="signature-col">
        <p>Hormat kami,</p>
        <div class="signature-space"></div>
        <p class="signature-name">Gifano</p>
      </div>

      <div class="company-details">
        <p class="company-name">PT. SURYA BANGKIT CEMERLANG</p>
        <p>
          Jl. Raya Semarang Purwodadi KM. 18 Kec. Karangawen, Kab. Demak, Prov. Jawa Tengah –
          Indonesia.
        </p>
        <p>PHONE : +62 24 76583167</p>
        <p>FAX : +62 24 766412468</p>
        <p>EMAIL : purchasing@sbcburnifurni.com</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.invoice-footer {
  width: 100%;
  margin-top: 25px;
  font-size: 12px;
  page-break-inside: avoid;
}
.closing-text {
  margin-bottom: 20px;
}
.signature-block {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.signature-col {
  width: 30%;
}
.signature-space {
  height: 60px;
}
.signature-name {
  font-weight: bold;
  margin-top: 5px;
}
.company-details {
  width: 65%;
  font-size: 11px;
  line-height: 1.4;
  border-left: 2px solid #000;
  padding-left: 15px;
}
.company-details p {
  margin: 0;
}
.company-details .company-name {
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 5px;
}
</style>
