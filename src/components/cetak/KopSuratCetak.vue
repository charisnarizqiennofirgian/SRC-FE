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
      <div class="svlk-content">
        <img :src="logoSVLK" alt="SVLK Logo" class="svlk-logo" />
      </div>
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
  border-bottom: 2.5px solid #000;
  padding: 5px 0 10px 0;
  gap: 0;
  width: 100%;
  box-sizing: border-box;
}

.company-logo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding-right: 15px;
}

.logo-img {
  width: 110px;
  height: 110px;
  object-fit: contain;
}

.company-details {
  flex: 1;
  padding: 0;
}

.company-name {
  font-family: 'Times New Roman', Times, serif;
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 -2px 0;
  color: #000;
  letter-spacing: -0.5px;
}

.company-tagline {
  font-family: Arial, sans-serif;
  font-size: 11px;
  font-weight: bold;
  margin: 0 0 5px 0;
  color: #000;
  letter-spacing: 0.2px;
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
  font-family: 'Times New Roman', Times, serif;
  font-size: 14px;
  margin: 0;
  line-height: 1.2;
  color: #000;
  font-weight: 400;
}

.company-contact a {
  color: #0066cc;
  text-decoration: underline;
}

.svlk-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-left: 10px;
}

.svlk-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.svlk-logo {
  width: 140px;
  height: auto;
  object-fit: contain;
}

@media print {
  .invoice-header {
    padding: 5px 0 8px 0 !important;
  }
  .logo-img {
    width: 100px !important;
    height: 100px !important;
  }
  .svlk-logo {
    width: 130px !important;
  }
}
</style>
