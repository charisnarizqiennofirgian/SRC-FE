<template>
  <div class="print-container">
    <div v-if="loading" class="loading-state">
      <p>Memuat data untuk dicetak...</p>
    </div>

    <div v-else-if="po" class="invoice-box">
      <!-- HEADER KOP SURAT -->
      <KopSuratCetak :poNumber="po.po_number" />

      <div class="po-title-section">
        <h2 class="po-title">PURCHASE ORDER</h2>
        <p class="po-number-line">{{ po.po_number }}</p>
      </div>

      <!-- INFO SUPPLIER -->
      <section class="invoice-info">
        <p class="date-line">Demak, {{ formatTanggal(po.order_date) }}</p>
        <div class="info-supplier">
          <p>Kepada Yth.</p>
          <p class="supplier-name">{{ po.supplier.name }}</p>
          <p>{{ po.supplier.address_city || po.supplier.address }}</p>
        </div>

      </section>

      <!-- LAYOUT DINAMIS -->
      <LayoutKarton v-if="po.type === 'karton'" :details="po.details" :po="po" />
      <LayoutKayu v-else-if="po.type === 'kayu'" :details="po.details" :po="po" />
      <LayoutOperasional v-else :details="po.details" :po="po" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '../../api/axios'

import KopSuratCetak from '@/components/cetak/KopSuratCetak.vue'
import LayoutOperasional from '@/components/cetak/LayoutOperasional.vue'
import LayoutKarton from '@/components/cetak/LayoutKarton.vue'
import LayoutKayu from '@/components/cetak/LayoutKayu.vue'

const route = useRoute()
const loading = ref(true)
const po = ref(null)

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

const formatTanggal = (tanggal) => {
  if (!tanggal) return ''
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
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
}

.print-container {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.invoice-box {
  padding: 0 8mm 8mm 8mm;
  font-family: Calibri, 'Candara', 'Segoe UI', sans-serif;
  font-size: 12pt;
  line-height: 1.4;
  color: #000;
}

.po-title-section {
  text-align: center;
  margin: 0 0 10px 0;
  padding-bottom: 5px;
}

.po-title {
  font-family: 'Times New Roman', serif;
  font-size: 12pt;
  font-weight: 900;
  margin: 0 0 2px 0;
  text-decoration: underline;
  letter-spacing: 0.8px;
  color: #000;
}

.po-number-line {
  font-family: 'Times New Roman', serif;
  font-size: 12pt;
  margin: 0;
  font-weight: 600;
  font-style: italic;
  color: #000;
}

.invoice-info {
  margin-top: 0;
  margin-bottom: 10px;
}

.date-line {
  text-align: left !important;
  margin-bottom: 2px !important;
  font-family: Calibri, 'Candara', 'Segoe UI', sans-serif;
  font-size: 16pt;
  font-weight: 400;
}

.info-supplier {
  margin-bottom: 12px;
}

.info-supplier p {
  margin: 0 0 3px 0;
  line-height: 1.4;
  font-family: Calibri, 'Candara', 'Segoe UI', sans-serif;
  font-size: 16pt;
}

.info-supplier .supplier-name {
  font-weight: 400;
  text-decoration: underline;
}

/* ── Tanggal Kirim ── */
.delivery-date-line {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
  font-size: 10px;
}

.delivery-label {
  font-weight: 700;
  min-width: 90px;
}

.delivery-sep {
  font-weight: 700;
}

.delivery-value {
  font-weight: 600;
}

.intro-text {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 10px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  font-size: 10px;
}

.items-table th,
.items-table td {
  border: 1px solid #000;
  padding: 5px 7px;
  vertical-align: top;
}

.items-table th {
  background-color: #fff;
  text-align: center;
  font-weight: 700;
  font-size: 9px;
}

.items-table .center {
  text-align: center;
}
.items-table .right {
  text-align: right;
}

@page {
  margin: 0 !important;
}

@media print {
  html,
  body,
  .print-container {
    margin: 0 !important;
    padding: 0 !important;
    background: white;
    box-shadow: none;
  }

  .invoice-box {
    padding: 0 8mm 8mm 8mm !important;
  }
}
</style>
