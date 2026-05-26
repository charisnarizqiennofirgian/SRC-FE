<template>
  <DashboardLayout>
    <!-- HEADER -->
    <div class="page-header-ob">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge">🏦</div>
          <div>
            <h1 class="page-title">Opening Balance</h1>
            <p class="page-subtitle">Upload Excel neraca klien per 30 April 2026</p>
          </div>
        </div>
        <div v-if="!obExists" class="upload-section">
          <button class="btn-template-ob" @click="downloadTemplate" title="Download template Excel dengan semua akun COA sistem">
            📥 Download Template
          </button>
          <label class="btn-upload-ob" :class="{ uploading: isUploading }">
            {{ isUploading ? '⏳ Memproses...' : '📤 Upload Excel' }}
            <input type="file" accept=".xlsx,.xls" @change="handleUpload" hidden :disabled="isUploading" />
          </label>
        </div>
      </div>
    </div>

    <!-- SUDAH ADA OB -->
    <div v-if="obExists" class="ob-exists-card">
      <div class="ob-exists-header">
        <span class="ob-exists-icon">✅</span>
        <div>
          <h3 class="ob-exists-title">Opening Balance Sudah Diinput</h3>
          <p class="ob-exists-sub">Tanggal: {{ formatDate(existingOB?.date) }} | Total Debit: {{ formatRupiah(existingOB?.total_debit) }}</p>
        </div>
        <button class="btn-hapus-ob" @click="konfirmasiHapus">🗑️ Hapus & Input Ulang</button>
      </div>

      <!-- Detail OB yang sudah ada -->
      <div class="ob-detail-table-wrapper">
        <table class="ob-detail-table">
          <thead>
            <tr>
              <th>Akun</th>
              <th class="text-right">Debit</th>
              <th class="text-right">Kredit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="line in existingOB?.lines" :key="line.id">
              <td>{{ line.account?.name || '-' }}</td>
              <td class="text-right text-green">{{ line.debit > 0 ? formatRupiah(line.debit) : '-' }}</td>
              <td class="text-right text-red">{{ line.credit > 0 ? formatRupiah(line.credit) : '-' }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td><strong>TOTAL</strong></td>
              <td class="text-right text-green"><strong>{{ formatRupiah(existingOB?.total_debit) }}</strong></td>
              <td class="text-right text-red"><strong>{{ formatRupiah(existingOB?.total_credit) }}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- FORM INPUT OB -->
    <div v-else class="content-card-ob">
      <div class="card-header-ob">
        <div class="section-icon">📋</div>
        <div>
          <h2 class="card-title">Form Input Opening Balance</h2>
          <p class="card-subtitle">Masukkan semua akun beserta saldo per 30 April 2026</p>
        </div>
      </div>

      <div class="card-body-ob">
        <!-- INFO TANGGAL -->
        <div class="form-group-ob">
          <label class="form-label-ob">Tanggal Opening Balance</label>
          <input v-model="form.date" type="date" class="form-input-ob" />
        </div>

        <div class="form-group-ob">
          <label class="form-label-ob">Keterangan</label>
          <input v-model="form.description" type="text" class="form-input-ob"
            placeholder="Contoh: Opening Balance per 30 April 2026" />
        </div>

        <!-- TABEL ENTRIES -->
        <div class="entries-section">
          <div class="entries-header">
            <h3 class="entries-title">📝 Detail Akun & Saldo</h3>
            <div class="balance-indicator" :class="isBalance ? 'balance-ok' : 'balance-error'">
              <span>{{ isBalance ? '✅ Balance' : '⚠️ Belum Balance' }}</span>
              <span class="balance-diff" v-if="!isBalance">
                Selisih: {{ formatRupiah(Math.abs(totalDebit - totalCredit)) }}
              </span>
            </div>
          </div>

          <div class="table-wrapper-ob">
            <table class="entries-table">
              <thead>
                <tr>
                  <th class="th-no">No</th>
                  <th class="th-akun">Akun</th>
                  <th class="th-debit">Debit (Rp)</th>
                  <th class="th-kredit">Kredit (Rp)</th>
                  <th class="th-hapus">Hapus</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(entry, index) in form.entries" :key="index" class="entry-row">
                  <td class="td-no">{{ index + 1 }}</td>
                  <td class="td-akun">
                    <vue-select
                      v-model="entry.account_id"
                      :options="daftarAkun"
                      :reduce="a => a.id"
                      label="name"
                      placeholder="Cari akun..."
                      class="vue-select-akun"
                      :filterable="true"
                    >
                      <template #option="opt">
                        <div class="akun-option">
                          <span class="akun-code">{{ opt.code }}</span>
                          <span class="akun-name">{{ opt.name }}</span>
                        </div>
                      </template>
                    </vue-select>
                  </td>
                  <td class="td-debit">
                    <input
                      v-model.number="entry.debit"
                      type="number" min="0" step="any"
                      class="input-amount"
                      placeholder="0"
                      @input="entry.credit = entry.debit > 0 ? 0 : entry.credit"
                    />
                  </td>
                  <td class="td-kredit">
                    <input
                      v-model.number="entry.credit"
                      type="number" min="0" step="any"
                      class="input-amount input-credit"
                      placeholder="0"
                      @input="entry.debit = entry.credit > 0 ? 0 : entry.debit"
                    />
                  </td>
                  <td class="td-hapus">
                    <button
                      type="button"
                      class="btn-hapus-row"
                      @click="hapusEntry(index)"
                      :disabled="form.entries.length <= 2"
                    >✕</button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="total-row-form">
                  <td colspan="2"><strong>TOTAL</strong></td>
                  <td class="text-right text-green"><strong>{{ formatRupiah(totalDebit) }}</strong></td>
                  <td class="text-right text-red"><strong>{{ formatRupiah(totalCredit) }}</strong></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="entries-actions">
            <button type="button" class="btn-tambah-row" @click="tambahEntry">
              ➕ Tambah Baris
            </button>
          </div>
        </div>

        <!-- FORM ACTIONS -->
        <div class="form-actions-ob">
          <div class="balance-summary">
            <div class="summary-item">
              <span class="summary-label">Total Debit:</span>
              <span class="summary-value text-green">{{ formatRupiah(totalDebit) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Total Kredit:</span>
              <span class="summary-value text-red">{{ formatRupiah(totalCredit) }}</span>
            </div>
            <div class="summary-item" :class="isBalance ? 'text-green' : 'text-red'">
              <span class="summary-label">Selisih:</span>
              <span class="summary-value"><strong>{{ formatRupiah(Math.abs(totalDebit - totalCredit)) }}</strong></span>
            </div>
          </div>
          <button
            type="button"
            class="btn-simpan-ob"
            @click="simpanOB"
            :disabled="isSaving || !isBalance || form.entries.filter(e => e.account_id).length < 2"
          >
            {{ isSaving ? '⏳ Menyimpan...' : '💾 Simpan Opening Balance' }}
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import Swal from 'sweetalert2'

const { showSuccess, showError } = useNotification()

const obExists    = ref(false)
const isUploading = ref(false)
const existingOB  = ref(null)
const isSaving    = ref(false)
const daftarAkun  = ref([])

const form = reactive({
  date:        '2026-04-30',
  description: 'Opening Balance per 30 April 2026',
  entries: [
    { account_id: null, debit: 0, credit: 0 },
    { account_id: null, debit: 0, credit: 0 },
  ],
})

const totalDebit = computed(() =>
  form.entries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0)
)

const totalCredit = computed(() =>
  form.entries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0)
)

const isBalance = computed(() =>
  totalDebit.value > 0 &&
  Math.abs(totalDebit.value - totalCredit.value) < 1
)

const fetchAkun = async () => {
  try {
    const res = await apiClient.get('/chart-of-accounts?all=true')
    daftarAkun.value = res.data.data || []
  } catch {
    showError('Gagal', 'Gagal memuat daftar akun')
  }
}

const checkOB = async () => {
  try {
    const res = await apiClient.get('/journal-entries/opening-balance/check')
    obExists.value   = res.data.data.exists
    existingOB.value = res.data.data.journal
  } catch { /* silent */ }
}

const tambahEntry = () => {
  form.entries.push({ account_id: null, debit: 0, credit: 0 })
}

const hapusEntry = (index) => {
  if (form.entries.length > 2) {
    form.entries.splice(index, 1)
  }
}

const simpanOB = async () => {
  if (!isBalance.value) {
    showError('Belum Balance', 'Total Debit harus sama dengan Total Kredit!')
    return
  }

  const validEntries = form.entries.filter(e => e.account_id && (e.debit > 0 || e.credit > 0))
  if (validEntries.length < 2) {
    showError('Validasi', 'Minimal 2 akun harus diisi!')
    return
  }

  const confirm = await Swal.fire({
    title: 'Simpan Opening Balance?',
    html: `Total Debit & Kredit: <strong>${formatRupiah(totalDebit.value)}</strong><br>Tanggal: <strong>${form.date}</strong>`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Simpan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#10b981',
  })
  if (!confirm.isConfirmed) return

  isSaving.value = true
  try {
    await apiClient.post('/journal-entries/opening-balance', {
      date:        form.date,
      description: form.description,
      entries:     validEntries,
    })
    showSuccess('Berhasil', 'Opening Balance berhasil disimpan!')
    await checkOB()
  } catch (error) {
    showError('Gagal', error.response?.data?.message || 'Gagal menyimpan Opening Balance')
  } finally {
    isSaving.value = false
  }
}

const downloadTemplate = async () => {
  try {
    const res = await apiClient.get('/journal-entries/opening-balance/template', {
      responseType: 'blob'
    })
    const url  = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href  = url
    link.setAttribute('download', 'template-opening-balance.xlsx')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch {
    showError('Gagal', 'Tidak dapat mengunduh template')
  }
}

const handleUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const confirm = await Swal.fire({
    title: 'Upload Excel Neraca?',
    html: `File: <strong>${file.name}</strong><br>Sistem akan baca kolom <strong>NERACA LAJUR</strong> dan <strong>SALDO AKHIR</strong>`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Upload & Proses',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#10b981',
  })
  if (!confirm.isConfirmed) return

  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('date', '2026-04-30')

    const res = await apiClient.post(
      '/journal-entries/opening-balance/import',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )

    await Swal.fire({
      title: 'Berhasil! ✅',
      html: `
        Opening Balance berhasil diimport!<br><br>
        Total Akun: <strong>${res.data.data.total_akun}</strong><br>
        Total Debit: <strong>${formatRupiah(res.data.data.total_debit)}</strong><br>
        Total Kredit: <strong>${formatRupiah(res.data.data.total_credit)}</strong>
      `,
      icon: 'success',
      confirmButtonColor: '#10b981',
    })

    await checkOB()
  } catch (error) {
    const data   = error.response?.data || {}
    const errors = data.errors
    const debug  = data.debug

    if (errors?.length) {
      const berhasil = data.akun_berhasil ?? 0
      await Swal.fire({
        title: `❌ ${errors.length} Akun Tidak Ditemukan di COA`,
        html: `
          <div style="text-align:left">
            <p>✅ Akun berhasil dicocokkan: <strong>${berhasil}</strong></p>
            <p>❌ Akun tidak ditemukan: <strong>${errors.length}</strong></p>
            <hr style="margin:12px 0">
            <p><b>Daftar akun yang perlu ditambah ke COA:</b></p>
            <small>${[...new Set(errors.map(e => e.replace(/^Baris \d+: '(.+)' tidak ditemukan.+/, '$1')))].join(', ')}</small>
            <hr style="margin:12px 0">
            <small style="color:#6b7280">Tambahkan akun tersebut di menu Master → COA, lalu upload ulang.</small>
          </div>
        `,
        icon: 'error',
        confirmButtonText: 'Mengerti',
      })
    } else if (data.message?.includes('tidak balance') && data.data) {
      const d = data.data
      await Swal.fire({
        title: '⚠️ Jurnal Tidak Balance',
        html: `
          <div style="text-align:left">
            <p>Total Debit: <strong>${formatRupiah(d.total_debit)}</strong></p>
            <p>Total Kredit: <strong>${formatRupiah(d.total_credit)}</strong></p>
            <p>Selisih: <strong style="color:#ef4444">${formatRupiah(d.selisih)}</strong></p>
            <hr style="margin:12px 0">
            <small style="color:#6b7280">${debug?.join('<br>') || ''}</small>
          </div>
        `,
        icon: 'warning',
        confirmButtonText: 'Mengerti',
      })
    } else if (debug?.length) {
      await Swal.fire({
        title: 'File Tidak Terbaca',
        html: `<b>${data.message}</b><br><br><small style="text-align:left;display:block">${debug.join('<br>')}</small><br><i>${data.hint || ''}</i>`,
        icon: 'warning',
      })
    } else {
      showError('Gagal', data.message || 'Gagal upload Excel')
    }
  } finally {
    isUploading.value  = false
    event.target.value = ''
  }
}

