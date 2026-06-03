<template>
  <div class="item-select-vs">
    <div class="select-with-btn">
      <VueSelect
        :model-value="modelValue"
        :options="options"
        :reduce="(item) => item.id"
        label="label"
        :filterable="false"
        placeholder="🔍 Ketik untuk mencari barang..."
        :clearable="true"
        :loading="isLoading"
        @search="onSearch"
        @update:model-value="onUpdate"
      >
        <template #option="o">
          <div class="vs-item-option">
            <div class="vs-item-code">{{ o.code }}</div>
            <div class="vs-item-name">{{ o.name }}</div>
            <div v-if="hasDimension(o)" class="vs-item-dim">{{ formatDim(o) }}</div>
            <div class="vs-item-cat">{{ o.category_name }}</div>
          </div>
        </template>
        <template #selected-option="o">
          <div class="vs-selected-wrapper">
            <span v-if="o.code" class="vs-selected-code">{{ o.code }} — </span>
            <span>{{ o.name }}</span>
            <span v-if="hasDimension(o)" class="vs-selected-dim"> · {{ formatDim(o) }}</span>
          </div>
        </template>
        <template #no-options="{ search }">
          <span v-if="search" class="vs-empty">Tidak ditemukan "{{ search }}"</span>
          <span v-else class="vs-empty">Ketik minimal 1 karakter...</span>
        </template>
      </VueSelect>
      <button type="button" class="btn-add-item" @click="showModal = true" title="Tambah barang baru">➕</button>
    </div>

    <!-- MODAL TAMBAH ITEM BARU -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>➕ Tambah Barang Baru</h3>
          <button type="button" class="modal-close" @click="showModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p v-if="!addableCategories.length" class="modal-hint">Barang akan masuk ke kategori <strong>Bahan Operasional</strong>, gudang <strong>UMUM</strong>.</p>
          <div class="form-grid">
            <!-- Pilih jenis barang jika ada beberapa kategori -->
            <div v-if="addableCategories.length" class="form-group form-full">
              <label class="form-label">Jenis Barang <span class="req">*</span></label>
              <select v-model="newItem.category_id" class="form-input">
                <option value="">— Pilih Jenis —</option>
                <option v-for="c in addableCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>

            <!-- Field umum: Kode & Nama selalu tampil -->
            <div class="form-group">
              <label class="form-label">Kode <span class="hint">(opsional)</span></label>
              <input v-model="newItem.code" type="text" class="form-input" placeholder="Auto generate jika kosong" />
            </div>
            <div class="form-group">
              <label class="form-label">Nama Barang <span class="req">*</span></label>
              <input v-model="newItem.name" type="text" class="form-input" placeholder="Nama barang..." />
            </div>

            <!-- Bahan Operasional: Satuan & Harga -->
            <template v-if="!newItemIsKartonBox">
              <div class="form-group">
                <label class="form-label">Satuan <span class="req">*</span></label>
                <select v-model="newItem.unit_id" class="form-input">
                  <option value="">Pilih Satuan</option>
                  <option v-for="u in daftarSatuan" :key="u.id" :value="u.id">{{ u.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Harga Satuan <span class="hint">(opsional)</span></label>
                <input v-model.number="newItem.price" type="number" min="0" class="form-input" placeholder="0" />
              </div>
            </template>

            <!-- Karton Box: Buyer, Model, Jenis Karton, Kualitas, P/L/T -->
            <template v-if="newItemIsKartonBox">
              <div class="form-group form-full">
                <p class="dim-hint">Satuan otomatis <strong>PCS</strong>, gudang otomatis <strong>PACKING</strong></p>
              </div>
              <div class="form-group">
                <label class="form-label">Buyer <span class="hint">(opsional)</span></label>
                <input v-model="newItem.buyer_name" type="text" class="form-input" placeholder="cth: ETHIMO" />
              </div>
              <div class="form-group">
                <label class="form-label">Model <span class="hint">(opsional)</span></label>
                <input v-model="newItem.model" type="text" class="form-input" placeholder="cth: AGAVE" />
              </div>
              <div class="form-group">
                <label class="form-label">Jenis Karton <span class="hint">(opsional)</span></label>
                <input v-model="newItem.jenis_karton" type="text" class="form-input" placeholder="cth: RST / Single Wall" />
              </div>
              <div class="form-group">
                <label class="form-label">Kualitas <span class="hint">(opsional)</span></label>
                <input v-model="newItem.kualitas" type="text" class="form-input" placeholder="cth: A / B/F / C/F" />
              </div>
              <div class="form-group form-full">
                <p class="dim-hint">Dimensi dalam <strong>mm</strong></p>
              </div>
              <div class="form-group">
                <label class="form-label">Panjang (P) mm <span class="req">*</span></label>
                <input v-model.number="newItem.spec_p" type="number" min="0" class="form-input" placeholder="cth: 960" />
              </div>
              <div class="form-group">
                <label class="form-label">Lebar (L) mm <span class="req">*</span></label>
                <input v-model.number="newItem.spec_l" type="number" min="0" class="form-input" placeholder="cth: 940" />
              </div>
              <div class="form-group">
                <label class="form-label">Tinggi (T) mm <span class="req">*</span></label>
                <input v-model.number="newItem.spec_t" type="number" min="0" class="form-input" placeholder="cth: 940" />
              </div>
            </template>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="showModal = false">Batal</button>
          <button type="button" class="btn-save" @click="simpanItemBaru" :disabled="isSaving">
            {{ isSaving ? '⏳ Menyimpan...' : '💾 Simpan & Pilih' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import apiClient from '../api/axios'
import { debounce } from 'lodash-es'

const props = defineProps({
  modelValue: { default: '' },
  categoryIds: { type: Array, default: () => [] },
  initialItem: { type: Object, default: null },
  addableCategories: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const options = ref([])
const isLoading = ref(false)
const selectedItemInternal = ref(null)

const showModal   = ref(false)
const isSaving    = ref(false)
const daftarSatuan = ref([])
const newItem     = ref({ code: '', name: '', unit_id: '', price: 0, category_id: '', spec_p: null, spec_l: null, spec_t: null, buyer_name: '', model: '', jenis_karton: '', kualitas: '' })

const newItemIsKartonBox = computed(() => {
  if (!newItem.value.category_id || !props.addableCategories.length) return false
  const cat = props.addableCategories.find(c => c.id == newItem.value.category_id)
  return cat?.name?.toLowerCase().trim() === 'karton box'
})

const fetchSatuan = async () => {
  try {
    const res = await apiClient.get('/units/all')
    daftarSatuan.value = res.data.data || []
  } catch { /* silent */ }
}

const simpanItemBaru = async () => {
  if (!newItem.value.name) { alert('Nama barang wajib diisi!'); return }
  if (props.addableCategories.length && !newItem.value.category_id) { alert('Jenis barang wajib dipilih!'); return }
  if (!newItemIsKartonBox.value && !newItem.value.unit_id) { alert('Satuan wajib dipilih!'); return }
  if (newItemIsKartonBox.value && (!newItem.value.spec_p || !newItem.value.spec_l || !newItem.value.spec_t)) {
    alert('Dimensi P, L, T wajib diisi untuk Karton Box!'); return
  }

  isSaving.value = true
  try {
    let categoryId    = newItem.value.category_id || null
    let unitId        = newItem.value.unit_id
    let warehouseCode = newItemIsKartonBox.value ? 'PACKING' : 'UMUM'

    if (!categoryId) {
      // fallback: cari Bahan Operasional (perilaku lama)
      const catRes = await apiClient.get('/categories/all')
      const categories = catRes.data.data || []
      const cat = categories.find(c => c.name.toLowerCase().includes('operasional') || c.name.toLowerCase().includes('bahan'))
      if (!cat) { alert('Kategori Bahan Operasional tidak ditemukan!'); return }
      categoryId = cat.id
    }

    if (newItemIsKartonBox.value) {
      // Karton box selalu PCS, sama persis dengan FormKarton
      const pcUnit = daftarSatuan.value.find(u => u.name === 'PCS' || u.short_name === 'PCS')
      if (!pcUnit) { alert('Satuan PCS tidak ditemukan!'); return }
      unitId = pcUnit.id
    }

    const whRes    = await apiClient.get('/warehouses')
    const warehouses = whRes.data.data || whRes.data || []
    const wh       = warehouses.find(w => w.code === warehouseCode)

    const payload = {
      code:                 newItem.value.code || null,
      name:                 newItem.value.name,
      category_id:          categoryId,
      unit_id:              unitId,
      price:                newItem.value.price || 0,
      stock:                0,
      initial_warehouse_id: wh?.id ?? null,
    }

    if (newItemIsKartonBox.value) {
      const p = newItem.value.spec_p || 0
      const l = newItem.value.spec_l || 0
      const t = newItem.value.spec_t || 0
      payload.specifications = { p, l, t, m3_per_pcs: (p * l * t) / 1000000000 }
      payload.buyer_name    = newItem.value.buyer_name   || null
      payload.model         = newItem.value.model        || null
      payload.jenis_karton  = newItem.value.jenis_karton || null
      payload.kualitas      = newItem.value.kualitas     || null
    }

    const res = await apiClient.post('/materials', payload)
    const item = res.data.data
    const formatted = formatItem(item)

    options.value = [formatted, ...options.value]
    onUpdate(item.id)

    showModal.value = false
    newItem.value = { code: '', name: '', unit_id: '', price: 0, category_id: '', spec_p: null, spec_l: null, spec_t: null, buyer_name: '', model: '', jenis_karton: '', kualitas: '' }
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal menyimpan barang')
  } finally {
    isSaving.value = false
  }
}

const hasDimension = (item) => {
  if (!item) return false
  const s = item.specifications
  if (s?.p && s?.l && s?.t) return true
  if (item.cutting_p && item.cutting_l && item.cutting_t) return true
  return false
}
const formatDim = (item) => {
  const s = item.specifications
  if (s?.p && s?.l && s?.t) return `${s.p} × ${s.l} × ${s.t} mm`
  return `${item.cutting_p} × ${item.cutting_l} × ${item.cutting_t} mm`
}

// Formatting item for vue-select display
const formatItem = (item) => ({
  ...item,
  label: item.code ? `${item.code} — ${item.name}` : item.name,
  category_name: item.category?.name || item.category_name || 'Lainnya',
})

// Initialize options with initial item if exists
const initOptions = () => {
  if (props.initialItem && props.initialItem.id) {
    selectedItemInternal.value = formatItem(props.initialItem)
    options.value = [selectedItemInternal.value]
  }
}

const onSearch = debounce(async (search, loading) => {
  if (!search) {
    options.value = selectedItemInternal.value ? [selectedItemInternal.value] : []
    return
  }

  loading(true)
  isLoading.value = true

  try {
    const params = {
      search: search,
      limit: 20,
    }
    if (props.categoryIds && props.categoryIds.length > 0) {
      params.category_ids = props.categoryIds.join(',')
    }

    const res = await apiClient.get('/materials', { params })
    const raw = res.data?.data?.data ?? res.data?.data ?? res.data ?? []
    const results = Array.isArray(raw) ? raw : []
    
    const formattedResults = results.map(formatItem)
    
    // Pastikan item yang sedang terpilih tetap ada di daftar agar tidak hilang labelnya
    if (selectedItemInternal.value) {
      const exists = formattedResults.find(r => r.id === selectedItemInternal.value.id)
      if (!exists) {
        formattedResults.unshift(selectedItemInternal.value)
      }
    }

    options.value = formattedResults
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    loading(false)
    isLoading.value = false
  }
}, 200)

const onUpdate = (val) => {
  // Cari objek item dari options untuk disimpan sebagai selectedItemInternal
  const itemObj = options.value.find(o => o.id === val)
  if (itemObj) {
    selectedItemInternal.value = itemObj
  } else if (!val) {
    selectedItemInternal.value = null
  }
  
  emit('update:modelValue', val ?? '')
}

onMounted(() => {
  initOptions()
  fetchSatuan()
})

// Watch initialItem for changes (e.g. when Edit data is loaded)
watch(() => props.initialItem, initOptions, { deep: true })
</script>

<style scoped>
.item-select-vs {
  width: 100%;
}

:deep(.vs__dropdown-toggle) {
  padding: 0;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  min-height: 38px;
  transition: all 0.2s;
}

:deep(.vs--open .vs__dropdown-toggle) {
  border-color: #0369a1;
  box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.08);
}

:deep(.vs__selected) {
  margin: 4px 8px;
  padding: 0;
  color: #111827;
  font-size: 13px;
}

:deep(.vs__search) {
  padding: 4px 10px;
  margin: 0;
  font-size: 13px;
  color: #374151;
}

:deep(.vs__dropdown-menu) {
  border: 1.5px solid #0369a1;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  padding: 5px;
  z-index: 9999;
}

.vs-item-option {
  padding: 4px 0;
}

.vs-item-code {
  font-size: 11px;
  font-weight: 700;
  color: #0369a1;
  margin-bottom: 1px;
}

.vs-item-name {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
}

.vs-item-dim {
  font-size: 11px;
  color: #0369a1;
  font-weight: 600;
  margin-top: 1px;
}

.vs-item-cat {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 2px;
  font-style: italic;
}

.vs-selected-code {
  font-weight: 700;
  color: #0369a1;
}

.vs-selected-dim {
  color: #0369a1;
  font-weight: 600;
  font-size: 12px;
}

.vs-selected-wrapper {
  font-size: 13px;
}

.vs-empty {
  padding: 10px;
  font-size: 13px;
  color: #6b7280;
  display: block;
}

:deep(.vs__dropdown-option--highlight) {
  background: #eff6ff;
  color: #1d4ed8;
}

:deep(.vs__clear) {
  fill: #9ca3af;
}

:deep(.vs__open-indicator) {
  fill: #9ca3af;
  transform: scale(0.8);
}

:deep(.vs__spinner) {
  border-left-color: #0369a1;
}

.select-with-btn {
  display: flex;
  gap: 6px;
  align-items: center;
}
.select-with-btn .item-select-vs,
.select-with-btn > :first-child {
  flex: 1;
  min-width: 0;
}
.btn-add-item {
  flex-shrink: 0;
  width: 34px; height: 34px;
  background: #dbeafe; color: #1e40af;
  border: 1.5px solid #93c5fd;
  border-radius: 8px; font-size: 15px;
  cursor: pointer; display: flex;
  align-items: center; justify-content: center;
  transition: all 0.2s;
}
.btn-add-item:hover { background: #bfdbfe; transform: scale(1.1); }

.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 99999;
}
.modal-card {
  background: white; border-radius: 14px;
  width: 90%; max-width: 500px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden;
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 18px 24px;
  background: linear-gradient(135deg, #0369a1, #0284c7); color: white;
}
.modal-header h3 { margin: 0; font-size: 17px; font-weight: 800; }
.modal-close {
  background: rgba(255,255,255,0.2); border: none; color: white;
  width: 32px; height: 32px; border-radius: 50%; font-size: 18px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.modal-close:hover { background: rgba(255,255,255,0.3); }
.modal-body { padding: 24px; }
.modal-hint { font-size: 13px; color: #6b7280; margin: 0 0 16px; }
.dim-hint   { font-size: 12px; color: #6b7280; margin: 0; padding: 6px 10px; background: #f0f9ff; border-radius: 6px; border-left: 3px solid #0369a1; }
.form-full  { grid-column: 1 / -1; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-label { font-size: 12px; font-weight: 700; color: #374151; }
.hint { font-weight: 400; color: #9ca3af; }
.req { color: #ef4444; }
.form-input {
  padding: 9px 12px; border: 1.5px solid #e5e7eb;
  border-radius: 7px; font-size: 13px; font-family: inherit;
}
.form-input:focus { outline: none; border-color: #0369a1; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 16px 24px; background: #f9fafb;
  border-top: 1.5px solid #e5e7eb;
}
.btn-cancel {
  padding: 9px 18px; background: #e5e7eb; color: #374151;
  border: none; border-radius: 7px; font-weight: 700; cursor: pointer;
}
.btn-save {
  padding: 9px 20px; background: #0369a1; color: white;
  border: none; border-radius: 7px; font-weight: 700; cursor: pointer;
}
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
