import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'
import { validateAgeForNivel, VALIDATION_CONSTANTS } from '@/constants/validations.constants'

export class MatriculaController {

    // Crear nueva matrícula
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                estudiante_id,
                curso_id,
                tutor_titular_id,
                periodo,
                monto_matricula,
                fecha_pago,
                observaciones,
                estado_matricula_id
            } = req.body

            // Validar campos requeridos
            if (!estudiante_id || !curso_id || !periodo) {
                return res.status(400).json({
                    message: 'estudiante_id, curso_id y periodo son requeridos'
                })
            }

            // Verificar que el estudiante existe y obtener sus datos completos
            const { data: estudiante, error: estudianteError } = await supabaseAdmin!
                .from('Estudiante')
                .select('estudiante_id, nombre_completo, fecha_nacimiento, estado_activo')
                .eq('estudiante_id', estudiante_id)
                .single()

            if (estudianteError || !estudiante) {
                return res.status(404).json({ message: 'Estudiante no encontrado' })
            }

            // Validar que el estudiante esté activo
            if (!estudiante.estado_activo) {
                return res.status(400).json({
                    message: 'No se puede matricular a un estudiante inactivo',
                    estudiante: estudiante.nombre_completo
                })
            }

            // Verificar que el estudiante no tenga una matrícula activa en otro curso
            const { data: matriculaActiva, error: matriculaActivaError } = await supabaseAdmin!
                .from('Matricula')
                .select('matricula_id, Curso(nombre)')
                .eq('estudiante_id', estudiante_id)
                .eq('estado_matricula_id', VALIDATION_CONSTANTS.ESTADO_MATRICULA_ACTIVA)
                .single()

            if (matriculaActiva) {
                return res.status(400).json({
                    message: `El estudiante ya tiene una matrícula activa en el curso: ${(matriculaActiva as any).Curso?.nombre || 'Desconocido'}`,
                    estudiante: estudiante.nombre_completo
                })
            }

            // Si hay error pero no es "no rows returned", lanzar el error
            if (matriculaActivaError && matriculaActivaError.code !== 'PGRST116') {
                throw matriculaActivaError
            }

            // Verificar que el curso existe y obtener su nivel
            const { data: curso, error: cursoError } = await supabaseAdmin!
                .from('Curso')
                .select('curso_id, nombre, nivel_id, capacidad_maxima, anio_academico')
                .eq('curso_id', curso_id)
                .single()

            if (cursoError || !curso) {
                return res.status(404).json({ message: 'Curso no encontrado' })
            }

            // Validar la edad del estudiante para el nivel del curso
            if (estudiante.fecha_nacimiento) {
                const ageValidation = validateAgeForNivel(estudiante.fecha_nacimiento, curso.nivel_id)

                if (!ageValidation.valid) {
                    return res.status(400).json({
                        message: ageValidation.message,
                        estudiante: estudiante.nombre_completo,
                        edad: ageValidation.age,
                        curso: curso.nombre
                    })
                }
            } else {
                return res.status(400).json({
                    message: 'El estudiante no tiene fecha de nacimiento registrada',
                    estudiante: estudiante.nombre_completo
                })
            }

            // Verificar la capacidad del curso (si está definida)
            if (curso.capacidad_maxima) {
                const { count, error: countError } = await supabaseAdmin!
                    .from('Matricula')
                    .select('*', { count: 'exact', head: true })
                    .eq('curso_id', curso_id)
                    .eq('estado_matricula_id', VALIDATION_CONSTANTS.ESTADO_MATRICULA_ACTIVA)

                if (countError) throw countError

                if (count !== null && count >= curso.capacidad_maxima) {
                    return res.status(400).json({
                        message: `El curso ${curso.nombre} ha alcanzado su capacidad máxima de ${curso.capacidad_maxima} estudiantes`,
                        curso: curso.nombre,
                        capacidad: curso.capacidad_maxima,
                        matriculados: count
                    })
                }
            }

            // Verificar que el tutor existe y está activo (solo si se proporciona)
            if (tutor_titular_id) {
                const { data: tutor, error: tutorError } = await supabaseAdmin!
                    .from('Tutor')
                    .select('tutor_id, nombre_completo, estado_activo')
                    .eq('tutor_id', tutor_titular_id)
                    .single()

                if (tutorError || !tutor) {
                    return res.status(404).json({ message: 'Tutor no encontrado' })
                }

                if (!tutor.estado_activo) {
                    return res.status(400).json({
                        message: 'No se puede asignar un tutor inactivo',
                        tutor: tutor.nombre_completo
                    })
                }

                // Verificar que el tutor esté relacionado con el estudiante
                const { data: parentesco, error: parentescoError } = await supabaseAdmin!
                    .from('Parentesco')
                    .select('estudiante_id')
                    .eq('estudiante_id', estudiante_id)
                    .eq('tutor_id', tutor_titular_id)
                    .single()

                if (parentescoError || !parentesco) {
                    return res.status(400).json({
                        message: 'El tutor no está relacionado con el estudiante',
                        tutor: tutor.nombre_completo,
                        estudiante: estudiante.nombre_completo
                    })
                }
            }

            // Crear matrícula
            const { data, error } = await supabaseAdmin!
                .from('Matricula')
                .insert({
                    estudiante_id,
                    curso_id,
                    tutor_titular_id,
                    periodo,
                    monto_matricula,
                    fecha_pago,
                    observaciones,
                    estado_matricula_id: estado_matricula_id || 1, // 1 = ACTIVA por defecto
                    fecha_matricula: new Date().toISOString()
                })
                .select()
                .single()

            if (error) throw error

            return res.status(201).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener todas las matrículas
    public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const periodo = req.query.periodo as string | undefined
            const curso_id = req.query.curso_id as string | undefined
            const estado_matricula_id = req.query.estado_matricula_id as string | undefined

            let query = supabaseAdmin!
                .from('Matricula')
                .select(`
                    *,
                    Estudiante(estudiante_id, nombre_completo, rut),
                    Curso(curso_id, nombre, nivel_id),
                    Tutor(tutor_id, nombre_completo, telefono),
                    EstadoMatricula(estado_matricula_id, nombre_estado)
                `)

            if (periodo) {
                query = query.eq('periodo', periodo)
            }

            if (curso_id) {
                query = query.eq('curso_id', curso_id)
            }

            if (estado_matricula_id) {
                const estadoId = Number(estado_matricula_id)
                if (!Number.isNaN(estadoId)) {
                    query = query.eq('estado_matricula_id', estadoId)
                }
            }

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener matrícula por ID
    public async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Matricula')
                .select(`
                    *,
                    Estudiante(estudiante_id, nombre_completo, rut, email, telefono),
                    Curso(curso_id, nombre, nivel_id),
                    Tutor(tutor_id, nombre_completo, telefono, email),
                    EstadoMatricula(estado_matricula_id, nombre_estado, descripcion)
                `)
                .eq('matricula_id', id)
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Matrícula no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener matrículas de un estudiante
    public async getByEstudiante(req: Request, res: Response): Promise<Response> {
        try {
            const { estudiante_id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Matricula')
                .select(`
                    *,
                    Curso(curso_id, nombre, nivel_id),
                    EstadoMatricula(estado_matricula_id, nombre_estado)
                `)
                .eq('estudiante_id', estudiante_id)
                .order('fecha_matricula', { ascending: false })

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Actualizar matrícula
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const {
                curso_id,
                tutor_titular_id,
                estado_matricula_id,
                monto_matricula,
                fecha_pago,
                observaciones
            } = req.body

            const updateData: any = {}
            if (curso_id !== undefined) updateData.curso_id = curso_id
            if (tutor_titular_id !== undefined) updateData.tutor_titular_id = tutor_titular_id
            if (estado_matricula_id !== undefined) updateData.estado_matricula_id = estado_matricula_id
            if (monto_matricula !== undefined) updateData.monto_matricula = monto_matricula
            if (fecha_pago !== undefined) updateData.fecha_pago = fecha_pago
            if (observaciones !== undefined) updateData.observaciones = observaciones
            updateData.updated_at = new Date().toISOString()

            const { data, error } = await supabaseAdmin!
                .from('Matricula')
                .update(updateData)
                .eq('matricula_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Matrícula no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Cambiar estado de matrícula
    public async changeStatus(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const { estado_matricula_id } = req.body

            if (!estado_matricula_id) {
                return res.status(400).json({ message: 'estado_matricula_id es requerido' })
            }

            const { data, error } = await supabaseAdmin!
                .from('Matricula')
                .update({
                    estado_matricula_id,
                    updated_at: new Date().toISOString()
                })
                .eq('matricula_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Matrícula no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Eliminar matrícula (hard delete - usar con precaución)
    public async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { error } = await supabaseAdmin!
                .from('Matricula')
                .delete()
                .eq('matricula_id', id)

            if (error) throw error

            return res.status(200).json({ message: 'Matrícula eliminada correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }
}
