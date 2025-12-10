<template>
  <DashboardLayout>
    <div class="page-header">
      <div class="header-content">
        <div class="header-left-section">
          <div class="icon-badge">
            <span class="icon-3d">🏭</span>
          </div>
          <div class="header-text">
            <h1 class="page-title">
              {{ isEditMode ? 'Edit Resep (BOM)' : 'Tambah Resep (BOM) Baru' }}
            </h1>
            <p class="page-subtitle">
              {{
                isEditMode
                  ? 'Perbarui detail resep untuk produk jadi.'
                  : 'Buat resep baru untuk produk jadi.'
              }}
            </p>
          </div>
        </div>

        <div class="header-right-section">
          <router-link :to="{ name: 'BomIndex' }" class="btn-secondary">
            <span class="btn-icon">↩️</span>
            <span class="btn-text">Kembali ke Daftar</span>
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-animation">
        <div class="spinner"></div>
        <div class="loading-dots"><span></span><span></span><span></span></div>
      </div>
      <p class="loading-text">Memuat data...</p>
    </div>

    <div v-else class="form-container">
      <div class="content-card">
        <div class="card-header-accent">
          <h2 class="card-title">1. Produk Jadi (Hasil Resep)</h2>
        </div>
        <div class="card-body">
          <div class="form-grid-2">
            <div class="form-group">
              <label for="product-item" class="form-label">Produk Jadi</label>
              <select
                id="product-item"
                v-model="bom.item_id"
                class="form-control"
                :disabled="isEditMode"
              >
                <option :value="null" disabled>Pilih Produk Jadi...</option>
                <option v-for="product in productList" :key="product.id" :value="product.id">
                  {{ product.name }} ({{ product.code || 'Tanpa Kode' }})
                </option>
              </select>
              <small v-if="errors.item_id" class="form-error">{{ errors.item_id[0] }}</small>
            </div>

            <div class="form-group">
              <label for="bom-name" class="form-label">Nama Resep</label>
              <input
                id="bom-name"
                type="text"
                v-model="bom.name"
                class="form-control"
                placeholder="Contoh: Resep Standar KILT DINING"
              />
              <small v-if="errors.name" class="form-error">{{ errors.name[0] }}</small>
            </div>

            <div class="form-group">
              <label for="bom-code" class="form-label">Kode Resep (Opsional)</label>
              <input
                id="bom-code"
                type="text"
                v-model="bom.code"
                class="form-control"
                placeholder="Contoh: 154M16G00"
              />
              <small v-if="errors.code" class="form-error">{{ errors.code[0] }}</small>
            </div>

            <div class="form-group">
              <label for="bom-description" class="form-label">Deskripsi (Opsional)</label>
              <input
                id="bom-description"
                type="text"
                v-model="bom.description"
                class="form-control"
                placeholder="Catatan untuk resep ini"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="content-card">
        <div class="card-header-accent">
          <h2 class="card-title">2. Bahan Resep (Komponen)</h2>
          <small v-if="errors.details" class="form-error-badge">{{ errors.details[0] }}</small>
        </div>

        <div class="card-body-table">
          <div class="table-wrapper">
            <table class="data-table-form">
              <thead>
                <tr>
                  <th>Nama Komponen / Bahan</th>
                  <th>Jumlah (Qty)</th>
                  <th>Satuan</th>
                  <th>Kategori Bahan</th>
                  <th>Catatan (Opsional)</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="bom.details.length === 0" class="empty-row-form">
                  <td colspan="6">
                    <div class="empty-state-form">
                      <span class="empty-icon">📭</span>
                      <p>Belum ada bahan. Klik "Tambah Bahan" untuk memulai.</p>
                    </div>
                  </td>
                </tr>

                <tr v-for="(detail, index) in bom.details" :key="index" class="form-data-row">
                  <td>
                    <select
                      v-model="detail.component_item_id"
                      class="form-control-table"
                      @change="updateComponentInfo(index)"
                    >
                      <option :value="null" disabled>Pilih Komponen...</option>
                      <option v-for="item in componentList" :key="item.id" :value="item.id">
                        {{ item.name }} ({{ item.code || '...' }})
                      </option>
                    </select>
                    <small v-if="errors[`details.${index}.component_item_id`]" class="form-error">
                      {{ errors[`details.${index}.component_item_id`][0] }}
                    </small>
                  </td>

                  <td>
                    <input
                      type="number"
                      v-model.number="detail.quantity"
                      class="form-control-table"
                      placeholder="Qty"
                    />
                    <small v-if="errors[`details.${index}.quantity`]" class="form-error">
                      {{ errors[`details.${index}.quantity`][0] }}
                    </small>
                  </td>

                  <td>
                    <span class="unit-badge-form">{{
                      getComponentUnit(detail.component_item_id)
                    }}</span>
                  </td>
                  <td>
                    <span class="category-badge-form">{{
                      getComponentCategory(detail.component_item_id)
                    }}</span>
                  </td>
                  <td>
                    <input
                      type="text"
                      v-model="detail.notes"
                      class="form-control-table"
                      placeholder="Contoh: Perlengkapan Terpasang"
                    />
                  </td>
                  <td>
                    <button
                      @click="removeDetailRow(index)"
                      class="btn-action-delete"
                      title="Hapus Baris"
                    >
                      <span class="btn-icon-action">🗑️</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="form-actions-footer">
            <button @click="addDetailRow" class="btn-secondary">
              <span class="btn-icon">➕</span>
              <span class="btn-text">Tambah Bahan</span>
            </button>
          </div>
        </div>
      </div>

      <div class="form-actions-bottom">
        <button @click="handleSubmit" class="btn-primary-bottom" :disabled="isSaving">
          <span class="btn-icon">{{ isSaving ? '⏳' : '💾' }}</span>
          <span class="btn-text">
            {{ isSaving ? 'Menyimpan...' : isEditMode ? 'Perbarui Resep' : 'Simpan Resep' }}
          </span>
        </button>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'

