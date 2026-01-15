<template>
  <DashboardLayout>
    <!-- PAGE HEADER -->
    <div class="page-header-material">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-material">
            <span class="material-icon">📦</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-material">Form Pemakaian Bahan</h1>
            <p class="page-subtitle-material">
              Catat pengambilan bahan pendukung (lem, sekrup, paku, dll) dengan tracking yang
              akurat.
            </p>
          </div>
        </div>
        <div class="header-right-section">
          <div class="process-flow-badge-material">
            <span class="flow-icon">📋</span>
            <span class="flow-arrow">→</span>
            <span class="flow-icon">✅</span>
          </div>
          <div class="flow-label-material">Pilih → Catat → Simpan</div>
        </div>
      </div>
    </div>

    <!-- ALERT -->
    <div
      v-if="alert.show"
      :class="['alert-box', alert.type === 'success' ? 'alert-success' : 'alert-error']"
    >
      <span class="alert-icon">
        {{ alert.type === 'success' ? '✅' : '❌' }}
      </span>
      <span class="alert-message">{{ alert.message }}</span>
    </div>

    <!-- FORM CARD -->
    <div class="content-card-material">
      <div class="card-body-material">
        <form @submit.prevent="submitForm">
          <!-- SECTION: PILIH BARANG -->
          <div class="form-section-modern">
            <div class="section-header section-header-item">
              <div class="section-icon-badge material-item-badge">
                <span class="section-icon">🏷️</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Pilih Barang</h3>
                <p class="section-subtitle">Cari dan tambahkan barang yang akan digunakan.</p>
              </div>
            </div>

            <!-- SEARCH BARANG -->
            <div class="form-group-modern">
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
              </div>

              <!-- DROPDOWN SEARCH RESULTS -->
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
                    <span class="search-item-unit">{{ item.unit?.name }}</span>
                  </div>
                  <div class="search-item-sub">Stok: {{ formatNumber(item.stock) }}</div>
                </div>
              </div>

              <div
                v-if="showDropdown && searchQuery && filteredItems.length === 0"
                class="search-dropdown-empty"
              >
                <span class="empty-icon">🔍</span>
                <span>Barang tidak ditemukan</span>
              </div>
            </div>

            <!-- LIST BARANG YANG DIPILIH -->
            <div v-if="selectedItems.length > 0" class="selected-items-section">
              <div class="selected-items-header">
                <span class="selected-icon">📋</span>
                <span class="selected-title">Barang yang Dipilih ({{ selectedItems.length }})</span>
              </div>

              <div class="selected-items-list">
                <div v-for="(item, index) in selectedItems" :key="index" class="selected-item-card">
                  <div class="selected-item-header">
                    <div class="selected-item-info">
                      <span class="item-dot"></span>
                      <div>
                        <div class="item-name">
                          {{ item.code ? `[${item.code}]` : '' }} {{ item.name }}
                        </div>
                        <div class="item-stock">
                          Stok: <strong>{{ formatNumber(item.stock) }}</strong>
                          {{ item.unit?.name }}
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
                      <label class="qty-label">Jumlah <span class="required-star">*</span></label>
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION: DETAIL PEMAKAIAN -->
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

            <div class="form-group-modern">
              <label class="form-label-modern"> Divisi <span class="required-star">*</span> </label>
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

          <!-- SUBMIT BUTTON -->
          <div v-if="selectedItems.length > 0" class="form-actions-modern">
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

    <!-- RIWAYAT PEMAKAIAN -->
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
              <td class="cell-division">{{ log.division }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import axios from '@/api/axios'
import DashboardLayout from '@/components/DashboardLayout.vue'

const items = ref([])
const divisions = ref([])
const isSubmitting = ref(false)
const recentLogs = ref([])

// Search state
const searchQuery = ref('')
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

// Filter items berdasarkan search
const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value

  const query = searchQuery.value.toLowerCase()
  return items.value
    .filter((item) => {
      const nameMatch = item.name?.toLowerCase().includes(query)
      const codeMatch = item.code?.toLowerCase().includes(query)
      const alreadySelected = selectedItems.value.some((selected) => selected.id === item.id)
      return (nameMatch || codeMatch) && !alreadySelected
    })
    .slice(0, 10) // limit 10 hasil
})

