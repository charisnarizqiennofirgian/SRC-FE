<template>
  <DashboardLayout>
    <div class="journal-management">
      <!-- Page Hero -->
      <div class="page-hero">
        <div class="hero-left">
          <div class="hero-eyebrow">Modul Keuangan</div>
          <h1 class="hero-title">Jurnal <span class="accent">Manual</span></h1>
          <p class="hero-desc">Perbaikan & monitoring entri jurnal manual</p>
        </div>
        <div class="hero-actions">
          <button class="btn btn-secondary">⬇️ Export</button>
          <button class="btn btn-primary" @click="$router.push({ name: 'BuatJurnalManual' })">
            ＋ Jurnal Baru
          </button>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-card c-yellow">
          <div class="stat-icon-box">📒</div>
          <div class="stat-body">
            <div class="stat-label">Total Jurnal</div>
            <div class="stat-value">{{ totalItem }}</div>
            <div class="stat-sub">Sepanjang tahun ini</div>
          </div>
        </div>
        <div class="stat-card c-green">
          <div class="stat-icon-box">✅</div>
          <div class="stat-body">
            <div class="stat-label">Posted</div>
            <div class="stat-value">{{ countByStatus('POSTED') }}</div>
            <div class="stat-sub">Sudah diposting</div>
          </div>
        </div>
        <div class="stat-card c-blue">
          <div class="stat-icon-box">✏️</div>
          <div class="stat-body">
            <div class="stat-label">Draft</div>
            <div class="stat-value">{{ countByStatus('DRAFT') }}</div>
            <div class="stat-sub">Belum diposting</div>
          </div>
        </div>
        <div class="stat-card c-red">
          <div class="stat-icon-box">🚫</div>
          <div class="stat-body">
            <div class="stat-label">Void</div>
            <div class="stat-value">{{ countByStatus('VOID') }}</div>
            <div class="stat-sub">Dibatalkan</div>
          </div>
        </div>
      </div>

      <!-- Main Card -->
      <div class="main-card">
        <!-- Toolbar -->
        <div class="filter-toolbar">
          <div class="toolbar-left">
            <span class="toolbar-title">Daftar Jurnal</span>
            <span class="count-pill">{{ formatCount(totalItem) }}</span>
          </div>
          <div class="toolbar-right">
            <div class="filter-group">
              <span class="filter-label">Status</span>
              <select v-model="filters.status" @change="handleFilterChange" class="form-select">
                <option value="">Semua Status</option>
                <option value="POSTED">Posted</option>
                <option value="DRAFT">Draft</option>
                <option value="VOID">Void</option>
              </select>
            </div>
            <div class="filter-group">
              <span class="filter-label">Tampilkan</span>
              <select
                v-model="perPage"
                @change="handlePerPageChange"
                class="form-select per-page-select"
              >
                <option value="15">15</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <div class="filter-group">
              <span class="filter-label">Cari</span>
              <div class="search-wrap">
                <span class="search-icon">🔍</span>
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="No. Jurnal, Deskripsi..."
                  class="search-input"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>No. Jurnal</th>
                <th>Tanggal</th>
                <th>Deskripsi</th>
                <th>Total Debit</th>
                <th>Status</th>
                <th class="th-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="journals.length === 0">
                <td colspan="6">
                  <div class="empty-state">
                    <div class="e-icon">📋</div>
                    <div class="e-title">Tidak Ada Data</div>
                    <div class="e-desc">Belum ada jurnal manual yang ditemukan</div>
                    <button
                      class="btn btn-primary"
                      style="margin-top: 16px"
                      @click="$router.push({ name: 'BuatJurnalManual' })"
                    >
                      ＋ Buat Jurnal Pertama
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-for="journal in journals" :key="journal.id">
                <td>
                  <span class="jrn-num">{{ journal.journal_number }}</span>
                </td>
                <td>
                  <span class="date-cell">{{ formatDate(journal.date) }}</span>
                </td>
                <td>
                  <span class="desc-text" :title="journal.description">{{
                    truncateText(journal.description, 60)
                  }}</span>
                </td>
                <td>
                  <span class="total-cell">{{ formatCurrency(journal.total_debit) }}</span>
                </td>
                <td>
                  <span :class="['status-badge', getStatusClass(journal.status)]">
                    <span class="status-dot"></span>
                    {{ getStatusLabel(journal.status) }}
                  </span>
                </td>
                <td class="td-center">
                  <div class="actions">
                    <router-link
                      :to="{ name: 'DetailJurnalPerbaikan', params: { id: journal.id } }"
                      class="act-btn act-view"
                      title="Detail & Edit"
                      >👁</router-link
                    >
                    <button
                      v-if="journal.status !== 'VOID'"
                      class="act-btn act-void"
                      @click="voidJournal(journal.id)"
                      title="Void Jurnal"
                    >
                      🚫
                    </button>
                    <button v-else class="act-btn act-disabled" disabled>🚫</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-wrap" v-if="totalPages > 1">
          <PaginationComponent
            :current-page="currentPage"
            :total-pages="totalPages"
            :total-items="totalItem"
            :per-page="perPage"
            @page-change="changePage"
          />
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/api/axios'
import DashboardLayout from '@/components/DashboardLayout.vue'
import PaginationComponent from '@/components/BasePagination.vue'

