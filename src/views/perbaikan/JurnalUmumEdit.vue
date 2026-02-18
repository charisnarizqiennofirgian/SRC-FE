<template>
  <DashboardLayout>
    <!-- HEADER -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left-section">
          <div class="icon-badge">✏️</div>
          <div>
            <h1 class="page-title">Edit Jurnal Manual</h1>
            <p class="page-subtitle">{{ journal?.journal_number || 'Loading...' }}</p>
          </div>
        </div>
        <router-link
          :to="{ name: 'DetailJurnalPerbaikan', params: { id: $route.params.id } }"
          class="btn-back"
        >
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

    <!-- FORM -->
    <form v-else @submit.prevent="handleSave">
      <!-- INFO CARD -->
      <div class="content-card">
        <div class="card-header-section">
          <div class="section-icon-wrapper">
            <div class="section-icon">ℹ️</div>
          </div>
          <div class="section-header-text">
            <h2 class="section-title">Informasi Jurnal</h2>
            <p class="section-subtitle">Edit informasi dasar jurnal</p>
          </div>
        </div>
        <div class="card-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Tanggal <span class="required">*</span></label>
              <input type="date" v-model="form.date" class="form-control" required />
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <input
                type="text"
                :value="journal.status"
                class="form-control"
                disabled
                readonly
              />
            </div>
            <div class="form-group full-width">
              <label class="form-label">Deskripsi <span class="required">*</span></label>
              <textarea
                v-model="form.description"
                class="form-control"
                rows="3"
                placeholder="Deskripsi jurnal..."
                required
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- ENTRIES CARD -->
      <div class="content-card">
        <div class="card-header-section">
          <div class="section-icon-wrapper">
            <div class="section-icon">📝</div>
          </div>
          <div class="section-header-text">
            <h2 class="section-title">Detail Transaksi</h2>
            <p class="section-subtitle">Edit entri debit dan kredit</p>
          </div>
        </div>
        <div class="card-body-split">
          <!-- DEBIT SECTION -->
          <div class="split-section debit-section">
            <h3 class="section-subtitle-small">💰 DEBIT</h3>
            <div class="entries-list">
              <div
                v-for="(entry, index) in debitEntries"
                :key="`debit-${index}`"
                class="entry-card"
              >
                <div class="entry-header">
                  <span class="entry-number">#{{ index + 1 }}</span>
                  <button
                    @click="removeDebitEntry(index)"
                    type="button"
                    class="btn-remove"
                    :disabled="debitEntries.length === 1"
                  >
                    🗑️
                  </button>
                </div>
                <div class="entry-body">
                  <div class="form-group">
                    <label class="form-label-small">Akun</label>
                    <select v-model="entry.account_id" class="form-control-small" required>
                      <option disabled value="">Pilih Akun</option>
                      <option
                        v-for="account in chartOfAccounts"
                        :key="account.id"
                        :value="account.id"
                      >
                        {{ account.code }} - {{ account.name }}
                      </option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label-small">Jumlah (Debit)</label>
                    <input
                      type="number"
                      v-model.number="entry.debit"
                      class="form-control-small"
                      placeholder="0"
                      required
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label-small">Keterangan</label>
                    <input
                      type="text"
                      v-model="entry.description"
                      class="form-control-small"
                      placeholder="Keterangan (opsional)"
                    />
                  </div>
                </div>
              </div>
              <button @click="addDebitEntry" type="button" class="btn-add-entry">
                ➕ Tambah Debit
              </button>
            </div>
            <div class="section-total">
              <span class="total-label">Total Debit:</span>
              <span class="total-value">{{ formatCurrency(totalDebit) }}</span>
            </div>
          </div>

          <!-- KREDIT SECTION -->
          <div class="split-section credit-section">
            <h3 class="section-subtitle-small">💳 KREDIT</h3>
            <div class="entries-list">
              <div
                v-for="(entry, index) in creditEntries"
                :key="`credit-${index}`"
                class="entry-card"
              >
                <div class="entry-header">
                  <span class="entry-number">#{{ index + 1 }}</span>
                  <button
                    @click="removeCreditEntry(index)"
                    type="button"
                    class="btn-remove"
                    :disabled="creditEntries.length === 1"
                  >
                    🗑️
                  </button>
                </div>
                <div class="entry-body">
                  <div class="form-group">
                    <label class="form-label-small">Akun</label>
                    <select v-model="entry.account_id" class="form-control-small" required>
                      <option disabled value="">Pilih Akun</option>
                      <option
                        v-for="account in chartOfAccounts"
                        :key="account.id"
                        :value="account.id"
                      >
                        {{ account.code }} - {{ account.name }}
                      </option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label-small">Jumlah (Kredit)</label>
                    <input
                      type="number"
                      v-model.number="entry.credit"
                      class="form-control-small"
                      placeholder="0"
                      required
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label-small">Keterangan</label>
                    <input
                      type="text"
                      v-model="entry.description"
                      class="form-control-small"
                      placeholder="Keterangan (opsional)"
                    />
                  </div>
                </div>
              </div>
              <button @click="addCreditEntry" type="button" class="btn-add-entry">
                ➕ Tambah Kredit
              </button>
            </div>
            <div class="section-total">
              <span class="total-label">Total Kredit:</span>
              <span class="total-value">{{ formatCurrency(totalCredit) }}</span>
            </div>
          </div>
        </div>

        <!-- BALANCE CHECK -->
        <div class="balance-check">
          <div v-if="isBalanced" class="balance-status balanced">
            <span class="balance-icon">✅</span>
            <span class="balance-text">BALANCED</span>
          </div>
          <div v-else class="balance-status unbalanced">
            <span class="balance-icon">❌</span>
            <span class="balance-text">
              NOT BALANCED (Selisih: {{ formatCurrency(Math.abs(totalDebit - totalCredit)) }})
            </span>
          </div>
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="form-actions">
        <button
          type="button"
          @click="handleSaveOnly"
          class="btn-secondary"
          :disabled="isSaving || !isBalanced"
        >
          💾 Simpan Draft
        </button>
        <button
          type="submit"
          class="btn-primary"
          :disabled="isSaving || !isBalanced"
        >
          {{ isSaving ? 'Menyimpan...' : '✅ Simpan & Post Ulang' }}
        </button>
      </div>
    </form>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useToast } from 'vue-toastification'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const journal = ref({})
