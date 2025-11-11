/**
 * teacher.service.ts
 * Servicio para manejar las peticiones API del profesor
 *
 * Endpoints incluidos:
 * - Dashboard: estadísticas del profesor
 * - Asignaturas: gestión de asignaturas que imparte
 * - Evaluaciones: crear, editar y eliminar evaluaciones
 * - Notas: registrar y editar calificaciones
 * - Asistencia: registro de asistencia
 * - Anotaciones: gestión de observaciones
 * - Horario: ver horario semanal
 * - Reportes: generación de reportes
 */

import apiClient from './api.config';
import type {
  TeacherDashboard,
  Subject,
  Student,
  Evaluation,
  EvaluationFormData,
  Grade,
  GradeFormData,
  Attendance,
  AttendanceFormData,
  Observation,
  ObservationFormData,
  Schedule,
  AttendanceReport,
  Upcoming
} from '@/types/teacher.types';

class TeacherService {

  // ========== DASHBOARD ==========

  /**
   * Obtiene el dashboard del profesor con estadísticas principales
   * GET /api/teachers/me/dashboard
   */
  async getDashboard(): Promise<TeacherDashboard> {
    const response = await apiClient.get<TeacherDashboard>('/teachers/me/dashboard');
    return response.data;
  }

  /**
   * Obtiene próximas clases y evaluaciones
   * GET /api/teachers/me/upcoming
   */
  async getUpcoming(): Promise<Upcoming> {
    const response = await apiClient.get<{ upcoming: Upcoming }>('/teachers/me/upcoming');
    return response.data.upcoming;
  }

  // ========== ASIGNATURAS ==========

  /**
   * Obtiene todas las asignaturas que imparte el profesor
   * Usa el endpoint /asignaturas con query param profesor_id
   */
  async getMySubjects(): Promise<Subject[]> {
    // Primero obtener el profesor_id del usuario actual
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) {
      throw new Error('No hay usuario autenticado');
    }

    const user = JSON.parse(userStr);

    // Obtener el profesor_id haciendo una petición al endpoint de profesores
    // usando el user_id
    const profesorResponse = await apiClient.get(`/profesores`);
    const profesores = profesorResponse.data;

    // Buscar el profesor que coincide con el user_id actual
    const profesor = profesores.find((p: any) => p.user_id === user.id);

    if (!profesor) {
      throw new Error('No se encontró el perfil de profesor');
    }

    // Ahora obtener las asignaturas usando query params en lugar de ruta parametrizada
    // Esto evita conflicto con la ruta /:id que viene antes
    const response = await apiClient.get(`/asignaturas`, {
      params: {
        profesor_id: profesor.profesor_id
      }
    });

    // Mapear la respuesta del backend al formato esperado por el frontend
    const asignaturas = response.data.data || response.data;

    // Mapeo de nivel_id a nombre del nivel
    const nivelMap: Record<number, string> = {
      1: 'Primero Básico',
      2: 'Segundo Básico',
      3: 'Tercero Básico',
      4: 'Cuarto Básico',
      5: 'Quinto Básico',
      6: 'Sexto Básico',
      7: 'Séptimo Básico',
      8: 'Octavo Básico',
      9: 'Primero Medio',
      10: 'Segundo Medio',
      11: 'Tercero Medio',
      12: 'Cuarto Medio'
    };

