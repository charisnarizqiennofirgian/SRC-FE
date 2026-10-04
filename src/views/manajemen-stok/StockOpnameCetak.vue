<template>
  <div class="print-page">
    <div class="no-print toolbar">
      <button class="btn-print" :disabled="isLoading" @click="printNow">🖨️ Cetak</button>
      <button class="btn-print btn-pdf" :disabled="isLoading || isExporting" @click="downloadPdf">📄 Download PDF</button>
      <button class="btn-print btn-excel" :disabled="isLoading || isExporting" @click="downloadExcel">⬇️ Download Excel</button>
      <label class="toggle">
        <input v-model="showFilled" type="checkbox" />
        Tampilkan angka REAL yang sudah diisi
      </label>
      <span v-if="isLoading" class="muted">Memuat data...</span>
      <span v-else class="muted">{{ rows.length }} baris</span>
    </div>

    <template v-if="header">
      <div class="doc-header">
        <div class="doc-title">LEMBAR HITUNG STOK OPNAME</div>
        <table class="doc-info">
          <tbody>
            <tr>
              <td>No. Opname</td>
              <td>: <strong>{{ header.opname_number }}</strong></td>
              <td>Tanggal</td>
              <td>: {{ formatDate(header.opname_date) }}</td>
            </tr>
            <tr>
              <td>Gudang</td>
              <td>: <strong>{{ header.warehouse?.name }}</strong></td>
              <td>Petugas Hitung</td>
              <td>: ........................................</td>
            </tr>
          </tbody>
        </table>
        <div class="doc-hint">
          Isi kolom REAL dengan hasil hitung fisik. Kosongkan kalau tidak dihitung, tulis 0 kalau barang habis.
          <template v-if="hasKomponen">Komponen: tulis Natural (N) dan Warna (W) terpisah.</template>
        </div>
      </div>

      <table class="sheet">
        <thead>
          <tr>
            <th class="c-no">No</th>
            <th class="c-code">Kode</th>
            <th>Nama Barang</th>
            <th v-if="hasKayu" class="c-grade">Grade</th>
            <th class="c-unit">Satuan</th>
            <th class="c-num">Stok Sistem</th>
            <th v-if="hasKayu" class="c-num">m³</th>
            <th v-if="hasKomponen" class="c-num">Sistem N</th>
            <th v-if="hasKomponen" class="c-num">Sistem W</th>
            <th v-if="hasPcsInput" class="c-real">REAL</th>
            <th v-if="hasKomponen" class="c-real">REAL N</th>
            <th v-if="hasKomponen" class="c-real">REAL W</th>
            <th class="c-notes">Catatan</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="group in groups" :key="group.name">
            <tr class="group-row">
              <td :colspan="colspan">{{ group.name }} ({{ group.rows.length }})</td>
            </tr>
            <tr v-for="row in group.rows" :key="row.id">
              <td class="c-no">{{ row.no }}</td>
              <td class="c-code">{{ row.item_code }}</td>
              <td>{{ row.item_name }}</td>
              <td v-if="hasKayu" class="c-grade">{{ row.grade || '' }}</td>
              <td class="c-unit">{{ row.unit_name || 'pcs' }}</td>
              <td class="c-num">{{ formatQty(row.system_qty_pcs) }}</td>
              <td v-if="hasKayu" class="c-num">{{ row.row_type === 'kayu' ? formatQty(row.system_qty_m3, 4) : '' }}</td>
              <td v-if="hasKomponen" class="c-num">{{ komponenSystem(row, 'natural') }}</td>
              <td v-if="hasKomponen" class="c-num">{{ komponenSystem(row, 'warna') }}</td>
              <td v-if="hasPcsInput" class="c-real" :class="{ blocked: row.row_type === 'komponen' }">
                {{ showFilled && row.row_type !== 'komponen' ? formatQty(row.real_qty_pcs) : '' }}
              </td>
              <td v-if="hasKomponen" class="c-real" :class="{ blocked: row.row_type !== 'komponen' }">
                {{ showFilled && row.row_type === 'komponen' && row.real_qty_pcs !== null ? formatQty(row.real_qty_natural) : '' }}
              </td>
              <td v-if="hasKomponen" class="c-real" :class="{ blocked: row.row_type !== 'komponen' }">
                {{ showFilled && row.row_type === 'komponen' && row.real_qty_pcs !== null ? formatQty(row.real_qty_warna) : '' }}
              </td>
              <td class="c-notes">{{ showFilled ? row.notes || '' : '' }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '@/api/axios'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useToast } from 'vue-toastification'

const route = useRoute()
const header = ref(null)
const rows = ref([])
const isLoading = ref(true)
const showFilled = ref(false)
const isExporting = ref(false)
const toast = useToast()

