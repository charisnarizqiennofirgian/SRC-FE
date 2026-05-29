<template>
  <DashboardLayout>
    <!-- HEADER -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon-wrap">🏦</div>
        <div>
          <h1 class="page-title">Aging Hutang (AP)</h1>
          <p class="page-subtitle">Monitor faktur pembelian belum lunas per bucket umur hutang</p>
        </div>
      </div>
    </div>

    <!-- FILTER BAR -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">Tanggal As Of</label>
          <input v-model="filters.as_of_date" type="date" class="filter-input" @change="fetchData" />
        </div>
        <div class="filter-group">
          <label class="filter-label">Supplier</label>
          <select v-model="filters.supplier_id" class="filter-input" @change="fetchData">
            <option value="">Semua Supplier</option>
            <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
        <div class="filter-group filter-group-right">
          <button class="btn-refresh" @click="fetchData">
            <span>🔄</span> Refresh
          </button>
          <button class="btn-reset" @click="resetFilters">
            <span>🧹</span> Reset
          </button>
        </div>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="loading-box">
      <div class="spinner"></div>
      <p>Memuat data aging hutang...</p>
    </div>

    <template v-else>
      <!-- SUMMARY CARDS -->
      <div class="summary-grid">
        <div class="summary-card card-purple">
          <div class="card-icon">📋</div>
          <div class="card-body">
            <p class="card-label">Total Faktur Outstanding</p>
            <p class="card-value">{{ summary.total_bills }}</p>
          </div>
        </div>
        <div class="summary-card card-orange">
          <div class="card-icon">💸</div>
          <div class="card-body">
            <p class="card-label">Total Hutang</p>
            <p class="card-value">{{ formatCurrency(summary.total_outstanding) }}</p>
          </div>
        </div>
        <div class="summary-card card-red">
          <div class="card-icon">⚠️</div>
          <div class="card-body">
            <p class="card-label">Total Jatuh Tempo</p>
            <p class="card-value">{{ formatCurrency(summary.total_overdue) }}</p>
          </div>
        </div>
        <div class="summary-card card-gray">
          <div class="card-icon">📅</div>
          <div class="card-body">
            <p class="card-label">Rata-rata Hari Overdue</p>
            <p class="card-value">{{ summary.avg_days_overdue }} hari</p>
          </div>
        </div>
      </div>

      <!-- AGING BUCKET BAR -->
      <div class="bucket-card">
        <h3 class="section-title">Ringkasan per Bucket</h3>
        <div class="bucket-grid">
          <div
            v-for="(b, key) in buckets"
            :key="key"
            class="bucket-item"
            :class="`bucket-${key}`"
          >
            <p class="bucket-label">{{ b.label }}</p>
            <p class="bucket-amount">{{ formatCurrency(b.total) }}</p>
            <p class="bucket-count">{{ b.count }} faktur</p>
          </div>
        </div>
      </div>

      <!-- BY SUPPLIER TABLE -->
      <div class="data-card">
        <div class="data-card-header">
          <h3 class="section-title">Aging per Supplier</h3>
          <div class="search-wrap">
            <input v-model="searchSupplier" placeholder="Cari supplier..." class="search-input" />
          </div>
        </div>
        <div class="table-wrap">
          <table class="aging-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th class="text-right">Belum JT</th>
                <th class="text-right">1-30 Hari</th>
                <th class="text-right">31-60 Hari</th>
                <th class="text-right">61-90 Hari</th>
                <th class="text-right">> 90 Hari</th>
                <th class="text-right">Total</th>
                <th class="text-center">Faktur</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredBySupplier.length === 0">
                <td colspan="8" class="empty-row">Tidak ada data hutang outstanding.</td>
              </tr>
              <tr
                v-for="row in filteredBySupplier"
                :key="row.supplier_id"
                class="data-row"
                @click="toggleSupplierDetail(row.supplier_id)"
              >
                <td class="supplier-name-cell">
                  <span class="supplier-icon">🏪</span> {{ row.supplier_name }}
                  <span class="expand-hint">{{ expandedSupplier === row.supplier_id ? '▲' : '▼' }}</span>
                </td>
                <td class="text-right">
                  <span :class="row.current > 0 ? 'amount-current' : 'amount-zero'">{{ formatCurrency(row.current) }}</span>
                </td>
                <td class="text-right">
                  <span :class="row['1_30'] > 0 ? 'amount-warn' : 'amount-zero'">{{ formatCurrency(row['1_30']) }}</span>
                </td>
                <td class="text-right">
                  <span :class="row['31_60'] > 0 ? 'amount-warn' : 'amount-zero'">{{ formatCurrency(row['31_60']) }}</span>
                </td>
                <td class="text-right">
                  <span :class="row['61_90'] > 0 ? 'amount-danger' : 'amount-zero'">{{ formatCurrency(row['61_90']) }}</span>
                </td>
                <td class="text-right">
                  <span :class="row.over_90 > 0 ? 'amount-critical' : 'amount-zero'">{{ formatCurrency(row.over_90) }}</span>
                </td>
                <td class="text-right total-cell">{{ formatCurrency(row.total) }}</td>
                <td class="text-center">{{ row.count }}</td>
              </tr>

              <!-- DETAIL ROWS per SUPPLIER -->
              <template v-for="row in filteredBySupplier" :key="`detail-${row.supplier_id}`">
                <template v-if="expandedSupplier === row.supplier_id">
                  <tr
                    v-for="bill in detailsBySupplier(row.supplier_id)"
                    :key="bill.id"
                    class="detail-row"
                  >
                    <td class="pl-8">
                      <span class="bill-badge">{{ bill.bill_number }}</span>
                    </td>
                    <td class="text-right text-sm text-gray">Tgl: {{ bill.bill_date }}</td>
                    <td class="text-right text-sm" colspan="4">JT: {{ bill.due_date }}
                      <span v-if="bill.days_overdue > 0" class="overdue-chip">
                        {{ bill.days_overdue }} hari
                      </span>
                    </td>
                    <td class="text-right text-sm font-bold">{{ formatCurrency(bill.remaining_amount) }}</td>
                    <td class="text-center">
                      <span :class="getBucketBadgeClass(bill.bucket)">{{ bill.bucket_label }}</span>
                    </td>
                  </tr>
                </template>
              </template>
            </tbody>
            <!-- GRAND TOTAL -->
            <tfoot v-if="filteredBySupplier.length > 0">
              <tr class="total-row">
                <td><strong>TOTAL</strong></td>
                <td class="text-right"><strong>{{ formatCurrency(buckets.current?.total) }}</strong></td>
                <td class="text-right"><strong>{{ formatCurrency(buckets['1_30']?.total) }}</strong></td>
                <td class="text-right"><strong>{{ formatCurrency(buckets['31_60']?.total) }}</strong></td>
                <td class="text-right"><strong>{{ formatCurrency(buckets['61_90']?.total) }}</strong></td>
                <td class="text-right"><strong>{{ formatCurrency(buckets.over_90?.total) }}</strong></td>
                <td class="text-right"><strong>{{ formatCurrency(summary.total_outstanding) }}</strong></td>
                <td class="text-center"><strong>{{ summary.total_bills }}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </template>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../../components/DashboardLayout.vue'
