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

      if (!sala_id) {
        return res.status(400).json({
          error: 'No se puede guardar la distribución de asientos sin una sala asignada',
          message: 'El curso debe tener una sala asignada. Contacta al administrador para asignar una sala primero.'
        })
      }

      if (!Array.isArray(asientos)) {
        return res.status(400).json({
          error: 'El campo "asientos" debe ser un array'
        })
      }

      const client = supabaseAdmin || supabase

      // Validar capacidad de la sala
      if (sala_id) {
        const { data: sala, error: salaError } = await client
          .from('Sala')
          .select('capacidad')
          .eq('sala_id', sala_id)
          .single()

        if (salaError) {
          return res.status(404).json({
            error: 'Sala no encontrada'
          })
        }

        // Contar asientos ocupados
        const asientosOcupados = asientos.filter(a => a.estudiante_id).length

        if (sala.capacidad && asientosOcupados > sala.capacidad) {
          return res.status(400).json({
            error: `La sala tiene una capacidad de ${sala.capacidad} estudiantes, pero se están intentando asignar ${asientosOcupados} estudiantes`,
            capacidad_sala: sala.capacidad,
            estudiantes_asignados: asientosOcupados
          })
        }
      }

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

  /**
   * Obtener el historial completo de asientos de un estudiante en un curso
   */
  async getStudentSeatHistory(req: Request, res: Response) {
    try {
      const { curso_id, estudiante_id } = req.params

      if (!curso_id || !estudiante_id) {
        return res.status(400).json({
          error: 'Los campos curso_id y estudiante_id son requeridos'
        })
      }

      const client = supabaseAdmin || supabase

      // Obtener todas las asignaciones del estudiante en este curso (actuales y archivadas)
      const { data, error } = await client
        .from('AsignacionAsiento')
        .select(`
          *,
          Sala:sala_id (
            sala_id,
            nombre,
            capacidad
          )
        `)
        .eq('curso_id', curso_id)
        .eq('estudiante_id', estudiante_id)
        .order('fecha_asignacion', { ascending: false })

      if (error) {
        console.error('Error obteniendo historial de asientos del estudiante:', error)
        return res.status(500).json({
          error: 'Error al obtener historial de asientos',
          details: error.message
        })
      }

      return res.status(200).json({
        message: 'Historial de asientos obtenido exitosamente',
        data: data || []
      })
    } catch (error) {
      console.error('Error en getStudentSeatHistory:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener la evolución del rendimiento académico de un estudiante por períodos de asiento
   * Calcula el promedio de notas del estudiante durante cada período en que estuvo sentado en un asiento
   */
  async getStudentPerformanceBySeat(req: Request, res: Response) {
    try {
      const { curso_id, estudiante_id } = req.params

      if (!curso_id || !estudiante_id) {
        return res.status(400).json({
          error: 'Los campos curso_id y estudiante_id son requeridos'
        })
      }

      const client = supabaseAdmin || supabase

      // Paso 1: Obtener el historial de asientos del estudiante (ordenado cronológicamente)
      const { data: seatHistory, error: seatError } = await client
        .from('AsignacionAsiento')
        .select('asignacion_id, num_asiento, fecha_asignacion, es_actual')
        .eq('curso_id', curso_id)
        .eq('estudiante_id', estudiante_id)
        .order('fecha_asignacion', { ascending: true })

      if (seatError) {
        console.error('Error obteniendo historial de asientos:', seatError)
        return res.status(500).json({
          error: 'Error al obtener historial de asientos',
          details: seatError.message
        })
      }

      if (!seatHistory || seatHistory.length === 0) {
        return res.status(200).json({
          message: 'No hay historial de asientos para este estudiante',
          data: []
        })
      }

      // Paso 2: Para cada período de asiento, calcular el rendimiento promedio
      const performanceData = []

      for (let i = 0; i < seatHistory.length; i++) {
        const currentSeat = seatHistory[i]
        const nextSeat = seatHistory[i + 1]

        // Determinar el rango de fechas del período
        const fechaInicio = currentSeat.fecha_asignacion
        const fechaFin = nextSeat ? nextSeat.fecha_asignacion : new Date().toISOString()

        // Obtener las notas del estudiante en este curso durante este período
        const { data: notas, error: notasError } = await client
          .from('Nota')
          .select(`
            nota_final,
            fecha_registro,
            Evaluacion!inner(
              evaluacion_id,
              nombre,
              fecha,
              Asignatura!inner(
                asignatura_id,
                nombre,
                codigo,
                curso_id
              )
            )
          `)
          .eq('estudiante_id', estudiante_id)
          .eq('Evaluacion.Asignatura.curso_id', curso_id)
          .gte('fecha_registro', fechaInicio)
          .lte('fecha_registro', fechaFin)

        if (notasError) {
          console.error('Error obteniendo notas:', notasError)
          // Continuar con el siguiente período en caso de error
          continue
        }

        // Calcular el promedio de notas para este período
        let promedio = 0
        let totalNotas = 0

        if (notas && notas.length > 0) {
          const sumaNotas = notas.reduce((sum, nota) => sum + (nota.nota_final || 0), 0)
          totalNotas = notas.length
          promedio = sumaNotas / totalNotas
        }

        performanceData.push({
          asignacion_id: currentSeat.asignacion_id,
          num_asiento: currentSeat.num_asiento,
          fecha_inicio: fechaInicio,
          fecha_fin: currentSeat.es_actual ? null : fechaFin,
          es_actual: currentSeat.es_actual,
          promedio: parseFloat(promedio.toFixed(2)),
          total_notas: totalNotas
        })
      }

      return res.status(200).json({
        message: 'Evolución de rendimiento obtenida exitosamente',
        data: performanceData
      })
    } catch (error) {
      console.error('Error en getStudentPerformanceBySeat:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }
}
