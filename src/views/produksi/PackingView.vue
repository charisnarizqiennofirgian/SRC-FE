<template>
  <DashboardLayout>
    <div class="page-header-packing">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-packing">
            <span class="packing-icon">📦</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-packing">Packing</h1>
            <p class="page-subtitle-packing">
              Kemas produk jadi — catat qty per item, lalu klik Selesai Packing untuk menutup PO.
            </p>
          </div>
        </div>
        <div class="header-badge-section">
          <div class="process-badge">
            <span class="process-icon">🔍</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">📦</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">✅</span>
          </div>
          <div class="flow-label-packing">QC → Packing → Selesai</div>
        </div>
      </div>
    </div>

    <div class="content-card-packing">
      <div class="card-body-packing">
        <form @submit.prevent="handleSubmit" @keydown.enter.prevent>

          <!-- SECTION 1: INFO UMUM -->
          <div class="form-section-modern">
            <div class="section-header section-header-packing">
              <div class="section-icon-badge">
                <span class="section-icon">📅</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Informasi Umum</h3>
                <p class="section-subtitle">Tanggal, PO, dan catatan packing</p>
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
                    placeholder="Catatan packing..."
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
          </div>

          <!-- SECTION 2: ITEM PACKING -->
          <div class="form-section-modern">
            <div class="section-header section-header-packing">
              <div class="section-icon-badge section-badge-item">
                <span class="section-icon">📦</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Item yang Dikemas</h3>
                <p class="section-subtitle">
                  Item dari detail PO — isi qty yang sudah dikemas hari ini
                </p>
              </div>
            </div>

            <div v-if="!form.ref_po_id" class="empty-hint">
              ⬆️ Pilih PO dulu untuk melihat item yang perlu dikemas
            </div>

            <template v-else>
              <div
                v-for="(row, index) in form.items"
                :key="row.local_id"
                class="item-row-card"
              >
                <div class="item-row-header">
                  <div class="item-row-info">
                    <span class="item-row-number">Item #{{ index + 1 }}</span>
                    <span v-if="row.item_name" class="item-row-name">
                      {{ row.item_code }} — {{ row.item_name }}
                    </span>
                    <span v-if="row.qty_planned > 0" class="item-row-planned">
                      Target: {{ row.qty_planned }} pcs
                    </span>
                  </div>
                  <button
                    v-if="!row.from_po && form.items.length > 1"
                    type="button"
                    class="btn-remove-row"
                    @click="removeItem(index)"
                  >✕</button>
                </div>
                <div class="form-grid-2col">
                  <!-- Item (auto dari PO atau manual) -->
                  <div class="form-group-modern">
                    <label class="form-label-modern">
                      Item <span class="required-star">*</span>
                    </label>
                    <!-- Read-only kalau dari PO -->
                    <div v-if="row.from_po" class="item-readonly-box">
                      <span class="item-readonly-code">{{ row.item_code }}</span>
                      <span class="item-readonly-name">{{ row.item_name }}</span>
                      <span class="item-readonly-badge">🎯 Dari PO</span>
                    </div>
                    <!-- Manual kalau tidak ada PO -->
                    <vue-select
                      v-else
                      v-model="row.item_id"
                      :options="allProdukJadiForSelect"
                      :reduce="(o) => o.id"
                      label="label"
                      placeholder="🔍 Pilih produk jadi..."
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

                  <!-- Qty -->
                  <div class="form-group-modern">
                    <label class="form-label-modern">
                      Qty Dikemas (pcs) <span class="required-star">*</span>
                      <span v-if="row.qty_planned > 0" class="stock-hint">
                        Target: {{ row.qty_planned }} pcs
                      </span>
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
              </div>

              <!-- Tambah item manual -->
              <button type="button" class="btn-add-row btn-add-item" @click="addItem">
                ➕ Tambah Item Lainnya
              </button>
            </template>
          </div>

          <!-- SUMMARY -->
          <div v-if="form.ref_po_id && form.items.length > 0" class="packing-summary">
            <div class="summary-icon-big">📦</div>
            <div>
              <div class="summary-title">Total Dikemas Hari Ini</div>
              <div class="summary-value">
                {{ form.items.reduce((s, i) => s + (Number(i.qty) || 0), 0).toLocaleString('id-ID') }} pcs
              </div>
              <div class="summary-sub">
                {{ form.items.filter(i => (i.from_po || i.item_id) && i.qty > 0).length }} jenis item
              </div>
            </div>
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
              class="btn-action btn-selesai-packing"
              :disabled="isMarkingDone"
              @click="selesaiPacking"
            >
              <span class="btn-icon">🏁</span>
              <span class="btn-text">{{ isMarkingDone ? 'Memproses...' : 'Selesai Packing' }}</span>
            </button>

            <button
              type="submit"
              class="btn-action btn-submit-packing"
              :disabled="isSubmitting"
            >
              <span class="btn-icon">💾</span>
              <span class="btn-text">{{ isSubmitting ? 'Menyimpan...' : 'Simpan Packing' }}</span>
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
const isSubmitting  = ref(false)
const isMarkingDone = ref(false)

