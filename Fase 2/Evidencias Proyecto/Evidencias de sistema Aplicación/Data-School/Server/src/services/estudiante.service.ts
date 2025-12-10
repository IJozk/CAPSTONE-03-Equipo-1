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

  /**
   * Obtiene el dashboard del estudiante con estadísticas completas
   */
  async getDashboard(estudianteId: string) {
    console.log('📊 Obteniendo dashboard para estudiante:', estudianteId)

    // 1. Obtener datos del estudiante
    const { data: estudiante, error: estudianteError } = await supabaseAdmin!
      .from('Estudiante')
      .select('*, User(email_address)')
      .eq('estudiante_id', estudianteId)
      .single()

    if (estudianteError) throw estudianteError
    if (!estudiante) {
      throw new NotFoundError('Estudiante', estudianteId)
    }

    // 2. Obtener matrícula activa y curso
    console.log('🔍 Buscando matrícula para estudiante:', estudianteId)

    const { data: matricula, error: matriculaError } = await supabaseAdmin!
      .from('Matricula')
      .select(`
        *,
        Curso(
          curso_id,
          nombre,
          nivel_id
        )
      `)
      .eq('estudiante_id', estudianteId)
      .eq('estado_matricula_id', 1)
      .maybeSingle()

    if (matriculaError) {
      console.error('❌ Error obteniendo matrícula:', matriculaError)
    }

    const cursoId = matricula?.curso_id

    // 3. Obtener asignaturas del curso
    let asignaturas: any[] = []
    if (cursoId) {
      const result = await supabaseAdmin!
        .from('Asignatura')
        .select(`
          asignatura_id,
          nombre,
          codigo,
          Profesor(nombre_completo)
        `)
        .eq('curso_id', cursoId)
        .eq('estado_activo', true)

      asignaturas = result.data || []
    }

    // 4. Calcular promedio general y obtener notas recientes
    const { data: resultados } = await supabaseAdmin!
      .from('ResultadoEvaluacion')
      .select(`
        *,
        Evaluacion(
          nombre,
          fecha_evaluacion,
          Asignatura(nombre)
        )
      `)
      .eq('estudiante_id', estudianteId)
      .order('created_at', { ascending: false })
      .limit(100)

    let promedioGeneral = 0
    const promediosPorAsignatura: any = {}

    if (resultados && resultados.length > 0) {
      resultados.forEach((resultado: any) => {
        const asignaturaId = resultado.Evaluacion?.Asignatura?.nombre
        if (!asignaturaId) return

        if (!promediosPorAsignatura[asignaturaId]) {
          promediosPorAsignatura[asignaturaId] = {
            notas: [],
            suma: 0,
            count: 0
          }
        }

        if (resultado.nota) {
          promediosPorAsignatura[asignaturaId].notas.push(resultado.nota)
          promediosPorAsignatura[asignaturaId].suma += resultado.nota
          promediosPorAsignatura[asignaturaId].count += 1
        }
      })

      const promedios = Object.values(promediosPorAsignatura).map((asig: any) =>
        asig.count > 0 ? asig.suma / asig.count : 0
      )

      if (promedios.length > 0) {
        promedioGeneral = promedios.reduce((a: number, b: number) => a + b, 0) / promedios.length
      }
    }

    const notasRecientes = resultados?.slice(0, 5).map((r: any) => ({
      evaluacion_nombre: r.Evaluacion?.nombre,
      asignatura_nombre: r.Evaluacion?.Asignatura?.nombre,
      nota: r.nota,
      puntaje: r.puntaje_obtenido,
      fecha: r.Evaluacion?.fecha_evaluacion,
      created_at: r.created_at
    })) || []

    // 5. Calcular porcentaje de asistencia
    const { data: asistencias } = await supabaseAdmin!
      .from('Asistencia')
      .select('presente')
      .eq('estudiante_id', estudianteId)

    let porcentajeAsistencia = 0
    if (asistencias && asistencias.length > 0) {
      const presentes = asistencias.filter((a: any) => a.presente).length
      porcentajeAsistencia = Math.round((presentes / asistencias.length) * 100)
    }

    // 6. Obtener anotaciones del estudiante
    const { data: anotaciones } = await supabaseAdmin!
      .from('Anotaciones')
      .select('tipo_anotacion')
      .eq('estudiante_id', estudianteId)

    const anotacionesStats = {
      positivas: anotaciones?.filter((a: any) => a.tipo_anotacion === 'Positiva').length || 0,
      negativas: anotaciones?.filter((a: any) => a.tipo_anotacion === 'Negativa').length || 0,
      neutras: anotaciones?.filter((a: any) => a.tipo_anotacion === 'Neutra').length || 0
    }

    // 7. Obtener evaluaciones próximas
    const hoy = new Date()
    const en30Dias = new Date()
    en30Dias.setDate(hoy.getDate() + 30)

    const { data: evaluacionesProximas } = await supabaseAdmin!
      .from('Evaluacion')
      .select(`
        evaluacion_id,
        nombre,
        fecha_evaluacion,
        tipo,
        Asignatura(nombre)
      `)
      .in('asignatura_id', asignaturas?.map((a: any) => a.asignatura_id) || [])
      .gte('fecha_evaluacion', hoy.toISOString().split('T')[0])
      .lte('fecha_evaluacion', en30Dias.toISOString().split('T')[0])
      .order('fecha_evaluacion', { ascending: true })
      .limit(5)

    // 8. Construir respuesta del dashboard
    return {
      estudiante: {
        estudiante_id: estudiante.estudiante_id,
        nombre_completo: estudiante.nombre_completo,
        rut: estudiante.rut,
        email: estudiante.email || estudiante.User?.email_address
      },
      curso: matricula ? {
        curso_id: matricula.Curso.curso_id,
        nombre: matricula.Curso.nombre,
        nivel_id: matricula.Curso.nivel_id
      } : null,
      stats: {
        promedio_general: Math.round(promedioGeneral * 10) / 10,
        porcentaje_asistencia: porcentajeAsistencia,
        total_asignaturas: asignaturas?.length || 0,
        evaluaciones_proximas: evaluacionesProximas?.length || 0,
        anotaciones: anotacionesStats
      },
      asignaturas: asignaturas?.map((asig: any) => ({
        asignatura_id: asig.asignatura_id,
        nombre: asig.nombre,
        codigo: asig.codigo,
        profesor: asig.Profesor?.nombre_completo,
        promedio: promediosPorAsignatura[asig.nombre]?.count > 0
          ? Math.round((promediosPorAsignatura[asig.nombre].suma / promediosPorAsignatura[asig.nombre].count) * 10) / 10
          : null
      })) || [],
      notas_recientes: notasRecientes,
      evaluaciones_proximas: evaluacionesProximas?.map((ev: any) => ({
        evaluacion_id: ev.evaluacion_id,
        nombre: ev.nombre,
        asignatura: ev.Asignatura?.nombre,
        fecha: ev.fecha_evaluacion,
        tipo: ev.tipo
      })) || []
    }
  }
}

export default new EstudianteService()
