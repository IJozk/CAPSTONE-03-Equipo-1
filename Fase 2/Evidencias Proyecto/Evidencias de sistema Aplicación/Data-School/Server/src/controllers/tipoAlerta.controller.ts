import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class TipoAlertaController {
  /**
   * Obtener todos los tipos de alerta
   */
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { estado_activo } = req.query

      let query = supabaseAdmin!
        .from('TipoAlerta')
        .select('*')
        .order('nivel_prioridad', { ascending: false })

      // Filtrar por estado si se proporciona
      if (estado_activo !== undefined) {
        query = query.eq('estado_activo', estado_activo === 'true')
      }

      const { data, error } = await query

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo tipos de alerta:', error)
      return res.status(500).json({ message: 'Error al obtener los tipos de alerta' })
    }
  }

  /**
   * Obtener un tipo de alerta por ID
   */
  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const { data, error } = await supabaseAdmin!
        .from('TipoAlerta')
        .select('*')
        .eq('tipo_alerta_id', id)
        .single()

      if (error || !data) {
        return res.status(404).json({ message: 'Tipo de alerta no encontrado' })
      }

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo tipo de alerta:', error)
      return res.status(500).json({ message: 'Error al obtener el tipo de alerta' })
    }
  }

  /**
   * Obtener tipos de alerta activos
   */
  public async getActivos(req: Request, res: Response): Promise<Response> {
    try {
      const { data, error } = await supabaseAdmin!
        .from('TipoAlerta')
        .select('*')
        .eq('estado_activo', true)
        .order('nivel_prioridad', { ascending: false })

      if (error) throw error

      return res.json(data || [])
    } catch (error: any) {
      console.error('Error obteniendo tipos de alerta activos:', error)
      return res.status(500).json({ message: 'Error al obtener los tipos de alerta activos' })
    }
  }

  /**
   * Crear nuevo tipo de alerta
   */
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const {
        nombre,
        descripcion,
        nivel_prioridad,
        color_hex,
        requiere_accion,
        estado_activo = true
      } = req.body

      // Validar campos requeridos
      if (!nombre) {
        return res.status(400).json({ message: 'El nombre es requerido' })
      }

      // Verificar que no exista un tipo con el mismo nombre
      const { data: existing, error: existingError } = await supabaseAdmin!
        .from('TipoAlerta')
        .select('tipo_alerta_id')
        .ilike('nombre', nombre)
        .maybeSingle()

      if (existing) {
        return res.status(400).json({ message: 'Ya existe un tipo de alerta con ese nombre' })
      }

      // Crear tipo de alerta
      const { data, error } = await supabaseAdmin!
        .from('TipoAlerta')
        .insert({
          nombre,
          descripcion,
          nivel_prioridad,
          color_hex,
          requiere_accion,
          estado_activo
        })
        .select()
        .single()

      if (error) throw error

      return res.status(201).json(data)
    } catch (error: any) {
      console.error('Error creando tipo de alerta:', error)
      return res.status(500).json({ message: 'Error al crear el tipo de alerta' })
    }
  }

  /**
   * Actualizar tipo de alerta
   */
  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const {
        nombre,
        descripcion,
        nivel_prioridad,
        color_hex,
        requiere_accion,
        estado_activo
      } = req.body

      // Validar que el tipo existe
      const { data: existing, error: existingError } = await supabaseAdmin!
        .from('TipoAlerta')
        .select('tipo_alerta_id')
        .eq('tipo_alerta_id', id)
        .single()

      if (existingError || !existing) {
        return res.status(404).json({ message: 'Tipo de alerta no encontrado' })
      }

      // Si se está actualizando el nombre, verificar que no exista otro tipo con ese nombre
      if (nombre) {
        const { data: duplicate, error: duplicateError } = await supabaseAdmin!
          .from('TipoAlerta')
          .select('tipo_alerta_id')
          .ilike('nombre', nombre)
          .neq('tipo_alerta_id', id)
          .maybeSingle()

        if (duplicate) {
          return res.status(400).json({ message: 'Ya existe otro tipo de alerta con ese nombre' })
        }
      }

      // Actualizar
      const { data, error } = await supabaseAdmin!
        .from('TipoAlerta')
        .update({
          nombre,
          descripcion,
          nivel_prioridad,
          color_hex,
          requiere_accion,
          estado_activo
        })
        .eq('tipo_alerta_id', id)
        .select()
        .single()

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error actualizando tipo de alerta:', error)
      return res.status(500).json({ message: 'Error al actualizar el tipo de alerta' })
    }
  }

  /**
   * Cambiar estado de tipo de alerta
   */
  public async cambiarEstado(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { estado_activo } = req.body

      if (estado_activo === undefined) {
        return res.status(400).json({ message: 'El estado_activo es requerido' })
      }

      const { data, error } = await supabaseAdmin!
        .from('TipoAlerta')
        .update({ estado_activo })
        .eq('tipo_alerta_id', id)
        .select()
        .single()

      if (error) throw error
      if (!data) {
        return res.status(404).json({ message: 'Tipo de alerta no encontrado' })
      }

      return res.json(data)
    } catch (error: any) {
      console.error('Error cambiando estado:', error)
      return res.status(500).json({ message: 'Error al cambiar el estado' })
    }
  }

  /**
   * Eliminar tipo de alerta
   */
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar que no haya alertas asociadas
      const { count, error: countError } = await supabaseAdmin!
        .from('Alerta')
        .select('*', { count: 'exact', head: true })
        .eq('tipo_alerta_id', id)

      if (countError) throw countError

      if (count && count > 0) {
        return res.status(400).json({
          message: `No se puede eliminar el tipo de alerta porque tiene ${count} alerta(s) asociada(s)`
        })
      }

      // Eliminar
      const { error } = await supabaseAdmin!
        .from('TipoAlerta')
        .delete()
        .eq('tipo_alerta_id', id)

      if (error) throw error

      return res.json({ message: 'Tipo de alerta eliminado exitosamente' })
    } catch (error: any) {
      console.error('Error eliminando tipo de alerta:', error)
      return res.status(500).json({ message: 'Error al eliminar el tipo de alerta' })
    }
  }
}
