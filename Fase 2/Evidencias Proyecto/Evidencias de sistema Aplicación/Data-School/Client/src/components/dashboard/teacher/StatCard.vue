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
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
  loading: false
});

// Formatear valor
const formatValue = (val: number | string): string => {
  if (typeof val === 'string') return val;
  return val.toLocaleString('es-CL');
};

// Función helper para obtener el componente SVG del ícono
const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    'academic-cap': defineComponent({
      render: () => h('svg', { class: 'w-7 h-7', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 14l9-5-9-5-9 5 9 5z' }),
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' })
      ])
    }),
    'clipboard-check': defineComponent({
      render: () => h('svg', { class: 'w-7 h-7', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' })
      ])
    }),
    'calendar-check': defineComponent({
      render: () => h('svg', { class: 'w-7 h-7', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }),
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4' })
      ])
    }),
    'chart-bar': defineComponent({
      render: () => h('svg', { class: 'w-7 h-7', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })
      ])
    })
  };

  return icons[iconName] || icons['academic-cap'];
};
</script>
