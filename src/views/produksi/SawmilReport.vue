<template>
  <DashboardLayout>
    <!-- ========================================
         PAGE HEADER - MODERN
         ======================================== -->
    <div class="page-header-sawmill-report">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-report">
            <span class="report-icon">📈</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-report">Laporan Produksi Sawmill (Rendemen)</h1>
            <p class="page-subtitle-report">
              Perbandingan m³ Log vs m³ RST per dokumen produksi untuk analisa rendemen.
            </p>
          </div>
        </div>
        <div class="header-right-section">
          <div class="kpi-chip">
            <span class="kpi-label">Focus</span>
            <span class="kpi-value">Efisiensi Sawmill</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================
         CONTENT CARD
         ======================================== -->
    <div class="content-card-sawmill-report">
      <div class="card-body-sawmill-report">
        <!-- FILTER -->
        <div class="filter-card">
          <div class="filter-header">
            <div class="filter-title-group">
              <span class="filter-icon">🔎</span>
              <div>
                <h3 class="filter-title">Filter Periode</h3>
                <p class="filter-subtitle">
                  Pilih rentang tanggal produksi untuk melihat rendemen.
                </p>
              </div>
            </div>
          </div>

          <div class="filter-grid">
            <div class="form-group-modern">
              <label class="form-label-modern">Tanggal Mulai</label>
              <div class="input-wrapper-icon">
                <span class="input-icon">📅</span>
                <input v-model="filters.start_date" type="date" class="form-input-modern" />
              </div>
            </div>

            <div class="form-group-modern">
              <label class="form-label-modern">Tanggal Sampai</label>
              <div class="input-wrapper-icon">
                <span class="input-icon">📅</span>
                <input v-model="filters.end_date" type="date" class="form-input-modern" />
              </div>
            </div>

            <div class="form-group-modern filter-action-group">
              <label class="form-label-modern">&nbsp;</label>
              <button type="button" class="btn-action btn-submit-modern" @click="loadData">
                <span class="btn-icon">🔄</span>
                <span class="btn-text">Muat Data</span>
              </button>
            </div>
          </div>
        </div>

        <!-- SUMMARY KPI -->
        <div v-if="summary" class="sawmill-summary-modern">
          <div class="summary-card-modern log-card">
            <div class="summary-icon-wrapper">
              <span class="summary-icon">🪵</span>
            </div>
            <div class="summary-text">
              <div class="summary-label">Total Log (m³)</div>
              <div class="summary-value">
                {{ summary.total_log_m3.toFixed(3) }}
              </div>
            </div>
          </div>

          <div class="summary-card-modern rst-card">
            <div class="summary-icon-wrapper">
              <span class="summary-icon">📦</span>
            </div>
            <div class="summary-text">
              <div class="summary-label">Total RST (m³)</div>
              <div class="summary-value">
                {{ summary.total_rst_m3.toFixed(3) }}
              </div>
            </div>
          </div>

          <div class="summary-card-modern yield-card">
            <div class="summary-icon-wrapper">
              <span class="summary-icon">🎯</span>
            </div>
            <div class="summary-text">
              <div class="summary-label">Rata-rata Rendemen</div>
              <div class="summary-value">{{ summary.avg_yield_percent.toFixed(2) }}%</div>
            </div>
          </div>
        </div>

        <!-- TABEL -->
        <div class="table-wrapper-modern">
          <table class="table-sawmill-modern">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>No Dokumen</th>
                <th class="text-right">Log (m³)</th>
                <th class="text-right">RST (m³)</th>
                <th class="text-right">Rendemen (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id" class="data-row">
                <td>{{ row.date }}</td>
                <td>
                  <span class="doc-badge">{{ row.document_number }}</span>
                </td>
                <td class="text-right">
                  {{ row.total_log_m3.toFixed(4) }}
                </td>
                <td class="text-right">
                  {{ row.total_rst_m3.toFixed(4) }}
                </td>
                <td class="text-right">
                  <span
                    :class="[
                      'yield-pill',
                      row.yield_percent >= 60
                        ? 'yield-good'
                        : row.yield_percent >= 40
                          ? 'yield-average'
                          : 'yield-bad',
                    ]"
                  >
                    {{ row.yield_percent.toFixed(2) }}%
                  </span>
                </td>
              </tr>

              <tr v-if="rows.length === 0">
                <td colspan="5" class="empty-cell">
                  <div class="empty-state">
                    <span class="empty-icon">📭</span>
                    <p class="empty-title">Belum ada data</p>
                    <p class="empty-text">
                      Sesuaikan filter tanggal, lalu klik
                      <strong>Muat Data</strong>.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
