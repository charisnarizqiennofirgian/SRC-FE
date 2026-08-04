<template>
  <div class="login-container">
    <div class="sky-decor" aria-hidden="true">
      <span
        v-for="cloud in clouds"
        :key="cloud.id"
        class="cloud"
        :style="{
          top: cloud.top + 'vh',
          width: cloud.width + 'px',
          height: cloud.height + 'px',
          opacity: cloud.opacity,
          animationDuration: cloud.duration + 's',
          animationDelay: cloud.delay + 's',
        }"
      ></span>

      <span
        v-for="plane in planes"
        :key="plane.id"
        class="plane"
        :class="{ 'plane-alt': plane.dir === 'alt' }"
        :style="{
          fontSize: plane.size + 'px',
          animationDuration: plane.duration + 's',
          animationDelay: plane.delay + 's',
          '--y1': plane.y1 + 'vh',
          '--y2': plane.y2 + 'vh',
          '--y3': plane.y3 + 'vh',
          '--op': plane.opacity,
        }"
        >✈️</span
      >
    </div>
    <div class="atmosphere"></div>

    <div class="auth-container" :class="{ active: showInfoPanel }">
      <div class="form-panel form-panel--login">
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
            Don't have an account?
            <a href="#" class="signup-link" @click.prevent="showInfoPanel = true">Sign up</a>
          </p>
        </form>

        <div class="mobile-signup-note">
          <strong>Belum punya akun?</strong> Akun ERP dibuat &amp; dikelola oleh Admin/IT.
          Silakan hubungi tim IT internal untuk permintaan akun baru.
        </div>
      </div>

      <div class="overlay-panel">
        <Transition name="overlay-fade" mode="out-in">
          <div v-if="!showInfoPanel" key="prompt" class="overlay-content">
            <div class="overlay-icon">👋</div>
            <h2>Halo!</h2>
            <p>Jangan lupa klik di sini</p>
            <button type="button" class="overlay-btn" @click="showInfoPanel = true">
              Klik
            </button>
          </div>
          <div v-else key="info" class="overlay-content">
            <div class="overlay-icon">🍃</div>
            <p>
              Mana mungkin Tuhan main-main dalam menciptakan takdir. Sehelai daun yang jatuh
              di tengah hutan pun diatur sedetail itu, apalagi hidupmu.
            </p>
            <button type="button" class="overlay-btn" @click="showInfoPanel = false">
              Kembali ke Login
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from '../api/axios'

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

function buildPlanes(count) {
  return Array.from({ length: count }, (_, i) => {
    const dir = Math.random() < 0.5 ? 'main' : 'alt'
    const duration = randomBetween(18, 38)
    return {
      id: `plane-${i}`,
      dir,
      size: Math.round(randomBetween(16, 28)),
      duration,
      delay: -randomBetween(0, duration),
      y1: randomBetween(2, 90),
      y2: randomBetween(2, 90),
      y3: randomBetween(2, 90),
      opacity: +randomBetween(0.45, 0.9).toFixed(2),
    }
  })
}

function buildClouds(count) {
  return Array.from({ length: count }, (_, i) => {
    const width = Math.round(randomBetween(70, 190))
    const duration = randomBetween(30, 75)
    return {
      id: `cloud-${i}`,
      top: +randomBetween(3, 92).toFixed(1),
      width,
      height: Math.round(width * 0.3),
      duration,
      delay: -randomBetween(0, duration),
      opacity: +randomBetween(0.3, 0.6).toFixed(2),
    }
  })
}

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
      showInfoPanel: false,
      planes: buildPlanes(10),
      clouds: buildClouds(9),
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
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%);
  padding: 20px;
  overflow: hidden;
}

/* ===== Sky Decor — awan & pesawat terbang di background ===== */
.sky-decor {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.cloud {
  position: absolute;
  background: #ffffff;
  border-radius: 50px;
  animation-name: drift-cloud;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.cloud::before,
.cloud::after {
  content: '';
  position: absolute;
  background: inherit;
  border-radius: 50%;
}

.cloud::before {
  width: 55%;
  height: 130%;
  top: -55%;
  left: 8%;
}

.cloud::after {
  width: 42%;
  height: 100%;
  top: -35%;
  right: 10%;
}

@keyframes drift-cloud {
  from {
    transform: translateX(-20vw);
  }
  to {
    transform: translateX(120vw);
  }
}

.plane {
  position: absolute;
  top: 0;
  left: 0;
  animation-name: fly-diagonal;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.15));
}

