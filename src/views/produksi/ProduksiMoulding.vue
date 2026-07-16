<template>
  <DashboardLayout>
    <!-- HEADER -->
    <div class="page-header-moulding">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-moulding">
            <span class="moulding-icon">⚙️</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-moulding">Produksi Moulding</h1>
            <p class="page-subtitle-moulding">
              Catat pemakaian RST, hasil komponen, dan reject untuk setiap Production Order.
            </p>
          </div>
        </div>
        <div class="header-badge-section">
          <div class="process-badge">
            <span class="process-icon">🪵</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">⚙️</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">🔩</span>
          </div>
          <div class="flow-label-moulding">RST → Moulding → Komponen</div>
        </div>
      </div>
    </div>

    <div class="content-card-moulding">
      <div class="card-body-moulding">
        <form @submit.prevent="handleSubmit" @keydown.enter.prevent>

          <!-- SECTION 1: INFO UMUM -->
          <div class="form-section-modern">
            <div class="section-header section-header-moulding">
              <div class="section-icon-badge">
                <span class="section-icon">📅</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Informasi Umum</h3>
                <p class="section-subtitle">Tanggal, PO, dan catatan proses</p>
              </div>
            </div>

            <div class="form-grid-4col">
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

              <!-- PRODUK YANG DIKERJAKAN -->
              <div class="form-group-modern" v-if="form.ref_po_id">
                <label class="form-label-modern">
                  Produk yang Dikerjakan <span class="required-star">*</span>
                </label>
                <vue-select
                  v-model="form.production_order_detail_id"
                  :options="poDetailItems"
                  :reduce="(d) => d.id"
                  label="label"
                  placeholder="🔍 Pilih produk..."
                  :clearable="true"
                  class="vue-select-po"
                >
                  <template #option="d">
                    <div class="detail-option">
                      <span class="detail-option-name">{{ d.item_name }}</span>
                      <span class="detail-option-code">{{ d.item_code }}</span>
                      <span :class="['detail-option-badge', d.moulding_done ? 'badge-done' : 'badge-pending']">
                        {{ d.moulding_done ? '✓ Sudah' : '○ Belum' }}
                      </span>
                    </div>
                  </template>
                  <template #selected-option="d">
                    <span>{{ d.item_name }}</span>
                    <span v-if="d.moulding_done" class="badge-done-inline">✓</span>
                  </template>
                </vue-select>
                <p v-if="poDetailItems.length > 0" class="detail-hint">
                  {{ poDetailItems.filter(d => d.moulding_done).length }} / {{ poDetailItems.length }} produk sudah moulding
                </p>
              </div>

              <div class="form-group-modern" v-if="form.production_order_detail_id">
                <label class="form-label-modern">
                  Qty Produk Jadi
                  <span class="field-hint-inline">(berapa unit produk jadi setara dari batch ini)</span>
                </label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">📦</span>
                  <input
                    v-model.number="form.qty_produk_jadi"
                    type="number"
                    min="0"
                    step="any"
                    class="form-input-modern"
                    placeholder="Contoh: 20"
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
                    placeholder="Catatan proses moulding..."
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

          <!-- SECTION 2: GRUP PRODUKSI (N ukuran kayu → 1 komponen per grup) -->
          <div class="form-section-modern">
            <div class="section-header section-header-moulding">
              <div class="section-icon-badge section-badge-rst">
                <span class="section-icon">🔗</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Grup Produksi</h3>
                <p class="section-subtitle">
                  Tiap grup: beberapa ukuran kayu RST → 1 Komponen + reject opsional
                  <span class="btn-quick-add-wrap">
                    <button type="button" class="btn-quick-add" @click="openModalKomponen">➕ Komponen Cepat</button>
                    <button type="button" class="btn-stok-index" @click="router.push({ name: 'StockIndex', query: { tab: 'rst' } })">+ Stok Kayu RST</button>
                  </span>
                </p>
              </div>
            </div>

            <div
              v-for="(group, gi) in form.groups"
              :key="group.local_id"
              class="group-card"
            >
              <!-- Header grup -->
              <div class="group-header">
                <span class="group-number">Grup #{{ gi + 1 }}</span>
                <button v-if="form.groups.length > 1" type="button" class="btn-remove-row" @click="removeGroup(gi)">✕ Hapus Grup</button>
              </div>

              <!-- INPUT KAYU RST (bisa banyak) -->
              <div class="line-block line-block--input">
                <span class="line-label">📥 INPUT KAYU RST ({{ group.inputs.length }} ukuran)</span>

                <div
                  v-for="(inp, ii) in group.inputs"
                  :key="inp.local_id"
                  class="input-row"
                >
                  <div class="form-grid-2col" style="margin-bottom:0;">
                    <div class="form-group-modern">
                      <label v-if="ii === 0" class="form-label-modern">Item RST <span class="required-star">*</span></label>
                      <vue-select
                        v-model="inp.item_id"
                        :options="rstItemsForSelect"
                        :reduce="(o) => o.id"
                        label="label"
                        placeholder="🔍 Cari kayu RST..."
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
                    <div class="form-group-modern" style="flex-direction:row;align-items:flex-end;gap:0.5rem;">
                      <div style="flex:1;">
                        <label v-if="ii === 0" class="form-label-modern">Qty (pcs) <span class="required-star">*</span></label>
                        <div class="input-wrapper-icon">
                          <span class="input-icon">🔢</span>
                          <input v-model.number="inp.qty" type="number" min="0.01" step="0.01" class="form-input-modern" placeholder="0" />
                        </div>
                      </div>
                      <button
                        v-if="group.inputs.length > 1"
                        type="button"
                        class="btn-remove-input"
                        :style="ii === 0 ? 'margin-top:1.75rem;' : ''"
                        @click="removeInput(gi, ii)"
                      >✕</button>
                    </div>
                  </div>
                </div>

                <button type="button" class="btn-add-input" @click="addInput(gi)">
                  ➕ Tambah Ukuran Kayu
                </button>
              </div>

              <!-- OUTPUT KOMPONEN -->
              <div class="line-block line-block--output">
                <span class="line-label">📤 OUTPUT KOMPONEN → S4S</span>
                <div class="form-grid-2col">
                  <div class="form-group-modern">
                    <label class="form-label-modern">Item Komponen <span class="required-star">*</span></label>
                    <vue-select
                      v-model="group.output_item_id"
                      :options="komponenItemsForSelect"
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
                    <label class="form-label-modern">Qty Output (pcs) <span class="required-star">*</span></label>
                    <div class="input-wrapper-icon">
                      <span class="input-icon">🔢</span>
                      <input v-model.number="group.output_qty" type="number" min="1" class="form-input-modern" placeholder="0" />
                    </div>
                  </div>
                </div>
                <div class="form-group-modern">
                  <label class="form-label-modern">Jenis Finishing <span class="required-star">*</span></label>
                  <div class="finishing-toggle">
                    <label class="finishing-option">
                      <input type="radio" v-model="group.finishing" value="natural" />
                      <span>🌳 Natural</span>
                    </label>
                    <label class="finishing-option">
                      <input type="radio" v-model="group.finishing" value="warna" />
                      <span>🎨 Warna</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- REJECT (toggle) -->
              <div class="line-reject-toggle">
                <button type="button" class="btn-toggle-reject" @click="group.show_reject = !group.show_reject">
                  {{ group.show_reject ? '▲ Sembunyikan Reject' : '⚠️ + Tambah Reject' }}
                </button>
              </div>

              <div v-if="group.show_reject" class="line-block line-block--reject">
                <span class="line-label">♻️ REJECT → Gudang REJECT</span>
                <div class="form-grid-2col" style="margin-bottom:0.75rem;">
                  <div class="form-group-modern">
                    <label class="form-label-modern">Item Reject (RST atau Komponen)</label>
                    <vue-select
                      v-model="group.reject_item_id"
                      :options="[...rstItemsForSelect, ...komponenItemsForSelect]"
                      :reduce="(o) => o.id"
                      label="label"
                      placeholder="🔍 Pilih item reject..."
                      class="vue-select-item"
                    />
                  </div>
                  <div class="form-group-modern">
                    <label class="form-label-modern">Qty Reject</label>
                    <div class="input-wrapper-icon">
                      <span class="input-icon">🔢</span>
                      <input v-model.number="group.reject_qty" type="number" min="0.01" step="0.01" class="form-input-modern" placeholder="0" />
                    </div>
                  </div>
                </div>
                <div class="form-grid-2col">
                  <div class="form-group-modern">
                    <label class="form-label-modern">Penyebab</label>
                    <div class="reject-type-toggle">
                      <button type="button" :class="['toggle-btn', group.reject_type === 'moulding' ? 'active-reject' : '']" @click="group.reject_type = 'moulding'">⚙️ Moulding</button>
                      <button type="button" :class="['toggle-btn', group.reject_type === 'pembahanan' ? 'active-reject' : '']" @click="group.reject_type = 'pembahanan'">🪚 Pembahanan</button>
                    </div>
                  </div>
                  <div class="form-group-modern">
                    <label class="form-label-modern">Keterangan</label>
                    <div class="input-wrapper-icon">
                      <span class="input-icon">📝</span>
                      <input v-model="group.reject_notes" type="text" class="form-input-modern" placeholder="Contoh: urat bengkok" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button type="button" class="btn-add-row btn-add-rst" @click="addGroup">
              ➕ Tambah Grup Komponen
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
              <span class="btn-text">{{ isMarkingDone ? 'Memproses...' : 'Selesai Moulding' }}</span>
            </button>

            <button type="submit" class="btn-action btn-submit-modern" :disabled="isSubmitting">
              <span class="btn-icon">💾</span>
              <span class="btn-text">{{ isSubmitting ? 'Menyimpan...' : 'Simpan Moulding' }}</span>
            </button>
          </div>

        </form>
      </div>
    </div>

    <!-- MODAL TAMBAH KOMPONEN BARU -->
    <div v-if="showModalKomponen" class="modal-overlay" @click.self="closeModalKomponen">
      <div class="modal-card">
        <div class="modal-header">
          <h3>➕ Tambah Komponen Baru</h3>
          <button type="button" @click="closeModalKomponen" class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <p class="modal-hint">Item baru akan otomatis masuk ke Master Data.</p>
          <div class="form-group-modern">
            <label class="form-label-modern">Nama Komponen <span class="required-star">*</span></label>
            <input v-model="formKomponenBaru.name" type="text" class="form-input-modern input-plain" placeholder="Contoh: Kaki Depan Archi" />
          </div>
          <div class="form-grid-2col">
            <div class="form-group-modern">
              <label class="form-label-modern">Kode</label>
              <input v-model="formKomponenBaru.code" type="text" class="form-input-modern input-plain" placeholder="Auto generate jika kosong" />
            </div>
            <div class="form-group-modern">
              <label class="form-label-modern">Kategori <span class="required-star">*</span></label>
              <input v-model="formKomponenBaru.category" type="text" class="form-input-modern input-plain" placeholder="Contoh: Komponen Kaki" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-action btn-cancel-modern" @click="closeModalKomponen">Batal</button>
          <button type="button" class="btn-action btn-submit-modern" :disabled="isSavingKomponen" @click="simpanKomponenBaru">
            {{ isSavingKomponen ? '⏳ Menyimpan...' : '💾 Simpan & Pilih' }}
          </button>
        </div>
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
const isMarkingDone = ref(false)

