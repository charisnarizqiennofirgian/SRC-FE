<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="title">Welcome</h1>
      <p class="subtitle">PT. Surya Bangkit Cemerlang</p>

      <form @submit.prevent="handleLogin" @keydown.enter="handleLogin">
        <div class="form-group">
          <label for="email">Email address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            required
            :disabled="isLoading"
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <div class="password-header">
            <label for="password">Password</label>
            <a href="#" class="forgot-link">Forgot password?</a>
          </div>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            required
            :disabled="isLoading"
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="login-btn" :disabled="isLoading || isRateLimited">
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Logging in...' : isRateLimited ? `Tunggu ${countdown}s...` : 'Log in' }}
        </button>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <p class="signup-text">
          Don't have an account? <a href="#" class="signup-link">Sign up</a>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import apiClient from '../api/axios'

export default {
  name: 'LoginForm',
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
      validationErrors: {},
      isLoading: false,
      isRateLimited: false,
      countdown: 0,
      countdownTimer: null,
      debounceTimer: null,
    }
  },
  methods: {
    async handleLogin() {
      if (this.isLoading) return

      // Validasi frontend
      if (!this.email || !this.password) {
        this.errorMessage = 'Email dan password harus diisi.'
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.email)) {
        this.errorMessage = 'Format email tidak valid.'
        return
      }

      this.errorMessage = ''
      this.validationErrors = {}
      this.isLoading = true

      try {
        const response = await apiClient.post('/login', {
          email: this.email,
          password: this.password,
        })

        // Save token & user
        localStorage.setItem('token', response.data.access_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))

        // Save permissions
        if (response.data.permissions) {
          localStorage.setItem('permissions', JSON.stringify(response.data.permissions))
        } else if (response.data.user?.permissions) {
          localStorage.setItem('permissions', JSON.stringify(response.data.user.permissions))
        } else {
          // Fallback: load permissions dari API
          try {
            const userResponse = await apiClient.get('/user')
            if (userResponse.data.permissions) {
              localStorage.setItem('permissions', JSON.stringify(userResponse.data.permissions))
            } else {
              const user = userResponse.data.user || userResponse.data
              const permissions = user.roles?.[0]?.permissions?.map((p) => p.name) || []
              localStorage.setItem('permissions', JSON.stringify(permissions))
            }
          } catch {
            localStorage.setItem('permissions', JSON.stringify([]))
          }
        }

        // Redirect
        const redirectRoute = response.data.dashboard_route || '/dashboard'
        await this.$router.push(redirectRoute)
      } catch (error) {
        if (error.code === 'ECONNABORTED') {
          this.errorMessage = 'Koneksi timeout. Silakan coba lagi.'
        } else if (error.response?.status === 429) {
          const retryAfter = parseInt(error.response?.headers['retry-after'] ?? 60)
          this.startCountdown(retryAfter)
        } else if (error.response?.status === 422) {
          this.validationErrors = error.response.data.errors
        } else if (error.response?.status === 401) {
          this.errorMessage = 'Email atau password yang Anda masukkan salah.'
        } else if (error.response?.status >= 500) {
          this.errorMessage = 'Server sedang bermasalah. Silakan coba lagi nanti.'
        } else {
          this.errorMessage = 'Terjadi kesalahan. Silakan coba lagi.'
        }
      } finally {
        this.isLoading = false
      }
    },

    clearErrorMessage() {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }
      this.debounceTimer = setTimeout(() => {
        this.errorMessage = ''
        this.validationErrors = {}
      }, 3000)
    },

    startCountdown(seconds) {
      this.isRateLimited = true
      this.countdown = seconds
      this.errorMessage = `Terlalu banyak percobaan login. Tunggu ${seconds} detik.`

      this.countdownTimer = setInterval(() => {
        this.countdown--
        this.errorMessage = `Terlalu banyak percobaan login. Tunggu ${this.countdown} detik.`

        if (this.countdown <= 0) {
          clearInterval(this.countdownTimer)
          this.isRateLimited = false
          this.errorMessage = ''
        }
      }, 1000)
    },
  },
  watch: {
    email() {
      if (this.errorMessage) {
        this.clearErrorMessage()
      }
    },
    password() {
      if (this.errorMessage) {
        this.clearErrorMessage()
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      const emailInput = document.getElementById('email')
      if (emailInput) {
        emailInput.focus()
      }
    })
  },
  beforeUnmount() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer)
    if (this.countdownTimer) clearInterval(this.countdownTimer)
  },
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  text-align: center;
  color: #ff6b35;
  margin-bottom: 32px;
  font-weight: 500;
}

.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.password-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.forgot-link {
  font-size: 12px;
  color: #ff6b35;
  text-decoration: none;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #7cb342;
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: #7cb342;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 8px;
}

.login-btn:hover {
  background: #689f38;
}

.login-btn:disabled {
  background: #a5d6a7;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.signup-text {
  text-align: center;
  font-size: 13px;
  color: #666;
  margin-top: 20px;
}

.signup-link {
  color: #ff6b35;
  text-decoration: none;
  font-weight: 600;
}

.signup-link:hover {
  text-decoration: underline;
}

.error-message {
  text-align: center;
  margin-top: 16px;
  color: #dc3545;
  font-weight: 500;
}
</style>
