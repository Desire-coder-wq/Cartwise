<template>
  <div class="dashboard">
    <div class="floating-groceries">
      <div class="grocery-item">🍎</div>
      <div class="grocery-item">🥖</div>
      <div class="grocery-item">🥛</div>
      <div class="grocery-item">🧀</div>
      <div class="grocery-item">🥩</div>
      <div class="grocery-item">🍞</div>
      <div class="grocery-item">🥦</div>
      <div class="grocery-item">🍕</div>
      <div class="grocery-item">🥐</div>
      <div class="grocery-item">🍩</div>
    </div>
    
    <nav class="navbar">
      <h1>🛒 CartWise</h1>
      <div class="nav-right">
        <div class="user-info">
          <img :src="user && user.profileImage ? user.profileImage : '/uploads/default-avatar.png'" alt="Profile" class="profile-image" />
          <span class="user-email">{{ user ? user.email : '' }}</span>
        </div>
        <router-link to="/profile" class="nav-btn">Profile</router-link>
        <router-link to="/history" class="nav-btn">History</router-link>
        <button @click="handleLogout" class="nav-btn">Logout</button>
      </div>
    </nav>
    
    <div class="container">
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon total">📦</div>
          <div class="stat-info">
            <h3>{{ stats.totalItems }}</h3>
            <p>Total Items</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purchased">✅</div>
          <div class="stat-info">
            <h3>{{ stats.completedItems }}</h3>
            <p>Purchased</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon pending">⏳</div>
          <div class="stat-info">
            <h3>{{ stats.pendingItems }}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon budget">💰</div>
          <div class="stat-info">
            <h3>{{ stats.completionRate }}%</h3>
            <p>Completion Rate</p>
          </div>
        </div>
      </div>
      
      <div class="add-item-section">
        <h3>➕ Add New Item</h3>
        <form @submit.prevent="handleAddItem" class="add-item-form">
          <div class="form-group">
            <label>Item Name</label>
            <input type="text" v-model="newItem.name" placeholder="Enter item name" required />
          </div>
          <div class="form-group">
            <label>Quantity</label>
            <input type="text" v-model="newItem.quantity" placeholder="1" />
          </div>
          <div class="form-group">
            <label>Price</label>
            <input type="number" v-model="newItem.price" placeholder="0.00" step="0.01" min="0" />
          </div>
          <div class="form-group">
            <label>Category</label>
            <select v-model="newItem.category">
              <option value="Produce">Produce</option>
              <option value="Dairy">Dairy</option>
              <option value="Meat">Meat</option>
              <option value="Bakery">Bakery</option>
              <option value="Frozen">Frozen</option>
              <option value="Beverages">Beverages</option>
              <option value="Snacks">Snacks</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button type="submit" class="btn-add">
            <i class="fa fa-plus"></i> Add Item
          </button>
        </form>
      </div>
      
      <div class="table-section">
        <div class="table-header">
          <h3>📋 Shopping List</h3>
          <div class="filter-tabs">
            <button
              :class="['filter-tab', { active: filter === 'all' }]"
              @click="filter = 'all'"
            >
              All
            </button>
            <button
              :class="['filter-tab', { active: filter === 'pending' }]"
              @click="filter = 'pending'"
            >
              Pending
            </button>
            <button
              :class="['filter-tab', { active: filter === 'completed' }]"
              @click="filter = 'completed'"
            >
              Completed
            </button>
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th></th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Date Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredItems"
              :key="item.id"
              :class="{ completed: item.completed }"
            >
              <td class="checkbox-cell">
                <input
                  type="checkbox"
                  :checked="item.completed"
                  @change="handleToggleItem(item.id)"
                />
              </td>
              <td class="item-name">{{ item.name }}</td>
              <td>
                <span :class="['category-badge', item.category.toLowerCase()]">
                  {{ item.category }}
                </span>
              </td>
              <td>{{ item.quantity }}</td>
              <td class="price-cell">${{ item.price ? item.price.toFixed(2) : '0.00' }}</td>
              <td class="date-cell">
                <span class="date-added">{{ formatDate(item.createdAt) }}</span>
              </td>
              <td class="action-buttons">
                <button class="btn-action edit" @click="openEditModal(item)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn-action delete" @click="handleDeleteItem(item.id)">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="actions-section">
          <button @click="handleClearCompleted" class="btn-clear-completed">
            <i class="fa fa-check-circle"></i> Clear Completed
          </button>
          <button @click="handleClearAll" class="btn-clear-all">
            <i class="fa fa-trash"></i> Clear All
          </button>
        </div>
      </div>
    </div>
    
    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="edit-card">
        <div class="edit-card-header">
          <h3>✏️ Edit Item</h3>
          <button class="close-btn" @click="closeEditModal">×</button>
        </div>
        <form @submit.prevent="handleUpdateItem" class="edit-form">
          <div class="form-group">
            <label>Item Name</label>
            <input type="text" v-model="editingItem.name" required />
          </div>
          <div class="form-group">
            <label>Quantity</label>
            <input type="text" v-model="editingItem.quantity" />
          </div>
          <div class="form-group">
            <label>Price</label>
            <input type="number" v-model="editingItem.price" step="0.01" min="0" />
          </div>
          <div class="form-group">
            <label>Category</label>
            <select v-model="editingItem.category">
              <option value="Produce">Produce</option>
              <option value="Dairy">Dairy</option>
              <option value="Meat">Meat</option>
              <option value="Bakery">Bakery</option>
              <option value="Frozen">Frozen</option>
              <option value="Beverages">Beverages</option>
              <option value="Snacks">Snacks</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeEditModal">Cancel</button>
            <button type="submit" class="btn-save">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useItemsStore } from '../stores/items'

