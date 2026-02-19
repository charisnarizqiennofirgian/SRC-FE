<template>
  <DashboardLayout>
    <!-- HEADER -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left-section">
          <div class="icon-badge">✏️</div>
          <div>
            <div class="hero-eyebrow">Modul Keuangan</div>
            <h1 class="page-title">Edit Jurnal <span class="accent">Manual</span></h1>
            <p class="page-subtitle">{{ journal?.journal_number || 'Memuat...' }}</p>
          </div>
        </div>
        <router-link
          :to="{ name: 'DetailJurnalPerbaikan', params: { id: $route.params.id } }"
          class="btn-back"
        >
          ← Kembali
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
        <div class="card-head">
          <div class="card-head-icon">ℹ️</div>
          <div>
            <h2 class="card-title">Informasi Jurnal</h2>
            <p class="card-subtitle">Edit informasi dasar jurnal</p>
          </div>
        </div>
        <div class="card-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Tanggal <span class="req">*</span></label>
              <input type="date" v-model="form.date" class="form-control" required />
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <div class="status-readonly">
                <span :class="['status-badge', `s-${journal.status?.toLowerCase()}`]">
                  <span class="status-dot"></span>
                  {{ journal.status }}
                </span>
              </div>
            </div>
            <div class="form-group full-width">
              <label class="form-label">Deskripsi <span class="req">*</span></label>
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
        <div class="card-head">
          <div class="card-head-icon">📝</div>
          <div>
            <h2 class="card-title">Detail Transaksi</h2>
            <p class="card-subtitle">Edit entri debit dan kredit jurnal</p>
          </div>
          <!-- Balance pill di header -->
          <div style="margin-left: auto">
            <span v-if="isBalanced" class="balance-pill ok">✅ Balanced</span>
            <span v-else class="balance-pill err"
              >❌ Selisih {{ formatCurrency(Math.abs(totalDebit - totalCredit)) }}</span
            >
          </div>
        </div>

        <div class="split-layout">
          <!-- DEBIT -->
          <div class="split-col debit-col">
            <div class="col-head">
              <span class="col-badge debit-badge">D</span>
              <span class="col-title">DEBIT</span>
              <span class="col-total">{{ formatCurrency(totalDebit) }}</span>
            </div>
            <div class="entries-list">
              <div
                v-for="(entry, index) in debitEntries"
                :key="`debit-${index}`"
                class="entry-card debit-entry"
              >
                <div class="entry-header">
                  <span class="entry-num">Entri #{{ index + 1 }}</span>
                  <button
                    @click="removeDebitEntry(index)"
                    type="button"
                    class="btn-remove"
                    :disabled="debitEntries.length === 1"
                    title="Hapus entri"
                  >
                    ✕
                  </button>
                </div>
                <div class="entry-body">
                  <div class="form-group">
                    <label class="form-label-sm">Akun</label>
                    <select v-model="entry.account_id" class="form-control-sm" required>
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
                    <label class="form-label-sm">Jumlah</label>
                    <input
                      type="number"
                      v-model.number="entry.debit"
                      class="form-control-sm amount-input debit-input"
                      placeholder="0"
                      required
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label-sm">Keterangan</label>
                    <input
                      type="text"
                      v-model="entry.description"
                      class="form-control-sm"
                      placeholder="Opsional"
                    />
                  </div>
                </div>
              </div>
            </div>
            <button @click="addDebitEntry" type="button" class="btn-add-entry debit-add">
              ＋ Tambah Debit
            </button>
          </div>

          <!-- DIVIDER -->
          <div class="col-divider"></div>

          <!-- KREDIT -->
          <div class="split-col credit-col">
            <div class="col-head">
              <span class="col-badge credit-badge">K</span>
              <span class="col-title">KREDIT</span>
              <span class="col-total">{{ formatCurrency(totalCredit) }}</span>
            </div>
            <div class="entries-list">
              <div
                v-for="(entry, index) in creditEntries"
                :key="`credit-${index}`"
                class="entry-card credit-entry"
              >
                <div class="entry-header">
                  <span class="entry-num">Entri #{{ index + 1 }}</span>
                  <button
                    @click="removeCreditEntry(index)"
                    type="button"
                    class="btn-remove"
                    :disabled="creditEntries.length === 1"
                    title="Hapus entri"
                  >
                    ✕
                  </button>
                </div>
                <div class="entry-body">
                  <div class="form-group">
                    <label class="form-label-sm">Akun</label>
                    <select v-model="entry.account_id" class="form-control-sm" required>
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
                    <label class="form-label-sm">Jumlah</label>
                    <input
                      type="number"
                      v-model.number="entry.credit"
                      class="form-control-sm amount-input credit-input"
                      placeholder="0"
                      required
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label-sm">Keterangan</label>
                    <input
                      type="text"
                      v-model="entry.description"
                      class="form-control-sm"
                      placeholder="Opsional"
                    />
                  </div>
                </div>
              </div>
            </div>
            <button @click="addCreditEntry" type="button" class="btn-add-entry credit-add">
              ＋ Tambah Kredit
            </button>
          </div>
        </div>

        <!-- BALANCE BAR -->
        <div class="balance-bar">
          <div class="balance-row">
            <div class="bal-item">
              <span class="bal-label">Total Debit</span>
              <span class="bal-value debit-val">{{ formatCurrency(totalDebit) }}</span>
            </div>
            <div class="bal-sep">=</div>
            <div class="bal-item">
              <span class="bal-label">Total Kredit</span>
              <span class="bal-value credit-val">{{ formatCurrency(totalCredit) }}</span>
            </div>
            <div class="bal-sep">→</div>
            <div class="bal-result">
              <span
                v-if="isBalanced"
                class="balance-pill ok"
                style="font-size: 14px; padding: 8px 16px"
                >✅ BALANCED</span
              >
              <span v-else class="balance-pill err" style="font-size: 14px; padding: 8px 16px"
                >❌ Selisih {{ formatCurrency(Math.abs(totalDebit - totalCredit)) }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- FORM ACTIONS -->
      <div class="form-actions">
        <router-link
          :to="{ name: 'DetailJurnalPerbaikan', params: { id: $route.params.id } }"
          class="btn-cancel"
          >Batal</router-link
        >
        <button
          type="button"
          @click="handleSaveOnly"
          class="btn-act btn-secondary-act"
          :disabled="isSaving || !isBalanced"
        >
          💾 Simpan Draft
        </button>
        <button type="submit" class="btn-act btn-primary-act" :disabled="isSaving || !isBalanced">
          <span v-if="isSaving">⏳ Menyimpan...</span>
          <span v-else>✅ Simpan & Post Ulang</span>
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

const form = reactive({ date: '', description: '' })
const debitEntries = ref([])
const creditEntries = ref([])

const totalDebit = computed(() => debitEntries.value.reduce((sum, e) => sum + (e.debit || 0), 0))
const totalCredit = computed(() => creditEntries.value.reduce((sum, e) => sum + (e.credit || 0), 0))
const isBalanced = computed(() => Math.abs(totalDebit.value - totalCredit.value) < 0.01)

const fetchJournal = async () => {
  try {
    loading.value = true
    const response = await apiClient.get(`/journal-entries/${route.params.id}`)
    journal.value = response.data.data
    form.date = journal.value.date
    form.description = journal.value.description
    debitEntries.value = journal.value.lines
      .filter((l) => l.debit > 0)
      .map((l) => ({
        account_id: l.account_id,
        debit: parseFloat(l.debit),
        credit: 0,
        description: l.description || '',
      }))
    creditEntries.value = journal.value.lines
      .filter((l) => l.credit > 0)
      .map((l) => ({
        account_id: l.account_id,
        debit: 0,
        credit: parseFloat(l.credit),
        description: l.description || '',
      }))
    if (debitEntries.value.length === 0) addDebitEntry()
    if (creditEntries.value.length === 0) addCreditEntry()
  } catch (error) {
    toast.error('Gagal memuat data jurnal')
  } finally {
    loading.value = false
  }
}

const fetchChartOfAccounts = async () => {
  try {
    const response = await apiClient.get('/coa/all')
    chartOfAccounts.value = response.data.data
  } catch {
    toast.error('Gagal memuat daftar akun')
  }
}

const addDebitEntry = () =>
  debitEntries.value.push({ account_id: '', debit: 0, credit: 0, description: '' })
const addCreditEntry = () =>
  creditEntries.value.push({ account_id: '', debit: 0, credit: 0, description: '' })
const removeDebitEntry = (i) => {
  if (debitEntries.value.length > 1) debitEntries.value.splice(i, 1)
}
const removeCreditEntry = (i) => {
  if (creditEntries.value.length > 1) creditEntries.value.splice(i, 1)
}
const handleSaveOnly = async () => await saveJournal(false)
const handleSave = async () => await saveJournal(true)

const saveJournal = async (andRepost = true) => {
  if (!isBalanced.value) {
    toast.error('Jurnal tidak balance!')
    return
  }
  isSaving.value = true
  try {
    await apiClient.put(`/journal-entries/${route.params.id}/update-manual`, {
      date: form.date,
      description: form.description,
      entries: [...debitEntries.value, ...creditEntries.value],
    })
    toast.success('Jurnal berhasil diupdate!')
    if (andRepost) {
      await apiClient.post(`/journal-entries/${route.params.id}/repost`)
      toast.success('Jurnal berhasil di-post ulang!')
    }
    router.push({ name: 'DetailJurnalPerbaikan', params: { id: route.params.id } })
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal menyimpan jurnal')
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

/* ===== FORM GRID ===== */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}
.form-group {
  margin: 0;
}
.form-group.full-width {
  grid-column: 1 / -1;
}
.form-label {
  display: block;
  margin-bottom: 7px;
  font-weight: 700;
  color: #374151;
  font-size: 13px;
}
.req {
  color: #dc2626;
}
.form-control {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  background: #fafafa;
  font-family: inherit;
  font-weight: 500;
  box-sizing: border-box;
  color: #111827;
}
.form-control:focus {
  outline: none;
  border-color: #2563eb;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
textarea.form-control {
  resize: vertical;
  min-height: 88px;
}
.status-readonly {
  display: flex;
  align-items: center;
  height: 44px;
}

/* STATUS BADGE */
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
}
.s-void {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}
.s-void .status-dot {
  background: #9ca3af;
}

/* ===== SPLIT LAYOUT ===== */
.split-layout {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0;
  padding: 24px;
}
.col-divider {
  width: 1px;
  background: #e5e7eb;
  margin: 0 24px;
  border-radius: 2px;
}

.split-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.col-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 14px;
  border-bottom: 1.5px solid #f3f4f6;
}
.col-badge {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  flex-shrink: 0;
}
.debit-badge {
  background: #d1fae5;
  color: #065f46;
  border: 1.5px solid #a7f3d0;
}
.credit-badge {
  background: #dbeafe;
  color: #1e40af;
  border: 1.5px solid #bfdbfe;
}
.col-title {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #374151;
  flex: 1;
}
.col-total {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: 700;
}
.debit-col .col-total {
  color: #059669;
}
.credit-col .col-total {
  color: #2563eb;
}

/* ===== ENTRIES ===== */
.entries-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.entry-card {
  border-radius: 10px;
  border: 1.5px solid #f3f4f6;
  overflow: hidden;
  background: #fafafa;
  transition: box-shadow 0.2s;
}
.entry-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.debit-entry {
  border-left: 3px solid #10b981;
}
.credit-entry {
  border-left: 3px solid #2563eb;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #f9fafb;
  border-bottom: 1.5px solid #f3f4f6;
}
.entry-num {
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.btn-remove {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1.5px solid #fecaca;
  background: #fee2e2;
  color: #dc2626;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  transition: all 0.2s;
}
.btn-remove:hover:not(:disabled) {
  background: #fecaca;
}
.btn-remove:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.entry-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.form-label-sm {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 5px;
}
.form-control-sm {
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 7px;
  font-size: 13.5px;
  font-family: inherit;
  font-weight: 500;
  background: #fff;
  color: #111827;
  transition: all 0.2s;
  box-sizing: border-box;
}
.form-control-sm:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}
.amount-input {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 14px;
}
.debit-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}
.credit-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.btn-add-entry {
  width: 100%;
  padding: 10px;
  border: 1.5px dashed #d1d5db;
  border-radius: 8px;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.debit-add {
  color: #059669;
}
.debit-add:hover {
  border-color: #10b981;
  background: #f0fdf4;
  color: #047857;
}
.credit-add {
  color: #2563eb;
}
.credit-add:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #1d4ed8;
}