const router = useRouter()
const route = useRoute()
const { showSuccess, showError, showWarning } = useNotification()

const loading = ref(true)
const isSaving = ref(false)
const isEditMode = computed(() => !!route.params.id)
const bomId = ref(route.params.id || null)
const errors = ref({})

const productList = ref([])
const allItemList = ref([])

const componentList = computed(() => {
  return allItemList.value.filter((item) => item.category?.name !== 'Produk Jadi')
})

const bom = reactive({
  item_id: null,
  name: '',
  code: '',
  description: '',
  details: [],
})

const fetchDropdownData = async () => {
  try {
    const [productsRes, allItemsRes] = await Promise.all([
      apiClient.get('/materials?all=true&include=unit,category'),
      apiClient.get('/materials?all=true&include=unit,category'),
    ])

    const allData = productsRes.data.data || productsRes.data
    const allItems = allItemsRes.data.data || allItemsRes.data

    productList.value = allData.filter((item) => item.category?.name === 'Produk Jadi')
    allItemList.value = allItems
  } catch {
    showError('Gagal', 'Gagal memuat data master (Produk & Komponen).')
  }
}

const fetchBomData = async (id) => {
  try {
    const response = await apiClient.get(`/boms/${id}`)
    const data = response.data.data
    bom.item_id = data.item_id
    bom.name = data.name
    bom.code = data.code
    bom.description = data.description
    bom.details = data.details.map((detail) => ({
      component_item_id: detail.component_item_id,
      quantity: parseFloat(detail.quantity),
      notes: detail.notes,
    }))
  } catch {
    showError('Gagal', 'Gagal memuat data resep untuk diedit.')
    router.push({ name: 'BomIndex' })
  }
}

onMounted(async () => {
  loading.value = true
  await fetchDropdownData()
  if (isEditMode.value) await fetchBomData(bomId.value)
  loading.value = false
})

const addDetailRow = () => {
  bom.details.push({ component_item_id: null, quantity: 1, notes: '' })
}

const removeDetailRow = (index) => {
  bom.details.splice(index, 1)
}

const getComponentInfo = (componentId, field) => {
  if (!componentId) return '...'
  const item = allItemList.value.find((i) => i.id === componentId)
  if (!item) return 'N/A'
  if (field === 'unit') return item.unit?.short_name || 'N/A'
  if (field === 'category') return item.category?.name || 'N/A'
  return '...'
}

