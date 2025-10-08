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
                const response = await apiClient.get<User[]>('/users/estudiantes'); 
                return response.data;
            } catch (error: any) {
                throw new Error(
                    error.response?.data?.message || 'Error al obtener la lista de usuarios'
                );
            }
        }
        else if (usertype === 'PROFESOR') {
            try {
                const response = await apiClient.get<User[]>('/users/profesores'); 
                return response.data;
            } catch (error: any) {
                throw new Error(
                    error.response?.data?.message || 'Error al obtener la lista de usuarios'
                );
            }
        }
        else if (usertype === 'TUTOR') {
            try {
                const response = await apiClient.get<User[]>('/users/tutores'); 
                return response.data;
            } catch (error: any) {
                throw new Error(
                    error.response?.data?.message || 'Error al obtener la lista de usuarios'
                );
            }
        }
        else { // ADMINISTRATIVO
            try {
                const response = await apiClient.get<User[]>('/users/administrativos'); 
                return response.data;
            } catch (error: any) {
                throw new Error(
                    error.response?.data?.message || 'Error al obtener la lista de usuarios'
                );
            }
        }
    }
}

export default new UserService();
