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

        <!-- Legend -->
        <div class="legend-bar">
          <span class="legend-title">Keterangan:</span>
          <span class="legend-item">
            <span class="status-badge badge-waiting">🔴</span> Waiting
          </span>
          <span class="legend-item">
            <span class="status-badge badge-progress">🟡</span> In Progress
          </span>
          <span class="legend-item"> <span class="status-badge badge-done">✅</span> Done </span>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Memuat data...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="monitoringData.length === 0" class="empty-state">
          <span class="empty-icon">📦</span>
          <p>Tidak ada Sales Order aktif saat ini.</p>
        </div>

        <!-- Table -->
        <div v-else class="table-wrapper">
          <table class="monitoring-table">
            <thead>
              <tr>
                <th class="col-so">No. SO & Buyer</th>
                <th class="col-item">Item</th>
                <th class="col-num">Target</th>
                <!-- Zona Hulu -->
                <th colspan="5" class="zone-header zone-hulu">
                  <span class="zone-icon">🌲</span> Persiapan Bahan
                </th>
                <!-- Zona Hilir -->
                <th colspan="7" class="zone-header zone-hilir">
                  <span class="zone-icon">⚙️</span> Produksi
                </th>
                <th class="col-num" rowspan="2" style="background:#fee2e2;color:#dc2626;">⚠️ Reject</th>
                <th class="col-num" rowspan="2">Sisa</th>
              </tr>
              <tr>
                <!-- Hulu -->
                <th class="col-status stage-sanwil">Sanwil</th>
                <th class="col-status stage-kd">KD</th>
                <th class="col-status stage-pembahanan">Pembahanan</th>
                <th class="col-status stage-moulding">Moulding</th>
                <th class="col-status stage-mesin">Mesin</th>
                <!-- Hilir -->
                <th class="col-num stage-ruskomp">Rustik Komp</th>
                <th class="col-num stage-assembling">Assembling</th>
                <th class="col-num stage-rustik">Rustik</th>
                <th class="col-num stage-sanding">Sanding</th>
                <th class="col-num stage-finishing">Finishing</th>
                <th class="col-num stage-qcfinal">QC Final</th>
                <th class="col-num stage-packing">Packing</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(so, soIndex) in monitoringData" :key="so.so_id">
                <tr
                  v-for="(item, itemIndex) in so.items"
                  :key="`${so.so_id}-${item.item_id}`"
                  :class="{
                    'row-done': item.is_done,
                    'row-even': soIndex % 2 === 0,
                    'row-first-item': itemIndex === 0,
                    'row-last-item': itemIndex === so.items.length - 1,
                  }"
                >
                  <!-- SO Info — hanya tampil di baris pertama (rowspan) -->
                  <td
                    v-if="itemIndex === 0"
                    :rowspan="so.items.length"
                    class="col-so td-so-group"
                  >
                    <div class="so-wrapper">
                      <span class="so-number">{{ so.so_number }}</span>
                      <span class="so-buyer">{{ so.buyer_name }}</span>
                      <span class="so-date">{{ so.so_date }}</span>
                      <span v-if="so.is_done" class="so-done-badge">✓ DONE</span>
                    </div>
                  </td>

                  <!-- Item -->
                  <td class="col-item">
                    <div class="item-wrapper">
                      <div class="item-name">{{ item.item_name }}</div>
                      <div class="item-code">{{ item.item_code }}</div>
                    </div>
                  </td>

                  <!-- Target -->
                  <td class="col-num">
                    <span class="target-value">{{ formatNumber(item.target) }}</span>
                  </td>

                  <!-- Zona Hulu -->
                  <td class="col-status stage-sanwil">
                    <span :class="['status-indicator', getStatusClass(item.status_sanwil)]">
                      {{ getStatusIcon(item.status_sanwil) }}
                    </span>
                  </td>
                  <td class="col-status stage-kd">
                    <span :class="['status-indicator', getStatusClass(item.status_kd)]">
                      {{ getStatusIcon(item.status_kd) }}
                    </span>
                  </td>
                  <td class="col-status stage-pembahanan">
                    <span :class="['status-indicator', getStatusClass(item.status_pembahanan)]">
                      {{ getStatusIcon(item.status_pembahanan) }}
                    </span>
                  </td>
                  <td class="col-status stage-moulding">
                    <span :class="['status-indicator', getStatusClass(item.status_moulding)]">
                      {{ getStatusIcon(item.status_moulding) }}
                    </span>
                  </td>
                  <td class="col-status stage-mesin">
                    <span :class="['status-indicator', getStatusClass(item.status_mesin)]">
                      {{ getStatusIcon(item.status_mesin) }}
                    </span>
                  </td>

                  <!-- Zona Hilir -->
                  <td class="col-num stage-ruskomp">
                    <span :class="['qty-value', item.qty_ruskomp > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_ruskomp) }}
                    </span>
                  </td>
                  <td class="col-num stage-assembling">
                    <span :class="['qty-value', item.qty_assembling > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_assembling) }}
                    </span>
                  </td>
                  <td class="col-num stage-rustik">
                    <span :class="['qty-value', item.qty_rustik > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_rustik) }}
                    </span>
                  </td>
                  <td class="col-num stage-sanding">
                    <span :class="['qty-value', item.qty_sanding > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_sanding) }}
                    </span>
                  </td>
                  <td class="col-num stage-finishing">
                    <span :class="['qty-value', item.qty_finishing > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_finishing) }}
                    </span>
                  </td>
                  <td class="col-num stage-qcfinal">
                    <span :class="['qty-value', item.qty_qc_final > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_qc_final) }}
                    </span>
                  </td>
                  <td class="col-num stage-packing">
                    <span :class="['qty-value', item.qty_packing > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_packing) }}
                    </span>
                  </td>

                  <!-- Reject -->
                  <td class="col-num">
                    <span
                      v-if="item.has_reject"
                      class="reject-badge-table"
                      @click="goToDetail(so)"
                      title="Klik untuk lihat detail reject"
                    >
                      ⚠️ {{ formatNumber(item.qty_reject) }} pcs
                    </span>
                    <span v-else class="no-reject">-</span>
                  </td>

                  <!-- Sisa -->
                  <td class="col-num">
                    <div class="sisa-cell">
                      <span v-if="item.is_done" class="completion-badge">
                        <span class="badge-icon">✓</span> DONE
                      </span>
                      <span v-else class="sisa-value">{{ formatNumber(item.sisa) }}</span>
                      <button
                        v-if="itemIndex === 0"
                        class="detail-btn"
                        @click="goToDetail(so)"
                        title="Lihat Detail"
                      >
                        🔍
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Separator antar SO -->
                <tr class="so-separator">
                  <td colspan="20"></td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Footer Summary -->
        <div v-if="monitoringData.length > 0" class="widget-footer">
          <div class="summary-left">
            <span class="summary-icon">📊</span>
            <span class="summary-text">
              Menampilkan <strong>{{ monitoringData.length }}</strong> item dari {{ totalSO }} SO
              aktif
            </span>
          </div>
          <div class="summary-stats">
            <span class="stat-item stat-done">
              <span class="stat-dot"></span>
              {{ doneCount }} selesai
            </span>
            <span class="stat-divider">•</span>
            <span class="stat-item stat-pending">
              <span class="stat-dot"></span>
              {{ pendingCount }} pending
            </span>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '../components/DashboardLayout.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/api/axios'

