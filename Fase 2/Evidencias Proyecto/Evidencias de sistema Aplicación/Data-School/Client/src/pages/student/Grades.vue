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
import { useStudentStore } from '@/store/student.store'
import StatCard from '@/components/student/StatCard.vue'

const studentStore = useStudentStore()
const loading = ref(false)

// Mock data con datos reales para mostrar
const mockGrades = [
  {
    asignatura: 'Matemáticas',
    profesor: 'Prof. María García',
    promedio: 6.2,
    evaluaciones: [
      { id: 1, nombre: 'Prueba 1 - Álgebra', tipo: 'Prueba', fecha: '05/10/2025', nota: 6.5, ponderacion: 30 },
      { id: 2, nombre: 'Control - Geometría', tipo: 'Control', fecha: '12/10/2025', nota: 5.8, ponderacion: 20 },
      { id: 3, nombre: 'Trabajo Práctico', tipo: 'Trabajo', fecha: '18/10/2025', nota: 6.4, ponderacion: 25 }
    ]
  },
  {
    asignatura: 'Lenguaje y Comunicación',
    profesor: 'Prof. Carlos Rodríguez',
    promedio: 5.8,
    evaluaciones: [
      { id: 4, nombre: 'Control de Lectura', tipo: 'Control', fecha: '08/10/2025', nota: 5.5, ponderacion: 25 },
      { id: 5, nombre: 'Ensayo Argumentativo', tipo: 'Trabajo', fecha: '15/10/2025', nota: 6.0, ponderacion: 35 },
      { id: 6, nombre: 'Exposición Oral', tipo: 'Exposición', fecha: '20/10/2025', nota: 5.9, ponderacion: 20 }
    ]
  },
  {
    asignatura: 'Ciencias Naturales',
    profesor: 'Prof. Ana López',
    promedio: 6.0,
    evaluaciones: [
      { id: 7, nombre: 'Prueba - Células', tipo: 'Prueba', fecha: '10/10/2025', nota: 6.2, ponderacion: 40 },
      { id: 8, nombre: 'Laboratorio Práctico', tipo: 'Laboratorio', fecha: '17/10/2025', nota: 5.8, ponderacion: 30 }
    ]
  },
  {
    asignatura: 'Historia y Geografía',
    profesor: 'Prof. Roberto Martínez',
    promedio: 5.5,
    evaluaciones: [
      { id: 9, nombre: 'Prueba - Civilizaciones', tipo: 'Prueba', fecha: '06/10/2025', nota: 5.3, ponderacion: 35 },
      { id: 10, nombre: 'Trabajo Investigación', tipo: 'Trabajo', fecha: '14/10/2025', nota: 5.7, ponderacion: 30 }
    ]
  },
  {
    asignatura: 'Inglés',
    profesor: 'Prof. Jennifer Smith',
    promedio: 6.3,
    evaluaciones: [
      { id: 11, nombre: 'Reading Test', tipo: 'Prueba', fecha: '09/10/2025', nota: 6.4, ponderacion: 30 },
      { id: 12, nombre: 'Oral Presentation', tipo: 'Exposición', fecha: '16/10/2025', nota: 6.2, ponderacion: 25 }
    ]
  }
]

const summary = computed(() => ({
  promedio: studentStore.academicSummary?.promedio_general?.toFixed(1) || '5.8',
  asignaturas: studentStore.academicSummary?.total_asignaturas || 8,
  evaluacionesPendientes: studentStore.academicSummary?.evaluaciones_pendientes || 3,
  ultimaActualizacion: studentStore.academicSummary?.ultima_actualizacion
    ? new Date(studentStore.academicSummary.ultima_actualizacion).toLocaleDateString('es-CL')
    : '22/10/2025'
}))

const grades = computed(() => studentStore.grades.length > 0 ? studentStore.grades : mockGrades)

const getGradeColor = (nota: number) => {
  if (nota >= 6.0) return 'text-green-600'
  if (nota >= 5.0) return 'text-blue-600'
  if (nota >= 4.0) return 'text-yellow-600'
  return 'text-red-600'
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      studentStore.fetchAcademicSummary(),
      studentStore.fetchGrades()
    ])
  } catch (error) {
    console.error('Error loading grades:', error)
  } finally {
    loading.value = false
  }
})
</script>
