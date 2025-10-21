<template>
  <div v-if="show" class="notification-overlay" @click="closeNotification">
    <div class="notification-container" @click.stop>
      <div class="notification-content" :class="type">
        <div class="notification-icon">
          <span v-if="type === 'success'">✅</span>
          <span v-else-if="type === 'error'">❌</span>
          <span v-else-if="type === 'warning'">⚠️</span>
          <span v-else>ℹ️</span>
        </div>
        <div class="notification-message">
          <h4 class="notification-title">{{ title }}</h4>
          <p class="notification-text">{{ message }}</p>
        </div>
        <button class="notification-close" @click="closeNotification">
          <span>&times;</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value),
  },
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    default: 3000,
  },
})

const emit = defineEmits(['close'])

const closeNotification = () => {
  emit('close')
}

// Auto close after duration
watch(
  () => props.show,
  (newVal) => {
    if (newVal && props.duration > 0) {
      setTimeout(() => {
        emit('close')
      }, props.duration)
    }
  },
)
</script>

<style scoped>
.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}

.notification-container {
  max-width: 400px;
  width: 90%;
  animation: slideIn 0.3s ease-out;
}

.notification-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
}

.notification-content.success {
  border-left: 4px solid #22c55e;
}

.notification-content.error {
  border-left: 4px solid #ef4444;
}

.notification-content.warning {
  border-left: 4px solid #f59e0b;
}

.notification-content.info {
  border-left: 4px solid #3b82f6;
}

.notification-icon {
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-message {
  flex: 1;
}

.notification-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.notification-text {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.notification-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.notification-close:hover {
  background: #f3f4f6;
  color: #6b7280;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
