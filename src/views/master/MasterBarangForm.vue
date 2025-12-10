<template>
  <DashboardLayout>
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge-form">
            <span class="form-icon">📦</span>
          </div>
          <div class="header-text">
            <h1 class="page-title">
              {{ isEditMode ? 'Edit Barang' : 'Tambah Barang Baru' }}
            </h1>
            <p class="page-subtitle">
              {{ isEditMode ? 'Perbarui detail barang master.' : 'Buat barang master baru.' }}
            </p>
          </div>
        </div>
        <div class="header-badge">
          <span class="mode-badge" :class="isEditMode ? 'mode-edit' : 'mode-create'">
            {{ isEditMode ? '✏️ Mode Edit' : '➕ Mode Tambah' }}
          </span>
        </div>
      </div>
    </div>

    <div class="content-card">
      <div class="card-header-accent">
        <div class="progress-bar" :style="{ width: formProgress + '%' }"></div>
      </div>

      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <!-- INFORMASI DASAR -->
          <div class="form-section">
            <div class="section-title">
              <span class="section-icon">📝</span>
              <h3>Informasi Dasar</h3>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  Kode Barang
                  <span class="required">*</span>
                  <span class="label-hint">(Kode unik)</span>
                </label>
                <div class="input-wrapper">
                  <span class="input-icon">🔢</span>
                  <input
                    v-model="form.code"
                    type="text"
                    class="form-control"
                    placeholder="Masukkan kode barang"
                    required
                    @input="calculateProgress"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  Nama Barang
                  <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <span class="input-icon">🏷️</span>
                  <input
                    v-model="form.name"
                    type="text"
                    class="form-control"
                    placeholder="Masukkan nama barang"
                    required
                    @input="calculateProgress"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- KLASIFIKASI -->
          <div class="form-section">
            <div class="section-title">
              <span class="section-icon">🗂️</span>
              <h3>Klasifikasi</h3>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  Kategori
                  <span class="required">*</span>
                </label>
                <div class="select-wrapper">
                  <span class="input-icon">📂</span>
                  <select
                    v-model="form.category_id"
                    class="form-control form-select"
                    required
                    @change="handleCategoryChange"
                  >
                    <option value="">Pilih Kategori...</option>
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </option>
                  </select>
                  <span class="select-arrow">▼</span>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  Satuan
                  <span class="required">*</span>
                </label>
                <div class="select-wrapper">
                  <span class="input-icon">📏</span>
                  <select
                    v-model="form.unit_id"
                    class="form-control form-select"
                    required
                    @change="calculateProgress"
                  >
                    <option value="">Pilih Satuan...</option>
                    <option v-for="unit in units" :key="unit.id" :value="unit.id">
                      {{ unit.name }}
                    </option>
                  </select>
                  <span class="select-arrow">▼</span>
                </div>
              </div>
            </div>
          </div>

          <!-- DATA EKSPOR (PRODUK JADI) -->
          <transition name="slide-fade">
            <div v-if="isProdukJadiCategory" class="form-section">
              <div class="section-title section-title-accent">
                <span class="section-icon">🌍</span>
                <h3>Data Ekspor</h3>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">
                    HS Code
                    <span class="required">*</span>
                    <span class="label-hint">(Contoh: 4407.99)</span>
                  </label>
                  <div class="input-wrapper">
                    <span class="input-icon">📜</span>
                    <input
                      v-model="form.hs_code"
                      type="text"
                      class="form-control"
                      placeholder="Masukkan HS Code"
                      required
                      @input="calculateProgress"
                    />
                  </div>
                  <p class="form-help-text">
                    Kode HS untuk ekspor kayu (wajib diisi untuk produk jadi)
                  </p>
                </div>
              </div>
            </div>
          </transition>

          <!-- SPESIFIKASI KAYU LOG -->
          <transition name="slide-fade">
            <div v-if="isKayuLogCategory" class="form-section">
              <div class="section-title section-title-accent">
                <span class="section-icon">🪵</span>
                <h3>Spesifikasi Kayu Log</h3>
              </div>

              <div class="form-row form-row-triple">
                <div class="form-group">
                  <label class="form-label">
                    Diameter (mm)
                    <span class="required">*</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      v-model.number="form.specifications.t"
                      type="number"
                      class="form-control"
                      placeholder="cth: 300"
                      required
                      min="0"
                      @input="calculateProgress"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Panjang (P) mm
                    <span class="required">*</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      v-model.number="form.specifications.p"
                      type="number"
                      class="form-control"
                      placeholder="cth: 2000"
                      required
                      min="0"
                      @input="calculateProgress"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Jenis Kayu
                    <span class="required">*</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      v-model="form.jenis"
                      type="text"
                      class="form-control"
                      placeholder="cth: TEAK / MAHONI"
                      required
                      @input="calculateProgress"
                    />
                  </div>
                </div>
              </div>

              <!-- Kubikasi per batang (manual) -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">
                    Kubikasi per Batang (m³)
                    <span class="required">*</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      v-model.number="form.volume_m3"
                      type="number"
                      min="0"
                      step="0.0001"
                      class="form-control"
                      placeholder="cth: 0.4567"
                      required
                      @input="calculateProgress"
                    />
                  </div>
                </div>
              </div>
            </div>
          </transition>

          <!-- SPESIFIKASI KAYU RST -->
          <transition name="slide-fade">
            <div v-if="isKayuRSTCategory" class="form-section">
              <div class="section-title section-title-accent">
                <span class="section-icon">🌲</span>
                <h3>Spesifikasi Kayu RST</h3>
              </div>

              <!-- Dimensi -->
              <div class="form-row form-row-triple">
                <div class="form-group">
                  <label class="form-label">
                    Tebal (T) mm
                    <span class="required">*</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      v-model.number="form.specifications.t"
                      type="number"
                      class="form-control"
                      placeholder="cth: 50"
                      required
                      min="0"
                      @input="calculateProgress"
                    />
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">
                    Lebar (L) mm
                    <span class="required">*</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      v-model.number="form.specifications.l"
                      type="number"
                      class="form-control"
                      placeholder="cth: 80"
                      required
                      min="0"
                      @input="calculateProgress"
                    />
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">
                    Panjang (P) mm
                    <span class="required">*</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      v-model.number="form.specifications.p"
                      type="number"
                      class="form-control"
                      placeholder="cth: 1000"
                      required
                      min="0"
                      @input="calculateProgress"
                    />
                  </div>
                </div>
              </div>

              <!-- Jenis / Kualitas / Bentuk -->
              <div class="form-row form-row-triple">
                <div class="form-group">
                  <label class="form-label">
                    Jenis Kayu
                    <span class="required">*</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      v-model="form.jenis"
                      type="text"
                      class="form-control"
                      placeholder="cth: TEAK / MAHONI"
                      required
                      @input="calculateProgress"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Kualitas
                    <span class="required">*</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      v-model="form.kualitas"
                      type="text"
                      class="form-control"
                      placeholder="cth: A / B / MIXED"
                      required
                      @input="calculateProgress"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Bentuk
                    <span class="required">*</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      v-model="form.bentuk"
                      type="text"
                      class="form-control"
                      placeholder="cth: PLANK / S4S / COMPONENT"
                      required
                      @input="calculateProgress"
                    />
                  </div>
                </div>
              </div>
            </div>
          </transition>

          <!-- KARTON BOX -->
          <transition name="slide-fade">
            <div v-if="isKartonBoxCategory" class="form-section">
              <div class="section-title section-title-accent">
                <span class="section-icon">📦</span>
                <h3>Spesifikasi Karton Box (untuk Volume)</h3>
              </div>

              <div class="form-row form-row-triple">
                <div class="form-group">
                  <label class="form-label">
                    Panjang (P) mm
                    <span class="required">*</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      v-model.number="form.specifications.p"
                      type="number"
                      class="form-control"
                      placeholder="cth: 1000"
                      required
                      min="0"
                      @input="calculateProgress"
                    />
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">
                    Lebar (L) mm
                    <span class="required">*</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      v-model.number="form.specifications.l"
                      type="number"
                      class="form-control"
                      placeholder="cth: 900"
                      required
                      min="0"
                      @input="calculateProgress"
                    />
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">
                    Tebal (T) mm
                    <span class="required">*</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      v-model.number="form.specifications.t"
                      type="number"
                      class="form-control"
                      placeholder="cth: 943"
                      required
                      min="0"
                      @input="calculateProgress"
                    />
                  </div>
                </div>
              </div>
            </div>
          </transition>

          <!-- DNA PRODUK JADI -->
          <transition name="slide-fade">
            <div v-if="isProdukJadiCategory" class="form-section">
              <div class="section-title section-title-accent">
                <span class="section-icon">🏭</span>
                <h3>DNA Produk Jadi (Data Pakem)</h3>
              </div>

              <div class="form-row form-row-triple">
                <div class="form-group">
                  <label class="form-label">
                    NW per Box (Kg)
                    <span class="required">*</span>
                    <span class="label-hint">(Data Pakem, cth: 27)</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      v-model.number="form.nw_per_box"
                      type="number"
                      step="0.01"
                      class="form-control"
                      placeholder="cth: 27.00"
                      required
                      min="0"
                      @input="calculateProgress"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    GW per Box (Kg)
                    <span class="required">*</span>
                    <span class="label-hint">(Data Pakem, cth: 42)</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      v-model.number="form.gw_per_box"
                      type="number"
                      step="0.01"
                      class="form-control"
                      placeholder="cth: 42.00"
                      required
                      min="0"
                      @input="calculateProgress"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Wood Consumed / Pcs (M³)
                    <span class="required">*</span>
                    <span class="label-hint">(Pakem BOM, cth: 0.0099)</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      v-model.number="form.wood_consumed_per_pcs"
                      type="number"
                      step="0.000001"
                      class="form-control"
                      placeholder="cth: 0.009900"
                      required
                      min="0"
                      @input="calculateProgress"
                    />
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">
                    Kubikasi per Karton (M³)
                    <span class="required">*</span>
                    <span class="label-hint">(Data Pakem, cth: 0.045)</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      v-model.number="form.m3_per_carton"
                      type="number"
                      step="0.000001"
                      class="form-control"
                      placeholder="cth: 0.045000"
                      required
                      min="0"
                      @input="calculateProgress"
                    />
                  </div>
                </div>
              </div>
            </div>
          </transition>

          <!-- DETAIL TAMBAHAN -->
          <div class="form-section">
            <div class="section-title">
              <span class="section-icon">📊</span>
              <h3>Detail Tambahan</h3>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  Stok Awal
                  <span class="label-hint">(Opsional)</span>
                </label>
                <div class="input-wrapper">
                  <span class="input-icon">📦</span>
                  <input
                    v-model.number="form.stock"
                    type="number"
                    class="form-control"
                    placeholder="0"
                    min="0"
                    @input="calculateProgress"
                  />
                </div>
              </div>
              <div class="form-group form-group-wide">
                <label class="form-label">
                  Deskripsi
                  <span class="label-hint">(Opsional)</span>
                </label>
                <div class="textarea-wrapper">
                  <textarea
                    v-model="form.description"
                    class="form-control form-textarea"
                    rows="3"
                    placeholder="Masukkan deskripsi barang"
                    @input="calculateProgress"
                  ></textarea>
                  <span class="textarea-counter"> {{ (form.description || '').length }}/500 </span>
                </div>
              </div>
            </div>
          </div>

          <!-- ACTIONS -->
          <div class="form-actions">
            <button
              type="button"
              class="btn btn-cancel"
              @click="router.push({ name: 'MasterBarang' })"
            >
              <span class="btn-icon">↩️</span>
              <span class="btn-text">Batal</span>
            </button>
            <button type="submit" class="btn btn-submit">
              <span class="btn-icon">💾</span>
              <span class="btn-text">{{ isEditMode ? 'Perbarui' : 'Simpan' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'

const router = useRouter()
const route = useRoute()
const { showSuccess, showError } = useNotification()

const isEditMode = computed(() => !!route.params.id)

const form = reactive({
  id: null,
  code: '',
  name: '',
  description: '',
  category_id: '',
  unit_id: '',
  stock: 0,
  hs_code: '',
  specifications: {
    t: null,
    l: null,
    p: null,
  },
  jenis: '',
  kualitas: '',
  bentuk: '',
  nw_per_box: null,
  gw_per_box: null,
  wood_consumed_per_pcs: null,
  m3_per_carton: null,
  volume_m3: null, // ✅ kubikasi (manual untuk Log, auto RST)
})

const categories = ref([])
const units = ref([])
const formProgress = ref(0)

const selectedCategoryName = computed(() => {
  if (!form.category_id) return ''
  const found = categories.value.find((cat) => cat.id === form.category_id)
  return found ? found.name : ''
})

const isKayuRSTCategory = computed(() =>
  selectedCategoryName.value.toLowerCase().includes('kayu rst'),
)
const isKartonBoxCategory = computed(() =>
  selectedCategoryName.value.toLowerCase().includes('karton box'),
)
const isProdukJadiCategory = computed(() =>
  selectedCategoryName.value.toLowerCase().includes('produk jadi'),
)
const isKayuLogCategory = computed(() =>
  selectedCategoryName.value.toLowerCase().includes('kayu log'),
)

const handleCategoryChange = () => {
  form.specifications.t = null
  form.specifications.l = null
  form.specifications.p = null
  form.nw_per_box = null
  form.gw_per_box = null
  form.wood_consumed_per_pcs = null
  form.m3_per_carton = null
  form.jenis = ''
  form.kualitas = ''
  form.bentuk = ''
  form.volume_m3 = null

  if (!isProdukJadiCategory.value) {
    form.hs_code = ''
  }

  calculateProgress()
}

watch(
  () => form.category_id,
  () => {
    calculateProgress()
  },
)

const calculateProgress = () => {
  let filled = 0
  let total = 4

  if (form.code) filled++
  if (form.name) filled++
  if (form.category_id) filled++
  if (form.unit_id) filled++

  if (isProdukJadiCategory.value) {
    total += 1
    if (form.hs_code) filled++
  }

  if (isKayuLogCategory.value) {
    total += 4
    if (form.specifications.t) filled++ // diameter
    if (form.specifications.p) filled++ // panjang
    if (form.jenis) filled++
    if (form.volume_m3) filled++ // kubikasi manual
  }

  if (isKayuRSTCategory.value) {
    total += 6
    if (form.specifications.t) filled++
    if (form.specifications.l) filled++
    if (form.specifications.p) filled++
    if (form.jenis) filled++
    if (form.kualitas) filled++
    if (form.bentuk) filled++
  } else if (isKartonBoxCategory.value) {
    total += 3
    if (form.specifications.p) filled++
    if (form.specifications.l) filled++
    if (form.specifications.t) filled++
  } else if (isProdukJadiCategory.value) {
    total += 4
    if (form.nw_per_box) filled++
    if (form.gw_per_box) filled++
    if (form.wood_consumed_per_pcs) filled++
    if (form.m3_per_carton) filled++
  }

  formProgress.value = Math.round((filled / total) * 100)
}

const fetchDropdownData = async () => {
  try {
    const [categoriesResponse, unitsResponse] = await Promise.all([
      apiClient.get('/categories/all'),
      apiClient.get('/units/all'),
    ])

    categories.value = categoriesResponse.data.data
    units.value = unitsResponse.data.data
  } catch (error) {
    console.error('Gagal mengambil data dropdown:', error)
    showError('Gagal', 'Gagal mengambil data dropdown (kategori & unit)')
  }
}

const fetchItemData = async (itemId) => {
  try {
    const response = await apiClient.get(`/materials/${itemId}?include=unit,category`)
    const data = response.data.data

    form.id = data.id
    form.code = data.code || ''
    form.name = data.name || ''
    form.description = data.description || ''
    form.category_id = data.category_id || ''
    form.unit_id = data.unit_id || ''
    form.stock = parseInt(data.stock) || 0
    form.hs_code = data.hs_code || ''

    if (data.specifications) {
      form.specifications.t = data.specifications.t ?? null
      form.specifications.l = data.specifications.l ?? null
      form.specifications.p = data.specifications.p ?? null
    }

    form.jenis = data.jenis || ''
    form.kualitas = data.kualitas || ''
    form.bentuk = data.bentuk || ''
    form.nw_per_box = data.nw_per_box || null
    form.gw_per_box = data.gw_per_box || null
    form.wood_consumed_per_pcs = data.wood_consumed_per_pcs || null
    form.m3_per_carton = data.m3_per_carton || null
    form.volume_m3 = data.volume_m3 || null

    calculateProgress()
  } catch (error) {
    console.error('Gagal mengambil data barang:', error)
    showError('Gagal', 'Gagal mengambil data barang untuk diedit')
  }
}

const handleSubmit = async () => {
  try {
    if (isProdukJadiCategory.value && !form.hs_code.trim()) {
      showError('Validasi Gagal', 'HS Code wajib diisi untuk Produk Jadi')
      return
    }

    if (isKayuRSTCategory.value) {
      if (!form.jenis.trim() || !form.kualitas.trim() || !form.bentuk.trim()) {
        showError('Validasi Gagal', 'Jenis, Kualitas, dan Bentuk wajib diisi untuk Kayu RST')
        return
      }
    }

    if (isKayuLogCategory.value) {
      if (
        !form.jenis.trim() ||
        !form.specifications.t ||
        !form.specifications.p ||
        !form.volume_m3
      ) {
        showError(
          'Validasi Gagal',
          'Diameter, Panjang, Jenis Kayu, dan Kubikasi wajib diisi untuk Kayu Log',
        )
        return
      }
    }

    const payload = {
      code: form.code,
      name: form.name,
      description: form.description,
      category_id: form.category_id,
      unit_id: form.unit_id,
      stock: form.stock || 0,
      hs_code: form.hs_code || null,
      specifications: null,
      nw_per_box: null,
      gw_per_box: null,
      wood_consumed_per_pcs: null,
      m3_per_carton: null,
      jenis: null,
      kualitas: null,
      bentuk: null,
      volume_m3: form.volume_m3, // dikirim apa adanya, backend akan override hanya untuk RST
    }

    if (isKayuRSTCategory.value || isKartonBoxCategory.value || isKayuLogCategory.value) {
      payload.specifications = {
        t: form.specifications.t,
        l: form.specifications.l,
        p: form.specifications.p,
      }
    }

    if (isKayuRSTCategory.value || isKayuLogCategory.value) {
      payload.jenis = form.jenis
    }
    if (isKayuRSTCategory.value) {
      payload.kualitas = form.kualitas
      payload.bentuk = form.bentuk
    }

    if (isProdukJadiCategory.value) {
      payload.nw_per_box = form.nw_per_box
      payload.gw_per_box = form.gw_per_box
      payload.wood_consumed_per_pcs = form.wood_consumed_per_pcs
      payload.m3_per_carton = form.m3_per_carton
    }

    if (!payload.category_id) {
      showError('Validasi Gagal', 'Silakan pilih Kategori barang.')
      return
    }

    console.log('📤 PAYLOAD DIKIRIM:', payload)

    if (form.id) {
      await apiClient.put(`/materials/${form.id}`, payload)
      showSuccess('Sukses', 'Data barang berhasil diperbarui')
    } else {
      await apiClient.post('/materials', payload)
      showSuccess('Sukses', 'Data barang berhasil ditambahkan')
    }

    router.push({ name: 'MasterBarang' })
  } catch (error) {
    console.error('Gagal menyimpan data:', error)
    showError('Gagal', error.response?.data?.message || 'Gagal menyimpan data barang')
  }
}

onMounted(async () => {
  await fetchDropdownData()

  const itemId = route.params.id
  if (itemId) {
    await fetchItemData(itemId)
  }
  calculateProgress()
})
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 32px 36px;
  border-radius: 24px;
  margin-bottom: 24px;
  box-shadow: 0 12px 40px rgba(16, 185, 129, 0.25);
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15), transparent);
  border-radius: 50%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  gap: 24px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-badge-form {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(20px);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.form-icon {
  font-size: 36px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.page-title {
  font-size: 30px;
  font-weight: 900;
  margin: 0 0 6px 0;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 15px;
  opacity: 0.95;
  margin: 0;
  font-weight: 500;
}

.mode-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.mode-create {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15));
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.mode-edit {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #78350f;
  border: 2px solid rgba(245, 158, 11, 0.3);
}

.content-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
}

