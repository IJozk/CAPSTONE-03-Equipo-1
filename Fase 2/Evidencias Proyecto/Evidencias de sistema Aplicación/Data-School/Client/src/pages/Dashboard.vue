<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center">
            <!-- Logo -->
            <svg class="w-8 h-8 text-primary-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
            </svg>
            <h1 class="text-xl font-semibold text-gray-900">Dashboard - {{ authStore.user?.email }}</h1>
          </div>

          <div class="flex items-center gap-3">
            <!-- Botón de registro (solo para administradores) -->
            <router-link
              v-if="authStore.isAdmin"
              to="/register"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Registrar Usuario
            </router-link>

            <!-- User info -->
            <div class="hidden sm:block text-right">
              <p class="text-sm font-medium text-gray-900">{{ authStore.userName }}</p>
              <p class="text-xs text-gray-500">{{ authStore.userRole }}</p>
            </div>

            <!-- Logout button -->
            <button
              @click="handleLogout"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Card -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-2xl font-bold mb-4 text-gray-900">
          Bienvenido a Data School
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="border-l-4 border-primary-500 pl-4">
            <p class="text-sm text-gray-600 font-medium">Nombre</p>
            <p class="text-lg font-semibold text-gray-900">{{ authStore.userName }}</p>
          </div>
          <div class="border-l-4 border-primary-500 pl-4">
            <p class="text-sm text-gray-600 font-medium">Rol</p>
            <p class="text-lg font-semibold text-gray-900">{{ authStore.user?.role }}</p>
          </div>
          <div class="border-l-4 border-primary-500 pl-4">
            <p class="text-sm text-gray-600 font-medium">Email</p>
            <p class="text-lg font-semibold text-gray-900">{{ authStore.user?.email }}</p>
          </div>
          <div class="border-l-4 border-primary-500 pl-4">
            <p class="text-sm text-gray-600 font-medium">ID Usuario</p>
            <p class="text-lg font-semibold text-gray-900 font-mono text-sm">{{ authStore.user?.id }}</p>
          </div>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Card 1 -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-primary-100 rounded-lg p-3">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Estado del Perfil</p>
              <p class="text-lg font-semibold text-gray-900">
                {{ authStore.user?.profile_completed ? 'Completo' : 'Incompleto' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Sesión Activa</p>
              <p class="text-lg font-semibold text-gray-900">Conectado</p>
            </div>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Colegio ID</p>
              <p class="text-lg font-semibold text-gray-900">
                {{ schoolStore.schoolInfo?.colegio_id || 'No asignado' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Info message para admin -->
      <div v-if="authStore.isAdmin" class="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-primary-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <div>
            <p class="text-sm font-medium text-primary-900">
              Panel de Administrador
            </p>
            <p class="text-sm text-primary-700 mt-1">
              Como administrador, puedes registrar nuevos usuarios desde el botón "Registrar Usuario" en la barra superior.
            </p>
          </div>
        </div>
      </div>

      <!-- Info message general -->
      <div v-else class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <div>
            <p class="text-sm font-medium text-blue-900">
              Dashboard en desarrollo
            </p>
            <p class="text-sm text-blue-700 mt-1">
              Esta es una vista de prueba del dashboard. Las funcionalidades específicas para cada rol se implementarán posteriormente.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth.store';
import { useSchoolStore } from '@/store/school.store';
import { onMounted } from 'vue';

const router = useRouter();
const authStore = useAuthStore();
const schoolStore = useSchoolStore();

/**
 * Manejar logout: cerrar sesión y redirigir a login
 */
const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

onMounted(async () => {
  // Si no está autenticado, redirigir a login
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  // Cargar información del colegio si el usuario tiene un colegio asignado
  if (!schoolStore.schoolInfo) {
    await schoolStore.fetchSchoolInfo();
  }
});

</script>
