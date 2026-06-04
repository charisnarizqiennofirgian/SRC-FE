<template>
  <DashboardLayout>
    <div class="page-header">
      <div style="display:flex;align-items:center;gap:1.5rem;">
        <div class="icon-badge"><span>⚙️</span></div>
        <div>
          <h1 class="page-title">Moulding — Produksi Sampel</h1>
          <p class="page-sub">RST → Komponen (S4S) + reject opsional</p>
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
            <div v-if="poInfo.buyer_name" class="po-info">👤 <strong>{{ poInfo.buyer_name }}</strong> · {{ poInfo.so_number }}</div>
          </div>

          <div class="form-section">
            <div class="section-hd"><div class="s-badge green"><span>🔗</span></div><h3 class="s-title">Baris Produksi *</h3><p class="s-sub">Tiap baris: 1 RST → 1 Komponen + reject opsional</p></div>

            <div v-for="(line,idx) in form.lines" :key="line.lid" class="row-card">
              <div class="row-hd"><span class="rn">Baris #{{ idx+1 }}</span><button v-if="form.lines.length>1" type="button" class="btn-rm" @click="form.lines.splice(idx,1)">✕</button></div>

              <div class="line-block input-block">
                <span class="lb">📥 INPUT RST</span>
                <div class="g2">
                  <div class="fg"><label class="fl">Item RST *</label><vue-select v-model="line.input_item_id" :options="rstOpts" :reduce="o=>o.id" label="label" placeholder="Pilih RST..." class="vs" /></div>
                  <div class="fg"><label class="fl">Qty (pcs) *</label><input v-model.number="line.input_qty" type="number" min="0.01" step="0.01" class="fi" placeholder="0" /></div>
                </div>
              </div>

              <div class="line-block output-block">
                <span class="lb">📤 OUTPUT KOMPONEN → S4S</span>
                <div class="g2">
                  <div class="fg"><label class="fl">Item Komponen *</label><vue-select v-model="line.output_item_id" :options="kompOpts" :reduce="o=>o.id" label="label" placeholder="Pilih komponen..." class="vs" /></div>
                  <div class="fg"><label class="fl">Qty (pcs) *</label><input v-model.number="line.output_qty" type="number" min="1" class="fi" placeholder="0" /></div>
                </div>
              </div>

              <div class="reject-toggle">
                <button type="button" class="btn-toggle-rej" @click="line.show_reject=!line.show_reject">{{ line.show_reject?'▲ Sembunyikan Reject':'⚠️ + Tambah Reject' }}</button>
              </div>
              <div v-if="line.show_reject" class="line-block reject-block">
                <span class="lb">♻️ REJECT → Gudang REJECT</span>
                <div class="g2">
                  <div class="fg"><label class="fl">Item Reject</label>
                    <vue-select v-model="line.reject_item_id" :options="[...rstOpts,...kompOpts]" :reduce="o=>o.id" label="label" placeholder="Pilih item reject..." class="vs" />
                  </div>
                  <div class="fg"><label class="fl">Qty Reject</label><input v-model.number="line.reject_qty" type="number" min="0.01" step="0.01" class="fi" placeholder="0" /></div>
                </div>
                <div class="g2">
                  <div class="fg"><label class="fl">Penyebab</label>
                    <div class="rej-toggle">
                      <button type="button" :class="['rt-btn',line.reject_type==='moulding'?'rt-active':'']" @click="line.reject_type='moulding'">⚙️ Moulding</button>
                      <button type="button" :class="['rt-btn',line.reject_type==='pembahanan'?'rt-active':'']" @click="line.reject_type='pembahanan'">🪚 Pembahanan</button>
                    </div>
                  </div>
                  <div class="fg"><label class="fl">Keterangan</label><input v-model="line.reject_notes" type="text" class="fi" placeholder="Contoh: urat bengkok" /></div>
                </div>
              </div>
            </div>

            <button type="button" class="btn-add a-green" @click="addLine">➕ Tambah Baris</button>
          </div>

          <div class="actions">
            <button type="button" class="btn-cancel" @click="router.back()">↩️ Batal</button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">💾 {{ isSubmitting?'Menyimpan...':'Simpan Moulding Sampel' }}</button>
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
const productionOrders = ref([]); const rstItems = ref([]); const kompItems = ref([])
const poInfo = reactive({ buyer_name: null, so_number: null })

const newLine = () => ({ lid: Date.now()+Math.random(), input_item_id: null, input_qty: null, output_item_id: null, output_qty: null, reject_item_id: null, reject_qty: null, reject_type: 'moulding', reject_notes: '', show_reject: false })
const form = reactive({ date: new Date().toISOString().slice(0,10), ref_po_id: null, notes: '', lines: [newLine()] })

const parse = (res) => { const d = res.data.data; return Array.isArray(d) ? d : (d?.data && Array.isArray(d.data) ? d.data : []) }
const posOpts  = computed(() => productionOrders.value.map(p => ({ id: p.id, label: p.po_number })))
const rstOpts  = computed(() => rstItems.value.map(i => ({ id: i.id, label: `${i.code} - ${i.name}` })))
const kompOpts = computed(() => kompItems.value.map(i => ({ id: i.id, label: `${i.code} - ${i.name}` })))

const addLine = () => form.lines.push(newLine())

