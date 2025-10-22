/**
 * Servicio API para gestión de estudiantes
 * Maneja todas las peticiones relacionadas con datos del estudiante
 */

import apiClient from './api.config';
import type { StudentProfile, AcademicSummary, UpcomingEvent, ScheduleSlot } from '@/types/student.types';

class StudentService {
  /**
   * Obtiene el perfil completo del estudiante autenticado
   * @returns Perfil del estudiante con datos del tutor
   */
  async getProfile(): Promise<StudentProfile> {
    try {
      const response = await apiClient.get<StudentProfile>('/students/me');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching student profile:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener perfil del estudiante');
    }
  }

  /**
   * Obtiene el resumen académico del estudiante (promedio, asistencia, etc.)
   * @returns Resumen académico con promedios y asistencia
   */
  async getAcademicSummary(): Promise<AcademicSummary> {
    try {
      const response = await apiClient.get<AcademicSummary>('/students/me/academic-summary');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching academic summary:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener resumen académico');
    }
  }

  /**
   * Obtiene los próximos eventos del estudiante (tareas, exámenes, etc.)
   * @param limit - Número máximo de eventos a obtener (default: 5)
   * @returns Lista de próximos eventos
   */
  async getUpcomingEvents(limit: number = 5): Promise<{ events: UpcomingEvent[] }> {
    try {
      const response = await apiClient.get<{ events: UpcomingEvent[] }>(
        `/students/me/upcoming-events?limit=${limit}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching upcoming events:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener próximos eventos');
    }
  }

  /**
   * Obtiene el horario semanal del estudiante
   * @returns Horario semanal
   */
  async getSchedule(): Promise<ScheduleSlot[]> {
    try {
      const response = await apiClient.get<{ schedule: ScheduleSlot[] }>('/students/me/schedule');
      return response.data.schedule;
    } catch (error: any) {
      console.error('Error fetching schedule:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener horario');
    }
  }

  /**
   * Actualiza el perfil del estudiante
   * @param data - Datos a actualizar
   * @returns Perfil actualizado
   */
  async updateProfile(data: Partial<StudentProfile>): Promise<StudentProfile> {
    try {
      const response = await apiClient.put<StudentProfile>('/students/me', data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar perfil');
    }
  }
}

// Exportar instancia única del servicio
export default new StudentService();
