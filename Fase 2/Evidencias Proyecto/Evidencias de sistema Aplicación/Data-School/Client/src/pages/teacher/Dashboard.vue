<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Welcome Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 class="text-2xl font-bold text-gray-900">
          Bienvenido, {{ teacherStore.teacherName || 'Profesor' }}
        </h1>
        <p class="text-gray-600 mt-1">
          {{ teacherStore.teacherSpecialty || 'Especialidad' }} · {{ currentDate }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="teacherStore.loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="mt-3 text-gray-600">Cargando datos del dashboard...</p>
      </div>

      <template v-else>
        <!-- Stats Overview -->
        <StatsOverview />

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column: Today's Classes (2/3) -->
          <div class="lg:col-span-2 space-y-6">
            <TodayClasses />
            <QuickActions />
          </div>

          <!-- Right Column: Upcoming Evaluations (1/3) -->
          <div class="lg:col-span-1">
            <UpcomingEvaluations />
          </div>
        </div>
      </template>

      <!-- Error Display -->
      <div v-if="teacherStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-sm text-red-800">{{ teacherStore.error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useTeacherStore } from '@/store/teacher.store';
import StatsOverview from '@/components/dashboard/teacher/StatsOverview.vue';
import TodayClasses from '@/components/dashboard/teacher/TodayClasses.vue';
import UpcomingEvaluations from '@/components/dashboard/teacher/UpcomingEvaluations.vue';
import QuickActions from '@/components/dashboard/teacher/QuickActions.vue';

const teacherStore = useTeacherStore();

// Fecha actual formateada
const currentDate = computed(() => {
  const today = new Date();
  return today.toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Cargar datos del dashboard al montar el componente
onMounted(async () => {
  try {
    console.log('🔄 Dashboard - Iniciando carga de datos...');
    
    // Asegurar que el store tenga los datos necesarios
    await teacherStore.loadDashboardData();

    console.log('✅ Dashboard - Datos cargados correctamente');
    console.log('📊 Clases hoy:', teacherStore.todayClasses?.length);
    console.log('📋 Evaluaciones próximas:', teacherStore.upcomingEvaluations?.length);
  } catch (error) {
    console.error('❌ Error loading dashboard:', error);
  }
});
</script>
