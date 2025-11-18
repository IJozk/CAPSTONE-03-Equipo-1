<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Observaciones</h1>
          <p class="text-gray-600 mt-1">Gestiona las anotaciones positivas y negativas de tus estudiantes</p>
        </div>
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Observación
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              v-model="filters.tipo"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              <option value="positiva">Positivas</option>
              <option value="negativa">Negativas</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              v-model="filters.categoria"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              <option value="conducta">Conducta</option>
              <option value="academico">Académico</option>
              <option value="participacion">Participación</option>
              <option value="asistencia">Asistencia</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Asignatura</label>
            <select
              v-model="filters.asignatura_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              <option v-for="subject in teacherStore.subjects" :key="subject.asignatura_id" :value="subject.asignatura_id">
                {{ subject.nombre }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Búsqueda</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        <div class="mt-3 flex justify-end">
          <button
            @click="applyFilters"
            class="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="teacherStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
          <div class="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>

      <!-- Observations Grid -->
      <div v-else-if="filteredObservations.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="observation in filteredObservations"
          :key="observation.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div class="p-6">
            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-2">
                <span
                  :class="observation.tipo === 'positiva' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  class="px-2.5 py-0.5 rounded-full text-xs font-medium"
                >
                  {{ observation.tipo === 'positiva' ? 'Positiva' : 'Negativa' }}
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {{ getCategoryLabel(observation.categoria) }}
                </span>
              </div>
            </div>

            <!-- Student -->
            <div class="mb-3">
              <p class="text-sm text-gray-500">Estudiante</p>
              <p class="font-medium text-gray-900">{{ observation.estudiante_nombre }}</p>
            </div>

            <!-- Description -->
            <p class="text-sm text-gray-700 mb-4">{{ observation.descripcion }}</p>

            <!-- Meta -->
            <div class="space-y-1 mb-4 text-xs text-gray-500">
              <div class="flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ formatDate(observation.fecha) }}
              </div>
              <div v-if="observation.asignatura" class="flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {{ observation.asignatura }}
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                @click="openEditModal(observation)"
                class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
              >
                Editar
              </button>
              <button
                @click="confirmDelete(observation)"
                class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No hay observaciones</h3>
        <p class="mt-2 text-sm text-gray-600">
          {{ searchQuery || filters.tipo ? 'No se encontraron observaciones con los filtros aplicados' : 'Comienza creando tu primera observación' }}
        </p>
      </div>
    </div>

    <!-- Modal Create/Edit -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">
            {{ isEditing ? 'Editar Observación' : 'Nueva Observación' }}
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4 p-6">
          <!-- Estudiante -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Estudiante <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.estudiante_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="" disabled>Seleccione un estudiante</option>
              <option v-for="student in allStudents" :key="student.estudiante_id" :value="student.estudiante_id">
                {{ student.nombre_completo }}
              </option>
            </select>
          </div>

          <!-- Asignatura -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Asignatura
            </label>
            <select
              v-model="formData.asignatura_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Sin asignatura específica</option>
              <option v-for="subject in teacherStore.subjects" :key="subject.asignatura_id" :value="subject.asignatura_id">
                {{ subject.nombre }}
              </option>
            </select>
          </div>

          <!-- Tipo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Tipo <span class="text-red-500">*</span>
            </label>
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input
                  v-model="formData.tipo"
                  type="radio"
                  value="positiva"
                  required
                  class="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span class="ml-2 text-sm text-gray-700">Positiva</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="formData.tipo"
                  type="radio"
                  value="negativa"
                  required
                  class="w-4 h-4 text-red-600 focus:ring-red-500"
                />
                <span class="ml-2 text-sm text-gray-700">Negativa</span>
              </label>
            </div>
          </div>

          <!-- Categoría -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Categoría <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.categoria"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="" disabled>Seleccione una categoría</option>
              <option value="conducta">Conducta</option>
              <option value="academico">Académico</option>
              <option value="participacion">Participación</option>
              <option value="asistencia">Asistencia</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="formData.descripcion"
              required
              rows="4"
              maxlength="500"
              placeholder="Describe la observación..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">{{ formData.descripcion.length }}/500 caracteres</p>
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
        <h3 class="text-lg font-medium text-gray-900 mb-4">Eliminar Observación</h3>
        <p class="text-sm text-gray-600 mb-6">
          ¿Estás seguro de eliminar esta observación? Esta acción no se puede deshacer.
        </p>
        <div class="flex justify-end gap-3">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTeacherStore } from '@/store/teacher.store';
