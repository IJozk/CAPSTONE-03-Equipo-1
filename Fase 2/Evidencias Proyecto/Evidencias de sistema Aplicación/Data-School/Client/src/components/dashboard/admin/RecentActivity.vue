<template>
  <div class="bg-white rounded-xl shadow-md p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-900">Actividad Reciente</h2>
      <router-link
        to="/admin/activity"
        class="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
      >
        Ver todo
      </router-link>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="flex items-start space-x-3 animate-pulse">
        <div class="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div class="flex-1">
          <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Actividades -->
    <div v-else-if="activities.length > 0" class="space-y-4 max-h-96 overflow-y-auto">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
      >
        <!-- Ícono según tipo -->
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          :class="getActivityConfig(activity.tipo).bgColor"
        >
          <component
            :is="getIcon(getActivityConfig(activity.tipo).icon)"
            :class="getActivityConfig(activity.tipo).color"
          />
        </div>

        <!-- Información -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900">
            {{ activity.descripcion }}
          </p>
          <div class="flex items-center mt-1 text-xs text-gray-500">
            <span>{{ activity.usuario }}</span>
            <span class="mx-2">•</span>
            <span>{{ formatDate(activity.fecha) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="text-center py-8">
      <svg class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-gray-600 text-sm">No hay actividad reciente</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h } from 'vue';
import type { RecentActivity } from '@/types/admin.types';
import type { ActivityTypeConfig } from '@/types/admin.types';

// Props
interface Props {
  activities: RecentActivity[];
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false
});

// Configuración de tipos de actividad
const activityConfigs: Record<string, ActivityTypeConfig> = {
  usuario_creado: {
    icon: 'user-add',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  usuario_modificado: {
    icon: 'pencil',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  usuario_eliminado: {
    icon: 'trash',
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  curso_creado: {
    icon: 'academic-cap',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  curso_modificado: {
    icon: 'pencil',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  asignatura_creada: {
    icon: 'book-open',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  evento_creado: {
    icon: 'calendar',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100'
  },
  sistema: {
    icon: 'cog',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100'
  }
};

const getActivityConfig = (tipo: string): ActivityTypeConfig => {
  return activityConfigs[tipo] || activityConfigs.sistema;
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

// Función helper para obtener el componente SVG del ícono
const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    'user-add': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' })
      ])
    }),
    'pencil': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' })
      ])
    }),
    'trash': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' })
      ])
    }),
    'academic-cap': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 14l9-5-9-5-9 5 9 5z' }),
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' })
      ])
    }),
    'book-open': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' })
      ])
    }),
    'calendar': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' })
      ])
    }),
    'cog': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }),
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' })
      ])
    })
  };

  return icons[iconName] || icons['cog'];
};
</script>

<style scoped>
/* Scroll suave en la lista de actividades */
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
