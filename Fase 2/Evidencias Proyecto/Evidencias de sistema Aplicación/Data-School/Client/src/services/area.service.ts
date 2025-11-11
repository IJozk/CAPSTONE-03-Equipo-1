import apiClient from "@/services/api.config";

export interface Area {
  area_id: number;
  nombre_area: string;
  descripcion: string | null;
  colegio_id: string;
  jefe_area_id: string | null;
  Colegio?: {
    colegio_id: string;
    nombre: string;
  };
  Profesor?: {
    profesor_id: string;
    nombre_completo: string;
    telefono: string | null;
  };
}

export interface CreateAreaDTO {
  nombre_area: string;
  descripcion?: string;
  colegio_id: string;
  jefe_area_id?: string;
}

export interface UpdateAreaDTO {
  nombre_area?: string;
  descripcion?: string;
  jefe_area_id?: string;
}

export interface AreaEstadisticas {
  area_id: number;
  nombre_area: string;
  jefe_area: string | null;
  estadisticas: {
    total_personal: number;
    personal_activo: number;
    personal_inactivo: number;
  };
}

class AreaService {
  /**
   * Obtener todas las áreas
   */
  async getAll(colegioId?: string): Promise<Area[]> {
    const params = colegioId ? { colegio_id: colegioId } : {};
    const response = await apiClient.get('/areas', { params });
    return response.data;
  }

  /**
   * Obtener área por ID
   */
  async getById(id: number): Promise<Area> {
    const response = await apiClient.get(`/areas/${id}`);
    return response.data;
  }

  /**
   * Crear nueva área
   */
  async create(data: CreateAreaDTO): Promise<Area> {
    const response = await apiClient.post('/areas', data);
    return response.data;
  }

  /**
   * Actualizar área
   */
  async update(id: number, data: UpdateAreaDTO): Promise<Area> {
    const response = await apiClient.put(`/areas/${id}`, data);
    return response.data;
  }

  /**
   * Asignar jefe de área
   */
  async asignarJefe(id: number, jefeAreaId: string): Promise<Area> {
    const response = await apiClient.patch(`/areas/${id}/jefe`, { jefe_area_id: jefeAreaId });
    return response.data;
  }

  /**
   * Remover jefe de área
   */
  async removerJefe(id: number): Promise<Area> {
    const response = await apiClient.delete(`/areas/${id}/jefe`);
    return response.data;
  }

  /**
   * Eliminar área
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/areas/${id}`);
  }

  /**
   * Obtener personal de un área
   */
  async getPersonal(id: number): Promise<any[]> {
    const response = await apiClient.get(`/areas/${id}/personal`);
    return response.data;
  }

  /**
   * Obtener estadísticas de un área
   */
  async getEstadisticas(id: number): Promise<AreaEstadisticas> {
    const response = await apiClient.get(`/areas/${id}/estadisticas`);
    return response.data;
  }
}

export default new AreaService();
