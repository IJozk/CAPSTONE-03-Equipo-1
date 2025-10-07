import apiClient from './api.config';
import type { LoginCredentials, AuthResponse } from '@/types/auth.types';

class AuthService {
  /**
   * Login: autentica al usuario con email y password
   * @param credentials - Email y password del usuario
   * @returns Datos del usuario y token JWT
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      // Extraer mensaje de error del backend o usar mensaje genérico
      throw new Error(
        error.response?.data?.message || 'Error al iniciar sesión'
      );
    }
  }

  /**
   * Logout: limpia datos de autenticación del localStorage
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  /**
   * Obtiene el token JWT almacenado en localStorage
   * @returns Token o null si no existe
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Verifica si existe una sesión activa
   * @returns true si hay token, false si no
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Exportar instancia única (singleton)
export default new AuthService();
