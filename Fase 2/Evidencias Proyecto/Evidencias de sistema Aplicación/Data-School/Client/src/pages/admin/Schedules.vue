<template>
  <AdminLayout>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Horario de {{ cursoSeleccionado?.nombre ? `${getNivelDisplay(cursoSeleccionado.nivel_id)} ${cursoSeleccionado.nombre}` : 'Curso' }}
          </h1>
          <p class="text-gray-600 mt-1">Gestiona los bloques horarios de las asignaturas del curso</p>
        </div>
        <button
          @click="$router.push('/admin/courses')"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Cursos
        </button>
      </div>

      <!-- Vista de Horario Semanal -->
      <div v-if="filters.curso_id" class="grid grid-cols-12 gap-6">
        <!-- Panel Principal de Horarios -->
        <div class="col-span-9">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 class="text-xl font-bold text-gray-900">
                {{ getViewTitle() }}
              </h2>
              <button
                @click="openCreateModal"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center text-sm"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Agregar Bloque
              </button>
            </div>

            <!-- Grid de horario semanal -->
            <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Hora
                </th>
                <th
                  v-for="dia in diasSemana"
                  :key="dia.value"
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ dia.label }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(bloque, index) in bloquesHorarios" :key="index">
                <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                  {{ bloque.hora_inicio }} - {{ bloque.hora_termino }}
                </td>
                <td
                  v-for="dia in diasSemana"
                  :key="dia.value"
                  class="px-4 py-3 border-l border-gray-200"
                  :class="getCellClass(bloque, dia.value)"
                >
                  <!-- Recreos y Almuerzo -->
                  <div v-if="bloque.tipo === 'recreo' || bloque.tipo === 'almuerzo'" class="text-center py-2">
                    <span class="text-xs font-medium text-gray-600">{{ bloque.nombre }}</span>
                  </div>

                  <!-- Bloque fuera del horario del viernes -->
                  <div v-else-if="dia.value === 5 && bloque.hora_inicio >= '14:20'" class="text-center py-2">
                    <span class="text-xs text-gray-400">-</span>
                  </div>

                  <!-- Bloques de clase disponibles -->
                  <div v-else>
                    <div
                      v-for="horario in getHorariosByBloqueYDia(bloque, dia.value)"
                      :key="horario.horario_id"
                      class="mb-2"
                    >
                      <div
                        class="p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow"
                        :class="getHorarioColor(horario)"
                        @click="openEditModal(horario)"
                      >
                        <div class="flex items-start justify-between">
                          <div class="flex-1">
                            <p class="text-sm font-semibold text-gray-900">
                              {{ horario.asignatura_nombre }}
                            </p>
                            <p class="text-xs text-gray-600 mt-1">
                              {{ horario.profesor_nombre }}
                            </p>
                            <p v-if="horario.sala_nombre" class="text-xs text-gray-500 mt-1 flex items-center">
                              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              {{ horario.sala_nombre }}
                            </p>
                          </div>
                          <div class="flex gap-1 ml-2">
                            <button
                              @click.stop="openEditModal(horario)"
                              class="p-1 text-gray-400 hover:text-primary-600"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              @click.stop="confirmDelete(horario)"
                              class="p-1 text-gray-400 hover:text-red-600"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Botón para agregar (solo en bloques de clase disponibles) -->
                    <button
                      v-if="getHorariosByBloqueYDia(bloque, dia.value).length === 0"
                      @click="openCreateModalWithData(bloque, dia.value)"
                      class="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-primary-400 hover:text-primary-600 transition-colors text-xs"
                    >
                      + Agregar
                    </button>
                  </div>
                </td>
              </tr>

            </tbody>

          </table>

            </div>

            <!-- Leyenda -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <h3 class="text-sm font-semibold text-gray-700 mb-3">Leyenda:</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div class="flex items-center">
                  <div class="w-4 h-4 rounded bg-blue-50 border border-blue-200 mr-2"></div>
                  <span class="text-gray-700">Recreo (15 min)</span>
                </div>
                <div class="flex items-center">
                  <div class="w-4 h-4 rounded bg-orange-50 border border-orange-200 mr-2"></div>
                  <span class="text-gray-700">Almuerzo (40 min)</span>
                </div>
                <div class="flex items-center">
                  <div class="w-4 h-4 rounded bg-gray-100 border border-gray-300 mr-2"></div>
                  <span class="text-gray-700">Fuera de horario</span>
                </div>
                <div class="flex items-center">
                  <div class="w-4 h-4 rounded bg-white border border-gray-300 mr-2"></div>
                  <span class="text-gray-700">Bloque de clase (40 min)</span>
                </div>
              </div>
              <p class="mt-3 text-xs text-gray-600">
                <strong>Horario:</strong> Lunes a Jueves: 8:30 - 16:20 | Viernes: 8:30 - 14:20
              </p>
            </div>
          </div>
        </div>

        <!-- Panel Lateral de Asignaturas -->
        <div class="col-span-3">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Asignaturas del Curso</h3>
            <div class="space-y-3">
              <div
                v-for="asignatura in asignaturas"
                :key="asignatura.asignatura_id"
                class="p-3 rounded-lg border-l-4 bg-gray-50"
                :class="getAsignaturaColor(asignatura)"
              >
                <p class="text-sm font-semibold text-gray-900">{{ asignatura.nombre }}</p>
                <p class="text-xs text-gray-600 mt-1">{{ asignatura.profesor_nombre }}</p>

                <!-- Indicador de horas -->
                <div class="mt-2">
                  <div class="flex justify-between items-center text-xs mb-1">
                    <span class="text-gray-600">Horas asignadas</span>
                    <span class="font-medium" :class="getHorasAsignadas(asignatura.asignatura_id) > asignatura.horas_semanales ? 'text-red-600' : 'text-gray-900'">
                      {{ getHorasAsignadas(asignatura.asignatura_id).toFixed(1) }}h / {{ asignatura.horas_semanales }}h
                    </span>
                  </div>
                  <!-- Barra de progreso -->
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="h-2 rounded-full transition-all"
                      :class="getHorasAsignadas(asignatura.asignatura_id) > asignatura.horas_semanales ? 'bg-red-500' : getHorasAsignadas(asignatura.asignatura_id) === asignatura.horas_semanales ? 'bg-green-500' : 'bg-blue-500'"
                      :style="{ width: Math.min((getHorasAsignadas(asignatura.asignatura_id) / asignatura.horas_semanales) * 100, 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
              <div v-if="asignaturas.length === 0" class="text-center py-8 text-gray-500 text-sm">
                No hay asignaturas asociadas a este curso
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state sin curso seleccionado -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">Selecciona un curso o asignatura</h3>
        <p class="mt-2 text-sm text-gray-600">
          Para ver y gestionar los horarios, selecciona un curso o asignatura en los filtros
        </p>
      </div>
    </div>
  </div>

    <!-- Modal Create/Edit -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">
            {{ isEditing ? 'Editar Bloque Horario' : 'Nuevo Bloque Horario' }}
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <!-- Asignatura -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Asignatura <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.asignatura_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="" disabled>Seleccione una asignatura</option>
              <option v-for="asig in asignaturas" :key="asig.asignatura_id" :value="asig.asignatura_id">
                {{ asig.nombre }} ({{ asig.profesor_nombre }})
              </option>
            </select>
          </div>

          <!-- Día de la semana y Período -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Día de la Semana <span class="text-red-500">*</span>
              </label>
              <select
                v-model.number="formData.dia_semana"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="" disabled>Seleccione día</option>
                <option v-for="dia in diasSemana" :key="dia.value" :value="dia.value">
                  {{ dia.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Período <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.periodo"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="" disabled>Seleccione período</option>
                <option value="2025-S1">2025 - Semestre 1</option>
                <option value="2025-S2">2025 - Semestre 2</option>
                <option value="2026-S1">2026 - Semestre 1</option>
              </select>
            </div>
          </div>

          <!-- Bloque Horario -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Bloque Horario <span class="text-red-500">*</span>
            </label>
            <select
              v-model="selectedBloqueIndex"
              @change="updateBloqueHorario"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="" disabled>Seleccione un bloque</option>
              <option
                v-for="(bloque, index) in bloquesDisponiblesParaDia"
                :key="index"
                :value="index"
                :disabled="bloque.tipo !== 'clase'"
              >
                {{ bloque.hora_inicio }} - {{ bloque.hora_termino }}
                {{ bloque.tipo === 'recreo' ? ' (Recreo)' : bloque.tipo === 'almuerzo' ? ' (Almuerzo)' : '' }}
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500">
              Bloques de 40 minutos. Viernes termina a las 14:20.
            </p>
          </div>

          <!-- Sala -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Sala
            </label>
            <select
              v-model="formData.sala_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Sin sala asignada</option>
              <option v-for="sala in salas" :key="sala.sala_id" :value="sala.sala_id">
                {{ sala.nombre }} (Capacidad: {{ sala.capacidad }})
              </option>
            </select>
          </div>

          <!-- Estado Activo -->
          <div class="flex items-center">
            <input
              v-model="formData.estado_activo"
              type="checkbox"
              id="estado_activo"
              class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
            />
            <label for="estado_activo" class="ml-2 text-sm text-gray-700">
              Bloque horario activo
            </label>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400"
            >
              {{ submitting ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-lg font-medium text-gray-900">Eliminar Bloque Horario</h3>
            <p class="mt-2 text-sm text-gray-600">
              ¿Estás seguro de eliminar este bloque horario? Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="closeDeleteConfirm"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleDelete"
            :disabled="deleting"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
          >
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/layouts/AdminLayout.vue'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/services/api.config'
import { useCursoStore } from '@/store/curso.store'
import { NIVELES, getNivelDisplay } from '@/constants/niveles.constants'

const route = useRoute()
const router = useRouter()
const cursoStore = useCursoStore()

interface Curso {
  curso_id: string
  nombre: string
  nivel: string
}

interface Asignatura {
  asignatura_id: string
  nombre: string
  curso_id: string
  curso_nombre: string
  profesor_id: string
  profesor_nombre: string
  periodo: string
  horas_semanales: number
}

interface Sala {
  sala_id: string
  nombre: string
  capacidad: number
}

interface Horario {
  horario_id: number
  asignatura_id: string
  asignatura_nombre: string
  profesor_id: string
  profesor_nombre: string
  curso_nombre: string
  dia_semana: number
  hora_inicio: string
  hora_termino: string
  periodo: string
  sala_id: string | null
  sala_nombre: string | null
  estado_activo: boolean
}

interface BloqueHorario {
  hora_inicio: string
  hora_termino: string
  tipo: 'clase' | 'recreo' | 'almuerzo'
  nombre?: string
}

const diasSemana = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' }
]

// Definición de bloques horarios predefinidos (40 minutos cada uno)
// Jornada: 8:30 - 16:20 (Lunes-Jueves), 8:30 - 14:20 (Viernes)
// Recreos: 2 de 15 min + 1 de 40 min (almuerzo)
const BLOQUES_PREDEFINIDOS: BloqueHorario[] = [
  { hora_inicio: '08:30', hora_termino: '09:10', tipo: 'clase' },  // Bloque 1
  { hora_inicio: '09:10', hora_termino: '09:50', tipo: 'clase' },  // Bloque 2
  { hora_inicio: '09:50', hora_termino: '10:05', tipo: 'recreo', nombre: 'Recreo 1' }, // Recreo 15 min
  { hora_inicio: '10:05', hora_termino: '10:45', tipo: 'clase' },  // Bloque 3
  { hora_inicio: '10:45', hora_termino: '11:25', tipo: 'clase' },  // Bloque 4
  { hora_inicio: '11:25', hora_termino: '11:40', tipo: 'recreo', nombre: 'Recreo 2' }, // Recreo 15 min
  { hora_inicio: '11:40', hora_termino: '12:20', tipo: 'clase' },  // Bloque 5
  { hora_inicio: '12:20', hora_termino: '13:00', tipo: 'clase' },  // Bloque 6
  { hora_inicio: '13:00', hora_termino: '13:40', tipo: 'almuerzo', nombre: 'Almuerzo' }, // Almuerzo 40 min
  { hora_inicio: '13:40', hora_termino: '14:20', tipo: 'clase' },  // Bloque 7
  { hora_inicio: '14:20', hora_termino: '15:00', tipo: 'clase' },  // Bloque 8 (solo Lun-Jue)
  { hora_inicio: '15:00', hora_termino: '15:40', tipo: 'clase' },  // Bloque 9 (solo Lun-Jue)
  { hora_inicio: '15:40', hora_termino: '16:20', tipo: 'clase' }   // Bloque 10 (solo Lun-Jue)
]

const filters = ref({
  curso_id: '',
  asignatura_id: '',
  periodo: '2025-S1'
})

const cursos = ref<Curso[]>([])
const cursoSeleccionado = ref<any>(null)
const asignaturas = ref<Asignatura[]>([])
const salas = ref<Sala[]>([])
const horarios = ref<Horario[]>([])

const showModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const showDeleteConfirm = ref(false)
const horarioToDelete = ref<Horario | null>(null)
const deleting = ref(false)

const formData = ref({
  asignatura_id: '',
  dia_semana: null as number | null,
  hora_inicio: '',
  hora_termino: '',
  periodo: '2025-S1',
  sala_id: '',
  estado_activo: true
})

const editingHorarioId = ref<number | null>(null)
const selectedBloqueIndex = ref<number | ''>('')

// Bloques disponibles según el día seleccionado en el formulario
const bloquesDisponiblesParaDia = computed(() => {
  if (!formData.value.dia_semana) {
    return BLOQUES_PREDEFINIDOS
  }
  return getBloquesPorDia(formData.value.dia_semana)
})

// Función para obtener bloques según el día (viernes termina a las 14:20)
const getBloquesPorDia = (diaValue: number) => {
  if (diaValue === 5) {
    // Viernes: solo hasta las 14:20
    return BLOQUES_PREDEFINIDOS.filter(b => b.hora_termino <= '14:20')
  }
  // Lunes a Jueves: jornada completa hasta 16:20
  return BLOQUES_PREDEFINIDOS
}

// Bloques horarios a mostrar en la tabla (todos los bloques de lunes a jueves)
const bloquesHorarios = computed(() => {
  // Mostrar todos los bloques predefinidos (incluyendo recreos y almuerzo)
  return BLOQUES_PREDEFINIDOS
})

const getViewTitle = () => {
  if (filters.value.asignatura_id) {
    const asig = asignaturas.value.find(a => a.asignatura_id === filters.value.asignatura_id)
    return asig ? `${asig.nombre} - ${asig.profesor_nombre}` : 'Horario'
  }
  if (filters.value.curso_id) {
    const curso = cursos.value.find(c => c.curso_id === filters.value.curso_id)
    return curso ? `Horario de ${curso.nombre} ${curso.nivel}` : 'Horario'
  }
  return 'Horario Semanal'
}

const getHorariosByBloqueYDia = (bloque: { hora_inicio: string; hora_termino: string }, dia: number) => {
  // Buscar horarios que estén dentro de este bloque de tiempo o que coincidan exactamente
  return horarios.value.filter(h => {
    if (h.dia_semana !== dia) return false

    // Coincidencia exacta
    if (h.hora_inicio === bloque.hora_inicio && h.hora_termino === bloque.hora_termino) {
      return true
    }

    // Horarios que empiezan en este bloque (para compatibilidad con horarios antiguos)
    const horaInicioBloque = bloque.hora_inicio.substring(0, 5)
    const horaInicioHorario = h.hora_inicio.substring(0, 5)

    // Si el horario inicia en este bloque, mostrarlo aquí
    return horaInicioHorario >= horaInicioBloque && horaInicioHorario < bloque.hora_termino
  })
}

const getCellClass = (bloque: BloqueHorario, diaValue: number) => {
  // Recreo y almuerzo con fondo distintivo
  if (bloque.tipo === 'recreo') {
    return 'bg-blue-50'
  }
  if (bloque.tipo === 'almuerzo') {
    return 'bg-orange-50'
  }
  // Bloques fuera del horario del viernes
  if (diaValue === 5 && bloque.hora_inicio >= '14:20') {
    return 'bg-gray-100'
  }
  return ''
}

const getHorarioColor = (horario: Horario) => {
  const colors = [
    'border-blue-400 bg-blue-50',
    'border-green-400 bg-green-50',
    'border-purple-400 bg-purple-50',
    'border-yellow-400 bg-yellow-50',
    'border-pink-400 bg-pink-50',
    'border-indigo-400 bg-indigo-50'
  ]
  const hash = horario.asignatura_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

const getAsignaturaColor = (asignatura: any) => {
  const colors = [
    'border-blue-500',
    'border-green-500',
    'border-purple-500',
    'border-yellow-500',
    'border-pink-500',
    'border-indigo-500'
  ]
  const hash = asignatura.asignatura_id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

// Calcula las horas académicas asignadas a una asignatura sumando la duración de todos sus bloques
// 1 hora académica = 40 minutos
const getHorasAsignadas = (asignaturaId: string): number => {
  const horariosAsignatura = horarios.value.filter(h => h.asignatura_id === asignaturaId)

  let totalMinutos = 0
  horariosAsignatura.forEach(horario => {
    const [horaInicio, minInicio] = horario.hora_inicio.split(':').map(Number)
    const [horaFin, minFin] = horario.hora_termino.split(':').map(Number)

    const minutosInicio = horaInicio * 60 + minInicio
    const minutosFin = horaFin * 60 + minFin

    totalMinutos += minutosFin - minutosInicio
  })

  // Convertir minutos a horas académicas (1 hora académica = 40 minutos)
  return totalMinutos / 40
}

// Verifica si agregar un nuevo bloque excedería las horas académicas semanales
// 1 hora académica = 40 minutos
const validarHorasDisponibles = (asignaturaId: string, horaInicio: string, horaTermino: string): { valido: boolean, mensaje: string } => {
  const asignatura = asignaturas.value.find(a => a.asignatura_id === asignaturaId)
  if (!asignatura || !asignatura.horas_semanales) {
    return { valido: true, mensaje: '' }
  }

  const horasActuales = getHorasAsignadas(asignaturaId)

  // Calcular duración del nuevo bloque en horas académicas (40 minutos = 1 hora académica)
  const [horaIni, minIni] = horaInicio.split(':').map(Number)
  const [horaFin, minFin] = horaTermino.split(':').map(Number)
  const minutosBloque = (horaFin * 60 + minFin) - (horaIni * 60 + minIni)
  const horasBloque = minutosBloque / 40

  const totalHoras = horasActuales + horasBloque

  if (totalHoras > asignatura.horas_semanales) {
    return {
      valido: false,
      mensaje: `Esta asignatura tiene ${asignatura.horas_semanales}h académicas semanales. Ya tiene ${horasActuales.toFixed(1)}h asignadas. Este bloque suma ${horasBloque.toFixed(1)}h más, excediendo el límite.`
    }
  }

  return { valido: true, mensaje: '' }
}

// Función auxiliar para verificar si dos rangos horarios se solapan
const horariosSeSuperponen = (
  hora1_inicio: string,
  hora1_termino: string,
  hora2_inicio: string,
  hora2_termino: string
): boolean => {
  // Convertir a minutos desde medianoche
  const toMinutes = (time: string): number => {
    const [hours, mins] = time.split(':').map(Number)
    return hours * 60 + mins
  }

  const inicio1 = toMinutes(hora1_inicio)
  const fin1 = toMinutes(hora1_termino)
  const inicio2 = toMinutes(hora2_inicio)
  const fin2 = toMinutes(hora2_termino)

  // Los horarios se superponen si:
  // - El inicio de uno está entre el inicio y fin del otro
  // - O si uno contiene completamente al otro
  return (inicio1 < fin2 && fin1 > inicio2)
}

// Validar que el profesor no tenga solapamiento de horarios
const validarSolapamientoProfesor = async (
  asignaturaId: string,
  diaSemana: number,
  horaInicio: string,
  horaTermino: string,
  horarioIdExcluir?: number | null
): Promise<{ valido: boolean; mensaje: string }> => {
  try {
    // Obtener el profesor de la asignatura seleccionada
    const asignatura = asignaturas.value.find(a => a.asignatura_id === asignaturaId)
    if (!asignatura) {
      return { valido: true, mensaje: '' }
    }

    const profesorId = asignatura.profesor_id

    // Obtener todos los horarios del profesor para ese día
    const response = await apiClient.get(`/horarios/profesor/${profesorId}`, {
      params: { periodo: formData.value.periodo }
    })

    // El backend agrupa por día, obtener los horarios del día específico
    const horariosPorDia = response.data
    const horariosDelDia = horariosPorDia[diaSemana] || []

    // Verificar solapamientos
    for (const horario of horariosDelDia) {
      // Excluir el horario que estamos editando
      if (horarioIdExcluir && horario.horario_id === horarioIdExcluir) {
        continue
      }

      if (horariosSeSuperponen(horaInicio, horaTermino, horario.hora_inicio, horario.hora_termino)) {
        const asignaturaConflicto = horario.Asignatura?.nombre || 'Asignatura'
        const cursoConflicto = horario.Asignatura?.Curso?.nombre || 'Curso'
        return {
          valido: false,
          mensaje: `El profesor ${asignatura.profesor_nombre} ya tiene clase en este horario:\n${asignaturaConflicto} - ${cursoConflicto}\n(${horario.hora_inicio} - ${horario.hora_termino})`
        }
      }
    }

    return { valido: true, mensaje: '' }
  } catch (error) {
    console.error('Error validando solapamiento de profesor:', error)
    return { valido: true, mensaje: '' } // En caso de error, permitir continuar
  }
}

// Validar que la sala no tenga solapamiento de horarios
const validarSolapamientoSala = (
  salaId: string | null,
  diaSemana: number,
  horaInicio: string,
  horaTermino: string,
  horarioIdExcluir?: number | null
): { valido: boolean; mensaje: string } => {
  // Si no hay sala asignada, no validar
  if (!salaId) {
    return { valido: true, mensaje: '' }
  }

  // Buscar todos los horarios de esa sala en ese día
  const horariosDelDiaEnSala = horarios.value.filter(h =>
    h.sala_id === salaId &&
    h.dia_semana === diaSemana &&
    h.horario_id !== horarioIdExcluir
  )

  // Verificar solapamientos
  for (const horario of horariosDelDiaEnSala) {
    if (horariosSeSuperponen(horaInicio, horaTermino, horario.hora_inicio, horario.hora_termino)) {
      const sala = salas.value.find(s => s.sala_id === salaId)
      return {
        valido: false,
        mensaje: `La sala ${sala?.nombre || salaId} ya está ocupada en este horario:\n${horario.asignatura_nombre} - ${horario.curso_nombre}\n(${horario.hora_inicio} - ${horario.hora_termino})`
      }
    }
  }

  return { valido: true, mensaje: '' }
}

const loadCursos = async () => {
  try {
    await cursoStore.fetchAll()
  } catch (error) {
    console.error('Error loading cursos:', error)
  }
}

const loadAsignaturas = async () => {
  try {
    const url = filters.value.curso_id
      ? `/asignaturas?curso_id=${filters.value.curso_id}`
      : '/asignaturas'
    const response = await apiClient.get(url)

    // El backend puede devolver { data: [...] } o directamente [...]
    const asignaturasData = response.data.data || response.data

    asignaturas.value = asignaturasData.map((a: any) => ({
      asignatura_id: a.asignatura_id,
      nombre: a.nombre,
      curso_id: a.curso_id,
      curso_nombre: a.Curso?.nombre || a.curso?.nombre || '',
      profesor_id: a.profesor_id,
      profesor_nombre: a.Profesor?.nombre_completo || a.profesor?.nombre_completo || '',
      periodo: a.periodo,
      horas_semanales: a.horas_semanales || 0
    }))

    await loadHorarios()
  } catch (error) {
    console.error('Error loading asignaturas:', error)
  }
}


const loadSalas = async () => {
  try {
    const response = await apiClient.get('/salas')
    salas.value = response.data
  } catch (error) {
    console.error('Error loading salas:', error)
  }
}

const loadHorarios = async () => {
  try {
    if (!filters.value.curso_id) {
      console.error('No se puede cargar horarios sin curso_id')
      return
    }

    // Usar la ruta específica para obtener horarios por curso
    let url = `/horarios/curso/${filters.value.curso_id}`
    if (filters.value.periodo) {
      url += `?periodo=${filters.value.periodo}`
    }

    const response = await apiClient.get(url)

    // El backend devuelve un array directamente
    const horariosData = Array.isArray(response.data) ? response.data : []

    horarios.value = horariosData.map((h: any) => ({
      horario_id: h.horario_id,
      asignatura_id: h.asignatura_id,
      asignatura_nombre: h.Asignatura?.nombre || h.asignatura?.nombre || '',
      profesor_id: h.Asignatura?.Profesor?.profesor_id || h.asignatura?.profesor_id || '',
      profesor_nombre: h.Asignatura?.Profesor?.nombre_completo || h.asignatura?.profesor?.nombre_completo || '',
      curso_nombre: h.Asignatura?.Curso?.nombre || h.asignatura?.curso?.nombre || '',
      dia_semana: h.dia_semana,
      hora_inicio: h.hora_inicio,
      hora_termino: h.hora_termino,
      periodo: h.periodo,
      sala_id: h.sala_id,
      sala_nombre: h.Sala?.nombre || h.sala?.nombre || null,
      estado_activo: h.estado_activo
    }))
  } catch (error) {
    console.error('Error loading horarios:', error)
  }
}

// Función para actualizar las horas cuando se selecciona un bloque
const updateBloqueHorario = () => {
  if (selectedBloqueIndex.value !== '') {
    const bloques = bloquesDisponiblesParaDia.value
    const bloque = bloques[selectedBloqueIndex.value as number]
    if (bloque && bloque.tipo === 'clase') {
      formData.value.hora_inicio = bloque.hora_inicio
      formData.value.hora_termino = bloque.hora_termino
    }
  }
}

const openCreateModal = () => {
  isEditing.value = false
  selectedBloqueIndex.value = ''
  formData.value = {
    asignatura_id: filters.value.asignatura_id || '',
    dia_semana: null,
    hora_inicio: '',
    hora_termino: '',
    periodo: filters.value.periodo || '2025-S1',
    sala_id: '',
    estado_activo: true
  }
  showModal.value = true
}

const openCreateModalWithData = (bloque: { hora_inicio: string; hora_termino: string }, dia: number) => {
  isEditing.value = false
  formData.value = {
    asignatura_id: filters.value.asignatura_id || '',
    dia_semana: dia,
    hora_inicio: bloque.hora_inicio,
    hora_termino: bloque.hora_termino,
    periodo: filters.value.periodo || '2025-S1',
    sala_id: '',
    estado_activo: true
  }

  // Encontrar el índice del bloque en los bloques disponibles para ese día
  const bloques = getBloquesPorDia(dia)
  const index = bloques.findIndex(b => b.hora_inicio === bloque.hora_inicio && b.hora_termino === bloque.hora_termino)
  selectedBloqueIndex.value = index >= 0 ? index : ''

  showModal.value = true
}

const openEditModal = (horario: Horario) => {
  isEditing.value = true
  editingHorarioId.value = horario.horario_id
  formData.value = {
    asignatura_id: horario.asignatura_id,
    dia_semana: horario.dia_semana,
    hora_inicio: horario.hora_inicio,
    hora_termino: horario.hora_termino,
    periodo: horario.periodo,
    sala_id: horario.sala_id || '',
    estado_activo: horario.estado_activo
  }

  // Encontrar el índice del bloque
  const bloques = getBloquesPorDia(horario.dia_semana)
  const index = bloques.findIndex(b => b.hora_inicio === horario.hora_inicio && b.hora_termino === horario.hora_termino)
  selectedBloqueIndex.value = index >= 0 ? index : ''

  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  editingHorarioId.value = null
  selectedBloqueIndex.value = ''
}

const handleSubmit = async () => {
  try {
    submitting.value = true

    // Validar que se hayan seleccionado todos los campos requeridos
    if (!formData.value.asignatura_id || !formData.value.dia_semana || !formData.value.hora_inicio || !formData.value.hora_termino) {
      alert('Por favor complete todos los campos requeridos')
      submitting.value = false
      return
    }

    // Validar horas disponibles solo al crear o si cambió la asignatura/horas al editar
    if (!isEditing.value || formData.value.asignatura_id) {
      const validacion = validarHorasDisponibles(
        formData.value.asignatura_id,
        formData.value.hora_inicio,
        formData.value.hora_termino
      )

      if (!validacion.valido) {
        alert(validacion.mensaje)
        submitting.value = false
        return
      }
    }

    // Validar solapamiento de profesor
    const validacionProfesor = await validarSolapamientoProfesor(
      formData.value.asignatura_id,
      formData.value.dia_semana,
      formData.value.hora_inicio,
      formData.value.hora_termino,
      isEditing.value ? editingHorarioId.value : null
    )

    if (!validacionProfesor.valido) {
      alert('Conflicto de horario del profesor:\n\n' + validacionProfesor.mensaje)
      submitting.value = false
      return
    }

    // Validar solapamiento de sala
    const validacionSala = validarSolapamientoSala(
      formData.value.sala_id,
      formData.value.dia_semana,
      formData.value.hora_inicio,
      formData.value.hora_termino,
      isEditing.value ? editingHorarioId.value : null
    )

    if (!validacionSala.valido) {
      alert('Conflicto de sala:\n\n' + validacionSala.mensaje)
      submitting.value = false
      return
    }

    const data = {
      ...formData.value,
      sala_id: formData.value.sala_id || null
    }

    if (isEditing.value && editingHorarioId.value) {
      await apiClient.put(`/horarios/${editingHorarioId.value}`, data)
      alert('Horario actualizado exitosamente')
    } else {
      await apiClient.post('/horarios', data)
      alert('Horario creado exitosamente')
    }

    await loadHorarios()
    closeModal()
  } catch (error: any) {
    console.error('Error saving horario:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Error al guardar el horario'
    alert('Error al guardar el horario:\n' + errorMessage)
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (horario: Horario) => {
  horarioToDelete.value = horario
  showDeleteConfirm.value = true
}

const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false
  horarioToDelete.value = null
}

const handleDelete = async () => {
  if (!horarioToDelete.value) return
  try {
    deleting.value = true
    await apiClient.delete(`/horarios/${horarioToDelete.value.horario_id}`)
    await loadHorarios()
    closeDeleteConfirm()
  } catch (error) {
    console.error('Error deleting horario:', error)
    alert('Error al eliminar el horario')
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  // Verificar que venga curso_id desde la URL
  const cursoIdFromUrl = route.query.curso_id as string
  if (!cursoIdFromUrl) {
    alert('Debe seleccionar un curso desde la vista de cursos')
    router.push('/admin/courses')
    return
  }

  // Establecer filtro
  filters.value.curso_id = cursoIdFromUrl

  // Cargar datos iniciales
  await Promise.all([
    loadCursos(),
    loadSalas()
  ])

  // Cargar curso seleccionado
  await cursoStore.fetchById(cursoIdFromUrl)
  cursoSeleccionado.value = cursoStore.currentCurso

  // Cargar asignaturas del curso
  await loadAsignaturas()
})
</script>
