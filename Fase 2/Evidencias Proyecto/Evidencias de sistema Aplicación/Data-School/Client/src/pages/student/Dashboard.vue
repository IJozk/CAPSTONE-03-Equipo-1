<template>
    <div class="space-y-6">
      <!-- Welcome Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              Bienvenido, {{ studentName }}
            </h1>
            <p class="text-gray-600 mt-1">
              {{ currentDate }}
            </p>
          </div>
          <button
            @click="refreshDashboard"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
          >
            <svg
              class="w-5 h-5"
              :class="{ 'animate-spin': loading }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Promedio General -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Promedio General</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.promedio_general?.toFixed(1) || '-' }}</p>
            </div>
            <div class="bg-blue-100 rounded-full p-3">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Asistencia -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Asistencia</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.porcentaje_asistencia }}%</p>
            </div>
            <div class="bg-green-100 rounded-full p-3">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Asignaturas -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Asignaturas</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.total_asignaturas }}</p>
            </div>
            <div class="bg-purple-100 rounded-full p-3">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Próximas Evaluaciones -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Próximas Eval.</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.evaluaciones_proximas }}</p>
            </div>
            <div class="bg-yellow-100 rounded-full p-3">
              <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Horario Semanal -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-900">Mi Horario de Hoy</h2>
          </div>
          <div class="p-6">
            <div v-if="loading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
            <div v-else-if="horarioHoy.length === 0" class="text-center py-8 text-gray-500">
              No hay clases programadas para hoy
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="(clase, index) in horarioHoy"
                :key="index"
                class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ clase.asignatura }}</h3>
                    <p class="text-sm text-gray-600">{{ clase.profesor }}</p>
                  </div>
                  <span class="text-sm text-gray-600">{{ clase.horario }}</span>
                </div>
                <div class="mt-2 text-sm text-gray-500">Sala: {{ clase.sala }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notas Recientes -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-900">Notas Recientes</h2>
          </div>
          <div class="p-6">
            <div v-if="loading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
            <div v-else-if="notasRecientes.length === 0" class="text-center py-8 text-gray-500">
              No hay notas recientes
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="nota in notasRecientes"
                :key="nota.id"
                class="p-4 border border-gray-200 rounded-lg"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ nota.evaluacion }}</h3>
                    <p class="text-sm text-gray-600">{{ nota.asignatura }}</p>
                  </div>
                  <span
                    class="text-2xl font-bold"
                    :class="nota.nota >= 4.0 ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ nota.nota?.toFixed(1) }}
                  </span>
                </div>
                <div class="mt-2 text-sm text-gray-500">{{ nota.fecha }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Asignaturas con Promedio -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Mis Asignaturas</h2>
        </div>
        <div class="p-6">
          <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
          <div v-else-if="asignaturas.length === 0" class="text-center py-8 text-gray-500">
            No hay asignaturas registradas
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="asignatura in asignaturas"
              :key="asignatura.id"
              class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <h3 class="font-semibold text-gray-900">{{ asignatura.nombre }}</h3>
              <p class="text-sm text-gray-600 mt-1">{{ asignatura.profesor }}</p>
              <div class="mt-4 flex justify-between items-center">
                <span class="text-sm text-gray-500">Promedio:</span>
                <span
                  class="text-2xl font-bold"
                  :class="asignatura.promedio >= 4.0 ? 'text-green-600' : 'text-red-600'"
                >
                  {{ asignatura.promedio?.toFixed(1) || '-' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Eventos Próximos -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Próximos Eventos</h2>
          <p class="text-sm text-gray-600 mt-1">Evaluaciones y eventos destacados de los próximos 7 días</p>
        </div>
        <div class="p-6">
          <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
          <div v-else-if="eventosProximos.length === 0" class="text-center py-8 text-gray-500">
            No hay eventos próximos en los próximos 7 días
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="(evento, index) in eventosProximos"
              :key="index"
              class="p-4 border-l-4 rounded-lg"
              :class="{
                'border-red-500 bg-red-50': evento.color === 'red',
                'border-blue-500 bg-blue-50': evento.color === 'blue',
                'border-green-500 bg-green-50': evento.color === 'green',
                'border-yellow-500 bg-yellow-50': evento.color === 'yellow',
                'border-gray-500 bg-gray-50': !evento.color
              }"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span
                      class="px-2 py-1 text-xs font-semibold rounded"
                      :class="{
                        'bg-red-100 text-red-800': evento.tipo === 'evaluacion',
                        'bg-blue-100 text-blue-800': evento.tipo === 'taller',
                        'bg-green-100 text-green-800': evento.tipo === 'evento',
                        'bg-gray-100 text-gray-800': !evento.tipo
                      }"
                    >
                      {{ evento.tipo === 'evaluacion' ? 'Evaluación' : evento.tipo }}
                    </span>
                    <h3 class="font-semibold text-gray-900">{{ evento.titulo }}</h3>
                  </div>
                  <p class="text-sm text-gray-600 mt-2">{{ evento.descripcion }}</p>
                </div>
                <div class="text-right ml-4">
                  <p class="text-sm font-medium text-gray-900">
                    {{ new Date(evento.fecha).toLocaleDateString('es-CL', {
                      day: 'numeric',
                      month: 'short'
                    }) }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ new Date(evento.fecha).toLocaleDateString('es-CL', { weekday: 'short' }) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Encuesta -->
    <SurveyModal
      v-if="showSurveyModal"
      :encuesta="encuestaStore.primeraEncuestaPendiente"
      @close="closeSurveyModal"
      @submitted="closeSurveyModal"
    />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/store/auth.store';
import { useStudentStore } from '@/store/student.store';
import { useEncuestaEstudianteStore } from '@/store/encuestaEstudiante.store';
import studentService from '@/services/student.service';
import SurveyModal from '@/components/surveys/SurveyModal.vue';

const authStore = useAuthStore();
const studentStore = useStudentStore();
const encuestaStore = useEncuestaEstudianteStore();
const loading = ref(false);
const showSurveyModal = ref(false);

const studentName = computed(() =>
  authStore.user?.estudiante_profile?.nombre_completo ||
  authStore.user?.nombre_completo ||
  'Estudiante'
);

const estudianteId = computed(() => authStore.user?.estudiante_profile?.estudiante_id);

// Fecha actual formateada
const currentDate = computed(() => {
  const today = new Date();
  return today.toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Dashboard data
const dashboardData = ref<any>(null);

// Stats computados desde datos reales del dashboard
const stats = computed(() => dashboardData.value?.stats || {
  promedio_general: 0,
  porcentaje_asistencia: 0,
  total_asignaturas: 0,
  evaluaciones_proximas: 0,
  anotaciones: { positivas: 0, negativas: 0, neutras: 0 }
});

// Horario del día actual
const horarioHoy = ref<any[]>([]);

// Notas recientes desde el dashboard
const notasRecientes = computed(() => {
  if (!dashboardData.value?.notas_recientes) return [];
  return dashboardData.value.notas_recientes.map((nota: any) => ({
    id: nota.created_at,
    evaluacion: nota.evaluacion_nombre,
    asignatura: nota.asignatura_nombre,
    nota: nota.nota,
    fecha: new Date(nota.fecha || nota.created_at).toLocaleDateString('es-CL')
  }));
});

// Asignaturas con promedio desde el dashboard
const asignaturas = computed(() => {
  if (!dashboardData.value?.asignaturas) return [];
  return dashboardData.value.asignaturas.map((asig: any) => ({
    id: asig.asignatura_id,
    nombre: asig.nombre,
    profesor: asig.profesor,
    promedio: asig.promedio
  }));
});

// Eventos próximos desde el dashboard
const eventosProximos = computed(() => {
  if (!dashboardData.value?.eventos_proximos) return [];
  return dashboardData.value.eventos_proximos;
});

/**
 * Carga todos los datos del dashboard desde el nuevo endpoint
 */
const loadDashboardData = async () => {
  if (!estudianteId.value) {
    console.warn('No se encontró el ID del estudiante');
    return;
  }

  loading.value = true;

  try {
    console.log('📊 Cargando dashboard para estudiante:', estudianteId.value);

    // Cargar dashboard completo desde el backend
    dashboardData.value = await studentService.getDashboard(estudianteId.value);

    console.log('✅ Dashboard cargado:', dashboardData.value);

    // Cargar horario del día desde el dashboard
    horarioHoy.value = dashboardData.value?.horario_hoy || [];

  } catch (error) {
    console.error('❌ Error loading dashboard data:', error);
  } finally {
    loading.value = false;
  }
};

const refreshDashboard = async () => {
  await loadDashboardData();
};

const checkPendingSurveys = async () => {
  try {
    if (estudianteId.value) {
      await encuestaStore.fetchEncuestasPendientes(estudianteId.value);
      if (encuestaStore.tieneEncuestasPendientes) {
        showSurveyModal.value = true;
      }
    }
  } catch (error) {
    console.error('Error checking surveys:', error);
  }
};

const closeSurveyModal = () => {
  showSurveyModal.value = false;
};

onMounted(async () => {
  await loadDashboardData();
  await checkPendingSurveys();
});
</script>
