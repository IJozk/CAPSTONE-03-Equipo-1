import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class TipoAsignaturaController {
  /**
   * Obtener todos los tipos de asignatura
   */
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { data, error } = await supabaseAdmin!
        .from('TipoAsignatura')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo tipos de asignatura:', error)
      return res.status(500).json({ message: 'Error al obtener los tipos de asignatura' })
    }
  }

  /**
   * Obtener un tipo de asignatura por ID
   */
  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const { data, error } = await supabaseAdmin!
        .from('TipoAsignatura')
        .select('*')
        .eq('tipo_asignatura_id', id)
        .single()

      if (error || !data) {
        return res.status(404).json({ message: 'Tipo de asignatura no encontrado' })
      }

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo tipo de asignatura:', error)
      return res.status(500).json({ message: 'Error al obtener el tipo de asignatura' })
    }
  }

  /**
   * Obtener asignaturas de este tipo
   */
  public async getAsignaturasByTipo(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const { data, error } = await supabaseAdmin!
        .from('Asignatura')
        .select(`
          *,
          Curso (
            curso_id,
            nombre
          ),
          Profesor (
            profesor_id,
            nombre_completo
          ),
          Materia (
            id,
            nombre
          )
        `)
        .eq('tipo_asignatura_id', id)
        .order('nombre', { ascending: true })

      if (error) throw error

      return res.json(data || [])
    } catch (error: any) {
      console.error('Error obteniendo asignaturas del tipo:', error)
      return res.status(500).json({ message: 'Error al obtener las asignaturas' })
    }
  }

  /**
   * Crear nuevo tipo de asignatura
   */
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre, descripcion } = req.body

      // Validar campos requeridos
      if (!nombre) {
        return res.status(400).json({ message: 'El nombre es requerido' })
      }

      // Verificar que no exista un tipo con el mismo nombre
      const { data: existing, error: existingError } = await supabaseAdmin!
        .from('TipoAsignatura')
        .select('tipo_asignatura_id')
        .ilike('nombre', nombre)
        .maybeSingle()

      if (existing) {
        return res.status(400).json({ message: 'Ya existe un tipo de asignatura con ese nombre' })
      }

      // Crear tipo de asignatura
      const { data, error } = await supabaseAdmin!
        .from('TipoAsignatura')
        .insert({
          nombre,
          descripcion
        })
        .select()
        .single()

      if (error) throw error

      return res.status(201).json(data)
    } catch (error: any) {
      console.error('Error creando tipo de asignatura:', error)
      return res.status(500).json({ message: 'Error al crear el tipo de asignatura' })
    }
  }

  /**
   * Actualizar tipo de asignatura
   */
  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { nombre, descripcion } = req.body

      // Validar que el tipo existe
      const { data: existing, error: existingError } = await supabaseAdmin!
        .from('TipoAsignatura')
        .select('tipo_asignatura_id')
        .eq('tipo_asignatura_id', id)
        .single()

      if (existingError || !existing) {
        return res.status(404).json({ message: 'Tipo de asignatura no encontrado' })
      }

      // Si se está actualizando el nombre, verificar que no exista otro tipo con ese nombre
      if (nombre) {
        const { data: duplicate, error: duplicateError } = await supabaseAdmin!
          .from('TipoAsignatura')
          .select('tipo_asignatura_id')
          .ilike('nombre', nombre)
          .neq('tipo_asignatura_id', id)
          .maybeSingle()

        if (duplicate) {
          return res.status(400).json({ message: 'Ya existe otro tipo de asignatura con ese nombre' })
        }
      }

      // Actualizar
      const { data, error } = await supabaseAdmin!
        .from('TipoAsignatura')
        .update({
          nombre,
          descripcion
        })
        .eq('tipo_asignatura_id', id)
        .select()
        .single()

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error actualizando tipo de asignatura:', error)
      return res.status(500).json({ message: 'Error al actualizar el tipo de asignatura' })
    }
  }

  /**
   * Eliminar tipo de asignatura
   */
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar que no haya asignaturas asociadas
      const { count, error: countError } = await supabaseAdmin!
        .from('Asignatura')
        .select('*', { count: 'exact', head: true })
        .eq('tipo_asignatura_id', id)

      if (countError) throw countError

      if (count && count > 0) {
        return res.status(400).json({
          message: `No se puede eliminar el tipo de asignatura porque tiene ${count} asignatura(s) asociada(s)`
        })
      }

      // Eliminar
      const { error } = await supabaseAdmin!
        .from('TipoAsignatura')
        .delete()
        .eq('tipo_asignatura_id', id)

      if (error) throw error

      return res.json({ message: 'Tipo de asignatura eliminado exitosamente' })
    } catch (error: any) {
      console.error('Error eliminando tipo de asignatura:', error)
      return res.status(500).json({ message: 'Error al eliminar el tipo de asignatura' })
    }
  }

  /**
   * Obtener estadísticas de tipos de asignatura
   */
  public async getEstadisticas(req: Request, res: Response): Promise<Response> {
    try {
      // Contar total de tipos
      const { count: totalTipos, error: tiposError } = await supabaseAdmin!
        .from('TipoAsignatura')
        .select('*', { count: 'exact', head: true })

      if (tiposError) throw tiposError

      // Obtener tipos con conteo de asignaturas
      const { data: tipos, error: asignaturasError } = await supabaseAdmin!
        .from('TipoAsignatura')
        .select(`
          tipo_asignatura_id,
          nombre,
          descripcion
        `)

      if (asignaturasError) throw asignaturasError

      // Para cada tipo, contar sus asignaturas
      const tiposConConteo = await Promise.all(
        (tipos || []).map(async (tipo) => {
          const { count } = await supabaseAdmin!
            .from('Asignatura')
            .select('*', { count: 'exact', head: true })
            .eq('tipo_asignatura_id', tipo.tipo_asignatura_id)

          return {
            ...tipo,
            total_asignaturas: count || 0
          }
        })
      )

      // Ordenar por total de asignaturas
      tiposConConteo.sort((a, b) => b.total_asignaturas - a.total_asignaturas)

      return res.json({
        total_tipos: totalTipos || 0,
        tipos: tiposConConteo,
        mas_usados: tiposConConteo.slice(0, 5)
      })
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error)
      return res.status(500).json({ message: 'Error al obtener las estadísticas' })
    }
  }
}
