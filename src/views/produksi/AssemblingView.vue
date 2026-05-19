<template>
  <DashboardLayout>
    <!-- HEADER -->
    <div class="page-header-assembling">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-assembling">
            <span class="assembling-icon">🔧</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-assembling">Produksi Assembling</h1>
            <p class="page-subtitle-assembling">
              Sub Assembling & Rakit komponen menjadi produk setengah jadi.
            </p>
          </div>
        </div>
        <div class="header-badge-section">
          <div class="process-badge">
            <span class="process-icon">🔩</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">🔧</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">📦</span>
          </div>
          <div class="flow-label-assembling">Komponen → Assembling → Setengah Jadi</div>
        </div>
      </div>
    </div>

    <div class="content-card-assembling">
      <div class="card-body-assembling">
        <form @submit.prevent="handleSubmit" @keydown.enter.prevent>

          <!-- SECTION 1: INFO UMUM -->
          <div class="form-section-modern">
            <div class="section-header section-header-assembling">
              <div class="section-icon-badge">
                <span class="section-icon">📅</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Informasi Umum</h3>
                <p class="section-subtitle">Tanggal, jenis proses, PO, dan catatan</p>
              </div>
            </div>

            <!-- PILIH JENIS PROSES -->
            <div class="process-type-toggle">
              <button
                type="button"
                :class="['process-type-btn', form.process_type === 'sub_assembling' ? 'active' : '']"
                @click="form.process_type = 'sub_assembling'"
              >
                <span class="process-type-icon">🔩</span>
                <div>
                  <div class="process-type-label">Sub Assembling</div>
                  <div class="process-type-desc">Rangkai sebagian komponen</div>
                </div>
              </button>
              <button
                type="button"
                :class="['process-type-btn', form.process_type === 'rakit' ? 'active' : '']"
                @click="form.process_type = 'rakit'"
              >
                <span class="process-type-icon">🔧</span>
                <div>
                  <div class="process-type-label">Rakit</div>
                  <div class="process-type-desc">Rakit jadi produk setengah jadi</div>
                </div>
              </button>
            </div>

            <div class="form-grid-3col" style="margin-top:1.25rem;">
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Tanggal <span class="required-star">*</span>
                </label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">📅</span>
                  <input v-model="form.date" type="date" class="form-input-modern" required />
                </div>
              </div>

              <div class="form-group-modern">
                <label class="form-label-modern">
                  Production Order <span class="required-star">*</span>
                </label>
                <vue-select
                  v-model="form.ref_po_id"
                  :options="productionOrders"
                  :reduce="(po) => po.id"
                  label="label"
                  placeholder="🔍 Cari PO..."
                  :clearable="true"
                  class="vue-select-po"
                  @option:selected="handlePoChange"
                  @option:deselected="handlePoDeselect"
                />
              </div>

              <div class="form-group-modern">
                <label class="form-label-modern">Catatan</label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">📝</span>
                  <input
                    v-model="form.notes"
                    type="text"
                    class="form-input-modern"
                    placeholder="Catatan proses assembling..."
                  />
                </div>
              </div>
            </div>

            <!-- Info PO -->
            <div v-if="poInfo.buyer_name" class="po-selected-info">
              <span class="po-info-icon">👤</span>
              <div>
                <div class="po-info-buyer">{{ poInfo.buyer_name }}</div>
                <div class="po-info-so">{{ poInfo.so_number }}</div>
              </div>
            </div>

            <!-- Target PO -->
            <div v-if="poTargets.length" class="po-hint-box">
              <div class="po-hint-header">
                <div class="po-hint-title-wrap">
                  <span class="po-hint-icon">📌</span>
                  <div>
                    <div class="po-hint-title">Target Produksi PO</div>
                    <div class="po-hint-sub">{{ poInfo.buyer_name }} • {{ poInfo.so_number }}</div>
                  </div>
                </div>
                <div class="po-hint-badge">{{ poTargets.length }} item</div>
              </div>
              <table class="po-hint-table">
                <thead>
                  <tr><th>Item</th><th>Qty Target</th></tr>
                </thead>
                <tbody>
                  <tr v-for="t in poTargets" :key="t.item_id">
                    <td>
                      <div style="font-weight:600;">{{ t.name }}</div>
                      <div style="font-size:0.78rem;color:#9ca3af;">{{ t.code }}</div>
                    </td>
                    <td>{{ Number(t.qty_planned).toLocaleString('id-ID') }} pcs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- SECTION 2: INPUT KOMPONEN -->
          <div class="form-section-modern">
            <div class="section-header section-header-assembling">
              <div class="section-icon-badge section-badge-input">
                <span class="section-icon">🔩</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Komponen yang Dipakai</h3>
                <p class="section-subtitle">
                  Pilih dari Gudang Mesin, Rustik Komponen, atau Assembling
                  <span v-if="loadingItems" class="loading-inline">⏳ memuat...</span>
                </p>
              </div>
            </div>

            <div v-if="sourceItems.length === 0 && !loadingItems" class="empty-hint">
              📭 Tidak ada stok di Gudang Mesin, Rustik Komponen, maupun Assembling
            </div>

            <template v-else>
              <div
                v-for="(row, index) in form.inputs"
                :key="row.local_id"
                class="item-row-card"
              >
                <div class="item-row-header">
                  <span class="item-row-number">Input #{{ index + 1 }}</span>
                  <button
                    v-if="form.inputs.length > 1"
                    type="button"
                    class="btn-remove-row"
                    @click="removeInput(index)"
                  >✕</button>
                </div>
                <div class="form-grid-2col">
                  <div class="form-group-modern">
                    <label class="form-label-modern">
                      Item Komponen <span class="required-star">*</span>
                    </label>
                    <vue-select
                      v-model="row.key"
                      :options="sourceItemsForSelect"
                      label="label"
                      placeholder="🔍 Pilih komponen..."
                      class="vue-select-item"
                      @option:selected="(opt) => onItemSelected(index, opt)"
                    >
                      <template #option="o">
                        <div class="item-option">
                          <span class="item-option-badge">{{ o.warehouse_code }}</span>
                          <span class="item-option-code">{{ o.item_code }}</span>
                          <span class="item-option-name">{{ o.item_name }}</span>
                          <span v-if="o.nama_produk" class="item-option-produk">📦 {{ o.nama_produk }}</span>
                          <span class="item-option-stock">Stok: {{ o.qty_available }} pcs</span>
                        </div>
                      </template>
                    </vue-select>
                  </div>
                  <div class="form-group-modern">
                    <label class="form-label-modern">
                      Qty (pcs) <span class="required-star">*</span>
                      <span v-if="row.max_qty > 0" class="stock-hint">
                        Tersedia: {{ row.max_qty }} pcs
                      </span>
                    </label>
                    <div class="input-wrapper-icon">
                      <span class="input-icon">🔢</span>
                      <input
                        v-model.number="row.qty"
                        type="number"
                        min="0.01"
                        step="0.01"
                        :max="row.max_qty"
                        class="form-input-modern"
                        placeholder="0"
                      />
                    </div>
                    <p v-if="row.qty > row.max_qty && row.max_qty > 0" class="qty-warning">
                      ⚠️ Melebihi stok tersedia
                    </p>
                  </div>
                </div>
                <!-- Info gudang sumber -->
                <div v-if="row.warehouse_name" class="source-info">
                  📦 Sumber: <strong>{{ row.warehouse_name }}</strong>
                </div>
              </div>

              <button type="button" class="btn-add-row btn-add-input" @click="addInput">
                ➕ Tambah Input Lainnya
              </button>
            </template>
          </div>

          <!-- SECTION 3: OUTPUT -->
          <div class="form-section-modern">
            <div class="section-header section-header-assembling">
              <div class="section-icon-badge section-badge-output">
                <span class="section-icon">📦</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Hasil {{ form.process_type === 'sub_assembling' ? 'Sub Assembling' : 'Rakit' }}</h3>
                <p class="section-subtitle">Hasil → masuk Gudang Assembling</p>
              </div>
            </div>

            <div
              v-for="(row, index) in form.outputs"
              :key="row.local_id"
              class="item-row-card item-row-card--output"
            >
              <div class="item-row-header">
                <span class="item-row-number">Output #{{ index + 1 }}</span>
                <button
                  v-if="!form.ref_po_id && form.outputs.length > 1"
                  type="button"
                  class="btn-remove-row"
                  @click="removeOutput(index)"
                >✕</button>
              </div>

              <div class="form-grid-2col">
                <div class="form-group-modern">
                  <label class="form-label-modern">Item Output</label>
                  <!-- Kalau dari PO: tampilkan nama item read-only -->
                  <div v-if="row.item_name" class="item-readonly-box">
                    <span class="item-readonly-code">{{ row.item_code }}</span>
                    <span class="item-readonly-name">{{ row.item_name }}</span>
                    <span class="item-readonly-badge">🎯 Dari PO</span>
                  </div>
                  <!-- Kalau manual: vue-select -->
                  <vue-select
                    v-else
                    v-model="row.item_id"
                    :options="allItemsForSelect"
                    :reduce="(o) => o.id"
                    label="label"
                    placeholder="🔍 Cari produk jadi..."
                    class="vue-select-item"
                  >
                    <template #option="o">
                      <div class="item-option">
                        <span class="item-option-code">{{ o.code }}</span>
                        <span class="item-option-name">{{ o.name }}</span>
                      </div>
                    </template>
                  </vue-select>
                </div>

                <div class="form-group-modern">
                  <label class="form-label-modern">
                    Qty (pcs) <span class="required-star">*</span>
                  </label>
                  <div class="input-wrapper-icon">
                    <span class="input-icon">🔢</span>
                    <input
                      v-model.number="row.qty"
                      type="number"
                      min="1"
                      class="form-input-modern"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div class="output-dest-hint">
                📦 → Gudang Assembling
              </div>
            </div>

            <button type="button" class="btn-add-row btn-add-output" @click="addOutput">
              ➕ Tambah Output Lainnya
            </button>
          </div>

          <!-- SECTION 4: REJECT -->
          <div class="form-section-modern">
            <div class="section-header section-header-assembling">
              <div class="section-icon-badge section-badge-reject">
                <span class="section-icon">⚠️</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">
                  Reject
                  <span class="optional-tag">Opsional</span>
                </h3>
                <p class="section-subtitle">Catat item reject beserta keterangannya</p>
              </div>
            </div>

            <div v-if="form.rejects.length === 0" class="empty-reject">
              Belum ada reject —
              <button type="button" class="btn-link" @click="addReject">tambah reject</button>
            </div>

            <div
              v-for="(row, index) in form.rejects"
              :key="row.local_id"
              class="item-row-card item-row-card--reject"
            >
              <div class="item-row-header">
                <span class="item-row-number">Reject #{{ index + 1 }}</span>
                <button type="button" class="btn-remove-row" @click="removeReject(index)">✕</button>
              </div>
              <div class="form-grid-3col">
                <div class="form-group-modern">
                  <label class="form-label-modern">Item Reject <span class="required-star">*</span></label>
                  <vue-select
                    v-model="row.item_id"
                    :options="allItemsForSelect"
                    :reduce="(o) => o.id"
                    label="label"
                    placeholder="🔍 Cari item..."
                    class="vue-select-item"
                  />
                </div>
                <div class="form-group-modern">
                  <label class="form-label-modern">Qty Reject <span class="required-star">*</span></label>
                  <div class="input-wrapper-icon">
                    <span class="input-icon">🔢</span>
                    <input
                      v-model.number="row.qty"
                      type="number"
                      min="0.01"
                      step="0.01"
                      class="form-input-modern"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div class="form-group-modern">
                  <label class="form-label-modern">Keterangan</label>
                  <div class="input-wrapper-icon">
                    <span class="input-icon">📝</span>
                    <input
                      v-model="row.keterangan"
                      type="text"
                      class="form-input-modern"
                      placeholder="Contoh: retak, salah ukuran..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              v-if="form.rejects.length > 0"
              type="button"
              class="btn-add-row btn-add-reject"
              @click="addReject"
            >
              ➕ Tambah Reject Lainnya
            </button>
          </div>

          <!-- FORM ACTIONS -->
          <div class="form-actions-modern">
            <button type="button" class="btn-action btn-cancel-modern" @click="router.back()">
              <span class="btn-icon">↩️</span>
              <span class="btn-text">Batal</span>
            </button>
            <button type="submit" class="btn-action btn-submit-modern" :disabled="isSubmitting">
              <span class="btn-icon">💾</span>
              <span class="btn-text">
                {{ isSubmitting ? 'Menyimpan...' : `Simpan ${form.process_type === 'sub_assembling' ? 'Sub Assembling' : 'Rakit'}` }}
              </span>
            </button>
          </div>

        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

