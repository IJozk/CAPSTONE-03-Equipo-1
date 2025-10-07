import { defineStore } from 'pinia';
import authService from '@/services/auth.service';
import type { AuthState, LoginCredentials, User } from '@/types/auth.types';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
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
      return state.user?.nombre_completo || state.user?.email_address || '';
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
  },
});
