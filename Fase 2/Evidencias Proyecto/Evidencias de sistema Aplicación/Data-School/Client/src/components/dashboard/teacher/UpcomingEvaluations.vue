<template>
  <div class="bg-white rounded-xl shadow-md p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900 flex items-center">
        <svg class="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Evaluaciones Próximas
      </h2>
      <router-link
        to="/teacher/evaluations"
        class="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
      >
        Ver todas
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="teacherStore.loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="animate-pulse">
        <div class="h-20 bg-gray-200 rounded-lg"></div>
      </div>
    </div>

    <!-- No Evaluations -->
    <div v-else-if="!upcomingEvaluations.length" class="text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-gray-500">No hay evaluaciones próximas</p>
      <router-link
        to="/teacher/evaluations/new"
        class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Crear Evaluación
      </router-link>
    </div>

    <!-- Evaluations List -->
    <div v-else class="space-y-3">
      <div
        v-for="evaluation in upcomingEvaluations.slice(0, 5)"
        :key="evaluation.evaluacion_id"
        class="group relative bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-all duration-200 border-l-4"
        :class="getDaysRemainingColor(evaluation.dias_restantes).border"
      >
        <div class="flex items-start justify-between">
          <!-- Evaluation Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-bold text-gray-900 truncate">{{ evaluation.nombre }}</h3>
              <span
                class="flex-shrink-0 px-2 py-1 rounded-full text-xs font-semibold"
                :class="getDaysRemainingColor(evaluation.dias_restantes).badge"
              >
                {{ evaluation.dias_restantes }} {{ evaluation.dias_restantes === 1 ? 'día' : 'días' }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-2">
              {{ evaluation.asignatura }} - {{ evaluation.curso }}
            </p>
            <div class="flex items-center gap-4 text-xs text-gray-500">
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ formatDate(evaluation.fecha) }}
              </span>
              <span
                class="px-2 py-0.5 rounded text-xs font-medium"
                :class="getStatusColor(evaluation.estado)"
              >
                {{ getStatusText(evaluation.estado) }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 ml-4">
            <button
              @click="handleViewEvaluation(evaluation)"
              class="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
              title="Ver detalles"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              v-if="evaluation.estado !== 'completada'"
              @click="handleEditEvaluation(evaluation)"
              class="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
              title="Editar"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Show more link if there are more evaluations -->
      <div v-if="upcomingEvaluations.length > 5" class="text-center pt-2">
        <router-link
          to="/teacher/evaluations"
          class="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Ver {{ upcomingEvaluations.length - 5 }} evaluaciones más
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTeacherStore } from '@/store/teacher.store';
import { useRouter } from 'vue-router';
import type { UpcomingEvaluation, EvaluationStatus } from '@/types/teacher.types';

const teacherStore = useTeacherStore();
const router = useRouter();

const upcomingEvaluations = computed(() => teacherStore.upcomingEvaluations);

onMounted(async () => {
  if (!teacherStore.upcoming) {
    await teacherStore.fetchUpcoming();
  }
});

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
};

const getDaysRemainingColor = (days: number) => {
  if (days < 3) {
    return {
      badge: 'bg-red-100 text-red-800',
      border: 'border-red-500'
    };
  } else if (days <= 7) {
    return {
      badge: 'bg-yellow-100 text-yellow-800',
      border: 'border-yellow-500'
    };
  } else {
    return {
      badge: 'bg-blue-100 text-blue-800',
      border: 'border-blue-500'
    };
  }
};

const getStatusColor = (status: EvaluationStatus): string => {
  const statusColors = {
    'por_aplicar': 'bg-blue-100 text-blue-800',
    'por_revisar': 'bg-yellow-100 text-yellow-800',
    'completada': 'bg-green-100 text-green-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

const getStatusText = (status: EvaluationStatus): string => {
  const statusText = {
    'por_aplicar': 'Por Aplicar',
    'por_revisar': 'Por Revisar',
    'completada': 'Completada'
  };
  return statusText[status] || status;
};

const handleViewEvaluation = (evaluation: UpcomingEvaluation) => {
  router.push({
    name: 'teacher-evaluation-detail',
    params: { id: evaluation.evaluacion_id }
  });
};

const handleEditEvaluation = (evaluation: UpcomingEvaluation) => {
  router.push({
    name: 'teacher-evaluation-edit',
    params: { id: evaluation.evaluacion_id }
  });
};
</script>
