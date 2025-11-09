import apiClient from './api.config';

export interface Especialidad {
  id: number;
  nombre_especialidad: string;
  tipo_especialidad: string;
  created_at: string;
}

export interface ProfesorEspecialidad {
  profesor_id: string;
  especialidad_id: number;
  fecha_certificacion: string | null;
  certificado_url: string | null;
  created_at: string;
  Especialidad?: Especialidad;
}

export interface AsignarEspecialidadDTO {
  profesor_id: string;
  especialidad_id: number;
  fecha_certificacion?: string;
  certificado_url?: string;
}

export interface UpdateEspecialidadDTO {
  fecha_certificacion?: string;
  certificado_url?: string;
}

class EspecialidadService {
  private baseURL = '/especialidades';

  /**
   * Obtener todas las especialidades disponibles
   */
  async getAll(): Promise<Especialidad[]> {
    try {
      const response = await apiClient.get<Especialidad[]>(this.baseURL);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener las especialidades'
      );
    }
  }

  /**
   * Obtener especialidades de un profesor
   */
  async getByProfesor(profesorId: string): Promise<ProfesorEspecialidad[]> {
    try {
      const response = await apiClient.get<ProfesorEspecialidad[]>(
        `${this.baseURL}/profesor/${profesorId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener especialidades del profesor'
      );
    }
  }

  /**
   * Asignar especialidad a profesor
   */
  async assignToProfesor(data: AsignarEspecialidadDTO): Promise<ProfesorEspecialidad> {
    try {
      const response = await apiClient.post<ProfesorEspecialidad>(
        `${this.baseURL}/assign`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al asignar especialidad'
      );
    }
  }

  /**
   * Actualizar especialidad de profesor
   */
  async update(
    profesorId: string,
    especialidadId: number,
    data: UpdateEspecialidadDTO
  ): Promise<ProfesorEspecialidad> {
    try {
      const response = await apiClient.put<ProfesorEspecialidad>(
        `${this.baseURL}/${profesorId}/${especialidadId}`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al actualizar especialidad'
      );
    }
  }

  /**
   * Eliminar especialidad de profesor
   */
  async removeFromProfesor(profesorId: string, especialidadId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseURL}/${profesorId}/${especialidadId}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al eliminar especialidad'
      );
    }
  }
}

export default new EspecialidadService();