const hasKayu = computed(() => rows.value.some((r) => r.row_type === 'kayu'))
const hasKomponen = computed(() => rows.value.some((r) => r.row_type === 'komponen'))
const hasPcsInput = computed(() => rows.value.some((r) => r.row_type !== 'komponen'))
const colspan = computed(
  () => 6 + (hasKayu.value ? 2 : 0) + (hasKomponen.value ? 4 : 0) + (hasPcsInput.value ? 1 : 0),
)

const groups = computed(() => {
  const map = new Map()
  for (const row of rows.value) {
    const name = row.category_name || 'Tanpa Kategori'
    if (!map.has(name)) map.set(name, [])
    map.get(name).push(row)
  }
  return Array.from(map, ([name, groupRows]) => ({ name, rows: groupRows }))
})

const komponenSystem = (row, field) => {
  if (row.row_type !== 'komponen') return ''
  const hasBreakdown = Math.abs(row.system_qty_natural + row.system_qty_warna - row.system_qty_pcs) < 0.0001
  if (!hasBreakdown) return '-'
  return formatQty(field === 'natural' ? row.system_qty_natural : row.system_qty_warna)
}

const formatQty = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return ''
  return Number(value).toLocaleString('id-ID', { maximumFractionDigits: decimals })
}

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'

const printNow = () => window.print()

const sheetColumns = () => {
  const cols = [
    { key: 'no', label: 'No', width: 8, align: 'center' },
    { key: 'code', label: 'Kode', width: 24 },
    { key: 'name', label: 'Nama Barang' },
  ]
  if (hasKayu.value) cols.push({ key: 'grade', label: 'Grade', width: 11, align: 'center' })
  cols.push({ key: 'unit', label: 'Satuan', width: 12, align: 'center' })
  cols.push({ key: 'system', label: 'Stok Sistem', width: 16, align: 'right' })
  if (hasKayu.value) cols.push({ key: 'm3', label: 'm3', width: 16, align: 'right' })
  if (hasKomponen.value) {
    cols.push({ key: 'sysN', label: 'Sistem N', width: 14, align: 'right' })
    cols.push({ key: 'sysW', label: 'Sistem W', width: 14, align: 'right' })
  }
  if (hasPcsInput.value) cols.push({ key: 'real', label: 'REAL', width: 15, align: 'right', real: true })
  if (hasKomponen.value) {
    cols.push({ key: 'realN', label: 'REAL N', width: 14, align: 'right', real: true })
    cols.push({ key: 'realW', label: 'REAL W', width: 14, align: 'right', real: true })
  }
  cols.push({ key: 'notes', label: 'Catatan', width: 26 })
  return cols
}

const pdfRowValues = (row) => {
  const isKomponen = row.row_type === 'komponen'
  const filledKomponen = showFilled.value && isKomponen && row.real_qty_pcs !== null
  return {
    no: row.no,
    code: row.item_code || '',
    name: row.item_name || '',
    grade: row.grade || '',
    unit: row.unit_name || 'pcs',
    system: formatQty(row.system_qty_pcs),
    m3: row.row_type === 'kayu' ? formatQty(row.system_qty_m3, 4) : '',
    sysN: komponenSystem(row, 'natural'),
    sysW: komponenSystem(row, 'warna'),
    real: showFilled.value && !isKomponen ? formatQty(row.real_qty_pcs) : '',
    realN: filledKomponen ? formatQty(row.real_qty_natural) : '',
    realW: filledKomponen ? formatQty(row.real_qty_warna) : '',
    notes: showFilled.value ? row.notes || '' : '',
  }
}

const isBlockedCell = (key, row) => {
  const isKomponen = row.row_type === 'komponen'
  if (key === 'real') return isKomponen
  if (key === 'realN' || key === 'realW') return !isKomponen
  return false
}