const router = useRouter()
const journals = ref([])
const searchQuery = ref('')
const filters = ref({ status: '', reference_type: 'MANUAL' })
const currentPage = ref(1)
const perPage = ref(15)
const totalPages = ref(1)
const totalItem = ref(0)
const statusCounts = ref({ POSTED: 0, DRAFT: 0, VOID: 0 })
const countByStatus = (status) => statusCounts.value[status] ?? 0

const fetchJournals = async () => {
  try {
    const params = {
      page: currentPage.value,
      per_page: perPage.value,
      search: searchQuery.value || undefined,
      status: filters.value.status || undefined,
      reference_type: filters.value.reference_type,
    }
    const response = await apiClient.get('/journal-entries', { params })
    const data = response.data.data
    journals.value = data.data
    totalPages.value = data.last_page
    totalItem.value = data.total
    if (response.data.counts) statusCounts.value = response.data.counts
  } catch (error) {
    console.error('Error fetching journals:', error)
  }
}

const changePage = (page) => {
  currentPage.value = page
  fetchJournals()
}
const handlePerPageChange = () => {
  currentPage.value = 1
  fetchJournals()
}
const handleFilterChange = () => {
  currentPage.value = 1
  fetchJournals()
}
watch(searchQuery, () => {
  currentPage.value = 1
  fetchJournals()
})
onMounted(fetchJournals)

const formatDate = (date) =>
  new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
const formatCurrency = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value || 0)
const formatCount = (count) =>
  count === 0 ? 'Tidak ada' : count === 1 ? '1 jurnal' : `${count.toLocaleString()} entri`
const truncateText = (text, maxLength) => {
  if (!text) return '-'
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}
const getStatusClass = (status) =>
  ({ POSTED: 's-posted', DRAFT: 's-draft', VOID: 's-void' })[status] || 's-void'
const getStatusLabel = (status) =>
  ({ POSTED: 'Posted', DRAFT: 'Draft', VOID: 'Void' })[status] || status
const voidJournal = (id) => console.log('Void journal:', id)
</script>

<style scoped>
.journal-management {
  padding: 28px 32px;
}

