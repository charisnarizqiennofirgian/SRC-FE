<template>
  <div class="print-page">
    <div class="no-print toolbar">
      <button class="btn-print" :disabled="isLoading" @click="printNow">🖨️ Cetak</button>
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

const route = useRoute()
const header = ref(null)
const rows = ref([])
const isLoading = ref(true)
const showFilled = ref(false)

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
.toggle { font-size: 13px; display: flex; align-items: center; gap: 6px; cursor: pointer; }
.muted { font-size: 13px; color: #6b7280; }

.doc-header { margin-bottom: 10px; }
.doc-title { font-size: 16px; font-weight: 800; text-align: center; margin-bottom: 8px; letter-spacing: 0.5px; }
.doc-info { font-size: 12px; border-collapse: collapse; }
.doc-info td { padding: 2px 10px 2px 0; }
.doc-hint { font-size: 11px; font-style: italic; margin-top: 6px; color: #374151; }

.sheet { width: 100%; border-collapse: collapse; font-size: 11px; }
.sheet th, .sheet td { border: 1px solid #555; padding: 3px 5px; vertical-align: middle; }
.sheet thead th { background: #e5e7eb; font-weight: 700; text-align: center; }
.sheet thead { display: table-header-group; }
.sheet tr { page-break-inside: avoid; }
.group-row td { background: #f3f4f6; font-weight: 700; font-size: 11px; }
.c-no { width: 32px; text-align: center; }
.c-code { width: 110px; font-family: monospace; }
.c-grade { width: 40px; text-align: center; }
.c-unit { width: 50px; text-align: center; }
.c-num { width: 70px; text-align: right; }
.c-real { width: 70px; text-align: right; font-weight: 700; }
.c-real.blocked { background: repeating-linear-gradient(45deg, #fff, #fff 3px, #e5e7eb 3px, #e5e7eb 5px); }
.c-notes { width: 120px; }

@media print {
  .no-print { display: none !important; }
  .print-page { padding: 0; }
  .sheet td { height: 20px; }
  .c-real.blocked, .sheet thead th, .group-row td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}

@page { size: A4 landscape; margin: 10mm; }
</style>
