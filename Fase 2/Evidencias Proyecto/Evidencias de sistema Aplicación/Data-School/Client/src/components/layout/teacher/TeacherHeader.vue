<template>
  <header class="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 flex items-center justify-between px-6 shadow-sm">
    <!-- Left Section: Menu Toggle + Title + Breadcrumbs -->
    <div class="flex items-center space-x-4">
      <!-- Toggle Sidebar Button (Mobile) -->
      <button
        @click="emit('toggleSidebar')"
        class="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Page Title -->
      <div>
        <h1 class="text-xl font-bold text-gray-900">{{ pageTitle }}</h1>
        <!-- Breadcrumbs -->
        <nav class="flex items-center space-x-1 text-xs text-gray-500">
          <router-link to="/teacher/dashboard" class="hover:text-primary-600 transition-colors">
            Profesor
          </router-link>
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          <span class="text-gray-700 font-medium">{{ currentSection }}</span>
        </nav>
      </div>
    </div>

    <!-- Right Section: Date/Time + Notifications + User Menu -->
    <div class="flex items-center space-x-3">
      <!-- Date and Time Display -->
      <div class="hidden md:flex flex-col items-end text-sm mr-2">
        <div class="text-gray-700 font-medium">{{ currentTime }}</div>
        <div class="text-gray-500 text-xs">{{ currentDate }}</div>
      </div>

      <!-- Search Bar (Desktop) -->
      <div class="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 w-64">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar..."
          class="bg-transparent border-none outline-none ml-2 text-sm text-gray-700 placeholder-gray-400 w-full"
        />
      </div>

      <!-- Notifications Button -->
      <div class="relative">
        <button
          @click="toggleNotifications"
          class="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <!-- Badge de notificaciones -->
          <span
            v-if="alertasPendientes > 0"
            class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {{ alertasPendientes > 9 ? '9+' : alertasPendientes }}
          </span>
        </button>

        <!-- Dropdown de notificaciones -->
        <div
          v-if="showNotifications"
          v-click-outside="closeNotifications"
          class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-96 overflow-y-auto"
        >
          <div class="px-4 py-2 border-b border-gray-200">
            <h3 class="text-sm font-semibold text-gray-900">Notificaciones</h3>
          </div>

          <div v-if="alertasPendientes === 0" class="px-4 py-6 text-center text-gray-500 text-sm">
            No hay notificaciones pendientes
          </div>

          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="alert in recentAlerts"
              :key="alert.alerta_id"
              class="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <p class="text-sm font-medium text-gray-900">{{ alert.titulo }}</p>
              <p class="text-xs text-gray-600 mt-1">{{ alert.mensaje }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ formatDate(alert.fecha_creacion) }}</p>
            </div>
          </div>

          <div class="px-4 py-2 border-t border-gray-200">
            <router-link
              to="/teacher/alerts"
              class="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Ver todas las notificaciones
            </router-link>
          </div>
        </div>
      </div>

      <!-- Settings Button -->
      <button
        @click="router.push('/teacher/settings')"
        class="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <!-- User Menu -->
      <div class="relative">
        <button
          @click="toggleUserMenu"
          class="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <!-- Avatar -->
          <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {{ userInitials }}
          </div>
          <!-- User Info (Desktop) -->
          <div class="hidden xl:block text-left">
            <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
            <p class="text-xs text-gray-500">Profesor</p>
          </div>
          <!-- Chevron -->
          <svg
            class="w-4 h-4 text-gray-600 transition-transform"
            :class="{ 'rotate-180': showUserMenu }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Dropdown de usuario -->
        <div
          v-if="showUserMenu"
          v-click-outside="closeUserMenu"
          class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
        >
          <div class="px-4 py-3 border-b border-gray-200">
            <p class="text-sm font-semibold text-gray-900">{{ userName }}</p>
            <p class="text-xs text-gray-600">{{ userEmail }}</p>
          </div>

          <router-link
            to="/teacher/profile"
            class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            @click="closeUserMenu"
          >
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Ver Perfil</span>
          </router-link>

          <router-link
            to="/teacher/settings"
            class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            @click="closeUserMenu"
          >
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Configuración</span>
          </router-link>

          <div class="border-t border-gray-200 my-2"></div>

          <button
            @click="handleLogout"
            class="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
          >
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth.store';
import { useTeacherStore } from '@/store/teacher.store';

// Emits
const emit = defineEmits<{
  toggleSidebar: [];
}>();

// Router y stores
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const teacherStore = useTeacherStore();

// Estados locales
const showNotifications = ref(false);
const showUserMenu = ref(false);
const currentTime = ref('');
const currentDate = ref('');

// Timer para actualizar el reloj
let timeInterval: ReturnType<typeof setInterval> | null = null;

// Computed properties
const userName = computed(() => authStore.userName || 'Profesor');
const userEmail = computed(() => authStore.userEmail || 'profesor@dataschool.com');
const userInitials = computed(() => {
  const name = userName.value;
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
});

const alertasPendientes = computed(() => teacherStore.alertasPendientes);
const recentAlerts = computed(() => teacherStore.systemAlerts.slice(0, 5));

// Mapa de títulos de página
const pageTitles: Record<string, string> = {
  '/teacher/dashboard': 'Panel de Profesor',
  '/teacher/courses': 'Mis Cursos',
  '/teacher/students': 'Mis Estudiantes',
  '/teacher/grades': 'Calificaciones',
  '/teacher/attendance': 'Asistencia',
  '/teacher/calendar': 'Calendario',
  '/teacher/materials': 'Materiales',
  '/teacher/assignments': 'Tareas',
  '/teacher/evaluations': 'Evaluaciones',
  '/teacher/reports': 'Reportes',
  '/teacher/settings': 'Configuración',
  '/teacher/profile': 'Mi Perfil',
  '/teacher/alerts': 'Notificaciones'
};

const pageTitle = computed(() => {
  return pageTitles[route.path] || 'Panel de Profesor';
});

const currentSection = computed(() => {
  const path = route.path;
  const section = path.split('/').pop() || 'dashboard';
  return section.charAt(0).toUpperCase() + section.slice(1);
});

// Métodos
const updateDateTime = () => {
  const now = new Date();

  // Formato de hora: HH:MM:SS
  currentTime.value = now.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  // Formato de fecha: DD/MM/YYYY
  currentDate.value = now.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  showUserMenu.value = false;
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
  showNotifications.value = false;
};

const closeNotifications = () => {
  showNotifications.value = false;
};

const closeUserMenu = () => {
  showUserMenu.value = false;
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
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
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-CL');
};

// Lifecycle hooks
onMounted(() => {
  updateDateTime();
  timeInterval = setInterval(updateDateTime, 1000);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});

// Directiva click-outside
const vClickOutside = {
  mounted(el: HTMLElement, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value();
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', el.clickOutsideEvent);
  }
};
</script>
