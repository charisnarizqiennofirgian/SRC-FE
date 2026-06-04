<template>
  <DashboardLayout>
    <div class="page-header">
      <div style="display:flex;align-items:center;gap:1.5rem;">
        <div class="icon-badge"><span>🌡️</span></div>
        <div>
          <h1 class="page-title">KD (Kiln Dry) — Produksi Sampel</h1>
          <p class="page-sub">RST Basah masuk oven → RST Kering ke Gudang RSTK</p>
        </div>
      </div>
    </div>

    <div class="content-card">
      <div class="card-body">
        <form @submit.prevent="handleSubmit" @keydown.enter.prevent>

          <div class="form-section">
            <div class="section-hd"><div class="s-badge"><span>📅</span></div><h3 class="s-title">Informasi Umum</h3></div>
            <div class="g3">
              <div class="fg"><label class="fl">Tanggal *</label><input v-model="form.date" type="date" class="fi" required /></div>
              <div class="fg"><label class="fl">Est. Selesai</label><input v-model="form.estimated_finish_date" type="date" class="fi" /></div>
              <div class="fg"><label class="fl">Production Order *</label>
                <vue-select v-model="form.ref_po_id" :options="posOpts" :reduce="p=>p.id" label="label" placeholder="Pilih PO sampel..." :clearable="true" class="vs" @option:selected="handlePoChange" @option:deselected="resetPo" />
              </div>
            </div>
            <div class="fg"><label class="fl">Catatan</label><input v-model="form.notes" type="text" class="fi" placeholder="Catatan..." /></div>
            <div v-if="poInfo.buyer_name" class="po-info">👤 <strong>{{ poInfo.buyer_name }}</strong> · {{ poInfo.so_number }}</div>
          </div>

          <div class="form-section">
            <div class="section-hd"><div class="s-badge blue"><span>🔄</span></div><h3 class="s-title">Item RST — Basah → Kering *</h3><p class="s-sub">Tiap baris: RST basah (sumber) → RST kering (hasil)</p></div>

            <div v-if="rstItems.length === 0" class="empty-hint">⏳ Memuat data RST...</div>

            <div v-for="(r,i) in form.items" :key="r.lid" class="row-card">
              <div class="row-hd"><span class="rn">Item #{{ i+1 }}</span><button v-if="form.items.length>1" type="button" class="btn-rm" @click="form.items.splice(i,1)">✕</button></div>
              <div class="g2" style="margin-bottom:.75rem;">
                <div class="fg"><label class="fl">RST Basah (sumber) *</label>
                  <vue-select v-model="r.item_id" :options="rstBasahOpts" :reduce="o=>o.id" label="label" placeholder="Pilih RST basah..." class="vs"
                    @option:selected="(o)=>{ r.warehouse_id=o.warehouse_id; r.max_qty=o.qty_available; r.item_code=o.code }" />
                  <div v-if="r.max_qty>0" class="stock-hint">Tersedia: {{ r.max_qty }} pcs</div>
                </div>
                <div class="fg"><label class="fl">Qty (pcs) *</label>
                  <input v-model.number="r.qty" type="number" min="1" :max="r.max_qty||undefined" class="fi" placeholder="0" />
                  <p v-if="r.qty>r.max_qty&&r.max_qty>0" class="qty-warn">⚠️ Melebihi stok</p>
                </div>
              </div>
              <div class="fg"><label class="fl">RST Kering (hasil) *</label>
                <vue-select v-model="r.target_item_id" :options="rstKeringOpts" :reduce="o=>o.id" label="label" placeholder="Pilih RST kering..." class="vs" />
                <p class="hint-txt">📦 Hasil masuk Gudang RSTK</p>
              </div>
            </div>

            <button type="button" class="btn-add a-blue" @click="form.items.push({lid:Date.now(),item_id:null,warehouse_id:null,target_item_id:null,qty:null,max_qty:0})">➕ Tambah Item</button>
          </div>

          <div class="actions">
            <button type="button" class="btn-cancel" @click="router.back()">↩️ Batal</button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">💾 {{ isSubmitting?'Menyimpan...':'Simpan KD Sampel' }}</button>
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
import VueSelect from 'vue-select'; import 'vue-select/dist/vue-select.css'

