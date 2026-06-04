<template>
  <DashboardLayout>
    <div class="page-header">
      <div style="display:flex;align-items:center;gap:1.5rem;">
        <div class="icon-badge"><span>🔧</span></div>
        <div>
          <h1 class="page-title">Prototype — Rakit Sampel</h1>
          <p class="page-sub">Rakit komponen dari Gudang Mesin → Produk ke Gudang PROTOTYPE</p>
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
            <div class="fg"><label class="fl">Catatan</label><input v-model="form.notes" type="text" class="fi" placeholder="Catatan proses prototype..." /></div>

            <div v-if="poInfo.buyer_name" class="po-info">👤 <strong>{{ poInfo.buyer_name }}</strong> · {{ poInfo.so_number }}</div>

            <div v-if="poTargets.length" class="po-hint">
              <div style="font-weight:700;color:#7c3aed;margin-bottom:.5rem;">📌 Target Produksi — {{ poTargets.length }} item</div>
              <table class="hint-tbl"><thead><tr><th>Item</th><th>Target</th></tr></thead>
                <tbody><tr v-for="t in poTargets" :key="t.item_id"><td><b>{{ t.name }}</b><br/><small>{{ t.code }}</small></td><td>{{ Number(t.qty_planned).toLocaleString('id-ID') }} pcs</td></tr></tbody>
              </table>
            </div>
          </div>

          <!-- INPUT: KOMPONEN DARI MESIN -->
          <div class="form-section">
            <div class="section-hd"><div class="s-badge cyan"><span>🔩</span></div>
              <div><h3 class="s-title">Komponen yang Dipakai *</h3><p class="s-sub">Pilih dari Gudang Mesin <span v-if="loadingItems" class="loading-txt">⏳</span></p></div>
            </div>

            <div v-if="sourceItems.length===0 && !loadingItems" class="empty-hint">📭 Tidak ada stok komponen di Gudang Mesin</div>

            <template v-else>
              <div v-for="(row,idx) in form.inputs" :key="row.lid" class="row-card">
                <div class="row-hd"><span class="rn">Input #{{ idx+1 }}</span><button v-if="form.inputs.length>1" type="button" class="btn-rm" @click="form.inputs.splice(idx,1)">✕</button></div>
                <div class="g2">
                  <div class="fg"><label class="fl">Item Komponen *</label>
                    <vue-select v-model="row.item_id" :options="sourceOpts" :reduce="o=>o.item_id" label="label" placeholder="Pilih komponen..." class="vs"
                      @option:selected="(o)=>{ row.warehouse_id=o.warehouse_id; row.max_qty=o.qty_available }">
                      <template #option="o">
                        <div><div style="font-weight:600;font-size:.88rem;">{{ o.item_code }} — {{ o.item_name }}</div><div style="font-size:.75rem;color:#6b7280;">Stok: {{ o.qty_available }} pcs</div></div>
                      </template>
                    </vue-select>
                    <div v-if="row.max_qty>0" class="stock-hint">Tersedia: {{ row.max_qty }} pcs</div>
                  </div>
                  <div class="fg"><label class="fl">Qty (pcs) *</label>
                    <input v-model.number="row.qty" type="number" min="0.01" step="0.01" :max="row.max_qty||undefined" class="fi" placeholder="0" />
                    <p v-if="row.qty>row.max_qty&&row.max_qty>0" class="qty-warn">⚠️ Melebihi stok</p>
                  </div>
                </div>
                <div v-if="row.warehouse_id" class="wh-hint">📦 Sumber: Gudang Mesin</div>
              </div>
              <button type="button" class="btn-add a-cyan" @click="form.inputs.push(newInput())">➕ Tambah Komponen</button>
            </template>
          </div>

          <!-- OUTPUT: PRODUK DARI PO -->
          <div class="form-section">
            <div class="section-hd"><div class="s-badge purple"><span>📦</span></div>
              <div><h3 class="s-title">Produk Hasil Rakit *</h3><p class="s-sub">Produk dari PO → Gudang PROTOTYPE</p></div>
            </div>

            <div v-if="!form.ref_po_id" class="empty-hint">🔍 Pilih PO terlebih dahulu — produk akan muncul otomatis dari PO</div>

            <template v-else>
              <div v-for="(row,idx) in form.outputs" :key="row.lid" class="row-card row-card--purple">
                <div class="row-hd"><span class="rn">Output #{{ idx+1 }}</span><span class="po-badge">🎯 Dari PO</span></div>
                <div class="g2">
                  <div class="fg"><label class="fl">Produk</label>
                    <div class="readonly-box"><div style="font-weight:700;font-size:.82rem;color:#7c3aed;">{{ row.item_code }}</div><div style="font-size:.92rem;font-weight:600;color:#111827;">{{ row.item_name }}</div></div>
                  </div>
                  <div class="fg"><label class="fl">Qty Dihasilkan (pcs) *</label>
                    <input v-model.number="row.qty" type="number" min="1" class="fi" placeholder="0" />
                  </div>
                </div>
                <div class="wh-hint">📦 → Gudang PROTOTYPE</div>
              </div>
            </template>
          </div>

          <div class="actions">
            <button type="button" class="btn-cancel" @click="router.back()">↩️ Batal</button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">💾 {{ isSubmitting?'Menyimpan...':'Simpan Prototype' }}</button>
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
const poInfo = reactive({ buyer_name: null, so_number: null }); const poTargets = ref([])

