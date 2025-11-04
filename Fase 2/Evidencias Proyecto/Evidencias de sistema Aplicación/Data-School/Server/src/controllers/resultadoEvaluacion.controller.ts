import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class ResultadoEvaluacionController {

    // Crear nuevo resultado de evaluación
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                evaluacion_id,
                estudiante_id,
                puntaje_obtenido,
                observaciones,
                fecha_evaluacion
            } = req.body

            // Validar campos requeridos
            if (!evaluacion_id || !estudiante_id || puntaje_obtenido === undefined) {
                return res.status(400).json({
                    message: 'evaluacion_id, estudiante_id y puntaje_obtenido son requeridos'
                })
            }

            // Verificar que la evaluación existe
            const { data: evaluacion, error: evalError } = await supabaseAdmin!
                .from('Evaluacion')
                .select('puntaje_maximo')
                .eq('evaluacion_id', evaluacion_id)
                .single()

            if (evalError || !evaluacion) {
                return res.status(404).json({ message: 'Evaluación no encontrada' })
            }

            // Verificar que el estudiante existe
            const { data: estudiante, error: estError } = await supabaseAdmin!
                .from('Estudiante')
                .select('estudiante_id')
                .eq('estudiante_id', estudiante_id)
                .single()

            if (estError || !estudiante) {
                return res.status(404).json({ message: 'Estudiante no encontrado' })
            }

            // Verificar que no exista ya un resultado para este estudiante y evaluación
            const { data: existente } = await supabaseAdmin!
                .from('ResultadoEvaluacion')
                .select('resultado_id')
                .eq('evaluacion_id', evaluacion_id)
                .eq('estudiante_id', estudiante_id)
                .maybeSingle()

            if (existente) {
                return res.status(400).json({
                    message: 'Ya existe un resultado para este estudiante en esta evaluación'
                })
            }

            // Calcular porcentaje y nota
            const porcentaje = (puntaje_obtenido / evaluacion.puntaje_maximo) * 100
            const nota = this.calcularNota(porcentaje)

            // Crear resultado
            const { data, error } = await supabaseAdmin!
                .from('ResultadoEvaluacion')
                .insert({
                    evaluacion_id,
                    estudiante_id,
                    puntaje_obtenido,
                    porcentaje: parseFloat(porcentaje.toFixed(2)),
                    nota: parseFloat(nota.toFixed(2)),
                    observaciones,
                    fecha_evaluacion: fecha_evaluacion || new Date().toISOString()
                })
                .select()
                .single()

            if (error) throw error

            return res.status(201).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Crear resultados masivos (para toda una evaluación)
    public async createBulk(req: Request, res: Response): Promise<Response> {
        try {
            const { resultados } = req.body

            if (!Array.isArray(resultados) || resultados.length === 0) {
                return res.status(400).json({ message: 'Se requiere un array de resultados' })
            }

            // Validar y procesar cada resultado
            const resultadosProcesados = []

            for (const resultado of resultados) {
                if (!resultado.evaluacion_id || !resultado.estudiante_id || resultado.puntaje_obtenido === undefined) {
                    return res.status(400).json({
                        message: 'Cada resultado debe tener evaluacion_id, estudiante_id y puntaje_obtenido'
                    })
                }

                // Obtener puntaje máximo de la evaluación
                const { data: evaluacion } = await supabaseAdmin!
                    .from('Evaluacion')
                    .select('puntaje_maximo')
                    .eq('evaluacion_id', resultado.evaluacion_id)
                    .single()

                if (!evaluacion) {
                    return res.status(404).json({
                        message: `Evaluación ${resultado.evaluacion_id} no encontrada`
                    })
                }

                const porcentaje = (resultado.puntaje_obtenido / evaluacion.puntaje_maximo) * 100
                const nota = this.calcularNota(porcentaje)

                resultadosProcesados.push({
                    evaluacion_id: resultado.evaluacion_id,
                    estudiante_id: resultado.estudiante_id,
                    puntaje_obtenido: resultado.puntaje_obtenido,
                    porcentaje: parseFloat(porcentaje.toFixed(2)),
                    nota: parseFloat(nota.toFixed(2)),
                    observaciones: resultado.observaciones,
                    fecha_evaluacion: resultado.fecha_evaluacion || new Date().toISOString()
                })
            }

            const { data, error } = await supabaseAdmin!
                .from('ResultadoEvaluacion')
                .insert(resultadosProcesados)
                .select()

            if (error) throw error

            return res.status(201).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener todos los resultados con filtros
    public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const {
                evaluacion_id,
                estudiante_id,
                fecha_inicio,
                fecha_fin
            } = req.query

            let query = supabaseAdmin!
                .from('ResultadoEvaluacion')
                .select(`
                    *,
                    Estudiante(estudiante_id, nombre_completo, rut),
                    Evaluacion(
                        evaluacion_id,
                        nombre,
                        tipo,
                        fecha_evaluacion,
                        puntaje_maximo,
                        Asignatura(asignatura_id, nombre, codigo)
                    )
                `)

            if (evaluacion_id) {
                query = query.eq('evaluacion_id', evaluacion_id)
            }

            if (estudiante_id) {
                query = query.eq('estudiante_id', estudiante_id)
            }

            if (fecha_inicio) {
                query = query.gte('fecha_evaluacion', fecha_inicio)
            }

            if (fecha_fin) {
                query = query.lte('fecha_evaluacion', fecha_fin)
            }

            query = query.order('fecha_evaluacion', { ascending: false })

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener resultado por ID
    public async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('ResultadoEvaluacion')
                .select(`
                    *,
                    Estudiante(estudiante_id, nombre_completo, rut),
                    Evaluacion(
                        evaluacion_id,
                        nombre,
                        descripcion,
                        tipo,
                        fecha_evaluacion,
                        puntaje_maximo,
                        Asignatura(asignatura_id, nombre, codigo, Curso(nombre, nivel))
                    )
                `)
                .eq('resultado_id', id)
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Resultado no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener resultados de un estudiante
    public async getByEstudiante(req: Request, res: Response): Promise<Response> {
        try {
            const { estudiante_id } = req.params
            const { asignatura_id, periodo } = req.query

            let query = supabaseAdmin!
                .from('ResultadoEvaluacion')
                .select(`
                    *,
                    Evaluacion(
                        evaluacion_id,
                        nombre,
                        tipo,
                        fecha_evaluacion,
                        puntaje_maximo,
                        Asignatura(asignatura_id, nombre, codigo, periodo)
                    )
                `)
                .eq('estudiante_id', estudiante_id)

            const { data, error } = await query.order('fecha_evaluacion', { ascending: false })

            if (error) throw error

            // Filtrar por asignatura si se especifica
            let resultados = data || []
            if (asignatura_id) {
                resultados = resultados.filter((r: any) =>
                    r.Evaluacion?.Asignatura?.asignatura_id === asignatura_id
                )
            }

            // Filtrar por periodo si se especifica
            if (periodo) {
                resultados = resultados.filter((r: any) =>
                    r.Evaluacion?.Asignatura?.periodo === periodo
                )
            }

            return res.status(200).json(resultados)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener resultados de una evaluación
    public async getByEvaluacion(req: Request, res: Response): Promise<Response> {
        try {
            const { evaluacion_id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('ResultadoEvaluacion')
                .select(`
                    *,
                    Estudiante(estudiante_id, nombre_completo, rut)
                `)
                .eq('evaluacion_id', evaluacion_id)
                .order('nota', { ascending: false })

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Actualizar resultado
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const { puntaje_obtenido, observaciones } = req.body

            // Obtener el resultado actual y la evaluación
            const { data: resultadoActual, error: resError } = await supabaseAdmin!
                .from('ResultadoEvaluacion')
                .select('evaluacion_id')
                .eq('resultado_id', id)
                .single()

            if (resError || !resultadoActual) {
                return res.status(404).json({ message: 'Resultado no encontrado' })
            }

            const updateData: any = {}

            // Si se actualiza el puntaje, recalcular porcentaje y nota
            if (puntaje_obtenido !== undefined) {
                const { data: evaluacion } = await supabaseAdmin!
                    .from('Evaluacion')
                    .select('puntaje_maximo')
                    .eq('evaluacion_id', resultadoActual.evaluacion_id)
                    .single()

                if (evaluacion) {
                    const porcentaje = (puntaje_obtenido / evaluacion.puntaje_maximo) * 100
                    const nota = this.calcularNota(porcentaje)

                    updateData.puntaje_obtenido = puntaje_obtenido
                    updateData.porcentaje = parseFloat(porcentaje.toFixed(2))
                    updateData.nota = parseFloat(nota.toFixed(2))
                }
            }

            if (observaciones !== undefined) updateData.observaciones = observaciones
            updateData.updated_at = new Date().toISOString()

            const { data, error } = await supabaseAdmin!
                .from('ResultadoEvaluacion')
                .update(updateData)
                .eq('resultado_id', id)
                .select()
                .single()

            if (error) throw error

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Eliminar resultado
    public async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { error } = await supabaseAdmin!
                .from('ResultadoEvaluacion')
                .delete()
                .eq('resultado_id', id)

            if (error) throw error

            return res.status(200).json({ message: 'Resultado eliminado correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Método auxiliar para calcular nota según el sistema chileno (escala 1.0 - 7.0)
    private calcularNota(porcentaje: number): number {
        // Escala chilena: 60% = 4.0 (nota mínima de aprobación)
        // Fórmula: nota = 1.0 + (porcentaje * 6.0 / 100)
        // Con ajuste para que 60% = 4.0
        if (porcentaje < 60) {
            return 1.0 + (porcentaje * 3.0 / 60)
        } else {
            return 4.0 + ((porcentaje - 60) * 3.0 / 40)
        }
    }
}
