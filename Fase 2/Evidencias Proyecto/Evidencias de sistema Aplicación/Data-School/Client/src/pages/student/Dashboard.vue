<template>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Mi Panel Estudiantil</h1>
          <p class="text-gray-600 mt-1">Bienvenido, {{ studentName }}. Aquí está tu resumen académico.</p>
        </div>
        <button
          @click="refreshDashboard"
          :disabled="loading"
          class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
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

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Promedio General -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Promedio General</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.promedioGeneral?.toFixed(1) || '-' }}</p>
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
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.asistencia || 0 }}%</p>
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
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.totalAsignaturas || 0 }}</p>
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
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.proximasEvaluaciones || 0 }}</p>
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
            <h2 class="text-xl font-bold text-gray-900">Mi Horario</h2>
          </div>
          <div class="p-6">
            <div v-if="loading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
            <div v-else-if="horario.length === 0" class="text-center py-8 text-gray-500">
              No hay horario disponible
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="clase in horario"
                :key="clase.id"
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
import SurveyModal from '@/components/surveys/SurveyModal.vue';

const authStore = useAuthStore();
const studentStore = useStudentStore();
const encuestaStore = useEncuestaEstudianteStore();
const loading = ref(false);
const showSurveyModal = ref(false);

const studentName = computed(() => authStore.user?.nombre_completo || 'Estudiante');

// Stats computados desde el store
const stats = computed(() => ({
  promedioGeneral: studentStore.academicSummary?.promedio_general || 5.5,
  asistencia: studentStore.academicSummary?.porcentaje_asistencia || 92,
  totalAsignaturas: studentStore.academicSummary?.total_asignaturas || 8,
  proximasEvaluaciones: studentStore.academicSummary?.evaluaciones_pendientes || 3
}));

// Mock data para horario (mientras no haya datos del backend)
const horario = computed(() => studentStore.schedule.length > 0 ? studentStore.schedule.slice(0, 5).map((s, i) => ({
  id: i,
  asignatura: s.asignatura,
  profesor: s.profesor,
  horario: `${s.hora_inicio} - ${s.hora_fin}`,
  sala: s.sala || 'Sala 101'
})) : [
  { id: 1, asignatura: 'Matemáticas', profesor: 'Prof. García', horario: '08:00 - 09:30', sala: 'Sala 201' },
  { id: 2, asignatura: 'Lenguaje', profesor: 'Prof. Rodríguez', horario: '09:45 - 11:15', sala: 'Sala 102' },
  { id: 3, asignatura: 'Ciencias', profesor: 'Prof. López', horario: '11:30 - 13:00', sala: 'Sala 305' },
  { id: 4, asignatura: 'Historia', profesor: 'Prof. Martínez', horario: '14:00 - 15:30', sala: 'Sala 201' },
  { id: 5, asignatura: 'Inglés', profesor: 'Prof. Smith', horario: '15:45 - 17:15', sala: 'Sala 104' }
]);

// Mock data para notas recientes
const notasRecientes = computed(() => studentStore.grades.length > 0 ?
  studentStore.grades.slice(0, 3).flatMap(g => g.notas.slice(0, 1).map(n => ({
    id: n.nota_id,
    evaluacion: n.evaluacion_nombre,
    asignatura: g.nombre_asignatura,
    nota: n.nota,
    fecha: new Date(n.fecha).toLocaleDateString('es-CL')
  }))) : [
  { id: 1, evaluacion: 'Prueba 1', asignatura: 'Matemáticas', nota: 6.5, fecha: '15/10/2025' },
  { id: 2, evaluacion: 'Control Lectura', asignatura: 'Lenguaje', nota: 5.8, fecha: '14/10/2025' },
  { id: 3, evaluacion: 'Laboratorio', asignatura: 'Ciencias', nota: 6.2, fecha: '12/10/2025' }
]);

// Mock data para asignaturas
const asignaturas = computed(() => studentStore.grades.length > 0 ?
  studentStore.grades.map(g => ({
    id: g.asignatura_id,
    nombre: g.nombre_asignatura,
    profesor: g.profesor_nombre,
    promedio: g.promedio
  })) : [
  { id: 1, nombre: 'Matemáticas', profesor: 'Prof. García', promedio: 6.2 },
  { id: 2, nombre: 'Lenguaje', profesor: 'Prof. Rodríguez', promedio: 5.8 },
  { id: 3, nombre: 'Ciencias', profesor: 'Prof. López', promedio: 6.0 },
  { id: 4, nombre: 'Historia', profesor: 'Prof. Martínez', promedio: 5.5 },
  { id: 5, nombre: 'Inglés', profesor: 'Prof. Smith', promedio: 6.3 },
  { id: 6, nombre: 'Ed. Física', profesor: 'Prof. Torres', promedio: 6.8 },
  { id: 7, nombre: 'Artes', profesor: 'Prof. Vargas', promedio: 6.5 },
  { id: 8, nombre: 'Música', profesor: 'Prof. Silva', promedio: 6.4 }
]);

const refreshDashboard = async () => {
  loading.value = true;
  try {
    await Promise.all([
      studentStore.fetchAcademicSummary(),
      studentStore.fetchGrades(),
      studentStore.fetchSchedule(),
      studentStore.fetchUpcomingEvents()
    ]);
  } catch (error) {
    console.error('Error refreshing dashboard:', error);
  } finally {
    loading.value = false;
  }
};

const checkPendingSurveys = async () => {
  try {
    const estudianteId = authStore.user?.estudiante_profile?.estudiante_id;
    if (estudianteId) {
      await encuestaStore.fetchEncuestasPendientes(estudianteId);
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
  await refreshDashboard();
  await checkPendingSurveys();
});
</script>
