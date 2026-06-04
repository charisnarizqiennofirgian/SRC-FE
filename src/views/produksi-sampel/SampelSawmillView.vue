<template>
  <DashboardLayout>
    <div class="page-header">
      <div style="display:flex;align-items:center;gap:1.5rem;">
        <div class="icon-badge"><span>🪚</span></div>
        <div>
          <h1 class="page-title">Sawmill — Produksi Sampel</h1>
          <p class="page-sub">{{ form.process_type === 'log_jeblosan' ? 'Log → Jeblosan (Gudang SAWMILL)' : 'Jeblosan → RST Basah (Gudang RSTB)' }}</p>
        </div>
      </div>
    </div>

    <div class="content-card">
      <div class="card-body">
        <form @submit.prevent="handleSubmit" @keydown.enter.prevent>

          <div class="form-section">
            <div class="section-hd"><div class="s-badge"><span>📅</span></div><h3 class="s-title">Informasi Umum</h3></div>

            <div class="process-toggle">
              <button type="button" :class="['toggle-btn', form.process_type==='log_jeblosan'?'active':'']" @click="setProcess('log_jeblosan')">
                <span style="font-size:1.5rem;">🪵</span><div><div class="tl">Log → Jeblosan</div><div class="td">Log dibelah jadi jeblosan</div></div>
              </button>
              <button type="button" :class="['toggle-btn', form.process_type==='jeblosan_rst'?'active':'']" @click="setProcess('jeblosan_rst')">
                <span style="font-size:1.5rem;">🪚</span><div><div class="tl">Jeblosan → RST</div><div class="td">Jeblosan digergaji jadi RST</div></div>
              </button>
            </div>

            <div class="g3" style="margin-top:1rem;">
              <div class="fg"><label class="fl">Tanggal *</label><input v-model="form.date" type="date" class="fi" required /></div>
              <div class="fg"><label class="fl">Est. Selesai</label><input v-model="form.estimated_finish_date" type="date" class="fi" /></div>
              <div class="fg"><label class="fl">Production Order</label>
                <vue-select v-model="form.ref_po_id" :options="posOpts" :reduce="p=>p.id" label="label" placeholder="PO Sampel (opsional)..." :clearable="true" class="vs" @option:selected="handlePoChange" @option:deselected="resetPo" />
              </div>
            </div>
            <div class="fg"><label class="fl">Catatan</label><input v-model="form.notes" type="text" class="fi" placeholder="Catatan..." /></div>

            <div v-if="poInfo.buyer_name" class="po-info">👤 <strong>{{ poInfo.buyer_name }}</strong> · {{ poInfo.so_number }}</div>
            <div v-if="poTargets.length" class="po-hint">
              <div style="font-weight:700;color:#92400e;margin-bottom:0.5rem;">📌 Target — {{ poTargets.length }} item</div>
              <table class="hint-tbl"><thead><tr><th>Item</th><th>Target</th></tr></thead>
                <tbody><tr v-for="t in poTargets" :key="t.item_id"><td><b>{{ t.name }}</b><br/><small>{{ t.code }}</small></td><td>{{ Number(t.qty_planned).toLocaleString('id-ID') }} pcs</td></tr></tbody>
              </table>
            </div>
          </div>

          <template v-if="form.process_type==='log_jeblosan'">
            <div class="form-section">
              <div class="section-hd"><div class="s-badge amber"><span>📥</span></div><h3 class="s-title">Input — Kayu Log <span class="opt">(opsional)</span></h3></div>
              <div v-for="(r,i) in form.logs" :key="r.lid" class="row-card">
                <div class="row-hd"><span class="rn">Log #{{ i+1 }}</span><button v-if="form.logs.length>1" type="button" class="btn-rm" @click="form.logs.splice(i,1)">✕</button></div>
                <div class="g2">
                  <div class="fg"><label class="fl">Item Kayu Log</label><vue-select v-model="r.item_log_id" :options="logOpts" :reduce="o=>o.id" label="label" placeholder="Pilih log..." class="vs" /></div>
                  <div class="fg"><label class="fl">Qty (pcs)</label><input v-model.number="r.qty_log_pcs" type="number" min="1" class="fi" placeholder="0" /></div>
                </div>
              </div>
              <button type="button" class="btn-add a-amber" @click="form.logs.push({lid:Date.now(),item_log_id:null,qty_log_pcs:null})">➕ Tambah Log</button>
            </div>

            <div class="form-section">
              <div class="section-hd"><div class="s-badge green"><span>📤</span></div><h3 class="s-title">Output — Jeblosan *</h3></div>
              <div v-for="(r,i) in form.jeblosans" :key="r.lid" class="row-card green">
                <div class="row-hd"><span class="rn">Jeblosan #{{ i+1 }}</span><button v-if="form.jeblosans.length>1" type="button" class="btn-rm" @click="form.jeblosans.splice(i,1)">✕</button></div>
                <div class="g2">
                  <div class="fg"><label class="fl">Item Jeblosan *</label>
                    <vue-select v-model="r.item_id" :options="jebOpts" :reduce="o=>o.id" label="label" placeholder="Pilih jeblosan..." class="vs"
                      @option:selected="(o)=>{ r.vpp=o.volume_m3||0; r.volume_m3=(r.vpp*(r.qty_pcs||0)) }" />
                  </div>
                  <div class="fg"><label class="fl">Qty (pcs) *</label><input v-model.number="r.qty_pcs" type="number" min="1" class="fi" placeholder="0" @input="r.volume_m3=(r.vpp||0)*r.qty_pcs" /></div>
                </div>
                <div v-if="r.volume_m3>0" class="vol-hint">Volume: {{ r.volume_m3.toFixed(4) }} m³</div>
              </div>
              <button type="button" class="btn-add a-green" @click="form.jeblosans.push({lid:Date.now(),item_id:null,qty_pcs:null,volume_m3:0,vpp:0})">➕ Tambah Jeblosan</button>
            </div>
          </template>

          <template v-else>
            <div class="form-section">
              <div class="section-hd"><div class="s-badge amber"><span>📥</span></div><h3 class="s-title">Input Jeblosan — Otomatis dari Gudang SAWMILL</h3></div>
              <div v-if="!loadingStock && !sawmillStock.length" class="empty-hint">📭 Tidak ada stok jeblosan di Gudang SAWMILL</div>
              <div v-else-if="sawmillStock.length" class="stock-info">✅ {{ sawmillStock.length }} item jeblosan tersedia — akan diambil semua otomatis</div>
              <div v-else class="stock-info">⏳ Memuat stok...</div>
            </div>

            <div class="form-section">
              <div class="section-hd"><div class="s-badge blue"><span>📤</span></div><h3 class="s-title">Output — RST Basah *</h3></div>
              <div v-for="(r,i) in form.rsts" :key="r.lid" class="row-card blue">
                <div class="row-hd"><span class="rn">RST #{{ i+1 }}</span><button v-if="form.rsts.length>1" type="button" class="btn-rm" @click="form.rsts.splice(i,1)">✕</button></div>
                <div class="g3">
                  <div class="fg"><label class="fl">Item RST *</label>
                    <vue-select v-model="r.item_rst_id" :options="rstOpts" :reduce="o=>o.id" label="label" placeholder="Pilih RST..." class="vs"
                      @option:selected="(o)=>{ r.vpp=o.volume_m3||0; r.volume_rst_m3=(r.vpp*(r.qty_rst_pcs||0)) }" />
                  </div>
                  <div class="fg"><label class="fl">Qty (pcs) *</label><input v-model.number="r.qty_rst_pcs" type="number" min="1" class="fi" placeholder="0" @input="r.volume_rst_m3=(r.vpp||0)*r.qty_rst_pcs" /></div>
                  <div class="fg"><label class="fl">Volume (m³)</label><input v-model.number="r.volume_rst_m3" type="number" min="0" step="0.0001" class="fi" placeholder="0.0000" /></div>
                </div>
              </div>
              <button type="button" class="btn-add a-blue" @click="form.rsts.push({lid:Date.now(),item_rst_id:null,qty_rst_pcs:null,volume_rst_m3:0,vpp:0})">➕ Tambah RST</button>
            </div>
          </template>

          <div class="actions">
            <button type="button" class="btn-cancel" @click="router.back()">↩️ Batal</button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">💾 {{ isSubmitting?'Menyimpan...':(form.process_type==='log_jeblosan'?'Simpan Log→Jeblosan':'Simpan Jeblosan→RST') }}</button>
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
const isSubmitting = ref(false); const loadingStock = ref(false)
const productionOrders = ref([]); const logItems = ref([]); const jeblosanItems = ref([]); const rstItems = ref([]); const sawmillStock = ref([])
const poInfo = reactive({ buyer_name: null, so_number: null }); const poTargets = ref([])

