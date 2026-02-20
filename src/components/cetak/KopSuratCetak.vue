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
  padding: 0 0 4px 0;
  width: 100%;
  box-sizing: border-box;
  margin-top: -12px;
}

.company-logo {
  flex: 0 0 auto;
  padding-right: 0;
}

.logo-img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  display: block;
}

.company-details {
  flex: 1;
  padding: 0 15px;
  min-width: 0;
  margin-top: -10px;
}

.company-name {
  font-family: Arial, sans-serif;
  font-size: 40px;
  font-weight: 900;
  margin: 0 0 1px 0;
  color: #000;
  letter-spacing: 0.2px;
}

.company-tagline {
  font-family: Arial, sans-serif;
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #000;
  letter-spacing: 0.3px;
}

.highlight-S,
.highlight-B,
.highlight-C {
  color: #ff0000;
  font-size: 13px;
}

.company-address,
.company-location,
.company-contact,
.company-phone {
  font-family: Arial, sans-serif;
  font-size: 14px;
  margin: 0;
  line-height: 1.45;
  color: #000;
  font-weight: 400;
}

.company-location {
  font-style: italic;
}

.company-contact a {
  color: #0066cc;
  text-decoration: none;
}

.svlk-wrapper {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.svlk-logo {
  width: 145px;
  height: auto;
  object-fit: contain;
  display: block;
}

@media print {
  .invoice-header {
    padding: 0 0 6px 0 !important;
    page-break-inside: avoid;
  }
  .logo-img {
    width: 100px !important;
    height: 100px !important;
  }
  .svlk-logo {
    width: 120px !important;
  }
  .company-name {
    font-size: 17px !important;
  }
  .company-tagline {
    font-size: 11px !important;
  }
  .company-address,
  .company-location,
  .company-contact,
  .company-phone {
    font-size: 10px !important;
    line-height: 1.4 !important;
  }
}
</style>