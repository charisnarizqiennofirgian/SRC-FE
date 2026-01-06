<template>
  <div class="dashboard-wrapper">
    <div class="sidebar-overlay" :class="{ show: sidebarOpen }" @click="closeSidebar"></div>

    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="logo-section">
        <img src="@/assets/logo.jpeg" alt="Logo Surya Bangkit Cemerlang" class="logo-image" />
        <h2 class="logo-text">Surya Bangkit Cemerlang</h2>
      </div>

      <nav class="nav-menu">
        <template v-for="item in menuItems" :key="item.name">
          <router-link
            v-if="!item.children"
            :to="item.route"
            class="nav-item"
            active-class="active"
            @click="onNavItemClick"
          >
            <div class="nav-label">
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-text">{{ item.name }}</span>
            </div>
          </router-link>

          <!-- Dropdown Menu Item -->
          <div v-else class="nav-item-group">
            <div
              class="nav-item nav-item-parent"
              :class="{ open: isMenuOpen(item.name) }"
              @click="toggleMenu(item.name)"
            >
              <div class="nav-label">
                <span class="nav-icon">{{ item.icon }}</span>
                <span class="nav-text">{{ item.name }}</span>
              </div>
              <span class="dropdown-arrow" :class="{ rotated: isMenuOpen(item.name) }">▼</span>
            </div>

            <transition name="submenu-slide">
              <div v-if="isMenuOpen(item.name)" class="submenu">
                <router-link
                  v-for="child in item.children"
                  :key="child.route"
                  :to="child.route"
                  class="submenu-item"
                  active-class="active"
                  @click="onSubmenuItemClicked"
                >
                  {{ child.name }}
                </router-link>
              </div>
            </transition>
          </div>
        </template>
      </nav>
    </aside>

    <div class="main-content">
      <header class="top-header">
        <button class="sidebar-toggle" @click="toggleSidebar" :class="{ active: sidebarOpen }">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div class="header-left">
          <h3 class="breadcrumb">ERP Surya Bangkit Cemerlang</h3>
        </div>
        <div class="header-right">
          <button class="notification-btn" title="Notifikasi">
            <span class="bell-icon">🔔</span>
          </button>

          <span class="welcome-text">Selamat Datang, {{ userName }}</span>

          <div class="user-dropdown" @click="toggleUserMenu">
            <img
              :src="`https://ui-avatars.com/api/?name=${userName}&background=4caf50&color=fff`"
              alt="User"
              class="user-avatar"
            />

            <transition name="fade">
              <div v-if="userMenuOpen" class="user-menu">
                <div class="user-menu-item" @click.stop="logout"><span>🚪</span> Logout</div>
              </div>
            </transition>
          </div>
        </div>
      </header>

      <div class="content-area">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const userName = ref('User')
const userMenuOpen = ref(false)
const sidebarOpen = ref(false)

const menuItems = ref([
  { name: 'Dashboard', route: '/dashboard', icon: '📊' },
  {
    name: 'Master Data',
    icon: '📋',
    children: [
      { name: 'Data Kategori Produk', route: '/admin/categories' },
      { name: 'Data Satuan', route: '/admin/units' },
      { name: 'Data Master Barang', route: { name: 'MasterBarang' } },
      { name: 'Data Supplier', route: '/admin/suppliers' },
      { name: 'Data Buyer', route: '/admin/buyers' },
    ],
  },
  {
    name: 'Manajemen Stok',
    icon: '📦',
    children: [
      { name: 'Laporan Produksi Sawmill', route: '/reports/sawmill' },
      { name: 'Stock Index', route: { name: 'StockIndex' } },
      { name: 'Stock Adjustment', route: '/stock-adjustment' },
    ],
  },
  {
    name: 'Produksi',
    icon: '🏭',
    children: [
      { name: 'BOM', route: { name: 'BomIndex' } },
      { name: 'Produksi Sawmill', route: { name: 'ProduksiSawmill' } },
      { name: 'Produksi Candy', route: { name: 'ProduksiCandy' } },
      { name: 'Produksi Pembahanan', route: { name: 'ProduksiPembahanan' } },
      { name: 'Produksi Moulding', route: { name: 'ProduksiMoulding' } },
      { name: 'Produksi Mesin', route: { name: 'ProduksiMesin' } },
      { name: 'Assembling', route: { name: 'AssemblingView' } },
      { name: 'Master BOM / Resep', route: { name: 'MasterBom' } },
    ],
  },
  {
    name: 'Pembelian',
    icon: '🛒',
    children: [
      { name: 'Pembelian Operasional', route: { name: 'PembelianOperasional' } },
      { name: 'Pembelian Karton Box', route: { name: 'PembelianKarton' } },
      { name: 'Pembelian Kayu RST ', route: { name: 'PembelianKayu' } },
      { name: 'Faktur Pembelian', route: { name: 'DaftarFakturPembelian' } },
    ],
  },
  {
    name: 'Penjualan',
    icon: '💰',
    children: [
      { name: 'Pesanan Penjualan', route: { name: 'DaftarSalesOrder' } },
      { name: 'Daftar Pengiriman', route: { name: 'DaftarPengiriman' } },
    ],
  },
])

