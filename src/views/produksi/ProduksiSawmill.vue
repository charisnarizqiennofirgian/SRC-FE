<template>
  <DashboardLayout>
    <div class="page-header-sawmill">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-sawmill">
            <span class="sawmill-icon">🪚</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-sawmill">Produksi Sawmill</h1>
            <p class="page-subtitle-sawmill">
              Catat proses pemotongan kayu log menjadi kayu RST basah untuk tracking produksi
            </p>
          </div>
        </div>
        <div class="header-badge-section">
          <div class="process-badge">
            <span class="process-icon">🪵</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">🪚</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">📦</span>
          </div>
        </div>
      </div>
    </div>

    <div class="content-card-sawmill">
      <div class="card-body-sawmill">
        <form @submit.prevent="handleSubmit" @keydown.enter.prevent>

          <!-- SECTION 1: INFO UMUM -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge">
                <span class="section-icon">📅</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Informasi Umum</h3>
                <p class="section-subtitle">Tanggal, PO (opsional), dan catatan produksi</p>
              </div>
            </div>

            <div class="form-grid-3col">
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Tanggal Produksi <span class="required-star">*</span>
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
                <label class="form-label-modern">Catatan Produksi</label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">📝</span>
                  <input
                    v-model="form.notes"
                    type="text"
                    class="form-input-modern"
                    placeholder="Contoh: Sawmill shift pagi, operator A"
                  />
                </div>
              </div>
            </div>

            <!-- PO SEARCHABLE SELECT — OPSIONAL -->
            <div class="form-grid-2col">
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Production Order
                  <span class="optional-tag">Opsional</span>
                </label>

                <vue-select
                  v-model="selectedProductionOrderId"
                  :options="productionOrdersForSelect"
                  :reduce="(option) => option.id"
                  label="label"
                  placeholder="🔍 Kosongkan jika tidak ada PO..."
                  :filterable="true"
                  :clearable="true"
                  class="vue-select-po"
                  @option:selected="handlePoChange"
                  @option:deselected="handlePoDeselect"
                >
                  <template #no-options="{ search }">
                    <span v-if="search">Tidak ditemukan "{{ search }}"</span>
                    <span v-else>Ketik untuk mencari PO...</span>
                  </template>
                  <template #option="option">{{ option.display_name }}</template>
                  <template #selected-option="option">{{ option.display_name }}</template>
                </vue-select>

                <!-- Info jika tidak ada PO -->
                <p v-if="!selectedProductionOrderId" class="field-hint">
                  ℹ️ Sawmill bisa jalan tanpa PO — hasil RST masuk sebagai stok umum.
                </p>
              </div>

              <div class="form-group-modern">
                <label class="form-label-modern">&nbsp;</label>
                <!-- Kotak info PO jika ada PO dipilih -->
                <div v-if="selectedProductionOrderId && poInfo.buyer_name" class="po-selected-info">
                  <span class="po-info-icon">👤</span>
                  <div>
                    <div class="po-info-buyer">{{ poInfo.buyer_name }}</div>
                    <div class="po-info-so">{{ poInfo.so_number }}</div>
                  </div>
                </div>
                <div v-else-if="!selectedProductionOrderId" class="po-empty-info">
                  <span>📦 Stok Umum — Tanpa PO</span>
                </div>
              </div>
            </div>

            <!-- KOTAK CONTEKAN TARGET DARI PO (hanya jika ada PO) -->
            <div v-if="poTargets.length" class="po-hint-box">
              <div class="po-hint-header">
                <div class="po-hint-title-wrap">
                  <span class="po-hint-icon">📌</span>
                  <div>
                    <div class="po-hint-title">Ringkasan Kebutuhan PO</div>
                    <div class="po-hint-sub">
                      {{ poInfo.buyer_name }} • {{ poInfo.so_number }}
                    </div>
                  </div>
                </div>
                <div class="po-hint-badge">{{ poTargets.length }} item</div>
              </div>
              <div class="po-hint-list-wrapper">
                <table class="po-hint-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty Target</th>
                    </tr>
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
          </div>

          <!-- SECTION 2: KAYU LOG (INPUT) -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge section-icon-badge--log">
                <span class="section-icon">🪵</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Kayu Log yang Dibelah</h3>
                <p class="section-subtitle">Stok dari Gudang Log yang digunakan</p>
              </div>
            </div>

            <div
              v-for="(log, index) in form.logs"
              :key="log.local_id"
              class="item-row-card"
            >
              <div class="item-row-header">
                <span class="item-row-number">Log #{{ index + 1 }}</span>
                <button
                  v-if="form.logs.length > 1"
                  type="button"
                  class="btn-remove-row"
                  @click="removeLogRow(index)"
                >✕</button>
              </div>

              <div class="form-grid-2col">
                <div class="form-group-modern">
                  <label class="form-label-modern">Item Kayu Log <span class="required-star">*</span></label>
                  <vue-select
                    v-model="log.item_log_id"
                    :options="logItemsForSelect"
                    :reduce="(o) => o.id"
                    label="label"
                    placeholder="🔍 Cari kayu log..."
                    class="vue-select-rst"
                  >
                    <template #option="o">
                      <div class="rst-option-item">
                        <span class="rst-option-code">{{ o.code }}</span>
                        <span class="rst-option-name">{{ o.name }}</span>
                        <span class="rst-option-spec">SKSHHK: {{ o.no_skshhk }} | TPK: {{ o.tpk }}</span>
                      </div>
                    </template>
                  </vue-select>
                </div>

                <div class="form-group-modern">
                  <label class="form-label-modern">Qty (pcs) <span class="required-star">*</span></label>
                  <div class="input-wrapper-icon">
                    <span class="input-icon">🔢</span>
                    <input
                      v-model.number="log.qty_log_pcs"
                      type="number"
                      min="1"
                      class="form-input-modern"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="add-rst-section">
              <button type="button" class="btn-add-rst" @click="addLogRow">
                <span class="add-icon">➕</span>
                <span class="add-text">Tambah Item Log Lainnya</span>
              </button>
            </div>
          </div>

          <!-- SECTION 3: HASIL RST (OUTPUT) -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge section-icon-badge--rst">
                <span class="section-icon">📦</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Hasil RST Basah</h3>
                <p class="section-subtitle">Hasil belahan yang masuk ke Gudang Sanwil (RST Basah)</p>
              </div>
            </div>

            <div
              v-for="(rst, index) in form.rsts"
              :key="rst.local_id"
              class="item-row-card"
            >
              <div class="item-row-header">
                <span class="item-row-number">RST #{{ index + 1 }}</span>
                <button
                  v-if="form.rsts.length > 1"
                  type="button"
                  class="btn-remove-row"
                  @click="removeRstRow(index)"
                >✕</button>
              </div>

              <div class="form-grid-3col">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    Item RST <span class="required-star">*</span>
                    <button type="button" class="btn-quick-add" @click="openModalTambahRst" title="Tambah item RST baru">
                      ➕ Item Baru
                    </button>
                  </label>
                  <vue-select
                    v-model="rst.item_rst_id"
                    :options="rstItemsForSelect"
                    :reduce="(o) => o.id"
                    label="label"
                    placeholder="🔍 Cari item RST..."
                    class="vue-select-rst"
                    @option:selected="(opt) => { rst.item_rst_id = opt.id; updateRstVolume(index) }"
                  >
                    <template #option="o">
                      <div class="rst-option-item">
                        <span class="rst-option-code">{{ o.code }}</span>
                        <span class="rst-option-name">{{ o.name }}</span>
                      </div>
                    </template>
                  </vue-select>
                </div>

                <div class="form-group-modern">
                  <label class="form-label-modern">Qty (pcs) <span class="required-star">*</span></label>
                  <div class="input-wrapper-icon">
                    <span class="input-icon">🔢</span>
                    <input
                      v-model.number="rst.qty_rst_pcs"
                      type="number"
                      min="1"
                      class="form-input-modern"
                      placeholder="0"
                      @input="updateRstVolume(index)"
                    />
                  </div>
                </div>

                <div class="form-group-modern">
                  <label class="form-label-modern">Volume (m³)</label>
                  <div class="input-wrapper-icon">
                    <span class="input-icon">📐</span>
                    <input
                      v-model.number="rst.volume_rst_m3"
                      type="number"
                      step="0.0001"
                      min="0"
                      class="form-input-modern"
                      placeholder="0.0000"
                    />
                  </div>
                </div>
              </div>

              <!-- Dimensi item RST -->
              <div v-if="rst.item_rst_id" class="rst-dimension-hint">
                📐 {{ getRstDimensionText(rst.item_rst_id) }}
              </div>
            </div>

            <div class="add-rst-section">
              <button type="button" class="btn-add-rst" @click="addRstRow">
                <span class="add-icon">➕</span>
                <span class="add-text">Tambah Item RST Lainnya</span>
              </button>
            </div>
          </div>

          <!-- FORM ACTIONS -->
          <div class="form-actions-modern">
            <button
              type="button"
              class="btn-action btn-cancel-modern"
              @click="router.push({ name: 'admin-dashboard' })"
            >
              <span class="btn-icon">↩️</span>
              <span class="btn-text">Batal</span>
            </button>
            <button type="submit" class="btn-action btn-submit-modern" :disabled="isSubmitting">
              <span class="btn-icon">💾</span>
              <span class="btn-text">{{ isSubmitting ? 'Menyimpan...' : 'Simpan Produksi Sawmill' }}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  </DashboardLayout>

  <!-- MODAL TAMBAH ITEM RST BARU -->
  <div v-if="showModalTambahRst" class="modal-overlay" @click.self="closeModalTambahRst">
    <div class="modal-card">
      <div class="modal-header">
        <h3>➕ Tambah Item RST Baru</h3>
        <button type="button" @click="closeModalTambahRst" class="modal-close">✕</button>
      </div>

      <div class="modal-body">
        <p class="modal-hint">Item baru akan otomatis masuk ke Master Data & Stok.</p>

        <div class="form-group-modern">
          <label class="form-label-modern">Nama Dasar <span class="required-star">*</span></label>
          <input v-model="formRstBaru.nama_dasar" type="text" class="form-input-modern input-plain"
            placeholder="Contoh: Kayu Jati RST" />
        </div>

        <div class="form-grid-3col">
          <div class="form-group-modern">
            <label class="form-label-modern">Tebal (mm) <span class="required-star">*</span></label>
            <input v-model.number="formRstBaru.tebal_mm" type="number" min="0" class="form-input-modern input-plain"
              placeholder="0" />
          </div>
          <div class="form-group-modern">
            <label class="form-label-modern">Lebar (mm)</label>
            <input v-model.number="formRstBaru.lebar_mm" type="number" min="0" class="form-input-modern input-plain"
              placeholder="0" />
          </div>
          <div class="form-group-modern">
            <label class="form-label-modern">Panjang (mm)</label>
            <input v-model.number="formRstBaru.panjang_mm" type="number" min="0" class="form-input-modern input-plain"
              placeholder="0" />
          </div>
        </div>

        <div class="form-grid-2col">
          <div class="form-group-modern">
            <label class="form-label-modern">Kode Barang</label>
            <input v-model="formRstBaru.kode_barang" type="text" class="form-input-modern input-plain"
              placeholder="Kosongkan = auto generate" />
          </div>
          <div class="form-group-modern">
            <label class="form-label-modern">Jenis</label>
            <input v-model="formRstBaru.jenis" type="text" class="form-input-modern input-plain"
              placeholder="Contoh: Jati, Mahoni" />
          </div>
        </div>

        <!-- Preview nama otomatis -->
        <div v-if="formRstBaru.nama_dasar && formRstBaru.tebal_mm" class="preview-nama">
          📦 Preview nama: <strong>{{ previewNamaRst }}</strong>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn-action btn-cancel-modern" @click="closeModalTambahRst">
          Batal
        </button>
        <button type="button" class="btn-action btn-submit-modern" :disabled="isSavingRst" @click="simpanRstBaru">
          {{ isSavingRst ? '⏳ Menyimpan...' : '💾 Simpan & Pilih' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

const router = useRouter()
const { showSuccess, showError } = useNotification()
const isSubmitting = ref(false)

// === MODAL TAMBAH RST BARU ===
const showModalTambahRst = ref(false)
const isSavingRst = ref(false)
const formRstBaru = reactive({
  nama_dasar: '',
  kode_barang: '',
  tebal_mm: null,
  lebar_mm: null,
  panjang_mm: null,
  jenis: '',
})

const previewNamaRst = computed(() => {
  const t = formRstBaru.tebal_mm || 0
  const l = formRstBaru.lebar_mm || 0
  const p = formRstBaru.panjang_mm || 0
  return `${formRstBaru.nama_dasar} ${t}x${l}x${p}`
})

const form = reactive({
  date: new Date().toISOString().slice(0, 10),
  estimated_finish_date: '',   // ✅ tambah ini
  notes: '',
  logs: [{ local_id: Date.now(), item_log_id: null, qty_log_pcs: null }],
  rsts: [{ local_id: Date.now() + 1, item_rst_id: null, qty_rst_pcs: null, volume_rst_m3: 0 }],
})

const logItems         = ref([])
const rstItems         = ref([])
const warehouses       = ref([])
const productionOrders = ref([])

// ✅ PO opsional — tidak wajib dipilih
const selectedProductionOrderId = ref(null)
const poTargets = ref([])
const poInfo    = ref({ buyer_name: null, so_number: null })

// ============================================================
// COMPUTED
// ============================================================

const productionOrdersForSelect = computed(() =>
  productionOrders.value.map((po) => ({
    id: po.id,
    po_number: po.po_number,
    display_name: po.label || po.po_number,
    label: po.label || po.po_number,
  }))
)

const logItemsForSelect = computed(() =>
  logItems.value.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    no_skshhk: item.no_skshhk || '-',
    tpk: item.tpk || '-',
    label: `${item.code} - ${item.name}`,
  }))
)