const router = useRouter()
const { showSuccess, showError } = useNotification()
const isSubmitting = ref(false)
const loadingItems = ref(false)

const productionOrders = ref([])
const sourceItems      = ref([])
const allItems         = ref([])
const poInfo           = ref({ buyer_name: null, so_number: null })
const poTargets        = ref([])

const form = reactive({
  date:         new Date().toISOString().slice(0, 10),
  process_type: 'sub_assembling',
  ref_po_id:    null,
  notes:        '',
  inputs:  [{ local_id: Date.now(), key: null, item_id: null, warehouse_id: null, qty: null, max_qty: 0, warehouse_name: '' }],
  outputs: [{ local_id: Date.now() + 1, item_id: null, qty: null }],
  rejects: [],
})

// === COMPUTED ===
const sourceItemsForSelect = computed(() =>
  sourceItems.value.map((i) => ({
    key:            `${i.item_id}-${i.warehouse_id}`,
    item_id:        i.item_id,
    item_code:      i.item_code,
    item_name:      i.item_name,
    nama_produk:    i.nama_produk || '',
    qty_available:  i.qty_available,
    warehouse_id:   i.warehouse_id,
    warehouse_code: i.warehouse_code,
    warehouse_name: i.warehouse_name,
    label:          i.nama_produk
      ? `[${i.warehouse_code}] ${i.item_code} - ${i.item_name} (${i.nama_produk})`
      : `[${i.warehouse_code}] ${i.item_code} - ${i.item_name}`,
  }))
)

