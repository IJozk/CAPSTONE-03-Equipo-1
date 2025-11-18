import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class HorarioController {

    // Crear nuevo horario
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                asignatura_id,
                dia_semana,
                hora_inicio,
                hora_termino,
                periodo,
                sala_id
            } = req.body

            // Validar campos requeridos
            if (!asignatura_id || dia_semana === undefined || !hora_inicio || !hora_termino || !periodo) {
                return res.status(400).json({
                    message: 'asignatura_id, dia_semana, hora_inicio, hora_termino y periodo son requeridos'
                })
            }

            // Validar día de semana (1-7, donde 1 = Lunes, 7 = Domingo)
            if (dia_semana < 1 || dia_semana > 7) {
                return res.status(400).json({
                    message: 'dia_semana debe estar entre 1 (Lunes) y 7 (Domingo)'
                })
            }

            // Verificar que la asignatura existe
            const { data: asignatura, error: asigError } = await supabaseAdmin!
                .from('Asignatura')
                .select('asignatura_id, curso_id')
                .eq('asignatura_id', asignatura_id)
                .single()

            if (asigError || !asignatura) {
                return res.status(404).json({ message: 'Asignatura no encontrada' })
            }

            // Verificar conflictos de horario en la sala
            if (sala_id) {
                const { data: conflictoSala } = await supabaseAdmin!
                    .from('Horario')
                    .select('horario_id')
                    .eq('sala_id', sala_id)
                    .eq('dia_semana', dia_semana)
                    .eq('periodo', periodo)
                    .eq('estado_activo', true)
                    .or(`and(hora_inicio.lte.${hora_termino},hora_termino.gte.${hora_inicio})`)
                    .limit(1)

                if (conflictoSala && conflictoSala.length > 0) {
                    return res.status(400).json({
                        message: 'Conflicto de horario: la sala ya está ocupada en ese horario'
                    })
                }
            }

            // Crear horario
            const { data, error } = await supabaseAdmin!
                .from('Horario')
                .insert({
                    asignatura_id,
                    dia_semana,
                    hora_inicio,
                    hora_termino,
                    periodo,
                    sala_id,
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

    // Crear múltiples horarios (para configurar horario de una asignatura)
    public async createBulk(req: Request, res: Response): Promise<Response> {
        try {
            const { horarios } = req.body

            if (!Array.isArray(horarios) || horarios.length === 0) {
                return res.status(400).json({ message: 'Se requiere un array de horarios' })
            }

            // Validar cada horario
            for (const horario of horarios) {
                if (!horario.asignatura_id || horario.dia_semana === undefined ||
                    !horario.hora_inicio || !horario.hora_termino || !horario.periodo) {
                    return res.status(400).json({
                        message: 'Cada horario debe tener asignatura_id, dia_semana, hora_inicio, hora_termino y periodo'
                    })
                }
            }

            const { data, error } = await supabaseAdmin!
                .from('Horario')
                .insert(horarios.map(h => ({ ...h, estado_activo: true })))
                .select()

            if (error) throw error

            return res.status(201).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener todos los horarios con filtros
    public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const {
                asignatura_id,
                dia_semana,
                periodo,
                sala_id,
                estado_activo
            } = req.query

            let query = supabaseAdmin!
                .from('Horario')
                .select(`
                    *,
                    Asignatura(
                        asignatura_id,
                        nombre,
                        codigo,
                        Curso(curso_id, nombre, nivel_id),
                        Profesor(profesor_id, nombre_completo)
                    ),
                    Sala(sala_id, nombre, zona_id)
                `)

            if (asignatura_id) {
                query = query.eq('asignatura_id', asignatura_id)
            }

            if (dia_semana) {
                query = query.eq('dia_semana', dia_semana)
            }

            if (periodo) {
                query = query.eq('periodo', periodo)
            }

            if (sala_id) {
                query = query.eq('sala_id', sala_id)
            }

            if (estado_activo !== undefined) {
                query = query.eq('estado_activo', estado_activo === 'true')
            }

            query = query.order('dia_semana', { ascending: true })
                .order('hora_inicio', { ascending: true })

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener horario por ID
    public async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Horario')
                .select(`
                    *,
                    Asignatura(
                        asignatura_id,
                        nombre,
                        codigo,
                        Curso(curso_id, nombre, nivel_id),
                        Profesor(profesor_id, nombre_completo)
                    ),
                    Sala(sala_id, nombre, capacidad, zona_id)
                `)
                .eq('horario_id', id)
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Horario no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener horario de un curso
    public async getByCurso(req: Request, res: Response): Promise<Response> {
        try {
            const { curso_id } = req.params
            const { periodo } = req.query

            console.log('📅 Buscando horario para curso:', curso_id)
            console.log('📅 Periodo:', periodo)

            // Primero, verificar asignaturas del curso
            const { data: asignaturas } = await supabaseAdmin!
                .from('Asignatura')
                .select('asignatura_id, nombre, curso_id')
                .eq('curso_id', curso_id)

            console.log('📚 Asignaturas del curso:', asignaturas?.length || 0)
            if (asignaturas && asignaturas.length > 0) {
                console.log('📚 Primera asignatura:', asignaturas[0])
            }

            // Luego, verificar horarios sin filtro de curso
            const { data: todosHorarios } = await supabaseAdmin!
                .from('Horario')
                .select('horario_id, asignatura_id, periodo, estado_activo, Asignatura(curso_id)')
                .eq('estado_activo', true)
                .limit(5)

            console.log('⏰ Algunos horarios en la tabla (activos):', todosHorarios?.length || 0)
            if (todosHorarios && todosHorarios.length > 0) {
                console.log('⏰ Primer horario:', todosHorarios[0])
            }

            let query = supabaseAdmin!
                .from('Horario')
                .select(`
                    *,
                    Asignatura!inner(
                        asignatura_id,
                        nombre,
                        codigo,
                        curso_id,
                        Curso(curso_id, nombre, nivel_id),
                        Profesor(profesor_id, nombre_completo)
                    ),
                    Sala(sala_id, nombre)
                `)
                .eq('Asignatura.curso_id', curso_id)
                .eq('estado_activo', true)

            if (periodo) {
                query = query.eq('periodo', periodo)
            }

            query = query.order('dia_semana', { ascending: true })
                .order('hora_inicio', { ascending: true })

            const { data, error } = await query

            console.log('📅 Horarios encontrados con filtros:', data?.length || 0)
            console.log('📅 Error:', error)
            if (data && data.length > 0) {
                console.log('📅 Primer horario:', data[0])
            }

            if (error) throw error

            // Retornar array de horarios sin agrupar
            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener horario de un profesor
    public async getByProfesor(req: Request, res: Response): Promise<Response> {
        try {
            const { profesor_id } = req.params
            const { periodo } = req.query

            let query = supabaseAdmin!
                .from('Horario')
                .select(`
                    *,
                    Asignatura!inner(
                        asignatura_id,
                        nombre,
                        codigo,
                        profesor_id,
                        Curso(curso_id, nombre, nivel_id)
                    ),
                    Sala(sala_id, nombre)
                `)
                .eq('Asignatura.profesor_id', profesor_id)
                .eq('estado_activo', true)

            if (periodo) {
                query = query.eq('periodo', periodo)
            }

            query = query.order('dia_semana', { ascending: true })
                .order('hora_inicio', { ascending: true })

            const { data, error } = await query

            if (error) throw error

            // Agrupar por día de semana
            const horarioPorDia = this.agruparPorDia(data || [])

            return res.status(200).json(horarioPorDia)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener horario de una sala
    public async getBySala(req: Request, res: Response): Promise<Response> {
        try {
            const { sala_id } = req.params
            const { periodo } = req.query

            let query = supabaseAdmin!
                .from('Horario')
                .select(`
                    *,
                    Asignatura(
                        asignatura_id,
                        nombre,
                        codigo,
                        Curso(curso_id, nombre, nivel_id),
                        Profesor(profesor_id, nombre_completo)
                    )
                `)
                .eq('sala_id', sala_id)
                .eq('estado_activo', true)

            if (periodo) {
                query = query.eq('periodo', periodo)
            }

            query = query.order('dia_semana', { ascending: true })
                .order('hora_inicio', { ascending: true })

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Actualizar horario
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const {
                dia_semana,
                hora_inicio,
                hora_termino,
                sala_id,
                estado_activo
            } = req.body

            const updateData: any = {}
            if (dia_semana !== undefined) updateData.dia_semana = dia_semana
            if (hora_inicio !== undefined) updateData.hora_inicio = hora_inicio
            if (hora_termino !== undefined) updateData.hora_termino = hora_termino
            if (sala_id !== undefined) updateData.sala_id = sala_id
            if (estado_activo !== undefined) updateData.estado_activo = estado_activo

            const { data, error } = await supabaseAdmin!
                .from('Horario')
                .update(updateData)
                .eq('horario_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Horario no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Deshabilitar horario
    public async disable(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Horario')
                .update({ estado_activo: false })
                .eq('horario_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Horario no encontrado' })
            }

            return res.status(200).json({ message: 'Horario deshabilitado correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Eliminar horario
    public async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { error } = await supabaseAdmin!
                .from('Horario')
                .delete()
                .eq('horario_id', id)

            if (error) throw error

            return res.status(200).json({ message: 'Horario eliminado correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Método auxiliar para agrupar horarios por día
    private agruparPorDia(horarios: any[]): any {
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
        const horarioPorDia: any = {}

        // Inicializar todos los días con arrays vacíos
        dias.forEach(dia => {
            horarioPorDia[dia] = []
        })

        // Agrupar horarios por día
        // dia_semana: 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
        horarios.forEach(horario => {
            const nombreDia = dias[horario.dia_semana]
            if (nombreDia) {
                horarioPorDia[nombreDia].push(horario)
            }
        })

        return horarioPorDia
    }
}
