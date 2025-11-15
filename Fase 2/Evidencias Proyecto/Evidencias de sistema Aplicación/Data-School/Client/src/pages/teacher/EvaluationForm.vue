<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <button
          @click="goBack"
          class="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>

        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEdit ? 'Editar Evaluación' : 'Nueva Evaluación' }}
        </h1>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <form @submit.prevent="handleSubmit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Asignatura -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Asignatura *
              </label>
              <select
                v-model="formData.asignatura_id"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.asignatura_id }"
              >
                <option value="">Seleccionar asignatura</option>
                <option
                  v-for="subject in subjects"
                  :key="subject.asignatura_id"
                  :value="subject.asignatura_id"
                >
                  {{ subject.nombre }} - {{ subject.curso.nombre }}
                </option>
              </select>
              <p v-if="errors.asignatura_id" class="mt-1 text-sm text-red-600">{{ errors.asignatura_id }}</p>
            </div>

            <!-- Nombre -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                v-model="formData.nombre"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.nombre }"
                placeholder="Ej: Prueba Unidad 2"
              />
              <p v-if="errors.nombre" class="mt-1 text-sm text-red-600">{{ errors.nombre }}</p>
            </div>

            <!-- Descripción -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                v-model="formData.descripcion"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows="3"
                placeholder="Describe brevemente el contenido de la evaluación..."
              ></textarea>
            </div>

            <!-- Tipo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                v-model="formData.tipo"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.tipo }"
              >
                <option value="">Seleccionar tipo</option>
                <option value="PRUEBA">Prueba</option>
                <option value="TRABAJO">Trabajo</option>
                <option value="TAREA">Tarea</option>
                <option value="PROYECTO">Proyecto</option>
                <option value="PRESENTACION">Presentación</option>
                <option value="OTROS">Otros</option>
              </select>
              <p v-if="errors.tipo" class="mt-1 text-sm text-red-600">{{ errors.tipo }}</p>
            </div>

            <!-- Fecha -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Evaluación *
              </label>
              <input
                v-model="formData.fecha_evaluacion"
                type="date"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.fecha_evaluacion }"
              />
              <p v-if="errors.fecha_evaluacion" class="mt-1 text-sm text-red-600">{{ errors.fecha_evaluacion }}</p>
            </div>

            <!-- Puntaje Máximo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Puntaje Máximo *
              </label>
              <input
                v-model.number="formData.puntaje_maximo"
                type="number"
                required
                min="1"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.puntaje_maximo }"
                placeholder="60"
              />
              <p v-if="errors.puntaje_maximo" class="mt-1 text-sm text-red-600">{{ errors.puntaje_maximo }}</p>
            </div>

            <!-- Porcentaje -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Porcentaje de la Nota (%)
              </label>
              <input
                v-model.number="formData.porcentaje_nota"
                type="number"
                min="1"
                max="100"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.porcentaje_nota }"
                placeholder="100"
              />
              <p v-if="errors.porcentaje_nota" class="mt-1 text-sm text-red-600">{{ errors.porcentaje_nota }}</p>
              <p class="mt-1 text-xs text-gray-500">Porcentaje que representa esta evaluación en la nota final (1-100%)</p>
            </div>

            <!-- Recuperativa -->
            <div class="md:col-span-2">
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="formData.is_recuperativa"
                  type="checkbox"
                  class="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                />
                <span class="ml-2 text-sm text-gray-700">
                  ¿Es una evaluación recuperativa?
                </span>
              </label>
              <p class="ml-6 mt-1 text-xs text-gray-500">
                Las evaluaciones recuperativas permiten a los estudiantes mejorar sus notas
              </p>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-red-800">{{ errorMessage }}</p>
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-green-800">{{ successMessage }}</p>
            </div>
          </div>

          <!-- Buttons -->
          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="goBack"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              :disabled="loading"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              :disabled="loading"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Guardando...' : 'Guardar Evaluación' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTeacherStore } from '@/store/teacher.store';
import type { EvaluationType } from '@/types/teacher.types';

const route = useRoute();
const router = useRouter();
const teacherStore = useTeacherStore();