/* HERO */
.page-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.hero-eyebrow {
  font-size: 10px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: #f59e0b;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}
.hero-eyebrow::before {
  content: '';
  display: inline-block;
  width: 18px;
  height: 2px;
  background: #f59e0b;
  border-radius: 2px;
}
.hero-title {
  font-size: 32px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.8px;
  line-height: 1.1;
  margin: 0 0 6px;
}
.hero-title .accent {
  color: #f59e0b;
}
.hero-desc {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}
.hero-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

/* BUTTONS */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  text-decoration: none;
  transition: all 0.2s ease;
  font-family: inherit;
  white-space: nowrap;
}
.btn-primary {
  background: #f59e0b;
  color: #fff;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}
.btn-primary:hover {
  background: #d97706;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.35);
}
.btn-secondary {
  background: #fff;
  color: #374151;
  border: 1.5px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.btn-secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

/* STATS */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.stat-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1.5px solid #f3f4f6;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}
.stat-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 4px 0 0 4px;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}
.c-yellow::before {
  background: #f59e0b;
}
.c-green::before {
  background: #10b981;
}
.c-blue::before {
  background: #3b82f6;
}
.c-red::before {
  background: #ef4444;
}
.stat-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.c-yellow .stat-icon-box {
  background: #fef3c7;
}
.c-green .stat-icon-box {
  background: #d1fae5;
}
.c-blue .stat-icon-box {
  background: #dbeafe;
}
.c-red .stat-icon-box {
  background: #fee2e2;
}
.stat-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #9ca3af;
  font-weight: 600;
  margin-bottom: 4px;
}
.stat-value {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1;
  color: #111827;
}
.c-yellow .stat-value {
  color: #d97706;
}
.c-green .stat-value {
  color: #059669;
}
.c-blue .stat-value {
  color: #2563eb;
}
.c-red .stat-value {
  color: #dc2626;
}
.stat-sub {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

/* MAIN CARD */
.main-card {
  background: #fff;
  border-radius: 14px;
  border: 1.5px solid #f3f4f6;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

/* TOOLBAR */
.filter-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1.5px solid #f3f4f6;
  gap: 16px;
  flex-wrap: wrap;
  background: #fafafa;
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.toolbar-title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}
.count-pill {
  background: #fef3c7;
  color: #d97706;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid #fde68a;
}
.toolbar-right {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.filter-label {
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #9ca3af;
  font-weight: 600;
}
.form-select {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 9px 32px 9px 12px;
  font-size: 13px;
  color: #374151;
  font-family: inherit;
  font-weight: 500;
  transition: all 0.2s;
  outline: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  min-width: 140px;
  cursor: pointer;
}
.form-select.per-page-select {
  min-width: 80px;
}
.form-select:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.12);
}
.search-wrap {
  position: relative;
}
.search-input {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 9px 14px 9px 38px;
  font-size: 13px;
  color: #374151;
  width: 260px;
  font-family: inherit;
  transition: all 0.2s;
  outline: none;
}
.search-input::placeholder {
  color: #9ca3af;
}
.search-input:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.12);
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  pointer-events: none;
}

/* TABLE */
.tbl-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 780px;
}
thead tr {
  background: #f9fafb;
  border-bottom: 2px solid #f3f4f6;
}
th {
  padding: 13px 20px;
  text-align: left;
  font-size: 11px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #6b7280;
  font-weight: 700;
  white-space: nowrap;
}
.th-center {
  text-align: center;
}
tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s ease;
}
tbody tr:last-child {
  border-bottom: none;
}
tbody tr:hover {
  background: #fffbeb;
}
td {
  padding: 15px 20px;
  font-size: 13.5px;
  color: #374151;
  vertical-align: middle;
}
.td-center {
  text-align: center;
}

/* CELLS */
.jrn-num {
  font-family: 'Courier New', monospace;
  font-size: 12.5px;
  font-weight: 700;
  color: #d97706;
  background: #fef3c7;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid #fde68a;
  display: inline-block;
}
.date-cell {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}
.desc-text {
  font-size: 13.5px;
  color: #374151;
  max-width: 340px;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.total-cell {
  font-size: 13.5px;
  font-weight: 700;
  color: #059669;
}

/* STATUS */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.s-posted {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}
.s-posted .status-dot {
  background: #10b981;
  box-shadow: 0 0 5px rgba(16, 185, 129, 0.6);
}
.s-draft {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}
.s-draft .status-dot {
  background: #f59e0b;
  box-shadow: 0 0 5px rgba(245, 158, 11, 0.6);
}
.s-void {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}
.s-void .status-dot {
  background: #9ca3af;
}

/* ACTIONS */
.actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.act-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  transition: all 0.2s;
  text-decoration: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.act-btn.act-view:hover {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}
.act-btn.act-void:hover {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}
.act-btn.act-disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}

/* EMPTY STATE */
.empty-state {
  padding: 70px 20px;
  text-align: center;
}
.e-icon {
  font-size: 48px;
  opacity: 0.3;
  margin-bottom: 14px;
}
.e-title {
  font-size: 17px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 6px;
}
.e-desc {
  font-size: 13px;
  color: #9ca3af;
}

/* PAGINATION */
.pagination-wrap {
  padding: 16px 24px;
  border-top: 1.5px solid #f3f4f6;
  background: #fafafa;
}

/* RESPONSIVE */
@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 992px) {
  .page-hero {
    flex-direction: column;
    align-items: flex-start;
  }
  .filter-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
  .toolbar-right {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
  .search-input {
    width: 100%;
  }
  .form-select {
    min-width: auto;
    width: 100%;
  }
}
@media (max-width: 768px) {
  .journal-management {
    padding: 16px;
  }
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .hero-title {
    font-size: 26px;
  }
}
@media (max-width: 480px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style>
