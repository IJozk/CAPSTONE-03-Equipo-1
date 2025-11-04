<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Notificaciones</h1>
        <p class="text-sm text-gray-600 mt-1">
          {{ unreadCount }} notificaciones sin leer
        </p>
      </div>
      <button
        @click="markAllAsRead"
        class="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        Marcar todas como leídas
      </button>
    </div>

    <!-- Filter -->
    <div class="flex gap-4">
      <select v-model="selectedType" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <option value="all">Todas las notificaciones</option>
        <option value="CALIFICACION">Calificaciones</option>
        <option value="ASISTENCIA">Asistencia</option>
        <option value="EVENTO">Eventos</option>
        <option value="ALERTA">Alertas</option>
      </select>
    </div>

    <!-- Notifications List -->
    <div class="space-y-4">
      <div
        v-for="notification in filteredNotifications"
        :key="notification.id"
        @click="handleNotificationClick(notification)"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
        :class="{ 'bg-blue-50': !notification.leido }"
      >
        <div class="flex items-start gap-4">
          <div :class="getNotificationIconClass(notification.tipo)" class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-2xl">{{ getNotificationIcon(notification.tipo) }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ notification.titulo }}
                </h3>
                <p class="text-sm text-gray-600 mt-1">
                  {{ notification.mensaje }}
                </p>
              </div>
              <span v-if="!notification.leido" class="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0"></span>
            </div>
            <div class="flex items-center gap-4 mt-3">
              <span :class="getTypeBadgeClass(notification.tipo)" class="px-2 py-1 text-xs font-semibold rounded-full">
                {{ notification.tipo }}
              </span>
              <span class="text-xs text-gray-500">
                {{ notification.fecha }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredNotifications.length === 0" class="text-center py-12">
        <p class="text-gray-500">No hay notificaciones</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStudentStore } from '@/store/student.store'

const router = useRouter()
const studentStore = useStudentStore()
const selectedType = ref('all')
const loading = ref(false)

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    tipo: 'CALIFICACION',
    titulo: 'Nueva Calificación: Matemáticas',
    mensaje: 'Se ha registrado tu nota de la prueba de álgebra: 6.5',
    fecha: '2025-10-22 10:30',
    leido: false,
    link: '/student/grades'
  },
  {
    id: 2,
    tipo: 'ASISTENCIA',
    titulo: 'Alerta de Asistencia',
    mensaje: 'Se registró un atraso en la clase de Ciencias de hoy',
    fecha: '2025-10-22 09:15',
    leido: false,
    link: '/student/attendance'
  },
  {
    id: 3,
    tipo: 'EVENTO',
    titulo: 'Próximo Evento: Feria Científica',
    mensaje: 'La feria científica se realizará el 25 de octubre en el gimnasio',
    fecha: '2025-10-21 14:00',
    leido: true,
    link: '/student/events'
  },
  {
    id: 4,
    tipo: 'CALIFICACION',
    titulo: 'Nueva Calificación: Lenguaje',
    mensaje: 'Se ha registrado tu nota del trabajo de comprensión lectora: 6.8',
    fecha: '2025-10-21 11:45',
    leido: true,
    link: '/student/grades'
  },
  {
    id: 5,
    tipo: 'ALERTA',
    titulo: 'Entrega Pendiente',
    mensaje: 'Tienes una tarea de Historia pendiente de entrega para mañana',
    fecha: '2025-10-20 16:30',
    leido: false,
    link: '/student/subjects'
  },
  {
    id: 6,
    tipo: 'EVENTO',
    titulo: 'Reunión de Apoderados',
    mensaje: 'Reunión programada para el 28 de octubre a las 18:00 hrs',
    fecha: '2025-10-20 12:00',
    leido: true,
    link: '/student/events'
  },
  {
    id: 7,
    tipo: 'ASISTENCIA',
    titulo: 'Justificación Aceptada',
    mensaje: 'Tu justificación médica ha sido aprobada',
    fecha: '2025-10-19 15:20',
    leido: true,
    link: '/student/attendance'
  },
  {
    id: 8,
    tipo: 'CALIFICACION',
    titulo: 'Nueva Calificación: Ciencias',
    mensaje: 'Se ha registrado tu nota del laboratorio de química: 7.0',
    fecha: '2025-10-19 10:00',
    leido: true,
    link: '/student/grades'
  },
  {
    id: 9,
    tipo: 'ALERTA',
    titulo: 'Evaluación Próxima',
    mensaje: 'Recuerda que tienes una prueba de Inglés el viernes 25',
    fecha: '2025-10-18 13:45',
    leido: false,
    link: '/student/subjects'
  },
  {
    id: 10,
    tipo: 'EVENTO',
    titulo: 'Actividad Deportiva',
    mensaje: 'Campeonato de fútbol inter-cursos este sábado',
    fecha: '2025-10-17 16:00',
    leido: true,
    link: '/student/events'
  },
  {
    id: 11,
    tipo: 'ASISTENCIA',
    titulo: 'Registro de Asistencia',
    mensaje: 'Tu asistencia ha sido registrada correctamente para hoy',
    fecha: '2025-10-17 08:30',
    leido: true,
    link: '/student/attendance'
  },
  {
    id: 12,
    tipo: 'CALIFICACION',
    titulo: 'Nueva Calificación: Historia',
    mensaje: 'Se ha registrado tu nota de la disertación: 6.2',
    fecha: '2025-10-16 14:15',
    leido: true,
    link: '/student/grades'
  }
]

const notifications = computed(() => {
  if (studentStore.notifications && studentStore.notifications.length > 0) {
    return studentStore.notifications
  }
  return mockNotifications
})

const unreadCount = computed(() => notifications.value.filter(n => !n.leido).length)

const filteredNotifications = computed(() => {
  if (selectedType.value === 'all') {
    return notifications.value
  }
  return notifications.value.filter(n => n.tipo === selectedType.value)
})

const markAllAsRead = () => {
  studentStore.markAllNotificationsAsRead()
}

const handleNotificationClick = (notification: any) => {
  if (!notification.leido) {
    studentStore.markNotificationAsRead(notification.id)
  }

  // Navigate based on notification type
  if (notification.link) {
    router.push(notification.link)
  }
}

const getNotificationIcon = (tipo: string) => {
  switch (tipo) {
    case 'CALIFICACION':
      return '📝'
    case 'ASISTENCIA':
      return '✅'
    case 'EVENTO':
      return '📅'
    case 'ALERTA':
      return '⚠️'
    default:
      return '📢'
  }
}

const getNotificationIconClass = (tipo: string) => {
  switch (tipo) {
    case 'CALIFICACION':
      return 'bg-blue-100'
    case 'ASISTENCIA':
      return 'bg-green-100'
    case 'EVENTO':
      return 'bg-purple-100'
    case 'ALERTA':
      return 'bg-red-100'
    default:
      return 'bg-gray-100'
  }
}

const getTypeBadgeClass = (tipo: string) => {
  switch (tipo) {
    case 'CALIFICACION':
      return 'bg-blue-100 text-blue-800'
    case 'ASISTENCIA':
      return 'bg-green-100 text-green-800'
    case 'EVENTO':
      return 'bg-purple-100 text-purple-800'
    case 'ALERTA':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

onMounted(async () => {
  loading.value = true
  try {
    // Fetch notifications from store
    if (studentStore.fetchNotifications) {
      await studentStore.fetchNotifications()
    }
  } catch (error) {
    console.error('Error fetching notifications:', error)
  } finally {
    loading.value = false
  }
})
</script>