.card-header-accent {
  height: 4px;
  background: #e5e7eb;
  position: relative;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

.card-body {
  padding: 40px;
}

.form-section {
  margin-bottom: 36px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f3f4f6;
}

.section-icon {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.section-title h3 {
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.3px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 0;
}

.form-group-wide {
  grid-column: span 2;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-weight: 700;
  font-size: 14px;
  color: #374151;
}

.required {
  color: #ef4444;
  font-weight: 900;
  font-size: 16px;
}

.label-hint {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  font-style: italic;
}

.input-wrapper,
.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  font-size: 20px;
  pointer-events: none;
  z-index: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.select-arrow {
  position: absolute;
  right: 16px;
  font-size: 10px;
  color: #9ca3af;
  pointer-events: none;
  transition: transform 0.3s ease;
}

.form-select:focus + .select-arrow {
  transform: rotate(180deg);
}

.form-control {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  background: #f9fafb;
}

.form-control:hover {
  border-color: #cbd5e1;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #10b981;
  background: white;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
  transform: translateY(-2px);
}

.form-select {
  appearance: none;
  cursor: pointer;
  padding-right: 48px;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  padding: 14px 16px;
  line-height: 1.6;
}

.textarea-wrapper {
  position: relative;
}

.textarea-counter {
  position: absolute;
  bottom: 10px;
  right: 14px;
  font-size: 11px;
  color: #9ca3af;
  font-weight: 600;
  background: white;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 40px;
  padding-top: 32px;
  border-top: 2px solid #f3f4f6;
}

.btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition:
    width 0.6s,
    height 0.6s;
}

.btn:hover::before {
  width: 300px;
  height: 300px;
}

.btn-icon {
  font-size: 18px;
  position: relative;
  z-index: 1;
}

.btn-text {
  position: relative;
  z-index: 1;
}

.btn-cancel {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #374151;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

.btn-cancel:hover {
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.btn-submit {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

.btn-submit:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(16, 185, 129, 0.4);
}

@media (max-width: 768px) {
  .page-header {
    padding: 24px 20px;
  }
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  .icon-badge-form {
    width: 60px;
    height: 60px;
  }
  .form-icon {
    font-size: 30px;
  }
  .page-title {
    font-size: 24px;
  }
  .card-body {
    padding: 24px 20px;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
  .form-group-wide {
    grid-column: span 1;
  }
  .form-actions {
    flex-direction: column;
  }
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
