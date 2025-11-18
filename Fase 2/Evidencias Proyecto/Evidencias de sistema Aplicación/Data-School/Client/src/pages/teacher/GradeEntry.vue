<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Registro de Notas</h1>
        <p class="text-gray-600 mt-1">Ingresa y gestiona las calificaciones de tus estudiantes</p>
      </div>

      <!-- Selectors -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Subject Selector -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Asignatura</label>
            <select
              v-model="selectedSubjectId"
              @change="onSubjectChange"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Seleccionar asignatura</option>
              <option v-for="subject in teacherStore.subjects" :key="subject.asignatura_id" :value="subject.asignatura_id">
                {{ subject.nombre }} - {{ subject.curso.nombre }}
              </option>
            </select>
          </div>

          <!-- Evaluation Selector -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Evaluación</label>
            <select
              v-model="selectedEvaluationId"
              @change="onEvaluationChange"
              :disabled="!selectedSubjectId"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar evaluación</option>
              <option v-for="evaluation in evaluations" :key="evaluation.evaluacion_id" :value="evaluation.evaluacion_id">
                {{ evaluation.nombre }} ({{ evaluation.fecha_evaluacion }})
              </option>
            </select>
          </div>
        </div>

        <!-- Evaluation Info -->
        <div v-if="currentEvaluation" class="mt-4 p-4 bg-blue-50 rounded-lg">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-gray-600">Tipo:</span>
              <span class="font-medium ml-2">{{ evaluationTypeLabel(currentEvaluation.tipo) }}</span>
            </div>
            <div>
              <span class="text-gray-600">Fecha:</span>
              <span class="font-medium ml-2">{{ formatDate(currentEvaluation.fecha_evaluacion) }}</span>
            </div>
            <div>
              <span class="text-gray-600">Puntaje Máximo:</span>
              <span class="font-medium ml-2">{{ currentEvaluation.puntaje_maximo }} pts</span>
            </div>
            <div>
              <span class="text-gray-600">Porcentaje:</span>
              <span class="font-medium ml-2">{{ currentEvaluation.porcentaje_nota }}%</span>
            </div>
          </div>
        </div>

        <!-- Warning: Evaluation date not passed -->
        <div v-if="currentEvaluation && !canEnterGrades" class="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-orange-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div>
              <h4 class="text-sm font-semibold text-orange-900">Evaluación no realizada aún</h4>
              <p class="mt-1 text-sm text-orange-800">
                No puedes ingresar notas hasta que la fecha de la evaluación haya pasado.
                La evaluación está programada para el <strong>{{ formatDate(currentEvaluation.fecha_evaluacion) }}</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Grades Table -->
      <div v-if="selectedEvaluationId" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <!-- Loading -->
        <div v-if="teacherStore.loading" class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p class="mt-2 text-gray-600">Cargando notas...</p>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">N°</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estudiante</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Puntaje</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Nota</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">%</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Observaciones</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="(student, index) in students" :key="student.estudiante_id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">{{ student.numero_lista }}</td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ student.nombre_completo }}</td>

                <!-- Puntaje Input -->
                <td class="px-4 py-3">
                  <input
                    v-model.number="gradeData[student.estudiante_id].puntaje"
                    @input="calculateGrade(student.estudiante_id)"
                    type="number"
                    :min="0"
                    :max="currentEvaluation?.puntaje_maximo"
                    step="0.5"
                    :disabled="!canEnterGrades"
                    class="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="0"
                  />
                </td>

                <!-- Nota Calculada -->
                <td class="px-4 py-3 text-center">
                  <span
                    v-if="gradeData[student.estudiante_id].nota !== null"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold"
                    :class="getGradeClass(gradeData[student.estudiante_id].nota)"
                  >
                    {{ gradeData[student.estudiante_id].nota?.toFixed(1) }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>

                <!-- Porcentaje -->
                <td class="px-4 py-3 text-center text-sm text-gray-600">
                  {{ gradeData[student.estudiante_id].porcentaje !== null
                    ? gradeData[student.estudiante_id].porcentaje?.toFixed(1) + '%'
                    : '-'
                  }}
                </td>

                <!-- Observaciones -->
                <td class="px-4 py-3">
                  <input
                    v-model="gradeData[student.estudiante_id].observaciones"
                    type="text"
                    :disabled="!canEnterGrades"
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Observaciones..."
                  />
                </td>

                <!-- Acciones -->
                <td class="px-4 py-3 text-center">
                  <button
                    @click="saveIndividualGrade(student.estudiante_id)"
                    :disabled="!canEnterGrades || gradeData[student.estudiante_id].puntaje === null || saving"
                    class="px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {{ gradeData[student.estudiante_id].resultado_id ? 'Actualizar' : 'Guardar' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Actions -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <div class="text-sm text-gray-600">
            <span class="font-medium">{{ gradesEntered }}</span> de <span class="font-medium">{{ students.length }}</span> notas ingresadas
          </div>
          <button
            @click="saveAllGrades"
            :disabled="!canEnterGrades || saving || gradesEntered === 0"
            class="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {{ saving ? 'Guardando...' : 'Guardar Todas' }}
          </button>
        </div>
      </div>

      <!-- Statistics -->
      <div v-if="selectedEvaluationId && statistics" class="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Estadísticas del Curso</h3>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <p class="text-sm text-gray-600">Promedio</p>
            <p class="text-2xl font-bold text-blue-600">{{ statistics.average }}</p>
          </div>
          <div class="text-center p-4 bg-green-50 rounded-lg">
            <p class="text-sm text-gray-600">Nota Más Alta</p>
            <p class="text-2xl font-bold text-green-600">{{ statistics.highest }}</p>
          </div>
          <div class="text-center p-4 bg-red-50 rounded-lg">
            <p class="text-sm text-gray-600">Nota Más Baja</p>
            <p class="text-2xl font-bold text-red-600">{{ statistics.lowest }}</p>
          </div>
          <div class="text-center p-4 bg-emerald-50 rounded-lg">
            <p class="text-sm text-gray-600">Aprobados</p>
            <p class="text-2xl font-bold text-emerald-600">{{ statistics.passed }}</p>
          </div>
          <div class="text-center p-4 bg-rose-50 rounded-lg">
            <p class="text-sm text-gray-600">Reprobados</p>
            <p class="text-2xl font-bold text-rose-600">{{ statistics.failed }}</p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-sm text-red-800 font-medium">{{ error }}</p>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
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
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useTeacherStore } from '@/store/teacher.store';
import teacherService from '@/services/teachertools.service';
import type { Student, Evaluation } from '@/types/teacher.types';

