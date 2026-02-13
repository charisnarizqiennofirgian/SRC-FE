<template>
  <DashboardLayout>
    <div class="journal-entry-form">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <div class="header-icon">
              <i class="fas fa-journal-whills"></i>
            </div>
            <div class="header-text">
              <h1 class="page-title">Jurnal Manual</h1>
              <p class="page-subtitle">Input Transaksi Penyesuaian & Koreksi</p>
            </div>
          </div>
          <button @click="$router.back()" class="btn btn-secondary">
            <i class="fas fa-arrow-left"></i>
            Kembali
          </button>
        </div>
      </div>

      <!-- Main Form -->
      <div class="form-container">
        <form @submit.prevent="handleSubmit" class="journal-form">
          
          <!-- Header Information -->
          <div class="form-section">
            <div class="section-header">
              <h3>Informasi Header Jurnal</h3>
            </div>
            
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label required">Tanggal Transaksi</label>
                <input
                  type="date"
                  v-model="form.date"
                  class="form-control"
                  :class="{ 'is-invalid': errors.date }"
                  required
                />
                <div v-if="errors.date" class="invalid-feedback">{{ errors.date }}</div>
              </div>

              <div class="form-group">
                <label class="form-label">Nomor Jurnal</label>
                <div class="form-control-plain">
                  <i class="fas fa-hashtag text-muted"></i>
                  AUTO-GENERATED
                </div>
              </div>
            </div>

            <div class="form-group full-width">
              <label class="form-label required">Keterangan Jurnal</label>
              <textarea
                v-model="form.description"
                class="form-control"
                rows="3"
                placeholder="Masukkan keterangan lengkap transaksi (contoh: Koreksi selisih stok, penyesuaian depresiasi, dll)"
                :class="{ 'is-invalid': errors.description }"
                required
              ></textarea>
              <div v-if="errors.description" class="invalid-feedback">{{ errors.description }}</div>
            </div>
          </div>

          <!-- Debit Entries -->
          <div class="form-section debit-section">
            <div class="section-header">
              <div class="section-title">
                <i class="fas fa-arrow-up text-primary"></i>
                <span>REKENING DEBIT</span>
              </div>
              <button type="button" @click="addDebitEntry" class="btn btn-outline-success btn-sm">
                <i class="fas fa-plus"></i> Tambah Baris
              </button>
            </div>

            <div class="entries-table">
              <table class="table table-journal">
                <thead>
                  <tr>
                    <th style="width: 45%">Akun</th>
                    <th style="width: 20%">Nominal</th>
                    <th style="width: 25%">Keterangan</th>
                    <th style="width: 10%" class="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(entry, index) in debitEntries" :key="'debit-' + index" class="table-row">
                    <td>
                      <select
                        v-model="entry.account_id"
                        class="form-select"
                        :class="{ 'is-invalid': errors[`debit.${index}.account_id`] }"
                        required
                      >
                        <option value="">Pilih Rekening...</option>
                        <option v-for="account in accounts" :key="account.id" :value="account.id">
                          {{ account.code }} - {{ account.name }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <div class="input-group">
                        <span class="input-group-text">Rp</span>
                        <input
                          type="text"
                          v-model="entry.displayAmount"
                          @input="handleDebitAmountInput(index, $event)"
                          @blur="formatDebitAmount(index)"
                          class="form-control amount-input text-end"
                          placeholder="0"
                          required
                        />
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        v-model="entry.description"
                        class="form-control"
                        placeholder="Keterangan (opsional)"
                      />
                    </td>
                    <td class="text-center">
                      <button
                        type="button"
                        @click="removeDebitEntry(index)"
                        class="btn btn-outline-danger btn-sm"
                        :disabled="debitEntries.length <= 1"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="section-total">
              <div class="total-label">Total Debit</div>
              <div class="total-value text-primary">{{ formatCurrency(totalDebit) }}</div>
            </div>
          </div>

          <!-- Credit Entries -->
          <div class="form-section credit-section">
            <div class="section-header">
              <div class="section-title">
                <i class="fas fa-arrow-down text-success"></i>
                <span>REKENING KREDIT</span>
              </div>
              <button type="button" @click="addKreditEntry" class="btn btn-outline-success btn-sm">
                <i class="fas fa-plus"></i> Tambah Baris
              </button>
            </div>

            <div class="entries-table">
              <table class="table table-journal">
                <thead>
                  <tr>
                    <th style="width: 45%">Akun</th>
                    <th style="width: 20%">Nominal</th>
                    <th style="width: 25%">Keterangan</th>
                    <th style="width: 10%" class="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(entry, index) in kreditEntries" :key="'kredit-' + index" class="table-row">
                    <td>
                      <select
                        v-model="entry.account_id"
                        class="form-select"
                        :class="{ 'is-invalid': errors[`kredit.${index}.account_id`] }"
                        required
                      >
                        <option value="">Pilih Rekening...</option>
                        <option v-for="account in accounts" :key="account.id" :value="account.id">
                          {{ account.code }} - {{ account.name }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <div class="input-group">
                        <span class="input-group-text">Rp</span>
                        <input
                          type="text"
                          v-model="entry.displayAmount"
                          @input="handleKreditAmountInput(index, $event)"
                          @blur="formatKreditAmount(index)"
                          class="form-control amount-input text-end"
                          placeholder="0"
                          required
                        />
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        v-model="entry.description"
                        class="form-control"
                        placeholder="Keterangan (opsional)"
                      />
                    </td>
                    <td class="text-center">
                      <button
                        type="button"
                        @click="removeKreditEntry(index)"
                        class="btn btn-outline-danger btn-sm"
                        :disabled="kreditEntries.length <= 1"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="section-total">
              <div class="total-label">Total Kredit</div>
              <div class="total-value text-success">{{ formatCurrency(totalKredit) }}</div>
            </div>
          </div>

          <!-- Balance Check -->
          <div class="balance-check" :class="{ 'balanced': isBalanced, 'imbalanced': !isBalanced }">
            <div class="balance-indicator">
              <i v-if="isBalanced" class="fas fa-check-circle text-success"></i>
              <i v-else class="fas fa-exclamation-triangle text-warning"></i>
            </div>
            <div class="balance-info">
              <div class="balance-title">
                {{ isBalanced ? 'Jurnal Balance' : 'Jurnal Belum Balance' }}
              </div>
              <div class="balance-details">
                <span>Debit: {{ formatCurrency(totalDebit) }}</span>
                <span>|</span>
                <span>Kredit: {{ formatCurrency(totalKredit) }}</span>
                <span>|</span>
                <span :class="{ 'text-danger': !isBalanced }">Selisih: {{ formatCurrency(Math.abs(totalDebit - totalKredit)) }}</span>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
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
})