const router = useRouter()
const { showSuccess, showError } = useNotification()
const isSubmitting = ref(false)
const productionOrders = ref([]); const rstItems = ref([])
const rstInventories = ref([]) // stok RST basah dengan warehouse info
const poInfo = reactive({ buyer_name: null, so_number: null })

const form = reactive({
  date: new Date().toISOString().slice(0,10), estimated_finish_date: '', notes: '', ref_po_id: null,
  items: [{ lid: 1, item_id: null, warehouse_id: null, target_item_id: null, qty: null, max_qty: 0 }],
})

const posOpts = computed(() => productionOrders.value.map(p => ({ id: p.id, label: p.po_number })))

// RST basah dari RSTB warehouse (stok tersedia)
const rstBasahOpts = computed(() =>
  rstInventories.value.map(inv => ({
    id: inv.item_id, label: `${inv.item_code} - ${inv.item_name}`,
    warehouse_id: inv.warehouse_id, qty_available: inv.qty_available, code: inv.item_code,
  }))
)

// RST kering — semua item RST untuk dipilih sebagai target
const rstKeringOpts = computed(() =>
  rstItems.value.map(i => ({ id: i.id, label: `${i.code} - ${i.name}` }))
)

const fetchBase = async () => {
  try {
    const [poRes, rstRes, rstbStockRes] = await Promise.all([
      apiClient.get('/produksi/prototype/available-pos'),
      apiClient.get('/materials', { params: { category_name: 'Kayu RST', per_page: 500 } }),
      apiClient.get('/stock-report', { params: { categories: 'Kayu RST', per_page: 9999 } }),
    ])
    productionOrders.value = poRes.data.data || []
    const d = rstRes.data.data; rstItems.value = Array.isArray(d) ? d : (d?.data||[])

    // Ambil stok RST dari RSTB warehouse
    const stockData = rstbStockRes.data.data?.data ?? rstbStockRes.data.data ?? []
    rstInventories.value = (Array.isArray(stockData) ? stockData : []).map(i => ({
      item_id: i.id || i.item_id, item_code: i.code || i.item_code, item_name: i.name || i.item_name,
      warehouse_id: i.warehouse_id, qty_available: parseFloat(i.qty_pcs || i.qty || 0),
    })).filter(i => i.qty_available > 0)
  } catch (e) { showError('Gagal', 'Gagal mengambil data') }
}

const handlePoChange = async (opt) => {
  poInfo.buyer_name = null; poInfo.so_number = null
  if (!opt) return
  try { const r = await apiClient.get(`/production-orders/${opt.id}`); const d = r.data.data || {}
    poInfo.buyer_name = d.sales_order?.buyer_name || null; poInfo.so_number = d.sales_order?.so_number || null
  } catch (e) { console.error(e) }
}
const resetPo = () => { poInfo.buyer_name = null; poInfo.so_number = null }

const handleSubmit = async () => {
  if (!form.ref_po_id) { showError('Validasi', 'Production Order wajib dipilih'); return }
  const valid = form.items.filter(i => i.item_id && i.warehouse_id && i.target_item_id && i.qty > 0)
  if (!valid.length) { showError('Validasi', 'Minimal satu item wajib diisi lengkap'); return }
  for (let i=0; i<valid.length; i++) {
    if (valid[i].qty > valid[i].max_qty && valid[i].max_qty > 0) { showError('Validasi', `Item #${i+1}: qty melebihi stok`); return }
  }
  isSubmitting.value = true
  try {
    await apiClient.post('/candy-productions', {
      date: form.date, estimated_finish_date: form.estimated_finish_date || null,
      notes: form.notes || null, ref_po_id: Number(form.ref_po_id),
      items: valid.map(i => ({ warehouse_id: Number(i.warehouse_id), item_id: Number(i.item_id), target_item_id: Number(i.target_item_id), qty: Number(i.qty) })),
    })
    showSuccess('Sukses', 'KD Sampel berhasil dicatat')
    form.items = [{ lid: Date.now(), item_id: null, warehouse_id: null, target_item_id: null, qty: null, max_qty: 0 }]
    form.ref_po_id = null; resetPo(); await fetchBase()
  } catch (e) { showError('Gagal', e.response?.data?.message || 'Gagal menyimpan') }
  finally { isSubmitting.value = false }
}

