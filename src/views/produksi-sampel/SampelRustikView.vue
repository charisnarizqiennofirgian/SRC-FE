<template>
  <DashboardLayout>
    <div class="page-header">
      <div style="display:flex;align-items:center;gap:1.5rem;">
        <div class="icon-badge"><span>🪵</span></div>
        <div>
          <h1 class="page-title">Rustik — Sampel</h1>
          <p class="page-sub">Ambil dari Gudang PROTOTYPE → Gudang RUSTIK SAMPEL</p>
        </div>
      </div>
    </div>

    <div class="content-card">
      <div class="card-body">
        <form @submit.prevent="handleSubmit" @keydown.enter.prevent>

          <!-- INFO UMUM -->
          <div class="form-section">
            <div class="section-hd"><div class="s-badge"><span>📅</span></div><h3 class="s-title">Informasi Umum</h3></div>
            <div class="g2">
              <div class="fg"><label class="fl">Tanggal *</label><input v-model="form.date" type="date" class="fi" required /></div>
              <div class="fg"><label class="fl">Production Order *</label>
                <vue-select v-model="form.ref_po_id" :options="posOpts" :reduce="p=>p.id" label="label" placeholder="Pilih PO sampel..." :clearable="true" class="vs" @option:selected="handlePoChange" @option:deselected="resetPo" />
              </div>
            </div>
            <div class="fg"><label class="fl">Catatan</label><input v-model="form.notes" type="text" class="fi" placeholder="Catatan proses rustik..." /></div>

            <div v-if="poInfo.buyer_name" class="po-info">👤 <strong>{{ poInfo.buyer_name }}</strong> · {{ poInfo.so_number }}</div>
          </div>

          <!-- ITEM -->
          <div class="form-section">
            <div class="section-hd"><div class="s-badge brown"><span>📦</span></div>
              <div><h3 class="s-title">Item yang Diproses *</h3><p class="s-sub">Stok dari Gudang PROTOTYPE <span v-if="loadingItems" class="loading-txt">⏳</span></p></div>
            </div>

            <div v-if="sourceItems.length===0 && !loadingItems" class="empty-hint">📭 Tidak ada stok di Gudang PROTOTYPE</div>

            <template v-else>
              <div v-for="(row,idx) in form.items" :key="row.lid" class="row-card">
                <div class="row-hd">
                  <span class="rn">Item #{{ idx+1 }}</span>
                  <span v-if="row.item_name" class="po-badge">🎯 Dari PO</span>
                  <button v-if="!row.item_name && form.items.length>1" type="button" class="btn-rm" @click="form.items.splice(idx,1)">✕</button>
                </div>
                <div class="g2">
                  <div class="fg"><label class="fl">Item *</label>
                    <div v-if="row.item_name" class="readonly-box">
                      <div style="font-weight:700;font-size:.82rem;color:#7c2d12;">{{ row.item_code }}</div>
                      <div style="font-size:.92rem;font-weight:600;color:#111827;">{{ row.item_name }}</div>
                    </div>
                    <vue-select v-else v-model="row.item_id" :options="sourceOpts" :reduce="o=>o.item_id" label="label" placeholder="Pilih item..." class="vs"
                      @option:selected="(o)=>{ row.max_qty=o.qty_available }">
                      <template #option="o">
                        <div>
                          <div style="font-weight:600;font-size:.88rem;">{{ o.item_code }} — {{ o.item_name }}</div>
                          <div style="font-size:.75rem;color:#6b7280;">Stok: {{ o.qty_available }} pcs</div>
                        </div>
                      </template>
                    </vue-select>
                    <div v-if="row.max_qty>0" class="stock-hint">Tersedia: {{ row.max_qty }} pcs</div>
                  </div>
                  <div class="fg"><label class="fl">Qty (pcs) *</label>
                    <input v-model.number="row.qty" type="number" min="0.01" step="0.01" :max="row.max_qty||undefined" class="fi" placeholder="0" />
                    <p v-if="row.qty>row.max_qty&&row.max_qty>0" class="qty-warn">⚠️ Melebihi stok</p>
                  </div>
                </div>
              </div>
              <button v-if="!poHasTargets" type="button" class="btn-add a-brown" @click="form.items.push(newItem())">➕ Tambah Item</button>
            </template>
          </div>

          <div class="actions">
            <button type="button" class="btn-cancel" @click="router.back()">↩️ Batal</button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">💾 {{ isSubmitting?'Menyimpan...':'Simpan Rustik' }}</button>
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
const isSubmitting = ref(false); const loadingItems = ref(false)
const productionOrders = ref([]); const sourceItems = ref([])
const poInfo = reactive({ buyer_name: null, so_number: null })
const poHasTargets = ref(false)

