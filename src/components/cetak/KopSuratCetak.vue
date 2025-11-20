<template>
  <header class="invoice-header">
    <div class="company-logo">
      <img src="@/assets/logo.jpeg" alt="Company Logo" class="logo-img" />
    </div>
    <div class="company-details">
      <h1 class="company-name">SURYA BANGKIT CEMERLANG, PT</h1>
      <p class="company-tagline">SUPERB BEAUTY COMFORT</p>
      <p class="company-address">Jl. Raya Semarang Purwodadi Km. 18 Karangawen, Demak 59566</p>
      <p class="company-location">Central Java - Indonesia</p>
      <p class="company-contact">
        Email : sunbcoutdoor@gmail.com / Website :
        <a href="https://www.surya-furniture.com" target="_blank">www.surya-furniture.com</a>
      </p>
      <p class="company-phone">Ph/Fax : +6224 76583167/+6224 76412468</p>
    </div>
    <div class="invoice-title">
      <img src="@/assets/lgo.jpeg" alt="SVLK Logo" class="svlk-logo" />
    </div>
  </header>
</template>

<style scoped>
.invoice-header {
  display: flex;
  align-items: center;
  border-bottom: 3px solid #000;
  padding: 8px 0 8px 0;
  gap: 0;
  position: relative;
}
.company-logo {
  display: flex;
  align-items: center;
  margin-right: 0;
}
.logo-img {
  width: 108px;
  height: 108px;
  object-fit: contain;
}
.company-details {
  min-width: 0;
  flex-shrink: 1;
  flex-grow: 1;
  text-align: left;
  padding: 0;
  margin: 0;
}
.company-name {
  font-size: 26px;
  font-weight: 900;
  margin: 0 0 2px 0;
  color: #000;
  letter-spacing: 0.5px;
  line-height: 1.1;
}
.company-tagline {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #000;
  letter-spacing: 1px;
}
.company-address {
  font-size: 14px;
  margin: 1px 0;
}
.company-location {
  font-size: 13px;
  margin: 1px 0;
  font-style: italic;
}
.company-contact {
  font-size: 12px;
  margin: 1px 0;
}
.company-contact a {
  color: #0066cc;
  text-decoration: none;
}
.company-contact a:hover {
  text-decoration: underline;
}
.company-phone {
  font-size: 12px;
  margin: 1px 0;
}
.invoice-title {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%) translateX(-80px);
}
.svlk-logo {
  width: 140px;
  height: auto;
  object-fit: contain;
  display: block;
}
/* === CETAK: ada padding kanan khusus print agar logo tidak nabrak kertas === */
@media print {
  .invoice-header {
    padding: 1px 20px 1px 5px !important;
    gap: 0 !important;
  }
  .logo-img {
    width: 98px !important;
    height: 98px !important;
  }
  .invoice-title {
    transform: translateY(-50%) translateX(-60px) !important;
  }
  .svlk-logo {
    width: 130px !important;
  }
  .company-name {
    font-size: 25px !important;
  }
  .company-tagline {
    font-size: 12px !important;
  }
  .company-address,
  .company-location {
    font-size: 12px !important;
  }
  .company-contact,
  .company-phone {
    font-size: 11px !important;
  }
}
</style>
