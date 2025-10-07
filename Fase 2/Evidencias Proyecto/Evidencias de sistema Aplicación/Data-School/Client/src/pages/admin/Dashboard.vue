<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p class="text-gray-600 mt-1">Bienvenido, {{ adminName }}. Aquí está el resumen de tu colegio.</p>
        </div>
        <button
          @click="refreshDashboard"
          :disabled="loading"
          class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            class="w-5 h-5 transition-transform"
            :class="{ 'animate-spin': loading }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Actualizar
        </button>
      </div>

      <!-- Error Message -->
      <div
        v-if="error"
        class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start space-x-3"
      >
        <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-red-800">Error al cargar datos</h3>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
        </div>
        <button
          @click="adminStore.clearError()"
          class="text-red-600 hover:text-red-800 transition-colors"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <!-- Stats Overview -->
      <StatsOverview
        :stats="dashboardStats"
        :loading="loading"
      />

      <!-- Quick Actions -->
      <QuickActions />

      <!-- Main Grid: Activity + Alerts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Activity -->
        <RecentActivity
          :activities="recentActivity"
          :loading="loading"
        />

        <!-- System Alerts -->
        <SystemAlerts
          :alerts="systemAlerts"
          :loading="loading"
          @resolve="handleResolveAlert"
          @ignore="handleIgnoreAlert"
        />
      </div>

      <!-- Course Summary -->
      <CourseSummary
        :courses="courseSummary"
        :loading="loading"
      />
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useAdminStore } from '@/store/admin.store';
import { useAuthStore } from '@/store/auth.store';
import AdminLayout from '@/layouts/AdminLayout.vue';
import StatsOverview from '@/components/dashboard/admin/StatsOverview.vue';
import QuickActions from '@/components/dashboard/admin/QuickActions.vue';
import RecentActivity from '@/components/dashboard/admin/RecentActivity.vue';
import SystemAlerts from '@/components/dashboard/admin/SystemAlerts.vue';
import CourseSummary from '@/components/dashboard/admin/CourseSummary.vue';
import { useSchoolStore } from '@/store/school.store';

// Stores
const adminStore = useAdminStore();
const authStore = useAuthStore();
const schoolStore = useSchoolStore();

// Computed properties
const loading = computed(() => adminStore.loading);
const error = computed(() => adminStore.error);
const adminName = computed(() => authStore.userName || 'Administrador');
const dashboardStats = computed(() => adminStore.dashboardStats);
const recentActivity = computed(() => adminStore.recentActivity);
const systemAlerts = computed(() => adminStore.systemAlerts);
const courseSummary = computed(() => adminStore.courseSummary);

// Methods
const refreshDashboard = async () => {
  await adminStore.loadDashboardData();
};

const handleResolveAlert = async (alertId: number) => {
  try {
    await adminStore.resolveAlert(alertId);
    // Opcional: mostrar toast de éxito
    console.log(`Alerta ${alertId} resuelta exitosamente`);
  } catch (error) {
    console.error('Error al resolver alerta:', error);
    // Opcional: mostrar toast de error
  }
};

const handleIgnoreAlert = async (alertId: number) => {
  try {
    await adminStore.ignoreAlert(alertId);
    // Opcional: mostrar toast de éxito
    console.log(`Alerta ${alertId} ignorada exitosamente`);
  } catch (error) {
    console.error('Error al ignorar alerta:', error);
    // Opcional: mostrar toast de error
  }
};

// Lifecycle hooks
onMounted(async () => {
  // Cargar todos los datos del dashboard en paralelo
  await adminStore.loadDashboardData();
  await schoolStore.fetchSchoolInfo();
});
</script>