const productionOrders = ref([])
const allProdukJadi    = ref([])
const poInfo = ref({ buyer_name: null, so_number: null })

const form = reactive({
  date:      new Date().toISOString().slice(0, 10),
  ref_po_id: null,
  notes:     '',
  items:     [],
})

const allProdukJadiForSelect = computed(() =>
  allProdukJadi.value.map((i) => ({
    id:    i.id,
    code:  i.code,
    name:  i.name,
    label: `${i.code} - ${i.name}`,
  }))
)

const fetchInitialData = async () => {
  try {
    const [poRes, itemRes] = await Promise.all([
      apiClient.get('/packing/available-pos'),
      apiClient.get('/materials', { params: { category_name: 'Produk Jadi', per_page: 200 } }),
    ])
    productionOrders.value = poRes.data.data || []
    const raw = itemRes.data.data?.data || itemRes.data.data || []
    allProdukJadi.value = raw
  } catch {
    showError('Gagal', 'Gagal mengambil data awal')
  }
}

const handlePoChange = (opt) => {
  poInfo.value = { buyer_name: null, so_number: null }
  form.items   = []
  if (!opt) return

  poInfo.value = {
    buyer_name: opt.buyer_name || null,
    so_number:  opt.so_number  || null,
  }

  // Auto-fill item dari detail PO
  if (opt.details && opt.details.length > 0) {
    form.items = opt.details.map((d) => ({
      local_id:    Date.now() + Math.random(),
      from_po:     true,
      item_id:     d.item_id,
      item_code:   d.item_code,
      item_name:   d.item_name,
      qty_planned: d.qty_planned,
      qty:         null,
    }))
  } else {
    // Tidak ada detail PO → manual
    form.items = [{ local_id: Date.now(), from_po: false, item_id: null, qty: null, qty_planned: 0 }]
  }
}

const handlePoDeselect = () => {
  poInfo.value    = { buyer_name: null, so_number: null }
  form.items      = [{ local_id: Date.now(), from_po: false, item_id: null, qty: null, qty_planned: 0 }]
}

const addItem = () => form.items.push({
  local_id:    Date.now() + Math.random(),
  from_po:     false,
  item_id:     null,
  qty:         null,
  qty_planned: 0,
})
const removeItem = (i) => form.items.splice(i, 1)

// === SIMPAN PACKING ===
const handleSubmit = async () => {
  if (!form.ref_po_id) { showError('Validasi', 'PO wajib dipilih'); return }

  const validItems = form.items.filter((i) => (i.from_po ? i.item_id : i.item_id) && i.qty > 0)
  if (validItems.length === 0) { showError('Validasi', 'Minimal satu item dengan qty wajib diisi'); return }

  isSubmitting.value = true
  try {
    await apiClient.post('/packing/store', {
      date:      form.date,
      ref_po_id: Number(form.ref_po_id),
      notes:     form.notes || null,
      items: validItems.map((i) => ({
        item_id: Number(i.item_id),
        qty:     Number(i.qty),
      })),
    })

    showSuccess('Sukses', 'Packing berhasil dicatat — stok produk jadi bertambah')

    // Reset qty tapi pertahankan item dari PO
    form.items.forEach((i) => { i.qty = null })
    form.notes = ''

  } catch (error) {
    const message = error.response?.data?.message || 'Gagal menyimpan packing'
    showError('Gagal', message)
  } finally {
    isSubmitting.value = false
  }
}

