<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container modal-large">
      <div class="modal-header">
        <h3 class="modal-title">📜 Audit Trail - History Jurnal</h3>
        <button @click="$emit('close')" class="modal-close">✕</button>
      </div>
      
      <div class="modal-body">
        <!-- LOADING -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Memuat history...</p>
        </div>

        <!-- EMPTY -->
        <div v-else-if="history.length === 0" class="empty-state">
          <span class="empty-icon">📭</span>
          <p class="empty-text">Belum ada history</p>
        </div>

        <!-- TIMELINE -->
        <div v-else class="history-timeline">
          <div
            v-for="(item, index) in history"
            :key="item.id"
            class="timeline-item"
          >
            <!-- CONNECTOR LINE -->
            <div v-if="index < history.length - 1" class="timeline-line"></div>

            <!-- ICON -->
            <div :class="['timeline-icon', `icon-${item.action.toLowerCase()}`]">
              {{ getActionIcon(item.action) }}
            </div>

            <!-- CONTENT -->
            <div class="timeline-content">
              <div class="timeline-header">
                <h4 class="timeline-action">{{ getActionLabel(item.action) }}</h4>
                <span class="timeline-time">{{ formatDateTime(item.created_at) }}</span>
              </div>

              <div class="timeline-details">
                <p class="timeline-user">
                  <strong>{{ item.performed_by?.name || 'System' }}</strong>
                </p>

                <!-- REASON -->
                <p v-if="item.reason" class="timeline-reason">
                  <span class="reason-label">Alasan:</span>
                  <span class="reason-text">{{ item.reason }}</span>
                </p>

                <!-- OLD/NEW DATA -->
                <div v-if="item.old_data || item.new_data" class="timeline-changes">
                  <div v-if="item.old_data" class="change-block">
                    <span class="change-label">Sebelum:</span>
                    <pre class="change-data">{{ formatData(item.old_data) }}</pre>
                  </div>
                  <div v-if="item.new_data" class="change-block">
                    <span class="change-label">Sesudah:</span>
                    <pre class="change-data">{{ formatData(item.new_data) }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-secondary">Tutup</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '../../../api/axios'

const props = defineProps({
  journalId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['close'])

const history = ref([])
const loading = ref(true)

const fetchHistory = async () => {
  try {
    loading.value = true
    const response = await apiClient.get(`/journal-entries/${props.journalId}/history`)
    history.value = response.data.data
  } catch (error) {
    console.error('Error fetching history:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchHistory)

const getActionIcon = (action) => {
  const icons = {
    CREATED: '➕',
    POSTED: '✅',
    UNPOSTED: '⚠️',
    EDITED: '✏️',
    VOIDED: '❌',
  }
  return icons[action] || '📌'
}

const getActionLabel = (action) => {
  const labels = {
    CREATED: 'Jurnal Dibuat',
    POSTED: 'Jurnal Di-Post',
    UNPOSTED: 'Jurnal Di-Unpost',
    EDITED: 'Jurnal Diedit',
    VOIDED: 'Jurnal Di-Void',
  }
  return labels[action] || action
}

const formatDateTime = (datetime) => {
  if (!datetime) return '-'
  return new Date(datetime).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatData = (data) => {
  if (!data) return '-'
  return JSON.stringify(data, null, 2)
}
</script>

<style scoped>
/* MODAL LARGE */
.modal-large {
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

/* LOADING STATE */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* EMPTY STATE */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.empty-text {
  color: #6b7280;
  font-size: 16px;
}

/* TIMELINE */
.history-timeline {
  padding: 20px 0;
}

.timeline-item {
  position: relative;
  display: flex;
  gap: 20px;
  padding-bottom: 32px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

/* TIMELINE LINE */
.timeline-line {
  position: absolute;
  left: 19px;
  top: 40px;
  bottom: -8px;
  width: 2px;
  background: #e5e7eb;
}

/* TIMELINE ICON */
.timeline-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: white;
  border: 3px solid #e5e7eb;
  z-index: 1;
}

.icon-created {
  border-color: #3b82f6;
  background: #eff6ff;
}

.icon-posted {
  border-color: #10b981;
  background: #ecfdf5;
}

.icon-unposted {
  border-color: #f59e0b;
  background: #fef3c7;
}

.icon-edited {
  border-color: #8b5cf6;
  background: #f5f3ff;
}

.icon-voided {
  border-color: #ef4444;
  background: #fee2e2;
}

/* TIMELINE CONTENT */
.timeline-content {
  flex: 1;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.timeline-action {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.timeline-time {
  font-size: 13px;
  color: #6b7280;
}

/* TIMELINE DETAILS */
.timeline-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-user {
  font-size: 14px;
  color: #374151;
  margin: 0;
}

/* REASON */
.timeline-reason {
  background: #fef3c7;
  border-left: 3px solid #f59e0b;
  padding: 12px;
  border-radius: 4px;
  margin: 0;
  font-size: 14px;
}

.reason-label {
  font-weight: 600;
  color: #92400e;
  display: block;
  margin-bottom: 4px;
}

.reason-text {
  color: #78350f;
}

/* CHANGES */
.timeline-changes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.change-block {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 12px;
}

.change-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.change-data {
  font-size: 13px;
  color: #374151;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Courier New', monospace;
  background: white;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .timeline-changes {
    grid-template-columns: 1fr;
  }
}
</style>