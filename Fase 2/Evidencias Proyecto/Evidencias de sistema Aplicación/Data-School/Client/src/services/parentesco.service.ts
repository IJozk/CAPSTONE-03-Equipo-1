import apiClient from './api.config';
import type { Tutor } from '@/types/users.types';

export interface Parentesco {
  estudiante_id: string;
  tutor_id: string;
  tipo_parentesco_id: number;
  es_tutor_titular: boolean;
  es_contacto_emergencia: boolean;
  puede_retirar: boolean;
  created_at: string;
  Tutor?: Tutor;
}

export interface CreateParentescoDTO {
  estudiante_id: string;
  tutor_id: string;
  tipo_parentesco_id: number;
  es_tutor_titular?: boolean;
  es_contacto_emergencia?: boolean;
  puede_retirar?: boolean;
}

export interface UpdateParentescoDTO {
  tipo_parentesco_id?: number;
  es_tutor_titular?: boolean;
  es_contacto_emergencia?: boolean;
  puede_retirar?: boolean;
}

export interface CreateTutorAndAssignDTO {
  // Datos del tutor
  nombre_completo: string;
  rut?: string;
  telefono?: string;
  direccion?: string;
  ocupacion?: string;
  email?: string;
  // Datos de la relación
  estudiante_id: string;
  tipo_parentesco_id: number;
  es_tutor_titular?: boolean;
  es_contacto_emergencia?: boolean;
  puede_retirar?: boolean;
}

class ParentescoService {
  private baseURL = '/parentescos';

  /**
   * Obtener tutores de un estudiante
   */
  async getTutoresByEstudiante(estudianteId: string): Promise<Parentesco[]> {
    try {
      const response = await apiClient.get<Parentesco[]>(
        `${this.baseURL}/estudiante/${estudianteId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener tutores del estudiante'
      );
    }
  }

  /**
   * Obtener el tutor titular de un estudiante
   */
  async getTutorTitular(estudianteId: string): Promise<Parentesco | null> {
    try {
      const tutores = await this.getTutoresByEstudiante(estudianteId);
      return tutores.find(t => t.es_tutor_titular) || null;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener tutor titular del estudiante'
      );
    }
  }

  /**
   * Crear relación de parentesco (asignar tutor existente a estudiante)
   */
  async create(data: CreateParentescoDTO): Promise<Parentesco> {
    try {
      const response = await apiClient.post<Parentesco>(this.baseURL, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al crear relación de parentesco'
      );
    }
  }

  /**
   * Crear tutor y asignarlo a estudiante (operación combinada)
   */
  async createTutorAndAssign(data: CreateTutorAndAssignDTO): Promise<Parentesco> {
    try {
      const response = await apiClient.post<Parentesco>(
        `${this.baseURL}/create-and-assign`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al crear tutor y asignarlo'
      );
    }
  }

  /**
   * Actualizar relación de parentesco
   */
  async update(
    estudianteId: string,
    tutorId: string,
    data: UpdateParentescoDTO
  ): Promise<Parentesco> {
    try {
      const response = await apiClient.put<Parentesco>(
        `${this.baseURL}/${estudianteId}/${tutorId}`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al actualizar relación de parentesco'
      );
    }
  }

  /**
   * Eliminar relación de parentesco
   */
  async delete(estudianteId: string, tutorId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseURL}/${estudianteId}/${tutorId}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al eliminar relación de parentesco'
      );
    }
  }
}

export default new ParentescoService();
