<template>
  <div v-if="totalPages > 1" class="pagination-container">
    <div class="pagination-info">
      <span>Menampilkan {{ startItem }}-{{ endItem }} dari {{ totalItems }} data</span>
    </div>

    <div class="pagination-controls">
      <button
        class="pagination-btn pagination-prev"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        <span>‹</span>
        Sebelumnya
      </button>

      <div class="pagination-numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          class="pagination-btn pagination-number"
          :class="{ active: page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
      </div>

      <button
        class="pagination-btn pagination-next"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        Selanjutnya
        <span>›</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  perPage: {
    type: Number,
    default: 10,
  },
})

const emit = defineEmits(['page-change'])

const startItem = computed(() => {
  return (props.currentPage - 1) * props.perPage + 1
})

const endItem = computed(() => {
  const end = props.currentPage * props.perPage
  return end > props.totalItems ? props.totalItems : end
})

const visiblePages = computed(() => {
  const pages = []
  const total = props.totalPages
  const current = props.currentPage

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }

  return pages.filter((page) => page !== '...' || pages.indexOf(page) === pages.lastIndexOf(page))
})

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page)
  }
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: white;
  border-top: 1px solid #e5e7eb;
  margin-top: 20px;
}

.pagination-info {
  font-size: 14px;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 40px;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.pagination-prev,
.pagination-next {
  font-weight: 600;
}

.pagination-numbers {
  display: flex;
  gap: 4px;
  margin: 0 12px;
}

@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    gap: 16px;
    padding: 16px 20px;
  }

  .pagination-info {
    order: 2;
  }

  .pagination-controls {
    order: 1;
  }

  .pagination-numbers {
    margin: 0 8px;
  }
}
</style>
