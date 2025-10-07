<template>
  <div
    class="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 bg-gradient-to-br"
    :class="bgGradient"
  >
    <!-- Loading skeleton -->
    <div v-if="loading" class="animate-pulse">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
          <div class="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div class="h-3 bg-gray-300 rounded w-2/3"></div>
        </div>
        <div class="w-12 h-12 bg-gray-300 rounded-full"></div>
      </div>
    </div>

    <!-- Contenido real -->
    <div v-else class="flex items-start justify-between">
      <!-- Información -->
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-600 mb-1">{{ title }}</p>
        <h3 class="text-3xl font-bold text-gray-900 mb-2">
          {{ formatValue(value) }}
        </h3>
        <p class="text-sm text-gray-600 flex items-center">
          <!-- Indicador de tendencia (opcional) -->
          <span v-if="trend !== undefined && trend !== null" class="mr-2">
            <svg
              v-if="trend > 0"
              class="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <svg
              v-else-if="trend < 0"
              class="w-4 h-4 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
            <svg
              v-else
              class="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />
            </svg>
          </span>
          {{ subtitle }}
        </p>
      </div>

      <!-- Ícono -->
      <div
        class="w-14 h-14 rounded-full flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm shadow-lg"
      >
        <component :is="getIcon(icon)" :class="iconColor" />
      </div>
    </div>

    <!-- Efecto decorativo de fondo -->
    <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white bg-opacity-10 rounded-full blur-2xl"></div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h } from 'vue';

// Props
interface Props {
  title: string;
  value: number | string;
  icon: string;
  iconColor: string;
  bgGradient: string;
  subtitle?: string;
  trend?: number | null;
  loading?: boolean;
  isDecimal?: boolean;
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
  trend: null,
  loading: false,
  isDecimal: false
});

// Formatear valor
const formatValue = (val: number | string): string => {
  if (typeof val === 'string') return val;
  return val.toLocaleString('es-CL');
};

// Función helper para obtener el componente SVG del ícono
const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    'users': defineComponent({
      render: () => h('svg', { class: 'w-7 h-7', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })
      ])
    }),
    'user-circle': defineComponent({
      render: () => h('svg', { class: 'w-7 h-7', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' })
      ])
    }),
    'academic-cap': defineComponent({
      render: () => h('svg', { class: 'w-7 h-7', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 14l9-5-9-5-9 5 9 5z' }),
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' })
      ])
    }),
    'chart-bar': defineComponent({
      render: () => h('svg', { class: 'w-7 h-7', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })
      ])
    })
  };

  return icons[iconName] || icons['users'];
};
</script>
