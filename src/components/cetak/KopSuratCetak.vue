<template>
  <header class="invoice-header">
    <div class="company-logo">
      <img :src="logoSBC" alt="Company Logo" class="logo-img" />
    </div>
    <div class="company-details">
      <h1 class="company-name">SURYA BANGKIT CEMERLANG, PT</h1>
      <p class="company-tagline">
        <span class="highlight-S">S</span>UPERB <span class="highlight-B">B</span>EAUTY
        <span class="highlight-C">C</span>OMFORT
      </p>
      <p class="company-address">Jl. Raya Semarang Purwodadi Km. 18 Karangawen, Demak 59566</p>
      <p class="company-location">Central Java - Indonesia</p>
      <p class="company-contact">
        Email : sunbcoutdoor@gmail.com / Website :
        <a href="https://www.surya-furniture.com" target="_blank">www.surya-furniture.com</a>
      </p>
      <p class="company-phone">Ph/Fax : +6224 76583167 / +6224 76412468</p>
    </div>
    <div class="svlk-wrapper">
      <img :src="logoSVLK" alt="SVLK Logo" class="svlk-logo" />
    </div>
  </header>
</template>

<script setup>
import logoSBC from '@/assets/logo.jpeg?url'
import logoSVLK from '@/assets/lgo.jpeg?url'
</script>

<style scoped>
.invoice-header {
  display: flex;
  align-items: center;
  border-bottom: 2.5pt solid #000;
  padding-bottom: 3mm;
  margin-top: -10mm; /* kompensasi padding sheet di screen */
  width: 100%;
  box-sizing: border-box;
  gap: 3mm;
}

.company-logo {
  flex: 0 0 34mm;
}

.logo-img {
  width: 34mm;
  height: 34mm;
  object-fit: contain;
  display: block;
}

.company-details {
  flex: 1;
  padding: 0;
  min-width: 0;
}

.company-name {
  font-family: 'Constantia', Georgia, serif;
  font-size: 16pt;
  font-weight: 900;
  margin: 0 0 0.5mm 0;
  color: #000;
  letter-spacing: 0.3px;
  line-height: 1.15;
  white-space: nowrap;
}

.company-tagline {
  font-family: 'Times New Roman', Times, serif;
  font-size: 10.5pt;
  font-weight: 700;
  margin: 0 0 1mm 0;
  color: #000;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.highlight-S,
.highlight-B,
.highlight-C {
  color: #cc0000;
}

.company-address,
.company-location,
.company-contact,
.company-phone {
  font-family: 'Times New Roman', Times, serif;
  font-size: 9.5pt;
  margin: 0.3mm 0 0 0;
  line-height: 1.35;
  color: #000;
  font-weight: 400;
}

.company-contact a {
  color: #0055aa;
  text-decoration: none;
}

/* SVLK: seukuran logo, rata kiri, tanpa garis */
.svlk-wrapper {
  flex: 0 0 36mm;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
}

.svlk-logo {
  width: 36mm;
  height: 36mm;
  object-fit: contain;
  display: block;
}

@media print {
  .invoice-header {
    margin-top: 0;
    page-break-inside: avoid;
  }

  .company-name {
    font-size: 16pt;
    white-space: normal;
    word-break: break-word;
  }

  .highlight-S,
  .highlight-B,
  .highlight-C {
    color: #cc0000 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .company-logo,
  .svlk-wrapper {
    flex-shrink: 0;
  }
}
</style>