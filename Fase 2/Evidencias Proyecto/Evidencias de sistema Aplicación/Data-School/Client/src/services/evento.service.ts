/**
 * Servicio para gestión de eventos
 * Maneja todas las peticiones relacionadas con eventos escolares
 */

import apiClient from './api.config';

export interface Evento {
  evento_id: number;
  nombre: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  lugar: string | null;
  creado_por: string | null;
  modificado_por: string | null;
  modificado_en: string | null;
}

export interface EventoConDetalles extends Evento {
  tipo: 'EVENTO' | 'EVALUACION' | 'REUNION' | 'ACTIVIDAD' | 'OTRO';
  titulo: string;
  descripcion: string;
  fecha: string;
  asignatura?: string;
}

class EventoService {
  /**
   * Obtiene todos los eventos
   * @returns Lista de eventos
   */
  async getAll(): Promise<Evento[]> {
    try {
      const response = await apiClient.get<Evento[]>('/eventos');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching events:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener eventos');
    }
  }

  /**
   * Obtiene un evento por ID
   * @param id - ID del evento
   * @returns Datos del evento
   */
  async getById(id: number): Promise<Evento> {
    try {
      const response = await apiClient.get<Evento>(`/eventos/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching event:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener evento');
    }
  }

  /**
   * Crea un nuevo evento
   * @param data - Datos del evento
   * @returns Evento creado
   */
  async create(data: Partial<Evento>): Promise<Evento> {
    try {
      const response = await apiClient.post<Evento>('/eventos', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating event:', error);
      throw new Error(error.response?.data?.message || 'Error al crear evento');
    }
  }

  /**
   * Actualiza un evento
   * @param id - ID del evento
   * @param data - Datos a actualizar
   * @returns Evento actualizado
   */
  async update(id: number, data: Partial<Evento>): Promise<Evento> {
    try {
      const response = await apiClient.put<Evento>(`/eventos/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating event:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar evento');
    }
  }

  /**
   * Elimina un evento
   * @param id - ID del evento
   */
  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/eventos/${id}`);
    } catch (error: any) {
      console.error('Error deleting event:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar evento');
    }
  }

  /**
   * Obtiene eventos combinados con evaluaciones próximas
   * Combina eventos del sistema con evaluaciones programadas
   * @param estudianteId - ID del estudiante
   * @returns Lista combinada de eventos y evaluaciones
   */
  async getEventosEstudiante(estudianteId: string): Promise<EventoConDetalles[]> {
    try {
      // Por ahora solo obtenemos eventos generales
      // En el futuro se pueden combinar con evaluaciones
      const eventos = await this.getAll();

      return eventos.map(evento => ({
        ...evento,
        tipo: 'EVENTO' as const,
        titulo: evento.nombre || 'Sin título',
        descripcion: `Evento en ${evento.lugar || 'ubicación por definir'}`,
        fecha: evento.fecha_inicio || new Date().toISOString()
      }));
    } catch (error: any) {
      console.error('Error fetching student events:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener eventos del estudiante');
    }
  }
}

// Exportar instancia única del servicio
export default new EventoService();
