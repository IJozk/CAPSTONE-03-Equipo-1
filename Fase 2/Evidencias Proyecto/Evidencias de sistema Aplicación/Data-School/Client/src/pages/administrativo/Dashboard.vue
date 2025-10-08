<template>
  <DashboardLayout role="ADMINISTRATIVO">
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Panel Administrativo</h1>
          <p class="text-gray-600 mt-1">Bienvenido, {{ administrativoName }}. Gestiona las operaciones del colegio.</p>
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
        <!-- Tareas Pendientes -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Tareas Pendientes</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.tareasPendientes || 0 }}</p>
            </div>
            <div class="bg-blue-100 rounded-full p-3">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Solicitudes Activas -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Solicitudes</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.solicitudesActivas || 0 }}</p>
            </div>
            <div class="bg-yellow-100 rounded-full p-3">
              <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Eventos del Mes -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Eventos del Mes</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.eventosMes || 0 }}</p>
            </div>
            <div class="bg-green-100 rounded-full p-3">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Alertas -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Alertas</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.alertas || 0 }}</p>
            </div>
            <div class="bg-red-100 rounded-full p-3">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Acciones Rápidas</h2>
        </div>
        <div class="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <svg class="w-8 h-8 mx-auto text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span class="text-sm font-medium text-gray-900">Registrar Alumno</span>
          </button>

          <button class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <svg class="w-8 h-8 mx-auto text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span class="text-sm font-medium text-gray-900">Generar Certificado</span>
          </button>

          <button class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <svg class="w-8 h-8 mx-auto text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-sm font-medium text-gray-900">Programar Evento</span>
          </button>

          <button class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <svg class="w-8 h-8 mx-auto text-yellow-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="text-sm font-medium text-gray-900">Crear Reporte</span>
          </button>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Tareas Pendientes -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-900">Tareas Pendientes</h2>
          </div>
          <div class="p-6">
            <div v-if="loading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
            <div v-else-if="tareasPendientes.length === 0" class="text-center py-8 text-gray-500">
              No hay tareas pendientes
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="tarea in tareasPendientes"
                :key="tarea.id"
                class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900">{{ tarea.titulo }}</h3>
                    <p class="text-sm text-gray-600 mt-1">{{ tarea.descripcion }}</p>
                  </div>
                  <span
                    class="text-xs px-2 py-1 rounded-full"
                    :class="{
                      'bg-red-100 text-red-800': tarea.prioridad === 'alta',
                      'bg-yellow-100 text-yellow-800': tarea.prioridad === 'media',
                      'bg-green-100 text-green-800': tarea.prioridad === 'baja'
                    }"
                  >
                    {{ tarea.prioridad }}
                  </span>
                </div>
                <div class="mt-2 text-sm text-gray-500">Vencimiento: {{ tarea.fechaVencimiento }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Próximos Eventos -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-900">Próximos Eventos</h2>
          </div>
          <div class="p-6">
            <div v-if="loading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
            <div v-else-if="proximosEventos.length === 0" class="text-center py-8 text-gray-500">
              No hay eventos próximos
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="evento in proximosEventos"
                :key="evento.id"
                class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ evento.nombre }}</h3>
                    <p class="text-sm text-gray-600 mt-1">{{ evento.descripcion }}</p>
                  </div>
                </div>
                <div class="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <span>{{ evento.fecha }}</span>
                  <span>{{ evento.lugar }}</span>
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

const administrativoName = computed(() => authStore.user?.nombre_completo || 'Administrativo');

const stats = ref({
  tareasPendientes: 0,
  solicitudesActivas: 0,
  eventosMes: 0,
  alertas: 0
});

const tareasPendientes = ref<any[]>([]);
const proximosEventos = ref<any[]>([]);

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