const newItem = () => ({ lid: Date.now()+Math.random(), item_id: null, item_name: null, item_code: null, qty: null, max_qty: 0 })
const form = reactive({ date: new Date().toISOString().slice(0,10), ref_po_id: null, notes: '', items: [newItem()] })

const posOpts    = computed(() => productionOrders.value.map(p => ({ id: p.id, label: p.po_number })))
const sourceOpts = computed(() => sourceItems.value.map(i => ({ item_id: i.item_id, item_code: i.item_code, item_name: i.item_name, qty_available: i.qty_available, label: `${i.item_code} - ${i.item_name}` })))

const fetchBase = async () => {
  loadingItems.value = true
  try {
    const [poRes, srcRes] = await Promise.all([
      apiClient.get('/produksi/sampel-rustik/available-pos'),
      apiClient.get('/produksi/sampel-rustik/source-items'),
    ])
    productionOrders.value = poRes.data.data || []
    sourceItems.value      = srcRes.data.data || []
  } catch (e) { showError('Gagal', 'Gagal mengambil data') }
  finally { loadingItems.value = false }
}

const handlePoChange = async (opt) => {
  poInfo.buyer_name = null; poInfo.so_number = null; poHasTargets.value = false
  if (!opt) return
  try {
    const r = await apiClient.get(`/production-orders/${opt.id}`); const d = r.data.data || {}
    poInfo.buyer_name = d.sales_order?.buyer_name || null; poInfo.so_number = d.sales_order?.so_number || null
    if (d.targets?.length) {
      form.items = d.targets.map((t,i) => ({ lid: Date.now()+i, item_id: t.item_id, item_name: t.name, item_code: t.code, qty: null, max_qty: 0 }))
      poHasTargets.value = true
    } else {
      form.items = [newItem()]
      poHasTargets.value = false
    }
  } catch (e) { console.error(e) }
}
const resetPo = () => { poInfo.buyer_name = null; poInfo.so_number = null; poHasTargets.value = false; form.items = [newItem()] }

const handleSubmit = async () => {
  if (!form.ref_po_id) { showError('Validasi', 'PO wajib dipilih'); return }
  const validItems = form.items.filter(i => i.item_id && i.qty > 0)
  if (!validItems.length) { showError('Validasi', 'Minimal satu item wajib diisi'); return }
  for (let i=0; i<validItems.length; i++) {
    if (validItems[i].qty > validItems[i].max_qty && validItems[i].max_qty > 0) { showError('Validasi', `Item #${i+1}: qty melebihi stok`); return }
  }

  isSubmitting.value = true
  try {
    await apiClient.post('/produksi/sampel-rustik', {
      date: form.date, ref_po_id: Number(form.ref_po_id), notes: form.notes || null,
      items: validItems.map(i => ({ item_id: Number(i.item_id), qty: Number(i.qty) })),
    })
    showSuccess('Sukses', 'Rustik sampel berhasil dicatat')
    form.ref_po_id = null; resetPo()
    await fetchBase()
  } catch (e) { showError('Gagal', e.response?.data?.message || 'Gagal menyimpan') }
  finally { isSubmitting.value = false }
}

onMounted(fetchBase)
</script>