// === DATA ===
const productionOrders = ref([])
const rstItems         = ref([])
const komponenItems    = ref([])
const poInfo           = ref({ buyer_name: null, so_number: null })
const poTargets        = ref([])
const poDetailItems    = ref([])

const newInput = () => ({
  local_id: Date.now() + Math.random(),
  item_id:  null,
  qty:      null,
})

const newGroup = () => ({
  local_id:        Date.now() + Math.random(),
  output_item_id:  null,
  output_qty:      null,
  finishing:       'natural',
  inputs:          [newInput()],
  reject_item_id:  null,
  reject_qty:      null,
  reject_type:     'moulding',
  reject_notes:    '',
  show_reject:     false,
})

const form = reactive({
  date:                        new Date().toISOString().slice(0, 10),
  estimated_finish_date:       '',
  ref_po_id:                   null,
  production_order_detail_id:  null,
  qty_produk_jadi:             null,
  notes:                       '',
  groups:                      [newGroup()],
})

// === MODAL KOMPONEN BARU ===
const showModalKomponen  = ref(false)
const isSavingKomponen   = ref(false)
const formKomponenBaru   = reactive({ name: '', code: '', category: '' })

// === COMPUTED ===
const rstItemsForSelect = computed(() =>
  rstItems.value.map((i) => ({
    id:    i.id,
    code:  i.code,
    name:  i.name,
    label: `${i.code} - ${i.name}`,
  }))
)

