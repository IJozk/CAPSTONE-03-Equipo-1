import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class TallerController {

    // Crear nuevo taller
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                taller_id,
                nombre,
                descripcion,
                profesor_encargado_id,
                sala_id,
                horario,
                capacidad_maxima,
                costo_adicional
            } = req.body

            // Validar campos requeridos
            if (!taller_id || !nombre) {
                return res.status(400).json({
                    message: 'taller_id y nombre son requeridos'
                })
            }

            // Verificar que no exista ya un taller con ese ID
            const { data: existente } = await supabaseAdmin!
                .from('Taller')
                .select('taller_id')
                .eq('taller_id', taller_id)
                .maybeSingle()

            if (existente) {
                return res.status(400).json({
                    message: 'Ya existe un taller con ese ID'
                })
            }

            // Si tiene profesor, verificar que existe
            if (profesor_encargado_id) {
                const { data: profesor, error: profError } = await supabaseAdmin!
                    .from('Profesor')
                    .select('profesor_id')
                    .eq('profesor_id', profesor_encargado_id)
                    .single()

                if (profError || !profesor) {
                    return res.status(404).json({ message: 'Profesor no encontrado' })
                }
            }

            // Si tiene sala, verificar que existe
            if (sala_id) {
                const { data: sala, error: salaError } = await supabaseAdmin!
                    .from('Sala')
                    .select('sala_id')
                    .eq('sala_id', sala_id)
                    .single()

                if (salaError || !sala) {
                    return res.status(404).json({ message: 'Sala no encontrada' })
                }
            }

            // Crear taller
            const { data, error } = await supabaseAdmin!
                .from('Taller')
                .insert({
                    taller_id,
                    nombre,
                    descripcion,
                    profesor_encargado_id,
                    sala_id,
                    horario,
                    capacidad_maxima,
                    costo_adicional,
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

    // Obtener todos los talleres
    public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { estado_activo, profesor_encargado_id } = req.query

            let query = supabaseAdmin!
                .from('Taller')
                .select(`
                    *,
                    Profesor(profesor_id, nombre_completo, telefono),
                    Sala(sala_id, nombre, capacidad)
                `)

            if (estado_activo !== undefined) {
                query = query.eq('estado_activo', estado_activo === 'true')
            }

            if (profesor_encargado_id) {
                query = query.eq('profesor_encargado_id', String(profesor_encargado_id))
            }

            query = query.order('nombre', { ascending: true })

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener taller por ID
    public async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Taller')
                .select(`
                    *,
                    Profesor(profesor_id, nombre_completo, telefono, email:User(email_address)),
                    Sala(sala_id, nombre, capacidad, Zona(nombre_zona))
                `)
                .eq('taller_id', id)
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Taller no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener talleres activos
    public async getActivos(req: Request, res: Response): Promise<Response> {
        try {
            const { data, error } = await supabaseAdmin!
                .from('Taller')
                .select(`
                    *,
                    Profesor(profesor_id, nombre_completo),
                    Sala(sala_id, nombre)
                `)
                .eq('estado_activo', true)
                .order('nombre', { ascending: true })

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener estudiantes inscritos en un taller
    public async getEstudiantes(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const { estado } = req.query

            let query = supabaseAdmin!
                .from('Grupo_taller')
                .select(`
                    *,
                    Estudiante(
                        estudiante_id,
                        nombre_completo,
                        rut,
                        email,
                        telefono
                    )
                `)
                .eq('taller_id', id)

            if (estado) {
                query = query.eq('estado', estado as any)
            }

            query = query.order('fecha_inscripcion', { ascending: false })

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener estadísticas de un taller
    public async getEstadisticas(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Obtener el taller
            const { data: taller, error: tallerError } = await supabaseAdmin!
                .from('Taller')
                .select('*')
                .eq('taller_id', id)
                .single()

            if (tallerError || !taller) {
                return res.status(404).json({ message: 'Taller no encontrado' })
            }

            // Obtener inscripciones
            const { data: inscripciones, error: inscError } = await supabaseAdmin!
                .from('Grupo_taller')
                .select('estado')
                .eq('taller_id', id)

            if (inscError) throw inscError

            const total_inscritos = inscripciones?.length || 0
            const activos = inscripciones?.filter(i => i.estado === 'ACTIVO').length || 0
            const retirados = inscripciones?.filter(i => i.estado === 'RETIRADO').length || 0
            const suspendidos = inscripciones?.filter(i => i.estado === 'SUSPENDIDO').length || 0
            const cupos_disponibles = taller.capacidad_maxima
                ? taller.capacidad_maxima - activos
                : null

            return res.status(200).json({
                taller_id: taller.taller_id,
                nombre: taller.nombre,
                capacidad_maxima: taller.capacidad_maxima,
                estadisticas: {
                    total_inscritos,
                    activos,
                    retirados,
                    suspendidos,
                    cupos_disponibles,
                    porcentaje_ocupacion: taller.capacidad_maxima
                        ? parseFloat(((activos / taller.capacidad_maxima) * 100).toFixed(2))
                        : null
                }
            })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Actualizar taller
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const {
                nombre,
                descripcion,
                profesor_encargado_id,
                sala_id,
                horario,
                capacidad_maxima,
                costo_adicional,
                estado_activo
            } = req.body

            const updateData: any = {}
            if (nombre !== undefined) updateData.nombre = nombre
            if (descripcion !== undefined) updateData.descripcion = descripcion
            if (profesor_encargado_id !== undefined) updateData.profesor_encargado_id = profesor_encargado_id
            if (sala_id !== undefined) updateData.sala_id = sala_id
            if (horario !== undefined) updateData.horario = horario
            if (capacidad_maxima !== undefined) updateData.capacidad_maxima = capacidad_maxima
            if (costo_adicional !== undefined) updateData.costo_adicional = costo_adicional
            if (estado_activo !== undefined) updateData.estado_activo = estado_activo

            const { data, error } = await supabaseAdmin!
                .from('Taller')
                .update(updateData)
                .eq('taller_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Taller no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Deshabilitar taller
    public async disable(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Taller')
                .update({ estado_activo: false })
                .eq('taller_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Taller no encontrado' })
            }

            return res.status(200).json({ message: 'Taller deshabilitado correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Habilitar taller
    public async enable(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Taller')
                .update({ estado_activo: true })
                .eq('taller_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Taller no encontrado' })
            }

            return res.status(200).json({ message: 'Taller habilitado correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Eliminar taller
    public async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Verificar si hay estudiantes inscritos
            const { data: inscritos } = await supabaseAdmin!
                .from('Grupo_taller')
                .select('grupo_id')
                .eq('taller_id', id)
                .limit(1)

            if (inscritos && inscritos.length > 0) {
                return res.status(400).json({
                    message: 'No se puede eliminar el taller porque tiene estudiantes inscritos'
                })
            }

            const { error } = await supabaseAdmin!
                .from('Taller')
                .delete()
                .eq('taller_id', id)

            if (error) throw error

            return res.status(200).json({ message: 'Taller eliminado correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }
}