const rstItemsForSelect = computed(() =>
  rstItems.value.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    volume_m3: item.volume_m3 || 0,
    specifications: item.specifications || {},
    label: `${item.code} - ${item.name}`,
  }))
)

// ============================================================
// METHODS
// ============================================================

const fetchItems = async () => {
  try {
    const [logsRes, rstRes, whRes, poRes] = await Promise.all([
      apiClient.get('/materials', { params: { category_name: 'Kayu Log', per_page: 500 } }),
      apiClient.get('/materials', { params: { category_name: 'Kayu RST', per_page: 500 } }),
      apiClient.get('/warehouses'),
      apiClient.get('/production-orders', { params: { status_not: 'completed', for_sawmill: 1, include: 'sales_order' } }),
    ])

    logItems.value         = logsRes.data.data?.data || logsRes.data.data || []
    rstItems.value         = rstRes.data.data?.data  || rstRes.data.data  || []
    warehouses.value       = whRes.data.data         || whRes.data        || []
    productionOrders.value = poRes.data.data?.data   || poRes.data.data   || []
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil data awal')
  }
}

const handlePoChange = async () => {
  poTargets.value = []
  poInfo.value    = { buyer_name: null, so_number: null }
  if (!selectedProductionOrderId.value) return

  try {
    const res  = await apiClient.get(`/production-orders/${selectedProductionOrderId.value}`)
    const data = res.data.data || {}
    poInfo.value    = { buyer_name: data.sales_order?.buyer_name || null, so_number: data.sales_order?.so_number || null }
    poTargets.value = data.targets || []
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil detail Production Order')
  }
}

