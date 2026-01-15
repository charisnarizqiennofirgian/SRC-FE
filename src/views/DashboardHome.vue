<template>
  <DashboardLayout>
    <div class="dashboard-home">
      <!-- Welcome Section -->
      <div class="welcome-section-compact">
        <div class="welcome-content">
          <h1 class="welcome-title">Selamat Datang, {{ userName }} 👋</h1>
          <p class="welcome-subtitle">Berikut adalah progress produksi terkini</p>
        </div>
      </div>

      <!-- Widget: Top Priority Production -->
      <div class="widget-card">
        <div class="widget-header">
          <div class="widget-title">
            <span class="widget-icon">🏭</span>
            <h2>Top Priority Production</h2>
          </div>
          <router-link to="/produksi/monitoring" class="view-all-btn">
            Lihat Semua Order →
          </router-link>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="loading-state">
          <p>Memuat data...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="monitoringData.length === 0" class="empty-state">
          <p>Tidak ada Sales Order aktif saat ini.</p>
        </div>

        <!-- Table -->
        <div v-else class="table-wrapper">
          <table class="monitoring-table">
            <thead>
              <tr>
                <th class="col-so" rowspan="2">No. SO</th>
                <th class="col-item" rowspan="2">Item</th>
                <th class="col-buyer" rowspan="2">Buyer</th>
                <th class="col-num" rowspan="2">Target</th>
                <!-- Zona Hulu -->
                <th colspan="5" class="zone-header zone-hulu">Persiapan Bahan</th>
                <!-- Zona Hilir -->
                <th colspan="5" class="zone-header zone-hilir">Produksi</th>
                <th class="col-num" rowspan="2">Sisa</th>
              </tr>
              <tr>
                <!-- Hulu -->
                <th class="col-status bg-gray">Sanwil</th>
                <th class="col-status bg-gray">KD</th>
                <th class="col-status bg-gray">Pembahanan</th>
                <th class="col-status bg-gray">Moulding</th>
                <th class="col-status bg-gray">Mesin</th>
                <!-- Hilir -->
                <th class="col-num bg-blue">Assembling</th>
                <th class="col-num bg-orange">Rustik</th>
                <th class="col-num bg-yellow">Sanding</th>
                <th class="col-num bg-purple">Finishing</th>
                <th class="col-num bg-green">Packing</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in monitoringData"
                :key="index"
                :class="{ 'row-done': row.is_done }"
              >
                <td class="col-so">
                  <span class="so-number">{{ row.so_number }}</span>
                  <span class="so-date">{{ row.so_date }}</span>
                </td>
                <td class="col-item">
                  <div class="item-name">{{ row.item_name }}</div>
                  <div class="item-code">{{ row.item_code }}</div>
                </td>
                <td class="col-buyer">{{ row.buyer_name }}</td>
                <td class="col-num font-medium">{{ formatNumber(row.target) }}</td>

                <!-- Zona Hulu (Status) -->
                <td class="col-status bg-gray">
                  <span v-if="row.status_sanwil" class="status-ok">✅</span>
                  <span v-else class="status-wait">🔴</span>
                </td>
                <td class="col-status bg-gray">
                  <span v-if="row.status_kd" class="status-ok">✅</span>
                  <span v-else class="status-wait">🔴</span>
                </td>
                <td class="col-status bg-gray">
                  <span v-if="row.status_pembahanan" class="status-ok">✅</span>
                  <span v-else class="status-wait">🔴</span>
                </td>
                <td class="col-status bg-gray">
                  <span v-if="row.status_moulding" class="status-ok">✅</span>
                  <span v-else class="status-wait">🔴</span>
                </td>
                <td class="col-status bg-gray">
                  <span v-if="row.status_mesin" class="status-ok">✅</span>
                  <span v-else class="status-wait">🔴</span>
                </td>

                <!-- Zona Hilir (Angka) -->
                <td class="col-num bg-blue">
                  <span :class="row.qty_assembling > 0 ? 'has-value' : 'no-value'">
                    {{ formatNumber(row.qty_assembling) }}
                  </span>
                </td>
                <td class="col-num bg-orange">
                  <span :class="row.qty_rustik > 0 ? 'has-value' : 'no-value'">
                    {{ formatNumber(row.qty_rustik) }}
                  </span>
                </td>
                <td class="col-num bg-yellow">
                  <span :class="row.qty_sanding > 0 ? 'has-value' : 'no-value'">
                    {{ formatNumber(row.qty_sanding) }}
                  </span>
                </td>
                <td class="col-num bg-purple">
                  <span :class="row.qty_finishing > 0 ? 'has-value' : 'no-value'">
                    {{ formatNumber(row.qty_finishing) }}
                  </span>
                </td>
                <td class="col-num bg-green">
                  <span :class="row.qty_packing > 0 ? 'has-value' : 'no-value'">
                    {{ formatNumber(row.qty_packing) }}
                  </span>
                </td>

                <!-- Sisa -->
                <td class="col-num">
                  <span v-if="row.is_done" class="badge-done">DONE</span>
                  <span v-else class="sisa-value">{{ formatNumber(row.sisa) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Summary -->
        <div v-if="monitoringData.length > 0" class="widget-footer">
          <span class="summary-text">
            Menampilkan {{ monitoringData.length }} item dari {{ totalSO }} SO aktif
          </span>
          <span class="summary-stats">
            <span class="stat-done">{{ doneCount }} selesai</span>
            <span class="stat-pending">{{ pendingCount }} pending</span>
          </span>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '../components/DashboardLayout.vue'
import { ref, computed, onMounted } from 'vue'
import axios from '@/api/axios'

const userName = ref('User')
const monitoringData = ref([])
const isLoading = ref(false)
const totalSO = ref(0)

const fetchMonitoringData = async () => {
  isLoading.value = true

  try {
    const response = await axios.get('/production-monitoring', {
      params: { limit: 10 },
    })

    if (response.data.success) {
      monitoringData.value = response.data.data
      totalSO.value = response.data.total_so
    }
  } catch (error) {
    console.error('Error fetching monitoring data:', error)
  } finally {
    isLoading.value = false
  }
}

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  const number = parseFloat(num)
  if (Number.isInteger(number)) {
    return number.toLocaleString('id-ID')
  }
  return number.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

// Computed
const doneCount = computed(() => {
  return monitoringData.value.filter((row) => row.is_done).length
})

const pendingCount = computed(() => {
  return monitoringData.value.filter((row) => !row.is_done).length
})

onMounted(() => {
  // Get user name
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      userName.value = user.name || 'User'
    } catch (error) {
      console.error('Failed to parse user data:', error)
    }
  }

  // Fetch monitoring data
  fetchMonitoringData()
})
</script>

