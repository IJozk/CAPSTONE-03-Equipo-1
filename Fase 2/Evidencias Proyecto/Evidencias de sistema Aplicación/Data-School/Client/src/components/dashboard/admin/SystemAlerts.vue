<template>
  <div class="bg-white rounded-xl shadow-md p-6">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2">
        <h2 class="text-lg font-bold text-gray-900">Alertas Pendientes</h2>
        <span
          v-if="alerts.length > 0"
          class="px-2 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full"
        >
          {{ alerts.length }}
        </span>
      </div>
      <router-link
        to="/admin/alerts"
        class="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
      >
        Ver todas
      </router-link>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="p-4 rounded-lg border border-gray-200 animate-pulse">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
          <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>

    <!-- Alertas -->
    <div v-else-if="alerts.length > 0" class="space-y-3 max-h-96 overflow-y-auto">
      <div
        v-for="alert in alerts"
        :key="alert.alerta_id"
        class="p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md"
        :class="getAlertConfig(alert.prioridad).bgColor"
        :style="{ borderLeftColor: getAlertConfig(alert.prioridad).borderColor }"
      >
        <div class="flex items-start justify-between">
          <!-- Contenido -->
          <div class="flex-1 min-w-0 pr-4">
            <div class="flex items-center space-x-2 mb-1">
              <!-- Indicador de prioridad -->
              <div class="flex items-center">
                <svg
                  v-for="i in alert.prioridad"
                  :key="i"
                  class="w-3 h-3"
                  :class="alert.prioridad >= 4 ? 'text-red-500' : alert.prioridad >= 3 ? 'text-orange-500' : 'text-yellow-500'"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <!-- Tipo de alerta -->
              <span class="text-xs font-semibold text-gray-600 uppercase">
                {{ formatAlertType(alert.tipo_alerta) }}
              </span>
            </div>

            <h4 class="text-sm font-semibold text-gray-900 mb-1">
              {{ alert.titulo }}
            </h4>
            <p class="text-xs text-gray-700 mb-2">
              {{ alert.mensaje }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatDate(alert.fecha_creacion) }}
            </p>
          </div>

          <!-- Acciones -->
          <div class="flex flex-col space-y-2 flex-shrink-0">
            <button
              @click="handleResolve(alert.alerta_id)"
              class="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors"
              title="Resolver"
            >
              ✓ Resolver
            </button>
            <button
              @click="handleIgnore(alert.alerta_id)"
              class="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              title="Ignorar"
            >
              Ignorar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="text-center py-8">
      <svg class="w-12 h-12 mx-auto text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-gray-600 text-sm font-medium">No hay alertas pendientes</p>
      <p class="text-gray-500 text-xs mt-1">Todas las alertas han sido resueltas</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SystemAlert, AlertPriorityConfig } from '@/types/admin.types';

// Props
interface Props {
  alerts: SystemAlert[];
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false
});

// Emits
const emit = defineEmits<{
  resolve: [alertId: number];
  ignore: [alertId: number];
}>();

// Configuración de prioridad de alertas
const alertPriorityConfigs: Record<number, AlertPriorityConfig> = {
  5: {
    label: 'Crítica',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: '#dc2626'
  },
  4: {
    label: 'Alta',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: '#ea580c'
  },
  3: {
    label: 'Media',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: '#ca8a04'
  },
  2: {
    label: 'Baja',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: '#2563eb'
  },
  1: {
    label: 'Muy baja',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: '#6b7280'
  }
};

const getAlertConfig = (prioridad: number): AlertPriorityConfig => {
  return alertPriorityConfigs[prioridad] || alertPriorityConfigs[1];
};

// Formatear tipo de alerta
const formatAlertType = (tipo: string): string => {
  const tipos: Record<string, string> = {
    asistencia_baja: 'Asistencia',
    rendimiento_bajo: 'Rendimiento',
    riesgo_academico: 'Riesgo Académico',
    administrativo: 'Administrativo',
    sistema: 'Sistema'
  };
  return tipos[tipo] || tipo;
};

// Formatear fecha relativa
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-CL');
};

// Handlers
const handleResolve = (alertId: number) => {
  emit('resolve', alertId);
};

const handleIgnore = (alertId: number) => {
  emit('ignore', alertId);
};
</script>

<style scoped>
/* Scroll suave en la lista de alertas */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}
</style>