import apiClient from '../../api/axios'
import { useToast } from 'vue-toastification'

const toast   = useToast()
const loading = ref(false)

const filters = ref({
  as_of_date:  new Date().toISOString().split('T')[0],
  supplier_id: '',
})

const summary          = ref({ total_bills: 0, total_outstanding: 0, total_overdue: 0, avg_days_overdue: 0 })
const buckets          = ref({})
const bySupplier       = ref([])
const details          = ref([])
const suppliers        = ref([])
const searchSupplier   = ref('')
const expandedSupplier = ref(null)

const filteredBySupplier = computed(() => {
  if (!searchSupplier.value) return bySupplier.value
  const s = searchSupplier.value.toLowerCase()
  return bySupplier.value.filter(r => r.supplier_name.toLowerCase().includes(s))
})

const detailsBySupplier = (supplierId) =>
  details.value.filter(d => d.supplier_id === supplierId)

const toggleSupplierDetail = (supplierId) => {
  expandedSupplier.value = expandedSupplier.value === supplierId ? null : supplierId
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.value.as_of_date)  params.as_of_date  = filters.value.as_of_date
    if (filters.value.supplier_id) params.supplier_id = filters.value.supplier_id

    const res = await apiClient.get('/ap-aging', { params })
    if (res.data.success) {
      summary.value    = res.data.summary
      buckets.value    = res.data.buckets
      bySupplier.value = res.data.by_supplier
      details.value    = res.data.details
    }
  } catch (e) {
    toast.error('Gagal memuat data aging hutang.')
  } finally {
    loading.value = false
  }
}

