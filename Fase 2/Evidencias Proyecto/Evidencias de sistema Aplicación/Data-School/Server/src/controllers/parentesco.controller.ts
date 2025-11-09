import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class ParentescoController {

    // Obtener tutores de un estudiante
    public async getTutoresByEstudiante(req: Request, res: Response): Promise<Response> {
        try {
            const { estudiante_id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Parentesco')
                .select(`
                    *,
                    Tutor(
                        tutor_id,
                        nombre_completo,
                        rut,
                        telefono,
                        direccion,
                        ocupacion,
                        email,
                        estado_activo
                    )
                `)
                .eq('estudiante_id', estudiante_id)

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Crear relación parentesco (asignar tutor a estudiante)
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                estudiante_id,
                tutor_id,
                tipo_parentesco_id,
                es_tutor_titular,
                es_contacto_emergencia,
                puede_retirar
            } = req.body

            // Validar campos requeridos
            if (!estudiante_id || !tutor_id || !tipo_parentesco_id) {
                return res.status(400).json({
                    message: 'estudiante_id, tutor_id y tipo_parentesco_id son requeridos'
                })
            }

            // Verificar que el estudiante existe
            const { data: estudiante, error: estudianteError } = await supabaseAdmin!
                .from('Estudiante')
                .select('estudiante_id')
                .eq('estudiante_id', estudiante_id)
                .single()

            if (estudianteError || !estudiante) {
                return res.status(404).json({ message: 'Estudiante no encontrado' })
            }

            // Verificar que el tutor existe
            const { data: tutor, error: tutorError } = await supabaseAdmin!
                .from('Tutor')
                .select('tutor_id')
                .eq('tutor_id', tutor_id)
                .single()

            if (tutorError || !tutor) {
                return res.status(404).json({ message: 'Tutor no encontrado' })
            }

            // Verificar que no exceda el límite de 2 tutores por estudiante
            const { data: parentescosExistentes, error: countError } = await supabaseAdmin!
                .from('Parentesco')
                .select('tutor_id')
                .eq('estudiante_id', estudiante_id)

            if (countError) throw countError

            if (parentescosExistentes && parentescosExistentes.length >= 2) {
                return res.status(400).json({
                    message: 'El estudiante ya tiene 2 tutores asignados. Debe eliminar uno antes de agregar otro.'
                })
            }

            // Verificar que no exista ya esta relación
            const { data: relacionExistente } = await supabaseAdmin!
                .from('Parentesco')
                .select('*')
                .eq('estudiante_id', estudiante_id)
                .eq('tutor_id', tutor_id)
                .single()

            if (relacionExistente) {
                return res.status(400).json({
                    message: 'Esta relación de parentesco ya existe'
                })
            }

            // Crear la relación
            const { data, error } = await supabaseAdmin!
                .from('Parentesco')
                .insert({
                    estudiante_id,
                    tutor_id,
                    tipo_parentesco_id,
                    es_tutor_titular: es_tutor_titular || false,
                    es_contacto_emergencia: es_contacto_emergencia || false,
                    puede_retirar: puede_retirar || false
                })
                .select(`
                    *,
                    Tutor(
                        tutor_id,
                        nombre_completo,
                        rut,
                        telefono,
                        direccion,
                        ocupacion,
                        email
                    )
                `)
                .single()

            if (error) throw error

            return res.status(201).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Actualizar relación parentesco
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { estudiante_id, tutor_id } = req.params
            const {
                tipo_parentesco_id,
                es_tutor_titular,
                es_contacto_emergencia,
                puede_retirar
            } = req.body

            const updateData: any = {}
            if (tipo_parentesco_id !== undefined) updateData.tipo_parentesco_id = tipo_parentesco_id
            if (es_tutor_titular !== undefined) updateData.es_tutor_titular = es_tutor_titular
            if (es_contacto_emergencia !== undefined) updateData.es_contacto_emergencia = es_contacto_emergencia
            if (puede_retirar !== undefined) updateData.puede_retirar = puede_retirar

            const { data, error } = await supabaseAdmin!
                .from('Parentesco')
                .update(updateData)
                .eq('estudiante_id', estudiante_id)
                .eq('tutor_id', tutor_id)
                .select(`
                    *,
                    Tutor(
                        tutor_id,
                        nombre_completo,
                        rut,
                        telefono,
                        direccion,
                        ocupacion,
                        email
                    )
                `)
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Relación de parentesco no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Eliminar relación parentesco
    public async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { estudiante_id, tutor_id } = req.params

            const { error } = await supabaseAdmin!
                .from('Parentesco')
                .delete()
                .eq('estudiante_id', estudiante_id)
                .eq('tutor_id', tutor_id)

            if (error) throw error

            return res.status(200).json({ message: 'Relación de parentesco eliminada correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Crear tutor y asignarlo a estudiante (operación combinada)
    public async createTutorAndAssign(req: Request, res: Response): Promise<Response> {
        try {
            const {
                // Datos del tutor
                nombre_completo,
                rut,
                telefono,
                direccion,
                ocupacion,
                email,
                // Datos de la relación
                estudiante_id,
                tipo_parentesco_id,
                es_tutor_titular,
                es_contacto_emergencia,
                puede_retirar
            } = req.body

            // Validar campos requeridos
            if (!nombre_completo || !estudiante_id || !tipo_parentesco_id) {
                return res.status(400).json({
                    message: 'nombre_completo, estudiante_id y tipo_parentesco_id son requeridos'
                })
            }

            // Verificar que el estudiante existe
            const { data: estudiante, error: estudianteError } = await supabaseAdmin!
                .from('Estudiante')
                .select('estudiante_id')
                .eq('estudiante_id', estudiante_id)
                .single()

            if (estudianteError || !estudiante) {
                return res.status(404).json({ message: 'Estudiante no encontrado' })
            }

            // Verificar límite de tutores
            const { data: parentescosExistentes, error: countError } = await supabaseAdmin!
                .from('Parentesco')
                .select('tutor_id')
                .eq('estudiante_id', estudiante_id)

            if (countError) throw countError

            if (parentescosExistentes && parentescosExistentes.length >= 2) {
                return res.status(400).json({
                    message: 'El estudiante ya tiene 2 tutores asignados'
                })
            }

            // Crear el tutor
            const { data: tutorData, error: tutorError } = await supabaseAdmin!
                .from('Tutor')
                .insert({
                    nombre_completo,
                    rut,
                    telefono,
                    direccion,
                    ocupacion,
                    email,
                    estado_activo: true
                })
                .select()
                .single()

            if (tutorError) throw tutorError

            // Crear la relación de parentesco
            const { data: parentescoData, error: parentescoError } = await supabaseAdmin!
                .from('Parentesco')
                .insert({
                    estudiante_id,
                    tutor_id: tutorData.tutor_id,
                    tipo_parentesco_id,
                    es_tutor_titular: es_tutor_titular || false,
                    es_contacto_emergencia: es_contacto_emergencia || false,
                    puede_retirar: puede_retirar || false
                })
                .select(`
                    *,
                    Tutor(
                        tutor_id,
                        nombre_completo,
                        rut,
                        telefono,
                        direccion,
                        ocupacion,
                        email
                    )
                `)
                .single()

            if (parentescoError) throw parentescoError

            return res.status(201).json(parentescoData)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }
}
