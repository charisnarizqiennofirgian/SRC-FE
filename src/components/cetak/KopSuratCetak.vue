<template>
  <header class="invoice-header">
    <!-- LEFT: Company Logo -->
    <div class="company-logo">
      <img src="@/assets/logo.jpeg" alt="Company Logo" class="logo-img" />
    </div>

    <!-- CENTER: Company Details -->
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

    <!-- RIGHT: SVLK Logo -->
    <div class="invoice-title">
      <img src="@/assets/logo2.png" alt="SVLK Logo" class="svlk-logo" />
    </div>
  </header>
</template>

<style scoped>
.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 3px solid #000;
  padding: 12px 15px;
  gap: 15px;
}

/* ===== LEFT: COMPANY LOGO ===== */
.company-logo {
  flex-basis: 15%;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.logo-img {
  width: 90px;
  height: 90px;
  object-fit: contain;
}

/* ===== CENTER: COMPANY DETAILS ===== */
.company-details {
  flex-basis: 55%;
  flex-shrink: 0;
  text-align: center;
}

.company-name {
  font-size: 17px;
  font-weight: 900;
  margin: 0 0 1px 0;
  color: #000;
  letter-spacing: 0.3px;
  line-height: 1.2;
}

.company-tagline {
  font-size: 9px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #000;
  letter-spacing: 0.8px;
}

.company-address {
  font-size: 9px;
  margin: 1px 0;
  color: #000;
  line-height: 1.3;
}

.company-location {
  font-size: 9px;
  margin: 1px 0;
  color: #000;
  font-style: italic;
}

.company-contact {
  font-size: 8px;
  margin: 1px 0;
  color: #000;
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
  font-size: 8px;
  margin: 1px 0;
  color: #000;
}

/* ===== RIGHT: SVLK LOGO ===== */
.invoice-title {
  flex-basis: 30%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.svlk-logo {
  width: 110px;
  height: auto;
  object-fit: contain;
}

/* ===== PRINT SPECIFIC ===== */
@media print {
  .invoice-header {
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 8px 12px !important;
    border-bottom: 3px solid #000 !important;
    page-break-inside: avoid !important;
  }

  .company-logo {
    flex-basis: 15% !important;
    flex-shrink: 0 !important;
  }

  .company-details {
    flex-basis: 55% !important;
    flex-shrink: 0 !important;
    text-align: center !important;
  }

  .invoice-title {
    flex-basis: 30% !important;
    flex-shrink: 0 !important;
    justify-content: flex-end !important;
  }

  .logo-img {
    width: 85px !important;
    height: 85px !important;
  }

  .svlk-logo {
    width: 105px !important;
  }

  .company-name {
    font-size: 16px !important;
  }

  .company-tagline {
    font-size: 8px !important;
  }

  .company-address,
  .company-location {
    font-size: 8px !important;
  }

  .company-contact,
  .company-phone {
    font-size: 7px !important;
  }
}
</style>