const allItemsForSelect = computed(() =>
  allItems.value.map((i) => ({
    id:    i.id,
    code:  i.code,
    name:  i.name,
    label: `${i.code} - ${i.name}`,
  }))
)

// === FETCH ===
const fetchInitialData = async () => {
  loadingItems.value = true
  try {
    const [poRes, sourceRes, itemRes] = await Promise.all([
      apiClient.get('/assembling-produksi/available-pos'),
      apiClient.get('/assembling-produksi/source-items'),
      apiClient.get('/stock-report', { params: { categories: 'Produk Jadi', per_page: 9999 } }),
    ])
    productionOrders.value = poRes.data.data     || []
    sourceItems.value      = sourceRes.data.data  || []

    const prodData = itemRes.data.data?.data ?? itemRes.data.data ?? []
    allItems.value = Array.isArray(prodData) ? prodData : []
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil data awal')
  } finally {
    loadingItems.value = false
  }
}

const handlePoChange = async (opt) => {
  poInfo.value    = { buyer_name: null, so_number: null }
  poTargets.value = []
  form.outputs    = [{ local_id: Date.now(), item_id: null, qty: null }]
  if (!opt) return
  try {
    const res  = await apiClient.get(`/production-orders/${opt.id}`)
    const data = res.data.data || {}
    poInfo.value = {
      buyer_name: data.sales_order?.buyer_name || opt.buyer_name || null,
      so_number:  data.sales_order?.so_number  || opt.so_number  || null,
    }
    poTargets.value = data.targets || []

    // Auto-fill output dari detail PO
    if (data.targets?.length > 0) {
      form.outputs = data.targets.map((t, i) => ({
        local_id: Date.now() + i,
        item_id:  t.item_id,
        item_name: t.name,
        item_code: t.code,
        qty:      null, // operator isi sendiri
      }))
    }
  } catch (e) { console.error(e) }
}

