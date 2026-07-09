<template>
  <DashboardLayout>
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left-section">
          <div class="icon-badge">📦</div>
          <div>
            <h1 class="page-title">Penerimaan Barang</h1>
            <p class="page-subtitle">Form penerimaan barang dari Purchase Order</p>
          </div>
        </div>
        <button type="button" @click="goBackToList()" class="btn-back">
          <span class="btn-icon">←</span>
          <span>Kembali ke Daftar</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p class="loading-text">Memuat data PO...</p>
    </div>

    <!-- Form Content -->
    <form v-else @submit.prevent="submitForm">
      <!-- Informasi PO Card -->
      <div class="content-card">
        <div class="card-header-section">
          <div class="section-icon-wrapper">
            <div class="section-icon">ℹ️</div>
          </div>
          <div class="section-header-text">
            <h2 class="section-title">Informasi PO</h2>
            <p class="section-subtitle">Data purchase order yang akan diterima</p>
          </div>
        </div>

        <div class="card-body">
          <div class="grid-layout">
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">🔖</span>
                <span>Nomor PO</span>
              </label>
              <input
                type="text"
                :value="po?.po_number"
                readonly
                class="form-control readonly"
                placeholder="Memuat nomor PO..."
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">🏭</span>
                <span>Supplier</span>
              </label>
              <input
                type="text"
                :value="po?.supplier?.name"
                readonly
                class="form-control readonly"
                placeholder="Memuat nama supplier..."
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Penerimaan Card -->
      <div class="content-card">
        <div class="card-header-section">
          <div class="section-icon-wrapper">
            <div class="section-icon">📝</div>
          </div>
          <div class="section-header-text">
            <h2 class="section-title">Detail Penerimaan</h2>
            <p class="section-subtitle">Isi informasi dan jumlah barang yang diterima</p>
          </div>
        </div>

        <div class="card-body">
          <div class="grid-layout">
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">📅</span>
                <span>Tanggal Penerimaan</span>
                <span class="required">*</span>
              </label>
              <input type="date" v-model="form.receipt_date" required class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">#️⃣</span>
                <span>No. Surat Jalan Supplier</span>
              </label>
              <input
                type="text"
                v-model="form.supplier_document_number"
                class="form-control"
                placeholder="Contoh: SJ/2025/123"
              />
            </div>
          </div>
        </div>

        <!-- Table Barang -->
        <div class="table-section">
          <div class="table-header">
            <div class="table-title">
              <span class="table-icon">📋</span>
              <span>Daftar Barang yang Diterima</span>
            </div>
            <div class="table-badge">{{ form.details.length }} item</div>
          </div>

          <div class="table-container">
            <div class="table-wrapper">
              <table class="detail-table">
                <thead>
                  <tr>
                    <th class="th-no"><div class="th-content"><span>#</span></div></th>
                    <th class="th-item"><div class="th-content"><span class="th-icon">📦</span><span>Nama Barang</span></div></th>
                    <th class="th-ordered"><div class="th-content"><span>Dipesan</span></div></th>
                    <th class="th-already"><div class="th-content"><span>Sudah Diterima</span></div></th>
                    <th class="th-remaining"><div class="th-content"><span>Sisa</span></div></th>
                    <th v-if="isKayu" class="th-grade"><div class="th-content"><span>Grade</span></div></th>
                    <th class="th-received"><div class="th-content"><span class="th-icon">✅</span><span>Terima Sekarang</span></div></th>
                    <th v-if="isKayu" class="th-price"><div class="th-content"><span class="th-icon">💰</span><span>Harga Satuan</span></div></th>
                    <th v-if="isKayu" class="th-subtotal"><div class="th-content"><span>Subtotal</span></div></th>
                    <th v-if="isKayu" class="th-aksi"><div class="th-content"><span>Aksi</span></div></th>
                  </tr>
                </thead>

                <!-- KAYU RST: multi-row per item (satu baris per grade) -->
                <tbody v-if="isKayu">
                  <template v-for="(item, idx) in form.details" :key="'kayu-' + item.item_id">
                    <tr
                      v-for="(gr, gi) in item.grade_rows"
                      :key="`k-${item.item_id}-${gi}`"
                      class="data-row"
                    >
                      <td v-if="gi === 0" :rowspan="item.grade_rows.length" class="td-no td-rowspan">
                        <span class="row-number">{{ idx + 1 }}</span>
                      </td>
                      <td v-if="gi === 0" :rowspan="item.grade_rows.length" class="td-item td-rowspan">
                        <div class="item-info">
                          <span class="item-name">{{ item.item_name }}</span>
                          <span class="item-unit">{{ item.item_unit }}</span>
                        </div>
                      </td>
                      <td v-if="gi === 0" :rowspan="item.grade_rows.length" class="td-ordered td-rowspan">
                        <span class="qty-badge">{{ item.quantity_ordered }}</span>
                      </td>
                      <td v-if="gi === 0" :rowspan="item.grade_rows.length" class="td-already td-rowspan">
                        <span class="qty-badge qty-already">{{ item.quantity_received_total }}</span>
                      </td>
                      <td v-if="gi === 0" :rowspan="item.grade_rows.length" class="td-remaining td-rowspan">
                        <span class="qty-badge" :class="item.quantity_remaining === 0 ? 'qty-done' : 'qty-remaining'">
                          {{ item.quantity_remaining }}
                        </span>
                      </td>
                      <td class="td-grade">
                        <input
                          type="text"
                          v-model="gr.grade"
                          list="grade-datalist"
                          class="qty-input grade-input"
                          placeholder="A / B / C ..."
                        />
                      </td>
                      <td class="td-received">
                        <input
                          type="number"
                          v-model="gr.quantity_received"
                          class="qty-input"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td class="td-price">
                        <div class="input-price-wrapper">
                          <span class="price-prefix">Rp</span>
                          <input
                            type="number"
                            v-model.number="gr.price"
                            class="qty-input price-input"
                            min="0"
                            step="any"
                            placeholder="0"
                          />
                        </div>
                      </td>
                      <td class="td-subtotal">
                        <span class="subtotal-value">{{ formatRupiah((gr.quantity_received || 0) * (gr.price || 0)) }}</span>
                      </td>
                      <td class="td-aksi">
                        <button type="button" class="btn-grade-add" @click="addGradeRow(idx)" title="Tambah baris grade">＋</button>
                        <button
                          v-if="item.grade_rows.length > 1"
                          type="button"
                          class="btn-grade-remove"
                          @click="removeGradeRow(idx, gi)"
                          title="Hapus baris ini"
                        >－</button>
                      </td>
                    </tr>
                  </template>
                </tbody>

                <!-- NON-KAYU: satu baris per item -->
                <tbody v-else>
                  <tr v-if="form.details.length === 0" class="empty-row">
                    <td colspan="6">Tidak ada item</td>
                  </tr>
                  <tr
                    v-for="(item, index) in form.details"
                    :key="item.item_id"
                    class="data-row"
                    :class="{ 'row-complete': item.quantity_remaining === 0 }"
                  >
                    <td class="td-no"><span class="row-number">{{ index + 1 }}</span></td>
                    <td class="td-item">
                      <div class="item-info">
                        <span class="item-name">{{ item.item_name }}</span>
                        <span class="item-unit">{{ item.item_unit }}</span>
                      </div>
                    </td>
                    <td class="td-ordered"><span class="qty-badge">{{ item.quantity_ordered }}</span></td>
                    <td class="td-already"><span class="qty-badge qty-already">{{ item.quantity_received_total }}</span></td>
                    <td class="td-remaining">
                      <span class="qty-badge" :class="item.quantity_remaining === 0 ? 'qty-done' : 'qty-remaining'">
                        {{ item.quantity_remaining }}
                      </span>
                    </td>
                    <td class="td-received">
                      <input
                        v-if="item.quantity_remaining > 0"
                        type="number"
                        v-model="item.quantity_received"
                        class="qty-input"
                        min="0"
                        :max="item.quantity_remaining"
                        step="0.01"
                      />
                      <span v-else class="done-label">Lunas ✓</span>
                    </td>
                  </tr>
                </tbody>

              </table>
              <!-- datalist untuk grade suggestions (di luar table agar valid HTML) -->
              <datalist id="grade-datalist">
                <option value="A" />
                <option value="B" />
                <option value="C" />
                <option value="Sortasi" />
              </datalist>
            </div>
          </div>
        </div>

        <!-- Catatan -->
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">📄</span>
              <span>Catatan (Opsional)</span>
            </label>
            <textarea
              v-model="form.notes"
              rows="3"
              class="form-control"
              placeholder="Contoh: Barang diterima dalam kondisi baik, sesuai PO..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="cancel" class="btn-cancel">
          <span class="btn-icon">❌</span>
          <span>Batalkan</span>
        </button>
        <button type="submit" class="btn-submit" :disabled="isSaving">
          <span class="btn-icon">{{ isSaving ? '⏳' : '💾' }}</span>
          <span>{{ isSaving ? 'Menyimpan...' : 'Simpan Penerimaan' }}</span>
        </button>
      </div>
    </form>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import apiClient from '@/api/axios'
