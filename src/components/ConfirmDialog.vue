<template>
  <div v-if="show" class="modal-overlay" @click="handleCancel">
    <div class="modal-container confirm-modal" @click.stop>
      <div class="modal-header">
        <div class="header-content">
          <span class="warning-icon">⚠️</span>
          <h2>{{ title }}</h2>
        </div>
      </div>

      <div class="modal-body">
        <p class="confirm-message">{{ message }}</p>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn-cancel" @click="handleCancel">
          {{ cancelText }}
        </button>
        <button type="button" class="btn-delete" @click="handleConfirm">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Konfirmasi Hapus',
  },
  message: {
    type: String,
    default: 'Apakah Anda yakin ingin menghapus data ini?',
  },
  confirmText: {
    type: String,
    default: 'Hapus',
  },
  cancelText: {
    type: String,
    default: 'Batal',
  },
})

const emit = defineEmits(['confirm', 'cancel'])

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease-out;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

.confirm-modal {
  border-top: 4px solid #ef4444;
}

.modal-header {
  padding: 24px 28px 16px;
  border-bottom: none;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.warning-icon {
  font-size: 32px;
  line-height: 1;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.modal-body {
  padding: 0 28px 24px;
}

.confirm-message {
  margin: 0;
  font-size: 15px;
  color: #4b5563;
  line-height: 1.6;
  padding-left: 44px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-delete {
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background-color: white;
  color: #374151;
  border: 1.5px solid #d1d5db;
}

.btn-cancel:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.btn-delete {
  background-color: #ef4444;
  color: white;
}

.btn-delete:hover {
  background-color: #dc2626;
}

.btn-delete:active {
  transform: scale(0.98);
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
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
