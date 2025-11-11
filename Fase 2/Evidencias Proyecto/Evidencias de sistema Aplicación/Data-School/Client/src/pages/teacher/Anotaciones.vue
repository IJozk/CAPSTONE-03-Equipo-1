<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Anotaciones</h1>
        <p class="text-gray-600 mt-1">Registra y consulta anotaciones de tus estudiantes</p>
      </div>

      <!-- Selector de Asignatura -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Asignatura</label>
        <select
          v-model="selectedSubjectId"
          @change="loadAnotaciones"
          class="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Seleccionar asignatura</option>
          <option v-for="subject in teacherStore.subjects" :key="subject.asignatura_id" :value="subject.asignatura_id">
            {{ subject.nombre }} - {{ subject.curso.nombre }}
          </option>
        </select>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="text-gray-600 mt-4">Cargando anotaciones...</p>
      </div>

      <!-- Content -->
      <div v-else-if="selectedSubjectId">
        <!-- Tabs -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                @click="activeTab = 'create'"
                :class="[
                  activeTab === 'create'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                ]"
              >
                Nueva Anotación
              </button>
              <button
                @click="activeTab = 'list'"
                :class="[
                  activeTab === 'list'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                ]"
              >
                Historial ({{ anotaciones.length }})
              </button>
            </nav>
          </div>

          <!-- Tab Content: Nueva Anotación -->
          <div v-if="activeTab === 'create'" class="p-6">
            <form @submit.prevent="handleCreateAnotacion" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Estudiante -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Estudiante *</label>
                  <select
                    v-model="newAnotacion.estudiante_id"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar estudiante...</option>
                    <option v-for="student in estudiantesAsignatura" :key="student.estudiante_id" :value="student.estudiante_id">
                      {{ student.numero_lista }} - {{ student.nombre_completo }}
                    </option>
                  </select>
                </div>

                <!-- Tipo de Anotación -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Anotación *</label>
                  <select
                    v-model="newAnotacion.tipo_anotacion"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar tipo...</option>
                    <option value="Positiva">Positiva</option>
                    <option value="Negativa">Negativa</option>
                    <option value="Neutra">Neutra</option>
                  </select>
                </div>
              </div>

              <!-- Fecha -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                <input
                  v-model="newAnotacion.fecha"
                  type="date"
                  required
                  class="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <!-- Descripción -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  v-model="newAnotacion.descripcion"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe la anotación..."
                ></textarea>
              </div>

              <!-- Actions -->
              <div class="flex justify-end gap-3">
                <button
                  type="button"
                  @click="resetForm"
                  class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Limpiar
                </button>
                <button
                  type="submit"
                  :disabled="submitting"
                  class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {{ submitting ? 'Guardando...' : 'Guardar Anotación' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Tab Content: Historial -->
          <div v-else-if="activeTab === 'list'" class="p-6">
            <!-- Filters -->
            <div class="mb-4 flex flex-wrap gap-4">
              <div class="flex-1 min-w-[200px]">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Buscar estudiante..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <select
                v-model="filterTipo"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Todos los tipos</option>
                <option value="Positiva">Positivas</option>
                <option value="Negativa">Negativas</option>
                <option value="Neutra">Neutras</option>
              </select>
            </div>

            <!-- Lista de Anotaciones -->
            <div v-if="filteredAnotaciones.length === 0" class="text-center py-8 text-gray-500">
              No hay anotaciones registradas
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="anotacion in filteredAnotaciones"
                :key="anotacion.id"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                :class="{
                  'border-l-4 border-l-green-500': anotacion.tipo_anotacion === 'Positiva',
                  'border-l-4 border-l-red-500': anotacion.tipo_anotacion === 'Negativa',
                  'border-l-4 border-l-blue-500': anotacion.tipo_anotacion === 'Neutra'
                }"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="font-semibold text-gray-900">
                        {{ anotacion.estudiante?.numero_lista }} - {{ anotacion.estudiante?.nombre_completo }}
                      </h3>
                      <span
                        class="px-2 py-1 text-xs font-medium rounded"
                        :class="{
                          'bg-green-100 text-green-800': anotacion.tipo_anotacion === 'Positiva',
                          'bg-red-100 text-red-800': anotacion.tipo_anotacion === 'Negativa',
                          'bg-blue-100 text-blue-800': anotacion.tipo_anotacion === 'Neutra'
                        }"
                      >
                        {{ anotacion.tipo_anotacion }}
                      </span>
                    </div>
                    <p v-if="anotacion.descripcion" class="text-gray-700 mb-2">{{ anotacion.descripcion }}</p>
                    <div class="flex items-center gap-4 text-sm text-gray-500">
                      <span>{{ formatDate(anotacion.fecha) }}</span>
                      <span v-if="anotacion.profesor">Por: {{ anotacion.profesor.nombre_completo }}</span>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="editAnotacion(anotacion)"
                      class="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Editar"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="confirmDelete(anotacion)"
                      class="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Selecciona una asignatura</h3>
        <p class="text-gray-600">Elige una asignatura para ver y gestionar las anotaciones de los estudiantes</p>
      </div>

      <!-- Modal de Confirmación para Eliminar -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg max-w-md w-full p-6">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <h3 class="text-lg font-medium text-gray-900">Eliminar Anotación</h3>
              <p class="mt-2 text-sm text-gray-600">
                ¿Estás seguro de que deseas eliminar esta anotación? Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button @click="showDeleteModal = false" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Cancelar
            </button>
            <button @click="handleDelete" :disabled="submitting" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400">
              {{ submitting ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Edición -->
      <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg max-w-2xl w-full p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Editar Anotación</h3>
          <form @submit.prevent="handleUpdate" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Tipo de Anotación -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Anotación *</label>
                <select
                  v-model="editingAnotacion.tipo_anotacion"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Positiva">Positiva</option>
                  <option value="Negativa">Negativa</option>
                  <option value="Neutra">Neutra</option>
                </select>
              </div>

              <!-- Fecha -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                <input
                  v-model="editingAnotacion.fecha"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <!-- Descripción -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                v-model="editingAnotacion.descripcion"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe la anotación..."
              ></textarea>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3">
              <button
                type="button"
                @click="showEditModal = false"
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {{ submitting ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <p class="text-sm text-green-800">{{ successMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTeacherStore } from '@/store/teacher.store';
import { useAuthStore } from '@/store/auth.store';
import anotacionesService, { type Anotacion, type CreateAnotacionDTO } from '@/services/anotaciones.service';
import teacherService from '@/services/teachertools.service';
import type { Student } from '@/types/teacher.types';

const teacherStore = useTeacherStore();
const authStore = useAuthStore();

const selectedSubjectId = ref('');
const activeTab = ref<'create' | 'list'>('create');
const loading = ref(false);
const submitting = ref(false);
const anotaciones = ref<Anotacion[]>([]);
const estudiantesAsignatura = ref<Student[]>([]);
const successMessage = ref('');

// Filtros
const searchQuery = ref('');
const filterTipo = ref('');

// Form
const newAnotacion = ref<CreateAnotacionDTO>({
  estudiante_id: '',
  tipo_anotacion: 'Positiva',
  descripcion: '',
  fecha: new Date().toISOString().split('T')[0]
});

// Edición
const showEditModal = ref(false);
const editingAnotacion = ref<any>(null);

// Eliminación
const showDeleteModal = ref(false);
const deletingAnotacion = ref<Anotacion | null>(null);

// Computed
const filteredAnotaciones = computed(() => {
  let filtered = [...anotaciones.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(a =>
      a.estudiante?.nombre_completo.toLowerCase().includes(query)
    );
  }

  if (filterTipo.value) {
    filtered = filtered.filter(a => a.tipo_anotacion === filterTipo.value);
  }

  return filtered;
});

// Methods
const loadAnotaciones = async () => {
  if (!selectedSubjectId.value) return;

  loading.value = true;
  try {
    // Cargar anotaciones de la asignatura
    anotaciones.value = await anotacionesService.getByAsignatura(selectedSubjectId.value);

    // Cargar estudiantes de la asignatura
    estudiantesAsignatura.value = await teacherService.getSubjectStudents(selectedSubjectId.value);
  } catch (error) {
    console.error('Error loading anotaciones:', error);
    alert('Error al cargar las anotaciones');
  } finally {
    loading.value = false;
  }
};

const handleCreateAnotacion = async () => {
  submitting.value = true;
  try {
    const data: CreateAnotacionDTO = {
      ...newAnotacion.value,
      profesor_id: authStore.userId || undefined
    };

    await anotacionesService.create(data);

    successMessage.value = 'Anotación creada exitosamente';
    setTimeout(() => successMessage.value = '', 3000);

    resetForm();
    await loadAnotaciones();
    activeTab.value = 'list';
  } catch (error: any) {
    console.error('Error creating anotacion:', error);
    alert(`Error: ${error.response?.data?.error || 'Error al crear la anotación'}`);
  } finally {
    submitting.value = false;
  }
};

const resetForm = () => {
  newAnotacion.value = {
    estudiante_id: '',
    tipo_anotacion: 'Positiva',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  };
};

const editAnotacion = (anotacion: Anotacion) => {
  editingAnotacion.value = {
    id: anotacion.id,
    tipo_anotacion: anotacion.tipo_anotacion,
    descripcion: anotacion.descripcion || '',
    fecha: anotacion.fecha
  };
  showEditModal.value = true;
};

const handleUpdate = async () => {
  submitting.value = true;
  try {
    await anotacionesService.update(editingAnotacion.value.id, {
      tipo_anotacion: editingAnotacion.value.tipo_anotacion,
      descripcion: editingAnotacion.value.descripcion,
      fecha: editingAnotacion.value.fecha
    });

    successMessage.value = 'Anotación actualizada exitosamente';
    setTimeout(() => successMessage.value = '', 3000);

    showEditModal.value = false;
    editingAnotacion.value = null;
    await loadAnotaciones();
  } catch (error: any) {
    console.error('Error updating anotacion:', error);
    alert(`Error: ${error.response?.data?.error || 'Error al actualizar la anotación'}`);
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = (anotacion: Anotacion) => {
  deletingAnotacion.value = anotacion;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!deletingAnotacion.value) return;

  submitting.value = true;
  try {
    await anotacionesService.delete(deletingAnotacion.value.id);

    successMessage.value = 'Anotación eliminada exitosamente';
    setTimeout(() => successMessage.value = '', 3000);

    showDeleteModal.value = false;
    deletingAnotacion.value = null;
    await loadAnotaciones();
  } catch (error: any) {
    console.error('Error deleting anotacion:', error);
    alert(`Error: ${error.response?.data?.error || 'Error al eliminar la anotación'}`);
  } finally {
    submitting.value = false;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

onMounted(async () => {
  if (teacherStore.subjects.length === 0) {
    await teacherStore.fetchMySubjects();
  }
});
</script>
