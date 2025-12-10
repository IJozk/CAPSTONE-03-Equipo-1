import { Request, Response } from 'express'
import { supabase, supabaseAdmin } from '@/config/supabase'
import {
  CreateCursoDto,
  UpdateCursoDto,
  FilterCursoDto,
  AsignarProfesorJefeDto
} from '@/models/curso'

export class CursoController {
  /**
   * Obtener todos los cursos con filtros opcionales
   */
  async getAll(req: Request, res: Response) {
    try {
      const {
        nivel_id,
        anio_academico,
        generacion
      } = req.query as unknown as FilterCursoDto

      const client = supabaseAdmin || supabase
      let query = client
        .from('Curso')
        .select('*')
        .order('nivel_id', { ascending: true })

      // Aplicar filtros
      if (nivel_id) {
        query = query.eq('nivel_id', nivel_id)
      }

      if (anio_academico) {
        query = query.eq('anio_academico', anio_academico)
      }

      if (generacion) {
        query = query.eq('generacion', generacion)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error obteniendo cursos:', error)
        return res.status(500).json({
          error: 'Error al obtener cursos',
          details: error.message
        })
      }

      return res.status(200).json({
        message: 'Cursos obtenidos exitosamente',
        data: data || [],
        count: data?.length || 0
      })
    } catch (error) {
      console.error('Error en getAll cursos:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener un curso por ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params

      if (!id) {
        return res.status(400).json({
          error: 'ID de curso es requerido'
        })
      }

      const client = supabaseAdmin || supabase
      const { data, error } = await client
        .from('Curso')
        .select('*')
        .eq('curso_id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Curso no encontrado'
          })
        }

        console.error('Error obteniendo curso:', error)
        return res.status(500).json({
          error: 'Error al obtener curso',
          details: error.message
        })
      }

