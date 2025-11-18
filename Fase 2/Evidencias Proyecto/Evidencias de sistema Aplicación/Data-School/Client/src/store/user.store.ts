import { defineStore } from 'pinia';
import apiClient from '@/services/api.config';

interface User {
  user_id: string;
  email_address: string;
  role: 'ADMIN' | 'PROFESOR' | 'ESTUDIANTE_APODERADO' | 'ADMINISTRATIVO';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null
  }),

  getters: {
    activeUsers: (state) => state.users.filter(u => u.is_active),
    inactiveUsers: (state) => state.users.filter(u => !u.is_active),
    
    usersByRole: (state) => (role: string) => {
      return state.users.filter(u => u.role === role);
    },

    getUserById: (state) => (id: string) => {
      return state.users.find(u => u.user_id === id);
    }
  },

  actions: {
    async fetchUsers() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get<User[]>('/users');
        this.users = response.data;
      } catch (error: any) {
        this.error = error.message || 'Error al cargar usuarios';
        console.error('Error fetching users:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchUserById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get<User>(`/users/${id}`);
        this.currentUser = response.data;
      } catch (error: any) {
        this.error = error.message || 'Error al cargar usuario';
        console.error('Error fetching user:', error);
      } finally {
        this.loading = false;
      }
    },

    async updateUser(id: string, data: Partial<User>) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.put<User>(`/users/${id}`, data);
        const index = this.users.findIndex(u => u.user_id === id);
        if (index !== -1) {
          this.users[index] = response.data;
        }
        return response.data;
      } catch (error: any) {
        this.error = error.message || 'Error al actualizar usuario';
        console.error('Error updating user:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deactivateUser(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.patch(`/users/${id}/deactivate`);
        const user = this.users.find(u => u.user_id === id);
        if (user) {
          user.is_active = false;
        }
      } catch (error: any) {
        this.error = error.message || 'Error al desactivar usuario';
        console.error('Error deactivating user:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async activateUser(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.patch(`/users/${id}/activate`);
        const user = this.users.find(u => u.user_id === id);
        if (user) {
          user.is_active = true;
        }
      } catch (error: any) {
        this.error = error.message || 'Error al activar usuario';
        console.error('Error activating user:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    resetState() {
      this.users = [];
      this.currentUser = null;
      this.loading = false;
      this.error = null;
    }
  }
});