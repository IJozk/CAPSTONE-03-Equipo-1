/**
 * Servicio API para gestión de anuncios y noticias
 * Maneja todas las peticiones relacionadas con comunicados del colegio
 */

import apiClient from './api.config';
import type { Announcement } from '@/types/announcement.types';

class AnnouncementService {
  /**
   * Obtiene los anuncios más recientes
   * @param limit - Número máximo de anuncios a obtener (default: 5)
   * @returns Lista de anuncios recientes
   */
  async getRecent(limit: number = 5): Promise<Announcement[]> {
    try {
      const response = await apiClient.get<{ announcements: Announcement[] }>(
        `/announcements?limit=${limit}`
      );
      return response.data.announcements;
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener anuncios');
    }
  }

  /**
   * Obtiene todos los anuncios (con paginación opcional)
   * @param page - Número de página (default: 1)
   * @param limit - Cantidad por página (default: 10)
   * @returns Lista de anuncios paginada
   */
  async getAll(page: number = 1, limit: number = 10): Promise<any> {
    try {
      const response = await apiClient.get(`/announcements?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching all announcements:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener todos los anuncios');
    }
  }

  /**
   * Obtiene un anuncio específico por ID
   * @param id - ID del anuncio
   * @returns Anuncio completo
   */
  async getById(id: number): Promise<Announcement> {
    try {
      const response = await apiClient.get<Announcement>(`/announcements/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching announcement:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener anuncio');
    }
  }

  /**
   * Marca un anuncio como leído
   * @param id - ID del anuncio
   */
  async markAsRead(id: number): Promise<void> {
    try {
      await apiClient.post(`/announcements/${id}/read`);
    } catch (error: any) {
      console.error('Error marking announcement as read:', error);
      throw new Error(error.response?.data?.message || 'Error al marcar como leído');
    }
  }

  /**
   * Obtiene anuncios por tipo
   * @param tipo - Tipo de anuncio (reunion, inscripcion, etc.)
   * @param limit - Número máximo de resultados
   * @returns Lista de anuncios del tipo especificado
   */
  async getByType(tipo: string, limit: number = 10): Promise<Announcement[]> {
    try {
      const response = await apiClient.get<{ announcements: Announcement[] }>(
        `/announcements?tipo=${tipo}&limit=${limit}`
      );
      return response.data.announcements;
    } catch (error: any) {
      console.error('Error fetching announcements by type:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener anuncios por tipo');
    }
  }
}

// Exportar instancia única del servicio
export default new AnnouncementService();
