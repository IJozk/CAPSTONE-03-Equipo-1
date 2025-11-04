<template>
  <aside :class="['bg-white border-r border-gray-200 transition-all duration-300 flex flex-col', isSidebarOpen ? 'w-64' : 'w-0 md:w-20']">
    <!-- Logo -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <span v-if="isSidebarOpen" class="font-bold text-xl text-gray-900">Portal Estudiante</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto p-4">
      <div v-for="group in menuGroups" :key="group.title" class="mb-6">
        <h3 v-if="isSidebarOpen" class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{ group.title }}</h3>
        <ul class="space-y-1">
          <li v-for="item in group.items" :key="item.route">
            <router-link :to="item.route" :class="['flex items-center gap-3 px-3 py-2 rounded-lg transition-colors', isActive(item.route) ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-100']">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.iconPath" />
              </svg>
              <span v-if="isSidebarOpen">{{ item.name }}</span>
              <span v-if="item.badge && isSidebarOpen" class="ml-auto px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-600">{{ item.badge }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

    <!-- User Info -->
    <div class="p-4 border-t border-gray-200">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div v-if="isSidebarOpen" class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ studentName }}</p>
          <p class="text-xs text-gray-500 truncate">{{ studentCourse }}</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useStudentStore } from '@/store/student.store';

defineProps<{ isSidebarOpen: boolean }>();

const route = useRoute();
const studentStore = useStudentStore();

const studentName = computed(() => studentStore.profile?.estudiante?.nombre_completo || 'Estudiante');
const studentCourse = computed(() => studentStore.profile?.estudiante?.curso_actual?.nombre || 'Sin curso');

const menuGroups = computed(() => [
  {
    title: 'Principal',
    items: [
      { name: 'Inicio', route: '/student/dashboard', iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', badge: null }
    ]
  },
  {
    title: 'Académico',
    items: [
      { name: 'Mis Notas', route: '/student/grades', iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
      { name: 'Asistencia', route: '/student/attendance', iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { name: 'Horario', route: '/student/schedule', iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
    ]
  },
  {
    title: 'Comunicación',
    items: [
      { name: 'Notificaciones', route: '/student/notifications', iconPath: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', badge: studentStore.unreadNotifications || null },
      { name: 'Eventos', route: '/student/events', iconPath: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' }
    ]
  },
  {
    title: 'Mi Cuenta',
    items: [
      { name: 'Mi Perfil', route: '/student/profile', iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
      { name: 'Configuración', route: '/student/settings', iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
    ]
  }
]);

const isActive = (itemRoute: string): boolean => {
  return route.path === itemRoute || route.path.startsWith(itemRoute + '/');
};
</script>
