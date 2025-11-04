import apiClient from './api.config';
import type { Notification } from '@/types/student.types';

class NotificationsService {
  /**
   * Obtiene todas las notificaciones del estudiante
   * GET /api/students/me/notifications
   */
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await apiClient.get<{ notifications: Notification[] }>('/students/me/notifications');
      return response.data.notifications;
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener notificaciones');
    }
  }

  /**
   * Marca una notificación como leída
   * PUT /api/students/me/notifications/:id/read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await apiClient.put(`/students/me/notifications/${notificationId}/read`);
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      throw new Error(error.response?.data?.message || 'Error al marcar notificación como leída');
    }
  }

  /**
   * Marca todas las notificaciones como leídas
   * PUT /api/students/me/notifications/read-all
   */
  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.put('/students/me/notifications/read-all');
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      throw new Error(error.response?.data?.message || 'Error al marcar todas las notificaciones como leídas');
    }
  }

  /**
   * Elimina una notificación
   * DELETE /api/students/me/notifications/:id
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await apiClient.delete(`/students/me/notifications/${notificationId}`);
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar notificación');
    }
  }
}

export default new NotificationsService();
