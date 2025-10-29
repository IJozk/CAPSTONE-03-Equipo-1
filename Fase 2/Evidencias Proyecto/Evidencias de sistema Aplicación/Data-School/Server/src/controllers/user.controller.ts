import { Request, Response } from 'express'
import { supabase, supabaseAdmin } from '@/config/supabase'

export class UserController {
    async getAllUsers(req: Request, res: Response) {
    try {
        const { data, error } = await supabaseAdmin!
            .from('User')
            .select('*');

        if (error) throw error;
        return res.status(200).json(data);
            } catch (error: any) {
        return res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
            }
        }
        public async getEstudiantes(req: Request, res: Response): Promise<Response> {

        try {
            const { data, error }  = await supabaseAdmin!
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
    
}
