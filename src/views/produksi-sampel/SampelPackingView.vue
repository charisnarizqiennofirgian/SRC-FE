<template>
  <DashboardLayout>
    <div class="page-header">
      <div style="display:flex;align-items:center;gap:1.5rem;">
        <div class="icon-badge"><span>📦</span></div>
        <div>
          <h1 class="page-title">Packing — Produksi Sampel</h1>
          <p class="page-sub">Produk masuk packing → Gudang PACKING</p>
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
              <div class="fg"><label class="fl">Production Order *</label>
                <vue-select v-model="form.ref_po_id" :options="posOpts" :reduce="p=>p.id" label="label" placeholder="Pilih PO sampel..." :clearable="true" class="vs" @option:selected="handlePoChange" @option:deselected="resetPo" />
              </div>
              <div class="fg"><label class="fl">Catatan</label><input v-model="form.notes" type="text" class="fi" placeholder="Catatan..." /></div>
            </div>

            <div class="fg"><label class="fl">Gudang Sumber *</label>
              <vue-select v-model="form.source_warehouse_id" :options="warehouseOpts" :reduce="w=>w.id" label="name" placeholder="Pilih gudang sumber..." :clearable="true" class="vs" @option:selected="fetchSourceItems" @option:deselected="()=>{ sourceItems=[]; form.items=[newItem()] }" />
            </div>

            <div v-if="poInfo.buyer_name" class="po-info">👤 <strong>{{ poInfo.buyer_name }}</strong> · {{ poInfo.so_number }}</div>
          </div>

          <div class="form-section">
            <div class="section-hd"><div class="s-badge purple"><span>📦</span></div><h3 class="s-title">Item yang Dipacking *</h3></div>

            <div v-if="!form.source_warehouse_id" class="empty-hint">← Pilih gudang sumber terlebih dahulu</div>
            <div v-else-if="loadingItems" class="empty-hint">⏳ Memuat stok...</div>
            <div v-else-if="sourceItems.length===0" class="empty-hint">📭 Tidak ada stok di gudang ini</div>
            <template v-else>
              <div v-for="(r,i) in form.items" :key="r.lid" class="row-card">
                <div class="row-hd"><span class="rn">Item #{{ i+1 }}</span><button v-if="form.items.length>1" type="button" class="btn-rm" @click="form.items.splice(i,1)">✕</button></div>
                <div class="g2">
                  <div class="fg"><label class="fl">Item *</label>
                    <vue-select v-model="r.item_id" :options="sourceOpts" :reduce="o=>o.item_id" label="label" placeholder="Pilih item..." class="vs"
                      @option:selected="(o)=>r.max_qty=o.qty_available" />
                    <div v-if="r.max_qty>0" class="stock-hint">Tersedia: {{ r.max_qty }} pcs</div>
                  </div>
                  <div class="fg"><label class="fl">Qty (pcs) *</label>
                    <input v-model.number="r.qty" type="number" min="1" class="fi" placeholder="0" />
                    <p v-if="r.qty>r.max_qty&&r.max_qty>0" class="qty-warn">⚠️ Melebihi stok</p>
                  </div>
                </div>
              </div>
              <button type="button" class="btn-add a-purple" @click="form.items.push(newItem())">➕ Tambah Item</button>
            </template>
          </div>

          <div class="actions">
            <button type="button" class="btn-cancel" @click="router.back()">↩️ Batal</button>
            <button v-if="form.ref_po_id" type="button" class="btn-selesai" :disabled="isMarkingDone" @click="tandaiSelesai">
              ✅ {{ isMarkingDone?'Memproses...':'Selesai Packing' }}
            </button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">💾 {{ isSubmitting?'Menyimpan...':'Simpan Packing Sampel' }}</button>
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
const isSubmitting = ref(false); const isMarkingDone = ref(false); const loadingItems = ref(false)
const productionOrders = ref([]); const warehouses = ref([]); const sourceItems = ref([])
const poInfo = reactive({ buyer_name: null, so_number: null })

const newItem = () => ({ lid: Date.now()+Math.random(), item_id: null, qty: null, max_qty: 0 })
const form = reactive({ date: new Date().toISOString().slice(0,10), ref_po_id: null, source_warehouse_id: null, notes: '', items: [newItem()] })

const posOpts      = computed(() => productionOrders.value.map(p => ({ id: p.id, label: p.po_number })))
const warehouseOpts = computed(() => warehouses.value.filter(w => ['SANDING','FINISHING','PROTOTYPE'].includes(w.code)))
const sourceOpts   = computed(() => sourceItems.value.map(i => ({ item_id: i.item_id, label: `${i.item_code} - ${i.item_name}`, qty_available: i.qty_available })))

const fetchBase = async () => {
  try {
    const [poRes, whRes] = await Promise.all([
      apiClient.get('/produksi/prototype/available-pos'),
      apiClient.get('/warehouses'),
    ])
    productionOrders.value = poRes.data.data || []
    warehouses.value = whRes.data.data || whRes.data || []
  } catch (e) { showError('Gagal', 'Gagal mengambil data') }
}

