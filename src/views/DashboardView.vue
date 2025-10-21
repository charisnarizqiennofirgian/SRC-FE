<template>
  <div class="dashboard-wrapper">
    <!-- Modern Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <!-- Logo Section -->
      <div class="logo-section">
        <div class="logo-container">
          <div class="logo-icon">🌲</div>
          <div class="logo-content" v-if="!sidebarCollapsed">
            <h2 class="logo-text">Surya Bangkit</h2>
            <p class="logo-subtext">Cemerlang</p>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="nav-menu">
        <!-- Dashboard -->
        <router-link
          to="/dashboard"
          class="nav-item"
          :class="{ active: route.path === '/dashboard' }"
        >
          <span class="nav-icon">📊</span>
          <span class="nav-text" v-if="!sidebarCollapsed">Dashboard</span>
        </router-link>

        <!-- Master Data Dropdown -->
        <div class="nav-group">
          <div class="nav-item dropdown-trigger" @click="toggleMasterData">
            <div class="nav-label">
              <span class="nav-icon">📋</span>
              <span class="nav-text" v-if="!sidebarCollapsed">Master Data</span>
            </div>
            <span class="dropdown-arrow" v-if="!sidebarCollapsed" :class="{ open: masterDataOpen }">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 8L2 4h8l-4 4z" />
              </svg>
            </span>
          </div>

          <transition name="submenu-slide">
            <div v-if="masterDataOpen && !sidebarCollapsed" class="submenu">
              <router-link to="/dashboard/categories" class="submenu-item">
                <span class="submenu-dot"></span>
                <span>Data Kategori Produk</span>
              </router-link>
              <router-link to="/dashboard/units" class="submenu-item">
                <span class="submenu-dot"></span>
                <span>Data Satuan</span>
              </router-link>
              <router-link to="/dashboard/products" class="submenu-item">
                <span class="submenu-dot"></span>
                <span>Data Produk Jadi</span>
              </router-link>
              <router-link to="/dashboard/materials" class="submenu-item">
                <span class="submenu-dot"></span>
                <span>Data Bahan Baku</span>
              </router-link>
              <router-link to="/dashboard/suppliers" class="submenu-item">
                <span class="submenu-dot"></span>
                <span>Data Supplier</span>
              </router-link>
              <router-link to="/dashboard/buyers" class="submenu-item">
                <span class="submenu-dot"></span>
                <span>Data Buyer</span>
              </router-link>
            </div>
          </transition>
        </div>

        <!-- Manajemen Stok Dropdown -->
        <div class="nav-group">
          <div class="nav-item dropdown-trigger" @click="toggleStockManagement">
            <div class="nav-label">
              <span class="nav-icon">📦</span>
              <span class="nav-text" v-if="!sidebarCollapsed">Manajemen Stok</span>
            </div>
            <span
              class="dropdown-arrow"
              v-if="!sidebarCollapsed"
              :class="{ open: stockManagementOpen }"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 8L2 4h8l-4 4z" />
              </svg>
            </span>
          </div>

          <transition name="submenu-slide">
            <div v-if="stockManagementOpen && !sidebarCollapsed" class="submenu">
              <router-link to="/dashboard/stock-report" class="submenu-item">
                <span class="submenu-dot"></span>
                <span>Laporan Stok</span>
              </router-link>
              <router-link to="/dashboard/stock-adjustment" class="submenu-item">
                <span class="submenu-dot"></span>
                <span>Stok Adjustment</span>
              </router-link>
            </div>
          </transition>
        </div>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer" v-if="!sidebarCollapsed">
        <div class="sidebar-divider"></div>
        <div class="app-version">
          <span class="version-icon">ℹ️</span>
          <span class="version-text">v1.0.0</span>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Top Navbar -->
      <header class="top-navbar">
        <div class="navbar-left">
          <button class="sidebar-toggle" @click="toggleSidebar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 12h18M3 6h18M3 18h18" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
          <span class="page-breadcrumb">ERP Surya Bangkit Cemerlang</span>
        </div>

        <div class="navbar-right">
          <!-- Search Bar (Optional - comment out if not needed) -->
          <!-- <div class="search-container">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search..." 
              class="search-input"
            />
          </div> -->

          <!-- Notification Button -->
          <button class="icon-button notification-btn" title="Notifications">
            <span class="bell-icon">🔔</span>
            <span class="notification-badge">3</span>
          </button>

          <!-- User Profile Dropdown -->
          <div class="user-menu" @click="toggleUserMenu" ref="userMenuRef">
            <div class="user-profile">
              <span class="user-greeting" v-if="!sidebarCollapsed">
                Selamat Datang, <strong>{{ userName }}</strong>
              </span>
              <div class="user-avatar-wrapper">
                <img
                  :src="`https://ui-avatars.com/api/?name=${userName}&background=10B981&color=fff&bold=true`"
                  alt="User Avatar"
                  class="user-avatar"
                />
              </div>
            </div>

            <!-- User Dropdown Menu -->
            <transition name="dropdown-fade">
              <div v-if="userMenuOpen" class="user-dropdown">
                <div class="dropdown-header">
                  <div class="dropdown-avatar">
                    <img
                      :src="`https://ui-avatars.com/api/?name=${userName}&background=10B981&color=fff&bold=true`"
                      alt="User Avatar"
                    />
                  </div>
                  <div class="dropdown-user-info">
                    <p class="dropdown-name">{{ userName }}</p>
                    <p class="dropdown-email">{{ userEmail }}</p>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item" @click="logout">
                  <span class="dropdown-icon">🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </transition>
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <main class="content-area">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const userName = ref('User')
const userEmail = ref('user@example.com')
const sidebarCollapsed = ref(false)
const masterDataOpen = ref(false)
const stockManagementOpen = ref(false)
const userMenuOpen = ref(false)
const userMenuRef = ref(null)

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      userName.value = user.name || 'User'
      userEmail.value = user.email || 'user@example.com'
    } catch (error) {
      console.error('Failed to parse user data:', error)
    }
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    userMenuOpen.value = false
  }
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  if (sidebarCollapsed.value) {
    masterDataOpen.value = false
    stockManagementOpen.value = false
  }
}

