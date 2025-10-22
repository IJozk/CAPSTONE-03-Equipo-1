import apiClient from './api.config';
import type { Subject } from '@/types/student.types';

class GradesService {
  /**
   * Obtiene todas las notas del estudiante organizadas por asignatura
   * GET /api/students/me/grades
   */
  async getGrades(): Promise<Subject[]> {
    try {
      const response = await apiClient.get<{ grades: Subject[] }>('/students/me/grades');
      return response.data.grades;
    } catch (error: any) {
      console.error('Error fetching grades:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener notas');
    }
  }

  /**
   * Obtiene las notas de una asignatura específica
   * GET /api/students/me/grades/:asignaturaId
   */
  async getGradesBySubject(asignaturaId: string): Promise<Subject> {
    try {
      const response = await apiClient.get<{ subject: Subject }>(`/students/me/grades/${asignaturaId}`);
      return response.data.subject;
    } catch (error: any) {
      console.error('Error fetching subject grades:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener notas de la asignatura');
    }
  }
}

export default new GradesService();
