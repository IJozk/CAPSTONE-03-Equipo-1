import { Request, Response } from 'express'
import { supabaseAdmin } from '../config/supabase'

export class EncuestaEstudianteController {
  /**
   * Obtener todas las respuestas de un estudiante
   */
  public async getByEstudiante(req: Request, res: Response): Promise<Response> {
    try {
      const { estudianteId } = req.params

      const { data, error } = await supabaseAdmin!
        .from('Encuesta_Estudiante')
        .select('*')
        .eq('estudiante_id', estudianteId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return res.status(200).json(data)
    } catch (error: any) {
      console.error('Error obteniendo respuestas de estudiante:', error)
      return res.status(500).json({ message: 'Error al obtener respuestas de encuestas' })
    }
  }

  /**
   * Obtener encuestas pendientes para un estudiante
   * (encuestas activas que el estudiante no ha respondido)
   */
  public async getPendientes(req: Request, res: Response): Promise<Response> {
    try {
      const { estudianteId } = req.params

      // Obtener encuestas activas dirigidas a estudiantes
      const { data: encuestasActivas, error: errorEncuestas } = await supabaseAdmin!
        .from('Encuesta')
        .select('*')
        .eq('dirigida_a', 'ESTUDIANTES')
        .eq('estado_activo', true)
        .lte('fecha_inicio', new Date().toISOString())
        .gte('fecha_fin', new Date().toISOString())

      if (errorEncuestas) throw errorEncuestas

      if (!encuestasActivas || encuestasActivas.length === 0) {
        return res.status(200).json([])
      }

      // Obtener encuestas ya respondidas por el estudiante
      const { data: respondidas, error: errorRespondidas } = await supabaseAdmin!
        .from('Encuesta_Estudiante')
        .select('id_encuesta')
        .eq('estudiante_id', estudianteId)

      if (errorRespondidas) throw errorRespondidas

      const encuestasRespondidasIds = respondidas?.map(r => r.id_encuesta) || []

      // Filtrar encuestas pendientes
      const encuestasPendientes = encuestasActivas
        .filter(encuesta => !encuestasRespondidasIds.includes(encuesta.encuesta_id))
        .map(encuesta => ({
          ...encuesta,
          ya_respondida: false
        }))

      return res.status(200).json(encuestasPendientes)
    } catch (error: any) {
      console.error('Error obteniendo encuestas pendientes:', error)
      return res.status(500).json({ message: 'Error al obtener encuestas pendientes' })
    }
  }

  /**
   * Obtener respuesta de una encuesta específica de un estudiante
   */
  public async getByEncuestaYEstudiante(req: Request, res: Response): Promise<Response> {
    try {
      const { encuestaId, estudianteId } = req.params

      const { data, error } = await supabaseAdmin!
        .from('Encuesta_Estudiante')
        .select('*')
        .eq('id_encuesta', encuestaId)
        .eq('estudiante_id', estudianteId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ message: 'Respuesta no encontrada' })
        }
        throw error
      }

      return res.status(200).json(data)
    } catch (error: any) {
      console.error('Error obteniendo respuesta de encuesta:', error)
      return res.status(500).json({ message: 'Error al obtener respuesta' })
    }
  }

  /**
   * Crear respuesta de encuesta
   */
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const { id_encuesta, estudiante_id, respuesta_encuesta, fecha_respuesta } = req.body

      // Validar campos requeridos
      if (!id_encuesta || !estudiante_id || !respuesta_encuesta) {
        return res.status(400).json({
          message: 'Campos requeridos: id_encuesta, estudiante_id, respuesta_encuesta'
        })
      }

      // Verificar que la encuesta existe y está activa
      const { data: encuesta, error: errorEncuesta } = await supabaseAdmin!
        .from('Encuesta')
        .select('*')
        .eq('encuesta_id', id_encuesta)
        .single()

      if (errorEncuesta || !encuesta) {
        return res.status(404).json({ message: 'Encuesta no encontrada' })
      }

      if (!encuesta.estado_activo) {
        return res.status(400).json({ message: 'La encuesta no está activa' })
      }

      // Verificar que el estudiante no haya respondido ya
      const { data: yaRespondida } = await supabaseAdmin!
        .from('Encuesta_Estudiante')
        .select('*')
        .eq('id_encuesta', id_encuesta)
        .eq('estudiante_id', estudiante_id)
        .single()

      if (yaRespondida) {
        return res.status(400).json({ message: 'Ya has respondido esta encuesta' })
      }

      // Crear respuesta
      const { data, error } = await supabaseAdmin!
        .from('Encuesta_Estudiante')
        .insert({
          id_encuesta,
          estudiante_id,
          respuesta_encuesta,
          fecha_respuesta: fecha_respuesta || new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return res.status(201).json(data)
    } catch (error: any) {
      console.error('Error creando respuesta de encuesta:', error)
      return res.status(500).json({ message: 'Error al guardar respuesta' })
    }
  }

  /**
   * Actualizar respuesta de encuesta
   */
  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { encuestaId, estudianteId } = req.params
      const { respuesta_encuesta, fecha_respuesta } = req.body

      const updateData: any = {}
      if (respuesta_encuesta) updateData.respuesta_encuesta = respuesta_encuesta
      if (fecha_respuesta) updateData.fecha_respuesta = fecha_respuesta

      const { data, error } = await supabaseAdmin!
        .from('Encuesta_Estudiante')
        .update(updateData)
        .eq('id_encuesta', encuestaId)
        .eq('estudiante_id', estudianteId)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ message: 'Respuesta no encontrada' })
        }
        throw error
      }

      return res.status(200).json(data)
    } catch (error: any) {
      console.error('Error actualizando respuesta:', error)
      return res.status(500).json({ message: 'Error al actualizar respuesta' })
    }
  }

  /**
   * Eliminar respuesta de encuesta
   */
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { encuestaId, estudianteId } = req.params

      const { error } = await supabaseAdmin!
        .from('Encuesta_Estudiante')
        .delete()
        .eq('id_encuesta', encuestaId)
        .eq('estudiante_id', estudianteId)

      if (error) throw error

      return res.status(200).json({ message: 'Respuesta eliminada exitosamente' })
    } catch (error: any) {
      console.error('Error eliminando respuesta:', error)
      return res.status(500).json({ message: 'Error al eliminar respuesta' })
    }
  }

  /**
   * Verificar si un estudiante ya respondió una encuesta
   */
  public async hasRespondido(req: Request, res: Response): Promise<Response> {
    try {
      const { encuestaId, estudianteId } = req.params

      const { data, error } = await supabaseAdmin!
        .from('Encuesta_Estudiante')
        .select('id_encuesta')
        .eq('id_encuesta', encuestaId)
        .eq('estudiante_id', estudianteId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return res.status(200).json({ respondida: !!data })
    } catch (error: any) {
      console.error('Error verificando respuesta:', error)
      return res.status(500).json({ message: 'Error al verificar respuesta' })
    }
  }

  /**
   * Obtener estadísticas de respuestas de una encuesta
   */
  public async getEstadisticas(req: Request, res: Response): Promise<Response> {
    try {
      const { encuestaId } = req.params

      const { data, error, count } = await supabaseAdmin!
        .from('Encuesta_Estudiante')
        .select('*', { count: 'exact' })
        .eq('id_encuesta', encuestaId)

      if (error) throw error

      return res.status(200).json({
        total_respuestas: count || 0,
        respuestas: data
      })
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error)
      return res.status(500).json({ message: 'Error al obtener estadísticas' })
    }
  }
}

export default new EncuestaEstudianteController()