const router = useRouter()
const authStore = useAuthStore()
const itemsStore = useItemsStore()

const user = computed(() => authStore.user)
const stats = computed(() => itemsStore.stats)
const items = computed(() => itemsStore.items)

const filter = ref('all')
const showEditModal = ref(false)
const editingItem = ref({})
const newItem = ref({
  name: '',
  quantity: '1',
  price: 0,
  category: 'Other'
})

const filteredItems = computed(() => {
  if (filter.value === 'pending') {
    return items.value.filter(item => !item.completed)
  } else if (filter.value === 'completed') {
    return items.value.filter(item => item.completed)
  }
  return items.value
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const handleAddItem = async () => {
  if (!newItem.value.name.trim()) return
  
  const result = await itemsStore.addItem(newItem.value)
  if (result.success) {
    newItem.value = {
      name: '',
      quantity: '1',
      price: 0,
      category: 'Other'
    }
  }
}

const handleToggleItem = async (id) => {
  await itemsStore.toggleItem(id)
}

const handleDeleteItem = async (id) => {
  if (confirm('Are you sure you want to delete this item?')) {
    await itemsStore.deleteItem(id)
  }
}

const handleClearCompleted = async () => {
  if (confirm('Are you sure you want to clear all completed items?')) {
    await itemsStore.clearCompleted()
  }
}

const handleClearAll = async () => {
  if (confirm('Are you sure you want to clear all items? This will move them to history.')) {
    try {
      const response = await fetch('/history/clear-shopping-list', {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        await itemsStore.fetchItems()
        await itemsStore.fetchStats()
      }
    } catch (error) {
      console.error('Error clearing all items:', error)
    }
  }
}

const openEditModal = (item) => {
  editingItem.value = { ...item }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingItem.value = {}
}

const handleUpdateItem = async () => {
  const result = await itemsStore.updateItem(editingItem.value.id, editingItem.value)
  if (result.success) {
    closeEditModal()
  }
}

const handleLogout = async () => {
  const result = await authStore.logout()
  if (result.success) {
    router.push('/login')
  }
}

onMounted(() => {
  itemsStore.fetchItems()
  itemsStore.fetchStats()
})
</script>

<style scoped>
.dashboard {
  position: relative;
  min-height: 100vh;
}

.floating-groceries {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.grocery-item {
  position: absolute;
  font-size: 4em;
  opacity: 0.5;
  animation: float 20s infinite ease-in-out;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
}

.grocery-item:nth-child(1) { left: 10%; top: 20%; animation-delay: 0s; animation-duration: 25s; font-size: 3.5em; }
.grocery-item:nth-child(2) { left: 80%; top: 30%; animation-delay: 2s; animation-duration: 22s; font-size: 4.5em; }
.grocery-item:nth-child(3) { left: 20%; top: 60%; animation-delay: 4s; animation-duration: 28s; font-size: 4em; }
.grocery-item:nth-child(4) { left: 70%; top: 70%; animation-delay: 6s; animation-duration: 24s; font-size: 3.8em; }
.grocery-item:nth-child(5) { left: 40%; top: 15%; animation-delay: 8s; animation-duration: 26s; font-size: 4.2em; }
.grocery-item:nth-child(6) { left: 90%; top: 50%; animation-delay: 10s; animation-duration: 23s; font-size: 3.6em; }
.grocery-item:nth-child(7) { left: 15%; top: 80%; animation-delay: 12s; animation-duration: 27s; font-size: 4.4em; }
.grocery-item:nth-child(8) { left: 60%; top: 10%; animation-delay: 14s; animation-duration: 21s; font-size: 3.9em; }
.grocery-item:nth-child(9) { left: 5%; top: 40%; animation-delay: 16s; animation-duration: 29s; font-size: 4.1em; }
.grocery-item:nth-child(10) { left: 85%; top: 85%; animation-delay: 18s; animation-duration: 25s; font-size: 3.7em; }

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-30px) rotate(5deg);
  }
  50% {
    transform: translateY(-60px) rotate(-5deg);
  }
  75% {
    transform: translateY(-30px) rotate(3deg);
  }
}

.navbar,
.container {
  position: relative;
  z-index: 1;
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

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #F59E0B;
  object-fit: cover;
}

.user-email {
  font-size: 0.9em;
  color: #666;
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon.purchased {
  background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
  color: white;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
  color: white;
}

.stat-icon.budget {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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

.add-item-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.add-item-section h3 {
  margin-bottom: 20px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-item-form {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr auto;
  gap: 15px;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 0.9em;
  color: #666;
  font-weight: 600;
}

.add-item-form input,
.add-item-form select {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s;
}

.add-item-form input:focus,
.add-item-form select:focus {
  outline: none;
  border-color: #667eea;
}

.btn-add {
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.btn-add:hover {
  transform: translateY(-2px);
}

.table-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-header h3 {
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-tabs {
  display: flex;
  gap: 10px;
}

.filter-tab {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  color: #666;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.filter-tab:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.items-table thead {
  background: #f8f9fa;
}

.items-table th {
  padding: 15px;
  text-align: left;
  color: #333;
  font-weight: 600;
  border-bottom: 2px solid #e0e0e0;
}

.items-table th:first-child {
  width: 40px;
  text-align: center;
}

.items-table td {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.items-table tbody tr {
  transition: background 0.2s;
}

.items-table tbody tr:hover {
  background: #f8f9fa;
}

.items-table tbody tr.completed {
  opacity: 0.6;
}

.items-table tbody tr.completed .item-name {
  text-decoration: line-through;
}

.checkbox-cell {
  text-align: center;
}

.checkbox-cell input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #667eea;
}

.item-name {
  font-weight: 600;
  color: #333;
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

.price-cell {
  font-weight: bold;
  color: #2ecc71;
}

.date-cell {
  text-align: center;
  color: #666;
  font-size: 0.9em;
}

.date-added {
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  color: white;
  font-size: 0.9em;
  font-weight: 600;
}

.btn-action.edit {
  background: #3498db;
}

.btn-action.delete {
  background: #e74c3c;
}

.actions-section {
  margin-top: 20px;
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-clear-completed, .btn-clear-all {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  color: white;
}

.btn-clear-completed {
  background: linear-gradient(135deg, #11998e, #38ef7d);
}

.btn-clear-completed:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17, 153, 142, 0.3);
}

.btn-clear-all {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.btn-clear-all:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.edit-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  overflow: hidden;
}

.edit-card-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-card-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5em;
  cursor: pointer;
}

.edit-form {
  padding: 20px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-cancel {
  padding: 10px 20px;
  background: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-save {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

@media (max-width: 768px) {
  .add-item-form {
    grid-template-columns: 1fr;
  }
  
  .navbar {
    flex-direction: column;
    gap: 15px;
  }
  
  .nav-right {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
