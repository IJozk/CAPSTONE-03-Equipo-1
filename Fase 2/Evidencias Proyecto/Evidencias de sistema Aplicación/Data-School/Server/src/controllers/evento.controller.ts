import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class EventoController {

    // Crear nuevo evento
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                nombre,
                lugar,
                fecha_inicio,
                fecha_fin,
                creado_por
            } = req.body

            // Validar campos requeridos
            if (!nombre) {
                return res.status(400).json({
                    message: 'nombre es requerido'
                })
            }

            // Verificar que creado_por existe si se proporciona
            if (creado_por) {
                const { data: user, error: userError } = await supabaseAdmin!
                    .from('User')
                    .select('user_id')
                    .eq('user_id', creado_por)
                    .single()

                if (userError || !user) {
                    return res.status(404).json({ message: 'Usuario creador no encontrado' })
                }
            }

            // Crear evento
            const { data, error } = await supabaseAdmin!
                .from('Evento')
                .insert({
                    nombre,
                    lugar,
                    fecha_inicio,
                    fecha_fin,
                    creado_por
                })
                .select()
                .single()

            if (error) throw error

            return res.status(201).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener todos los eventos
    public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { fecha_inicio, fecha_fin, lugar } = req.query

            let query = supabaseAdmin!
                .from('Evento')
                .select(`
                    *,
                    creado_por_user:User!Evento_creado_por_fkey(user_id, email_address),
                    modificado_por_user:User!Evento_modificado_por_fkey(user_id, email_address)
                `)

            if (fecha_inicio) {
                query = query.gte('fecha_inicio', fecha_inicio)
            }

            if (fecha_fin) {
                query = query.lte('fecha_fin', fecha_fin)
            }

            if (lugar) {
                query = query.ilike('lugar', `%${lugar}%`)
            }

            query = query.order('fecha_inicio', { ascending: false })

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener evento por ID
    public async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Evento')
                .select(`
                    *,
                    creado_por_user:User!Evento_creado_por_fkey(user_id, email_address),
                    modificado_por_user:User!Evento_modificado_por_fkey(user_id, email_address)
                `)
                .eq('evento_id', id)
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Evento no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener eventos próximos
    public async getProximos(req: Request, res: Response): Promise<Response> {
        try {
            const hoy = new Date().toISOString()

            const { data, error } = await supabaseAdmin!
                .from('Evento')
                .select(`
                    *,
                    creado_por_user:User!Evento_creado_por_fkey(user_id, email_address)
                `)
                .gte('fecha_inicio', hoy)
                .order('fecha_inicio', { ascending: true })

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener eventos pasados
    public async getPasados(req: Request, res: Response): Promise<Response> {
        try {
            const hoy = new Date().toISOString()

            const { data, error } = await supabaseAdmin!
                .from('Evento')
                .select(`
                    *,
                    creado_por_user:User!Evento_creado_por_fkey(user_id, email_address)
                `)
                .lt('fecha_fin', hoy)
                .order('fecha_inicio', { ascending: false })

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener eventos en curso
    public async getEnCurso(req: Request, res: Response): Promise<Response> {
        try {
            const hoy = new Date().toISOString()

            const { data, error } = await supabaseAdmin!
                .from('Evento')
                .select(`
                    *,
                    creado_por_user:User!Evento_creado_por_fkey(user_id, email_address)
                `)
                .lte('fecha_inicio', hoy)
                .gte('fecha_fin', hoy)
                .order('fecha_inicio', { ascending: true })

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener alertas asociadas a un evento
    public async getAlertas(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Alerta')
                .select(`
                    *,
                    TipoAlerta(tipo_alerta_id, nombre, color_hex),
                    Estudiante(estudiante_id, nombre_completo)
                `)
                .eq('evento_id', id)
                .order('fecha_creacion', { ascending: false })

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Actualizar evento
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const {
                nombre,
                lugar,
                fecha_inicio,
                fecha_fin,
                modificado_por
            } = req.body

            const updateData: any = {}
            if (nombre !== undefined) updateData.nombre = nombre
            if (lugar !== undefined) updateData.lugar = lugar
            if (fecha_inicio !== undefined) updateData.fecha_inicio = fecha_inicio
            if (fecha_fin !== undefined) updateData.fecha_fin = fecha_fin
            if (modificado_por !== undefined) updateData.modificado_por = modificado_por
            updateData.modificado_en = new Date().toISOString()

            const { data, error } = await supabaseAdmin!
                .from('Evento')
                .update(updateData)
                .eq('evento_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Evento no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Eliminar evento
    public async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Verificar si hay alertas asociadas
            const { data: alertas } = await supabaseAdmin!
                .from('Alerta')
                .select('alerta_id')
                .eq('evento_id', id)
                .limit(1)

            if (alertas && alertas.length > 0) {
                return res.status(400).json({
                    message: 'No se puede eliminar el evento porque tiene alertas asociadas'
                })
            }

            const { error } = await supabaseAdmin!
                .from('Evento')
                .delete()
                .eq('evento_id', id)

            if (error) throw error

            return res.status(200).json({ message: 'Evento eliminado correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }
}
