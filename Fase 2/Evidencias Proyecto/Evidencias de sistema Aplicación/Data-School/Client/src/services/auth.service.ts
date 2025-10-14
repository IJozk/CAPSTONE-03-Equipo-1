import apiClient from './api.config';
import type {
  LoginCredentials,
  AuthResponse,
  RegisterDTO,
  ForgotPasswordResponse,
  ResetPasswordResponse
} from '@/types/auth.types';

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

  /**
   * Register: registra un nuevo usuario (solo administradores)
   * @param userData - Datos del usuario a registrar
   * @returns Datos del usuario creado y token JWT
   */
  async register(userData: RegisterDTO): Promise<AuthResponse> {
    try {
      // El token del admin se envía automáticamente por el interceptor

      if (userData.role === 'ADMINISTRATIVO') {
        if (!userData.cargo || !userData.area_id) {
          throw new Error('El campo cargo y area_id son obligatorios para administrativos');
        }
        const response = await apiClient.post<AuthResponse>('/auth/register/administrativo', {
          email: userData.email,
          password: userData.password,
          role: userData.role,
          nombre_completo: userData.nombre_completo,
          rut: userData.rut,
          colegio_id: userData.colegio_id,
          telefono: userData.telefono || null
        });
        return response.data;
      }

      if (userData.role === 'PROFESOR') {
        if (!userData.titulo_profesional || !userData.especialidad || !userData.fecha_contratacion) {
          throw new Error('Los campos titulo_profesional, especialidad y fecha_contratacion son obligatorios para profesores');
        }
        const response = await apiClient.post<AuthResponse>('/auth/register/profesor', {
          email: userData.email,
          password: userData.password,
          role: userData.role,
          nombre_completo: userData.nombre_completo,
          rut: userData.rut,
          colegio_id: userData.colegio_id,
          telefono: userData.telefono || null,
          titulo_profesional: userData.titulo_profesional,
          especialidad: userData.especialidad,
          fecha_contratacion: userData.fecha_contratacion
        });
        return response.data;
      }
      
      if (userData.role === 'ESTUDIANTE_APODERADO') {
        if ( !userData.fecha_nacimiento) {
          throw new Error('Los campos curso_id y fecha_nacimiento son obligatorios para estudiantes');
        }
        const response = await apiClient.post<AuthResponse>('/auth/register/estudiante', {
          email: userData.email,
          password: userData.password,
          role: userData.role,
          nombre_completo: userData.nombre_completo,
          rut: userData.rut,
          colegio_id: userData.colegio_id,
          telefono: userData.telefono || null,
          fecha_nacimiento: userData.fecha_nacimiento
        });
        return response.data;
      }


      const response = await apiClient.post<AuthResponse>('/auth/register', {
        email: userData.email,
        password: userData.password,
        role: userData.role,
        nombre_completo: userData.nombre_completo,
        rut: userData.rut,
        colegio_id: userData.colegio_id,
        telefono: userData.telefono || null
      });
      
      return response.data;
    } catch (error: any) {
      // Manejar errores específicos
      if (error.response?.status === 400) {
        const message = error.response.data.message || 'Error de validación';
        throw new Error(message);
      }
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('No tienes permisos para registrar usuarios');
      }
      throw new Error(error.response?.data?.message || 'Error al registrar usuario');
    }
  }

  /**
   * Forgot Password: solicita recuperación de contraseña
   * @param email - Email del usuario
   * @returns Mensaje de confirmación
   */
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
      const response = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', {
        email
      });
      return response.data;
    } catch (error: any) {
      // Manejar errores específicos
      if (error.response?.status === 404) {
        // Por seguridad, no revelar si el email existe
        return {
          message: 'Si el correo existe, recibirás un enlace de recuperación',
          email
        };
      }
      if (error.response?.status === 429) {
        throw new Error('Demasiados intentos. Intenta nuevamente más tarde');
      }
      throw new Error(error.response?.data?.message || 'Error al enviar correo de recuperación');
    }
  }

  /**
   * Reset Password: restablece la contraseña con token
   * @param token - Token de recuperación desde URL
   * @param newPassword - Nueva contraseña
   * @returns Mensaje de confirmación
   */
  async resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
    try {
      const response = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', {
        token,
        newPassword
      });
      return response.data;
    } catch (error: any) {
      // Manejar errores específicos
      if (error.response?.status === 400) {
        const message = error.response.data.message || '';
        if (message.toLowerCase().includes('token') || message.toLowerCase().includes('expirado')) {
          throw new Error('El enlace ha expirado o es inválido');
        }
        throw new Error(message);
      }
      throw new Error(error.response?.data?.message || 'Error al restablecer contraseña');
    }
  }

  /**
   * Validate Reset Token: verifica si un token es válido (opcional)
   * @param token - Token a validar
   * @returns true si es válido, false si no
   */
  async validateResetToken(token: string): Promise<boolean> {
    try {
      await apiClient.post('/auth/validate-reset-token', { token });
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Exportar instancia única (singleton)
export default new AuthService();
