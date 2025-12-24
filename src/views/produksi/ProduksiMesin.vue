<template>
  <DashboardLayout>
    <div class="p-4 space-y-4">
      <!-- HEADER -->
      <div class="flex items-center gap-3">
        <label class="font-semibold">Pilih Production Order</label>
        <select v-model="selectedPoId" @change="onPoChange" class="border px-2 py-1 rounded">
          <option value="">-- Pilih PO --</option>
          <option v-for="po in poList" :key="po.id" :value="po.id">
            {{ po.po_number }}
          </option>
        </select>
      </div>

      <!-- 🟠 PM TAHAP 3: POPUP SETUP DADAKAN -->
      <div
        v-if="showSetupModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white p-6 rounded-lg max-w-md w-full mx-4">
          <h3 class="text-lg font-bold mb-4">Setting Bahan Baku</h3>
          <div class="space-y-3">
            <p><strong>Komponen:</strong> {{ setupComponent?.component_name }}</p>

            <label>Pilih Kayu Moulding:</label>
            <select v-model="setupForm.material_item_id" class="border w-full px-2 py-1 rounded">
              <option value="">-- Pilih Kayu --</option>
              <option v-for="kayu in mouldingMaterials" :key="kayu.id" :value="kayu.id">
                {{ kayu.name }} (Stok: {{ kayu.stock_qty }})
              </option>
            </select>

            <label>Qty per Unit (m³/pcs):</label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              v-model.number="setupForm.qty_per_unit"
              class="border w-full px-2 py-1 rounded"
              placeholder="0.200"
            />
          </div>

          <div class="flex gap-2 mt-6">
            <button @click="saveRecipe" class="flex-1 bg-green-600 text-white py-2 px-4 rounded">
              Simpan Resep
            </button>
            <button
              @click="showSetupModal = false"
              class="flex-1 bg-gray-500 text-white py-2 px-4 rounded"
            >
              Batal
            </button>
          </div>
        </div>
      </div>

      <!-- TABEL KOMPONEN (PM TAHAP 4) -->
      <div v-if="selectedPoId">
        <table class="min-w-full border text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="border px-2 py-1">Komponen</th>
              <th class="border px-2 py-1">Target</th>
              <th class="border px-2 py-1">Kayu</th>
              <th class="border px-2 py-1">Saran Kayu</th>
              <th class="border px-2 py-1">Sudah Jadi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in components" :key="row.component_item_id">
              <!-- KOMPONEN + STATUS RESEP -->
              <td class="border px-2 py-1">
                {{ row.component_name }}
                <span v-if="!row.HAS_RECIPE" class="text-red-600 text-xs ml-2"
                  >(Resep Belum Ada)</span
                >
              </td>

              <!-- TARGET -->
              <td class="border px-2 py-1 font-semibold">{{ row.target_qty }}</td>

              <!-- KAYU (PM TAHAP 4) -->
              <td class="border px-2 py-1">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  :class="['border px-1 py-0.5 w-24', row.HAS_RECIPE ? '' : 'bg-red-100']"
                  v-model.number="row.material_used_qty"
                  :placeholder="row.HAS_RECIPE ? row.estimated_material_qty : 'Setup dulu'"
                  @click="!row.HAS_RECIPE && openSetup(row)"
                />
              </td>

              <!-- SARAN RESEP -->
              <td class="border px-2 py-1 text-xs bg-blue-50 p-1">
                {{ row.material_name || 'Belum ada' }}<br />
                <span v-if="row.material_qty_per_unit">
                  {{ row.material_qty_per_unit }} × {{ row.target_qty }} =
                  {{ row.estimated_material_qty }}
                </span>
              </td>

              <!-- SUDAH JADI -->
              <td class="border px-2 py-1">
                <input
                  type="number"
                  min="0"
                  class="border px-1 py-0.5 w-24"
                  v-model.number="row.produced_qty"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <!-- AKSI (PM TAHAP 5) -->
        <div class="flex justify-end mt-4">
          <button
            class="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            :disabled="!canSubmit || submitting"
            @click="handleSubmit"
          >
            <span v-if="submitting">Menyimpan...</span>
            <span v-else>Simpan Produksi Mesin</span>
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from '@/components/DashboardLayout.vue'
import apiClient from '@/api/axios'

