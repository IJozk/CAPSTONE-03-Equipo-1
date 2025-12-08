import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class AsistenciaController {

    // Registrar asistencia de un estudiante
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                estudiante_id,
                asignatura_id,
                fecha,
                presente,
                justificado,
                retraso_minutos,
                retiro_anticipado_minutos,
                observaciones,
                registrado_por
            } = req.body

            // Validar campos requeridos
            if (!estudiante_id || !asignatura_id || !fecha || presente === undefined) {
                return res.status(400).json({
                    message: 'estudiante_id, asignatura_id, fecha y presente son requeridos'
                })
            }

            // Verificar que no exista ya un registro de asistencia para ese día
            const { data: existente, error: existenteError } = await supabaseAdmin!
                .from('Asistencia')
                .select('asistencia_id')
                .eq('estudiante_id', estudiante_id)
                .eq('asignatura_id', asignatura_id)
                .eq('fecha', fecha)
                .maybeSingle()

            if (existente) {
                return res.status(400).json({
                    message: 'Ya existe un registro de asistencia para este estudiante, asignatura y fecha'
                })
            }

            // Crear registro de asistencia
            const { data, error } = await supabaseAdmin!
                .from('Asistencia')
                .insert({
                    estudiante_id,
                    asignatura_id,
                    fecha,
                    presente,
                    justificado: justificado || false,
                    retraso_minutos,
                    retiro_anticipado_minutos,
                    observaciones,
                    registrado_por
                })
                .select()
                .single()

            if (error) throw error

            return res.status(201).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Registrar asistencia masiva (para toda una clase)
    public async createBulk(req: Request, res: Response): Promise<Response> {
        try {
            const { asistencias } = req.body

            if (!Array.isArray(asistencias) || asistencias.length === 0) {
                return res.status(400).json({ message: 'Se requiere un array de asistencias' })
            }

            // Validar que todos tengan los campos requeridos
            for (const asist of asistencias) {
                if (!asist.estudiante_id || !asist.asignatura_id || !asist.fecha || asist.presente === undefined) {
                    return res.status(400).json({
                        message: 'Cada asistencia debe tener estudiante_id, asignatura_id, fecha y presente'
                    })
                }
            }

            const { data, error } = await supabaseAdmin!
                .from('Asistencia')
                .insert(asistencias)
                .select()

            if (error) throw error

            return res.status(201).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener asistencias con filtros
    public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const {
                estudiante_id,
                asignatura_id,
                fecha, // fecha exacta (cuando el frontend pide un día concreto)
                fecha_inicio,
                fecha_fin,
                presente
            } = req.query

            let query = supabaseAdmin!
                .from('Asistencia')
                .select(`
                    *,
                    Estudiante(estudiante_id, nombre_completo, rut),
                    Asignatura(asignatura_id, nombre, codigo),
                    User(user_id, email_address)
                `)

            if (estudiante_id) {
                query = query.eq('estudiante_id', String(estudiante_id))
            }

            if (asignatura_id) {
                query = query.eq('asignatura_id', String(asignatura_id))
            }

            // Soporte para búsqueda por fecha exacta (param `fecha`) además
            // de los rangos `fecha_inicio` / `fecha_fin`.
            if (fecha) {
                query = query.eq('fecha', String(fecha))
            } else {
                if (fecha_inicio) {
                    query = query.gte('fecha', fecha_inicio)
                }

                if (fecha_fin) {
                    query = query.lte('fecha', fecha_fin)
                }
            }

            if (presente !== undefined) {
                query = query.eq('presente', presente === 'true')
            }

            query = query.order('fecha', { ascending: false })

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener asistencia por ID
    public async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Asistencia')
                .select(`
                    *,
                    Estudiante(estudiante_id, nombre_completo, rut),
                    Asignatura(asignatura_id, nombre, codigo, Curso(nombre, nivel)),
                    User(user_id, email_address)
                `)
                .eq('asistencia_id', Number(id))
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Asistencia no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener resumen de asistencia de un estudiante
    public async getResumenEstudiante(req: Request, res: Response): Promise<Response> {
        try {
            const { estudiante_id } = req.params
            const { asignatura_id, fecha_inicio, fecha_fin } = req.query

            let query = supabaseAdmin!
                .from('Asistencia')
                .select('*')
                .eq('estudiante_id', estudiante_id)

            if (asignatura_id) {
                query = query.eq('asignatura_id', String(asignatura_id))
            }

            if (fecha_inicio) {
                query = query.gte('fecha', fecha_inicio)
            }

            if (fecha_fin) {
                query = query.lte('fecha', fecha_fin)
            }

            const { data, error } = await query

            if (error) throw error

            // Calcular estadísticas
            const total = data?.length || 0
            const presentes = data?.filter(a => a.presente).length || 0
            const ausentes = total - presentes
            const justificadas = data?.filter(a => !a.presente && a.justificado).length || 0
            const retrasos = data?.filter(a => a.retraso_minutos && a.retraso_minutos > 0).length || 0
            const porcentaje = total > 0 ? (presentes / total) * 100 : 0

            return res.status(200).json({
                total,
                presentes,
                ausentes,
                justificadas,
                retrasos,
                porcentaje_asistencia: parseFloat(porcentaje.toFixed(2)),
                detalle: data || []
            })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Actualizar registro de asistencia
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const {
                presente,
                justificado,
                retraso_minutos,
                retiro_anticipado_minutos,
                observaciones
            } = req.body

            const updateData: any = {}
            if (presente !== undefined) updateData.presente = presente
            if (justificado !== undefined) updateData.justificado = justificado
            if (retraso_minutos !== undefined) updateData.retraso_minutos = retraso_minutos
            if (retiro_anticipado_minutos !== undefined) updateData.retiro_anticipado_minutos = retiro_anticipado_minutos
            if (observaciones !== undefined) updateData.observaciones = observaciones

            const { data, error } = await supabaseAdmin!
                .from('Asistencia')
                .update(updateData)
                .eq('asistencia_id', Number(id))
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Asistencia no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Eliminar registro de asistencia
    public async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { error } = await supabaseAdmin!
                .from('Asistencia')
                .delete()
                .eq('asistencia_id', Number(id))

            if (error) throw error

            return res.status(200).json({ message: 'Asistencia eliminada correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }
}
