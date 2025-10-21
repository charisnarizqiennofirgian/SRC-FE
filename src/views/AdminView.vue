<template>
  <div class="admin-container">
    <header class="admin-header">
      <h1>Admin Panel</h1>
      <p>Selamat Datang, {{ userName }}</p>
      <button @click="logout" class="logout-btn">Logout</button>
    </header>

    <main class="admin-main">
      <div class="card">
        <h2>Manajemen Role</h2>
        <form @submit.prevent="addRole" class="form-inline">
          <input v-model="newRoleName" type="text" placeholder="Nama Role Baru" required />
          <button type="submit">Tambah Role</button>
        </form>
        <div class="item-list">
          <h3>Daftar Role Saat Ini:</h3>
          <ul>
            <li v-for="role in roles" :key="role.id">{{ role.name }}</li>
          </ul>
        </div>
      </div>

      <div class="card">
        <h2>Manajemen User</h2>
        <form @submit.prevent="addUser" class="user-form">
          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>
          <div class="form-group">
            <label>Nama User</label>
            <input v-model="newUser.name" type="text" required />
            <div v-if="validationErrors.name" class="error-text">
              {{ validationErrors.name[0] }}
            </div>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="newUser.email" type="email" required />
            <div v-if="validationErrors.email" class="error-text">
              {{ validationErrors.email[0] }}
            </div>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input v-model="newUser.password" type="password" required />
            <div v-if="validationErrors.password" class="error-text">
              {{ validationErrors.password[0] }}
            </div>
          </div>
          <div class="form-group">
            <label>Role</label>
            <select v-model="newUser.role" required>
              <option disabled value="">Pilih role</option>
              <option v-for="role in roles" :key="role.id" :value="role.name">
                {{ role.name }}
              </option>
            </select>
          </div>
          <button type="submit" class="submit-btn">Tambah User</button>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import apiClient from '../api/axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const userName = ref('')
const roles = ref([])
const newRoleName = ref('')
const successMessage = ref('')
const validationErrors = ref({})

const newUser = reactive({
  name: '',
  email: '',
  password: '',
  role: '',
})

const fetchRoles = async () => {
  try {
    const response = await apiClient.get('/roles')
    roles.value = response.data.roles
  } catch (error) {
    console.error('Gagal mengambil data roles:', error)
  }
}

const addRole = async () => {
  if (!newRoleName.value) return
  try {
    await apiClient.post('/roles', { name: newRoleName.value, guard_name: 'web' })
    newRoleName.value = ''
    await fetchRoles()
  } catch (error) {
    console.error('Gagal menambahkan role:', error)
    alert('Gagal menambahkan role. Mungkin nama sudah ada.')
  }
}

const addUser = async () => {
  successMessage.value = ''
  validationErrors.value = {}
  try {
    await apiClient.post('/users', newUser)
    successMessage.value = 'User baru berhasil ditambahkan!'
    Object.assign(newUser, { name: '', email: '', password: '', role: '' })
  } catch (error) {
    if (error.response && error.response.status === 422) {
      validationErrors.value = error.response.data.errors
    } else {
      alert('Terjadi kesalahan yang tidak diketahui.')
    }
    console.error('Gagal menambahkan user:', error)
  }
}

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user'))
  if (user) userName.value = user.name
  fetchRoles()
})

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/')
}
</script>

<style scoped>
.admin-container {
  font-family: sans-serif;
  background-color: #f4f6f9;
  min-height: 100vh;
}
.admin-header {
  background-color: #2c3e50;
  color: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.admin-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  padding: 30px;
}
.card {
  background: #fff;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.form-inline {
  display: flex;
  margin-bottom: 20px;
}
.form-inline input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
}
.form-inline button {
  padding: 10px 15px;
  border: none;
  background-color: #3498db;
  color: white;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}
.item-list ul {
  list-style-type: none;
  padding: 0;
}
.item-list li {
  background-color: #f2f2f2;
  padding: 8px 12px;
  margin-bottom: 5px;
  border-radius: 4px;
}
.logout-btn {
  padding: 8px 16px;
  border: none;
  background-color: #e74c3c;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}
.user-form .form-group {
  margin-bottom: 15px;
}
.user-form label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  font-size: 14px;
}
.user-form input,
.user-form select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.submit-btn {
  width: 100%;
  padding: 12px;
  border: none;
  background-color: #28a745;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
}
.success-message {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  text-align: center;
}
.error-text {
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
}
</style>
