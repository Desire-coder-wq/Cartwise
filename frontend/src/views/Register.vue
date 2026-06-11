<template>
  <div class="main-wrapper">
    <div class="form-section">
      <div class="container">
        <router-link to="/" class="back-link">Back to Home</router-link>
        <h2>Create Account</h2>
        <p class="subtitle">Join Grocery Buddy today!</p>
        
        <div v-if="alertMessage" :class="['alert', alertType]">
          {{ alertMessage }}
        </div>
        
        <form @submit.prevent="handleRegister" novalidate>
          <div class="form-group">
            <label for="username">Username <span class="required">*</span></label>
            <input
              type="text"
              id="username"
              v-model="username"
              required
              autocomplete="username"
              placeholder="Choose a username"
              @input="clearError('username')"
            />
            <span v-if="errors.username" class="error-message show">{{ errors.username }}</span>
            <span v-if="successMessages.username" class="success-message show">{{ successMessages.username }}</span>
          </div>
          
          <div class="form-group">
            <label for="email">Email <span class="required">*</span></label>
            <input
              type="email"
              id="email"
              v-model="email"
              required
              autocomplete="email"
              placeholder="your@email.com"
              @input="clearError('email')"
            />
            <span v-if="errors.email" class="error-message show">{{ errors.email }}</span>
            <span v-if="successMessages.email" class="success-message show">{{ successMessages.email }}</span>
          </div>
          
          <div class="form-group">
            <label for="password">Password <span class="required">*</span></label>
            <input
              type="password"
              id="password"
              v-model="password"
              required
              autocomplete="new-password"
              placeholder="Create a strong password"
              @input="clearError('password')"
            />
            <span v-if="errors.password" class="error-message show">{{ errors.password }}</span>
            <div class="password-strength">
              <div class="strength-bar">
                <div :class="['strength-bar-fill', passwordStrength]"></div>
              </div>
              <span class="strength-text">{{ passwordStrengthText }}</span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirm Password <span class="required">*</span></label>
            <input
              type="password"
              id="confirmPassword"
              v-model="confirmPassword"
              required
              autocomplete="new-password"
              placeholder="Confirm your password"
              @input="clearError('confirmPassword')"
            />
            <span v-if="errors.confirmPassword" class="error-message show">{{ errors.confirmPassword }}</span>
            <span v-if="successMessages.confirmPassword" class="success-message show">{{ successMessages.confirmPassword }}</span>
          </div>
          
          <div class="form-group">
            <label for="profileImage">Profile Picture (Optional)</label>
            <div class="profile-upload-field" :class="{ 'has-file': profileImage }">
              <div class="upload-content">
                <div class="profile-preview-small">
                  <img v-if="profilePreview" :src="profilePreview" alt="Profile preview" />
                  <span v-else class="profile-preview-icon-small">👤</span>
                </div>
                <span class="upload-text" :class="{ 'has-file': profileImage }">
                  {{ profileImage ? profileImage.name : 'Choose a profile picture' }}
                </span>
              </div>
              <span class="upload-icon">📁</span>
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                @change="handleFileChange"
              />
            </div>
          </div>
          
          <button type="submit" class="btn" :disabled="loading">
            <span v-if="loading">Creating Account...</span>
            <span v-else>Create Account</span>
          </button>
        </form>
        
        <div class="login-link">
          Already have an account? <router-link to="/login">Login here</router-link>
        </div>
      </div>
    </div>
    
    <div class="image-section">
      <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80" alt="Fresh groceries" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const profileImage = ref(null)
const profilePreview = ref(null)
const loading = ref(false)
const alertMessage = ref('')
const alertType = ref('')
const errors = ref({})
const successMessages = ref({})

const passwordStrength = computed(() => {
  if (!password.value) return ''
  if (password.value.length < 8) return 'weak'
  if (!/[A-Z]/.test(password.value) || !/[a-z]/.test(password.value) || !/[0-9]/.test(password.value)) {
    return 'medium'
  }
  return 'strong'
})

const passwordStrengthText = computed(() => {
  if (!password.value) return ''
  if (passwordStrength.value === 'weak') return 'Weak password'
  if (passwordStrength.value === 'medium') return 'Medium strength'
  return 'Strong password'
})