const chartOfAccounts = ref([])
const loading = ref(true)
const isSaving = ref(false)

const form = reactive({
  date: '',
  description: '',
})

const debitEntries = ref([])
const creditEntries = ref([])

const totalDebit = computed(() => {
  return debitEntries.value.reduce((sum, entry) => sum + (entry.debit || 0), 0)
})

const totalCredit = computed(() => {
  return creditEntries.value.reduce((sum, entry) => sum + (entry.credit || 0), 0)
})

const isBalanced = computed(() => {
  return Math.abs(totalDebit.value - totalCredit.value) < 0.01
})

const fetchJournal = async () => {
  try {
    loading.value = true
    const response = await apiClient.get(`/journal-entries/${route.params.id}`)
    journal.value = response.data.data

    // Populate form
    form.date = journal.value.date
    form.description = journal.value.description

    // Split entries into debit/credit
    debitEntries.value = journal.value.lines
      .filter((line) => line.debit > 0)
      .map((line) => ({
        account_id: line.account_id,
        debit: parseFloat(line.debit),
        credit: 0,
        description: line.description || '',
      }))

    creditEntries.value = journal.value.lines
      .filter((line) => line.credit > 0)
      .map((line) => ({
        account_id: line.account_id,
        debit: 0,
        credit: parseFloat(line.credit),
        description: line.description || '',
      }))

    // Ensure at least 1 entry each
    if (debitEntries.value.length === 0) {
      addDebitEntry()
    }
    if (creditEntries.value.length === 0) {
      addCreditEntry()
    }
  } catch (error) {
    console.error('Error fetching journal:', error)
    toast.error('Gagal memuat data jurnal')
  } finally {
    loading.value = false
  }
}