const openMenus = ref({})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const onNavItemClick = () => {
  if (window.innerWidth <= 768) {
    closeSidebar()
  }
}

const onSubmenuItemClicked = () => {
  if (window.innerWidth <= 768) {
    closeSidebar()
  }
}

// Fungsi untuk menutup semua menu kecuali yang ditentukan
const closeAllMenusExcept = (menuName) => {
  Object.keys(openMenus.value).forEach((key) => {
    if (key !== menuName) {
      openMenus.value[key] = false
    }
  })
}

const toggleMenu = (menuName) => {
  // Jika menu yang diklik sedang terbuka, tutup saja
  if (openMenus.value[menuName]) {
    openMenus.value[menuName] = false
  } else {
    // Jika tidak, tutup semua menu lain dan buka menu ini
    closeAllMenusExcept(menuName)
    openMenus.value[menuName] = true
  }
}

const isMenuOpen = (menuName) => {
  return openMenus.value[menuName] || false
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const logout = () => {
  if (confirm('Apakah Anda yakin ingin logout?')) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }
}

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      if (user && user.name) {
        userName.value = user.name
      }
    } catch (error) {
      console.error('Gagal parse data user dari localStorage:', error)
      logout()
    }
  }

  if (window.innerWidth > 768) {
    sidebarOpen.value = true
  }
})

watch(
  () => route.path,
  (newPath) => {
    console.log('Current route:', newPath)
  },
)
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard-wrapper {
  display: flex;
  height: 100vh;
  background: #f0f2f5;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  position: relative;
}

.sidebar-toggle {
  position: absolute;
  top: 14px;
  left: 18px;
  z-index: 1001;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4caf50, #45a049);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
}

.sidebar-toggle:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.sidebar-toggle span {
  display: block;
  width: 20px;
  height: 2px;
  background: #fff;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.sidebar-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.sidebar-toggle.active span:nth-child(2) {
  opacity: 0;
}

.sidebar-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

.sidebar-toggle:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.sidebar-toggle span {
  display: block;
  width: 20px;
  height: 2px;
  background: #fff;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.sidebar-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.sidebar-toggle.active span:nth-child(2) {
  opacity: 0;
}

.sidebar-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* ===== SIDEBAR OVERLAY (untuk mobile) ===== */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.sidebar-overlay.show {
  opacity: 1;
  visibility: visible;
}

/* ===== SIDEBAR ===== */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #fff 0%, #f8f9fa 100%);
  border-right: 1px solid #e0e4e8;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
  overflow-y: auto;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.08);
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.open {
  transform: translateX(0);
}

.logo-section {
  display: flex;
  align-items: center;
  padding: 24px 20px;
  gap: 14px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #4caf50, #45a049);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.15);
}