const form = reactive({
  process_type: 'log_jeblosan', date: new Date().toISOString().slice(0,10),
  estimated_finish_date: '', notes: '', ref_po_id: null,
  logs:      [{ lid: 1, item_log_id: null, qty_log_pcs: null }],
  jeblosans: [{ lid: 2, item_id: null, qty_pcs: null, volume_m3: 0, vpp: 0 }],
  rsts:      [{ lid: 3, item_rst_id: null, qty_rst_pcs: null, volume_rst_m3: 0, vpp: 0 }],
})

const parse = (res) => { const d = res.data.data; return Array.isArray(d) ? d : (d?.data && Array.isArray(d.data) ? d.data : []) }
const posOpts = computed(() => productionOrders.value.map(p => ({ id: p.id, label: p.po_number })))
const logOpts = computed(() => logItems.value.map(i => ({ id: i.id, label: `${i.code} - ${i.name}` })))
const jebOpts = computed(() => jeblosanItems.value.map(i => ({ id: i.id, label: `${i.code} - ${i.name}`, volume_m3: i.volume_m3||0 })))
const rstOpts = computed(() => rstItems.value.map(i => ({ id: i.id, label: `${i.code} - ${i.name}`, volume_m3: i.volume_m3||0 })))

const fetchBase = async () => {
  try {
    const [poRes, logRes, jebRes, rstRes] = await Promise.all([
      apiClient.get('/produksi/prototype/available-pos'),
      apiClient.get('/materials', { params: { category_name: 'Kayu Log', per_page: 500 } }),
      apiClient.get('/materials', { params: { category_name: 'Jeblosan', per_page: 500 } }),
      apiClient.get('/materials', { params: { category_name: 'Kayu RST', per_page: 500 } }),
    ])
    productionOrders.value = poRes.data.data || []
    logItems.value = parse(logRes); jeblosanItems.value = parse(jebRes); rstItems.value = parse(rstRes)
  } catch (e) { showError('Gagal', 'Gagal mengambil data') }
}

