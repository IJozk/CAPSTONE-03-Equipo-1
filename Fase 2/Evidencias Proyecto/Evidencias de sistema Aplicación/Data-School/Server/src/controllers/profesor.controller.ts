import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'
import type { AuthRequest } from '@/types/auth.types'

export class ProfesorController {

    // Crear nuevo profesor
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const { user_id, nombre_completo, rut, telefono} = req.body

            // Validar campos requeridos
            if (!user_id || !nombre_completo) {
                return res.status(400).json({ message: 'user_id y nombre_completo son requeridos' })
            }

            // Verificar que el user_id existe y tiene role PROFESOR
            const { data: userData, error: userError } = await supabaseAdmin!
                .from('User')
                .select('role')
                .eq('user_id', user_id)
                .single()

            if (userError || !userData) {
                return res.status(404).json({ message: 'Usuario no encontrado' })
            }

            if (userData.role !== 'PROFESOR') {
                return res.status(400).json({ message: 'El usuario debe tener rol PROFESOR' })
            }

            // Crear profesor
            const { data, error } = await supabaseAdmin!
                .from('Profesor')
                .insert({
                    user_id,
                    nombre_completo,
                    rut,
                    telefono,
                    estado_activo: true
                })
                .select()
                .single()

            if (error) throw error

            return res.status(201).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener todos los profesores activos
    public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { incluir_inactivos } = req.query

            let query = supabaseAdmin!
                .from('Profesor')
                .select(`
                    *,
                    User(email_address, is_active)
                `)

            if (incluir_inactivos !== 'true') {
                query = query.eq('estado_activo', true)
            }

            const { data: profesores, error } = await query

            if (error) throw error

            // Para cada profesor, obtener contrato activo y especialidades
            const profesoresConDetalles = await Promise.all(
                (profesores || []).map(async (profesor) => {
                    // Obtener contrato activo (sin fecha de término o fecha de término futura)
                    const { data: contrato } = await supabaseAdmin!
                        .from('Contrato')
                        .select(`
                            *,
                            Profesion(id_profesion, nombre, descripcion)
                        `)
                        .eq('id_empleado', profesor.profesor_id)
                        .or('termino_contrato.is.null,termino_contrato.gte.' + new Date().toISOString())
                        .order('inicio_contrato', { ascending: false })
                        .limit(1)
                        .single()

                    // Obtener especialidades
                    const { data: especialidades } = await supabaseAdmin!
                        .from('Profesor_especialidad')
                        .select(`
                            *,
                            Especialidad(id, nombre_especialidad, tipo_especialidad)
                        `)
                        .eq('profesor_id', profesor.profesor_id)

                    return {
                        ...profesor,
                        contrato: contrato || null,
                        especialidades: especialidades || []
                    }
                })
            )