const clearError = (field) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
  if (alertMessage.value) {
    alertMessage.value = ''
  }
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    profileImage.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      profilePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const validateForm = () => {
  errors.value = {}
  
  if (!username.value.trim()) {
    errors.value.username = 'Username is required'
  } else if (username.value.length < 3) {
    errors.value.username = 'Username must be at least 3 characters'
  } else if (username.value.length > 30) {
    errors.value.username = 'Username cannot exceed 30 characters'
  } else if (!/^[a-zA-Z0-9_]+$/.test(username.value)) {
    errors.value.username = 'Username can only contain letters, numbers, and underscores'
  }
  
  if (!email.value.trim()) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Please provide a valid email address'
  }
  
  if (!password.value) {
    errors.value.password = 'Password is required'
  } else if (password.value.length < 8) {
    errors.value.password = 'Password must be at least 8 characters'
  } else if (!/[A-Z]/.test(password.value)) {
    errors.value.password = 'Password must contain at least one uppercase letter'
  } else if (!/[a-z]/.test(password.value)) {
    errors.value.password = 'Password must contain at least one lowercase letter'
  } else if (!/[0-9]/.test(password.value)) {
    errors.value.password = 'Password must contain at least one number'
  }
  
  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Passwords do not match'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleRegister = async () => {
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  alertMessage.value = ''
  
  const formData = new FormData()
  formData.append('username', username.value)
  formData.append('email', email.value)
  formData.append('password', password.value)
  formData.append('confirmPassword', confirmPassword.value)
  if (profileImage.value) {
    formData.append('profileImage', profileImage.value)
  }
  
  const result = await authStore.register(formData)
  
  if (result.success) {
    alertType.value = 'success'
    alertMessage.value = result.message
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } else {
    alertType.value = 'error'
    alertMessage.value = result.message
    if (result.errors) {
      errors.value = result.errors
    }
  }
  
  loading.value = false
}
</script>

<style scoped>
.main-wrapper {
  display: flex;
  width: 100%;
  max-width: 1200px;
  gap: 40px;
  align-items: stretch;
  justify-content: center;
  margin: 0 auto;
  padding: 40px;
  min-height: 100vh;
}

.form-section {
  flex: 1;
  max-width: 500px;
  padding: 20px 0;
}

.image-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  border-radius: 20px 0 0 20px;
}

.image-section img {
  width: 120%;
  height: 100vh;
  object-fit: cover;
  object-position: center;
  border-radius: 20px 0 0 20px;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.15);
}

.container {
  width: 100%;
}

.back-link {
  color: #F59E0B;
  text-decoration: none;
  font-size: 0.85em;
  display: inline-block;
  margin-bottom: 15px;
  font-weight: 600;
}

.back-link:hover {
  text-decoration: underline;
}

h2 {
  color: #333;
  margin-bottom: 8px;
  font-size: 2em;
}

.subtitle {
  color: #666;
  margin-bottom: 25px;
  font-size: 0.95em;
}

form {
  width: 100%;
}

.form-group {
  margin-bottom: 18px;
}

label {
  display: block;
  color: #333;
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 0.9em;
}

.required {
  color: #e74c3c;
}

input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95em;
  transition: all 0.3s;
  background: white;
}

input:focus {
  outline: none;
  border-color: #F59E0B;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

input.error {
  border-color: #e74c3c;
}

input.success {
  border-color: #27ae60;
}

.error-message {
  color: #e74c3c;
  font-size: 0.8em;
  margin-top: 4px;
  display: none;
}

.error-message.show {
  display: block;
}

.success-message {
  color: #27ae60;
  font-size: 0.8em;
  margin-top: 4px;
  display: none;
}

.success-message.show {
  display: block;
}

.password-strength {
  margin-top: 6px;
}

.strength-bar {
  height: 3px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.strength-bar-fill {
  height: 100%;
  width: 0%;
  transition: width 0.3s, background 0.3s;
}

.strength-bar-fill.weak {
  width: 33%;
  background: #e74c3c;
}

.strength-bar-fill.medium {
  width: 66%;
  background: #f39c12;
}

.strength-bar-fill.strong {
  width: 100%;
  background: #27ae60;
}

.strength-text {
  font-size: 0.8em;
  margin-top: 3px;
  color: #666;
}

.profile-upload-field {
  position: relative;
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95em;
  transition: border-color 0.3s;
  cursor: pointer;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
}

.profile-upload-field:hover {
  border-color: #F59E0B;
}

.profile-upload-field.has-file {
  border-color: #27ae60;
}

.upload-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.profile-preview-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile-preview-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-preview-icon-small {
  font-size: 16px;
  color: #999;
}

.upload-text {
  color: #666;
  font-size: 0.95em;
  flex: 1;
}

.upload-text.has-file {
  color: #333;
}

.upload-icon {
  color: #F59E0B;
  font-size: 1.2em;
}

.profile-upload-field input[type=file] {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  padding: 0;
  border: none;
}

.btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  margin-top: 10px;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(245, 158, 11, 0.4);
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 0.9em;
}

.login-link a {
  color: #F59E0B;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}

.alert {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 0.9em;
}

.alert.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 968px) {
  .main-wrapper {
    flex-direction: column;
    gap: 30px;
  }

  .image-section {
    order: -1;
    height: 300px;
    margin: -40px -40px 0 -40px;
  }

  .image-section img {
    border-radius: 20px 20px 0 0;
    max-width: 100%;
  }
}

@media (max-width: 600px) {
  .main-wrapper {
    padding: 20px;
  }

  h2 {
    font-size: 1.6em;
  }

  .image-section img {
    max-width: 100%;
  }
}
</style>
