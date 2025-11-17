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
import { useAuthStore } from '@/store/auth.store'
import eventoService from '@/services/evento.service'
import evaluacionService from '@/services/evaluacion.service'

const authStore = useAuthStore()
const selectedType = ref('all')
const loading = ref(false)
const events = ref<any[]>([])

const estudianteId = computed(() => authStore.user?.estudiante_profile?.estudiante_id)

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
    case 'EVENTO':
      return 'bg-yellow-100 text-yellow-800'
    case 'OTRO':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const loadEvents = async () => {
  if (!estudianteId.value) {
    console.warn('No se encontró el ID del estudiante')
    return
  }

  loading.value = true

  try {
    // Obtener eventos del colegio
    const eventosData = await eventoService.getAll()

    // Obtener evaluaciones próximas (próximos 60 días)
    const evaluaciones = await evaluacionService.getAll({ estado_activo: true })
    const ahora = new Date()
    const sesentaDiasDespues = new Date()
    sesentaDiasDespues.setDate(ahora.getDate() + 60)

    const evaluacionesProximas = evaluaciones
      .filter(ev => {
        const fechaEv = new Date(ev.fecha_evaluacion)
        return fechaEv >= ahora && fechaEv <= sesentaDiasDespues
      })
      .map(ev => ({
        id: ev.evaluacion_id,
        tipo: 'EVALUACION',
        titulo: ev.nombre,
        descripcion: ev.descripcion || 'Evaluación programada',
        fecha: ev.fecha_evaluacion,
        asignatura: ev.asignatura?.nombre || 'Sin asignatura'
      }))

    // Procesar eventos generales
    const eventosGenerales = eventosData.map(ev => ({
      id: ev.evento_id,
      tipo: 'EVENTO',
      titulo: ev.nombre || 'Sin título',
      descripcion: `Evento en ${ev.lugar || 'ubicación por definir'}`,
      fecha: ev.fecha_inicio || new Date().toISOString(),
      asignatura: null
    }))

    // Combinar eventos y evaluaciones, filtrar futuros y ordenar
    const todosLosEventos = [...evaluacionesProximas, ...eventosGenerales]
      .filter(e => new Date(e.fecha) >= ahora)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

    events.value = todosLosEventos

  } catch (error) {
    console.error('Error loading events:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadEvents()
})
</script>