            return res.status(200).json(profesoresConDetalles)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener profesor por ID
    public async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data: profesor, error } = await supabaseAdmin!
                .from('Profesor')
                .select('*, User(email_address, is_active)')
                .eq('profesor_id', id)
                .single()

            if (error) throw error

            if (!profesor) {
                return res.status(404).json({ message: 'Profesor no encontrado' })
            }

            // Obtener contrato activo
            const { data: contrato } = await supabaseAdmin!
                .from('Contrato')
                .select(`
                    *,
                    Profesion(id_profesion, nombre, descripcion)
                `)
                .eq('id_empleado', profesor.profesor_id)
                .or('termino_contrato.is.null,termino_contrato.gte.' + new Date().toISOString())
                .order('inicio_contrato', { ascending: false })
                .limit(1)
                .single()

            // Obtener especialidades
            const { data: especialidades } = await supabaseAdmin!
                .from('Profesor_especialidad')
                .select(`
                    *,
                    Especialidad(id, nombre_especialidad, tipo_especialidad)
                `)
                .eq('profesor_id', profesor.profesor_id)

            return res.status(200).json({
                ...profesor,
                contrato: contrato || null,
                especialidades: especialidades || []
            })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Actualizar datos del profesor (NO modifica User)
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const { nombre_completo, rut, telefono } = req.body

            // Solo actualizar campos de la tabla Profesor
            const updateData: any = {}
            if (nombre_completo !== undefined) updateData.nombre_completo = nombre_completo
            if (rut !== undefined) updateData.rut = rut
            if (telefono !== undefined) updateData.telefono = telefono
            updateData.updated_at = new Date().toISOString()

            const { data, error } = await supabaseAdmin!
                .from('Profesor')
                .update(updateData)
                .eq('profesor_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Profesor no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Deshabilitar profesor (soft delete)
    public async disable(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Deshabilitar en tabla Profesor
            const { data: profesorData, error: profesorError } = await supabaseAdmin!
                .from('Profesor')
                .update({
                    estado_activo: false,
                    updated_at: new Date().toISOString()
                })
                .eq('profesor_id', id)
                .select('user_id')
                .single()

            if (profesorError) throw profesorError

            if (!profesorData) {
                return res.status(404).json({ message: 'Profesor no encontrado' })
            }

            // Deshabilitar cuenta de usuario
            const { error: userError } = await supabaseAdmin!
                .from('User')
                .update({
                    is_active: false,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', profesorData.user_id)

            if (userError) throw userError

            return res.status(200).json({ message: 'Profesor deshabilitado correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Habilitar profesor
    public async enable(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Habilitar en tabla Profesor
            const { data: profesorData, error: profesorError } = await supabaseAdmin!
                .from('Profesor')
                .update({
                    estado_activo: true,
                    updated_at: new Date().toISOString()
                })
                .eq('profesor_id', id)
                .select('user_id')
                .single()

            if (profesorError) throw profesorError

            if (!profesorData) {
                return res.status(404).json({ message: 'Profesor no encontrado' })
            }

            // Habilitar cuenta de usuario
            const { error: userError } = await supabaseAdmin!
                .from('User')
                .update({
                    is_active: true,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', profesorData.user_id)

            if (userError) throw userError

            return res.status(200).json({ message: 'Profesor habilitado correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener dashboard del profesor autenticado
    public async getDashboard(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const userId = req.userId

            if (!userId) {
                return res.status(401).json({ message: 'No autenticado' })
            }

            // Obtener el profesor basado en el user_id
            const { data: profesor, error: profesorError } = await supabaseAdmin!
                .from('Profesor')
                .select('*')
                .eq('user_id', userId)
                .single()

            if (profesorError || !profesor) {
                return res.status(404).json({ message: 'Perfil de profesor no encontrado' })
            }

            // Obtener asignaturas del profesor
            const { data: asignaturas, error: asignaturasError } = await supabaseAdmin!
                .from('Asignatura')
                .select('asignatura_id, Curso(curso_id)')
                .eq('profesor_id', profesor.profesor_id)

            if (asignaturasError) throw asignaturasError

            const total_asignaturas = asignaturas?.length || 0

            // Obtener cursos únicos
            const cursosIds = [...new Set(asignaturas?.map(a => a.Curso?.curso_id).filter(Boolean))]
            const total_cursos = cursosIds.length

            // Obtener total de estudiantes (matrículas activas en los cursos)
            let total_estudiantes = 0
            if (cursosIds.length > 0) {
                const { data: matriculas } = await supabaseAdmin!
                    .from('Matricula')
                    .select('estudiante_id', { count: 'exact' })
                    .in('curso_id', cursosIds)
                    .eq('estado_matricula_id', 1)

                total_estudiantes = matriculas?.length || 0
            }

            // Obtener evaluaciones pendientes de revisión
            const asignaturasIds = asignaturas?.map(a => a.asignatura_id) || []
            let evaluaciones_pendientes_revision = 0

            if (asignaturasIds.length > 0) {
                const { data: evaluaciones } = await supabaseAdmin!
                    .from('Evaluacion')
                    .select('evaluacion_id')
                    .in('asignatura_id', asignaturasIds)
                    .lte('fecha_evaluacion', new Date().toISOString())

                evaluaciones_pendientes_revision = evaluaciones?.length || 0
            }

            // Construir respuesta
            const dashboard = {
                profesor: {
                    profesor_id: profesor.profesor_id,
                    nombre_completo: profesor.nombre_completo,
                    rut: profesor.rut,
                    telefono: profesor.telefono,
                    especialidad: 'Profesor' // TODO: Obtener de tabla de especialidades si existe
                },
                stats: {
                    total_asignaturas,
                    total_estudiantes,
                    total_cursos,
                    evaluaciones_pendientes_revision,
                    asistencias_por_registrar_hoy: 0, // TODO: Implementar lógica de asistencia
                    promedio_general_asignaturas: 0 // TODO: Calcular promedio de notas
                }
            }

            return res.status(200).json(dashboard)

        } catch (error: any) {
            console.error('Error en getDashboard:', error)
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener próximas clases y evaluaciones del profesor
    public async getUpcoming(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const userId = req.userId

            if (!userId) {
                return res.status(401).json({ message: 'No autenticado' })
            }

            // Obtener el profesor
            const { data: profesor, error: profesorError } = await supabaseAdmin!
                .from('Profesor')
                .select('profesor_id')
                .eq('user_id', userId)
                .single()

            if (profesorError || !profesor) {
                return res.status(404).json({ message: 'Perfil de profesor no encontrado' })
            }

            // Obtener asignaturas del profesor
            const { data: asignaturas } = await supabaseAdmin!
                .from('Asignatura')
                .select(`
                    asignatura_id,
                    nombre,
                    Curso(curso_id, nombre)
                `)
                .eq('profesor_id', profesor.profesor_id)

            const asignaturasIds = asignaturas?.map(a => a.asignatura_id) || []

            // Obtener horarios de hoy
            const today = new Date()
            const diaSemana = today.getDay() // 0 = Domingo, 1 = Lunes, etc.

            let clases_hoy: any[] = []
            if (asignaturasIds.length > 0) {
                const { data: horarios } = await supabaseAdmin!
                    .from('Horario')
                    .select(`
                        horario_id,
                        dia_semana,
                        hora_inicio,
                        hora_termino,
                        Asignatura(
                            asignatura_id,
                            nombre,
                            Curso(curso_id, nombre)
                        ),
                        Sala(sala_id, nombre)
                    `)
                    .in('asignatura_id', asignaturasIds)
                    .eq('dia_semana', diaSemana)
                    .eq('estado_activo', true)
                    .order('hora_inicio')

                clases_hoy = (horarios || []).map(h => ({
                    horario_id: h.horario_id,
                    asignatura_id: h.Asignatura?.asignatura_id || '',
                    asignatura: h.Asignatura?.nombre || '',
                    curso: h.Asignatura?.Curso?.nombre || '',
                    hora_inicio: h.hora_inicio,
                    hora_termino: h.hora_termino,
                    sala: h.Sala?.nombre || 'Sin sala'
                }))
            }

            // Obtener evaluaciones próximas (próximos 7 días)
            const fechaInicio = new Date().toISOString()
            const fechaFin = new Date()
            fechaFin.setDate(fechaFin.getDate() + 7)

            let evaluaciones_proximas: any[] = []
            if (asignaturasIds.length > 0) {
                const { data: evaluaciones } = await supabaseAdmin!
                    .from('Evaluacion')
                    .select(`
                        evaluacion_id,
                        nombre,
                        tipo,
                        fecha_evaluacion,
                        Asignatura(
                            asignatura_id,
                            nombre,
                            Curso(curso_id, nombre)
                        )
                    `)
                    .in('asignatura_id', asignaturasIds)
                    .gte('fecha_evaluacion', fechaInicio)
                    .lte('fecha_evaluacion', fechaFin.toISOString())
                    .order('fecha_evaluacion')

                evaluaciones_proximas = (evaluaciones || []).map(e => ({
                    evaluacion_id: e.evaluacion_id,
                    nombre: e.nombre,
                    tipo: e.tipo,
                    fecha_evaluacion: e.fecha_evaluacion,
                    asignatura: e.Asignatura?.nombre || '',
                    curso: e.Asignatura?.Curso?.nombre || ''
                }))
            }

            return res.status(200).json({
                upcoming: {
                    clases_hoy,
                    evaluaciones_proximas
                }
            })

        } catch (error: any) {
            console.error('Error en getUpcoming:', error)
            return res.status(500).json({ message: error.message })
        }
    }
}