const komponenItemsForSelect = computed(() =>
  komponenItems.value.map((i) => ({
    id:          i.id,
    code:        i.code,
    name:        i.name,
    nama_produk: i.nama_produk || '',
    category:    i.category,
    label:       i.nama_produk
      ? `${i.code} - ${i.name} (${i.nama_produk})`
      : `${i.code} - ${i.name}`,
  }))
)

// === FETCH DATA ===
const fetchInitialData = async () => {
  try {
    const [poRes, rstRes, kompRes] = await Promise.all([
      apiClient.get('/produksi/moulding/available-pos', { params: { type: 'production' } }),
      apiClient.get('/produksi/moulding/rst-items'),
      apiClient.get('/stock-report', { params: { categories: 'Komponen', per_page: 9999 } }),
    ])
    productionOrders.value = poRes.data.data || []
    rstItems.value         = rstRes.data.data || []

    const kompData = kompRes.data.data?.data ?? kompRes.data.data ?? []
    komponenItems.value = Array.isArray(kompData) ? kompData : []
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil data awal')
  }
}

const handlePoChange = async (opt) => {
  poInfo.value                       = { buyer_name: null, so_number: null }
  poTargets.value                    = []
  poDetailItems.value                = []
  form.production_order_detail_id    = null
  form.qty_produk_jadi               = null
  if (!opt) return

  const [poResult, detailResult] = await Promise.allSettled([
    apiClient.get(`/production-orders/${opt.id}`),
    apiClient.get(`/produksi/moulding/po-detail-items/${opt.id}`),
  ])

  const data = poResult.status === 'fulfilled' ? (poResult.value.data.data || {}) : {}
  if (poResult.status === 'rejected') console.error('PO info gagal dimuat:', poResult.reason)

  poInfo.value = {
    buyer_name: data.sales_order?.buyer_name || opt.buyer_name || null,
    so_number:  data.sales_order?.so_number  || opt.so_number  || null,
  }
  poTargets.value = data.targets || []

  if (detailResult.status === 'fulfilled') {
    const details = detailResult.value.data.data || []
    poDetailItems.value = details.map((d) => ({ ...d, label: d.item_name }))
  } else {
    console.error('Detail produk gagal dimuat:', detailResult.reason)
    showError('Error', 'Gagal memuat daftar produk untuk PO ini')
  }
}

