/**
 * admin.store.ts
 * Store Pinia para gestionar el estado del dashboard de administrador
 *
 * Estado gestionado:
 * - Estadísticas del dashboard
 * - Actividad reciente
 * - Alertas del sistema
 * - Resumen de cursos
 * - Estados de carga y errores
 *
 * Getters útiles:
 * - Contadores de totales
 * - Alertas filtradas por prioridad
 * - Indicadores de salud del sistema
 */

import { defineStore } from 'pinia';
import adminService from '@/services/admin.service';
import type { AdminState } from '@/types/admin.types';

export const useAdminStore = defineStore('admin', {
  state: (): AdminState => ({
    dashboardStats: null,
    recentActivity: [],
    systemAlerts: [],
    courseSummary: [],
    quickStats: null,
    loading: false,
    error: null
  }),

  getters: {
    // Getters de estadísticas principales
    totalUsuarios: (state): number => state.dashboardStats?.total_usuarios || 0,
    totalEstudiantes: (state): number => state.dashboardStats?.total_estudiantes || 0,
    totalProfesores: (state): number => state.dashboardStats?.total_profesores || 0,
    totalCursos: (state): number => state.dashboardStats?.total_cursos || 0,
    totalAsignaturas: (state): number => state.dashboardStats?.total_asignaturas || 0,
    estudiantesActivos: (state): number => state.dashboardStats?.estudiantes_activos || 0,
    asistenciaPromedio: (state): number => state.dashboardStats?.asistencia_promedio || 0,
    promedioGeneral: (state): number => state.dashboardStats?.promedio_general_colegio || 0,

    // Getter de alertas pendientes
    alertasPendientes: (state): number => {
      return state.systemAlerts.filter(a => a.estado === 'PENDIENTE').length;
    },

    // Alertas críticas (prioridad 4-5)
    alertasCriticas: (state) => {
      return state.systemAlerts.filter(a => a.prioridad >= 4 && a.estado === 'PENDIENTE');
    },

    // Alertas por prioridad
    alertasPorPrioridad: (state) => (prioridad: number) => {
      return state.systemAlerts.filter(
        a => a.prioridad === prioridad && a.estado === 'PENDIENTE'
      );
    },

    // Indicador de salud: asistencia
    saludAsistencia: (state): 'excelente' | 'buena' | 'regular' | 'critica' => {
      const asistencia = state.dashboardStats?.asistencia_promedio || 0;
      if (asistencia >= 95) return 'excelente';
      if (asistencia >= 90) return 'buena';
      if (asistencia >= 80) return 'regular';
      return 'critica';
    },

    // Indicador de salud: rendimiento académico
    saludRendimiento: (state): 'excelente' | 'buena' | 'regular' | 'critica' => {
      const promedio = state.dashboardStats?.promedio_general_colegio || 0;
      if (promedio >= 6.0) return 'excelente';
      if (promedio >= 5.5) return 'buena';
      if (promedio >= 5.0) return 'regular';
      return 'critica';
    },

    // Porcentaje de estudiantes activos
    porcentajeEstudiantesActivos: (state): number => {
      const total = state.dashboardStats?.total_estudiantes || 0;
      const activos = state.dashboardStats?.estudiantes_activos || 0;
      return total > 0 ? Math.round((activos / total) * 100) : 0;
    },

    // Cursos con capacidad completa
    cursosCompletos: (state) => {
      return state.courseSummary.filter(
        c => c.total_estudiantes >= c.capacidad_maxima
      );
    },

    // Cursos con baja ocupación (< 70%)
    cursosPocoOcupados: (state) => {
      return state.courseSummary.filter(
        c => (c.total_estudiantes / c.capacidad_maxima) < 0.7
      );
    },

    // Actividades recientes (últimas 5)
    actividadesRecientes: (state) => {
      return state.recentActivity.slice(0, 5);
    },

    // Hay datos cargados
    hasDashboardData: (state): boolean => {
      return state.dashboardStats !== null;
    }
  },

  actions: {
    /**
     * Cargar estadísticas del dashboard
     */
    async fetchDashboardStats() {
      this.loading = true;
      this.error = null;
      try {
        this.dashboardStats = await adminService.getDashboardStats();
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message || 'Error al cargar estadísticas';
        console.error('Error fetching dashboard stats:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cargar actividad reciente
     * @param limit - Número de actividades a cargar (default: 10)
     */
    async fetchRecentActivity(limit: number = 10) {
      this.error = null;
      try {
        this.recentActivity = await adminService.getRecentActivity(limit);
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message || 'Error al cargar actividad';
        console.error('Error fetching recent activity:', error);
      }
    },

    /**
     * Cargar alertas del sistema
     */
    async fetchSystemAlerts() {
      this.error = null;
      try {
        this.systemAlerts = await adminService.getSystemAlerts('pending');
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message || 'Error al cargar alertas';
        console.error('Error fetching system alerts:', error);
      }
    },

    /**
     * Cargar resumen de cursos
     */
    async fetchCourseSummary() {
      this.error = null;
      try {
        this.courseSummary = await adminService.getCourseSummary();
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message || 'Error al cargar cursos';
        console.error('Error fetching course summary:', error);
      }
    },

    /**
     * Cargar estadísticas rápidas
     */
    async fetchQuickStats() {
      this.error = null;
      try {
        this.quickStats = await adminService.getQuickStats();
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message || 'Error al cargar stats rápidos';
        console.error('Error fetching quick stats:', error);
      }
    },

    /**
     * Cargar todos los datos del dashboard en paralelo
     */
    async loadDashboardData() {
      this.loading = true;
      this.error = null;
      try {
        await Promise.all([
          this.fetchDashboardStats(),
          this.fetchRecentActivity(),
          this.fetchSystemAlerts(),
          this.fetchCourseSummary(),
          this.fetchQuickStats()
        ]);
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message || 'Error al cargar datos';
        console.error('Error loading dashboard data:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Resolver una alerta
     * @param alertId - ID de la alerta a resolver
     */
    async resolveAlert(alertId: number) {
      try {
        await adminService.resolveAlert(alertId);
        // Actualizar lista local eliminando la alerta resuelta
        this.systemAlerts = this.systemAlerts.filter(a => a.alerta_id !== alertId);
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message || 'Error al resolver alerta';
        console.error('Error resolving alert:', error);
        throw error;
      }
    },

    /**
     * Ignorar una alerta
     * @param alertId - ID de la alerta a ignorar
     */
    async ignoreAlert(alertId: number) {
      try {
        await adminService.ignoreAlert(alertId);
        // Actualizar lista local eliminando la alerta ignorada
        this.systemAlerts = this.systemAlerts.filter(a => a.alerta_id !== alertId);
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message || 'Error al ignorar alerta';
        console.error('Error ignoring alert:', error);
        throw error;
      }
    },

    /**
     * Limpiar el error
     */
    clearError() {
      this.error = null;
    },

    /**
     * Reiniciar el estado
     */
    resetState() {
      this.dashboardStats = null;
      this.recentActivity = [];
      this.systemAlerts = [];
      this.courseSummary = [];
      this.quickStats = null;
      this.loading = false;
      this.error = null;
    }
  }
});