const newInput  = () => ({ lid: Date.now()+Math.random(), item_id: null, warehouse_id: null, qty: null, max_qty: 0 })
const form = reactive({ date: new Date().toISOString().slice(0,10), ref_po_id: null, notes: '', inputs: [newInput()], outputs: [] })

const posOpts   = computed(() => productionOrders.value.map(p => ({ id: p.id, label: p.po_number })))
const sourceOpts = computed(() => sourceItems.value.map(i => ({ item_id: i.item_id, item_code: i.item_code, item_name: i.item_name, qty_available: i.qty_available, warehouse_id: i.warehouse_id, label: `${i.item_code} - ${i.item_name}` })))

const fetchBase = async () => {
  loadingItems.value = true
  try {
    const [poRes, srcRes] = await Promise.all([
      apiClient.get('/produksi/prototype/available-pos'),
      apiClient.get('/produksi/prototype/source-items'),
    ])
    productionOrders.value = poRes.data.data || []
    sourceItems.value      = srcRes.data.data || []
  } catch (e) { showError('Gagal', 'Gagal mengambil data') }
  finally { loadingItems.value = false }
}

const handlePoChange = async (opt) => {
  poInfo.buyer_name = null; poInfo.so_number = null; poTargets.value = []; form.outputs = []
  if (!opt) return
  try {
    const r = await apiClient.get(`/production-orders/${opt.id}`); const d = r.data.data || {}
    poInfo.buyer_name = d.sales_order?.buyer_name || null; poInfo.so_number = d.sales_order?.so_number || null
    poTargets.value   = d.targets || []
    if (d.targets?.length) {
      form.outputs = d.targets.map((t,i) => ({ lid: Date.now()+i, item_id: t.item_id, item_name: t.name, item_code: t.code, qty: null }))
    }
  } catch (e) { console.error(e) }
}
const resetPo = () => { poInfo.buyer_name = null; poInfo.so_number = null; poTargets.value = []; form.outputs = [] }

