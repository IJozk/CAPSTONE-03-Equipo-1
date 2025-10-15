<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestión de Cursos</h1>
          <p class="text-gray-600 mt-1">Administra todos los cursos del colegio</p>
        </div>
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Curso
        </button>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-lg shadow p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
            <select
              v-model.number="filters.nivel_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option :value="undefined">Todos los niveles</option>
              <option v-for="nivel in NIVELES" :key="nivel.id" :value="nivel.id">
                {{ nivel.display }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Año Académico</label>
            <input
              v-model.number="filters.anio_academico"
              type="number"
              placeholder="Ej: 2024"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div class="flex items-end gap-2">
            <button
              @click="applyFilters"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Filtrar
            </button>
            <button
              @click="clearFilters"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="cursoStore.loading" class="bg-white rounded-lg shadow p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="text-gray-600 mt-4">Cargando cursos...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="cursoStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-red-800">{{ cursoStore.error }}</p>
        </div>
      </div>

      <!-- Table -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Letra</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año Académico</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generación</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidad</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="cursoStore.cursos.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                  No hay cursos registrados
                </td>
              </tr>
              <tr v-for="curso in cursoStore.cursos" :key="curso.curso_id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ getNivelDisplay(curso.nivel) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ curso.nombre }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ curso.anio_academico }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ curso.generacion }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ curso.capacidad_maxima || 'Sin límite' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    @click="openEditModal(curso)"
                    class="text-primary-600 hover:text-primary-900"
                    title="Editar"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="confirmDelete(curso)"
                    class="text-red-600 hover:text-red-900"
                    title="Eliminar"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Crear/Editar -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900">
                {{ isEditing ? 'Editar Curso' : 'Nuevo Curso' }}
              </h2>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-4">
              <!-- Nombre y Nivel -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Nivel <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model.number="formData.nivel_id"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option v-for="nivel in NIVELES" :key="nivel.id" :value="nivel.id">
                      {{ nivel.display }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Letra <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="formData.nombre"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="" disabled>Selecciona una letra</option>
                    <option v-for="letra in letras" :key="letra" :value="letra">
                      {{ letra }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Año y Generación -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Año Académico <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model.number="formData.anio_academico"
                    type="number"
                    required
                    placeholder="Ej: 2024"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Generación <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model.number="formData.generacion"
                    type="number"
                    required
                    placeholder="Ej: 2024"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <!-- Capacidad Máxima -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Capacidad Máxima</label>
                <input
                  v-model.number="formData.capacidad_maxima"
                  type="number"
                  min="1"
                  placeholder="Dejar vacío para sin límite"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <!-- Botones -->
              <div class="flex justify-end gap-3 pt-4">
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
                  class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {{ submitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal Confirmar Eliminación -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="showDeleteModal = false"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirmar Eliminación</h3>
          <p class="text-gray-600 mb-6">
            ¿Estás seguro de que deseas eliminar el curso
            <span class="font-semibold">{{ cursoToDelete?.nombre }}</span>?
            Esta acción no se puede deshacer.
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="handleDelete"
              :disabled="submitting"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
            >
              {{ submitting ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useCursoStore } from '@/store/curso.store'
import type { Curso, CreateCursoDTO, FilterCursoDTO } from '@/types/curso.types'
import { NIVELES, getNivelDisplay } from '@/constants/niveles.constants'

const cursoStore = useCursoStore()

// Letras disponibles para los cursos
const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// Estados del modal
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const cursoToDelete = ref<Curso | null>(null)

// Datos del formulario
const formData = ref<CreateCursoDTO>({
  nombre: '',
  nivel_id: 1, // Por defecto Pre-Kinder
  anio_academico: new Date().getFullYear(),
  generacion: new Date().getFullYear(),
  capacidad_maxima: null
})

const editingId = ref<string | null>(null)

// Filtros
const filters = ref<FilterCursoDTO>({
  nivel_id: undefined,
  anio_academico: undefined,
  generacion: undefined
})

// Cargar cursos al montar
onMounted(() => {
  loadCursos()
})

const loadCursos = async () => {
  try {
    await cursoStore.fetchAll()
  } catch (error) {
    console.error('Error cargando cursos:', error)
  }
}

const applyFilters = async () => {
  try {
    const activeFilters: FilterCursoDTO = {}
    if (filters.value.nivel_id) activeFilters.nivel_id = filters.value.nivel_id
    if (filters.value.anio_academico) activeFilters.anio_academico = filters.value.anio_academico

    await cursoStore.fetchAll(activeFilters)
  } catch (error) {
    console.error('Error aplicando filtros:', error)
  }
}

const clearFilters = async () => {
  filters.value = {
    nivel_id: undefined,
    anio_academico: undefined,
    generacion: undefined
  }
  cursoStore.clearFilters()
  await loadCursos()
}

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  formData.value = {
    nombre: '',
    nivel_id: 1, // Por defecto Pre-Kinder
    anio_academico: new Date().getFullYear(),
    generacion: new Date().getFullYear(),
    capacidad_maxima: null
  }
  showModal.value = true
}

const openEditModal = (curso: Curso) => {
  isEditing.value = true
  editingId.value = curso.curso_id
  formData.value = {
    nombre: curso.nombre,
    nivel_id: curso.nivel_id,
    anio_academico: curso.anio_academico,
    generacion: curso.generacion,
    capacidad_maxima: curso.capacidad_maxima
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  editingId.value = null
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (isEditing.value && editingId.value) {
      await cursoStore.update(editingId.value, formData.value)
      alert('Curso actualizado exitosamente')
    } else {
      await cursoStore.create(formData.value)
      alert('Curso creado exitosamente')
    }
    closeModal()
  } catch (error: any) {
    alert(`Error: ${error.message}`)
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (curso: Curso) => {
  cursoToDelete.value = curso
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!cursoToDelete.value) return

  submitting.value = true
  try {
    await cursoStore.delete(cursoToDelete.value.curso_id)
    alert('Curso eliminado exitosamente')
    showDeleteModal.value = false
    cursoToDelete.value = null
  } catch (error: any) {
    alert(`Error: ${error.message}`)
  } finally {
    submitting.value = false
  }
}
</script>
