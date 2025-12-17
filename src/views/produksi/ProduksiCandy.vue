<template>
  <DashboardLayout>
    <div class="page-header-sawmill">
      <div class="header-content-wrapper">
        <div class="header-left-section">
          <div class="icon-badge-sawmill">
            <span class="sawmill-icon">🔥</span>
          </div>
          <div class="header-text-content">
            <h1 class="page-title-sawmill">Produksi Oven / Candy</h1>
            <p class="page-subtitle-sawmill">
              Pindahkan stok RST basah dari Gudang Sanwil ke Gudang Candy (kering).
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="content-card-sawmill">
      <div class="card-body-sawmill">
        <form @submit.prevent="handleSubmit">
          <!-- INFO UMUM -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge">
                <span class="section-icon">📅</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Informasi Umum</h3>
                <p class="section-subtitle">Tanggal dan catatan proses oven</p>
              </div>
            </div>

            <div class="form-grid-2col">
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Tanggal Proses <span class="required-star">*</span>
                </label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">📅</span>
                  <input v-model="form.date" type="date" class="form-input-modern" required />
                </div>
              </div>

              <div class="form-group-modern">
                <label class="form-label-modern">Catatan</label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">📝</span>
                  <input
                    v-model="form.notes"
                    type="text"
                    class="form-input-modern"
                    placeholder="Contoh: Oven batch 1, kiln A"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- SUMBER STOK (GUDANG SANWIL) -->
          <div class="form-section-modern">
            <div class="section-header">
              <div class="section-icon-badge log-badge">
                <span class="section-icon">📦</span>
              </div>
              <div class="section-title-group">
                <h3 class="section-title">Sumber Stok (Gudang Sanwil)</h3>
                <p class="section-subtitle">
                  Pilih stok RST basah yang akan dioven, lengkap dengan PO & produk.
                </p>
              </div>
            </div>

            <div class="form-group-modern">
              <label class="form-label-modern">
                Pilih Stok RST <span class="required-star">*</span>
              </label>
              <div class="select-wrapper-modern">
                <span class="select-icon">📦</span>
                <select v-model="form.source_inventory_id" class="form-select-modern" required>
                  <option value="">-- Pilih Stok di Gudang Sanwil --</option>
                  <option v-for="inv in sanwilInventories" :key="inv.id" :value="inv.id">
                    {{ inv.item.code }} - {{ inv.item.name }} ({{ inv.qty_pcs }} pcs /
                    {{ inv.qty_m3 }} m³) - {{ inv.ref_po_id || '-' }} /
                    {{ inv.ref_product_name || '-' }}
                  </option>
                </select>
                <span class="select-arrow">▼</span>
              </div>
            </div>

            <div v-if="selectedInventory" class="form-grid-2col">
              <div class="form-group-modern">
                <label class="form-label-modern">
                  Qty yang Dioven (pcs) <span class="required-star">*</span>
                </label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">🔢</span>
                  <input
                    v-model.number="form.qty_pcs"
                    type="number"
                    min="0"
                    :max="selectedInventory.qty_pcs"
                    step="1"
                    class="form-input-modern"
                    placeholder="Jumlah pcs"
                    required
                  />
                  <span class="input-suffix">pcs</span>
                </div>
                <p class="help-text">Maksimal: {{ selectedInventory.qty_pcs }} pcs</p>
              </div>

              <div class="form-group-modern">
                <label class="form-label-modern">
                  Qty yang Dioven (m³) <span class="required-star">*</span>
                </label>
                <div class="input-wrapper-icon">
                  <span class="input-icon">📊</span>
                  <input
                    v-model.number="form.qty_m3"
                    type="number"
                    min="0"
                    :max="selectedInventory.qty_m3"
                    step="0.0001"
                    class="form-input-modern"
                    placeholder="Volume m³"
                    required
                  />
                  <span class="input-suffix">m³</span>
                </div>
                <p class="help-text">Maksimal: {{ selectedInventory.qty_m3 }} m³</p>
              </div>
            </div>
          </div>

          <!-- FORM ACTIONS -->
          <div class="form-actions-modern">
            <button
              type="button"
              class="btn-action btn-cancel-modern"
              @click="router.push({ name: 'admin-dashboard' })"
            >
              <span class="btn-icon">↩️</span>
              <span class="btn-text">Batal</span>
            </button>
            <button type="submit" class="btn-action btn-submit-modern">
              <span class="btn-icon">💾</span>
              <span class="btn-text">Simpan Proses Candy</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'

