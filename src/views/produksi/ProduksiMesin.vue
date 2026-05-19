<template>
  <DashboardLayout>
    <!-- HEADER -->
    <div class="page-header-mesin">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-mesin">
            <span class="mesin-icon">⚙️</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-mesin">Produksi Mesin</h1>
            <p class="page-subtitle-mesin">
              Catat proses per mesin — input komponen S4S, output ke Gudang Mesin, dan reject.
            </p>
          </div>
        </div>
        <div class="header-badge-section">
          <div class="process-badge">
            <span class="process-icon">📦</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">⚙️</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">🔩</span>
          </div>
          <div class="flow-label-mesin">S4S → Mesin → Komponen</div>
        </div>
      </div>
    </div>

    <div class="content-card-mesin">
      <div class="card-body-mesin">
        <form @submit.prevent="handleSubmit" @keydown.enter.prevent>

          <!-- SECTION 1: INFO UMUM -->
          <div class="form-section-modern">
            <div class="section-header section-header-mesin">
              <div class="section-icon-badge">
                <span class="section-icon">📅</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Informasi Umum</h3>
                <p class="section-subtitle">Tanggal, PO, mesin yang dipakai, dan catatan</p>
              </div>
            </div>

            <div class="form-grid-3col">
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
                <label class="form-label-modern">Estimasi Selesai</label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">🏁</span>
                  <input
                    v-model="form.estimated_finish_date"
                    type="date"
                    class="form-input-modern"
                  />
                </div>
              </div>

              <div class="form-group-modern">
                <label class="form-label-modern">Catatan</label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">📝</span>
                  <input
                    v-model="form.notes"
                    type="text"
                    class="form-input-modern"
                    placeholder="Catatan proses mesin..."
                  />
                </div>
              </div>
            </div>

            <div class="form-grid-2col">
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
                <label class="form-label-modern">
                  Mesin yang Dipakai <span class="required-star">*</span>
                </label>
                <vue-select
                  v-model="form.machine_id"
                  :options="machines"
                  :reduce="(m) => m.id"
                  label="name"
                  placeholder="🔍 Pilih mesin..."
                  :clearable="true"
                  class="vue-select-po"
                >
                  <template #option="m">
                    <div class="machine-option">
                      <span class="machine-code">{{ m.code }}</span>
                      <span class="machine-name">{{ m.name }}</span>
                      <span class="machine-desc">{{ m.description }}</span>
                    </div>
                  </template>
                </vue-select>
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

          <!-- SECTION 2: INPUT KOMPONEN S4S -->
          <div class="form-section-modern">
            <div class="section-header section-header-mesin">
              <div class="section-icon-badge section-badge-input">
                <span class="section-icon">📦</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Komponen Masuk Mesin</h3>
                <p class="section-subtitle">
                  Pilih dari stok Gudang S4S
                  <span v-if="loadingS4s" class="loading-inline">⏳ memuat...</span>
                </p>
              </div>
            </div>

            <div v-if="s4sItems.length === 0 && !loadingS4s" class="empty-hint">
              📭 Tidak ada stok di Gudang S4S
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
                      v-model="row.item_id"
                      :options="s4sItemsForSelect"
                      :reduce="(o) => o.item_id"
                      label="label"
                      placeholder="🔍 Pilih komponen dari S4S..."
                      class="vue-select-item"
                      @option:selected="(opt) => onS4sItemSelected(index, opt)"
                    >
                      <template #option="o">
                        <div class="item-option">
                          <span class="item-option-code">{{ o.item_code }}</span>
                          <span class="item-option-name">{{ o.item_name }}</span>
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
              </div>

              <button type="button" class="btn-add-row btn-add-input" @click="addInput">
                ➕ Tambah Input Lainnya
              </button>
            </template>
          </div>

          <!-- SECTION 3: OUTPUT KOMPONEN -->
          <div class="form-section-modern">
            <div class="section-header section-header-mesin">
              <div class="section-icon-badge section-badge-output">
                <span class="section-icon">🔩</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Hasil Komponen</h3>
                <p class="section-subtitle">Komponen hasil mesin → masuk Gudang Mesin (MESIN)</p>
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
                  v-if="form.outputs.length > 1"
                  type="button"
                  class="btn-remove-row"
                  @click="removeOutput(index)"
                >✕</button>
              </div>
              <div class="form-grid-2col">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    Item Komponen <span class="required-star">*</span>
                  </label>
                  <vue-select
                    v-model="row.item_id"
                    :options="allKomponenForSelect"
                    :reduce="(o) => o.id"
                    label="label"
                    placeholder="🔍 Cari komponen..."
                    class="vue-select-item"
                  >
                    <template #option="o">
                      <div class="item-option">
                        <span class="item-option-code">{{ o.code }}</span>
                        <span class="item-option-name">{{ o.name }}</span>
                        <span v-if="o.nama_produk" class="item-option-produk">📦 {{ o.nama_produk }}</span>
                      </div>
                    </template>
                  </vue-select>
                </div>
                <div class="form-group-modern">
                  <label class="form-label-modern">Qty (pcs) <span class="required-star">*</span></label>
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
            </div>

            <button type="button" class="btn-add-row btn-add-output" @click="addOutput">
              ➕ Tambah Output Lainnya
            </button>
          </div>

          <!-- SECTION 4: REJECT -->
          <div class="form-section-modern">
            <div class="section-header section-header-mesin">
              <div class="section-icon-badge section-badge-reject">
                <span class="section-icon">⚠️</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">
                  Reject
                  <span class="optional-tag">Opsional</span>
                </h3>
                <p class="section-subtitle">
                  Catat komponen reject di mesin
                  <strong v-if="form.machine_id">
                    {{ machines.find(m => m.id === form.machine_id)?.name }}
                  </strong>
                </p>
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
                  <label class="form-label-modern">
                    Item Reject <span class="required-star">*</span>
                  </label>
                  <vue-select
                    v-model="row.item_id"
                    :options="allKomponenForSelect"
                    :reduce="(o) => o.id"
                    label="label"
                    placeholder="🔍 Cari item..."
                    class="vue-select-item"
                  >
                    <template #option="o">
                      <div class="item-option">
                        <span class="item-option-code">{{ o.code }}</span>
                        <span class="item-option-name">{{ o.name }}</span>
                        <span v-if="o.nama_produk" class="item-option-produk">📦 {{ o.nama_produk }}</span>
                      </div>
                    </template>
                  </vue-select>
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
                  <label class="form-label-modern">Keterangan Reject</label>
                  <div class="input-wrapper-icon">
                    <span class="input-icon">📝</span>
                    <input
                      v-model="row.keterangan"
                      type="text"
                      class="form-input-modern"
                      placeholder="Contoh: salah ukuran, patah, dll"
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

            <button
              v-if="form.ref_po_id"
              type="button"
              class="btn-action btn-selesai-modern"
              :disabled="isMarkingDone"
              @click="tandaiSelesai"
            >
              <span class="btn-icon">✅</span>
              <span class="btn-text">{{ isMarkingDone ? 'Memproses...' : 'Selesai Proses Mesin' }}</span>
            </button>

            <button
              type="submit"
              class="btn-action btn-submit-modern"
              :disabled="isSubmitting"
            >
              <span class="btn-icon">💾</span>
              <span class="btn-text">{{ isSubmitting ? 'Menyimpan...' : 'Simpan Proses Mesin' }}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

