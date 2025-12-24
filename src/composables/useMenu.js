import { ref, onMounted } from 'vue'

export function useMenu() {
  const menuItems = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Track dropdown open/close state
  const openMenus = ref({})

  const toggleMenu = (menuName) => {
    openMenus.value[menuName] = !openMenus.value[menuName]
  }

  const isMenuOpen = (menuName) => {
    return openMenus.value[menuName] || false
  }

  const fetchMenu = async () => {
    loading.value = false
    error.value = null

    // Gunakan menu statis sesuai dengan arsitektur project
    menuItems.value = [
      { name: 'Dashboard', route: '/dashboard', icon: '📊' },
      {
        name: 'Master Data',
        icon: '📋',
        children: [
          { name: 'Data Kategori Produk', route: '/admin/categories' },
          { name: 'Data Satuan', route: '/admin/units' },
          { name: 'Data Produk Jadi', route: '/admin/products' },
          { name: 'Data Bahan Baku', route: '/admin/materials' },
          { name: 'Data Supplier', route: '/admin/suppliers' },
          { name: 'Data Buyer', route: '/admin/buyers' },
        ],
      },
      {
        name: 'Manajemen Stok',
        icon: '📦',
        children: [
          { name: 'Laporan Stok Bahan Operasional', route: '/stock-report-operational' },
          { name: 'Laporan Stok Produk Jadi', route: '/stock-report-finished' },
          { name: 'Laporan Stok Kayu Logs', route: '/stock-report-logs' },
          { name: 'Laporan Stok Kayu RST', route: '/stock-report-rst' },
          { name: 'Laporan Karton Box', route: '/laporan/karton-box' },
          { name: 'Penyesuaian Stok', route: '/stock-adjustment' },
        ],
      },
      {
        name: 'Produksi',
        icon: '🏭',
        children: [
          { name: 'Produksi Sawmill', route: '/admin/produksi/sawmill' },
          { name: 'Produksi Candy', route: '/admin/produksi/candy' },
          { name: 'Produksi Pembahanan', route: '/admin/produksi/pembahanan' },
          { name: 'Master BOM', route: '/admin/produksi/bom' },
        ],
      },
    ]

    // Auto-open semua menu groups
    menuItems.value.forEach((item) => {
      if (item.children) {
        openMenus.value[item.name] = true
      }
    })
  }

  onMounted(() => {
    fetchMenu()
  })

  return {
    menuItems,
    loading,
    error,
    toggleMenu,
    isMenuOpen,
  }
}