const debitEntries = ref([{ account_id: '', amount: 0, displayAmount: '0', description: '' }])
const kreditEntries = ref([{ account_id: '', amount: 0, displayAmount: '0', description: '' }])

const totalDebit = computed(() => debitEntries.value.reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0))
const totalKredit = computed(() => kreditEntries.value.reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0))
const isBalanced = computed(() => Math.abs(totalDebit.value - totalKredit.value) < 0.01 && totalDebit.value > 0)

const formatAmountDisplay = (value) => !value || value === 0 ? '0' : new Intl.NumberFormat('id-ID').format(value)
const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

const addDebitEntry = () => debitEntries.value.push({ account_id: '', amount: 0, displayAmount: '0', description: '' })
const removeDebitEntry = (index) => debitEntries.value.length > 1 && debitEntries.value.splice(index, 1)
const handleDebitAmountInput = (index, event) => {
  let value = event.target.value.replace(/[^\d]/g, '')
  debitEntries.value[index].amount = parseFloat(value) || 0
  debitEntries.value[index].displayAmount = formatAmountDisplay(value)
}
const formatDebitAmount = (index) => debitEntries.value[index].displayAmount = formatAmountDisplay(debitEntries.value[index].amount)

const addKreditEntry = () => kreditEntries.value.push({ account_id: '', amount: 0, displayAmount: '0', description: '' })
const removeKreditEntry = (index) => kreditEntries.value.length > 1 && kreditEntries.value.splice(index, 1)
const handleKreditAmountInput = (index, event) => {
  let value = event.target.value.replace(/[^\d]/g, '')
  kreditEntries.value[index].amount = parseFloat(value) || 0
  kreditEntries.value[index].displayAmount = formatAmountDisplay(value)
}
const formatKreditAmount = (index) => kreditEntries.value[index].displayAmount = formatAmountDisplay(kreditEntries.value[index].amount)

