import apiClient from './api.config';

export interface Profesion {
  id_profesion: number;
  nombre: string;
  descripcion: string | null;
  created_at: string;
}

export interface Contrato {
  id_contrato: number;
  id_empleado: string;
  id_profesion: number;
  inicio_contrato: string;
  termino_contrato: string | null;
  de_planta: boolean;
  created_at: string;
  Profesion?: Profesion;
}

export interface CreateContratoDTO {
  id_empleado: string;
  id_profesion: number;
  inicio_contrato: string;
  termino_contrato?: string;
  de_planta?: boolean;
}

export interface UpdateContratoDTO {
  id_profesion?: number;
  inicio_contrato?: string;
  termino_contrato?: string;
  de_planta?: boolean;
}

class ContratoService {
  private baseURL = '/contratos';

  /**
   * Obtener todas las profesiones disponibles
   */
  async getAllProfesiones(): Promise<Profesion[]> {
    try {
      const response = await apiClient.get<Profesion[]>(`${this.baseURL}/profesiones`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener las profesiones'
      );
    }
  }

  /**
   * Obtener contrato activo de un empleado
   */
  async getContratoByEmpleado(empleadoId: string): Promise<Contrato | null> {
    try {
      const response = await apiClient.get<Contrato>(
        `${this.baseURL}/empleado/${empleadoId}`
      );
      return response.data;
    } catch (error: any) {
      // Si no hay contrato activo, retornar null
      if (error.response?.status === 404 || !error.response?.data) {
        return null;
      }
      throw new Error(
        error.response?.data?.message || 'Error al obtener contrato del empleado'
      );
    }
  }

  /**
   * Obtener historial de contratos de un empleado
   */
  async getHistorialContratos(empleadoId: string): Promise<Contrato[]> {
    try {
      const response = await apiClient.get<Contrato[]>(
        `${this.baseURL}/empleado/${empleadoId}/historial`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener historial de contratos'
      );
    }
  }

  /**
   * Crear nuevo contrato
   */
  async create(data: CreateContratoDTO): Promise<Contrato> {
    try {
      const response = await apiClient.post<Contrato>(this.baseURL, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al crear contrato'
      );
    }
  }

  /**
   * Actualizar contrato
   */
  async update(contratoId: number, data: UpdateContratoDTO): Promise<Contrato> {
    try {
      const response = await apiClient.put<Contrato>(
        `${this.baseURL}/${contratoId}`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al actualizar contrato'
      );
    }
  }

  /**
   * Finalizar contrato (establecer fecha de término)
   */
  async finalizarContrato(contratoId: number, terminoContrato: string): Promise<Contrato> {
    try {
      const response = await apiClient.patch<Contrato>(
        `${this.baseURL}/${contratoId}/finalizar`,
        { termino_contrato: terminoContrato }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al finalizar contrato'
      );
    }
  }

  /**
   * Eliminar contrato
   */
  async delete(contratoId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseURL}/${contratoId}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al eliminar contrato'
      );
    }
  }
}

export default new ContratoService();
