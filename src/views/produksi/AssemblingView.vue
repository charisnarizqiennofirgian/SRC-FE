<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Proses Assembling (Perakitan)</h1>

    <!-- BAGIAN A: PILIH KERJAAN -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Pilih Production Order</h2>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Nomor PO / SPK</label>
        <select v-model="selectedPO" @change="onPOChange" class="w-full border rounded px-3 py-2">
          <option value="">-- Pilih PO --</option>
          <option v-for="po in availableOrders" :key="po.id" :value="po">
            {{ po.po_number }}
          </option>
        </select>
      </div>

      <!-- Info PO -->
      <div v-if="selectedPO && selectedItem" class="bg-blue-50 p-4 rounded">
        <p><strong>Produk:</strong> {{ selectedItem.item_name }}</p>
        <p><strong>Target PO:</strong> {{ selectedItem.qty_planned }} Pcs</p>
        <p><strong>Sudah Jadi:</strong> {{ selectedItem.qty_produced }} Pcs</p>
        <p><strong>Kurang:</strong> {{ selectedItem.qty_remaining }} Pcs</p>
      </div>
    </div>

    <!-- BAGIAN B: INTIP GUDANG (VALIDASI OTOMATIS) -->
    <div v-if="selectedItem" class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Kecukupan Bahan</h2>

      <div v-if="loadingMaterials" class="text-center py-4">
        <p>Mengecek stok komponen...</p>
      </div>

      <div v-else-if="materials.components && materials.components.length > 0">
        <table class="w-full border">
          <thead class="bg-gray-100">
            <tr>
              <th class="border px-4 py-2">Komponen</th>
              <th class="border px-4 py-2">Butuh (per pcs)</th>
              <th class="border px-4 py-2">Stok Tersedia</th>
              <th class="border px-4 py-2">Cukup Untuk</th>
              <th class="border px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="comp in materials.components" :key="comp.component_id">
              <td class="border px-4 py-2">{{ comp.component_name }}</td>
              <td class="border px-4 py-2 text-center">{{ comp.qty_needed_per_unit }}</td>
              <td class="border px-4 py-2 text-center">{{ comp.stock_available }}</td>
              <td class="border px-4 py-2 text-center">{{ comp.can_produce }} Pcs</td>
              <td class="border px-4 py-2 text-center">
                <span
                  :class="comp.is_sufficient ? 'text-green-600' : 'text-red-600'"
                  class="font-semibold"
                >
                  {{ comp.is_sufficient ? '✓ Cukup' : '⚠ Kurang' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500">
          <p class="text-lg font-bold">
            Maksimal yang bisa dirakit saat ini:
            <span class="text-2xl text-blue-600">{{ materials.max_can_produce }}</span> PCS
          </p>
        </div>
      </div>

      <div v-else class="text-center py-4 text-gray-500">
        <p>Tidak ada data BOM untuk produk ini.</p>
      </div>
    </div>

    <!-- BAGIAN C: FORM LAPORAN (INPUT USER) -->
    <div
      v-if="selectedItem && materials.max_can_produce > 0"
      class="bg-white rounded-lg shadow p-6"
    >
      <h2 class="text-lg font-semibold mb-4">Laporan Hasil Rakit</h2>

      <form @submit.prevent="submitAssembling">
        <!-- Input Hasil Bagus -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">
            Hasil Bagus (Masuk ke White Body) <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="form.qty_good"
            type="number"
            min="1"
            :max="materials.max_can_produce"
            class="w-full border rounded px-3 py-2"
            placeholder="Jumlah pcs yang berhasil dirakit"
            required
          />
          <p class="text-sm text-gray-500 mt-1">Max: {{ materials.max_can_produce }} pcs</p>
        </div>

        <!-- Input Komponen Rusak -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Komponen Rusak/Patah (Opsional)</label>

          <div
            v-for="(reject, index) in form.rejected_components"
            :key="index"
            class="flex gap-2 mb-2"
          >
            <select v-model="reject.item_id" class="flex-1 border rounded px-3 py-2">
              <option value="">-- Pilih Komponen --</option>
              <option
                v-for="comp in materials.components"
                :key="comp.component_id"
                :value="comp.component_id"
              >
                {{ comp.component_name }}
              </option>
            </select>

            <input
              v-model.number="reject.qty"
              type="number"
              min="1"
              placeholder="Qty"
              class="w-24 border rounded px-3 py-2"
            />

            <button
              type="button"
              @click="removeReject(index)"
              class="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Hapus
            </button>
          </div>

          <button
            type="button"
            @click="addReject"
            class="mt-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            + Tambah Komponen Rusak
          </button>
        </div>

        <!-- Tombol Submit -->
        <div class="flex gap-2">
          <button
            type="submit"
            :disabled="submitting"
            class="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {{ submitting ? 'Menyimpan...' : '💾 SIMPAN HASIL RAKIT' }}
          </button>

          <button
            type="button"
            @click="resetForm"
            class="px-6 py-3 bg-gray-300 rounded hover:bg-gray-400"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import apiClient from '@/api/axios.js'

export default {
  name: 'AssemblingView',

  data() {
    return {
      availableOrders: [],
      selectedPO: null,
      selectedItem: null,
      materials: {},
      loadingMaterials: false,
      submitting: false,
      form: {
        qty_good: null,
        rejected_components: [],
      },
    }
  },

  mounted() {
    console.log('🚀 AssemblingView mounted, fetching orders...')
    this.fetchAvailableOrders()
  },

  methods: {
    async fetchAvailableOrders() {
      console.log('📡 Calling API: /assembling/orders')
      try {
        const response = await apiClient.get('/assembling/orders')
        console.log('✅ API Response:', response.data)

        this.availableOrders = response.data

        console.log('📦 availableOrders:', this.availableOrders)

        if (!this.availableOrders || this.availableOrders.length === 0) {
          console.warn('⚠️ No orders found!')
          alert('Tidak ada Production Order yang tersedia.')
        }
      } catch (error) {
        console.error('❌ Error fetching orders:', error)
        console.error('Error details:', error.response)
        alert('Gagal mengambil data PO: ' + (error.response?.data?.message || error.message))
      }
    },

    onPOChange() {
      console.log('🔄 PO Changed:', this.selectedPO)

      if (this.selectedPO && this.selectedPO.details && this.selectedPO.details.length > 0) {
        this.selectedItem = {
          detail_id: this.selectedPO.details[0].id,
          item_id: this.selectedPO.details[0].item_id,
          item_name: this.selectedPO.details[0].item?.name || 'Unknown',
          qty_planned: this.selectedPO.details[0].qty_planned,
          qty_produced: this.selectedPO.details[0].qty_produced,
          qty_remaining:
            this.selectedPO.details[0].qty_planned - this.selectedPO.details[0].qty_produced,
        }

        console.log('📋 Selected Item:', this.selectedItem)
        this.checkMaterials()
      } else {
        this.selectedItem = null
        this.materials = {}
      }
    },

    async checkMaterials() {
      if (!this.selectedItem) return

      this.loadingMaterials = true
      console.log('🔍 Checking materials for:', this.selectedItem)
      try {
        const response = await apiClient.post('/assembling/check-material', {
          detail_id: this.selectedItem.detail_id,
        })
        this.materials = response.data
        console.log('📊 Materials:', this.materials)
      } catch (error) {
        console.error('Error checking materials:', error)
        alert('Gagal mengecek stok komponen')
      } finally {
        this.loadingMaterials = false
      }
    },

    addReject() {
      this.form.rejected_components.push({
        item_id: '',
        qty: 1,
      })
    },

    removeReject(index) {
      this.form.rejected_components.splice(index, 1)
    },

    async submitAssembling() {
      if (!this.form.qty_good) {
        alert('Masukkan jumlah hasil rakit!')
        return
      }

      if (this.form.qty_good > this.materials.max_can_produce) {
        alert(`Maksimal hanya bisa rakit ${this.materials.max_can_produce} pcs!`)
        return
      }

      const validRejects = this.form.rejected_components.filter((r) => r.item_id && r.qty > 0)

      this.submitting = true
      try {
        const response = await apiClient.post('/assembling/store', {
          production_order_detail_id: this.selectedItem.detail_id,
          qty_good: this.form.qty_good,
          rejected_components: validRejects,
        })

        alert(response.data.message + '\nProses selanjutnya: ' + response.data.next_process)

        this.resetForm()
        this.fetchAvailableOrders()
        this.checkMaterials()
      } catch (error) {
        console.error('Error submitting:', error)
        alert('Gagal menyimpan: ' + (error.response?.data?.error || 'Unknown error'))
      } finally {
        this.submitting = false
      }
    },

    resetForm() {
      this.form.qty_good = null
      this.form.rejected_components = []
    },
  },
}
</script>

<style scoped>
/* Add custom styles if needed */
</style>
