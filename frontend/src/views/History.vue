<template>
  <div class="history-page">
    <nav class="navbar">
      <h1>🛒 CartWise</h1>
      <div class="nav-right">
        <router-link to="/dashboard" class="nav-btn">Dashboard</router-link>
        <router-link to="/profile" class="nav-btn">Profile</router-link>
        <button @click="handleLogout" class="nav-btn">Logout</button>
      </div>
    </nav>
    
    <div class="container">
      <div class="history-header">
        <h2>📜 Shopping History</h2>
        <p>View your past shopping lists and spending</p>
      </div>
      
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon total">📦</div>
          <div class="stat-info">
            <h3>{{ stats.totalItems }}</h3>
            <p>Total Items</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon spent">💰</div>
          <div class="stat-info">
            <h3>{{ stats.totalSpent ? stats.totalSpent.toFixed(2) : '0.00' }}</h3>
            <p>Total Spent</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon lists">📋</div>
          <div class="stat-info">
            <h3>{{ stats.listsCleared }}</h3>
            <p>Lists Cleared</p>
          </div>
        </div>
      </div>
      
      <div class="history-actions">
        <button @click="handleClearHistory" class="btn-clear-history">
          <i class="fa fa-trash"></i> Clear All History
        </button>
      </div>
      
      <div class="history-list">
        <div v-if="loading" class="loading">Loading history...</div>
        <div v-else-if="history.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>No History Yet</h3>
          <p>Your shopping history will appear here once you clear items from your list.</p>
        </div>
        <div v-else class="history-items">
          <div v-for="(group, date) in groupedHistory" :key="date" class="history-group">
            <div class="group-header">
              <h3>{{ formatDate(date) }}</h3>
              <span class="item-count">{{ group.length }} items</span>
            </div>
            <div class="group-items">
              <div v-for="item in group" :key="item.id" class="history-item">
                <div class="item-info">
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-quantity">{{ item.quantity }}</span>
                </div>
                <div class="item-details">
                  <span :class="['category-badge', item.category ? item.category.toLowerCase() : '']">
                    {{ item.category }}
                  </span>
                  <span class="item-price">{{ item.price ? item.price.toFixed(2) : '0.00' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

const history = ref([])
const stats = ref({
  totalItems: 0,
  totalSpent: 0,
  listsCleared: 0
})
const loading = ref(true)

const groupedHistory = computed(() => {
  const groups = {}
  history.value.forEach(item => {
    const date = new Date(item.clearedAt).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
  })
  return groups
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const fetchHistory = async () => {
  try {
    const response = await axios.get('/history/api')
    if (response.data.success) {
      history.value = response.data.history
    }
  } catch (error) {
    console.error('Error fetching history:', error)
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const response = await axios.get('/history/stats')
    if (response.data.success) {
      stats.value = response.data.stats
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

const handleClearHistory = async () => {
  if (!confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
    return
  }
  
  try {
    const response = await axios.delete('/history/clear-all')
    if (response.data.success) {
      history.value = []
      stats.value = {
        totalItems: 0,
        totalSpent: 0,
        listsCleared: 0
      }
      alert('History cleared successfully!')
    }
  } catch (error) {
    alert('Failed to clear history')
  }
}

const handleLogout = async () => {
  const result = await authStore.logout()
  if (result.success) {
    router.push('/login')
  }
}

onMounted(() => {
  fetchHistory()
  fetchStats()
})
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.navbar {
  background: white;
  color: black;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.navbar h1 {
  font-size: 1.5em;
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-right {
  display: flex;
  gap: 15px;
  align-items: center;
}

.nav-btn {
  background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.3s;
  display: inline-block;
}

.nav-btn:hover {
  transform: translateY(-2px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.history-header {
  text-align: center;
  margin-bottom: 40px;
}

.history-header h2 {
  font-size: 2.5em;
  color: #333;
  margin-bottom: 10px;
}

.history-header p {
  color: #666;
  font-size: 1.1em;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5em;
}

.stat-icon.total {
  background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
  color: white;
}

.stat-icon.spent {
  background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
  color: white;
}

.stat-icon.lists {
  background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
  color: white;
}

.stat-info h3 {
  font-size: 1.8em;
  color: #333;
  margin-bottom: 5px;
}

.stat-info p {
  color: #666;
  font-size: 0.9em;
}

.history-actions {
  text-align: center;
  margin-bottom: 30px;
}

.btn-clear-history {
  padding: 12px 30px;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-clear-history:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.history-list {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1em;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 1.8em;
  color: #333;
  margin-bottom: 10px;
}

.empty-state p {
  color: #666;
  font-size: 1.1em;
}

.history-group {
  margin-bottom: 30px;
}

.history-group:last-child {
  margin-bottom: 0;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
}

.group-header h3 {
  color: #333;
  font-size: 1.2em;
}

.item-count {
  background: #F59E0B;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: 600;
}

.group-items {
  display: grid;
  gap: 10px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: background 0.2s;
}

.history-item:hover {
  background: #e9ecef;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.item-name {
  font-weight: 600;
  color: #333;
}

.item-quantity {
  color: #666;
  font-size: 0.9em;
}

.item-details {
  display: flex;
  align-items: center;
  gap: 15px;
}

.category-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 600;
}

.category-badge.produce { background: #d4edda; color: #155724; }
.category-badge.dairy { background: #fff3cd; color: #856404; }
.category-badge.meat { background: #f8d7da; color: #721c24; }
.category-badge.bakery { background: #d1ecf1; color: #0c5460; }
.category-badge.frozen { background: #e2e3e5; color: #383d41; }
.category-badge.beverages { background: #cce5ff; color: #004085; }
.category-badge.snacks { background: #f5c6cb; color: #721c24; }
.category-badge.other { background: #e7e7e7; color: #383838; }

.item-price {
  font-weight: bold;
  color: #2ecc71;
  font-size: 1.1em;
}
</style>
