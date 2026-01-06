<template>
  <DashboardLayout>
    <div class="p-6 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Produksi Mesin (Input Manual)</h1>

      <!-- BAGIAN ATAS: PILIH PO -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <label class="block text-sm font-medium mb-2">Pilih Production Order / SPK</label>
        <select v-model="selectedPoId" @change="onPoChange" class="w-full border rounded px-3 py-2">
          <option value="">-- Pilih PO --</option>
          <option v-for="po in poList" :key="po.id" :value="po.id">
            {{ po.po_number }}
          </option>
        </select>
      </div>

      <!-- FORM INPUT (Muncul setelah PO dipilih) -->
      <div v-if="selectedPoId" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- BAGIAN KIRI: BAHAN BAKU -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold mb-4 text-blue-600">
            🪵 BAHAN BAKU (Kayu yang Diambil)
          </h2>

          <!-- List Bahan Baku yang sudah ditambahkan -->
          <div v-if="form.materials.length > 0" class="space-y-3 mb-4">
            <div
              v-for="(material, index) in form.materials"
              :key="index"
              class="border rounded p-3 bg-gray-50"
            >
              <div class="flex justify-between items-start mb-2">
                <span class="font-medium">{{ material.name }}</span>
                <button
                  @click="removeMaterial(index)"
                  class="text-red-600 hover:text-red-800 text-sm"
                >
                  ✕ Hapus
                </button>
              </div>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="material.qty"
                  type="number"
                  step="0.001"
                  min="0.001"
                  class="border rounded px-2 py-1 w-32"
                  placeholder="Qty"
                />
                <span class="text-sm text-gray-600">{{ material.unit }}</span>
              </div>
            </div>
          </div>

          <!-- Search Box untuk Tambah Kayu -->
          <div class="space-y-2">
            <label class="block text-sm font-medium">Cari Kayu RST:</label>
            <input
              v-model="searchKayu"
              type="text"
              class="w-full border rounded px-3 py-2"
              placeholder="Ketik nama kayu..."
              @input="onSearchKayu"
            />

            <!-- Dropdown hasil pencarian -->
            <div
              v-if="searchKayuResults.length > 0"
              class="border rounded max-h-48 overflow-y-auto bg-white"
            >
              <div
                v-for="kayu in searchKayuResults"
                :key="kayu.id"
                @click="addMaterial(kayu)"
                class="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b"
              >
                <div class="font-medium">{{ kayu.name }}</div>
                <div class="text-sm text-gray-600">
                  Stok: {{ formatNumber(kayu.stock_qty) }} {{ kayu.unit }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- BAGIAN KANAN: HASIL PRODUKSI -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold mb-4 text-green-600">
            ✅ HASIL PRODUKSI (Komponen yang Jadi)
          </h2>

          <!-- List Komponen yang sudah ditambahkan -->
          <div v-if="form.components.length > 0" class="space-y-3 mb-4">
            <div
              v-for="(component, index) in form.components"
              :key="index"
              class="border rounded p-3 bg-gray-50"
            >
              <div class="flex justify-between items-start mb-2">
                <span class="font-medium">{{ component.name }}</span>
                <button
                  @click="removeComponent(index)"
                  class="text-red-600 hover:text-red-800 text-sm"
                >
                  ✕ Hapus
                </button>
              </div>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="component.qty"
                  type="number"
                  min="0.001"
                  class="border rounded px-2 py-1 w-32"
                  placeholder="Qty"
                />
                <span class="text-sm text-gray-600">Pcs</span>
              </div>
            </div>
          </div>

          <!-- Search Box untuk Tambah Komponen -->
          <div class="space-y-2">
            <label class="block text-sm font-medium">Cari Komponen:</label>
            <input
              v-model="searchKomponen"
              type="text"
              class="w-full border rounded px-3 py-2"
              placeholder="Ketik nama komponen..."
              @input="onSearchKomponen"
            />

            <!-- Dropdown hasil pencarian -->
            <div
              v-if="searchKomponenResults.length > 0"
              class="border rounded max-h-48 overflow-y-auto bg-white"
            >
              <div
                v-for="komponen in searchKomponenResults"
                :key="komponen.id"
                @click="addComponent(komponen)"
                class="px-3 py-2 hover:bg-green-50 cursor-pointer border-b"
              >
                <div class="font-medium">{{ komponen.name }}</div>
                <div class="text-sm text-gray-600">{{ komponen.code || '-' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TOMBOL SIMPAN -->
      <div v-if="selectedPoId" class="mt-6 flex justify-end">
        <button
          @click="handleSubmit"
          :disabled="!canSubmit || submitting"
          class="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
        >
          <span v-if="submitting">⏳ Menyimpan...</span>
          <span v-else>💾 SIMPAN PRODUKSI</span>
        </button>
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
      submitting: false,

      // Form data
      form: {
        materials: [], // [{ id, name, unit, qty }]
        components: [], // [{ id, name, qty }]
      },

      // Search
      searchKayu: '',
      searchKayuResults: [],
      allKayu: [],

      searchKomponen: '',
      searchKomponenResults: [],
      allKomponen: [],
    }
  },

  computed: {
    canSubmit() {
      return (
        this.selectedPoId &&
        this.form.materials.length > 0 &&
        this.form.components.length > 0 &&
        this.form.materials.every((m) => m.qty > 0) &&
        this.form.components.every((c) => c.qty > 0)
      )
    },
  },

  mounted() {
    this.loadPoList()
    this.loadAllKayu()
    this.loadAllKomponen()
  },

  methods: {
    formatNumber(value) {
      const num = Number(value ?? 0)
      if (Number.isNaN(num)) return value
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
      })
    },

    async loadPoList() {
      try {
        const res = await apiClient.get('/production-orders', {
          params: { status_not: 'completed' },
        })
        this.poList = res.data.data?.data || res.data.data || []
      } catch (error) {
        console.error('Error loading PO:', error)
        alert('Gagal memuat daftar PO')
      }
    },

    async loadAllKayu() {
      try {
        const res = await apiClient.get('/inventories', {
          params: {
            per_page: 9999,
          },
        })

        const inventories = res.data.data?.data || res.data.data || []

        // Group by item_id dan sum qty nya
        const itemMap = {}
        inventories.forEach((inv) => {
          const itemId = inv.item_id
          if (!itemMap[itemId]) {
            itemMap[itemId] = {
              id: itemId,
              name: inv.item?.name || 'Unknown',
              code: inv.item?.code,
              unit: inv.item?.unit?.name || 'Pcs',
              stock_qty: 0, // PASTIKAN INI NUMBER
            }
          }
          // Tambahkan qty, pastikan dalam bentuk number
          itemMap[itemId].stock_qty += Number(inv.qty || 0)
        })

        this.allKayu = Object.values(itemMap)

        console.log('📦 Loaded Kayu (All Warehouses):', this.allKayu)
      } catch (error) {
        console.error('Error loading kayu:', error)
        alert('Gagal memuat data kayu: ' + (error.response?.data?.message || error.message))
      }
    },

    async loadAllKomponen() {
      try {
        const res = await apiClient.get('/inventories', {
          params: {
            per_page: 9999,
          },
        })

        const inventories = res.data.data?.data || res.data.data || []

        // Group by item_id dan sum qty nya
        const itemMap = {}
        inventories.forEach((inv) => {
          const itemId = inv.item_id
          if (!itemMap[itemId]) {
            itemMap[itemId] = {
              id: itemId,
              name: inv.item?.name || 'Unknown',
              code: inv.item?.code,
              stock_qty: 0, // PASTIKAN INI NUMBER
            }
          }
          // Tambahkan qty, pastikan dalam bentuk number
          itemMap[itemId].stock_qty += Number(inv.qty || 0)
        })

        this.allKomponen = Object.values(itemMap)

        console.log('📦 Loaded Komponen (All Warehouses):', this.allKomponen)
      } catch (error) {
        console.error('Error loading komponen:', error)
        alert('Gagal memuat data komponen: ' + (error.response?.data?.message || error.message))
      }
    },

    onPoChange() {
      // Reset form saat ganti PO
      this.form.materials = []
      this.form.components = []
      this.searchKayu = ''
      this.searchKomponen = ''
      this.searchKayuResults = []
      this.searchKomponenResults = []
    },

    onSearchKayu() {
      if (!this.searchKayu || this.searchKayu.length < 2) {
        this.searchKayuResults = []
        return
      }

      const search = this.searchKayu.toLowerCase()
      this.searchKayuResults = this.allKayu
        .filter((k) => k.name.toLowerCase().includes(search))
        .slice(0, 10)
    },

    onSearchKomponen() {
      if (!this.searchKomponen || this.searchKomponen.length < 2) {
        this.searchKomponenResults = []
        return
      }

      const search = this.searchKomponen.toLowerCase()
      this.searchKomponenResults = this.allKomponen
        .filter((k) => k.name.toLowerCase().includes(search))
        .slice(0, 10)
    },

    addMaterial(kayu) {
      // Cek apakah sudah ditambahkan
      const exists = this.form.materials.find((m) => m.id === kayu.id)
      if (exists) {
        alert('Kayu ini sudah ditambahkan!')
        return
      }

      this.form.materials.push({
        id: kayu.id,
        name: kayu.name,
        unit: kayu.unit,
        qty: 0,
      })

      // Reset search
      this.searchKayu = ''
      this.searchKayuResults = []
    },

    removeMaterial(index) {
      this.form.materials.splice(index, 1)
    },

    addComponent(komponen) {
      // Cek apakah sudah ditambahkan
      const exists = this.form.components.find((c) => c.id === komponen.id)
      if (exists) {
        alert('Komponen ini sudah ditambahkan!')
        return
      }

      this.form.components.push({
        id: komponen.id,
        name: komponen.name,
        qty: 0,
      })

      // Reset search
      this.searchKomponen = ''
      this.searchKomponenResults = []
    },

    removeComponent(index) {
      this.form.components.splice(index, 1)
    },

    async handleSubmit() {
      if (!this.canSubmit) return

      const payload = {
        production_order_id: Number(this.selectedPoId),
        materials: this.form.materials.map((m) => ({
          item_id: m.id,
          qty: Number(m.qty),
        })),
        components: this.form.components.map((c) => ({
          item_id: c.id,
          qty: Number(c.qty),
        })),
      }

      this.submitting = true
      try {
        await apiClient.post('/operator-mesin/produce', payload)

        alert('✅ Produksi mesin berhasil disimpan!')

        // Reset form
        this.form.materials = []
        this.form.components = []
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

<style scoped>
/* Tambahan style jika perlu */
</style>