    return asignaturas.map((asignatura: any) => {
      const nivelId = asignatura.Curso?.nivel_id;
      const nivelNombre = nivelId ? nivelMap[nivelId] || `Nivel ${nivelId}` : 'Sin nivel';

      return {
        asignatura_id: asignatura.asignatura_id,
        nombre: asignatura.nombre,
        codigo: asignatura.codigo,
        curso: {
          curso_id: asignatura.Curso?.curso_id || asignatura.curso_id,
          nombre: asignatura.Curso?.nombre || 'Sin curso',
          nivel: nivelNombre
        },
        total_estudiantes: 0, // No se muestra en la UI
        horas_semanales: asignatura.horas_semanales || 0,
        sala: asignatura.sala_id || 'Sin sala',
        periodo: asignatura.periodo || 'N/A'
      };
    });
  }

  /**
   * Obtiene los estudiantes de una asignatura específica
   * Primero obtiene la asignatura para saber el curso, luego obtiene las matrículas activas del curso
   */
  async getSubjectStudents(subjectId: string): Promise<Student[]> {
    try {
      // Obtener la asignatura para saber el curso_id
      const asignaturaResponse = await apiClient.get(`/asignaturas/${subjectId}`);
      const asignatura = asignaturaResponse.data;

      if (!asignatura || !asignatura.curso_id) {
        console.log('No se encontró asignatura o curso_id');
        return [];
      }

      // Obtener matrículas del curso (sin filtrar por estado para incluir todas)
      // Si solo quieres activas, agrega: estado_matricula_id: 1
      const matriculasResponse = await apiClient.get(`/matriculas`, {
        params: {
          curso_id: asignatura.curso_id
          // Sin filtro de estado_matricula_id para mostrar todas las matrículas
        }
      });

      const matriculas = matriculasResponse.data || [];

      if (matriculas.length === 0) {
        console.log('No se encontraron matrículas activas para el curso:', asignatura.curso_id);
        return [];
      }

      // Mapear al formato esperado - los estudiantes vienen en la relación Estudiante
      return matriculas.map((matricula: any, index: number) => ({
        estudiante_id: matricula.Estudiante?.estudiante_id || matricula.estudiante_id,
        nombre_completo: matricula.Estudiante?.nombre_completo || 'Sin nombre',
        rut: matricula.Estudiante?.rut || 'Sin RUT',
        numero_lista: index + 1, // Asignar número de lista secuencial
        promedio_asignatura: 0, // TODO: Calcular desde evaluaciones
        asistencia_porcentaje: 0, // TODO: Calcular desde asistencias
        total_anotaciones_positivas: 0,
        total_anotaciones_negativas: 0
      }))
      .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo)); // Ordenar alfabéticamente
    } catch (error) {
      console.error('Error obteniendo estudiantes de asignatura:', error);
      return [];
    }
  }

  // ========== EVALUACIONES ==========

  /**
   * Obtiene todas las evaluaciones del profesor (de todas sus asignaturas)
   * Útil para mostrar en el calendario
   */
  async getAllMyEvaluations(): Promise<Evaluation[]> {
    try {
      // Primero obtener las asignaturas del profesor
      const subjects = await this.getMySubjects();

      // Obtener evaluaciones de cada asignatura
      const evaluacionesPromises = subjects.map(subject =>
        this.getSubjectEvaluations(subject.asignatura_id)
      );

      const evaluacionesArrays = await Promise.all(evaluacionesPromises);

      // Aplanar el array de arrays y añadir info de asignatura
      const todasLasEvaluaciones: Evaluation[] = [];
      evaluacionesArrays.forEach((evaluaciones, index) => {
        evaluaciones.forEach(ev => {
          todasLasEvaluaciones.push({
            ...ev,
            asignatura_nombre: subjects[index].nombre,
            curso_nombre: subjects[index].curso.nombre
          } as any);
        });
      });

      return todasLasEvaluaciones;
    } catch (error) {
      console.error('Error obteniendo todas las evaluaciones:', error);
      return [];
    }
  }

  /**
   * Obtiene las evaluaciones de una asignatura
   * Usa el endpoint de evaluaciones por asignatura
   */
  async getSubjectEvaluations(subjectId: string): Promise<Evaluation[]> {
    try {
      const response = await apiClient.get(`/evaluaciones/asignatura/${subjectId}`);
      const evaluaciones = response.data.data || response.data || [];

      // Mapear al formato esperado
      return evaluaciones.map((evaluacion: any) => ({
        evaluacion_id: evaluacion.evaluacion_id,
        asignatura_id: evaluacion.asignatura_id,
        nombre: evaluacion.nombre,
        descripcion: evaluacion.descripcion || '',
        tipo: evaluacion.tipo,
        fecha_evaluacion: evaluacion.fecha_evaluacion,
        puntaje_maximo: evaluacion.puntaje_maximo,
        porcentaje_nota: evaluacion.porcentaje_nota,
        is_recuperativa: evaluacion.is_recuperativa || false,
        total_estudiantes_evaluados: evaluacion.total_estudiantes_evaluados || 0,
        total_estudiantes: evaluacion.total_estudiantes || 0,
        created_at: evaluacion.created_at
      }));
    } catch (error) {
      console.error('Error obteniendo evaluaciones:', error);
      return [];
    }
  }

  /**
   * Crea una nueva evaluación
   * POST /api/evaluaciones
   */
  async createEvaluation(data: EvaluationFormData): Promise<Evaluation> {
    const response = await apiClient.post(`/evaluaciones`, data);
    return response.data.evaluacion || response.data;
  }

  /**
   * Actualiza una evaluación existente
   * PUT /api/evaluaciones/:evaluationId
   */
  async updateEvaluation(evaluationId: number, data: Partial<EvaluationFormData>): Promise<Evaluation> {
    const response = await apiClient.put(`/evaluaciones/${evaluationId}`, data);
    return response.data.evaluacion || response.data;
  }

  /**
   * Elimina una evaluación
   * DELETE /api/evaluaciones/:evaluationId
   */
  async deleteEvaluation(evaluationId: number): Promise<void> {
    await apiClient.delete(`/evaluaciones/${evaluationId}`);
  }

  // ========== NOTAS ==========

  /**
   * Obtiene las notas de una evaluación
   * GET /api/resultados-evaluacion/evaluacion/:evaluacionId
   */
  async getEvaluationGrades(evaluationId: number): Promise<Grade[]> {
    try {
      const response = await apiClient.get(`/resultados-evaluacion/evaluacion/${evaluationId}`);
      const resultados = response.data.data || response.data || [];

      // Mapear al formato esperado por el frontend
      return resultados.map((resultado: any) => ({
        resultado_id: resultado.resultado_id,
        evaluacion_id: resultado.evaluacion_id,
        estudiante: {
          estudiante_id: resultado.Estudiante?.estudiante_id || resultado.estudiante_id,
          nombre_completo: resultado.Estudiante?.nombre_completo || 'Sin nombre',
          numero_lista: resultado.Estudiante?.numero_lista || 0
        },
        puntaje_obtenido: resultado.puntaje_obtenido,
        nota: resultado.nota,
        porcentaje: resultado.porcentaje,
        observaciones: resultado.observaciones || ''
      }));
    } catch (error) {
      console.error('Error obteniendo notas de evaluación:', error);
      return [];
    }
  }

  /**
   * Registra o actualiza la nota de un estudiante
   * POST /api/resultados-evaluacion
   * Se usa para crear nuevas notas
   */
  async saveGrade(data: GradeFormData): Promise<Grade> {
    try {
      const response = await apiClient.post('/resultados-evaluacion', data);
      const resultado = response.data.data || response.data;

      return {
        resultado_id: resultado.resultado_id,
        evaluacion_id: resultado.evaluacion_id,
        estudiante: {
          estudiante_id: data.estudiante_id,
          nombre_completo: resultado.estudiante?.nombre_completo || 'Sin nombre',
          numero_lista: resultado.estudiante?.numero_lista || 0
        },
        puntaje_obtenido: resultado.puntaje_obtenido,
        nota: resultado.nota,
        porcentaje: resultado.porcentaje,
        observaciones: resultado.observaciones || ''
      };
    } catch (error) {
      console.error('Error guardando nota:', error);
      throw error;
    }
  }

  /**
   * Actualiza una nota existente
   * PUT /api/resultados-evaluacion/:resultadoId
   */
  async updateGrade(gradeId: number, data: Partial<GradeFormData>): Promise<Grade> {
    try {
      const response = await apiClient.put(`/resultados-evaluacion/${gradeId}`, data);
      const resultado = response.data.data || response.data;

      return {
        resultado_id: resultado.resultado_id,
        evaluacion_id: resultado.evaluacion_id,
        estudiante: {
          estudiante_id: resultado.estudiante_id,
          nombre_completo: resultado.estudiante?.nombre_completo || 'Sin nombre',
          numero_lista: resultado.estudiante?.numero_lista || 0
        },
        puntaje_obtenido: resultado.puntaje_obtenido,
        nota: resultado.nota,
        porcentaje: resultado.porcentaje,
        observaciones: resultado.observaciones || ''
      };
    } catch (error) {
      console.error('Error actualizando nota:', error);
      throw error;
    }
  }

  // ========== ASISTENCIA ==========

  /**
   * Obtiene la asistencia de una asignatura en una fecha específica
   * GET /api/asistencias?asignatura_id=:id&fecha=:date
   */
  async getAttendance(subjectId: string, date: string): Promise<Attendance> {
    try {
      const response = await apiClient.get('/asistencias', {
        params: {
          asignatura_id: subjectId,
          fecha: date
        }
      });

      const asistencias = response.data.data || response.data || [];

      // Calcular estadísticas
      const total_estudiantes = asistencias.length;
      const presentes = asistencias.filter((a: any) => a.presente).length;
      const ausentes = total_estudiantes - presentes;
      const retrasos = asistencias.filter((a: any) => a.retraso_minutos > 0).length;
      const porcentaje_asistencia = total_estudiantes > 0 ? (presentes / total_estudiantes) * 100 : 0;

      return {
        attendance: asistencias.map((a: any) => ({
          estudiante_id: a.estudiante_id,
          nombre_completo: a.Estudiante?.nombre_completo || 'Sin nombre',
          numero_lista: a.Estudiante?.numero_lista || 0,
          presente: a.presente,
          retraso_minutos: a.retraso_minutos || 0,
          retiro_anticipado_minutos: a.retiro_anticipado_minutos || 0,
          justificado: a.justificado || false,
          observaciones: a.observaciones || ''
        })),
        stats: {
          total_estudiantes,
          presentes,
          ausentes,
          retrasos,
          porcentaje_asistencia
        }
      };
    } catch (error) {
      console.error('Error obteniendo asistencia:', error);
      return {
        attendance: [],
        stats: {
          total_estudiantes: 0,
          presentes: 0,
          ausentes: 0,
          retrasos: 0,
          porcentaje_asistencia: 0
        }
      };
    }
  }

  /**
   * Registra la asistencia de una clase usando endpoint bulk
   * POST /api/asistencias/bulk
   */
  async saveAttendance(data: AttendanceFormData): Promise<{ message: string; total_registros: number }> {
    try {
      // Formatear datos para el endpoint bulk
      const asistenciasBulk = data.asistencias.map(a => ({
        asignatura_id: data.asignatura_id,
        estudiante_id: a.estudiante_id,
        fecha: data.fecha,
        presente: a.presente,
        retraso_minutos: a.retraso_minutos || 0,
        retiro_anticipado_minutos: a.retiro_anticipado_minutos || 0,
        justificado: a.justificado || false,
        observaciones: a.observaciones || null
      }));

      const response = await apiClient.post('/asistencias/bulk', {
        asistencias: asistenciasBulk
      });

      return {
        message: response.data.message || 'Asistencia registrada exitosamente',
        total_registros: asistenciasBulk.length
      };
    } catch (error) {
      console.error('Error guardando asistencia:', error);
      throw error;
    }
  }

  // ========== ANOTACIONES/OBSERVACIONES ==========

  /**
   * Obtiene todas las observaciones con filtros opcionales
   * GET /api/teachers/observations?tipo=:tipo&asignatura_id=:id
   */
  async getAllObservations(filters?: {
    tipo?: 'positiva' | 'negativa';
    asignatura_id?: string;
    estudiante_id?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<Observation[]> {
    const response = await apiClient.get<{ observations: Observation[] }>('/teachers/observations', {
      params: filters
    });
    return response.data.observations;
  }

  /**
   * Obtiene las observaciones de un estudiante específico
   * GET /api/teachers/students/:studentId/observations
   */
  async getStudentObservations(studentId: string): Promise<{
    observations: Observation[];
    summary: { total_positivas: number; total_negativas: number };
  }> {
    const response = await apiClient.get<{
      observations: Observation[];
      summary: { total_positivas: number; total_negativas: number };
    }>(`/teachers/students/${studentId}/observations`);
    return response.data;
  }

  /**
   * Crea una nueva observación
   * POST /api/teachers/observations
   */
  async createObservation(data: ObservationFormData): Promise<Observation> {
    const response = await apiClient.post<{ observation: Observation }>('/teachers/observations', data);
    return response.data.observation;
  }

  /**
   * Actualiza una observación existente
   * PUT /api/teachers/observations/:observationId
   */
  async updateObservation(observationId: number, data: Partial<ObservationFormData>): Promise<Observation> {
    const response = await apiClient.put<{ observation: Observation }>(`/teachers/observations/${observationId}`, data);
    return response.data.observation;
  }

  /**
   * Elimina una observación
   * DELETE /api/teachers/observations/:observationId
   */
  async deleteObservation(observationId: number): Promise<void> {
    await apiClient.delete(`/teachers/observations/${observationId}`);
  }

  // ========== HORARIO ==========

  /**
   * Obtiene el horario semanal del profesor
   * GET /api/horarios/profesor/:profesorId
   */
  async getMySchedule(): Promise<Schedule[]> {
    try {
      // Primero obtener el profesor_id del usuario actual
      const userStr = localStorage.getItem('auth_user');
      if (!userStr) {
        console.error('No hay usuario autenticado');
        throw new Error('No hay usuario autenticado');
      }

      const user = JSON.parse(userStr);
      console.log('Usuario autenticado:', user.id);

      // Obtener el profesor_id
      const profesorResponse = await apiClient.get('/profesores');
      const profesores = profesorResponse.data;
      console.log('Total de profesores encontrados:', profesores.length);

      const profesor = profesores.find((p: any) => p.user_id === user.id);

      if (!profesor) {
        console.error('No se encontró el perfil de profesor para user_id:', user.id);
        throw new Error('No se encontró el perfil de profesor');
      }

      console.log('Profesor encontrado:', profesor.profesor_id, profesor.nombre_completo);

      // Obtener horarios del profesor
      console.log('Consultando horarios para profesor_id:', profesor.profesor_id);
      const response = await apiClient.get(`/horarios/profesor/${profesor.profesor_id}`);
      const horariosAgrupados = response.data.data || response.data || {};

      console.log('Respuesta del backend:', horariosAgrupados);

      // El backend devuelve un objeto agrupado por días: { "Lunes": [...], "Martes": [...], ... }
      // Necesitamos convertirlo a un array plano
      const horarios: any[] = [];

      // Extraer todos los horarios del objeto agrupado
      Object.values(horariosAgrupados).forEach((horariosDelDia: any) => {
        if (Array.isArray(horariosDelDia)) {
          horarios.push(...horariosDelDia);
        }
      });

      console.log('Horarios encontrados (después de aplanar):', horarios.length);

      if (horarios.length === 0) {
        console.warn('No se encontraron horarios para este profesor');
        return [];
      }

      // Mapear al formato esperado
      return horarios.map((horario: any) => ({
        horario_id: horario.horario_id,
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_termino: horario.hora_termino,
        asignatura: {
          nombre: horario.Asignatura?.nombre || 'Sin nombre',
          curso: horario.Asignatura?.Curso?.nombre || 'Sin curso',
          sala: horario.Sala?.nombre || horario.sala_id || 'Sin sala'
        }
      }));
    } catch (error: any) {
      console.error('Error obteniendo horario:', error);
      console.error('Detalle del error:', error.response?.data || error.message);
      return [];
    }
  }

  // ========== REPORTES ==========

  /**
   * Genera reporte de asistencia para una asignatura
   * GET /api/teachers/subjects/:subjectId/attendance-report?start_date=:startDate&end_date=:endDate
   */
  async getAttendanceReport(subjectId: string, startDate: string, endDate: string): Promise<AttendanceReport> {
    const response = await apiClient.get<{ report: AttendanceReport }>(
      `/teachers/subjects/${subjectId}/attendance-report`,
      {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      }
    );
    return response.data.report;
  }

  // ========== UTILIDADES ==========

  /**
   * Calcula la nota en escala chilena (1.0-7.0) basado en el puntaje
   * Nota mínima: 2.0
   * Nota de aprobación: 4.0 (60% del puntaje)
   * Nota máxima: 7.0 (100% del puntaje)
   */
  calculateGrade(score: number, maxScore: number): number {
    if (score < 0 || maxScore <= 0) return 2.0;

    const percentage = (score / maxScore) * 100;
    const minGrade = 2.0;
    const maxGrade = 7.0;
    const passingPercentage = 60;

    let grade: number;

    if (percentage < passingPercentage) {
      // 0% a 60% → 2.0 a 3.9
      grade = minGrade + (percentage / passingPercentage) * 1.9;
    } else {
      // 60% a 100% → 4.0 a 7.0
      grade = 4.0 + ((percentage - passingPercentage) / (100 - passingPercentage)) * 3.0;
    }

    // Redondear a 1 decimal
    return Math.round(grade * 10) / 10;
  }

  /**
   * Calcula el porcentaje obtenido
   */
  calculatePercentage(score: number, maxScore: number): number {
    if (maxScore <= 0) return 0;
    return Math.round((score / maxScore) * 1000) / 10; // 1 decimal
  }

  /**
   * Determina si una nota es aprobatoria (>= 4.0)
   */
  isPassing(grade: number): boolean {
    return grade >= 4.0;
  }

  /**
   * Obtiene el color/clase CSS según la nota
   */
  getGradeColorClass(grade: number): string {
    if (grade >= 6.0) return 'nota-excelente';
    if (grade >= 5.0) return 'nota-buena';
    if (grade >= 4.0) return 'nota-suficiente';
    return 'nota-insuficiente';
  }
}

export default new TeacherService();
