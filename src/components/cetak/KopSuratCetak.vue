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
  padding: 6px 0;
  gap: 8px;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  overflow: visible;
}

.company-logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-right: 8px;
}

.logo-img {
  width: 90px;
  height: 90px;
  object-fit: contain;
  display: block;
}

.company-details {
  min-width: 0;
  flex-shrink: 1;
  flex-grow: 1;
  text-align: left;
  padding: 0;
  margin: 0;
  overflow: visible;
}

.company-name {
  font-size: 22px;
  font-weight: 900;
  margin: 0 0 2px 0;
  color: #000;
  letter-spacing: 0.3px;
  line-height: 1.1;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.company-tagline {
  font-size: 12px;
  font-weight: 700;
  margin: 0 0 3px 0;
  color: #000;
  letter-spacing: 0.8px;
}

.company-address {
  font-size: 11px;
  margin: 1px 0;
  line-height: 1.3;
}

.company-location {
  font-size: 10px;
  margin: 1px 0;
  font-style: italic;
  line-height: 1.3;
}

.company-contact {
  font-size: 10px;
  margin: 1px 0;
  line-height: 1.3;
}

.company-contact a {
  color: #0066cc;
  text-decoration: none;
}

.company-contact a:hover {
  text-decoration: underline;
}

.company-phone {
  font-size: 10px;
  margin: 1px 0;
  line-height: 1.3;
}

.invoice-title {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  flex-shrink: 0;
}

.svlk-logo {
  width: 110px;
  height: auto;
  object-fit: contain;
  display: block;
}

/* ========================================
   PRINT MODE - OPTIMIZED
   ======================================== */
@media print {
  .invoice-header {
    padding: 4px 0 !important;
    gap: 6px !important;
    page-break-inside: avoid;
  }

  .company-logo {
    margin-right: 6px;
  }

  .logo-img {
    width: 80px !important;
    height: 80px !important;
  }

  .invoice-title {
    right: 0 !important;
    transform: translateY(-50%) !important;
  }

  .svlk-logo {
    width: 100px !important;
  }

  .company-name {
    font-size: 20px !important;
    letter-spacing: 0.2px !important;
  }

  .company-tagline {
    font-size: 11px !important;
    letter-spacing: 0.6px !important;
  }

  .company-address {
    font-size: 10px !important;
  }

  .company-location {
    font-size: 9px !important;
  }

  .company-contact,
  .company-phone {
    font-size: 9px !important;
  }

  /* Pastikan tidak ada overflow */
  .company-details * {
    overflow: visible !important;
  }
}

/* ========================================
   RESPONSIVE (OPTIONAL)
   ======================================== */
@media screen and (max-width: 768px) {
  .invoice-header {
    flex-direction: column;
    text-align: center;
  }

  .company-logo {
    margin: 0 auto 10px;
  }

  .company-details {
    text-align: center;
  }

  .invoice-title {
    position: relative;
    transform: none;
    margin-top: 10px;
    right: auto;
    top: auto;
  }
}
</style>