const handleSubmit = async () => {
  if (!form.ref_po_id) { showError('Validasi', 'PO wajib dipilih'); return }
  const validInputs = form.inputs.filter(i => i.item_id && i.warehouse_id && i.qty > 0)
  if (!validInputs.length) { showError('Validasi', 'Minimal satu komponen input wajib diisi'); return }
  for (let i=0; i<validInputs.length; i++) {
    if (validInputs[i].qty > validInputs[i].max_qty && validInputs[i].max_qty > 0) { showError('Validasi', `Input #${i+1}: qty melebihi stok`); return }
  }
  const validOutputs = form.outputs.filter(o => o.item_id && o.qty > 0)
  if (!validOutputs.length) { showError('Validasi', 'Minimal satu output wajib diisi dengan qty'); return }

  isSubmitting.value = true
  try {
    await apiClient.post('/produksi/prototype', {
      date: form.date, ref_po_id: Number(form.ref_po_id), notes: form.notes || null,
      inputs:  validInputs.map(i => ({ item_id: Number(i.item_id), warehouse_id: Number(i.warehouse_id), qty: Number(i.qty) })),
      outputs: validOutputs.map(o => ({ item_id: Number(o.item_id), qty: Number(o.qty) })),
    })
    showSuccess('Sukses', 'Prototype berhasil dicatat')
    form.inputs = [newInput()]; form.outputs = []; form.ref_po_id = null; resetPo()
    await fetchBase()
  } catch (e) { showError('Gagal', e.response?.data?.message || 'Gagal menyimpan') }
  finally { isSubmitting.value = false }
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
.s-badge.cyan   { background:linear-gradient(135deg,#0891b2,#0e7490) !important; }
.s-badge.purple { background:linear-gradient(135deg,#7c3aed,#6d28d9) !important; }
.s-title { font-size:.95rem;font-weight:700;color:#111827;margin:0; }
.s-sub { font-size:.8rem;color:#6b7280;margin:0 0 0 .25rem; }
.g2 { display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:.75rem; }
.fg { display:flex;flex-direction:column;margin-bottom:.5rem; }
.fl { font-size:.82rem;font-weight:600;color:#374151;margin-bottom:.35rem; }
.fi { padding:.7rem .875rem;border:2px solid #e5e7eb;border-radius:8px;font-size:.9rem; }
.fi:focus { outline:none;border-color:#7c3aed; }
.vs :deep(.vs__dropdown-toggle) { padding:.6rem .875rem;border:2px solid #e5e7eb;border-radius:8px;min-height:44px; }
.po-info { padding:.6rem 1rem;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;margin-top:.75rem;font-size:.875rem; }
.po-hint { background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.875rem 1rem;margin-top:.75rem; }
.hint-tbl { width:100%;border-collapse:collapse;font-size:.82rem; }
.hint-tbl th { padding:4px 8px;text-align:left;color:#7c3aed;border-bottom:1px solid #ddd6fe; }
.hint-tbl td { padding:4px 8px;color:#374151; }
.row-card { background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:.875rem;margin-bottom:.625rem; }
.row-card--purple { border-color:#ddd6fe;background:#f5f3ff; }
.row-hd { display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem; }
.rn { font-size:.75rem;font-weight:700;color:#6b7280;text-transform:uppercase; }
.po-badge { font-size:.72rem;font-weight:700;color:#7c3aed;background:#ede9fe;padding:2px 8px;border-radius:999px; }
.btn-rm { background:#fee2e2;color:#ef4444;border:none;border-radius:5px;padding:2px 7px;cursor:pointer;font-weight:700; }
.readonly-box { padding:.6rem .875rem;background:white;border:2px solid #ddd6fe;border-radius:8px;min-height:44px;display:flex;flex-direction:column;justify-content:center; }
.stock-hint { font-size:.78rem;color:#0891b2;font-weight:600;margin-top:3px; }
.qty-warn { font-size:.78rem;color:#ef4444;margin-top:3px; }
.wh-hint { font-size:.78rem;color:#6b7280;margin-top:4px; }
.loading-txt { font-size:.8rem;color:#6b7280;margin-left:4px; }
.btn-add { display:flex;align-items:center;gap:.4rem;padding:.55rem .875rem;border-radius:7px;font-weight:600;font-size:.82rem;cursor:pointer;border:2px dashed;background:none;margin-top:.25rem; }
.a-cyan { border-color:#0891b2;color:#0e7490; }
.empty-hint { padding:1.25rem;text-align:center;color:#9ca3af;background:#f9fafb;border-radius:8px;border:1px dashed #d1d5db; }
.actions { display:flex;justify-content:flex-end;gap:.875rem;padding-top:1.25rem;border-top:2px solid #e5e7eb; }
.btn-cancel { padding:.7rem 1.375rem;border-radius:8px;background:#f3f4f6;color:#374151;border:none;font-weight:600;cursor:pointer; }
.btn-submit { padding:.7rem 1.625rem;border-radius:8px;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:white;border:none;font-weight:700;cursor:pointer; }
.btn-submit:disabled { opacity:.6;cursor:not-allowed; }
@media(max-width:768px) { .g2 { grid-template-columns:1fr; } }
</style>