<style scoped>
.page-header { background:linear-gradient(135deg,#7c2d12,#6b2309);padding:1.75rem 2rem;border-radius:16px;margin-bottom:1.75rem; }
.icon-badge { width:56px;height:56px;border-radius:14px;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:1.75rem; }
.page-title { font-size:1.6rem;font-weight:800;color:white;margin:0 0 .25rem; }
.page-sub { color:rgba(255,255,255,.9);margin:0;font-size:.9rem; }
.content-card { background:white;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,.08); }
.card-body { padding:2rem; }
.form-section { margin-bottom:1.75rem;padding-bottom:1.75rem;border-bottom:2px solid #e5e7eb; }
.form-section:last-of-type { border-bottom:none; }
.section-hd { display:flex;align-items:center;gap:.875rem;margin-bottom:1.25rem;padding:.875rem 1.125rem;background:#f9fafb;border-radius:10px;border-left:4px solid #7c2d12; }
.s-badge { width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#7c2d12,#6b2309);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0; }
.s-badge.brown { background:linear-gradient(135deg,#7c2d12,#6b2309) !important; }
.s-title { font-size:.95rem;font-weight:700;color:#111827;margin:0; }
.s-sub { font-size:.8rem;color:#6b7280;margin:0 0 0 .25rem; }
.g2 { display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:.75rem; }
.fg { display:flex;flex-direction:column;margin-bottom:.5rem; }
.fl { font-size:.82rem;font-weight:600;color:#374151;margin-bottom:.35rem; }
.fi { padding:.7rem .875rem;border:2px solid #e5e7eb;border-radius:8px;font-size:.9rem; }
.fi:focus { outline:none;border-color:#7c2d12; }
.vs :deep(.vs__dropdown-toggle) { padding:.6rem .875rem;border:2px solid #e5e7eb;border-radius:8px;min-height:44px; }
.po-info { padding:.6rem 1rem;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;margin-top:.75rem;font-size:.875rem; }
.row-card { background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:.875rem;margin-bottom:.625rem; }
.row-hd { display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem;gap:.5rem; }
.rn { font-size:.75rem;font-weight:700;color:#6b7280;text-transform:uppercase; }
.po-badge { font-size:.72rem;font-weight:700;color:#c2410c;background:#fff7ed;padding:2px 8px;border-radius:999px; }
.btn-rm { background:#fee2e2;color:#ef4444;border:none;border-radius:5px;padding:2px 7px;cursor:pointer;font-weight:700;margin-left:auto; }
.readonly-box { padding:.6rem .875rem;background:white;border:2px solid #fed7aa;border-radius:8px;min-height:44px;display:flex;flex-direction:column;justify-content:center; }
.stock-hint { font-size:.78rem;color:#7c2d12;font-weight:600;margin-top:3px; }
.qty-warn { font-size:.78rem;color:#ef4444;margin-top:3px; }
.loading-txt { font-size:.8rem;color:#6b7280;margin-left:4px; }
.btn-add { display:flex;align-items:center;gap:.4rem;padding:.55rem .875rem;border-radius:7px;font-weight:600;font-size:.82rem;cursor:pointer;border:2px dashed;background:none;margin-top:.25rem; }
.a-brown { border-color:#7c2d12;color:#6b2309; }
.empty-hint { padding:1.25rem;text-align:center;color:#9ca3af;background:#f9fafb;border-radius:8px;border:1px dashed #d1d5db; }
.actions { display:flex;justify-content:flex-end;gap:.875rem;padding-top:1.25rem;border-top:2px solid #e5e7eb; }
.btn-cancel { padding:.7rem 1.375rem;border-radius:8px;background:#f3f4f6;color:#374151;border:none;font-weight:600;cursor:pointer; }
.btn-submit { padding:.7rem 1.625rem;border-radius:8px;background:linear-gradient(135deg,#7c2d12,#6b2309);color:white;border:none;font-weight:700;cursor:pointer; }
.btn-submit:disabled { opacity:.6;cursor:not-allowed; }
@media(max-width:768px) { .g2 { grid-template-columns:1fr; } }
</style>
