import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class EspecialidadController {

    // Obtener todas las especialidades
    public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { data, error } = await supabaseAdmin!
                .from('Especialidad')
                .select('*')
                .order('tipo_especialidad', { ascending: true })
                .order('nombre_especialidad', { ascending: true })

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener especialidades de un profesor
    public async getByProfesor(req: Request, res: Response): Promise<Response> {
        try {
            const { profesor_id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Profesor_especialidad')
                .select(`
                    *,
                    Especialidad(
                        id,
                        nombre_especialidad,
                        tipo_especialidad
                    )
                `)
                .eq('profesor_id', profesor_id)

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Asignar especialidad a profesor
    public async assignToProfesor(req: Request, res: Response): Promise<Response> {
        try {
            const {
                profesor_id,
                especialidad_id,
                fecha_certificacion,
                certificado_url
            } = req.body

            // Validar campos requeridos
            if (!profesor_id || !especialidad_id) {
                return res.status(400).json({
                    message: 'profesor_id y especialidad_id son requeridos'
                })
            }

            // Verificar que el profesor existe
            const { data: profesor, error: profesorError } = await supabaseAdmin!
                .from('Profesor')
                .select('profesor_id')
                .eq('profesor_id', profesor_id)
                .single()

            if (profesorError || !profesor) {
                return res.status(404).json({ message: 'Profesor no encontrado' })
            }

            // Verificar que la especialidad existe
            const { data: especialidad, error: especialidadError } = await supabaseAdmin!
                .from('Especialidad')
                .select('id')
                .eq('id', especialidad_id)
                .single()

            if (especialidadError || !especialidad) {
                return res.status(404).json({ message: 'Especialidad no encontrada' })
            }

            // Verificar que no existe ya esta relación
            const { data: existente } = await supabaseAdmin!
                .from('Profesor_especialidad')
                .select('*')
                .eq('profesor_id', profesor_id)
                .eq('especialidad_id', especialidad_id)
                .single()

            if (existente) {
                return res.status(400).json({
                    message: 'El profesor ya tiene asignada esta especialidad'
                })
            }

            // Crear la relación
            const { data, error } = await supabaseAdmin!
                .from('Profesor_especialidad')
                .insert({
                    profesor_id,
                    especialidad_id,
                    fecha_certificacion,
                    certificado_url
                })
                .select(`
                    *,
                    Especialidad(
                        id,
                        nombre_especialidad,
                        tipo_especialidad
                    )
                `)
                .single()

            if (error) throw error

            return res.status(201).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Actualizar especialidad de profesor
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { profesor_id, especialidad_id } = req.params
            const { fecha_certificacion, certificado_url } = req.body

            const updateData: any = {}
            if (fecha_certificacion !== undefined) updateData.fecha_certificacion = fecha_certificacion
            if (certificado_url !== undefined) updateData.certificado_url = certificado_url

            const { data, error } = await supabaseAdmin!
                .from('Profesor_especialidad')
                .update(updateData)
                .eq('profesor_id', profesor_id)
                .eq('especialidad_id', especialidad_id)
                .select(`
                    *,
                    Especialidad(
                        id,
                        nombre_especialidad,
                        tipo_especialidad
                    )
                `)
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Relación no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Eliminar especialidad de profesor
    public async removeFromProfesor(req: Request, res: Response): Promise<Response> {
        try {
            const { profesor_id, especialidad_id } = req.params

            const { error } = await supabaseAdmin!
                .from('Profesor_especialidad')
                .delete()
                .eq('profesor_id', profesor_id)
                .eq('especialidad_id', especialidad_id)

            if (error) throw error

            return res.status(200).json({ message: 'Especialidad eliminada correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }
}
