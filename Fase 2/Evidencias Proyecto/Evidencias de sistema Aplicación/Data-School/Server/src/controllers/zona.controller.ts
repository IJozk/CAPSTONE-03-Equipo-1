import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class ZonaController {

    // Crear nueva zona
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                zona_id,
                nombre_zona,
                descripcion,
                colegio_id,
                capacidad_total
            } = req.body

            // Validar campos requeridos
            if (!zona_id || !nombre_zona || !colegio_id) {
                return res.status(400).json({
                    message: 'zona_id, nombre_zona y colegio_id son requeridos'
                })
            }

            // Verificar que el colegio existe
            const { data: colegio, error: colegioError } = await supabaseAdmin!
                .from('Colegio')
                .select('colegio_id')
                .eq('colegio_id', colegio_id)
                .single()

            if (colegioError || !colegio) {
                return res.status(404).json({ message: 'Colegio no encontrado' })
            }

            // Verificar que no exista ya una zona con ese ID
            const { data: existente } = await supabaseAdmin!
                .from('Zona')
                .select('zona_id')
                .eq('zona_id', zona_id)
                .maybeSingle()

            if (existente) {
                return res.status(400).json({
                    message: 'Ya existe una zona con ese ID'
                })
            }

            // Crear zona
            const { data, error } = await supabaseAdmin!
                .from('Zona')
                .insert({
                    zona_id,
                    nombre_zona,
                    descripcion,
                    colegio_id,
                    capacidad_total
                })
                .select()
                .single()

            if (error) throw error

            return res.status(201).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener todas las zonas
    public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { colegio_id } = req.query

            let query = supabaseAdmin!
                .from('Zona')
                .select(`
                    *,
                    Colegio(colegio_id, nombre)
                `)

            if (colegio_id) {
                query = query.eq('colegio_id', colegio_id)
            }

            query = query.order('nombre_zona', { ascending: true })

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener zona por ID
    public async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Zona')
                .select(`
                    *,
                    Colegio(colegio_id, nombre, direccion)
                `)
                .eq('zona_id', id)
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Zona no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener salas de una zona
    public async getSalas(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Sala')
                .select(`
                    sala_id,
                    nombre,
                    capacidad,
                    estado,
                    tiene_proyector,
                    tiene_pizarra_digital
                `)
                .eq('zona_id', id)
                .order('nombre', { ascending: true })

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener estadísticas de una zona
    public async getEstadisticas(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Obtener la zona
            const { data: zona, error: zonaError } = await supabaseAdmin!
                .from('Zona')
                .select('*')
                .eq('zona_id', id)
                .single()

            if (zonaError || !zona) {
                return res.status(404).json({ message: 'Zona no encontrada' })
            }

            // Obtener salas de la zona
            const { data: salas, error: salasError } = await supabaseAdmin!
                .from('Sala')
                .select('sala_id, capacidad, estado')
                .eq('zona_id', id)

            if (salasError) throw salasError

            const total_salas = salas?.length || 0
            const salas_disponibles = salas?.filter(s => s.estado === 'DISPONIBLE').length || 0
            const salas_mantenimiento = salas?.filter(s => s.estado === 'MANTENIMIENTO').length || 0
            const salas_fuera_servicio = salas?.filter(s => s.estado === 'FUERA_DE_SERVICIO').length || 0
            const capacidad_total_real = salas?.reduce((sum, s) => sum + (s.capacidad || 0), 0) || 0

            return res.status(200).json({
                zona_id: zona.zona_id,
                nombre_zona: zona.nombre_zona,
                capacidad_total_declarada: zona.capacidad_total,
                capacidad_total_real,
                estadisticas: {
                    total_salas,
                    salas_disponibles,
                    salas_mantenimiento,
                    salas_fuera_servicio
                }
            })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Actualizar zona
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const {
                nombre_zona,
                descripcion,
                capacidad_total
            } = req.body

            const updateData: any = {}
            if (nombre_zona !== undefined) updateData.nombre_zona = nombre_zona
            if (descripcion !== undefined) updateData.descripcion = descripcion
            if (capacidad_total !== undefined) updateData.capacidad_total = capacidad_total

            const { data, error } = await supabaseAdmin!
                .from('Zona')
                .update(updateData)
                .eq('zona_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Zona no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Eliminar zona
    public async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Verificar si hay salas asociadas
            const { data: salas } = await supabaseAdmin!
                .from('Sala')
                .select('sala_id')
                .eq('zona_id', id)
                .limit(1)

            if (salas && salas.length > 0) {
                return res.status(400).json({
                    message: 'No se puede eliminar la zona porque tiene salas asociadas'
                })
            }

            const { error } = await supabaseAdmin!
                .from('Zona')
                .delete()
                .eq('zona_id', id)

            if (error) throw error

            return res.status(200).json({ message: 'Zona eliminada correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }
}