.plane-alt {
  animation-name: fly-diagonal-alt;
}

@keyframes fly-diagonal {
  0% {
    transform: translate(-10vw, var(--y1)) rotate(-6deg);
    opacity: 0;
  }
  8% {
    opacity: var(--op);
  }
  50% {
    transform: translate(55vw, var(--y2)) rotate(-3deg);
  }
  92% {
    opacity: var(--op);
  }
  100% {
    transform: translate(118vw, var(--y3)) rotate(-6deg);
    opacity: 0;
  }
}

@keyframes fly-diagonal-alt {
  0% {
    transform: translate(115vw, var(--y1)) rotate(174deg);
    opacity: 0;
  }
  8% {
    opacity: var(--op);
  }
  50% {
    transform: translate(45vw, var(--y2)) rotate(178deg);
  }
  92% {
    opacity: var(--op);
  }
  100% {
    transform: translate(-15vw, var(--y3)) rotate(174deg);
    opacity: 0;
  }
}

/* ===== Atmosphere — lapisan cahaya dekoratif di belakang panel login ===== */
.atmosphere {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;

  background:
    radial-gradient(circle at 73% 18%, rgba(255, 255, 255, 0.28), transparent 26%),
    linear-gradient(
      180deg,
      rgba(238, 250, 255, 0.14),
      transparent 38%,
      rgba(66, 152, 199, 0.05)
    );

  mix-blend-mode: soft-light;
}

/* ===== Auth Container (2 panel) ===== */
.auth-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 860px;
  min-height: 580px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

/* ===== Panel Login (form) ===== */
.form-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  padding: 48px 56px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: white;
  z-index: 2;
  transition:
    opacity 900ms cubic-bezier(0.77, 0, 0.18, 1),
    transform 900ms cubic-bezier(0.77, 0, 0.18, 1),
    filter 900ms cubic-bezier(0.77, 0, 0.18, 1);
}

.auth-container.active .form-panel--login {
  opacity: 0;
  transform: translateX(-80px);
  filter: blur(6px);
  pointer-events: none;
}

.title {
  font-size: 30px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: #ff6b35;
  margin-bottom: 28px;
  font-weight: 500;
}

.form-group {
  margin-bottom: 22px;
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

.mobile-signup-note {
  display: none;
  margin-top: 24px;
  padding: 14px 16px;
  background: #f1f8e9;
  border: 1px solid #c5e1a5;
  border-radius: 8px;
  font-size: 12.5px;
  color: #555;
  line-height: 1.5;
}

.mobile-signup-note strong {
  color: #558b2f;
}

/* ===== Overlay Panel (info/sign-up) ===== */
.overlay-panel {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  padding: 48px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
  background: linear-gradient(135deg, #7cb342 0%, #558b2f 100%);
  z-index: 5;
  clip-path: polygon(14% 0, 100% 0, 100% 100%, 0 100%);
  transition:
    transform 900ms cubic-bezier(0.77, 0, 0.18, 1),
    clip-path 900ms cubic-bezier(0.77, 0, 0.18, 1);
}

.auth-container.active .overlay-panel {
  transform: translateX(-100%);
  clip-path: polygon(0 0, 86% 0, 100% 100%, 0 100%);
}

.overlay-content {
  max-width: 300px;
}

.overlay-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.overlay-content h2 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
}

.overlay-content p {
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.95;
  margin-bottom: 24px;
}

.overlay-btn {
  padding: 12px 32px;
  background: transparent;
  border: 2px solid #fff;
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.3s,
    color 0.3s;
}

.overlay-btn:hover {
  background: #fff;
  color: #558b2f;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition:
    opacity 300ms ease,
    transform 300ms ease;
}

.overlay-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.overlay-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ===== Responsive: matikan panel geser, tampilkan catatan biasa ===== */
@media (max-width: 768px) {
  .auth-container {
    max-width: 440px;
    min-height: auto;
  }

  .form-panel {
    position: static;
    width: 100%;
    padding: 40px 28px;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    pointer-events: auto !important;
  }

  .overlay-panel {
    display: none;
  }

  .mobile-signup-note {
    display: block;
  }
}
</style>
