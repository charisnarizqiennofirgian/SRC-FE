import { ref, onMounted } from 'vue'
import axios from 'axios'

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
    loading.value = true
    try {
      const token = localStorage.getItem('token')

      // Pastikan axios instance sudah configured dengan base URL
      const response = await axios.get('http://localhost:8000/api/user-menu', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })

      if (response.data.success) {
        menuItems.value = response.data.menu_items

        // Auto-open semua menu groups by default
        menuItems.value.forEach((item) => {
          if (item.children) {
            openMenus.value[item.name] = true
          }
        })
      }
    } catch (err) {
      error.value = err.message
      console.error('Error fetching menu:', err)

      // Fallback: gunakan menu hardcoded kalau API gagal
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
      ]

      // Auto-open fallback menus
      menuItems.value.forEach((item) => {
        if (item.children) {
          openMenus.value[item.name] = true
        }
      })
    } finally {
      loading.value = false
    }
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