const router = useRouter()
const { showSuccess, showError } = useNotification()
const isSubmitting   = ref(false)
const isMarkingDone  = ref(false)
const loadingS4s     = ref(false)

// === DATA ===
const productionOrders = ref([])
const machines         = ref([])
const s4sItems         = ref([])
const allKomponen      = ref([])
const poInfo           = ref({ buyer_name: null, so_number: null })
const poTargets        = ref([])

const form = reactive({
  date:                  new Date().toISOString().slice(0, 10),
  estimated_finish_date: '',
  ref_po_id:             null,
  machine_id:            null,
  notes:                 '',
  inputs:  [{ local_id: Date.now(),     item_id: null, qty: null, max_qty: 0 }],
  outputs: [{ local_id: Date.now() + 1, item_id: null, qty: null }],
  rejects: [],
})

// === COMPUTED ===
const s4sItemsForSelect = computed(() =>
  s4sItems.value.map((i) => ({
    item_id:       i.item_id,
    item_code:     i.item_code,
    item_name:     i.item_name,
    qty_available: i.qty_available,
    label:         `${i.item_code} - ${i.item_name}`,
  }))
)

const allKomponenForSelect = computed(() =>
  allKomponen.value.map((i) => ({
    id:          i.id,
    code:        i.code,
    name:        i.name,
    nama_produk: i.nama_produk || '',
    label:       i.nama_produk
      ? `${i.code} - ${i.name} (${i.nama_produk})`
      : `${i.code} - ${i.name}`,
  }))
)

