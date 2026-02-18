<template>
  <DashboardLayout>
    <!-- HEADER -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left-section">
          <div class="icon-badge">📋</div>
          <div>
            <h1 class="page-title">Detail Jurnal Manual</h1>
            <p class="page-subtitle">{{ journal?.journal_number || 'Loading...' }}</p>
          </div>
        </div>
        <router-link :to="{ name: 'JurnalPerbaikan' }" class="btn-back">
          <span class="btn-icon">←</span>
          <span>Kembali</span>
        </router-link>
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
        <div class="card-header-section">
          <div class="section-icon-wrapper">
            <div class="section-icon">ℹ️</div>
          </div>
          <div class="section-header-text">
            <h2 class="section-title">Informasi Jurnal</h2>
            <p class="section-subtitle">Detail informasi jurnal manual</p>
          </div>
        </div>
        <div class="card-body">
          <div class="info-grid">
            <div class="info-item">
              <label class="info-label">Nomor Jurnal:</label>
              <span class="info-value">{{ journal.journal_number }}</span>
            </div>
            <div class="info-item">
              <label class="info-label">Tanggal:</label>
              <span class="info-value">{{ formatDate(journal.date) }}</span>
            </div>
            <div class="info-item">
              <label class="info-label">Status:</label>
              <span :class="['status-badge', `status-${journal.status.toLowerCase()}`]">
                {{ getStatusIcon(journal.status) }} {{ journal.status }}
              </span>
            </div>
            <div class="info-item full-width">
              <label class="info-label">Deskripsi:</label>
              <span class="info-value">{{ journal.description }}</span>
            </div>
            <div class="info-item" v-if="journal.created_by">
              <label class="info-label">Dibuat Oleh:</label>
              <span class="info-value">{{ journal.created_by?.name || '-' }}</span>
            </div>
            <div class="info-item" v-if="journal.unposted_by">
              <label class="info-label">Di-unpost Oleh:</label>
              <span class="info-value">{{ journal.unposted_by?.name || '-' }}</span>
            </div>
            <div class="info-item full-width" v-if="journal.unpost_reason">
              <label class="info-label">Alasan Unpost:</label>
              <span class="info-value text-warning">{{ journal.unpost_reason }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ENTRIES TABLE -->
      <div class="content-card">
        <div class="card-header-section">
          <div class="section-icon-wrapper">
            <div class="section-icon">📝</div>
          </div>
          <div class="section-header-text">
            <h2 class="section-title">Detail Transaksi</h2>
            <p class="section-subtitle">Entri debit dan kredit</p>
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
                    <div class="account-info">
                      <span class="account-code">{{ line.account?.code }}</span>
                      <span class="account-name">{{ line.account?.name }}</span>
                    </div>
                  </td>
                  <td class="td-desc">{{ line.description || '-' }}</td>
                  <td class="td-amount">
                    <span v-if="line.debit > 0" class="amount-debit">
                      {{ formatCurrency(line.debit) }}
                    </span>
                    <span v-else>-</span>
                  </td>
                  <td class="td-amount">
                    <span v-if="line.credit > 0" class="amount-credit">
                      {{ formatCurrency(line.credit) }}
                    </span>
                    <span v-else>-</span>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="2" class="td-total-label">TOTAL</td>
                  <td class="td-total-amount">
                    <strong>{{ formatCurrency(journal.total_debit) }}</strong>
                  </td>
                  <td class="td-total-amount">
                    <strong>{{ formatCurrency(journal.total_credit) }}</strong>
                  </td>
                </tr>
                <tr class="balance-row">
                  <td colspan="4" class="td-balance">
                    <span v-if="isBalanced" class="balance-status balanced">
                      ✅ BALANCED
                    </span>
                    <span v-else class="balance-status unbalanced">
                      ❌ NOT BALANCED
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="action-card">
        <div class="action-buttons">
          <!-- UNPOST (jika POSTED) -->
          <button
            v-if="journal.status === 'POSTED'"
            @click="showUnpostModal = true"
            class="btn-action btn-warning"
          >
            <span>⚠️</span> Unpost Jurnal
          </button>

          <!-- EDIT (jika DRAFT) -->
          <router-link
            v-if="journal.status === 'DRAFT'"
            :to="{ name: 'EditJurnalPerbaikan', params: { id: journal.id } }"
            class="btn-action btn-primary"
          >
            <span>✏️</span> Edit Jurnal
          </router-link>

          <!-- REPOST (jika DRAFT) -->
          <button
            v-if="journal.status === 'DRAFT'"
            @click="handleRepost"
            class="btn-action btn-success"
            :disabled="!isBalanced"
          >
            <span>✅</span> Post Ulang
          </button>

          <!-- VOID -->
          <button
            v-if="journal.status === 'POSTED' || journal.status === 'DRAFT'"
            @click="showVoidModal = true"
            class="btn-action btn-danger"
          >
            <span>❌</span> Void Jurnal
          </button>

          <!-- HISTORY -->
          <button @click="showHistoryModal = true" class="btn-action btn-info">
            <span>📜</span> History
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL UNPOST -->
    <div v-if="showUnpostModal" class="modal-overlay" @click.self="showUnpostModal = false">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">⚠️ Unpost Jurnal Manual</h3>
          <button @click="showUnpostModal = false" class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="modal-info">
            <p><strong>Jurnal:</strong> {{ journal.journal_number }}</p>
            <p><strong>Tanggal:</strong> {{ formatDate(journal.date) }}</p>
          </div>
          <div class="modal-warning">
            <p>⚠️ <strong>PERHATIAN:</strong></p>
            <ul>
              <li>Jurnal akan kembali ke status DRAFT</li>
              <li>Bisa diedit ulang</li>
              <li>Harus di-POST ulang setelah edit</li>
            </ul>
          </div>
          <div class="form-group">
            <label class="form-label">Alasan Unpost: <span class="required">*</span></label>
            <textarea
              v-model="unpostReason"
              class="form-control"
              rows="3"
              placeholder="Minimal 5 karakter..."
              required
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showUnpostModal = false" class="btn-secondary">Batal</button>
          <button
            @click="handleUnpost"
            class="btn-warning"
            :disabled="unpostReason.length < 5"
          >
            ✅ Unpost Jurnal
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL VOID -->
    <div v-if="showVoidModal" class="modal-overlay" @click.self="showVoidModal = false">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">❌ Void Jurnal Manual</h3>
          <button @click="showVoidModal = false" class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="modal-info">
            <p><strong>Jurnal:</strong> {{ journal.journal_number }}</p>
            <p><strong>Tanggal:</strong> {{ formatDate(journal.date) }}</p>
          </div>
          <div class="modal-warning">
            <p>⚠️ <strong>PERHATIAN:</strong></p>
            <ul>
              <li>Jurnal akan di-VOID (dibatalkan)</li>
              <li>Tidak bisa diedit atau di-post ulang</li>
              <li>Aksi ini <strong>TIDAK BISA DIBATALKAN</strong></li>
            </ul>
          </div>
          <div class="form-group">
            <label class="form-label">Alasan Void: <span class="required">*</span></label>
            <textarea
              v-model="voidReason"
              class="form-control"
              rows="3"
              placeholder="Minimal 5 karakter..."
              required
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showVoidModal = false" class="btn-secondary">Batal</button>
          <button
            @click="handleVoid"
            class="btn-danger"
            :disabled="voidReason.length < 5"
          >
            ✅ Void Jurnal
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

const isBalanced = computed(() => {
  return parseFloat(journal.value.total_debit) === parseFloat(journal.value.total_credit)
})

const fetchJournal = async () => {
  try {
    loading.value = true
    const response = await apiClient.get(`/journal-entries/${route.params.id}`)
    journal.value = response.data.data
  } catch (error) {
    console.error('Error fetching journal:', error)
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
    const errorMessage = error.response?.data?.message || 'Gagal unpost jurnal'
    toast.error(errorMessage)
  }
}

const handleRepost = async () => {
  try {
    await apiClient.post(`/journal-entries/${journal.value.id}/repost`)
    toast.success('Jurnal berhasil di-post ulang!')
    fetchJournal()
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Gagal repost jurnal'
    toast.error(errorMessage)
  }
}

const handleVoid = async () => {
  try {
    await apiClient.post(`/journal-entries/${journal.value.id}/void`, {
      reason: voidReason.value,
    })
    toast.success('Jurnal berhasil di-void!')
    showVoidModal.value = false
    voidReason.value = ''
    fetchJournal()
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Gagal void jurnal'
    toast.error(errorMessage)
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

const getStatusIcon = (status) => {
  const icons = {
    POSTED: '✅',
    DRAFT: '📝',
    VOID: '❌',
  }
  return icons[status] || '❓'
}
</script>