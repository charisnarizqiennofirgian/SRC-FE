<template>
  <DashboardLayout>
    <div class="page-header-sawmill">
      <h1>Laporan Produksi Sawmill (Rendemen)</h1>
      <p>Lihat perbandingan m³ Log vs m³ RST per dokumen produksi.</p>
    </div>

    <div class="content-card-sawmill">
      <div class="card-body-sawmill">
        <!-- Filter -->
        <div class="form-row">
          <div class="form-group-modern">
            <label>Tanggal Mulai</label>
            <input v-model="filters.start_date" type="date" class="form-input-modern" />
          </div>
          <div class="form-group-modern">
            <label>Tanggal Sampai</label>
            <input v-model="filters.end_date" type="date" class="form-input-modern" />
          </div>
          <div class="form-group-modern" style="margin-top: 24px">
            <button type="button" class="btn-action btn-submit-modern" @click="loadData">
              Muat Data
            </button>
          </div>
        </div>

        <!-- Summary KPI -->
        <div v-if="summary" class="sawmill-summary mt-3">
          <div class="summary-card">
            <div class="summary-label">Total Log (m³)</div>
            <div class="summary-value">
              {{ summary.total_log_m3.toFixed(3) }}
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total RST (m³)</div>
            <div class="summary-value">
              {{ summary.total_rst_m3.toFixed(3) }}
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Rata-rata Rendemen (%)</div>
            <div class="summary-value">
              {{ summary.avg_yield_percent.toFixed(2) }}
            </div>
          </div>
        </div>

        <!-- Tabel -->
        <table class="table table-striped mt-3">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>No Dokumen</th>
              <th>Log (m³)</th>
              <th>RST (m³)</th>
              <th>Rendemen (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td>{{ row.date }}</td>
              <td>{{ row.document_number }}</td>
              <td>{{ row.total_log_m3.toFixed(4) }}</td>
              <td>{{ row.total_rst_m3.toFixed(4) }}</td>
              <td>{{ row.yield_percent.toFixed(2) }}</td>
            </tr>
            <tr v-if="rows.length === 0">
              <td colspan="5" class="text-center">Belum ada data</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'

const { showError } = useNotification()

const filters = reactive({
  start_date: '',
  end_date: '',
})

const rows = ref([])
const summary = ref(null)

const loadData = async () => {
  try {
    const res = await apiClient.get('/reports/sawmill-yield', {
      params: {
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
      },
    })

    rows.value = res.data.data || []
    summary.value = res.data.summary || null
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal memuat laporan sawmill')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.sawmill-summary {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.summary-card {
  flex: 1 1 200px;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: #f5f7fa;
  border: 1px solid #e0e4ea;
}

.summary-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 18px;
  font-weight: 600;
  color: #222;
}
</style>
