<template>
  <DashboardLayout>
    <!-- HEADER -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge">📈</div>
          <div>
            <h1 class="page-title">Laporan Harga Pembelian</h1>
            <p class="page-subtitle">Pantau riwayat & tren perubahan harga barang</p>
          </div>
        </div>
      </div>
    </div>

    <!-- FILTER -->
    <div class="content-card">
      <div class="card-head">
        <div class="card-head-icon">🔍</div>
        <div>
          <h2 class="card-title">Filter Laporan</h2>
          <p class="card-subtitle">Pilih barang, supplier, dan rentang tanggal</p>
        </div>
      </div>
      <div class="card-body">
        <div class="filter-grid">
          <div class="form-group">
            <label class="form-label">Barang</label>
            <select id="select-barang-filter" class="form-control">
              <option value="">Semua Barang</option>
              <option v-for="item in daftarBarang" :key="item.id" :value="item.id">
                {{ item.code }} - {{ item.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Supplier</label>
            <select v-model="filter.supplier_id" class="form-control">
              <option value="">Semua Supplier</option>
              <option v-for="s in daftarSupplier" :key="s.id" :value="s.id">
                {{ s.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Dari Tanggal</label>
            <input type="date" v-model="filter.date_from" class="form-control" />
          </div>
          <div class="form-group">
            <label class="form-label">Sampai Tanggal</label>
            <input type="date" v-model="filter.date_to" class="form-control" />
          </div>
        </div>
        <div class="filter-actions">
          <button @click="fetchLaporan" class="btn-search" :disabled="loading">
            {{ loading ? '⏳ Memuat...' : '🔍 Cari' }}
          </button>
          <button @click="resetFilter" class="btn-reset">🔄 Reset</button>
        </div>
      </div>
    </div>

    <!-- HASIL -->
    <div v-if="sudahCari">

      <!-- GRAFIK -->
      <div v-if="chartData.length > 0" class="content-card">
        <div class="card-head">
          <div class="card-head-icon">📊</div>
          <div>
            <h2 class="card-title">Grafik Tren Harga</h2>
            <p class="card-subtitle">Pergerakan harga dari waktu ke waktu</p>
          </div>
        </div>
        <div class="card-body">
          <!-- Pilih barang untuk grafik -->
          <div class="chart-filter" v-if="chartData.length > 1">
            <label class="form-label">Tampilkan grafik untuk:</label>
            <select v-model="selectedChartItem" class="form-control form-control-sm">
              <option v-for="c in chartData" :key="c.item_id" :value="c.item_id">
                {{ c.item_name }}
              </option>
            </select>
          </div>
          <div class="chart-wrapper">
            <canvas ref="chartCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- TABEL -->
      <div class="content-card">
        <div class="card-head">
          <div class="card-head-icon">📋</div>
          <div>
            <h2 class="card-title">Riwayat Harga</h2>
            <p class="card-subtitle">{{ tableData.length }} transaksi ditemukan</p>
          </div>
        </div>
        <div class="card-body-table">
          <div v-if="tableData.length === 0" class="empty-state">
            <p>😕 Tidak ada data ditemukan</p>
          </div>
          <div v-else class="table-wrapper">
            <table class="detail-table">
              <thead>
                <tr>
                  <th>Barang</th>
                  <th>Supplier</th>
                  <th>No. PO</th>
                  <th>Tanggal</th>
                  <th>Harga</th>
                  <th>Perubahan</th>
                  <th>Tren</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in tableData" :key="row.id">
                  <td>
                    <div class="item-name">{{ row.item_name }}</div>
                    <div class="item-code">{{ row.item_code }}</div>
                  </td>
                  <td>{{ row.supplier_name }}</td>
                  <td class="po-number">{{ row.po_number }}</td>
                  <td>{{ formatTanggal(row.order_date) }}</td>
                  <td class="price">{{ formatCurrency(row.price) }}</td>
                  <td>
                    <span v-if="row.price_change === null" class="badge badge-gray">-</span>
                    <span v-else :class="row.price_change > 0 ? 'badge badge-red' : row.price_change < 0 ? 'badge badge-green' : 'badge badge-gray'">
                      {{ row.price_change > 0 ? '+' : '' }}{{ formatCurrency(row.price_change) }}
                    </span>
                  </td>
                  <td>
                    <span v-if="row.price_trend === null">-</span>
                    <span v-else-if="row.price_trend === 'naik'" class="trend naik">▲ {{ row.price_change_percent }}%</span>
                    <span v-else-if="row.price_trend === 'turun'" class="trend turun">▼ {{ Math.abs(row.price_change_percent) }}%</span>
                    <span v-else class="trend tetap">→ Tetap</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useToast } from 'vue-toastification'
import Chart from 'chart.js/auto'
import Choices from 'choices.js'
import 'choices.js/public/assets/styles/choices.min.css'

const toast = useToast()

const filter = ref({
  item_id: '',
  supplier_id: '',
  date_from: '',
  date_to: '',
})

const daftarBarang = ref([])
const daftarSupplier = ref([])
const tableData = ref([])
const chartData = ref([])
const loading = ref(false)
const sudahCari = ref(false)
const selectedChartItem = ref(null)
const chartCanvas = ref(null)
let chartInstance = null
const barangChoiceInstance = ref(null)

const initBarangChoice = async () => {
  await nextTick()
  const el = document.getElementById('select-barang-filter')
  if (!el) return

  if (barangChoiceInstance.value) {
    barangChoiceInstance.value.destroy()
  }

  barangChoiceInstance.value = new Choices(el, {
    searchEnabled: true,
    searchPlaceholderValue: 'Ketik nama barang...',
    noResultsText: 'Barang tidak ditemukan',
    itemSelectText: 'Klik untuk pilih',
    shouldSort: false,
  })

  el.addEventListener('change', (e) => {
    filter.value.item_id = e.target.value
  })
}

const fetchDropdown = async () => {
  try {
    const [barangRes, supplierRes] = await Promise.all([
      apiClient.get('/materials?all=true'),
      apiClient.get('/suppliers?all=true'),
    ])
    daftarBarang.value = barangRes.data.data
    daftarSupplier.value = supplierRes.data.data

    await nextTick()
    initBarangChoice()
  } catch {
    toast.error('Gagal memuat data dropdown')
  }
}

const fetchLaporan = async () => {
  loading.value = true
  sudahCari.value = false
  try {
    const params = {}
    if (filter.value.item_id) params.item_id = filter.value.item_id
    if (filter.value.supplier_id) params.supplier_id = filter.value.supplier_id
    if (filter.value.date_from) params.date_from = filter.value.date_from
    if (filter.value.date_to) params.date_to = filter.value.date_to

    const res = await apiClient.get('/purchase-orders/laporan-harga', { params })
    tableData.value = res.data.data
    chartData.value = res.data.chart_data

    if (chartData.value.length > 0) {
      selectedChartItem.value = chartData.value[0].item_id
    }

    sudahCari.value = true
  } catch {
    toast.error('Gagal memuat laporan harga')
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  filter.value = { item_id: '', supplier_id: '', date_from: '', date_to: '' }
  tableData.value = []
  chartData.value = []
  sudahCari.value = false
}

const renderChart = () => {
  if (!chartCanvas.value || !selectedChartItem.value) return

  const selected = chartData.value.find(c => c.item_id === selectedChartItem.value)
  if (!selected) return

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels: selected.labels,
      datasets: [{
        label: `Harga ${selected.item_name}`,
        data: selected.prices,
        borderColor: '#92400e',
        backgroundColor: 'rgba(146, 64, 14, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#92400e',
        pointRadius: 5,
        tension: 0.3,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: (ctx) => `Harga: ${formatCurrency(ctx.raw)}`
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: (val) => formatCurrency(val)
          }
        }
      }
    }
  })
}

