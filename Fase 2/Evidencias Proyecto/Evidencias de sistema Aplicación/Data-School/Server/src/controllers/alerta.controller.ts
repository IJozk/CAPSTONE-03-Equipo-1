import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class AlertaController {

    // Crear nueva alerta
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                tipo_alerta_id,
                titulo,
                mensaje,
                estudiante_id,
                profesor_id,
                administrativo_id,
                evento_id,
                prioridad,
                fecha_vencimiento,
                creado_por
            } = req.body

            // Validar campos requeridos
            if (!tipo_alerta_id || !titulo || !mensaje) {
                return res.status(400).json({
                    message: 'tipo_alerta_id, titulo y mensaje son requeridos'
                })
            }

            // Verificar que al menos uno de los destinatarios está presente
            if (!estudiante_id && !profesor_id && !administrativo_id) {
                return res.status(400).json({
                    message: 'Debe especificar al menos un destinatario (estudiante, profesor o administrativo)'
                })
            }

            // Verificar que el tipo de alerta existe
            const { data: tipoAlerta, error: tipoError } = await supabaseAdmin!
                .from('TipoAlerta')
                .select('tipo_alerta_id, nivel_prioridad')
                .eq('tipo_alerta_id', tipo_alerta_id)
                .single()

            if (tipoError || !tipoAlerta) {
                return res.status(404).json({ message: 'Tipo de alerta no encontrado' })
            }

            // Crear alerta
            const { data, error } = await supabaseAdmin!
                .from('Alerta')
                .insert({
                    tipo_alerta_id,
                    titulo,
                    mensaje,
                    estudiante_id,
                    profesor_id,
                    administrativo_id,
                    evento_id,
                    prioridad: prioridad || tipoAlerta.nivel_prioridad || 1,
                    fecha_vencimiento,
                    creado_por,
                    estado: 'PENDIENTE',
                    fecha_creacion: new Date().toISOString()
                })
                .select()
                .single()

            if (error) throw error

            return res.status(201).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener todas las alertas con filtros
    public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const {
                estado,
                tipo_alerta_id,
                estudiante_id,
                profesor_id,
                administrativo_id,
                prioridad,
                fecha_inicio,
                fecha_fin
            } = req.query

            let query = supabaseAdmin!
                .from('Alerta')
                .select(`
                    *,
                    TipoAlerta(tipo_alerta_id, nombre, color_hex, nivel_prioridad),
                    Estudiante(estudiante_id, nombre_completo, rut),
                    Profesor(profesor_id, nombre_completo),
                    Administrativo(administrativo_id, nombre_completo),
                    Evento(evento_id, nombre, fecha_inicio),
                    creado_por_user:User!Alerta_creado_por_fkey(user_id, email_address),
                    resuelto_por_user:User!Alerta_resuelto_por_fkey(user_id, email_address)
                `)

            if (estado && typeof estado === 'string') {
                query = query.eq('estado', estado as 'PENDIENTE' | 'VISTA' | 'RESUELTA' | 'ARCHIVADA')
            }

            if (tipo_alerta_id) {
                query = query.eq('tipo_alerta_id', Number(tipo_alerta_id))
            }

            if (estudiante_id) {
                query = query.eq('estudiante_id', estudiante_id as string)
            }

            if (profesor_id) {
                query = query.eq('profesor_id', profesor_id as string)
            }

            if (administrativo_id) {
                query = query.eq('administrativo_id', administrativo_id as string)
            }

            if (prioridad) {
                query = query.eq('prioridad', Number(prioridad))
            }

            if (fecha_inicio) {
                query = query.gte('fecha_creacion', fecha_inicio)
            }

            if (fecha_fin) {
                query = query.lte('fecha_creacion', fecha_fin)
            }

            query = query.order('prioridad', { ascending: false })
                .order('fecha_creacion', { ascending: false })

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener alerta por ID
    public async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Alerta')
                .select(`
                    *,
                    TipoAlerta(tipo_alerta_id, nombre, descripcion, color_hex, nivel_prioridad),
                    Estudiante(estudiante_id, nombre_completo, rut, email),
                    Profesor(profesor_id, nombre_completo),
                    Administrativo(administrativo_id, nombre_completo),
                    Evento(evento_id, nombre, fecha_inicio, lugar),
                    creado_por_user:User!Alerta_creado_por_fkey(user_id, email_address),
                    resuelto_por_user:User!Alerta_resuelto_por_fkey(user_id, email_address)
                `)
                .eq('alerta_id', Number(id))
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Alerta no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener alertas de un estudiante
    public async getByEstudiante(req: Request, res: Response): Promise<Response> {
        try {
            const { estudiante_id } = req.params
            const { estado } = req.query

            let query = supabaseAdmin!
                .from('Alerta')
                .select(`
                    *,
                    TipoAlerta(tipo_alerta_id, nombre, color_hex, nivel_prioridad)
                `)
                .eq('estudiante_id', estudiante_id)

            if (estado) {
                query = query.eq('estado', estado as 'PENDIENTE' | 'VISTA' | 'RESUELTA' | 'ARCHIVADA')
            }

            query = query.order('prioridad', { ascending: false })
                .order('fecha_creacion', { ascending: false })

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener alertas pendientes
    public async getPendientes(req: Request, res: Response): Promise<Response> {
        try {
            const { data, error } = await supabaseAdmin!
                .from('Alerta')
                .select(`
                    *,
                    TipoAlerta(tipo_alerta_id, nombre, color_hex, nivel_prioridad),
                    Estudiante(estudiante_id, nombre_completo)
                `)
                .eq('estado', 'PENDIENTE')
                .order('prioridad', { ascending: false })
                .order('fecha_creacion', { ascending: false })

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener alertas vencidas
    public async getVencidas(req: Request, res: Response): Promise<Response> {
        try {
            const hoy = new Date().toISOString()

            const { data, error } = await supabaseAdmin!
                .from('Alerta')
                .select(`
                    *,
                    TipoAlerta(tipo_alerta_id, nombre, color_hex),
                    Estudiante(estudiante_id, nombre_completo)
                `)
                .in('estado', ['PENDIENTE', 'VISTA'])
                .not('fecha_vencimiento', 'is', null)
                .lt('fecha_vencimiento', hoy)
                .order('fecha_vencimiento', { ascending: true })

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Actualizar alerta
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const {
                titulo,
                mensaje,
                prioridad,
                fecha_vencimiento
            } = req.body

            const updateData: any = {}
            if (titulo !== undefined) updateData.titulo = titulo
            if (mensaje !== undefined) updateData.mensaje = mensaje
            if (prioridad !== undefined) updateData.prioridad = prioridad
            if (fecha_vencimiento !== undefined) updateData.fecha_vencimiento = fecha_vencimiento

            const { data, error } = await supabaseAdmin!
                .from('Alerta')
                .update(updateData)
                .eq('alerta_id', Number(id))
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Alerta no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Marcar como vista
    public async marcarVista(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Alerta')
                .update({ estado: 'VISTA' })
                .eq('alerta_id', Number(id))
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Alerta no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Resolver alerta
    public async resolver(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const { observaciones_resolucion, resuelto_por } = req.body

            const { data, error } = await supabaseAdmin!
                .from('Alerta')
                .update({
                    estado: 'RESUELTA',
                    observaciones_resolucion,
                    resuelto_por,
                    fecha_resolucion: new Date().toISOString()
                })
                .eq('alerta_id', Number(id))
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Alerta no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Archivar alerta
    public async archivar(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Alerta')
                .update({ estado: 'ARCHIVADA' })
                .eq('alerta_id', Number(id))
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Alerta no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Eliminar alerta
    public async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { error } = await supabaseAdmin!
                .from('Alerta')
                .delete()
                .eq('alerta_id', Number(id))

            if (error) throw error

            return res.status(200).json({ message: 'Alerta eliminada correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }
}
