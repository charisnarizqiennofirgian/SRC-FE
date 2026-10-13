<template>
  <div class="print-page-container">
    <div class="print-controls-modern">
      <button @click="goBack" class="btn-control btn-back-modern">
        <span class="btn-icon">↩️</span>
        <span class="btn-text">Kembali</span>
      </button>

      <div class="doc-title-control">🚚 Delivery Order (Supir)</div>

      <button @click="handlePrint" class="btn-control btn-print-modern" :disabled="loading || !deliveryOrder">
        <span class="btn-icon">🖨️</span>
        <span class="btn-text">Cetak</span>
      </button>
    </div>

    <div v-if="loading || !deliveryOrder" class="loading-container-print">
      <div class="spinner-print"></div>
      <p>Memuat data...</p>
    </div>

    <div v-else class="print-sheet-a4">
      <KopSuratCetak />
      <TemplateDeliveryOrder :data="deliveryOrder" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/api/axios'
import { useToast } from 'vue-toastification'
import KopSuratCetak from '@/components/cetak/KopSuratCetak.vue'
import TemplateDeliveryOrder from '@/views/penjualan/templates/TemplateDeliveryOrder.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const loading = ref(true)
const deliveryOrder = ref(null)

const fetchDeliveryOrder = async () => {
  loading.value = true
  try {
    const response = await apiClient.get(`/production/shipment-confirmations/${route.params.id}`)
    deliveryOrder.value = response.data.data
  } catch {
    toast.error('Gagal memuat data pengiriman.')
  } finally {
    loading.value = false
  }
}

const handlePrint = () => {
  window.print()
}

const goBack = () => {
  router.push({ name: 'KonfirmasiPengirimanList' })
}

onMounted(fetchDeliveryOrder)
</script>

<style scoped>
.print-page-container {
  width: 100%;
  min-height: 100vh;
  background: #eef1f5;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.print-controls-modern {
  width: 100%;
  max-width: 210mm;
  background: #fff;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  border-radius: 10px;
  border: 1px solid #dde1e6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  box-sizing: border-box;
}

.doc-title-control {
  font-weight: 800;
  color: #0e7490;
}

.btn-control {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.1rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-back-modern {
  background: #fff;
  color: #374151;
  border-color: #d1d5db;
}

.btn-back-modern:hover {
  background: #f3f4f6;
}

.btn-print-modern {
  background: #0891b2;
  color: #fff;
}

.btn-print-modern:hover {
  background: #0e7490;
}

.btn-print-modern:disabled {
  opacity: 0.6;
  cursor: default;
}

.loading-container-print {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.spinner-print {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #0891b2;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.print-sheet-a4 {
  width: 210mm;
  min-height: 297mm;
  background: #fff;
  padding: 8mm 10mm;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.25);
  font-family: 'Arial', 'Helvetica', sans-serif;
  font-size: 9px;
  line-height: 1.3;
  color: #000;
  margin-bottom: 30px;
  box-sizing: border-box;
  border-radius: 8px;
}

@media print {
  @page {
    size: A4 portrait;
    margin: 8mm;
  }

  .print-page-container {
    width: 100% !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
    display: block !important;
  }

  .print-controls-modern,
  .loading-container-print {
    display: none !important;
  }

  .print-sheet-a4 {
    width: 100%;
    max-width: 210mm;
    min-height: 0;
    margin: 0 auto !important;
    padding: 6mm 8mm;
    box-shadow: none !important;
    border-radius: 0 !important;
    font-size: 8.5px !important;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  table {
    page-break-inside: avoid;
  }
}

@media screen and (max-width: 768px) {
  .print-page-container {
    padding: 1rem 0.75rem;
  }

  .print-controls-modern {
    flex-direction: column;
  }

  .print-sheet-a4 {
    width: 100%;
    padding: 6mm;
  }
}
</style>