const route = useRoute();
const teacherStore = useTeacherStore();

const selectedSubjectId = ref('');
const selectedEvaluationId = ref('');
const evaluations = ref<Evaluation[]>([]);
const students = ref<Student[]>([]);
const saving = ref(false);
const successMessage = ref('');

interface GradeData {
  resultado_id: number | null;
  puntaje: number | null;
  nota: number | null;
  porcentaje: number | null;
  observaciones: string;
}

const gradeData = ref<Record<string, GradeData>>({});

// Evaluación actual
const currentEvaluation = computed(() => {
  return evaluations.value.find(e => e.evaluacion_id === Number(selectedEvaluationId.value));
});

// Verificar si se puede ingresar notas (fecha de evaluación ya pasó)
const canEnterGrades = computed(() => {
  if (!currentEvaluation.value) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas

  const evaluationDate = new Date(currentEvaluation.value.fecha_evaluacion);
  evaluationDate.setHours(0, 0, 0, 0);

  return evaluationDate <= today;
});

// Etiqueta del tipo de evaluación
const evaluationTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    PRUEBA: 'Prueba',
    TRABAJO: 'Trabajo',
    TAREA: 'Tarea',
    PROYECTO: 'Proyecto',
    PRESENTACION: 'Presentación',
    OTROS: 'Otros'
  };
  return labels[type] || type;
};

// Formatear fecha
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Validar y calcular nota automáticamente
const calculateGrade = (studentId: string) => {
  const data = gradeData.value[studentId];

  if (data.puntaje !== null && currentEvaluation.value) {
    const maxScore = currentEvaluation.value.puntaje_maximo;

    // VALIDACIÓN CRÍTICA 1: Puntaje no puede ser negativo
    if (data.puntaje < 0) {
      data.puntaje = 0;
      console.warn('Puntaje negativo no permitido. Ajustado a 0.');
    }

    // VALIDACIÓN CRÍTICA 2: Puntaje no puede exceder el máximo
    if (data.puntaje > maxScore) {
      data.puntaje = maxScore;
      console.warn(`Puntaje excede el máximo (${maxScore}). Ajustado al máximo.`);
    }

    data.nota = teacherService.calculateGrade(data.puntaje, maxScore);
    data.porcentaje = teacherService.calculatePercentage(data.puntaje, maxScore);
  } else {
    data.nota = null;
    data.porcentaje = null;
  }
};

// Clase CSS según nota
const getGradeClass = (nota: number | null): string => {
  if (nota === null) return '';
  if (nota >= 6.0) return 'bg-emerald-100 text-emerald-800'; // Excelente
  if (nota >= 5.0) return 'bg-blue-100 text-blue-800';       // Bueno
  if (nota >= 4.0) return 'bg-yellow-100 text-yellow-800';   // Suficiente
  return 'bg-red-100 text-red-800';                           // Insuficiente
};

// Notas ingresadas
const gradesEntered = computed(() => {
  return Object.values(gradeData.value).filter(g => g.puntaje !== null).length;
});