const fetchSourceItems = async (opt) => {
  if (!opt) return
  loadingItems.value = true; sourceItems.value = []; form.items = [newItem()]
  try {
    const r = await apiClient.get(`/assembling-produksi/source-items?warehouse_id=${opt.id}`)
    sourceItems.value = r.data.data || []
  } catch (e) { console.error(e) }
  finally { loadingItems.value = false }
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
  if (!form.ref_po_id) { showError('Validasi', 'PO wajib dipilih'); return }
  if (!form.source_warehouse_id) { showError('Validasi', 'Gudang sumber wajib dipilih'); return }
  const valid = form.items.filter(i => i.item_id && i.qty > 0)
  if (!valid.length) { showError('Validasi', 'Minimal satu item wajib diisi'); return }
  for (let i=0; i<valid.length; i++) {
    if (valid[i].qty > valid[i].max_qty && valid[i].max_qty > 0) { showError('Validasi', `Item #${i+1}: qty melebihi stok`); return }
  }
  isSubmitting.value = true
  try {
    await apiClient.post('/packing/store', {
      date: form.date, ref_po_id: Number(form.ref_po_id),
      source_warehouse_id: Number(form.source_warehouse_id), notes: form.notes || null,
      items: valid.map(i => ({ item_id: Number(i.item_id), qty: Number(i.qty) })),
    })
    showSuccess('Sukses', 'Packing sampel berhasil dicatat')
    form.items = [newItem()]; form.ref_po_id = null; form.source_warehouse_id = null; sourceItems.value = []; resetPo()
  } catch (e) { showError('Gagal', e.response?.data?.message || 'Gagal menyimpan') }
  finally { isSubmitting.value = false }
}

const tandaiSelesai = async () => {
  if (!form.ref_po_id) return
  if (!confirm('Tandai PO sampel ini selesai packing?')) return
  isMarkingDone.value = true
  try {
    await apiClient.post(`/packing/selesai/${form.ref_po_id}`)
    showSuccess('Selesai', 'PO sampel berhasil ditandai selesai')
    router.push('/')
  } catch (e) { showError('Gagal', e.response?.data?.message || 'Gagal menandai selesai') }
  finally { isMarkingDone.value = false }
}

onMounted(fetchBase)
</script>

<style scoped>
.page-header { background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:1.75rem 2rem;border-radius:16px;margin-bottom:1.75rem; }
.icon-badge { width:56px;height:56px;border-radius:14px;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:1.75rem; }
.page-title { font-size:1.6rem;font-weight:800;color:white;margin:0 0 .25rem; }
.page-sub { color:rgba(255,255,255,.9);margin:0;font-size:.9rem; }
.content-card { background:white;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,.08); }
.card-body { padding:2rem; }
.form-section { margin-bottom:1.75rem;padding-bottom:1.75rem;border-bottom:2px solid #e5e7eb; }
.form-section:last-of-type { border-bottom:none; }
.section-hd { display:flex;align-items:center;gap:.875rem;margin-bottom:1.25rem;padding:.875rem 1.125rem;background:#f9fafb;border-radius:10px;border-left:4px solid #7c3aed; }
.s-badge { width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#7c3aed,#6d28d9);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0; }
.s-badge.purple { background:linear-gradient(135deg,#7c3aed,#6d28d9) !important; }
.s-title { font-size:.95rem;font-weight:700;color:#111827;margin:0; }
.g2 { display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:.75rem; }
.g3 { display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin-bottom:.875rem; }
.fg { display:flex;flex-direction:column;margin-bottom:.75rem; }
.fl { font-size:.82rem;font-weight:600;color:#374151;margin-bottom:.35rem; }
.fi { padding:.7rem .875rem;border:2px solid #e5e7eb;border-radius:8px;font-size:.9rem; }
.fi:focus { outline:none;border-color:#7c3aed; }
.vs :deep(.vs__dropdown-toggle) { padding:.6rem .875rem;border:2px solid #e5e7eb;border-radius:8px;min-height:44px; }
.po-info { padding:.6rem 1rem;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;margin-top:.25rem;font-size:.875rem; }
.row-card { background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:.875rem;margin-bottom:.625rem; }
.row-hd { display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem; }
.rn { font-size:.75rem;font-weight:700;color:#6b7280;text-transform:uppercase; }
.btn-rm { background:#fee2e2;color:#ef4444;border:none;border-radius:5px;padding:2px 7px;cursor:pointer;font-weight:700; }
.stock-hint { font-size:.78rem;color:#7c3aed;font-weight:600;margin-top:3px; }
.qty-warn { font-size:.78rem;color:#ef4444;margin-top:3px; }
.btn-add { display:flex;align-items:center;gap:.4rem;padding:.55rem .875rem;border-radius:7px;font-weight:600;font-size:.82rem;cursor:pointer;border:2px dashed;background:none;margin-top:.25rem; }
.a-purple { border-color:#7c3aed;color:#6d28d9; }
.empty-hint { padding:1.25rem;text-align:center;color:#9ca3af;background:#f9fafb;border-radius:8px;border:1px dashed #d1d5db; }
.actions { display:flex;justify-content:flex-end;gap:.875rem;padding-top:1.25rem;border-top:2px solid #e5e7eb; }
.btn-cancel { padding:.7rem 1.375rem;border-radius:8px;background:#f3f4f6;color:#374151;border:none;font-weight:600;cursor:pointer; }
.btn-selesai { padding:.7rem 1.375rem;border-radius:8px;background:linear-gradient(135deg,#16a34a,#15803d);color:white;border:none;font-weight:700;cursor:pointer; }
.btn-selesai:disabled { opacity:.6;cursor:not-allowed; }
.btn-submit { padding:.7rem 1.625rem;border-radius:8px;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:white;border:none;font-weight:700;cursor:pointer; }
.btn-submit:disabled { opacity:.6;cursor:not-allowed; }
@media(max-width:768px) { .g2,.g3 { grid-template-columns:1fr; } }
</style>