const handlePoDeselect = () => {
  poInfo.value                    = { buyer_name: null, so_number: null }
  poTargets.value                 = []
  poDetailItems.value             = []
  form.production_order_detail_id = null
  form.qty_produk_jadi            = null
}

// === GRUP & INPUT MANAGEMENT ===
const addGroup    = () => form.groups.push(newGroup())
const removeGroup = (gi) => form.groups.splice(gi, 1)
const addInput    = (gi) => form.groups[gi].inputs.push(newInput())
const removeInput = (gi, ii) => form.groups[gi].inputs.splice(ii, 1)

// === MODAL KOMPONEN BARU ===
const openModalKomponen  = () => {
  formKomponenBaru.name     = ''
  formKomponenBaru.code     = ''
  formKomponenBaru.category = ''
  showModalKomponen.value   = true
}
const closeModalKomponen = () => { showModalKomponen.value = false }

const simpanKomponenBaru = async () => {
  if (!formKomponenBaru.name || !formKomponenBaru.category) {
    showError('Validasi', 'Nama dan kategori wajib diisi')
    return
  }
  isSavingKomponen.value = true
  try {
    const res = await apiClient.post('/materials/quick-store-komponen', {
      name:     formKomponenBaru.name,
      code:     formKomponenBaru.code || null,
      category: formKomponenBaru.category,
    })
    const itemBaru = res.data.data
    komponenItems.value.push({ id: itemBaru.id, code: itemBaru.code, name: itemBaru.name, category: itemBaru.category })
    // Pilih di grup terakhir yang belum ada output
    const lastGroup = form.groups[form.groups.length - 1]
    if (lastGroup && !lastGroup.output_item_id) lastGroup.output_item_id = itemBaru.id
    showSuccess('Berhasil', `Komponen '${itemBaru.name}' berhasil ditambahkan`)
    closeModalKomponen()
  } catch (error) {
    showError('Gagal', error.response?.data?.message || 'Gagal menyimpan komponen baru')
  } finally {
    isSavingKomponen.value = false
  }
}

