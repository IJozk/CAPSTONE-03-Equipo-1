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
import { useAuthStore } from '@/store/auth.store'
import horarioService from '@/services/horario.service'
import studentService from '@/services/student.service'
import type { HorarioSlot } from '@/services/horario.service'

const authStore = useAuthStore()
const loading = ref(false)
const horarioData = ref<HorarioSlot[]>([])
const cursoId = ref<string | null>(null)

const estudianteId = computed(() => authStore.user?.estudiante_profile?.estudiante_id)

// Mapeo de números a nombres de días (1-5 = Lunes-Viernes)
const diasSemana: { [key: number]: string } = {
  1: 'LUNES',
  2: 'MARTES',
  3: 'MIERCOLES',
  4: 'JUEVES',
  5: 'VIERNES'
}

// Obtener todas las horas únicas del horario y ordenarlas
const timeSlots = computed(() => {
  const horasSet = new Set<string>()

  horarioData.value.forEach(h => {
    horasSet.add(h.hora_inicio)
  })

  const horasArray = Array.from(horasSet).sort()

  return horasArray.map(horaInicio => {
    // Encontrar hora de término correspondiente
    const clase = horarioData.value.find(h => h.hora_inicio === horaInicio)
    return {
      time: clase ? `${clase.hora_inicio} - ${clase.hora_termino}` : horaInicio
    }
  })
})

const getClassForSlot = (dia: string, time: string) => {
  const horaInicio = time.split(' - ')[0]

  // Encontrar el número del día
  const diaNum = Object.entries(diasSemana).find(([_, nombre]) => nombre === dia)?.[0]

  if (!diaNum) return null

  const clase = horarioData.value.find(
    (h) => h.dia_semana === parseInt(diaNum) && h.hora_inicio === horaInicio
  )

  if (!clase) return null

  // El backend devuelve las relaciones con mayúscula (Asignatura, Profesor, Sala)
  const asignatura = (clase as any).Asignatura || clase.asignatura
  const profesor = (clase as any).Profesor || clase.profesor
  const sala = (clase as any).Sala || clase.sala

  return {
    asignatura: asignatura?.nombre || 'Sin asignatura',
    profesor: profesor?.nombre_completo || 'Sin profesor',
    sala: sala?.nombre || 'Sin sala'
  }
}

const loadSchedule = async () => {
  console.log('🔍 Cargando horario...')
  console.log('👤 Estudiante ID:', estudianteId.value)

  if (!estudianteId.value) {
    console.warn('❌ No se encontró el ID del estudiante')
    return
  }

  loading.value = true

  try {
    // Obtener el curso desde el dashboard (método confiable)
    console.log('📞 Llamando a studentService.getDashboard para obtener curso...')
    const dashboard = await studentService.getDashboard(estudianteId.value)
    console.log('✅ Dashboard recibido:', dashboard)

    // El curso_id está en dashboard.curso.curso_id
    const cursoIdFromBackend = dashboard.curso?.curso_id

    console.log('📋 Curso ID encontrado:', cursoIdFromBackend)

    if (!cursoIdFromBackend) {
      console.error('❌ No se pudo obtener el curso_id')
      return
    }

    cursoId.value = cursoIdFromBackend

    // Luego, obtener el horario del curso
    console.log('📞 Llamando a horarioService.getHorarioCurso con curso_id:', cursoId.value)
    const data = await horarioService.getHorarioCurso(cursoId.value, '2025-S1')
    console.log('✅ Horario recibido:', data)
    horarioData.value = data
  } catch (error) {
    console.error('❌ Error loading schedule:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadSchedule()
})
</script>