const downloadPdf = () => {
  if (!header.value) return
  isExporting.value = true
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const margin = 10
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const cols = sheetColumns()

    doc.setFont('helvetica', 'bold').setFontSize(13)
    doc.text('LEMBAR HITUNG STOK OPNAME', pageWidth / 2, 14, { align: 'center' })
    doc.setFont('helvetica', 'normal').setFontSize(9)
    doc.text(`No. Opname : ${header.value.opname_number}`, margin, 22)
    doc.text(`Tanggal : ${formatDate(header.value.opname_date)}`, pageWidth / 2, 22)
    doc.text(`Gudang : ${header.value.warehouse?.name || '-'}`, margin, 27)
    doc.text('Petugas Hitung : ..............................', pageWidth / 2, 27)
    doc.setFont('helvetica', 'italic').setFontSize(8)
    const hint =
      'Isi kolom REAL dengan hasil hitung fisik. Kosongkan kalau tidak dihitung, tulis 0 kalau barang habis.' +
      (hasKomponen.value ? ' Komponen: tulis Natural (N) dan Warna (W) terpisah.' : '')
    doc.text(doc.splitTextToSize(hint, pageWidth - margin * 2), margin, 32)

    const body = []
    for (const group of groups.value) {
      body.push([
        {
          content: `${group.name} (${group.rows.length})`,
          colSpan: cols.length,
          styles: { fillColor: [243, 244, 246], fontStyle: 'bold', halign: 'left' },
        },
      ])
      for (const row of group.rows) {
        const values = pdfRowValues(row)
        body.push(
          cols.map((c) =>
            isBlockedCell(c.key, row)
              ? { content: '', styles: { fillColor: [229, 231, 235] } }
              : String(values[c.key] ?? ''),
          ),
        )
      }
    }

    const columnStyles = {}
    cols.forEach((c, i) => {
      columnStyles[i] = {
        halign: c.align || 'left',
        ...(c.width ? { cellWidth: c.width } : {}),
        ...(c.real ? { fontStyle: 'bold' } : {}),
      }
    })

    autoTable(doc, {
      startY: 38,
      margin: { left: margin, right: margin, bottom: 12 },
      head: [cols.map((c) => c.label)],
      body,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 1.2,
        lineColor: [85, 85, 85],
        lineWidth: 0.15,
        textColor: 17,
        minCellHeight: 6,
        valign: 'middle',
      },
      headStyles: { fillColor: [229, 231, 235], textColor: 17, fontStyle: 'bold', halign: 'center' },
      columnStyles,
      showHead: 'everyPage',
      didDrawPage: () => {
        doc.setFont('helvetica', 'normal').setFontSize(7)
        doc.text(`${header.value.opname_number} - Hal. ${doc.getNumberOfPages()}`, pageWidth - margin, pageHeight - 5, {
          align: 'right',
        })
      },
    })

    doc.save(`Lembar-Hitung-${header.value.opname_number}.pdf`)
  } catch (error) {
    console.error('Error generating PDF:', error)
    toast.error('Gagal membuat PDF.')
  } finally {
    isExporting.value = false
  }
}

const downloadExcel = async () => {
  if (!header.value) return
  isExporting.value = true
  try {
    const response = await apiClient.get(`/stock-opnames/${route.params.id}/export`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Stok-Opname-${header.value.opname_number}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading excel:', error)
    toast.error('Gagal download Excel.')
  } finally {
    isExporting.value = false
  }
}

onMounted(async () => {
  try {
    const response = await apiClient.get(`/stock-opnames/${route.params.id}`)
    header.value = response.data.data.header
    rows.value = response.data.data.details.map((d, i) => ({ ...d, no: i + 1 }))
    document.title = `Lembar Hitung ${header.value.opname_number}`
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.print-page { font-family: Arial, Helvetica, sans-serif; color: #111; padding: 16px 20px; background: white; }
.toolbar { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; padding: 10px 14px; background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 10px; }
.btn-print { padding: 8px 18px; background: #0d9488; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
.btn-print:disabled { opacity: 0.5; }
.btn-pdf { background: #dc2626; }
.btn-excel { background: #16a34a; }
.toggle { font-size: 13px; display: flex; align-items: center; gap: 6px; cursor: pointer; }
.muted { font-size: 13px; color: #6b7280; }

.doc-header { margin-bottom: 10px; }
.doc-title { font-size: 16px; font-weight: 800; text-align: center; margin-bottom: 8px; letter-spacing: 0.5px; }
.doc-info { font-size: 12px; border-collapse: collapse; }
.doc-info td { padding: 2px 10px 2px 0; }
.doc-hint { font-size: 11px; font-style: italic; margin-top: 6px; color: #374151; }

.sheet { width: 100%; border-collapse: collapse; font-size: 10px; }
.sheet th, .sheet td { border: 1px solid #555; padding: 3px 5px; vertical-align: middle; }
.sheet thead th { background: #e5e7eb; font-weight: 700; text-align: center; }
.sheet thead { display: table-header-group; }
.sheet tr { page-break-inside: avoid; }
.group-row td { background: #f3f4f6; font-weight: 700; font-size: 11px; }
.c-no { width: 26px; text-align: center; }
.c-code { width: 85px; font-family: monospace; }
.c-grade { width: 36px; text-align: center; }
.c-unit { width: 42px; text-align: center; }
.c-num { width: 54px; text-align: right; }
.c-real { width: 54px; text-align: right; font-weight: 700; }
.c-real.blocked { background: repeating-linear-gradient(45deg, #fff, #fff 3px, #e5e7eb 3px, #e5e7eb 5px); }
.c-notes { width: 90px; }

@media print {
  .no-print { display: none !important; }
  .print-page { padding: 0; }
  .sheet td { height: 20px; }
  .c-real.blocked, .sheet thead th, .group-row td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}

@page { size: A4 portrait; margin: 10mm; }
</style>