const handlePoDeselect = () => {
  poTargets.value = []
  poInfo.value    = { buyer_name: null, so_number: null }
}

const getWarehouseIdByCode = (code) => {
  const wh = warehouses.value.find((w) => w.code === code)
  return wh ? wh.id : null
}

const getRstItem = (itemId) => rstItems.value.find((i) => i.id === itemId) || null

const getRstDimensionText = (itemId) => {
  const item = getRstItem(itemId)
  if (!item) return '-'
  const specs = item.specifications || {}
  const { t, l, p } = specs
  return t && l && p ? `${t} x ${l} x ${p} mm` : item.name
}

const updateRstVolume = (index) => {
  const row  = form.rsts[index]
  if (!row) return
  const item = getRstItem(row.item_rst_id)
  row.volume_rst_m3 = (item?.volume_m3 && row.qty_rst_pcs)
    ? Number((row.qty_rst_pcs * Number(item.volume_m3)).toFixed(4))
    : 0
}

const addLogRow = () => form.logs.push({ local_id: Date.now() + Math.random(), item_log_id: null, qty_log_pcs: null })
const removeLogRow = (i) => form.logs.splice(i, 1)

const openModalTambahRst = () => {
  formRstBaru.nama_dasar = ''
  formRstBaru.kode_barang = ''
  formRstBaru.tebal_mm = null
  formRstBaru.lebar_mm = null
  formRstBaru.panjang_mm = null
  formRstBaru.jenis = ''
  showModalTambahRst.value = true
}

