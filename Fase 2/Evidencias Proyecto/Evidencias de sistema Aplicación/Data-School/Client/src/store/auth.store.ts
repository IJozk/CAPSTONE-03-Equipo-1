import { defineStore } from 'pinia';
import authService from '@/services/auth.service';
import type {
  AuthState,
  LoginCredentials,
  User,
  RegisterDTO,
  RegisterState,
  ForgotPasswordState,
  ResetPasswordState
} from '@/types/auth.types';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isAuthenticated: false,
    loading: false,
    error: null as string | null,
    // Estado para registro de usuarios
    registerState: {
      loading: false,
      error: null,
      success: false,
      registeredUser: null
    } as RegisterState,
    // Estado para solicitud de recuperación de contraseña
    forgotPasswordState: {
      loading: false,
      success: false,
      error: null,
      cooldownSeconds: 0
    } as ForgotPasswordState,
    // Estado para restablecimiento de contraseña
    resetPasswordState: {
      loading: false,
      success: false,
      error: null,
      tokenValid: null,
      redirectCountdown: 0
    } as ResetPasswordState,
  }),

  getters: {
    /**
     * Obtener el rol del usuario actual
     */
    userRole: (state): string | null => state.user?.role || null,

    /**
     * Verificar si el usuario es administrador
     */
    isAdmin: (state): boolean => state.user?.role === 'ADMINISTRADOR',

    /**
     * Verificar si el usuario es director
     */
    isDirector: (state): boolean => state.user?.role === 'DIRECTOR',

    /**
     * Verificar si el usuario es UTP
     */
    isAdministrativo: (state): boolean => state.user?.role === 'ADMINISTRATIVO',

    /**
     * Verificar si el usuario es profesor
     */
    isProfesor: (state): boolean => state.user?.role === 'PROFESOR',

    /**
     * Verificar si el usuario es estudiante/apoderado
     */
    isEstudianteApoderado: (state): boolean => state.user?.role === 'ESTUDIANTE_APODERADO',

    /**
     * Obtener el nombre del usuario para mostrar en la UI
     */
    userName: (state): string => {
      return state.user?.admin_profile?.nombre_completo || state.user?.email || '';
    },
  },

  actions: {
    /**
     * Acción de login: autentica al usuario y guarda su sesión
     * @param credentials - Email y password
     * @returns Datos de autenticación del backend
     */
    async login(credentials: LoginCredentials) {
      this.loading = true;
      this.error = null;

      try {
        const response = await authService.login(credentials);

        // Guardar datos en el state de Pinia
        this.user = response.user;
        this.token = response.token;
        this.isAuthenticated = true;

        // Persistir en localStorage para mantener sesión al recargar
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(response.user));

        return response;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Acción de logout: cierra sesión y limpia datos
     */
    async logout() {
      // Limpiar localStorage
      authService.logout();

      // Resetear state
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      this.error = null;
    },

    /**
     * Restaurar sesión desde localStorage (útil al recargar la página)
     */
    restoreSession() {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('auth_user');

      if (token && userStr) {
        try {
          this.token = token;
          this.user = JSON.parse(userStr);
          this.isAuthenticated = true;
        } catch (error) {
          // Si hay error al parsear, cerrar sesión
          this.logout();
        }
      }
    },

    /**
     * Limpiar mensaje de error
     */
    clearError() {
      this.error = null;
    },

    /**
     * Acción de registro: registra un nuevo usuario (solo administradores)
     * @param userData - Datos del usuario a registrar
     * @returns Datos del usuario creado
     */
    async register(userData: RegisterDTO) {
      this.registerState.loading = true;
      this.registerState.error = null;
      this.registerState.success = false;

      try {
        const response = await authService.register(userData);

        this.registerState.registeredUser = response.user;
        this.registerState.success = true;

        return response;
      } catch (error: any) {
        this.registerState.error = error.message;
        throw error;
      } finally {
        this.registerState.loading = false;
      }
    },

    /**
     * Limpiar estado de registro
     */
    clearRegisterState() {
      this.registerState = {
        loading: false,
        error: null,
        success: false,
        registeredUser: null
      };
    },

    /**
     * Solicitar recuperación de contraseña
     * @param email - Email del usuario
     */
    async forgotPassword(email: string) {
      this.forgotPasswordState.loading = true;
      this.forgotPasswordState.error = null;

      try {
        const response = await authService.forgotPassword(email);
        this.forgotPasswordState.success = true;

        // Iniciar cooldown de 60 segundos
        this.forgotPasswordState.cooldownSeconds = 60;
        const interval = setInterval(() => {
          this.forgotPasswordState.cooldownSeconds--;
          if (this.forgotPasswordState.cooldownSeconds <= 0) {
            clearInterval(interval);
          }
        }, 1000);

        return response;
      } catch (error: any) {
        this.forgotPasswordState.error = error.message;
        throw error;
      } finally {
        this.forgotPasswordState.loading = false;
      }
    },

    /**
     * Restablecer contraseña con token
     * @param token - Token de recuperación
     * @param newPassword - Nueva contraseña
     */
    async resetPassword(token: string, newPassword: string) {
      this.resetPasswordState.loading = true;
      this.resetPasswordState.error = null;

      try {
        const response = await authService.resetPassword(token, newPassword);
        this.resetPasswordState.success = true;

        // Iniciar countdown de redirección (3 segundos)
        this.resetPasswordState.redirectCountdown = 3;
        const interval = setInterval(() => {
          this.resetPasswordState.redirectCountdown--;
          if (this.resetPasswordState.redirectCountdown <= 0) {
            clearInterval(interval);
          }
        }, 1000);

        return response;
      } catch (error: any) {
        this.resetPasswordState.error = error.message;
        throw error;
      } finally {
        this.resetPasswordState.loading = false;
      }
    },

    /**
     * Validar token de recuperación
     * @param token - Token a validar
     */
    async validateResetToken(token: string) {
      try {
        const isValid = await authService.validateResetToken(token);
        this.resetPasswordState.tokenValid = isValid;
        return isValid;
      } catch (error) {
        this.resetPasswordState.tokenValid = false;
        return false;
      }
    },

    /**
     * Limpiar estado de forgot password
     */
    clearForgotPasswordState() {
      this.forgotPasswordState = {
        loading: false,
        success: false,
        error: null,
        cooldownSeconds: 0
      };
    },

    /**
     * Limpiar estado de reset password
     */
    clearResetPasswordState() {
      this.resetPasswordState = {
        loading: false,
        success: false,
        error: null,
        tokenValid: null,
        redirectCountdown: 0
      };
    },
  },
});
