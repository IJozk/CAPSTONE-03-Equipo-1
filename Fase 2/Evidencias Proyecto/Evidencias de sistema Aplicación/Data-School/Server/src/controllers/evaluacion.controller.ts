import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class EvaluacionController {

    // Crear nueva evaluación
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                asignatura_id,
                nombre,
                descripcion,
                tipo,
                fecha_evaluacion,
                puntaje_maximo,
                porcentaje_nota,
                is_recuperativa,
                contenido,
                encuesta_id
            } = req.body

            // Validar campos requeridos
            if (!asignatura_id || !nombre || !descripcion || !tipo || !fecha_evaluacion || !puntaje_maximo) {
                return res.status(400).json({
                    message: 'asignatura_id, nombre, descripcion, tipo, fecha_evaluacion y puntaje_maximo son requeridos'
                })
            }

            // Verificar que la asignatura existe
            const { data: asignatura, error: asignaturaError } = await supabaseAdmin!
                .from('Asignatura')
                .select('asignatura_id')
                .eq('asignatura_id', asignatura_id)
                .single()

            if (asignaturaError || !asignatura) {
                return res.status(404).json({ message: 'Asignatura no encontrada' })
            }

            // Crear evaluación
            const { data, error } = await supabaseAdmin!
                .from('Evaluacion')
                .insert({
                    asignatura_id,
                    nombre,
                    descripcion,
                    tipo,
                    fecha_evaluacion,
                    puntaje_maximo,
                    porcentaje_nota: porcentaje_nota || 100,
                    is_recuperativa: is_recuperativa || false,
                    contenido,
                    encuesta_id,
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

    // Obtener todas las evaluaciones
    public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const {
                asignatura_id,
                tipo,
                fecha_inicio,
                fecha_fin,
                estado_activo,
                is_recuperativa
            } = req.query

            let query = supabaseAdmin!
                .from('Evaluacion')
                .select(`
                    *,
                    Asignatura(
                        asignatura_id,
                        nombre,
                        codigo,
                        Curso(curso_id, nombre, nivel),
                        Profesor(profesor_id, nombre_completo)
                    ),
                    Encuesta(encuesta_id, titulo)
                `)

            if (asignatura_id) {
                query = query.eq('asignatura_id', asignatura_id)
            }

            if (tipo) {
                query = query.eq('tipo', tipo)
            }

            if (fecha_inicio) {
                query = query.gte('fecha_evaluacion', fecha_inicio)
            }

            if (fecha_fin) {
                query = query.lte('fecha_evaluacion', fecha_fin)
            }

            if (estado_activo !== undefined) {
                query = query.eq('estado_activo', estado_activo === 'true')
            }

            if (is_recuperativa !== undefined) {
                query = query.eq('is_recuperativa', is_recuperativa === 'true')
            }

            query = query.order('fecha_evaluacion', { ascending: false })

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener evaluación por ID
    public async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Evaluacion')
                .select(`
                    *,
                    Asignatura(
                        asignatura_id,
                        nombre,
                        codigo,
                        Curso(curso_id, nombre, nivel),
                        Profesor(profesor_id, nombre_completo)
                    ),
                    Encuesta(encuesta_id, titulo, descripcion)
                `)
                .eq('evaluacion_id', id)
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Evaluación no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener evaluaciones de una asignatura
    public async getByAsignatura(req: Request, res: Response): Promise<Response> {
        try {
            const { asignatura_id } = req.params
            const { incluir_inactivas } = req.query

            let query = supabaseAdmin!
                .from('Evaluacion')
                .select('*')
                .eq('asignatura_id', asignatura_id)

            if (incluir_inactivas !== 'true') {
                query = query.eq('estado_activo', true)
            }

            query = query.order('fecha_evaluacion', { ascending: false })

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener estadísticas de una evaluación
    public async getEstadisticas(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Obtener la evaluación
            const { data: evaluacion, error: evalError } = await supabaseAdmin!
                .from('Evaluacion')
                .select('*')
                .eq('evaluacion_id', id)
                .single()

            if (evalError) throw evalError

            if (!evaluacion) {
                return res.status(404).json({ message: 'Evaluación no encontrada' })
            }

            // Obtener resultados
            const { data: resultados, error: resError } = await supabaseAdmin!
                .from('ResultadoEvaluacion')
                .select('nota, puntaje_obtenido')
                .eq('evaluacion_id', id)

            if (resError) throw resError

            const total_estudiantes = resultados?.length || 0
            const notas = resultados?.map(r => r.nota).filter(n => n !== null) || []
            const promedio = notas.length > 0
                ? notas.reduce((a, b) => a! + b!, 0)! / notas.length
                : 0
            const nota_maxima = notas.length > 0 ? Math.max(...notas as number[]) : 0
            const nota_minima = notas.length > 0 ? Math.min(...notas as number[]) : 0
            const aprobados = notas.filter(n => n! >= 4.0).length
            const reprobados = notas.filter(n => n! < 4.0).length

            return res.status(200).json({
                evaluacion_id: evaluacion.evaluacion_id,
                nombre: evaluacion.nombre,
                tipo: evaluacion.tipo,
                fecha_evaluacion: evaluacion.fecha_evaluacion,
                puntaje_maximo: evaluacion.puntaje_maximo,
                estadisticas: {
                    total_estudiantes,
                    promedio: parseFloat(promedio.toFixed(2)),
                    nota_maxima,
                    nota_minima,
                    aprobados,
                    reprobados,
                    porcentaje_aprobacion: total_estudiantes > 0
                        ? parseFloat(((aprobados / total_estudiantes) * 100).toFixed(2))
                        : 0
                }
            })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Actualizar evaluación
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const {
                nombre,
                descripcion,
                tipo,
                fecha_evaluacion,
                puntaje_maximo,
                porcentaje_nota,
                is_recuperativa,
                contenido,
                estado_activo
            } = req.body

            const updateData: any = {}
            if (nombre !== undefined) updateData.nombre = nombre
            if (descripcion !== undefined) updateData.descripcion = descripcion
            if (tipo !== undefined) updateData.tipo = tipo
            if (fecha_evaluacion !== undefined) updateData.fecha_evaluacion = fecha_evaluacion
            if (puntaje_maximo !== undefined) updateData.puntaje_maximo = puntaje_maximo
            if (porcentaje_nota !== undefined) updateData.porcentaje_nota = porcentaje_nota
            if (is_recuperativa !== undefined) updateData.is_recuperativa = is_recuperativa
            if (contenido !== undefined) updateData.contenido = contenido
            if (estado_activo !== undefined) updateData.estado_activo = estado_activo
            updateData.updated_at = new Date().toISOString()

            const { data, error } = await supabaseAdmin!
                .from('Evaluacion')
                .update(updateData)
                .eq('evaluacion_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Evaluación no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Deshabilitar evaluación
    public async disable(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Evaluacion')
                .update({
                    estado_activo: false,
                    updated_at: new Date().toISOString()
                })
                .eq('evaluacion_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Evaluación no encontrada' })
            }

            return res.status(200).json({ message: 'Evaluación deshabilitada correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Eliminar evaluación
    public async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Verificar si hay resultados asociados
            const { data: resultados, error: resError } = await supabaseAdmin!
                .from('ResultadoEvaluacion')
                .select('resultado_id')
                .eq('evaluacion_id', id)
                .limit(1)

            if (resError) throw resError

            if (resultados && resultados.length > 0) {
                return res.status(400).json({
                    message: 'No se puede eliminar la evaluación porque tiene resultados asociados'
                })
            }

            const { error } = await supabaseAdmin!
                .from('Evaluacion')
                .delete()
                .eq('evaluacion_id', id)

            if (error) throw error

            return res.status(200).json({ message: 'Evaluación eliminada correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }
}