const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Form data
const formData = ref({
  asignatura_id: (route.query.subject as string) || '',
  nombre: '',
  descripcion: '',
  tipo: '' as EvaluationType | '',
  fecha_evaluacion: '',
  puntaje_maximo: 60,
  porcentaje_nota: 100,
  is_recuperativa: false
});

// Validation errors
const errors = ref({
  asignatura_id: '',
  nombre: '',
  tipo: '',
  fecha_evaluacion: '',
  puntaje_maximo: '',
  porcentaje_nota: ''
});

// Get subjects from store
const subjects = computed(() => teacherStore.subjects);

// Validate form
const validateForm = (): boolean => {
  let isValid = true;
  errors.value = {
    asignatura_id: '',
    nombre: '',
    tipo: '',
    fecha_evaluacion: '',
    puntaje_maximo: '',
    porcentaje_nota: ''
  };

  if (!formData.value.asignatura_id) {
    errors.value.asignatura_id = 'Debes seleccionar una asignatura';
    isValid = false;
  }

  if (!formData.value.nombre.trim()) {
    errors.value.nombre = 'El nombre es requerido';
    isValid = false;
  }

  if (!formData.value.tipo) {
    errors.value.tipo = 'Debes seleccionar un tipo';
    isValid = false;
  }

  if (!formData.value.fecha_evaluacion) {
    errors.value.fecha_evaluacion = 'La fecha es requerida';
    isValid = false;
  }

  if (!formData.value.puntaje_maximo || formData.value.puntaje_maximo < 1) {
    errors.value.puntaje_maximo = 'El puntaje debe ser mayor a 0';
    isValid = false;
  }

  if (formData.value.porcentaje_nota < 1 || formData.value.porcentaje_nota > 100) {
    errors.value.porcentaje_nota = 'El porcentaje debe estar entre 1 y 100';
    isValid = false;
  }

  return isValid;
};

// Handle form submission
const handleSubmit = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (!validateForm()) {
    errorMessage.value = 'Por favor corrige los errores en el formulario';
    return;
  }

  loading.value = true;

  try {
    if (isEdit.value) {
      // Update existing evaluation
      await teacherStore.updateEvaluation(
        Number(route.params.id),
        {
          ...formData.value,
          tipo: formData.value.tipo as EvaluationType
        }
      );
      successMessage.value = 'Evaluación actualizada exitosamente';
    } else {
      // Create new evaluation
      await teacherStore.createEvaluation({
        ...formData.value,
        tipo: formData.value.tipo as EvaluationType
      });
      successMessage.value = 'Evaluación creada exitosamente';
    }

    // Redirect after success
    setTimeout(() => {
      if (formData.value.asignatura_id) {
        router.push(`/teacher/subjects/${formData.value.asignatura_id}`);
      } else {
        router.push('/teacher/evaluations');
      }
    }, 1500);
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al guardar la evaluación';
    console.error('Error saving evaluation:', error);
  } finally {
    loading.value = false;
  }
};

// Go back
const goBack = () => {
  if (formData.value.asignatura_id) {
    router.push(`/teacher/subjects/${formData.value.asignatura_id}`);
  } else {
    router.push('/teacher/evaluations');
  }
};

// Load data on mount
onMounted(async () => {
  // Load subjects if not loaded
  if (teacherStore.subjects.length === 0) {
    await teacherStore.fetchMySubjects();
  }

  // If editing, load evaluation data
  if (isEdit.value) {
    loading.value = true;
    try {
      const evaluationId = Number(route.params.id);
      const evaluation = teacherStore.evaluations.find(e => e.evaluacion_id === evaluationId);

      if (evaluation) {
        formData.value = {
          asignatura_id: evaluation.asignatura_id,
          nombre: evaluation.nombre,
          descripcion: evaluation.descripcion || '',
          tipo: evaluation.tipo,
          fecha_evaluacion: evaluation.fecha_evaluacion.split('T')[0],
          puntaje_maximo: evaluation.puntaje_maximo,
          porcentaje_nota: evaluation.porcentaje_nota,
          is_recuperativa: evaluation.is_recuperativa
        };
      }
    } catch (error) {
      console.error('Error loading evaluation:', error);
      errorMessage.value = 'Error al cargar la evaluación';
    } finally {
      loading.value = false;
    }
  }
});
</script>
