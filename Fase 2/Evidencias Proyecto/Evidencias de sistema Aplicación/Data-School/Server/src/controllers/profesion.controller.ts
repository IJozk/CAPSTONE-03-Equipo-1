import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class ProfesionController {
  /**
   * Obtener todas las profesiones
   */
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { data, error } = await supabaseAdmin!
        .from('Profesion')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo profesiones:', error)
      return res.status(500).json({ message: 'Error al obtener las profesiones' })
    }
  }

  /**
   * Obtener una profesión por ID
   */
  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const { data, error } = await supabaseAdmin!
        .from('Profesion')
        .select('*')
        .eq('id_profesion', id)
        .single()

      if (error || !data) {
        return res.status(404).json({ message: 'Profesión no encontrada' })
      }

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo profesión:', error)
      return res.status(500).json({ message: 'Error al obtener la profesión' })
    }
  }

  /**
   * Crear nueva profesión
   */
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre, descripcion } = req.body

      // Validar campos requeridos
      if (!nombre) {
        return res.status(400).json({ message: 'El nombre es requerido' })
      }

      // Verificar que no exista una profesión con el mismo nombre
      const { data: existing, error: existingError } = await supabaseAdmin!
        .from('Profesion')
        .select('id_profesion')
        .ilike('nombre', nombre)
        .maybeSingle()

      if (existing) {
        return res.status(400).json({ message: 'Ya existe una profesión con ese nombre' })
      }

      // Crear profesión
      const { data, error } = await supabaseAdmin!
        .from('Profesion')
        .insert({
          nombre,
          descripcion
        })
        .select()
        .single()

      if (error) throw error

      return res.status(201).json(data)
    } catch (error: any) {
      console.error('Error creando profesión:', error)
      return res.status(500).json({ message: 'Error al crear la profesión' })
    }
  }

  /**
   * Actualizar profesión
   */
  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { nombre, descripcion } = req.body

      // Validar que la profesión existe
      const { data: existing, error: existingError } = await supabaseAdmin!
        .from('Profesion')
        .select('id_profesion')
        .eq('id_profesion', id)
        .single()

      if (existingError || !existing) {
        return res.status(404).json({ message: 'Profesión no encontrada' })
      }

      // Si se está actualizando el nombre, verificar que no exista otra profesión con ese nombre
      if (nombre) {
        const { data: duplicate, error: duplicateError } = await supabaseAdmin!
          .from('Profesion')
          .select('id_profesion')
          .ilike('nombre', nombre)
          .neq('id_profesion', id)
          .maybeSingle()

        if (duplicate) {
          return res.status(400).json({ message: 'Ya existe otra profesión con ese nombre' })
        }
      }

      // Actualizar
      const { data, error } = await supabaseAdmin!
        .from('Profesion')
        .update({
          nombre,
          descripcion
        })
        .eq('id_profesion', id)
        .select()
        .single()

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error actualizando profesión:', error)
      return res.status(500).json({ message: 'Error al actualizar la profesión' })
    }
  }

  /**
   * Eliminar profesión
   */
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar que no haya contratos asociados
      const { count, error: countError } = await supabaseAdmin!
        .from('Contrato')
        .select('*', { count: 'exact', head: true })
        .eq('id_profesion', id)

      if (countError) throw countError

      if (count && count > 0) {
        return res.status(400).json({
          message: `No se puede eliminar la profesión porque tiene ${count} contrato(s) asociado(s)`
        })
      }

      // Eliminar
      const { error } = await supabaseAdmin!
        .from('Profesion')
        .delete()
        .eq('id_profesion', id)

      if (error) throw error

      return res.json({ message: 'Profesión eliminada exitosamente' })
    } catch (error: any) {
      console.error('Error eliminando profesión:', error)
      return res.status(500).json({ message: 'Error al eliminar la profesión' })
    }
  }
}