const fetchAccounts = async () => {
  try {
    const response = await apiClient.get('/coa/all')
    accounts.value = response.data.data || response.data
  } catch (error) {
    console.error('Error fetching accounts:', error)
    showError('Gagal', 'Gagal memuat daftar akun')
  }
}

const handleSubmit = async () => {
  errors.value = {}
  loading.value = true

  try {
    const entries = [
      ...debitEntries.value.map(e => ({ account_id: e.account_id, debit: e.amount, credit: 0, description: e.description })),
      ...kreditEntries.value.map(e => ({ account_id: e.account_id, debit: 0, credit: e.amount, description: e.description }))
    ]

    const payload = { date: form.value.date, description: form.value.description, entries }
    await apiClient.post('/journal-entries/manual', payload)
    showSuccess('Berhasil', 'Jurnal manual berhasil disimpan!')
    router.push('/admin/keuangan/jurnal-umum')
  } catch (error) {
    if (error.response?.data?.errors) errors.value = error.response.data.errors
    else showError('Gagal', error.response?.data?.message || 'Gagal menyimpan jurnal')
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchAccounts())
</script>

<style scoped>
.journal-entry-form {
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.page-subtitle {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
}

.form-container {
  max-width: 1400px;
  margin: 0 auto;
}

.form-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.section-title i {
  font-size: 24px;
}

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
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 15px;
}

.required::after {
  content: ' *';
  color: #dc3545;
}

.form-control, .form-select {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus, .form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-control.is-invalid, .form-select.is-invalid {
  border-color: #dc3545;
}

.form-control-plain {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  font-weight: 500;
}

.entries-table {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.table-journal {
  width: 100%;
  margin: 0;
  background: white;
}

.table-journal th {
  background: #f8fafc;
  padding: 16px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e5e7eb;
}

.table-journal td {
  padding: 16px;
  vertical-align: middle;
  border-bottom: 1px solid #f1f3f4;
}

.table-row:hover {
  background: #f8fafc;
}

.input-group-text {
  background: #f8fafc;
  border: 1px solid #d1d5db;
  border-right: none;
  padding: 10px 12px;
  font-weight: 500;
}

.amount-input {
  font-weight: 600;
  font-size: 16px;
  font-family: 'SF Pro Display', -apple-system, sans-serif;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 13px;
  margin-top: 4px;
}

.section-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8fafc;
  border-top: 2px solid #e5e7eb;
  margin-top: 8px;
  border-radius: 0 0 8px 8px;
}

.total-label {
  font-weight: 600;
  color: #374151;
  font-size: 16px;
}

.total-value {
  font-size: 20px;
  font-weight: 700;
}

.balance-check {
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 24px 0;
}

.balance-check.balanced {
  border-color: #22c55e;
  background: #f0fdf4;
}

.balance-check.imbalanced {
  border-color: #f59e0b;
  background: #fffbeb;
}

.balance-indicator i {
  font-size: 28px;
}

.balance-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.balance-details {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 16px;
  color: #6b7280;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 32px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.btn-outline-success {
  color: #16a34a;
  border-color: #16a34a;
}

.btn-outline-danger {
  color: #dc2626;
  border-color: #dc2626;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 992px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .balance-check {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .balance-details {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .journal-entry-form {
    padding: 16px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .table-journal td,
  .table-journal th {
    padding: 12px 8px;
  }
}
</style>
