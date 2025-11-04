<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900">Eventos</h1>
      <select v-model="selectedType" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <option value="all">Todos los eventos</option>
        <option value="EVALUACION">Evaluaciones</option>
        <option value="REUNION">Reuniones</option>
        <option value="ACTIVIDAD">Actividades</option>
        <option value="OTRO">Otros</option>
      </select>
    </div>

    <!-- Events List -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="event in filteredEvents"
        :key="event.id"
        class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div class="flex">
          <!-- Date Visual -->
          <div class="w-24 bg-blue-600 text-white flex flex-col items-center justify-center p-4">
            <span class="text-3xl font-bold">{{ formatDay(event.fecha) }}</span>
            <span class="text-sm uppercase">{{ formatMonth(event.fecha) }}</span>
          </div>

          <!-- Event Details -->
          <div class="flex-1 p-4">
            <div class="flex items-start justify-between mb-2">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ event.titulo }}
              </h3>
              <span :class="getTypeBadgeClass(event.tipo)" class="px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ml-2">
                {{ event.tipo }}
              </span>
            </div>

            <p class="text-sm text-gray-600 mb-3">
              {{ event.descripcion }}
            </p>

            <div class="flex items-center gap-2 text-xs text-gray-500">
              <span>🕐</span>
              <span>{{ formatDateTime(event.fecha) }}</span>
            </div>

            <div v-if="event.asignatura" class="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <span>📚</span>
              <span>{{ event.asignatura }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredEvents.length === 0" class="col-span-full text-center py-12">
        <p class="text-gray-500">No hay eventos programados</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStudentStore } from '@/store/student.store'

const studentStore = useStudentStore()
const selectedType = ref('all')
const loading = ref(false)

// Mock events data
const mockEvents = [
  {
    id: 1,
    tipo: 'EVALUACION',
    titulo: 'Prueba de Álgebra',
    descripcion: 'Evaluación de ecuaciones y sistemas lineales',
    fecha: '2025-10-25T10:00:00',
    asignatura: 'Matemáticas'
  },
  {
    id: 2,
    tipo: 'REUNION',
    titulo: 'Reunión de Apoderados',
    descripcion: 'Reunión general para informar sobre el progreso del semestre',
    fecha: '2025-10-28T18:00:00',
    asignatura: null
  },
  {
    id: 3,
    tipo: 'ACTIVIDAD',
    titulo: 'Feria Científica',
    descripcion: 'Presentación de proyectos científicos de todos los cursos',
    fecha: '2025-10-30T09:00:00',
    asignatura: 'Ciencias'
  },
  {
    id: 4,
    tipo: 'EVALUACION',
    titulo: 'Examen de Inglés',
    descripcion: 'Evaluación oral y escrita de la unidad 4',
    fecha: '2025-10-25T14:00:00',
    asignatura: 'Inglés'
  },
  {
    id: 5,
    tipo: 'ACTIVIDAD',
    titulo: 'Campeonato de Fútbol',
    descripcion: 'Torneo inter-cursos de fútbol',
    fecha: '2025-10-26T15:30:00',
    asignatura: 'Ed. Física'
  },
  {
    id: 6,
    tipo: 'EVALUACION',
    titulo: 'Disertación de Historia',
    descripcion: 'Presentación grupal sobre la independencia de Chile',
    fecha: '2025-10-29T11:00:00',
    asignatura: 'Historia'
  },
  {
    id: 7,
    tipo: 'OTRO',
    titulo: 'Día del Libro',
    descripcion: 'Celebración con actividades literarias',
    fecha: '2025-11-01T10:00:00',
    asignatura: 'Lenguaje'
  },
  {
    id: 8,
    tipo: 'ACTIVIDAD',
    titulo: 'Exposición de Arte',
    descripcion: 'Muestra de trabajos artísticos del semestre',
    fecha: '2025-11-03T12:00:00',
    asignatura: 'Artes'
  },
  {
    id: 9,
    tipo: 'EVALUACION',
    titulo: 'Prueba de Ciencias',
    descripcion: 'Evaluación sobre el sistema solar y astronomía',
    fecha: '2025-11-05T09:00:00',
    asignatura: 'Ciencias'
  },
  {
    id: 10,
    tipo: 'REUNION',
    titulo: 'Consejo de Curso',
    descripcion: 'Reunión mensual del consejo de curso',
    fecha: '2025-11-07T16:00:00',
    asignatura: null
  }
]

const events = computed(() => {
  if (studentStore.events && studentStore.events.length > 0) {
    return studentStore.events
  }
  return mockEvents
})

const filteredEvents = computed(() => {
  if (selectedType.value === 'all') {
    return events.value
  }
  return events.value.filter(e => e.tipo === selectedType.value)
})

const formatDay = (fecha: string) => {
  const date = new Date(fecha)
  return date.getDate().toString().padStart(2, '0')
}

const formatMonth = (fecha: string) => {
  const date = new Date(fecha)
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
  return months[date.getMonth()]
}

const formatDateTime = (fecha: string) => {
  const date = new Date(fecha)
  return date.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTypeBadgeClass = (tipo: string) => {
  switch (tipo) {
    case 'EVALUACION':
      return 'bg-blue-100 text-blue-800'
    case 'REUNION':
      return 'bg-purple-100 text-purple-800'
    case 'ACTIVIDAD':
      return 'bg-green-100 text-green-800'
    case 'OTRO':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

onMounted(async () => {
  loading.value = true
  try {
    // Fetch events from store
    if (studentStore.fetchEvents) {
      await studentStore.fetchEvents()
    }
  } catch (error) {
    console.error('Error fetching events:', error)
  } finally {
    loading.value = false
  }
})
</script>
