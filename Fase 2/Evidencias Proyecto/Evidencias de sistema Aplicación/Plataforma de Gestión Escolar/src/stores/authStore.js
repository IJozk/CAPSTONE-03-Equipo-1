import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isLoading = ref(false)

  // Mock users data
  const mockUsers = [
    {
      id: '1',
      email: 'coordinador@colegio.cl',
      password: 'admin123',
      role: 'coordinador',
      name: 'María González',
      firstLogin: false
    },
    {
      id: '2',
      email: 'docente@colegio.cl',
      password: 'docente123',
      role: 'docente',
      name: 'Carlos Rodríguez',
      firstLogin: false
    },
    {
      id: '3',
      email: 'apoderado@colegio.cl',
      password: 'apoderado123',
      role: 'apoderado',
      name: 'Ana Martínez',
      firstLogin: true
    }
  ]

  const login = async (email, password) => {
    isLoading.value = true
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const foundUser = mockUsers.find(u => u.email === email && u.password === password)
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser
        user.value = userWithoutPassword
        
        // Store in localStorage for persistence
        localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword))
        
        return { success: true }
      } else {
        return { success: false, error: 'Credenciales incorrectas' }
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('auth_user')
  }

  const checkAuth = () => {
    const storedUser = localStorage.getItem('auth_user')
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (error) {
        localStorage.removeItem('auth_user')
      }
    }
  }

  const updateUser = (updates) => {
    if (user.value) {
      user.value = { ...user.value, ...updates }
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    }
  }

  return {
    user,
    isLoading,
    login,
    logout,
    checkAuth,
    updateUser
  }
})