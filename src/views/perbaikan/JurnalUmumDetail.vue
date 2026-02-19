<template>
  <DashboardLayout>
    <!-- HEADER -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left-section">
          <div class="icon-badge">📋</div>
          <div>
            <div class="hero-eyebrow">Modul Keuangan</div>
            <h1 class="page-title">Detail Jurnal <span class="accent">Manual</span></h1>
            <p class="page-subtitle">{{ journal?.journal_number || 'Memuat...' }}</p>
          </div>
        </div>
        <router-link :to="{ name: 'JurnalPerbaikan' }" class="btn-back">← Kembali</router-link>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p class="loading-text">Memuat data...</p>
    </div>

    <!-- CONTENT -->
    <div v-else>
      <!-- INFO CARD -->
      <div class="content-card">
        <div class="card-head">
          <div class="card-head-icon">ℹ️</div>
          <div>
            <h2 class="card-title">Informasi Jurnal</h2>
            <p class="card-subtitle">Detail informasi jurnal manual</p>
          </div>
        </div>
        <div class="card-body">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Nomor Jurnal</div>
              <div class="info-value mono">{{ journal.journal_number }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Tanggal</div>
              <div class="info-value">{{ formatDate(journal.date) }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Status</div>
              <div>
                <span :class="['status-badge', `s-${journal.status.toLowerCase()}`]">
                  <span class="status-dot"></span>
                  {{ journal.status }}
                </span>
              </div>
            </div>
            <div class="info-item" v-if="journal.created_by">
              <div class="info-label">Dibuat Oleh</div>
              <div class="info-value">{{ journal.created_by?.name || '-' }}</div>
            </div>
            <div class="info-item full-width">
              <div class="info-label">Deskripsi</div>
              <div class="info-value">{{ journal.description }}</div>
            </div>
            <div class="info-item" v-if="journal.unposted_by">
              <div class="info-label">Di-unpost Oleh</div>
              <div class="info-value">{{ journal.unposted_by?.name || '-' }}</div>
            </div>
            <div class="info-item full-width" v-if="journal.unpost_reason">
              <div class="info-label">Alasan Unpost</div>
              <div class="info-value warn-text">{{ journal.unpost_reason }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ENTRIES TABLE -->
      <div class="content-card">
        <div class="card-head">
          <div class="card-head-icon">📝</div>
          <div>
            <h2 class="card-title">Detail Transaksi</h2>
            <p class="card-subtitle">Entri debit dan kredit jurnal</p>
          </div>
          <div class="balance-indicator" style="margin-left: auto">
            <span v-if="isBalanced" class="balance-ok">✅ Balanced</span>
            <span v-else class="balance-err">❌ Not Balanced</span>
          </div>
        </div>
        <div class="card-body-table">
          <div class="table-wrapper">
            <table class="detail-table">
              <thead>
                <tr>
                  <th class="th-account">Akun</th>
                  <th class="th-desc">Keterangan</th>
                  <th class="th-amount">Debit</th>
                  <th class="th-amount">Kredit</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="line in journal.lines" :key="line.id" class="data-row">
                  <td class="td-account">
                    <div class="account-wrap">
                      <span class="account-code">{{ line.account?.code }}</span>
                      <span class="account-name">{{ line.account?.name }}</span>
                    </div>
                  </td>
                  <td class="td-desc">{{ line.description || '-' }}</td>
                  <td class="td-amount">
                    <span v-if="line.debit > 0" class="amt-debit">{{
                      formatCurrency(line.debit)
                    }}</span>
                    <span v-else class="amt-nil">—</span>
                  </td>
                  <td class="td-amount">
                    <span v-if="line.credit > 0" class="amt-credit">{{
                      formatCurrency(line.credit)
                    }}</span>
                    <span v-else class="amt-nil">—</span>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="2" class="td-total-label">TOTAL</td>
                  <td class="td-total-amount">{{ formatCurrency(journal.total_debit) }}</td>
                  <td class="td-total-amount">{{ formatCurrency(journal.total_credit) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="action-card">
        <div class="action-left">
          <span class="action-hint">Pilih aksi untuk jurnal ini</span>
        </div>
        <div class="action-buttons">
          <button
            v-if="journal.status === 'POSTED'"
            @click="showUnpostModal = true"
            class="btn-act btn-warning"
          >
            ⚠️ Unpost
          </button>
          <router-link
            v-if="journal.status === 'DRAFT'"
            :to="{ name: 'EditJurnalPerbaikan', params: { id: journal.id } }"
            class="btn-act btn-primary"
          >
            ✏️ Edit Jurnal
          </router-link>
          <button
            v-if="journal.status === 'DRAFT'"
            @click="handleRepost"
            class="btn-act btn-success"
            :disabled="!isBalanced"
          >
            ✅ Post Ulang
          </button>
          <button
            v-if="journal.status === 'POSTED' || journal.status === 'DRAFT'"
            @click="showVoidModal = true"
            class="btn-act btn-danger"
          >
            🚫 Void Jurnal
          </button>
          <button @click="showHistoryModal = true" class="btn-act btn-info">📜 History</button>
        </div>
      </div>
    </div>

    <!-- MODAL UNPOST -->
    <div v-if="showUnpostModal" class="modal-overlay" @click.self="showUnpostModal = false">
      <div class="modal-box">
        <div class="modal-head">
          <div class="modal-head-icon warn">⚠️</div>
          <div>
            <h3 class="modal-title">Unpost Jurnal</h3>
            <p class="modal-subtitle">Jurnal akan kembali ke status Draft</p>
          </div>
          <button @click="showUnpostModal = false" class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="modal-meta">
            <div class="meta-row">
              <span>No. Jurnal</span><strong>{{ journal.journal_number }}</strong>
            </div>
            <div class="meta-row">
              <span>Tanggal</span><strong>{{ formatDate(journal.date) }}</strong>
            </div>
          </div>
          <div class="modal-alert warn-alert">
            <p class="alert-title">⚠️ Perhatian</p>
            <ul>
              <li>Jurnal akan kembali ke status DRAFT</li>
              <li>Bisa diedit ulang setelah di-unpost</li>
              <li>Harus di-POST ulang setelah selesai edit</li>
            </ul>
          </div>
          <div class="form-group">
            <label class="form-label">Alasan Unpost <span class="req">*</span></label>
            <textarea
              v-model="unpostReason"
              class="form-control"
              rows="3"
              placeholder="Minimal 5 karakter..."
            ></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button @click="showUnpostModal = false" class="btn-cancel">Batal</button>
          <button
            @click="handleUnpost"
            class="btn-act btn-warning"
            :disabled="unpostReason.length < 5"
          >
            Konfirmasi Unpost
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL VOID -->
    <div v-if="showVoidModal" class="modal-overlay" @click.self="showVoidModal = false">
      <div class="modal-box">
        <div class="modal-head">
          <div class="modal-head-icon danger">🚫</div>
          <div>
            <h3 class="modal-title">Void Jurnal</h3>
            <p class="modal-subtitle">Aksi ini tidak dapat dibatalkan</p>
          </div>
          <button @click="showVoidModal = false" class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="modal-meta">
            <div class="meta-row">
              <span>No. Jurnal</span><strong>{{ journal.journal_number }}</strong>
            </div>
            <div class="meta-row">
              <span>Tanggal</span><strong>{{ formatDate(journal.date) }}</strong>
            </div>
          </div>
          <div class="modal-alert danger-alert">
            <p class="alert-title">🚫 Perhatian</p>
            <ul>
              <li>Jurnal akan di-VOID (dibatalkan)</li>
              <li>Tidak bisa diedit atau di-post ulang</li>
              <li>Aksi ini <strong>TIDAK BISA DIBATALKAN</strong></li>
            </ul>
          </div>
          <div class="form-group">
            <label class="form-label">Alasan Void <span class="req">*</span></label>
            <textarea
              v-model="voidReason"
              class="form-control"
              rows="3"
              placeholder="Minimal 5 karakter..."
            ></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button @click="showVoidModal = false" class="btn-cancel">Batal</button>
          <button @click="handleVoid" class="btn-act btn-danger" :disabled="voidReason.length < 5">
            Konfirmasi Void
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL HISTORY -->
    <JurnalHistoryModal
      v-if="showHistoryModal"
      :journal-id="journal.id"
      @close="showHistoryModal = false"
    />
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import JurnalHistoryModal from './components/JurnalHistoryModal.vue'
import { useToast } from 'vue-toastification'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const journal = ref({})
const loading = ref(true)
const showUnpostModal = ref(false)
const showVoidModal = ref(false)
const showHistoryModal = ref(false)
const unpostReason = ref('')
const voidReason = ref('')

const isBalanced = computed(
  () => parseFloat(journal.value.total_debit) === parseFloat(journal.value.total_credit),
)

const fetchJournal = async () => {
  try {
    loading.value = true
    const response = await apiClient.get(`/journal-entries/${route.params.id}`)
    journal.value = response.data.data
  } catch (error) {
    toast.error('Gagal memuat data jurnal')
  } finally {
    loading.value = false
  }
}

const handleUnpost = async () => {
  try {
    await apiClient.post(`/journal-entries/${journal.value.id}/unpost`, {
      reason: unpostReason.value,
    })
    toast.success('Jurnal berhasil di-unpost!')
    showUnpostModal.value = false
    unpostReason.value = ''
    fetchJournal()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal unpost jurnal')
  }
}

const handleRepost = async () => {
  try {
    await apiClient.post(`/journal-entries/${journal.value.id}/repost`)
    toast.success('Jurnal berhasil di-post ulang!')
    fetchJournal()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal repost jurnal')
  }
}

const handleVoid = async () => {
  try {
    await apiClient.post(`/journal-entries/${journal.value.id}/void`, { reason: voidReason.value })
    toast.success('Jurnal berhasil di-void!')
    showVoidModal.value = false
    voidReason.value = ''
    fetchJournal()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal void jurnal')
  }
}

onMounted(fetchJournal)

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const formatCurrency = (value) => {
  if (!value) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const getStatusIcon = (status) => ({ POSTED: '✅', DRAFT: '📝', VOID: '🚫' })[status] || '❓'
</script>

<style scoped>
/* ===== LOADING ===== */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1.5px solid #f3f4f6;
}
.spinner {
  width: 48px;
  height: 48px;
  border: 5px solid #f3f4f6;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.loading-text {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
}

/* ===== PAGE HEADER ===== */
.page-header {
  background: #fff;
  border: 1.5px solid #f3f4f6;
  border-left: 5px solid #2563eb;
  border-radius: 14px;
  padding: 22px 28px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.header-left-section {
  display: flex;
  align-items: center;
  gap: 16px;
}
.icon-badge {
  width: 50px;
  height: 50px;
  background: #dbeafe;
  border: 1.5px solid #bfdbfe;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}
.hero-eyebrow {
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #2563eb;
  font-weight: 700;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.hero-eyebrow::before {
  content: '';
  display: inline-block;
  width: 14px;
  height: 2px;
  background: #2563eb;
  border-radius: 2px;
}
.page-title {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.5px;
  margin: 0 0 3px;
  line-height: 1.1;
}
.page-title .accent {
  color: #2563eb;
}
.page-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  font-family: 'Courier New', monospace;
}
.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  color: #374151;
  text-decoration: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  border: 1.5px solid #e5e7eb;
  transition: all 0.2s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  white-space: nowrap;
}
.btn-back:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #2563eb;
}

/* ===== CONTENT CARD ===== */
.content-card {
  background: #fff;
  border-radius: 14px;
  border: 1.5px solid #f3f4f6;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
  overflow: hidden;
}
.card-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 24px;
  background: #fafafa;
  border-bottom: 1.5px solid #f3f4f6;
  flex-wrap: wrap;
}
.card-head-icon {
  width: 42px;
  height: 42px;
  background: #dbeafe;
  border: 1.5px solid #bfdbfe;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.card-title {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 2px;
}
.card-subtitle {
  font-size: 12.5px;
  color: #6b7280;
  margin: 0;
}
.card-body {
  padding: 22px 24px;
}
.card-body-table {
  padding: 20px 24px;
}

/* ===== INFO GRID ===== */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.info-item {
  background: #fafafa;
  border: 1.5px solid #f3f4f6;
  border-radius: 10px;
  padding: 14px 16px;
}
.info-item.full-width {
  grid-column: 1 / -1;
}
.info-label {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #9ca3af;
  font-weight: 700;
  margin-bottom: 6px;
}
.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}
.info-value.mono {
  font-family: 'Courier New', monospace;
  color: #2563eb;
  font-weight: 700;
}
.warn-text {
  color: #92400e;
  font-weight: 600;
}

/* ===== STATUS BADGE ===== */
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

/* ===== BALANCE INDICATOR ===== */
.balance-ok {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}
.balance-err {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

/* ===== TABLE ===== */
.table-wrapper {
  overflow-x: auto;
  border-radius: 10px;
  border: 1.5px solid #f3f4f6;
}
.detail-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;
}
.detail-table thead {
  background: #1e293b;
}
.detail-table th {
  padding: 13px 18px;
  text-align: left;
  color: #e2e8f0;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  white-space: nowrap;
}
.th-account {
  width: 35%;
}
.th-desc {
  width: 30%;
}
.th-amount {
  width: 17.5%;
  text-align: right;
}
.data-row {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;
}
.data-row:hover {
  background: #f0f9ff;
}
.detail-table td {
  padding: 14px 18px;
  font-size: 13.5px;
  color: #374151;
  vertical-align: middle;
}
.td-amount {
  text-align: right;
}
.account-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.account-code {
  font-family: 'Courier New', monospace;
  font-size: 11.5px;
  font-weight: 700;
  color: #2563eb;
  background: #dbeafe;
  padding: 2px 7px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}
.account-name {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}
.td-desc {
  color: #6b7280;
  font-size: 13px;
}
.amt-debit {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #059669;
}
.amt-credit {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #2563eb;
}
.amt-nil {
  color: #d1d5db;
  font-size: 16px;
}

/* tfoot */
.total-row {
  background: #f8faff;
  border-top: 2px solid #e5e7eb;
}
.td-total-label {
  padding: 14px 18px;
  font-weight: 800;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #374151;
}
.td-total-amount {
  padding: 14px 18px;
  text-align: right;
  font-family: 'Courier New', monospace;
  font-weight: 800;
  font-size: 14px;
  color: #111827;
}

/* ===== ACTION CARD ===== */
.action-card {
  background: #fff;
  border: 1.5px solid #f3f4f6;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.action-hint {
  font-size: 12.5px;
  color: #9ca3af;
  font-weight: 500;
}
.action-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* ===== BUTTONS ===== */
.btn-act {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  font-family: inherit;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.btn-primary {
  background: #2563eb;
  color: #fff;
  box-shadow: 0 3px 10px rgba(37, 99, 235, 0.25);
}
.btn-primary:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}
.btn-success {
  background: #059669;
  color: #fff;
  box-shadow: 0 3px 10px rgba(5, 150, 105, 0.25);
}
.btn-success:hover:not(:disabled) {
  background: #047857;
  transform: translateY(-1px);
}
.btn-success:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn-warning {
  background: #f59e0b;
  color: #fff;
  box-shadow: 0 3px 10px rgba(245, 158, 11, 0.25);
}
.btn-warning:hover:not(:disabled) {
  background: #d97706;
  transform: translateY(-1px);
}
.btn-warning:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn-danger {
  background: #dc2626;
  color: #fff;
  box-shadow: 0 3px 10px rgba(220, 38, 38, 0.25);
}
.btn-danger:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}
.btn-info {
  background: #fff;
  color: #374151;
  border: 1.5px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.btn-info:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}
.btn-cancel {
  display: inline-flex;
  align-items: center;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  background: #fff;
  color: #374151;
  border: 1.5px solid #e5e7eb;
  transition: all 0.2s;
  font-family: inherit;
}
.btn-cancel:hover {
  background: #f9fafb;
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-box {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  animation: modalIn 0.25s ease;
}
@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
  border-bottom: 1.5px solid #f3f4f6;
}
.modal-head-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.modal-head-icon.warn {
  background: #fef3c7;
  border: 1.5px solid #fde68a;
}
.modal-head-icon.danger {
  background: #fee2e2;
  border: 1.5px solid #fecaca;
}
.modal-title {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 2px;
}
.modal-subtitle {
  font-size: 12.5px;
  color: #6b7280;
  margin: 0;
}
.modal-close {
  margin-left: auto;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
  flex-shrink: 0;
}
.modal-close:hover {
  background: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-meta {
  background: #f9fafb;
  border: 1.5px solid #f3f4f6;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}
.meta-row span {
  color: #6b7280;
}
.meta-row strong {
  color: #111827;
  font-family: 'Courier New', monospace;
}

.modal-alert {
  border-radius: 10px;
  padding: 14px 16px;
  font-size: 13px;
}
.warn-alert {
  background: #fffbeb;
  border: 1.5px solid #fde68a;
  color: #78350f;
}
.danger-alert {
  background: #fef2f2;
  border: 1.5px solid #fecaca;
  color: #991b1b;
}
.alert-title {
  font-weight: 800;
  margin: 0 0 8px;
}
.modal-alert ul {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-label {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
}
.req {
  color: #dc2626;
}
.form-control {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13.5px;
  font-family: inherit;
  transition: all 0.2s;
  background: #fafafa;
  box-sizing: border-box;
  resize: vertical;
}
.form-control:focus {
  outline: none;
  border-color: #2563eb;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 18px 24px;
  border-top: 1.5px solid #f3f4f6;
  background: #fafafa;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  .info-item.full-width {
    grid-column: 1;
  }
  .page-header {
    padding: 18px 20px;
  }
  .card-body,
  .card-body-table {
    padding: 18px 20px;
  }
  .card-head {
    padding: 16px 20px;
  }
  .action-card {
    flex-direction: column;
    align-items: flex-start;
  }
  .action-buttons {
    width: 100%;
    flex-wrap: wrap;
  }
  .btn-act {
    flex: 1;
    justify-content: center;
    min-width: 120px;
  }
  .modal-box {
    max-width: 100%;
  }
}
</style>
