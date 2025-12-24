<template>
  <DashboardLayout>
    <div class="p-4 space-y-4">
      <h1 class="text-xl font-bold">Daftar Resep Produksi (BOM)</h1>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Tombol download template -->
        <button class="px-4 py-2 bg-green-600 text-white rounded" @click="downloadTemplate">
          Download Template Excel
        </button>

        <!-- Tombol buka modal import -->
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="showImportModal = true">
          IMPORT EXCEL BOM
        </button>
      </div>

      <!-- Modal import -->
      <div
        v-if="showImportModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white p-4 rounded w-full max-w-md space-y-3">
          <h2 class="font-semibold text-lg">Import BOM dari Excel</h2>

          <!-- Info template -->
          <p class="text-xs text-gray-600">
            Gunakan file sesuai template yang bisa diunduh dari tombol
            <span class="font-semibold">"Download Template Excel"</span> di atas.
          </p>

          <input type="file" @change="onFileChange" accept=".xlsx,.xls,.csv" />

          <div class="flex justify-end gap-2 mt-2">
            <button
              class="px-3 py-1 bg-gray-400 text-white rounded"
              @click="showImportModal = false"
            >
              Batal
            </button>
            <button
              class="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
              :disabled="!file || importing"
              @click="importBom"
            >
              {{ importing ? 'Mengimpor...' : 'Upload' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tabel produk yang sudah punya BOM -->
      <table class="min-w-full border text-sm mt-4">
        <thead class="bg-gray-100">
          <tr>
            <th class="border px-2 py-1">Produk</th>
            <th class="border px-2 py-1">Jumlah Komponen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in itemsWithBom" :key="row.item_id">
            <td class="border px-2 py-1">{{ row.item_name }}</td>
            <td class="border px-2 py-1 text-center">
              {{ row.components_count }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from '@/components/DashboardLayout.vue'
import apiClient from '@/api/axios'

export default {
  name: 'BomIndex',
  components: { DashboardLayout },
  data() {
    return {
      itemsWithBom: [],
      showImportModal: false,
      file: null,
      importing: false,
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      const res = await apiClient.get('/production/bom')
      this.itemsWithBom = res.data.data || []
    },
    onFileChange(e) {
      this.file = e.target.files[0] || null
    },
    async importBom() {
      if (!this.file) return
      this.importing = true
      const formData = new FormData()
      formData.append('file', this.file)

      try {
        await apiClient.post('/production/bom/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        alert('Sukses import BOM!')
        this.showImportModal = false
        this.file = null
        await this.loadData()
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal import BOM')
      } finally {
        this.importing = false
      }
    },
    async downloadTemplate() {
      try {
        // Sama pola dengan downloadTemplateBom di StockAdjustmentView
        const response = await apiClient.get('/stock-adjustments/template-bom', {
          responseType: 'blob',
        })

        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url

        let fileName = 'template_bom_produk.xlsx'
        const contentDisposition = response.headers['content-disposition']

        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
          if (fileNameMatch && fileNameMatch.length === 2) {
            fileName = fileNameMatch[1]
          }
        }

        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error downloading template BOM:', error)
        alert('Gagal mendownload template BOM.')
      }
    },
  },
}
</script>
