<template>
  <DashboardLayout>
    <div class="page-header-material">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-material">
            <span class="material-icon">📦</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-material">Pemakaian Bahan</h1>
            <p class="page-subtitle-material">
              Catat pengambilan bahan operasional & karton box dari stok gudang.
            </p>
          </div>
        </div>
        <div class="header-badge-section">
          <div class="process-badge">
            <span class="process-icon">🏭</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">📦</span>
            <span class="process-arrow">→</span>
            <span class="process-icon">✅</span>
          </div>
          <div class="flow-label-material">Stok → Pakai → Catat</div>
        </div>
      </div>
    </div>

    <div
      v-if="alert.show"
      :class="['alert-box', alert.type === 'success' ? 'alert-success' : 'alert-error']"
    >
      <span class="alert-icon">
        {{ alert.type === 'success' ? '✅' : '❌' }}
      </span>
      <span class="alert-message">{{ alert.message }}</span>
    </div>

    <div class="content-card-material">
      <div class="card-body-material">
        <form @submit.prevent="submitForm">
          <div class="form-section-modern">
            <div class="section-header section-header-item">
              <div class="section-icon-badge material-item-badge">
                <span class="section-icon">🏷️</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Pilih Barang</h3>
                <p class="section-subtitle">
                  Filter kategori, cari dan tambahkan barang yang akan digunakan.
                </p>
              </div>
            </div>

            <div class="filter-row">
              <div class="form-group-modern filter-category">
                <label class="form-label-modern">Filter Kategori</label>
                <div class="select-wrapper-modern">
                  <span class="select-icon">📁</span>
                  <select
                    v-model="selectedCategory"
                    @change="onCategoryChange"
                    class="form-select-modern"
                  >
                    <option value="">-- Semua Kategori --</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </option>
                  </select>
                  <span class="select-arrow">▼</span>
                </div>
              </div>

              <div class="form-group-modern filter-search">
                <label class="form-label-modern">Cari Barang</label>
                <div class="search-wrapper">
                  <span class="search-icon">🔍</span>
                  <input
                    type="text"
                    v-model="searchQuery"
                    @input="onSearchInput"
                    @focus="showDropdown = true"
                    class="search-input"
                    placeholder="Ketik nama atau kode barang..."
                  />
                  <button
                    v-if="searchQuery"
                    type="button"
                    class="clear-search-btn"
                    @click="clearSearch"
                  >
                    ✕
                  </button>
                </div>

                <div v-if="showDropdown && filteredItems.length > 0" class="search-dropdown">
                  <div
                    v-for="item in filteredItems"
                    :key="item.id"
                    class="search-item"
                    @click="addItemToList(item)"
                  >
                    <div class="search-item-main">
                      <span class="search-item-name">
                        {{ item.code ? `[${item.code}]` : '' }} {{ item.name }}
                      </span>
                      <div class="search-item-badges">
                        <span class="search-item-category">{{ item.category?.name }}</span>
                        <span class="search-item-unit">{{ item.unit?.name }}</span>
                      </div>
                    </div>
                    <div class="search-item-sub">
                      Stok: <strong>{{ formatNumber(item.stock) }}</strong> {{ item.unit?.name }}
                    </div>
                  </div>
                </div>

                <div
                  v-if="
                    showDropdown && searchQuery && filteredItems.length === 0 && !isLoadingItems
                  "
                  class="search-dropdown-empty"
                >
                  <span class="empty-icon">🔍</span>
                  <span>Barang tidak ditemukan</span>
                </div>

                <div v-if="isLoadingItems" class="search-dropdown-loading">
                  <span>⏳ Memuat data...</span>
                </div>
              </div>
            </div>

            <div v-if="selectedItems.length > 0" class="selected-items-section">
              <div class="selected-items-header">
                <span class="selected-icon">📋</span>
                <span class="selected-title">Barang yang Dipilih ({{ selectedItems.length }})</span>
                <button type="button" class="btn-clear-all" @click="clearAllItems">
                  🗑️ Hapus Semua
                </button>
              </div>

              <div class="selected-items-list">
                <div v-for="(item, index) in selectedItems" :key="index" class="selected-item-card">
                  <div class="selected-item-header">
                    <div class="selected-item-info">
                      <span
                        class="item-dot"
                        :class="getCategoryColorClass(item.category_id)"
                      ></span>
                      <div>
                        <div class="item-name">
                          {{ item.code ? `[${item.code}]` : '' }} {{ item.name }}
                        </div>
                        <div class="item-meta">
                          <span class="item-category-badge">{{
                            item.category?.name || 'Umum'
                          }}</span>
                          <span class="item-stock">
                            Stok: <strong>{{ formatNumber(item.stock) }}</strong>
                            {{ item.unit?.name }}
                          </span>
                          <span class="item-stock">
                            Harga: <strong>{{ formatRupiah(item.price) }}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      class="btn-remove-item"
                      @click="removeItemFromList(index)"
                    >
                      ✕
                    </button>
                  </div>

                  <div class="selected-item-body">
                    <div class="input-qty-wrapper">
                      <label class="qty-label"
                        >Jumlah Pemakaian <span class="required-star">*</span></label
                      >
                      <div class="input-wrapper-icon slim">
                        <span class="input-icon">🔢</span>
                        <input
                          v-model.number="item.qty"
                          type="number"
                          step="0.01"
                          min="0.01"
                          :max="item.stock"
                          class="form-input-modern"
                          placeholder="0"
                          required
                        />
                        <span class="input-suffix">{{ item.unit?.name || 'Unit' }}</span>
                      </div>
                      <p v-if="item.qty > item.stock" class="input-hint error-hint">
                        ⚠️ Jumlah melebihi stok tersedia!
                      </p>
                      <p v-else-if="item.qty > 0" class="input-hint success-hint">
                        ✅ Sisa stok setelah pemakaian: {{ formatNumber(item.stock - item.qty) }}
                        {{ item.unit?.name }}
                      </p>
                      <p v-if="item.qty > 0 && item.price > 0" class="input-hint total-hint">
                        💰 Total Nilai: <strong>{{ formatRupiah(item.qty * item.price) }}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="empty-selection-hint">
              <div class="hint-icon">👆</div>
              <div class="hint-text">
                Pilih barang dari dropdown di atas untuk memulai pencatatan
              </div>
            </div>
          </div>

          <div v-if="selectedItems.length > 0" class="form-section-modern">
            <div class="section-header section-header-qty">
              <div class="section-icon-badge material-qty-badge">
                <span class="section-icon">📝</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Detail Pemakaian</h3>
                <p class="section-subtitle">Informasi tambahan untuk pencatatan.</p>
              </div>
            </div>

            <div class="form-grid-2col">
              <div class="form-group-modern">
                <label class="form-label-modern">Divisi <span class="required-star">*</span></label>
                <div class="select-wrapper-modern">
                  <span class="select-icon">🏢</span>
                  <select v-model="form.division" class="form-select-modern" required>
                    <option value="">-- Pilih Divisi --</option>
                    <option v-for="div in divisions" :key="div.id" :value="div.name">
                      {{ div.name }}
                    </option>
                  </select>
                  <span class="select-arrow">▼</span>
                </div>
              </div>

              <div class="form-group-modern">
                <label class="form-label-modern">Tanggal</label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">📅</span>
                  <input type="date" v-model="form.date" class="form-input-modern" />
                </div>
              </div>
            </div>

            <div class="form-group-modern">
              <label class="form-label-modern">Keterangan</label>
              <textarea
                v-model="form.notes"
                rows="3"
                class="form-textarea-modern"
                placeholder="Keterangan tambahan (opsional)"
              ></textarea>
            </div>
          </div>

          <div v-if="selectedItems.length > 0" class="form-actions-modern">
            <div class="summary-box">
              <div class="summary-title">Ringkasan Pemakaian</div>
              <div class="summary-content">
                <span class="summary-item">📦 {{ selectedItems.length }} jenis barang</span>
                <span class="summary-item">🏢 {{ form.division || '-' }}</span>
                <span class="summary-item">📅 {{ formatDate(form.date) }}</span>
                <span class="summary-item">💰 Total Nilai: <strong>{{ formatRupiah(totalNilai) }}</strong></span>
              </div>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting || !isFormValid"
              class="btn-action btn-submit-material"
            >
              <span class="btn-icon">
                <span v-if="isSubmitting">⏳</span>
                <span v-else>💾</span>
              </span>
              <span class="btn-text">
                <span v-if="isSubmitting">Menyimpan...</span>
                <span v-else>Simpan Pemakaian ({{ selectedItems.length }} item)</span>
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="history-section">
      <div class="history-header">
        <div class="history-title-wrapper">
          <span class="history-icon">📜</span>
          <h2 class="history-title">Riwayat Pemakaian Terakhir</h2>
        </div>
      </div>

      <div v-if="recentLogs.length === 0" class="empty-state-card">
        <div class="empty-icon">📭</div>
        <div class="empty-title">Belum Ada Data</div>
        <div class="empty-message">Belum ada riwayat pemakaian bahan yang tercatat.</div>
      </div>

      <div v-else class="history-table-wrapper">
        <table class="history-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Barang</th>
              <th class="col-center">Qty</th>
              <th>Harga Satuan</th>
              <th>Total Nilai</th>
              <th>Divisi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in recentLogs" :key="log.id">
              <td class="cell-date">{{ formatDate(log.date) }}</td>
              <td class="cell-item">
                <span class="item-dot"></span>
                {{ log.item?.name }}
              </td>
              <td class="cell-qty">
                <span class="qty-badge">-{{ formatNumber(log.qty) }}</span>
              </td>
              <td>{{ formatRupiah(log.item?.price || 0) }}</td>
              <td><strong>{{ formatRupiah((log.qty || 0) * (log.item?.price || 0)) }}</strong></td>
              <td class="cell-division">{{ log.division }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="historyMeta.last_page > 1" class="history-pagination">
          <span class="pagination-info">
            {{ historyMeta.from }}–{{ historyMeta.to }} dari {{ historyMeta.total }} data
          </span>
          <div class="pagination-btns">
            <button
              class="page-btn"
              :disabled="historyPage === 1"
              @click="goHistoryPage(historyPage - 1)"
            >← Prev</button>
            <button
              v-for="p in historyPages"
              :key="p"
              :class="['page-btn', { active: p === historyPage, dots: p === '...' }]"
              :disabled="p === '...'"
              @click="p !== '...' && goHistoryPage(p)"
            >{{ p }}</button>
            <button
              class="page-btn"
              :disabled="historyPage === historyMeta.last_page"
              @click="goHistoryPage(historyPage + 1)"
            >Next →</button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from '@/api/axios'
import DashboardLayout from '@/components/DashboardLayout.vue'

const items = ref([])
const categories = ref([])
const divisions = ref([])
const isSubmitting = ref(false)
const isLoadingItems = ref(false)
const recentLogs = ref([])

const searchQuery = ref('')
const selectedCategory = ref('')
const showDropdown = ref(false)
const selectedItems = ref([])

const form = reactive({
  division: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
})

const alert = reactive({
  show: false,
  type: 'success',
  message: '',
})

const filteredItems = computed(() => {
  let result = items.value

  if (selectedCategory.value) {
    result = result.filter((item) => item.category_id === selectedCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((item) => {
      const nameMatch = item.name?.toLowerCase().includes(query)
      const codeMatch = item.code?.toLowerCase().includes(query)
      return nameMatch || codeMatch
    })
  }

  result = result.filter((item) => !selectedItems.value.some((selected) => selected.id === item.id))

  return result.slice(0, 15)
})

const isFormValid = computed(() => {
  const hasValidItems = selectedItems.value.every((item) => item.qty > 0 && item.qty <= item.stock)
  return selectedItems.value.length > 0 && hasValidItems && form.division
})

const totalNilai = computed(() => {
  return selectedItems.value.reduce((sum, item) => {
    return sum + (item.qty || 0) * (item.price || 0)
  }, 0)
})

const formatRupiah = (val) => {
  if (!val) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val)
}

const fetchItems = async () => {
  isLoadingItems.value = true
  try {
    const params = {}
    if (selectedCategory.value) {
      params.category_id = selectedCategory.value
    }

    const response = await axios.get('/material-usages/consumables', { params })
    if (response.data.success) {
      items.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching items:', error)
    showAlert('error', 'Gagal mengambil data barang.')
  } finally {
    isLoadingItems.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await axios.get('/material-usages/categories')
    if (response.data.success) {
      categories.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

const fetchDivisions = async () => {
  try {
    const response = await axios.get('/material-usages/divisions')
    if (response.data.success) {
      divisions.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching divisions:', error)
  }
}

const historyPage    = ref(1)
const historyPerPage = 20
const historyMeta    = ref({ total: 0, last_page: 1, from: 0, to: 0 })

const fetchRecentLogs = async () => {
  try {
    const response = await axios.get('/material-usages', {
      params: { per_page: historyPerPage, page: historyPage.value },
    })
    if (response.data.success) {
      const d = response.data.data
      recentLogs.value       = d.data || []
      historyMeta.value      = { total: d.total, last_page: d.last_page, from: d.from, to: d.to }
    }
  } catch (error) {
    console.error('Error fetching logs:', error)
  }
}

const goHistoryPage = (p) => {
  if (p < 1 || p > historyMeta.value.last_page) return
  historyPage.value = p
  fetchRecentLogs()
}

const historyPages = computed(() => {
  const pages = []
  const last  = historyMeta.value.last_page
  const cur   = historyPage.value
  if (last <= 7) {
    for (let i = 1; i <= last; i++) pages.push(i)
  } else if (cur <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i)
    pages.push('...'); pages.push(last)
  } else if (cur >= last - 3) {
    pages.push(1); pages.push('...')
    for (let i = last - 4; i <= last; i++) pages.push(i)
  } else {
    pages.push(1); pages.push('...')
    for (let i = cur - 1; i <= cur + 1; i++) pages.push(i)
    pages.push('...'); pages.push(last)
  }
  return pages
})

const onSearchInput = () => {
  showDropdown.value = true
}

const onCategoryChange = () => {
  fetchItems()
}

const clearSearch = () => {
  searchQuery.value = ''
  showDropdown.value = false
}

const addItemToList = (item) => {
  const exists = selectedItems.value.find((i) => i.id === item.id)
  if (exists) {
    showAlert('error', 'Barang sudah ada dalam daftar!')
    return
  }

  selectedItems.value.push({
    id: item.id,
    name: item.name,
    code: item.code,
    unit: item.unit,
    category: item.category,
    category_id: item.category_id,
    stock: item.stock,
    price: item.price || 0,
    qty: 0,
  })

  searchQuery.value = ''
  showDropdown.value = false
}

const removeItemFromList = (index) => {
  selectedItems.value.splice(index, 1)
}

const clearAllItems = () => {
  selectedItems.value = []
}

const getCategoryColorClass = (categoryId) => {
  const colors = {
    7: 'dot-orange',
    8: 'dot-blue',
    9: 'dot-purple',
  }
  return colors[categoryId] || 'dot-gray'
}

const submitForm = async () => {
  if (!isFormValid.value) return

  isSubmitting.value = true

  try {
    for (const item of selectedItems.value) {
      await axios.post('/material-usages', {
        item_id: item.id,
        qty: item.qty,
        division: form.division,
        date: form.date,
        notes: form.notes,
      })
    }

    showAlert('success', `Berhasil menyimpan ${selectedItems.value.length} pemakaian bahan!`)

    selectedItems.value = []
    form.division = ''
    form.notes = ''
    searchQuery.value = ''

    fetchItems()
    fetchRecentLogs()
  } catch (error) {
    const message = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan.'
    showAlert('error', message)
  } finally {
    isSubmitting.value = false
  }
}

const showAlert = (type, message) => {
  alert.type = type
  alert.message = message
  alert.show = true

  setTimeout(() => {
    alert.show = false
  }, 5000)
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  const number = parseFloat(num)
  if (Number.isInteger(number)) {
    return number.toString()
  }
  return number.toFixed(2).replace(/\.?0+$/, '')
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.filter-search')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  fetchItems()
  fetchCategories()
  fetchDivisions()
  fetchRecentLogs()
  document.addEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.page-header-material {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  padding: 2rem 2.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(217, 119, 6, 0.3);
}
.header-content-wrapper { display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
.header-left-section { display: flex; align-items: center; gap: 1.5rem; flex: 1; }
.icon-badge-material { width: 72px; height: 72px; border-radius: 18px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; }
.material-icon { font-size: 2.5rem; }
.page-title-material { font-size: 2rem; font-weight: 800; color: white; margin: 0 0 0.5rem; }
.page-subtitle-material { color: rgba(255,255,255,0.95); font-size: 1rem; margin: 0; font-weight: 500; }
.process-badge { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; background: rgba(255,255,255,0.95); border-radius: 16px; }
.process-icon { font-size: 1.5rem; }
.process-arrow { font-size: 1.25rem; color: #b45309; font-weight: 700; }
.flow-label-material { color: rgba(255,255,255,0.9); font-size: 0.85rem; font-weight: 600; margin-top: 6px; text-align: center; }
.header-badge-section { display: flex; flex-direction: column; align-items: center; }

.alert-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  font-weight: 600;
  animation: slideDown 0.3s ease;
}

.alert-success {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border: 1.5px solid #86efac;
  color: #065f46;
}

.alert-error {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border: 1.5px solid #fca5a5;
  color: #991b1b;
}

.alert-icon {
  font-size: 1.5rem;
}

.alert-message {
  flex: 1;
  font-size: 1rem;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.content-card-material {
  background: white;
  border-radius: 24px;
  box-shadow: 0 6px 24px rgba(15, 23, 42, 0.1);
  border: 1px solid #f3f4f6;
  overflow: hidden;
  margin-bottom: 2.5rem;
}

.card-body-material {
  padding: 3rem;
}

.form-section-modern {
  margin-bottom: 3rem;
  padding-bottom: 3rem;
  border-bottom: 2px solid #f3f4f6;
}

.form-section-modern:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem 1.75rem;
  border-radius: 18px;
}

.section-header-item {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-left: 5px solid #f59e0b;
}

.section-header-qty {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-left: 5px solid #6366f1;
}

.section-icon-badge {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.material-item-badge {
  background: linear-gradient(135deg, #fde68a, #fbbf24);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
}

.material-qty-badge {
  background: linear-gradient(135deg, #c7d2fe, #a5b4fc);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.section-icon {
  font-size: 2rem;
}

.section-title-group {
  flex: 1;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 900;
  color: #111827;
  margin: 0 0 0.35rem 0;
}

.section-subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
}

.filter-row {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group-modern {
  margin-bottom: 1.75rem;
  position: relative;
}

.form-group-modern:last-child {
  margin-bottom: 0;
}

.form-label-modern {
  display: block;
  font-size: 1rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.85rem;
}

.required-star {
  color: #ef4444;
  margin-left: 0.2rem;
}

.select-wrapper-modern {
  position: relative;
  display: flex;
  align-items: center;
}

.select-icon {
  position: absolute;
  left: 1.25rem;
  font-size: 1.2rem;
  pointer-events: none;
  z-index: 1;
}

.form-select-modern {
  width: 100%;
  padding: 1rem 3.5rem 1rem 3.5rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 14px;
  font-size: 1.05rem;
  font-weight: 700;
  transition: all 0.25s ease;
  background: white;
  color: #111827;
  appearance: none;
  cursor: pointer;
}

.form-select-modern:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
}

.select-arrow {
  position: absolute;
  right: 1.25rem;
  font-size: 0.8rem;
  color: #6b7280;
  pointer-events: none;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1.25rem;
  font-size: 1.2rem;
  pointer-events: none;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 1rem 3.5rem 1rem 3.5rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 14px;
  font-size: 1.05rem;
  font-weight: 600;
  transition: all 0.25s ease;
  background: white;
  color: #111827;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-input:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
}

.clear-search-btn {
  position: absolute;
  right: 1rem;
  background: #fee2e2;
  border: none;
  color: #dc2626;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.clear-search-btn:hover {
  background: #fecaca;
  transform: scale(1.1);
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.15);
  max-height: 350px;
  overflow-y: auto;
  z-index: 100;
}

.search-item {
  padding: 1rem 1.25rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.15s ease;
}

.search-item:last-child {
  border-bottom: none;
}

.search-item:hover {
  background: #fef3c7;
}

.search-item-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.35rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.search-item-name {
  font-weight: 700;
  color: #111827;
  font-size: 0.95rem;
}

.search-item-badges {
  display: flex;
  gap: 0.5rem;
}

.search-item-category {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: #dbeafe;
  color: #1e40af;
  font-weight: 700;
}

.search-item-unit {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: #fef3c7;
  color: #92400e;
  font-weight: 700;
}

.search-item-sub {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 600;
}

.search-item-sub strong {
  color: #111827;
}

.search-dropdown-empty,
.search-dropdown-loading {
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
  font-weight: 600;
}

.empty-selection-hint {
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #f9fafb, #f3f4f6);
  border-radius: 16px;
  border: 2px dashed #d1d5db;
}

.hint-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hint-text {
  font-size: 1.1rem;
  color: #6b7280;
  font-weight: 600;
}

.selected-items-section {
  margin-top: 2rem;
}

.selected-items-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-radius: 12px;
  border-left: 4px solid #3b82f6;
}

.selected-icon {
  font-size: 1.5rem;
}

.selected-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #1e40af;
  flex: 1;
}

.btn-clear-all {
  padding: 0.5rem 1rem;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear-all:hover {
  background: #fecaca;
}

.selected-items-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.selected-item-card {
  background: linear-gradient(135deg, #fafafa, #ffffff);
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  transition: all 0.2s ease;
}

.selected-item-card:hover {
  border-color: #f59e0b;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.12);
}

.selected-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.selected-item-info {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
}

.item-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #f59e0b;
  flex-shrink: 0;
  margin-top: 0.3rem;
}

.item-dot.dot-orange {
  background: #f59e0b;
}

.item-dot.dot-blue {
  background: #3b82f6;
}

.item-dot.dot-purple {
  background: #8b5cf6;
}

.item-dot.dot-gray {
  background: #6b7280;
}

.item-name {
  font-size: 1rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.35rem;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.item-category-badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: #e0e7ff;
  color: #4338ca;
  font-weight: 700;
}

.item-stock {
  font-size: 0.85rem;
  color: #6b7280;
}

.item-stock strong {
  font-weight: 800;
  color: #111827;
}

.btn-remove-item {
  padding: 0.4rem 0.75rem;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.btn-remove-item:hover {
  background: #fecaca;
  transform: scale(1.1);
}

.selected-item-body {
  padding-top: 1rem;
  border-top: 1.5px solid #f3f4f6;
}

.input-qty-wrapper {
  max-width: 350px;
}

.qty-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.65rem;
}

.input-wrapper-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper-icon.slim {
  max-width: 100%;
}

.input-icon {
  position: absolute;
  left: 1.25rem;
  font-size: 1.2rem;
  pointer-events: none;
  z-index: 1;
}

.input-suffix {
  position: absolute;
  right: 1.25rem;
  font-size: 0.9rem;
  font-weight: 800;
  color: #6b7280;
  pointer-events: none;
}

.form-input-modern {
  width: 100%;
  padding: 1rem 4rem 1rem 3.5rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 14px;
  font-size: 1.05rem;
  font-weight: 600;
  transition: all 0.25s ease;
  background: white;
  color: #111827;
}

.form-input-modern::placeholder {
  color: #9ca3af;
}

.form-input-modern:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
}

.form-textarea-modern {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2.5px solid #e5e7eb;
  border-radius: 14px;
  font-size: 1.05rem;
  font-weight: 600;
  transition: all 0.25s ease;
  background: white;
  color: #111827;
  resize: vertical;
}

.form-textarea-modern::placeholder {
  color: #9ca3af;
}

.form-textarea-modern:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
}

.input-hint {
  margin: 0.6rem 0 0;
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 600;
}

.input-hint.error-hint {
  color: #dc2626;
}

.input-hint.success-hint {
  color: #059669;
}

.form-grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-actions-modern {
  margin-top: 2.5rem;
  padding-top: 2.5rem;
  border-top: 2px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.summary-box {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 2px solid #86efac;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
}

.summary-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: #166534;
  margin-bottom: 0.75rem;
}

.summary-content {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.summary-item {
  font-size: 0.95rem;
  font-weight: 700;
  color: #15803d;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  padding: 1.1rem 2.4rem;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  border: none;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  width: 100%;
}

.btn-icon {
  font-size: 1.25rem;
}

.btn-submit-material {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  color: white;
}

.btn-submit-material:disabled {
  background: #9ca3af;
  box-shadow: none;
  cursor: not-allowed;
}

.btn-submit-material:not(:disabled):hover {
  background: linear-gradient(135deg, #d97706 0%, #ea580c 100%);
  transform: translateY(-3px);
  box-shadow: 0 10px 32px rgba(245, 158, 11, 0.4);
}

.history-section {
  margin-top: 2.5rem;
}

.history-header {
  margin-bottom: 1.5rem;
}

.history-title-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.history-icon {
  font-size: 2rem;
}

.history-title {
  font-size: 1.75rem;
  font-weight: 900;
  color: #111827;
  margin: 0;
}

.empty-state-card {
  text-align: center;
  padding: 3.5rem 2.5rem;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  border-radius: 18px;
  border: 1.5px solid #d1d5db;
}

.empty-state-card .empty-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #374151;
  margin-bottom: 0.6rem;
}

.empty-message {
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.6;
  font-weight: 600;
}

.history-table-wrapper {
  background: white;
  border-radius: 18px;
  box-shadow: 0 6px 24px rgba(15, 23, 42, 0.1);
  border: 1px solid #f3f4f6;
  overflow: hidden;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table thead {
  background: linear-gradient(135deg, #f9fafb, #f3f4f6);
}

.history-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 800;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 2px solid #e5e7eb;
}

.history-table .col-center {
  text-align: center;
}

.history-table td {
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.history-table tbody tr:hover {
  background: #fafafa;
}

.cell-date {
  color: #6b7280;
  font-weight: 600;
  font-size: 0.95rem;
}

.cell-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 700;
  color: #111827;
}

.qty-badge {
  display: inline-block;
  padding: 0.4rem 0.85rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 800;
}

.cell-division {
  color: #6b7280;
  font-weight: 600;
}

.history-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-top: 1px solid #f3f4f6;
  background: #f9fafb;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
}

.pagination-btns {
  display: flex;
  gap: 4px;
}

.page-btn {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: white;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  color: #374151;
  transition: all 0.15s ease;
}

.page-btn:hover:not(:disabled):not(.dots) {
  background: #fef3c7;
  border-color: #f59e0b;
  color: #92400e;
}

.page-btn.active {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: white;
  border-color: #f59e0b;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.page-btn.dots {
  cursor: default;
  border: none;
  background: none;
}

@media (max-width: 900px) {
  .page-header-material {
    padding: 2rem;
  }

  .header-content-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-body-material {
    padding: 2rem;
  }

  .header-right-section {
    align-items: flex-start;
  }

  .filter-row {
    grid-template-columns: 1fr;
  }

  .form-grid-2col {
    grid-template-columns: 1fr;
  }

  .selected-item-header {
    flex-direction: column;
    gap: 1rem;
  }

  .input-qty-wrapper {
    max-width: 100%;
  }

  .input-hint.total-hint {
    color: #d97706;
  }
}
</style>