watch(selectedChartItem, async () => {
  await nextTick()
  renderChart()
})

watch(sudahCari, async (val) => {
  if (val && chartData.value.length > 0) {
    await nextTick()
    renderChart()
  }
})

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatTanggal = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

onMounted(() => {
  fetchDropdown()
})
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #92400e, #78350f);
  padding: 28px 32px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(146, 64, 14, 0.25);
}
.header-content { display: flex; align-items: center; color: white; }
.header-left { display: flex; align-items: center; gap: 16px; }
.icon-badge {
  width: 56px; height: 56px;
  background: rgba(255,255,255,0.2);
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 28px;
}
.page-title { font-size: 24px; font-weight: 800; margin: 0 0 4px; }
.page-subtitle { font-size: 13px; opacity: 0.9; margin: 0; }

.content-card {
  background: white; border-radius: 14px;
  border: 1.5px solid #f3f4f6;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  margin-bottom: 20px; overflow: hidden;
}
.card-head {
  display: flex; align-items: center; gap: 14px;
  padding: 18px 24px;
  background: #fafafa; border-bottom: 1.5px solid #f3f4f6;
}
.card-head-icon {
  width: 40px; height: 40px; background: #fef3c7;
  border: 1.5px solid #fde68a; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.card-title { font-size: 15px; font-weight: 800; color: #111827; margin: 0 0 2px; }
.card-subtitle { font-size: 12px; color: #6b7280; margin: 0; }
.card-body { padding: 24px; }
.card-body-table { padding: 24px; }

.filter-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 16px; margin-bottom: 20px;
}
.form-group { margin: 0; }
.form-label { display: block; margin-bottom: 8px; font-weight: 700; color: #374151; font-size: 13px; }
.form-control {
  width: 100%; padding: 10px 14px;
  border: 1.5px solid #e5e7eb; border-radius: 8px;
  font-size: 14px; background: #fafafa;
  box-sizing: border-box; font-family: inherit;
}
.form-control:focus {
  outline: none; border-color: #92400e;
  box-shadow: 0 0 0 3px rgba(146,64,14,0.1);
}
.form-control-sm { max-width: 300px; }

.filter-actions { display: flex; gap: 12px; }
.btn-search {
  padding: 10px 24px; background: #92400e; color: white;
  border: none; border-radius: 8px; font-size: 14px;
  font-weight: 700; cursor: pointer; font-family: inherit;
}
.btn-search:hover:not(:disabled) { background: #78350f; }
.btn-search:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-reset {
  padding: 10px 20px; background: white; color: #374151;
  border: 1.5px solid #e5e7eb; border-radius: 8px;
  font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit;
}
.btn-reset:hover { background: #f9fafb; }

.chart-filter { margin-bottom: 16px; }
.chart-wrapper { position: relative; height: 300px; }

.table-wrapper { overflow-x: auto; }
.detail-table { width: 100%; border-collapse: collapse; min-width: 800px; }
.detail-table thead { background: #1e293b; }
.detail-table th {
  padding: 14px 16px; text-align: left; color: #e2e8f0;
  font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px;
}
.detail-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.detail-table tr:hover { background: #fffbeb; }

.item-name { font-weight: 700; color: #111827; font-size: 14px; }
.item-code { font-size: 12px; color: #6b7280; }
.po-number { font-family: monospace; font-size: 13px; color: #374151; }
.price { font-weight: 700; color: #111827; font-family: monospace; }

.badge {
  display: inline-block; padding: 4px 10px;
  border-radius: 6px; font-size: 12px; font-weight: 700; font-family: monospace;
}
.badge-red { background: #fef2f2; color: #dc2626; }
.badge-green { background: #f0fdf4; color: #16a34a; }
.badge-gray { background: #f3f4f6; color: #6b7280; }

.trend { font-weight: 700; font-size: 13px; }
.trend.naik { color: #dc2626; }
.trend.turun { color: #16a34a; }
.trend.tetap { color: #6b7280; }

.empty-state {
  text-align: center; padding: 60px;
  color: #6b7280; font-size: 16px;
}

@media (max-width: 768px) {
  .filter-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 480px) {
  .filter-grid { grid-template-columns: 1fr; }
}
</style>