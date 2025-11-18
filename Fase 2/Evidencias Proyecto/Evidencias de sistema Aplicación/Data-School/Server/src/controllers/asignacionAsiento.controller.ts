import { Request, Response } from 'express'
import { supabase, supabaseAdmin } from '@/config/supabase'

export class AsignacionAsientoController {
  /**
   * Obtener la distribución actual de asientos de un curso
   */
  async getCursoSeating(req: Request, res: Response) {
    try {
      const { curso_id } = req.params

      if (!curso_id) {
        return res.status(400).json({
          error: 'ID de curso es requerido'
        })
      }

      const client = supabaseAdmin || supabase

      // Obtener asientos actuales del curso
      const { data, error } = await client
        .from('AsignacionAsiento')
        .select(`
          *,
          Estudiante:estudiante_id (
            estudiante_id,
            nombre_completo,
            rut
          ),
          Sala:sala_id (
            sala_id,
            nombre,
            capacidad
          )
        `)
        .eq('curso_id', curso_id)
        .eq('es_actual', true)
        .order('num_asiento', { ascending: true })

      if (error) {
        console.error('Error obteniendo asientos del curso:', error)
        return res.status(500).json({
          error: 'Error al obtener distribución de asientos',
          details: error.message
        })
      }

      return res.status(200).json({
        message: 'Distribución de asientos obtenida exitosamente',
        data: data || []
      })
    } catch (error) {
      console.error('Error en getCursoSeating:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Guardar/actualizar la distribución completa de asientos de un curso
   */
  async saveCursoSeating(req: Request, res: Response) {
    try {
      const { curso_id } = req.params
      const { asientos, sala_id } = req.body

      // Validar datos requeridos
      if (!curso_id) {
        return res.status(400).json({
          error: 'ID de curso es requerido'
        })
      }

      if (!Array.isArray(asientos)) {
        return res.status(400).json({
          error: 'El campo "asientos" debe ser un array'
        })
      }

      const client = supabaseAdmin || supabase

      // Paso 1: Archivar asignaciones actuales (marcar como no actuales)
      const { error: archiveError } = await client
        .from('AsignacionAsiento')
        .update({ es_actual: false })
        .eq('curso_id', curso_id)
        .eq('es_actual', true)

      if (archiveError) {
        console.error('Error archivando asignaciones:', archiveError)
        return res.status(500).json({
          error: 'Error al archivar asignaciones anteriores',
          details: archiveError.message
        })
      }

      // Paso 2: Preparar nuevas asignaciones
      const nuevasAsignaciones = asientos
        .filter(asiento => asiento.estudiante_id) // Solo asientos ocupados
        .map(asiento => ({
          curso_id,
          estudiante_id: asiento.estudiante_id,
          num_asiento: asiento.position,
          sala_id: sala_id || null,
          es_actual: true,
          fecha_asignacion: new Date().toISOString()
        }))

      // Si no hay asientos ocupados, simplemente retornar éxito (todos fueron archivados)
      if (nuevasAsignaciones.length === 0) {
        return res.status(200).json({
          message: 'Distribución de asientos limpiada exitosamente',
          data: []
        })
      }

      // Paso 3: Insertar nuevas asignaciones
      const { data, error: insertError } = await client
        .from('AsignacionAsiento')
        .insert(nuevasAsignaciones)
        .select(`
          *,
          Estudiante:estudiante_id (
            estudiante_id,
            nombre_completo,
            rut
          )
        `)

      if (insertError) {
        console.error('Error insertando asignaciones:', insertError)
        return res.status(500).json({
          error: 'Error al guardar nuevas asignaciones',
          details: insertError.message
        })
      }

      return res.status(200).json({
        message: 'Distribución de asientos guardada exitosamente',
        data: data || []
      })
    } catch (error) {
      console.error('Error en saveCursoSeating:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Limpiar toda la distribución de asientos de un curso
   */
  async clearCursoSeating(req: Request, res: Response) {
    try {
      const { curso_id } = req.params

      if (!curso_id) {
        return res.status(400).json({
          error: 'ID de curso es requerido'
        })
      }

      const client = supabaseAdmin || supabase

      // Archivar todas las asignaciones actuales
      const { error } = await client
        .from('AsignacionAsiento')
        .update({ es_actual: false })
        .eq('curso_id', curso_id)
        .eq('es_actual', true)

      if (error) {
        console.error('Error limpiando asientos del curso:', error)
        return res.status(500).json({
          error: 'Error al limpiar distribución de asientos',
          details: error.message
        })
      }

      return res.status(200).json({
        message: 'Distribución de asientos limpiada exitosamente'
      })
    } catch (error) {
      console.error('Error en clearCursoSeating:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener historial de asignaciones de asientos de un curso
   */
  async getCursoSeatingHistory(req: Request, res: Response) {
    try {
      const { curso_id } = req.params

      if (!curso_id) {
        return res.status(400).json({
          error: 'ID de curso es requerido'
        })
      }

      const client = supabaseAdmin || supabase

      // Obtener todas las asignaciones (actuales y archivadas)
      const { data, error } = await client
        .from('AsignacionAsiento')
        .select(`
          *,
          Estudiante:estudiante_id (
            estudiante_id,
            nombre_completo,
            rut
          ),
          Sala:sala_id (
            sala_id,
            nombre,
            capacidad
          )
        `)
        .eq('curso_id', curso_id)
        .order('fecha_asignacion', { ascending: false })

      if (error) {
        console.error('Error obteniendo historial de asientos:', error)
        return res.status(500).json({
          error: 'Error al obtener historial',
          details: error.message
        })
      }

      return res.status(200).json({
        message: 'Historial de asignaciones obtenido exitosamente',
        data: data || []
      })
    } catch (error) {
      console.error('Error en getCursoSeatingHistory:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Asignar un estudiante a un asiento específico
   */
  async assignStudentToSeat(req: Request, res: Response) {
    try {
      const { curso_id } = req.params
      const { estudiante_id, num_asiento, sala_id } = req.body

      // Validar campos requeridos
      if (!curso_id || !estudiante_id || num_asiento === undefined) {
        return res.status(400).json({
          error: 'Los campos curso_id, estudiante_id y num_asiento son requeridos'
        })
      }

      const client = supabaseAdmin || supabase

      // Verificar si el asiento ya está ocupado
      const { data: ocupado, error: checkError } = await client
        .from('AsignacionAsiento')
        .select('asignacion_id, estudiante_id')
        .eq('curso_id', curso_id)
        .eq('num_asiento', num_asiento)
        .eq('es_actual', true)
        .maybeSingle()

      if (checkError) {
        console.error('Error verificando asiento:', checkError)
        return res.status(500).json({
          error: 'Error al verificar disponibilidad del asiento',
          details: checkError.message
        })
      }

      if (ocupado) {
        return res.status(400).json({
          error: 'El asiento ya está ocupado por otro estudiante'
        })
      }

      // Verificar si el estudiante ya tiene un asiento asignado
      const { data: estudianteAsiento, error: estudianteError } = await client
        .from('AsignacionAsiento')
        .select('asignacion_id, num_asiento')
        .eq('curso_id', curso_id)
        .eq('estudiante_id', estudiante_id)
        .eq('es_actual', true)
        .maybeSingle()

      // Si el estudiante ya tiene asiento, archivarlo
      if (estudianteAsiento) {
        await client
          .from('AsignacionAsiento')
          .update({ es_actual: false })
          .eq('asignacion_id', estudianteAsiento.asignacion_id)
      }

      // Crear nueva asignación
      const { data, error } = await client
        .from('AsignacionAsiento')
        .insert({
          curso_id,
          estudiante_id,
          num_asiento,
          sala_id: sala_id || null,
          es_actual: true,
          fecha_asignacion: new Date().toISOString()
        })
        .select(`
          *,
          Estudiante:estudiante_id (
            estudiante_id,
            nombre_completo,
            rut
          )
        `)
        .single()

      if (error) {
        console.error('Error asignando estudiante:', error)
        return res.status(500).json({
          error: 'Error al asignar estudiante al asiento',
          details: error.message
        })
      }

      return res.status(201).json({
        message: 'Estudiante asignado exitosamente',
        data
      })
    } catch (error) {
      console.error('Error en assignStudentToSeat:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Remover un estudiante de su asiento
   */
  async removeStudentFromSeat(req: Request, res: Response) {
    try {
      const { curso_id } = req.params
      const { estudiante_id } = req.body

      if (!curso_id || !estudiante_id) {
        return res.status(400).json({
          error: 'Los campos curso_id y estudiante_id son requeridos'
        })
      }

      const client = supabaseAdmin || supabase

      // Archivar la asignación del estudiante
      const { error } = await client
        .from('AsignacionAsiento')
        .update({ es_actual: false })
        .eq('curso_id', curso_id)
        .eq('estudiante_id', estudiante_id)
        .eq('es_actual', true)

      if (error) {
        console.error('Error removiendo estudiante:', error)
        return res.status(500).json({
          error: 'Error al remover estudiante del asiento',
          details: error.message
        })
      }

      return res.status(200).json({
        message: 'Estudiante removido del asiento exitosamente'
      })
    } catch (error) {
      console.error('Error en removeStudentFromSeat:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }
}
