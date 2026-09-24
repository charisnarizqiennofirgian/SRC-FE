<template>
  <DashboardLayout>
    <div v-if="isLoading" class="state-box">
      <div class="spinner"></div>
      <p>Memuat data stok opname...</p>
    </div>

    <template v-else-if="header">
      <div class="page-header-opname">
        <div class="header-top">
          <div>
            <div class="header-number">
              {{ header.opname_number }}
              <span :class="['status-badge', isDraft ? 'status-draft' : 'status-posted']">
                {{ isDraft ? 'Draft' : 'Posted' }}
              </span>
            </div>
            <div class="header-meta">
              <span>🏭 {{ header.warehouse?.name }}</span>
              <span>📅 {{ formatDate(header.opname_date) }}</span>
              <span>👤 {{ header.creator?.name || '-' }}</span>
              <span v-if="header.posted_at">✅ Diposting {{ formatDateTime(header.posted_at) }} oleh {{ header.poster?.name }}</span>
            </div>
            <div v-if="header.notes" class="header-notes">{{ header.notes }}</div>
          </div>
          <div class="header-actions">
            <button class="btn-header" @click="openPrint">🖨️ Cetak Lembar Hitung</button>
            <button class="btn-header" :disabled="isBusy" @click="downloadExcel">⬇️ Download Excel</button>
            <template v-if="isDraft">
              <button class="btn-header" :disabled="isBusy" @click="triggerUpload">⬆️ Upload Excel</button>
              <input ref="fileInput" type="file" accept=".xlsx,.xls" class="hidden-input" @change="uploadExcel" />
              <button class="btn-header" :disabled="isBusy" @click="openAddItem">➕ Tambah Item</button>
            </template>
          </div>
        </div>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">Total Baris</div>
          <div class="summary-value">{{ formatQty(summary.total) }}</div>
        </div>
        <div class="summary-card card-ok">
          <div class="summary-label">Sudah Dihitung</div>
          <div class="summary-value">{{ formatQty(summary.counted) }}</div>
        </div>
        <div class="summary-card card-muted">
          <div class="summary-label">Belum Dihitung</div>
          <div class="summary-value">{{ formatQty(summary.total - summary.counted) }}</div>
        </div>
        <div class="summary-card card-plus">
          <div class="summary-label">Selisih Lebih</div>
          <div class="summary-value">{{ formatQty(summary.plus) }}</div>
        </div>
        <div class="summary-card card-minus">
          <div class="summary-label">Selisih Kurang</div>
          <div class="summary-value">{{ formatQty(summary.minus) }}</div>
        </div>
      </div>

      <div v-if="isDraft && summary.changed > 0" class="warning-banner">
        ⚠️ <strong>{{ summary.changed }} barang</strong> stok sistemnya berubah sejak opname ini dibuat, artinya ada
        transaksi masuk/keluar di gudang ini. Selisih dihitung dari stok sistem terbaru. Pakai filter
        "Stok berubah" untuk melihatnya.
      </div>

      <div v-if="isDraft" class="info-banner">
        Isi kolom <strong>REAL</strong> dengan hasil hitung fisik. <strong>Kosongkan</strong> kalau barang tidak dihitung
        (stoknya tidak diubah), isi <strong>0</strong> kalau barang habis. Tekan <kbd>Enter</kbd> untuk pindah ke baris
        berikutnya.
        <span v-if="hasKomponen">Untuk komponen, isi Natural (N) dan Warna (W) terpisah. Yang dikosongkan dianggap 0.</span>
      </div>

      <div class="content-card">
        <div class="filter-row">
          <div class="search-wrapper">
            <span class="search-icon">🔍</span>
            <input v-model="filters.search" type="text" class="search-input" placeholder="Cari kode / nama barang..." />
          </div>
          <select v-model="filters.category" class="filter-select">
            <option value="">Semua Kategori</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <select v-model="filters.status" class="filter-select">
            <option value="">Semua Baris</option>
            <option value="uncounted">Belum dihitung</option>
            <option value="counted">Sudah dihitung</option>
            <option value="diff">Ada selisih</option>
            <option v-if="isDraft" value="changed">Stok berubah</option>
          </select>
        </div>

        <div class="table-wrapper">
          <table class="table-opname">
            <thead>
              <tr>
                <th class="col-no">No</th>
                <th>Kode</th>
                <th>Nama Barang</th>
                <th>Kategori</th>
                <th v-if="hasKayu" class="text-center">Grade</th>
                <th class="text-right">Stok Sistem</th>
                <th v-if="hasKayu" class="text-right">Sistem (m³)</th>
                <th v-if="hasKomponen" class="text-right">Sistem N / W</th>
                <th class="text-center col-real">REAL</th>
                <th class="text-right">Selisih</th>
                <th>Catatan</th>
                <th v-if="isDraft" class="text-center"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="pagedRows.length === 0">
                <td :colspan="colspan" class="empty-cell">Tidak ada baris yang cocok dengan filter.</td>
              </tr>
              <tr
                v-for="(row, idx) in pagedRows"
                :key="row.id"
                :class="{ 'row-counted': isCounted(row), 'row-dirty': dirtyIds.has(row.id) }"
              >
                <td class="col-no">{{ (page - 1) * perPage + idx + 1 }}</td>
                <td class="cell-code">{{ row.item_code }}</td>
                <td class="cell-name">
                  {{ row.item_name }}
                  <span v-if="row.is_manual" class="tag-manual">manual</span>
                </td>
                <td class="cell-muted">{{ row.category_name }}</td>
                <td v-if="hasKayu" class="text-center">{{ row.grade || '-' }}</td>
                <td class="text-right">
                  <strong>{{ formatQty(baseQty(row)) }}</strong>
                  <div v-if="isDraft && row.current_changed" class="changed-hint" title="Stok sistem berubah sejak opname dibuat">
                    awal {{ formatQty(row.system_qty_pcs) }}
                  </div>
                </td>
                <td v-if="hasKayu" class="text-right cell-muted">
                  {{ row.row_type === 'kayu' ? formatQty(row.system_qty_m3, 4) : '' }}
                </td>
                <td v-if="hasKomponen" class="text-right cell-muted">
                  <template v-if="row.row_type === 'komponen'">
                    {{ hasBreakdown(row) ? `${formatQty(row.system_qty_natural)} / ${formatQty(row.system_qty_warna)}` : '- / -' }}
                  </template>
                </td>
                <td class="text-center col-real">
                  <template v-if="row.row_type === 'komponen'">
                    <div class="komponen-inputs">
                      <input
                        v-model="row.in_nat"
                        type="number"
                        min="0"
                        step="any"
                        class="input-real input-half"
                        :placeholder="isDraft ? 'N' : ''"
                        :disabled="!isDraft"
                        data-nav="real"
                        @input="markDirty(row)"
                        @keydown.enter.prevent="focusNext($event)"
                      />
                      <input
                        v-model="row.in_warna"
                        type="number"
                        min="0"
                        step="any"
                        class="input-real input-half"
                        :placeholder="isDraft ? 'W' : ''"
                        :disabled="!isDraft"
                        data-nav="real"
                        @input="markDirty(row)"
                        @keydown.enter.prevent="focusNext($event)"
                      />
                    </div>
                  </template>
                  <input
                    v-else
                    v-model="row.in_pcs"
                    type="number"
                    min="0"
                    step="any"
                    class="input-real"
                    :disabled="!isDraft"
                    data-nav="real"
                    @input="markDirty(row)"
                    @keydown.enter.prevent="focusNext($event)"
                  />
                </td>
                <td class="text-right">
                  <span v-if="diffOf(row) !== null" :class="['diff-value', diffClass(diffOf(row))]">
                    {{ diffOf(row) > 0 ? '+' : '' }}{{ formatQty(diffOf(row)) }}
                  </span>
                  <span v-else class="cell-muted">-</span>
                </td>
                <td>
                  <input
                    v-model="row.in_notes"
                    type="text"
                    class="input-notes"
                    :disabled="!isDraft"
                    placeholder="-"
                    @input="markDirty(row)"
                  />
                </td>
                <td v-if="isDraft" class="text-center">
                  <button v-if="row.is_manual" class="btn-remove" title="Hapus item manual" @click="removeItem(row)">✕</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-row">
          <span class="pagination-info">
            {{ filteredRows.length ? (page - 1) * perPage + 1 : 0 }}–{{ Math.min(page * perPage, filteredRows.length) }}
            dari {{ formatQty(filteredRows.length) }} baris
          </span>
          <div class="pagination-btns">
            <button class="page-btn" :disabled="page === 1" @click="page--">← Prev</button>
            <span class="page-indicator">Hal {{ page }} / {{ totalPages }}</span>
            <button class="page-btn" :disabled="page >= totalPages" @click="page++">Next →</button>
          </div>
        </div>
      </div>

      <div v-if="isDraft" class="sticky-actions">
        <span class="dirty-info" :class="{ 'has-dirty': dirtyIds.size > 0 }">
          {{ dirtyIds.size > 0 ? `${dirtyIds.size} baris belum disimpan` : 'Semua perubahan tersimpan' }}
        </span>
        <button class="btn-save" :disabled="isBusy || dirtyIds.size === 0" @click="saveChanges()">
          💾 {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
        </button>
        <button class="btn-post" :disabled="isBusy || summary.counted === 0" @click="postOpname">
          ✅ Posting & Koreksi Stok
        </button>
      </div>
    </template>

    <div v-if="showAddItem" class="modal-overlay" @click.self="showAddItem = false">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Tambah Item ke Opname</h3>
          <button class="modal-close" @click="showAddItem = false">✕</button>
        </div>
        <div class="modal-body">
          <p class="modal-hint">
            Untuk barang yang ditemukan di gudang tapi tidak ada di daftar (stok sistemnya 0 di gudang ini).
          </p>
          <label class="form-label">Cari Barang</label>
          <input
            v-model="itemSearch"
            type="text"
            class="form-control"
            placeholder="Ketik minimal 2 huruf kode / nama..."
            @input="onItemSearch"
          />
          <div v-if="itemResults.length" class="item-results">
            <div
              v-for="item in itemResults"
              :key="item.id"
              :class="['item-result', { selected: selectedItem?.id === item.id }]"
              @click="selectedItem = item"
            >
              <div class="item-result-name">{{ item.name }}</div>
              <div class="item-result-meta">{{ item.code }} · {{ item.category_name || '-' }}</div>
            </div>
          </div>
          <p v-else-if="itemSearch.length >= 2 && !isSearching" class="cell-muted">Tidak ada barang ditemukan.</p>

          <template v-if="selectedItem?.row_type === 'kayu'">
            <label class="form-label">Grade (opsional)</label>
            <input v-model="addGrade" type="text" class="form-control" placeholder="Contoh: A, B" />
          </template>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showAddItem = false">Batal</button>
          <button class="btn-primary" :disabled="!selectedItem || isBusy" @click="addItem">Tambahkan</button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import Swal from 'sweetalert2'
import { useToast } from 'vue-toastification'
import apiClient from '@/api/axios'
import DashboardLayout from '@/components/DashboardLayout.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const header = ref(null)
const rows = ref([])
const isLoading = ref(true)
const isSaving = ref(false)
const isWorking = ref(false)
const dirtyIds = ref(new Set())
const fileInput = ref(null)

const filters = reactive({ search: '', category: '', status: '' })
const page = ref(1)
const perPage = 100

const showAddItem = ref(false)
const itemSearch = ref('')
const itemResults = ref([])
const isSearching = ref(false)
const selectedItem = ref(null)
const addGrade = ref('')
let searchTimer = null

const opnameId = computed(() => route.params.id)
const isDraft = computed(() => header.value?.status === 'draft')
const isBusy = computed(() => isSaving.value || isWorking.value)

const hasKayu = computed(() => rows.value.some((r) => r.row_type === 'kayu'))
const hasKomponen = computed(() => rows.value.some((r) => r.row_type === 'komponen'))
const colspan = computed(() => 8 + (hasKayu.value ? 2 : 0) + (hasKomponen.value ? 1 : 0) + (isDraft.value ? 1 : 0))

const categories = computed(() => [...new Set(rows.value.map((r) => r.category_name).filter(Boolean))].sort())

const toInput = (value) => (value === null || value === undefined ? '' : String(value))
const toNumber = (value) => (value === '' || value === null || value === undefined ? null : Number(value))

const loadData = async () => {
  isLoading.value = !header.value
  try {
    const response = await apiClient.get(`/stock-opnames/${opnameId.value}`)
    const data = response.data.data
    header.value = data.header
    rows.value = data.details.map((d) => ({
      ...d,
      in_pcs: toInput(d.real_qty_pcs),
      in_nat: d.real_qty_pcs === null ? '' : toInput(d.real_qty_natural),
      in_warna: d.real_qty_pcs === null ? '' : toInput(d.real_qty_warna),
      in_notes: d.notes || '',
    }))
    dirtyIds.value = new Set()
  } catch (error) {
    console.error('Error loading stock opname:', error)
    toast.error(error.response?.data?.message || 'Gagal memuat data stok opname.')
  } finally {
    isLoading.value = false
  }
}

const realQty = (row) => {
  if (row.row_type === 'komponen') {
    const nat = toNumber(row.in_nat)
    const warna = toNumber(row.in_warna)
    if (nat === null && warna === null) return null
    return (nat || 0) + (warna || 0)
  }
  return toNumber(row.in_pcs)
}

const isCounted = (row) => realQty(row) !== null

const baseQty = (row) => (isDraft.value ? row.current_qty_pcs : row.posted_system_qty_pcs ?? row.system_qty_pcs)

const diffOf = (row) => {
  if (!isDraft.value) return row.diff_qty_pcs
  const real = realQty(row)
  if (real === null) return null
  return Math.round((real - baseQty(row)) * 10000) / 10000
}

const diffClass = (diff) => (diff > 0 ? 'diff-plus' : diff < 0 ? 'diff-minus' : 'diff-zero')

const hasBreakdown = (row) => Math.abs(row.system_qty_natural + row.system_qty_warna - row.system_qty_pcs) < 0.0001

const summary = computed(() => {
  const result = { total: rows.value.length, counted: 0, plus: 0, minus: 0, changed: 0 }
  for (const row of rows.value) {
    if (row.current_changed) result.changed++
    if (!isCounted(row)) continue
    result.counted++
    const diff = diffOf(row)
    if (diff > 0) result.plus++
    else if (diff < 0) result.minus++
  }
  return result
})

const filteredRows = computed(() => {
  const keyword = filters.search.trim().toLowerCase()
  return rows.value.filter((row) => {
    if (filters.category && row.category_name !== filters.category) return false
    if (filters.status === 'uncounted' && isCounted(row)) return false
    if (filters.status === 'counted' && !isCounted(row)) return false
    if (filters.status === 'diff' && !diffOf(row)) return false
    if (filters.status === 'changed' && !row.current_changed) return false
    if (!keyword) return true
    return (row.item_code || '').toLowerCase().includes(keyword) || (row.item_name || '').toLowerCase().includes(keyword)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / perPage)))
const pagedRows = computed(() => filteredRows.value.slice((page.value - 1) * perPage, page.value * perPage))

watch(
  () => [filters.search, filters.category, filters.status],
  () => {
    page.value = 1
  },
)

const markDirty = (row) => {
  const next = new Set(dirtyIds.value)
  next.add(row.id)
  dirtyIds.value = next
}

const focusNext = (event) => {
  const inputs = Array.from(document.querySelectorAll('input[data-nav="real"]:not(:disabled)'))
  const idx = inputs.indexOf(event.target)
  if (idx >= 0 && idx < inputs.length - 1) {
    inputs[idx + 1].focus()
    inputs[idx + 1].select()
  }
}

const saveChanges = async ({ silent = false } = {}) => {
  if (dirtyIds.value.size === 0) return true
  const payload = rows.value
    .filter((row) => dirtyIds.value.has(row.id))
    .map((row) => ({
      id: row.id,
      real_qty_pcs: row.row_type === 'komponen' ? null : toNumber(row.in_pcs),
      real_qty_natural: row.row_type === 'komponen' ? toNumber(row.in_nat) : null,
      real_qty_warna: row.row_type === 'komponen' ? toNumber(row.in_warna) : null,
      notes: row.in_notes?.trim() || null,
    }))

  const invalid = payload.find(
    (p) => [p.real_qty_pcs, p.real_qty_natural, p.real_qty_warna].some((v) => v !== null && (isNaN(v) || v < 0)),
  )
  if (invalid) {
    toast.error('Ada angka REAL yang tidak valid (harus angka ≥ 0).')
    return false
  }

  isSaving.value = true
  try {
    const response = await apiClient.put(`/stock-opnames/${opnameId.value}/details`, { rows: payload })
    for (const p of payload) {
      const row = rows.value.find((r) => r.id === p.id)
      if (!row) continue
      if (row.row_type === 'komponen') {
        const hasValue = p.real_qty_natural !== null || p.real_qty_warna !== null
        row.real_qty_pcs = hasValue ? (p.real_qty_natural || 0) + (p.real_qty_warna || 0) : null
      } else {
        row.real_qty_pcs = p.real_qty_pcs
      }
    }
    dirtyIds.value = new Set()
    if (!silent) toast.success(response.data.message)
    return true
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal menyimpan hasil hitung.')
    return false
  } finally {
    isSaving.value = false
  }
}

const postOpname = async () => {
  if (!(await saveChanges({ silent: true }))) return
  const s = summary.value
  const uncounted = s.total - s.counted
  const result = await Swal.fire({
    title: 'Posting stok opname?',
    html: `
      <div style="text-align:left;font-size:0.95rem;line-height:1.7">
        Gudang: <b>${header.value.warehouse?.name}</b><br>
        Sudah dihitung: <b>${s.counted}</b> baris<br>
        Selisih lebih: <b style="color:#15803d">${s.plus}</b> · Selisih kurang: <b style="color:#b91c1c">${s.minus}</b><br>
        ${uncounted > 0 ? `<span style="color:#92400e">${uncounted} baris belum dihitung, stoknya <b>tidak diubah</b>.</span><br>` : ''}
        <br>Stok sistem akan dikoreksi sesuai angka REAL. Setelah diposting, opname tidak bisa diubah lagi.
      </div>`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Posting',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#0d9488',
  })
  if (!result.isConfirmed) return

  isWorking.value = true
  try {
    const response = await apiClient.post(`/stock-opnames/${opnameId.value}/post`)
    toast.success(response.data.message, { timeout: 7000 })
    filters.status = ''
    await loadData()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal posting stok opname.')
  } finally {
    isWorking.value = false
  }
}

const openPrint = () => {
  const target = router.resolve({ name: 'StockOpnameCetak', params: { id: opnameId.value } })
  window.open(target.href, '_blank')
}

const downloadExcel = async () => {
  if (isDraft.value && !(await saveChanges({ silent: true }))) return
  isWorking.value = true
  try {
    const response = await apiClient.get(`/stock-opnames/${opnameId.value}/export`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Stok-Opname-${header.value.opname_number}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading excel:', error)
    toast.error('Gagal download Excel.')
  } finally {
    isWorking.value = false
  }
}

const triggerUpload = async () => {
  if (!(await saveChanges({ silent: true }))) return
  fileInput.value?.click()
}

const uploadExcel = async (event) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  isWorking.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post(`/stock-opnames/${opnameId.value}/import`, formData)
    const errors = response.data.data?.errors || []
    if (errors.length) {
      Swal.fire({
        title: 'Upload selesai dengan catatan',
        html: `<p>${response.data.message}</p><div style="text-align:left;max-height:220px;overflow:auto;font-size:0.85rem">${errors.join('<br>')}</div>`,
        icon: 'warning',
      })
    } else {
      toast.success(response.data.message)
    }
    await loadData()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal upload Excel.')
  } finally {
    isWorking.value = false
  }
}

const openAddItem = () => {
  itemSearch.value = ''
  itemResults.value = []
  selectedItem.value = null
  addGrade.value = ''
  showAddItem.value = true
}

const onItemSearch = () => {
  clearTimeout(searchTimer)
  selectedItem.value = null
  if (itemSearch.value.trim().length < 2) {
    itemResults.value = []
    return
  }
  searchTimer = setTimeout(async () => {
    isSearching.value = true
    try {
      const response = await apiClient.get('/stock-opnames/items/search', { params: { search: itemSearch.value } })
      itemResults.value = response.data.data || []
    } catch (error) {
      console.error('Error searching items:', error)
    } finally {
      isSearching.value = false
    }
  }, 350)
}

const addItem = async () => {
  if (!(await saveChanges({ silent: true }))) return
  isWorking.value = true
  try {
    const response = await apiClient.post(`/stock-opnames/${opnameId.value}/items`, {
      item_id: selectedItem.value.id,
      grade: addGrade.value || null,
    })
    toast.success(response.data.message)
    showAddItem.value = false
    await loadData()
    filters.search = selectedItem.value?.code || ''
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal menambah item.')
  } finally {
    isWorking.value = false
  }
}

const removeItem = async (row) => {
  const result = await Swal.fire({
    title: 'Hapus item ini dari opname?',
    text: row.item_name,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#dc2626',
  })
  if (!result.isConfirmed) return
  if (!(await saveChanges({ silent: true }))) return
  try {
    const response = await apiClient.delete(`/stock-opnames/${opnameId.value}/items/${row.id}`)
    toast.success(response.data.message)
    await loadData()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal menghapus item.')
  }
}

const formatQty = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '-'
  return Number(value).toLocaleString('id-ID', { maximumFractionDigits: decimals })
}

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'

