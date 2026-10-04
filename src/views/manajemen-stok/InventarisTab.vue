<template>
  <div class="inv-wrapper">
    <div class="inv-summary">
      <div class="inv-stat">
        <span class="inv-stat-icon">🏭</span>
        <div>
          <p class="inv-stat-label">Total Unit</p>
          <p class="inv-stat-value">{{ summary.total_units }}</p>
        </div>
      </div>
      <div class="inv-stat">
        <span class="inv-stat-icon">🔧</span>
        <div>
          <p class="inv-stat-label">Dalam Perbaikan</p>
          <p class="inv-stat-value">{{ summary.in_repair }}</p>
        </div>
      </div>
      <div class="inv-stat">
        <span class="inv-stat-icon">⚠️</span>
        <div>
          <p class="inv-stat-label">Rusak</p>
          <p class="inv-stat-value">{{ summary.damaged }}</p>
        </div>
      </div>
      <div class="inv-stat" :class="{ 'inv-stat-alert': summary.due_alerts > 0 }">
        <span class="inv-stat-icon">⏰</span>
        <div>
          <p class="inv-stat-label">Jatuh Tempo ≤ {{ options.due_soon_days }} hari</p>
          <p class="inv-stat-value">{{ summary.due_alerts }}</p>
        </div>
      </div>
      <div class="inv-stat">
        <span class="inv-stat-icon">💰</span>
        <div>
          <p class="inv-stat-label">Total Harga Beli</p>
          <p class="inv-stat-value inv-stat-money">{{ formatRupiah(summary.total_purchase_value) }}</p>
        </div>
      </div>
    </div>

    <div class="inv-card">
      <div class="inv-card-header">
        <div>
          <h2 class="inv-title">Daftar Inventaris</h2>
          <p class="inv-subtitle">Mesin, kendaraan, alat berat, dan peralatan pabrik beserta riwayat servisnya</p>
        </div>
        <div class="inv-actions">
          <button class="inv-btn inv-btn-excel" :disabled="isExporting" @click="downloadExcel">⬇️ Excel</button>
          <button class="inv-btn inv-btn-pdf" :disabled="isExporting" @click="downloadPdf">📄 PDF</button>
          <button class="inv-btn inv-btn-primary" @click="openCreate">➕ Tambah Inventaris</button>
        </div>
      </div>

      <div class="inv-filters">
        <input v-model="filters.search" class="inv-input inv-search" placeholder="Cari kode, nama, merk, no. seri, plat..." />
        <select v-model="filters.category" class="inv-input">
          <option value="">Semua Kategori</option>
          <option v-for="(label, key) in options.categories" :key="key" :value="key">{{ label }}</option>
        </select>
        <select v-model="filters.location" class="inv-input">
          <option value="">Semua Lokasi</option>
          <option v-for="loc in options.locations" :key="loc" :value="loc">{{ loc }}</option>
        </select>
        <select v-model="filters.condition" class="inv-input">
          <option value="">Semua Kondisi</option>
          <option v-for="(label, key) in options.conditions" :key="key" :value="key">{{ label }}</option>
        </select>
        <select v-model="filters.status" class="inv-input">
          <option value="">Semua Status</option>
          <option v-for="(label, key) in options.statuses" :key="key" :value="key">{{ label }}</option>
        </select>
        <button v-if="hasFilter" class="inv-btn inv-btn-ghost" @click="resetFilters">✕ Reset</button>
      </div>

      <div class="inv-table-wrap">
        <table class="inv-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Kode</th>
              <th>Nama</th>
              <th>Kategori</th>
              <th>Merk / Tipe</th>
              <th>Lokasi</th>
              <th>Tgl Beli</th>
              <th class="t-right">Harga Beli</th>
              <th class="t-right">Nilai Buku</th>
              <th>Kondisi</th>
              <th>Status</th>
              <th>Servis Terakhir</th>
              <th>Pengingat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="14" class="inv-empty">Memuat data inventaris...</td>
            </tr>
            <tr v-else-if="assets.length === 0">
              <td colspan="14" class="inv-empty">
                Belum ada data inventaris{{ hasFilter ? ' yang cocok dengan filter' : '' }}.
              </td>
            </tr>
            <tr v-for="(asset, i) in assets" v-else :key="asset.id">
              <td class="t-center">{{ rowNumber(i) }}</td>
              <td class="t-code">{{ asset.code }}</td>
              <td>
                <div class="t-name">{{ asset.name }}</div>
                <div v-if="asset.plate_number" class="t-sub">🚗 {{ asset.plate_number }}</div>
                <div v-else-if="asset.serial_number" class="t-sub">SN: {{ asset.serial_number }}</div>
              </td>
              <td>{{ asset.category_label }}</td>
              <td>{{ [asset.brand, asset.model_type].filter(Boolean).join(' / ') || '-' }}</td>
              <td>{{ asset.location || '-' }}</td>
              <td>{{ formatDate(asset.purchase_date) }}</td>
              <td class="t-right">{{ asset.purchase_price > 0 ? formatRupiah(asset.purchase_price) : '-' }}</td>
              <td class="t-right">{{ asset.book_value !== null ? formatRupiah(asset.book_value) : '-' }}</td>
              <td><span class="badge" :class="`cond-${asset.condition}`">{{ asset.condition_label }}</span></td>
              <td><span class="badge" :class="`stat-${asset.status}`">{{ asset.status_label }}</span></td>
              <td>{{ formatDate(asset.last_service_date) }}</td>
              <td>
                <span
                  v-for="alert in asset.due_alerts"
                  :key="alert.type"
                  class="alert-chip"
                  :class="{ overdue: alert.overdue }"
                  :title="formatDate(alert.date)"
                >
                  {{ alert.label }} {{ alertText(alert) }}
                </span>
                <span v-if="!asset.due_alerts.length" class="text-muted">-</span>
              </td>
              <td class="t-actions">
                <button class="icon-btn" title="Detail & Riwayat Servis" @click="openDetail(asset.id)">👁️</button>
                <button class="icon-btn" title="Edit" @click="openEdit(asset)">✏️</button>
                <button class="icon-btn" title="Hapus" @click="confirmDelete(asset)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.last_page > 1" class="inv-pagination">
        <button class="inv-btn inv-btn-ghost" :disabled="page <= 1" @click="page--">← Prev</button>
        <span>Halaman {{ pagination.current_page }} dari {{ pagination.last_page }} ({{ pagination.total }} unit)</span>
        <button class="inv-btn inv-btn-ghost" :disabled="page >= pagination.last_page" @click="page++">Next →</button>
      </div>
    </div>

    <div v-if="isFormOpen" class="inv-modal-overlay" @click.self="isFormOpen = false">
      <div class="inv-modal">
        <div class="inv-modal-header">
          <h3>{{ form.id ? 'Edit Inventaris' : 'Tambah Inventaris' }}</h3>
          <button class="inv-close" @click="isFormOpen = false">✕</button>
        </div>
        <div class="inv-modal-body">
          <h4 class="form-section">Data Umum</h4>
          <div class="form-grid">
            <label>
              Kategori *
              <select v-model="form.category" class="inv-input">
                <option v-for="(label, key) in options.categories" :key="key" :value="key">{{ label }}</option>
              </select>
            </label>
            <label>
              Kode
              <input v-model="form.code" class="inv-input" placeholder="Kosongkan = otomatis (INV-...)" />
            </label>
            <label class="span-2">
              Nama *
              <input v-model="form.name" class="inv-input" placeholder="mis. Mesin Planer 4 Sisi" />
            </label>
            <label>
              Merk
              <input v-model="form.brand" class="inv-input" />
            </label>
            <label>
              Tipe / Model
              <input v-model="form.model_type" class="inv-input" />
            </label>
            <label>
              No. Seri
              <input v-model="form.serial_number" class="inv-input" />
            </label>
            <label>
              Lokasi / Bagian
              <input v-model="form.location" class="inv-input" list="inv-locations" placeholder="mis. Moulding, Kantor" />
              <datalist id="inv-locations">
                <option v-for="loc in options.locations" :key="loc" :value="loc" />
              </datalist>
            </label>
            <label>
              Penanggung Jawab
              <input v-model="form.pic" class="inv-input" />
            </label>
            <label>
              Kondisi *
              <select v-model="form.condition" class="inv-input">
                <option v-for="(label, key) in options.conditions" :key="key" :value="key">{{ label }}</option>
              </select>
            </label>
            <label>
              Status *
              <select v-model="form.status" class="inv-input">
                <option v-for="(label, key) in options.statuses" :key="key" :value="key">{{ label }}</option>
              </select>
            </label>
          </div>

          <h4 class="form-section">Pembelian & Penyusutan</h4>
          <div class="form-grid">
            <label>
              Tanggal Pembelian
              <input v-model="form.purchase_date" type="date" class="inv-input" />
            </label>
            <label>
              Harga Beli (Rp)
              <input v-model.number="form.purchase_price" type="number" min="0" class="inv-input" />
            </label>
            <label>
              Umur Ekonomis (tahun)
              <input v-model.number="form.useful_life_years" type="number" min="1" class="inv-input" placeholder="mis. 8" />
            </label>
            <label>
              Supplier / Dibeli Dari
              <input v-model="form.supplier_name" class="inv-input" />
            </label>
            <div class="span-2 form-hint">
              Nilai buku dihitung otomatis dengan metode garis lurus:
              <strong>{{ previewBookValue }}</strong>
            </div>
          </div>

          <template v-if="isVehicleCategory(form.category)">
            <h4 class="form-section">Data Kendaraan</h4>
            <div class="form-grid">
              <label>
                Plat Nomor
                <input v-model="form.plate_number" class="inv-input" />
              </label>
              <label>
                No. Rangka
                <input v-model="form.chassis_number" class="inv-input" />
              </label>
              <label>
                No. Mesin
                <input v-model="form.engine_number" class="inv-input" />
              </label>
              <label>
                Jatuh Tempo Pajak STNK
                <input v-model="form.tax_due_date" type="date" class="inv-input" />
              </label>
              <label>
                Jatuh Tempo KIR
                <input v-model="form.kir_due_date" type="date" class="inv-input" />
              </label>
            </div>
          </template>

          <h4 class="form-section">Catatan</h4>
          <textarea v-model="form.notes" class="inv-input" rows="2"></textarea>
        </div>
        <div class="inv-modal-footer">
          <button class="inv-btn inv-btn-ghost" @click="isFormOpen = false">Batal</button>
          <button class="inv-btn inv-btn-primary" :disabled="isSaving" @click="saveAsset">
            {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="detail" class="inv-modal-overlay" @click.self="closeDetail">
      <div class="inv-modal inv-modal-wide">
        <div class="inv-modal-header">
          <h3>{{ detail.code }} — {{ detail.name }}</h3>
          <button class="inv-close" @click="closeDetail">✕</button>
        </div>
        <div class="inv-modal-body">
          <div class="detail-grid">
            <div><span>Kategori</span>{{ detail.category_label }}</div>
            <div><span>Merk / Tipe</span>{{ [detail.brand, detail.model_type].filter(Boolean).join(' / ') || '-' }}</div>
            <div><span>No. Seri</span>{{ detail.serial_number || '-' }}</div>
            <div><span>Lokasi</span>{{ detail.location || '-' }}</div>
            <div><span>Penanggung Jawab</span>{{ detail.pic || '-' }}</div>
            <div>
              <span>Kondisi / Status</span>
              <span class="badge" :class="`cond-${detail.condition}`">{{ detail.condition_label }}</span>
              <span class="badge" :class="`stat-${detail.status}`">{{ detail.status_label }}</span>
            </div>
            <div><span>Tanggal Pembelian</span>{{ formatDate(detail.purchase_date) }}</div>
            <div><span>Harga Beli</span>{{ detail.purchase_price > 0 ? formatRupiah(detail.purchase_price) : '-' }}</div>
            <div>
              <span>Nilai Buku</span>
              {{ detail.book_value !== null ? formatRupiah(detail.book_value) : '-' }}
              <small v-if="detail.useful_life_years">({{ detail.useful_life_years }} th)</small>
            </div>
            <div><span>Supplier</span>{{ detail.supplier_name || '-' }}</div>
            <template v-if="isVehicleCategory(detail.category)">
              <div><span>Plat Nomor</span>{{ detail.plate_number || '-' }}</div>
              <div><span>No. Rangka / Mesin</span>{{ detail.chassis_number || '-' }} / {{ detail.engine_number || '-' }}</div>
              <div><span>Pajak STNK</span>{{ formatDate(detail.tax_due_date) }}</div>
              <div><span>KIR</span>{{ formatDate(detail.kir_due_date) }}</div>
            </template>
            <div class="span-all" v-if="detail.notes"><span>Catatan</span>{{ detail.notes }}</div>
          </div>

          <div class="service-header">
            <h4>🛠️ Riwayat Servis</h4>
            <span class="service-total">Total biaya: <strong>{{ formatRupiah(detail.total_service_cost) }}</strong></span>
          </div>

          <div class="service-form">
            <div class="form-grid form-grid-4">
              <label>
                Tanggal *
                <input v-model="serviceForm.service_date" type="date" class="inv-input" />
              </label>
              <label>
                Jenis *
                <select v-model="serviceForm.service_type" class="inv-input">
                  <option v-for="(label, key) in options.service_types" :key="key" :value="key">{{ label }}</option>
                </select>
              </label>
              <label>
                Biaya (Rp)
                <input v-model.number="serviceForm.cost" type="number" min="0" class="inv-input" />
              </label>
              <label>
                Bengkel / Teknisi
                <input v-model="serviceForm.vendor" class="inv-input" />
              </label>
              <label class="span-2">
                Keterangan *
                <input v-model="serviceForm.description" class="inv-input" placeholder="mis. Ganti bearing & belt" />
              </label>
              <label>
                KM / Jam Mesin
                <input v-model="serviceForm.meter_reading" class="inv-input" />
              </label>
              <label>
                Servis Berikutnya
                <input v-model="serviceForm.next_service_date" type="date" class="inv-input" />
              </label>
            </div>
            <div class="service-form-actions">
              <button v-if="serviceForm.id" class="inv-btn inv-btn-ghost" @click="resetServiceForm">Batal Edit</button>
              <button class="inv-btn inv-btn-primary" :disabled="isSavingService" @click="saveService">
                {{ serviceForm.id ? 'Simpan Perubahan' : '➕ Tambah Riwayat' }}
              </button>
            </div>
          </div>

          <table class="inv-table service-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Keterangan</th>
                <th>Bengkel</th>
                <th>KM/Jam</th>
                <th class="t-right">Biaya</th>
                <th>Berikutnya</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!detail.service_records.length">
                <td colspan="8" class="inv-empty">Belum ada riwayat servis.</td>
              </tr>
              <tr v-for="rec in detail.service_records" :key="rec.id" :class="{ editing: serviceForm.id === rec.id }">
                <td>{{ formatDate(rec.service_date) }}</td>
                <td>{{ options.service_types[rec.service_type] || rec.service_type }}</td>
                <td>{{ rec.description }}</td>
                <td>{{ rec.vendor || '-' }}</td>
                <td>{{ rec.meter_reading || '-' }}</td>
                <td class="t-right">{{ formatRupiah(rec.cost) }}</td>
                <td>{{ formatDate(rec.next_service_date) }}</td>
                <td class="t-actions">
                  <button class="icon-btn" title="Edit" @click="editService(rec)">✏️</button>
                  <button class="icon-btn" title="Hapus" @click="deleteService(rec)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { debounce } from 'lodash-es'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import apiClient from '@/api/axios'

const toast = useToast()

const options = ref({
  categories: {},
  conditions: {},
  statuses: {},
  service_types: {},
  locations: [],
  due_soon_days: 30,
})
const assets = ref([])
const pagination = ref({ current_page: 1, last_page: 1, total: 0, per_page: 25 })
const summary = ref({ total_units: 0, in_repair: 0, damaged: 0, due_alerts: 0, total_purchase_value: 0 })
const filters = reactive({ search: '', category: '', location: '', condition: '', status: '' })
const page = ref(1)
const loading = ref(false)
const isExporting = ref(false)

const isFormOpen = ref(false)
const isSaving = ref(false)
const form = ref({})

const detail = ref(null)
const isSavingService = ref(false)
const serviceForm = ref({})

const hasFilter = computed(() => Object.values(filters).some((v) => v))

const isVehicleCategory = (category) => ['kendaraan', 'alat_berat'].includes(category)

const today = () => new Date().toISOString().slice(0, 10)

const emptyForm = () => ({
  id: null,
  code: '',
  name: '',
  category: 'mesin_produksi',
  brand: '',
  model_type: '',
  serial_number: '',
  location: '',
  pic: '',
  purchase_date: '',
  purchase_price: null,
  useful_life_years: null,
  supplier_name: '',
  condition: 'baik',
  status: 'aktif',
  plate_number: '',
  chassis_number: '',
  engine_number: '',
  tax_due_date: '',
  kir_due_date: '',
  notes: '',
})

const emptyServiceForm = () => ({
  id: null,
  service_date: today(),
  service_type: 'servis_rutin',
  description: '',
  vendor: '',
  cost: null,
  meter_reading: '',
  next_service_date: '',
})

const previewBookValue = computed(() => {
  const price = Number(form.value.purchase_price) || 0
  const years = Number(form.value.useful_life_years) || 0
  if (!form.value.purchase_date || !years || price <= 0) return 'isi tanggal beli, harga & umur ekonomis'
  const start = new Date(form.value.purchase_date)
  const now = new Date()
  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  if (now.getDate() < start.getDate()) months--
  months = Math.min(Math.max(months, 0), years * 12)
  return formatRupiah(Math.max(0, price - (price * months) / (years * 12)))
})

const formatRupiah = (value) =>
  'Rp ' + Number(value || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

const alertText = (alert) => {
  if (alert.overdue) return `lewat ${Math.abs(alert.days)} hr`
  if (alert.days === 0) return 'hari ini'
  return `${alert.days} hr lagi`
}

const rowNumber = (i) => (pagination.value.current_page - 1) * pagination.value.per_page + i + 1

const queryParams = () => {
  const params = {}
  for (const [key, value] of Object.entries(filters)) {
    if (value) params[key] = value
  }
  return params
}

const errorMessage = (error, fallback) => {
  const errors = error.response?.data?.errors
  if (errors) return Object.values(errors).flat()[0]
  return error.response?.data?.message || fallback
}

const fetchOptions = async () => {
  try {
    const res = await apiClient.get('/assets/options')
    options.value = res.data.data
  } catch (error) {
    console.error('Error fetching asset options:', error)
  }
}

const fetchAssets = async () => {
  loading.value = true
  try {
    const res = await apiClient.get('/assets', { params: { ...queryParams(), page: page.value, per_page: 25 } })
    assets.value = res.data.data
    pagination.value = res.data.pagination
    summary.value = res.data.summary
  } catch (error) {
    console.error('Error fetching assets:', error)
    toast.error(errorMessage(error, 'Gagal memuat data inventaris.'))
  } finally {
    loading.value = false
  }
}

const reloadFirstPage = () => {
  if (page.value === 1) fetchAssets()
  else page.value = 1
}

const debouncedReload = debounce(reloadFirstPage, 400)

watch(() => filters.search, debouncedReload)
watch(() => [filters.category, filters.location, filters.condition, filters.status], reloadFirstPage)
watch(page, fetchAssets)

const resetFilters = () => {
  Object.assign(filters, { search: '', category: '', location: '', condition: '', status: '' })
}

const openCreate = () => {
  form.value = emptyForm()
  isFormOpen.value = true
}

const openEdit = (asset) => {
  const base = emptyForm()
  for (const key of Object.keys(base)) {
    base[key] = asset[key] ?? base[key]
  }
  form.value = base
  isFormOpen.value = true
}

const saveAsset = async () => {
  if (!form.value.name?.trim()) {
    toast.warning('Nama inventaris wajib diisi.')
    return
  }
  isSaving.value = true
  try {
    const payload = { ...form.value }
    for (const key of Object.keys(payload)) {
      if (payload[key] === '') payload[key] = null
    }
    const res = form.value.id
      ? await apiClient.put(`/assets/${form.value.id}`, payload)
      : await apiClient.post('/assets', payload)
    toast.success(res.data.message)
    isFormOpen.value = false
    await Promise.all([fetchAssets(), fetchOptions()])
    if (detail.value && detail.value.id === form.value.id) await openDetail(form.value.id)
  } catch (error) {
    toast.error(errorMessage(error, 'Gagal menyimpan inventaris.'))
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = async (asset) => {
  const result = await Swal.fire({
    title: 'Hapus inventaris?',
    text: `${asset.code} — ${asset.name}. Riwayat servisnya juga ikut tersembunyi.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#dc2626',
  })
  if (!result.isConfirmed) return
  try {
    const res = await apiClient.delete(`/assets/${asset.id}`)
    toast.success(res.data.message)
    if (assets.value.length === 1 && page.value > 1) page.value--
    else fetchAssets()
  } catch (error) {
    toast.error(errorMessage(error, 'Gagal menghapus inventaris.'))
  }
}

const openDetail = async (id) => {
  try {
    const res = await apiClient.get(`/assets/${id}`)
    detail.value = res.data.data
    if (!serviceForm.value.id) resetServiceForm()
  } catch (error) {
    toast.error(errorMessage(error, 'Gagal memuat detail inventaris.'))
  }
}

const closeDetail = () => {
  detail.value = null
  resetServiceForm()
}

const resetServiceForm = () => {
  serviceForm.value = emptyServiceForm()
}

const editService = (record) => {
  serviceForm.value = {
    id: record.id,
    service_date: record.service_date,
    service_type: record.service_type,
    description: record.description,
    vendor: record.vendor || '',
    cost: Number(record.cost) || null,
    meter_reading: record.meter_reading || '',
    next_service_date: record.next_service_date || '',
  }
}

const saveService = async () => {
  if (!serviceForm.value.description?.trim()) {
    toast.warning('Keterangan servis wajib diisi.')
    return
  }
  isSavingService.value = true
  try {
    const payload = { ...serviceForm.value }
    for (const key of Object.keys(payload)) {
      if (payload[key] === '') payload[key] = null
    }
    const base = `/assets/${detail.value.id}/services`
    const res = payload.id ? await apiClient.put(`${base}/${payload.id}`, payload) : await apiClient.post(base, payload)
    toast.success(res.data.message)
    resetServiceForm()
    await Promise.all([openDetail(detail.value.id), fetchAssets()])
  } catch (error) {
    toast.error(errorMessage(error, 'Gagal menyimpan riwayat servis.'))
  } finally {
    isSavingService.value = false
  }
}

const deleteService = async (record) => {
  const result = await Swal.fire({
    title: 'Hapus riwayat servis?',
    text: `${formatDate(record.service_date)} — ${record.description}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#dc2626',
  })
  if (!result.isConfirmed) return
  try {
    const res = await apiClient.delete(`/assets/${detail.value.id}/services/${record.id}`)
    toast.success(res.data.message)
    if (serviceForm.value.id === record.id) resetServiceForm()
    await Promise.all([openDetail(detail.value.id), fetchAssets()])
  } catch (error) {
    toast.error(errorMessage(error, 'Gagal menghapus riwayat servis.'))
  }
}

const downloadExcel = async () => {
  isExporting.value = true
  try {
    const response = await apiClient.get('/assets/export', { params: queryParams(), responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Inventaris-${today()}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading excel:', error)
    toast.error('Gagal download Excel.')
  } finally {
    isExporting.value = false
  }
}

const downloadPdf = async () => {
  isExporting.value = true
  try {
    const res = await apiClient.get('/assets', { params: { ...queryParams(), page: 1, per_page: 200 } })
    let rows = res.data.data
    const lastPage = res.data.pagination.last_page
    for (let p = 2; p <= lastPage; p++) {
      const more = await apiClient.get('/assets', { params: { ...queryParams(), page: p, per_page: 200 } })
      rows = rows.concat(more.data.data)
    }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const margin = 10
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    doc.setFont('helvetica', 'bold').setFontSize(13)
    doc.text('DAFTAR INVENTARIS PABRIK', pageWidth / 2, 14, { align: 'center' })
    doc.setFont('helvetica', 'normal').setFontSize(8)
    const filterInfo = [
      filters.category && options.value.categories[filters.category],
      filters.location,
      filters.condition && options.value.conditions[filters.condition],
      filters.status && options.value.statuses[filters.status],
      filters.search && `"${filters.search}"`,
    ].filter(Boolean)
    doc.text(
      `Dicetak: ${new Date().toLocaleString('id-ID')}   |   ${rows.length} unit${filterInfo.length ? '   |   Filter: ' + filterInfo.join(', ') : ''}`,
      margin,
      20,
    )

    autoTable(doc, {
      startY: 24,
      margin: { left: margin, right: margin, bottom: 12 },
      head: [['No', 'Kode', 'Nama', 'Kategori', 'Lokasi', 'Tgl Beli', 'Harga Beli', 'Kondisi', 'Status']],
      body: rows.map((a, i) => [
        i + 1,
        a.code,
        a.name + (a.plate_number ? `\n${a.plate_number}` : ''),
        a.category_label,
        a.location || '-',
        formatDate(a.purchase_date),
        Number(a.purchase_price) > 0 ? formatRupiah(a.purchase_price) : '-',
        a.condition_label,
        a.status_label,
      ]),
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 1.2, lineColor: [85, 85, 85], lineWidth: 0.15, textColor: 17, valign: 'middle' },
      headStyles: { fillColor: [229, 231, 235], textColor: 17, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 22 },
        3: { cellWidth: 24 },
        4: { cellWidth: 20 },
        5: { cellWidth: 18, halign: 'center' },
        6: { cellWidth: 24, halign: 'right' },
        7: { cellWidth: 17, halign: 'center' },
        8: { cellWidth: 20, halign: 'center' },
      },
      showHead: 'everyPage',
      didDrawPage: () => {
        doc.setFont('helvetica', 'normal').setFontSize(7)
        doc.text(`Hal. ${doc.getNumberOfPages()}`, pageWidth - margin, pageHeight - 5, { align: 'right' })
      },
    })

    doc.save(`Inventaris-${today()}.pdf`)
  } catch (error) {
    console.error('Error generating PDF:', error)
    toast.error('Gagal membuat PDF.')
  } finally {
    isExporting.value = false
  }
}

onMounted(() => {
  fetchOptions()
  fetchAssets()
})
</script>

<style scoped>
.inv-wrapper { display: flex; flex-direction: column; gap: 1.25rem; }

.inv-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.875rem; }
.inv-stat { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.125rem; background: white; border-radius: 16px; border: 1px solid #f0f2f5; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
.inv-stat-alert { border-color: #fdba74; background: #fff7ed; }
.inv-stat-icon { font-size: 1.5rem; }
.inv-stat-label { margin: 0; font-size: 0.75rem; color: #6b7280; font-weight: 600; }
.inv-stat-value { margin: 0; font-size: 1.375rem; font-weight: 800; color: #1f2937; }
.inv-stat-money { font-size: 1rem; }

.inv-card { background: white; border-radius: 20px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); border: 1px solid #f0f2f5; overflow: hidden; }
.inv-card-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f0f2f5; }
.inv-title { margin: 0; font-size: 1.25rem; font-weight: 800; color: #1f2937; }
.inv-subtitle { margin: 0.25rem 0 0; font-size: 0.8125rem; color: #6b7280; }
.inv-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.inv-filters { display: flex; gap: 0.625rem; flex-wrap: wrap; padding: 1rem 1.5rem; background: #fafbff; border-bottom: 1px solid #f0f2f5; }
.inv-input { padding: 0.5rem 0.75rem; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 0.875rem; background: white; width: 100%; box-sizing: border-box; font-family: inherit; }
.inv-input:focus { outline: none; border-color: #667eea; }
.inv-filters .inv-input { width: auto; min-width: 150px; }
.inv-filters .inv-search { flex: 1; min-width: 240px; }

.inv-btn { padding: 0.55rem 1rem; border-radius: 10px; border: none; font-weight: 700; font-size: 0.8125rem; cursor: pointer; white-space: nowrap; }
.inv-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.inv-btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.inv-btn-excel { background: #16a34a; color: white; }
.inv-btn-pdf { background: #dc2626; color: white; }
.inv-btn-ghost { background: #f3f4f6; color: #374151; }

.inv-table-wrap { overflow-x: auto; }
.inv-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
.inv-table th { background: #f8f9fc; color: #4b5563; font-weight: 700; text-align: left; padding: 0.7rem 0.75rem; border-bottom: 2px solid #eef0f5; white-space: nowrap; }
.inv-table td { padding: 0.65rem 0.75rem; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
.inv-table tbody tr:hover { background: #fafbff; }
.inv-empty { text-align: center; color: #9ca3af; padding: 2rem !important; }
.t-right { text-align: right !important; white-space: nowrap; }
.t-center { text-align: center; }
.t-code { font-family: monospace; font-weight: 700; color: #4c51bf; white-space: nowrap; }
.t-name { font-weight: 600; color: #1f2937; }
.t-sub { font-size: 0.75rem; color: #6b7280; }
.t-actions { white-space: nowrap; }
.text-muted { color: #9ca3af; }
.icon-btn { background: none; border: none; cursor: pointer; font-size: 1rem; padding: 0.2rem 0.3rem; border-radius: 6px; }
.icon-btn:hover { background: #eef0ff; }

.badge { display: inline-block; padding: 0.2rem 0.55rem; border-radius: 999px; font-size: 0.7rem; font-weight: 700; white-space: nowrap; margin-right: 0.25rem; }
.cond-baik { background: #dcfce7; color: #166534; }
.cond-rusak_ringan { background: #fef3c7; color: #92400e; }
.cond-rusak_berat { background: #fee2e2; color: #991b1b; }
.stat-aktif { background: #dbeafe; color: #1e40af; }
.stat-perbaikan { background: #ffedd5; color: #9a3412; }
.stat-tidak_dipakai { background: #f3f4f6; color: #4b5563; }
.stat-dijual { background: #e5e7eb; color: #374151; text-decoration: line-through; }

.alert-chip { display: inline-block; padding: 0.15rem 0.5rem; margin: 0.1rem 0.2rem 0.1rem 0; border-radius: 999px; font-size: 0.7rem; font-weight: 700; background: #fef3c7; color: #92400e; white-space: nowrap; }
.alert-chip.overdue { background: #fee2e2; color: #991b1b; }

.inv-pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; padding: 1rem; font-size: 0.8125rem; color: #4b5563; }

.inv-modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 1rem; }
.inv-modal { background: white; border-radius: 20px; width: 100%; max-width: 760px; max-height: 92vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); }
.inv-modal-wide { max-width: 1100px; }
.inv-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.125rem 1.5rem; border-bottom: 1px solid #f0f2f5; }
.inv-modal-header h3 { margin: 0; font-size: 1.125rem; font-weight: 800; color: #1f2937; }
.inv-close { background: #f3f4f6; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 1rem; }
.inv-modal-body { padding: 1.25rem 1.5rem; overflow-y: auto; }
.inv-modal-footer { display: flex; justify-content: flex-end; gap: 0.5rem; padding: 1rem 1.5rem; border-top: 1px solid #f0f2f5; }

.form-section { margin: 1rem 0 0.625rem; font-size: 0.8125rem; font-weight: 800; color: #4c51bf; text-transform: uppercase; letter-spacing: 0.04em; }
.form-section:first-child { margin-top: 0; }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
.form-grid-4 { grid-template-columns: repeat(4, 1fr); }
.form-grid label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.75rem; font-weight: 700; color: #4b5563; }
.span-2 { grid-column: span 2; }
.form-hint { font-size: 0.8125rem; color: #4b5563; background: #f5f3ff; padding: 0.6rem 0.8rem; border-radius: 10px; }

.detail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem 1.25rem; margin-bottom: 1.25rem; font-size: 0.875rem; color: #1f2937; }
.detail-grid > div > span:first-child { display: block; font-size: 0.7rem; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 0.15rem; }
.span-all { grid-column: 1 / -1; }

.service-header { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f0f2f5; padding-top: 1rem; margin-bottom: 0.75rem; }
.service-header h4 { margin: 0; font-size: 1rem; font-weight: 800; }
.service-total { font-size: 0.875rem; color: #4b5563; }
.service-form { background: #fafbff; border: 1px solid #eef0f5; border-radius: 14px; padding: 1rem; margin-bottom: 1rem; }
.service-form-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.75rem; }
.service-table tr.editing { background: #eef0ff; }

@media (max-width: 768px) {
  .form-grid, .form-grid-4 { grid-template-columns: 1fr; }
  .span-2 { grid-column: span 1; }
  .detail-grid { grid-template-columns: 1fr; }
}
</style>