const router = useRouter()
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

const getStatusIcon = (status) => {
  switch (status) {
    case 'done':
      return '✅'
    case 'in_progress':
      return '🟡'
    case 'waiting':
    default:
      return '🔴'
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 'done':
      return 'status-done'
    case 'in_progress':
      return 'status-progress'
    case 'waiting':
    default:
      return 'status-waiting'
  }
}

const goToDetail = (so) => {
  router.push({ name: 'ProductionMonitoring', query: { so_id: so.so_id } })
}

const doneCount = computed(() => {
  return monitoringData.value.filter((so) => so.is_done).length
})

const pendingCount = computed(() => {
  return monitoringData.value.filter((so) => !so.is_done).length
})

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      userName.value = user.name || 'User'
    } catch (error) {
      console.error('Failed to parse user data:', error)
    }
  }
  fetchMonitoringData()
})
</script>

<style scoped>
/* ============================================
   MODERN DASHBOARD VARIABLES & BASE
   ============================================ */
:root {
  --color-primary: #3b82f6;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-600: #6b7280;
  --color-gray-900: #111827;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --transition-base: all 0.2s ease-in-out;
}

.dashboard-home {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

/* ============================================
   WELCOME SECTION - MODERN HERO
   ============================================ */
.welcome-section-compact {
  margin-bottom: 28px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  color: white;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 6px;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-subtitle {
  font-size: 15px;
  opacity: 0.95;
  font-weight: 400;
}

/* ============================================
   WIDGET CARD - ELEVATED MODERN CARD
   ============================================ */
.widget-card {
  background: white;
  border-radius: 16px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: var(--transition-base);
}

.widget-card:hover {
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.07),
    0 12px 32px rgba(0, 0, 0, 0.08);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 2px solid var(--color-gray-100);
  background: linear-gradient(to right, #fafbfc 0%, #ffffff 100%);
}

.widget-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.widget-icon {
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.widget-title h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-gray-900);
  margin: 0;
  letter-spacing: -0.3px;
}

.view-all-btn {
  font-size: 14px;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  transition: var(--transition-base);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.view-all-btn:hover {
  background: #eff6ff;
  color: #2563eb;
  transform: translateX(2px);
}

/* ============================================
   LEGEND BAR - MODERN STATUS GUIDE
   ============================================ */
.legend-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-bottom: 1px solid #fbbf24;
  font-size: 13px;
  font-weight: 500;
}

.legend-title {
  font-weight: 700;
  color: #92400e;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.5px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #78716c;
  transition: var(--transition-base);
}

.legend-item:hover {
  color: #44403c;
  transform: scale(1.05);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  font-size: 14px;
  box-shadow: var(--shadow-sm);
}

.badge-waiting {
  background: #fee2e2;
}

.badge-progress {
  background: #fef3c7;
}

.badge-done {
  background: #d1fae5;
}

/* ============================================
   LOADING & EMPTY STATES
   ============================================ */
.loading-state {
  padding: 80px 20px;
  text-align: center;
  color: var(--color-gray-600);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-gray-200);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  padding: 80px 20px;
  text-align: center;
  color: var(--color-gray-600);
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* ============================================
   TABLE - MODERN DATA GRID
   ============================================ */
.table-wrapper {
  overflow-x: auto;
  overflow-y: visible;
}

.monitoring-table {
  width: 100%;
  min-width: 1500px;
  border-collapse: separate;
  border-spacing: 0;
}

.monitoring-table th,
.monitoring-table td {
  padding: 14px 12px;
  text-align: left;
  border-bottom: 1px solid var(--color-gray-200);
  transition: var(--transition-base);
}

.monitoring-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.monitoring-table th {
  background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%);
  font-weight: 700;
  font-size: 11px;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.monitoring-table td {
  font-size: 13px;
  color: #1f2937;
  background: white;
}

.monitoring-table tbody tr {
  transition: var(--transition-base);
}

.monitoring-table tbody tr:hover {
  background: #f9fafb;
  transform: scale(1.002);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.row-even {
  background: #fafbfc;
}

.row-done {
  background: linear-gradient(90deg, #f0fdf4 0%, #dcfce7 100%) !important;
}

.row-done:hover {
  background: linear-gradient(90deg, #dcfce7 0%, #bbf7d0 100%) !important;
}

/* ============================================
   ZONE HEADERS - COLORFUL PRODUCTION STAGES
   ============================================ */
.zone-header {
  text-align: center !important;
  font-size: 13px !important;
  font-weight: 800 !important;
  padding: 16px 12px !important;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 3px solid;
}

.zone-icon {
  font-size: 18px;
  margin-right: 6px;
}

.zone-hulu {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%) !important;
  color: #3730a3 !important;
  border-bottom-color: #6366f1 !important;
}

.zone-hilir {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
  color: #1e40af !important;
  border-bottom-color: #3b82f6 !important;
}

/* ============================================
   STAGE COLUMNS - GRADIENT BACKGROUNDS
   ============================================ */
.stage-sanwil,
.stage-kd,
.stage-pembahanan,
.stage-moulding,
.stage-mesin {
  background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%) !important;
}

.stage-assembling {
  background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%) !important;
}

.stage-ruskomp {
  background: linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%) !important;
  color: #9a3412 !important;
}

