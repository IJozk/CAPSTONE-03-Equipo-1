// src/services/grupoTaller.service.ts
import apiClient from './api.config';

export interface GrupoTallerQuery {
  taller_id?: string;
  estudiante_id?: string;
  estado?: string;
}

export interface CreateGrupoTallerPayload {
  taller_id: string;
  estudiante_id: string;
  observaciones?: string | null;
}

export interface RetirarPayload {
  observaciones?: string | null;
}

const grupoTallerService = {
  async getAll(params: GrupoTallerQuery = {}) {
    const { data } = await apiClient.get('/grupo-taller', { params });
    return data;
  },

  async create(payload: CreateGrupoTallerPayload) {
    const { data } = await apiClient.post('/grupo-taller', payload);
    return data;
  },

  async retirar(id: string, payload: RetirarPayload) {
    const { data } = await apiClient.patch(`/grupo-taller/${id}/retirar`, payload);
    return data;
  }
};

export default grupoTallerService;
