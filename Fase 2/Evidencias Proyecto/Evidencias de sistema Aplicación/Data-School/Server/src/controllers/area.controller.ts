import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class AreaController {

    // Crear nueva área
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                nombre_area,
                descripcion,
                colegio_id,
                jefe_area_id
            } = req.body

            // Validar campos requeridos
            if (!nombre_area || !colegio_id) {
                return res.status(400).json({
                    message: 'nombre_area y colegio_id son requeridos'
                })
            }

            // Verificar que el colegio existe
            const { data: colegio, error: colegioError } = await supabaseAdmin!
                .from('Colegio')
                .select('colegio_id')
                .eq('colegio_id', colegio_id)
                .single()

            if (colegioError || !colegio) {
                return res.status(404).json({ message: 'Colegio no encontrado' })
            }

            // Si tiene jefe de área, verificar que existe
            if (jefe_area_id) {
                const { data: profesor, error: profError } = await supabaseAdmin!
                    .from('Profesor')
                    .select('profesor_id')
                    .eq('profesor_id', jefe_area_id)
                    .single()

                if (profError || !profesor) {
                    return res.status(404).json({ message: 'Jefe de área no encontrado' })
                }
            }

            // Crear área
            const { data, error } = await supabaseAdmin!
                .from('Area')
                .insert({
                    nombre_area,
                    descripcion,
                    colegio_id,
                    jefe_area_id
                })
                .select()
                .single()

            if (error) throw error

            return res.status(201).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener todas las áreas
    public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { colegio_id } = req.query

            let query = supabaseAdmin!
                .from('Area')
                .select(`
                    *,
                    Colegio(colegio_id, nombre),
                    Profesor(profesor_id, nombre_completo, telefono)
                `)

            if (colegio_id) {
                query = query.eq('colegio_id', String(colegio_id))
            }

            query = query.order('nombre_area', { ascending: true })

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener área por ID
    public async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Area')
                .select(`
                    *,
                    Colegio(colegio_id, nombre, direccion),
                    Profesor(profesor_id, nombre_completo, telefono, email:User(email_address))
                `)
                .eq('area_id', Number(id))
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Área no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener personal de un área
    public async getPersonal(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Administrativo')
                .select(`
                    administrativo_id,
                    nombre_completo,
                    cargo,
                    rut,
                    telefono,
                    estado_activo,
                    User(email_address)
                `)
                .eq('area_id', Number(id))
                .order('nombre_completo', { ascending: true })

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener estadísticas de un área
    public async getEstadisticas(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Obtener el área
            const { data: area, error: areaError } = await supabaseAdmin!
                .from('Area')
                .select(`
                    *,
                    Profesor(nombre_completo)
                `)
                .eq('area_id', Number(id))
                .single()

            if (areaError || !area) {
                return res.status(404).json({ message: 'Área no encontrada' })
            }

            // Obtener personal del área
            const { data: personal, error: personalError } = await supabaseAdmin!
                .from('Administrativo')
                .select('administrativo_id, estado_activo')
                .eq('area_id', Number(id))

            if (personalError) throw personalError

            const total_personal = personal?.length || 0
            const personal_activo = personal?.filter(p => p.estado_activo).length || 0
            const personal_inactivo = total_personal - personal_activo

            return res.status(200).json({
                area_id: area.area_id,
                nombre_area: area.nombre_area,
                jefe_area: area.Profesor?.nombre_completo || null,
                estadisticas: {
                    total_personal,
                    personal_activo,
                    personal_inactivo
                }
            })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Actualizar área
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const {
                nombre_area,
                descripcion,
                jefe_area_id
            } = req.body

            const updateData: any = {}
            if (nombre_area !== undefined) updateData.nombre_area = nombre_area
            if (descripcion !== undefined) updateData.descripcion = descripcion
            if (jefe_area_id !== undefined) updateData.jefe_area_id = jefe_area_id

            const { data, error } = await supabaseAdmin!
                .from('Area')
                .update(updateData)
                .eq('area_id', Number(id))
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Área no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Asignar jefe de área
    public async asignarJefe(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const { jefe_area_id } = req.body

            if (!jefe_area_id) {
                return res.status(400).json({ message: 'jefe_area_id es requerido' })
            }

            // Verificar que el profesor existe
            const { data: profesor, error: profError } = await supabaseAdmin!
                .from('Profesor')
                .select('profesor_id')
                .eq('profesor_id', jefe_area_id)
                .single()

            if (profError || !profesor) {
                return res.status(404).json({ message: 'Profesor no encontrado' })
            }

            const { data, error } = await supabaseAdmin!
                .from('Area')
                .update({ jefe_area_id })
                .eq('area_id', Number(id))
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Área no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Remover jefe de área
    public async removerJefe(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Area')
                .update({ jefe_area_id: null })
                .eq('area_id', Number(id))
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Área no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Eliminar área
    public async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Verificar si hay personal asignado
            const { data: personal } = await supabaseAdmin!
                .from('Administrativo')
                .select('administrativo_id')
                .eq('area_id', Number(id))
                .limit(1)

            if (personal && personal.length > 0) {
                return res.status(400).json({
                    message: 'No se puede eliminar el área porque tiene personal asignado'
                })
            }

            const { error } = await supabaseAdmin!
                .from('Area')
                .delete()
                .eq('area_id', Number(id))

            if (error) throw error

            return res.status(200).json({ message: 'Área eliminada correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }
}
