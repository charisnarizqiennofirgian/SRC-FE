<template>
  <DashboardLayout>
    <!-- HEADER -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge">
            <span class="icon">📒</span>
          </div>
          <div class="header-text">
            <h1 class="page-title">Jurnal Umum</h1>
            <p class="page-subtitle">Daftar semua transaksi jurnal akuntansi</p>
          </div>
        </div>
        <div class="header-actions">
          <router-link to="/admin/keuangan/jurnal-umum/tambah" class="btn btn-primary">
            <span class="btn-icon">➕</span>
            <span class="btn-text">Buat Jurnal Manual</span>
          </router-link>
          <button class="btn btn-export" @click="exportExcel">
            <span class="btn-icon">📥</span>
            <span class="btn-text">Export Excel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- FILTER -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">
            <span class="label-icon">📅</span>
            Dari Tanggal
          </label>
          <input v-model="filters.start_date" type="date" class="filter-input" />
        </div>

        <div class="filter-group">
          <label class="filter-label">
            <span class="label-icon">📅</span>
            Sampai Tanggal
          </label>
          <input v-model="filters.end_date" type="date" class="filter-input" />
        </div>

        <div class="filter-group">
          <label class="filter-label">
            <span class="label-icon">📊</span>
            Status
          </label>
          <select v-model="filters.status" class="filter-input">
            <option value="">Semua Status</option>
            <option value="POSTED">Posted</option>
            <option value="DRAFT">Draft</option>
            <option value="VOID">Void</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">
            <span class="label-icon">🏦</span>
            Filter Akun (COA)
          </label>
          <div class="coa-search-wrapper" ref="coaWrapperRef">
            <input
              type="text"
              v-model="coaSearch"
              @focus="coaDropdownOpen = true"
              @input="coaDropdownOpen = true"
              placeholder="Ketik kode atau nama akun..."
              class="filter-input coa-search-input"
              autocomplete="off"
            />
            <button v-if="filters.account_id" class="coa-clear-btn" @click="clearCoaFilter" type="button">×</button>
            <div v-if="coaDropdownOpen" class="coa-dropdown">
              <div v-if="filteredCoas.length === 0" class="coa-empty">Tidak ada akun ditemukan</div>
              <div
                v-for="coa in filteredCoas"
                :key="coa.id"
                class="coa-option"
                @mousedown.prevent="selectCoa(coa)"
              >
                <span class="coa-option-code">{{ coa.code }}</span>
                <span class="coa-option-name">{{ coa.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="filter-actions">
          <button class="btn btn-filter" @click="fetchJournals">
            <span class="btn-icon">🔍</span>
            <span class="btn-text">Filter</span>
          </button>
          <button class="btn btn-reset" @click="resetFilters">
            <span class="btn-icon">🔄</span>
          </button>
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <div class="content-card">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>No Jurnal</th>
              <th>Tanggal</th>
              <th>Referensi</th>
              <th>Keterangan</th>
              <th>Akun</th>
              <th>Total Debit</th>
              <th>Total Kredit</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="9" class="text-center">
                <div class="loading-spinner">⏳ Memuat data...</div>
              </td>
            </tr>
            <tr v-else-if="journals.length === 0">
              <td colspan="9" class="text-center">
                <div class="empty-state">
                  <span class="empty-icon">📭</span>
                  <p>Belum ada data jurnal</p>
                </div>
              </td>
            </tr>
            <tr v-else v-for="journal in journals" :key="journal.id">
              <td class="font-mono">{{ journal.journal_number }}</td>
              <td>{{ formatDate(journal.date) }}</td>
              <td>
                <span class="badge badge-ref">{{ journal.reference_type || '-' }}</span>
              </td>
              <td class="text-truncate">{{ journal.description }}</td>
              <td class="td-accounts">
                <div class="account-chips">
                  <template v-for="(acc, i) in getJournalAccounts(journal).debits" :key="'d'+i">
                    <span class="chip chip-debit" :title="acc">
                      <span class="chip-label">D</span>{{ acc }}
                    </span>
                  </template>
                  <template v-for="(acc, i) in getJournalAccounts(journal).credits" :key="'k'+i">
                    <span class="chip chip-credit" :title="acc">
                      <span class="chip-label">K</span>{{ acc }}
                    </span>
                  </template>
                  <span v-if="getJournalAccounts(journal).extraCount > 0" class="chip chip-more">
                    +{{ getJournalAccounts(journal).extraCount }} lagi
                  </span>
                </div>
              </td>
              <td class="text-right text-success">{{ formatRupiah(journal.total_debit) }}</td>
              <td class="text-right text-danger">{{ formatRupiah(journal.total_credit) }}</td>
              <td>
                <span class="badge" :class="getBadgeClass(journal.status)">
                  {{ journal.status }}
                </span>
              </td>
              <td>
                <button
                  class="btn-icon-action"
                  @click="viewDetail(journal.id)"
                  title="Lihat Detail"
                >
                  👁️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION -->
      <div class="pagination" v-if="journals.length > 0">
        <button class="btn-page" @click="prevPage" :disabled="currentPage === 1">◀️ Prev</button>
        <span class="page-info"> Halaman {{ currentPage }} dari {{ totalPages }} </span>
        <button class="btn-page" @click="nextPage" :disabled="currentPage === totalPages">
          Next ▶️
        </button>
      </div>
    </div>

    <!-- MODAL DETAIL -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Detail Jurnal: {{ selectedJournal?.journal_number }}</h3>
          <button class="btn-close" @click="closeModal">✖️</button>
        </div>
        <div class="modal-body">
          <table class="detail-table">
            <thead>
              <tr>
                <th>Akun</th>
                <th>Keterangan</th>
                <th class="text-right">Debit</th>
                <th class="text-right">Kredit</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in selectedJournal?.lines" :key="line.id">
                <td>{{ line.account?.name }}</td>
                <td>{{ line.description }}</td>
                <td class="text-right text-success">{{ formatRupiah(line.debit) }}</td>
                <td class="text-right text-danger">{{ formatRupiah(line.credit) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2"><strong>TOTAL</strong></td>
                <td class="text-right text-success">
                  <strong>{{ formatRupiah(selectedJournal?.total_debit) }}</strong>
                </td>
                <td class="text-right text-danger">
                  <strong>{{ formatRupiah(selectedJournal?.total_credit) }}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'

const { showSuccess, showError } = useNotification()

const journals = ref([])
const coas = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const showModal = ref(false)
const selectedJournal = ref(null)

// COA search
const coaSearch = ref('')
const coaDropdownOpen = ref(false)
const coaWrapperRef = ref(null)

const filteredCoas = computed(() => {
  const q = coaSearch.value.toLowerCase().trim()
  const list = q
    ? coas.value.filter(c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
    : coas.value
  return list.slice(0, 30)
})

const selectCoa = (coa) => {
  filters.value.account_id = coa.id
  coaSearch.value = `${coa.code} - ${coa.name}`
  coaDropdownOpen.value = false
}

const clearCoaFilter = () => {
  filters.value.account_id = ''
  coaSearch.value = ''
}

const handleClickOutside = (e) => {
  if (coaWrapperRef.value && !coaWrapperRef.value.contains(e.target)) {
    coaDropdownOpen.value = false
  }
}

const filters = ref({
  start_date: '',
  end_date: '',
  status: '',
  account_id: '',
})

const fetchCoas = async () => {
  try {
    const response = await apiClient.get('/coa', { params: { is_active: 1 } })
    coas.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching COA:', error)
  }
}

const fetchJournals = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      ...filters.value,
    }

    const response = await apiClient.get('/journal-entries', { params })
    journals.value = response.data.data.data || response.data.data
    totalPages.value = response.data.data.last_page || 1
  } catch (error) {
    console.error('Error fetching journals:', error)
    showError('Gagal', 'Gagal memuat data jurnal')
  } finally {
    loading.value = false
  }
}

const viewDetail = async (id) => {
  try {
    const response = await apiClient.get(`/journal-entries/${id}`)
    selectedJournal.value = response.data.data
    showModal.value = true
  } catch (error) {
    showError('Gagal', 'Gagal memuat detail jurnal')
  }
}

const closeModal = () => {
  showModal.value = false
  selectedJournal.value = null
}

const resetFilters = () => {
  filters.value = {
    start_date: '',
    end_date: '',
    status: '',
    account_id: '',
  }
  coaSearch.value = ''
  fetchJournals()
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchJournals()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchJournals()
  }
}

const exportExcel = () => {
  showSuccess('Info', 'Fitur export akan segera tersedia')
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatRupiah = (amount) => {
  if (!amount) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const getJournalAccounts = (journal) => {
  const lines = journal.lines || []
  const debitNames = [...new Set(
    lines.filter(l => l.debit > 0).map(l => l.account?.name).filter(Boolean)
  )]
  const creditNames = [...new Set(
    lines.filter(l => l.credit > 0).map(l => l.account?.name).filter(Boolean)
  )]

  const maxPerSide = 1
  const shownDebits = debitNames.slice(0, maxPerSide)
  const shownCredits = creditNames.slice(0, maxPerSide)
  const extraCount = (debitNames.length - shownDebits.length) + (creditNames.length - shownCredits.length)

  return { debits: shownDebits, credits: shownCredits, extraCount }
}

const getBadgeClass = (status) => {
  const classes = {
    POSTED: 'badge-success',
    DRAFT: 'badge-warning',
    VOID: 'badge-danger',
  }
  return classes[status] || 'badge-secondary'
}

onMounted(() => {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  filters.value.start_date = firstDay.toISOString().split('T')[0]
  filters.value.end_date = now.toISOString().split('T')[0]

  fetchCoas()
  fetchJournals()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Gunakan style yang sama dengan MasterBarangForm */
.page-header {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  padding: 32px 36px;
  border-radius: 24px;
  margin-bottom: 24px;
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.25);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  flex-wrap: wrap;
  gap: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  margin-right: 10px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.icon-badge {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.icon {
  font-size: 36px;
}

.page-title {
  font-size: 30px;
  font-weight: 900;
  margin: 0 0 6px 0;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.page-subtitle {
  font-size: 15px;
  opacity: 0.95;
  margin: 0;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.btn-export {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-export:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.filter-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 14px;
  color: #374151;
}

.label-icon {
  font-size: 16px;
}

.filter-input {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.filter-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.filter-actions {
  display: flex;
  gap: 12px;
}

/* COA Searchable Dropdown */
.coa-search-wrapper {
  position: relative;
}

.coa-search-input {
  width: 100%;
  padding-right: 32px;
}

.coa-clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 18px;
  color: #9ca3af;
  cursor: pointer;
  line-height: 1;
  padding: 0 2px;
}

.coa-clear-btn:hover {
  color: #ef4444;
}

.coa-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 100;
  max-height: 220px;
  overflow-y: auto;
}

.coa-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f3f4f6;
}

.coa-option:last-child {
  border-bottom: none;
}

.coa-option:hover {
  background: #eff6ff;
}

.coa-option-code {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  font-weight: 700;
  color: #3b82f6;
  background: #dbeafe;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.coa-option-name {
  font-size: 13px;
  color: #374151;
}

.coa-empty {
  padding: 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

.btn-filter {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  flex: 1;
}

.btn-reset {
  background: #f3f4f6;
  color: #374151;
  padding: 12px 16px;
}

.content-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
}

.data-table th {
  padding: 16px;
  text-align: left;
  font-weight: 800;
  font-size: 13px;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
}

.data-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  color: #1e293b;
}

.data-table tbody tr:hover {
  background: #f8fafc;
}

.font-mono {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #3b82f6;
}

.text-right {
  text-align: right;
}

.text-success {
  color: #10b981;
  font-weight: 700;
}

.text-danger {
  color: #ef4444;
  font-weight: 700;
}

.text-truncate {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-ref {
  background: #dbeafe;
  color: #1e40af;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.badge-danger {
  background: #fee2e2;
  color: #991b1b;
}

.btn-icon-action {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  padding: 4px 8px;
  transition: transform 0.2s ease;
}

.btn-icon-action:hover {
  transform: scale(1.2);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border-top: 2px solid #f1f5f9;
}

.btn-page {
  padding: 10px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.3s ease;
}

.btn-page:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-weight: 700;
  color: #475569;
}

.loading-spinner {
  padding: 40px;
  font-size: 18px;
  color: #64748b;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  color: #64748b;
  margin: 0;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-bottom: 2px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px 8px;
  transition: transform 0.2s ease;
}

.btn-close:hover {
  transform: rotate(90deg);
}

.modal-body {
  padding: 32px;
  overflow-y: auto;
  max-height: 60vh;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
}

.detail-table th,
.detail-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.detail-table th {
  font-weight: 800;
  font-size: 13px;
  color: #475569;
  background: #f8fafc;
}

.total-row {
  background: #f8fafc;
  font-size: 16px;
}

.total-row td {
  padding: 16px 12px;
  border-top: 2px solid #3b82f6;
}

/* Account chips */
.td-accounts {
  min-width: 180px;
  max-width: 260px;
}

.account-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-label {
  font-size: 10px;
  font-weight: 800;
  padding: 1px 4px;
  border-radius: 3px;
  flex-shrink: 0;
}

.chip-debit {
  background: #dcfce7;
  color: #166534;
}

.chip-debit .chip-label {
  background: #16a34a;
  color: white;
}

.chip-credit {
  background: #fee2e2;
  color: #991b1b;
}

.chip-credit .chip-label {
  background: #dc2626;
  color: white;
}

.chip-more {
  background: #f3f4f6;
  color: #6b7280;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 600;
}
</style>
