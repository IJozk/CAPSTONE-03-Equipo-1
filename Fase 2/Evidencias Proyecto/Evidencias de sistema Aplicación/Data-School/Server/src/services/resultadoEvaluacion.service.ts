import { supabaseAdmin } from '@/config/supabase'
import {
  validateNumberRange,
  validateDate,
  validateNotFutureDate,
  sanitizeString
} from '@/validators/common.validator'
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  BusinessRuleError
} from '@/utils/errors'

export interface CreateResultadoDTO {
  evaluacion_id: string
  estudiante_id: string
  puntaje_obtenido: number
  observaciones?: string
  fecha_evaluacion?: string
}

export interface UpdateResultadoDTO {
  puntaje_obtenido?: number
  observaciones?: string
  fecha_evaluacion?: string
}

const NOTA_MINIMA = 1.0
const NOTA_MAXIMA = 7.0

export class ResultadoEvaluacionService {
  async create(data: CreateResultadoDTO) {
    if (!data.evaluacion_id || !data.estudiante_id || data.puntaje_obtenido === undefined) {
      throw new ValidationError('evaluacion_id, estudiante_id y puntaje_obtenido son requeridos')
    }

    const puntajeValidation = validateNumberRange(data.puntaje_obtenido, 0, Infinity, 'Puntaje obtenido')
    if (!puntajeValidation.valid) {
      throw new ValidationError(puntajeValidation.error!, 'puntaje_obtenido')
    }

    const { data: evaluacion, error: evalError } = await supabaseAdmin!
      .from('Evaluacion')
      .select('puntaje_maximo, asignatura_id, Asignatura(curso_id)')
      .eq('evaluacion_id', Number(data.evaluacion_id))
      .single()

    if (evalError || !evaluacion) {
      throw new NotFoundError('Evaluacion', data.evaluacion_id)
    }

    if (data.puntaje_obtenido > evaluacion.puntaje_maximo) {
      throw new BusinessRuleError(
        `El puntaje obtenido (${data.puntaje_obtenido}) no puede superar el puntaje máximo (${evaluacion.puntaje_maximo})`,
        'puntaje_excede_maximo'
      )
    }

    const { data: estudiante, error: estError } = await supabaseAdmin!
      .from('Estudiante')
      .select('estudiante_id')
      .eq('estudiante_id', data.estudiante_id)
      .single()

    if (estError || !estudiante) {
      throw new NotFoundError('Estudiante', data.estudiante_id)
    }

    const cursoId = (evaluacion.Asignatura as any)?.curso_id
    if (cursoId) {
      const { data: matricula } = await supabaseAdmin!
        .from('Matricula')
        .select('matricula_id')
        .eq('estudiante_id', data.estudiante_id)
        .eq('curso_id', cursoId)
        .eq('estado_matricula_id', 1)
        .maybeSingle()

      if (!matricula) {
        throw new BusinessRuleError(
          'El estudiante no está matriculado en el curso de esta asignatura',
          'estudiante_no_matriculado'
        )
      }
    }

    const { data: existente } = await supabaseAdmin!
      .from('ResultadoEvaluacion')
      .select('resultado_id')
      .eq('evaluacion_id', Number(data.evaluacion_id))
      .eq('estudiante_id', data.estudiante_id)
      .maybeSingle()

    if (existente) {
      throw new ConflictError(
        'Ya existe un resultado para este estudiante en esta evaluación',
        'duplicate_resultado'
      )
    }

    let fechaEvaluacion = data.fecha_evaluacion || new Date().toISOString().split('T')[0]

    if (data.fecha_evaluacion) {
      const fechaValidation = validateDate(data.fecha_evaluacion)
      if (!fechaValidation.valid) {
        throw new ValidationError(fechaValidation.error!, 'fecha_evaluacion')
      }

      const noFuturaValidation = validateNotFutureDate(data.fecha_evaluacion)
      if (!noFuturaValidation.valid) {
        throw new ValidationError(noFuturaValidation.error!, 'fecha_evaluacion')
      }
    }

    const porcentaje = (data.puntaje_obtenido / evaluacion.puntaje_maximo) * 100
    const nota = this.calcularNota(porcentaje)

    const observaciones = data.observaciones ? sanitizeString(data.observaciones) : undefined

    const { data: nuevoResultado, error } = await supabaseAdmin!
      .from('ResultadoEvaluacion')
      .insert({
        evaluacion_id: Number(data.evaluacion_id),
        estudiante_id: data.estudiante_id,
        puntaje_obtenido: data.puntaje_obtenido,
        porcentaje: parseFloat(porcentaje.toFixed(2)),
        nota: parseFloat(nota.toFixed(2)),
        observaciones,
        fecha_evaluacion: fechaEvaluacion
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error al crear resultado: ${error.message}`)
    }

    return nuevoResultado
  }

  async update(resultadoId: string, updateData: UpdateResultadoDTO) {
    const { data: resultado, error: resultadoError } = await supabaseAdmin!
      .from('ResultadoEvaluacion')
      .select('*, Evaluacion(puntaje_maximo)')
      .eq('resultado_id', Number(resultadoId))
      .single()

    if (resultadoError || !resultado) {
      throw new NotFoundError('ResultadoEvaluacion', resultadoId)
    }

    const fieldsToUpdate = Object.keys(updateData).filter(
      key => updateData[key as keyof UpdateResultadoDTO] !== undefined
    )

    if (fieldsToUpdate.length === 0) {
      throw new ValidationError('Debe proporcionar al menos un campo para actualizar')
    }

    const dataToUpdate: any = {}

    if (updateData.puntaje_obtenido !== undefined) {
      const puntajeValidation = validateNumberRange(updateData.puntaje_obtenido, 0, Infinity, 'Puntaje obtenido')
      if (!puntajeValidation.valid) {
        throw new ValidationError(puntajeValidation.error!, 'puntaje_obtenido')
      }

      const puntajeMaximo = (resultado.Evaluacion as any)?.puntaje_maximo
      if (updateData.puntaje_obtenido > puntajeMaximo) {
        throw new BusinessRuleError(
          `El puntaje obtenido (${updateData.puntaje_obtenido}) no puede superar el puntaje máximo (${puntajeMaximo})`,
          'puntaje_excede_maximo'
        )
      }

      const porcentaje = (updateData.puntaje_obtenido / puntajeMaximo) * 100
      const nota = this.calcularNota(porcentaje)

      dataToUpdate.puntaje_obtenido = updateData.puntaje_obtenido
      dataToUpdate.porcentaje = parseFloat(porcentaje.toFixed(2))
      dataToUpdate.nota = parseFloat(nota.toFixed(2))
    }

    if (updateData.observaciones !== undefined) {
      dataToUpdate.observaciones = sanitizeString(updateData.observaciones)
    }

    if (updateData.fecha_evaluacion !== undefined) {
      const fechaValidation = validateDate(updateData.fecha_evaluacion)
      if (!fechaValidation.valid) {
        throw new ValidationError(fechaValidation.error!, 'fecha_evaluacion')
      }

      const noFuturaValidation = validateNotFutureDate(updateData.fecha_evaluacion)
      if (!noFuturaValidation.valid) {
        throw new ValidationError(noFuturaValidation.error!, 'fecha_evaluacion')
      }

      dataToUpdate.fecha_evaluacion = updateData.fecha_evaluacion
    }

    dataToUpdate.updated_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin!
      .from('ResultadoEvaluacion')
      .update(dataToUpdate)
      .eq('resultado_id', Number(resultadoId))
      .select()
      .single()

    if (error) {
      throw new Error(`Error al actualizar resultado: ${error.message}`)
    }

    return data
  }

  private calcularNota(porcentaje: number): number {
    let nota: number

    if (porcentaje < 60) {
      nota = NOTA_MINIMA + (porcentaje / 60) * (4.0 - NOTA_MINIMA)
    } else {
      nota = 4.0 + ((porcentaje - 60) / 40) * (NOTA_MAXIMA - 4.0)
    }

    return Math.min(Math.max(nota, NOTA_MINIMA), NOTA_MAXIMA)
  }
}

export default new ResultadoEvaluacionService()
