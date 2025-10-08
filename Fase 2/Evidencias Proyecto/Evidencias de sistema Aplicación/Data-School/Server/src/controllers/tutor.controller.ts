import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class TutorController {

    // Crear nuevo tutor (puede o no tener cuenta de usuario)
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                user_id,
                nombre_completo,
                rut,
                telefono,
                telefono_emergencia,
                direccion,
                ocupacion,
                email
            } = req.body

            // Validar campos requeridos
            if (!nombre_completo) {
                return res.status(400).json({ message: 'nombre_completo es requerido' })
            }

            // Si tiene user_id, verificar que existe y tiene role TUTOR
            if (user_id) {
                const { data: userData, error: userError } = await supabaseAdmin!
                    .from('User')
                    .select('role')
                    .eq('user_id', user_id)
                    .single()

                if (userError || !userData) {
                    return res.status(404).json({ message: 'Usuario no encontrado' })
                }

                if (userData.role !== 'TUTOR') {
                    return res.status(400).json({ message: 'El usuario debe tener rol TUTOR' })
                }
            }

            // Crear tutor
            const { data, error } = await supabaseAdmin!
                .from('Tutor')
                .insert({
                    user_id,
                    nombre_completo,
                    rut,
                    telefono,
                    telefono_emergencia,
                    direccion,
                    ocupacion,
                    email,
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

    // Obtener todos los tutores activos
    public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { incluir_inactivos, con_cuenta } = req.query

            let query = supabaseAdmin!
                .from('Tutor')
                .select('*, User(email_address, is_active)')

            if (incluir_inactivos !== 'true') {
                query = query.eq('estado_activo', true)
            }

            // Filtrar por tutores con o sin cuenta
            if (con_cuenta === 'true') {
                query = query.not('user_id', 'is', null)
            } else if (con_cuenta === 'false') {
                query = query.is('user_id', null)
            }

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener tutor por ID
    public async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Tutor')
                .select('*, User(email_address, is_active)')
                .eq('tutor_id', id)
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Tutor no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Actualizar datos del tutor (NO modifica User)
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const {
                nombre_completo,
                rut,
                telefono,
                telefono_emergencia,
                direccion,
                ocupacion,
                email
            } = req.body

            // Solo actualizar campos de la tabla Tutor
            const updateData: any = {}
            if (nombre_completo !== undefined) updateData.nombre_completo = nombre_completo
            if (rut !== undefined) updateData.rut = rut
            if (telefono !== undefined) updateData.telefono = telefono
            if (telefono_emergencia !== undefined) updateData.telefono_emergencia = telefono_emergencia
            if (direccion !== undefined) updateData.direccion = direccion
            if (ocupacion !== undefined) updateData.ocupacion = ocupacion
            if (email !== undefined) updateData.email = email
            updateData.updated_at = new Date().toISOString()

            const { data, error } = await supabaseAdmin!
                .from('Tutor')
                .update(updateData)
                .eq('tutor_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Tutor no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Deshabilitar tutor (soft delete)
    public async disable(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Deshabilitar en tabla Tutor
            const { data: tutorData, error: tutorError } = await supabaseAdmin!
                .from('Tutor')
                .update({
                    estado_activo: false,
                    updated_at: new Date().toISOString()
                })
                .eq('tutor_id', id)
                .select('user_id')
                .single()

            if (tutorError) throw tutorError

            if (!tutorData) {
                return res.status(404).json({ message: 'Tutor no encontrado' })
            }

            // Si tiene cuenta de usuario, deshabilitarla
            if (tutorData.user_id) {
                const { error: userError } = await supabaseAdmin!
                    .from('User')
                    .update({
                        is_active: false,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', tutorData.user_id)

                if (userError) throw userError
            }

            return res.status(200).json({ message: 'Tutor deshabilitado correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Habilitar tutor
    public async enable(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Habilitar en tabla Tutor
            const { data: tutorData, error: tutorError } = await supabaseAdmin!
                .from('Tutor')
                .update({
                    estado_activo: true,
                    updated_at: new Date().toISOString()
                })
                .eq('tutor_id', id)
                .select('user_id')
                .single()

            if (tutorError) throw tutorError

            if (!tutorData) {
                return res.status(404).json({ message: 'Tutor no encontrado' })
            }

            // Si tiene cuenta de usuario, habilitarla
            if (tutorData.user_id) {
                const { error: userError } = await supabaseAdmin!
                    .from('User')
                    .update({
                        is_active: true,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', tutorData.user_id)

                if (userError) throw userError
            }

            return res.status(200).json({ message: 'Tutor habilitado correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Asociar cuenta de usuario a tutor existente
    public async linkUser(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const { user_id } = req.body

            if (!user_id) {
                return res.status(400).json({ message: 'user_id es requerido' })
            }

            // Verificar que el usuario existe y tiene role TUTOR
            const { data: userData, error: userError } = await supabaseAdmin!
                .from('User')
                .select('role')
                .eq('user_id', user_id)
                .single()

            if (userError || !userData) {
                return res.status(404).json({ message: 'Usuario no encontrado' })
            }

            if (userData.role !== 'TUTOR') {
                return res.status(400).json({ message: 'El usuario debe tener rol TUTOR' })
            }

            // Actualizar tutor con user_id
            const { data, error } = await supabaseAdmin!
                .from('Tutor')
                .update({
                    user_id,
                    updated_at: new Date().toISOString()
                })
                .eq('tutor_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Tutor no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }
}