import type { Observation, ObservationFormData, ObservationType, ObservationCategory } from '@/types/teacher.types';

const teacherStore = useTeacherStore();

const searchQuery = ref('');
const filters = ref({
  tipo: '',
  categoria: '',
  asignatura_id: ''
});

const showModal = ref(false);
const isEditing = ref(false);
const submitting = ref(false);
const formData = ref<ObservationFormData>({
  estudiante_id: '',
  tipo: '' as ObservationType,
  categoria: '' as ObservationCategory,
  descripcion: '',
  asignatura_id: ''
});

const showDeleteConfirm = ref(false);
const observationToDelete = ref<Observation | null>(null);
const deleting = ref(false);

const allStudents = ref<any[]>([]);

// Computed
const filteredObservations = computed(() => {
  let result = teacherStore.observations;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(o =>
      o.descripcion.toLowerCase().includes(query) ||
      o.estudiante_nombre?.toLowerCase().includes(query)
    );
  }

  return result;
});

// Methods
const applyFilters = async () => {
  const filterParams: any = {};
  if (filters.value.tipo) filterParams.tipo = filters.value.tipo;
  if (filters.value.asignatura_id) filterParams.asignatura_id = filters.value.asignatura_id;
  await teacherStore.fetchObservations(filterParams);
};

const openCreateModal = () => {
  isEditing.value = false;
  formData.value = {
    estudiante_id: '',
    tipo: '' as ObservationType,
    categoria: '' as ObservationCategory,
    descripcion: '',
    asignatura_id: ''
  };
  showModal.value = true;
};

const openEditModal = (observation: Observation) => {
  isEditing.value = true;
  formData.value = {
    estudiante_id: observation.estudiante_id,
    tipo: observation.tipo,
    categoria: observation.categoria,
    descripcion: observation.descripcion,
    asignatura_id: observation.asignatura || ''
  };
  observationToDelete.value = observation;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  observationToDelete.value = null;
};

const handleSubmit = async () => {
  try {
    submitting.value = true;
    if (isEditing.value && observationToDelete.value) {
      await teacherStore.updateObservation(observationToDelete.value.id, formData.value);
    } else {
      await teacherStore.createObservation(formData.value);
    }
    closeModal();
  } catch (error) {
    console.error('Error saving observation:', error);
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = (observation: Observation) => {
  observationToDelete.value = observation;
  showDeleteConfirm.value = true;
};

const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false;
  observationToDelete.value = null;
};

const handleDelete = async () => {
  if (!observationToDelete.value) return;
  try {
    deleting.value = true;
    await teacherStore.deleteObservation(observationToDelete.value.id);
    closeDeleteConfirm();
  } catch (error) {
    console.error('Error deleting observation:', error);
  } finally {
    deleting.value = false;
  }
};

// Helpers
const getCategoryLabel = (category: ObservationCategory) => {
  const labels: Record<ObservationCategory, string> = {
    conducta: 'Conducta',
    academico: 'Académico',
    participacion: 'Participación',
    asistencia: 'Asistencia',
    otro: 'Otro'
  };
  return labels[category] || category;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
};

// Load all students from all subjects
const loadAllStudents = async () => {
  const studentsMap = new Map();
  for (const subject of teacherStore.subjects) {
    await teacherStore.fetchSubjectStudents(subject.asignatura_id);
    teacherStore.currentSubjectStudents.forEach((student: any) => {
      if (!studentsMap.has(student.estudiante_id)) {
        studentsMap.set(student.estudiante_id, student);
      }
    });
  }
  allStudents.value = Array.from(studentsMap.values());
};

// Lifecycle
onMounted(async () => {
  if (teacherStore.subjects.length === 0) {
    await teacherStore.fetchMySubjects();
  }
  await loadAllStudents();
  await teacherStore.fetchObservations();
});
</script>
