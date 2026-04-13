import axios from 'axios'
import config from '../config/env.js'

const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.timeout,
  headers: {
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    // Cek apakah di browser (bukan SSR)
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    // Atur Content-Type menjadi application/json HANYA JIKA BUKAN FormData.
    // Untuk FormData (upload file), biarkan browser yang mengaturnya secara otomatis.
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }

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
    const status = error.response?.status

    if (status === 401) {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('permissions')
        if (window.location.pathname !== '/') {
          window.location.href = '/'
        }
      }
    }

    if (status === 429) {
      const retryAfter = error.response?.headers['retry-after'] ?? 60
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('rate-limit', {
          detail: { retryAfter }
        }))
      }
    }

    if (import.meta.env.DEV) {
      console.error('API Error:', error.response?.data || error.message)
    }

    return Promise.reject(error)
  },
)

export default apiClient