<style scoped>
.dashboard-home {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
}

/* Welcome Section Compact */
.welcome-section-compact {
  margin-bottom: 24px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.welcome-subtitle {
  font-size: 14px;
  color: #6b7280;
}

/* Widget Card */
.widget-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.widget-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.widget-icon {
  font-size: 24px;
}

.widget-title h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.view-all-btn {
  font-size: 14px;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.view-all-btn:hover {
  color: #2563eb;
}

/* Loading & Empty State */
.loading-state,
.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #6b7280;
}

/* Table */
.table-wrapper {
  overflow-x: auto;
}

.monitoring-table {
  width: 100%;
  min-width: 1400px;
  border-collapse: collapse;
}

.monitoring-table th,
.monitoring-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.monitoring-table th {
  background: #f9fafb;
  font-weight: 600;
  font-size: 12px;
  color: #374151;
  white-space: nowrap;
}

.monitoring-table td {
  font-size: 13px;
  color: #1f2937;
}

/* Zone Headers */
.zone-header {
  text-align: center !important;
  border-bottom: 2px solid #e5e7eb;
}

.zone-hulu {
  background: #f3f4f6 !important;
  color: #4b5563;
}

.zone-hilir {
  background: #dbeafe !important;
  color: #1e40af;
}

.col-num {
  text-align: right !important;
}

.col-status {
  text-align: center !important;
}

.font-medium {
  font-weight: 500;
}

/* Background colors for columns */
.bg-gray {
  background-color: #f9fafb !important;
}
.bg-blue {
  background-color: #eff6ff !important;
}
.bg-yellow {
  background-color: #fefce8 !important;
}
.bg-orange {
  background-color: #fff7ed !important;
}
.bg-purple {
  background-color: #faf5ff !important;
}
.bg-green {
  background-color: #f0fdf4 !important;
}

/* Row done */
.row-done {
  background-color: #f0fdf4;
}

/* SO Number */
.so-number {
  display: block;
  font-weight: 600;
  color: #1f2937;
  font-size: 12px;
}

.so-date {
  display: block;
  font-size: 11px;
  color: #6b7280;
  margin-top: 2px;
}

/* Item */
.item-name {
  font-weight: 500;
  font-size: 12px;
}

.item-code {
  font-size: 11px;
  color: #6b7280;
}

/* Status Icons */
.status-ok {
  font-size: 14px;
}

.status-wait {
  font-size: 12px;
}

/* Values */
.has-value {
  font-weight: 600;
  color: #059669;
}

.no-value {
  color: #9ca3af;
}

.sisa-value {
  font-weight: 600;
  color: #dc2626;
}

.badge-done {
  display: inline-block;
  background: #dcfce7;
  color: #15803d;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 6px;
  border-radius: 4px;
}

/* Widget Footer */
.widget-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  font-size: 13px;
}

.summary-text {
  color: #6b7280;
}

.summary-stats {
  display: flex;
  gap: 16px;
}

.stat-done {
  color: #059669;
  font-weight: 500;
}

.stat-pending {
  color: #dc2626;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-home {
    padding: 16px;
  }

  .welcome-title {
    font-size: 22px;
  }

  .widget-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .widget-footer {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>
