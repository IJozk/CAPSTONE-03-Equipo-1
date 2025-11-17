/**
 * Servicio para gestión de horarios
 * Maneja todas las peticiones relacionadas con horarios de estudiantes
 */

import apiClient from './api.config';

export interface HorarioSlot {
  horario_id: number;
  asignatura_id: string;
  dia_semana: number; // 1=Lunes, 2=Martes, ..., 7=Domingo
  hora_inicio: string;
  hora_termino: string;
  periodo: string;
  sala_id: string | null;
  asignatura: {
    asignatura_id: string;
    nombre: string;
    codigo: string;
    profesor_id: string;
  };
  sala: {
    sala_id: string;
    nombre: string;
  } | null;
  profesor: {
    profesor_id: string;
    nombre_completo: string;
  };
}

export interface HorarioEstudiante {
  asignatura: string;
  dia_semana: number;
  hora_inicio: string;
  hora_termino: string;
  nombre_dia: string;
  profesor: string;
  sala: string;
}

class HorarioService {
  /**
   * Obtiene el horario semanal de un curso
   * @param cursoId - ID del curso
   * @param periodo - Período académico (ej: "2025-1")
   * @returns Horario semanal del curso
   */
  async getHorarioCurso(cursoId: string, periodo?: string): Promise<HorarioSlot[]> {
    try {
      const params = periodo ? { periodo } : {};
      const response = await apiClient.get<HorarioSlot[]>(
        `/horarios/curso/${cursoId}`,
        { params }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching course schedule:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener horario del curso');
    }
  }

  /**
   * Obtiene todos los horarios con filtros opcionales
   * @param params - Parámetros de filtrado
   * @returns Lista de horarios
   */
  async getAll(params?: {
    asignatura_id?: string;
    periodo?: string;
    dia_semana?: number;
  }): Promise<HorarioSlot[]> {
    try {
      const response = await apiClient.get<HorarioSlot[]>('/horarios', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching schedules:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener horarios');
    }
  }

  /**
   * Obtiene un horario por ID
   * @param id - ID del horario
   * @returns Datos del horario
   */
  async getById(id: number): Promise<HorarioSlot> {
    try {
      const response = await apiClient.get<HorarioSlot>(`/horarios/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching schedule:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener horario');
    }
  }
}

// Exportar instancia única del servicio
export default new HorarioService();