const fetchSawmillStock = async () => {
  loadingStock.value = true
  try { sawmillStock.value = (await apiClient.get('/sawmill-productions/sawmill-stock')).data.data || [] }
  catch (e) { console.error(e) } finally { loadingStock.value = false }
}

const setProcess = (t) => { form.process_type = t; if (t === 'jeblosan_rst' && !sawmillStock.value.length) fetchSawmillStock() }

const handlePoChange = async (opt) => {
  poInfo.buyer_name = null; poInfo.so_number = null; poTargets.value = []
  if (!opt) return
  try { const r = await apiClient.get(`/production-orders/${opt.id}`); const d = r.data.data || {}
    poInfo.buyer_name = d.sales_order?.buyer_name || null; poInfo.so_number = d.sales_order?.so_number || null; poTargets.value = d.targets || []
  } catch (e) { console.error(e) }
}
const resetPo = () => { poInfo.buyer_name = null; poInfo.so_number = null; poTargets.value = [] }

const handleSubmit = async () => {
  if (form.process_type === 'log_jeblosan') {
    if (!form.jeblosans.filter(j => j.item_id && j.qty_pcs > 0).length) { showError('Validasi', 'Minimal satu jeblosan wajib diisi'); return }
  } else {
    if (!sawmillStock.value.length) { showError('Validasi', 'Tidak ada stok jeblosan di Gudang SAWMILL'); return }
    if (!form.rsts.filter(r => r.item_rst_id && r.qty_rst_pcs > 0).length) { showError('Validasi', 'Minimal satu RST wajib diisi'); return }
  }
  isSubmitting.value = true
  try {
    const payload = { process_type: form.process_type, date: form.date, estimated_finish_date: form.estimated_finish_date || null, notes: form.notes || null, ref_po_id: form.ref_po_id ? Number(form.ref_po_id) : null }
    if (form.process_type === 'log_jeblosan') {
      payload.logs      = form.logs.filter(l => l.item_log_id && l.qty_log_pcs > 0).map(l => ({ item_log_id: Number(l.item_log_id), qty_log_pcs: Number(l.qty_log_pcs) }))
      payload.jeblosans = form.jeblosans.filter(j => j.item_id && j.qty_pcs > 0).map(j => ({ item_id: Number(j.item_id), qty_pcs: Number(j.qty_pcs), volume_m3: Number(j.volume_m3||0) }))
    } else {
      payload.rsts = form.rsts.filter(r => r.item_rst_id && r.qty_rst_pcs > 0).map(r => ({ item_rst_id: Number(r.item_rst_id), qty_rst_pcs: Number(r.qty_rst_pcs), volume_rst_m3: Number(r.volume_rst_m3||0) }))
    }
    await apiClient.post('/sawmill-productions', payload)
    showSuccess('Sukses', 'Sawmill sampel berhasil dicatat')
    form.logs = [{lid:Date.now(),item_log_id:null,qty_log_pcs:null}]; form.jeblosans = [{lid:Date.now()+1,item_id:null,qty_pcs:null,volume_m3:0,vpp:0}]; form.rsts = [{lid:Date.now()+2,item_rst_id:null,qty_rst_pcs:null,volume_rst_m3:0,vpp:0}]
    form.ref_po_id = null; resetPo()
    if (form.process_type === 'jeblosan_rst') fetchSawmillStock()
  } catch (e) { showError('Gagal', e.response?.data?.message || 'Gagal menyimpan') }
  finally { isSubmitting.value = false }
}