.stage-rustik {
  background: linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%) !important;
}

.stage-sanding {
  background: linear-gradient(180deg, #fefce8 0%, #fef9c3 100%) !important;
}

.stage-finishing {
  background: linear-gradient(180deg, #faf5ff 0%, #f3e8ff 100%) !important;
}

.stage-qcfinal {
  background: linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%) !important;
}

.stage-packing {
  background: linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%) !important;
}

/* ============================================
   COLUMN ALIGNMENTS
   ============================================ */
.col-num {
  text-align: right !important;
  font-variant-numeric: tabular-nums;
}

.col-status {
  text-align: center !important;
}

/* ============================================
   SO & ITEM CELLS - STRUCTURED INFO
   ============================================ */
.so-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.so-number {
  font-weight: 700;
  color: #1f2937;
  font-size: 13px;
  display: block;
}

.so-date {
  font-size: 11px;
  color: var(--color-gray-600);
  display: block;
}

.item-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-weight: 600;
  font-size: 13px;
  color: #1f2937;
  line-height: 1.3;
}

.item-code {
  font-size: 11px;
  color: var(--color-gray-600);
  font-family: 'Courier New', monospace;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.buyer-name {
  font-weight: 500;
  color: #374151;
}

.target-value {
  font-weight: 700;
  color: #1e40af;
  font-size: 14px;
}

/* ============================================
   STATUS INDICATORS - 3D BADGES
   ============================================ */
.status-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 16px;
  transition: var(--transition-base);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-indicator:hover {
  transform: scale(1.15) rotate(5deg);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.status-done {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 2px solid #10b981;
}

.status-progress {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  animation: pulse 2s ease-in-out infinite;
}

.status-waiting {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border: 2px solid #ef4444;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* ============================================
   QUANTITY VALUES - BOLD NUMBERS
   ============================================ */
.qty-value {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 13px;
  transition: var(--transition-base);
}

.has-value {
  color: #059669;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
}

.has-value:hover {
  background: #a7f3d0;
  transform: scale(1.05);
}

.no-value {
  color: #d1d5db;
  font-weight: 400;
}

.sisa-value {
  font-weight: 800;
  color: #dc2626;
  font-size: 15px;
  display: inline-block;
  padding: 4px 10px;
  background: #fee2e2;
  border-radius: 6px;
  border: 1px solid #fecaca;
}

/* ============================================
   COMPLETION BADGE - SUCCESS STATE
   ============================================ */
.completion-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  transition: var(--transition-base);
}

.completion-badge:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.badge-icon {
  font-weight: 900;
  font-size: 13px;
}

/* ============================================
   WIDGET FOOTER - SUMMARY STATS
   ============================================ */
.widget-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-top: 2px solid var(--color-gray-200);
  font-size: 13px;
}

.summary-left {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-gray-600);
}

