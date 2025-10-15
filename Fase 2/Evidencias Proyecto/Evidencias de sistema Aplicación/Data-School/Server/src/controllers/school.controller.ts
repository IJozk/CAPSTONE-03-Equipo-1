import { Request, Response } from 'express'
import { supabase, supabaseAdmin } from '@/config/supabase'

export class SchoolController {

    // Obtener información del colegio en DB
    public async getSchoolInfo(req: Request, res: Response): Promise<Response> {

        try {
            const { data, error } = await supabaseAdmin!
            .from('Colegio')
            .select('*')
            .limit(1)

            if (error) {
                throw error
            }

            if (!data || data.length === 0) {
                return res.status(404).json({ message: 'No se encontró configuración del colegio' })
            }

            return res.status(200).json(data[0])
        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }

    }
}