.logo-image {
  width: 44px;
  height: 44px;
  object-fit: contain;
  border-radius: 10px;
  background: #fff;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logo-text {
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* ===== NAVIGATION ===== */
.nav-menu {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item-group {
  display: flex;
  flex-direction: column;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 20px;
  text-decoration: none;
  color: #495057;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border-radius: 0;
  margin: 0;
  position: relative;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: #4caf50;
  transform: scaleY(0);
  transition: transform 0.2s ease;
}

.nav-item:hover {
  background: linear-gradient(90deg, #e8f5e9 0%, transparent 100%);
  color: #212529;
}

.nav-item:hover::before {
  transform: scaleY(1);
}

.nav-item.active {
  background: linear-gradient(135deg, #4caf50, #43a047);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

.nav-item.active::before {
  transform: scaleY(1);
}

.nav-item-parent {
  background: transparent;
}

.nav-item-parent.open {
  background: linear-gradient(135deg, #4caf50, #43a047);
  color: #fff;
}

.nav-item-parent:hover {
  background: linear-gradient(90deg, #e8f5e9 0%, transparent 100%);
}

.nav-item-parent.open:hover {
  background: linear-gradient(135deg, #43a047, #388e3c);
}

.nav-label {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
}

.nav-icon {
  font-size: 20px;
  width: 28px;
  min-width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-text {
  font-size: 14px;
  font-weight: 600;
}

.dropdown-arrow {
  font-size: 10px;
  transition: transform 0.3s ease;
  opacity: 0.7;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

/* ===== SUBMENU ===== */
.submenu {
  background: linear-gradient(90deg, #f8f9fa 0%, #fff 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-left: 2px solid #e9ecef;
  margin-left: 20px;
}

.submenu-item {
  padding: 12px 20px 12px 40px;
  text-decoration: none;
  color: #6c757d;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: block;
  border-left: 3px solid transparent;
  position: relative;
}

.submenu-item::before {
  content: '•';
  position: absolute;
  left: 24px;
  color: #adb5bd;
  font-size: 16px;
  transition: all 0.2s ease;
}

.submenu-item:hover {
  background: linear-gradient(90deg, #e8f5e9 0%, transparent 100%);
  color: #212529;
  border-left-color: #4caf50;
  padding-left: 42px;
}

.submenu-item:hover::before {
  color: #4caf50;
  transform: scale(1.3);
}

.submenu-item.active {
  background: linear-gradient(90deg, #e8f5e9 0%, #fff 100%);
  color: #4caf50;
  font-weight: 700;
  border-left-color: #4caf50;
  box-shadow: inset 0 0 8px rgba(76, 175, 80, 0.1);
}

.submenu-item.active::before {
  color: #4caf50;
  transform: scale(1.5);
}

/* ===== TRANSITIONS ===== */
.submenu-slide-enter-active,
.submenu-slide-leave-active {
  transition: all 0.3s ease;
  max-height: 600px;
}

.submenu-slide-enter-from,
.submenu-slide-leave-to {
  max-height: 0;
  opacity: 0;
}

/* ===== MAIN CONTENT ===== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 0;
  overflow: hidden;
  transition: margin-left 0.3s ease;
}

.top-header {
  background: linear-gradient(90deg, #fff 0%, #f8f9fa 100%);
  border-bottom: 1px solid #e9ecef;
  padding: 16px 28px;
  padding-left: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
}

.breadcrumb {
  font-size: 16px;
  color: #495057;
  font-weight: 700;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.notification-btn {
  background: linear-gradient(135deg, #fff, #f8f9fa);
  border: 1px solid #e9ecef;
  cursor: pointer;
  font-size: 20px;
  padding: 10px;
  display: flex;
  align-items: center;
  border-radius: 10px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.notification-btn:hover {
  background: linear-gradient(135deg, #4caf50, #45a049);
  border-color: #4caf50;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.notification-btn:hover .bell-icon {
  filter: brightness(0) invert(1);
}

.welcome-text {
  font-size: 14px;
  color: #6c757d;
  font-weight: 600;
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  border: 3px solid #e9ecef;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-avatar:hover {
  border-color: #4caf50;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.content-area {
  flex: 1;
  padding: 28px;
  overflow-y: auto;
  background: #f0f2f5;
}

/* ===== USER DROPDOWN ===== */
.user-dropdown {
  position: relative;
}

.user-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  min-width: 180px;
  z-index: 1000;
  overflow: hidden;
}

.user-menu-item {
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #495057;
  font-weight: 600;
}

.user-menu-item:hover {
  background: linear-gradient(90deg, #fee, #fff);
  color: #dc3545;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ===== SCROLLBAR ===== */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: #f8f9fa;
}

.sidebar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #4caf50, #45a049);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #43a047, #388e3c);
}

/* ===== RESPONSIVE ===== */
@media (min-width: 769px) {
  .sidebar.open + .main-content {
    margin-left: 280px;
  }

  .sidebar-overlay {
    display: none;
  }

  /* Tambahkan padding kiri ke header saat sidebar terbuka */
  .sidebar.open + .main-content .top-header {
    padding-left: 298px; /* 280px (lebar sidebar) + 18px (jarak tombol dari kiri sidebar) */
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 280px;
  }

  .top-header {
    padding-left: 70px;
  }

  .header-right {
    gap: 12px;
  }

  .welcome-text {
    display: none;
  }

  .content-area {
    padding: 16px;
  }

  .sidebar.open + .main-content .top-header {
    padding-left: 70px;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 260px;
  }
}
</style>
