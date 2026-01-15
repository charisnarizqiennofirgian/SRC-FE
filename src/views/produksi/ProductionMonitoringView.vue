<template>
  <DashboardLayout>
    <div class="p-6">
      <div class="mb-6">
        <div class="flex items-center gap-2 mb-2">
          <router-link to="/" class="text-blue-600 hover:text-blue-800">Dashboard</router-link>
          <span class="text-gray-400">→</span>
          <span class="text-gray-600">Monitoring Produksi</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">Monitoring Progress Produksi</h1>
        <p class="text-gray-600 mt-1">Semua Sales Order aktif dan progress di setiap gudang</p>
      </div>

      <!-- FILTER -->
      <div class="bg-white shadow-md rounded-lg p-4 mb-6">
        <div class="flex gap-4 items-end flex-wrap">
          <div class="flex-1 min-w-[250px]">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Cari No. SO / Nama Buyer</label
            >
            <input
              type="text"
              v-model="search"
              @keyup.enter="fetchData"
              placeholder="Ketik nomor SO atau nama buyer..."
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            @click="fetchData"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Cari
          </button>
          <button
            @click="resetFilter"
            class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- LOADING -->
      <div v-if="isLoading" class="bg-white shadow-md rounded-lg p-12 text-center">
        <p class="text-gray-600">Memuat data...</p>
      </div>

      <!-- TABLE -->
      <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[1100px]">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-3 text-left text-gray-700 font-medium">No. SO</th>
                <th class="px-4 py-3 text-left text-gray-700 font-medium">Buyer</th>
                <th class="px-4 py-3 text-left text-gray-700 font-medium">Nama Barang</th>
                <th class="px-4 py-3 text-right text-gray-700 font-medium">Target</th>
                <th class="px-4 py-3 text-right text-gray-700 font-medium bg-blue-50">
                  Assembling
                </th>
                <th class="px-4 py-3 text-right text-gray-700 font-medium bg-yellow-50">Sanding</th>
                <th class="px-4 py-3 text-right text-gray-700 font-medium bg-orange-50">Rustik</th>
                <th class="px-4 py-3 text-right text-gray-700 font-medium bg-purple-50">
                  Finishing
                </th>
                <th class="px-4 py-3 text-right text-gray-700 font-medium bg-green-50">Packing</th>
                <th class="px-4 py-3 text-right text-gray-700 font-medium">Sisa</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="data.length === 0">
                <td colspan="10" class="px-4 py-8 text-center text-gray-500">
                  Tidak ada data Sales Order aktif.
                </td>
              </tr>
              <tr
                v-for="(row, index) in paginatedData"
                :key="index"
                class="border-t hover:bg-gray-50"
                :class="{ 'bg-green-50': row.is_done }"
              >
                <td class="px-4 py-3">
                  <span class="font-medium block">{{ row.so_number }}</span>
                  <span class="text-xs text-gray-500">{{ row.so_date }}</span>
                </td>
                <td class="px-4 py-3">{{ row.buyer_name }}</td>
                <td class="px-4 py-3">
                  <div class="font-medium">{{ row.item_name }}</div>
                  <div class="text-sm text-gray-500">{{ row.item_code }}</div>
                </td>
                <td class="px-4 py-3 text-right font-medium">{{ formatNumber(row.target) }}</td>
                <td class="px-4 py-3 text-right bg-blue-50">
                  <span
                    :class="row.qty_assembling > 0 ? 'text-blue-600 font-medium' : 'text-gray-400'"
                  >
                    {{ formatNumber(row.qty_assembling) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right bg-yellow-50">
                  <span
                    :class="row.qty_sanding > 0 ? 'text-yellow-600 font-medium' : 'text-gray-400'"
                  >
                    {{ formatNumber(row.qty_sanding) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right bg-orange-50">
                  <span
                    :class="row.qty_rustik > 0 ? 'text-orange-600 font-medium' : 'text-gray-400'"
                  >
                    {{ formatNumber(row.qty_rustik) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right bg-purple-50">
                  <span
                    :class="row.qty_finishing > 0 ? 'text-purple-600 font-medium' : 'text-gray-400'"
                  >
                    {{ formatNumber(row.qty_finishing) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right bg-green-50">
                  <span
                    :class="row.qty_packing > 0 ? 'text-green-600 font-medium' : 'text-gray-400'"
                  >
                    {{ formatNumber(row.qty_packing) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <span
                    v-if="row.is_done"
                    class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium"
                  >
                    DONE
                  </span>
                  <span v-else class="text-red-600 font-medium">
                    {{ formatNumber(row.sisa) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PAGINATION -->
        <div class="px-4 py-3 border-t bg-gray-50">
          <div class="flex justify-between items-center flex-wrap gap-4">
            <div class="text-sm text-gray-600">
              Menampilkan {{ paginationStart }} - {{ paginationEnd }} dari {{ data.length }} item
              ({{ uniqueSOCount }} SO)
              <span class="mx-2">|</span>
              <span class="text-green-600 font-medium">{{ doneCount }} selesai</span>,
              <span class="text-red-600 font-medium">{{ pendingCount }} pending</span>
            </div>
            <div class="flex gap-2 items-center">
              <button
                @click="currentPage = 1"
                :disabled="currentPage === 1"
                class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                First
              </button>
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Prev
              </button>
              <span class="px-3 py-1 text-sm"> {{ currentPage }} / {{ totalPages }} </span>
              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
              <button
                @click="currentPage = totalPages"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '../../components/DashboardLayout.vue'
import { ref, computed, onMounted } from 'vue'
import axios from '@/api/axios'

const data = ref([])
const isLoading = ref(false)
const search = ref('')
const currentPage = ref(1)
const perPage = 20

const fetchData = async () => {
  isLoading.value = true
  currentPage.value = 1

  try {
    const params = {}
    if (search.value) {
      params.search = search.value
    }
    // Tanpa limit untuk halaman full

    const response = await axios.get('/production-monitoring', { params })

    if (response.data.success) {
      data.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    isLoading.value = false
  }
}

const resetFilter = () => {
  search.value = ''
  fetchData()
}

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  const number = parseFloat(num)
  if (Number.isInteger(number)) {
    return number.toLocaleString('id-ID')
  }
  return number.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

// Pagination computed
const totalPages = computed(() => {
  return Math.ceil(data.value.length / perPage) || 1
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage
  const end = start + perPage
  return data.value.slice(start, end)
})

const paginationStart = computed(() => {
  if (data.value.length === 0) return 0
  return (currentPage.value - 1) * perPage + 1
})

const paginationEnd = computed(() => {
  const end = currentPage.value * perPage
  return end > data.value.length ? data.value.length : end
})

// Summary computed
const uniqueSOCount = computed(() => {
  const soIds = [...new Set(data.value.map((row) => row.so_id))]
  return soIds.length
})

const doneCount = computed(() => {
  return data.value.filter((row) => row.is_done).length
})

const pendingCount = computed(() => {
  return data.value.filter((row) => !row.is_done).length
})

onMounted(() => {
  fetchData()
})
</script>