const konfirmasiHapus = async () => {
  const confirm = await Swal.fire({
    title: 'Hapus Opening Balance?',
    text: 'Data Opening Balance akan dihapus permanen. Yakin?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#ef4444',
  })
  if (!confirm.isConfirmed) return

  try {
    await apiClient.delete('/journal-entries/opening-balance')
    showSuccess('Berhasil', 'Opening Balance berhasil dihapus!')
    obExists.value   = false
    existingOB.value = null
  } catch (error) {
    showError('Gagal', error.response?.data?.message || 'Gagal menghapus')
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

const formatRupiah = (amount) => {
  if (!amount) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(amount)
}

onMounted(async () => {
  await Promise.all([fetchAkun(), checkOB()])
})
</script>

<style scoped>
.page-header-ob {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 32px 36px; border-radius: 20px; margin-bottom: 24px;
  box-shadow: 0 10px 30px rgba(16,185,129,0.25);
}
.header-content { display:flex; justify-content:space-between; align-items:center; color:white; }
.header-left { display:flex; align-items:center; gap:20px; }
.icon-badge { width:64px; height:64px; background:rgba(255,255,255,0.2); border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:32px; }
.page-title { font-size:28px; font-weight:900; margin:0 0 6px; color:white; }
.page-subtitle { font-size:14px; opacity:0.95; margin:0; color:white; }

.upload-section { display:flex; gap:12px; }
.btn-template-ob {
  padding:12px 20px; background:rgba(255,255,255,0.2); color:white;
  border:2px solid rgba(255,255,255,0.7); border-radius:12px; font-weight:700;
  font-size:14px; cursor:pointer; transition:all 0.2s;
}
.btn-template-ob:hover { background:rgba(255,255,255,0.35); }

.btn-upload-ob {
  padding:12px 24px; background:white; color:#059669;
  border:none; border-radius:12px; font-weight:800;
  font-size:14px; cursor:pointer;
  box-shadow:0 4px 14px rgba(0,0,0,0.15);
  transition:all 0.2s;
}
.btn-upload-ob:hover { transform:translateY(-2px); }
.btn-upload-ob.uploading { opacity:0.7; cursor:not-allowed; }

.ob-exists-card { background:white; border-radius:20px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.08); margin-bottom:24px; }
.ob-exists-header { display:flex; align-items:center; gap:16px; padding:24px 32px; background:linear-gradient(135deg,#d1fae5,#a7f3d0); border-bottom:2px solid #6ee7b7; }
.ob-exists-icon { font-size:40px; }
.ob-exists-title { font-size:18px; font-weight:800; color:#065f46; margin:0 0 4px; }
.ob-exists-sub { font-size:13px; color:#047857; margin:0; }
.btn-hapus-ob { margin-left:auto; padding:10px 20px; background:#ef4444; color:white; border:none; border-radius:10px; font-weight:700; cursor:pointer; }
.btn-hapus-ob:hover { background:#dc2626; }
.ob-detail-table-wrapper { padding:24px 32px; overflow-x:auto; }
.ob-detail-table { width:100%; border-collapse:collapse; font-size:14px; }
.ob-detail-table th { padding:12px 16px; background:#f8fafc; font-weight:700; color:#475569; border-bottom:2px solid #e2e8f0; }
.ob-detail-table td { padding:12px 16px; border-bottom:1px solid #f1f5f9; }

.content-card-ob { background:white; border-radius:20px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.08); }
.card-header-ob { display:flex; align-items:center; gap:16px; padding:24px 32px; background:linear-gradient(135deg,#f0fdf4,#dcfce7); border-bottom:3px solid #bbf7d0; }
.section-icon { font-size:28px; width:52px; height:52px; background:linear-gradient(135deg,#10b981,#059669); border-radius:12px; display:flex; align-items:center; justify-content:center; }
.card-title { font-size:20px; font-weight:800; color:#1e293b; margin:0 0 4px; }
.card-subtitle { font-size:13px; color:#64748b; margin:0; }
.card-body-ob { padding:32px; }

.form-group-ob { margin-bottom:20px; }
.form-label-ob { display:block; font-weight:700; font-size:14px; color:#374151; margin-bottom:8px; }
.form-input-ob { width:100%; padding:12px 16px; border:2px solid #e5e7eb; border-radius:10px; font-size:14px; max-width:400px; box-sizing:border-box; }
.form-input-ob:focus { outline:none; border-color:#10b981; }

.entries-section { margin-top:28px; }
.entries-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
.entries-title { font-size:17px; font-weight:800; color:#1e293b; margin:0; }
.balance-indicator { display:flex; align-items:center; gap:10px; padding:8px 16px; border-radius:10px; font-weight:700; font-size:14px; }
.balance-ok { background:#d1fae5; color:#065f46; }
.balance-error { background:#fee2e2; color:#991b1b; }
.balance-diff { font-size:12px; opacity:0.8; }

.table-wrapper-ob { overflow-x:auto; border-radius:12px; border:1px solid #e5e7eb; }
.entries-table { width:100%; border-collapse:collapse; min-width:700px; }
.entries-table thead { background:linear-gradient(135deg,#1e293b,#334155); }
.entries-table th { padding:14px 16px; color:white; font-weight:700; font-size:12px; text-transform:uppercase; }
.th-no { width:50px; text-align:center; }
.th-akun { width:45%; }
.th-debit, .th-kredit { width:20%; text-align:right; }
.th-hapus { width:60px; text-align:center; }

.entry-row { border-bottom:1px solid #f1f5f9; transition:background 0.2s; }
.entry-row:hover { background:#f8fafc; }
.entries-table td { padding:10px 16px; vertical-align:middle; }
.td-no { text-align:center; color:#94a3b8; font-size:13px; }
.td-debit, .td-kredit { text-align:right; }
.td-hapus { text-align:center; }

.input-amount { width:100%; padding:9px 12px; border:2px solid #e5e7eb; border-radius:8px; font-size:14px; text-align:right; font-weight:600; box-sizing:border-box; }
.input-amount:focus { outline:none; border-color:#10b981; }
.input-credit:focus { border-color:#ef4444; }

.btn-hapus-row { background:#fee2e2; color:#ef4444; border:none; border-radius:6px; width:28px; height:28px; cursor:pointer; font-size:12px; font-weight:700; }
.btn-hapus-row:disabled { opacity:0.3; cursor:not-allowed; }

.total-row-form { background:#f8fafc; border-top:2px solid #e2e8f0; }
.total-row-form td { padding:14px 16px; font-size:15px; }

.entries-actions { margin-top:16px; }
.btn-tambah-row { padding:10px 20px; background:#f0fdf4; border:2px dashed #10b981; border-radius:10px; color:#065f46; font-weight:700; cursor:pointer; }
.btn-tambah-row:hover { background:#dcfce7; }

.form-actions-ob { display:flex; justify-content:space-between; align-items:center; padding-top:24px; border-top:2px solid #e5e7eb; margin-top:24px; gap:20px; flex-wrap:wrap; }
.balance-summary { display:flex; gap:24px; flex-wrap:wrap; }
.summary-item { display:flex; align-items:center; gap:8px; }
.summary-label { font-size:13px; color:#64748b; font-weight:600; }
.summary-value { font-size:15px; font-weight:800; }
.text-green { color:#10b981; }
.text-red { color:#ef4444; }
.text-right { text-align:right; }

.btn-simpan-ob { padding:14px 32px; background:linear-gradient(135deg,#10b981,#059669); color:white; border:none; border-radius:12px; font-size:16px; font-weight:800; cursor:pointer; box-shadow:0 4px 14px rgba(16,185,129,0.3); }
.btn-simpan-ob:hover:not(:disabled) { transform:translateY(-2px); }
.btn-simpan-ob:disabled { opacity:0.5; cursor:not-allowed; }

.akun-option { display:flex; flex-direction:column; padding:4px 0; }
.akun-code { font-size:11px; color:#64748b; font-weight:600; }
.akun-name { font-size:13px; color:#1e293b; }

.vue-select-akun :deep(.vs__dropdown-toggle) { border:2px solid #e5e7eb; border-radius:8px; min-height:40px; }
.vue-select-akun.vs--open :deep(.vs__dropdown-toggle) { border-color:#10b981; }
</style>