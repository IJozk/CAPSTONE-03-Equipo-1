<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- Card 1: Mis Asignaturas -->
    <StatCard
      title="Mis Asignaturas"
      :value="teacherStore.totalSubjects"
      :subtitle="`${teacherStore.totalStudents} estudiantes en total`"
      icon="academic-cap"
      icon-color="text-blue-600"
      bg-gradient="from-blue-50 to-blue-100"
      :loading="teacherStore.loading"
    />

    <!-- Card 2: Evaluaciones Pendientes -->
    <StatCard
      title="Evaluaciones Pendientes"
      :value="teacherStore.pendingEvaluations"
      subtitle="Por revisar"
      icon="clipboard-check"
      icon-color="text-orange-600"
      bg-gradient="from-orange-50 to-orange-100"
      :loading="teacherStore.loading"
    />

    <!-- Card 3: Asistencia Hoy -->
    <StatCard
      title="Asistencia Hoy"
      :value="teacherStore.pendingAttendance"
      subtitle="Clases por registrar"
      icon="calendar-check"
      icon-color="text-green-600"
      bg-gradient="from-green-50 to-green-100"
      :loading="teacherStore.loading"
    />

    <!-- Card 4: Promedio General -->
    <StatCard
      title="Promedio General"
      :value="teacherStore.generalAverage?.toFixed(1) || '0.0'"
      subtitle="De todas las asignaturas"
      icon="chart-bar"
      icon-color="text-purple-600"
      bg-gradient="from-purple-50 to-purple-100"
      :loading="teacherStore.loading"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useTeacherStore } from '@/store/teacher.store';
import StatCard from './StatCard.vue';

const teacherStore = useTeacherStore();

onMounted(async () => {
  // Load dashboard data if not already loaded
  if (!teacherStore.dashboard) {
    await teacherStore.fetchDashboard();
  }
});
</script>
