import apiClient from './api.config';
import type {
  Tutor,
  CreateTutorDTO,
  UpdateTutorDTO,
  UserQueryParams,
  MessageResponse,
  LinkUserDTO
} from '@/types/users.types';

class TutorService {
  private readonly endpoint = '/tutores';

  /**
   * Obtener todos los tutores
   */
  async getAll(params?: UserQueryParams): Promise<Tutor[]> {
    try {
      const response = await apiClient.get<Tutor[]>(this.endpoint, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener la lista de tutores'
      );
    }
  }

  /**
   * Obtener tutor por ID
   */
  async getById(id: string): Promise<Tutor> {
    try {
      const response = await apiClient.get<Tutor>(`${this.endpoint}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener el tutor'
      );
    }
  }

  /**
   * Crear nuevo tutor
   */
  async create(data: CreateTutorDTO): Promise<Tutor> {
    try {
      const response = await apiClient.post<Tutor>(this.endpoint, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al crear el tutor'
      );
    }
  }

  /**
   * Actualizar tutor
   */
  async update(id: string, data: UpdateTutorDTO): Promise<Tutor> {
    try {
      const response = await apiClient.put<Tutor>(`${this.endpoint}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al actualizar el tutor'
      );
    }
  }

  /**
   * Deshabilitar tutor (soft delete)
   */
  async disable(id: string): Promise<MessageResponse> {
    try {
      const response = await apiClient.patch<MessageResponse>(`${this.endpoint}/${id}/disable`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al deshabilitar el tutor'
      );
    }
  }

  /**
   * Habilitar tutor
   */
  async enable(id: string): Promise<MessageResponse> {
    try {
      const response = await apiClient.patch<MessageResponse>(`${this.endpoint}/${id}/enable`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al habilitar el tutor'
      );
    }
  }

  /**
   * Asociar cuenta de usuario a tutor existente
   */
  async linkUser(id: string, data: LinkUserDTO): Promise<Tutor> {
    try {
      const response = await apiClient.patch<Tutor>(`${this.endpoint}/${id}/link-user`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al vincular usuario al tutor'
      );
    }
  }
}

export default new TutorService();
