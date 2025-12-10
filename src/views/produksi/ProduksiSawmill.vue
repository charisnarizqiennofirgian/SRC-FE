<template>
  <DashboardLayout>
    <div class="page-header">
      <h1>Produksi Sawmill (Log → RST Basah)</h1>
      <p>Catat proses pemotongan kayu log menjadi kayu RST basah.</p>
    </div>

    <div class="content-card">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-row">
            <div class="form-group">
              <label>Tanggal</label>
              <input v-model="form.date" type="date" class="form-control" required />
            </div>
            <div class="form-group">
              <label>Catatan (opsional)</label>
              <input
                v-model="form.notes"
                type="text"
                class="form-control"
                placeholder="Contoh: Sawmill shift pagi"
              />
            </div>
          </div>

          <div class="form-section">
            <h3>Bahan Baku (Kayu Log)</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Item Log</label>
                <select v-model="form.input_item_id" class="form-control" required>
                  <option value="">Pilih Kayu Log...</option>
                  <option v-for="item in logItems" :key="item.id" :value="item.id">
                    {{ item.code }} - {{ item.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Qty Log (m³)</label>
                <input
                  v-model.number="form.input_quantity"
                  type="number"
                  min="0"
                  step="0.0001"
                  class="form-control"
                  required
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Hasil Produksi (Kayu RST Basah)</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Item RST Basah</label>
                <select v-model="form.output_item_id" class="form-control" required>
                  <option value="">Pilih Kayu RST Basah...</option>
                  <option v-for="item in rstItems" :key="item.id" :value="item.id">
                    {{ item.code }} - {{ item.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Qty RST (m³)</label>
                <input
                  v-model.number="form.output_quantity"
                  type="number"
                  min="0"
                  step="0.0001"
                  class="form-control"
                  required
                />
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="button"
              class="btn btn-cancel"
              @click="router.push({ name: 'admin-dashboard' })"
            >
              Batal
            </button>
            <button type="submit" class="btn btn-submit">Simpan Produksi Sawmill</button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useNotification } from '../../composables/useNotification.js'

const router = useRouter()
const { showSuccess, showError } = useNotification()

const form = reactive({
  date: new Date().toISOString().slice(0, 10),
  input_item_id: '',
  input_quantity: null,
  output_item_id: '',
  output_quantity: null,
  notes: '',
})

const logItems = ref([])
const rstItems = ref([])

const fetchItems = async () => {
  try {
    // kamu nanti bisa filter di backend pakai category_name=Kayu Log / Kayu RST
    const [logsRes, rstRes] = await Promise.all([
      apiClient.get('/materials', { params: { category_name: 'Kayu Log', per_page: 100 } }),
      apiClient.get('/materials', { params: { category_name: 'Kayu RST', per_page: 100 } }),
    ])

    logItems.value = logsRes.data.data.data || logsRes.data.data
    rstItems.value = rstRes.data.data.data || rstRes.data.data
  } catch (error) {
    console.error(error)
    showError('Gagal', 'Gagal mengambil daftar kayu Log / RST')
  }
}

const handleSubmit = async () => {
  try {
    if (!form.input_item_id || !form.output_item_id) {
      showError('Validasi', 'Item input dan output wajib dipilih')
      return
    }

    const payload = {
      stage: 'SAWMILL',
      process_type: 'SAWMILL',
      date: form.date,
      input_item_id: form.input_item_id,
      input_quantity: form.input_quantity,
      output_item_id: form.output_item_id,
      output_quantity: form.output_quantity,
      notes: form.notes || null,
    }

    await apiClient.post('/productions/transformation', payload)
    showSuccess('Sukses', 'Produksi Sawmill berhasil dicatat')
    router.push({ name: 'StockReportLogs' }) // nanti kamu bisa ubah redirectnya
  } catch (error) {
    console.error(error)
    showError('Gagal', error.response?.data?.message || 'Gagal mencatat produksi Sawmill')
  }
}

onMounted(() => {
  fetchItems()
})
</script>