// === FETCH DATA ===
const fetchInitialData = async () => {
  loadingS4s.value = true
  try {
    const [poRes, machineRes, s4sRes, kompRes] = await Promise.all([
      apiClient.get('/operator-mesin/available-pos'),
      apiClient.get('/operator-mesin/machines'),
      apiClient.get('/operator-mesin/s4s-items'),
      apiClient.get('/stock-report', { params: { categories: 'Komponen', per_page: 9999 } }),
    ])
    productionOrders.value = poRes.data.data      || []
    machines.value         = machineRes.data.data  || []
    s4sItems.value         = s4sRes.data.data      || []

    const kompData = kompRes.data.data?.data ?? kompRes.data.data ?? []
    allKomponen.value = Array.isArray(kompData) ? kompData : []
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil data awal')
  } finally {
    loadingS4s.value = false
  }
}

const handlePoChange = async (opt) => {
  poInfo.value    = { buyer_name: null, so_number: null }
  poTargets.value = []
  if (!opt) return
  try {
    const res  = await apiClient.get(`/production-orders/${opt.id}`)
    const data = res.data.data || {}
    poInfo.value = {
      buyer_name: data.sales_order?.buyer_name || opt.buyer_name || null,
      so_number:  data.sales_order?.so_number  || opt.so_number  || null,
    }
    poTargets.value = data.targets || []
  } catch (e) { console.error(e) }
}

const handlePoDeselect = () => {
  poInfo.value    = { buyer_name: null, so_number: null }
  poTargets.value = []
}

const onS4sItemSelected = (index, opt) => {
  form.inputs[index].max_qty = opt?.qty_available ?? 0

  // ✅ Auto-fill output dengan item yang sama
  if (form.outputs[index]) {
    form.outputs[index].item_id = opt?.item_id ?? null
  } else {
    form.outputs.push({
      local_id: Date.now() + Math.random(),
      item_id:  opt?.item_id ?? null,
      qty:      null,
    })
  }
}

// === INPUT ===
const addInput    = () => form.inputs.push({ local_id: Date.now() + Math.random(), item_id: null, qty: null, max_qty: 0 })
const removeInput = (i) => form.inputs.splice(i, 1)

// === OUTPUT ===
const addOutput    = () => form.outputs.push({ local_id: Date.now() + Math.random(), item_id: null, qty: null })
const removeOutput = (i) => form.outputs.splice(i, 1)

// === REJECT ===
const addReject    = () => form.rejects.push({ local_id: Date.now() + Math.random(), item_id: null, qty: null, keterangan: '' })
const removeReject = (i) => form.rejects.splice(i, 1)

