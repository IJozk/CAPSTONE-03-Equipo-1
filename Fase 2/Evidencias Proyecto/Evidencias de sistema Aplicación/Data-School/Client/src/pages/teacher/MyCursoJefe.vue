<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 class="text-2xl font-bold text-gray-900">Mi Curso como Profesor Jefe</h1>
        <p class="text-gray-600 mt-1">Gestiona y visualiza información de tu curso</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="text-gray-600 mt-4">Cargando información del curso...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-red-800">{{ error }}</p>
        </div>
      </div>

      <!-- No Curso Jefe State -->
      <div v-else-if="!cursoJefe || cursos.length === 0" class="bg-white rounded-lg shadow p-8 text-center">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <p class="text-gray-600 text-lg">No tienes ningún curso asignado como profesor jefe</p>
        <p class="text-gray-500 text-sm mt-2">Contacta con la administración si crees que esto es un error</p>
      </div>

      <!-- Curso Info -->
      <div v-else>
        <!-- Curso Header Card -->
        <div class="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-3xl font-bold">{{ cursoJefe.nombre }}</h2>
              <p class="text-primary-100 mt-1 text-lg">
                {{ getNivelDisplay(cursoJefe.nivel_id) }} · Año {{ cursoJefe.anio_academico }}
              </p>
              <p class="text-primary-100 text-sm mt-1">
                Generación {{ cursoJefe.generacion }}
              </p>
            </div>
            <div class="text-right">
              <div class="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <p class="text-4xl font-bold">{{ stats.total_estudiantes }}</p>
                <p class="text-primary-100 text-sm">Estudiantes</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Total Asignaturas -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{{ stats.total_asignaturas }}</p>
                <p class="text-sm text-gray-600">Asignaturas</p>
              </div>
            </div>
          </div>

          <!-- Capacidad -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">
                  {{ cursoJefe.capacidad_maxima || '∞' }}
                </p>
                <p class="text-sm text-gray-600">Capacidad Máxima</p>
              </div>
            </div>
          </div>

          <!-- Disponibilidad -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">
                  {{ stats.capacidad_disponible !== null ? stats.capacidad_disponible : '∞' }}
                </p>
                <p class="text-sm text-gray-600">Cupos Disponibles</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs para Lista/Mapa de Asientos -->
        <div class="bg-white rounded-lg shadow">
          <div class="border-b border-gray-200">
            <nav class="flex -mb-px">
              <button
                @click="activeTab = 'list'"
                :class="[
                  'px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
                  activeTab === 'list'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Lista de Estudiantes
              </button>
              <button
                @click="activeTab = 'seating'"
                :class="[
                  'px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
                  activeTab === 'seating'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                </svg>
                Mapa de Asientos
              </button>
            </nav>
          </div>

          <!-- Lista de Estudiantes Tab -->
          <div v-if="activeTab === 'list'">
            <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 class="text-lg font-semibold text-gray-900">Estudiantes del Curso</h3>
            </div>

          <div v-if="loadingStudents" class="p-8 text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p class="text-gray-600 mt-2">Cargando estudiantes...</p>
          </div>

          <div v-else-if="estudiantes.length === 0" class="p-8 text-center text-gray-500">
            No hay estudiantes matriculados en este curso
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="estudiante in estudiantes" :key="estudiante.estudiante_id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ estudiante.rut }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ estudiante.nombre_completo }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ estudiante.email || '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ estudiante.telefono || '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="estudiante.estado_activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    >
                      {{ estudiante.estado_activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      @click="viewStudentProfile(estudiante)"
                      class="text-primary-600 hover:text-primary-900"
                      title="Ver Perfil"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>

          <!-- Mapa de Asientos Tab -->
          <div v-if="activeTab === 'seating'">
            <SeatingMap
              v-if="cursoJefe && estudiantesConMetricas.length > 0"
              :curso-id="cursoJefe.curso_id"
              :students="estudiantesConMetricas"
              :curso="cursoJefe"
            />
            <div v-else class="p-8 text-center text-gray-500">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p>No hay estudiantes para mostrar en el mapa de asientos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCursoStore } from '@/store/curso.store'
import { useStudentStore } from '@/store/student.store'
import type { Curso, CursoStats } from '@/types/curso.types'
import type { Estudiante } from '@/types/users.types'
import { NIVELES, getNivelDisplay } from '@/constants/niveles.constants'
import matriculaService from '@/services/matricula.service'
import type { Matricula } from '@/services/matricula.service'
import SeatingMap from '@/components/teacher/SeatingMap.vue'
import type { Student } from '@/types/teacher.types'

const router = useRouter()
const cursoStore = useCursoStore()
const studentStore = useStudentStore()

const loading = ref(false)
const loadingStudents = ref(false)
const error = ref<string | null>(null)
const cursos = ref<Curso[]>([])
const activeTab = ref<'list' | 'seating'>('list')
const cursoJefe = ref<Curso | null>(null)
const estudiantes = ref<Estudiante[]>([])
const stats = ref<CursoStats>({
  curso: {} as Curso,
  total_asignaturas: 0,
  total_estudiantes: 0,
  capacidad_disponible: null
})

onMounted(async () => {
  await loadMisCursosJefe()
})

const loadMisCursosJefe = async () => {
  loading.value = true
  error.value = null

  try {
    cursos.value = await cursoStore.fetchMisCursosComoProfesorJefe()

    if (cursos.value.length > 0) {
      // Tomar el primer curso (un profesor solo debería tener un curso como jefe)
      cursoJefe.value = cursos.value[0]

      // Cargar estadísticas y estudiantes
      await Promise.all([
        loadCursoStats(),
        loadCursoStudents()
      ])
    }
  } catch (err: any) {
    console.error('Error cargando cursos como profesor jefe:', err)
    error.value = err.message || 'Error al cargar la información del curso'
  } finally {
    loading.value = false
  }
}

const loadCursoStats = async () => {
  if (!cursoJefe.value) return

  try {
    stats.value = await cursoStore.fetchStats(cursoJefe.value.curso_id)
  } catch (err) {
    console.error('Error cargando estadísticas del curso:', err)
  }
}

const loadCursoStudents = async () => {
  if (!cursoJefe.value) return

  loadingStudents.value = true
  try {
    // Obtener las matrículas activas del curso
    const matriculas = await matriculaService.getAll({
      curso_id: cursoJefe.value.curso_id,
      estado_matricula_id: 1
    })

    // Cargar todos los estudiantes si no están cargados
    if (studentStore.estudiantes.length === 0) {
      await studentStore.fetchEstudiantes()
    }

    // Filtrar los estudiantes que están matriculados en este curso
    const estudianteIds = matriculas.map((m: Matricula) => m.estudiante_id)
    estudiantes.value = studentStore.estudiantes.filter(
      estudiante => estudianteIds.includes(estudiante.estudiante_id)
    )
  } catch (err) {
    console.error('Error cargando estudiantes del curso:', err)
  } finally {
    loadingStudents.value = false
  }
}

const viewStudentProfile = (estudiante: Estudiante) => {
  router.push({
    name: 'TeacherStudentProfile',
    params: { id: estudiante.estudiante_id }
  })
}

// Transformar estudiantes al formato que espera SeatingMap
const estudiantesConMetricas = computed<Student[]>(() => {
  return estudiantes.value.map((estudiante, index) => ({
    estudiante_id: estudiante.estudiante_id,
    nombre_completo: estudiante.nombre_completo,
    rut: estudiante.rut,
    numero_lista: index + 1, // Asignar número de lista secuencial
    promedio_asignatura: 0, // TODO: Obtener promedio real
    asistencia_porcentaje: 0, // TODO: Obtener asistencia real
    total_anotaciones_positivas: 0, // TODO: Obtener anotaciones reales
    total_anotaciones_negativas: 0 // TODO: Obtener anotaciones reales
  }))
})
</script>