const isFormValid = computed(() => {
  const hasValidItems = selectedItems.value.every((item) => item.qty > 0 && item.qty <= item.stock)
  return selectedItems.value.length > 0 && hasValidItems && form.division
})

const fetchItems = async () => {
  try {
    const response = await axios.get('/material-usages/consumables')
    if (response.data.success) {
      items.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching items:', error)
    showAlert('error', 'Gagal mengambil data barang.')
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

const fetchRecentLogs = async () => {
  try {
    const response = await axios.get('/material-usages', {
      params: { per_page: 10 },
    })
    if (response.data.success) {
      recentLogs.value = response.data.data.data || []
    }
  } catch (error) {
    console.error('Error fetching logs:', error)
  }
}

const onSearchInput = () => {
  showDropdown.value = true
}

const addItemToList = (item) => {
  // Cek apakah sudah ada di list
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
    stock: item.stock,
    qty: 0,
  })

  searchQuery.value = ''
  showDropdown.value = false
}

const removeItemFromList = (index) => {
  selectedItems.value.splice(index, 1)
}

const submitForm = async () => {
  if (!isFormValid.value) return

  isSubmitting.value = true

  try {
    // Submit setiap item
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

    // Reset form
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

// Close dropdown when click outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.search-wrapper') && !event.target.closest('.search-dropdown')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  fetchItems()
  fetchDivisions()
  fetchRecentLogs()
  document.addEventListener('click', handleClickOutside)
})

// Cleanup event listener
watch(
  () => {},
  () => {
    document.removeEventListener('click', handleClickOutside)
  },
)
</script>

<style scoped>
/* ========== HEADER ========== */
.page-header-material {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #fb923c 100%);
  padding: 2.5rem 3rem;
  border-radius: 24px;
  margin-bottom: 2.5rem;
  box-shadow: 0 12px 48px rgba(245, 158, 11, 0.35);
}

.header-content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2.5rem;
}

.header-left-section {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  flex: 1;
}

.icon-badge-material {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.material-icon {
  font-size: 2.75rem;
}

.header-text-content {
  flex: 1;
}

.page-title-material {
  font-size: 2.25rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0 0 0.6rem 0;
  letter-spacing: -0.6px;
}

.page-subtitle-material {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.05rem;
  margin: 0;
  font-weight: 500;
  line-height: 1.6;
}

.header-right-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.6rem;
}

.process-flow-badge-material {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.9rem 1.75rem;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  border-radius: 999px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.flow-icon {
  font-size: 1.25rem;
}

.flow-arrow {
  font-size: 1rem;
  color: #fed7aa;
  font-weight: 800;
}

.flow-label-material {
  color: #fed7aa;
  font-size: 0.9rem;
  font-weight: 700;
}

/* ========== ALERT ========== */
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

/* ========== CONTENT CARD ========== */
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

/* ========== FORM SECTIONS ========== */
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
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.25);
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

/* ========== SEARCH ========== */
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
  transform: translateY(-1px);
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
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
}

.search-item {
  padding: 0.85rem 1.25rem;
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
}

.search-item-name {
  font-weight: 700;
  color: #111827;
  font-size: 0.95rem;
}

.search-item-unit {
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: #fef3c7;
  color: #92400e;
  font-weight: 700;
}

.search-item-sub {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 600;
}

.search-dropdown-empty {
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
  font-weight: 600;
}

.empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}

/* ========== SELECTED ITEMS ========== */
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
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.item-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #f59e0b;
  flex-shrink: 0;
}

.item-name {
  font-size: 1rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.35rem;
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

/* ========== FORM INPUTS (REUSE) ========== */
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
  transform: translateY(-1px);
}

.select-arrow {
  position: absolute;
  right: 1.25rem;
  font-size: 0.8rem;
  color: #6b7280;
  pointer-events: none;
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
  transform: translateY(-1px);
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
  transform: translateY(-1px);
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

/* ========== BUTTONS ========== */
.form-actions-modern {
  margin-top: 2.5rem;
  padding-top: 2.5rem;
  border-top: 2px solid #f3f4f6;
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

/* ========== HISTORY (REUSE DARI SEBELUMNYA) ========== */
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

.empty-icon {
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

/* ========== RESPONSIVE ========== */
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

  .selected-item-header {
    flex-direction: column;
    gap: 1rem;
  }

  .input-qty-wrapper {
    max-width: 100%;
  }
}
</style>
