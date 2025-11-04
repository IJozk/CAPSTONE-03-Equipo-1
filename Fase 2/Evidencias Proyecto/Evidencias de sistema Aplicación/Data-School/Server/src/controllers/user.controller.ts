import { Request, Response } from 'express'
import { supabase, supabaseAdmin } from '@/config/supabase'

export class UserController {
    // Obtener todos los usuarios (solo tabla User)
    async getAllUsers(req: Request, res: Response) {
        try {
            const { data, error } = await supabaseAdmin!
                .from('User')
                .select('*');

            if (error) throw error;
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(500).json({ 
                message: 'Error al obtener usuarios', 
                error: error.message 
            });
        }
    }

// Obtener todos los usuarios con información completa (JOINs)
async getAllUsersFull(req: Request, res: Response) {
    try {
        const { incluir_inactivos } = req.query

        // Hacer JOIN con todas las tablas relacionadas
        let query = supabaseAdmin!
            .from('User')
            .select(`
                *,
                Estudiante(nombre_completo, rut),
                Profesor(nombre_completo, rut),
                Administrativo(nombre_completo, rut)
            `)

        // Filtrar por usuarios activos si no se especifica incluir inactivos
        if (incluir_inactivos !== 'true') {
            query = query.eq('is_active', true)
        }

        const { data, error } = await query

        if (error) throw error

        // Mapear los datos para incluir nombre_completo y rut según el rol
        const usersWithDetails = data?.map((user: any) => {
            let nombre_completo = '-';
            let rut = '-';

            // Obtener datos según el rol del usuario
            if (user.role === 'ESTUDIANTE_APODERADO' && user.Estudiante) {
                // Si Estudiante es un objeto (relación uno a uno)
                if (!Array.isArray(user.Estudiante)) {
                    nombre_completo = user.Estudiante.nombre_completo || '-';
                    rut = user.Estudiante.rut || '-';
                } 
                // Si Estudiante es un array (relación uno a muchos)
                else if (user.Estudiante.length > 0) {
                    nombre_completo = user.Estudiante[0].nombre_completo || '-';
                    rut = user.Estudiante[0].rut || '-';
                }
            } else if (user.role === 'PROFESOR' && user.Profesor) {
                if (!Array.isArray(user.Profesor)) {
                    nombre_completo = user.Profesor.nombre_completo || '-';
                    rut = user.Profesor.rut || '-';
                } else if (user.Profesor.length > 0) {
                    nombre_completo = user.Profesor[0].nombre_completo || '-';
                    rut = user.Profesor[0].rut || '-';
                }
            } 
            // ADMINISTRADOR y ADMINISTRATIVO comparten la misma tabla Administrativo
            else if ((user.role === 'ADMINISTRATIVO' || user.role === 'ADMINISTRADOR') && user.Administrativo) {
                if (!Array.isArray(user.Administrativo)) {
                    nombre_completo = user.Administrativo.nombre_completo || '-';
                    rut = user.Administrativo.rut || '-';
                } else if (user.Administrativo.length > 0) {
                    nombre_completo = user.Administrativo[0].nombre_completo || '-';
                    rut = user.Administrativo[0].rut || '-';
                }
            }

            return {
                ...user,
                nombre_completo,
                rut
            };
        });

        return res.status(200).json(usersWithDetails || [])

    } catch (error: any) {
        console.error('Error completo:', error);
        return res.status(500).json({ 
            message: 'Error al obtener usuarios completos', 
            error: error.message 
        })
    }
}

    // Obtener estudiantes (método existente)
    public async getEstudiantes(req: Request, res: Response): Promise<Response> {
        try {
            const { data, error } = await supabaseAdmin!
                .from('Estudiante')
                .select('*')
                .limit(1)

            if (error) {
                throw error
            }
            
            if (!data || data.length === 0) {
                return res.status(404).json({ message: 'No se encontraron estudiantes' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener un usuario específico por ID con datos completos
    public async getUserById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('User')
                .select(`
                    *,
                    Estudiante(*),
                    Profesor(*),
                    Administrativo(*, Area(nombre_area))
                `)
                .eq('user_id', id)
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Usuario no encontrado' })
            }

            // Añadir nombre_completo y rut según el rol
            let userDetails: any = { ...data };

            if (data.role === 'ESTUDIANTE_APODERADO' && data.Estudiante && data.Estudiante.length > 0) {
                userDetails.nombre_completo = data.Estudiante[0].nombre_completo;
                userDetails.rut = data.Estudiante[0].rut;
            } else if (data.role === 'PROFESOR' && data.Profesor && data.Profesor.length > 0) {
                userDetails.nombre_completo = data.Profesor[0].nombre_completo;
                userDetails.rut = data.Profesor[0].rut;
            } else if (data.role === 'ADMINISTRATIVO' && data.Administrativo && data.Administrativo.length > 0) {
                userDetails.nombre_completo = data.Administrativo[0].nombre_completo;
                userDetails.rut = data.Administrativo[0].rut;
            }

            return res.status(200).json(userDetails)

        } catch (error: any) {
            return res.status(500).json({ 
                message: 'Error al obtener usuario', 
                error: error.message 
            })
        }
    }

    // Actualizar estado de usuario (activo/inactivo)
    public async updateUserStatus(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const { is_active } = req.body

            if (typeof is_active !== 'boolean') {
                return res.status(400).json({ 
                    message: 'El campo is_active debe ser un booleano' 
                })
            }

            const { data, error } = await supabaseAdmin!
                .from('User')
                .update({ 
                    is_active,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Usuario no encontrado' })
            }

            return res.status(200).json({
                message: 'Estado del usuario actualizado correctamente',
                user: data
            })

        } catch (error: any) {
            return res.status(500).json({ 
                message: 'Error al actualizar usuario', 
                error: error.message 
            })
        }
    }

    // Actualizar email de usuario
    public async updateUserEmail(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const { email_address } = req.body

            if (!email_address || !email_address.includes('@')) {
                return res.status(400).json({ 
                    message: 'Email inválido' 
                })
            }

            const { data, error } = await supabaseAdmin!
                .from('User')
                .update({ 
                    email_address,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Usuario no encontrado' })
            }

            return res.status(200).json({
                message: 'Email actualizado correctamente',
                user: data
            })

        } catch (error: any) {
            return res.status(500).json({ 
                message: 'Error al actualizar email', 
                error: error.message 
            })
        }
    }
}