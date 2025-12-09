/**
 * Servicio de Estudiantes
 * Contiene toda la lógica de negocio y validaciones para la gestión de estudiantes
 */

import { supabaseAdmin } from '@/config/supabase'
import {
  validateRUT,
  formatRUT,
  validateEmail,
  validatePhone,
  validateDate,
  validateNotFutureDate,
  calculateAge,
  sanitizeString,
  validateEnum
} from '@/validators/common.validator'
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  BusinessRuleError
} from '@/utils/errors'

// Tipos
export interface CreateEstudianteDTO {
  user_id?: string
  nombre_completo: string
  fecha_nacimiento: string
  rut: string
  genero?: string
  direccion?: string
  telefono?: string
  email?: string
  observaciones?: string
}

export interface UpdateEstudianteDTO {
  nombre_completo?: string
  fecha_nacimiento?: string
  rut?: string
  genero?: string
  direccion?: string
  telefono?: string
  email?: string
  observaciones?: string
}

// Constantes
const GENEROS_PERMITIDOS = ['M', 'F', 'Otro']
const EDAD_MINIMA = 3
const EDAD_MAXIMA = 25

export class EstudianteService {
  /**
   * Crea un nuevo estudiante con todas las validaciones de negocio
   */
  async create(data: CreateEstudianteDTO) {
    // 1. Validar campos requeridos
    if (!data.nombre_completo || !data.fecha_nacimiento || !data.rut) {
      throw new ValidationError('nombre_completo, fecha_nacimiento y rut son requeridos')
    }

    // 2. Validar y sanitizar nombre
    const nombreCompleto = sanitizeString(data.nombre_completo)
    if (nombreCompleto.length < 3) {
      throw new ValidationError('nombre_completo debe tener al menos 3 caracteres', 'nombre_completo')
    }

    // 3. Validar fecha de nacimiento
    const fechaValidation = validateDate(data.fecha_nacimiento)
    if (!fechaValidation.valid) {
      throw new ValidationError(fechaValidation.error!, 'fecha_nacimiento')
    }

    // 4. Validar que fecha de nacimiento no sea futura
    const noFuturaValidation = validateNotFutureDate(data.fecha_nacimiento)
    if (!noFuturaValidation.valid) {
      throw new ValidationError(noFuturaValidation.error!, 'fecha_nacimiento')
    }

    // 5. Validar edad razonable
    const edad = calculateAge(fechaValidation.date!)
    if (edad < EDAD_MINIMA || edad > EDAD_MAXIMA) {
      throw new BusinessRuleError(
        `La edad del estudiante debe estar entre ${EDAD_MINIMA} y ${EDAD_MAXIMA} años. Edad calculada: ${edad} años`,
        'edad_invalida'
      )
    }

    // 6. Validar formato de RUT
    const rutValidation = validateRUT(data.rut)
    if (!rutValidation.valid) {
      throw new ValidationError(rutValidation.error!, 'rut')
    }

    // 7. Formatear RUT a formato estándar
    const rutFormateado = formatRUT(data.rut)

    // 8. Verificar unicidad de RUT
    const { data: existingRut } = await supabaseAdmin!
      .from('Estudiante')
      .select('estudiante_id, nombre_completo')
      .eq('rut', rutFormateado)
      .maybeSingle()

    if (existingRut) {
      throw new ConflictError(
        `Ya existe un estudiante con el RUT ${rutFormateado}: ${existingRut.nombre_completo}`,
        'duplicate_rut'
      )
    }

    // 9. Validar género si se proporciona
    if (data.genero) {
      const generoValidation = validateEnum(data.genero, GENEROS_PERMITIDOS, 'Género')
      if (!generoValidation.valid) {
        throw new ValidationError(generoValidation.error!, 'genero')
      }
    }

    // 10. Validar email si se proporciona
    if (data.email) {
      const emailValidation = validateEmail(data.email)
      if (!emailValidation.valid) {
        throw new ValidationError(emailValidation.error!, 'email')
      }
    }

    // 11. Validar teléfono si se proporciona
    if (data.telefono) {
      const phoneValidation = validatePhone(data.telefono)
      if (!phoneValidation.valid) {
        throw new ValidationError(phoneValidation.error!, 'telefono')
      }
    }

    // 12. Validar user_id si se proporciona
    if (data.user_id) {
      const { data: userData, error: userError } = await supabaseAdmin!
        .from('User')
        .select('role')
        .eq('user_id', data.user_id)
        .single()

      if (userError || !userData) {
        throw new NotFoundError('Usuario', data.user_id)
      }

      // Verificar rol correcto
      if (userData.role !== 'ESTUDIANTE_APODERADO') {
        throw new ValidationError(
          'El usuario debe tener rol ESTUDIANTE_APODERADO',
          'user_id'
        )
      }
    }

    // 13. Sanitizar campos opcionales
    const direccion = data.direccion ? sanitizeString(data.direccion) : undefined
    const observaciones = data.observaciones ? sanitizeString(data.observaciones) : undefined

    // 14. Crear estudiante
    const { data: nuevoEstudiante, error } = await supabaseAdmin!
      .from('Estudiante')
      .insert({
        user_id: data.user_id,
        nombre_completo: nombreCompleto,
        fecha_nacimiento: data.fecha_nacimiento,
        rut: rutFormateado,
        genero: data.genero,
        direccion,
        telefono: data.telefono,
        email: data.email,
        observaciones,
        estado_activo: true
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error al crear estudiante: ${error.message}`)
    }

    return nuevoEstudiante
  }

  /**
   * Obtiene todos los estudiantes con filtros opcionales
   */
  async getAll(incluirInactivos: boolean = false) {
    let query = supabaseAdmin!
      .from('Estudiante')
      .select('*, User(email_address, is_active)')

    if (!incluirInactivos) {
      query = query.eq('estado_activo', true)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error al obtener estudiantes: ${error.message}`)
    }

    // Formatear datos
    const estudiantesFormateados = (data || []).map(e => ({
      ...e,
      telefono: e.telefono && e.telefono.trim() !== '' ? e.telefono : 'N/A'
    }))

    return estudiantesFormateados
  }