/* ===== BALANCE BAR ===== */
.balance-bar {
  padding: 16px 24px;
  border-top: 1.5px solid #f3f4f6;
  background: #fafafa;
}
.balance-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}
.bal-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.bal-label {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #9ca3af;
  font-weight: 700;
}
.bal-value {
  font-family: 'Courier New', monospace;
  font-size: 15px;
  font-weight: 800;
}
.debit-val {
  color: #059669;
}
.credit-val {
  color: #2563eb;
}
.bal-sep {
  font-size: 18px;
  color: #d1d5db;
  font-weight: 300;
}

/* ===== BALANCE PILL ===== */
.balance-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}
.balance-pill.ok {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}
.balance-pill.err {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* ===== FORM ACTIONS ===== */
.form-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  padding: 18px 24px;
  background: #fff;
  border-radius: 14px;
  border: 1.5px solid #f3f4f6;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  flex-wrap: wrap;
}
.btn-cancel {
  display: inline-flex;
  align-items: center;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  background: #fff;
  color: #374151;
  border: 1.5px solid #e5e7eb;
  transition: all 0.2s;
  font-family: inherit;
}
.btn-cancel:hover {
  background: #f9fafb;
}
.btn-act {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.btn-act:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none !important;
}
.btn-secondary-act {
  background: #fff;
  color: #374151;
  border: 1.5px solid #e5e7eb;
}
.btn-secondary-act:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}
.btn-primary-act {
  background: #2563eb;
  color: #fff;
  box-shadow: 0 3px 10px rgba(37, 99, 235, 0.25);
}
.btn-primary-act:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 5px 14px rgba(37, 99, 235, 0.3);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .split-layout {
    grid-template-columns: 1fr;
  }
  .col-divider {
    width: 100%;
    height: 1px;
    margin: 4px 0;
  }
}
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .form-group.full-width {
    grid-column: 1;
  }
  .page-header {
    padding: 18px 20px;
  }
  .form-actions {
    flex-direction: column;
  }
  .btn-cancel,
  .btn-act {
    width: 100%;
    justify-content: center;
  }
}
</style>
