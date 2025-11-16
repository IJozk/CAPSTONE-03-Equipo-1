<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-start">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Anotaciones</h1>
        <p class="text-gray-600 mt-1">Registra y consulta anotaciones de tus estudiantes</p>
      </div>
    </div>

      <!-- Filtros de Asignaturas -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Selector de Asignatura -->
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Asignatura</label>
            <select
              v-model="selectedSubjectId"
              @change="onSubjectChange"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Seleccionar asignatura</option>
              <option
                v-for="subject in filteredSubjects"
                :key="subject.asignatura_id"
                :value="subject.asignatura_id"
              >
                {{ subject.nombre }} - {{ subject.curso?.nombre || subject.curso?.nivel }}
              </option>
            </select>
          </div>

          <!-- Toggle para mostrar asignaturas inactivas -->
          <div class="flex items-end">
            <label class="flex items-center cursor-pointer">
              <input
                v-model="showInactiveSubjects"
                type="checkbox"
                class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span class="ml-2 text-sm text-gray-700">Mostrar asignaturas inactivas</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="text-gray-600 mt-4">Cargando estudiantes...</p>
      </div>

      <!-- Lista de Estudiantes con Botón de Anotar -->
      <div v-else-if="selectedSubjectId && estudiantesAsignatura.length > 0" class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-900">
              Estudiantes ({{ estudiantesAsignatura.length }})
            </h2>
            <input
              v-model="searchStudent"
              type="text"
              placeholder="Buscar estudiante..."
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
            />
          </div>
        </div>

        <div class="divide-y divide-gray-200">
          <div
            v-for="student in filteredStudents"
            :key="student.estudiante_id"
            class="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center"
          >
            <div class="flex items-center gap-4">
              <!-- Avatar placeholder -->
              <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span class="text-primary-700 font-semibold text-sm">{{ student.numero_lista }}</span>
              </div>

              <div>
                <h3 class="font-medium text-gray-900">{{ student.nombre_completo }}</h3>
                <p class="text-sm text-gray-500">{{ student.rut }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <!-- Contador de anotaciones -->
              <div class="flex gap-1 mr-4">
                <span
                  v-if="getStudentAnotacionesCount(student.estudiante_id, 'Positiva') > 0"
                  class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded"
                  title="Anotaciones positivas"
                >
                  +{{ getStudentAnotacionesCount(student.estudiante_id, 'Positiva') }}
                </span>
                <span
                  v-if="getStudentAnotacionesCount(student.estudiante_id, 'Negativa') > 0"
                  class="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded"
                  title="Anotaciones negativas"
                >
                  -{{ getStudentAnotacionesCount(student.estudiante_id, 'Negativa') }}
                </span>
                <span
                  v-if="getStudentAnotacionesCount(student.estudiante_id, 'Neutra') > 0"
                  class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                  title="Anotaciones neutras"
                >
                  {{ getStudentAnotacionesCount(student.estudiante_id, 'Neutra') }}
                </span>
              </div>

              <button
                @click="openAnotacionModal(student)"
                class="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Anotar
              </button>

              <button
                @click="viewStudentAnotaciones(student)"
                class="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Ver Historial
              </button>
            </div>
          </div>

          <div v-if="filteredStudents.length === 0" class="p-8 text-center text-gray-500">
            No se encontraron estudiantes
          </div>
        </div>
      </div>

      <!-- Empty State - Sin asignatura seleccionada -->
      <div v-else-if="!selectedSubjectId" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Selecciona una asignatura</h3>
        <p class="text-gray-600">Elige una asignatura para ver los estudiantes y gestionar anotaciones</p>
      </div>

      <!-- Empty State - No hay estudiantes -->
      <div v-else-if="estudiantesAsignatura.length === 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No hay estudiantes inscritos</h3>
        <p class="text-gray-600">Esta asignatura no tiene estudiantes registrados aún</p>
      </div>

      <!-- Modal: Nueva Anotación -->
      <div v-if="showAnotacionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg max-w-2xl w-full p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Nueva Anotación - {{ selectedStudent?.nombre_completo }}
          </h3>

          <form @submit.prevent="handleCreateAnotacion" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Tipo de Anotación -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Anotación *</label>
                <select
                  v-model="newAnotacion.tipo_anotacion"
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
                  v-model="newAnotacion.fecha"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <!-- Descripción -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
              <textarea
                v-model="newAnotacion.descripcion"
                rows="4"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe la anotación..."
              ></textarea>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3">
              <button
                type="button"
                @click="closeAnotacionModal"
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
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
      </div>

      <!-- Modal: Historial de Anotaciones del Estudiante -->
      <div v-if="showHistorialModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              Historial de Anotaciones - {{ selectedStudent?.nombre_completo }}
            </h3>
          </div>

          <div class="flex-1 overflow-y-auto p-6">
            <div v-if="studentAnotaciones.length === 0" class="text-center py-8 text-gray-500">
              Este estudiante no tiene anotaciones registradas
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="anotacion in studentAnotaciones"
                :key="anotacion.id"
                class="border border-gray-200 rounded-lg p-4"
                :class="{
                  'border-l-4 border-l-green-500': anotacion.tipo_anotacion === 'Positiva',
                  'border-l-4 border-l-red-500': anotacion.tipo_anotacion === 'Negativa',
                  'border-l-4 border-l-blue-500': anotacion.tipo_anotacion === 'Neutra'
                }"
              >
                <div class="flex justify-between items-start mb-2">
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
                  <span class="text-sm text-gray-500">{{ formatDate(anotacion.fecha) }}</span>
                </div>
                <p class="text-gray-700 mb-2">{{ anotacion.descripcion }}</p>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-500">Por: {{ anotacion.profesor?.nombre_completo || 'N/A' }}</span>
                  <div class="flex gap-2">
                    <button
                      @click="editAnotacion(anotacion)"
                      class="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Editar"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="confirmDelete(anotacion)"
                      class="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Eliminar"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 border-t border-gray-200">
            <button
              @click="closeHistorialModal"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cerrar
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
              <label class="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
              <textarea
                v-model="editingAnotacion.descripcion"
                rows="4"
                required
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