const fetchBase = async () => {
  try {
    const [poRes, rstRes, kompRes] = await Promise.all([
      apiClient.get('/produksi/moulding/available-pos'),
      apiClient.get('/produksi/moulding/rst-items'),
      apiClient.get('/produksi/moulding/komponen-items'),
    ])
    productionOrders.value = poRes.data.data || []
    rstItems.value  = rstRes.data.data  || []
    kompItems.value = kompRes.data.data || []
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
  if (!form.ref_po_id) { showError('Validasi', 'PO wajib dipilih'); return }
  const validLines = form.lines.filter(l => l.input_item_id && l.input_qty > 0 && l.output_item_id && l.output_qty > 0)
  if (!validLines.length) { showError('Validasi', 'Minimal satu baris wajib diisi'); return }
  isSubmitting.value = true
  try {
    await apiClient.post('/produksi/moulding', {
      date: form.date, ref_po_id: Number(form.ref_po_id), notes: form.notes || null,
      lines: validLines.map(l => ({
        input_item_id: Number(l.input_item_id), input_qty: Number(l.input_qty),
        output_item_id: Number(l.output_item_id), output_qty: Number(l.output_qty),
        reject_item_id: l.reject_item_id && l.reject_qty > 0 ? Number(l.reject_item_id) : null,
        reject_qty: l.reject_qty > 0 ? Number(l.reject_qty) : null,
        reject_type: l.reject_type || null, reject_notes: l.reject_notes || null,
      })),
    })
    showSuccess('Sukses', 'Moulding sampel berhasil dicatat')
    form.lines = [newLine()]; form.ref_po_id = null; resetPo()
  } catch (e) { showError('Gagal', e.response?.data?.message || 'Gagal menyimpan') }
  finally { isSubmitting.value = false }
}

onMounted(fetchBase)
</script>

<style scoped>
.page-header { background:linear-gradient(135deg,#16a34a,#15803d);padding:1.75rem 2rem;border-radius:16px;margin-bottom:1.75rem; }
.icon-badge { width:56px;height:56px;border-radius:14px;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:1.75rem; }
.page-title { font-size:1.6rem;font-weight:800;color:white;margin:0 0 .25rem; }
.page-sub { color:rgba(255,255,255,.9);margin:0;font-size:.9rem; }
.content-card { background:white;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,.08); }
.card-body { padding:2rem; }
.form-section { margin-bottom:1.75rem;padding-bottom:1.75rem;border-bottom:2px solid #e5e7eb; }
.form-section:last-of-type { border-bottom:none; }
.section-hd { display:flex;align-items:center;gap:.875rem;margin-bottom:1.25rem;padding:.875rem 1.125rem;background:#f9fafb;border-radius:10px;border-left:4px solid #16a34a;flex-wrap:wrap; }
.s-badge { width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#16a34a,#15803d);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0; }
.s-badge.green { background:linear-gradient(135deg,#d97706,#b45309) !important; }
.s-title { font-size:.95rem;font-weight:700;color:#111827;margin:0; }
.s-sub { font-size:.8rem;color:#6b7280;margin:0 0 0 .5rem; }
.g2 { display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:.75rem; }
.g3 { display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin-bottom:.875rem; }
.fg { display:flex;flex-direction:column; }
.fl { font-size:.82rem;font-weight:600;color:#374151;margin-bottom:.35rem; }
.fi { padding:.7rem .875rem;border:2px solid #e5e7eb;border-radius:8px;font-size:.9rem; }
.fi:focus { outline:none;border-color:#16a34a; }
.vs :deep(.vs__dropdown-toggle) { padding:.6rem .875rem;border:2px solid #e5e7eb;border-radius:8px;min-height:44px; }
.po-info { padding:.6rem 1rem;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin-top:.75rem;font-size:.875rem; }
.row-card { background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:1rem;margin-bottom:.75rem; }
.row-hd { display:flex;justify-content:space-between;align-items:center;margin-bottom:.875rem; }
.rn { font-size:.75rem;font-weight:700;color:#6b7280;text-transform:uppercase; }
.btn-rm { background:#fee2e2;color:#ef4444;border:none;border-radius:5px;padding:2px 7px;cursor:pointer;font-weight:700; }
.line-block { padding:.75rem;border-radius:8px;margin-bottom:.75rem; }
.input-block  { background:#f0fdf4;border:1px solid #bbf7d0; }
.output-block { background:#eff6ff;border:1px solid #bfdbfe; }
.reject-block { background:#fff7ed;border:1px solid #fed7aa; }
.lb { display:inline-block;font-size:.72rem;font-weight:800;color:#374151;margin-bottom:.5rem;letter-spacing:.05em; }
.reject-toggle { margin-bottom:.5rem; }
.btn-toggle-rej { background:none;border:1px dashed #d1d5db;color:#6b7280;border-radius:6px;padding:4px 12px;font-size:.78rem;cursor:pointer; }
.rej-toggle { display:flex;gap:.625rem; }
.rt-btn { flex:1;padding:.6rem .5rem;border:2px solid #e5e7eb;border-radius:8px;background:white;font-size:.82rem;font-weight:600;cursor:pointer;color:#374151; }
.rt-active { border-color:#dc2626 !important;background:#fff5f5 !important;color:#dc2626 !important; }
.btn-add { display:flex;align-items:center;gap:.4rem;padding:.55rem .875rem;border-radius:7px;font-weight:600;font-size:.82rem;cursor:pointer;border:2px dashed;background:none;margin-top:.25rem; }
.a-green { border-color:#16a34a;color:#15803d; }
.actions { display:flex;justify-content:flex-end;gap:.875rem;padding-top:1.25rem;border-top:2px solid #e5e7eb; }
.btn-cancel { padding:.7rem 1.375rem;border-radius:8px;background:#f3f4f6;color:#374151;border:none;font-weight:600;cursor:pointer; }
.btn-submit { padding:.7rem 1.625rem;border-radius:8px;background:linear-gradient(135deg,#16a34a,#15803d);color:white;border:none;font-weight:700;cursor:pointer; }
.btn-submit:disabled { opacity:.6;cursor:not-allowed; }
@media(max-width:768px) { .g2,.g3 { grid-template-columns:1fr; } }
</style>
