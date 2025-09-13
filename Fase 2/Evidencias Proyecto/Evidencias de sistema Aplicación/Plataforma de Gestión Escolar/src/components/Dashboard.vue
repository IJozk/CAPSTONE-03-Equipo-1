<template>
  <div class="p-4 md:p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-foreground">
        Bienvenido, {{ authStore.user?.name }}
      </h1>
      <p class="text-muted-foreground mt-1">
        {{ getRoleDescription(authStore.user?.role) }}
      </p>
    </div>

    <!-- Coordinator Dashboard -->
    <div v-if="authStore.user?.role === 'coordinador'" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Estudiantes"
          :value="dashboardStats.totalStudents"
          icon="users"
          color="blue"
        />
        <StatCard
          title="Docentes"
          :value="dashboardStats.totalTeachers"
          icon="user-check"
          color="green"
        />
        <StatCard
          title="Asistencia Promedio"
          :value="`${dashboardStats.averageAttendance}%`"
          icon="calendar"
          color="yellow"
        />
        <StatCard
          title="Promedio General"
          :value="dashboardStats.averageGrades"
          icon="star"
          color="purple"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Asistencia por Curso" />
        <RecentActivity />
      </div>
    </div>

    <!-- Teacher Dashboard -->
    <div v-if="authStore.user?.role === 'docente'" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Mis Estudiantes"
          :value="dashboardStats.myStudents"
          icon="users"
          color="blue"
        />
        <StatCard
          title="Notas Pendientes"
          :value="dashboardStats.pendingGrades"
          icon="edit"
          color="orange"
        />
        <StatCard
          title="Promedio Curso"
          :value="dashboardStats.averageGrades"
          icon="star"
          color="green"
        />
        <StatCard
          title="Asistencia Hoy"
          :value="dashboardStats.todayAttendance"
          icon="calendar"
          color="purple"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions />
        <RecentGrades />
      </div>
    </div>

    <!-- Parent Dashboard -->
    <div v-if="authStore.user?.role === 'apoderado'" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Mis Hijos"
          :value="dashboardStats.children"
          icon="users"
          color="blue"
        />
        <StatCard
          title="Notificaciones"
          :value="dashboardStats.unreadNotifications"
          icon="bell"
          color="red"
        />
        <StatCard
          title="Eventos Próximos"
          :value="dashboardStats.upcomingEvents"
          icon="calendar"
          color="green"
        />
        <StatCard
          title="Últimas Notas"
          :value="dashboardStats.lastGrades"
          icon="star"
          color="yellow"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChildrenOverview />
        <RecentNotifications />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { mockDashboardStats } from '../data/mockData'
import StatCard from './ui/StatCard.vue'
import ChartCard from './ui/ChartCard.vue'
import RecentActivity from './ui/RecentActivity.vue'
import QuickActions from './ui/QuickActions.vue'
import RecentGrades from './ui/RecentGrades.vue'
import ChildrenOverview from './ui/ChildrenOverview.vue'
import RecentNotifications from './ui/RecentNotifications.vue'

const authStore = useAuthStore()

const dashboardStats = computed(() => {
  return mockDashboardStats[authStore.user?.role] || {}
})

const getRoleDescription = (role) => {
  const descriptions = {
    coordinador: 'Panel de administración y supervisión general',
    docente: 'Gestión de cursos y seguimiento académico',
    apoderado: 'Seguimiento del progreso de sus hijos'
  }
  return descriptions[role] || ''
}
</script>