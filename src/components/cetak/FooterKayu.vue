<template>
  <footer class="invoice-footer-kayu">
    <div class="terms-section">
      <div class="term-item">
        <strong>Target pengiriman:</strong>
        <p>
          Pengiriman ke-1 diusahakan 1 minggu setelah penurunan PO. Paling lambat 1 bulan dari
          tanggal PO. Exp. TANGGAL PO + SATU BULAN
        </p>
      </div>
      <div class="term-item">
        <strong>Persyaratan:</strong>
        <ol>
          <li>
            Kayu tidak boleh memiliki cacat seperti mata, serat hitam, serat mahkota, alur minyak
            (lurik), murai, doreng, kuku macan, dan cacat yang lainnya.
          </li>
          <li>Kayu tidak boleh lengkung, pecah, retak, kayu gubal, hati, dan kayu muda.</li>
          <li>Kualitas gergajian tidak boleh bergelombang.</li>
          <li>Kayu harus dari Unit Perhutani I.</li>
          <li>
            Kayu harus dilengkapi dengan dokumen legalitas kayu sesuai ketentuan yang berlaku.
          </li>
          <li>Kualitas sesuai dengan kesepakatan yang telah dilakukan.</li>
          <li>
            Kayu jati yang low density (gabeng) dan ada serat putih tidak diterima (Ciri-ciri dari
            Kendal, Batan, dan sekitarnya).
          </li>
        </ol>
      </div>
    </div>

    <p class="closing-text">Atas perhatian dan kerjasama yang baik, kami ucapkan terima kasih.</p>
    <div class="signature-col">
      <p>Hormat kami,</p>
      <div class="signature-space"></div>
      <p class="signature-name">Olivia</p>
    </div>
  </footer>
</template>

<style scoped>
.invoice-footer-kayu {
  width: 100%;
  margin-top: 5mm;
  font-size: 10pt;
  font-family: 'Times New Roman', Times, serif;
  page-break-inside: avoid;
}
.terms-section {
  border-top: 1.5pt solid #000;
  padding-top: 3mm;
}
.term-item {
  margin-bottom: 3mm;
}
.term-item p {
  margin: 0;
}
.term-item ol {
  margin: 2mm 0 0 5mm;
  padding-left: 0;
}
.term-item li {
  margin-bottom: 1mm;
}

.closing-text {
  margin-top: 4mm;
  margin-bottom: 4mm;
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
</style>
