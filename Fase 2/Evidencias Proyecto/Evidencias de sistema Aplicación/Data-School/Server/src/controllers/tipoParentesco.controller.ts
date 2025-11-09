import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class TipoParentescoController {
  /**
   * Obtener todos los tipos de parentesco
   */
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { data, error } = await supabaseAdmin!
        .from('Tipo_parentesco')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo tipos de parentesco:', error)
      return res.status(500).json({ message: 'Error al obtener los tipos de parentesco' })
    }
  }

  /**
   * Obtener un tipo de parentesco por ID
   */
  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const { data, error } = await supabaseAdmin!
        .from('Tipo_parentesco')
        .select('*')
        .eq('tipo_parentesco_id', id)
        .single()

      if (error || !data) {
        return res.status(404).json({ message: 'Tipo de parentesco no encontrado' })
      }

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo tipo de parentesco:', error)
      return res.status(500).json({ message: 'Error al obtener el tipo de parentesco' })
    }
  }

  /**
   * Crear nuevo tipo de parentesco
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
        .from('Tipo_parentesco')
        .select('tipo_parentesco_id')
        .ilike('nombre', nombre)
        .maybeSingle()

      if (existing) {
        return res.status(400).json({ message: 'Ya existe un tipo de parentesco con ese nombre' })
      }

      // Crear tipo de parentesco
      const { data, error } = await supabaseAdmin!
        .from('Tipo_parentesco')
        .insert({
          nombre,
          descripcion
        })
        .select()
        .single()

      if (error) throw error

      return res.status(201).json(data)
    } catch (error: any) {
      console.error('Error creando tipo de parentesco:', error)
      return res.status(500).json({ message: 'Error al crear el tipo de parentesco' })
    }
  }

  /**
   * Actualizar tipo de parentesco
   */
  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { nombre, descripcion } = req.body

      // Validar que el tipo existe
      const { data: existing, error: existingError } = await supabaseAdmin!
        .from('Tipo_parentesco')
        .select('tipo_parentesco_id')
        .eq('tipo_parentesco_id', id)
        .single()

      if (existingError || !existing) {
        return res.status(404).json({ message: 'Tipo de parentesco no encontrado' })
      }

      // Si se está actualizando el nombre, verificar que no exista otro tipo con ese nombre
      if (nombre) {
        const { data: duplicate, error: duplicateError } = await supabaseAdmin!
          .from('Tipo_parentesco')
          .select('tipo_parentesco_id')
          .ilike('nombre', nombre)
          .neq('tipo_parentesco_id', id)
          .maybeSingle()

        if (duplicate) {
          return res.status(400).json({ message: 'Ya existe otro tipo de parentesco con ese nombre' })
        }
      }

      // Actualizar
      const { data, error } = await supabaseAdmin!
        .from('Tipo_parentesco')
        .update({
          nombre,
          descripcion
        })
        .eq('tipo_parentesco_id', id)
        .select()
        .single()

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error actualizando tipo de parentesco:', error)
      return res.status(500).json({ message: 'Error al actualizar el tipo de parentesco' })
    }
  }

  /**
   * Eliminar tipo de parentesco
   */
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar que no haya relaciones parentesco asociadas
      const { count, error: countError } = await supabaseAdmin!
        .from('Parentesco')
        .select('*', { count: 'exact', head: true })
        .eq('tipo_parentesco_id', id)

      if (countError) throw countError

      if (count && count > 0) {
        return res.status(400).json({
          message: `No se puede eliminar el tipo de parentesco porque tiene ${count} relación(es) asociada(s)`
        })
      }

      // Eliminar
      const { error } = await supabaseAdmin!
        .from('Tipo_parentesco')
        .delete()
        .eq('tipo_parentesco_id', id)

      if (error) throw error

      return res.json({ message: 'Tipo de parentesco eliminado exitosamente' })
    } catch (error: any) {
      console.error('Error eliminando tipo de parentesco:', error)
      return res.status(500).json({ message: 'Error al eliminar el tipo de parentesco' })
    }
  }
}
