/**
 * configuracionColegio.service.ts
 * Servicio para manejar las peticiones API de configuración del colegio
 *
 * Endpoints incluidos:
 * - GET /api/configuracion-colegio - Obtener todas las configuraciones
 * - GET /api/configuracion-colegio/por-tipo - Obtener configuraciones agrupadas por tipo
 * - GET /api/configuracion-colegio/clave/:clave - Obtener configuración por clave
 * - GET /api/configuracion-colegio/:id - Obtener configuración por ID
 * - POST /api/configuracion-colegio - Crear nueva configuración
 * - PUT /api/configuracion-colegio/:id - Actualizar configuración
 * - PATCH /api/configuracion-colegio/clave/:clave/valor - Actualizar solo el valor
 * - DELETE /api/configuracion-colegio/:id - Eliminar configuración
 */

import apiClient from './api.config';

export interface ConfiguracionColegio {
  configuracion_id: number;
  clave: string;
  valor: string;
  colegio_id: number;
  tipo?: string;
  descripcion?: string;
  creado_en?: string;
  actualizado_en?: string;
}

export interface ConfiguracionPorTipo {
  [tipo: string]: ConfiguracionColegio[];
}

export interface CreateConfiguracionDto {
  clave: string;
  valor: string;
  colegio_id: number;
  tipo?: string;
  descripcion?: string;
}

export interface UpdateConfiguracionDto {
  clave?: string;
  valor?: string;
  tipo?: string;
  descripcion?: string;
}

export interface UpdateValorDto {
  valor: string;
}

class ConfiguracionColegioService {
  /**
   * Obtiene todas las configuraciones
   * GET /api/configuracion-colegio?colegio_id={id}&tipo={tipo}
   */
  async getAll(colegioId?: number, tipo?: string): Promise<ConfiguracionColegio[]> {
    const params = new URLSearchParams();
    if (colegioId) params.append('colegio_id', colegioId.toString());
    if (tipo) params.append('tipo', tipo);

    const response = await apiClient.get<{ configuraciones: ConfiguracionColegio[] }>(
      `/configuracion-colegio?${params.toString()}`
    );
    return response.data.configuraciones;
  }

  /**
   * Obtiene configuraciones agrupadas por tipo
   * GET /api/configuracion-colegio/por-tipo?colegio_id={id}
   */
  async getByTipo(colegioId?: number): Promise<ConfiguracionPorTipo> {
    const params = colegioId ? `?colegio_id=${colegioId}` : '';
    const response = await apiClient.get<{ configuraciones: ConfiguracionPorTipo }>(
      `/configuracion-colegio/por-tipo${params}`
    );
    return response.data.configuraciones;
  }

  /**
   * Obtiene una configuración por clave
   * GET /api/configuracion-colegio/clave/:clave?colegio_id={id}
   */
  async getByClave(clave: string, colegioId: number): Promise<ConfiguracionColegio> {
    const response = await apiClient.get<ConfiguracionColegio>(
      `/configuracion-colegio/clave/${clave}?colegio_id=${colegioId}`
    );
    return response.data;
  }

  /**
   * Obtiene una configuración por ID
   * GET /api/configuracion-colegio/:id
   */
  async getById(id: number): Promise<ConfiguracionColegio> {
    const response = await apiClient.get<ConfiguracionColegio>(
      `/configuracion-colegio/${id}`
    );
    return response.data;
  }

  /**
   * Crea una nueva configuración
   * POST /api/configuracion-colegio
   */
  async create(data: CreateConfiguracionDto): Promise<ConfiguracionColegio> {
    const response = await apiClient.post<ConfiguracionColegio>(
      '/configuracion-colegio',
      data
    );
    return response.data;
  }

  /**
   * Actualiza una configuración
   * PUT /api/configuracion-colegio/:id
   */
  async update(id: number, data: UpdateConfiguracionDto): Promise<ConfiguracionColegio> {
    const response = await apiClient.put<ConfiguracionColegio>(
      `/configuracion-colegio/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Actualiza solo el valor de una configuración por clave
   * PATCH /api/configuracion-colegio/clave/:clave/valor?colegio_id={id}
   */
  async updateValor(clave: string, colegioId: number, valor: string): Promise<ConfiguracionColegio> {
    const response = await apiClient.patch<ConfiguracionColegio>(
      `/configuracion-colegio/clave/${clave}/valor?colegio_id=${colegioId}`,
      { valor }
    );
    return response.data;
  }

  /**
   * Elimina una configuración
   * DELETE /api/configuracion-colegio/:id
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/configuracion-colegio/${id}`);
  }
}

// Exportar instancia única del servicio
export default new ConfiguracionColegioService();
