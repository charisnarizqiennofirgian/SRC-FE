<template>
  <DashboardLayout>
    <div class="dashboard-home">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div class="welcome-content">
          <div class="welcome-icon">📊</div>
          <h1 class="welcome-title">Selamat Datang, {{ userName }}</h1>
          <p class="welcome-subtitle">
            Menu utama sedang dalam pengembangan. Nantikan pembaruan berikutnya!
          </p>
        </div>
      </div>

      <!-- Stats Cards (Optional - Comment out if not needed) -->
      <!-- <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <p class="stat-label">Total Produk</p>
            <h3 class="stat-value">-</h3>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🏭</div>
          <div class="stat-content">
            <p class="stat-label">Bahan Baku</p>
            <h3 class="stat-value">-</h3>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🚚</div>
          <div class="stat-content">
            <p class="stat-label">Supplier</p>
            <h3 class="stat-value">-</h3>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <p class="stat-label">Buyer</p>
            <h3 class="stat-value">-</h3>
          </div>
        </div>
      </div> -->
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '../components/DashboardLayout.vue'
import { ref, onMounted } from 'vue'

const userName = ref('User')

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      userName.value = user.name || 'User'
    } catch (error) {
      console.error('Failed to parse user data:', error)
    }
  }
})
</script>

<style scoped>
.dashboard-home {
  max-width: 1400px;
  margin: 0 auto;
}

/* Welcome Section */
.welcome-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
}

.welcome-content {
  text-align: center;
  max-width: 600px;
}

.welcome-icon {
  font-size: 80px;
  margin-bottom: 24px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.welcome-title {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 16px;
  line-height: 1.3;
}

.welcome-subtitle {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
}

/* Stats Grid (Optional) */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 40px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 40px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  border-radius: 12px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 4px;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .welcome-icon {
    font-size: 60px;
  }

  .welcome-title {
    font-size: 28px;
  }

  .welcome-subtitle {
    font-size: 14px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
