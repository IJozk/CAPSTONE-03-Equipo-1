import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class EstudianteController {

    // Crear nuevo estudiante
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                user_id,
                nombre_completo,
                fecha_nacimiento,
                rut,
                genero,
                direccion,
                telefono,
                email
            } = req.body

            // Validar campos requeridos
            if (!nombre_completo || !fecha_nacimiento) {
                return res.status(400).json({ message: 'nombre_completo y fecha_nacimiento son requeridos' })
            }

            // Si tiene user_id, verificar que existe y tiene role ESTUDIANTE
            if (user_id) {
                const { data: userData, error: userError } = await supabaseAdmin!
                    .from('User')
                    .select('role')
                    .eq('user_id', user_id)
                    .single()

                if (userError || !userData) {
                    return res.status(404).json({ message: 'Usuario no encontrado' })
                }

                if (userData.role !== 'ESTUDIANTE_APODERADO') {
                    return res.status(400).json({ message: 'El usuario debe tener rol ESTUDIANTE' })
                }
            }

            // Crear estudiante
            const { data, error } = await supabaseAdmin!
                .from('Estudiante')
                .insert({
                    user_id,
                    nombre_completo,
                    fecha_nacimiento,
                    rut,
                    genero,
                    direccion,
                    telefono,
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

        // Obtener todos los estudiantes activos o todos
        public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { incluir_inactivos } = req.query;

            let query = supabaseAdmin!
            .from('Estudiante')
            .select('*, User(email_address, is_active)');

            if (incluir_inactivos !== 'true') {
            query = query.eq('estado_activo', true);
            }

            const { data, error } = await query;

            if (error) throw error;

            // 🔹 Reemplazar teléfonos vacíos por 'N/A'
            const estudiantesFormateados = (data || []).map(e => ({
            ...e,
            telefono: e.telefono && e.telefono.trim() !== '' ? e.telefono : 'N/A'
            }));

            return res.status(200).json(estudiantesFormateados);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
        }

    // Obtener estudiante por ID
    public async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Estudiante')
                .select('*, User(email_address, is_active)')
                .eq('estudiante_id', id)
                .single()

            const curso_actual = await supabaseAdmin!
                .from('Estudiante_Curso')
                .select('curso_id, Curso(nombre, nivel)')
                .eq('estudiante_id', id)
                .single()

            const tutores = await supabaseAdmin!
                .from('Tutor')
                .select('Tutor(nombre_completo, telefono)')
                .eq('estudiante_id', id)

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Estudiante no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Actualizar datos del estudiante (NO modifica User)
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const {
                nombre_completo,
                fecha_nacimiento,
                rut,
                genero,
                direccion,
                telefono,
                email,
                estado_activo
            } = req.body

            // Solo actualizar campos de la tabla Estudiante
            const updateData: any = {}
            if (nombre_completo !== undefined) updateData.nombre_completo = nombre_completo
            if (fecha_nacimiento !== undefined) updateData.fecha_nacimiento = fecha_nacimiento
            if (rut !== undefined) updateData.rut = rut
            if (genero !== undefined) updateData.genero = genero
            if (direccion !== undefined) updateData.direccion = direccion
            if (telefono !== undefined) updateData.telefono = telefono
            if (email !== undefined) updateData.email = email
            if (estado_activo !== undefined) updateData.estado_activo = estado_activo
            updateData.updated_at = new Date().toISOString()

            const { data, error } = await supabaseAdmin!
                .from('Estudiante')
                .update(updateData)
                .eq('estudiante_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Estudiante no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Deshabilitar estudiante (soft delete)
    public async disable(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Deshabilitar en tabla Estudiante
            const { data: estudianteData, error: estudianteError } = await supabaseAdmin!
                .from('Estudiante')
                .update({
                    estado_activo: false,
                    updated_at: new Date().toISOString()
                })
                .eq('estudiante_id', id)
                .select('user_id')
                .single()

            if (estudianteError) throw estudianteError

            if (!estudianteData) {
                return res.status(404).json({ message: 'Estudiante no encontrado' })
            }

            // Si tiene cuenta de usuario, deshabilitarla
            if (estudianteData.user_id) {
                const { error: userError } = await supabaseAdmin!
                    .from('User')
                    .update({
                        is_active: false,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', estudianteData.user_id)

                if (userError) throw userError
            }

            return res.status(200).json({ message: 'Estudiante deshabilitado correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Habilitar estudiante
    public async enable(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Habilitar en tabla Estudiante
            const { data: estudianteData, error: estudianteError } = await supabaseAdmin!
                .from('Estudiante')
                .update({
                    estado_activo: true,
                    updated_at: new Date().toISOString()
                })
                .eq('estudiante_id', id)
                .select('user_id')
                .single()

            if (estudianteError) throw estudianteError

            if (!estudianteData) {
                return res.status(404).json({ message: 'Estudiante no encontrado' })
            }

            // Si tiene cuenta de usuario, habilitarla
            if (estudianteData.user_id) {
                const { error: userError } = await supabaseAdmin!
                    .from('User')
                    .update({
                        is_active: true,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', estudianteData.user_id)

                if (userError) throw userError
            }

            return res.status(200).json({ message: 'Estudiante habilitado correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }
}