onMounted(fetchBase)
</script>

<style scoped>
.page-header { background:linear-gradient(135deg,#0369a1,#075985);padding:1.75rem 2rem;border-radius:16px;margin-bottom:1.75rem; }
.icon-badge { width:56px;height:56px;border-radius:14px;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:1.75rem; }
.page-title { font-size:1.6rem;font-weight:800;color:white;margin:0 0 .25rem; }
.page-sub { color:rgba(255,255,255,.9);margin:0;font-size:.9rem; }
.content-card { background:white;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,.08); }
.card-body { padding:2rem; }
.form-section { margin-bottom:1.75rem;padding-bottom:1.75rem;border-bottom:2px solid #e5e7eb; }
.form-section:last-of-type { border-bottom:none; }
.section-hd { display:flex;align-items:center;gap:.875rem;margin-bottom:1.25rem;padding:.875rem 1.125rem;background:#f9fafb;border-radius:10px;border-left:4px solid #0369a1; }
.s-badge { width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#0369a1,#075985);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0; }
.s-badge.blue { background:linear-gradient(135deg,#2563eb,#1d4ed8) !important; }
.s-title { font-size:.95rem;font-weight:700;color:#111827;margin:0; }
.s-sub { font-size:.8rem;color:#6b7280;margin:0 0 0 .5rem; }
.g2 { display:grid;grid-template-columns:1fr 1fr;gap:1rem; }
.g3 { display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin-bottom:.875rem; }
.fg { display:flex;flex-direction:column; }
.fl { font-size:.82rem;font-weight:600;color:#374151;margin-bottom:.35rem; }
.fi { padding:.7rem .875rem;border:2px solid #e5e7eb;border-radius:8px;font-size:.9rem; }
.fi:focus { outline:none;border-color:#0369a1; }
.vs :deep(.vs__dropdown-toggle) { padding:.6rem .875rem;border:2px solid #e5e7eb;border-radius:8px;min-height:44px; }
.po-info { padding:.6rem 1rem;background:#e0f2fe;border:1px solid #bae6fd;border-radius:8px;margin-top:.75rem;font-size:.875rem; }
.row-card { background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:.875rem;margin-bottom:.625rem; }
.row-hd { display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem; }
.rn { font-size:.75rem;font-weight:700;color:#6b7280;text-transform:uppercase; }
.btn-rm { background:#fee2e2;color:#ef4444;border:none;border-radius:5px;padding:2px 7px;cursor:pointer;font-weight:700; }
.stock-hint { font-size:.78rem;color:#0369a1;font-weight:600;margin-top:3px; }
.qty-warn { font-size:.78rem;color:#ef4444;margin-top:3px; }
.hint-txt { font-size:.78rem;color:#6b7280;margin-top:3px; }
.btn-add { display:flex;align-items:center;gap:.4rem;padding:.55rem .875rem;border-radius:7px;font-weight:600;font-size:.82rem;cursor:pointer;border:2px dashed;background:none;margin-top:.25rem; }
.a-blue { border-color:#2563eb;color:#1d4ed8; }
.empty-hint { padding:1.25rem;text-align:center;color:#9ca3af;background:#f9fafb;border-radius:8px;border:1px dashed #d1d5db; }
.actions { display:flex;justify-content:flex-end;gap:.875rem;padding-top:1.25rem;border-top:2px solid #e5e7eb; }
.btn-cancel { padding:.7rem 1.375rem;border-radius:8px;background:#f3f4f6;color:#374151;border:none;font-weight:600;cursor:pointer; }
.btn-submit { padding:.7rem 1.625rem;border-radius:8px;background:linear-gradient(135deg,#0369a1,#075985);color:white;border:none;font-weight:700;cursor:pointer; }
.btn-submit:disabled { opacity:.6;cursor:not-allowed; }
@media(max-width:768px) { .g2,.g3 { grid-template-columns:1fr; } }
</style>
