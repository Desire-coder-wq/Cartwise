import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api.js'

export const useItemsStore = defineStore('items', () => {
  const items = ref([])
  const loading = ref(false)
  const stats = ref({
    totalItems: 0,
    completedItems: 0,
    pendingItems: 0,
    completionRate: 0
  })

  const fetchItems = async () => {
    loading.value = true
    try {
      const response = await api.get('/api/items')
      if (response.data.success) {
        items.value = response.data.items
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/items/stats')
      if (response.data.success) {
        stats.value = response.data.stats
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const addItem = async (itemData) => {
    try {
      const response = await api.post('/api/items', itemData)
      if (response.data.success) {
        items.value.unshift(response.data.item)
        await fetchStats()
        return { success: true }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add item'
      }
    }
  }

  const updateItem = async (id, itemData) => {
    try {
      const response = await api.put(`/api/items/${id}`, itemData)
      if (response.data.success) {
        const index = items.value.findIndex(item => item.id === id)
        if (index !== -1) {
          items.value[index] = response.data.item
        }
        return { success: true }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update item'
      }
    }
  }

  const toggleItem = async (id) => {
    try {
      const response = await api.patch(`/api/items/${id}/toggle`)
      if (response.data.success) {
        const index = items.value.findIndex(item => item.id === id)
        if (index !== -1) {
          items.value[index] = response.data.item
        }
        await fetchStats()
        return { success: true }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to toggle item'
      }
    }
  }

  const deleteItem = async (id) => {
    try {
      const response = await api.delete(`/api/items/${id}`)
      if (response.data.success) {
        items.value = items.value.filter(item => item.id !== id)
        await fetchStats()
        return { success: true }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete item'
      }
    }
  }

  const clearCompleted = async () => {
    try {
      const response = await api.delete('/api/items/completed/clear')
      if (response.data.success) {
        items.value = items.value.filter(item => !item.completed)
        await fetchStats()
        return { success: true, deletedCount: response.data.deletedCount }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clear completed items'
      }
    }
  }

  return {
    items,
    loading,
    stats,
    fetchItems,
    fetchStats,
    addItem,
    updateItem,
    toggleItem,
    deleteItem,
    clearCompleted
  }
})