/* ========================================
   PAGE HEADER
   ======================================== */
.page-header-sawmill-report {
  background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #1d4ed8 100%);
  padding: 2rem 2.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(37, 99, 235, 0.35);
  color: white;
}

.header-content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-left-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.icon-badge-report {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.report-icon {
  font-size: 2.5rem;
}

.header-text-content {
  flex: 1;
}

.page-title-report {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.page-subtitle-report {
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
  opacity: 0.95;
}

.header-right-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.kpi-chip {
  padding: 0.5rem 1.25rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.25);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.kpi-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.8;
}

.kpi-value {
  font-size: 0.875rem;
  font-weight: 700;
}

/* ========================================
   CONTENT CARD
   ======================================== */
.content-card-sawmill-report {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f2f5;
  overflow: hidden;
}

.card-body-sawmill-report {
  padding: 2.5rem;
}

/* ========================================
   FILTER CARD
   ======================================== */
.filter-card {
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f9fafb 0%, #eff6ff 100%);
  padding: 1.5rem 1.75rem;
  margin-bottom: 2rem;
}

.filter-header {
  margin-bottom: 1.25rem;
}

.filter-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-icon {
  font-size: 1.5rem;
}

.filter-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #111827;
}

.filter-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

.filter-action-group {
  display: flex;
  align-items: flex-end;
}

/* ========================================
   FORM ELEMENTS (REUSE STYLE)
   ======================================== */
.form-group-modern {
  margin-bottom: 0;
}

.form-label-modern {
  display: block;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.75rem;
  letter-spacing: 0.015em;
}

.input-wrapper-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  font-size: 1.125rem;
  pointer-events: none;
  color: #9ca3af;
}

.form-input-modern {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}

.form-input-modern:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

/* ========================================
   SUMMARY KPI
   ======================================== */
.sawmill-summary-modern {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.summary-card-modern {
  flex: 1 1 220px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  background: white;
}

.summary-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-card-modern.log-card .summary-icon-wrapper {
  background: #d1fae5;
  color: #047857;
}

.summary-card-modern.rst-card .summary-icon-wrapper {
  background: #dbeafe;
  color: #1d4ed8;
}

.summary-card-modern.yield-card .summary-icon-wrapper {
  background: #fef3c7;
  color: #92400e;
}

.summary-icon {
  font-size: 1.25rem;
}

.summary-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.summary-label {
  font-size: 0.8125rem;
  color: #6b7280;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
}

/* ========================================
   TABLE
   ======================================== */
.table-wrapper-modern {
  margin-top: 0.5rem;
  overflow-x: auto;
}

.table-sawmill-modern {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.9375rem;
}

.table-sawmill-modern thead {
  background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%);
}

.table-sawmill-modern th {
  padding: 0.9rem 1rem;
  text-align: left;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.table-sawmill-modern td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #111827;
}

.data-row {
  transition: background 0.15s ease;
}

.data-row:hover {
  background: #f9fafb;
}

.text-right {
  text-align: right;
}

.doc-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: #eef2ff;
  color: #3730a3;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Rendemen pill */
.yield-pill {
  display: inline-block;
  min-width: 80px;
  text-align: center;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
}

.yield-good {
  background: #dcfce7;
  color: #15803d;
}

.yield-average {
  background: #fef3c7;
  color: #92400e;
}

.yield-bad {
  background: #fee2e2;
  color: #b91c1c;
}

/* EMPTY STATE */
.empty-cell {
  padding: 2.5rem 1rem;
  text-align: center;
}

.empty-state {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-icon {
  font-size: 2rem;
}

.empty-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
}

.empty-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* ========================================
   BUTTON
   ======================================== */
.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.45);
}

.btn-icon {
  font-size: 1.1rem;
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media (max-width: 900px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }

  .filter-action-group {
    align-items: stretch;
  }

  .btn-action {
    width: 100%;
  }

  .header-content-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-body-sawmill-report {
    padding: 1.75rem;
  }
}
</style>
