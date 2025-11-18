<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900">Mis Notas</h1>
      <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Descargar Reporte
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Promedio General"
        :value="summary.promedio"
        icon="📊"
        color="blue"
      />
      <StatCard
        title="Asignaturas"
        :value="summary.asignaturas"
        icon="📚"
        color="green"
      />
      <StatCard
        title="Evaluaciones Pendientes"
        :value="summary.evaluacionesPendientes"
        icon="⏳"
        color="yellow"
      />
      <StatCard
        title="Última Actualización"
        :value="summary.ultimaActualizacion"
        icon="🕐"
        color="purple"
      />
    </div>

    <!-- Grades by Subject -->
    <div class="space-y-4">
      <h2 class="text-2xl font-semibold text-gray-900">Notas por Asignatura</h2>

      <div v-for="grade in grades" :key="grade.asignatura" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">{{ grade.asignatura }}</h3>
            <p class="text-sm text-gray-600">Profesor: {{ grade.profesor }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600">Promedio</p>
            <p class="text-2xl font-bold" :class="getGradeColor(grade.promedio)">
              {{ grade.promedio }}
            </p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evaluación
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nota
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ponderación
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="evaluacion in grade.evaluaciones" :key="evaluacion.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ evaluacion.nombre }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ evaluacion.tipo }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ evaluacion.fecha }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-semibold" :class="getGradeColor(evaluacion.nota)">
                    {{ evaluacion.nota }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ evaluacion.ponderacion }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/store/auth.store'
import evaluacionService from '@/services/evaluacion.service'
import StatCard from '@/components/student/StatCard.vue'

const authStore = useAuthStore()
const loading = ref(false)
const grades = ref<any[]>([])

const estudianteId = computed(() => authStore.user?.estudiante_profile?.estudiante_id)

const summary = computed(() => {
  const promedioGeneral = grades.value.length > 0
    ? grades.value.reduce((acc, g) => acc + g.promedio, 0) / grades.value.length
    : 0

  const totalEvaluaciones = grades.value.reduce((acc, g) => acc + g.evaluaciones.length, 0)

  return {
    promedio: promedioGeneral.toFixed(1),
    asignaturas: grades.value.length,
    evaluacionesPendientes: 0, // Por implementar
    ultimaActualizacion: new Date().toLocaleDateString('es-CL')
  }
})

const getGradeColor = (nota: number) => {
  if (nota >= 6.0) return 'text-green-600'
  if (nota >= 5.0) return 'text-blue-600'
  if (nota >= 4.0) return 'text-yellow-600'
  return 'text-red-600'
}

const loadGrades = async () => {
  console.log('🔍 Cargando notas...')
  console.log('👤 Estudiante ID:', estudianteId.value)
  console.log('👤 Auth user completo:', authStore.user)

  if (!estudianteId.value) {
    console.warn('❌ No se encontró el ID del estudiante')
    return
  }

  loading.value = true

  try {
    console.log('📞 Llamando a evaluacionService.getNotasEstudiante con ID:', estudianteId.value)
    const notasData = await evaluacionService.getNotasEstudiante(estudianteId.value)
    console.log('✅ Notas recibidas:', notasData)

    // Transformar datos para el template
    grades.value = notasData.map(asig => ({
      asignatura: asig.nombre_asignatura,
      profesor: asig.profesor_nombre,
      promedio: asig.promedio,
      evaluaciones: asig.notas.map(nota => ({
        id: nota.nota_id,
        nombre: nota.evaluacion_nombre,
        tipo: nota.tipo_evaluacion,
        fecha: new Date(nota.fecha).toLocaleDateString('es-CL'),
        nota: nota.nota,
        ponderacion: nota.ponderacion
      }))
    }))

    console.log('✅ Grades procesadas:', grades.value)

  } catch (error) {
    console.error('❌ Error loading grades:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadGrades()
})
</script>