const fetchChartOfAccounts = async () => {
  try {
    const response = await apiClient.get('/chart-of-accounts?all=true')
    chartOfAccounts.value = response.data.data
  } catch (error) {
    console.error('Error fetching COA:', error)
    toast.error('Gagal memuat daftar akun')
  }
}

const addDebitEntry = () => {
  debitEntries.value.push({
    account_id: '',
    debit: 0,
    credit: 0,
    description: '',
  })
}

const addCreditEntry = () => {
  creditEntries.value.push({
    account_id: '',
    debit: 0,
    credit: 0,
    description: '',
  })
}

const removeDebitEntry = (index) => {
  if (debitEntries.value.length > 1) {
    debitEntries.value.splice(index, 1)
  }
}

const removeCreditEntry = (index) => {
  if (creditEntries.value.length > 1) {
    creditEntries.value.splice(index, 1)
  }
}

const handleSaveOnly = async () => {
  await saveJournal(false)
}

const handleSave = async () => {
  await saveJournal(true)
}

const saveJournal = async (andRepost = true) => {
  if (!isBalanced.value) {
    toast.error('Jurnal tidak balance! Tidak bisa disimpan.')
    return
  }

  isSaving.value = true
  try {
    // Combine debit & credit entries
    const allEntries = [...debitEntries.value, ...creditEntries.value]

    await apiClient.put(`/journal-entries/${route.params.id}/update-manual`, {
      date: form.date,
      description: form.description,
      entries: allEntries,
    })

    toast.success('Jurnal berhasil diupdate!')

    // Repost if requested
    if (andRepost) {
      await apiClient.post(`/journal-entries/${route.params.id}/repost`)
      toast.success('Jurnal berhasil di-post ulang!')
    }

    router.push({ name: 'DetailJurnalPerbaikan', params: { id: route.params.id } })
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Gagal menyimpan jurnal'
    toast.error(errorMessage)
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  await fetchChartOfAccounts()
  await fetchJournal()
})

const formatCurrency = (value) => {
  if (!value) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}
</script>

<style scoped>
/* SPLIT LAYOUT */
.card-body-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px;
}

.split-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.debit-section {
  border-right: 2px solid #e5e7eb;
  padding-right: 24px;
}

.credit-section {
  padding-left: 24px;
}

.section-subtitle-small {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

/* ENTRIES LIST */
.entries-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.entry-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.entry-number {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
}

.btn-remove {
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-remove:hover:not(:disabled) {
  background: #fecaca;
}

.btn-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.entry-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-label-small {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.form-control-small {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.btn-add-entry {
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-add-entry:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

/* SECTION TOTAL */
.section-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f3f4f6;
  border-radius: 8px;
  font-weight: 600;
}

.total-label {
  font-size: 15px;
  color: #374151;
}

.total-value {
  font-size: 18px;
  color: #111827;
}

/* BALANCE CHECK */
.balance-check {
  padding: 20px 24px;
  border-top: 2px solid #e5e7eb;
}

.balance-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 700;
}

.balance-status.balanced {
  background: #d1fae5;
  color: #065f46;
  border: 2px solid #10b981;
}

.balance-status.unbalanced {
  background: #fee2e2;
  color: #991b1b;
  border: 2px solid #ef4444;
}

.balance-icon {
  font-size: 24px;
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .card-body-split {
    grid-template-columns: 1fr;
  }

  .debit-section {
    border-right: none;
    border-bottom: 2px solid #e5e7eb;
    padding-right: 0;
    padding-bottom: 24px;
  }

  .credit-section {
    padding-left: 0;
    padding-top: 24px;
  }
}
</style>