import axios from 'axios'
import config from '../config/env.js'

const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.timeout,
  headers: {
    // 'Content-Type': 'application/json', // <-- HAPUS BARIS INI
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // --- TAMBAHKAN BLOK INI ---
    // Atur Content-Type menjadi application/json HANYA JIKA BUKAN FormData.
    // Untuk FormData (upload file), biarkan browser yang mengaturnya secara otomatis.
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }
    // --- AKHIR BLOK TAMBAHAN ---

    config.metadata = { startTime: Date.now() }

    if (config.method === 'get' && !config.params) {
      config.params = {}
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`API Response time: ${Date.now() - response.config.metadata?.startTime}ms`)
    }
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }

    if (import.meta.env.DEV) {
      console.error('API Error:', error.response?.data || error.message)
    }

    return Promise.reject(error)
  },
)

export default apiClient
