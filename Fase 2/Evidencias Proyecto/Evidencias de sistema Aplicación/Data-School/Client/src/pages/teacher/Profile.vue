<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header Card -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div class="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
          {{ teacherInitials }}
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          {{ teacherStore.teacherName || 'Profesor' }}
        </h1>
        <p class="text-gray-600 mb-4">{{ teacherStore.teacherSpecialty || 'Especialidad' }}</p>

        <div class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Perfil del Profesor - En construcción
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div class="text-3xl font-bold text-primary-600 mb-2">
            {{ teacherStore.totalSubjects }}
          </div>
          <div class="text-sm text-gray-600">Asignaturas</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div class="text-3xl font-bold text-green-600 mb-2">
            {{ teacherStore.totalStudents }}
          </div>
          <div class="text-sm text-gray-600">Estudiantes</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div class="text-3xl font-bold text-purple-600 mb-2">
            {{ teacherStore.generalAverage.toFixed(1) }}
          </div>
          <div class="text-sm text-gray-600">Promedio General</div>
        </div>
      </div>

      <!-- Info Card -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Información del Perfil</h2>
        <p class="text-gray-600">
          Esta sección está en construcción. Próximamente podrás ver y editar tu información personal,
          preferencias, historial académico y más.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTeacherStore } from '@/store/teacher.store';

const teacherStore = useTeacherStore();

const teacherInitials = computed(() => {
  const name = teacherStore.teacherName || 'P';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
});

onMounted(async () => {
  if (!teacherStore.dashboard) {
    await teacherStore.fetchDashboard();
  }
});
</script>
