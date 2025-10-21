<template>
  <div class="print-container">
    <div v-if="loading" class="loading-state">
      <p>Memuat data untuk dicetak...</p>
    </div>

    <div v-else-if="po" class="invoice-box">
      <!-- HEADER KOP SURAT -->
      <KopSuratCetak :poNumber="po.po_number" />

      <!-- ✅ TAMBAHAN: TITLE PURCHASE ORDER -->
      <div class="po-title-section">
        <h2 class="po-title">PURCHASE ORDER</h2>
        <p class="po-number-line">No. {{ po.po_number }}</p>
      </div>

      <!-- INFO SUPPLIER -->
      <section class="invoice-info">
        <p class="date-line">Demak, {{ formatTanggal(po.order_date) }}</p>
        <div class="info-supplier">
          <p>Kepada Yth.</p>
          <p class="supplier-name">{{ po.supplier.name }}</p>
          <p>{{ po.supplier.address_city || po.supplier.address }}</p>
        </div>
        <p class="intro-text">Dengan hormat,</p>
        <p>
          Dengan ini kami mengirimkan daftar pesanan kami untuk {{ po.supplier.name }} sebagai
          berikut:
        </p>
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

// Import Komponen Umum
import KopSuratCetak from '@/components/cetak/KopSuratCetak.vue'

// Import 3 LAYOUT UTAMA
import LayoutOperasional from '@/components/cetak/LayoutOperasional.vue'
import LayoutKarton from '@/components/cetak/LayoutKarton.vue'
import LayoutKayu from '@/components/cetak/LayoutKayu.vue'

const route = useRoute()
const loading = ref(true)
const po = ref(null)

const fetchPODetail = async () => {
  try {
    const poId = route.params.id
    // Panggil ?include=details.item.unit (untuk Operasional)
    const response = await apiClient.get(`/purchase-orders/${poId}?include=details.item.unit`)
    const data = response.data.data

    // "Buka kado" specifications
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

// Helper Tanggal
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
    window.print()
  } else {
    alert('Data PO tidak ditemukan atau gagal dimuat.')
  }
})
</script>

<style>
/* CSS Global untuk Cetak */
body {
  background-color: #f0f0f0;
}

.print-container {
  width: 210mm;
  min-height: 297mm;
  margin: 20px auto;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.invoice-box {
  padding: 15mm;
  font-family: Arial, sans-serif;
  font-size: 12px;
  line-height: 1.5;
  color: #333;
}

/* ✅ TAMBAHAN: PURCHASE ORDER TITLE */
.po-title-section {
  text-align: center;
  margin: 20px 0 25px 0;
  padding-bottom: 15px;
}

.po-title {
  font-size: 16px;
  font-weight: 900;
  margin: 0 0 3px 0;
  text-decoration: underline;
  letter-spacing: 0.8px;
  color: #000;
}

.po-number-line {
  font-size: 11px;
  margin: 0;
  font-weight: 600;
  font-style: italic;
  color: #000;
}

/* Info Supplier */
.invoice-info {
  margin-top: 0;
  margin-bottom: 20px;
}

.date-line {
  text-align: right;
  margin-bottom: 20px;
  font-size: 11px;
  font-weight: 600;
}

.info-supplier {
  margin-bottom: 20px;
}

.info-supplier p {
  margin: 0 0 3px 0;
  line-height: 1.4;
  font-size: 11px;
}

.info-supplier .supplier-name {
  font-weight: 700;
  text-decoration: underline;
}

.intro-text {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 11px;
}

/* CSS Tabel */
.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  font-size: 11px;
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
  font-size: 10px;
}

.items-table .center {
  text-align: center;
}

.items-table .right {
  text-align: right;
}

/* Print-specific styles */
@media print {
  body,
  .print-container {
    margin: 0;
    padding: 0;
    background: white;
    box-shadow: none;
  }

  .invoice-box {
    padding: 10mm;
  }

  .po-title {
    font-size: 15px;
  }

  .po-number-line {
    font-size: 10px;
  }

  .date-line,
  .info-supplier p,
  .intro-text {
    font-size: 10px;
  }

  .items-table {
    font-size: 10px;
  }

  .items-table th {
    font-size: 9px;
  }
}
</style>
