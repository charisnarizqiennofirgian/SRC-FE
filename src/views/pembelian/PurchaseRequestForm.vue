<template>
  <DashboardLayout>
    <!-- PAGE HEADER -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge">{{ isEditMode ? '✏️' : '➕' }}</div>
          <div>
            <h1 class="page-title">{{ isEditMode ? 'Edit' : 'Buat' }} Purchase Request</h1>
            <p class="page-subtitle">Permintaan pembelian barang ke Tim Pembelian</p>
          </div>
        </div>
        <router-link :to="{ name: 'PurchaseRequestIndex' }" class="btn-back">← Kembali</router-link>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p class="loading-text">Memuat data...</p>
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <!-- INFO UMUM -->
      <div class="content-card">
        <div class="card-head">
          <div class="card-head-icon">📅</div>
          <div>
            <h2 class="card-title">Informasi Umum</h2>
            <p class="card-subtitle">Pilih SO referensi dan deadline pengiriman</p>
          </div>
        </div>
        <div class="card-body">
          <div class="info-grid">
            <div class="form-group">
              <label class="form-label">Referensi SO <span class="hint">(opsional)</span></label>
              <select v-model="form.so_id" class="form-control">
                <option value="">Tanpa referensi SO</option>
                <option v-for="so in daftarSO" :key="so.id" :value="so.id">
                  {{ so.so_number }} — {{ so.buyer?.name ?? '-' }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Deadline <span class="req">*</span></label>
              <input v-model="form.deadline" type="date" class="form-control" required />
            </div>
            <div class="form-group full-width">
              <label class="form-label">Catatan</label>
              <textarea
                v-model="form.notes"
                class="form-control"
                rows="3"
                placeholder="Catatan untuk tim pembelian..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- DETAIL ITEM -->
      <div class="content-card card-overflow-visible">
        <div class="card-head">
          <div class="card-head-icon">📦</div>
          <div>
            <h2 class="card-title">Item yang Diminta</h2>
            <p class="card-subtitle">
              Cari dan pilih item yang ingin dipesan
              <span v-if="loadingItem" class="loading-hint">— memuat...</span>
            </p>
          </div>
        </div>
        <div class="card-body-table">
          <table class="detail-table">
            <thead>
              <tr>
                <th class="th-no">#</th>
                <th class="th-item">Item / Barang</th>
                <th class="th-qty">Qty Diminta</th>
                <th class="th-note">Catatan Item</th>
                <th class="th-aksi">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(detail, index) in form.details" :key="detail._uid" class="data-row">
                <td class="td-no">{{ index + 1 }}</td>
                <td class="td-item">
                  <ItemSelectChoices v-model="detail.item_id" :category-ids="targetCategoryIds" :initial-item="detail.item" />
                </td>
                <td class="td-qty">
                  <input
                    v-model.number="detail.qty_requested"
                    type="number"
                    min="0.001"
                    step="any"
                    class="form-control-sm"
                    placeholder="0"
                    required
                  />
                </td>
                <td class="td-note">
                  <input
                    v-model="detail.notes"
                    type="text"
                    class="form-control-sm"
                    placeholder="Keterangan..."
                  />
                </td>
                <td class="td-aksi">
                  <button
                    type="button"
                    class="btn-remove"
                    @click="removeDetail(index)"
                    :disabled="form.details.length === 1"
                  >🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="table-footer">
            <button type="button" class="btn-add-row" @click="addDetail">
              ➕ Tambah Item
            </button>
          </div>
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="$router.back()">Batal</button>
        <button type="submit" class="btn-save" :disabled="isSaving">
          {{ isSaving ? '⏳ Menyimpan...' : '💾 Simpan Draft' }}
        </button>
        <button
          v-if="!isEditMode"
          type="button"
          class="btn-submit-pr"
          :disabled="isSaving"
          @click="handleSubmitAndSend"
        >
          {{ isSaving ? '⏳...' : '📤 Simpan & Submit ke Pembelian' }}
        </button>
      </div>
    </form>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '../../components/DashboardLayout.vue'
import ItemSelectChoices from '../../components/ItemSelectChoices.vue'
import apiClient from '../../api/axios'
import { useToast } from 'vue-toastification'

const router  = useRouter()
const route   = useRoute()
const toast   = useToast()

const isEditMode  = computed(() => !!route.params.id)
const loading     = ref(false)
const loadingItem = ref(false)
const isSaving    = ref(false)
const daftarSO    = ref([])

let uidCounter = 0
const newUid = () => ++uidCounter

const form = reactive({
  so_id:    '',
  deadline: '',
  notes:    '',
  details:  [],
})

// ── DETAIL ROWS ──────────────────────────────────────────────────────────────

const addDetail = () => {
  form.details.push({ _uid: newUid(), item_id: '', qty_requested: 1, notes: '' })
}

const removeDetail = (index) => {
  if (form.details.length <= 1) return
  form.details.splice(index, 1)
}

// ── SAVE ─────────────────────────────────────────────────────────────────────

const savePR = async (autoSubmit = false) => {
  isSaving.value = true
  try {
    const payload = {
      so_id:    form.so_id || null,
      deadline: form.deadline,
      notes:    form.notes,
      // Filter hanya baris yang sudah dipilih itemnya
      details:  form.details
        .filter(d => d.item_id && d.qty_requested > 0)
        .map(({ item_id, qty_requested, notes }) => ({
          item_id, qty_requested, notes,
        })),
    }

    if (payload.details.length === 0) {
      toast.error('Minimal 1 item harus dipilih!')
      isSaving.value = false
      return
    }

    let pr
    if (isEditMode.value) {
      const res = await apiClient.put(`/purchase-requests/${route.params.id}`, payload)
      pr = res.data.data
      toast.success('PR berhasil diperbarui!')
    } else {
      const res = await apiClient.post('/purchase-requests', payload)
      pr = res.data.data
      toast.success(`PR ${pr?.pr_number ?? ''} berhasil dibuat!`)
    }

    if (autoSubmit && pr?.id) {
      await apiClient.post(`/purchase-requests/${pr.id}/submit`)
      toast.success('PR berhasil disubmit ke Tim Pembelian!')
    }

    router.push({ name: 'PurchaseRequestIndex' })
  } catch (error) {
    const errData = error.response?.data
    const msg = errData?.errors
      ? Object.values(errData.errors).flat().join(', ')
      : errData?.message || 'Gagal menyimpan PR'
    toast.error(msg)
  } finally {
    isSaving.value = false
  }
}

const handleSubmit        = () => savePR(false)
const handleSubmitAndSend = () => savePR(true)

// ── FETCH ────────────────────────────────────────────────────────────────────

const fetchSO = async () => {
  try {
    const res = await apiClient.get('/sales-orders', { params: { all: true }, timeout: 6000 })
    const data = res.data.data || []
    // Filter null/undefined
    daftarSO.value = data.filter(so => so && so.id)
  } catch { /* opsional */ }
}

const targetCategoryIds = ref([])

const fetchItems = async () => {
  loadingItem.value = true
  try {
    const res = await apiClient.get('/categories', { params: { all: true }, timeout: 6000 })
    const categories = res.data?.data || []

    targetCategoryIds.value = categories
      .filter((c) => {
        const n = (c.name || '').toLowerCase().trim()
        return n === 'bahan operasional' || n === 'bahan penolong' || n === 'karton box'
      })
      .map((c) => c.id)
  } finally {
    loadingItem.value = false
  }
}

const fetchPR = async () => {
  if (!isEditMode.value) return
  try {
    const res = await apiClient.get(`/purchase-requests/${route.params.id}`)
    const pr  = res.data.data
    form.so_id    = pr.so_id    ?? ''
    form.deadline = pr.deadline?.slice(0, 10) ?? ''
    form.notes    = pr.notes    ?? ''
    ;(pr.details || []).forEach((d) => {
      form.details.push({ _uid: newUid(), item_id: d.item_id, item: d.item, qty_requested: d.qty_requested, notes: d.notes ?? '' })
    })
    if (form.details.length === 0) form.details.push({ _uid: newUid(), item_id: '', qty_requested: 1, notes: '' })
  } catch {
    toast.error('Gagal memuat data PR')
  }
}

onMounted(async () => {
  if (isEditMode.value) {
    loading.value = true
    try {
      await Promise.allSettled([fetchSO(), fetchItems(), fetchPR()])
    } finally {
      loading.value = false
    }
  } else {
    form.details.push({ _uid: newUid(), item_id: '', qty_requested: 1, notes: '' })
    Promise.allSettled([fetchSO(), fetchItems()])
  }
})
</script>

<style scoped>
/* ===== HEADER ===== */
.page-header {
  background: linear-gradient(135deg, #0369a1, #0284c7);
  padding: 24px 28px; border-radius: 14px; margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(3,105,161,0.25);
}
.header-content { display:flex; justify-content:space-between; align-items:center; color:white; gap:20px; flex-wrap:wrap; }
.header-left    { display:flex; align-items:center; gap:16px; }
.icon-badge     { width:52px; height:52px; background:rgba(255,255,255,0.2); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:26px; flex-shrink:0; }
.page-title     { font-size:22px; font-weight:800; margin:0 0 2px; }
.page-subtitle  { font-size:13px; opacity:0.85; margin:0; }
.btn-back       { background:white; color:#0369a1; padding:9px 16px; border-radius:8px; font-weight:700; text-decoration:none; font-size:13px; white-space:nowrap; }

/* ===== LOADING ===== */
.loading-container { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:280px; gap:14px; background:white; border-radius:14px; box-shadow:0 2px 12px rgba(0,0,0,0.06); }
.spinner      { width:44px; height:44px; border:4px solid #e5e7eb; border-top-color:#0369a1; border-radius:50%; animation:spin 0.8s linear infinite; }
.loading-text { font-size:14px; color:#6b7280; font-weight:600; }
.loading-hint { color:#9ca3af; font-style:italic; }
@keyframes spin { to { transform:rotate(360deg); } }

/* ===== CARD ===== */
.content-card {
  background:white; border-radius:14px; border:1.5px solid #f3f4f6;
  box-shadow:0 2px 12px rgba(0,0,0,0.06); margin-bottom:20px; overflow:hidden;
}
.card-overflow-visible           { overflow:visible; }
.card-overflow-visible .card-head { border-radius:14px 14px 0 0; }

.card-head     { display:flex; align-items:center; gap:14px; padding:18px 24px; background:#fafafa; border-bottom:1.5px solid #f3f4f6; }
.card-head-icon { width:42px; height:42px; background:#eff6ff; border:1.5px solid #bfdbfe; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
.card-title    { font-size:15px; font-weight:800; color:#111827; margin:0 0 2px; }
.card-subtitle { font-size:12px; color:#6b7280; margin:0; }
.card-body     { padding:24px; }
.card-body-table { padding:20px 24px 24px; }

/* ===== FORM GRID ===== */
.info-grid  { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
.form-group { display:flex; flex-direction:column; gap:6px; }
.form-group.full-width { grid-column:1 / -1; }
.form-label { font-size:13px; font-weight:700; color:#374151; }
.hint       { font-weight:400; color:#9ca3af; font-size:12px; }
.req        { color:#ef4444; }
.form-control { padding:10px 13px; border:1.5px solid #e5e7eb; border-radius:8px; font-size:14px; font-family:inherit; background:white; transition:border-color 0.2s; }
.form-control:focus { outline:none; border-color:#0369a1; box-shadow:0 0 0 3px rgba(3,105,161,0.08); }
textarea.form-control { resize:vertical; min-height:80px; }

/* ===== TABLE ===== */
.detail-table { width:100%; border-collapse:collapse; }
.detail-table thead { background:linear-gradient(135deg,#1e293b 0%,#334155 100%); }
.detail-table th {
  padding:12px 14px; text-align:left; color:white;
  font-size:11px; font-weight:700; text-transform:uppercase;
  letter-spacing:0.5px; white-space:nowrap;
}
.th-no   { width:4%;  text-align:center; }
.th-item { width:46%; }
.th-qty  { width:14%; }
.th-note { width:27%; }
.th-aksi { width:9%;  text-align:center; }

.detail-table td { padding:10px 12px; border-bottom:1px solid #f1f5f9; vertical-align:middle; }
.detail-table tbody tr:last-child td { border-bottom:none; }
.data-row:hover { background:#f0f9ff; }

.td-no   { text-align:center; color:#9ca3af; font-size:12px; font-weight:700; }
.td-item { min-width:220px; }
.td-qty  { min-width:100px; }
.td-note { min-width:130px; }
.td-aksi { text-align:center; min-width:50px; }

/* ===== SMALL INPUTS ===== */
.form-control-sm {
  width:100%; padding:8px 11px; border:1.5px solid #e5e7eb;
  border-radius:8px; font-size:13px; font-family:inherit;
  background:white; box-sizing:border-box; transition:border-color 0.2s;
}
.form-control-sm:focus { outline:none; border-color:#0369a1; box-shadow:0 0 0 3px rgba(3,105,161,0.08); }

/* ===== BUTTONS ===== */
.btn-remove {
  width:32px; height:32px; background:#fee2e2; color:#dc2626;
  border:none; border-radius:8px; cursor:pointer; font-size:14px;
  display:inline-flex; align-items:center; justify-content:center; transition:background 0.15s;
}
.btn-remove:hover:not(:disabled) { background:#fecaca; }
.btn-remove:disabled { opacity:0.35; cursor:not-allowed; }

.table-footer { padding-top:14px; }

.btn-add-row {
  padding:10px 20px; background:#ecfdf5; color:#059669;
  border:1.5px solid #a7f3d0; border-radius:8px;
  font-weight:700; cursor:pointer; font-size:14px;
  transition:all 0.15s; user-select:none;
}
.btn-add-row:hover { background:#d1fae5; border-color:#6ee7b7; }

/* ===== FORM ACTIONS ===== */
.form-actions {
  display:flex; justify-content:flex-end; gap:12px;
  padding:18px 24px; background:white; border-radius:14px;
  border:1.5px solid #f3f4f6; box-shadow:0 2px 12px rgba(0,0,0,0.06);
  flex-wrap:wrap;
}
.btn-cancel     { padding:10px 20px; background:#e5e7eb; color:#374151; border:none; border-radius:8px; font-weight:700; cursor:pointer; font-size:14px; }
.btn-cancel:hover { background:#d1d5db; }
.btn-save       { padding:10px 22px; background:#0369a1; color:white; border:none; border-radius:8px; font-weight:700; cursor:pointer; font-size:14px; }
.btn-save:hover { background:#0284c7; }
.btn-save:disabled { opacity:0.6; cursor:not-allowed; }
.btn-submit-pr  { padding:10px 22px; background:linear-gradient(135deg,#059669,#047857); color:white; border:none; border-radius:8px; font-weight:700; cursor:pointer; font-size:14px; }
.btn-submit-pr:hover   { filter:brightness(1.08); }
.btn-submit-pr:disabled { opacity:0.6; cursor:not-allowed; }

@media (max-width:640px) {
  .info-grid    { grid-template-columns:1fr; }
  .form-actions { flex-direction:column; }
  .btn-cancel, .btn-save, .btn-submit-pr { width:100%; text-align:center; }
}
</style>
