<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gray-900">Mi Horario</h1>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lunes
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Martes
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Miércoles
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jueves
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Viernes
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="slot in timeSlots" :key="slot.time">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ slot.time }}
              </td>
              <td class="px-6 py-4">
                <div v-if="getClassForSlot('LUNES', slot.time)" class="space-y-1">
                  <p class="text-sm font-semibold text-gray-900">
                    {{ getClassForSlot('LUNES', slot.time).asignatura }}
                  </p>
                  <p class="text-xs text-gray-600">
                    {{ getClassForSlot('LUNES', slot.time).profesor }}
                  </p>
                  <p class="text-xs text-gray-500">
                    Sala: {{ getClassForSlot('LUNES', slot.time).sala }}
                  </p>
                </div>
              </td>
              <td class="px-6 py-4">
                <div v-if="getClassForSlot('MARTES', slot.time)" class="space-y-1">
                  <p class="text-sm font-semibold text-gray-900">
                    {{ getClassForSlot('MARTES', slot.time).asignatura }}
                  </p>
                  <p class="text-xs text-gray-600">
                    {{ getClassForSlot('MARTES', slot.time).profesor }}
                  </p>
                  <p class="text-xs text-gray-500">
                    Sala: {{ getClassForSlot('MARTES', slot.time).sala }}
                  </p>
                </div>
              </td>
              <td class="px-6 py-4">
                <div v-if="getClassForSlot('MIERCOLES', slot.time)" class="space-y-1">
                  <p class="text-sm font-semibold text-gray-900">
                    {{ getClassForSlot('MIERCOLES', slot.time).asignatura }}
                  </p>
                  <p class="text-xs text-gray-600">
                    {{ getClassForSlot('MIERCOLES', slot.time).profesor }}
                  </p>
                  <p class="text-xs text-gray-500">
                    Sala: {{ getClassForSlot('MIERCOLES', slot.time).sala }}
                  </p>
                </div>
              </td>
              <td class="px-6 py-4">
                <div v-if="getClassForSlot('JUEVES', slot.time)" class="space-y-1">
                  <p class="text-sm font-semibold text-gray-900">
                    {{ getClassForSlot('JUEVES', slot.time).asignatura }}
                  </p>
                  <p class="text-xs text-gray-600">
                    {{ getClassForSlot('JUEVES', slot.time).profesor }}
                  </p>
                  <p class="text-xs text-gray-500">
                    Sala: {{ getClassForSlot('JUEVES', slot.time).sala }}
                  </p>
                </div>
              </td>
              <td class="px-6 py-4">
                <div v-if="getClassForSlot('VIERNES', slot.time)" class="space-y-1">
                  <p class="text-sm font-semibold text-gray-900">
                    {{ getClassForSlot('VIERNES', slot.time).asignatura }}
                  </p>
                  <p class="text-xs text-gray-600">
                    {{ getClassForSlot('VIERNES', slot.time).profesor }}
                  </p>
                  <p class="text-xs text-gray-500">
                    Sala: {{ getClassForSlot('VIERNES', slot.time).sala }}
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStudentStore } from '@/store/student.store'

const studentStore = useStudentStore()
const loading = ref(false)

const timeSlots = [
  { time: '08:00 - 08:45' },
  { time: '08:45 - 09:30' },
  { time: '09:30 - 10:15' },
  { time: '10:15 - 11:00' },
  { time: '11:00 - 11:45' },
  { time: '11:45 - 12:30' },
  { time: '12:30 - 13:15' }
]