export default {
  name: 'ProduksiMesin',
  components: { DashboardLayout },
  data() {
    return {
      poList: [],
      selectedPoId: '',
      components: [],
      submitting: false,
      showSetupModal: false,
      setupComponent: null,
      setupForm: {
        material_item_id: null,
        qty_per_unit: null,
      },
      mouldingMaterials: [],
    }
  },
  computed: {
    canSubmit() {
      return (
        this.selectedPoId &&
        this.components.some((r) => Number(r.produced_qty) > 0) &&
        this.components.every((r) => Number(r.material_used_qty) >= 0)
      )
    },
  },
  mounted() {
    this.loadPoList()
    this.loadMouldingMaterials()
  },
  methods: {
    async loadPoList() {
      const res = await apiClient.get('/production-orders', {
        params: { status_not: 'completed' },
      })
      const poData = res.data.data?.data || res.data.data || []
      this.poList = poData
    },

    async loadMouldingMaterials() {
      // Load kayu dari Gudang Moulding (warehouse_id = 5)
      // StockReportController mewajibkan query "categories"
      const res = await apiClient.get('/stock-report', {
        params: {
          warehouse_id: 5,
          categories: 'Kayu RST', // nama kategori persis seperti di tabel categories.name
          per_page: 9999,
        },
      })

      const payload = res.data.data
      // response paginated → data.data
      this.mouldingMaterials = payload?.data || payload || []
    },

    onPoChange(event) {
      this.selectedPoId = event.target.value
      if (this.selectedPoId) {
        this.loadComponents()
      }
    },

    async loadComponents() {
      if (!this.selectedPoId) return
      const res = await apiClient.get(`/operator-mesin/po/${this.selectedPoId}`)
      const rows = res.data.data || []
      this.components = rows.map((r) => ({
        ...r,
        produced_qty: r.produced_qty ?? 0,
        material_used_qty: r.estimated_material_qty ?? 0,
      }))
    },

    // BUKA SETUP
    openSetup(component) {
      this.setupComponent = component
      this.setupForm = {
        material_item_id: component.material_item_id || null,
        qty_per_unit: component.material_qty_per_unit || null,
      }
      this.showSetupModal = true
    },

    // SIMPAN RESEP
    async saveRecipe() {
      if (!this.setupForm.material_item_id || !this.setupForm.qty_per_unit) {
        alert('Pilih kayu dan isi qty per unit!')
        return
      }

      try {
        await apiClient.post('/operator-mesin/recipe', {
          component_item_id: this.setupComponent.component_item_id,
          material_item_id: Number(this.setupForm.material_item_id),
          qty_per_unit: Number(this.setupForm.qty_per_unit),
        })

        this.showSetupModal = false
        await this.loadComponents() // refresh data
        alert('Resep berhasil disimpan!')
      } catch (error) {
        alert('Gagal simpan resep: ' + (error.response?.data?.message || error.message))
      }
    },

    async handleSubmit() {
      if (!this.canSubmit) return

      const payload = {
        production_order_id: Number(this.selectedPoId),
        components: this.components
          .filter((r) => Number(r.produced_qty) > 0)
          .map((r) => ({
            item_id: r.component_item_id,
            produced_qty: Number(r.produced_qty),
            material_used_qty: Number(r.material_used_qty),
          })),
      }

      if (!payload.components.length) {
        alert('Isi dahulu kolom "Sudah Jadi".')
        return
      }

      this.submitting = true
      try {
        await apiClient.post('/operator-mesin/produce', payload)
        await this.loadComponents()
        alert('✅ Produksi mesin berhasil disimpan!')
      } catch (error) {
        console.error('Error:', error)
        alert('❌ ' + (error.response?.data?.message || 'Gagal menyimpan'))
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>