const fetchSuppliers = async () => {
  try {
    const res = await apiClient.get('/suppliers')
    suppliers.value = res.data.data ?? res.data
  } catch {}
}

const resetFilters = () => {
  filters.value.as_of_date  = new Date().toISOString().split('T')[0]
  filters.value.supplier_id = ''
  fetchData()
}

const formatCurrency = (val) => {
  if (!val) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
}

const getBucketBadgeClass = (bucket) => ({
  'bucket-badge':  true,
  'badge-current': bucket === 'current',
  'badge-warn':    bucket === '1_30' || bucket === '31_60',
  'badge-danger':  bucket === '61_90',
  'badge-critical': bucket === 'over_90',
})

onMounted(() => {
  fetchSuppliers()
  fetchData()
})
</script>

<style scoped>
.page-header {
  display: flex; align-items: center; gap: 1rem;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  border-radius: 14px;
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
  color: white;
}
.header-left { display: flex; align-items: center; gap: 1rem; }
.header-icon-wrap { font-size: 2.5rem; }
.page-title    { font-size: 1.6rem; font-weight: 800; margin: 0; }
.page-subtitle { margin: 0.2rem 0 0; opacity: 0.9; font-size: 0.9rem; }

/* FILTER */
.filter-card {
  background: white; border-radius: 12px;
  padding: 1.2rem 1.5rem; margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.filter-row  { display: flex; align-items: flex-end; gap: 1rem; flex-wrap: wrap; }
.filter-group { display: flex; flex-direction: column; gap: 0.3rem; min-width: 180px; }
.filter-group-right { margin-left: auto; flex-direction: row; align-items: flex-end; gap: 0.5rem; }
.filter-label { font-size: 0.8rem; font-weight: 600; color: #6b7280; }
.filter-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px; font-size: 0.875rem;
}
.btn-refresh, .btn-reset {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 1rem; border-radius: 8px;
  border: none; font-size: 0.85rem; font-weight: 600; cursor: pointer;
}
.btn-refresh { background: #7c3aed; color: white; }
.btn-reset   { background: #f3f4f6; color: #374151; }

/* LOADING */
.loading-box { text-align: center; padding: 4rem; background: white; border-radius: 12px; }
.spinner {
  width: 48px; height: 48px;
  border: 4px solid #e5e7eb; border-top-color: #7c3aed;
  border-radius: 50%; animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* SUMMARY CARDS */
.summary-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem; margin-bottom: 1.5rem;
}
.summary-card {
  display: flex; align-items: center; gap: 1rem;
  padding: 1.25rem 1.5rem; border-radius: 12px; color: white;
}
.card-purple { background: linear-gradient(135deg,#8b5cf6,#7c3aed); }
.card-orange { background: linear-gradient(135deg,#f59e0b,#d97706); }
.card-red    { background: linear-gradient(135deg,#ef4444,#dc2626); }
.card-gray   { background: linear-gradient(135deg,#6b7280,#4b5563); }
.card-icon  { font-size: 2rem; }
.card-label { font-size: 0.8rem; opacity: 0.9; margin: 0 0 0.25rem; }
.card-value { font-size: 1.25rem; font-weight: 800; margin: 0; }

/* BUCKET */
.bucket-card {
  background: white; border-radius: 12px;
  padding: 1.25rem 1.5rem; margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.section-title { font-size: 1rem; font-weight: 700; color: #111827; margin: 0 0 1rem; }
.bucket-grid {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.75rem;
}
.bucket-item { padding: 1rem; border-radius: 10px; text-align: center; }
.bucket-label  { font-size: 0.75rem; font-weight: 600; margin: 0 0 0.5rem; }
.bucket-amount { font-size: 0.95rem; font-weight: 800; margin: 0 0 0.25rem; }
.bucket-count  { font-size: 0.75rem; margin: 0; opacity: 0.8; }

.bucket-current { background: #f5f3ff; color: #5b21b6; }
.bucket-1_30    { background: #fef9c3; color: #854d0e; }
.bucket-31_60   { background: #fef3c7; color: #92400e; }
.bucket-61_90   { background: #fee2e2; color: #991b1b; }
.bucket-over_90 { background: #fce7f3; color: #9d174d; }

/* DATA CARD */
.data-card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }
.data-card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb;
}
.search-input {
  padding: 0.45rem 0.9rem; border: 1px solid #d1d5db;
  border-radius: 999px; font-size: 0.85rem; min-width: 220px;
}

/* TABLE */
.table-wrap { overflow-x: auto; }
.aging-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.aging-table th, .aging-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb; }
.aging-table thead { background: #f9fafb; }
.aging-table th { font-weight: 600; color: #374151; white-space: nowrap; }
.data-row { cursor: pointer; transition: background 0.15s; }
.data-row:hover { background: #faf5ff; }
.detail-row { background: #fdf8ff; }
.detail-row td { padding: 0.5rem 1rem; font-size: 0.8rem; }
.total-row { background: #f3f4f6; font-weight: 700; }
.total-row td { padding: 0.85rem 1rem; border-top: 2px solid #d1d5db; }

.text-right  { text-align: right; }
.text-center { text-align: center; }
.text-sm     { font-size: 0.8rem; }
.text-gray   { color: #6b7280; }
.font-bold   { font-weight: 700; }
.pl-8        { padding-left: 2.5rem !important; }

.supplier-name-cell { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; }
.expand-hint { font-size: 0.7rem; color: #9ca3af; margin-left: auto; }

.bill-badge {
  display: inline-block; padding: 0.2rem 0.6rem;
  background: #f5f3ff; color: #5b21b6;
  border-radius: 6px; font-size: 0.78rem; font-weight: 600;
}
.total-cell { font-weight: 700; color: #7c3aed; }
.empty-row  { text-align: center; padding: 3rem; color: #9ca3af; }
.overdue-chip {
  display: inline-block; margin-left: 0.5rem;
  padding: 0.15rem 0.5rem; background: #fee2e2;
  color: #dc2626; border-radius: 999px;
  font-size: 0.72rem; font-weight: 700;
}

.amount-current  { color: #5b21b6; font-weight: 600; }
.amount-warn     { color: #d97706; font-weight: 600; }
.amount-danger   { color: #dc2626; font-weight: 600; }
.amount-critical { color: #9d174d; font-weight: 700; }
.amount-zero     { color: #d1d5db; }

.bucket-badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.72rem; font-weight: 600; }
.badge-current  { background: #f5f3ff; color: #5b21b6; }
.badge-warn     { background: #fef3c7; color: #92400e; }
.badge-danger   { background: #fee2e2; color: #991b1b; }
.badge-critical { background: #fce7f3; color: #9d174d; }

@media (max-width: 768px) {
  .bucket-grid { grid-template-columns: repeat(2, 1fr); }
  .summary-grid { grid-template-columns: 1fr 1fr; }
}
</style>