const closeModalTambahRst = () => {
  showModalTambahRst.value = false
}

const simpanRstBaru = async () => {
  if (!formRstBaru.nama_dasar || !formRstBaru.tebal_mm) {
    showError('Validasi', 'Nama dasar dan tebal wajib diisi')
    return
  }

  isSavingRst.value = true
  try {
    const res = await apiClient.post('/materials/quick-store-rst', {
      nama_dasar:  formRstBaru.nama_dasar,
      kode_barang: formRstBaru.kode_barang || null,
      tebal_mm:    formRstBaru.tebal_mm,
      lebar_mm:    formRstBaru.lebar_mm || 0,
      panjang_mm:  formRstBaru.panjang_mm || 0,
      jenis:       formRstBaru.jenis || null,
    })

    const itemBaru = res.data.data

    // Tambah ke list RST supaya langsung bisa dipilih
    rstItems.value.push({
      id:             itemBaru.id,
      code:           itemBaru.code,
      name:           itemBaru.name,
      volume_m3:      itemBaru.volume_m3,
      specifications: itemBaru.specifications || {},
    })

    // Otomatis pilih item baru di baris RST terakhir
    const lastRst = form.rsts[form.rsts.length - 1]
    if (lastRst && !lastRst.item_rst_id) {
      lastRst.item_rst_id = itemBaru.id
    } else {
      // Kalau semua baris sudah terisi, tambah baris baru
      form.rsts.push({
        local_id:      Date.now() + Math.random(),
        item_rst_id:   itemBaru.id,
        qty_rst_pcs:   null,
        volume_rst_m3: 0,
      })
    }

    showSuccess('Berhasil', `Item '${itemBaru.name}' berhasil ditambahkan`)
    closeModalTambahRst()
  } catch (error) {
    const message = error.response?.data?.message || 'Gagal menyimpan item RST baru'
    showError('Gagal', message)
  } finally {
    isSavingRst.value = false
  }
}

