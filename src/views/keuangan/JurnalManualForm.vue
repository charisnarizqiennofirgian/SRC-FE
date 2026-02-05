<template>
  <DashboardLayout>
    <div class="journal-create">
      <!-- Hero Header -->
      <div class="hero-header">
        <div class="header-left">
          <div class="header-icon">
            <i class="fas fa-book-open"></i>
          </div>
          <div class="header-text">
            <h1 class="page-title">Jurnal Manual</h1>
            <p class="page-subtitle">Buat transaksi penyesuaian atau koreksi akuntansi</p>
          </div>
        </div>
        <button @click="$router.back()" class="btn btn-secondary btn-icon-lg">
          <i class="fas fa-arrow-left"></i>
          Kembali
        </button>
      </div>

      <!-- Main Form Container -->
      <div class="form-container">
        <form @submit.prevent="handleSubmit" class="journal-form">
          <!-- Header Section -->
          <div class="section-card header-section">
            <div class="section-header">
              <div class="section-icon">
                <i class="fas fa-calendar-alt"></i>
              </div>
              <h3>Informasi Header</h3>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label required">Tanggal Transaksi</label>
                <input
                  type="date"
                  v-model="form.date"
                  class="form-input"
                  :class="{ error: errors.date }"
                  required
                />
                <div v-if="errors.date" class="error-message">{{ errors.date }}</div>
              </div>

              <div class="form-group">
                <label class="form-label">Nomor Jurnal</label>
                <div class="input-display">
                  <i class="fas fa-magic"></i>
                  <span>Auto Generated</span>
                </div>
              </div>
            </div>

            <div class="form-group full-width">
              <label class="form-label required">Keterangan Jurnal</label>
              <textarea
                v-model="form.description"
                class="form-input textarea"
                rows="3"
                placeholder="Contoh: Koreksi selisih stok opname gudang utama periode Januari 2026"
                :class="{ error: errors.description }"
                required
              ></textarea>
              <div v-if="errors.description" class="error-message">{{ errors.description }}</div>
            </div>
          </div>

          <!-- Journal Entries Table -->
          <div class="section-card table-section">
            <div class="section-header">
              <div class="section-icon">
                <i class="fas fa-list"></i>
              </div>
              <h3>Detail Jurnal</h3>
              <div class="section-actions">
                <button type="button" @click="addEntry" class="btn btn-sm btn-success">
                  <i class="fas fa-plus"></i>
                  Baris Baru
                </button>
              </div>
            </div>

            <div class="table-container">
              <table class="journal-table">
                <thead>
                  <tr>
                    <th>Akun</th>
                    <th class="amount-col">Debit</th>
                    <th class="amount-col">Kredit</th>
                    <th>Keterangan</th>
                    <th class="action-col">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(entry, index) in form.entries" :key="index" class="table-row">
                    <td class="account-cell">
                      <div class="select-wrapper">
                        <select
                          v-model="entry.account_id"
                          class="form-input select-account"
                          :class="{ error: errors[`entries.${index}.account_id`] }"
                          required
                        >
                          <option value="">Pilih akun...</option>
                          <option v-for="account in accounts" :key="account.id" :value="account.id">
                            {{ account.code }} - {{ account.name }}
                          </option>
                        </select>
                        <i class="fas fa-chevron-down"></i>
                      </div>
                    </td>
                    <td class="amount-cell debit">
                      <input
                        type="number"
                        v-model.number="entry.debit"
                        @input="handleDebitInput(index)"
                        class="form-input amount-input"
                        min="0"
                        step="0.01"
                        placeholder="0"
                      />
                    </td>
                    <td class="amount-cell credit">
                      <input
                        type="number"
                        v-model.number="entry.credit"
                        @input="handleCreditInput(index)"
                        class="form-input amount-input"
                        min="0"
                        step="0.01"
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        v-model="entry.description"
                        class="form-input"
                        placeholder="Keterangan baris (opsional)"
                      />
                    </td>
                    <td class="action-cell">
                      <button
                        type="button"
                        @click="removeEntry(index)"
                        class="btn-action btn-danger"
                        :disabled="form.entries.length <= 2"
                        title="Hapus baris"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Balance Warning -->
            <div v-if="!isBalanced" class="balance-warning">
              <i class="fas fa-exclamation-triangle"></i>
              <span
                >Total Debit ({{ formatNumber(totalDebit) }}) ≠ Total Kredit ({{
                  formatNumber(totalCredit)
                }})</span
              >
            </div>
          </div>

          <!-- Summary Cards -->
          <div class="summary-grid">
            <div class="summary-card debit-card">
              <div class="summary-icon">
                <i class="fas fa-arrow-up"></i>
              </div>
              <div>
                <div class="summary-label">Total Debit</div>
                <div class="summary-value">{{ formatCurrency(totalDebit) }}</div>
              </div>
            </div>

            <div class="summary-card credit-card">
              <div class="summary-icon">
                <i class="fas fa-arrow-down"></i>
              </div>
              <div>
                <div class="summary-label">Total Kredit</div>
                <div class="summary-value">{{ formatCurrency(totalCredit) }}</div>
              </div>
            </div>

            <div class="summary-card balance-card" :class="{ balanced: isBalanced }">
              <div class="summary-icon" :class="{ balanced: isBalanced }">
                <i v-if="isBalanced" class="fas fa-check-circle"></i>
                <i v-else class="fas fa-balance-scale"></i>
              </div>
              <div>
                <div class="summary-label">Status Balance</div>
                <div class="summary-value status-text">
                  {{ isBalanced ? '✓ SEIMBANG' : '⚠ BELUM SEIMBANG' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <button type="button" @click="$router.back()" class="btn btn-secondary btn-lg">
              <i class="fas fa-times"></i>
              Batal
            </button>
            <button type="submit" class="btn btn-primary btn-lg" :disabled="!isBalanced || loading">
              <span v-if="loading">
                <i class="fas fa-spinner fa-spin"></i>
                Menyimpan...
              </span>
              <span v-else>
                <i class="fas fa-save"></i>
                Simpan Jurnal
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/api/axios'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { useNotification } from '@/composables/useNotification.js'

const router = useRouter()
const { showSuccess, showError } = useNotification()

const loading = ref(false)
const accounts = ref([])
const errors = ref({})

const form = ref({
  date: new Date().toISOString().split('T')[0],
  description: '',
  entries: [
    { account_id: '', debit: 0, credit: 0, description: '' },
    { account_id: '', debit: 0, credit: 0, description: '' },
  ],
})

const totalDebit = computed(() => {
  return form.value.entries.reduce((sum, entry) => sum + (parseFloat(entry.debit) || 0), 0)
})

const totalCredit = computed(() => {
  return form.value.entries.reduce((sum, entry) => sum + (parseFloat(entry.credit) || 0), 0)
})

const isBalanced = computed(() => {
  return Math.abs(totalDebit.value - totalCredit.value) < 0.01 && totalDebit.value > 0
})

const fetchAccounts = async () => {
  try {
    const response = await apiClient.get('/coa/all')
    accounts.value = response.data.data || response.data
  } catch (error) {
    console.error('Error fetching accounts:', error)
    showError('Gagal', 'Gagal memuat daftar akun')
  }
}

const addEntry = () => {
  form.value.entries.push({ account_id: '', debit: 0, credit: 0, description: '' })
}

const removeEntry = (index) => {
  if (form.value.entries.length > 2) {
    form.value.entries.splice(index, 1)
  }
}

const handleDebitInput = (index) => {
  if (form.value.entries[index].debit > 0) {
    form.value.entries[index].credit = 0
  }
}

const handleCreditInput = (index) => {
  if (form.value.entries[index].credit > 0) {
    form.value.entries[index].debit = 0
  }
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('id-ID').format(num)
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const handleSubmit = async () => {
  errors.value = {}
  loading.value = true

  try {
    await apiClient.post('/journal-entries/manual', form.value)
    showSuccess('Berhasil', 'Jurnal manual berhasil disimpan!')
    router.push('/admin/keuangan/jurnal-umum')
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      showError('Gagal', error.response?.data?.message || 'Gagal menyimpan jurnal')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAccounts()
})
</script>

<style scoped>
.journal-create {
  padding: 32px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

/* Hero Header */
.hero-header {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%);
  color: white;
  padding: 48px;
  border-radius: 32px;
  margin-bottom: 48px;
  box-shadow: 0 35px 60px -12px rgba(99, 102, 241, 0.4);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 18px;
  opacity: 0.95;
  margin: 0;
  font-weight: 500;
}

/* Form Container */
.form-container {
  max-width: 1400px;
  margin: 0 auto;
}

.journal-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Section Cards */
.section-card {
  background: white;
  border-radius: 28px;
  padding: 40px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f8fafc;
}

.section-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  flex-shrink: 0;
}

.section-header h3 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: #1e293b;
}

.section-actions {
  margin-left: auto;
}

/* Form Elements */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.required::after {
  content: '*';
  color: #ef4444;
  font-weight: 800;
  font-size: 16px;
}

.form-input {
  padding: 18px 24px;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fafbff;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  transform: translateY(-1px);
}

.form-input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

.textarea {
  resize: vertical;
  min-height: 120px;
}

.input-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  color: #64748b;
  font-weight: 600;
}

