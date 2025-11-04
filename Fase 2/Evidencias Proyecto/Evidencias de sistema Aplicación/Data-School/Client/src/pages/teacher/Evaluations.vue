<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Mis Evaluaciones</h1>
          <p class="text-gray-600 mt-1">Gestiona las evaluaciones de tus asignaturas</p>
        </div>
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Evaluación
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Asignatura</label>
            <select
              v-model="filters.asignatura_id"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todas las asignaturas</option>
              <option v-for="subject in teacherStore.subjects" :key="subject.asignatura_id" :value="subject.asignatura_id">
                {{ subject.nombre }} - {{ subject.curso.nombre }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              v-model="filters.tipo"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              <option value="PRUEBA">Prueba</option>
              <option value="TRABAJO">Trabajo</option>
              <option value="TAREA">Tarea</option>
              <option value="PROYECTO">Proyecto</option>
              <option value="PRESENTACION">Presentación</option>
              <option value="OTROS">Otros</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Búsqueda</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar evaluación..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
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

      <!-- Evaluations Grid -->
      <div v-else-if="filteredEvaluations.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="evaluation in filteredEvaluations"
          :key="evaluation.evaluacion_id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div class="p-6">
            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900">{{ evaluation.nombre }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ getSubjectName(evaluation.asignatura_id) }}</p>
              </div>
              <span
                :class="getTypeBadgeClass(evaluation.tipo)"
                class="px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
              >
                {{ getTypeLabel(evaluation.tipo) }}
              </span>
            </div>

            <!-- Description -->
            <p v-if="evaluation.descripcion" class="text-sm text-gray-600 mb-4 line-clamp-2">
              {{ evaluation.descripcion }}
            </p>

            <!-- Details -->
            <div class="space-y-2 mb-4">
              <div class="flex items-center text-sm text-gray-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ formatDate(evaluation.fecha_evaluacion) }}
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ evaluation.puntaje_maximo }} pts · {{ evaluation.porcentaje_nota }}% de la nota
              </div>
              <div v-if="evaluation.is_recuperativa" class="flex items-center text-sm text-blue-600">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                Evaluación recuperativa
              </div>
            </div>

            <!-- Progress -->
            <div class="mb-4">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600">Calificados</span>
                <span class="font-medium text-gray-900">
                  {{ evaluation.total_estudiantes_evaluados || 0 }}/{{ evaluation.total_estudiantes || 0 }}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  :style="{ width: getProgressPercentage(evaluation) + '%' }"
                  :class="getProgressBarClass(evaluation)"
                  class="h-2 rounded-full transition-all"
                ></div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                @click="goToGrade(evaluation.evaluacion_id)"
                class="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded transition-colors"
              >
                Calificar
              </button>
              <button
                @click="openEditModal(evaluation)"
                class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
              >
                Editar
              </button>
              <button
                @click="confirmDelete(evaluation)"
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
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No hay evaluaciones</h3>
        <p class="mt-2 text-sm text-gray-600">
          {{ searchQuery || filters.asignatura_id || filters.tipo ? 'No se encontraron evaluaciones con los filtros aplicados' : 'Comienza creando tu primera evaluación' }}
        </p>
        <button
          v-if="!searchQuery && !filters.asignatura_id && !filters.tipo"
          @click="openCreateModal"
          class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Crear Evaluación
        </button>
      </div>
    </div>

    <!-- Modal Create/Edit -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">
            {{ isEditing ? 'Editar Evaluación' : 'Nueva Evaluación' }}
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4 p-6">
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
              <option v-for="subject in teacherStore.subjects" :key="subject.asignatura_id" :value="subject.asignatura_id">
                {{ subject.nombre }} - {{ subject.curso.nombre }}
              </option>
            </select>
          </div>

          <!-- Nombre -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.nombre"
              type="text"
              required
              placeholder="Ej: Prueba Unidad 1"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              v-model="formData.descripcion"
              rows="3"
              placeholder="Descripción opcional de la evaluación"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            ></textarea>
          </div>

          <!-- Tipo y Fecha -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Tipo <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.tipo"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="" disabled>Seleccione tipo</option>
                <option value="PRUEBA">Prueba</option>
                <option value="TRABAJO">Trabajo</option>
                <option value="TAREA">Tarea</option>
                <option value="PROYECTO">Proyecto</option>
                <option value="PRESENTACION">Presentación</option>
                <option value="OTROS">Otros</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.fecha_evaluacion"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Puntaje y Porcentaje -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Puntaje Máximo <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="formData.puntaje_maximo"
                type="number"
                required
                min="1"
                step="1"
                placeholder="60"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Porcentaje de Nota <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="formData.porcentaje_nota"
                type="number"
                required
                min="0"
                max="100"
                step="1"
                placeholder="30"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p class="text-xs text-gray-500 mt-1">Entre 0 y 100%</p>
            </div>
          </div>

          <!-- Recuperativa -->
          <div class="flex items-center">
            <input
              v-model="formData.is_recuperativa"
              type="checkbox"
              id="recuperativa"
              class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
            />
            <label for="recuperativa" class="ml-2 text-sm text-gray-700">
              Esta es una evaluación recuperativa
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
            <h3 class="text-lg font-medium text-gray-900">Eliminar Evaluación</h3>
            <p class="mt-2 text-sm text-gray-600">
              ¿Estás seguro de eliminar la evaluación "{{ evaluationToDelete?.nombre }}"? Esta acción no se puede deshacer y se eliminarán todas las notas asociadas.
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTeacherStore } from '@/store/teacher.store';
import type { Evaluation, EvaluationFormData, EvaluationType } from '@/types/teacher.types';

