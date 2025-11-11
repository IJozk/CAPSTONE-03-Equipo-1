<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Mi Calendario</h1>
        <p class="text-gray-600 mt-1">Visualiza tus evaluaciones programadas por mes</p>
      </div>

      <!-- Month Navigation -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="flex items-center justify-between">
          <button
            @click="previousMonth"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div class="text-center">
            <h2 class="text-xl font-bold text-gray-900">{{ currentMonthName }} {{ currentYear }}</h2>
            <p class="text-sm text-gray-600">{{ totalEvaluationsThisMonth }} evaluaciones este mes</p>
          </div>

          <button
            @click="nextMonth"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="mt-2 text-gray-600">Cargando evaluaciones...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-sm text-red-800">{{ error }}</p>
      </div>

      <!-- Calendar Grid -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <!-- Days of week header -->
        <div class="grid grid-cols-7 border-b bg-gray-50">
          <div
            v-for="day in daysOfWeek"
            :key="day"
            class="px-2 py-3 text-center text-xs font-semibold text-gray-600 uppercase"
          >
            {{ day }}
          </div>
        </div>

        <!-- Calendar days -->
        <div class="grid grid-cols-7 divide-x divide-y">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            class="min-h-32 p-2 transition-colors"
            :class="getDayClass(day)"
          >
            <!-- Day number -->
            <div class="flex justify-between items-start mb-2">
              <span
                class="text-sm font-medium"
                :class="day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'"
              >
                {{ day.day }}
              </span>
              <span
                v-if="isToday(day)"
                class="px-2 py-0.5 text-xs font-semibold bg-primary-600 text-white rounded-full"
              >
                Hoy
              </span>
            </div>

            <!-- Evaluations for this day -->
            <div class="space-y-1">
              <div
                v-for="evaluation in getEvaluationsForDay(day)"
                :key="evaluation.evaluacion_id"
                @click="selectedEvaluation = evaluation"
                class="px-2 py-1 rounded text-xs cursor-pointer transition-all hover:shadow-md"
                :class="getEvaluationColor(evaluation.tipo)"
              >
                <div class="font-semibold truncate">{{ evaluation.nombre }}</div>
                <div class="text-xs opacity-90 truncate">{{ evaluation.asignatura_nombre }}</div>
              </div>

              <!-- Show "+" if more than 3 evaluations -->
              <div
                v-if="getEvaluationsForDay(day).length > 3"
                class="text-xs text-gray-500 font-medium text-center"
              >
                +{{ getEvaluationsForDay(day).length - 3 }} más
              </div>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="px-6 py-4 bg-gray-50 border-t">
          <div class="flex flex-wrap gap-4 text-xs">
            <div class="flex items-center">
              <div class="w-3 h-3 rounded bg-blue-100 border border-blue-300 mr-2"></div>
              <span class="text-gray-700">Prueba</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 rounded bg-green-100 border border-green-300 mr-2"></div>
              <span class="text-gray-700">Trabajo</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 rounded bg-yellow-100 border border-yellow-300 mr-2"></div>
              <span class="text-gray-700">Tarea</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 rounded bg-purple-100 border border-purple-300 mr-2"></div>
              <span class="text-gray-700">Proyecto</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 rounded bg-pink-100 border border-pink-300 mr-2"></div>
              <span class="text-gray-700">Presentación</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 rounded bg-gray-100 border border-gray-300 mr-2"></div>
              <span class="text-gray-700">Otros</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Evaluation Detail Modal -->
      <div
        v-if="selectedEvaluation"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click="selectedEvaluation = null"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6" @click.stop>
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-bold text-gray-900">Detalle de Evaluación</h3>
            <button
              @click="selectedEvaluation = null"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <p class="text-lg font-semibold text-gray-900">{{ selectedEvaluation.nombre }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Asignatura</label>
              <p class="text-gray-900">{{ selectedEvaluation.asignatura_nombre }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Curso</label>
              <p class="text-gray-900">{{ selectedEvaluation.curso_nombre }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                      :class="getEvaluationColor(selectedEvaluation.tipo)">
                  {{ selectedEvaluation.tipo }}
                </span>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <p class="text-gray-900">{{ formatDate(selectedEvaluation.fecha_evaluacion) }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Puntaje Máximo</label>
                <p class="text-gray-900">{{ selectedEvaluation.puntaje_maximo }} pts</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Porcentaje</label>
                <p class="text-gray-900">{{ selectedEvaluation.porcentaje_nota }}%</p>
              </div>
            </div>

            <div v-if="selectedEvaluation.descripcion">
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <p class="text-gray-700 text-sm">{{ selectedEvaluation.descripcion }}</p>
            </div>

            <div v-if="selectedEvaluation.is_recuperativa" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p class="text-sm text-yellow-800 font-medium">⚠️ Evaluación Recuperativa</p>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-3">
            <button
              @click="selectedEvaluation = null"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cerrar
            </button>
            <button
              @click="goToEvaluation(selectedEvaluation)"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Ver Notas
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import teacherService from '@/services/teachertools.service';
import type { Evaluation } from '@/types/teacher.types';

const router = useRouter();
const loading = ref(false);
const error = ref('');
const evaluations = ref<Evaluation[]>([]);
const selectedEvaluation = ref<Evaluation | null>(null);

// Current month/year state
const currentMonth = ref(new Date().getMonth()); // 0-11
const currentYear = ref(new Date().getFullYear());

const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Computed
const currentMonthName = computed(() => monthNames[currentMonth.value]);

const totalEvaluationsThisMonth = computed(() => {
  return evaluations.value.filter(ev => {
    const evDate = new Date(ev.fecha_evaluacion);
    return evDate.getMonth() === currentMonth.value && evDate.getFullYear() === currentYear.value;
  }).length;
});

interface CalendarDay {
  day: number;
  date: Date;
  isCurrentMonth: boolean;
}

const calendarDays = computed((): CalendarDay[] => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

  const days: CalendarDay[] = [];

  // Previous month days
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({
      day: prevMonthLastDay - i,
      date: new Date(currentYear.value, currentMonth.value - 1, prevMonthLastDay - i),
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      date: new Date(currentYear.value, currentMonth.value, i),
      isCurrentMonth: true
    });
  }

  // Next month days to complete the grid
  const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      date: new Date(currentYear.value, currentMonth.value + 1, i),
      isCurrentMonth: false
    });
  }

  return days;
});

