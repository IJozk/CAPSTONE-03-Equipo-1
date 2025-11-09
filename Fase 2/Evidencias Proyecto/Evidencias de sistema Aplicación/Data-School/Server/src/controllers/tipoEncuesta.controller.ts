import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class TipoEncuestaController {
  /**
   * Obtener todos los tipos de encuesta
   */
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { activo } = req.query

      let query = supabaseAdmin!
        .from('TipoEncuesta')
        .select('*')

      // Filtrar por estado si se proporciona
      if (activo !== undefined) {
        query = query.eq('estado_activo', activo === 'true')
      }

      const { data, error } = await query.order('nombre_tipo', { ascending: true })

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo tipos de encuesta:', error)
      return res.status(500).json({ message: 'Error al obtener los tipos de encuesta' })
    }
  }

  /**
   * Obtener solo tipos de encuesta activos
   */
  public async getActivos(req: Request, res: Response): Promise<Response> {
    try {
      const { data, error } = await supabaseAdmin!
        .from('TipoEncuesta')
        .select('*')
        .eq('estado_activo', true)
        .order('nombre_tipo', { ascending: true })

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo tipos de encuesta activos:', error)
      return res.status(500).json({ message: 'Error al obtener los tipos de encuesta activos' })
    }
  }

  /**
   * Obtener un tipo de encuesta por ID
   */
  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const { data, error } = await supabaseAdmin!
        .from('TipoEncuesta')
        .select('*')
        .eq('tipo_encuesta_id', id)
        .single()

      if (error || !data) {
        return res.status(404).json({ message: 'Tipo de encuesta no encontrado' })
      }

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo tipo de encuesta:', error)
      return res.status(500).json({ message: 'Error al obtener el tipo de encuesta' })
    }
  }

  /**
   * Crear nuevo tipo de encuesta
   */
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre_tipo, descripcion, estado_activo = true } = req.body

      // Validar campos requeridos
      if (!nombre_tipo) {
        return res.status(400).json({ message: 'El nombre del tipo es requerido' })
      }

      // Verificar que no exista un tipo con el mismo nombre
      const { data: existing, error: existingError } = await supabaseAdmin!
        .from('TipoEncuesta')
        .select('tipo_encuesta_id')
        .ilike('nombre_tipo', nombre_tipo)
        .maybeSingle()

      if (existing) {
        return res.status(400).json({ message: 'Ya existe un tipo de encuesta con ese nombre' })
      }

      // Crear tipo de encuesta
      const { data, error } = await supabaseAdmin!
        .from('TipoEncuesta')
        .insert({
          nombre_tipo,
          descripcion,
          estado_activo
        })
        .select()
        .single()

      if (error) throw error

      return res.status(201).json(data)
    } catch (error: any) {
      console.error('Error creando tipo de encuesta:', error)
      return res.status(500).json({ message: 'Error al crear el tipo de encuesta' })
    }
  }

  /**
   * Actualizar tipo de encuesta
   */
  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { nombre_tipo, descripcion, estado_activo } = req.body

      // Validar que el tipo existe
      const { data: existing, error: existingError } = await supabaseAdmin!
        .from('TipoEncuesta')
        .select('tipo_encuesta_id')
        .eq('tipo_encuesta_id', id)
        .single()

      if (existingError || !existing) {
        return res.status(404).json({ message: 'Tipo de encuesta no encontrado' })
      }

      // Si se está actualizando el nombre, verificar que no exista otro tipo con ese nombre
      if (nombre_tipo) {
        const { data: duplicate, error: duplicateError } = await supabaseAdmin!
          .from('TipoEncuesta')
          .select('tipo_encuesta_id')
          .ilike('nombre_tipo', nombre_tipo)
          .neq('tipo_encuesta_id', id)
          .maybeSingle()

        if (duplicate) {
          return res.status(400).json({ message: 'Ya existe otro tipo de encuesta con ese nombre' })
        }
      }

      // Actualizar
      const updateData: any = {}
      if (nombre_tipo !== undefined) updateData.nombre_tipo = nombre_tipo
      if (descripcion !== undefined) updateData.descripcion = descripcion
      if (estado_activo !== undefined) updateData.estado_activo = estado_activo

      const { data, error } = await supabaseAdmin!
        .from('TipoEncuesta')
        .update(updateData)
        .eq('tipo_encuesta_id', id)
        .select()
        .single()

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error actualizando tipo de encuesta:', error)
      return res.status(500).json({ message: 'Error al actualizar el tipo de encuesta' })
    }
  }

  /**
   * Cambiar estado del tipo de encuesta
   */
  public async cambiarEstado(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { estado_activo } = req.body

      if (estado_activo === undefined) {
        return res.status(400).json({ message: 'El estado es requerido' })
      }

      const { data, error } = await supabaseAdmin!
        .from('TipoEncuesta')
        .update({ estado_activo })
        .eq('tipo_encuesta_id', id)
        .select()
        .single()

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error cambiando estado del tipo de encuesta:', error)
      return res.status(500).json({ message: 'Error al cambiar el estado' })
    }
  }

  /**
   * Eliminar tipo de encuesta
   */
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // TODO: Verificar si hay encuestas asociadas cuando se cree la tabla Encuesta
      // Por ahora, permitimos la eliminación directa

      // Eliminar
      const { error } = await supabaseAdmin!
        .from('TipoEncuesta')
        .delete()
        .eq('tipo_encuesta_id', id)

      if (error) throw error

      return res.json({ message: 'Tipo de encuesta eliminado exitosamente' })
    } catch (error: any) {
      console.error('Error eliminando tipo de encuesta:', error)
      return res.status(500).json({ message: 'Error al eliminar el tipo de encuesta' })
    }
  }

  /**
   * Obtener estadísticas de tipos de encuesta
   */
  public async getEstadisticas(req: Request, res: Response): Promise<Response> {
    try {
      // Contar total de tipos
      const { count: totalTipos, error: tiposError } = await supabaseAdmin!
        .from('TipoEncuesta')
        .select('*', { count: 'exact', head: true })

      if (tiposError) throw tiposError

      // Contar tipos activos
      const { count: tiposActivos, error: activosError } = await supabaseAdmin!
        .from('TipoEncuesta')
        .select('*', { count: 'exact', head: true })
        .eq('estado_activo', true)

      if (activosError) throw activosError

      // Contar tipos inactivos
      const { count: tiposInactivos, error: inactivosError } = await supabaseAdmin!
        .from('TipoEncuesta')
        .select('*', { count: 'exact', head: true })
        .eq('estado_activo', false)

      if (inactivosError) throw inactivosError

      return res.json({
        total_tipos: totalTipos || 0,
        tipos_activos: tiposActivos || 0,
        tipos_inactivos: tiposInactivos || 0
      })
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error)
      return res.status(500).json({ message: 'Error al obtener las estadísticas' })
    }
  }
}
