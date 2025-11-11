import apiClient from "@/services/api.config";

export interface Anotacion {
  id: number;
  estudiante_id: string;
  profesor_id: string | null;
  tipo_anotacion: 'Positiva' | 'Negativa' | 'Neutra';
  descripcion: string | null;
  fecha: string;
  created_at: string;
  estudiante?: {
    estudiante_id: string;
    nombre_completo: string;
    rut: string;
    numero_lista?: number;
  };
  profesor?: {
    profesor_id: string;
    nombre_completo: string;
  };
}

export interface CreateAnotacionDTO {
  estudiante_id: string;
  profesor_id?: string;
  tipo_anotacion: 'Positiva' | 'Negativa' | 'Neutra';
  descripcion?: string;
  fecha: string;
}

export interface UpdateAnotacionDTO {
  tipo_anotacion?: 'Positiva' | 'Negativa' | 'Neutra';
  descripcion?: string;
  fecha?: string;
}

export interface EstadisticasAnotaciones {
  total: number;
  positivas: number;
  negativas: number;
  neutras: number;
}

class AnotacionesService {
  /**
   * Obtener anotaciones de un estudiante
   */
  async getByEstudiante(estudianteId: string): Promise<Anotacion[]> {
    const response = await  apiClient.get(`/anotaciones/estudiante/${estudianteId}`);
    return response.data;
  }

  /**
   * Obtener anotaciones de un profesor
   */
  async getByProfesor(profesorId: string): Promise<Anotacion[]> {
    const response = await  apiClient.get(`/anotaciones/profesor/${profesorId}`);
    return response.data;
  }

  /**
   * Obtener anotaciones de los estudiantes de una asignatura
   */
  async getByAsignatura(asignaturaId: string): Promise<Anotacion[]> {
    const response = await  apiClient.get(`/anotaciones/asignatura/${asignaturaId}`);
    return response.data;
  }

  /**
   * Crear una nueva anotación
   */
  async create(data: CreateAnotacionDTO): Promise<Anotacion> {
    const response = await  apiClient.post('/anotaciones', data);
    return response.data;
  }

  /**
   * Actualizar una anotación
   */
  async update(id: number, data: UpdateAnotacionDTO): Promise<Anotacion> {
    const response = await  apiClient.put(`/anotaciones/${id}`, data);
    return response.data;
  }

  /**
   * Eliminar una anotación
   */
  async delete(id: number): Promise<void> {
    await  apiClient.delete(`/anotaciones/${id}`);
  }

  /**
   * Obtener estadísticas de anotaciones de un estudiante
   */
  async getEstadisticas(estudianteId: string): Promise<EstadisticasAnotaciones> {
    const response = await  apiClient.get(`/anotaciones/estadisticas/${estudianteId}`);
    return response.data;
  }
}

export default new AnotacionesService();
