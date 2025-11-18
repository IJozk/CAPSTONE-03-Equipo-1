import apiClient from "@/services/api.config";

export type EstadoSala = 'DISPONIBLE' | 'MANTENIMIENTO' | 'FUERA_DE_SERVICIO';

export interface Sala {
  sala_id: string;
  nombre: string;
  zona_id: string;
  capacidad: number | null;
  estado: EstadoSala | null;
  tiene_proyector: boolean | null;
  tiene_pizarra_digital: boolean | null;
  distribucion_asientos_template: any | null;
  Zona?: {
    zona_id: string;
    nombre_zona: string;
    descripcion: string | null;
    Colegio?: {
      colegio_id: string;
      nombre: string;
    };
  };
}

export interface CreateSalaDTO {
  sala_id: string;
  nombre: string;
  zona_id: string;
  capacidad?: number;
  tiene_proyector?: boolean;
  tiene_pizarra_digital?: boolean;
  distribucion_asientos_template?: any;
}

export interface UpdateSalaDTO {
  nombre?: string;
  zona_id?: string;
  capacidad?: number;
  tiene_proyector?: boolean;
  tiene_pizarra_digital?: boolean;
  distribucion_asientos_template?: any;
  estado?: EstadoSala;
}

class SalaService {
  /**
   * Obtener todas las salas
   */
  async getAll(filters?: {
    zona_id?: string;
    estado?: EstadoSala;
    tiene_proyector?: boolean;
    tiene_pizarra_digital?: boolean;
  }): Promise<Sala[]> {
    const response = await apiClient.get('/salas', { params: filters });
    return response.data;
  }

  /**
   * Obtener sala por ID
   */
  async getById(id: string): Promise<Sala> {
    const response = await apiClient.get(`/salas/${id}`);
    return response.data;
  }

  /**
   * Obtener salas disponibles
   */
  async getDisponibles(zonaId?: string): Promise<Sala[]> {
    const params = zonaId ? { zona_id: zonaId } : {};
    const response = await apiClient.get('/salas/disponibles', { params });
    return response.data;
  }

  /**
   * Crear nueva sala
   */
  async create(data: CreateSalaDTO): Promise<Sala> {
    const response = await apiClient.post('/salas', data);
    return response.data;
  }

  /**
   * Actualizar sala
   */
  async update(id: string, data: UpdateSalaDTO): Promise<Sala> {
    const response = await apiClient.put(`/salas/${id}`, data);
    return response.data;
  }

  /**
   * Cambiar estado de sala
   */
  async cambiarEstado(id: string, estado: EstadoSala): Promise<Sala> {
    const response = await apiClient.patch(`/salas/${id}/estado`, { estado });
    return response.data;
  }

  /**
   * Eliminar sala
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/salas/${id}`);
  }

  /**
   * Verificar disponibilidad de sala
   */
  async verificarDisponibilidad(
    id: string,
    params: {
      dia_semana: number;
      hora_inicio: string;
      hora_termino: string;
      periodo: string;
    }
  ): Promise<{ disponible: boolean; conflictos: any[] }> {
    const response = await apiClient.get(`/salas/${id}/disponibilidad`, { params });
    return response.data;
  }

  /**
   * Obtener horario de una sala
   */
  async getHorario(id: string, periodo?: string): Promise<any[]> {
    const params = periodo ? { periodo } : {};
    const response = await apiClient.get(`/salas/${id}/horario`, { params });
    return response.data;
  }
}

export default new SalaService();
