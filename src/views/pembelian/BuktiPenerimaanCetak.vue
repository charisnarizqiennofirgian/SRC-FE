<template>
  <div class="bpb-screen">
    <div class="bpb-toolbar no-print">
      <button class="bpb-btn-print" :disabled="!data" @click="printNow">🖨️ Cetak</button>
      <span class="bpb-toolbar-hint">
        Kertas A5 landscape<span v-if="pages.length > 1"> · {{ pages.length }} lembar</span>
      </span>
    </div>

    <div v-if="loading" class="bpb-message no-print">Memuat data penerimaan...</div>
    <div v-else-if="errorMessage" class="bpb-message no-print">{{ errorMessage }}</div>

    <template v-else-if="data">
      <div v-for="(page, pageIndex) in pages" :key="pageIndex" class="bpb-sheet">
        <div class="bpb-head">
          <div class="bpb-company">{{ COMPANY_NAME }}</div>
          <div class="bpb-title">BUKTI PENERIMAAN BARANG</div>
          <div class="bpb-head-spacer"></div>
        </div>

        <div class="bpb-identity">
          <table class="bpb-identity-left">
            <tbody>
              <tr>
                <td class="lbl">Supplier</td>
                <td class="sep">:</td>
                <td class="val dotted">{{ data.supplier_name || '' }}</td>
              </tr>
              <tr>
                <td class="lbl">Alamat</td>
                <td class="sep">:</td>
                <td class="val dotted address">{{ data.supplier_address || '' }}</td>
              </tr>
            </tbody>
          </table>
          <table class="bpb-identity-right">
            <tbody>
              <tr>
                <td class="lbl">NO.</td>
                <td class="sep">:</td>
                <td class="val dotted">{{ data.bpb_number }}</td>
              </tr>
              <tr>
                <td class="lbl">TGL.</td>
                <td class="sep">:</td>
                <td class="val dotted">{{ formatTanggal(data.receipt_date) }}</td>
              </tr>
              <tr>
                <td class="lbl">NO. SP</td>
                <td class="sep">:</td>
                <td class="val dotted">{{ data.po_number }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <table class="bpb-table">
          <colgroup>
            <col class="c-no" />
            <col class="c-name" />
            <col class="c-qty" />
            <col class="c-price" />
            <col class="c-amount" />
          </colgroup>
          <thead>
            <tr>
              <th>No.</th>
              <th>Nama Barang</th>
              <th>Banyaknya</th>
              <th>Harga / Unit</th>
              <th>Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(line, rowIndex) in page.rows" :key="rowIndex" class="bpb-row">
              <td class="center">{{ line ? pageIndex * ROWS_PER_PAGE + rowIndex + 1 : '' }}</td>
              <td class="name" :class="{ 'name-long': line && line.item_name.length > 55 }">
                <span>{{ line ? line.item_name : '' }}</span>
              </td>
              <td class="center">{{ line ? `${formatAngka(line.quantity)} ${line.unit || ''}` : '' }}</td>
              <td class="right">{{ line ? formatUang(line.price) : '' }}</td>
              <td class="right">{{ line ? formatUang(line.amount) : '' }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bpb-foot">
              <td colspan="3" class="bpb-notes">
                <span class="notes-label">Catatan :</span>
                <span class="notes-text">{{ notesText }}</span>
              </td>
              <td class="total-label">Total</td>
              <td class="right total-value">
                {{ page.isLast ? formatUang(data.total) : 'Bersambung' }}
              </td>
            </tr>
          </tfoot>
        </table>

        <div class="bpb-sign">
          <div class="sign-box">
            <div class="sign-title">Disetujui,</div>
            <div class="sign-line">(..................................)</div>
          </div>
          <div class="sign-box">
            <div class="sign-title">Diterima,</div>
            <div class="sign-line">(..................................)</div>
          </div>
        </div>

        <div class="bpb-bottom">
          <span>1. Bagian Keuangan</span>
          <span>2. Arsip</span>
          <span v-if="pages.length > 1" class="page-no">Lembar {{ pageIndex + 1 }} / {{ pages.length }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '@/api/axios'

const COMPANY_NAME = 'PT. SURYA BANGKIT CEMERLANG'
const ROWS_PER_PAGE = 8

const route = useRoute()
const data = ref(null)
const loading = ref(true)
const errorMessage = ref('')
let pageStyleEl = null

const pages = computed(() => {
  if (!data.value) return []
  const lines = data.value.lines || []
  const count = Math.max(1, Math.ceil(lines.length / ROWS_PER_PAGE))
  return Array.from({ length: count }, (_, i) => {
    const chunk = lines.slice(i * ROWS_PER_PAGE, (i + 1) * ROWS_PER_PAGE)
    const rows = [...chunk, ...Array(ROWS_PER_PAGE - chunk.length).fill(null)]
    return { rows, isLast: i === count - 1 }
  })
})

const notesText = computed(() => {
  if (!data.value) return ''
  const parts = []
  if (data.value.supplier_document_number) parts.push(`SJ Supplier: ${data.value.supplier_document_number}`)
  if (data.value.notes) parts.push(data.value.notes)
  return parts.join(' — ')
})

const formatTanggal = (tanggal) => {
  if (!tanggal) return ''
  return new Date(tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formatAngka = (value) => (parseFloat(value) || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })

const formatUang = (value) => {
  const currency = data.value?.currency || 'IDR'
  const number = (parseFloat(value) || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })
  return currency === 'IDR' ? `Rp ${number}` : `${currency} ${number}`
}

const printNow = () => window.print()

onMounted(async () => {
  pageStyleEl = document.createElement('style')
  pageStyleEl.textContent = '@page { size: A5 landscape; margin: 0; }'
  document.head.appendChild(pageStyleEl)

  try {
    const response = await apiClient.get(`/goods-receipts/${route.params.id}/bukti-penerimaan`)
    data.value = response.data.data
    document.title = `Bukti Penerimaan ${data.value.bpb_number}`
  } catch (error) {
    console.error('Gagal memuat bukti penerimaan:', error)
    errorMessage.value = error.response?.data?.message || 'Data penerimaan tidak ditemukan atau gagal dimuat.'
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  pageStyleEl?.remove()
})
</script>

<style scoped>
.bpb-screen {
  min-height: 100vh;
  background: #e5e7eb;
  padding: 16px 0 32px;
}

.bpb-toolbar {
  width: 210mm;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.bpb-btn-print {
  padding: 8px 20px;
  background: #111827;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}

.bpb-btn-print:disabled {
  opacity: 0.5;
}

.bpb-toolbar-hint {
  font-size: 13px;
  color: #4b5563;
}

.bpb-message {
  width: 210mm;
  margin: 40px auto;
  text-align: center;
  color: #374151;
}

.bpb-sheet {
  box-sizing: border-box;
  width: 210mm;
  height: 148mm;
  margin: 0 auto 12px;
  padding: 7mm 9mm 5mm;
  background: #fff;
  color: #000;
  font-family: 'Times New Roman', Times, serif;
  font-size: 10pt;
  line-height: 1.2;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.bpb-head {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  column-gap: 4mm;
  align-items: start;
  margin-bottom: 3.5mm;
}

.bpb-company {
  font-weight: bold;
  font-size: 10.5pt;
  white-space: nowrap;
}

.bpb-title {
  font-weight: bold;
  font-size: 13.5pt;
  text-decoration: underline;
  letter-spacing: 0.4pt;
  text-align: center;
}

.bpb-identity {
  display: flex;
  justify-content: space-between;
  gap: 10mm;
  margin-bottom: 3mm;
}

.bpb-identity table {
  border-collapse: collapse;
}

.bpb-identity-left {
  width: 58%;
}

.bpb-identity-right {
  width: 36%;
}

.bpb-identity td {
  padding: 0.6mm 0;
  vertical-align: top;
}

.bpb-identity .lbl {
  width: 16mm;
  white-space: nowrap;
}

.bpb-identity-right .lbl {
  width: 14mm;
}

.bpb-identity .sep {
  width: 3mm;
}

.bpb-identity .dotted {
  border-bottom: 0.5pt dotted #000;
}

.bpb-identity .address {
  height: 8mm;
  line-height: 1.15;
  overflow: hidden;
}

.bpb-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.bpb-table col.c-no { width: 9mm; }
.bpb-table col.c-qty { width: 28mm; }
.bpb-table col.c-price { width: 30mm; }
.bpb-table col.c-amount { width: 34mm; }

.bpb-table th,
.bpb-table td {
  border: 0.75pt solid #000;
  padding: 0 1.8mm;
}

.bpb-table th {
  height: 6.5mm;
  font-weight: bold;
  text-align: center;
  font-size: 10pt;
}

.bpb-row td {
  height: 6.2mm;
  font-size: 9.5pt;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bpb-row td.name {
  white-space: normal;
}

.bpb-row td.name span {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bpb-row td.name-long {
  font-size: 7.5pt;
  line-height: 1.05;
}

.bpb-row td.name-long span {
  -webkit-line-clamp: 2;
}

.center { text-align: center; }
.right { text-align: right; }

.bpb-foot td {
  height: 9mm;
  vertical-align: top;
  padding-top: 1mm;
}

.bpb-notes {
  font-size: 9pt;
  overflow: hidden;
}

.notes-label {
  font-weight: bold;
  margin-right: 1.5mm;
}

.total-label {
  font-weight: bold;
  text-align: center;
}

.total-value {
  font-weight: bold;
}

.bpb-sign {
  display: flex;
  justify-content: space-around;
  margin-top: 2.5mm;
  flex: 1;
  min-height: 0;
}

.sign-box {
  width: 60mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: center;
}

.sign-title {
  font-weight: bold;
}

.sign-line {
  padding-bottom: 1mm;
}

.bpb-bottom {
  display: flex;
  gap: 8mm;
  font-size: 8.5pt;
  border-top: 0.5pt solid #000;
  padding-top: 1mm;
}

.bpb-bottom .page-no {
  margin-left: auto;
}

@media print {
  .no-print {
    display: none !important;
  }

  .bpb-screen {
    background: #fff;
    padding: 0;
    min-height: 0;
  }

  .bpb-sheet {
    margin: 0;
    box-shadow: none;
    break-after: page;
    page-break-after: always;
  }

  .bpb-sheet:last-child {
    break-after: auto;
    page-break-after: auto;
  }
}
</style>

<style>
@media print {
  html,
  body,
  #app {
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
  }
}
</style>
