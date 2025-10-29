import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class SalaController {

    // Crear nueva sala
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                sala_id,
                nombre,
                zona_id,
                capacidad,
                tiene_proyector,
                tiene_pizarra_digital,
                distribucion_asientos_template
            } = req.body

            // Validar campos requeridos
            if (!sala_id || !nombre || !zona_id) {
                return res.status(400).json({
                    message: 'sala_id, nombre y zona_id son requeridos'
                })
            }

            // Verificar que la zona existe
            const { data: zona, error: zonaError } = await supabaseAdmin!
                .from('Zona')
                .select('zona_id')
                .eq('zona_id', zona_id)
                .single()

            if (zonaError || !zona) {
                return res.status(404).json({ message: 'Zona no encontrada' })
            }

            // Verificar que no exista ya una sala con ese ID
            const { data: existente } = await supabaseAdmin!
                .from('Sala')
                .select('sala_id')
                .eq('sala_id', sala_id)
                .maybeSingle()

            if (existente) {
                return res.status(400).json({
                    message: 'Ya existe una sala con ese ID'
                })
            }

            // Crear sala
            const { data, error } = await supabaseAdmin!
                .from('Sala')
                .insert({
                    sala_id,
                    nombre,
                    zona_id,
                    capacidad,
                    tiene_proyector: tiene_proyector || false,
                    tiene_pizarra_digital: tiene_pizarra_digital || false,
                    distribucion_asientos_template,
                    estado: 'DISPONIBLE'
                })
                .select()
                .single()

            if (error) throw error

            return res.status(201).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener todas las salas
    public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { zona_id, estado, tiene_proyector, tiene_pizarra_digital } = req.query

            let query = supabaseAdmin!
                .from('Sala')
                .select(`
                    *,
                    Zona(zona_id, nombre_zona, descripcion, Colegio(colegio_id, nombre))
                `)

            if (zona_id) {
                query = query.eq('zona_id', zona_id)
            }

            if (estado) {
                query = query.eq('estado', estado)
            }

            if (tiene_proyector !== undefined) {
                query = query.eq('tiene_proyector', tiene_proyector === 'true')
            }

            if (tiene_pizarra_digital !== undefined) {
                query = query.eq('tiene_pizarra_digital', tiene_pizarra_digital === 'true')
            }

            query = query.order('nombre', { ascending: true })

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener sala por ID
    public async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Sala')
                .select(`
                    *,
                    Zona(zona_id, nombre_zona, descripcion, capacidad_total, Colegio(colegio_id, nombre))
                `)
                .eq('sala_id', id)
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Sala no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener salas disponibles
    public async getDisponibles(req: Request, res: Response): Promise<Response> {
        try {
            const { zona_id } = req.query

            let query = supabaseAdmin!
                .from('Sala')
                .select(`
                    *,
                    Zona(zona_id, nombre_zona)
                `)
                .eq('estado', 'DISPONIBLE')

            if (zona_id) {
                query = query.eq('zona_id', zona_id)
            }

            query = query.order('nombre', { ascending: true })

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Verificar disponibilidad de sala en un horario
    public async verificarDisponibilidad(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const { dia_semana, hora_inicio, hora_termino, periodo } = req.query

            if (!dia_semana || !hora_inicio || !hora_termino || !periodo) {
                return res.status(400).json({
                    message: 'dia_semana, hora_inicio, hora_termino y periodo son requeridos'
                })
            }

            // Buscar conflictos en el horario
            const { data: conflictos, error } = await supabaseAdmin!
                .from('Horario')
                .select(`
                    *,
                    Asignatura(asignatura_id, nombre, Curso(nombre))
                `)
                .eq('sala_id', id)
                .eq('dia_semana', dia_semana)
                .eq('periodo', periodo)
                .eq('estado_activo', true)
                .or(`and(hora_inicio.lte.${hora_termino},hora_termino.gte.${hora_inicio})`)

            if (error) throw error

            const disponible = !conflictos || conflictos.length === 0

            return res.status(200).json({
                disponible,
                conflictos: conflictos || []
            })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener horario completo de una sala
    public async getHorario(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const { periodo } = req.query

            let query = supabaseAdmin!
                .from('Horario')
                .select(`
                    *,
                    Asignatura(
                        asignatura_id,
                        nombre,
                        codigo,
                        Curso(curso_id, nombre, nivel),
                        Profesor(profesor_id, nombre_completo)
                    )
                `)
                .eq('sala_id', id)
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

    // Actualizar sala
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const {
                nombre,
                zona_id,
                capacidad,
                tiene_proyector,
                tiene_pizarra_digital,
                distribucion_asientos_template,
                estado
            } = req.body

            const updateData: any = {}
            if (nombre !== undefined) updateData.nombre = nombre
            if (zona_id !== undefined) updateData.zona_id = zona_id
            if (capacidad !== undefined) updateData.capacidad = capacidad
            if (tiene_proyector !== undefined) updateData.tiene_proyector = tiene_proyector
            if (tiene_pizarra_digital !== undefined) updateData.tiene_pizarra_digital = tiene_pizarra_digital
            if (distribucion_asientos_template !== undefined) updateData.distribucion_asientos_template = distribucion_asientos_template
            if (estado !== undefined) updateData.estado = estado

            const { data, error } = await supabaseAdmin!
                .from('Sala')
                .update(updateData)
                .eq('sala_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Sala no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Cambiar estado de sala
    public async cambiarEstado(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const { estado } = req.body

            if (!estado || !['DISPONIBLE', 'MANTENIMIENTO', 'FUERA_DE_SERVICIO'].includes(estado)) {
                return res.status(400).json({
                    message: 'Estado inválido. Debe ser: DISPONIBLE, MANTENIMIENTO o FUERA_DE_SERVICIO'
                })
            }

            const { data, error } = await supabaseAdmin!
                .from('Sala')
                .update({ estado })
                .eq('sala_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Sala no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Eliminar sala
    public async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Verificar si hay horarios asociados
            const { data: horarios } = await supabaseAdmin!
                .from('Horario')
                .select('horario_id')
                .eq('sala_id', id)
                .limit(1)

            if (horarios && horarios.length > 0) {
                return res.status(400).json({
                    message: 'No se puede eliminar la sala porque tiene horarios asociados'
                })
            }

            const { error } = await supabaseAdmin!
                .from('Sala')
                .delete()
                .eq('sala_id', id)

            if (error) throw error

            return res.status(200).json({ message: 'Sala eliminada correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }
}