  /**
   * Obtiene un estudiante por ID
   */
  async getById(estudianteId: string) {
    const { data, error } = await supabaseAdmin!
      .from('Estudiante')
      .select('*, User(email_address, is_active)')
      .eq('estudiante_id', estudianteId)
      .single()

    if (error || !data) {
      throw new NotFoundError('Estudiante', estudianteId)
    }

    return data
  }

  /**
   * Actualiza un estudiante con validaciones
   */
  async update(estudianteId: string, updateData: UpdateEstudianteDTO) {
    // 1. Verificar que el estudiante existe
    await this.getById(estudianteId)

    // 2. Validar que al menos un campo fue enviado
    const fieldsToUpdate = Object.keys(updateData).filter(
      key => updateData[key as keyof UpdateEstudianteDTO] !== undefined
    )

    if (fieldsToUpdate.length === 0) {
      throw new ValidationError('Debe proporcionar al menos un campo para actualizar')
    }

    const dataToUpdate: any = {}

    // 3. Validar y procesar cada campo
    if (updateData.nombre_completo !== undefined) {
      const nombreCompleto = sanitizeString(updateData.nombre_completo)
      if (nombreCompleto.length < 3) {
        throw new ValidationError(
          'nombre_completo debe tener al menos 3 caracteres',
          'nombre_completo'
        )
      }
      dataToUpdate.nombre_completo = nombreCompleto
    }

    if (updateData.fecha_nacimiento !== undefined) {
      const fechaValidation = validateDate(updateData.fecha_nacimiento)
      if (!fechaValidation.valid) {
        throw new ValidationError(fechaValidation.error!, 'fecha_nacimiento')
      }

      const noFuturaValidation = validateNotFutureDate(updateData.fecha_nacimiento)
      if (!noFuturaValidation.valid) {
        throw new ValidationError(noFuturaValidation.error!, 'fecha_nacimiento')
      }

      const edad = calculateAge(fechaValidation.date!)
      if (edad < EDAD_MINIMA || edad > EDAD_MAXIMA) {
        throw new BusinessRuleError(
          `La edad debe estar entre ${EDAD_MINIMA} y ${EDAD_MAXIMA} años`,
          'edad_invalida'
        )
      }

      dataToUpdate.fecha_nacimiento = updateData.fecha_nacimiento
    }

    if (updateData.rut !== undefined) {
      const rutValidation = validateRUT(updateData.rut)
      if (!rutValidation.valid) {
        throw new ValidationError(rutValidation.error!, 'rut')
      }

      const rutFormateado = formatRUT(updateData.rut)

      // Verificar unicidad (excluir el estudiante actual)
      const { data: existingRut } = await supabaseAdmin!
        .from('Estudiante')
        .select('estudiante_id')
        .eq('rut', rutFormateado)
        .neq('estudiante_id', estudianteId)
        .maybeSingle()

      if (existingRut) {
        throw new ConflictError(
          `Ya existe otro estudiante con el RUT ${rutFormateado}`,
          'duplicate_rut'
        )
      }

      dataToUpdate.rut = rutFormateado
    }

    if (updateData.genero !== undefined) {
      const generoValidation = validateEnum(updateData.genero, GENEROS_PERMITIDOS, 'Género')
      if (!generoValidation.valid) {
        throw new ValidationError(generoValidation.error!, 'genero')
      }
      dataToUpdate.genero = updateData.genero
    }

    if (updateData.email !== undefined) {
      const emailValidation = validateEmail(updateData.email)
      if (!emailValidation.valid) {
        throw new ValidationError(emailValidation.error!, 'email')
      }
      dataToUpdate.email = updateData.email
    }

    if (updateData.telefono !== undefined) {
      const phoneValidation = validatePhone(updateData.telefono)
      if (!phoneValidation.valid) {
        throw new ValidationError(phoneValidation.error!, 'telefono')
      }
      dataToUpdate.telefono = updateData.telefono
    }

    if (updateData.direccion !== undefined) {
      dataToUpdate.direccion = sanitizeString(updateData.direccion)
    }

    if (updateData.observaciones !== undefined) {
      dataToUpdate.observaciones = sanitizeString(updateData.observaciones)
    }

    // 4. Agregar timestamp de actualización
    dataToUpdate.updated_at = new Date().toISOString()

    // 5. Actualizar en la base de datos
    const { data, error } = await supabaseAdmin!
      .from('Estudiante')
      .update(dataToUpdate)
      .eq('estudiante_id', estudianteId)
      .select()
      .single()

    if (error) {
      throw new Error(`Error al actualizar estudiante: ${error.message}`)
    }

    return data
  }

