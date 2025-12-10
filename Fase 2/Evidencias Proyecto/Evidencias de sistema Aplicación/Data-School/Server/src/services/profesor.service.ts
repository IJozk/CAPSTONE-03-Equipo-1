import { supabaseAdmin } from '@/config/supabase'
import {
  validateRUT,
  formatRUT,
  validatePhone,
  sanitizeString
} from '@/validators/common.validator'
import {
  ValidationError,
  NotFoundError,
  ConflictError
} from '@/utils/errors'

export interface CreateProfesorDTO {
  user_id: string
  nombre_completo: string
  rut: string
  telefono?: string
}

export interface UpdateProfesorDTO {
  nombre_completo?: string
  rut?: string
  telefono?: string
}

export class ProfesorService {
  async create(data: CreateProfesorDTO) {
    if (!data.user_id || !data.nombre_completo || !data.rut) {
      throw new ValidationError('user_id, nombre_completo y rut son requeridos')
    }

    const nombreCompleto = sanitizeString(data.nombre_completo)
    if (nombreCompleto.length < 3) {
      throw new ValidationError('nombre_completo debe tener al menos 3 caracteres', 'nombre_completo')
    }

    const rutValidation = validateRUT(data.rut)
    if (!rutValidation.valid) {
      throw new ValidationError(rutValidation.error!, 'rut')
    }

    const rutFormateado = formatRUT(data.rut)

    const { data: existingRut } = await supabaseAdmin!
      .from('Profesor')
      .select('profesor_id, nombre_completo')
      .eq('rut', rutFormateado)
      .maybeSingle()

    if (existingRut) {
      throw new ConflictError(
        `Ya existe un profesor con el RUT ${rutFormateado}: ${existingRut.nombre_completo}`,
        'duplicate_rut'
      )
    }

    if (data.telefono) {
      const phoneValidation = validatePhone(data.telefono)
      if (!phoneValidation.valid) {
        throw new ValidationError(phoneValidation.error!, 'telefono')
      }
    }

    const { data: userData, error: userError } = await supabaseAdmin!
      .from('User')
      .select('role')
      .eq('user_id', data.user_id)
      .single()

    if (userError || !userData) {
      throw new NotFoundError('Usuario', data.user_id)
    }

    if (userData.role !== 'PROFESOR') {
      throw new ValidationError('El usuario debe tener rol PROFESOR', 'user_id')
    }

    const { data: nuevoProfesor, error } = await supabaseAdmin!
      .from('Profesor')
      .insert({
        user_id: data.user_id,
        nombre_completo: nombreCompleto,
        rut: rutFormateado,
        telefono: data.telefono as string,
        estado_activo: true
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error al crear profesor: ${error.message}`)
    }

    return nuevoProfesor
  }

  async getAll(incluirInactivos: boolean = false) {
    let query = supabaseAdmin!
      .from('Profesor')
      .select('*, User(email_address, is_active)')

    if (!incluirInactivos) {
      query = query.eq('estado_activo', true)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error al obtener profesores: ${error.message}`)
    }

    return data || []
  }

  async getById(profesorId: string) {
    const { data, error } = await supabaseAdmin!
      .from('Profesor')
      .select('*, User(email_address, is_active)')
      .eq('profesor_id', profesorId)
      .single()

    if (error || !data) {
      throw new NotFoundError('Profesor', profesorId)
    }

    return data
  }

  async update(profesorId: string, updateData: UpdateProfesorDTO) {
    await this.getById(profesorId)

    const fieldsToUpdate = Object.keys(updateData).filter(
      key => updateData[key as keyof UpdateProfesorDTO] !== undefined
    )

    if (fieldsToUpdate.length === 0) {
      throw new ValidationError('Debe proporcionar al menos un campo para actualizar')
    }

    const dataToUpdate: any = {}

    if (updateData.nombre_completo !== undefined) {
      const nombreCompleto = sanitizeString(updateData.nombre_completo)
      if (nombreCompleto.length < 3) {
        throw new ValidationError('nombre_completo debe tener al menos 3 caracteres', 'nombre_completo')
      }
      dataToUpdate.nombre_completo = nombreCompleto
    }

    if (updateData.rut !== undefined) {
      const rutValidation = validateRUT(updateData.rut)
      if (!rutValidation.valid) {
        throw new ValidationError(rutValidation.error!, 'rut')
      }

      const rutFormateado = formatRUT(updateData.rut)

      const { data: existingRut } = await supabaseAdmin!
        .from('Profesor')
        .select('profesor_id')
        .eq('rut', rutFormateado)
        .neq('profesor_id', profesorId)
        .maybeSingle()

      if (existingRut) {
        throw new ConflictError(`Ya existe otro profesor con el RUT ${rutFormateado}`, 'duplicate_rut')
      }

      dataToUpdate.rut = rutFormateado
    }

    if (updateData.telefono !== undefined) {
      const phoneValidation = validatePhone(updateData.telefono)
      if (!phoneValidation.valid) {
        throw new ValidationError(phoneValidation.error!, 'telefono')
      }
      dataToUpdate.telefono = updateData.telefono
    }

    dataToUpdate.updated_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin!
      .from('Profesor')
      .update(dataToUpdate)
      .eq('profesor_id', profesorId)
      .select()
      .single()

    if (error) {
      throw new Error(`Error al actualizar profesor: ${error.message}`)
    }

    return data
  }

  async disable(profesorId: string) {
    const profesor = await this.getById(profesorId)

    const { error: profesorError } = await supabaseAdmin!
      .from('Profesor')
      .update({ estado_activo: false, updated_at: new Date().toISOString() })
      .eq('profesor_id', profesorId)

    if (profesorError) {
      throw new Error(`Error al deshabilitar profesor: ${profesorError.message}`)
    }

    if (profesor.user_id) {
      const { error: userError } = await supabaseAdmin!
        .from('User')
        .update({ is_active: false })
        .eq('user_id', profesor.user_id)

      if (userError) {
        console.error('Error deshabilitando usuario:', userError)
      }
    }

    return { message: 'Profesor deshabilitado exitosamente' }
  }

  async enable(profesorId: string) {
    const profesor = await this.getById(profesorId)

    const { error: profesorError } = await supabaseAdmin!
      .from('Profesor')
      .update({ estado_activo: true, updated_at: new Date().toISOString() })
      .eq('profesor_id', profesorId)

    if (profesorError) {
      throw new Error(`Error al habilitar profesor: ${profesorError.message}`)
    }

    if (profesor.user_id) {
      const { error: userError } = await supabaseAdmin!
        .from('User')
        .update({ is_active: true })
        .eq('user_id', profesor.user_id)

      if (userError) {
        console.error('Error habilitando usuario:', userError)
      }
    }

    return { message: 'Profesor habilitado exitosamente' }
  }
}

export default new ProfesorService()
