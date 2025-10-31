<template>
  <footer class="invoice-footer-kayu">
    <div class="terms-section">
      <div class="term-item">
        <strong>Target pengiriman:</strong>
        <p>
          Pengiriman ke-1 diusahakan 2 minggu setelah penurunan PO. Paling lambat 1 bulan dari
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
      <p class="signature-name">louis Sebastian</p>
    </div>
  </footer>
</template>

<style scoped>
.invoice-footer-kayu {
  width: 100%;
  margin-top: 25px;
  font-size: 12px;
  page-break-inside: avoid;
}
.terms-section {
  border-top: 1px solid #000;
  padding-top: 10px;
}
.term-item {
  margin-bottom: 10px;
}
.term-item p {
  margin: 0;
}
.term-item ol {
  margin: 5px 0 0 20px;
  padding-left: 0;
}
.term-item li {
  margin-bottom: 3px;
}

.closing-text {
  margin-top: 20px;
  margin-bottom: 20px;
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
</style>
