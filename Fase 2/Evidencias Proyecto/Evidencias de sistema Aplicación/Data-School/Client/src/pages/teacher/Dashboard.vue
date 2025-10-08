<template>
  <DashboardLayout role="PROFESOR">
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Panel del Profesor</h1>
          <p class="text-gray-600 mt-1">Bienvenido, {{ teacherName }}. Aquí está el resumen de tus clases.</p>
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
        <!-- Total Asignaturas -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Asignaturas</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.totalAsignaturas || 0 }}</p>
            </div>
            <div class="bg-blue-100 rounded-full p-3">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Total Estudiantes -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Estudiantes</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.totalEstudiantes || 0 }}</p>
            </div>
            <div class="bg-green-100 rounded-full p-3">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Clases Hoy -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Clases Hoy</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.clasesHoy || 0 }}</p>
            </div>
            <div class="bg-yellow-100 rounded-full p-3">
              <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Evaluaciones Pendientes -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Eval. Pendientes</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.evaluacionesPendientes || 0 }}</p>
            </div>
            <div class="bg-red-100 rounded-full p-3">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Horario de Hoy -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-900">Horario de Hoy</h2>
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
                v-for="clase in horarioHoy"
                :key="clase.id"
                class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ clase.asignatura }}</h3>
                    <p class="text-sm text-gray-600">{{ clase.curso }}</p>
                  </div>
                  <span class="text-sm text-gray-600">{{ clase.horario }}</span>
                </div>
                <div class="mt-2 text-sm text-gray-500">Sala: {{ clase.sala }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Próximas Evaluaciones -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-900">Próximas Evaluaciones</h2>
          </div>
          <div class="p-6">
            <div v-if="loading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
            <div v-else-if="proximasEvaluaciones.length === 0" class="text-center py-8 text-gray-500">
              No hay evaluaciones próximas
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="evaluacion in proximasEvaluaciones"
                :key="evaluacion.id"
                class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ evaluacion.nombre }}</h3>
                    <p class="text-sm text-gray-600">{{ evaluacion.asignatura }}</p>
                  </div>
                  <span class="text-sm text-gray-600">{{ evaluacion.fecha }}</span>
                </div>
                <div class="mt-2">
                  <span
                    class="text-xs px-2 py-1 rounded-full"
                    :class="evaluacion.corregida ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                  >
                    {{ evaluacion.corregida ? 'Corregida' : 'Por corregir' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/store/auth.store';
import DashboardLayout from '@/layouts/DashboardLayout.vue';

const authStore = useAuthStore();
const loading = ref(false);

const teacherName = computed(() => authStore.user?.profesor_profile?.nombre_completo || 'Profesor');

const stats = ref({
  totalAsignaturas: 0,
  totalEstudiantes: 0,
  clasesHoy: 0,
  evaluacionesPendientes: 0
});

const horarioHoy = ref<any[]>([]);
const proximasEvaluaciones = ref<any[]>([]);

const refreshDashboard = async () => {
  loading.value = true;
  try {
    // TODO: Implementar llamadas a API
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('Error refreshing dashboard:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  refreshDashboard();
});
</script>