// Estadísticas
const statistics = computed(() => {
  const grades = Object.values(gradeData.value)
    .filter(g => g.nota !== null)
    .map(g => g.nota as number);

  if (grades.length === 0) return null;

  const average = grades.reduce((a, b) => a + b, 0) / grades.length;
  const highest = Math.max(...grades);
  const lowest = Math.min(...grades);
  const passed = grades.filter(g => g >= 4.0).length;
  const failed = grades.filter(g => g < 4.0).length;

  return {
    average: average.toFixed(1),
    highest: highest.toFixed(1),
    lowest: lowest.toFixed(1),
    passed,
    failed
  };
});

// Cambio de asignatura
const onSubjectChange = async () => {
  selectedEvaluationId.value = '';
  evaluations.value = [];
  students.value = [];
  gradeData.value = {};

  if (selectedSubjectId.value) {
    try {
      evaluations.value = await teacherService.getSubjectEvaluations(selectedSubjectId.value);
      students.value = await teacherService.getSubjectStudents(selectedSubjectId.value);
    } catch (error) {
      console.error('Error loading subject data:', error);
    }
  }
};

// Cambio de evaluación
const onEvaluationChange = async () => {
  gradeData.value = {};

  if (selectedEvaluationId.value && students.value.length > 0) {
    // Inicializar datos de notas
    students.value.forEach(student => {
      gradeData.value[student.estudiante_id] = {
        resultado_id: null,
        puntaje: null,
        nota: null,
        porcentaje: null,
        observaciones: ''
      };
    });

    // Cargar notas existentes
    try {
      const existingGrades = await teacherService.getEvaluationGrades(Number(selectedEvaluationId.value));
      existingGrades.forEach(grade => {
        if (gradeData.value[grade.estudiante.estudiante_id]) {
          gradeData.value[grade.estudiante.estudiante_id] = {
            resultado_id: grade.resultado_id,
            puntaje: grade.puntaje_obtenido,
            nota: grade.nota,
            porcentaje: grade.porcentaje,
            observaciones: grade.observaciones || ''
          };
        }
      });
    } catch (error) {
      console.error('Error loading grades:', error);
    }
  }
};

// Guardar nota individual
const saveIndividualGrade = async (studentId: string) => {
  const data = gradeData.value[studentId];
  if (data.puntaje === null) return;

  saving.value = true;
  successMessage.value = '';
  error.value = '';

  try {
    const payload = {
      evaluacion_id: Number(selectedEvaluationId.value),
      estudiante_id: studentId,
      puntaje_obtenido: data.puntaje,
      observaciones: data.observaciones
    };

    const result = await teacherService.saveGrade(payload);
    data.resultado_id = result.resultado_id;
    data.nota = result.nota;
    data.porcentaje = result.porcentaje;

    successMessage.value = 'Nota guardada exitosamente';
    setTimeout(() => successMessage.value = '', 3000);
  } catch (err: any) {
    console.error('Error saving grade:', err);
    // Mostrar mensaje de error específico del backend
    const errorMsg = err.response?.data?.message || 'Error al guardar la nota';
    error.value = errorMsg;
    setTimeout(() => error.value = '', 5000);
  } finally {
    saving.value = false;
  }
};

// Guardar todas las notas
const saveAllGrades = async () => {
  saving.value = true;
  successMessage.value = '';
  error.value = '';

  try {
    const promises = Object.entries(gradeData.value)
      .filter(([_, data]) => data.puntaje !== null)
      .map(([studentId, data]) => {
        const payload = {
          evaluacion_id: Number(selectedEvaluationId.value),
          estudiante_id: studentId,
          puntaje_obtenido: data.puntaje!,
          observaciones: data.observaciones
        };
        return teacherService.saveGrade(payload);
      });

    await Promise.all(promises);
    successMessage.value = `${promises.length} notas guardadas exitosamente`;

    // Recargar notas
    await onEvaluationChange();

    setTimeout(() => successMessage.value = '', 3000);
  } catch (err: any) {
    console.error('Error saving all grades:', err);
    // Mostrar mensaje de error específico del backend
    const errorMsg = err.response?.data?.message || 'Error al guardar las notas';
    error.value = errorMsg;
    setTimeout(() => error.value = '', 5000);
  } finally {
    saving.value = false;
  }
};

// Cargar datos al montar
onMounted(async () => {
  if (teacherStore.subjects.length === 0) {
    await teacherStore.fetchMySubjects();
  }

  // Si viene subject en query params
  if (route.query.subject) {
    selectedSubjectId.value = route.query.subject as string;
    await onSubjectChange();
  }

  // Si viene evaluation en query params
  if (route.query.evaluation) {
    selectedEvaluationId.value = route.query.evaluation as string;
    await onEvaluationChange();
  }
});
</script>
