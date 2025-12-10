import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class AdminController {
  /**
   * Obtener estadísticas principales del dashboard
   * GET /api/admin/dashboard/stats
   */
  public async getDashboardStats(req: Request, res: Response): Promise<Response> {
    try {
      // Obtener totales
      const { count: totalUsuarios } = await supabaseAdmin!
        .from('User')
        .select('*', { count: 'exact', head: true })

      const { count: totalEstudiantes } = await supabaseAdmin!
        .from('Estudiante')
        .select('*', { count: 'exact', head: true })

      const { count: totalProfesores } = await supabaseAdmin!
        .from('Profesor')
        .select('*', { count: 'exact', head: true })

      const { count: totalCursos } = await supabaseAdmin!
        .from('Curso')
        .select('*', { count: 'exact', head: true })

      const { count: totalAsignaturas } = await supabaseAdmin!
        .from('Asignatura')
        .select('*', { count: 'exact', head: true })

      const { count: estudiantesActivos } = await supabaseAdmin!
        .from('Estudiante')
        .select('*', { count: 'exact', head: true })
        .eq('estado_activo', true)

      // Calcular asistencia promedio
      const { data: asistencias } = await supabaseAdmin!
        .from('Asistencia')
        .select('presente')
        .gte('fecha', new Date(new Date().getFullYear(), 0, 1).toISOString())

      let asistenciaPromedio = 0
      if (asistencias && asistencias.length > 0) {
        const presentes = asistencias.filter(a => a.presente).length
        asistenciaPromedio = (presentes / asistencias.length) * 100
      }

      // Calcular promedio general de notas
      const { data: resultados } = await supabaseAdmin!
        .from('ResultadoEvaluacion')
        .select('nota')
        .not('nota', 'is', null)

      let promedioGeneral = 0
      if (resultados && resultados.length > 0) {
        const suma = resultados.reduce((acc, r) => acc + (r.nota || 0), 0)
        promedioGeneral = suma / resultados.length
      }

      return res.json({
        total_usuarios: totalUsuarios || 0,
        total_estudiantes: totalEstudiantes || 0,
        total_profesores: totalProfesores || 0,
        total_cursos: totalCursos || 0,
        total_asignaturas: totalAsignaturas || 0,
        estudiantes_activos: estudiantesActivos || 0,
        asistencia_promedio: Math.round(asistenciaPromedio * 100) / 100,
        promedio_general_colegio: Math.round(promedioGeneral * 100) / 100
      })
    } catch (error: any) {
      console.error('Error obteniendo estadísticas del dashboard:', error)
      return res.status(500).json({ message: 'Error al obtener estadísticas del dashboard' })
    }
  }

  /**
   * Obtener actividad reciente
   * GET /api/admin/recent-activity?limit=10
   */
  public async getRecentActivity(req: Request, res: Response): Promise<Response> {
    try {
      const limit = parseInt(req.query.limit as string) || 10

      // Obtener matrículas recientes
      const { data: matriculas } = await supabaseAdmin!
        .from('Matricula')
        .select(`
          matricula_id,
          fecha_matricula,
          Estudiante (
            estudiante_id,
            nombre_completo
          ),
          Curso (
            curso_id,
            nombre
          )
        `)
        .order('fecha_matricula', { ascending: false })
        .limit(limit)

      const activities = (matriculas || []).map(m => ({
        id: m.matricula_id,
        tipo: 'matricula',
        descripcion: `${m.Estudiante?.nombre_completo} se matriculó en ${m.Curso?.nombre}`,
        fecha: m.fecha_matricula,
        usuario: m.Estudiante?.nombre_completo
      }))

      return res.json({ activities })
    } catch (error: any) {
      console.error('Error obteniendo actividad reciente:', error)
      return res.status(500).json({ message: 'Error al obtener actividad reciente' })
    }
  }

  /**
   * Obtener alertas del sistema
   * GET /api/admin/alerts?status=pending
   */
  public async getSystemAlerts(req: Request, res: Response): Promise<Response> {
    try {
      const status = req.query.status as string

      let query = supabaseAdmin!
        .from('Alerta')
        .select(`
          *,
          Estudiante (
            estudiante_id,
            nombre_completo
          ),
          TipoAlerta:tipo_alerta_id (
            tipo_alerta_id,
            nombre,
            descripcion,
            color_hex,
            nivel_prioridad,
            estado_activo
          )
        `)
        .order('fecha_alerta', { ascending: false })

      // Filtrar por estado si se proporciona
      if (status === 'pending') {
        query = query.eq('resuelta', false)
      } else if (status === 'resolved') {
        query = query.eq('resuelta', true)
      }

      const { data: alertas, error } = await query

      if (error) throw error

      const alerts = (alertas || []).map(a => ({
        alerta_id: a.alerta_id,
        tipo: a.TipoAlerta?.nombre || 'Sin tipo',
        titulo: a.titulo,
        prioridad: a.TipoAlerta?.nivel_prioridad || 1,
        color: a.TipoAlerta?.color_hex || '#gray',
        fecha_vencimiento: a.fecha_vencimiento,
        estado: a.estado ? 'RESUELTA' : 'PENDIENTE',
        estudiante: a.Estudiante ? {
          id: a.Estudiante.estudiante_id,
          nombre: a.Estudiante.nombre_completo
        } : null
      }))

      return res.json({ alerts })
    } catch (error: any) {
      console.error('Error obteniendo alertas del sistema:', error)
      return res.status(500).json({ message: 'Error al obtener alertas del sistema' })
    }
  }

  /**
   * Obtener resumen de cursos
   * GET /api/admin/courses/summary
   */
  public async getCourseSummary(req: Request, res: Response): Promise<Response> {
    try {
      const { data: cursos, error } = await supabaseAdmin!
        .from('Curso')
        .select(`
          curso_id,
          nombre,
          capacidad_maxima,
          NivelCurso:nivel_id (
            id,
            nivel,
            numero
          )
        `)
        .order('nombre', { ascending: true })

      if (error) throw error

      // Para cada curso, obtener estadísticas completas
      const coursesWithStats = await Promise.all(
        (cursos || []).map(async (curso) => {
          // Contar estudiantes matriculados
          const { count } = await supabaseAdmin!
            .from('Matricula')
            .select('*', { count: 'exact', head: true })
            .eq('curso_id', curso.curso_id)

          // Calcular promedio de notas del curso
          const { data: asignaturas } = await supabaseAdmin!
            .from('Asignatura')
            .select('asignatura_id')
            .eq('curso_id', curso.curso_id)

          let promedioCurso = 0
          if (asignaturas && asignaturas.length > 0) {
            const asignaturaIds = asignaturas.map(a => a.asignatura_id)

            const { data: evaluaciones } = await supabaseAdmin!
              .from('Evaluacion')
              .select('evaluacion_id')
              .in('asignatura_id', asignaturaIds)

            if (evaluaciones && evaluaciones.length > 0) {
              const evaluacionIds = evaluaciones.map(e => e.evaluacion_id)

              const { data: resultados } = await supabaseAdmin!
                .from('ResultadoEvaluacion')
                .select('nota')
                .in('evaluacion_id', evaluacionIds)
                .not('nota', 'is', null)

              if (resultados && resultados.length > 0) {
                const suma = resultados.reduce((acc, r) => acc + (r.nota || 0), 0)
                promedioCurso = suma / resultados.length
              }
            }
          }

          // Calcular asistencia promedio del curso
          let asistenciaPromedio = 0
          const { data: asistencias } = await supabaseAdmin!
            .from('Asistencia')
            .select('presente')
            .eq('curso_id', curso.curso_id)

          if (asistencias && asistencias.length > 0) {
            const presentes = asistencias.filter(a => a.presente).length
            asistenciaPromedio = (presentes / asistencias.length) * 100
          }

          return {
            curso_id: curso.curso_id,
            nombre: curso.nombre,
            nivel: curso.NivelCurso ? `${curso.NivelCurso.numero}° ${curso.NivelCurso.nivel}` : 'Sin nivel',
            total_estudiantes: count || 0,
            capacidad_maxima: curso.capacidad_maxima || 0,
            porcentaje_ocupacion: Math.round(((count || 0) / (curso.capacidad_maxima || 0) ) * 100),
            promedio_curso: Math.round(promedioCurso * 10) / 10,
            asistencia_promedio: Math.round(asistenciaPromedio * 10) / 10
          }
        })
      )

      return res.json({ courses: coursesWithStats })
    } catch (error: any) {
      console.error('Error obteniendo resumen de cursos:', error)
      return res.status(500).json({ message: 'Error al obtener resumen de cursos' })
    }
  }

  /**
   * Obtener estadísticas rápidas
   * GET /api/admin/quick-stats
   */
  public async getQuickStats(req: Request, res: Response): Promise<Response> {
    try {
      // Contar alertas pendientes
      const { count: alertasPendientes } = await supabaseAdmin!
        .from('Alerta')
        .select('*', { count: 'exact', head: true })
        .eq('resuelta', false)

      // Contar asistencias de hoy
      const hoy = new Date().toISOString().split('T')[0]
      const { count: asistenciasHoy } = await supabaseAdmin!
        .from('Asistencia')
        .select('*', { count: 'exact', head: true })
        .gte('fecha', hoy)
        .lt('fecha', new Date(Date.now() + 86400000).toISOString().split('T')[0])
        .eq('presente', true)

      // Contar evaluaciones pendientes
      const { count: evaluacionesPendientes } = await supabaseAdmin!
        .from('Evaluacion')
        .select('*', { count: 'exact', head: true })
        .gte('fecha', new Date().toISOString())

      // Contar matrículas del mes actual
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const { count: matriculasMes } = await supabaseAdmin!
        .from('Matricula')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_matricula', inicioMes)

      return res.json({
        alertas_pendientes: alertasPendientes || 0,
        asistencias_hoy: asistenciasHoy || 0,
        evaluaciones_pendientes: evaluacionesPendientes || 0,
        matriculas_mes: matriculasMes || 0
      })
    } catch (error: any) {
      console.error('Error obteniendo estadísticas rápidas:', error)
      return res.status(500).json({ message: 'Error al obtener estadísticas rápidas' })
    }
  }

  /**
   * Resolver una alerta
   * POST /api/admin/alerts/:id/resolve
   */
  public async resolveAlert(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const { error } = await supabaseAdmin!
        .from('Alerta')
        .update({
          resuelta: true,
          fecha_resolucion: new Date().toISOString()
        })
        .eq('alerta_id', Number(id))

      if (error) throw error

      return res.json({ message: 'Alerta resuelta exitosamente' })
    } catch (error: any) {
      console.error('Error resolviendo alerta:', error)
      return res.status(500).json({ message: 'Error al resolver alerta' })
    }
  }

  /**
   * Ignorar una alerta (marcar como resuelta sin acción)
   * POST /api/admin/alerts/:id/ignore
   */
  public async ignoreAlert(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const { error } = await supabaseAdmin!
        .from('Alerta')
        .update({
          resuelta: true,
          fecha_resolucion: new Date().toISOString()
        })
        .eq('alerta_id', Number(id))

      if (error) throw error

      return res.json({ message: 'Alerta ignorada exitosamente' })
    } catch (error: any) {
      console.error('Error ignorando alerta:', error)
      return res.status(500).json({ message: 'Error al ignorar alerta' })
    }
  }
}
