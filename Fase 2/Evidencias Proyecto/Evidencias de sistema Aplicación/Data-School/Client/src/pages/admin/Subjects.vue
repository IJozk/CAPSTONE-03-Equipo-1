<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestión de Asignaturas</h1>
          <p class="text-gray-600 mt-1">Administra todas las asignaturas del colegio</p>
        </div>
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Asignatura
        </button>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-lg shadow p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
            <input
              v-model="filters.periodo"
              type="text"
              placeholder="Ej: 2024-1"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              v-model="filters.estado_activo"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option :value="undefined">Todos</option>
              <option :value="true">Activos</option>
              <option :value="false">Inactivos</option>
            </select>
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
      <div v-if="asignaturaStore.loading" class="bg-white rounded-lg shadow p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="text-gray-600 mt-4">Cargando asignaturas...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="asignaturaStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-red-800">{{ asignaturaStore.error }}</p>
        </div>
      </div>

      <!-- Table -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignatura</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profesor</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periodo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas/Sem</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="asignaturaStore.asignaturas.length === 0">
                <td colspan="8" class="px-6 py-8 text-center text-gray-500">
                  No hay asignaturas registradas
                </td>
              </tr>
              <tr v-for="asignatura in asignaturaStore.asignaturas" :key="asignatura.asignatura_id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ asignatura.codigo }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ asignatura.nombre }}</div>
                  <div v-if="asignatura.descripcion" class="text-sm text-gray-500">{{ asignatura.descripcion }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ asignatura.Curso?.nombre || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ asignatura.Profesor?.nombre_completo || 'Sin asignar' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ asignatura.periodo }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ asignatura.horas_semanales || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                      asignatura.estado_activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ asignatura.estado_activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    @click="openEditModal(asignatura)"
                    class="text-primary-600 hover:text-primary-900"
                    title="Editar"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    v-if="asignatura.estado_activo"
                    @click="confirmDelete(asignatura)"
                    class="text-red-600 hover:text-red-900"
                    title="Desactivar"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button
                    v-else
                    @click="confirmActivate(asignatura)"
                    class="text-green-600 hover:text-green-900"
                    title="Activar"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                {{ isEditing ? 'Editar Asignatura' : 'Nueva Asignatura' }}
              </h2>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-4">
              <!-- Código y Nombre -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Código <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.codigo"
                    type="text"
                    required
                    placeholder="Ej: MAT-101"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Nombre <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.nombre"
                    type="text"
                    required
                    placeholder="Ej: Matemáticas"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <!-- Descripción -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  v-model="formData.descripcion"
                  rows="3"
                  placeholder="Descripción de la asignatura"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                ></textarea>
              </div>

              <!-- Curso y Profesor -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Curso ID <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.curso_id"
                    type="text"
                    required
                    placeholder="ID del curso"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Profesor ID <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.profesor_id"
                    type="text"
                    required
                    placeholder="ID del profesor"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <!-- Periodo -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Periodo <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.periodo"
                  type="text"
                  required
                  placeholder="Ej: 2024-1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <!-- Horas semanales y Créditos -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Horas Semanales</label>
                  <input
                    v-model.number="formData.horas_semanales"
                    type="number"
                    min="0"
                    placeholder="Ej: 4"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Créditos</label>
                  <input
                    v-model.number="formData.creditos"
                    type="number"
                    min="0"
                    placeholder="Ej: 3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
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
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirmar Desactivación</h3>
          <p class="text-gray-600 mb-6">
            ¿Estás seguro de que deseas desactivar la asignatura
            <span class="font-semibold">{{ asignaturaToDelete?.nombre }}</span>?
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
              {{ submitting ? 'Desactivando...' : 'Desactivar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Confirmar Activación -->
      <div
        v-if="showActivateModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="showActivateModal = false"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirmar Activación</h3>
          <p class="text-gray-600 mb-6">
            ¿Estás seguro de que deseas activar la asignatura
            <span class="font-semibold">{{ asignaturaToActivate?.nombre }}</span>?
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="showActivateModal = false"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="handleActivate"
              :disabled="submitting"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {{ submitting ? 'Activando...' : 'Activar' }}
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
import { useAsignaturaStore } from '@/store/asignatura.store'
import type { Asignatura, CreateAsignaturaDTO, FilterAsignaturaDTO } from '@/types/asignatura.types'

const asignaturaStore = useAsignaturaStore()

// Estados del modal
const showModal = ref(false)
const showDeleteModal = ref(false)
const showActivateModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const asignaturaToDelete = ref<Asignatura | null>(null)
const asignaturaToActivate = ref<Asignatura | null>(null)

// Datos del formulario
const formData = ref<CreateAsignaturaDTO>({
  codigo: '',
  nombre: '',
  descripcion: null,
  curso_id: '',
  profesor_id: '',
  periodo: '',
  horas_semanales: null,
  creditos: null,
  sala_id: null,
  tipo_asignatura_id: null,
  estado_activo: true
})

const editingId = ref<string | null>(null)

// Filtros
const filters = ref<FilterAsignaturaDTO>({
  periodo: '',
  estado_activo: undefined
})

// Cargar asignaturas al montar
onMounted(() => {
  loadAsignaturas()
})

const loadAsignaturas = async () => {
  try {
    await asignaturaStore.fetchAll()
  } catch (error) {
    console.error('Error cargando asignaturas:', error)
  }
}

const applyFilters = async () => {
  try {
    const activeFilters: FilterAsignaturaDTO = {}
    if (filters.value.periodo) activeFilters.periodo = filters.value.periodo
    if (filters.value.estado_activo !== undefined) activeFilters.estado_activo = filters.value.estado_activo

    await asignaturaStore.fetchAll(activeFilters)
  } catch (error) {
    console.error('Error aplicando filtros:', error)
  }
}

const clearFilters = async () => {
  filters.value = {
    periodo: '',
    estado_activo: undefined
  }
  asignaturaStore.clearFilters()
  await loadAsignaturas()
}

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  formData.value = {
    codigo: '',
    nombre: '',
    descripcion: null,
    curso_id: '',
    profesor_id: '',
    periodo: '',
    horas_semanales: null,
    creditos: null,
    sala_id: null,
    tipo_asignatura_id: null,
    estado_activo: true
  }
  showModal.value = true
}

const openEditModal = (asignatura: Asignatura) => {
  isEditing.value = true
  editingId.value = asignatura.asignatura_id
  formData.value = {
    codigo: asignatura.codigo,
    nombre: asignatura.nombre,
    descripcion: asignatura.descripcion,
    curso_id: asignatura.curso_id,
    profesor_id: asignatura.profesor_id,
    periodo: asignatura.periodo,
    horas_semanales: asignatura.horas_semanales,
    creditos: asignatura.creditos,
    sala_id: asignatura.sala_id,
    tipo_asignatura_id: asignatura.tipo_asignatura_id,
    estado_activo: asignatura.estado_activo
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
      await asignaturaStore.update(editingId.value, formData.value)
      alert('Asignatura actualizada exitosamente')
    } else {
      await asignaturaStore.create(formData.value)
      alert('Asignatura creada exitosamente')
    }
    closeModal()
  } catch (error: any) {
    alert(`Error: ${error.message}`)
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (asignatura: Asignatura) => {
  asignaturaToDelete.value = asignatura
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!asignaturaToDelete.value) return

  submitting.value = true
  try {
    await asignaturaStore.delete(asignaturaToDelete.value.asignatura_id)
    alert('Asignatura desactivada exitosamente')
    showDeleteModal.value = false
    asignaturaToDelete.value = null
  } catch (error: any) {
    alert(`Error: ${error.message}`)
  } finally {
    submitting.value = false
  }
}

const confirmActivate = (asignatura: Asignatura) => {
  asignaturaToActivate.value = asignatura
  showActivateModal.value = true
}

const handleActivate = async () => {
  if (!asignaturaToActivate.value) return

  submitting.value = true
  try {
    await asignaturaStore.activate(asignaturaToActivate.value.asignatura_id)
    alert('Asignatura activada exitosamente')
    showActivateModal.value = false
    asignaturaToActivate.value = null
  } catch (error: any) {
    alert(`Error: ${error.message}`)
  } finally {
    submitting.value = false
  }
}
</script>
