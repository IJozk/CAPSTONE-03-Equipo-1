<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <nav class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center gap-8">
            <!-- Logo -->
            <div class="flex items-center">
              <svg class="w-8 h-8 text-primary-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
              </svg>
              <h1 class="text-xl font-bold text-primary-700">Data School</h1>
            </div>

            <!-- Navigation Links -->
            <div class="hidden md:flex gap-4">
              <router-link
                to="/dashboard"
                class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md transition-colors"
                active-class="text-primary-600 font-medium"
              >
                Dashboard
              </router-link>

              <router-link
                v-if="authStore.isAdmin"
                to="/register"
                class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md transition-colors"
                active-class="text-primary-600 font-medium"
              >
                Usuarios
              </router-link>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <!-- User info -->
            <div class="hidden md:block text-right mr-3">
              <p class="text-sm font-medium text-gray-900">{{ authStore.userName }}</p>
              <p class="text-xs text-gray-500">{{ authStore.userRole }}</p>
            </div>

            <!-- Logout button -->
            <button
              @click="handleLogout"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>