const getComponentUnit = (id) => getComponentInfo(id, 'unit')
const getComponentCategory = (id) => getComponentInfo(id, 'category')
const updateComponentInfo = () => {}

const handleSubmit = async () => {
  isSaving.value = true
  errors.value = {}
  try {
    const response = isEditMode.value
      ? await apiClient.put(`/boms/${bomId.value}`, bom)
      : await apiClient.post('/boms', bom)
    showSuccess('Sukses', response.data.message)
    await apiClient.get('/materials?category_name=Produk Jadi&all=true')
    router.push({ name: 'BomIndex' })
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors
      showWarning('Validasi Gagal', 'Silakan periksa kembali data yang Anda masukkan.')
    } else {
      showError('Gagal', error.response?.data?.message || 'Terjadi kesalahan di server.')
    }
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.header-left-section {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.icon-badge {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.icon-3d {
  font-size: 2rem;
}

.header-text {
  color: white;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: white;
}

.page-subtitle {
  font-size: 0.95rem;
  margin: 0.25rem 0 0 0;
  color: rgba(255, 255, 255, 0.9);
}

.header-right-section {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  text-decoration: none;
  font-size: 0.9375rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-icon {
  font-size: 1rem;
}

.btn-text {
  font-size: 0.9375rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.loading-animation {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f4f6;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-dots {
  display: flex;
  gap: 6px;
  margin-top: 1rem;
  justify-content: center;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}
.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.loading-text {
  margin-top: 1rem;
  color: #6b7280;
  font-weight: 500;
}

.form-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header-accent {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%);
  border-bottom: 2px solid #e5e7eb;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.form-error-badge {
  background: #fef2f2;
  color: #ef4444;
  padding: 0.375rem 0.875rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  border: 1px solid #fecaca;
}

.card-body {
  padding: 1.5rem;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-control {
  padding: 0.625rem 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-control:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.form-error {
  color: #ef4444;
  font-size: 0.8125rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.card-body-table {
  padding: 1.5rem;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 1rem;
}

.data-table-form {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table-form thead {
  background: #f9fafb;
}

.data-table-form th {
  text-align: left;
  padding: 0.875rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.data-table-form tbody tr {
  border-bottom: 1px solid #f3f4f6;
}

.data-table-form td {
  padding: 0.75rem;
  vertical-align: middle;
}

.form-data-row:hover {
  background: #f9fafb;
}

.form-control-table {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.8125rem;
  transition: all 0.2s ease;
}

.form-control-table:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.unit-badge-form,
.category-badge-form {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  white-space: nowrap;
}

.unit-badge-form {
  background: #dbeafe;
  color: #1e40af;
}

.category-badge-form {
  background: #f3e8ff;
  color: #6b21a8;
}

.empty-row-form {
  background: white;
}

.empty-state-form {
  padding: 3rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
  display: block;
}

.empty-state-form p {
  color: #6b7280;
  font-size: 0.9375rem;
  margin: 0;
}

.btn-action-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: white;
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action-delete:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.1);
}

.btn-icon-action {
  font-size: 1rem;
}

.form-actions-footer {
  display: flex;
  justify-content: flex-start;
  padding: 1rem 0 0.5rem 0;
}

.form-actions-bottom {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: flex-end;
}

.btn-primary-bottom {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
}

.btn-primary-bottom:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary-bottom:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .form-container {
    max-width: 100%;
    padding: 0 1rem;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .header-right-section {
    width: 100%;
    flex-direction: column;
  }

  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .form-grid-2 {
    grid-template-columns: 1fr;
  }

  .card-body,
  .card-body-table {
    padding: 1rem;
  }

  .data-table-form {
    font-size: 0.8125rem;
  }

  .data-table-form th,
  .data-table-form td {
    padding: 0.5rem;
  }

  .form-control-table {
    font-size: 0.75rem;
    padding: 0.375rem 0.5rem;
  }

  .form-actions-bottom {
    padding: 1rem;
  }

  .btn-primary-bottom {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .table-wrapper {
    border: none;
  }

  .data-table-form th,
  .data-table-form td {
    padding: 0.375rem 0.25rem;
  }
}
</style>
