<template>
  <div class="item-select-vs">
    <VueSelect
      :model-value="modelValue"
      :options="options"
      :reduce="(item) => item.id"
      label="label"
      :filterable="false"
      placeholder="🔍 Ketik untuk mencari barang..."
      :clearable="true"
      :loading="isLoading"
      @search="onSearch"
      @update:model-value="onUpdate"
    >
      <template #option="o">
        <div class="vs-item-option">
          <div class="vs-item-code">{{ o.code }}</div>
          <div class="vs-item-name">{{ o.name }}</div>
          <div class="vs-item-cat">{{ o.category_name }}</div>
        </div>
      </template>
      <template #selected-option="o">
        <div class="vs-selected-wrapper">
          <span v-if="o.code" class="vs-selected-code">{{ o.code }} — </span>
          <span>{{ o.name }}</span>
        </div>
      </template>
      <template #no-options="{ search }">
        <span v-if="search" class="vs-empty">Tidak ditemukan "{{ search }}"</span>
        <span v-else class="vs-empty">Ketik minimal 1 karakter...</span>
      </template>
    </VueSelect>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import apiClient from '../api/axios'
import { debounce } from 'lodash-es'

const props = defineProps({
  modelValue: { default: '' },
  categoryIds: { type: Array, default: () => [] },
  initialItem: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue'])

const options = ref([])
const isLoading = ref(false)
const selectedItemInternal = ref(null)

// Formatting item for vue-select display
const formatItem = (item) => ({
  ...item,
  label: item.code ? `${item.code} — ${item.name}` : item.name,
  category_name: item.category?.name || item.category_name || 'Lainnya',
})

// Initialize options with initial item if exists
const initOptions = () => {
  if (props.initialItem && props.initialItem.id) {
    selectedItemInternal.value = formatItem(props.initialItem)
    options.value = [selectedItemInternal.value]
  }
}

const onSearch = debounce(async (search, loading) => {
  if (!search) {
    options.value = selectedItemInternal.value ? [selectedItemInternal.value] : []
    return
  }

  loading(true)
  isLoading.value = true

  try {
    const params = {
      search: search,
      limit: 20,
    }
    if (props.categoryIds && props.categoryIds.length > 0) {
      params.category_ids = props.categoryIds.join(',')
    }

    const res = await apiClient.get('/materials', { params })
    const results = res.data?.data || res.data || []
    
    const formattedResults = results.map(formatItem)
    
    // Pastikan item yang sedang terpilih tetap ada di daftar agar tidak hilang labelnya
    if (selectedItemInternal.value) {
      const exists = formattedResults.find(r => r.id === selectedItemInternal.value.id)
      if (!exists) {
        formattedResults.unshift(selectedItemInternal.value)
      }
    }

    options.value = formattedResults
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    loading(false)
    isLoading.value = false
  }
}, 400)

const onUpdate = (val) => {
  // Cari objek item dari options untuk disimpan sebagai selectedItemInternal
  const itemObj = options.value.find(o => o.id === val)
  if (itemObj) {
    selectedItemInternal.value = itemObj
  } else if (!val) {
    selectedItemInternal.value = null
  }
  
  emit('update:modelValue', val ?? '')
}

onMounted(initOptions)

// Watch initialItem for changes (e.g. when Edit data is loaded)
watch(() => props.initialItem, initOptions, { deep: true })
</script>

<style scoped>
.item-select-vs {
  width: 100%;
}

:deep(.vs__dropdown-toggle) {
  padding: 0;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  min-height: 38px;
  transition: all 0.2s;
}

:deep(.vs--open .vs__dropdown-toggle) {
  border-color: #0369a1;
  box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.08);
}

:deep(.vs__selected) {
  margin: 4px 8px;
  padding: 0;
  color: #111827;
  font-size: 13px;
}

:deep(.vs__search) {
  padding: 4px 10px;
  margin: 0;
  font-size: 13px;
  color: #374151;
}

:deep(.vs__dropdown-menu) {
  border: 1.5px solid #0369a1;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  padding: 5px;
  z-index: 9999;
}

.vs-item-option {
  padding: 4px 0;
}

.vs-item-code {
  font-size: 11px;
  font-weight: 700;
  color: #0369a1;
  margin-bottom: 1px;
}

.vs-item-name {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
}

.vs-item-cat {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 2px;
  font-style: italic;
}

.vs-selected-code {
  font-weight: 700;
  color: #0369a1;
}

.vs-selected-wrapper {
  font-size: 13px;
}

.vs-empty {
  padding: 10px;
  font-size: 13px;
  color: #6b7280;
  display: block;
}

:deep(.vs__dropdown-option--highlight) {
  background: #eff6ff;
  color: #1d4ed8;
}

:deep(.vs__clear) {
  fill: #9ca3af;
}

:deep(.vs__open-indicator) {
  fill: #9ca3af;
  transform: scale(0.8);
}

:deep(.vs__spinner) {
  border-left-color: #0369a1;
}
</style>
