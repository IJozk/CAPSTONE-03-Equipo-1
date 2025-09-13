<template>
  <div class="p-4 md:p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-foreground">Notificaciones</h1>
      <button
        v-if="unreadCount > 0"
        @click="markAllAsRead"
        class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        Marcar todas como leídas
      </button>
    </div>

    <div v-if="notificationStore.isLoading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="userNotifications.length === 0" class="text-center py-8">
      <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <BellIcon class="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 class="text-lg font-medium text-foreground mb-2">No hay notificaciones</h3>
      <p class="text-muted-foreground">Te notificaremos cuando haya novedades.</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="notification in userNotifications"
        :key="notification.id"
        class="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
        :class="{
          'border-l-4 border-l-primary bg-primary/5': !notification.read
        }"
        @click="markAsRead(notification.id)"
      >
        <div class="flex items-start space-x-3">
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            :class="getNotificationIconClasses(notification.type)"
          >
            <component :is="getNotificationIcon(notification.type)" class="h-5 w-5" />
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <h3 class="font-medium text-foreground truncate">
                {{ notification.title }}
              </h3>
              <span class="text-xs text-muted-foreground ml-2">
                {{ formatDate(notification.timestamp) }}
              </span>
            </div>
            
            <p class="text-sm text-muted-foreground leading-relaxed">
              {{ notification.message }}
            </p>
            
            <div class="flex items-center justify-between mt-2">
              <span 
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                :class="getNotificationTypeClasses(notification.type)"
              >
                {{ getNotificationTypeLabel(notification.type) }}
              </span>
              
              <div v-if="!notification.read" class="w-2 h-2 bg-primary rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// Icons
const BellIcon = {
  template: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5-5h5l-5-5V17zm-5 0V3a2 2 0 00-2-2H5a2 2 0 00-2 2v14h7zm-5-3V6h2v8H5z" />
  </svg>`
}

const AttendanceIcon = {
  template: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>`
}

const GradeIcon = {
  template: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>`
}

const MeetingIcon = {
  template: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m-3 5.197H7v-1a6 6 0 0112 0v1z" />
  </svg>`
}

const ReportIcon = {
  template: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>`
}

// Computed properties
const userNotifications = computed(() => {
  if (!authStore.user) return []
  return notificationStore.getUserNotifications(authStore.user.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

const unreadCount = computed(() => {
  if (!authStore.user) return 0
  return notificationStore.getUnreadCount(authStore.user.id)
})

// Methods
const markAsRead = (notificationId) => {
  notificationStore.markAsRead(notificationId)
}

const markAllAsRead = () => {
  if (authStore.user) {
    notificationStore.markAllAsRead(authStore.user.id)
  }
}

const getNotificationIcon = (type) => {
  const icons = {
    attendance: AttendanceIcon,
    grade: GradeIcon,
    meeting: MeetingIcon,
    report: ReportIcon
  }
  return icons[type] || BellIcon
}

const getNotificationIconClasses = (type) => {
  const classes = {
    attendance: 'bg-blue-100 text-blue-600',
    grade: 'bg-green-100 text-green-600',
    meeting: 'bg-purple-100 text-purple-600',
    report: 'bg-orange-100 text-orange-600'
  }
  return classes[type] || 'bg-gray-100 text-gray-600'
}

const getNotificationTypeClasses = (type) => {
  const classes = {
    attendance: 'bg-blue-100 text-blue-800',
    grade: 'bg-green-100 text-green-800',
    meeting: 'bg-purple-100 text-purple-800',
    report: 'bg-orange-100 text-orange-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getNotificationTypeLabel = (type) => {
  const labels = {
    attendance: 'Asistencia',
    grade: 'Calificación',
    meeting: 'Reunión',
    report: 'Reporte'
  }
  return labels[type] || 'General'
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'Hace un momento'
  } else if (diffInHours < 24) {
    return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
  }
}
</script>