import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockNotifications } from '../data/mockData'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])
  const isLoading = ref(false)

  const loadNotifications = async () => {
    isLoading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      notifications.value = [...mockNotifications]
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      isLoading.value = false
    }
  }

  const markAsRead = (notificationId) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  const markAllAsRead = (userId) => {
    notifications.value.forEach(notification => {
      if (notification.userId === userId) {
        notification.read = true
      }
    })
  }

  const getUserNotifications = (userId) => {
    return notifications.value.filter(n => n.userId === userId)
  }

  const getUnreadCount = (userId) => {
    return notifications.value.filter(n => n.userId === userId && !n.read).length
  }

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      read: false,
      timestamp: new Date().toISOString(),
      ...notification
    }
    notifications.value.unshift(newNotification)
  }

  return {
    notifications,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    getUserNotifications,
    getUnreadCount,
    addNotification
  }
})