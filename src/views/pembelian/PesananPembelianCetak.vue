<template>
  <div class="print-container">
    <div v-if="loading" class="loading-state">
      <p>Memuat data untuk dicetak...</p>
    </div>

    <div v-else-if="po" class="invoice-box">
      <PrintKopWrapper>
        <div class="po-title-section">
          <h2 class="po-title">PURCHASE ORDER</h2>
          <p class="po-number-line">{{ po.po_number }}</p>
        </div>

        <!-- INFO SUPPLIER -->
        <section class="invoice-info">
          <p class="date-line">Demak, {{ formatTanggal(po.order_date, po.currency) }}</p>
          <div class="info-supplier">
            <p>{{ (po.currency === 'USD' || po.currency === 'EUR') ? 'To:' : 'Kepada Yth.' }}</p>
            <p class="supplier-name">{{ po.supplier.name }}</p>
            <p>{{ po.supplier.address_city || po.supplier.address }}</p>
          </div>
        </section>

        <!-- LAYOUT DINAMIS -->
        <LayoutKarton v-if="po.type === 'karton'" :details="po.details" :po="po" />
        <LayoutKayu v-else-if="po.type === 'kayu'" :details="po.details" :po="po" :showPeruntukan="isInternal" />
        <LayoutOperasional v-else :details="po.details" :po="po" />
      </PrintKopWrapper>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '../../api/axios'

import PrintKopWrapper from '@/components/cetak/PrintKopWrapper.vue'
import LayoutOperasional from '@/components/cetak/LayoutOperasional.vue'
import LayoutKarton from '@/components/cetak/LayoutKarton.vue'
import LayoutKayu from '@/components/cetak/LayoutKayu.vue'

const route = useRoute()
const loading = ref(true)
const po = ref(null)
const isInternal = computed(() => route.query.internal === '1')

const fetchPODetail = async () => {
  try {
    const poId = route.params.id
    const response = await apiClient.get(`/purchase-orders/${poId}?include=details.item.unit`)
    const data = response.data.data

    data.details = data.details.map((detail) => {
      if (detail.specifications && typeof detail.specifications === 'string') {
        detail.specifications = JSON.parse(detail.specifications)
      } else if (!detail.specifications) {
        detail.specifications = {}
      }
      return detail
    })
    po.value = data
  } catch (error) {
    console.error('Gagal memuat detail PO:', error)
  } finally {
    loading.value = false
  }
}

const formatTanggal = (tanggal, currency = 'IDR') => {
  if (!tanggal) return ''
  const locale = (currency === 'USD' || currency === 'EUR') ? 'en-US' : 'id-ID'
  return new Date(tanggal).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const formatCurrencyIDR = (value) => {
  if (!value || isNaN(value)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

onMounted(async () => {
  await fetchPODetail()
  if (po.value) {
    await nextTick()
    // Tunggu semua gambar selesai load dulu
    const images = document.querySelectorAll('img')
    const imagePromises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve()
      return new Promise((resolve) => {
        img.onload = resolve
        img.onerror = resolve
      })
    })
    await Promise.all(imagePromises)
    window.print()
  } else {
    alert('Data PO tidak ditemukan atau gagal dimuat.')
  }
})
</script>

<style>
body {
  background-color: #f0f0f0;
  overflow-y: auto !important;
}

.print-container {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.invoice-box {
  padding: 15mm 18mm 10mm 18mm;
  font-family: 'Times New Roman', Times, serif;
  font-size: 10pt;
  line-height: 1.4;
  color: #000;
}

.po-title-section {
  text-align: center;
  margin: 5mm 0 4mm 0;
  padding-bottom: 3mm;
  border-bottom: 1pt solid #000;
}

.po-title {
  font-family: 'Times New Roman', Times, serif;
  font-size: 13pt;
  font-weight: 900;
  margin: 0 0 1mm 0;
  text-decoration: underline;
  letter-spacing: 0.5pt;
  color: #000;
}

.po-number-line {
  font-family: 'Times New Roman', Times, serif;
  font-size: 10pt;
  margin: 0.5mm 0 0 0;
  font-weight: 600;
  font-style: italic;
  color: #000;
}

.invoice-info {
  margin: 4mm 0;
}

.date-line {
  text-align: left;
  margin-bottom: 3mm;
  font-family: 'Times New Roman', Times, serif;
  font-size: 11pt;
  font-weight: 400;
}

.info-supplier {
  margin-bottom: 3mm;
}

.info-supplier p {
  margin: 0 0 1mm 0;
  line-height: 1.4;
  font-family: 'Times New Roman', Times, serif;
  font-size: 11pt;
}

.info-supplier .supplier-name {
  font-weight: 700;
  text-decoration: underline;
}

.intro-text {
  font-weight: 400;
  margin-bottom: 3mm;
  font-family: 'Times New Roman', Times, serif;
  font-size: 10pt;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 5mm;
  font-size: 10pt;
  font-family: 'Times New Roman', Times, serif;
}

.items-table th,
.items-table td {
  border: 0.75pt solid #000;
  padding: 3pt 5pt;
  vertical-align: top;
}

.items-table th {
  background-color: #f0f0f0;
  text-align: center;
  font-weight: bold;
  font-size: 9pt;
  text-transform: uppercase;
  letter-spacing: 0.3pt;
}

.items-table .center { text-align: center; }
.items-table .right  { text-align: right; }

@page {
  size: A4 portrait;
  margin: 15mm 20mm;
}

@media print {
  html, body, #app {
    height: auto !important;
    min-height: auto !important;
    overflow: visible !important;
    background: white !important;
  }

  .print-container {
    width: 100% !important;
    min-height: auto !important;
    margin: 0 !important;
    box-shadow: none !important;
    overflow: visible !important;
  }

  .invoice-box {
    padding: 0 !important;
  }
}
</style>
