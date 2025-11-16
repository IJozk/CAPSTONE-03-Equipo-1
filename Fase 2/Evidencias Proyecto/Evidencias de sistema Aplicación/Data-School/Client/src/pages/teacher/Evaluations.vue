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
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Búsqueda</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar evaluación..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Asignatura</label>
            <select
              v-model="filters.asignatura_id"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todas las asignaturas</option>
              <option v-for="subject in teacherStore.subjects" :key="subject.asignatura_id" :value="subject.asignatura_id">
                {{ subject.nombre }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Curso</label>
            <select
              v-model="filters.curso"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos los cursos</option>
              <option v-for="curso in uniqueCourses" :key="curso" :value="curso">{{ curso }}</option>
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
        </div>
        <div class="flex items-center mt-4 gap-4">
          <label class="flex items-center cursor-pointer">
            <input
              v-model="filters.pendientes"
              type="checkbox"
              class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
            />
            <span class="ml-2 text-sm text-gray-700">Mostrar solo evaluaciones pendientes de calificación</span>
          </label>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="teacherStore.loading" class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="divide-y divide-gray-200">
          <div v-for="i in 5" :key="i" class="p-6 animate-pulse">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div class="flex space-x-2">
                <div class="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Evaluations List -->
      <div v-else-if="filteredEvaluations.length > 0" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evaluación</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignatura</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calificados</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="evaluation in filteredEvaluations"
                :key="evaluation.evaluacion_id"
                class="hover:bg-gray-50 transition-colors"
                :class="{ 'bg-yellow-50': isPending(evaluation) }"
              >
                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    v-if="isPending(evaluation)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                  >
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    Pendiente
                  </span>
                  <span
                    v-else-if="isUpcoming(evaluation)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                    </svg>
                    Próxima
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    Completa
                  </span>
                </td>

                <!-- Evaluation Name -->
                <td class="px-6 py-4">
                  <div>
                    <div class="text-sm font-bold text-gray-900">{{ evaluation.nombre }}</div>
                    <div v-if="evaluation.descripcion" class="text-xs text-gray-500 mt-1 line-clamp-1">
                      {{ evaluation.descripcion }}
                    </div>
                    <div v-if="evaluation.is_recuperativa" class="mt-1">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Recuperativa
                      </span>
                    </div>
                  </div>
                </td>

                <!-- Subject -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ getSubjectNameOnly(evaluation.asignatura_id) }}</div>
                </td>

                <!-- Course -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ getCourseName(evaluation.asignatura_id) }}</div>
                </td>

                <!-- Date -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatDateShort(evaluation.fecha_evaluacion) }}</div>
                  <div class="text-xs text-gray-500">{{ getRelativeDate(evaluation.fecha_evaluacion) }}</div>
                </td>

                <!-- Type -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="getTypeBadgeClass(evaluation.tipo)"
                    class="px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ getTypeLabel(evaluation.tipo) }}
                  </span>
                </td>

                <!-- Graded Progress -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-1 mr-2">
                      <div class="text-sm text-gray-900">
                        {{ evaluation.total_estudiantes_evaluados || 0 }}/{{ evaluation.total_estudiantes || 0 }}
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          :style="{ width: getProgressPercentage(evaluation) + '%' }"
                          :class="getProgressBarClass(evaluation)"
                          class="h-1.5 rounded-full transition-all"
                        ></div>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <button
                      @click="goToGrade(evaluation.evaluacion_id)"
                      class="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                      title="Calificar"
                    >
                      Calificar
                    </button>
                    <button
                      @click="openEditModal(evaluation)"
                      class="px-3 py-1 bg-gray-50 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                      title="Editar"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="confirmDelete(evaluation)"
                      class="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-lg hover:bg-red-100 transition-colors"
                      title="Eliminar"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
  curso: '',
  tipo: '',
  pendientes: false
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

// Computed - Obtener cursos únicos para el filtro
const uniqueCourses = computed(() => {
  const courses = teacherStore.subjects.map(s => s.curso.nombre); // Nombre completo del curso
  return [...new Set(courses)].sort();
});

const filteredEvaluations = computed(() => {
  let result = teacherStore.evaluations;

  // Filter by subject
  if (filters.value.asignatura_id) {
    result = result.filter(e => e.asignatura_id === filters.value.asignatura_id);
  }

  // Filter by course
  if (filters.value.curso) {
    result = result.filter(e => {
      const courseName = getCourseName(e.asignatura_id);
      return courseName === filters.value.curso;
    });
  }

  // Filter by type
  if (filters.value.tipo) {
    result = result.filter(e => e.tipo === filters.value.tipo);
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(e =>
      e.nombre.toLowerCase().includes(query) ||
      e.descripcion?.toLowerCase().includes(query)
    );
  }

  // Filter pending (evaluations with missing grades)
  if (filters.value.pendientes) {
    result = result.filter(e => {
      const today = new Date();
      const evalDate = new Date(e.fecha_evaluacion);
      // Show evaluations that are past due and not fully graded
      return evalDate < today && (e.total_estudiantes_evaluados || 0) < (e.total_estudiantes || 0);
    });
  }

  // Sort by date - closest first (ascending), with pending evaluations at the top
  result = [...result].sort((a, b) => {
    const isPendingA = isPending(a);
    const isPendingB = isPending(b);

    // Pending evaluations first
    if (isPendingA && !isPendingB) return -1;
    if (!isPendingA && isPendingB) return 1;

    // Then sort by date (closest first)
    const dateA = new Date(a.fecha_evaluacion).getTime();
    const dateB = new Date(b.fecha_evaluacion).getTime();
    return dateA - dateB;
  });

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

const getSubjectNameOnly = (asignaturaId: string) => {
  const subject = teacherStore.subjects.find(s => s.asignatura_id === asignaturaId);
  return subject?.nombre || 'Asignatura';
};

const getCourseName = (asignaturaId: string) => {
  const subject = teacherStore.subjects.find(s => s.asignatura_id === asignaturaId);
  return subject?.curso.nombre || 'Curso'; // Retorna el nombre completo del curso, ej: "1°ro Básico B"
};

const isPending = (evaluation: Evaluation): boolean => {
  const today = new Date();
  const evalDate = new Date(evaluation.fecha_evaluacion);
  // Evaluation is pending if it's past due and not fully graded
  return evalDate < today && (evaluation.total_estudiantes_evaluados || 0) < (evaluation.total_estudiantes || 0);
};

const isUpcoming = (evaluation: Evaluation): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const evalDate = new Date(evaluation.fecha_evaluacion);
  evalDate.setHours(0, 0, 0, 0);
  // Evaluation is upcoming if it's today or in the future
  return evalDate >= today;
};

const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Mañana';
  if (diffDays === -1) return 'Ayer';
  if (diffDays > 0) return `En ${diffDays} días`;
  if (diffDays < 0) return `Hace ${Math.abs(diffDays)} días`;
  return '';
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
