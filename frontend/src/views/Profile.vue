<template>
  <div class="profile-page">
    <nav class="navbar">
      <h1>🛒 CartWise</h1>
      <div class="nav-right">
        <router-link to="/dashboard" class="nav-btn">Dashboard</router-link>
        <router-link to="/history" class="nav-btn">History</router-link>
        <button @click="handleLogout" class="nav-btn">Logout</button>
      </div>
    </nav>
    
    <div class="container">
      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-image-container">
            <img :src="user ? user.profileImage : '/uploads/default-avatar.png'" alt="Profile" class="profile-image" />
            <label class="change-image-btn">
              <input type="file" accept="image/*" @change="handleImageChange" />
              <i class="fa fa-camera"></i>
            </label>
          </div>
          <h2>{{ user ? user.username : '' }}</h2>
          <p class="email">{{ user ? user.email : '' }}</p>
        </div>
        
        <div class="profile-content">
          <div class="section">
            <h3>📝 Update Profile</h3>
            <form @submit.prevent="handleUpdateProfile">
              <div class="form-group">
                <label>Username</label>
                <input type="text" v-model="username" required />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" v-model="email" required />
              </div>
              <div class="form-group">
                <label>Status</label>
                <input type="text" v-model="status" placeholder="Hey there! I am using Grocery Buddy!" />
              </div>
              <button type="submit" class="btn-save">Save Changes</button>
            </form>
          </div>
          
          <div class="section">
            <h3>🔒 Change Password</h3>
            <form @submit.prevent="handleChangePassword">
              <div class="form-group">
                <label>Current Password</label>
                <input type="password" v-model="currentPassword" required />
              </div>
              <div class="form-group">
                <label>New Password</label>
                <input type="password" v-model="newPassword" required />
              </div>
              <div class="form-group">
                <label>Confirm New Password</label>
                <input type="password" v-model="confirmNewPassword" required />
              </div>
              <button type="submit" class="btn-save">Change Password</button>
            </form>
          </div>
          
          <div class="section danger-zone">
            <h3>⚠️ Danger Zone</h3>
            <p>Once you delete your account, there is no going back. Please be certain.</p>
            <button @click="handleDeleteAccount" class="btn-delete">Delete Account</button>
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

const user = computed(() => authStore.user)
const username = ref('')
const email = ref('')
const status = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')

onMounted(() => {
  if (user.value) {
    username.value = user.value.username
    email.value = user.value.email
    status.value = user.value.status || ''
  }
})

const handleImageChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const formData = new FormData()
  formData.append('profileImage', file)
  
  try {
    const response = await axios.post('/dashboard/profile/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (response.data.success) {
      await authStore.checkAuth()
      alert('Profile image updated successfully!')
    }
  } catch (error) {
    alert('Failed to update profile image')
  }
}

const handleUpdateProfile = async () => {
  try {
    const response = await axios.post('/dashboard/update-status', {
      status: status.value
    })
    
    if (response.data.success) {
      await authStore.checkAuth()
      alert('Profile updated successfully!')
    }
  } catch (error) {
    alert('Failed to update profile')
  }
}

const handleChangePassword = async () => {
  if (newPassword.value !== confirmNewPassword.value) {
    alert('New passwords do not match')
    return
  }
  
  if (newPassword.value.length < 6) {
    alert('New password must be at least 6 characters')
    return
  }
  
  try {
    const response = await axios.post('/dashboard/profile/password', {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    })
    
    if (response.data.success) {
      currentPassword.value = ''
      newPassword.value = ''
      confirmNewPassword.value = ''
      alert('Password changed successfully!')
    }
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to change password')
  }
}

const handleDeleteAccount = async () => {
  if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    return
  }
  
  try {
    const response = await axios.delete('/dashboard/profile/delete')
    
    if (response.data.success) {
      await authStore.logout()
      router.push('/')
    }
  } catch (error) {
    alert('Failed to delete account')
  }
}

const handleLogout = async () => {
  const result = await authStore.logout()
  if (result.success) {
    router.push('/login')
  }
}
</script>

<style scoped>
.profile-page {
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
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.profile-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
  color: white;
  padding: 40px;
  text-align: center;
}

.profile-image-container {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.profile-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid white;
  object-fit: cover;
}

.change-image-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: white;
  color: #F59E0B;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.change-image-btn input {
  display: none;
}

.profile-header h2 {
  margin: 0;
  font-size: 1.8em;
}

.profile-header .email {
  margin: 5px 0 0;
  opacity: 0.9;
}

.profile-content {
  padding: 30px;
}

.section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid #e0e0e0;
}

.section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.section h3 {
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #333;
  font-weight: 600;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #F59E0B;
}

.btn-save {
  padding: 12px 30px;
  background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s;
}

.btn-save:hover {
  transform: translateY(-2px);
}

.danger-zone {
  background: #fff5f5;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #feb2b2;
}

.danger-zone h3 {
  color: #c53030;
}

.danger-zone p {
  color: #742a2a;
  margin-bottom: 15px;
}

.btn-delete {
  padding: 12px 30px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s;
}

.btn-delete:hover {
  transform: translateY(-2px);
  background: #c0392b;
}
</style>