const handlePoDeselect = () => {
  poInfo.value    = { buyer_name: null, so_number: null }
  poTargets.value = []
  form.outputs    = [{ local_id: Date.now(), item_id: null, qty: null }]
}

const onItemSelected = (index, opt) => {
  form.inputs[index].item_id       = opt?.item_id       ?? null
  form.inputs[index].warehouse_id  = opt?.warehouse_id  ?? null
  form.inputs[index].warehouse_name = opt?.warehouse_name ?? ''
  form.inputs[index].max_qty       = opt?.qty_available ?? 0

  // Auto sync output item
  if (form.outputs[index] && !form.outputs[index].item_id) {
    form.outputs[index].item_id = opt?.item_id ?? null
  }
}

// === INPUT ===
const addInput = () => form.inputs.push({
  local_id: Date.now() + Math.random(),
  key: null, item_id: null, warehouse_id: null,
  qty: null, max_qty: 0, warehouse_name: ''
})
const removeInput = (i) => form.inputs.splice(i, 1)

// === OUTPUT ===
const addOutput    = () => form.outputs.push({ local_id: Date.now() + Math.random(), item_id: null, qty: null })
const removeOutput = (i) => form.outputs.splice(i, 1)

// === REJECT ===
const addReject    = () => form.rejects.push({ local_id: Date.now() + Math.random(), item_id: null, qty: null, keterangan: '' })
const removeReject = (i) => form.rejects.splice(i, 1)

