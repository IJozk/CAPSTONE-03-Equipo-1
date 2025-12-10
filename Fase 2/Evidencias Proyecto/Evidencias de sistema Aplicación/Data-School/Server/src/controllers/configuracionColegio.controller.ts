import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class ConfiguracionColegioController {
  /**
   * Obtener todas las configuraciones
   */
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { colegio_id, tipo } = req.query

      let query = supabaseAdmin!
        .from('ConfiguracionColegio')
        .select(`
          *,
          Colegio:colegio_id (
            colegio_id,
            nombre
          )
        `)

      // Filtrar por colegio si se proporciona
      if (colegio_id) {
        query = query.eq('colegio_id', colegio_id as string)
      }

      // Filtrar por tipo si se proporciona
      if (tipo) {
        query = query.eq('tipo', tipo as string)
      }

      const { data, error } = await query.order('clave', { ascending: true })

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo configuraciones:', error)
      return res.status(500).json({ message: 'Error al obtener las configuraciones' })
    }
  }

  /**
   * Obtener una configuración por ID
   */
  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const { data, error } = await supabaseAdmin!
        .from('ConfiguracionColegio')
        .select(`
          *,
          Colegio:colegio_id (
            colegio_id,
            nombre
          )
        `)
        .eq('config_id', id)
        .single()

      if (error || !data) {
        return res.status(404).json({ message: 'Configuración no encontrada' })
      }

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo configuración:', error)
      return res.status(500).json({ message: 'Error al obtener la configuración' })
    }
  }

  /**
   * Obtener configuración por clave
   */
  public async getByClave(req: Request, res: Response): Promise<Response> {
    try {
      const { clave } = req.params
      const { colegio_id } = req.query

      if (!colegio_id) {
        return res.status(400).json({ message: 'El colegio_id es requerido' })
      }

      const { data, error } = await supabaseAdmin!
        .from('ConfiguracionColegio')
        .select('*')
        .eq('clave', clave)
        .eq('colegio_id', colegio_id as string)
        .single()

      if (error || !data) {
        return res.status(404).json({ message: 'Configuración no encontrada' })
      }

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo configuración por clave:', error)
      return res.status(500).json({ message: 'Error al obtener la configuración' })
    }
  }

  /**
   * Crear nueva configuración
   */
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const { clave, valor, colegio_id, descripcion, tipo } = req.body

      // Validar campos requeridos
      if (!clave || !colegio_id) {
        return res.status(400).json({
          message: 'Los campos clave y colegio_id son requeridos'
        })
      }

      // Verificar que no exista una configuración con la misma clave para este colegio
      const { data: existing, error: existingError } = await supabaseAdmin!
        .from('ConfiguracionColegio')
        .select('config_id')
        .eq('clave', clave)
        .eq('colegio_id', colegio_id)
        .maybeSingle()

      if (existing) {
        return res.status(400).json({
          message: 'Ya existe una configuración con esta clave para este colegio'
        })
      }

      // Crear configuración
      const { data, error } = await supabaseAdmin!
        .from('ConfiguracionColegio')
        .insert({
          clave,
          valor,
          colegio_id,
          descripcion,
          tipo
        })
        .select()
        .single()

      if (error) throw error

      return res.status(201).json(data)
    } catch (error: any) {
      console.error('Error creando configuración:', error)
      return res.status(500).json({ message: 'Error al crear la configuración' })
    }
  }

  /**
   * Actualizar configuración
   */
  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { clave, valor, descripcion, tipo } = req.body

      // Validar que la configuración existe
      const { data: existing, error: existingError } = await supabaseAdmin!
        .from('ConfiguracionColegio')
        .select('config_id, colegio_id')
        .eq('config_id', id)
        .single()

      if (existingError || !existing) {
        return res.status(404).json({ message: 'Configuración no encontrada' })
      }

      // Si se está actualizando la clave, verificar que no exista otra con esa clave
      if (clave) {
        const { data: duplicate, error: duplicateError } = await supabaseAdmin!
          .from('ConfiguracionColegio')
          .select('config_id')
          .eq('clave', clave)
          .eq('colegio_id', existing.colegio_id)
          .neq('config_id', id)
          .maybeSingle()

        if (duplicate) {
          return res.status(400).json({
            message: 'Ya existe otra configuración con esa clave para este colegio'
          })
        }
      }

      // Preparar datos para actualizar
      const updateData: any = {}
      if (clave !== undefined) updateData.clave = clave
      if (valor !== undefined) updateData.valor = valor
      if (descripcion !== undefined) updateData.descripcion = descripcion
      if (tipo !== undefined) updateData.tipo = tipo
      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabaseAdmin!
        .from('ConfiguracionColegio')
        .update(updateData)
        .eq('config_id', id)
        .select()
        .single()

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error actualizando configuración:', error)
      return res.status(500).json({ message: 'Error al actualizar la configuración' })
    }
  }

  /**
   * Actualizar valor de configuración por clave
   */
  public async updateValor(req: Request, res: Response): Promise<Response> {
    try {
      const { clave } = req.params
      const { valor, colegio_id } = req.body

      if (!colegio_id) {
        return res.status(400).json({ message: 'El colegio_id es requerido' })
      }

      const { data, error } = await supabaseAdmin!
        .from('ConfiguracionColegio')
        .update({
          valor,
          updated_at: new Date().toISOString()
        })
        .eq('clave', clave)
        .eq('colegio_id', colegio_id)
        .select()
        .single()

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error actualizando valor:', error)
      return res.status(500).json({ message: 'Error al actualizar el valor' })
    }
  }

  /**
   * Eliminar configuración
   */
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const { error } = await supabaseAdmin!
        .from('ConfiguracionColegio')
        .delete()
        .eq('config_id', id)

      if (error) throw error

      return res.json({ message: 'Configuración eliminada exitosamente' })
    } catch (error: any) {
      console.error('Error eliminando configuración:', error)
      return res.status(500).json({ message: 'Error al eliminar la configuración' })
    }
  }

  /**
   * Obtener configuraciones agrupadas por tipo
   */
  public async getByTipo(req: Request, res: Response): Promise<Response> {
    try {
      const { colegio_id } = req.query

      if (!colegio_id) {
        return res.status(400).json({ message: 'El colegio_id es requerido' })
      }

      const { data, error } = await supabaseAdmin!
        .from('ConfiguracionColegio')
        .select('*')
        .eq('colegio_id', colegio_id as string)
        .order('tipo', { ascending: true })
        .order('clave', { ascending: true })

      if (error) throw error

      // Agrupar por tipo
      const grouped = (data || []).reduce((acc: any, config: any) => {
        const tipo = config.tipo || 'sin_tipo'
        if (!acc[tipo]) {
          acc[tipo] = []
        }
        acc[tipo].push(config)
        return acc
      }, {})

      return res.json(grouped)
    } catch (error: any) {
      console.error('Error obteniendo configuraciones por tipo:', error)
      return res.status(500).json({ message: 'Error al obtener las configuraciones' })
    }
  }
}