const addRstRow = () => form.rsts.push({ local_id: Date.now() + Math.random(), item_rst_id: null, qty_rst_pcs: null, volume_rst_m3: 0 })
const removeRstRow = (i) => form.rsts.splice(i, 1)

const handleSubmit = async () => {
  // Validasi baris log
  const validLogs = form.logs.filter((l) => l.item_log_id && l.qty_log_pcs > 0)
  if (validLogs.length === 0) {
    showError('Validasi', 'Minimal satu baris kayu log wajib diisi')
    return
  }

  // Validasi baris RST
  const validRsts = form.rsts.filter((r) => r.item_rst_id && r.qty_rst_pcs > 0)
  if (validRsts.length === 0) {
    showError('Validasi', 'Minimal satu baris hasil RST wajib diisi')
    return
  }

  // Ambil warehouse dari kode (lebih aman daripada nama)
  const warehouseFromId = getWarehouseIdByCode('LOG')
  const warehouseToId   = getWarehouseIdByCode('RSTB')

  if (!warehouseFromId || !warehouseToId) {
    showError('Konfigurasi', 'Gudang LOG atau RSTB tidak ditemukan di master data')
    return
  }

  isSubmitting.value = true

  try {
    const payload = {
      date:                  form.date,
      estimated_finish_date: form.estimated_finish_date || null,  // ✅ tambah ini
      warehouse_from_id:     warehouseFromId,
      warehouse_to_id:   warehouseToId,
      notes:             form.notes || null,
      // ✅ Kirim null jika tidak ada PO — backend sudah nullable
      ref_po_id:         selectedProductionOrderId.value ? Number(selectedProductionOrderId.value) : null,
      ref_product_id:    null,
      logs: validLogs.map((l) => ({
        item_log_id:  l.item_log_id,
        qty_log_pcs:  l.qty_log_pcs,
      })),
      rsts: validRsts.map((r) => ({
        item_rst_id:   r.item_rst_id,
        qty_rst_pcs:   r.qty_rst_pcs,
        volume_rst_m3: r.volume_rst_m3,
      })),
    }

    await apiClient.post('/sawmill-productions', payload)
    showSuccess('Sukses', 'Produksi Sawmill berhasil dicatat')
    router.push({ name: 'SawmillReport' })
  } catch (error) {
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors && JSON.stringify(error.response.data.errors)) ||
      'Gagal mencatat produksi Sawmill'
    showError('Gagal', message)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchItems)