// === TANDAI SELESAI ===
const tandaiSelesai = async () => {
  if (!form.ref_po_id) return
  if (!confirm('Tandai PO ini selesai proses Mesin? PO akan lanjut ke Assembling.')) return

  isMarkingDone.value = true
  try {
    await apiClient.post(`/operator-mesin/selesai/${form.ref_po_id}`)
    showSuccess('Selesai', 'PO berhasil ditandai selesai proses Mesin, lanjut ke Assembling')
    router.push({ name: 'AssemblingView' })
  } catch (error) {
    showError('Gagal', error.response?.data?.message || 'Gagal menandai selesai')
  } finally {
    isMarkingDone.value = false
  }
}

// === SUBMIT ===
const handleSubmit = async () => {
  if (!form.ref_po_id)  { showError('Validasi', 'Production Order wajib dipilih'); return }
  if (!form.machine_id) { showError('Validasi', 'Mesin wajib dipilih'); return }

  const validInputs = form.inputs.filter((i) => i.item_id && i.qty > 0)
  if (validInputs.length === 0) { showError('Validasi', 'Minimal satu input komponen wajib diisi'); return }

  for (let i = 0; i < validInputs.length; i++) {
    if (validInputs[i].qty > validInputs[i].max_qty && validInputs[i].max_qty > 0) {
      showError('Validasi', `Input #${i + 1}: Qty melebihi stok tersedia (${validInputs[i].max_qty} pcs)`)
      return
    }
  }

  const validOutputs = form.outputs.filter((o) => o.item_id && o.qty > 0)
  if (validOutputs.length === 0) { showError('Validasi', 'Minimal satu output komponen wajib diisi'); return }

  const validRejects = form.rejects.filter((r) => r.item_id && r.qty > 0)

  isSubmitting.value = true
  try {
    const payload = {
      date:                  form.date,
      estimated_finish_date: form.estimated_finish_date || null,
      ref_po_id:             Number(form.ref_po_id),
      machine_id:            Number(form.machine_id),
      notes:      form.notes || null,
      inputs:  validInputs.map((i)  => ({ item_id: Number(i.item_id),  qty: Number(i.qty) })),
      outputs: validOutputs.map((o) => ({ item_id: Number(o.item_id), qty: Number(o.qty) })),
      rejects: validRejects.map((r) => ({
        item_id:    Number(r.item_id),
        qty:        Number(r.qty),
        keterangan: r.keterangan || null,
      })),
    }

    await apiClient.post('/operator-mesin/store', payload)
    showSuccess('Sukses', 'Proses Mesin berhasil dicatat')

    // Reset form
    form.ref_po_id  = null
    form.machine_id = null
    form.notes      = ''
    form.inputs     = [{ local_id: Date.now(), item_id: null, qty: null, max_qty: 0 }]
    form.outputs    = [{ local_id: Date.now() + 1, item_id: null, qty: null }]
    form.rejects    = []
    poInfo.value    = { buyer_name: null, so_number: null }
    poTargets.value = []

  } catch (error) {
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors && JSON.stringify(error.response.data.errors)) ||
      'Gagal menyimpan proses mesin'
    showError('Gagal', message)
  } finally {
    isSubmitting.value = false
  }
}

// ✅ Watcher: Kalau qty input berubah, qty output ikut otomatis
watch(
  () => form.inputs,
  (newInputs) => {
    newInputs.forEach((input, index) => {
      if (form.outputs[index] && input.qty !== null) {
        form.outputs[index].qty = input.qty
      }
    })
  },
  { deep: true }
)

onMounted(fetchInitialData)
</script>

