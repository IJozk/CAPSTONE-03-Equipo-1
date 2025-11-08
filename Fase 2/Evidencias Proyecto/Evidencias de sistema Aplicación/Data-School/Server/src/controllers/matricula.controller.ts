import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

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
            if (!estudiante_id || !curso_id || !tutor_titular_id || !periodo) {
                return res.status(400).json({
                    message: 'estudiante_id, curso_id, tutor_titular_id y periodo son requeridos'
                })
            }

            // Verificar que el estudiante existe
            const { data: estudiante, error: estudianteError } = await supabaseAdmin!
                .from('Estudiante')
                .select('estudiante_id')
                .eq('estudiante_id', estudiante_id)
                .single()

            if (estudianteError || !estudiante) {
                return res.status(404).json({ message: 'Estudiante no encontrado' })
            }

            // Verificar que el curso existe
            const { data: curso, error: cursoError } = await supabaseAdmin!
                .from('Curso')
                .select('curso_id')
                .eq('curso_id', curso_id)
                .single()

            if (cursoError || !curso) {
                return res.status(404).json({ message: 'Curso no encontrado' })
            }

            // Verificar que el tutor existe
            const { data: tutor, error: tutorError } = await supabaseAdmin!
                .from('Tutor')
                .select('tutor_id')
                .eq('tutor_id', tutor_titular_id)
                .single()

            if (tutorError || !tutor) {
                return res.status(404).json({ message: 'Tutor no encontrado' })
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