// === SELESAI PACKING → PO COMPLETED ===
const selesaiPacking = async () => {
  if (!form.ref_po_id) { showError('Validasi', 'Pilih PO dulu'); return }

  const poLabel = productionOrders.value.find(p => p.id === form.ref_po_id)?.po_number || 'ini'

  if (!confirm(
    `Yakin PO ${poLabel} sudah selesai packing?\n\n` +
    `PO akan hilang dari SEMUA menu produksi dan tidak bisa dibatalkan!`
  )) return

  isMarkingDone.value = true
  try {
    await apiClient.post(`/packing/selesai/${form.ref_po_id}`)
    showSuccess('Selesai!', `PO ${poLabel} selesai — produk jadi siap dikirim! 🎉`)

    form.ref_po_id = null
    form.notes     = ''
    form.items     = []
    poInfo.value   = { buyer_name: null, so_number: null }

    const poRes = await apiClient.get('/packing/available-pos')
    productionOrders.value = poRes.data.data || []

  } catch (error) {
    const message = error.response?.data?.message || 'Gagal menandai selesai packing'
    showError('Gagal', message)
  } finally {
    isMarkingDone.value = false
  }
}

onMounted(fetchInitialData)
</script>

<style scoped>
.page-header-packing {
  background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%);
  padding: 2rem 2.5rem; border-radius: 20px; margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(30,58,95,0.3);
}
.header-content-wrapper { display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
.header-left-section { display: flex; align-items: center; gap: 1.5rem; flex: 1; }
.icon-badge-packing { width: 72px; height: 72px; border-radius: 18px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; }
.packing-icon { font-size: 2.5rem; }
.page-title-packing { font-size: 2rem; font-weight: 800; color: white; margin: 0 0 0.5rem; }
.page-subtitle-packing { color: rgba(255,255,255,0.95); font-size: 1rem; margin: 0; font-weight: 500; }
.process-badge { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; background: rgba(255,255,255,0.95); border-radius: 16px; }
.process-icon { font-size: 1.5rem; }
.process-arrow { font-size: 1.25rem; color: #1e40af; font-weight: 700; }
.flow-label-packing { color: rgba(255,255,255,0.9); font-size: 0.85rem; font-weight: 600; margin-top: 6px; text-align: center; }
.header-badge-section { display: flex; flex-direction: column; align-items: center; }

.content-card-packing { background: white; border-radius: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #f0f2f5; overflow: hidden; }
.card-body-packing { padding: 2.5rem; }

.form-section-modern { margin-bottom: 2.5rem; padding-bottom: 2.5rem; border-bottom: 3px solid #e5e7eb; }
.form-section-modern:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }

.section-header { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.75rem; padding: 1.25rem 1.5rem; background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 14px; border-left: 5px solid #1e40af; }
.section-icon-badge { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #1e3a5f, #1e40af); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.section-badge-item { background: linear-gradient(135deg, #f59e0b, #d97706) !important; }
.section-icon { font-size: 1.25rem; }
.section-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0 0 0.2rem; }
.section-subtitle { font-size: 0.875rem; color: #6b7280; margin: 0; }

.form-grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.form-grid-3col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.form-group-modern { display: flex; flex-direction: column; }
.form-label-modern { font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
.required-star { color: #ef4444; }
.input-wrapper-icon { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 1.125rem; font-size: 1rem; z-index: 1; pointer-events: none; }
.form-input-modern { width: 100%; padding: 0.9rem 1.25rem 0.9rem 3.25rem; border: 2.5px solid #e5e7eb; border-radius: 12px; font-size: 1rem; font-weight: 500; transition: all 0.3s ease; background: white; }
.form-input-modern:focus { outline: none; border-color: #1e40af; box-shadow: 0 0 0 4px rgba(30,64,175,0.15); }

.po-selected-info { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; margin-top: 1rem; }
.po-info-icon { font-size: 1.25rem; }
.po-info-buyer { font-weight: 700; font-size: 0.95rem; color: #111827; }
.po-info-so { font-size: 0.82rem; color: #6b7280; }

.item-row-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; }
.item-row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.item-row-info { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.item-row-number { font-size: 0.82rem; font-weight: 700; color: #6b7280; text-transform: uppercase; }
.item-row-name { font-size: 0.9rem; font-weight: 600; color: #111827; }
.item-row-planned { font-size: 0.78rem; color: #1e40af; font-weight: 600; background: #dbeafe; padding: 2px 8px; border-radius: 999px; }
.btn-remove-row { background: #fee2e2; color: #ef4444; border: none; border-radius: 6px; padding: 3px 10px; font-size: 0.82rem; cursor: pointer; font-weight: 700; }

.item-readonly-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0.9rem 1.25rem;
  border: 2.5px solid #bfdbfe;
  border-radius: 12px;
  background: #eff6ff;
  min-height: 54px;
  justify-content: center;
}
.item-readonly-code {
  font-size: 0.78rem;
  font-weight: 700;
  color: #1d4ed8;
}
.item-readonly-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}
.item-readonly-badge {
  font-size: 0.72rem;
  color: #1e40af;
  font-weight: 600;
}

.stock-hint { margin-left: 8px; font-size: 0.78rem; color: #1e40af; font-weight: 600; }
.empty-hint { padding: 2rem; text-align: center; color: #9ca3af; font-size: 0.95rem; background: #f9fafb; border-radius: 12px; border: 1px dashed #d1d5db; }

.btn-add-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; margin-top: 0.5rem; border: 2px dashed; }
.btn-add-item { background: #eff6ff; border-color: #1e40af; color: #1e3a5f; }
.btn-add-item:hover { background: #dbeafe; }

.packing-summary { display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem; background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 16px; border: 1px solid #bfdbfe; margin-bottom: 1.5rem; }
.summary-icon-big { font-size: 3rem; }
.summary-title { font-size: 0.85rem; color: #6b7280; font-weight: 600; }
.summary-value { font-size: 2rem; font-weight: 800; color: #1e40af; }
.summary-sub { font-size: 0.82rem; color: #6b7280; margin-top: 2px; }

.form-actions-modern { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb; }
.btn-action { display: flex; align-items: center; gap: 0.5rem; padding: 0.875rem 1.75rem; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
.btn-cancel-modern { background: #f3f4f6; color: #374151; }
.btn-cancel-modern:hover { background: #e5e7eb; }
.btn-selesai-packing { background: linear-gradient(135deg, #16a34a, #15803d); color: white; box-shadow: 0 4px 12px rgba(22,163,74,0.35); }
.btn-selesai-packing:hover:not(:disabled) { transform: translateY(-1px); }
.btn-selesai-packing:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-submit-packing { background: linear-gradient(135deg, #1e3a5f, #1e40af); color: white; box-shadow: 0 4px 12px rgba(30,58,95,0.35); }
.btn-submit-packing:hover:not(:disabled) { transform: translateY(-1px); }
.btn-submit-packing:disabled { opacity: 0.6; cursor: not-allowed; }

.item-option { display: flex; flex-direction: column; gap: 2px; padding: 8px 12px; }
.item-option-code { font-size: 0.82rem; font-weight: 700; color: #1e40af; }
.item-option-name { font-size: 0.9rem; color: #111827; font-weight: 500; }

.vue-select-po :deep(.vs__dropdown-toggle),
.vue-select-item :deep(.vs__dropdown-toggle) { padding: 0.875rem 1.25rem; border: 2.5px solid #e5e7eb; border-radius: 12px; min-height: 54px; }
.vue-select-po.vs--open :deep(.vs__dropdown-toggle),
.vue-select-item.vs--open :deep(.vs__dropdown-toggle) { border-color: #1e40af; box-shadow: 0 0 0 4px rgba(30,64,175,0.15); }

@media (max-width: 768px) {
  .form-grid-2col, .form-grid-3col { grid-template-columns: 1fr; }
  .card-body-packing { padding: 1.25rem; }
  .form-actions-modern { flex-direction: column; }
}
</style>