      return res.status(200).json({
        message: 'Curso obtenido exitosamente',
        data
      })
    } catch (error) {
      console.error('Error en getById curso:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Crear un nuevo curso
   */
  async create(req: Request, res: Response) {
    try {
      const cursoData = req.body as CreateCursoDto

      // Validar campos requeridos
      if (!cursoData.nombre || !cursoData.nivel_id || !cursoData.anio_academico || !cursoData.generacion) {
        return res.status(400).json({
          error: 'Nombre, nivel, año académico y generación son requeridos' 
        })
      }

      const client = supabaseAdmin || supabase

      // Verificar si ya existe un curso con el mismo nombre y año
      const { data: existing } = await client
        .from('Curso')
        .select('curso_id')
        .eq('nombre', cursoData.nombre)
        .eq('anio_academico', cursoData.anio_academico)
        .single()

      if (existing) {
        return res.status(400).json({
          error: 'Ya existe un curso con este nombre en el año académico especificado'
        })
      }

      // Crear el curso
      const { data, error } = await client
        .from('Curso')
        .insert({
          nombre: cursoData.nombre,
          nivel_id: cursoData.nivel_id,
          anio_academico: cursoData.anio_academico,
          generacion: cursoData.generacion,
          capacidad_maxima: cursoData.capacidad_maxima || null,
          sala_id: cursoData.sala_id || null
        })
        .select()
        .single()

      if (error) {
        console.error('Error creando curso:', error)
        return res.status(500).json({
          error: 'Error al crear curso',
          details: error.message
        })
      }

      return res.status(201).json({
        message: 'Curso creado exitosamente',
        data
      })
    } catch (error) {
      console.error('Error en create curso:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Actualizar un curso existente
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const updateData = req.body as UpdateCursoDto

      if (!id) {
        return res.status(400).json({
          error: 'ID de curso es requerido'
        })
      }

      const client = supabaseAdmin || supabase

      // Verificar que el curso existe
      const { data: existing, error: existingError } = await client
        .from('Curso')
        .select('curso_id')
        .eq('curso_id', id)
        .single()

      if (existingError || !existing) {
        return res.status(404).json({
          error: 'Curso no encontrado'
        })
      }

      // Si se está actualizando el nombre y/o año académico, verificar que no exista duplicado
      if (updateData.nombre && updateData.anio_academico) {
        const { data: duplicate } = await client
          .from('Curso')
          .select('curso_id')
          .eq('nombre', updateData.nombre)
          .eq('anio_academico', updateData.anio_academico)
          .neq('curso_id', id)
          .maybeSingle()

        if (duplicate) {
          return res.status(400).json({
            error: 'Ya existe otro curso con este nombre en el año académico especificado'
          })
        }
      }

      // Actualizar el curso
      const { data, error } = await client
        .from('Curso')
        .update(updateData)
        .eq('curso_id', id)
        .select()
        .single()

      if (error) {
        console.log(updateData)
        console.error('Error actualizando curso:', error)
        return res.status(500).json({
          error: 'Error al actualizar curso',
          details: error.message
        })
      }

      return res.status(200).json({
        message: 'Curso actualizado exitosamente',
        data
      })
    } catch (error) {
      console.error('Error en update curso:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Eliminar un curso
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params

      if (!id) {
        return res.status(400).json({
          error: 'ID de curso es requerido'
        })
      }

      const client = supabaseAdmin || supabase

      // Verificar que el curso existe
      const { data: existing, error: existingError } = await client
        .from('Curso')
        .select('curso_id')
        .eq('curso_id', id)
        .single()

      if (existingError || !existing) {
        return res.status(404).json({
          error: 'Curso no encontrado'
        })
      }

      // Verificar si tiene asignaturas asociadas
      const { data: asignaturas } = await client
        .from('Asignatura')
        .select('asignatura_id')
        .eq('curso_id', id)
        .limit(1)

      if (asignaturas && asignaturas.length > 0) {
        return res.status(400).json({
          error: 'No se puede eliminar el curso porque tiene asignaturas asociadas'
        })
      }

      // Verificar si tiene estudiantes asociados
      const { data: estudiantes } = await client
        .from('Estudiante_Curso')
        .select('estudiante_curso_id')
        .eq('curso_id', id)
        .limit(1)

      if (estudiantes && estudiantes.length > 0) {
        return res.status(400).json({
          error: 'No se puede eliminar el curso porque tiene estudiantes asociados'
        })
      }

      // Eliminar el curso
      const { error } = await client
        .from('Curso')
        .delete()
        .eq('curso_id', id)

      if (error) {
        console.error('Error eliminando curso:', error)
        return res.status(500).json({
          error: 'Error al eliminar curso',
          details: error.message
        })
      }

      return res.status(200).json({
        message: 'Curso eliminado exitosamente'
      })
    } catch (error) {
      console.error('Error en delete curso:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener cursos por año académico
   */
  async getByAnio(req: Request, res: Response) {
    try {
      const { anio } = req.params

      if (!anio) {
        return res.status(400).json({
          error: 'Año académico es requerido'
        })
      }

      const client = supabaseAdmin || supabase
      const { data, error } = await client
        .from('Curso')
        .select('*')
        .eq('anio_academico', parseInt(anio))
        .order('nivel_id', { ascending: true })

      if (error) {
        console.error('Error obteniendo cursos por año:', error)
        return res.status(500).json({
          error: 'Error al obtener cursos',
          details: error.message
        })
      }

      return res.status(200).json({
        message: 'Cursos del año obtenidos exitosamente',
        data: data || [],
        count: data?.length || 0
      })
    } catch (error) {
      console.error('Error en getByAnio:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener estadísticas de un curso
   */
  async getStats(req: Request, res: Response) {
    try {
      const { id } = req.params

      if (!id) {
        return res.status(400).json({
          error: 'ID de curso es requerido'
        })
      }

      const client = supabaseAdmin || supabase

      // Obtener curso
      const { data: curso, error: cursoError } = await client
        .from('Curso')
        .select('*')
        .eq('curso_id', id)
        .single()

      if (cursoError || !curso) {
        return res.status(404).json({
          error: 'Curso no encontrado'
        })
      }

      // Contar asignaturas
      const { count: asignaturasCount } = await client
        .from('Asignatura')
        .select('*', { count: 'exact', head: true })
        .eq('curso_id', id)
        .eq('estado_activo', true)

      // Contar estudiantes con matrícula activa
      const { count: estudiantesCount } = await client
        .from('Matricula')
        .select('*', { count: 'exact', head: true })
        .eq('curso_id', id)
        .eq('estado_matricula_id', 1) // Solo matrículas activas

      // Calcular promedio de asistencia del curso
      let promedioAsistencia = 0
      const { data: estudiantesCurso } = await client
        .from('Matricula')
        .select('estudiante_id')
        .eq('curso_id', id)
        .eq('estado_matricula_id', 1) // Solo matrículas activas

      if (estudiantesCurso && estudiantesCurso.length > 0) {
        const estudianteIds = estudiantesCurso.map(ec => ec.estudiante_id)

        // Obtener asignaturas del curso
        const { data: asignaturas } = await client
          .from('Asignatura')
          .select('asignatura_id')
          .eq('curso_id', id)
          .eq('estado_activo', true)

        if (asignaturas && asignaturas.length > 0) {
          const asignaturaIds = asignaturas.map(a => a.asignatura_id)

          // Obtener todas las asistencias del curso
          const { data: asistencias } = await client
            .from('Asistencia')
            .select('presente')
            .in('estudiante_id', estudianteIds)
            .in('asignatura_id', asignaturaIds)

          if (asistencias && asistencias.length > 0) {
            const totalPresentes = asistencias.filter(a => a.presente).length
            promedioAsistencia = (totalPresentes / asistencias.length) * 100
          }
        }
      }

      // Calcular promedio de calificaciones del curso
      let promedioCalificaciones = 0
      if (estudiantesCurso && estudiantesCurso.length > 0) {
        const estudianteIds = estudiantesCurso.map(ec => ec.estudiante_id)

        // Obtener asignaturas del curso
        const { data: asignaturas } = await client
          .from('Asignatura')
          .select('asignatura_id')
          .eq('curso_id', id)
          .eq('estado_activo', true)

        if (asignaturas && asignaturas.length > 0) {
          const asignaturaIds = asignaturas.map(a => a.asignatura_id)

          // Obtener todas las evaluaciones del curso
          const { data: evaluaciones } = await client
            .from('Evaluacion')
            .select('evaluacion_id')
            .in('asignatura_id', asignaturaIds)

          if (evaluaciones && evaluaciones.length > 0) {
            const evaluacionIds = evaluaciones.map(e => e.evaluacion_id)

            // Obtener resultados de evaluaciones
            const { data: resultados } = await client
              .from('ResultadoEvaluacion')
              .select('nota')
              .in('evaluacion_id', evaluacionIds)
              .in('estudiante_id', estudianteIds)
              .not('nota', 'is', null)

            if (resultados && resultados.length > 0) {
              const sumaNotas = resultados.reduce((sum, r) => sum + (r.nota || 0), 0)
              promedioCalificaciones = sumaNotas / resultados.length
            }
          }
        }
      }

      return res.status(200).json({
        message: 'Estadísticas del curso obtenidas exitosamente',
        data: {
          curso,
          total_asignaturas: asignaturasCount || 0,
          total_estudiantes: estudiantesCount || 0,
          capacidad_disponible: curso.capacidad_maxima
            ? curso.capacidad_maxima - (estudiantesCount || 0)
            : null,
          promedio_asistencia: promedioAsistencia,
          promedio_calificaciones: promedioCalificaciones > 0 ? promedioCalificaciones : undefined
        }
      })
    } catch (error) {
      console.error('Error en getStats:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Asignar profesor jefe a un curso
   */
  async asignarProfesorJefe(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { profesor_jefe_id } = req.body as AsignarProfesorJefeDto

      if (!id) {
        return res.status(400).json({
          error: 'ID de curso es requerido'
        })
      }

      const client = supabaseAdmin || supabase

      // Verificar que el curso existe y obtener su año académico
      const { data: curso, error: cursoError } = await client
        .from('Curso')
        .select('curso_id, anio_academico, profesor_jefe_id')
        .eq('curso_id', id)
        .single()

      if (cursoError || !curso) {
        return res.status(404).json({
          error: 'Curso no encontrado'
        })
      }

      // Si se proporciona un profesor_jefe_id, verificar que existe
      if (profesor_jefe_id) {
        const { data: profesor, error: profesorError } = await client
          .from('Profesor')
          .select('profesor_id')
          .eq('profesor_id', profesor_jefe_id)
          .single()

        if (profesorError || !profesor) {
          return res.status(404).json({
            error: 'Profesor no encontrado'
          })
        }

        // Validar que el profesor no sea jefe de otro curso en el mismo período académico
        const { data: cursosExistentes, error: cursosError } = await client
          .from('Curso')
          .select('curso_id, nombre, anio_academico')
          .eq('profesor_jefe_id', profesor_jefe_id)
          .eq('anio_academico', curso.anio_academico)
          .neq('curso_id', id)

        if (cursosError) {
          console.error('Error verificando cursos existentes:', cursosError)
          return res.status(500).json({
            error: 'Error al validar asignación de profesor jefe',
            details: cursosError.message
          })
        }

        if (cursosExistentes && cursosExistentes.length > 0) {
          const cursoExistente = cursosExistentes[0]
          return res.status(400).json({
            error: 'El profesor ya está asignado como profesor jefe de otro curso',
            details: `El profesor ya es jefe del curso "${cursoExistente.nombre}" en el año académico ${cursoExistente.anio_academico}. Debe remover esa asignación antes de asignar al profesor a este curso.`,
            curso_existente: {
              curso_id: cursoExistente.curso_id,
              nombre: cursoExistente.nombre,
              anio_academico: cursoExistente.anio_academico
            }
          })
        }
      }

      // Actualizar el profesor jefe
      const { data, error } = await client
        .from('Curso')
        .update({ profesor_jefe_id })
        .eq('curso_id', id)
        .select(`
          *,
          profesor_jefe:Profesor(profesor_id, nombre_completo, rut, telefono)
        `)
        .single()

      if (error) {
        console.error('Error asignando profesor jefe:', error)
        return res.status(500).json({
          error: 'Error al asignar profesor jefe',
          details: error.message
        })
      }

      return res.status(200).json({
        message: profesor_jefe_id
          ? 'Profesor jefe asignado exitosamente'
          : 'Profesor jefe removido exitosamente',
        data
      })
    } catch (error) {
      console.error('Error en asignarProfesorJefe:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener cursos donde el profesor es profesor jefe
   */
  async getMisCursosComoProfesorJefe(req: Request, res: Response) {
    try {
      const userId = (req as any).userId

      if (!userId) {
        return res.status(401).json({
          error: 'No autenticado'
        })
      }

      const client = supabaseAdmin || supabase

      // Primero obtener el profesor_id basado en el user_id
      const { data: profesor, error: profesorError } = await client
        .from('Profesor')
        .select('profesor_id')
        .eq('user_id', userId)
        .single()

      if (profesorError || !profesor) {
        return res.status(404).json({
          error: 'Perfil de profesor no encontrado'
        })
      }

      // Ahora obtener los cursos donde es profesor jefe en el año académico actual
      const currentYear = new Date().getFullYear()

      const { data: cursos, error: cursosError } = await client
        .from('Curso')
        .select('*, NivelCurso(id, nivel, numero)')
        .eq('profesor_jefe_id', profesor.profesor_id)
        .eq('anio_academico', currentYear)
        .order('nivel_id', { ascending: true })

      if (cursosError) {
        console.error('Error obteniendo cursos como profesor jefe:', cursosError)
        return res.status(500).json({
          error: 'Error al obtener cursos',
          details: cursosError.message
        })
      }

      return res.status(200).json({
        message: 'Cursos como profesor jefe obtenidos exitosamente',
        data: cursos || [],
        count: cursos?.length || 0
      })
    } catch (error) {
      console.error('Error en getMisCursosComoProfesorJefe:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }
}