import DashboardLayout from '@/components/DashboardLayout.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// Kalau dibuka dengan ?returnTo=... (mis. dari Pembelian Operasional yang lagi di halaman
// pagination tertentu), kembali persis ke URL itu — lebih pasti daripada router.back() yang
// gampang meleset kalau history stack-nya beda dari yang diasumsikan (lewat Detail dulu, dst).
const goBackToList = () => {
  if (route.query.returnTo) {
    router.push(route.query.returnTo)
  } else {
    router.back()
  }
}

const loading = ref(true)
const isSaving = ref(false)
const error = ref(null)
const po = ref({})

const isKayu = computed(() => po.value?.type === 'kayu')

const form = ref({
  purchase_order_id: null,
  receipt_date: new Date().toISOString().slice(0, 10),
  supplier_document_number: '',
  notes: '',
  details: [],
})

onMounted(async () => {
  const po_id = route.params.po_id
  form.value.purchase_order_id = po_id

  try {
    const response = await apiClient.get(`/purchase-orders/${po_id}`)
    po.value = response.data.data

    form.value.details = po.value.details.map((detail) => {
      const ordered         = parseFloat(detail.quantity_ordered)
      const alreadyReceived = parseFloat(detail.quantity_received_total ?? 0)
      const remaining       = Math.max(0, ordered - alreadyReceived)
      if (isKayu.value) {
        return {
          item_id:                 detail.item_id,
          item_name:               detail.item.name,
          item_unit:               detail.item.unit.name,
          quantity_ordered:        ordered,
          quantity_received_total: alreadyReceived,
          quantity_remaining:      remaining,
          // Grade rows: each row = { grade, quantity_received, price }
          grade_rows: [{ grade: '', quantity_received: 0, price: null }],
        }
      }
      return {
        item_id:                 detail.item_id,
        item_name:               detail.item.name,
        item_unit:               detail.item.unit.name,
        quantity_ordered:        ordered,
        quantity_received_total: alreadyReceived,
        quantity_remaining:      remaining,
        quantity_received:       remaining,
        price:                   null,
      }
    })
  } catch (err) {
    error.value = 'Gagal memuat data Pesanan Pembelian.'
    toast.error(error.value)
    console.error(err)
  } finally {
    loading.value = false
  }
})