<style scoped>
.page-header-mesin {
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
  padding: 2rem 2.5rem; border-radius: 20px; margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(8,145,178,0.3);
}
.header-content-wrapper { display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
.header-left-section { display: flex; align-items: center; gap: 1.5rem; flex: 1; }
.icon-badge-mesin { width: 72px; height: 72px; border-radius: 18px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; }
.mesin-icon { font-size: 2.5rem; }
.page-title-mesin { font-size: 2rem; font-weight: 800; color: white; margin: 0 0 0.5rem; }
.page-subtitle-mesin { color: rgba(255,255,255,0.95); font-size: 1rem; margin: 0; font-weight: 500; }
.process-badge { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; background: rgba(255,255,255,0.95); border-radius: 16px; }
.process-icon { font-size: 1.5rem; }
.process-arrow { font-size: 1.25rem; color: #0e7490; font-weight: 700; }
.flow-label-mesin { color: rgba(255,255,255,0.9); font-size: 0.85rem; font-weight: 600; margin-top: 6px; text-align: center; }

.content-card-mesin { background: white; border-radius: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #f0f2f5; overflow: hidden; }
.card-body-mesin { padding: 2.5rem; }

.form-section-modern { margin-bottom: 2.5rem; padding-bottom: 2.5rem; border-bottom: 3px solid #e5e7eb; }
.form-section-modern:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }

.section-header { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.75rem; padding: 1.25rem 1.5rem; background: linear-gradient(135deg, #f9fafb, #ecfeff); border-radius: 14px; border-left: 5px solid #0891b2; }
.section-icon-badge { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #0891b2, #0e7490); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.section-badge-input  { background: linear-gradient(135deg, #d97706, #b45309) !important; }
.section-badge-output { background: linear-gradient(135deg, #16a34a, #15803d) !important; }
.section-badge-reject { background: linear-gradient(135deg, #dc2626, #b91c1c) !important; }
.section-icon { font-size: 1.25rem; }
.section-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0 0 0.2rem; display: flex; align-items: center; gap: 0.5rem; }
.section-subtitle { font-size: 0.875rem; color: #6b7280; margin: 0; }

.form-grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.form-grid-3col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.form-group-modern { display: flex; flex-direction: column; }
.form-label-modern { font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
.required-star { color: #ef4444; }
.input-wrapper-icon { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 1.125rem; font-size: 1rem; z-index: 1; pointer-events: none; }
.form-input-modern { width: 100%; padding: 0.9rem 1.25rem 0.9rem 3.25rem; border: 2.5px solid #e5e7eb; border-radius: 12px; font-size: 1rem; font-weight: 500; transition: all 0.3s ease; background: white; }
.form-input-modern:focus { outline: none; border-color: #0891b2; box-shadow: 0 0 0 4px rgba(8,145,178,0.15); }

.po-selected-info { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #ecfeff; border: 1px solid #a5f3fc; border-radius: 10px; margin-bottom: 1rem; }
.po-info-icon { font-size: 1.25rem; }
.po-info-buyer { font-weight: 700; font-size: 0.95rem; color: #111827; }
.po-info-so { font-size: 0.82rem; color: #6b7280; }

.po-hint-box { border-radius: 16px; border: 1px solid #a5f3fc; background: linear-gradient(135deg, #ecfeff, #cffafe); padding: 1.25rem 1.5rem; }
.po-hint-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.po-hint-title-wrap { display: flex; align-items: center; gap: 0.75rem; }
.po-hint-icon { font-size: 1.25rem; }
.po-hint-title { font-weight: 700; font-size: 0.95rem; color: #0e7490; }
.po-hint-sub { font-size: 0.82rem; color: #0891b2; }
.po-hint-badge { background: #0891b2; color: white; border-radius: 999px; padding: 2px 12px; font-size: 0.8rem; font-weight: 700; }
.po-hint-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.po-hint-table th { padding: 6px 10px; text-align: left; color: #0e7490; font-size: 0.78rem; text-transform: uppercase; border-bottom: 1px solid #a5f3fc; }
.po-hint-table td { padding: 6px 10px; color: #374151; border-bottom: 1px solid #cffafe; }

.machine-option { display: flex; flex-direction: column; gap: 2px; padding: 8px 12px; }
.machine-code { font-size: 0.82rem; font-weight: 700; color: #0891b2; }
.machine-name { font-size: 0.9rem; color: #111827; font-weight: 600; }
.machine-desc { font-size: 0.78rem; color: #6b7280; }

.item-row-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; }
.item-row-card--output { border-color: #bbf7d0; background: #f0fdf4; }
.item-row-card--reject { border-color: #fecaca; background: #fff5f5; }
.item-row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.item-row-number { font-size: 0.82rem; font-weight: 700; color: #6b7280; text-transform: uppercase; }
.btn-remove-row { background: #fee2e2; color: #ef4444; border: none; border-radius: 6px; padding: 3px 10px; font-size: 0.82rem; cursor: pointer; font-weight: 700; }

.stock-hint { margin-left: 8px; font-size: 0.78rem; color: #0891b2; font-weight: 600; }
.qty-warning { margin-top: 4px; font-size: 0.82rem; color: #ef4444; }
.loading-inline { font-size: 0.82rem; color: #6b7280; margin-left: 8px; }

.btn-add-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; margin-top: 0.5rem; border: 2px dashed; }
.btn-add-input  { background: #fef3c7; border-color: #f59e0b; color: #92400e; }
.btn-add-input:hover { background: #fde68a; }
.btn-add-output { background: #f0fdf4; border-color: #16a34a; color: #15803d; }
.btn-add-output:hover { background: #dcfce7; }
.btn-add-reject { background: #fff5f5; border-color: #dc2626; color: #b91c1c; }
.btn-add-reject:hover { background: #fecaca; }

.optional-tag { display: inline-block; padding: 1px 8px; border-radius: 999px; background: #e0f2fe; color: #0369a1; font-size: 0.72rem; font-weight: 600; vertical-align: middle; }
.empty-reject { padding: 1rem; text-align: center; color: #9ca3af; font-size: 0.9rem; }
.empty-hint { padding: 2rem; text-align: center; color: #9ca3af; font-size: 0.95rem; background: #f9fafb; border-radius: 12px; border: 1px dashed #d1d5db; }
.btn-link { background: none; border: none; color: #0891b2; font-weight: 600; cursor: pointer; text-decoration: underline; font-size: 0.9rem; }

.form-actions-modern { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb; }
.btn-action { display: flex; align-items: center; gap: 0.5rem; padding: 0.875rem 1.75rem; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
.btn-cancel-modern { background: #f3f4f6; color: #374151; }
.btn-cancel-modern:hover { background: #e5e7eb; }
.btn-selesai-modern { background: linear-gradient(135deg, #16a34a, #15803d); color: white; box-shadow: 0 4px 12px rgba(22,163,74,0.35); }
.btn-selesai-modern:hover:not(:disabled) { transform: translateY(-1px); }
.btn-selesai-modern:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-submit-modern { background: linear-gradient(135deg, #0891b2, #0e7490); color: white; box-shadow: 0 4px 12px rgba(8,145,178,0.35); }
.btn-submit-modern:hover:not(:disabled) { transform: translateY(-1px); }
.btn-submit-modern:disabled { opacity: 0.6; cursor: not-allowed; }

.vue-select-po :deep(.vs__dropdown-toggle),
.vue-select-item :deep(.vs__dropdown-toggle) { padding: 0.875rem 1.25rem; border: 2.5px solid #e5e7eb; border-radius: 12px; min-height: 54px; }
.vue-select-po.vs--open :deep(.vs__dropdown-toggle),
.vue-select-item.vs--open :deep(.vs__dropdown-toggle) { border-color: #0891b2; box-shadow: 0 0 0 4px rgba(8,145,178,0.15); }

.item-option { display: flex; flex-direction: column; gap: 2px; padding: 8px 12px; }
.item-option-code { font-size: 0.82rem; font-weight: 700; color: #0891b2; }
.item-option-name { font-size: 0.9rem; color: #111827; font-weight: 500; }
.item-option-produk { font-size: 0.78rem; color: #2563eb; font-weight: 600; }
.item-option-stock { font-size: 0.78rem; color: #6b7280; }

@media (max-width: 768px) {
  .form-grid-2col, .form-grid-3col { grid-template-columns: 1fr; }
  .card-body-mesin { padding: 1.25rem; }
}
</style>