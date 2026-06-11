import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)
  const loading = ref(false)

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/check-auth')
      if (response.data.isAuthenticated) {
        user.value = response.data.user
        isAuthenticated.value = true
      } else {
        user.value = null
        isAuthenticated.value = false
      }
    } catch (error) {
      user.value = null
      isAuthenticated.value = false
    }
  }

  const login = async (email, password, rememberMe = false) => {
    loading.value = true
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        rememberMe
      })
      
      if (response.data.success) {
        user.value = response.data.user
        isAuthenticated.value = true
        return { success: true }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return {
        success: false,
        message: error.response && error.response.data && error.response.data.message ? error.response.data.message : 'Login failed'
      }
    } finally {
      loading.value = false
    }
  }

  const register = async (formData) => {
    loading.value = true
    try {
      const response = await api.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data.success) {
        return { success: true, message: response.data.message }
      }
      return { success: false, message: response.data.message, errors: response.data.errors }
    } catch (error) {
      return {
        success: false,
        message: error.response && error.response.data && error.response.data.message ? error.response.data.message : 'Registration failed',
        errors: error.response && error.response.data && error.response.data.errors ? error.response.data.errors : null
      }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
      user.value = null
      isAuthenticated.value = false
      return { success: true }
    } catch (error) {
      return { success: false, message: 'Logout failed' }
    }
  }

  return {
    user,
    isAuthenticated,
    loading,
    checkAuth,
    login,
    register,
    logout
  }
})
