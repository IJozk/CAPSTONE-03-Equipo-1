import apiClient from "@/services/api.config";

export interface Zona {
  zona_id: string;
  nombre_zona: string;
  descripcion: string | null;
  colegio_id: string;
  capacidad_total: number | null;
  Colegio?: {
    colegio_id: string;
    nombre: string;
  };
}

export interface CreateZonaDTO {
  zona_id: string;
  nombre_zona: string;
  descripcion?: string;
  colegio_id: string;
  capacidad_total?: number;
}

export interface UpdateZonaDTO {
  nombre_zona?: string;
  descripcion?: string;
  capacidad_total?: number;
}

export interface ZonaEstadisticas {
  zona_id: string;
  nombre_zona: string;
  capacidad_total_declarada: number | null;
  capacidad_total_real: number;
  estadisticas: {
    total_salas: number;
    salas_disponibles: number;
    salas_mantenimiento: number;
    salas_fuera_servicio: number;
  };
}

class ZonaService {
  /**
   * Obtener todas las zonas
   */
  async getAll(colegioId?: string): Promise<Zona[]> {
    const params = colegioId ? { colegio_id: colegioId } : {};
    const response = await  apiClient.get('/zonas', { params });
    return response.data;
  }

  /**
   * Obtener zona por ID
   */
  async getById(id: string): Promise<Zona> {
    const response = await  apiClient.get(`/zonas/${id}`);
    return response.data;
  }

  /**
   * Crear nueva zona
   */
  async create(data: CreateZonaDTO): Promise<Zona> {
    const response = await  apiClient.post('/zonas', data);
    return response.data;
  }

  /**
   * Actualizar zona
   */
  async update(id: string, data: UpdateZonaDTO): Promise<Zona> {
    const response = await  apiClient.put(`/zonas/${id}`, data);
    return response.data;
  }

  /**
   * Eliminar zona
   */
  async delete(id: string): Promise<void> {
    await  apiClient.delete(`/zonas/${id}`);
  }

  /**
   * Obtener salas de una zona
   */
  async getSalas(id: string): Promise<any[]> {
    const response = await  apiClient.get(`/zonas/${id}/salas`);
    return response.data;
  }

  /**
   * Obtener estadísticas de una zona
   */
  async getEstadisticas(id: string): Promise<ZonaEstadisticas> {
    const response = await  apiClient.get(`/zonas/${id}/estadisticas`);
    return response.data;
  }
}

export default new ZonaService();
