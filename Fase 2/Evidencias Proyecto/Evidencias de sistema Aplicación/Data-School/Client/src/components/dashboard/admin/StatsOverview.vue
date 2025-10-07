<template>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
    <!-- Card 1: Total Usuarios -->
    <StatCard
      title="Total Usuarios"
      :value="stats?.total_usuarios || 0"
      :loading="loading"
      icon="users"
      iconColor="text-blue-600"
      bgGradient="from-blue-50 to-blue-100"
      :subtitle="`${stats?.usuarios_nuevos_mes || 0} nuevos este mes`"
      :trend="stats?.usuarios_nuevos_mes || 0"
    />

    <!-- Card 2: Estudiantes Activos -->
    <StatCard
      title="Estudiantes Activos"
      :value="stats?.estudiantes_activos || 0"
      :loading="loading"
      icon="user-circle"
      iconColor="text-green-600"
      bgGradient="from-green-50 to-green-100"
      :subtitle="`${porcentajeActivos}% del total`"
      :trend="porcentajeActivos >= 90 ? 5 : porcentajeActivos >= 80 ? 0 : -5"
    />

    <!-- Card 3: Cursos Activos -->
    <StatCard
      title="Cursos Activos"
      :value="stats?.total_cursos || 0"
      :loading="loading"
      icon="academic-cap"
      iconColor="text-purple-600"
      bgGradient="from-purple-50 to-purple-100"
      :subtitle="`${stats?.total_asignaturas || 0} asignaturas`"
    />

    <!-- Card 4: Promedio General -->
    <StatCard
      title="Promedio General"
      :value="promedioFormatted"
      :loading="loading"
      icon="chart-bar"
      iconColor="text-orange-600"
      bgGradient="from-orange-50 to-orange-100"
      :subtitle="`${asistenciaFormatted}% asistencia`"
      :trend="(stats?.promedio_general_colegio || 0) >= 6.0 ? 5 : 0"
      :isDecimal="true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DashboardStats } from '@/types/admin.types';
import StatCard from './StatCard.vue';

// Props
interface Props {
  stats: DashboardStats | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

// Computed properties
const porcentajeActivos = computed(() => {
  const total = props.stats?.total_estudiantes || 0;
  const activos = props.stats?.estudiantes_activos || 0;
  return total > 0 ? Math.round((activos / total) * 100) : 0;
});

const promedioFormatted = computed(() => {
  const promedio = props.stats?.promedio_general_colegio || 0;
  return promedio.toFixed(1);
});

const asistenciaFormatted = computed(() => {
  const asistencia = props.stats?.asistencia_promedio || 0;
  return asistencia.toFixed(1);
});
</script>