// === SUBMIT ===
const handleSubmit = async () => {
  if (!form.ref_po_id) { showError('Validasi', 'Production Order wajib dipilih'); return }
  if (!form.production_order_detail_id) { showError('Validasi', 'Produk yang dikerjakan wajib dipilih'); return }

  const validGroups = form.groups.filter((g) => {
    const hasOutput = g.output_item_id && g.output_qty > 0
    const hasInputs = g.inputs.some((i) => i.item_id && i.qty > 0)
    return hasOutput && hasInputs
  })
  if (validGroups.length === 0) {
    showError('Validasi', 'Minimal satu grup dengan output komponen dan input kayu wajib diisi')
    return
  }

  isSubmitting.value = true
  try {
    const payload = {
      date:                       form.date,
      ref_po_id:                  Number(form.ref_po_id),
      production_order_detail_id: Number(form.production_order_detail_id),
      qty_produk_jadi:            form.qty_produk_jadi !== null && form.qty_produk_jadi !== '' ? Number(form.qty_produk_jadi) : null,
      notes:                      form.notes || null,
      groups: validGroups.map((g) => ({
        output_item_id: Number(g.output_item_id),
        output_qty:     Number(g.output_qty),
        finishing:      g.finishing || 'natural',
        inputs: g.inputs
          .filter((i) => i.item_id && i.qty > 0)
          .map((i) => ({ item_id: Number(i.item_id), qty: Number(i.qty) })),
        reject_item_id: g.reject_item_id && g.reject_qty > 0 ? Number(g.reject_item_id) : null,
        reject_qty:     g.reject_qty > 0 ? Number(g.reject_qty) : null,
        reject_type:    g.reject_type  || null,
        reject_notes:   g.reject_notes || null,
      })),
    }

    await apiClient.post('/produksi/moulding', payload)
    showSuccess('Sukses', 'Proses Moulding berhasil dicatat')
    router.push({ name: 'ProduksiMesin' })
  } catch (error) {
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors && JSON.stringify(error.response.data.errors)) ||
      'Gagal menyimpan moulding'
    showError('Gagal', message)
  } finally {
    isSubmitting.value = false
  }
}

