import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class DatosEstudianteController {
  /**
   * Obtener todas las respuestas
   */
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { encuesta_id, estudiante_id } = req.query

      let query = supabaseAdmin!
        .from('DatosEstudiante')
        .select(`
          *,
          Estudiante:estudiante_id (
            estudiante_id,
            nombre_completo,
            rut
          ),
          Encuesta:encuesta_id (
            encuesta_id,
            titulo,
            dirigida_a
          ),
          Tutor:contestado_por (
            tutor_id,
            nombre_completo
          )
        `)

      // Filtrar por encuesta si se proporciona
      if (encuesta_id) {
        query = query.eq('encuesta_id', encuesta_id)
      }

      // Filtrar por estudiante si se proporciona
      if (estudiante_id) {
        query = query.eq('estudiante_id', estudiante_id)
      }

      const { data, error } = await query.order('contestado_en', { ascending: false })

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo datos de estudiantes:', error)
      return res.status(500).json({ message: 'Error al obtener los datos' })
    }
  }

  /**
   * Obtener respuestas por estudiante
   */
  public async getByEstudiante(req: Request, res: Response): Promise<Response> {
    try {
      const { estudiante_id } = req.params

      const { data, error } = await supabaseAdmin!
        .from('DatosEstudiante')
        .select(`
          *,
          Encuesta:encuesta_id (
            encuesta_id,
            titulo,
            descripcion,
            dirigida_a
          ),
          Tutor:contestado_por (
            tutor_id,
            nombre_completo
          )
        `)
        .eq('estudiante_id', estudiante_id)
        .order('contestado_en', { ascending: false })

      if (error) throw error

      return res.json(data || [])
    } catch (error: any) {
      console.error('Error obteniendo respuestas del estudiante:', error)
      return res.status(500).json({ message: 'Error al obtener las respuestas' })
    }
  }

  /**
   * Obtener una respuesta específica
   */
  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { encuesta_id, estudiante_id } = req.params

      const { data, error } = await supabaseAdmin!
        .from('DatosEstudiante')
        .select(`
          *,
          Estudiante:estudiante_id (
            estudiante_id,
            nombre_completo,
            rut,
            email
          ),
          Encuesta:encuesta_id (
            encuesta_id,
            titulo,
            descripcion,
            template_encuesta
          ),
          Tutor:contestado_por (
            tutor_id,
            nombre_completo,
            email
          )
        `)
        .eq('encuesta_id', encuesta_id)
        .eq('estudiante_id', estudiante_id)
        .single()

      if (error || !data) {
        return res.status(404).json({ message: 'Respuesta no encontrada' })
      }

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo respuesta:', error)
      return res.status(500).json({ message: 'Error al obtener la respuesta' })
    }
  }

  /**
   * Crear/Actualizar respuesta de encuesta
   */
  public async upsert(req: Request, res: Response): Promise<Response> {
    try {
      const {
        encuesta_id,
        estudiante_id,
        contenido,
        contestado_por,
        contestada_correctemente
      } = req.body

      // Validar campos requeridos
      if (!encuesta_id || !estudiante_id || !contenido) {
        return res.status(400).json({
          message: 'Los campos encuesta_id, estudiante_id y contenido son requeridos'
        })
      }

      // Verificar si ya existe una respuesta
      const { data: existing } = await supabaseAdmin!
        .from('DatosEstudiante')
        .select('encuesta_id, estudiante_id')
        .eq('encuesta_id', encuesta_id)
        .eq('estudiante_id', estudiante_id)
        .maybeSingle()

      if (existing) {
        // Actualizar respuesta existente
        const { data, error } = await supabaseAdmin!
          .from('DatosEstudiante')
          .update({
            contenido,
            contestado_por,
            contestada_correctemente,
            contestado_en: new Date().toISOString()
          })
          .eq('encuesta_id', encuesta_id)
          .eq('estudiante_id', estudiante_id)
          .select()
          .single()

        if (error) throw error

        return res.json(data)
      } else {
        // Crear nueva respuesta
        const { data, error } = await supabaseAdmin!
          .from('DatosEstudiante')
          .insert({
            encuesta_id,
            estudiante_id,
            contenido,
            contestado_por,
            contestada_correctemente,
            contestado_en: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error

        return res.status(201).json(data)
      }
    } catch (error: any) {
      console.error('Error guardando respuesta:', error)
      return res.status(500).json({ message: 'Error al guardar la respuesta' })
    }
  }

  /**
   * Eliminar respuesta
   */
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { encuesta_id, estudiante_id } = req.params

      const { error } = await supabaseAdmin!
        .from('DatosEstudiante')
        .delete()
        .eq('encuesta_id', encuesta_id)
        .eq('estudiante_id', estudiante_id)

      if (error) throw error

      return res.json({ message: 'Respuesta eliminada exitosamente' })
    } catch (error: any) {
      console.error('Error eliminando respuesta:', error)
      return res.status(500).json({ message: 'Error al eliminar la respuesta' })
    }
  }

  /**
   * Obtener resumen de respuestas de una encuesta
   */
  public async getResumen(req: Request, res: Response): Promise<Response> {
    try {
      const { encuesta_id } = req.params

      // Contar total de respuestas
      const { count: totalRespuestas, error: totalError } = await supabaseAdmin!
        .from('DatosEstudiante')
        .select('*', { count: 'exact', head: true })
        .eq('encuesta_id', encuesta_id)

      if (totalError) throw totalError

      // Contar respuestas correctas
      const { count: respuestasCorrectas, error: correctasError } = await supabaseAdmin!
        .from('DatosEstudiante')
        .select('*', { count: 'exact', head: true })
        .eq('encuesta_id', encuesta_id)
        .eq('contestada_correctemente', true)

      if (correctasError) throw correctasError

      // Contar respuestas incorrectas
      const { count: respuestasIncorrectas, error: incorrectasError } = await supabaseAdmin!
        .from('DatosEstudiante')
        .select('*', { count: 'exact', head: true })
        .eq('encuesta_id', encuesta_id)
        .eq('contestada_correctemente', false)

      if (incorrectasError) throw incorrectasError

      return res.json({
        total_respuestas: totalRespuestas || 0,
        respuestas_correctas: respuestasCorrectas || 0,
        respuestas_incorrectas: respuestasIncorrectas || 0,
        porcentaje_correctas: totalRespuestas
          ? Math.round(((respuestasCorrectas || 0) / totalRespuestas) * 100)
          : 0
      })
    } catch (error: any) {
      console.error('Error obteniendo resumen:', error)
      return res.status(500).json({ message: 'Error al obtener el resumen' })
    }
  }
}
