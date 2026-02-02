// Environment configuration
const config = {
  development: {
    apiUrl: 'http://192.168.1.98:8000/api',
    timeout: 300000,
  },

  production: {
    apiUrl: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
    timeout: 15000,
  },
}

export default config[import.meta.env.MODE || 'development']