const tandaiSelesai = async () => {
  if (!form.ref_po_id) return

  // Cek status semua produk sebelum konfirmasi
  const pending = poDetailItems.value.filter((d) => !d.moulding_done)
  if (pending.length > 0) {
    const names = pending.map((d) => d.item_name).join(', ')
    showError('Belum Selesai', `Produk berikut belum selesai moulding: ${names}`)
    return
  }

  if (!confirm('Semua produk sudah moulding. Tandai PO selesai moulding dan lanjut ke Mesin?')) return

  isMarkingDone.value = true
  try {
    await apiClient.post(`/produksi/moulding/${form.ref_po_id}/selesai`)
    showSuccess('Selesai', 'PO berhasil ditandai selesai moulding, lanjut ke Mesin')
    router.push({ name: 'ProduksiMesin' })
  } catch (error) {
    const msg = error.response?.data?.message || 'Gagal menandai selesai'
    showError('Gagal', msg)
    // Refresh status detail items agar badge terupdate
    if (form.ref_po_id) {
      try {
        const res = await apiClient.get(`/produksi/moulding/po-detail-items/${form.ref_po_id}`)
        const details = res.data.data || []
        poDetailItems.value = details.map((d) => ({ ...d, label: d.item_name }))
      } catch (_) {}
    }
  } finally {
    isMarkingDone.value = false
  }
}

onMounted(fetchInitialData)
</script>