// === SUBMIT ===
const handleSubmit = async () => {
  if (!form.ref_po_id) { showError('Validasi', 'Production Order wajib dipilih'); return }

  const validInputs = form.inputs.filter((i) => i.item_id && i.warehouse_id && i.qty > 0)
  if (validInputs.length === 0) { showError('Validasi', 'Minimal satu input komponen wajib diisi'); return }

  for (let i = 0; i < validInputs.length; i++) {
    if (validInputs[i].qty > validInputs[i].max_qty && validInputs[i].max_qty > 0) {
      showError('Validasi', `Input #${i + 1}: Qty melebihi stok tersedia (${validInputs[i].max_qty} pcs)`)
      return
    }
  }

  const validOutputs = form.outputs.filter((o) => o.item_id && o.qty > 0)
  if (validOutputs.length === 0) { showError('Validasi', 'Minimal satu output wajib diisi'); return }

  const validRejects = form.rejects.filter((r) => r.item_id && r.qty > 0)

  isSubmitting.value = true
  try {
    const payload = {
      date:         form.date,
      process_type: form.process_type,
      ref_po_id:    Number(form.ref_po_id),
      notes:        form.notes || null,
      inputs:  validInputs.map((i) => ({
        item_id:      Number(i.item_id),
        warehouse_id: Number(i.warehouse_id),
        qty:          Number(i.qty),
      })),
      outputs: validOutputs.map((o) => ({
        item_id: Number(o.item_id),
        qty:     Number(o.qty),
      })),
      rejects: validRejects.map((r) => ({
        item_id:    Number(r.item_id),
        qty:        Number(r.qty),
        keterangan: r.keterangan || null,
      })),
    }

    await apiClient.post('/assembling-produksi/store', payload)
    showSuccess('Sukses', `${form.process_type === 'sub_assembling' ? 'Sub Assembling' : 'Rakit'} berhasil dicatat`)

    // Reset form tapi pertahankan process_type
    const currentType  = form.process_type
    form.ref_po_id     = null
    form.notes         = ''
    form.process_type  = currentType
    form.inputs        = [{ local_id: Date.now(), key: null, item_id: null, warehouse_id: null, qty: null, max_qty: 0, warehouse_name: '' }]
    form.outputs       = [{ local_id: Date.now() + 1, item_id: null, qty: null }]
    form.rejects       = []
    poInfo.value       = { buyer_name: null, so_number: null }
    poTargets.value    = []

    // Refresh source items
    const res = await apiClient.get('/assembling-produksi/source-items')
    sourceItems.value = res.data.data || []

  } catch (error) {
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors && JSON.stringify(error.response.data.errors)) ||
      'Gagal menyimpan assembling'
    showError('Gagal', message)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchInitialData)
</script>

