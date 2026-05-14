<template>
  <DashboardLayout>
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge">🔍</div>
          <div>
            <h1 class="page-title">Detail Purchase Request</h1>
            <p class="page-subtitle">{{ pr?.pr_number }}</p>
          </div>
        </div>
        <router-link :to="{ name: 'PurchaseRequestIndex' }" class="btn-back">← Kembali</router-link>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat data...</p>
    </div>

    <template v-else-if="pr">
      <!-- INFO PR -->
      <div class="content-card">
        <div class="card-header">
          <span class="card-icon">📋</span>
          <div>
            <h2 class="card-title">Informasi PR</h2>
          </div>
          <span :class="['status-badge', `status-${pr.status}`]" style="margin-left: auto">
            {{ statusLabel(pr.status) }}
          </span>
        </div>
        <div class="card-body">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">No. PR</span>
              <span class="info-value pr-number">{{ pr.pr_number }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Referensi SO</span>
              <span class="info-value">{{ pr.sales_order?.so_number ?? '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Buyer</span>
              <span class="info-value">{{ pr.sales_order?.buyer?.name ?? '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Dibuat Oleh</span>
              <span class="info-value">{{ pr.requested_by?.name ?? '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Deadline</span>
              <span :class="['info-value', isOverdue(pr.deadline) && pr.status !== 'completed' ? 'text-red' : '']">
                {{ formatDate(pr.deadline) }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Catatan</span>
              <span class="info-value">{{ pr.notes ?? '-' }}</span>
            </div>
          </div>
        </div>

        <!-- ACTION BUTTONS -->
        <div class="card-actions">
          <button
            v-if="pr.status === 'draft'"
            @click="submitPR"
            class="btn-submit-pr"
            :disabled="isProcessing"
          >
            📤 Submit ke Pembelian
          </button>
          <button
            v-if="pr.status === 'draft'"
            @click="cancelPR"
            class="btn-cancel-pr"
            :disabled="isProcessing"
          >
            ❌ Batalkan PR
          </button>
          <button
            v-if="pr.status === 'submitted'"
            @click="showConvertModal = true"
            class="btn-convert"
          >
            🛒 Convert ke PO
          </button>
        </div>
      </div>

      <!-- DETAIL ITEMS -->
      <div class="content-card">
        <div class="card-header">
          <span class="card-icon">📦</span>
          <div>
            <h2 class="card-title">Item yang Diminta</h2>
            <p class="card-subtitle">{{ pr.details?.length }} item</p>
          </div>
        </div>
        <div class="table-wrapper">
          <table class="detail-table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Item</th>
                <th>Qty Diminta</th>
                <th>Qty Disetujui</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="detail in pr.details" :key="detail.id" class="data-row">
                <td><span class="code-badge">{{ detail.item?.code }}</span></td>
                <td>{{ detail.item?.name }}</td>
                <td><strong>{{ detail.qty_requested }} {{ detail.item?.unit?.name }}</strong></td>
                <td>
                  <span v-if="detail.qty_approved" class="qty-approved">{{ detail.qty_approved }}</span>
                  <span v-else class="text-gray">Belum disetujui</span>
                </td>
                <td>{{ detail.notes ?? '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- MODAL CONVERT TO PO -->
    <div v-if="showConvertModal" class="modal-overlay" @click.self="showConvertModal = false">
      <div class="modal-container">
        <div class="modal-header">
          <h3>🛒 Convert PR ke PO</h3>
          <button @click="showConvertModal = false" class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Supplier <span class="req">*</span></label>
            <vue-select
              v-model="convertForm.supplier_id"
              :options="daftarSupplier"
              :reduce="s => s.id"
              label="name"
              placeholder="Pilih Supplier"
              class="vue-select-supplier"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Tanggal Order <span class="req">*</span></label>
            <input v-model="convertForm.order_date" type="date" class="form-control" />
          </div>
          <div class="form-group">
            <label class="form-label">PPN</label>
            <select v-model.number="convertForm.ppn_percentage" class="form-control">
              <option :value="0">0%</option>
              <option :value="11">11%</option>
              <option :value="12">12%</option>
            </select>
          </div>

          <h4 style="margin: 16px 0 10px; font-size: 14px; color: #374151;">Isi Harga per Item:</h4>
          <table class="detail-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Harga Satuan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(detail, index) in convertForm.details" :key="index">
                <td style="font-size: 13px;">{{ getItemName(detail.item_id) }}</td>
                <td><input v-model.number="detail.quantity" type="number" min="0" class="form-control-sm" /></td>
                <td><input v-model.number="detail.price" type="number" min="0" class="form-control-sm" placeholder="Harga..." /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button @click="showConvertModal = false" class="btn-cancel">Batal</button>
          <button @click="convertToPO" class="btn-convert-confirm" :disabled="isConverting">
            {{ isConverting ? '⏳ Memproses...' : '✅ Buat PO' }}
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../../components/DashboardLayout.vue'
import apiClient from '../../api/axios'
import { useToast } from 'vue-toastification'
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

const route  = useRoute()
const router = useRouter()
const toast  = useToast()

const pr              = ref(null)
const loading         = ref(false)
const isProcessing    = ref(false)
const isConverting    = ref(false)
const showConvertModal = ref(false)
const daftarSupplier  = ref([])

const convertForm = reactive({
  supplier_id:    '',
  order_date:     new Date().toISOString().slice(0, 10),
  ppn_percentage: 12,
  notes:          '',
  details:        [],
})

const fetchPR = async () => {
  loading.value = true
  try {
    const res = await apiClient.get(`/purchase-requests/${route.params.id}`)
    pr.value = res.data.data

    // Siapkan convert form
    convertForm.details = pr.value.details.map(d => ({
      purchase_request_detail_id: d.id,
      item_id:  d.item_id,
      quantity: d.qty_requested,
      price:    0,
    }))
  } catch {
    toast.error('Gagal memuat detail PR')
  } finally {
    loading.value = false
  }
}

const fetchSupplier = async () => {
  try {
    const res = await apiClient.get('/suppliers?all=true')
    console.log('[DEBUG supplier] res.data:', res.data)
    console.log('[DEBUG supplier] res.data.data:', res.data.data)
    daftarSupplier.value = res.data.data
  } catch (err) {
    console.error('[DEBUG supplier] error:', err)
  }
}

const submitPR = async () => {
  if (!confirm('Submit PR ini ke Tim Pembelian?')) return
  isProcessing.value = true
  try {
    await apiClient.post(`/purchase-requests/${route.params.id}/submit`)
    toast.success('PR berhasil disubmit!')
    await fetchPR()
  } catch {
    toast.error('Gagal submit PR')
  } finally {
    isProcessing.value = false
  }
}

const cancelPR = async () => {
  if (!confirm('Batalkan PR ini?')) return
  isProcessing.value = true
  try {
    await apiClient.post(`/purchase-requests/${route.params.id}/cancel`)
    toast.success('PR berhasil dibatalkan')
    await fetchPR()
  } catch {
    toast.error('Gagal membatalkan PR')
  } finally {
    isProcessing.value = false
  }
}

const convertToPO = async () => {
  if (!convertForm.supplier_id) { toast.error('Pilih supplier!'); return }
  if (!convertForm.order_date)  { toast.error('Isi tanggal order!'); return }
  if (convertForm.details.some(d => !d.price)) { toast.error('Semua harga harus diisi!'); return }

  isConverting.value = true
  try {
    const res = await apiClient.post(`/purchase-requests/${route.params.id}/convert-to-po`, convertForm)
    toast.success(res.data.message)
    showConvertModal.value = false
    router.push({ name: 'PurchaseRequestIndex' })
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal convert ke PO')
  } finally {
    isConverting.value = false
  }
}

const getItemName = (itemId) => {
  const detail = pr.value?.details?.find(d => d.item_id === itemId)
  return detail?.item ? `${detail.item.code} — ${detail.item.name}` : '-'
}

const statusLabel = (status) => {
  const map = { draft: '📝 Draft', submitted: '📤 Submitted', in_progress: '⚙️ In Progress', completed: '✅ Completed', cancelled: '❌ Cancelled' }
  return map[status] ?? status
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const isOverdue = (deadline) => deadline && new Date(deadline) < new Date()

onMounted(async () => {
  await fetchPR()
  await fetchSupplier()
})
</script>

<style scoped>
.page-header { background: linear-gradient(135deg, #0369a1, #0284c7); padding: 28px 32px; border-radius: 16px; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(3,105,161,0.25); }
.header-content { display: flex; justify-content: space-between; align-items: center; color: white; gap: 20px; flex-wrap: wrap; }
.header-left { display: flex; align-items: center; gap: 16px; }
.icon-badge { width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
.page-title { font-size: 24px; font-weight: 800; margin: 0 0 4px; }
.page-subtitle { font-size: 13px; opacity: 0.9; margin: 0; }
.btn-back { background: white; color: #0369a1; padding: 10px 18px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 14px; }

.loading-state { padding: 80px; text-align: center; color: #6b7280; }
.spinner { width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #0369a1; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
@keyframes spin { to { transform: rotate(360deg); } }

.content-card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 20px; overflow: hidden; }
.card-header { display: flex; align-items: center; gap: 14px; padding: 20px 24px; background: #f8fafc; border-bottom: 2px solid #e5e7eb; }
.card-icon { font-size: 24px; }
.card-title { font-size: 16px; font-weight: 800; color: #111827; margin: 0 0 3px; }
.card-subtitle { font-size: 12px; color: #6b7280; margin: 0; }
.card-body { padding: 24px; }
.card-actions { display: flex; gap: 12px; padding: 16px 24px; border-top: 1px solid #f1f5f9; background: #fafafa; }

.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.info-item { display: flex; flex-direction: column; gap: 4px; }
.info-label { font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; }
.info-value { font-size: 14px; font-weight: 600; color: #111827; }
.pr-number { color: #0369a1; font-family: monospace; font-size: 16px; }
.text-red { color: #dc2626; }
.text-gray { color: #9ca3af; }

.status-badge { padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 700; }
.status-draft       { background: #f3f4f6; color: #374151; }
.status-submitted   { background: #dbeafe; color: #1e40af; }
.status-in_progress { background: #fef3c7; color: #92400e; }
.status-completed   { background: #d1fae5; color: #065f46; }
.status-cancelled   { background: #fee2e2; color: #991b1b; }

.btn-submit-pr { padding: 10px 20px; background: #0369a1; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
.btn-submit-pr:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-cancel-pr { padding: 10px 20px; background: #fee2e2; color: #dc2626; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
.btn-convert { padding: 10px 20px; background: linear-gradient(135deg, #059669, #047857); color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }

.table-wrapper { overflow-x: auto; }
.detail-table { width: 100%; border-collapse: collapse; min-width: 500px; }
.detail-table thead { background: #1e293b; }
.detail-table th { padding: 12px 16px; text-align: left; color: white; font-size: 12px; font-weight: 700; text-transform: uppercase; }
.detail-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
.data-row:hover { background: #f0f9ff; }
.code-badge { background: #dbeafe; color: #1e40af; padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; font-family: monospace; }
.qty-approved { background: #d1fae5; color: #065f46; padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
.modal-container { background: white; border-radius: 14px; width: 90%; max-width: 620px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; background: linear-gradient(135deg, #059669, #047857); color: white; position: sticky; top: 0; }
.modal-header h3 { margin: 0; font-size: 18px; font-weight: 800; }
.modal-close { background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.modal-body { padding: 24px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; position: sticky; bottom: 0; }

.form-group { margin-bottom: 16px; }
.form-label { display: block; font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 6px; }
.req { color: #ef4444; }
.form-control { width: 100%; padding: 10px 14px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-family: inherit; box-sizing: border-box; }
.form-control:focus { outline: none; border-color: #059669; }
.form-control-sm { width: 100%; padding: 8px 10px; border: 1.5px solid #e5e7eb; border-radius: 6px; font-size: 13px; font-family: inherit; }

.btn-cancel { padding: 10px 20px; background: #e5e7eb; color: #374151; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
.btn-convert-confirm { padding: 10px 24px; background: linear-gradient(135deg, #059669, #047857); color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
.btn-convert-confirm:disabled { opacity: 0.6; cursor: not-allowed; }

/* Vue Select Styling */
.vue-select-supplier :deep(.vs__dropdown-toggle) {
  padding: 4px 8px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  min-height: 42px;
  font-size: 14px;
}
.vue-select-supplier.vs--open :deep(.vs__dropdown-toggle) {
  border-color: #059669;
}
.vue-select-supplier :deep(.vs__selected) {
  font-weight: 600;
  color: #111827;
}
.vue-select-supplier :deep(.vs__search::placeholder) {
  color: #9ca3af;
}
</style>