.input-display i {
  color: #10b981;
  font-size: 18px;
}

/* Journal Table */
.table-container {
  overflow-x: auto;
  border-radius: 20px;
  margin-bottom: 24px;
}

.journal-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.journal-table th {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 20px 24px;
  text-align: left;
  font-weight: 700;
  color: #374151;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 20;
}

.journal-table td {
  padding: 24px;
  border-bottom: 1px solid #f8fafc;
  vertical-align: middle;
}

.table-row:hover {
  background: #fafbff;
}

.account-cell {
  min-width: 320px;
}

.amount-col {
  width: 140px;
  text-align: center;
}

.action-col {
  width: 80px;
}

.select-account {
  min-height: 56px;
}

.amount-input {
  text-align: center;
  font-weight: 700;
  font-size: 16px;
}

.amount-input.debit {
  color: #3b82f6;
}
.amount-input.credit {
  color: #10b981;
}

.btn-action {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: all 0.3s;
}

.btn-action:hover:not(:disabled) {
  transform: scale(1.1);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

/* Balance Warning */
.balance-warning {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fecaca;
  border-radius: 16px;
  color: #dc2626;
  font-weight: 600;
}

.balance-warning i {
  font-size: 20px;
}

/* Summary Grid */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.summary-card {
  background: white;
  padding: 32px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s;
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

.summary-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.debit-card .summary-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}
.credit-card .summary-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}
.balance-card .summary-icon {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #64748b;
}
.balance-card.balanced .summary-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.summary-label {
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
}

.status-text {
  font-size: 18px !important;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.btn:active {
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
}

.btn-secondary {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-sm {
  padding: 10px 20px;
  font-size: 14px;
}

.btn-icon-lg {
  padding: 20px 32px;
  font-size: 16px;
}

/* Error Messages */
.error-message {
  margin-top: 8px;
  color: #ef4444;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.error-message::before {
  content: '⚠';
  font-size: 14px;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  padding: 48px 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 1024px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .summary-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .journal-create {
    padding: 20px 0;
  }
  .hero-header {
    flex-direction: column;
    gap: 32px;
    text-align: center;
    padding: 32px;
  }

  .section-card {
    padding: 24px;
  }
  .form-actions {
    flex-direction: column;
  }

  .journal-table {
    font-size: 14px;
  }
  .journal-table td,
  .journal-table th {
    padding: 16px 12px;
  }
}
</style>
