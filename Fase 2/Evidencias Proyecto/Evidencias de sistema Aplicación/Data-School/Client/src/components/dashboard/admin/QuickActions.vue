<template>
  <div class="bg-white rounded-xl shadow-md p-6">
    <h2 class="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h2>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <router-link
        v-for="action in quickActions"
        :key="action.id"
        :to="action.route"
        class="group flex flex-col items-center justify-center p-4 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all duration-200 cursor-pointer"
        :class="action.color"
      >
        <!-- Ícono -->
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
          :class="action.iconBg"
        >
          <component :is="getIcon(action.icon)" :class="action.iconColor" />
        </div>

        <!-- Nombre -->
        <span class="text-sm font-semibold text-gray-900 text-center group-hover:text-primary-700 transition-colors">
          {{ action.name }}
        </span>

        <!-- Descripción (opcional, visible en hover) -->
        <span class="text-xs text-gray-500 text-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {{ action.description }}
        </span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h } from 'vue';
import type { QuickAction } from '@/types/admin.types';

// Definición de acciones rápidas
const quickActions: QuickAction[] = [
  {
    id: 'register-user',
    name: 'Registrar Usuario',
    description: 'Nuevo usuario',
    icon: 'user-add',
    route: '/register',
    color: 'bg-blue-50 hover:bg-blue-100',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100 group-hover:bg-blue-200'
  },
  {
    id: 'create-course',
    name: 'Crear Curso',
    description: 'Nuevo curso',
    icon: 'academic-cap',
    route: '/admin/courses',
    color: 'bg-purple-50 hover:bg-purple-100',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100 group-hover:bg-purple-200'
  },
  {
    id: 'new-subject',
    name: 'Nueva Asignatura',
    description: 'Crear asignatura',
    icon: 'book-open',
    route: '/admin/subjects',
    color: 'bg-green-50 hover:bg-green-100',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100 group-hover:bg-green-200'
  },
  {
    id: 'create-event',
    name: 'Crear Evento',
    description: 'Nuevo evento',
    icon: 'calendar',
    route: '/admin/events',
    color: 'bg-orange-50 hover:bg-orange-100',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100 group-hover:bg-orange-200'
  },
  {
    id: 'manage-workshops',
    name: 'Gestionar Talleres',
    description: 'Ver talleres',
    icon: 'puzzle',
    route: '/admin/workshops',
    color: 'bg-pink-50 hover:bg-pink-100',
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-100 group-hover:bg-pink-200'
  },
  {
    id: 'view-reports',
    name: 'Ver Reportes',
    description: 'Reportes',
    icon: 'document-report',
    route: '/admin/reports',
    color: 'bg-indigo-50 hover:bg-indigo-100',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-100 group-hover:bg-indigo-200'
  },
  {
    id: 'settings',
    name: 'Configuración',
    description: 'Ajustes',
    icon: 'cog',
    route: '/admin/settings',
    color: 'bg-gray-50 hover:bg-gray-100',
    iconColor: 'text-gray-600',
    iconBg: 'bg-gray-100 group-hover:bg-gray-200'
  },
  {
    id: 'users-list',
    name: 'Lista Usuarios',
    description: 'Ver todos',
    icon: 'users',
    route: '/admin/users',
    color: 'bg-teal-50 hover:bg-teal-100',
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-100 group-hover:bg-teal-200'
  }
];

// Función helper para obtener el componente SVG del ícono
const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    'user-add': defineComponent({
      render: () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' })
      ])
    }),
    'academic-cap': defineComponent({
      render: () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 14l9-5-9-5-9 5 9 5z' }),
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' })
      ])
    }),
    'book-open': defineComponent({
      render: () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' })
      ])
    }),
    'calendar': defineComponent({
      render: () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' })
      ])
    }),
    'puzzle': defineComponent({
      render: () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z' })
      ])
    }),
    'document-report': defineComponent({
      render: () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
      ])
    }),
    'cog': defineComponent({
      render: () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }),
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' })
      ])
    }),
    'users': defineComponent({
      render: () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })
      ])
    })
  };

  return icons[iconName] || icons['users'];
};
</script>
