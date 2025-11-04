import apiClient from './api.config';
import type {
    User
} from '@/types/auth.types';

class UserService {
  /*
   * Obtiene la lista de todos los usuarios desde el backend
   * @returns Array de usuarios
   * @throws Error si falla la solicitud
   */
  async getAllUsers(usertype: string): Promise<User[]> {
    if (!usertype) {
        throw new Error('El tipo de usuario es obligatorio');
    }
    if (usertype !== 'ESTUDIANTE' && usertype !== 'PROFESOR' && usertype !== 'TUTOR' && usertype !== 'ADMINISTRATIVO') {
        throw new Error('Tipo de usuario no válido');
    }

    if (usertype === 'ESTUDIANTE') {
        try {
            const response = await apiClient.get<User[]>('/estudiantes'); 
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || 'Error al obtener la lista de usuarios'
            );
        }
    }
    else if (usertype === 'PROFESOR') {
        try {
            const response = await apiClient.get<User[]>('/profesores'); 
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || 'Error al obtener la lista de usuarios'
            );
        }
    }
    else if (usertype === 'TUTOR') {
        try {
            const response = await apiClient.get<User[]>('/tutores'); 
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || 'Error al obtener la lista de usuarios'
            );
        }
    }
    else { // ADMINISTRATIVO
        try {
            const response = await apiClient.get<User[]>('/administrativos'); 
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || 'Error al obtener la lista de usuarios'
            );
        }
    }
  }

  /**
   * ⭐ NUEVO: Obtiene todos los usuarios de la tabla User (sin filtro por tipo)
   * @returns Array de usuarios básicos
   * @throws Error si falla la solicitud
   */
  async getAllUsersBasic(): Promise<User[]> {
    try {
        const response = await apiClient.get<User[]>('/users'); 
        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || 'Error al obtener usuarios'
        );
    }
  }

  /**
   * ⭐ NUEVO: Obtiene todos los usuarios con información completa (JOIN con tablas relacionadas)
   * @param params Parámetros opcionales como incluir_inactivos
   * @returns Array de usuarios con nombre_completo y rut
   * @throws Error si falla la solicitud
   */
  async getAllUsersFull(params?: { incluir_inactivos?: boolean }): Promise<User[]> {
    try {
        const response = await apiClient.get<User[]>('/users/full', { params }); 
        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || 'Error al obtener usuarios completos'
        );
    }
  }

  /**
   * ⭐ NUEVO: Obtiene un usuario específico por ID con toda su información
   * @param id ID del usuario
   * @returns Usuario completo
   * @throws Error si falla la solicitud
   */
  async getUserById(id: string): Promise<User> {
    try {
        const response = await apiClient.get<User>(`/users/${id}`); 
        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || 'Error al obtener usuario'
        );
    }
  }

  /**
   * ⭐ NUEVO: Actualiza el estado activo/inactivo de un usuario
   * @param id ID del usuario
   * @param is_active Estado activo o inactivo
   * @returns Usuario actualizado
   * @throws Error si falla la solicitud
   */
  async updateUserStatus(id: string, is_active: boolean): Promise<any> {
    try {
        const response = await apiClient.patch(`/users/${id}/status`, { is_active }); 
        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || 'Error al actualizar estado del usuario'
        );
    }
  }

  /**
   * ⭐ NUEVO: Actualiza el email de un usuario
   * @param id ID del usuario
   * @param email_address Nuevo email
   * @returns Usuario actualizado
   * @throws Error si falla la solicitud
   */
  async updateUserEmail(id: string, email_address: string): Promise<any> {
    try {
        const response = await apiClient.patch(`/users/${id}/email`, { email_address }); 
        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || 'Error al actualizar email del usuario'
        );
    }
  }

  /**
   * Actualiza información general de un usuario
   * @param id ID del usuario
   * @param userData Datos a actualizar
   * @returns Usuario actualizado
   * @throws Error si falla la solicitud
   */
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    try {
        const response = await apiClient.patch<User>(`/users/${id}`, userData); 
        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || 'Error al actualizar usuario'
        );
    }
  }
}

export default new UserService();