onMounted(fetchBase)
</script>

<style scoped>
.page-header { background: linear-gradient(135deg,#92400e,#78350f); padding:1.75rem 2rem; border-radius:16px; margin-bottom:1.75rem; }
.icon-badge { width:56px;height:56px;border-radius:14px;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:1.75rem; }
.page-title { font-size:1.6rem;font-weight:800;color:white;margin:0 0 .25rem; }
.page-sub { color:rgba(255,255,255,.9);margin:0;font-size:.9rem; }
.content-card { background:white;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,.08); }
.card-body { padding:2rem; }
.form-section { margin-bottom:1.75rem;padding-bottom:1.75rem;border-bottom:2px solid #e5e7eb; }
.form-section:last-of-type { border-bottom:none; }
.section-hd { display:flex;align-items:center;gap:.875rem;margin-bottom:1.25rem;padding:.875rem 1.125rem;background:#f9fafb;border-radius:10px;border-left:4px solid #92400e; }
.s-badge { width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#92400e,#78350f);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0; }
.s-badge.amber { background:linear-gradient(135deg,#d97706,#b45309) !important; }
.s-badge.green  { background:linear-gradient(135deg,#16a34a,#15803d) !important; }
.s-badge.blue   { background:linear-gradient(135deg,#2563eb,#1d4ed8) !important; }
.s-title { font-size:.95rem;font-weight:700;color:#111827;margin:0; }
.opt { font-size:.75rem;font-weight:400;color:#6b7280;margin-left:4px; }
.process-toggle { display:flex;gap:.875rem; }
.toggle-btn { flex:1;display:flex;align-items:center;gap:.75rem;padding:.875rem 1.125rem;border:2px solid #e5e7eb;border-radius:10px;background:white;cursor:pointer;transition:all .2s;text-align:left; }
.toggle-btn.active { border-color:#92400e;background:#fffbeb; }
.tl { font-weight:700;font-size:.9rem;color:#111827; }
.td { font-size:.75rem;color:#6b7280; }
.g2 { display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:.875rem; }
.g3 { display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin-bottom:.875rem; }
.fg { display:flex;flex-direction:column; }
.fl { font-size:.82rem;font-weight:600;color:#374151;margin-bottom:.35rem; }
.fi { padding:.7rem .875rem;border:2px solid #e5e7eb;border-radius:8px;font-size:.9rem;transition:all .2s; }
.fi:focus { outline:none;border-color:#92400e; }
.vs :deep(.vs__dropdown-toggle) { padding:.6rem .875rem;border:2px solid #e5e7eb;border-radius:8px;min-height:44px; }
.po-info { padding:.6rem 1rem;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;margin-top:.75rem;font-size:.875rem;color:#374151; }
.po-hint { background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:.875rem 1rem;margin-top:.75rem; }
.hint-tbl { width:100%;border-collapse:collapse;font-size:.82rem; }
.hint-tbl th { padding:4px 8px;text-align:left;color:#92400e;border-bottom:1px solid #fde68a; }
.hint-tbl td { padding:4px 8px;color:#374151; }
.row-card { background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:.875rem;margin-bottom:.625rem; }
.row-card.green { border-color:#bbf7d0;background:#f0fdf4; }
.row-card.blue  { border-color:#bfdbfe;background:#eff6ff; }
.row-hd { display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem; }
.rn { font-size:.75rem;font-weight:700;color:#6b7280;text-transform:uppercase; }
.btn-rm { background:#fee2e2;color:#ef4444;border:none;border-radius:5px;padding:2px 7px;cursor:pointer;font-weight:700; }
.vol-hint { font-size:.78rem;color:#6b7280;margin-top:3px; }
.btn-add { display:flex;align-items:center;gap:.4rem;padding:.55rem .875rem;border-radius:7px;font-weight:600;font-size:.82rem;cursor:pointer;border:2px dashed;background:none;margin-top:.25rem; }
.a-amber { border-color:#d97706;color:#92400e; } .a-green { border-color:#16a34a;color:#15803d; } .a-blue { border-color:#2563eb;color:#1d4ed8; }
.stock-info { padding:.7rem 1rem;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;font-size:.875rem;color:#15803d;font-weight:500; }
.empty-hint { padding:1.25rem;text-align:center;color:#9ca3af;background:#f9fafb;border-radius:8px;border:1px dashed #d1d5db; }
.actions { display:flex;justify-content:flex-end;gap:.875rem;padding-top:1.25rem;border-top:2px solid #e5e7eb;margin-top:.25rem; }
.btn-cancel { padding:.7rem 1.375rem;border-radius:8px;background:#f3f4f6;color:#374151;border:none;font-weight:600;cursor:pointer; }
.btn-submit { padding:.7rem 1.625rem;border-radius:8px;background:linear-gradient(135deg,#92400e,#78350f);color:white;border:none;font-weight:700;cursor:pointer; }
.btn-submit:disabled { opacity:.6;cursor:not-allowed; }
@media(max-width:768px) { .g2,.g3 { grid-template-columns:1fr; } .process-toggle { flex-direction:column; } }
</style>
