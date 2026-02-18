<template>
  <DashboardLayout>
    <div class="journal-management">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <div class="header-icon">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <div class="header-text">
              <h1 class="page-title">Kelola Jurnal Manual</h1>
              <p class="page-subtitle">Perbaikan & Monitoring Jurnal Manual</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary" @click="$router.push({ name: 'BuatJurnalManual' })">
              <i class="fas fa-plus"></i>
              Jurnal Baru
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Card -->
      <div class="filter-card">
        <div class="card-header">
          <div class="header-left">
            <div class="header-badge">
              <i class="fas fa-filter"></i>
            </div>
            <div>
              <h2 class="card-title">Filter & Pencarian</h2>
              <p class="card-subtitle">{{ formatCount(totalItem) }} Jurnal Ditemukan</p>
            </div>
          </div>

          <div class="header-right">
            <!-- Status Filter -->
            <div class="filter-group">
              <label class="filter-label">Status</label>
              <select v-model="filters.status" @change="handleFilterChange" class="form-select">
                <option value="">Semua Status</option>
                <option value="POSTED">Posted</option>
                <option value="DRAFT">Draft</option>
                <option value="VOID">Void</option>
              </select>
            </div>

            <!-- Search -->
            <div class="search-container">
              <div class="input-group">
                <span class="input-group-text">
                  <i class="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Cari No. Jurnal, Deskripsi..."
                  class="form-control search-input"
                />
              </div>
            </div>

            <!-- Per Page -->
            <div class="filter-group">
              <label class="filter-label">Tampilkan</label>
              <select v-model="perPage" @change="handlePerPageChange" class="form-select">
                <option value="15">15</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <div class="table-container">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th class="col-no">No. Jurnal</th>
                  <th class="col-date">Tanggal</th>
                  <th class="col-desc">Deskripsi</th>
                  <th class="col-total">Total Debit</th>
                  <th class="col-status">Status</th>
                  <th class="col-action text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <!-- Empty State -->
                <tr v-if="journals.length === 0">
                  <td colspan="6" class="text-center py-5">
                    <div class="empty-state">
                      <div class="empty-icon">
                        <i class="fas fa-clipboard-list"></i>
                      </div>
                      <h4>Tidak Ada Data</h4>
                      <p class="text-muted">Belum ada jurnal manual yang ditemukan</p>
                      <button class="btn btn-outline-primary btn-sm" @click="$router.push({ name: 'BuatJurnalManual' })">
                        <i class="fas fa-plus"></i> Buat Jurnal Pertama
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Data Rows -->
                <tr v-for="journal in journals" :key="journal.id" class="table-row">
                  <td>
                    <div class="journal-number">
                      <span class="badge bg-primary">{{ journal.journal_number }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="date-display">
                      <i class="fas fa-calendar-alt text-muted me-2"></i>
                      {{ formatDate(journal.date) }}
                    </div>
                  </td>
                  <td>
                    <div class="description" :title="journal.description">
                      {{ truncateText(journal.description, 60) }}
                    </div>
                  </td>
                  <td>
                    <strong class="text-primary">{{ formatCurrency(journal.total_debit) }}</strong>
                  </td>
                  <td>
                    <span 
                      class="badge status-badge" 
                      :class="getStatusClass(journal.status)"
                    >
                      <i :class="getStatusIcon(journal.status)" class="me-1"></i>
                      {{ getStatusLabel(journal.status) }}
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="btn-group" role="group">
                      <router-link
                        :to="{ name: 'DetailJurnalPerbaikan', params: { id: journal.id } }"
                        class="btn btn-outline-primary btn-sm"
                        title="Detail & Edit"
                      >
                        <i class="fas fa-eye"></i>
                      </router-link>
                      <button 
                        v-if="journal.status !== 'VOID'"
                        class="btn btn-outline-danger btn-sm" 
                        @click="voidJournal(journal.id)"
                        title="Void Jurnal"
                      >
                        <i class="fas fa-ban"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination-section" v-if="totalPages > 1">
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

const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
})

const formatCurrency = (value) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0
}).format(value || 0)

const formatCount = (count) => {
  if (count === 0) return 'Tidak ada'
  if (count === 1) return '1 jurnal'
  return `${count.toLocaleString()} jurnal`
}

const truncateText = (text, maxLength) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const getStatusClass = (status) => {
  const classes = {
    POSTED: 'bg-success',
    DRAFT: 'bg-warning',
    VOID: 'bg-secondary'
  }
  return classes[status] || 'bg-secondary'
}

const getStatusIcon = (status) => {
  const icons = {
    POSTED: 'fas fa-check-circle',
    DRAFT: 'fas fa-edit',
    VOID: 'fas fa-ban'
  }
  return icons[status] || 'fas fa-question-circle'
}

const getStatusLabel = (status) => {
  const labels = {
    POSTED: 'Posted',
    DRAFT: 'Draft',
    VOID: 'Void'
  }
  return labels[status] || status
}

const voidJournal = (id) => {
  // Implement void logic
  console.log('Void journal:', id)
}
</script>

<style scoped>
.journal-management {
  padding: 24px;
  background: #f8f9fa;
}

.page-header {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.page-subtitle {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
  font-weight: 400;
}

.header-actions .btn {
  padding: 12px 24px;
  font-weight: 600;
}

.filter-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden;
}

.card-header {
  padding: 32px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-badge {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.card-subtitle {
  color: #6b7280;
  font-size: 15px;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
}

.filter-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-select {
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-weight: 500;
}

.search-container {
  min-width: 300px;
}

.input-group-text {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-right: none;
  padding: 12px 16px;
  color: #64748b;
}

.search-input {
  border-left: none;
  border-radius: 0 8px 8px 0;
}

.table-container {
  padding: 32px;
}

.table-responsive {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.table {
  margin: 0;
}

.table th {
  padding: 20px 16px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
  background: #f8fafc;
}

.table td {
  padding: 20px 16px;
  vertical-align: middle;
  border-color: #f1f3f4;
}

.col-no { width: 15%; }
.col-date { width: 12%; }
.col-desc { width: 35%; }
.col-total { width: 15%; }
.col-status { width: 13%; }
.col-action { width: 10%; }

.journal-number .badge {
  font-size: 13px;
  padding: 8px 12px;
  font-weight: 600;
}

.date-display {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.description {
  font-size: 15px;
  color: #374151;
}

.status-badge {
  font-size: 13px;
  padding: 6px 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.bg-success { background-color: #d1fae5 !important; color: #065f46 !important; }
.bg-warning { background-color: #fef3c7 !important; color: #92400e !important; }
.bg-secondary { background-color: #f1f5f9 !important; color: #475569 !important; }

.btn-group .btn {
  padding: 8px 12px;
  border-radius: 6px;
  margin: 0 2px;
}

.btn-group .btn i {
  font-size: 14px;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-icon i {
  font-size: 64px;
  color: #d1d5db;
  margin-bottom: 24px;
}

.empty-state h4 {
  color: #374151;
  margin-bottom: 12px;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 24px;
}

.pagination-section {
  padding: 32px;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
  padding: 12px 24px;
  font-weight: 600;
  border-radius: 8px;
}

.btn-primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.btn-outline-primary, .btn-outline-success, .btn-outline-danger {
  border-radius: 6px;
}

/* Responsive */
@media (max-width: 992px) {
  .header-content, .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }
  
  .header-right {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container {
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .journal-management {
    padding: 16px;
  }
  
  .table-responsive {
    font-size: 14px;
  }
  
  .table th,
  .table td {
    padding: 12px 8px;
  }
}
</style>
