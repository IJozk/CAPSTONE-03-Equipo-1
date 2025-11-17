/**
 * Servicio para gestión de asistencia
 * Maneja todas las peticiones relacionadas con asistencia de estudiantes
 */

import apiClient from './api.config';

export interface AsistenciaRecord {
  asistencia_id: number;
  estudiante_id: string;
  asignatura_id: string;
  fecha: string;
  presente: boolean;
  justificado: boolean;
  retraso_minutos: number | null;
  retiro_anticipado_minutos: number | null;
  observaciones: string | null;
  registrado_por: string | null;
  created_at: string;
  updated_at: string;
  Asignatura?: {
    asignatura_id: string;
    nombre: string;
    codigo: string;
  };
  Estudiante?: {
    estudiante_id: string;
    nombre_completo: string;
    rut: string;
  };
}

export interface ResumenAsistencia {
  total: number;
  presentes: number;
  ausentes: number;
  justificadas: number;
  retrasos: number;
  porcentaje_asistencia: number;
  detalle: AsistenciaRecord[];
}

class AsistenciaService {
  /**
   * Obtiene todas las asistencias con filtros opcionales
   * @param params - Parámetros de filtrado
   * @returns Lista de asistencias
   */
  async getAll(params?: {
    estudiante_id?: string;
    asignatura_id?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    presente?: boolean;
  }): Promise<AsistenciaRecord[]> {
    try {
      const response = await apiClient.get<AsistenciaRecord[]>('/asistencias', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener asistencia');
    }
  }

  /**
   * Obtiene el resumen de asistencia de un estudiante
   * @param estudianteId - ID del estudiante
   * @param params - Parámetros opcionales de filtrado
   * @returns Resumen de asistencia
   */
  async getResumenEstudiante(
    estudianteId: string,
    params?: {
      asignatura_id?: string;
      fecha_inicio?: string;
      fecha_fin?: string;
    }
  ): Promise<ResumenAsistencia> {
    try {
      const response = await apiClient.get<ResumenAsistencia>(
        `/asistencias/estudiante/${estudianteId}/resumen`,
        { params }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching attendance summary:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener resumen de asistencia');
    }
  }

  /**
   * Obtiene asistencias de un estudiante para un mes específico
   * @param estudianteId - ID del estudiante
   * @param year - Año
   * @param month - Mes (01-12)
   * @returns Lista de asistencias del mes
   */
  async getByMonth(estudianteId: string, year: number, month: string): Promise<AsistenciaRecord[]> {
    try {
      const fecha_inicio = `${year}-${month}-01`;
      const lastDay = new Date(year, parseInt(month), 0).getDate();
      const fecha_fin = `${year}-${month}-${lastDay.toString().padStart(2, '0')}`;

      const response = await apiClient.get<AsistenciaRecord[]>('/asistencias', {
        params: {
          estudiante_id: estudianteId,
          fecha_inicio,
          fecha_fin
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Error fetching monthly attendance:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener asistencia del mes');
    }
  }

  /**
   * Obtiene una asistencia por ID
   * @param id - ID de la asistencia
   * @returns Datos de la asistencia
   */
  async getById(id: number): Promise<AsistenciaRecord> {
    try {
      const response = await apiClient.get<AsistenciaRecord>(`/asistencias/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching attendance record:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener registro de asistencia');
    }
  }
}

// Exportar instancia única del servicio
export default new AsistenciaService();
