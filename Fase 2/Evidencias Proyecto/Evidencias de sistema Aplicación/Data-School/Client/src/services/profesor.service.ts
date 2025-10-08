import apiClient from './api.config';
import type {
  Profesor,
  CreateProfesorDTO,
  UpdateProfesorDTO,
  UserQueryParams,
  MessageResponse
} from '@/types/users.types';

class ProfesorService {
  private readonly endpoint = '/profesores';

  /**
   * Obtener todos los profesores
   */
  async getAll(params?: UserQueryParams): Promise<Profesor[]> {
    try {
      const response = await apiClient.get<Profesor[]>(this.endpoint, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener la lista de profesores'
      );
    }
  }

  /**
   * Obtener profesor por ID
   */
  async getById(id: string): Promise<Profesor> {
    try {
      const response = await apiClient.get<Profesor>(`${this.endpoint}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener el profesor'
      );
    }
  }

  /**
   * Crear nuevo profesor
   */
  async create(data: CreateProfesorDTO): Promise<Profesor> {
    try {
      const response = await apiClient.post<Profesor>(this.endpoint, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al crear el profesor'
      );
    }
  }

  /**
   * Actualizar profesor
   */
  async update(id: string, data: UpdateProfesorDTO): Promise<Profesor> {
    try {
      const response = await apiClient.put<Profesor>(`${this.endpoint}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al actualizar el profesor'
      );
    }
  }

  /**
   * Deshabilitar profesor (soft delete)
   */
  async disable(id: string): Promise<MessageResponse> {
    try {
      const response = await apiClient.patch<MessageResponse>(`${this.endpoint}/${id}/disable`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al deshabilitar el profesor'
      );
    }
  }

  /**
   * Habilitar profesor
   */
  async enable(id: string): Promise<MessageResponse> {
    try {
      const response = await apiClient.patch<MessageResponse>(`${this.endpoint}/${id}/enable`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al habilitar el profesor'
      );
    }
  }
}

export default new ProfesorService();
