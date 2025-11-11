<template>
  <aside
    class="w-72 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-30 transition-transform duration-300"
    :class="{ '-translate-x-full': !isSidebarOpen }"
  >
    <!-- Logo y Título -->
    <div class="flex items-center justify-between px-6 py-5 border-b border-gray-200">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-lg">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-900">DataSchool</h2>
          <p class="text-xs text-gray-500">Administración</p>
        </div>
      </div>
    </div>

    <!-- Navegación Principal -->
    <nav class="flex-1 overflow-y-auto py-4 px-3">
      <div v-for="(group, index) in menuGroups" :key="index" class="mb-6">
        <!-- Título del grupo -->
        <h3 class="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {{ group.title }}
        </h3>

        <!-- Items del grupo -->
        <ul class="space-y-1">
          <li v-for="item in group.items" :key="item.route">
            <router-link
              :to="item.route"
              class="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group"
              :class="isActive(item.route)
                ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600 pl-2.5'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
            >
              <div class="flex items-center space-x-3">
                <!-- Icono -->
                <component :is="getIcon(item.icon)"
                  class="w-5 h-5 transition-colors"
                  :class="isActive(item.route) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'"
                />

                <!-- Nombre -->
                <span class="text-sm font-medium">{{ item.name }}</span>
              </div>

              <!-- Badge (si existe) -->
              <span
                v-if="item.badge !== null && item.badge !== undefined"
                class="px-2 py-0.5 text-xs font-semibold rounded-full"
                :class="isActive(item.route)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700'"
              >
                {{ item.badge }}
              </span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Footer con botón de logout -->
    <div class="p-4 border-t border-gray-200 bg-gray-50">
      <button
        @click="handleLogout"
        class="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>Cerrar Sesión</span>
      </button>
    </div>
  </aside>

  <!-- Overlay para mobile -->
  <div
    v-if="isSidebarOpen"
    @click="closeSidebar"
    class="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
  />
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth.store';
import { useAdminStore } from '@/store/admin.store';
import type { MenuGroup } from '@/types/admin.types';

// Props
interface Props {
  isSidebarOpen?: boolean;
}

withDefaults(defineProps<Props>(), {
  isSidebarOpen: true
});

// Emits
const emit = defineEmits<{
  closeSidebar: [];
}>();

// Router y stores
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const adminStore = useAdminStore();

// Número de alertas pendientes para el badge
const alertasPendientes = computed(() => adminStore.alertasPendientes);

// Definición de grupos del menú
const menuGroups = computed<MenuGroup[]>(() => [
  {
    title: 'Panel Principal',
    items: [
      {
        name: 'Dashboard',
        icon: 'view-grid',
        route: '/admin/dashboard',
        badge: null
      }
    ]
  },
  {
    title: 'Gestión Académica',
    items: [
      { name: 'Cursos', icon: 'academic-cap', route: '/admin/courses' },
      { name: 'Asignaturas', icon: 'book-open', route: '/admin/subjects' },
      { name: 'Horarios', icon: 'clock', route: '/admin/schedules' },
      { name: 'Calendario', icon: 'calendar', route: '/admin/calendar' },
      { name: 'Talleres', icon: 'puzzle', route: '/admin/workshops' },
      { name: 'Eventos', icon: 'calendar-event', route: '/admin/events' },
      { name: 'Encuestas', icon: 'clipboard-list', route: '/admin/surveys' }
    ]
  },
  {
    title: 'Gestión de Usuarios',
    items: [
      { name: 'Usuarios', icon: 'users', route: '/admin/users' },
      { name: 'Profesores', icon: 'user-group', route: '/admin/teachers' },
      { name: 'Estudiantes', icon: 'user-circle', route: '/admin/students' },
      { name: 'Administrativos', icon: 'briefcase', route: '/admin/administrativos' }
    ]
  },
  {
    title: 'Análisis y Reportes',
    items: [
      { name: 'Dashboards', icon: 'chart-bar', route: '/admin/analytics' },
      { name: 'Reportes', icon: 'document-report', route: '/admin/reports' },
      { name: 'KPIs', icon: 'trending-up', route: '/admin/kpis' }
    ]
  },
  {
    title: 'Configuración',
    items: [
      { name: 'Configuración', icon: 'cog', route: '/admin/settings' },
      { name: 'Mi Perfil', icon: 'user', route: '/admin/profile' }
    ]
  }
]);

// Verificar si una ruta está activa
const isActive = (itemRoute: string): boolean => {
  return route.path === itemRoute || route.path.startsWith(itemRoute + '/');
};

// Cerrar sidebar en mobile
const closeSidebar = () => {
  emit('closeSidebar');
};

// Logout
const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

// Función helper para obtener el componente SVG del ícono
const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    'view-grid': defineComponent({
      render: () => h('svg', {
        class: 'w-5 h-5',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      }, [
        h('path', {
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'stroke-width': '2',
          d: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
        })
      ])
    }),
    'academic-cap': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 14l9-5-9-5-9 5 9 5z' }),
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' }),
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222' })
      ])
    }),
    'book-open': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' })
      ])
    }),
    'clock': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' })
      ])
    }),
    'calendar': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' })
      ])
    }),
    'calendar-event': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }),
        h('circle', { cx: '12', cy: '13', r: '2', fill: 'currentColor' })
      ])
    }),
    'puzzle': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z' })
      ])
    }),
    'users': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })
      ])
    }),
    'user-group': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' })
      ])
    }),
    'user-circle': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' })
      ])
    }),
    'chart-bar': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })
      ])
    }),
    'document-report': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
      ])
    }),
    'trending-up': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' })
      ])
    }),
    'cog': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }),
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' })
      ])
    }),
    'user': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
      ])
    }),
    'clipboard-list': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' })
      ])
    }),
    'briefcase': defineComponent({
      render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' })
      ])
    })
  };

  return icons[iconName] || icons['view-grid'];
};
</script>

<style scoped>
/* Scroll suave en la navegación */
nav {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}

nav::-webkit-scrollbar {
  width: 6px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

nav::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}
</style>
