import apiClient from './api.config';
import type { MessageResponse } from '@/types/users.types';

// Types para Eventos
export interface Evento {
  evento_id: string;
  nombre: string;
  descripcion?: string;
  lugar: string;
  fecha_inicio: string;
  fecha_fin: string;
  creado_por?: string;
  modificado_por?: string;
  creado_en?: string;
  modificado_en?: string;
  creado_por_user?: {
    user_id: string;
    email_address: string;
  };
  modificado_por_user?: {
    user_id: string;
    email_address: string;
  };
}

export interface CreateEventoDTO {
  nombre: string;
  lugar: string;
  fecha_inicio: string;
  fecha_fin: string;
  creado_por?: string;
}

export interface UpdateEventoDTO {
  nombre?: string;
  lugar?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  modificado_por?: string;
}

export interface EventoQueryParams {
  fecha_inicio?: string;
  fecha_fin?: string;
  lugar?: string;
}

export interface EventoFormData {
  nombre: string;
  descripcion: string;
  lugar: string;
  fecha: string;
  hora_inicio: string;
  hora_termino: string;
}

class EventoService {
  private readonly endpoint = '/eventos';

  /**
   * Convierte datos del formulario a formato de API
   */
  private formToDTO(formData: EventoFormData): Omit<CreateEventoDTO, 'creado_por'> {
    return {
      nombre: formData.nombre,
      lugar: formData.lugar,
      fecha_inicio: `${formData.fecha}T${formData.hora_inicio}:00`,
      fecha_fin: `${formData.fecha}T${formData.hora_termino}:00`
    };
  }

  /**
   * Convierte evento de API a formato de formulario
   */
  eventoToForm(evento: Evento): EventoFormData {
    const fecha = evento.fecha_inicio?.split('T')[0] || '';
    const hora_inicio = evento.fecha_inicio?.split('T')[1]?.substring(0, 5) || '';
    const hora_termino = evento.fecha_fin?.split('T')[1]?.substring(0, 5) || '';

    return {
      nombre: evento.nombre,
      descripcion: '',
      lugar: evento.lugar,
      fecha,
      hora_inicio,
      hora_termino
    };
  }

  /**
   * Obtener todos los eventos
   */
  async getAll(params?: EventoQueryParams): Promise<Evento[]> {
    try {
      const response = await apiClient.get<Evento[]>(this.endpoint, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener la lista de eventos'
      );
    }
  }

  /**
   * Obtener evento por ID
   */
  async getById(id: string): Promise<Evento> {
    try {
      const response = await apiClient.get<Evento>(`${this.endpoint}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener el evento'
      );
    }
  }

  /**
   * Obtener eventos próximos
   */
  async getProximos(): Promise<Evento[]> {
    try {
      const response = await apiClient.get<Evento[]>(`${this.endpoint}/proximos`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener eventos próximos'
      );
    }
  }

  /**
   * Obtener eventos pasados
   */
  async getPasados(): Promise<Evento[]> {
    try {
      const response = await apiClient.get<Evento[]>(`${this.endpoint}/pasados`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener eventos pasados'
      );
    }
  }

  /**
   * Obtener eventos en curso
   */
  async getEnCurso(): Promise<Evento[]> {
    try {
      const response = await apiClient.get<Evento[]>(`${this.endpoint}/en-curso`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener eventos en curso'
      );
    }
  }

  /**
   * Crear nuevo evento desde datos de formulario
   */
  async createFromForm(formData: EventoFormData, creado_por?: string): Promise<Evento> {
    try {
      const dto: CreateEventoDTO = {
        ...this.formToDTO(formData),
        creado_por
      };

      console.log('=== SERVICE CREATE DEBUG ===');
      console.log('FormData recibido:', JSON.stringify(formData, null, 2));
      console.log('DTO a enviar:', JSON.stringify(dto, null, 2));

      const response = await apiClient.post<Evento>(this.endpoint, dto);

      console.log('Respuesta del backend:', JSON.stringify(response.data, null, 2));
      console.log('=== FIN SERVICE CREATE DEBUG ===');

      return response.data;
    } catch (error: any) {
      console.error('Error en service.createFromForm:', error);
      throw new Error(
        error.response?.data?.message || 'Error al crear el evento'
      );
    }
  }

  /**
   * Crear nuevo evento (método directo con DTO)
   */
  async create(data: CreateEventoDTO): Promise<Evento> {
    try {
      const response = await apiClient.post<Evento>(this.endpoint, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al crear el evento'
      );
    }
  }

  /**
   * Actualizar evento desde datos de formulario
   */
  async updateFromForm(
    id: string,
    formData: EventoFormData,
    modificado_por?: string
  ): Promise<Evento> {
    try {
      const dto: UpdateEventoDTO = {
        ...this.formToDTO(formData),
        modificado_por
      };

      console.log('=== SERVICE UPDATE DEBUG ===');
      console.log('ID evento:', id);
      console.log('FormData recibido:', JSON.stringify(formData, null, 2));
      console.log('DTO a enviar:', JSON.stringify(dto, null, 2));

      const response = await apiClient.put<Evento>(`${this.endpoint}/${id}`, dto);

      console.log('Respuesta del backend:', JSON.stringify(response.data, null, 2));
      console.log('=== FIN SERVICE UPDATE DEBUG ===');

      return response.data;
    } catch (error: any) {
      console.error('Error en service.updateFromForm:', error);
      throw new Error(
        error.response?.data?.message || 'Error al actualizar el evento'
      );
    }
  }

  /**
   * Actualizar evento (método directo con DTO)
   */
  async update(id: string, data: UpdateEventoDTO): Promise<Evento> {
    try {
      const response = await apiClient.put<Evento>(`${this.endpoint}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al actualizar el evento'
      );
    }
  }

  /**
   * Eliminar evento
   */
  async delete(id: string): Promise<MessageResponse> {
    try {
      const response = await apiClient.delete<MessageResponse>(`${this.endpoint}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al eliminar el evento'
      );
    }
  }

  /**
   * Obtener alertas asociadas a un evento
   */
  async getAlertas(id: string): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>(`${this.endpoint}/${id}/alertas`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener alertas del evento'
      );
    }
  }

  /**
   * Helpers de formato para la UI
   */
  formatFecha(fechaISO: string | undefined): string {
    if (!fechaISO) return '';
    const fecha = fechaISO.split('T')[0];
    const [y, m, d] = fecha.split('-');
    if (!y || !m || !d) return fecha;
    return `${d}/${m}/${y}`;
  }

  formatHora(fechaISO: string | undefined): string {
    if (!fechaISO) return '';
    const hora = fechaISO.split('T')[1];
    return hora?.substring(0, 5) || '';
  }
}

export default new EventoService();
