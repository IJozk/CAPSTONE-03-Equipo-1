import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class ContratoController {

    // Obtener todas las profesiones disponibles
    public async getAllProfesiones(req: Request, res: Response): Promise<Response> {
        try {
            const { data, error } = await supabaseAdmin!
                .from('Profesion')
                .select('*')
                .order('nombre', { ascending: true })

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener contrato activo de un empleado (profesor)
    public async getContratoByEmpleado(req: Request, res: Response): Promise<Response> {
        try {
            const { empleado_id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Contrato')
                .select(`
                    *,
                    Profesion(id_profesion, nombre, descripcion)
                `)
                .eq('id_empleado', empleado_id)
                .or('termino_contrato.is.null,termino_contrato.gte.' + new Date().toISOString())
                .order('inicio_contrato', { ascending: false })
                .limit(1)
                .single()

            if (error && error.code !== 'PGRST116') throw error

            return res.status(200).json(data || null)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener todos los contratos de un empleado (historial)
    public async getHistorialContratos(req: Request, res: Response): Promise<Response> {
        try {
            const { empleado_id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Contrato')
                .select(`
                    *,
                    Profesion(id_profesion, nombre, descripcion)
                `)
                .eq('id_empleado', empleado_id)
                .order('inicio_contrato', { ascending: false })

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Crear nuevo contrato
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                id_empleado,
                id_profesion,
                inicio_contrato,
                termino_contrato,
                de_planta
            } = req.body

            // Validar campos requeridos
            if (!id_empleado || !id_profesion || !inicio_contrato) {
                return res.status(400).json({
                    message: 'id_empleado, id_profesion e inicio_contrato son requeridos'
                })
            }

            // Verificar que el empleado (profesor) existe
            const { data: profesor, error: profesorError } = await supabaseAdmin!
                .from('Profesor')
                .select('profesor_id')
                .eq('profesor_id', id_empleado)
                .single()

            if (profesorError || !profesor) {
                return res.status(404).json({ message: 'Profesor no encontrado' })
            }

            // Verificar que la profesión existe
            const { data: profesion, error: profesionError } = await supabaseAdmin!
                .from('Profesion')
                .select('id_profesion')
                .eq('id_profesion', id_profesion)
                .single()

            if (profesionError || !profesion) {
                return res.status(404).json({ message: 'Profesión no encontrada' })
            }

            // Verificar si ya existe un contrato activo
            const { data: contratoActivo } = await supabaseAdmin!
                .from('Contrato')
                .select('id_contrato')
                .eq('id_empleado', id_empleado)
                .or('termino_contrato.is.null,termino_contrato.gte.' + new Date().toISOString())
                .single()

            if (contratoActivo) {
                return res.status(400).json({
                    message: 'El empleado ya tiene un contrato activo. Debe finalizar el contrato actual antes de crear uno nuevo.'
                })
            }

            // Crear el contrato
            const { data, error } = await supabaseAdmin!
                .from('Contrato')
                .insert({
                    id_empleado,
                    id_profesion,
                    inicio_contrato,
                    termino_contrato,
                    de_planta: de_planta !== undefined ? de_planta : true
                })
                .select(`
                    *,
                    Profesion(id_profesion, nombre, descripcion)
                `)
                .single()

            if (error) throw error

            return res.status(201).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Actualizar contrato
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const {
                id_profesion,
                inicio_contrato,
                termino_contrato,
                de_planta
            } = req.body

            const updateData: any = {}
            if (id_profesion !== undefined) updateData.id_profesion = id_profesion
            if (inicio_contrato !== undefined) updateData.inicio_contrato = inicio_contrato
            if (termino_contrato !== undefined) updateData.termino_contrato = termino_contrato
            if (de_planta !== undefined) updateData.de_planta = de_planta

            const { data, error } = await supabaseAdmin!
                .from('Contrato')
                .update(updateData)
                .eq('id_contrato', Number(id))
                .select(`
                    *,
                    Profesion(id_profesion, nombre, descripcion)
                `)
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Contrato no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Finalizar contrato (establecer fecha de término)
    public async finalizarContrato(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const { termino_contrato } = req.body

            if (!termino_contrato) {
                return res.status(400).json({ message: 'termino_contrato es requerido' })
            }

            const { data, error } = await supabaseAdmin!
                .from('Contrato')
                .update({ termino_contrato })
                .eq('id_contrato', Number(id))
                .select(`
                    *,
                    Profesion(id_profesion, nombre, descripcion)
                `)
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Contrato no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Eliminar contrato
    public async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { error } = await supabaseAdmin!
                .from('Contrato')
                .delete()
                .eq('id_contrato', Number(id))

            if (error) throw error

            return res.status(200).json({ message: 'Contrato eliminado correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }
}
