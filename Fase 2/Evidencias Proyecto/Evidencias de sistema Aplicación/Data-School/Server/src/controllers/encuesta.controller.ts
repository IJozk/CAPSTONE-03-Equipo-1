import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class EncuestaController {
  /**
   * Obtener todas las encuestas
   */
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { activo, dirigida_a } = req.query

      let query = supabaseAdmin!
        .from('Encuesta')
        .select(`
          *,
          TipoEncuesta:tipo_encuesta_id (
            tipo_encuesta_id,
            nombre_tipo,
            descripcion
          )
        `)

      // Filtrar por estado activo
      if (activo !== undefined) {
        query = query.eq('estado_activo', activo === 'true')
      }

      // Filtrar por dirigida_a
      if (dirigida_a) {
        query = query.eq('dirigida_a', dirigida_a)
      }

      const { data, error } = await query.order('fecha_inicio', { ascending: false })

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo encuestas:', error)
      return res.status(500).json({ message: 'Error al obtener las encuestas' })
    }
  }

  /**
   * Obtener encuestas activas
   */
  public async getActivas(req: Request, res: Response): Promise<Response> {
    try {
      const hoy = new Date().toISOString()

      const { data, error } = await supabaseAdmin!
        .from('Encuesta')
        .select(`
          *,
          TipoEncuesta:tipo_encuesta_id (
            tipo_encuesta_id,
            nombre_tipo,
            descripcion
          )
        `)
        .eq('estado_activo', true)
        .lte('fecha_inicio', hoy)
        .gte('fecha_fin', hoy)
        .order('fecha_inicio', { ascending: false })

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo encuestas activas:', error)
      return res.status(500).json({ message: 'Error al obtener encuestas activas' })
    }
  }

  /**
   * Obtener una encuesta por ID
   */
  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const { data, error } = await supabaseAdmin!
        .from('Encuesta')
        .select(`
          *,
          TipoEncuesta:tipo_encuesta_id (
            tipo_encuesta_id,
            nombre_tipo,
            descripcion
          )
        `)
        .eq('encuesta_id', id)
        .single()

      if (error || !data) {
        return res.status(404).json({ message: 'Encuesta no encontrada' })
      }

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo encuesta:', error)
      return res.status(500).json({ message: 'Error al obtener la encuesta' })
    }
  }

  /**
   * Obtener respuestas de una encuesta
   */
  public async getRespuestas(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const { data, error } = await supabaseAdmin!
        .from('DatosEstudiante')
        .select(`
          *,
          Estudiante (
            estudiante_id,
            nombre_completo,
            rut
          ),
          Tutor:contestado_por (
            tutor_id,
            nombre_completo
          )
        `)
        .eq('encuesta_id', id)
        .order('contestado_en', { ascending: false })

      if (error) throw error

      return res.json(data || [])
    } catch (error: any) {
      console.error('Error obteniendo respuestas:', error)
      return res.status(500).json({ message: 'Error al obtener las respuestas' })
    }
  }

  /**
   * Crear nueva encuesta
   */
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const {
        titulo,
        descripcion,
        dirigida_a,
        fecha_inicio,
        fecha_fin,
        tipo_encuesta_id,
        template_encuesta,
        estado_activo = true
      } = req.body

      // Validar campos requeridos
      if (!titulo || !dirigida_a || !fecha_inicio || !fecha_fin || !tipo_encuesta_id) {
        return res.status(400).json({
          message: 'Campos requeridos: titulo, dirigida_a, fecha_inicio, fecha_fin, tipo_encuesta_id'
        })
      }

      // Validar fechas
      if (new Date(fecha_fin) < new Date(fecha_inicio)) {
        return res.status(400).json({
          message: 'La fecha de fin debe ser posterior a la fecha de inicio'
        })
      }

      // Generar UUID para la encuesta
      const encuesta_id = crypto.randomUUID()

      // Crear encuesta
      const { data, error } = await supabaseAdmin!
        .from('Encuesta')
        .insert({
          encuesta_id,
          titulo,
          descripcion,
          dirigida_a,
          fecha_inicio,
          fecha_fin,
          tipo_encuesta_id,
          template_encuesta,
          estado_activo
        })
        .select()
        .single()

      if (error) throw error

      return res.status(201).json(data)
    } catch (error: any) {
      console.error('Error creando encuesta:', error)
      return res.status(500).json({ message: 'Error al crear la encuesta' })
    }
  }

  /**
   * Actualizar encuesta
   */
  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const {
        titulo,
        descripcion,
        dirigida_a,
        fecha_inicio,
        fecha_fin,
        tipo_encuesta_id,
        template_encuesta,
        estado_activo
      } = req.body

      // Validar que la encuesta existe
      const { data: existing, error: existingError } = await supabaseAdmin!
        .from('Encuesta')
        .select('encuesta_id')
        .eq('encuesta_id', id)
        .single()

      if (existingError || !existing) {
        return res.status(404).json({ message: 'Encuesta no encontrada' })
      }

      // Validar fechas si se están actualizando
      if (fecha_inicio && fecha_fin && new Date(fecha_fin) < new Date(fecha_inicio)) {
        return res.status(400).json({
          message: 'La fecha de fin debe ser posterior a la fecha de inicio'
        })
      }

      // Preparar datos para actualizar
      const updateData: any = {}
      if (titulo !== undefined) updateData.titulo = titulo
      if (descripcion !== undefined) updateData.descripcion = descripcion
      if (dirigida_a !== undefined) updateData.dirigida_a = dirigida_a
      if (fecha_inicio !== undefined) updateData.fecha_inicio = fecha_inicio
      if (fecha_fin !== undefined) updateData.fecha_fin = fecha_fin
      if (tipo_encuesta_id !== undefined) updateData.tipo_encuesta_id = tipo_encuesta_id
      if (template_encuesta !== undefined) updateData.template_encuesta = template_encuesta
      if (estado_activo !== undefined) updateData.estado_activo = estado_activo

      const { data, error } = await supabaseAdmin!
        .from('Encuesta')
        .update(updateData)
        .eq('encuesta_id', id)
        .select()
        .single()

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error actualizando encuesta:', error)
      return res.status(500).json({ message: 'Error al actualizar la encuesta' })
    }
  }

  /**
   * Cambiar estado de la encuesta
   */
  public async cambiarEstado(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { estado_activo } = req.body

      if (estado_activo === undefined) {
        return res.status(400).json({ message: 'El estado es requerido' })
      }

      const { data, error } = await supabaseAdmin!
        .from('Encuesta')
        .update({ estado_activo })
        .eq('encuesta_id', id)
        .select()
        .single()

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error cambiando estado:', error)
      return res.status(500).json({ message: 'Error al cambiar el estado' })
    }
  }

  /**
   * Eliminar encuesta
   */
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar si hay respuestas asociadas
      const { count, error: countError } = await supabaseAdmin!
        .from('DatosEstudiante')
        .select('*', { count: 'exact', head: true })
        .eq('encuesta_id', id)

      if (countError) throw countError

      if (count && count > 0) {
        return res.status(400).json({
          message: `No se puede eliminar la encuesta porque tiene ${count} respuesta(s) asociada(s)`
        })
      }

      // Eliminar
      const { error } = await supabaseAdmin!
        .from('Encuesta')
        .delete()
        .eq('encuesta_id', id)

      if (error) throw error

      return res.json({ message: 'Encuesta eliminada exitosamente' })
    } catch (error: any) {
      console.error('Error eliminando encuesta:', error)
      return res.status(500).json({ message: 'Error al eliminar la encuesta' })
    }
  }

  /**
   * Obtener estadísticas de una encuesta
   */
  public async getEstadisticas(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Contar respuestas totales
      const { count: totalRespuestas, error: respuestasError } = await supabaseAdmin!
        .from('DatosEstudiante')
        .select('*', { count: 'exact', head: true })
        .eq('encuesta_id', id)

      if (respuestasError) throw respuestasError

      // Contar respuestas correctas
      const { count: respuestasCorrectas, error: correctasError } = await supabaseAdmin!
        .from('DatosEstudiante')
        .select('*', { count: 'exact', head: true })
        .eq('encuesta_id', id)
        .eq('contestada_correctemente', true)

      if (correctasError) throw correctasError

      return res.json({
        total_respuestas: totalRespuestas || 0,
        respuestas_correctas: respuestasCorrectas || 0,
        porcentaje_correctas: totalRespuestas
          ? Math.round(((respuestasCorrectas || 0) / totalRespuestas) * 100)
          : 0
      })
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error)
      return res.status(500).json({ message: 'Error al obtener estadísticas' })
    }
  }
}