  /**
   * Deshabilita un estudiante (soft delete)
   */
  async disable(estudianteId: string) {
    // Verificar que existe
    const estudiante = await this.getById(estudianteId)

    // Deshabilitar estudiante
    const { error: estudianteError } = await supabaseAdmin!
      .from('Estudiante')
      .update({ estado_activo: false, updated_at: new Date().toISOString() })
      .eq('estudiante_id', estudianteId)

    if (estudianteError) {
      throw new Error(`Error al deshabilitar estudiante: ${estudianteError.message}`)
    }

    // Si tiene user_id asociado, también deshabilitar el usuario
    if (estudiante.user_id) {
      const { error: userError } = await supabaseAdmin!
        .from('User')
        .update({ is_active: false })
        .eq('user_id', estudiante.user_id)

      if (userError) {
        console.error('Error deshabilitando usuario:', userError)
      }
    }

    return { message: 'Estudiante deshabilitado exitosamente' }
  }

  /**
   * Habilita un estudiante
   */
  async enable(estudianteId: string) {
    // Verificar que existe
    const estudiante = await this.getById(estudianteId)

    // Habilitar estudiante
    const { error: estudianteError } = await supabaseAdmin!
      .from('Estudiante')
      .update({ estado_activo: true, updated_at: new Date().toISOString() })
      .eq('estudiante_id', estudianteId)

    if (estudianteError) {
      throw new Error(`Error al habilitar estudiante: ${estudianteError.message}`)
    }

    // Si tiene user_id asociado, también habilitar el usuario
    if (estudiante.user_id) {
      const { error: userError } = await supabaseAdmin!
        .from('User')
        .update({ is_active: true })
        .eq('user_id', estudiante.user_id)

      if (userError) {
        console.error('Error habilitando usuario:', userError)
      }
    }

    return { message: 'Estudiante habilitado exitosamente' }
  }
}

export default new EstudianteService()