const router = useRouter();
const teacherStore = useTeacherStore();

const searchQuery = ref('');
const filters = ref({
  asignatura_id: '',
  tipo: ''
});

const showModal = ref(false);
const isEditing = ref(false);
const submitting = ref(false);
const formData = ref<EvaluationFormData>({
  asignatura_id: '',
  nombre: '',
  descripcion: '',
  tipo: '' as EvaluationType,
  fecha_evaluacion: '',
  puntaje_maximo: 60,
  porcentaje_nota: 30,
  is_recuperativa: false
});

const showDeleteConfirm = ref(false);
const evaluationToDelete = ref<Evaluation | null>(null);
const deleting = ref(false);

// Computed
const filteredEvaluations = computed(() => {
  let result = teacherStore.evaluations;

  if (filters.value.asignatura_id) {
    result = result.filter(e => e.asignatura_id === filters.value.asignatura_id);
  }

  if (filters.value.tipo) {
    result = result.filter(e => e.tipo === filters.value.tipo);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(e =>
      e.nombre.toLowerCase().includes(query) ||
      e.descripcion?.toLowerCase().includes(query)
    );
  }

  return result;
});

// Methods
const applyFilters = async () => {
  if (filters.value.asignatura_id) {
    await teacherStore.fetchEvaluations(filters.value.asignatura_id);
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  formData.value = {
    asignatura_id: filters.value.asignatura_id || '',
    nombre: '',
    descripcion: '',
    tipo: '' as EvaluationType,
    fecha_evaluacion: '',
    puntaje_maximo: 60,
    porcentaje_nota: 30,
    is_recuperativa: false
  };
  showModal.value = true;
};

const openEditModal = (evaluation: Evaluation) => {
  isEditing.value = true;
  formData.value = {
    asignatura_id: evaluation.asignatura_id,
    nombre: evaluation.nombre,
    descripcion: evaluation.descripcion || '',
    tipo: evaluation.tipo,
    fecha_evaluacion: evaluation.fecha_evaluacion,
    puntaje_maximo: evaluation.puntaje_maximo,
    porcentaje_nota: evaluation.porcentaje_nota,
    is_recuperativa: evaluation.is_recuperativa
  };
  evaluationToDelete.value = evaluation;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  evaluationToDelete.value = null;
};

const handleSubmit = async () => {
  try {
    submitting.value = true;
    if (isEditing.value && evaluationToDelete.value) {
      await teacherStore.updateEvaluation(evaluationToDelete.value.evaluacion_id, formData.value);
    } else {
      await teacherStore.createEvaluation(formData.value);
    }
    closeModal();
  } catch (error) {
    console.error('Error saving evaluation:', error);
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = (evaluation: Evaluation) => {
  evaluationToDelete.value = evaluation;
  showDeleteConfirm.value = true;
};

const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false;
  evaluationToDelete.value = null;
};

const handleDelete = async () => {
  if (!evaluationToDelete.value) return;
  try {
    deleting.value = true;
    await teacherStore.deleteEvaluation(evaluationToDelete.value.evaluacion_id);
    closeDeleteConfirm();
  } catch (error) {
    console.error('Error deleting evaluation:', error);
  } finally {
    deleting.value = false;
  }
};

const goToGrade = (evaluationId: number) => {
  router.push(`/teacher/evaluations/${evaluationId}/grade`);
};

// Helpers
const getSubjectName = (asignaturaId: string) => {
  const subject = teacherStore.subjects.find(s => s.asignatura_id === asignaturaId);
  return subject ? `${subject.nombre} - ${subject.curso.nombre}` : 'Asignatura';
};

const getTypeLabel = (tipo: EvaluationType) => {
  const labels: Record<EvaluationType, string> = {
    PRUEBA: 'Prueba',
    TRABAJO: 'Trabajo',
    TAREA: 'Tarea',
    PROYECTO: 'Proyecto',
    PRESENTACION: 'Presentación',
    OTROS: 'Otros'
  };
  return labels[tipo] || tipo;
};

const getTypeBadgeClass = (tipo: EvaluationType) => {
  const classes: Record<EvaluationType, string> = {
    PRUEBA: 'bg-blue-100 text-blue-800',
    TRABAJO: 'bg-green-100 text-green-800',
    TAREA: 'bg-yellow-100 text-yellow-800',
    PROYECTO: 'bg-purple-100 text-purple-800',
    PRESENTACION: 'bg-pink-100 text-pink-800',
    OTROS: 'bg-gray-100 text-gray-800'
  };
  return classes[tipo] || 'bg-gray-100 text-gray-800';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
};

const getProgressPercentage = (evaluation: Evaluation) => {
  if (!evaluation.total_estudiantes || evaluation.total_estudiantes === 0) return 0;
  return Math.round(((evaluation.total_estudiantes_evaluados || 0) / evaluation.total_estudiantes) * 100);
};

const getProgressBarClass = (evaluation: Evaluation) => {
  const percentage = getProgressPercentage(evaluation);
  if (percentage === 100) return 'bg-green-500';
  if (percentage > 50) return 'bg-blue-500';
  if (percentage > 0) return 'bg-yellow-500';
  return 'bg-gray-300';
};

// Lifecycle
onMounted(async () => {
  if (teacherStore.subjects.length === 0) {
    await teacherStore.fetchMySubjects();
  }
});
</script>
