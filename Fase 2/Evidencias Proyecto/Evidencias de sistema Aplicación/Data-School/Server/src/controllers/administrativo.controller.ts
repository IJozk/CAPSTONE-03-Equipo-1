import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class AdministrativoController {

    // Crear nuevo administrativo
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                user_id,
                nombre_completo,
                rut,
                area_id,
                cargo,
                telefono,
                fecha_contratacion
            } = req.body

            // Validar campos requeridos
            if (!user_id || !nombre_completo || !area_id) {
                return res.status(400).json({ message: 'user_id, nombre_completo y area_id son requeridos' })
            }

            // Verificar que el user_id existe y tiene role ADMINISTRATIVO
            const { data: userData, error: userError } = await supabaseAdmin!
                .from('User')
                .select('role')
                .eq('user_id', user_id)
                .single()

            if (userError || !userData) {
                return res.status(404).json({ message: 'Usuario no encontrado' })
            }

            if (userData.role !== 'ADMINISTRATIVO') {
                return res.status(400).json({ message: 'El usuario debe tener rol ADMINISTRATIVO' })
            }

            // Crear administrativo
            const { data, error } = await supabaseAdmin!
                .from('Administrativo')
                .insert({
                    user_id,
                    nombre_completo,
                    rut,
                    area_id,
                    cargo,
                    telefono,
                    fecha_contratacion,
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

    // Obtener todos los administrativos activos
    public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { incluir_inactivos } = req.query

            let query = supabaseAdmin!
                .from('Administrativo')
                .select('*, User(email_address, is_active), Area(nombre_area)')

            if (incluir_inactivos !== 'true') {
                query = query.eq('estado_activo', true)
            }

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener administrativo por ID
    public async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Administrativo')
                .select('*, User(email_address, is_active), Area(nombre_area)')
                .eq('administrativo_id', id)
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Administrativo no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Actualizar datos del administrativo (NO modifica User)
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const {
                nombre_completo,
                rut,
                area_id,
                cargo,
                telefono,
                fecha_contratacion
            } = req.body

            // Solo actualizar campos de la tabla Administrativo
            const updateData: any = {}
            if (nombre_completo !== undefined) updateData.nombre_completo = nombre_completo
            if (rut !== undefined) updateData.rut = rut
            if (area_id !== undefined) updateData.area_id = area_id
            if (cargo !== undefined) updateData.cargo = cargo
            if (telefono !== undefined) updateData.telefono = telefono
            if (fecha_contratacion !== undefined) updateData.fecha_contratacion = fecha_contratacion
            updateData.updated_at = new Date().toISOString()

            const { data, error } = await supabaseAdmin!
                .from('Administrativo')
                .update(updateData)
                .eq('administrativo_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Administrativo no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Deshabilitar administrativo (soft delete)
    public async disable(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Deshabilitar en tabla Administrativo
            const { data: administrativoData, error: administrativoError } = await supabaseAdmin!
                .from('Administrativo')
                .update({
                    estado_activo: false,
                    updated_at: new Date().toISOString()
                })
                .eq('administrativo_id', id)
                .select('user_id')
                .single()

            if (administrativoError) throw administrativoError

            if (!administrativoData) {
                return res.status(404).json({ message: 'Administrativo no encontrado' })
            }

            // Deshabilitar cuenta de usuario
            const { error: userError } = await supabaseAdmin!
                .from('User')
                .update({
                    is_active: false,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', administrativoData.user_id)

            if (userError) throw userError

            return res.status(200).json({ message: 'Administrativo deshabilitado correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Habilitar administrativo
    public async enable(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Habilitar en tabla Administrativo
            const { data: administrativoData, error: administrativoError } = await supabaseAdmin!
                .from('Administrativo')
                .update({
                    estado_activo: true,
                    updated_at: new Date().toISOString()
                })
                .eq('administrativo_id', id)
                .select('user_id')
                .single()

            if (administrativoError) throw administrativoError

            if (!administrativoData) {
                return res.status(404).json({ message: 'Administrativo no encontrado' })
            }

            // Habilitar cuenta de usuario
            const { error: userError } = await supabaseAdmin!
                .from('User')
                .update({
                    is_active: true,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', administrativoData.user_id)

            if (userError) throw userError

            return res.status(200).json({ message: 'Administrativo habilitado correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }
}
