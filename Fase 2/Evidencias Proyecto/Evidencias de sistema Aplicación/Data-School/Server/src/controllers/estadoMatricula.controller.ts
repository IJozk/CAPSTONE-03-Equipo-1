import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class EstadoMatriculaController {
  /**
   * Obtener todos los estados de matrícula
   */
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { data, error } = await supabaseAdmin!
        .from('EstadoMatricula')
        .select('*')
        .order('nombre_estado', { ascending: true })

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo estados de matrícula:', error)
      return res.status(500).json({ message: 'Error al obtener los estados de matrícula' })
    }
  }

  /**
   * Obtener estados que permiten asistencia
   */
  public async getConAsistencia(req: Request, res: Response): Promise<Response> {
    try {
      const { data, error } = await supabaseAdmin!
        .from('EstadoMatricula')
        .select('*')
        .eq('permite_asistencia', true)
        .order('nombre_estado', { ascending: true })

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo estados con asistencia:', error)
      return res.status(500).json({ message: 'Error al obtener los estados' })
    }
  }

  /**
   * Obtener estados que permiten evaluaciones
   */
  public async getConEvaluaciones(req: Request, res: Response): Promise<Response> {
    try {
      const { data, error } = await supabaseAdmin!
        .from('EstadoMatricula')
        .select('*')
        .eq('permite_evaluaciones', true)
        .order('nombre_estado', { ascending: true })

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo estados con evaluaciones:', error)
      return res.status(500).json({ message: 'Error al obtener los estados' })
    }
  }

  /**
   * Obtener un estado de matrícula por ID
   */
  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const { data, error } = await supabaseAdmin!
        .from('EstadoMatricula')
        .select('*')
        .eq('estado_matricula_id', id)
        .single()

      if (error || !data) {
        return res.status(404).json({ message: 'Estado de matrícula no encontrado' })
      }

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo estado de matrícula:', error)
      return res.status(500).json({ message: 'Error al obtener el estado de matrícula' })
    }
  }

  /**
   * Obtener matrículas con este estado
   */
  public async getMatriculasByEstado(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const { data, error } = await supabaseAdmin!
        .from('Matricula')
        .select(`
          *,
          Estudiante (
            estudiante_id,
            nombre_completo,
            rut
          ),
          Curso (
            curso_id,
            nombre
          ),
          AnioAcademico (
            anio_academico_id,
            anio,
            estado
          )
        `)
        .eq('estado_id', id)
        .order('fecha_matricula', { ascending: false })

      if (error) throw error

      return res.json(data || [])
    } catch (error: any) {
      console.error('Error obteniendo matrículas del estado:', error)
      return res.status(500).json({ message: 'Error al obtener las matrículas' })
    }
  }

  /**
   * Crear nuevo estado de matrícula
   */
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const {
        nombre_estado,
        descripcion,
        permite_asistencia = false,
        permite_evaluaciones = false
      } = req.body

      // Validar campos requeridos
      if (!nombre_estado) {
        return res.status(400).json({ message: 'El nombre del estado es requerido' })
      }

      // Verificar que no exista un estado con el mismo nombre
      const { data: existing, error: existingError } = await supabaseAdmin!
        .from('EstadoMatricula')
        .select('estado_matricula_id')
        .ilike('nombre_estado', nombre_estado)
        .maybeSingle()

      if (existing) {
        return res.status(400).json({ message: 'Ya existe un estado de matrícula con ese nombre' })
      }

      // Crear estado de matrícula
      const { data, error } = await supabaseAdmin!
        .from('EstadoMatricula')
        .insert({
          nombre_estado,
          descripcion,
          permite_asistencia,
          permite_evaluaciones
        })
        .select()
        .single()

      if (error) throw error

      return res.status(201).json(data)
    } catch (error: any) {
      console.error('Error creando estado de matrícula:', error)
      return res.status(500).json({ message: 'Error al crear el estado de matrícula' })
    }
  }

  /**
   * Actualizar estado de matrícula
   */
  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const {
        nombre_estado,
        descripcion,
        permite_asistencia,
        permite_evaluaciones
      } = req.body

      // Validar que el estado existe
      const { data: existing, error: existingError } = await supabaseAdmin!
        .from('EstadoMatricula')
        .select('estado_matricula_id')
        .eq('estado_matricula_id', id)
        .single()

      if (existingError || !existing) {
        return res.status(404).json({ message: 'Estado de matrícula no encontrado' })
      }

      // Si se está actualizando el nombre, verificar que no exista otro estado con ese nombre
      if (nombre_estado) {
        const { data: duplicate, error: duplicateError } = await supabaseAdmin!
          .from('EstadoMatricula')
          .select('estado_matricula_id')
          .ilike('nombre_estado', nombre_estado)
          .neq('estado_matricula_id', id)
          .maybeSingle()

        if (duplicate) {
          return res.status(400).json({ message: 'Ya existe otro estado de matrícula con ese nombre' })
        }
      }

      // Actualizar
      const updateData: any = {}
      if (nombre_estado !== undefined) updateData.nombre_estado = nombre_estado
      if (descripcion !== undefined) updateData.descripcion = descripcion
      if (permite_asistencia !== undefined) updateData.permite_asistencia = permite_asistencia
      if (permite_evaluaciones !== undefined) updateData.permite_evaluaciones = permite_evaluaciones

      const { data, error } = await supabaseAdmin!
        .from('EstadoMatricula')
        .update(updateData)
        .eq('estado_matricula_id', id)
        .select()
        .single()

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error actualizando estado de matrícula:', error)
      return res.status(500).json({ message: 'Error al actualizar el estado de matrícula' })
    }
  }

  /**
   * Eliminar estado de matrícula
   */
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar que no haya matrículas asociadas
      const { count, error: countError } = await supabaseAdmin!
        .from('Matricula')
        .select('*', { count: 'exact', head: true })
        .eq('estado_id', id)

      if (countError) throw countError

      if (count && count > 0) {
        return res.status(400).json({
          message: `No se puede eliminar el estado porque tiene ${count} matrícula(s) asociada(s)`
        })
      }

      // Eliminar
      const { error } = await supabaseAdmin!
        .from('EstadoMatricula')
        .delete()
        .eq('estado_matricula_id', id)

      if (error) throw error

      return res.json({ message: 'Estado de matrícula eliminado exitosamente' })
    } catch (error: any) {
      console.error('Error eliminando estado de matrícula:', error)
      return res.status(500).json({ message: 'Error al eliminar el estado de matrícula' })
    }
  }

  /**
   * Obtener estadísticas de estados de matrícula
   */
  public async getEstadisticas(req: Request, res: Response): Promise<Response> {
    try {
      // Contar total de estados
      const { count: totalEstados, error: estadosError } = await supabaseAdmin!
        .from('EstadoMatricula')
        .select('*', { count: 'exact', head: true })

      if (estadosError) throw estadosError

      // Obtener estados con conteo de matrículas
      const { data: estados, error: matriculasError } = await supabaseAdmin!
        .from('EstadoMatricula')
        .select(`
          estado_matricula_id,
          nombre_estado,
          descripcion,
          permite_asistencia,
          permite_evaluaciones
        `)

      if (matriculasError) throw matriculasError

      // Para cada estado, contar sus matrículas
      const estadosConConteo = await Promise.all(
        (estados || []).map(async (estado) => {
          const { count } = await supabaseAdmin!
            .from('Matricula')
            .select('*', { count: 'exact', head: true })
            .eq('estado_id', estado.estado_matricula_id)

          return {
            ...estado,
            total_matriculas: count || 0
          }
        })
      )

      // Ordenar por total de matrículas
      estadosConConteo.sort((a, b) => b.total_matriculas - a.total_matriculas)

      return res.json({
        total_estados: totalEstados || 0,
        estados: estadosConConteo,
        mas_usados: estadosConConteo.slice(0, 5)
      })
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error)
      return res.status(500).json({ message: 'Error al obtener las estadísticas' })
    }
  }
}