// State
const selectedSubjectId = ref('');
const showInactiveSubjects = ref(false);
const loading = ref(false);
const submitting = ref(false);
const anotaciones = ref<Anotacion[]>([]);
const estudiantesAsignatura = ref<Student[]>([]);
const successMessage = ref('');
const searchStudent = ref('');

// Modals
const showAnotacionModal = ref(false);
const showHistorialModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);

// Selected data
const selectedStudent = ref<Student | null>(null);
const studentAnotaciones = ref<Anotacion[]>([]);

// Form
const newAnotacion = ref<CreateAnotacionDTO>({
  estudiante_id: '',
  tipo_anotacion: 'Positiva',
  descripcion: '',
  fecha: new Date().toISOString().split('T')[0]
});

// Edición
const editingAnotacion = ref<any>(null);

// Eliminación
const deletingAnotacion = ref<Anotacion | null>(null);

// Computed
const filteredSubjects = computed(() => {
  // Por ahora mostramos todas las asignaturas
  // TODO: Implementar lógica de filtrado por periodo activo cuando esté disponible en el modelo
  return teacherStore.subjects;
});

const filteredStudents = computed(() => {
  if (!searchStudent.value) return estudiantesAsignatura.value;

  const query = searchStudent.value.toLowerCase();
  return estudiantesAsignatura.value.filter(s =>
    s.nombre_completo.toLowerCase().includes(query) ||
    s.rut.toLowerCase().includes(query) ||
    s.numero_lista.toString().includes(query)
  );
});

// Methods
const onSubjectChange = async () => {
  if (!selectedSubjectId.value) {
    estudiantesAsignatura.value = [];
    anotaciones.value = [];
    return;
  }

  loading.value = true;
  try {
    console.log('🔍 Cargando datos para asignatura:', selectedSubjectId.value);

    // Cargar estudiantes y anotaciones en paralelo
    const [students, allAnotaciones] = await Promise.all([
      teacherService.getSubjectStudents(selectedSubjectId.value),
      anotacionesService.getByAsignatura(selectedSubjectId.value)
    ]);

    estudiantesAsignatura.value = students;
    anotaciones.value = allAnotaciones;

    console.log('✅ Estudiantes cargados:', students.length);
    console.log('✅ Anotaciones cargadas:', allAnotaciones.length);
  } catch (error) {
    console.error('❌ Error loading data:', error);
    alert('Error al cargar los datos de la asignatura');
  } finally {
    loading.value = false;
  }
};

const getStudentAnotacionesCount = (studentId: string, tipo: string) => {
  return anotaciones.value.filter(a =>
    a.estudiante_id === studentId && a.tipo_anotacion === tipo
  ).length;
};

const openAnotacionModal = (student: Student) => {
  selectedStudent.value = student;
  newAnotacion.value = {
    estudiante_id: student.estudiante_id,
    tipo_anotacion: 'Positiva',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  };
  showAnotacionModal.value = true;
};

const closeAnotacionModal = () => {
  showAnotacionModal.value = false;
  selectedStudent.value = null;
};

const handleCreateAnotacion = async () => {
  submitting.value = true;
  try {
    const profesorId = authStore.user?.profesor_profile?.profesor_id;

    if (!profesorId) {
      alert('Error: No se pudo obtener el ID del profesor');
      return;
    }

    const data: CreateAnotacionDTO = {
      ...newAnotacion.value,
      profesor_id: profesorId
    };

    await anotacionesService.create(data);

    successMessage.value = 'Anotación creada exitosamente';
    setTimeout(() => successMessage.value = '', 3000);

    closeAnotacionModal();
    await onSubjectChange(); // Recargar datos
  } catch (error: any) {
    console.error('Error creating anotacion:', error);
    alert(`Error: ${error.response?.data?.error || 'Error al crear la anotación'}`);
  } finally {
    submitting.value = false;
  }
};

const viewStudentAnotaciones = (student: Student) => {
  selectedStudent.value = student;
  studentAnotaciones.value = anotaciones.value.filter(a => a.estudiante_id === student.estudiante_id);
  showHistorialModal.value = true;
};

const closeHistorialModal = () => {
  showHistorialModal.value = false;
  selectedStudent.value = null;
  studentAnotaciones.value = [];
};

const editAnotacion = (anotacion: Anotacion) => {
  editingAnotacion.value = {
    id: anotacion.id,
    tipo_anotacion: anotacion.tipo_anotacion,
    descripcion: anotacion.descripcion || '',
    fecha: anotacion.fecha
  };
  showEditModal.value = true;
  showHistorialModal.value = false;
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
    await onSubjectChange();

    if (selectedStudent.value) {
      studentAnotaciones.value = anotaciones.value.filter(a => a.estudiante_id === selectedStudent.value!.estudiante_id);
      showHistorialModal.value = true;
    }
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
  showHistorialModal.value = false;
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
    await onSubjectChange();

    if (selectedStudent.value) {
      studentAnotaciones.value = anotaciones.value.filter(a => a.estudiante_id === selectedStudent.value!.estudiante_id);
      showHistorialModal.value = true;
    }
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
