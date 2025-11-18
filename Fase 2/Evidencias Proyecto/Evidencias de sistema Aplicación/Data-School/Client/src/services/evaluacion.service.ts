/**
 * Servicio para gestión de evaluaciones
 * Maneja todas las peticiones relacionadas con evaluaciones y resultados
 */

import apiClient from './api.config';

export interface Evaluacion {
  evaluacion_id: number;
  asignatura_id: string;
  nombre: string;
  descripcion: string;
  fecha_evaluacion: string;
  tipo: 'PRUEBA' | 'TAREA' | 'TRABAJO' | 'EXAMEN' | 'PROYECTO' | 'PARTICIPACION';
  puntaje_maximo: number;
  porcentaje_nota: number;
  estado_activo: boolean;
  is_recuperativa: boolean;
  created_at: string;
  updated_at: string;
  asignatura?: {
    asignatura_id: string;
    nombre: string;
    curso_id: string;
  };
}

export interface ResultadoEvaluacion {
  resultado_id: number;
  evaluacion_id: number;
  estudiante_id: string;
  puntaje_obtenido: number;
  nota: number | null;
  porcentaje: number | null;
  observaciones: string | null;
  fecha_evaluacion: string | null;
  created_at: string;
  updated_at: string;
  evaluacion?: Evaluacion;
  Evaluacion?: Evaluacion; // Backend devuelve con mayúscula
}

export interface NotasEstudiante {
  asignatura_id: string;
  nombre_asignatura: string;
  profesor_nombre: string;
  promedio: number;
  notas: Array<{
    nota_id: number;
    evaluacion_nombre: string;
    tipo_evaluacion: string;
    nota: number;
    fecha: string;
    ponderacion: number;
    puntaje_obtenido: number;
    puntaje_maximo: number;
  }>;
}

class EvaluacionService {
  /**
   * Obtiene todas las evaluaciones con filtros opcionales
   * @param params - Parámetros de filtrado
   * @returns Lista de evaluaciones
   */
  async getAll(params?: {
    asignatura_id?: string;
    estado_activo?: boolean;
    tipo?: string;
  }): Promise<Evaluacion[]> {
    try {
      const response = await apiClient.get<Evaluacion[]>('/evaluaciones', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching evaluations:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener evaluaciones');
    }
  }

  /**
   * Obtiene una evaluación por ID
   * @param id - ID de la evaluación
   * @returns Datos de la evaluación
   */
  async getById(id: number): Promise<Evaluacion> {
    try {
      const response = await apiClient.get<Evaluacion>(`/evaluaciones/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching evaluation:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener evaluación');
    }
  }

  /**
   * Obtiene evaluaciones por asignatura
   * @param asignaturaId - ID de la asignatura
   * @returns Lista de evaluaciones de la asignatura
   */
  async getByAsignatura(asignaturaId: string): Promise<Evaluacion[]> {
    try {
      const response = await apiClient.get<Evaluacion[]>(`/evaluaciones/asignatura/${asignaturaId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching evaluations by subject:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener evaluaciones de la asignatura');
    }
  }

  /**
   * Obtiene los resultados de evaluación de un estudiante
   * @param estudianteId - ID del estudiante
   * @param asignaturaId - ID de la asignatura (opcional)
   * @returns Lista de resultados de evaluación
   */
  async getResultadosEstudiante(
    estudianteId: string,
    asignaturaId?: string
  ): Promise<ResultadoEvaluacion[]> {
    try {
      const params = asignaturaId ? { asignatura_id: asignaturaId } : {};
      const response = await apiClient.get<ResultadoEvaluacion[]>(
        `/resultados-evaluacion/estudiante/${estudianteId}`,
        { params }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching student results:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener resultados del estudiante');
    }
  }

  /**
   * Obtiene el promedio de un estudiante por asignatura
   * @param estudianteId - ID del estudiante
   * @param asignaturaId - ID de la asignatura
   * @returns Promedio de la asignatura
   */
  async getPromedioAsignatura(estudianteId: string, asignaturaId: string): Promise<number> {
    try {
      const response = await apiClient.get<{ promedio: number }>(
        `/resultados-evaluacion/estudiante/${estudianteId}/promedio/${asignaturaId}`
      );
      return response.data.promedio;
    } catch (error: any) {
      console.error('Error fetching subject average:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener promedio de asignatura');
    }
  }

  /**
   * Obtiene todas las notas organizadas por asignatura de un estudiante
   * @param estudianteId - ID del estudiante
   * @returns Notas organizadas por asignatura
   */
  async getNotasEstudiante(estudianteId: string): Promise<NotasEstudiante[]> {
    try {
      // Obtener todos los resultados del estudiante
      const resultados = await this.getResultadosEstudiante(estudianteId);

      console.log('📊 Resultados obtenidos del backend:', resultados);
      console.log('📊 Total de resultados:', resultados.length);

      // Agrupar por asignatura
      const notasPorAsignatura: { [key: string]: NotasEstudiante } = {};

      for (const resultado of resultados) {
        console.log('📝 Procesando resultado:', resultado);

        // El backend devuelve "Evaluacion" con mayúscula, manejar ambos casos
        const evaluacion = resultado.Evaluacion || resultado.evaluacion;

        if (!evaluacion || resultado.nota === null || resultado.nota === undefined) {
          console.warn('⚠️ Resultado sin evaluación o nota:', resultado);
          continue;
        }

        // Asignatura también viene con mayúscula del backend
        const asignatura = (evaluacion as any).Asignatura || evaluacion.asignatura;
        const asignaturaId = evaluacion.asignatura_id;

        if (!notasPorAsignatura[asignaturaId]) {
          notasPorAsignatura[asignaturaId] = {
            asignatura_id: asignaturaId,
            nombre_asignatura: asignatura?.nombre || 'Sin nombre',
            profesor_nombre: 'Por asignar', // TODO: Agregar profesor desde asignatura
            promedio: 0,
            notas: []
          };
        }

        notasPorAsignatura[asignaturaId].notas.push({
          nota_id: resultado.resultado_id,
          evaluacion_nombre: evaluacion.nombre,
          tipo_evaluacion: evaluacion.tipo,
          nota: resultado.nota,
          fecha: resultado.fecha_evaluacion || resultado.created_at,
          ponderacion: evaluacion.porcentaje_nota,
          puntaje_obtenido: resultado.puntaje_obtenido,
          puntaje_maximo: evaluacion.puntaje_maximo
        });
      }

      // Calcular promedios
      const notasArray = Object.values(notasPorAsignatura);
      for (const asignatura of notasArray) {
        if (asignatura.notas.length > 0) {
          const suma = asignatura.notas.reduce((acc, nota) => acc + nota.nota, 0);
          asignatura.promedio = suma / asignatura.notas.length;
        }
      }

      return notasArray;
    } catch (error: any) {
      console.error('Error fetching student grades:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener notas del estudiante');
    }
  }
}

// Exportar instancia única del servicio
export default new EvaluacionService();
