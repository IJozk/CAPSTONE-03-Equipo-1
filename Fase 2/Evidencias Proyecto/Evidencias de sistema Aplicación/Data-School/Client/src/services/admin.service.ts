/**
 * admin.service.ts
 * Servicio para manejar las peticiones API del administrador
 *
 * Endpoints incluidos:
 * - Dashboard stats: estadísticas principales
 * - Actividad reciente: últimas acciones en el sistema
 * - Alertas del sistema: notificaciones pendientes
 * - Resumen de cursos: información de todos los cursos
 * - Stats rápidos: contadores para acciones rápidas
 * - Gestión de alertas: resolver/marcar alertas
 */

import apiClient from './api.config';
import type {
  DashboardStats,
  RecentActivity,
  SystemAlert,
  CourseSummary,
  QuickStats
} from '@/types/admin.types';

class AdminService {
  /**
   * Obtiene las estadísticas principales del dashboard
   * GET /api/admin/dashboard/stats
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/admin/dashboard/stats');
    return response.data;
  }

  /**
   * Obtiene la actividad reciente del sistema
   * GET /api/admin/recent-activity?limit={limit}
   * @param limit - Número máximo de actividades a retornar (default: 10)
   */
  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    const response = await apiClient.get<{ activities: RecentActivity[] }>(
      `/admin/recent-activity?limit=${limit}`
    );
    return response.data.activities;
  }

  /**
   * Obtiene las alertas del sistema según estado
   * GET /api/admin/alerts?status={status}
   * @param status - Estado de las alertas (pending, resolved, ignored)
   */
  async getSystemAlerts(status: string = 'pending'): Promise<SystemAlert[]> {
    const response = await apiClient.get<{ alerts: SystemAlert[] }>(
      `/admin/alerts?status=${status}`
    );
    return response.data.alerts;
  }

  /**
   * Obtiene el resumen de todos los cursos
   * GET /api/admin/courses/summary
   */
  async getCourseSummary(): Promise<CourseSummary[]> {
    const response = await apiClient.get<{ courses: CourseSummary[] }>(
      '/admin/courses/summary'
    );
    return response.data.courses;
  }

  /**
   * Obtiene estadísticas rápidas para accesos directos
   * GET /api/admin/quick-stats
   */
  async getQuickStats(): Promise<QuickStats> {
    const response = await apiClient.get<QuickStats>('/admin/quick-stats');
    return response.data;
  }

  /**
   * Marca una alerta como resuelta
   * POST /api/admin/alerts/:id/resolve
   * @param alertId - ID de la alerta a resolver
   */
  async resolveAlert(alertId: number): Promise<void> {
    await apiClient.post(`/admin/alerts/${alertId}/resolve`);
  }

  /**
   * Marca una alerta como ignorada
   * POST /api/admin/alerts/:id/ignore
   * @param alertId - ID de la alerta a ignorar
   */
  async ignoreAlert(alertId: number): Promise<void> {
    await apiClient.post(`/admin/alerts/${alertId}/ignore`);
  }

  /**
   * Obtiene todas las alertas sin filtro de estado
   * GET /api/admin/alerts
   */
  async getAllAlerts(): Promise<SystemAlert[]> {
    const response = await apiClient.get<{ alerts: SystemAlert[] }>('/admin/alerts');
    return response.data.alerts;
  }
}

// Exportar instancia única del servicio
export default new AdminService();
