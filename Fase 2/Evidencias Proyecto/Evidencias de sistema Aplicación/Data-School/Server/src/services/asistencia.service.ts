import { supabaseAdmin } from '@/config/supabase'
import {
  validateDate,
  validateNotFutureDate,
  validateNumberRange,
  sanitizeString
} from '@/validators/common.validator'
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  BusinessRuleError
} from '@/utils/errors'

export interface CreateAsistenciaDTO {
  estudiante_id: string
  asignatura_id: string
  fecha: string
  presente: boolean
  justificado?: boolean
  retraso_minutos?: number
  retiro_anticipado_minutos?: number
  observaciones?: string
  registrado_por?: string
}

export interface UpdateAsistenciaDTO {
  presente?: boolean
  justificado?: boolean
  retraso_minutos?: number
  retiro_anticipado_minutos?: number
  observaciones?: string
}

export class AsistenciaService {
  async create(data: CreateAsistenciaDTO) {
    if (!data.estudiante_id || !data.asignatura_id || !data.fecha || data.presente === undefined) {
      throw new ValidationError('estudiante_id, asignatura_id, fecha y presente son requeridos')
    }

    const fechaValidation = validateDate(data.fecha)
    if (!fechaValidation.valid) {
      throw new ValidationError(fechaValidation.error!, 'fecha')
    }

    const noFuturaValidation = validateNotFutureDate(data.fecha)
    if (!noFuturaValidation.valid) {
      throw new ValidationError(noFuturaValidation.error!, 'fecha')
    }

    const { data: estudiante, error: estError } = await supabaseAdmin!
      .from('Estudiante')
      .select('estudiante_id')
      .eq('estudiante_id', data.estudiante_id)
      .single()

    if (estError || !estudiante) {
      throw new NotFoundError('Estudiante', data.estudiante_id)
    }

    const { data: asignatura, error: asigError } = await supabaseAdmin!
      .from('Asignatura')
      .select('asignatura_id, curso_id')
      .eq('asignatura_id', data.asignatura_id)
      .single()

    if (asigError || !asignatura) {
      throw new NotFoundError('Asignatura', data.asignatura_id)
    }

    const { data: matricula } = await supabaseAdmin!
      .from('Matricula')
      .select('matricula_id')
      .eq('estudiante_id', data.estudiante_id)
      .eq('curso_id', asignatura.curso_id)
      .eq('estado_matricula_id', 1)
      .maybeSingle()

    if (!matricula) {
      throw new BusinessRuleError(
        'El estudiante no está matriculado en el curso de esta asignatura',
        'estudiante_no_matriculado'
      )
    }

    const { data: existente } = await supabaseAdmin!
      .from('Asistencia')
      .select('asistencia_id')
      .eq('estudiante_id', data.estudiante_id)
      .eq('asignatura_id', data.asignatura_id)
      .eq('fecha', data.fecha)
      .maybeSingle()

    if (existente) {
      throw new ConflictError(
        'Ya existe un registro de asistencia para este estudiante, asignatura y fecha',
        'duplicate_asistencia'
      )
    }

    if (data.retraso_minutos !== undefined) {
      const retrasoValidation = validateNumberRange(data.retraso_minutos, 0, 300, 'Retraso en minutos')
      if (!retrasoValidation.valid) {
        throw new ValidationError(retrasoValidation.error!, 'retraso_minutos')
      }
    }

    if (data.retiro_anticipado_minutos !== undefined) {
      const retiroValidation = validateNumberRange(data.retiro_anticipado_minutos, 0, 300, 'Retiro anticipado en minutos')
      if (!retiroValidation.valid) {
        throw new ValidationError(retiroValidation.error!, 'retiro_anticipado_minutos')
      }
    }

    const observaciones = data.observaciones ? sanitizeString(data.observaciones) : undefined

    const { data: nuevaAsistencia, error } = await supabaseAdmin!
      .from('Asistencia')
      .insert({
        estudiante_id: data.estudiante_id,
        asignatura_id: data.asignatura_id,
        fecha: data.fecha,
        presente: data.presente,
        justificado: data.justificado || false,
        retraso_minutos: data.retraso_minutos,
        retiro_anticipado_minutos: data.retiro_anticipado_minutos,
        observaciones,
        registrado_por: data.registrado_por
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error al crear asistencia: ${error.message}`)
    }

    return nuevaAsistencia
  }

  async update(asistenciaId: string, updateData: UpdateAsistenciaDTO) {
    const { data: asistencia, error: asistenciaError } = await supabaseAdmin!
      .from('Asistencia')
      .select('asistencia_id')
      .eq('asistencia_id', Number(asistenciaId))
      .single()

    if (asistenciaError || !asistencia) {
      throw new NotFoundError('Asistencia', asistenciaId)
    }

    const fieldsToUpdate = Object.keys(updateData).filter(
      key => updateData[key as keyof UpdateAsistenciaDTO] !== undefined
    )

    if (fieldsToUpdate.length === 0) {
      throw new ValidationError('Debe proporcionar al menos un campo para actualizar')
    }

    const dataToUpdate: any = {}

    if (updateData.presente !== undefined) {
      dataToUpdate.presente = updateData.presente
    }

    if (updateData.justificado !== undefined) {
      dataToUpdate.justificado = updateData.justificado
    }

    if (updateData.retraso_minutos !== undefined) {
      const retrasoValidation = validateNumberRange(updateData.retraso_minutos, 0, 300, 'Retraso en minutos')
      if (!retrasoValidation.valid) {
        throw new ValidationError(retrasoValidation.error!, 'retraso_minutos')
      }
      dataToUpdate.retraso_minutos = updateData.retraso_minutos
    }

    if (updateData.retiro_anticipado_minutos !== undefined) {
      const retiroValidation = validateNumberRange(updateData.retiro_anticipado_minutos, 0, 300, 'Retiro anticipado en minutos')
      if (!retiroValidation.valid) {
        throw new ValidationError(retiroValidation.error!, 'retiro_anticipado_minutos')
      }
      dataToUpdate.retiro_anticipado_minutos = updateData.retiro_anticipado_minutos
    }

    if (updateData.observaciones !== undefined) {
      dataToUpdate.observaciones = sanitizeString(updateData.observaciones)
    }

    const { data, error } = await supabaseAdmin!
      .from('Asistencia')
      .update(dataToUpdate)
      .eq('asistencia_id', Number(asistenciaId))
      .select()
      .single()

    if (error) {
      throw new Error(`Error al actualizar asistencia: ${error.message}`)
    }

    return data
  }
}

export default new AsistenciaService()
