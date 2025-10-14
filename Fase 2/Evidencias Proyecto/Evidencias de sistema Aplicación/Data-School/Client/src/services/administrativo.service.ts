import apiClient from './api.config';
import type {
  Administrativo,
  CreateAdministrativoDTO,
  UpdateAdministrativoDTO,
  UserQueryParams,
  MessageResponse
} from '@/types/users.types';

class AdministrativoService {
  private readonly endpoint = '/administrativos';

  /**
   * Obtener todos los administrativos
   */
  async getAll(params?: UserQueryParams): Promise<Administrativo[]> {
    try {
      const response = await apiClient.get<Administrativo[]>(this.endpoint, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener la lista de administrativos'
      );
    }
  }

  /**
   * Obtener administrativo por ID
   */
  async getById(id: string): Promise<Administrativo> {
    try {
      const response = await apiClient.get<Administrativo>(`${this.endpoint}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener el administrativo'
      );
    }
  }

  /**
   * Crear nuevo administrativo
   */
  async create(data: CreateAdministrativoDTO): Promise<Administrativo> {
    try {
      const response = await apiClient.post<Administrativo>(this.endpoint, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al crear el administrativo'
      );
    }
  }

  /**
   * Actualizar administrativo
   */
  async update(id: string, data: UpdateAdministrativoDTO): Promise<Administrativo> {
    try {
      const response = await apiClient.put<Administrativo>(`${this.endpoint}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al actualizar el administrativo'
      );
    }
  }

  /**
   * Deshabilitar administrativo (soft delete)
   */
  async disable(id: string): Promise<MessageResponse> {
    try {
      const response = await apiClient.patch<MessageResponse>(`${this.endpoint}/${id}/disable`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al deshabilitar el administrativo'
      );
    }
  }

  /**
   * Habilitar administrativo
   */
  async enable(id: string): Promise<MessageResponse> {
    try {
      const response = await apiClient.patch<MessageResponse>(`${this.endpoint}/${id}/enable`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al habilitar el administrativo'
      );
    }
  }
}

export default new AdministrativoService();