<style scoped>
.page-header-assembling {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  padding: 2rem 2.5rem; border-radius: 20px; margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(124,58,237,0.3);
}
.header-content-wrapper { display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
.header-left-section { display: flex; align-items: center; gap: 1.5rem; flex: 1; }
.icon-badge-assembling { width: 72px; height: 72px; border-radius: 18px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; }
.assembling-icon { font-size: 2.5rem; }
.page-title-assembling { font-size: 2rem; font-weight: 800; color: white; margin: 0 0 0.5rem; }
.page-subtitle-assembling { color: rgba(255,255,255,0.95); font-size: 1rem; margin: 0; font-weight: 500; }
.process-badge { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; background: rgba(255,255,255,0.95); border-radius: 16px; }
.process-icon { font-size: 1.5rem; }
.process-arrow { font-size: 1.25rem; color: #6d28d9; font-weight: 700; }
.flow-label-assembling { color: rgba(255,255,255,0.9); font-size: 0.85rem; font-weight: 600; margin-top: 6px; text-align: center; }

.content-card-assembling { background: white; border-radius: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #f0f2f5; overflow: hidden; }
.card-body-assembling { padding: 2.5rem; }

.form-section-modern { margin-bottom: 2.5rem; padding-bottom: 2.5rem; border-bottom: 3px solid #e5e7eb; }
.form-section-modern:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }

.section-header { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.75rem; padding: 1.25rem 1.5rem; background: linear-gradient(135deg, #f9fafb, #f5f3ff); border-radius: 14px; border-left: 5px solid #7c3aed; }
.section-icon-badge { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #7c3aed, #6d28d9); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.section-badge-input  { background: linear-gradient(135deg, #0891b2, #0e7490) !important; }
.section-badge-output { background: linear-gradient(135deg, #16a34a, #15803d) !important; }
.section-badge-reject { background: linear-gradient(135deg, #dc2626, #b91c1c) !important; }
.section-icon { font-size: 1.25rem; }
.section-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0 0 0.2rem; display: flex; align-items: center; gap: 0.5rem; }
.section-subtitle { font-size: 0.875rem; color: #6b7280; margin: 0; }

.process-type-toggle { display: flex; gap: 1rem; margin-bottom: 0.5rem; }
.process-type-btn { flex: 1; display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.5rem; border: 2px solid #e5e7eb; border-radius: 14px; background: white; cursor: pointer; transition: all 0.2s; text-align: left; }
.process-type-btn:hover { border-color: #7c3aed; }
.process-type-btn.active { border-color: #7c3aed; background: #f5f3ff; }
.process-type-icon { font-size: 2rem; }
.process-type-label { font-weight: 700; font-size: 1rem; color: #111827; }
.process-type-desc { font-size: 0.82rem; color: #6b7280; margin-top: 2px; }

.form-grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.form-grid-3col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.form-group-modern { display: flex; flex-direction: column; }
.form-label-modern { font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
.required-star { color: #ef4444; }
.input-wrapper-icon { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 1.125rem; font-size: 1rem; z-index: 1; pointer-events: none; }
.form-input-modern { width: 100%; padding: 0.9rem 1.25rem 0.9rem 3.25rem; border: 2.5px solid #e5e7eb; border-radius: 12px; font-size: 1rem; font-weight: 500; transition: all 0.3s ease; background: white; }
.form-input-modern:focus { outline: none; border-color: #7c3aed; box-shadow: 0 0 0 4px rgba(124,58,237,0.15); }

.po-selected-info { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 10px; margin-bottom: 1rem; }
.po-info-icon { font-size: 1.25rem; }
.po-info-buyer { font-weight: 700; font-size: 0.95rem; color: #111827; }
.po-info-so { font-size: 0.82rem; color: #6b7280; }

.po-hint-box { border-radius: 16px; border: 1px solid #ddd6fe; background: linear-gradient(135deg, #f5f3ff, #ede9fe); padding: 1.25rem 1.5rem; }
.po-hint-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.po-hint-title-wrap { display: flex; align-items: center; gap: 0.75rem; }
.po-hint-icon { font-size: 1.25rem; }
.po-hint-title { font-weight: 700; font-size: 0.95rem; color: #5b21b6; }
.po-hint-sub { font-size: 0.82rem; color: #7c3aed; }
.po-hint-badge { background: #7c3aed; color: white; border-radius: 999px; padding: 2px 12px; font-size: 0.8rem; font-weight: 700; }
.po-hint-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.po-hint-table th { padding: 6px 10px; text-align: left; color: #5b21b6; font-size: 0.78rem; text-transform: uppercase; border-bottom: 1px solid #ddd6fe; }
.po-hint-table td { padding: 6px 10px; color: #374151; border-bottom: 1px solid #ede9fe; }

.item-row-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; }
.item-row-card--output { border-color: #bbf7d0; background: #f0fdf4; }
.item-row-card--reject { border-color: #fecaca; background: #fff5f5; }
.item-row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.item-row-number { font-size: 0.82rem; font-weight: 700; color: #6b7280; text-transform: uppercase; }
.btn-remove-row { background: #fee2e2; color: #ef4444; border: none; border-radius: 6px; padding: 3px 10px; font-size: 0.82rem; cursor: pointer; font-weight: 700; }

.stock-hint { margin-left: 8px; font-size: 0.78rem; color: #7c3aed; font-weight: 600; }
.qty-warning { margin-top: 4px; font-size: 0.82rem; color: #ef4444; }
.loading-inline { font-size: 0.82rem; color: #6b7280; margin-left: 8px; }
.source-info { margin-top: 6px; font-size: 0.82rem; color: #6b7280; padding: 4px 8px; background: #f3f4f6; border-radius: 6px; display: inline-block; }

.item-option { display: flex; flex-direction: column; gap: 2px; padding: 8px 12px; }
.item-option-badge { display: inline-block; padding: 1px 6px; background: #7c3aed; color: white; border-radius: 4px; font-size: 0.72rem; font-weight: 700; width: fit-content; }
.item-option-code { font-size: 0.82rem; font-weight: 700; color: #374151; }
.item-option-name { font-size: 0.9rem; color: #111827; font-weight: 500; }
.item-option-produk { font-size: 0.78rem; color: #2563eb; font-weight: 600; }
.item-option-stock { font-size: 0.78rem; color: #6b7280; }

.btn-add-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; margin-top: 0.5rem; border: 2px dashed; }
.btn-add-input  { background: #f5f3ff; border-color: #7c3aed; color: #6d28d9; }
.btn-add-input:hover { background: #ede9fe; }
.btn-add-output { background: #f0fdf4; border-color: #16a34a; color: #15803d; }
.btn-add-output:hover { background: #dcfce7; }
.btn-add-reject { background: #fff5f5; border-color: #dc2626; color: #b91c1c; }
.btn-add-reject:hover { background: #fecaca; }

.optional-tag { display: inline-block; padding: 1px 8px; border-radius: 999px; background: #e0f2fe; color: #0369a1; font-size: 0.72rem; font-weight: 600; vertical-align: middle; }
.empty-reject { padding: 1rem; text-align: center; color: #9ca3af; font-size: 0.9rem; }
.empty-hint { padding: 2rem; text-align: center; color: #9ca3af; font-size: 0.95rem; background: #f9fafb; border-radius: 12px; border: 1px dashed #d1d5db; }
.btn-link { background: none; border: none; color: #7c3aed; font-weight: 600; cursor: pointer; text-decoration: underline; font-size: 0.9rem; }

.form-actions-modern { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb; }
.btn-action { display: flex; align-items: center; gap: 0.5rem; padding: 0.875rem 1.75rem; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
.btn-cancel-modern { background: #f3f4f6; color: #374151; }
.btn-cancel-modern:hover { background: #e5e7eb; }
.btn-submit-modern { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; box-shadow: 0 4px 12px rgba(124,58,237,0.35); }
.btn-submit-modern:hover:not(:disabled) { transform: translateY(-1px); }
.btn-submit-modern:disabled { opacity: 0.6; cursor: not-allowed; }

.vue-select-po :deep(.vs__dropdown-toggle),
.vue-select-item :deep(.vs__dropdown-toggle) { padding: 0.875rem 1.25rem; border: 2.5px solid #e5e7eb; border-radius: 12px; min-height: 54px; }
.vue-select-po.vs--open :deep(.vs__dropdown-toggle),
.vue-select-item.vs--open :deep(.vs__dropdown-toggle) { border-color: #7c3aed; box-shadow: 0 0 0 4px rgba(124,58,237,0.15); }

@media (max-width: 768px) {
  .form-grid-2col, .form-grid-3col { grid-template-columns: 1fr; }
  .process-type-toggle { flex-direction: column; }
  .card-body-assembling { padding: 1.25rem; }
}

.item-readonly-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0.9rem 1.25rem;
  border: 2.5px solid #bbf7d0;
  border-radius: 12px;
  background: #f0fdf4;
}
.item-readonly-code {
  font-size: 0.78rem;
  font-weight: 700;
  color: #16a34a;
}
.item-readonly-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}
.item-readonly-badge {
  font-size: 0.72rem;
  color: #15803d;
  font-weight: 600;
}
.output-dest-hint {
  margin-top: 8px;
  font-size: 0.82rem;
  color: #6b7280;
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 6px;
  display: inline-block;
}
</style>