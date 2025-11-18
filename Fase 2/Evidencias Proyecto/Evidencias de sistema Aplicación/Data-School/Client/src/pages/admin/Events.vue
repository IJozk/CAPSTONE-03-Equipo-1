<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestión de Eventos</h1>
          <p class="text-gray-600 mt-1">
            Administra eventos importantes del colegio
          </p>
        </div>
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nuevo Evento
        </button>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-lg shadow p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Nombre del evento..."
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

      <!-- Loading -->
      <div
        v-if="eventoStore.loading"
        class="bg-white rounded-lg shadow p-8 text-center"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"
        ></div>
        <p class="text-gray-600 mt-4">Cargando eventos...</p>
      </div>

      <!-- Error -->
      <div
        v-else-if="eventoStore.error"
        class="bg-red-50 border border-red-200 rounded-lg p-4"
      >
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          <p class="text-red-800">{{ eventoStore.error }}</p>
        </div>
      </div>

      <!-- Tabla de eventos -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Evento
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha y horario
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Lugar
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="filteredEventos.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                  No hay eventos registrados
                </td>
              </tr>

              <tr
                v-for="evento in filteredEventos"
                :key="evento.evento_id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ evento.nombre }}
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  <div>
                    {{ formatFecha(evento.fecha_inicio) }}
                  </div>
                  <div class="text-gray-600">
                    {{ formatHora(evento.fecha_inicio) }} - {{ formatHora(evento.fecha_fin) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ evento.lugar }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    @click="openEditModal(evento)"
                    class="text-primary-600 hover:text-primary-900"
                    title="Editar"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    @click="confirmDelete(evento)"
                    class="text-red-600 hover:text-red-900"
                    title="Eliminar"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
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
        <div class="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900">
                {{ isEditing ? 'Editar Evento' : 'Nuevo Evento' }}
              </h2>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Evento <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.nombre"
                  type="text"
                  required
                  placeholder="Ej: Acto Fiestas Patrias"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <!-- 🔥 Se eliminó el campo Descripción -->

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Fecha <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.fecha"
                    type="date"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Hora inicio <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="formData.hora_inicio"
                      type="time"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Hora término <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="formData.hora_termino"
                      type="time"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Lugar <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.lugar"
                  type="text"
                  required
                  placeholder="Ej: Gimnasio, Patio central, Biblioteca"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

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
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirmar eliminación</h3>
          <p class="text-gray-600 mb-6">
            ¿Estás seguro de que deseas eliminar el evento
            <span class="font-semibold">{{ eventoToDelete?.nombre }}</span>?
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
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useEventoStore } from '@/store/evento.store'
import { useAuthStore } from '@/store/auth.store'
import eventoService, { type Evento } from '@/services/evento.service'

const eventoStore = useEventoStore()
const authStore = useAuthStore()

// Estados del modal
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const editingId = ref<string | null>(null)
const eventoToDelete = ref<Evento | null>(null)

// Filtros
const filters = ref({
  search: '',
  fecha: ''
})

// Formulario
const formData = ref({
  nombre: '',
  descripcion: '',
  fecha: '',
  hora_inicio: '',
  hora_termino: '',
  lugar: ''
})

// Cargar eventos al montar
onMounted(async () => {
  try {
    await eventoStore.fetchEventos()
  } catch (error) {
    console.error('Error al cargar eventos:', error)
  }
})

// Eventos filtrados
const filteredEventos = computed(() => {
  return eventoStore.eventos.filter((e) => {
    const matchesSearch =
      !filters.value.search ||
      e.nombre.toLowerCase().includes(filters.value.search.toLowerCase())
    
    // Extraer fecha de fecha_inicio para comparar
    const eventoFecha = e.fecha_inicio?.split('T')[0]
    const matchesFecha = !filters.value.fecha || eventoFecha === filters.value.fecha
    
    return matchesSearch && matchesFecha
  })
})

// Helpers de formato usando el servicio
const formatFecha = (fechaISO: string | undefined) => {
  return eventoService.formatFecha(fechaISO)
}

const formatHora = (fechaISO: string | undefined) => {
  return eventoService.formatHora(fechaISO)
}

const applyFilters = async () => {
  const filterParams: any = {}
  if (filters.value.fecha) {
    filterParams.fecha_inicio = filters.value.fecha
  }
  try {
    await eventoStore.fetchEventos(filterParams)
  } catch (error) {
    console.error('Error al aplicar filtros:', error)
  }
}

const clearFilters = async () => {
  filters.value = {
    search: '',
    fecha: ''
  }
  try {
    await eventoStore.fetchEventos()
  } catch (error) {
    console.error('Error al limpiar filtros:', error)
  }
}

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  formData.value = {
    nombre: '',
    descripcion: '',
    fecha: '',
    hora_inicio: '',
    hora_termino: '',
    lugar: ''
  }
  showModal.value = true
}

const openEditModal = (evento: Evento) => {
  isEditing.value = true
  editingId.value = evento.evento_id
  
  // Usar el helper del servicio para convertir evento a form
  const formDataFromEvento = eventoService.eventoToForm(evento)
  formData.value = formDataFromEvento
  
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  editingId.value = null
}

const handleSubmit = async () => {
  if (
    !formData.value.nombre ||
    !formData.value.fecha ||
    !formData.value.hora_inicio ||
    !formData.value.hora_termino ||
    !formData.value.lugar
  ) {
    alert('Por favor completa todos los campos obligatorios')
    return
  }

  // Opcional: validar que haya usuario logueado
  if (!authStore.user) {
    alert('Debes iniciar sesión para crear o editar eventos')
    return
  }

  submitting.value = true
  try {
    const currentUserId = authStore.user.id  // 👈 ESTE es el ID que sí existe

    if (isEditing.value && editingId.value) {
      await eventoStore.updateEventoFromForm(
        editingId.value,
        formData.value,
        currentUserId
      )
      alert('Evento actualizado exitosamente')
    } else {
      await eventoStore.createEventoFromForm(
        formData.value,
        currentUserId
      )
      alert('Evento creado exitosamente')
    }

    closeModal()
  } catch (error: any) {
    console.error('Error al guardar evento:', error)
    alert(`Error: ${error.message || 'Error al guardar el evento'}`)
  } finally {
    submitting.value = false
  }
}


const confirmDelete = (evento: Evento) => {
  eventoToDelete.value = evento
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!eventoToDelete.value) return
  submitting.value = true
  try {
    await eventoStore.deleteEvento(eventoToDelete.value.evento_id)
    alert('Evento eliminado exitosamente')
    showDeleteModal.value = false
    eventoToDelete.value = null
  } catch (error: any) {
    console.error('Error al eliminar evento:', error)
    alert(`Error: ${error.message || 'Error al eliminar el evento'}`)
  } finally {
    submitting.value = false
  }
}
</script>