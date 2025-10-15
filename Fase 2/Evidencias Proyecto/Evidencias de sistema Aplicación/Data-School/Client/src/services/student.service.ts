/**
 * Servicio API para gestión de estudiantes
 * Maneja todas las peticiones relacionadas con datos del estudiante
 */

import apiClient from './api.config';
import type { StudentProfile, AcademicSummary, UpcomingEvent } from '@/types/student.types';

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
   * @param limit - Número máximo de eventos a obtener (default: 4)
   * @returns Lista de próximos eventos
   */
  async getUpcomingEvents(limit: number = 4): Promise<{ events: UpcomingEvent[] }> {
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
   * Obtiene las notas del estudiante por asignatura
   * @returns Notas organizadas por asignatura
   */
  async getGrades(): Promise<any> {
    try {
      const response = await apiClient.get('/students/me/grades');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching grades:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener notas');
    }
  }

  /**
   * Obtiene el historial de asistencia del estudiante
   * @returns Historial de asistencia
   */
  async getAttendance(): Promise<any> {
    try {
      const response = await apiClient.get('/students/me/attendance');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener asistencia');
    }
  }
}

// Exportar instancia única del servicio
export default new StudentService();
