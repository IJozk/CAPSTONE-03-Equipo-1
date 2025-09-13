<template>
  <div class="bg-card rounded-lg border border-border p-6">
    <h3 class="font-semibold text-foreground mb-4">Notificaciones Recientes</h3>
    <div class="space-y-3">
      <div
        v-for="notification in recentNotifications"
        :key="notification.id"
        class="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
        :class="{
          'border-l-4 border-l-primary bg-primary/5': !notification.read
        }"
      >
        <div 
          class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          :class="getNotificationIconClasses(notification.type)"
        >
          <component :is="getNotificationIcon(notification.type)" class="h-4 w-4" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-foreground">{{ notification.title }}</p>
          <p class="text-xs text-muted-foreground mt-1">{{ formatTime(notification.timestamp) }}</p>
          <div v-if="!notification.read" class="w-2 h-2 bg-primary rounded-full mt-2"></div>
        </div>
      </div>
    </div>
    
    <button class="w-full mt-4 py-2 text-sm text-primary hover:text-primary/80 border border-border rounded-lg hover:bg-muted transition-colors">
      Ver todas las notificaciones
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const recentNotifications = ref([
  {
    id: '1',
    title: 'Nueva calificación disponible',
    type: 'grade',
    read: false,
    timestamp: '2024-03-18T15:30:00Z'
  },
  {
    id: '2',
    title: 'Ausencia registrada',
    type: 'attendance',
    read: false,
    timestamp: '2024-03-17T09:00:00Z'
  },
  {
    id: '3',
    title: 'Reunión programada',
    type: 'meeting',
    read: true,
    timestamp: '2024-03-16T14:20:00Z'
  }
])

// Icons
const GradeIcon = {
  template: `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>`
}

const AttendanceIcon = {
  template: `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>`
}

const MeetingIcon = {
  template: `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m-3 5.197H7v-1a6 6 0 0112 0v1z" />
  </svg>`
}

const BellIcon = {
  template: `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5-5h5l-5-5V17zm-5 0V3a2 2 0 00-2-2H5a2 2 0 00-2 2v14h7zm-5-3V6h2v8H5z" />
  </svg>`
}

const getNotificationIcon = (type) => {
  const icons = {
    grade: GradeIcon,
    attendance: AttendanceIcon,
    meeting: MeetingIcon
  }
  return icons[type] || BellIcon
}

const getNotificationIconClasses = (type) => {
  const classes = {
    grade: 'bg-green-100 text-green-600',
    attendance: 'bg-blue-100 text-blue-600',
    meeting: 'bg-purple-100 text-purple-600'
  }
  return classes[type] || 'bg-gray-100 text-gray-600'
}

const formatTime = (timestamp) => {
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