.summary-icon {
  font-size: 20px;
}

.summary-text strong {
  color: var(--color-gray-900);
  font-weight: 700;
}

.summary-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
  transition: var(--transition-base);
}

.stat-done {
  color: #059669;
  background: #d1fae5;
}

.stat-pending {
  color: #dc2626;
  background: #fee2e2;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
}

.stat-divider {
  color: var(--color-gray-400);
  font-weight: 300;
}

/* ============================================
   SISA CELL - DETAIL BUTTON
   ============================================ */
.sisa-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.detail-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 6px;
  transition: var(--transition-base);
  line-height: 1;
  flex-shrink: 0;
}

.detail-btn:hover {
  background: #eff6ff;
  transform: scale(1.2);
}

.reject-badge-table {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
}
.reject-badge-table:hover {
  background: #fecaca;
  transform: scale(1.05);
}
.no-reject {
  color: #d1d5db;
  font-size: 0.82rem;
}

.td-so-group {
  vertical-align: top;
  padding-top: 16px !important;
  border-right: 2px solid #e5e7eb;
  background: #f9fafb !important;
}

.so-buyer {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-top: 4px;
}

.so-done-badge {
  display: inline-block;
  margin-top: 6px;
  background: #d1fae5;
  color: #065f46;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}

.row-first-item td {
  border-top: 2px solid #e5e7eb;
}

.so-separator td {
  padding: 4px 0 !important;
  background: #f3f4f6 !important;
  border: none !important;
}

/* ============================================
   RESPONSIVE DESIGN
   ============================================ */
@media (max-width: 1024px) {
  .dashboard-home {
    padding: 16px;
  }

  .widget-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .legend-bar {
    flex-wrap: wrap;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 24px;
  }

  .widget-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .summary-stats {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