// Mock schedule data
const mockSchedule = [
  // Lunes
  { dia: 'LUNES', horaInicio: '08:00', horaFin: '08:45', asignatura: 'Matemáticas', profesor: 'Prof. García', sala: '201' },
  { dia: 'LUNES', horaInicio: '08:45', horaFin: '09:30', asignatura: 'Matemáticas', profesor: 'Prof. García', sala: '201' },
  { dia: 'LUNES', horaInicio: '09:30', horaFin: '10:15', asignatura: 'Lenguaje', profesor: 'Prof. Martínez', sala: '102' },
  { dia: 'LUNES', horaInicio: '10:15', horaFin: '11:00', asignatura: 'Ciencias', profesor: 'Prof. Rodríguez', sala: 'Lab 1' },
  { dia: 'LUNES', horaInicio: '11:00', horaFin: '11:45', asignatura: 'Historia', profesor: 'Prof. López', sala: '305' },
  { dia: 'LUNES', horaInicio: '11:45', horaFin: '12:30', asignatura: 'Inglés', profesor: 'Prof. Smith', sala: '210' },
  { dia: 'LUNES', horaInicio: '12:30', horaFin: '13:15', asignatura: 'Ed. Física', profesor: 'Prof. Torres', sala: 'Gimnasio' },

  // Martes
  { dia: 'MARTES', horaInicio: '08:00', horaFin: '08:45', asignatura: 'Lenguaje', profesor: 'Prof. Martínez', sala: '102' },
  { dia: 'MARTES', horaInicio: '08:45', horaFin: '09:30', asignatura: 'Matemáticas', profesor: 'Prof. García', sala: '201' },
  { dia: 'MARTES', horaInicio: '09:30', horaFin: '10:15', asignatura: 'Inglés', profesor: 'Prof. Smith', sala: '210' },
  { dia: 'MARTES', horaInicio: '10:15', horaFin: '11:00', asignatura: 'Ciencias', profesor: 'Prof. Rodríguez', sala: 'Lab 1' },
  { dia: 'MARTES', horaInicio: '11:00', horaFin: '11:45', asignatura: 'Artes', profesor: 'Prof. Vega', sala: 'Taller' },
  { dia: 'MARTES', horaInicio: '11:45', horaFin: '12:30', asignatura: 'Historia', profesor: 'Prof. López', sala: '305' },
  { dia: 'MARTES', horaInicio: '12:30', horaFin: '13:15', asignatura: 'Música', profesor: 'Prof. Morales', sala: 'Sala Música' },

  // Miércoles
  { dia: 'MIERCOLES', horaInicio: '08:00', horaFin: '08:45', asignatura: 'Matemáticas', profesor: 'Prof. García', sala: '201' },
  { dia: 'MIERCOLES', horaInicio: '08:45', horaFin: '09:30', asignatura: 'Ciencias', profesor: 'Prof. Rodríguez', sala: 'Lab 1' },
  { dia: 'MIERCOLES', horaInicio: '09:30', horaFin: '10:15', asignatura: 'Lenguaje', profesor: 'Prof. Martínez', sala: '102' },
  { dia: 'MIERCOLES', horaInicio: '10:15', horaFin: '11:00', asignatura: 'Inglés', profesor: 'Prof. Smith', sala: '210' },
  { dia: 'MIERCOLES', horaInicio: '11:00', horaFin: '11:45', asignatura: 'Ed. Física', profesor: 'Prof. Torres', sala: 'Gimnasio' },
  { dia: 'MIERCOLES', horaInicio: '11:45', horaFin: '12:30', asignatura: 'Historia', profesor: 'Prof. López', sala: '305' },
  { dia: 'MIERCOLES', horaInicio: '12:30', horaFin: '13:15', asignatura: 'Artes', profesor: 'Prof. Vega', sala: 'Taller' },

  // Jueves
  { dia: 'JUEVES', horaInicio: '08:00', horaFin: '08:45', asignatura: 'Ciencias', profesor: 'Prof. Rodríguez', sala: 'Lab 1' },
  { dia: 'JUEVES', horaInicio: '08:45', horaFin: '09:30', asignatura: 'Matemáticas', profesor: 'Prof. García', sala: '201' },
  { dia: 'JUEVES', horaInicio: '09:30', horaFin: '10:15', asignatura: 'Historia', profesor: 'Prof. López', sala: '305' },
  { dia: 'JUEVES', horaInicio: '10:15', horaFin: '11:00', asignatura: 'Lenguaje', profesor: 'Prof. Martínez', sala: '102' },
  { dia: 'JUEVES', horaInicio: '11:00', horaFin: '11:45', asignatura: 'Inglés', profesor: 'Prof. Smith', sala: '210' },
  { dia: 'JUEVES', horaInicio: '11:45', horaFin: '12:30', asignatura: 'Música', profesor: 'Prof. Morales', sala: 'Sala Música' },
  { dia: 'JUEVES', horaInicio: '12:30', horaFin: '13:15', asignatura: 'Ed. Física', profesor: 'Prof. Torres', sala: 'Gimnasio' },

  // Viernes
  { dia: 'VIERNES', horaInicio: '08:00', horaFin: '08:45', asignatura: 'Lenguaje', profesor: 'Prof. Martínez', sala: '102' },
  { dia: 'VIERNES', horaInicio: '08:45', horaFin: '09:30', asignatura: 'Matemáticas', profesor: 'Prof. García', sala: '201' },
  { dia: 'VIERNES', horaInicio: '09:30', horaFin: '10:15', asignatura: 'Inglés', profesor: 'Prof. Smith', sala: '210' },
  { dia: 'VIERNES', horaInicio: '10:15', horaFin: '11:00', asignatura: 'Historia', profesor: 'Prof. López', sala: '305' },
  { dia: 'VIERNES', horaInicio: '11:00', horaFin: '11:45', asignatura: 'Ciencias', profesor: 'Prof. Rodríguez', sala: 'Lab 1' },
  { dia: 'VIERNES', horaInicio: '11:45', horaFin: '12:30', asignatura: 'Artes', profesor: 'Prof. Vega', sala: 'Taller' },
  { dia: 'VIERNES', horaInicio: '12:30', horaFin: '13:15', asignatura: 'Música', profesor: 'Prof. Morales', sala: 'Sala Música' }
]

const schedule = computed(() => {
  if (studentStore.schedule && studentStore.schedule.length > 0) {
    return studentStore.schedule
  }
  return mockSchedule
})

const getClassForSlot = (dia: string, time: string) => {
  return schedule.value.find(
    (clase) => clase.dia === dia && clase.horaInicio === time.split(' - ')[0]
  )
}

onMounted(async () => {
  loading.value = true
  try {
    // Fetch schedule data from store
    if (studentStore.fetchSchedule) {
      await studentStore.fetchSchedule()
    }
  } catch (error) {
    console.error('Error fetching schedule data:', error)
  } finally {
    loading.value = false
  }
})
</script>
