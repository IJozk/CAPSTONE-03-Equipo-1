<template>
  <header class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Toggle Sidebar -->
      <button @click="emit('toggleSidebar')" class="lg:hidden p-2 rounded-lg hover:bg-gray-100">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Search (opcional) -->
      <div class="hidden md:block flex-1 max-w-2xl mx-6">
        <div class="relative">
          <input type="text" placeholder="Buscar..." class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-4">
        <!-- Notifications -->
        <router-link to="/student/notifications" class="relative p-2 rounded-lg hover:bg-gray-100">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full text-xs text-white flex items-center justify-center">{{ unreadCount }}</span>
        </router-link>

        <!-- Logout -->
        <button @click="handleLogout" class="px-4 py-2 text-sm text-gray-700 hover:text-gray-900">
          Cerrar Sesión
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth.store';
import { useStudentStore } from '@/store/student.store';

const emit = defineEmits<{ toggleSidebar: [] }>();

const router = useRouter();
const authStore = useAuthStore();
const studentStore = useStudentStore();

const unreadCount = computed(() => studentStore.unreadNotifications);

const handleLogout = async () => {
  try {
    // Limpiar store de estudiante
    studentStore.resetState();
    // Ejecutar logout del authStore
    await authStore.logout();
    // Redirigir al login
    await router.push('/login');
  } catch (error) {
    console.error('Error during logout:', error);
    // Forzar redirección incluso si hay error
    await router.push('/login');
  }
};
</script>
