<template>
  <DashboardLayout>
    <div class="monitoring-page">
      <!-- Breadcrumb & Header -->
      <div class="page-header">
        <div class="breadcrumb">
          <router-link to="/" class="breadcrumb-item">
            <span class="breadcrumb-icon">🏠</span>
            Dashboard
          </router-link>
          <span class="breadcrumb-separator">→</span>
          <span class="breadcrumb-current">Monitoring Produksi</span>
        </div>
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">
              <span class="title-icon">📊</span>
              Monitoring Progress Produksi
            </h1>
            <p class="page-subtitle">Semua Sales Order aktif dan progress di setiap gudang</p>
          </div>
        </div>
      </div>

      <!-- Legend Card -->
      <div class="legend-card">
        <div class="legend-header">
          <span class="legend-icon">ℹ️</span>
          <span class="legend-title">Keterangan Status</span>
        </div>
        <div class="legend-items">
          <div class="legend-item">
            <span class="status-badge badge-waiting">🔴</span>
            <span class="legend-text"> <strong>Waiting</strong> - Belum ada aktivitas </span>
          </div>
          <div class="legend-divider"></div>
          <div class="legend-item">
            <span class="status-badge badge-progress">🟡</span>
            <span class="legend-text"> <strong>In Progress</strong> - Ada sisa </span>
          </div>
          <div class="legend-divider"></div>
          <div class="legend-item">
            <span class="status-badge badge-done">✅</span>
            <span class="legend-text"> <strong>Done</strong> - Semua sudah keluar </span>
          </div>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filter-card">
        <div class="filter-header">
          <span class="filter-icon">🔍</span>
          <span class="filter-title">Pencarian & Filter</span>
        </div>
        <div class="filter-content">
          <div class="search-group">
            <label class="search-label">
              <span class="label-text">Cari No. SO / Nama Buyer</span>
              <span class="label-badge">Real-time</span>
            </label>
            <div class="search-input-wrapper">
              <span class="search-icon">🔎</span>
              <input
                type="text"
                v-model="search"
                @keyup.enter="fetchData"
                placeholder="Ketik nomor SO atau nama buyer..."
                class="search-input"
              />
              <button v-if="search" @click="resetFilter" class="clear-btn" title="Clear">✕</button>
            </div>
          </div>
          <div class="action-buttons">
            <button @click="fetchData" class="btn btn-primary">
              <span class="btn-icon">🔍</span>
              Cari
            </button>
            <button @click="resetFilter" class="btn btn-secondary">
              <span class="btn-icon">↻</span>
              Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Memuat data monitoring...</p>
      </div>

      <!-- Table Container -->
      <div v-else class="table-container">
        <!-- Stats Summary Bar -->
        <div class="stats-bar">
          <div class="stat-item stat-total">
            <span class="stat-icon">📦</span>
            <div class="stat-content">
              <span class="stat-value">{{ allItems.length }}</span>
              <span class="stat-label">Total Items</span>
            </div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item stat-orders">
            <span class="stat-icon">📋</span>
            <div class="stat-content">
              <span class="stat-value">{{ uniqueSOCount }}</span>
              <span class="stat-label">Sales Orders</span>
            </div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item stat-done">
            <span class="stat-icon">✅</span>
            <div class="stat-content">
              <span class="stat-value">{{ doneCount }}</span>
              <span class="stat-label">Selesai</span>
            </div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item stat-pending">
            <span class="stat-icon">⏳</span>
            <div class="stat-content">
              <span class="stat-value">{{ pendingCount }}</span>
              <span class="stat-label">Pending</span>
            </div>
          </div>
        </div>

        <!-- Table Wrapper -->
        <div class="table-scroll-wrapper">
          <table class="data-table">
            <thead class="table-header">
              <tr class="header-row-main">
                <th class="th-sticky" rowspan="2">No. SO &amp; Buyer</th>
                <th rowspan="2">Item</th>
                <th class="th-num" rowspan="2">Target</th>
                <th class="th-num" rowspan="2">Tgl. Kirim</th>
                <!-- Zona Hulu -->
                <th colspan="5" class="zone-header zone-hulu">
                  <span class="zone-icon">🌲</span>
                  <span class="zone-text">Persiapan Bahan</span>
                </th>
                <!-- Zona Hilir -->
                <th colspan="7" class="zone-header zone-hilir">
                  <span class="zone-icon">⚙️</span>
                  <span class="zone-text">Produksi</span>
                </th>
                <th class="th-num" rowspan="2" style="background:#fee2e2;color:#dc2626;">⚠️ Reject</th>
                <th class="th-num" rowspan="2">Sisa</th>
              </tr>
              <tr class="header-row-sub">
                <!-- Hulu -->
                <th class="th-stage stage-hulu">Sawmill</th>
                <th class="th-stage stage-hulu">KD</th>
                <th class="th-stage stage-hulu">Pembahanan</th>
                <th class="th-stage stage-moulding">Moulding</th>
                <th class="th-stage stage-mesin">Mesin</th>
                <!-- Hilir -->
                <th class="th-stage stage-ruskomp">Rustik Komp</th>
                <th class="th-stage stage-assembling">Assembling</th>
                <th class="th-stage stage-sanding">Sanding</th>
                <th class="th-stage stage-rustik">Rustik</th>
                <th class="th-stage stage-finishing">Finishing</th>
                <th class="th-stage stage-qcfinal">QC Final</th>
                <th class="th-stage stage-packing">Packing</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <!-- Empty State -->
              <tr v-if="data.length === 0" class="empty-row">
                <td colspan="18" class="empty-cell">
                  <div class="empty-state">
                    <span class="empty-icon">📭</span>
                    <p class="empty-text">Tidak ada data Sales Order aktif.</p>
                    <p class="empty-subtext">Coba ubah filter atau tambahkan SO baru</p>
                  </div>
                </td>
              </tr>
              <!-- Data Rows — grouped per SO -->
              <template v-for="(so, soIndex) in paginatedData" :key="so.so_id">
                <tr
                  v-for="(item, itemIndex) in so.items"
                  :key="item.detail_id ?? `${so.so_id}-${item.item_id}-${itemIndex}`"
                  class="data-row"
                  :class="{
                    'row-done': item.is_done,
                    'row-even': soIndex % 2 === 0,
                    'row-first-item': itemIndex === 0,
                  }"
                >
                  <!-- SO + Buyer — rowspan ke semua item SO ini -->
                  <td
                    v-if="itemIndex === 0"
                    :rowspan="so.items.length"
                    class="td-so td-so-group"
                  >
                    <div class="so-wrapper">
                      <span class="so-number">{{ so.so_number }}</span>
                      <span class="so-buyer">{{ so.buyer_name }}</span>
                      <span v-if="so.customer_po_number" class="so-po">PO: {{ so.customer_po_number }}</span>
                      <span class="so-date">{{ so.so_date }}</span>
                      <span v-if="so.is_done" class="so-done-badge">✓ DONE</span>
                    </div>
                  </td>

                  <!-- Item -->
                  <td class="td-item">
                    <div class="item-wrapper">
                      <div class="item-name">{{ item.item_name }}</div>
                      <div class="item-code">{{ item.item_code }}</div>
                    </div>
                  </td>

                  <!-- Target -->
                  <td class="td-num">
                    <span class="target-value">{{ formatNumber(item.target) }}</span>
                  </td>

                  <!-- Tgl. Kirim -->
                  <td class="td-num">
                    <span class="tgl-kirim-value">{{ item.delivery_date || '-' }}</span>
                  </td>

                  <!-- Zona Hulu (Status) -->
                  <td class="td-status stage-hulu">
                    <span :class="['status-indicator', getStatusClass(item.status_sanwil)]">
                      {{ getStatusIcon(item.status_sanwil) }}
                    </span>
                  </td>
                  <td class="td-status stage-hulu">
                    <span :class="['status-indicator', getStatusClass(item.status_kd)]">
                      {{ getStatusIcon(item.status_kd) }}
                    </span>
                  </td>
                  <td class="td-status stage-hulu">
                    <span :class="['status-indicator', getStatusClass(item.status_pembahanan)]">
                      {{ getStatusIcon(item.status_pembahanan) }}
                    </span>
                  </td>
                  <td class="td-qty stage-moulding">
                    <span :class="['qty-value', item.qty_moulding > 0 ? 'has-value' : 'no-value']">
                      {{ item.qty_moulding > 0 ? formatNumber(item.qty_moulding) : '-' }}
                    </span>
                  </td>
                  <td class="td-qty stage-mesin">
                    <span :class="['qty-value', item.qty_mesin > 0 ? 'has-value' : 'no-value']">
                      {{ item.qty_mesin > 0 ? formatNumber(item.qty_mesin) : '-' }}
                    </span>
                  </td>

                  <!-- Zona Hilir (Qty) -->
                  <td class="td-qty stage-ruskomp">
                    <span :class="['qty-value', item.qty_ruskomp > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_ruskomp) }}
                    </span>
                  </td>
                  <td class="td-qty stage-assembling">
                    <span :class="['qty-value', item.qty_assembling > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_assembling) }}
                    </span>
                  </td>
                  <td class="td-qty stage-sanding">
                    <span :class="['qty-value', item.qty_sanding > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_sanding) }}
                    </span>
                  </td>
                  <td class="td-qty stage-rustik">
                    <span :class="['qty-value', item.qty_rustik > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_rustik) }}
                    </span>
                  </td>
                  <td class="td-qty stage-finishing">
                    <span :class="['qty-value', item.qty_finishing > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_finishing) }}
                    </span>
                  </td>
                  <td class="td-qty stage-qcfinal">
                    <span :class="['qty-value', item.qty_qc_final > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_qc_final) }}
                    </span>
                  </td>
                  <td class="td-qty stage-packing">
                    <span :class="['qty-value', item.qty_packing > 0 ? 'has-value' : 'no-value']">
                      {{ formatNumber(item.qty_packing) }}
                    </span>
                  </td>

                  <!-- Reject -->
                  <td class="td-qty">
                    <span
                      v-if="item.has_reject"
                      class="reject-badge-table"
                      @click="openRejectDetail(so, item)"
                      title="Klik untuk lihat detail reject"
                    >
                      ⚠️ {{ formatNumber(item.qty_reject) }} pcs
                    </span>
                    <span v-else class="no-reject">-</span>
                  </td>

                  <!-- Sisa -->
                  <td class="td-num">
                    <div class="sisa-cell">
                      <span v-if="item.is_done" class="completion-badge">
                        <span class="badge-icon">✓</span> DONE
                      </span>
                      <span v-else class="sisa-value">{{ formatNumber(item.sisa) }}</span>
                      <button
                        v-if="itemIndex === 0"
                        class="btn-detail"
                        @click="openDetail(so, item)"
                        title="Lihat Detail"
                      >🔍</button>
                    </div>
                  </td>
                </tr>

                <!-- Separator antar SO -->
                <tr class="so-separator">
                  <td colspan="18"></td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-container">
          <div class="pagination-info">
            <span class="info-icon">📄</span>
            <span class="info-text">
              Menampilkan SO <strong>{{ paginationStart }} - {{ paginationEnd }}</strong> dari
              <strong>{{ uniqueSOCount }}</strong> SO
              <span class="info-separator">•</span>
              <span class="info-detail">
                <strong>{{ allItems.length }}</strong> item
              </span>
            </span>
          </div>
          <div class="pagination-controls">
            <button
              @click="currentPage = 1"
              :disabled="currentPage === 1"
              class="page-btn"
              title="First Page"
            >
              «
            </button>
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="page-btn"
              title="Previous"
            >
              ‹
            </button>
            <div class="page-indicator">
              <span class="current-page">{{ currentPage }}</span>
              <span class="page-separator">/</span>
              <span class="total-pages">{{ totalPages }}</span>
            </div>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="page-btn"
              title="Next"
            >
              ›
            </button>
            <button
              @click="currentPage = totalPages"
              :disabled="currentPage === totalPages"
              class="page-btn"
              title="Last Page"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DETAIL -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-header-left">
            <span class="modal-icon">🔍</span>
            <div>
              <h3 class="modal-title">Detail Produksi</h3>
              <p class="modal-subtitle">
                {{ selectedRow?.so_number }} — {{ selectedRow?.item_name }}
                <span class="modal-buyer">{{ selectedRow?.buyer_name }}</span>
              </p>
            </div>
          </div>
          <div class="modal-header-actions">
            <button
              class="btn-export-excel"
              @click="exportExcel"
              :disabled="!selectedRow"
              title="Export Excel"
            >
              📥 Export Excel
            </button>
            <button class="modal-close" @click="closeModal">✕</button>
          </div>
        </div>

        <div class="modal-body">
          <!-- Loading -->
          <div v-if="loadingDetail" class="modal-loading">
            <div class="loading-spinner"></div>
            <p>Memuat detail...</p>
          </div>

          <template v-else-if="detailData">
            <!-- Per Stage -->
            <div
              v-for="stage in detailData.stages"
              :key="stage.type"
              class="stage-block"
              :class="getStageClass(stage.type)"
            >
              <div class="stage-block-header">
                <span class="stage-block-icon">{{ getStageIcon(stage.type) }}</span>
                <div>
                  <div class="stage-block-title">{{ stage.stage }}</div>
                  <div class="stage-block-totals">
                    <span class="total-in">📥 Input: {{ formatNumber(stage.total_out) }} pcs</span>
                    <span class="total-out">📤 Output: {{ formatNumber(stage.total_in) }} pcs</span>
                  </div>
                </div>
              </div>

              <!-- INPUT (yang diambil/dipakai) -->
              <div v-if="stage.outputs && stage.outputs.length > 0" class="sub-section">
                <div class="sub-section-title input-title">📥 Bahan Masuk / Dipakai</div>
                <table class="detail-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>No. Dokumen</th>
                      <th>Item</th>
                      <th>Gudang</th>
                      <th class="col-right">Qty</th>
                      <th>Catatan</th>
                      <th>User</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(tx, i) in stage.outputs" :key="'out-'+i" class="input-row">
                      <td>{{ tx.date }}</td>
                      <td><span class="doc-number">{{ tx.reference_number }}</span></td>
                      <td>
                        <div class="tx-item-code">{{ tx.item_code }}</div>
                        <div class="tx-item-name">{{ tx.item_name }}</div>
                      </td>
                      <td>{{ tx.warehouse_name }}</td>
                      <td class="col-right"><strong>{{ formatNumber(tx.qty) }}</strong></td>
                      <td class="tx-notes">{{ tx.notes }}</td>
                      <td>{{ tx.user_name }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- OUTPUT (hasil produksi) -->
              <div v-if="stage.inputs && stage.inputs.length > 0" class="sub-section">
                <div class="sub-section-title output-title">📤 Hasil / Keluar</div>
                <table class="detail-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>No. Dokumen</th>
                      <th>Item</th>
                      <th>Gudang</th>
                      <th class="col-right">Qty</th>
                      <th>Catatan</th>
                      <th>User</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(tx, i) in stage.inputs" :key="'in-'+i" class="output-row">
                      <td>{{ tx.date }}</td>
                      <td><span class="doc-number">{{ tx.reference_number }}</span></td>
                      <td>
                        <div class="tx-item-code">{{ tx.item_code }}</div>
                        <div class="tx-item-name">{{ tx.item_name }}</div>
                      </td>
                      <td>{{ tx.warehouse_name }}</td>
                      <td class="col-right"><strong>{{ formatNumber(tx.qty) }}</strong></td>
                      <td class="tx-notes">{{ tx.notes }}</td>
                      <td>{{ tx.user_name }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Reject Section -->
            <div v-if="detailData.rejects && detailData.rejects.length > 0" class="reject-block">
              <div class="stage-block-header reject-header">
                <span class="stage-block-icon">⚠️</span>
                <div>
                  <div class="stage-block-title">Reject</div>
                  <div class="stage-block-total">
                    Total: {{ formatNumber(detailData.rejects.reduce((s,r) => s + r.qty, 0)) }} pcs
                  </div>
                </div>
              </div>

              <table class="detail-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>No. Dokumen</th>
                    <th>Item</th>
                    <th>Jenis Reject</th>
                    <th class="col-right">Qty</th>
                    <th>Keterangan</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, i) in detailData.rejects" :key="i" class="reject-row">
                    <td>{{ r.date }}</td>
                    <td><span class="doc-number">{{ r.reference_number }}</span></td>
                    <td>
                      <div class="tx-item-code">{{ r.item_code }}</div>
                      <div class="tx-item-name">{{ r.item_name }}</div>
                    </td>
                    <td><span class="reject-type-badge">{{ r.transaction_type }}</span></td>
                    <td class="col-right reject-qty"><strong>{{ formatNumber(r.qty) }}</strong></td>
                    <td class="tx-notes reject-notes">{{ r.notes }}</td>
                    <td>{{ r.user_name }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty -->
            <div v-if="detailData.stages.length === 0 && (!detailData.rejects || detailData.rejects.length === 0)" class="modal-empty">
              <span class="empty-icon">📭</span>
              <p>Belum ada transaksi produksi untuk item ini</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '../../components/DashboardLayout.vue'
import { ref, computed, onMounted } from 'vue'
import axios from '@/api/axios'

const data = ref([])
const isLoading = ref(false)
const search = ref('')
const currentPage = ref(1)
const perPage = 20

const fetchData = async () => {
  isLoading.value = true
  currentPage.value = 1

  try {
    const params = {}
    if (search.value) params.search = search.value

    const response = await axios.get('/production-monitoring', { params })

    if (response.data.success) {
      data.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    isLoading.value = false
  }
}

const allItems = computed(() => data.value.flatMap(so => so.items ?? []))

const resetFilter = () => {
  search.value = ''
  fetchData()
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
    case 'done':        return '✅'
    case 'in_progress': return '🟡'
    case 'skip':        return '⏭️'
    case 'waiting':
    default:            return '🔴'
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 'done':        return 'status-done'
    case 'in_progress': return 'status-progress'
    case 'skip':        return 'status-skip'
    case 'waiting':
    default:            return 'status-waiting'
  }
}

const totalPages = computed(() => {
  return Math.ceil(data.value.length / perPage) || 1
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage
  const end = start + perPage
  return data.value.slice(start, end)
})

const paginationStart = computed(() => {
  if (data.value.length === 0) return 0
  return (currentPage.value - 1) * perPage + 1
})

const paginationEnd = computed(() => {
  const end = currentPage.value * perPage
  return end > data.value.length ? data.value.length : end
})

const uniqueSOCount = computed(() => data.value.length)

const doneCount = computed(() => allItems.value.filter(item => item.is_done).length)

const pendingCount = computed(() => allItems.value.filter(item => !item.is_done).length)

onMounted(() => {
  fetchData()
})

// === MODAL DETAIL ===
const showModal     = ref(false)
const loadingDetail = ref(false)
const detailData    = ref(null)
const selectedRow   = ref(null)

const openDetail = async (so, item) => {
  selectedRow.value  = { ...item, so_id: so.so_id, so_number: so.so_number, buyer_name: so.buyer_name }
  showModal.value    = true
  loadingDetail.value = true
  detailData.value   = null

  try {
    const res = await axios.get('/production-monitoring/detail', {
      params: {
        so_id:   so.so_id,
        item_id: item.item_id,
      }
    })
    if (res.data.success) {
      detailData.value = res.data
    }
  } catch (error) {
    console.error('Error fetching detail:', error)
  } finally {
    loadingDetail.value = false
  }
}

const closeModal = () => {
  showModal.value  = false
  detailData.value = null
  selectedRow.value = null
}

const openRejectDetail = async (so, item) => {
  selectedRow.value  = { ...item, so_id: so.so_id, so_number: so.so_number, buyer_name: so.buyer_name }
  showModal.value    = true
  loadingDetail.value = true
  detailData.value   = null

  try {
    const res = await axios.get('/production-monitoring/detail', {
      params: { so_id: so.so_id, item_id: item.item_id }
    })
    if (res.data.success) {
      detailData.value = res.data
      setTimeout(() => {
        const rejectEl = document.querySelector('.reject-block')
        if (rejectEl) rejectEl.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    }
  } catch (error) {
    console.error(error)
  } finally {
    loadingDetail.value = false
  }
}

const exportExcel = async () => {
  if (!selectedRow.value) return
  try {
    const res = await axios.get('/production-monitoring/export-excel', {
      params: { so_id: selectedRow.value.so_id },
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Laporan_Produksi_${selectedRow.value.so_number}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error('Gagal export Excel:', error)
  }
}

const getStageIcon = (type) => {
  const icons = {
    'SAWMILL':         '🪚',
    'KD':              '🌡️',
    'PEMBAHANAN':      '🪵',
    'MOULDING':        '🔨',
    'MESIN':           '⚙️',
    'RUSTIK_KOMPONEN': '🪵',
    'SUB_ASSEMBLING':  '🔩',
    'RAKIT':           '🔧',
    'SANDING':         '✨',
    'RUSTIK':          '🪵',
    'FINISHING':       '🎨',
    'QC_FINAL':        '🔍',
    'PACKING':         '📦',
  }
  return icons[type] || '📋'
}

const getStageClass = (type) => {
  const classes = {
    'SAWMILL':         'stage-sawmill-block',
    'PEMBAHANAN':      'stage-pembahanan-block',
    'MOULDING':        'stage-moulding-block',
    'MESIN':           'stage-mesin-block',
    'RUSTIK_KOMPONEN': 'stage-ruskomp-block',
    'SUB_ASSEMBLING':  'stage-assembling-block',
    'RAKIT':           'stage-assembling-block',
    'SANDING':         'stage-sanding-block',
    'RUSTIK':          'stage-rustik-block',
    'FINISHING':       'stage-finishing-block',
    'QC_FINAL':        'stage-qc-block',
    'PACKING':         'stage-packing-block',
  }
  return classes[type] || ''
}
</script>

<style scoped>
/* ============================================
   VARIABLES & BASE
   ============================================ */
.monitoring-page {
  max-width: 1800px;
  margin: 0 auto;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

/* ============================================
   PAGE HEADER & BREADCRUMB
   ============================================ */
.page-header {
  margin-bottom: 24px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 13px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.breadcrumb-item:hover {
  background: #eff6ff;
  color: #2563eb;
}

.breadcrumb-icon {
  font-size: 14px;
}

.breadcrumb-separator {
  color: #cbd5e1;
  font-weight: 300;
}

.breadcrumb-current {
  color: #64748b;
  font-weight: 600;
}

.header-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px 28px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title-icon {
  font-size: 32px;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.95);
  font-size: 14px;
  margin: 0;
  font-weight: 400;
}

/* ============================================
   LEGEND CARD
   ============================================ */
.legend-card {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #fbbf24;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.15);
}

.legend-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.legend-icon {
  font-size: 18px;
}

.legend-title {
  font-weight: 700;
  color: #92400e;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.legend-items {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  padding: 8px 14px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.legend-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.status-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.legend-text {
  color: #78716c;
  font-size: 13px;
}

.legend-text strong {
  color: #44403c;
  font-weight: 600;
}

.legend-divider {
  width: 1px;
  height: 24px;
  background: #e7e5e4;
}

/* ============================================
   FILTER CARD
   ============================================ */
.filter-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 2px solid #f3f4f6;
  background: linear-gradient(to right, #fafbfc 0%, #ffffff 100%);
  border-radius: 12px 12px 0 0;
}

.filter-icon {
  font-size: 20px;
}

.filter-title {
  font-weight: 700;
  font-size: 15px;
  color: #1f2937;
  letter-spacing: -0.2px;
}

.filter-content {
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.search-group {
  flex: 1;
  min-width: 300px;
}

.search-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.label-text {
  font-weight: 600;
  font-size: 13px;
  color: #374151;
}

.label-badge {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  font-size: 16px;
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 11px 14px 11px 42px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

.clear-btn {
  position: absolute;
  right: 12px;
  background: #e5e7eb;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: #d1d5db;
  color: #374151;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.btn-icon {
  font-size: 16px;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #4b5563;
}

.btn-secondary:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

/* ============================================
   LOADING STATE
   ============================================ */
.loading-container {
  background: white;
  border-radius: 12px;
  padding: 80px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

/* ============================================
   TABLE CONTAINER & STATS
   ============================================ */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.stats-bar {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-bottom: 2px solid #e5e7eb;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 10px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 24px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.stat-total .stat-value {
  color: #3b82f6;
}

.stat-orders .stat-value {
  color: #8b5cf6;
}

.stat-done .stat-value {
  color: #10b981;
}

.stat-pending .stat-value {
  color: #ef4444;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e5e7eb;
}

/* ============================================
   DATA TABLE
   ============================================ */
.table-scroll-wrapper {
  overflow-x: auto;
  overflow-y: visible;
}

.data-table {
  width: 100%;
  min-width: 1600px;
  border-collapse: separate;
  border-spacing: 0;
}

.table-header {
  position: sticky;
  top: 0;
  z-index: 20;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.data-table th {
  padding: 14px 12px;
  text-align: left;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e5e7eb;
}

.header-row-main th {
  background: linear-gradient(180deg, #1f2937 0%, #111827 100%);
  color: white;
}

.th-sticky {
  position: sticky;
  left: 0;
  z-index: 15;
  background: linear-gradient(180deg, #1f2937 0%, #111827 100%) !important;
}


.th-num {
  text-align: right !important;
}

.zone-header {
  text-align: center !important;
  font-size: 12px !important;
  font-weight: 800 !important;
  padding: 16px 12px !important;
}

.zone-icon {
  font-size: 18px;
  margin-right: 6px;
}

.zone-hulu {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
  border-bottom-color: #4338ca !important;
}

.zone-hilir {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
  border-bottom-color: #1d4ed8 !important;
}

.header-row-sub th {
  background: #f9fafb;
  color: #374151;
  font-size: 10px;
}

.th-stage {
  text-align: center !important;
  white-space: nowrap;
}

.stage-hulu {
  background: linear-gradient(180deg, #e0e7ff 0%, #c7d2fe 100%) !important;
  color: #3730a3 !important;
}

.stage-assembling {
  background: linear-gradient(180deg, #dbeafe 0%, #bfdbfe 100%) !important;
  color: #1e40af !important;
}

.stage-rustik {
  background: linear-gradient(180deg, #ffedd5 0%, #fed7aa 100%) !important;
  color: #9a3412 !important;
}

.stage-sanding {
  background: linear-gradient(180deg, #fef9c3 0%, #fef08a 100%) !important;
  color: #854d0e !important;
}

.stage-finishing {
  background: linear-gradient(180deg, #f3e8ff 0%, #e9d5ff 100%) !important;
  color: #6b21a8 !important;
}

.stage-packing {
  background: linear-gradient(180deg, #dcfce7 0%, #bbf7d0 100%) !important;
  color: #166534 !important;
}

/* ============================================
   TABLE BODY
   ============================================ */
.data-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
  background: white;
}

.data-row {
  transition: all 0.2s ease;
}

.data-row:hover {
  background: #f9fafb;
  transform: scale(1.001);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.row-even {
  background: #fafbfc;
}

.row-done {
  background: linear-gradient(90deg, #ecfdf5 0%, #d1fae5 100%) !important;
}

.row-done:hover {
  background: linear-gradient(90deg, #d1fae5 0%, #a7f3d0 100%) !important;
}

/* Empty State */
.empty-cell {
  padding: 80px 20px !important;
}

.empty-state {
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.4;
}

.empty-text {
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
}

.empty-subtext {
  font-size: 13px;
  color: #9ca3af;
}

/* Cell Styles */
.td-so {
  min-width: 160px;
}

.td-so-group {
  position: sticky;
  left: 0;
  z-index: 5;
  background: #f9fafb;
  border-right: 2px solid #e5e7eb;
  vertical-align: top;
}

.so-wrapper {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.so-number {
  font-weight: 700;
  color: #1f2937;
  font-size: 13px;
}

.so-buyer {
  font-weight: 600;
  color: #3b82f6;
  font-size: 12px;
}

.so-po {
  font-size: 11px;
  color: #9ca3af;
}

.so-date {
  font-size: 11px;
  color: #6b7280;
}

.so-done-badge {
  display: inline-block;
  background: #d1fae5;
  color: #065f46;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #a7f3d0;
}

.so-separator {
  height: 6px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

.so-separator td {
  padding: 0 !important;
}

.td-item {
  min-width: 200px;
}

.item-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-weight: 600;
  color: #1f2937;
  line-height: 1.3;
}

.item-code {
  font-size: 11px;
  color: #6b7280;
  font-family: 'Courier New', monospace;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.tgl-kirim-value {
  font-size: 12px;
  color: #374151;
  white-space: nowrap;
}

.td-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.target-value {
  font-weight: 700;
  color: #1e40af;
  font-size: 14px;
}

.td-status {
  text-align: center !important;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-indicator:hover {
  transform: scale(1.15) rotate(5deg);
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

.status-skip {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border: 2px solid #9ca3af;
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

.td-qty {
  text-align: center !important;
}

.qty-value {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 13px;
  transition: all 0.2s ease;
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
  font-size: 14px;
  display: inline-block;
  padding: 4px 10px;
  background: #fee2e2;
  border-radius: 6px;
  border: 1px solid #fecaca;
}

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
  transition: all 0.2s ease;
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
   PAGINATION
   ============================================ */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-top: 2px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #6b7280;
}

.info-icon {
  font-size: 18px;
}

.info-text strong {
  color: #1f2937;
  font-weight: 700;
}

.info-separator {
  margin: 0 8px;
  color: #cbd5e1;
}

.info-detail {
  color: #8b5cf6;
  font-weight: 600;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-btn {
  width: 36px;
  height: 36px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 16px;
  color: #374151;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  height: 36px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 8px;
  color: white;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.current-page {
  font-size: 16px;
}

.page-separator {
  opacity: 0.7;
}

.total-pages {
  opacity: 0.9;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 1024px) {
  .monitoring-page {
    padding: 16px;
  }

  .stats-bar {
    gap: 8px;
  }

  .stat-item {
    padding: 8px 12px;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 22px;
  }

  .header-content {
    padding: 20px;
  }

  .filter-content {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons {
    width: 100%;
  }

  .btn {
    flex: 1;
  }

  .stats-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .stat-item {
    justify-content: flex-start;
  }

  .stat-divider {
    display: none;
  }

  .pagination-container {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-info {
    justify-content: center;
    text-align: center;
  }

  .pagination-controls {
    justify-content: center;
  }
}

/* ===== QC FINAL COLUMN ===== */
.stage-qcfinal {
  background: linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%) !important;
  color: #065f46 !important;
}

/* ===== SISA CELL ===== */
.sisa-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.btn-detail {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  padding: 3px 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.btn-detail:hover {
  background: #dbeafe;
  transform: scale(1.1);
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

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 1100px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #1e3a5f, #1e40af);
  color: white;
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-icon { font-size: 2rem; }

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 4px;
}

.modal-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-buyer {
  background: rgba(255,255,255,0.2);
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.82rem;
}

.modal-close {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}
.modal-close:hover { background: rgba(255,255,255,0.3); }

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-export-excel {
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-export-excel:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.35);
}
.btn-export-excel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-body {
  padding: 1.5rem 2rem;
  max-height: 75vh;
  overflow-y: auto;
}

.modal-loading {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.modal-empty {
  text-align: center;
  padding: 3rem;
  color: #9ca3af;
}

/* ===== STAGE BLOCKS ===== */
.stage-block {
  margin-bottom: 1.5rem;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.stage-block-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
}

.stage-block-icon { font-size: 1.5rem; }

.stage-block-title {
  font-weight: 700;
  font-size: 1rem;
  color: #111827;
}

.stage-block-total {
  font-size: 0.82rem;
  color: #6b7280;
}

.stage-block-totals {
  display: flex;
  gap: 1rem;
  margin-top: 4px;
}

.total-in {
  font-size: 0.82rem;
  color: #9a3412;
  font-weight: 600;
}

.total-out {
  font-size: 0.82rem;
  color: #065f46;
  font-weight: 600;
}

.sub-section { border-top: 1px solid #e5e7eb; }

.sub-section-title {
  padding: 8px 12px;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-title  { background: #fff7ed; color: #9a3412; }
.output-title { background: #f0fdf4; color: #065f46; }

.input-row  { background: #fffbeb; }
.output-row { background: #f0fdf4; }

.stage-sawmill-block .stage-block-header    { background: #f0fdf4; border-bottom: 2px solid #bbf7d0; }
.stage-pembahanan-block .stage-block-header { background: #f0fdf4; border-bottom: 2px solid #bbf7d0; }
.stage-moulding-block .stage-block-header   { background: #eff6ff; border-bottom: 2px solid #bfdbfe; }
.stage-mesin-block .stage-block-header      { background: #ecfeff; border-bottom: 2px solid #a5f3fc; }
.stage-ruskomp-block .stage-block-header    { background: #fff7ed; border-bottom: 2px solid #fed7aa; }
.stage-assembling-block .stage-block-header { background: #f5f3ff; border-bottom: 2px solid #ddd6fe; }
.stage-sanding-block .stage-block-header    { background: #fefce8; border-bottom: 2px solid #fef08a; }
.stage-rustik-block .stage-block-header     { background: #fff7ed; border-bottom: 2px solid #fed7aa; }
.stage-finishing-block .stage-block-header  { background: #fdf2f8; border-bottom: 2px solid #fbcfe8; }
.stage-qc-block .stage-block-header         { background: #f0fdf4; border-bottom: 2px solid #bbf7d0; }
.stage-packing-block .stage-block-header    { background: #eff6ff; border-bottom: 2px solid #bfdbfe; }

/* ===== DETAIL TABLE ===== */
.detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.detail-table th {
  padding: 8px 12px;
  background: #f9fafb;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}

.detail-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}

.col-right { text-align: right !important; }

.doc-number {
  font-family: monospace;
  font-size: 0.8rem;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  color: #374151;
}

.tx-item-code {
  font-size: 0.75rem;
  font-weight: 700;
  color: #1e40af;
}

.tx-item-name {
  font-size: 0.85rem;
  color: #111827;
}

.tx-notes {
  font-size: 0.8rem;
  color: #6b7280;
  max-width: 200px;
}

/* ===== REJECT BLOCK ===== */
.reject-block {
  margin-bottom: 1.5rem;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #fecaca;
}

.reject-header {
  background: #fff5f5 !important;
  border-bottom: 2px solid #fecaca !important;
}

.reject-row { background: #fff5f5; }

.reject-qty { color: #dc2626 !important; }

.reject-notes { color: #dc2626 !important; font-weight: 600; }

.reject-type-badge {
  background: #fee2e2;
  color: #dc2626;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.stage-moulding {
  background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%) !important;
  color: #1e40af !important;
}

.stage-mesin {
  background: linear-gradient(180deg, #ecfeff 0%, #cffafe 100%) !important;
  color: #0e7490 !important;
}

.stage-ruskomp {
  background: linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%) !important;
  color: #9a3412 !important;
}
</style>