</script>

<style scoped>
.optional-tag {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 8px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  vertical-align: middle;
}

.field-hint {
  margin-top: 6px;
  font-size: 0.82rem;
  color: #6b7280;
}

.po-selected-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  margin-top: 4px;
}

.po-info-icon { font-size: 1.25rem; }
.po-info-buyer { font-weight: 700; font-size: 0.95rem; color: #111827; }
.po-info-so { font-size: 0.82rem; color: #6b7280; }

.po-empty-info {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 10px;
  font-size: 0.88rem;
  color: #9ca3af;
  margin-top: 4px;
}

.form-grid-3col {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.25rem;
}

.item-row-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.item-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.item-row-number {
  font-size: 0.82rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-remove-row {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 0.82rem;
  cursor: pointer;
  font-weight: 700;
  transition: background 0.2s;
}
.btn-remove-row:hover { background: #fecaca; }

.rst-dimension-hint {
  margin-top: 8px;
  font-size: 0.82rem;
  color: #6b7280;
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 6px;
  display: inline-block;
}

.section-icon-badge--log { background: linear-gradient(135deg, #d97706, #b45309); }
.section-icon-badge--rst { background: linear-gradient(135deg, #2563eb, #1d4ed8); }

/* Reuse styles dari file asli (tidak duplikasi, hanya override) */
.page-header-sawmill {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  padding: 2rem 2.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(245, 158, 11, 0.3);
}
.header-content-wrapper { display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
.header-left-section { display: flex; align-items: center; gap: 1.5rem; flex: 1; }
.icon-badge-sawmill { width: 72px; height: 72px; border-radius: 18px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; }
.sawmill-icon { font-size: 2.5rem; }
.page-title-sawmill { font-size: 2rem; font-weight: 800; color: white; margin: 0 0 0.5rem; }
.page-subtitle-sawmill { color: rgba(255,255,255,0.95); font-size: 1rem; margin: 0; font-weight: 500; }
.process-badge { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem; background: rgba(255,255,255,0.95); border-radius: 16px; }
.process-icon { font-size: 1.5rem; }
.process-arrow { font-size: 1.25rem; color: #d97706; font-weight: 700; }

.content-card-sawmill { background: white; border-radius: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #f0f2f5; overflow: hidden; }
.card-body-sawmill { padding: 2.5rem; }

.form-section-modern { margin-bottom: 2.5rem; padding-bottom: 2.5rem; border-bottom: 3px solid #e5e7eb; }
.form-section-modern:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }

.section-header { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.75rem; padding: 1.25rem 1.5rem; background: linear-gradient(135deg, #f9fafb, #f3f4f6); border-radius: 14px; border-left: 5px solid #f59e0b; }
.section-icon-badge { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #f59e0b, #d97706); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.section-icon { font-size: 1.25rem; }
.section-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0 0 0.2rem; }
.section-subtitle { font-size: 0.875rem; color: #6b7280; margin: 0; }

.form-grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.form-group-modern { display: flex; flex-direction: column; }
.form-label-modern { font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
.required-star { color: #ef4444; }
.input-wrapper-icon { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 1.125rem; font-size: 1rem; z-index: 1; pointer-events: none; }
.form-input-modern { width: 100%; padding: 0.9rem 1.25rem 0.9rem 3.25rem; border: 2.5px solid #e5e7eb; border-radius: 12px; font-size: 1rem; font-weight: 500; transition: all 0.3s ease; background: white; }
.form-input-modern:focus { outline: none; border-color: #f59e0b; box-shadow: 0 0 0 4px rgba(245,158,11,0.15); }

.add-rst-section { margin-top: 0.75rem; }
.btn-add-rst { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: #fef3c7; border: 2px dashed #f59e0b; border-radius: 10px; color: #92400e; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
.btn-add-rst:hover { background: #fde68a; }

.po-hint-box { margin-top: 1.25rem; border-radius: 16px; border: 1px solid #fde68a; background: linear-gradient(135deg, #fffbeb, #fef3c7); padding: 1.25rem 1.5rem; }
.po-hint-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.po-hint-title-wrap { display: flex; align-items: center; gap: 0.75rem; }
.po-hint-icon { font-size: 1.25rem; }
.po-hint-title { font-weight: 700; font-size: 0.95rem; color: #92400e; }
.po-hint-sub { font-size: 0.82rem; color: #b45309; }
.po-hint-badge { background: #f59e0b; color: white; border-radius: 999px; padding: 2px 12px; font-size: 0.8rem; font-weight: 700; }
.po-hint-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.po-hint-table th { padding: 6px 10px; text-align: left; color: #92400e; font-size: 0.78rem; text-transform: uppercase; border-bottom: 1px solid #fde68a; }
.po-hint-table td { padding: 6px 10px; color: #374151; border-bottom: 1px solid #fef3c7; }

.form-actions-modern { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb; }
.btn-action { display: flex; align-items: center; gap: 0.5rem; padding: 0.875rem 1.75rem; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
.btn-cancel-modern { background: #f3f4f6; color: #374151; }
.btn-cancel-modern:hover { background: #e5e7eb; }
.btn-submit-modern { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; box-shadow: 0 4px 12px rgba(245,158,11,0.35); }
.btn-submit-modern:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(245,158,11,0.45); }
.btn-submit-modern:disabled { opacity: 0.6; cursor: not-allowed; }

.vue-select-rst { --vs-border-color: #e5e7eb; --vs-border-width: 2.5px; --vs-border-radius: 12px; }
.vue-select-rst :deep(.vs__dropdown-toggle) { padding: 0.875rem 1.25rem; border: var(--vs-border-width) solid var(--vs-border-color); border-radius: var(--vs-border-radius); min-height: 54px; }
.vue-select-rst.vs--open :deep(.vs__dropdown-toggle) { border-color: #f59e0b; box-shadow: 0 0 0 4px rgba(245,158,11,0.15); }
.rst-option-item { padding: 0.75rem 1rem; display: flex; flex-direction: column; gap: 0.2rem; }
.rst-option-code { font-size: 0.82rem; font-weight: 700; color: #f59e0b; }
.rst-option-name { font-size: 0.9rem; color: #111827; font-weight: 500; }
.rst-option-spec { font-size: 0.78rem; color: #9ca3af; }

@media (max-width: 768px) {
  .form-grid-2col, .form-grid-3col { grid-template-columns: 1fr; }
  .card-body-sawmill { padding: 1.25rem; }
}

.btn-quick-add {
  margin-left: 8px;
  padding: 2px 10px;
  background: #dcfce7;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  vertical-align: middle;
  transition: all 0.2s;
}
.btn-quick-add:hover { background: #bbf7d0; }

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-card {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 560px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  overflow: hidden;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
}
.modal-header h3 { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0; }
.modal-close {
  background: #fee2e2; color: #ef4444; border: none;
  border-radius: 8px; padding: 4px 10px; cursor: pointer; font-weight: 700;
}
.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.modal-hint { font-size: 0.85rem; color: #6b7280; margin: 0; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 1rem;
  padding: 1.25rem 1.5rem; border-top: 2px solid #e5e7eb;
}
.input-plain { padding-left: 1.25rem !important; }
.preview-nama {
  padding: 10px 14px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  font-size: 0.88rem;
  color: #374151;
}
</style>