// src/composables/useNotification.js

import { ref } from 'vue'

// State ini sekarang menjadi 'global' di dalam modul ini
const showNotification = ref(false)
const notificationType = ref('info')
const notificationTitle = ref('')
const notificationMessage = ref('')

const showConfirmDialog = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
let onConfirmCallback = null // Variabel untuk menyimpan 'pekerjaan' yang harus dilakukan

// Ini adalah satu-satunya fungsi yang akan kita ekspor
export function useNotification() {
  // Fungsi untuk menampilkan notifikasi/toast
  const showSuccess = (title, message) => {
    notificationType.value = 'success'
    notificationTitle.value = title
    notificationMessage.value = message
    showNotification.value = true
  }

  const showError = (title, message) => {
    notificationType.value = 'error'
    notificationTitle.value = title
    notificationMessage.value = message
    showNotification.value = true
  }

  const closeNotification = () => {
    showNotification.value = false
  }

  // Fungsi untuk menampilkan dialog konfirmasi
  const showConfirm = (title, message, onConfirm) => {
    confirmTitle.value = title
    confirmMessage.value = message
    onConfirmCallback = onConfirm // Simpan 'pekerjaan' yang diberikan
    showConfirmDialog.value = true // Tampilkan dialog
  }

  // Fungsi yang dipanggil saat tombol 'Confirm' di dialog ditekan
  const handleConfirm = () => {
    if (typeof onConfirmCallback === 'function') {
      onConfirmCallback() // Jalankan 'pekerjaan' yang disimpan
    }
    showConfirmDialog.value = false // PENTING: Sembunyikan dialognya
  }

  // Fungsi yang dipanggil saat tombol 'Cancel' di dialog ditekan
  const handleCancel = () => {
    showConfirmDialog.value = false // PENTING: Sembunyikan dialognya
  }

  // Kembalikan semua state dan fungsi yang dibutuhkan oleh komponen
  return {
    showNotification,
    notificationType,
    notificationTitle,
    notificationMessage,
    showSuccess,
    showError,
    closeNotification,

    showConfirmDialog,
    confirmTitle,
    confirmMessage,
    showConfirm,
    handleConfirm,
    handleCancel,
  }
}

// Ekspor useConfirmDialog sebagai alias untuk useNotification agar kompatibel dengan import di komponen
export const useConfirmDialog = useNotification