<style scoped>
.finishing-toggle { display: flex; gap: 0.75rem; margin-top: 0.25rem; }
.finishing-option {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.6rem 1.1rem; border: 2px solid #d1d5db; border-radius: 10px;
  cursor: pointer; font-weight: 600; font-size: 0.9rem; color: #374151;
  transition: all 0.15s;
}
.finishing-option:has(input:checked) {
  border-color: #16a34a; background: #f0fdf4; color: #15803d;
}
.finishing-option input { accent-color: #16a34a; }
.page-header-moulding {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  padding: 2rem 2.5rem; border-radius: 20px; margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(22,163,74,0.3);
}
.header-content-wrapper { display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
.header-left-section { display: flex; align-items: center; gap: 1.5rem; flex: 1; }
.icon-badge-moulding { width: 72px; height: 72px; border-radius: 18px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; }
.moulding-icon { font-size: 2.5rem; }
.page-title-moulding { font-size: 2rem; font-weight: 800; color: white; margin: 0 0 0.5rem; }
.page-subtitle-moulding { color: rgba(255,255,255,0.95); font-size: 1rem; margin: 0; font-weight: 500; }
.process-badge { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; background: rgba(255,255,255,0.95); border-radius: 16px; }
.process-icon { font-size: 1.5rem; }
.process-arrow { font-size: 1.25rem; color: #15803d; font-weight: 700; }
.flow-label-moulding { color: rgba(255,255,255,0.9); font-size: 0.85rem; font-weight: 600; margin-top: 6px; text-align: center; }

.content-card-moulding { background: white; border-radius: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #f0f2f5; overflow: hidden; }
.card-body-moulding { padding: 2.5rem; }

.form-section-modern { margin-bottom: 2.5rem; padding-bottom: 2.5rem; border-bottom: 3px solid #e5e7eb; }
.form-section-modern:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }

.section-header { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.75rem; padding: 1.25rem 1.5rem; background: linear-gradient(135deg, #f9fafb, #f0fdf4); border-radius: 14px; border-left: 5px solid #16a34a; }
.section-icon-badge { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #16a34a, #15803d); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.section-badge-rst    { background: linear-gradient(135deg, #d97706, #b45309) !important; }
.section-badge-output { background: linear-gradient(135deg, #2563eb, #1d4ed8) !important; }
.section-badge-reject { background: linear-gradient(135deg, #dc2626, #b91c1c) !important; }
.section-icon { font-size: 1.25rem; }
.section-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0 0 0.2rem; display: flex; align-items: center; gap: 0.5rem; }
.section-subtitle { font-size: 0.875rem; color: #6b7280; margin: 0; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

.form-grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.form-grid-3col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.form-grid-4col { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.form-group-modern { display: flex; flex-direction: column; }
.form-label-modern { font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
.field-hint-inline { font-size: 0.78rem; font-weight: 400; color: #9ca3af; margin-left: 4px; }
.required-star { color: #ef4444; }
.input-wrapper-icon { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 1.125rem; font-size: 1rem; z-index: 1; pointer-events: none; }
.form-input-modern { width: 100%; padding: 0.9rem 1.25rem 0.9rem 3.25rem; border: 2.5px solid #e5e7eb; border-radius: 12px; font-size: 1rem; font-weight: 500; transition: all 0.3s ease; background: white; }
.form-input-modern:focus { outline: none; border-color: #16a34a; box-shadow: 0 0 0 4px rgba(22,163,74,0.15); }
.input-plain { padding-left: 1.25rem !important; }

.po-selected-info { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; margin-bottom: 1rem; }
.po-info-icon { font-size: 1.25rem; }
.po-info-buyer { font-weight: 700; font-size: 0.95rem; color: #111827; }
.po-info-so { font-size: 0.82rem; color: #6b7280; }

.po-hint-box { border-radius: 16px; border: 1px solid #bbf7d0; background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 1.25rem 1.5rem; margin-top: 0.5rem; }
.po-hint-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.po-hint-title-wrap { display: flex; align-items: center; gap: 0.75rem; }
.po-hint-icon { font-size: 1.25rem; }
.po-hint-title { font-weight: 700; font-size: 0.95rem; color: #15803d; }
.po-hint-sub { font-size: 0.82rem; color: #16a34a; }
.po-hint-badge { background: #16a34a; color: white; border-radius: 999px; padding: 2px 12px; font-size: 0.8rem; font-weight: 700; }
.po-hint-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.po-hint-table th { padding: 6px 10px; text-align: left; color: #15803d; font-size: 0.78rem; text-transform: uppercase; border-bottom: 1px solid #bbf7d0; }
.po-hint-table td { padding: 6px 10px; color: #374151; border-bottom: 1px solid #dcfce7; }

/* Group card */
.group-card { background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 16px; padding: 1.5rem; margin-bottom: 1.25rem; }
.group-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.group-number { font-size: 0.88rem; font-weight: 800; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; background: #e5e7eb; padding: 3px 12px; border-radius: 999px; }

.btn-remove-row { background: #fee2e2; color: #ef4444; border: none; border-radius: 8px; padding: 5px 14px; font-size: 0.82rem; cursor: pointer; font-weight: 700; }

/* Input row */
.input-row { margin-bottom: 0.75rem; }
.btn-remove-input { background: #fee2e2; color: #ef4444; border: none; border-radius: 8px; padding: 0 10px; height: 52px; font-size: 0.9rem; cursor: pointer; font-weight: 700; flex-shrink: 0; }

.btn-add-input { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; margin-top: 0.5rem; border: 2px dashed #16a34a; background: #f0fdf4; color: #15803d; }
.btn-add-input:hover { background: #dcfce7; }

.btn-add-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; margin-top: 0.5rem; border: 2px dashed; }
.btn-add-rst    { background: #fef3c7; border-color: #f59e0b; color: #92400e; }
.btn-add-rst:hover { background: #fde68a; }

.reject-type-toggle { display: flex; gap: 0.75rem; }
.toggle-btn { flex: 1; padding: 0.75rem 0.5rem; border: 2px solid #e5e7eb; border-radius: 10px; background: white; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; color: #374151; }
.toggle-btn:hover { border-color: #dc2626; }
.active-reject { border-color: #dc2626 !important; background: #fff5f5 !important; color: #dc2626 !important; }

.btn-quick-add-wrap { margin-left: 8px; display: inline-flex; gap: 6px; align-items: center; }
.btn-quick-add { padding: 2px 10px; background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; border-radius: 999px; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
.btn-quick-add:hover { background: #bbf7d0; }
.btn-stok-index { padding: 2px 10px; background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 999px; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
.btn-stok-index:hover { background: #bfdbfe; }

.form-actions-modern { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb; }
.btn-action { display: flex; align-items: center; gap: 0.5rem; padding: 0.875rem 1.75rem; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
.btn-cancel-modern { background: #f3f4f6; color: #374151; }
.btn-cancel-modern:hover { background: #e5e7eb; }
.btn-submit-modern { background: linear-gradient(135deg, #16a34a, #15803d); color: white; box-shadow: 0 4px 12px rgba(22,163,74,0.35); }
.btn-submit-modern:hover:not(:disabled) { transform: translateY(-1px); }
.btn-submit-modern:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-selesai-modern {
  background: linear-gradient(135deg, #0891b2, #0e7490);
  color: white;
  box-shadow: 0 4px 12px rgba(8, 145, 178, 0.35);
}
.btn-selesai-modern:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(8, 145, 178, 0.45);
}
.btn-selesai-modern:disabled { opacity: 0.6; cursor: not-allowed; }

/* Line blocks */
.line-block { padding: 0.75rem 1rem; border-radius: 10px; margin-bottom: 0.75rem; }
.line-block--input  { background: #f0fdf4; border: 1px solid #bbf7d0; }
.line-block--output { background: #eff6ff; border: 1px solid #bfdbfe; }
.line-block--reject { background: #fff7ed; border: 1px solid #fed7aa; }
.line-label { display: inline-block; font-size: 0.75rem; font-weight: 800; color: #374151; margin-bottom: 0.5rem; letter-spacing: 0.05em; }
.line-reject-toggle { margin-bottom: 0.5rem; }
.btn-toggle-reject { background: none; border: 1px dashed #d1d5db; color: #6b7280; border-radius: 8px; padding: 5px 14px; font-size: 0.8rem; cursor: pointer; transition: all 0.15s; }
.btn-toggle-reject:hover { border-color: #f97316; color: #f97316; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; }
.modal-card { background: white; border-radius: 20px; width: 100%; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); overflow: hidden; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 2px solid #e5e7eb; background: linear-gradient(135deg, #f0fdf4, #dcfce7); }
.modal-header h3 { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0; }
.modal-close { background: #fee2e2; color: #ef4444; border: none; border-radius: 8px; padding: 4px 10px; cursor: pointer; font-weight: 700; }
.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.modal-hint { font-size: 0.85rem; color: #6b7280; margin: 0; }
.modal-footer { display: flex; justify-content: flex-end; gap: 1rem; padding: 1.25rem 1.5rem; border-top: 2px solid #e5e7eb; }

.vue-select-po :deep(.vs__dropdown-toggle),
.vue-select-item :deep(.vs__dropdown-toggle) { padding: 0.875rem 1.25rem; border: 2.5px solid #e5e7eb; border-radius: 12px; min-height: 54px; }
.vue-select-po.vs--open :deep(.vs__dropdown-toggle),
.vue-select-item.vs--open :deep(.vs__dropdown-toggle) { border-color: #16a34a; box-shadow: 0 0 0 4px rgba(22,163,74,0.15); }
.item-option { display: flex; flex-direction: column; gap: 2px; padding: 8px 12px; }
.item-option-code { font-size: 0.82rem; font-weight: 700; color: #16a34a; }
.item-option-name { font-size: 0.9rem; color: #111827; font-weight: 500; }
.item-option-produk { font-size: 0.78rem; color: #2563eb; font-weight: 600; }

/* Detail item dropdown (produk yang dikerjakan) */
.detail-option { display: flex; align-items: center; gap: 0.5rem; padding: 6px 12px; flex-wrap: wrap; }
.detail-option-name { font-size: 0.9rem; font-weight: 600; color: #111827; flex: 1; }
.detail-option-code { font-size: 0.78rem; color: #6b7280; }
.detail-option-badge { font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; flex-shrink: 0; }
.badge-done { background: #dcfce7; color: #15803d; }
.badge-pending { background: #f3f4f6; color: #6b7280; }
.badge-done-inline { font-size: 0.75rem; font-weight: 700; color: #15803d; margin-left: 4px; }
.detail-hint { font-size: 0.78rem; color: #6b7280; margin: 4px 0 0; }

@media (max-width: 768px) {
  .form-grid-2col, .form-grid-3col, .form-grid-4col { grid-template-columns: 1fr; }
  .reject-type-toggle { flex-direction: column; }
  .card-body-moulding { padding: 1.25rem; }
}
</style>
