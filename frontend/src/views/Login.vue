<template>
  <div class="login-container">
    <div class="image-section">
      <img src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80" alt="Fresh Groceries" />
    </div>
    <div class="form-section">
      <router-link to="/" class="back-link">Back to Home</router-link>
      <h2>Welcome Back</h2>
      <p class="subtitle">Login to your account</p>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            @input="clearError('email')"
          />
          <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              required
              @input="clearError('password')"
            />
            <span class="toggle-password" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'fa fa-eye' : 'fa fa-eye-slash'"></i>
            </span>
          </div>
          <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
        </div>
        
        <div class="remember-forgot">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe" />
            <span>Remember me</span>
          </label>
          <a href="#" class="forgot-password">Forgot password?</a>
        </div>
        
        <button type="submit" class="btn" :disabled="loading">
          <span v-if="loading">Logging in...</span>
          <span v-else>Login</span>
        </button>
      </form>
      
      <div class="register-link">
        Don't have an account? <router-link to="/register">Register here</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const errors = ref({})

const clearError = (field) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
  if (errorMessage.value) {
    errorMessage.value = ''
  }
}

const validateForm = () => {
  errors.value = {}
  
  if (!email.value.trim()) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Please enter a valid email address'
  }
  
  if (!password.value.trim()) {
    errors.value.password = 'Password is required'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleLogin = async () => {
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  errorMessage.value = ''
  
  const result = await authStore.login(email.value, password.value, rememberMe.value)
  
  if (result.success) {
    router.push('/dashboard')
  } else {
    errorMessage.value = result.message
    if (result.field) {
      errors.value[result.field] = result.message
    }
  }
  
  loading.value = false
}
</script>

<style scoped>
.login-container {
  display: flex;
  width: 100%;
  height: 100vh;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.image-section {
  position: absolute;
  left: -100px;
  top: 0;
  height: 100vh;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.image-section img {
  width: 120%;
  height: 100vh;
  object-fit: cover;
  border-radius: 0 50px 50px 0;
}

.form-section {
  position: relative;
  z-index: 10;
  margin-left: auto;
  margin-right: 100px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  max-width: 500px;
}

.back-link {
  color: #F59E0B;
  text-decoration: none;
  font-size: 0.9em;
  display: inline-block;
  margin-bottom: 20px;
}

.back-link:hover {
  text-decoration: underline;
}

h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 2em;
}

.subtitle {
  color: #666;
  margin-bottom: 30px;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  width: 100%;
}

.field-error {
  color: #ff4444;
  font-size: 0.8em;
  margin-top: 4px;
  display: block;
}

form {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  color: #333;
  font-weight: 600;
  margin-bottom: 8px;
}

input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s;
  background: rgba(255, 255, 255, 0.9);
}

input:focus {
  outline: none;
  border-color: #F59E0B;
  background: #fff;
}

.password-wrapper {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #666;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
}

.remember-me input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.forgot-password {
  color: #F59E0B;
  text-decoration: none;
  font-size: 0.9em;
}

.forgot-password:hover {
  text-decoration: underline;
}

.btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(245, 158, 11, 0.4);
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
  width: 100%;
}

.register-link a {
  color: #F59E0B;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}

@media (max-width: 968px) {
  .login-container {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }

  .image-section {
    position: relative;
    left: 0;
    width: 100%;
    height: 300px;
  }

  .image-section img {
    width: 100%;
    height: 100%;
    border-radius: 0 0 30px 30px;
  }

  .form-section {
    margin: 40px auto;
    padding: 0 40px;
  }
}
</style>
