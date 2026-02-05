<template>
  <div class="admin-container">
    <!-- Header -->
    <header class="admin-header">
      <div class="header-left">
        <h1>🔐 Admin Panel</h1>
        <p>Manajemen Role & User</p>
      </div>
      <div class="header-right">
        <span class="user-name">{{ userName }}</span>
        <button @click="logout" class="logout-btn">Logout</button>
      </div>
    </header>

    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button @click="activeTab = 'roles'" :class="['tab-btn', { active: activeTab === 'roles' }]">
        👥 Roles
      </button>
      <button @click="activeTab = 'users'" :class="['tab-btn', { active: activeTab === 'users' }]">
        👤 Users
      </button>
    </div>

    <!-- Main Content -->
    <main class="admin-main">
      <!-- ROLES TAB -->
      <div v-if="activeTab === 'roles'" class="tab-content">
        <div class="content-header">
          <h2>📋 Manajemen Role</h2>
          <button @click="openRoleModal()" class="btn-primary">➕ Buat Role Baru</button>
        </div>

        <!-- Roles Table -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Role</th>
                <th>Jumlah Permissions</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="roles.length === 0">
                <td colspan="4" class="empty-state">Tidak ada data role</td>
              </tr>
              <tr v-for="role in roles" :key="role.id">
                <td>{{ role.id }}</td>
                <td>
                  <span class="role-badge">{{ role.name }}</span>
                </td>
                <td>{{ role.permissions?.length || 0 }} permissions</td>
                <td>
                  <div class="action-buttons">
                    <button @click="openRoleModal(role)" class="btn-edit" title="Edit">✏️</button>
                    <button
                      @click="deleteRole(role.id)"
                      class="btn-delete"
                      title="Hapus"
                      :disabled="role.name === 'super-admin'"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- USERS TAB -->
      <div v-if="activeTab === 'users'" class="tab-content">
        <div class="content-header">
          <h2>👤 Manajemen User</h2>
          <button @click="openUserModal()" class="btn-primary">➕ Buat User Baru</button>
        </div>

        <!-- Users Table -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="users.length === 0">
                <td colspan="5" class="empty-state">Tidak ada data user</td>
              </tr>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="role-badge small">
                    {{ user.roles?.[0]?.name || '-' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button @click="openUserModal(user)" class="btn-edit" title="Edit">✏️</button>
                    <button
                      @click="openResetPasswordModal(user)"
                      class="btn-warning"
                      title="Reset Password"
                    >
                      🔑
                    </button>
                    <button
                      @click="deleteUser(user.id)"
                      class="btn-delete"
                      title="Hapus"
                      :disabled="user.id === currentUserId"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- MODAL: ROLE FORM -->
    <div v-if="showRoleModal" class="modal-overlay" @click.self="closeRoleModal">
      <div class="modal-content large">
        <div class="modal-header">
          <h3>{{ editingRole ? '✏️ Edit Role' : '➕ Buat Role Baru' }}</h3>
          <button @click="closeRoleModal" class="btn-close">✕</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveRole">
            <div class="form-group">
              <label>Nama Role <span class="required">*</span></label>
              <input
                v-model="roleForm.name"
                type="text"
                placeholder="Contoh: Admin Penjualan"
                required
                class="form-control"
              />
              <small v-if="validationErrors.name" class="error-text">
                {{ validationErrors.name[0] }}
              </small>
            </div>

            <div class="form-group">
              <label>Permissions</label>
              <div class="permissions-grid">
                <label
                  v-for="permission in allPermissions"
                  :key="permission.id"
                  class="permission-checkbox"
                >
                  <input type="checkbox" :value="permission.id" v-model="roleForm.permissions" />
                  <span>{{ formatPermissionName(permission.name) }}</span>
                </label>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" @click="closeRoleModal" class="btn-secondary">Batal</button>
              <button type="submit" class="btn-primary" :disabled="isSubmitting">
                {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL: USER FORM -->
    <div v-if="showUserModal" class="modal-overlay" @click.self="closeUserModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingUser ? '✏️ Edit User' : '➕ Buat User Baru' }}</h3>
          <button @click="closeUserModal" class="btn-close">✕</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveUser">
            <div class="form-group">
              <label>Nama <span class="required">*</span></label>
              <input
                v-model="userForm.name"
                type="text"
                placeholder="Nama lengkap"
                required
                class="form-control"
              />
              <small v-if="validationErrors.name" class="error-text">
                {{ validationErrors.name[0] }}
              </small>
            </div>

            <div class="form-group">
              <label>Email <span class="required">*</span></label>
              <input
                v-model="userForm.email"
                type="email"
                placeholder="email@example.com"
                required
                class="form-control"
              />
              <small v-if="validationErrors.email" class="error-text">
                {{ validationErrors.email[0] }}
              </small>
            </div>

            <div class="form-group" v-if="!editingUser">
              <label>Password <span class="required">*</span></label>
              <input
                v-model="userForm.password"
                type="password"
                placeholder="Minimal 8 karakter"
                :required="!editingUser"
                class="form-control"
              />
              <small v-if="validationErrors.password" class="error-text">
                {{ validationErrors.password[0] }}
              </small>
            </div>

            <div class="form-group">
              <label>Role <span class="required">*</span></label>
              <select v-model="userForm.role" required class="form-control">
                <option value="">-- Pilih Role --</option>
                <option v-for="role in roles" :key="role.id" :value="role.name">
                  {{ role.name }}
                </option>
              </select>
              <small v-if="validationErrors.role" class="error-text">
                {{ validationErrors.role[0] }}
              </small>
            </div>

            <div class="modal-footer">
              <button type="button" @click="closeUserModal" class="btn-secondary">Batal</button>
              <button type="submit" class="btn-primary" :disabled="isSubmitting">
                {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL: RESET PASSWORD -->
    <div v-if="showResetPasswordModal" class="modal-overlay" @click.self="closeResetPasswordModal">
      <div class="modal-content small">
        <div class="modal-header">
          <h3>🔑 Reset Password</h3>
          <button @click="closeResetPasswordModal" class="btn-close">✕</button>
        </div>
        <div class="modal-body">
          <p>
            Reset password untuk: <strong>{{ resetPasswordUser?.name }}</strong>
          </p>
          <form @submit.prevent="resetPassword">
            <div class="form-group">
              <label>Password Baru <span class="required">*</span></label>
              <input
                v-model="resetPasswordForm.password"
                type="password"
                placeholder="Minimal 8 karakter"
                required
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>Konfirmasi Password <span class="required">*</span></label>
              <input
                v-model="resetPasswordForm.password_confirmation"
                type="password"
                placeholder="Ketik ulang password"
                required
                class="form-control"
              />
            </div>

            <div class="modal-footer">
              <button type="button" @click="closeResetPasswordModal" class="btn-secondary">
                Batal
              </button>
              <button type="submit" class="btn-warning" :disabled="isSubmitting">
                {{ isSubmitting ? 'Mereset...' : 'Reset Password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, reactive } from 'vue'
import apiClient from '../api/axios'
import { useRouter } from 'vue-router'

const router = useRouter()

// State
const userName = ref('')
const currentUserId = ref(null)
const activeTab = ref('roles')
const roles = ref([])
const users = ref([])
const allPermissions = ref([])
const isSubmitting = ref(false)
const validationErrors = ref({})

// Modals
const showRoleModal = ref(false)
const showUserModal = ref(false)
const showResetPasswordModal = ref(false)

// Forms
const editingRole = ref(null)
const roleForm = reactive({
  name: '',
  permissions: [],
})

const editingUser = ref(null)
const userForm = reactive({
  name: '',
  email: '',
  password: '',
  role: '',
})

const resetPasswordUser = ref(null)
const resetPasswordForm = reactive({
  password: '',
  password_confirmation: '',
})

// Toast
const toast = reactive({
  show: false,
  message: '',
  type: 'success', // success, error, warning
})

// ============================================
// FETCH DATA
// ============================================

const fetchRoles = async () => {
  try {
    const response = await apiClient.get('/roles')
    roles.value = response.data.data || response.data.roles || []
  } catch (error) {
    console.error('Gagal mengambil data roles:', error)
    showToast('Gagal mengambil data roles', 'error')
  }
}

const fetchUsers = async () => {
  try {
    const response = await apiClient.get('/users')
    users.value = response.data.data || response.data.users || []
  } catch (error) {
    console.error('Gagal mengambil data users:', error)
    showToast('Gagal mengambil data users', 'error')
  }
}

const fetchPermissions = async () => {
  try {
    const response = await apiClient.get('/permissions')
    allPermissions.value = response.data.data || response.data.permissions || []
  } catch (error) {
    console.error('Gagal mengambil data permissions:', error)
  }
}

// ============================================
// ROLE MANAGEMENT
// ============================================

const openRoleModal = (role = null) => {
  editingRole.value = role
  if (role) {
    roleForm.name = role.name
    roleForm.permissions = role.permissions?.map((p) => p.id) || []
  } else {
    roleForm.name = ''
    roleForm.permissions = []
  }
  validationErrors.value = {}
  showRoleModal.value = true
}

const closeRoleModal = () => {
  showRoleModal.value = false
  editingRole.value = null
  roleForm.name = ''
  roleForm.permissions = []
  validationErrors.value = {}
}

const saveRole = async () => {
  isSubmitting.value = true
  validationErrors.value = {}

  try {
    const payload = {
      name: roleForm.name,
      permissions: roleForm.permissions,
    }

    if (editingRole.value) {
      // Update
      await apiClient.put(`/roles/${editingRole.value.id}`, payload)
      showToast('Role berhasil diupdate!', 'success')
    } else {
      // Create
      await apiClient.post('/roles', payload)
      showToast('Role berhasil dibuat!', 'success')
    }

    closeRoleModal()
    await fetchRoles()
  } catch (error) {
    console.error('Error saving role:', error)
    if (error.response?.status === 422) {
      validationErrors.value = error.response.data.errors || {}
    }
    showToast(error.response?.data?.message || 'Gagal menyimpan role', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const deleteRole = async (roleId) => {
  if (!confirm('Yakin ingin menghapus role ini?')) return

  try {
    await apiClient.delete(`/roles/${roleId}`)
    showToast('Role berhasil dihapus!', 'success')
    await fetchRoles()
  } catch (error) {
    console.error('Error deleting role:', error)
    showToast(error.response?.data?.message || 'Gagal menghapus role', 'error')
  }
}

// ============================================
// USER MANAGEMENT
// ============================================

const openUserModal = (user = null) => {
  editingUser.value = user
  if (user) {
    userForm.name = user.name
    userForm.email = user.email
    userForm.password = ''
    userForm.role = user.roles?.[0]?.name || ''
  } else {
    userForm.name = ''
    userForm.email = ''
    userForm.password = ''
    userForm.role = ''
  }
  validationErrors.value = {}
  showUserModal.value = true
}

const closeUserModal = () => {
  showUserModal.value = false
  editingUser.value = null
  userForm.name = ''
  userForm.email = ''
  userForm.password = ''
  userForm.role = ''
  validationErrors.value = {}
}

const saveUser = async () => {
  isSubmitting.value = true
  validationErrors.value = {}

  try {
    const payload = {
      name: userForm.name,
      email: userForm.email,
      role: userForm.role,
    }

    if (!editingUser.value) {
      payload.password = userForm.password
    }

    if (editingUser.value) {
      // Update
      await apiClient.put(`/users/${editingUser.value.id}`, payload)
      showToast('User berhasil diupdate!', 'success')
    } else {
      // Create
      await apiClient.post('/users', payload)
      showToast('User berhasil dibuat!', 'success')
    }

    closeUserModal()
    await fetchUsers()
  } catch (error) {
    console.error('Error saving user:', error)
    if (error.response?.status === 422) {
      validationErrors.value = error.response.data.errors || {}
    }
    showToast(error.response?.data?.message || 'Gagal menyimpan user', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const deleteUser = async (userId) => {
  if (userId === currentUserId.value) {
    showToast('Tidak bisa menghapus user sendiri!', 'warning')
    return
  }

  if (!confirm('Yakin ingin menghapus user ini?')) return

  try {
    await apiClient.delete(`/users/${userId}`)
    showToast('User berhasil dihapus!', 'success')
    await fetchUsers()
  } catch (error) {
    console.error('Error deleting user:', error)
    showToast(error.response?.data?.message || 'Gagal menghapus user', 'error')
  }
}

// ============================================
// RESET PASSWORD
// ============================================

const openResetPasswordModal = (user) => {
  resetPasswordUser.value = user
  resetPasswordForm.password = ''
  resetPasswordForm.password_confirmation = ''
  showResetPasswordModal.value = true
}

const closeResetPasswordModal = () => {
  showResetPasswordModal.value = false
  resetPasswordUser.value = null
  resetPasswordForm.password = ''
  resetPasswordForm.password_confirmation = ''
}

const resetPassword = async () => {
  if (resetPasswordForm.password !== resetPasswordForm.password_confirmation) {
    showToast('Password tidak cocok!', 'error')
    return
  }

  isSubmitting.value = true

  try {
    await apiClient.post(`/users/${resetPasswordUser.value.id}/reset-password`, {
      password: resetPasswordForm.password,
      password_confirmation: resetPasswordForm.password_confirmation,
    })
    showToast('Password berhasil direset!', 'success')
    closeResetPasswordModal()
  } catch (error) {
    console.error('Error resetting password:', error)
    showToast(error.response?.data?.message || 'Gagal reset password', 'error')
  } finally {
    isSubmitting.value = false
  }
}

// ============================================
// UTILITIES
// ============================================

const formatPermissionName = (name) => {
  // Convert "manage-bills" to "Manage Bills"
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const showToast = (message, type = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true

  setTimeout(() => {
    toast.show = false
  }, 3000)
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/')
}

// ============================================
// LIFECYCLE
// ============================================

onMounted(async () => {
  const user = JSON.parse(localStorage.getItem('user'))
  if (user) {
    userName.value = user.name
    currentUserId.value = user.id
  }

  await Promise.all([fetchRoles(), fetchUsers(), fetchPermissions()])
})
</script>
<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.admin-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* ============================================
   HEADER
============================================ */
.admin-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
  font-size: 28px;
  margin-bottom: 5px;
}

.header-left p {
  font-size: 14px;
  opacity: 0.9;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-name {
  font-size: 16px;
  font-weight: 500;
}

.logout-btn {
  padding: 8px 20px;
  border: none;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* ============================================
   TAB NAVIGATION
============================================ */
.tab-navigation {
  background: white;
  padding: 0 40px;
  display: flex;
  gap: 10px;
  border-bottom: 2px solid #e5e7eb;
}

.tab-btn {
  padding: 15px 30px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  position: relative;
  top: 2px;
}

.tab-btn:hover {
  color: #667eea;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

/* ============================================
   MAIN CONTENT
============================================ */
.admin-main {
  padding: 30px 40px;
}

.tab-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.content-header h2 {
  font-size: 24px;
  color: #1f2937;
}

/* ============================================
   BUTTONS
============================================ */
.btn-primary {
  padding: 10px 20px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  padding: 10px 20px;
  border: 2px solid #e5e7eb;
  background: white;
  color: #6b7280;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-secondary:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.btn-edit {
  padding: 6px 12px;
  border: none;
  background: #3b82f6;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-edit:hover {
  background: #2563eb;
}

.btn-delete {
  padding: 6px 12px;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: #dc2626;
}

.btn-delete:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.btn-warning {
  padding: 6px 12px;
  border: none;
  background: #f59e0b;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-warning:hover {
  background: #d97706;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* ============================================
   TABLE
============================================ */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table thead {
  background: #f9fafb;
}

.data-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  color: #6b7280;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.empty-state {
  text-align: center;
  color: #9ca3af;
  padding: 40px;
  font-style: italic;
}

.role-badge {
  display: inline-block;
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

.role-badge.small {
  padding: 4px 10px;
  font-size: 12px;
}

/* ============================================
   MODAL
============================================ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-content.large {
  max-width: 700px;
}

.modal-content.small {
  max-width: 400px;
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 20px;
  color: #1f2937;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  padding: 25px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

/* ============================================
   FORM
============================================ */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
  color: #374151;
}

.required {
  color: #ef4444;
}

.form-control {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.error-text {
  color: #ef4444;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

/* ============================================
   PERMISSIONS GRID
============================================ */
.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding: 15px;
  background: #f9fafb;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
}

.permission-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.permission-checkbox:hover {
  background: white;
}

.permission-checkbox input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.permission-checkbox span {
  font-size: 13px;
  color: #374151;
}

/* ============================================
   TOAST
============================================ */
.toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 15px 25px;
  background: #10b981;
  color: white;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  font-weight: 500;
  z-index: 2000;
  animation: slideIn 0.3s ease-out;
}

.toast.error {
  background: #ef4444;
}

.toast.warning {
  background: #f59e0b;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* ============================================
   RESPONSIVE
============================================ */
@media (max-width: 768px) {
  .admin-header {
    padding: 15px 20px;
  }

  .header-left h1 {
    font-size: 22px;
  }

  .tab-navigation {
    padding: 0 20px;
  }

  .admin-main {
    padding: 20px;
  }

  .tab-content {
    padding: 20px;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .permissions-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    max-width: 95%;
  }
}
</style>