const toggleMasterData = () => {
  if (!sidebarCollapsed.value) {
    masterDataOpen.value = !masterDataOpen.value
    if (masterDataOpen.value) {
      stockManagementOpen.value = false
    }
  }
}

const toggleStockManagement = () => {
  if (!sidebarCollapsed.value) {
    stockManagementOpen.value = !stockManagementOpen.value
    if (stockManagementOpen.value) {
      masterDataOpen.value = false
    }
  }
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/')
}
</script>

<style scoped>
/* ===== RESET & GLOBAL ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard-wrapper {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* ===== SIDEBAR ===== */
.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.sidebar.collapsed {
  width: 70px;
}

/* Logo Section */
.logo-section {
  padding: 20px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.logo-content {
  overflow: hidden;
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
  white-space: nowrap;
}

.logo-subtext {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  white-space: nowrap;
}

/* Navigation Menu */
.nav-menu {
  flex: 1;
  padding: 16px 8px;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-menu::-webkit-scrollbar {
  width: 4px;
}

.nav-menu::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.nav-group {
  margin-bottom: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin: 2px 0;
  text-decoration: none;
  color: #4b5563;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.nav-item:hover {
  background: #f3f4f6;
  color: #10b981;
}

.nav-item.active,
.nav-item.router-link-active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.nav-label {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.nav-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.nav-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-trigger {
  cursor: pointer;
}

.dropdown-arrow {
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
  color: #9ca3af;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

/* Submenu */
.submenu {
  margin-left: 12px;
  margin-top: 4px;
  margin-bottom: 8px;
  border-left: 2px solid #e5e7eb;
  padding-left: 12px;
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin: 2px 0;
  text-decoration: none;
  color: #6b7280;
  border-radius: 6px;
  font-size: 13px;
  transition: all 0.2s ease;
}

.submenu-item:hover {
  background: #f3f4f6;
  color: #10b981;
}

.submenu-item.router-link-active {
  background: #ecfdf5;
  color: #10b981;
  font-weight: 600;
}

.submenu-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d1d5db;
  flex-shrink: 0;
}

.submenu-item.router-link-active .submenu-dot {
  background: #10b981;
}

/* Submenu Animation */
.submenu-slide-enter-active,
.submenu-slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.submenu-slide-enter-from,
.submenu-slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.submenu-slide-enter-to,
.submenu-slide-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.sidebar-divider {
  height: 1px;
  background: #e5e7eb;
  margin-bottom: 12px;
}

.app-version {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #9ca3af;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.version-icon {
  font-size: 14px;
}

/* ===== MAIN CONTENT ===== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Top Navbar */
.top-navbar {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sidebar-toggle {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.sidebar-toggle:hover {
  background: #f3f4f6;
  color: #10b981;
}

.page-breadcrumb {
  font-size: 14px;
  color: #9ca3af;
  font-weight: 500;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Search Container (Optional) */
.search-container {
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 12px;
  gap: 8px;
  width: 280px;
  transition: all 0.2s;
}

.search-container:focus-within {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.search-icon {
  font-size: 16px;
  color: #9ca3af;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  width: 100%;
  color: #1f2937;
}

.search-input::placeholder {
  color: #9ca3af;
}

/* Icon Button */
.icon-button {
  position: relative;
  background: none;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-button:hover {
  background: #f3f4f6;
}

.bell-icon {
  font-size: 20px;
}

.notification-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

/* User Menu */
.user-menu {
  position: relative;
  cursor: pointer;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-greeting {
  font-size: 14px;
  color: #6b7280;
}

.user-greeting strong {
  color: #1f2937;
  font-weight: 600;
}

.user-avatar-wrapper {
  position: relative;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #10b981;
  object-fit: cover;
}

/* User Dropdown */
.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 240px;
  z-index: 1000;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.dropdown-avatar img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #10b981;
}

.dropdown-user-info {
  flex: 1;
  min-width: 0;
}

.dropdown-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-email {
  font-size: 12px;
  color: #9ca3af;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0 12px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  transition: all 0.2s;
  text-align: left;
}

.dropdown-item:hover {
  background: #f3f4f6;
  color: #ef4444;
}

.dropdown-icon {
  font-size: 18px;
}

/* Dropdown Animation */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Content Area */
.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #f5f7fa;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .user-greeting {
    display: none;
  }

  .search-container {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 999;
    transform: translateX(-100%);
  }

  .sidebar.collapsed {
    transform: translateX(0);
    width: 260px;
  }

  .search-container {
    display: none;
  }

  .page-breadcrumb {
    display: none;
  }

  .content-area {
    padding: 16px;
  }
}
</style>