const addGradeRow = (itemIdx) => {
  form.value.details[itemIdx].grade_rows.push({ grade: '', quantity_received: 0, price: null })
}

const removeGradeRow = (itemIdx, gradeIdx) => {
  form.value.details[itemIdx].grade_rows.splice(gradeIdx, 1)
}

const submitForm = async () => {
  const details = form.value.details
  let detailsPayload = []

  if (isKayu.value) {
    // Validasi dan flatten grade_rows
    for (const item of details) {
      for (const gr of item.grade_rows) {
        const qty = parseFloat(gr.quantity_received) || 0
        if (qty > 0) {
          if (gr.price === null || gr.price === '' || parseFloat(gr.price) < 0) {
            toast.error(`Harga satuan untuk "${item.item_name}" Grade "${gr.grade || '-'}" harus diisi.`)
            return
          }
          detailsPayload.push({
            item_id:           item.item_id,
            quantity_received: qty,
            price:             gr.price,
            grade:             gr.grade || null,
          })
        }
      }
    }
    if (detailsPayload.length === 0) {
      toast.error('Masukkan jumlah penerimaan untuk minimal 1 baris grade.')
      return
    }
  } else {
    // Non-kayu: qty tidak boleh melebihi sisa
    for (const item of details) {
      if (parseFloat(item.quantity_received) > item.quantity_remaining) {
        toast.error(`Jumlah terima "${item.item_name}" melebihi sisa (${item.quantity_remaining}).`)
        return
      }
    }
    const hasAny = details.some(d => parseFloat(d.quantity_received) > 0)
    if (!hasAny) {
      toast.error('Masukkan jumlah penerimaan untuk minimal 1 item.')
      return
    }
    detailsPayload = details.map(d => ({
      item_id:           d.item_id,
      quantity_received: d.quantity_received,
      price:             null,
      grade:             null,
    }))
  }

  isSaving.value = true
  try {
    const payload = {
      purchase_order_id:        form.value.purchase_order_id,
      receipt_date:             form.value.receipt_date,
      supplier_document_number: form.value.supplier_document_number,
      notes:                    form.value.notes,
      details:                  detailsPayload,
    }
    await apiClient.post('/goods-receipts', payload)
    toast.success('Penerimaan barang berhasil disimpan & stok diperbarui!')
    goBackToList()
  } catch (err) {
    toast.error('Gagal menyimpan penerimaan barang.')
    console.error(err)
  } finally {
    isSaving.value = false
  }
}

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0)