// Methods
const isToday = (day: CalendarDay): boolean => {
  const today = new Date();
  return (
    day.date.getDate() === today.getDate() &&
    day.date.getMonth() === today.getMonth() &&
    day.date.getFullYear() === today.getFullYear()
  );
};

const getDayClass = (day: CalendarDay): string => {
  const classes = [];

  if (!day.isCurrentMonth) {
    classes.push('bg-gray-50');
  } else {
    classes.push('bg-white hover:bg-gray-50');
  }

  if (isToday(day)) {
    classes.push('ring-2 ring-primary-500 ring-inset');
  }

  return classes.join(' ');
};

const getEvaluationsForDay = (day: CalendarDay): Evaluation[] => {
  return evaluations.value.filter(ev => {
    const evDate = new Date(ev.fecha_evaluacion);
    return (
      evDate.getDate() === day.date.getDate() &&
      evDate.getMonth() === day.date.getMonth() &&
      evDate.getFullYear() === day.date.getFullYear()
    );
  }).slice(0, 3); // Show max 3 evaluations per day
};

const getEvaluationColor = (tipo: string): string => {
  const colors: Record<string, string> = {
    PRUEBA: 'bg-blue-100 text-blue-800 border-blue-300',
    TRABAJO: 'bg-green-100 text-green-800 border-green-300',
    TAREA: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    PROYECTO: 'bg-purple-100 text-purple-800 border-purple-300',
    PRESENTACION: 'bg-pink-100 text-pink-800 border-pink-300',
    OTROS: 'bg-gray-100 text-gray-800 border-gray-300'
  };
  return colors[tipo] || colors.OTROS;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const goToEvaluation = (evaluation: Evaluation) => {
  // Navigate to grades page for this evaluation
  router.push({
    name: 'teacher-grades',
    query: {
      evaluation: evaluation.evaluacion_id,
      subject: evaluation.asignatura_id
    }
  });
};

// Load evaluations
const loadEvaluations = async () => {
  loading.value = true;
  error.value = '';

  try {
    console.log('Cargando todas las evaluaciones del profesor...');
    evaluations.value = await teacherService.getAllMyEvaluations();
    console.log('Evaluaciones cargadas:', evaluations.value.length);
  } catch (err: any) {
    error.value = err.message || 'Error al cargar las evaluaciones';
    console.error('Error loading evaluations:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadEvaluations();
});
</script>