const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-'

const beforeUnload = (event) => {
  if (dirtyIds.value.size > 0) {
    event.preventDefault()
    event.returnValue = ''
  }
}

onBeforeRouteLeave(async () => {
  if (dirtyIds.value.size === 0) return true
  const result = await Swal.fire({
    title: 'Ada perubahan belum disimpan',
    text: `${dirtyIds.value.size} baris hasil hitung belum disimpan.`,
    icon: 'warning',
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: 'Simpan & keluar',
    denyButtonText: 'Keluar tanpa simpan',
    cancelButtonText: 'Tetap di sini',
    confirmButtonColor: '#0d9488',
  })
  if (result.isConfirmed) return await saveChanges({ silent: true })
  return result.isDenied
})

onMounted(() => {
  window.addEventListener('beforeunload', beforeUnload)
  loadData()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnload)
  clearTimeout(searchTimer)
})
</script>

<style scoped>
.state-box { text-align: center; padding: 4rem 2rem; color: #6b7280; }
.spinner { width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #0d9488; border-radius: 50%; margin: 0 auto 1rem; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.page-header-opname {
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  padding: 1.75rem 2rem; border-radius: 20px; margin-bottom: 1.5rem; color: white;
  box-shadow: 0 10px 40px rgba(13, 148, 136, 0.3);
}
.header-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.25rem; flex-wrap: wrap; }
.header-number { font-size: 1.6rem; font-weight: 800; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.header-meta { display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem; margin-top: 0.5rem; font-size: 0.9rem; opacity: 0.95; }
.header-notes { margin-top: 0.6rem; font-size: 0.85rem; background: rgba(255,255,255,0.15); padding: 0.5rem 0.75rem; border-radius: 8px; }
.header-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.btn-header {
  padding: 0.6rem 1rem; background: white; color: #0f766e; border: none; border-radius: 10px;
  font-weight: 700; font-size: 0.85rem; cursor: pointer; white-space: nowrap;
}
.btn-header:hover:not(:disabled) { background: #f0fdfa; }
.btn-header:disabled { opacity: 0.6; cursor: not-allowed; }
.hidden-input { display: none; }

.status-badge { padding: 0.25rem 0.7rem; border-radius: 999px; font-size: 0.75rem; font-weight: 800; }
.status-draft { background: #fef3c7; color: #92400e; }
.status-posted { background: #dcfce7; color: #166534; }

.summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.85rem; margin-bottom: 1rem; }
.summary-card { background: white; border-radius: 14px; padding: 0.9rem 1.1rem; border: 1px solid #e5e7eb; border-left: 4px solid #0d9488; }
.summary-card.card-ok { border-left-color: #16a34a; }
.summary-card.card-muted { border-left-color: #9ca3af; }
.summary-card.card-plus { border-left-color: #2563eb; }
.summary-card.card-minus { border-left-color: #dc2626; }
.summary-label { font-size: 0.78rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; }
.summary-value { font-size: 1.5rem; font-weight: 800; color: #111827; margin-top: 0.2rem; }

.warning-banner, .info-banner { border-radius: 12px; padding: 0.8rem 1rem; font-size: 0.88rem; margin-bottom: 1rem; line-height: 1.5; }
.warning-banner { background: #fef3c7; border: 1px solid #fcd34d; color: #92400e; }
.info-banner { background: #f0fdfa; border: 1px solid #99f6e4; color: #134e4a; }
kbd { background: white; border: 1px solid #99f6e4; border-radius: 4px; padding: 0 0.3rem; font-size: 0.8rem; }

.content-card { background: white; border-radius: 20px; box-shadow: 0 6px 24px rgba(15,23,42,0.08); border: 1px solid #f3f4f6; padding: 1.25rem 1.5rem 1.5rem; margin-bottom: 5rem; }
.filter-row { display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
.search-wrapper { position: relative; flex: 1 1 260px; display: flex; align-items: center; }
.search-icon { position: absolute; left: 0.9rem; pointer-events: none; }
.search-input { width: 100%; padding: 0.65rem 1rem 0.65rem 2.6rem; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 0.9rem; }
.filter-select { padding: 0.65rem 0.9rem; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 0.88rem; background: white; }
.search-input:focus, .filter-select:focus { outline: none; border-color: #0d9488; }

.table-wrapper { overflow-x: auto; }
.table-opname { width: 100%; border-collapse: collapse; min-width: 980px; }
.table-opname thead { background: #f9fafb; position: sticky; top: 0; z-index: 1; }
.table-opname th { padding: 0.75rem 0.7rem; text-align: left; font-size: 0.74rem; font-weight: 800; color: #374151; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid #e5e7eb; white-space: nowrap; }
.table-opname td { padding: 0.5rem 0.7rem; border-bottom: 1px solid #f3f4f6; font-size: 0.87rem; vertical-align: middle; }
.table-opname tbody tr:hover { background: #f9fafb; }
.row-counted { background: #f0fdf4; }
.row-dirty td:first-child { box-shadow: inset 3px 0 0 #f59e0b; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.col-no { width: 48px; color: #9ca3af; font-size: 0.8rem; }
.col-real { width: 160px; background: #fefce8; }
.cell-code { font-family: monospace; font-size: 0.82rem; color: #374151; white-space: nowrap; }
.cell-name { font-weight: 600; color: #111827; min-width: 220px; }
.cell-muted { color: #6b7280; font-size: 0.82rem; }
.tag-manual { display: inline-block; margin-left: 0.35rem; padding: 0.05rem 0.45rem; border-radius: 999px; background: #e0e7ff; color: #3730a3; font-size: 0.7rem; font-weight: 700; }
.changed-hint { font-size: 0.72rem; color: #b45309; font-weight: 700; }
.empty-cell { text-align: center; color: #6b7280; padding: 2rem !important; font-style: italic; }

.input-real { width: 110px; padding: 0.4rem 0.5rem; border: 2px solid #fde68a; border-radius: 8px; text-align: right; font-weight: 700; font-size: 0.9rem; background: white; }
.input-real:focus { outline: none; border-color: #0d9488; }
.input-real:disabled { background: transparent; border-color: transparent; color: #111827; }
.komponen-inputs { display: flex; gap: 0.3rem; justify-content: center; }
.input-half { width: 68px; }
.input-notes { width: 100%; min-width: 140px; padding: 0.35rem 0.5rem; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.82rem; }
.input-notes:disabled { border-color: transparent; background: transparent; }

.diff-value { font-weight: 800; }
.diff-plus { color: #1d4ed8; }
.diff-minus { color: #b91c1c; }
.diff-zero { color: #6b7280; }
.btn-remove { border: none; background: #fee2e2; color: #b91c1c; border-radius: 6px; width: 26px; height: 26px; cursor: pointer; font-weight: 700; }

.pagination-row { display: flex; align-items: center; justify-content: space-between; padding-top: 1rem; flex-wrap: wrap; gap: 0.5rem; }
.pagination-info { font-size: 0.85rem; color: #6b7280; font-weight: 600; }
.pagination-btns { display: flex; gap: 0.5rem; align-items: center; }
.page-indicator { font-size: 0.85rem; color: #374151; font-weight: 600; }
.page-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid #e5e7eb; background: white; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.page-btn:disabled { opacity: 0.4; cursor: default; }

.sticky-actions {
  position: fixed; bottom: 0; right: 0; left: 0; z-index: 900;
  display: flex; justify-content: flex-end; align-items: center; gap: 0.75rem;
  padding: 0.85rem 1.5rem; background: rgba(255,255,255,0.97); border-top: 1px solid #e5e7eb;
  box-shadow: 0 -4px 16px rgba(0,0,0,0.06);
}
.dirty-info { font-size: 0.85rem; color: #6b7280; font-weight: 600; }
.dirty-info.has-dirty { color: #b45309; }
.btn-save, .btn-post { padding: 0.7rem 1.3rem; border-radius: 10px; font-weight: 800; font-size: 0.9rem; cursor: pointer; border: none; }
.btn-save { background: white; color: #0f766e; border: 2px solid #0d9488; }
.btn-post { background: #0d9488; color: white; }
.btn-save:disabled, .btn-post:disabled { opacity: 0.5; cursor: not-allowed; }

.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 1rem; }
.modal-box { background: white; border-radius: 16px; width: 100%; max-width: 520px; box-shadow: 0 20px 50px rgba(0,0,0,0.25); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f3f4f6; }
.modal-header h3 { margin: 0; font-size: 1.1rem; font-weight: 800; }
.modal-close { border: none; background: transparent; font-size: 1.1rem; cursor: pointer; color: #6b7280; }
.modal-body { padding: 1.25rem 1.5rem; }
.modal-hint { font-size: 0.85rem; color: #4b5563; background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 10px; padding: 0.7rem 0.9rem; margin: 0 0 0.75rem; }
.form-label { display: block; font-size: 0.85rem; font-weight: 700; color: #374151; margin: 0.8rem 0 0.35rem; }
.form-control { width: 100%; padding: 0.65rem 0.85rem; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 0.9rem; box-sizing: border-box; }
.form-control:focus { outline: none; border-color: #0d9488; }
.item-results { max-height: 260px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 10px; margin-top: 0.5rem; }
.item-result { padding: 0.6rem 0.85rem; cursor: pointer; border-bottom: 1px solid #f3f4f6; }
.item-result:hover { background: #f9fafb; }
.item-result.selected { background: #ccfbf1; }
.item-result-name { font-weight: 700; font-size: 0.88rem; color: #111827; }
.item-result-meta { font-size: 0.78rem; color: #6b7280; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.6rem; padding: 1rem 1.5rem 1.25rem; }
.btn-secondary { padding: 0.65rem 1.2rem; border: 1px solid #d1d5db; background: white; border-radius: 10px; font-weight: 700; cursor: pointer; }
.btn-primary { padding: 0.65rem 1.4rem; border: none; background: #0d9488; color: white; border-radius: 10px; font-weight: 700; cursor: pointer; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 768px) {
  .page-header-opname { padding: 1.25rem; }
  .content-card { padding: 1rem; }
  .sticky-actions { padding: 0.75rem 1rem; }
  .dirty-info { display: none; }
}
</style>