const cancel = () => {
  goBackToList()
}
</script>

<style scoped>
/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
  background: white;
  border-radius: 16px;
  padding: 60px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #d1fae5;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 16px;
  color: #64748b;
  font-weight: 600;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
  padding: 32px 36px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.2), transparent);
  pointer-events: none;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  gap: 24px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.header-left-section {
  display: flex;
  align-items: center;
  gap: 18px;
}

.icon-badge {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 6px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.page-subtitle {
  font-size: 14px;
  opacity: 0.95;
  margin: 0;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  color: #10b981;
  text-decoration: none;
  padding: 12px 22px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.btn-icon {
  font-size: 18px;
}

/* Content Card */
.content-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  border: 1px solid #f0f0f0;
}

.card-header-section {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px 32px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 3px solid #e9ecef;
  position: relative;
}

.card-header-section::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 32px;
  width: 70px;
  height: 3px;
  background: linear-gradient(90deg, #10b981, #3b82f6);
  border-radius: 3px 3px 0 0;
}

.section-icon {
  font-size: 36px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  border: 2px solid #6ee7b7;
}

.section-title {
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.section-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.card-body {
  padding: 28px 32px;
}

/* Form */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.form-group {
  margin-bottom: 0;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-weight: 700;
  color: #1e293b;
  font-size: 14px;
}

.label-icon {
  font-size: 16px;
}

.required {
  color: #ef4444;
  font-weight: 800;
}

.form-control {
  width: 100%;
  padding: 13px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: white;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12);
}

.form-control.readonly {
  background: #f8f9fa;
  color: #64748b;
  cursor: not-allowed;
  font-weight: 600;
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
  line-height: 1.6;
}

/* Table Section */
.table-section {
  margin-top: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-bottom: 2px solid #86efac;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 16px;
  color: #065f46;
}

.table-icon {
  font-size: 20px;
}

.table-badge {
  padding: 6px 14px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-size: 12px;
  font-weight: 700;
  border-radius: 20px;
}

.table-container {
  padding: 24px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
  background: white;
}

.detail-table thead {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
}

.detail-table th {
  padding: 18px 16px;
  text-align: left;
  color: white;
  font-weight: 800;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.th-icon {
  font-size: 16px;
}

.th-no {
  width: 5%;
  text-align: center;
}

.th-item {
  width: 30%;
}

.th-ordered {
  width: 12%;
  text-align: center;
}

.th-already {
  width: 14%;
  text-align: center;
}

.th-remaining {
  width: 12%;
  text-align: center;
}

.th-received {
  width: 17%;
  text-align: center;
}

.data-row {
  transition: all 0.2s ease;
  border-bottom: 2px solid #f1f5f9;
}

.data-row:hover {
  background: #f0fdf4;
}

.detail-table td {
  padding: 16px;
  vertical-align: middle;
}

.td-no {
  text-align: center;
}

.row-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  font-weight: 800;
  font-size: 14px;
  border-radius: 8px;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}

.item-unit {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.td-ordered {
  text-align: center;
}

.qty-badge {
  display: inline-flex;
  padding: 8px 16px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: #4338ca;
  font-weight: 700;
  font-size: 14px;
  border-radius: 8px;
  border: 2px solid #a5b4fc;
}

.qty-already {
  background: linear-gradient(135deg, #fef9c3, #fef08a);
  color: #854d0e;
  border-color: #fbbf24;
}

.qty-remaining {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #991b1b;
  border-color: #f87171;
}

.qty-done {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #14532d;
  border-color: #4ade80;
}

.done-label {
  color: #16a34a;
  font-weight: 700;
  font-size: 14px;
}

.row-complete {
  background: #f0fdf4;
  opacity: 0.75;
}

.td-already,
.td-remaining {
  text-align: center;
}

.td-received {
  text-align: center;
}

.qty-input {
  width: 100%;
  max-width: 120px;
  padding: 10px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
  background: white;
}

.qty-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.th-price, .th-subtotal { width: 15%; }
.th-grade { width: 10%; text-align: center; }
.th-aksi  { width: 8%;  text-align: center; }
.td-price, .td-subtotal { text-align: right; padding-right: 16px; }
.td-grade { text-align: center; }
.td-aksi  { text-align: center; white-space: nowrap; }

.td-rowspan { vertical-align: middle; }

.input-price-wrapper {
  display: flex; align-items: center; gap: 4px;
}
.price-prefix {
  font-size: 13px; font-weight: 700; color: #64748b; white-space: nowrap;
}
.price-input {
  max-width: 150px; text-align: right;
}
.grade-input {
  max-width: 90px; text-align: center; text-transform: uppercase;
}
.subtotal-value {
  font-size: 14px; font-weight: 700; color: #065f46;
}

.btn-grade-add,
.btn-grade-remove {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px;
  border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 700;
  transition: all 0.2s;
}
.btn-grade-add {
  background: #dcfce7; color: #16a34a; margin-right: 4px;
}
.btn-grade-add:hover { background: #bbf7d0; }
.btn-grade-remove {
  background: #fee2e2; color: #dc2626;
}
.btn-grade-remove:hover { background: #fecaca; }

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-radius: 12px;
  border: 2px solid #e9ecef;
}

.btn-cancel,
.btn-submit {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-cancel {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  color: #475569;
  border: 2px solid #cbd5e1;
}

.btn-cancel:hover {
  background: linear-gradient(135deg, #e9ecef, #dee2e6);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-submit {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    padding: 24px 20px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-back {
    width: 100%;
    justify-content: center;
  }

  .grid-layout {
    grid-template-columns: 1fr;
  }

  .card-body {
    padding: 20px;
  }

  .table-container {
    padding: 16px;
  }

  .form-actions {
    flex-direction: column;
    padding: 20px;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
    justify-content: center;
  }
}
</style>
