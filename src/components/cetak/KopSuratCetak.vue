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
  border-bottom: 3px solid #000;
  padding: 0;
  margin-top: -10mm;
  width: 100%;
  box-sizing: border-box;
}

.company-logo {
  flex: 0 0 38mm;
  padding-right: 2mm;
}

.logo-img {
  width: 38mm;
  height: 38mm;
  object-fit: contain;
  display: block;
}

.company-details {
  flex: 1;
  padding: 0;
  min-width: 0;
}

.company-name {
  font-family: 'Constantia', serif;
  font-size: 5.8mm;
  font-weight: 900;
  margin: 0;
  color: #000;
  letter-spacing: 0.2px;
  line-height: 1.1;
  white-space: nowrap;
}

.company-tagline {
  font-family: Arial, sans-serif;
  font-size: 3.5mm;
  font-weight: 700;
  margin: 0 0 1.5mm 0;
  color: #000;
  letter-spacing: 0.3px;
  line-height: 1.1;
}

.highlight-S,
.highlight-B,
.highlight-C {
  color: #ff0000;
}

.company-address {
  font-family: 'Times New Roman', serif;
  font-size: 3.5mm;
  margin: 0.5mm 0 0 0;
  line-height: 1.3;
  color: #000;
  font-weight: 400;
}

.company-location {
  font-family: 'Times New Roman', serif;
  font-size: 3.5mm;
  margin: 0.5mm 0 0 0;
  line-height: 1.3;
  color: #000;
  font-weight: 400;
}

.company-contact {
  font-family: 'Times New Roman', serif;
  font-size: 3.5mm;
  margin: 0.5mm 0 0 0;
  line-height: 1.3;
  color: #000;
  font-weight: 400;
}

.company-phone {
  font-family: 'Times New Roman', serif;
  font-size: 3.5mm;
  margin: 0.5mm 0 0 0;
  line-height: 1.3;
  color: #000;
  font-weight: 400;
}

.company-contact a {
  color: #0066cc;
  text-decoration: none;
}

.svlk-wrapper {
  flex: 0 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding-left: 1mm;
}

.svlk-logo {
  width: auto;
  height: 38mm;
  object-fit: contain;
  display: block;
}

@media print {
  .invoice-header {
    page-break-inside: avoid;
  }
}
</style>