const router = useRouter()
const { showSuccess, showError } = useNotification()

const form = reactive({
  date: new Date().toISOString().slice(0, 10),
  notes: '',
  source_inventory_id: '',
  qty_pcs: null,
  qty_m3: null,
})

const warehouses = ref([])
const sanwilInventories = ref([])

const selectedInventory = computed(
  () => sanwilInventories.value.find((inv) => inv.id === form.source_inventory_id) || null,
)

const getWarehouseIdByName = (name) => {
  const wh = warehouses.value.find((w) => w.name === name)
  return wh ? wh.id : null
}

const fetchData = async () => {
  try {
    const whRes = await apiClient.get('/warehouses')
    warehouses.value = whRes.data.data || whRes.data || []

    const sanwilId = getWarehouseIdByName('Gudang Sanwil')
    if (!sanwilId) {
      showError('Konfigurasi', 'Gudang Sanwil tidak ditemukan di master')
      return
    }

    const invRes = await apiClient.get('/inventories', {
      params: {
        warehouse_id: sanwilId,
        per_page: 200,
      },
    })

    const raw = invRes.data.data?.data || invRes.data.data || []

    sanwilInventories.value = raw.map((inv) => ({
      id: inv.id,
      warehouse_id: inv.warehouse_id,
      item_id: inv.item_id,
      qty_pcs: Number(inv.qty_pcs),
      qty_m3: Number(inv.qty_m3),
      ref_po_id: inv.ref_po_id,
      ref_product_id: inv.ref_product_id,
      item: inv.item,
      warehouse: inv.warehouse,
      ref_product_name: inv.item?.name || null, // sementara pakai nama item; bisa diganti product table
    }))
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil data gudang / inventory Sanwil')
  }
}

const handleSubmit = async () => {
  try {
    if (!selectedInventory.value) {
      showError('Validasi', 'Stok sumber wajib dipilih')
      return
    }

    if (!form.qty_pcs || form.qty_pcs <= 0) {
      showError('Validasi', 'Qty pcs wajib lebih dari 0')
      return
    }
    if (!form.qty_m3 || form.qty_m3 <= 0) {
      showError('Validasi', 'Qty m³ wajib lebih dari 0')
      return
    }

    if (form.qty_pcs > selectedInventory.value.qty_pcs) {
      showError('Validasi', 'Qty pcs melebihi stok di Gudang Sanwil')
      return
    }
    if (form.qty_m3 > selectedInventory.value.qty_m3) {
      showError('Validasi', 'Qty m³ melebihi stok di Gudang Sanwil')
      return
    }

    const payload = {
      date: form.date,
      notes: form.notes || null,
      source_inventory_id: form.source_inventory_id,
      qty_pcs: form.qty_pcs,
      qty_m3: form.qty_m3,
    }

    await apiClient.post('/candy-productions', payload)

    showSuccess('Sukses', 'Proses Candy berhasil dicatat')
    router.push({ name: 'admin-dashboard' }) // nanti bisa diarahkan ke report yang kamu mau
  } catch (error) {
    console.error(error)
    const msg =
      error.response?.data?.message ||
      (error.response?.data?.errors && JSON.stringify(error.response.data.errors)) ||
      'Gagal mencatat proses Candy'
    showError('Gagal', msg)
  }
}

onMounted(() => {
  fetchData()
})
</script>
