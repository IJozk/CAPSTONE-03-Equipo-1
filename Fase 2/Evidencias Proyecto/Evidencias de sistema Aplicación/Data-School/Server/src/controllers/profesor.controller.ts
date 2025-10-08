import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class ProfesorController {

    // Crear nuevo profesor
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const { user_id, nombre_completo, rut, especialidad, titulo_profesional, telefono, fecha_contratacion } = req.body

            // Validar campos requeridos
            if (!user_id || !nombre_completo) {
                return res.status(400).json({ message: 'user_id y nombre_completo son requeridos' })
            }

            // Verificar que el user_id existe y tiene role PROFESOR
            const { data: userData, error: userError } = await supabaseAdmin!
                .from('User')
                .select('role')
                .eq('user_id', user_id)
                .single()

            if (userError || !userData) {
                return res.status(404).json({ message: 'Usuario no encontrado' })
            }

            if (userData.role !== 'PROFESOR') {
                return res.status(400).json({ message: 'El usuario debe tener rol PROFESOR' })
            }

            // Crear profesor
            const { data, error } = await supabaseAdmin!
                .from('Profesor')
                .insert({
                    user_id,
                    nombre_completo,
                    rut,
                    especialidad,
                    titulo_profesional,
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

    // Obtener todos los profesores activos
    public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { incluir_inactivos } = req.query

            let query = supabaseAdmin!
                .from('Profesor')
                .select('*, User(email_address, is_active)')

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

    // Obtener profesor por ID
    public async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Profesor')
                .select('*, User(email_address, is_active)')
                .eq('profesor_id', id)
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Profesor no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Actualizar datos del profesor (NO modifica User)
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const { nombre_completo, rut, especialidad, titulo_profesional, telefono, fecha_contratacion } = req.body

            // Solo actualizar campos de la tabla Profesor
            const updateData: any = {}
            if (nombre_completo !== undefined) updateData.nombre_completo = nombre_completo
            if (rut !== undefined) updateData.rut = rut
            if (especialidad !== undefined) updateData.especialidad = especialidad
            if (titulo_profesional !== undefined) updateData.titulo_profesional = titulo_profesional
            if (telefono !== undefined) updateData.telefono = telefono
            if (fecha_contratacion !== undefined) updateData.fecha_contratacion = fecha_contratacion
            updateData.updated_at = new Date().toISOString()

            const { data, error } = await supabaseAdmin!
                .from('Profesor')
                .update(updateData)
                .eq('profesor_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Profesor no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Deshabilitar profesor (soft delete)
    public async disable(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Deshabilitar en tabla Profesor
            const { data: profesorData, error: profesorError } = await supabaseAdmin!
                .from('Profesor')
                .update({
                    estado_activo: false,
                    updated_at: new Date().toISOString()
                })
                .eq('profesor_id', id)
                .select('user_id')
                .single()

            if (profesorError) throw profesorError

            if (!profesorData) {
                return res.status(404).json({ message: 'Profesor no encontrado' })
            }

            // Deshabilitar cuenta de usuario
            const { error: userError } = await supabaseAdmin!
                .from('User')
                .update({
                    is_active: false,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', profesorData.user_id)

            if (userError) throw userError

            return res.status(200).json({ message: 'Profesor deshabilitado correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Habilitar profesor
    public async enable(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Habilitar en tabla Profesor
            const { data: profesorData, error: profesorError } = await supabaseAdmin!
                .from('Profesor')
                .update({
                    estado_activo: true,
                    updated_at: new Date().toISOString()
                })
                .eq('profesor_id', id)
                .select('user_id')
                .single()

            if (profesorError) throw profesorError

            if (!profesorData) {
                return res.status(404).json({ message: 'Profesor no encontrado' })
            }

            // Habilitar cuenta de usuario
            const { error: userError } = await supabaseAdmin!
                .from('User')
                .update({
                    is_active: true,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', profesorData.user_id)

            if (userError) throw userError

            return res.status(200).json({ message: 'Profesor habilitado correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }
}
