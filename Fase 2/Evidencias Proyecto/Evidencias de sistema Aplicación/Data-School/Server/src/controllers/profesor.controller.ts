import { Request, Response } from 'express'
import profesorService from '@/services/profesor.service'
import { formatErrorResponse } from '@/utils/errors'
import { supabaseAdmin } from '@/config/supabase'

export class ProfesorController {
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const data = await profesorService.create(req.body)
      return res.status(201).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const incluirInactivos = req.query.incluir_inactivos === 'true'
      const data = await profesorService.getAll(incluirInactivos)
      return res.status(200).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const data = await profesorService.getById(req.params.id)
      return res.status(200).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const data = await profesorService.update(req.params.id, req.body)
      return res.status(200).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async disable(req: Request, res: Response): Promise<Response> {
    try {
      const data = await profesorService.disable(req.params.id)
      return res.status(200).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async enable(req: Request, res: Response): Promise<Response> {
    try {
      const data = await profesorService.enable(req.params.id)
      return res.status(200).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  // Dashboard del profesor con estadísticas completas
  public async getDashboard(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).userId

      console.log('🔍 getDashboard - userId from token:', userId)
      console.log('🔍 getDashboard - req.user:', (req as any).user)

      if (!userId) {
        console.log('❌ getDashboard - No userId found')
        return res.status(401).json({ error: 'No autenticado' })
      }

      if (!supabaseAdmin) {
        console.log('❌ getDashboard - No supabaseAdmin')
        return res.status(500).json({ error: 'Error de configuración del servidor' })
      }

      // 1. Obtener datos del profesor
      console.log('🔍 Querying Profesor table with user_id:', userId)
      const { data: profesor, error: profesorError } = await supabaseAdmin
        .from('Profesor')
        .select('profesor_id, nombre_completo, rut, telefono')
        .eq('user_id', userId)
        .single()

      console.log('🔍 Profesor query result:', { profesor, profesorError })

      if (profesorError || !profesor) {
        console.log('❌ No profesor found for user_id:', userId)
        console.log('❌ Error:', profesorError)
        return res.status(404).json({ error: 'Perfil de profesor no encontrado' })
      }

      // 2. Contar asignaturas activas
      const { count: total_asignaturas } = await supabaseAdmin
        .from('Asignatura')
        .select('*', { count: 'exact', head: true })
        .eq('profesor_id', profesor.profesor_id)
        .eq('estado_activo', true)

      // 3. Obtener asignaturas para otros cálculos
      const { data: asignaturas } = await supabaseAdmin
        .from('Asignatura')
        .select('asignatura_id, curso_id')
        .eq('profesor_id', profesor.profesor_id)
        .eq('estado_activo', true)

      const asignaturasIds = asignaturas?.map(a => a.asignatura_id) || []
      const cursosIds = asignaturas ? [...new Set(asignaturas.map(a => a.curso_id))] : []

      // 4. Contar estudiantes únicos en los cursos del profesor
      const { count: total_estudiantes } = await supabaseAdmin
        .from('Matricula')
        .select('estudiante_id', { count: 'exact', head: true })
        .in('curso_id', cursosIds.length > 0 ? cursosIds : [''])
        .eq('estado_matricula_id', 1)

      // 5. Total de cursos únicos
      const total_cursos = cursosIds.length

      // 6. Contar evaluaciones pendientes de revisión
      let evaluaciones_pendientes_revision = 0
      if (asignaturasIds.length > 0) {
        const { data: evaluaciones } = await supabaseAdmin
          .from('Evaluacion')
          .select('evaluacion_id')
          .in('asignatura_id', asignaturasIds)
          .lte('fecha_evaluacion', new Date().toISOString().split('T')[0])

        if (evaluaciones && evaluaciones.length > 0) {
          for (const evaluacion of evaluaciones) {
            const { count } = await supabaseAdmin
              .from('ResultadoEvaluacion')
              .select('*', { count: 'exact', head: true })
              .eq('evaluacion_id', evaluacion.evaluacion_id)
              .is('nota', null)

            evaluaciones_pendientes_revision += count || 0
          }
        }
      }

      // 7. Contar asistencias por registrar hoy
      const hoy = new Date().toISOString().split('T')[0]
      const diaSemana = new Date().getDay()

      let asistencias_por_registrar_hoy = 0
      if (asignaturasIds.length > 0 && diaSemana >= 1 && diaSemana <= 5) {
        const { data: horarios } = await supabaseAdmin
          .from('Horario')
          .select('asignatura_id')
          .in('asignatura_id', asignaturasIds)
          .eq('dia_semana', diaSemana)
          .eq('estado_activo', true)

        if (horarios && horarios.length > 0) {
          for (const horario of horarios) {
            const { count: asistenciasRegistradas } = await supabaseAdmin
              .from('Asistencia')
              .select('*', { count: 'exact', head: true })
              .eq('asignatura_id', horario.asignatura_id)
              .eq('fecha', hoy)

            if (!asistenciasRegistradas || asistenciasRegistradas === 0) {
              asistencias_por_registrar_hoy++
            }
          }
        }
      }

      // 8. Calcular promedio general de asignaturas
      let promedio_general_asignaturas = 0
      if (asignaturasIds.length > 0) {
        const { data: resultados } = await supabaseAdmin
          .from('ResultadoEvaluacion')
          .select('nota, Evaluacion!inner(asignatura_id)')
          .in('Evaluacion.asignatura_id', asignaturasIds)
          .not('nota', 'is', null)

        if (resultados && resultados.length > 0) {
          const suma = resultados.reduce((acc: number, r: any) => acc + (r.nota || 0), 0)
          promedio_general_asignaturas = Math.round((suma / resultados.length) * 10) / 10
        }
      }

      return res.status(200).json({
        profesor: {
          profesor_id: profesor.profesor_id,
          nombre_completo: profesor.nombre_completo,
          rut: profesor.rut,
          telefono: profesor.telefono
        },
        stats: {
          total_asignaturas: total_asignaturas || 0,
          total_estudiantes: total_estudiantes || 0,
          total_cursos: total_cursos || 0,
          evaluaciones_pendientes_revision: evaluaciones_pendientes_revision,
          asistencias_por_registrar_hoy: asistencias_por_registrar_hoy,
          promedio_general_asignaturas: promedio_general_asignaturas
        }
      })
    } catch (error: any) {
      console.error('Error en getDashboard:', error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  public async getUpcoming(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).userId

      console.log('🔍 getUpcoming - userId from token:', userId)

      if (!userId) {
        console.log('❌ getUpcoming - No userId found')
        return res.status(401).json({ error: 'No autenticado' })
      }

      if (!supabaseAdmin) {
        console.log('❌ getUpcoming - No supabaseAdmin')
        return res.status(500).json({ error: 'Error de configuración del servidor' })
      }

      console.log('🔍 getUpcoming - Querying Profesor table with user_id:', userId)
      const { data: profesor } = await supabaseAdmin
        .from('Profesor')
        .select('profesor_id')
        .eq('user_id', userId)
        .single()

      console.log('🔍 getUpcoming - Profesor query result:', profesor)

      if (!profesor) {
        console.log('❌ getUpcoming - No profesor found for user_id:', userId)
        return res.status(404).json({ error: 'Perfil de profesor no encontrado' })
      }

      // Obtener asignaturas del profesor
      const { data: asignaturas } = await supabaseAdmin
        .from('Asignatura')
        .select('asignatura_id, nombre, Curso(nombre)')
        .eq('profesor_id', profesor.profesor_id)
        .eq('estado_activo', true)

      const asignaturasIds = asignaturas?.map(a => a.asignatura_id) || []

      // 1. Obtener clases de hoy
      const hoy = new Date()
      const diaSemana = hoy.getDay()
      const fechaHoy = hoy.toISOString().split('T')[0]

      let clases_hoy: any[] = []
      if (asignaturasIds.length > 0 && diaSemana >= 1 && diaSemana <= 5) {
        const { data: horarios } = await supabaseAdmin
          .from('Horario')
          .select(`
            horario_id,
            asignatura_id,
            dia_semana,
            hora_inicio,
            hora_termino,
            Asignatura(asignatura_id, nombre, Curso(nombre)),
            Sala(nombre)
          `)
          .in('asignatura_id', asignaturasIds)
          .eq('dia_semana', diaSemana)
          .eq('estado_activo', true)
          .order('hora_inicio', { ascending: true })

        clases_hoy = horarios?.map((h: any) => ({
          horario_id: h.horario_id,
          asignatura_id: h.asignatura_id,
          asignatura: h.Asignatura?.nombre || 'Sin asignatura',
          curso: h.Asignatura?.Curso?.nombre || 'Sin curso',
          sala: h.Sala?.nombre || 'Sin sala',
          hora_inicio: h.hora_inicio,
          hora_termino: h.hora_termino,
          asistencia_registrada: false // Se actualizará después
        })) || []

        console.log('🔍 getUpcoming - Clases hoy before asistencia check:', clases_hoy)

        // Verificar si ya se registró asistencia
        for (const clase of clases_hoy) {
          if (clase.asignatura_id) {
            const { count } = await supabaseAdmin
              .from('Asistencia')
              .select('*', { count: 'exact', head: true })
              .eq('asignatura_id', clase.asignatura_id)
              .eq('fecha', fechaHoy)

            clase.asistencia_registrada = (count || 0) > 0
          }
        }
      }

      // 2. Obtener evaluaciones próximas (próximos 30 días)
      const en30Dias = new Date()
      en30Dias.setDate(hoy.getDate() + 30)

      let evaluaciones_proximas: any[] = []
      if (asignaturasIds.length > 0) {
        const { data: evaluaciones } = await supabaseAdmin
          .from('Evaluacion')
          .select(`
            evaluacion_id,
            nombre,
            fecha_evaluacion,
            tipo,
            asignatura_id,
            Asignatura(nombre, Curso(nombre))
          `)
          .in('asignatura_id', asignaturasIds)
          .gte('fecha_evaluacion', fechaHoy)
          .lte('fecha_evaluacion', en30Dias.toISOString().split('T')[0])
          .order('fecha_evaluacion', { ascending: true })
          .limit(10)

        if (supabaseAdmin) {
          evaluaciones_proximas = await Promise.all(
            (evaluaciones || []).map(async (ev: any) => {
              // Calcular días restantes
              const fechaEvaluacion = new Date(ev.fecha_evaluacion)
              const diasRestantes = Math.ceil((fechaEvaluacion.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

              // Determinar estado: verificar si ya se aplicó (tiene notas registradas)
              const { count: notasCount } = await supabaseAdmin!
                .from('ResultadoEvaluacion')
                .select('*', { count: 'exact', head: true })
                .eq('evaluacion_id', ev.evaluacion_id)

              let estado: 'por_aplicar' | 'por_revisar' | 'completada' = 'por_aplicar'

              if (notasCount && notasCount > 0) {
                // Si tiene notas, verificar si todas tienen nota final
                const { data: resultados } = await supabaseAdmin!
                  .from('ResultadoEvaluacion')
                  .select('nota')
                  .eq('evaluacion_id', ev.evaluacion_id)

                const todasCalificadas = resultados?.every(r => r.nota !== null)
                estado = todasCalificadas ? 'completada' : 'por_revisar'
              } else if (fechaEvaluacion <= hoy) {
                // Si la fecha ya pasó y no hay notas, está por revisar
                estado = 'por_revisar'
              }

              return {
                evaluacion_id: ev.evaluacion_id,
                nombre: ev.nombre,
                asignatura: ev.Asignatura?.nombre || 'Sin asignatura',
                curso: ev.Asignatura?.Curso?.nombre || 'Sin curso',
                fecha: ev.fecha_evaluacion,
                tipo: ev.tipo,
                dias_restantes: diasRestantes,
                estado: estado
              }
            })
          )
        }
      }

      console.log('🔍 getUpcoming - evaluaciones_proximas:', evaluaciones_proximas)

      return res.status(200).json({
        clases_hoy,
        evaluaciones_proximas
      })
    } catch (error: any) {
      console.error('Error en getUpcoming:', error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  // Obtener asignaturas del profesor autenticado
  public async getMySubjects(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).userId

      console.log('🔍 getMySubjects - userId from token:', userId)

      if (!userId) {
        console.log('❌ getMySubjects - No userId found')
        return res.status(401).json({ error: 'No autenticado' })
      }

      if (!supabaseAdmin) {
        console.log('❌ getMySubjects - No supabaseAdmin')
        return res.status(500).json({ error: 'Error de configuración del servidor' })
      }

      // Obtener datos del profesor
      console.log('🔍 getMySubjects - Querying Profesor table with user_id:', userId)
      const { data: profesor, error: profesorError } = await supabaseAdmin
        .from('Profesor')
        .select('profesor_id')
        .eq('user_id', userId)
        .single()

      console.log('🔍 getMySubjects - Profesor query result:', { profesor, profesorError })

      if (!profesor) {
        console.log('❌ getMySubjects - No profesor found for user_id:', userId)
        return res.status(404).json({ error: 'Perfil de profesor no encontrado' })
      }

      console.log('📚 getMySubjects - Querying Asignatura table with profesor_id:', profesor.profesor_id)

      // Obtener asignaturas con toda la información necesaria
      const { data: asignaturas, error } = await supabaseAdmin
        .from('Asignatura')
        .select(`
          *,
          Curso:curso_id (
            curso_id,
            nombre,
            nivel_id,
            sala_id,
            NivelCurso:nivel_id (
              id,
              nivel,
              numero
            )
          ),
          Sala:sala_id (
            sala_id,
            nombre
          ),
          TipoAsignatura:tipo_asignatura_id (
            tipo_asignatura_id,
            nombre
          )
        `)
        .eq('profesor_id', profesor.profesor_id)
        .eq('estado_activo', true)
        .order('nombre', { ascending: true })

      console.log('📚 getMySubjects - Asignaturas query result:', {
        count: asignaturas?.length || 0,
        error,
        asignaturas: asignaturas?.map(a => ({
          nombre: a.nombre,
          codigo: a.codigo,
          curso_nombre: a.Curso?.nombre,
          estado_activo: a.estado_activo
        }))
      })

      if (error) {
        console.error('❌ Error obteniendo asignaturas:', error)
        return res.status(500).json({ error: 'Error al obtener asignaturas' })
      }

      // Agregar conteos de estudiantes y evaluaciones
      const asignaturasConConteos = await Promise.all(
        (asignaturas || []).map(async (asignatura: any) => {
          // Contar estudiantes matriculados
          const { count: totalEstudiantes } = await supabaseAdmin!
            .from('Matricula')
            .select('*', { count: 'exact', head: true })
            .eq('curso_id', asignatura.curso_id)
            .eq('estado_matricula_id', 1)

          // Contar evaluaciones
          const { count: totalEvaluaciones } = await supabaseAdmin!
            .from('Evaluacion')
            .select('*', { count: 'exact', head: true })
            .eq('asignatura_id', asignatura.asignatura_id)

          return {
            ...asignatura,
            total_estudiantes: totalEstudiantes || 0,
            total_evaluaciones: totalEvaluaciones || 0
          }
        })
      )

      return res.status(200).json(asignaturasConConteos)
    } catch (error: any) {
      console.error('Error en getMySubjects:', error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}
