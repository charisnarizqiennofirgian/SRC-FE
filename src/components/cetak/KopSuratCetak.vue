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
    <div class="svlk-wrapper">
      <img src="@/assets/lgo.jpeg" alt="SVLK Logo" class="svlk-logo" />
    </div>
  </header>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');

.invoice-header {
  display: flex;
  align-items: center;
  border-bottom: 3px solid #000;
  padding: 8px 0;
  gap: 0;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
}

/* Logo SBC - pepet kiri, no margin */
.company-logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
}

.logo-img {
  width: 130px;
  height: 130px;
  object-fit: contain;
  display: block;
  margin: 0;
  padding: 0;
}

/* Detail Perusahaan */
.company-details {
  flex: 1;
  min-width: 0;
  text-align: left;
  padding: 0 0 0 8px;
  margin: 0;
}

.company-name {
  font-family: 'Cinzel', 'Times New Roman', serif;
  font-size: 18px;
  font-weight: 900;
  margin: 0 0 3px 0;
  color: #000;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.company-tagline {
  font-family: 'Cinzel', 'Times New Roman', serif;
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 5px 0;
  color: #000;
  letter-spacing: 0.5px;
}

.company-address,
.company-location,
.company-contact,
.company-phone {
  font-family: 'Times New Roman', Times, serif;
  font-size: 12px;
  margin: 2px 0;
  line-height: 1.4;
  color: #000;
}

.company-location {
  font-style: italic;
}

.company-contact a {
  color: #0066cc;
  text-decoration: none;
}

/* Logo SVLK - pepet kanan, no gap */
.svlk-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
}

.svlk-logo {
  width: 150px;
  height: auto;
  object-fit: contain;
  display: block;
  margin: 0;
  padding: 0;
}

@media print {
  .invoice-header {
    padding: 6px 0 !important;
    gap: 0 !important;
    page-break-inside: avoid;
  }
  .logo-img {
    width: 120px !important;
    height: 120px !important;
  }
  .svlk-logo {
    width: 140px !important;
  }
  .company-name {
    font-size: 18px !important;
  }
  .company-tagline {
    font-size: 14px !important;
  }
  .company-address,
  .company-location,
  .company-contact,
  .company-phone {
    font-size: 12px !important;
  }
}

@media screen and (max-width: 768px) {
  .invoice-header {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  .company-logo {
    margin: 0 auto;
  }
  .company-details {
    text-align: center;
    padding: 0;
  }
  .svlk-wrapper {
    margin: 0 auto;
  }
}
</style>
