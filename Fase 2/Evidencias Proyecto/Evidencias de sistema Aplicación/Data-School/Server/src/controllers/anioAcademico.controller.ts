import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class AnioAcademicoController {

    // Crear nuevo año académico
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                colegio_id,
                anio,
                fecha_inicio,
                fecha_termino,
                primer_semestre_inicio,
                primer_semestre_fin,
                segundo_semestre_inicio,
                segundo_semestre_fin,
                vacaciones_invierno_inicio,
                vacaciones_invierno_fin
            } = req.body

            // Validar campos requeridos
            if (!colegio_id || !anio || !fecha_inicio || !fecha_termino) {
                return res.status(400).json({
                    message: 'colegio_id, anio, fecha_inicio y fecha_termino son requeridos'
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

            // Verificar que no exista ya un año académico para ese colegio y año
            const { data: existente } = await supabaseAdmin!
                .from('AnioAcademico')
                .select('anio_id')
                .eq('colegio_id', colegio_id)
                .eq('anio', anio)
                .maybeSingle()

            if (existente) {
                return res.status(400).json({
                    message: `Ya existe un año académico para el año ${anio} en este colegio`
                })
            }

            // Crear año académico
            const { data, error } = await supabaseAdmin!
                .from('AnioAcademico')
                .insert({
                    colegio_id,
                    anio,
                    fecha_inicio,
                    fecha_termino,
                    primer_semestre_inicio,
                    primer_semestre_fin,
                    segundo_semestre_inicio,
                    segundo_semestre_fin,
                    vacaciones_invierno_inicio,
                    vacaciones_invierno_fin,
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

    // Obtener todos los años académicos
    public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { colegio_id, anio, estado_activo } = req.query

            let query = supabaseAdmin!
                .from('AnioAcademico')
                .select(`
                    *,
                    Colegio(colegio_id, nombre)
                `)

            if (colegio_id) {
                query = query.eq('colegio_id', colegio_id)
            }

            if (anio) {
                query = query.eq('anio', anio)
            }

            if (estado_activo !== undefined) {
                query = query.eq('estado_activo', estado_activo === 'true')
            }

            query = query.order('anio', { ascending: false })

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener año académico por ID
    public async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('AnioAcademico')
                .select(`
                    *,
                    Colegio(colegio_id, nombre, direccion)
                `)
                .eq('anio_id', id)
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Año académico no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener año académico activo de un colegio
    public async getActivo(req: Request, res: Response): Promise<Response> {
        try {
            const { colegio_id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('AnioAcademico')
                .select('*')
                .eq('colegio_id', colegio_id)
                .eq('estado_activo', true)
                .order('anio', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (error) throw error

            if (!data) {
                return res.status(404).json({
                    message: 'No hay un año académico activo para este colegio'
                })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Obtener información del periodo actual
    public async getPeriodoActual(req: Request, res: Response): Promise<Response> {
        try {
            const { colegio_id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('AnioAcademico')
                .select('*')
                .eq('colegio_id', colegio_id)
                .eq('estado_activo', true)
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({
                    message: 'No hay un año académico activo'
                })
            }

            const hoy = new Date().toISOString().split('T')[0]
            let periodo = 'FUERA_DE_PERIODO'

            // Determinar en qué periodo estamos
            if (data.primer_semestre_inicio && data.primer_semestre_fin) {
                if (hoy >= data.primer_semestre_inicio && hoy <= data.primer_semestre_fin) {
                    periodo = 'PRIMER_SEMESTRE'
                }
            }

            if (data.vacaciones_invierno_inicio && data.vacaciones_invierno_fin) {
                if (hoy >= data.vacaciones_invierno_inicio && hoy <= data.vacaciones_invierno_fin) {
                    periodo = 'VACACIONES_INVIERNO'
                }
            }

            if (data.segundo_semestre_inicio && data.segundo_semestre_fin) {
                if (hoy >= data.segundo_semestre_inicio && hoy <= data.segundo_semestre_fin) {
                    periodo = 'SEGUNDO_SEMESTRE'
                }
            }

            return res.status(200).json({
                anio_academico: data,
                periodo_actual: periodo,
                fecha_actual: hoy
            })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Actualizar año académico
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const {
                fecha_inicio,
                fecha_termino,
                primer_semestre_inicio,
                primer_semestre_fin,
                segundo_semestre_inicio,
                segundo_semestre_fin,
                vacaciones_invierno_inicio,
                vacaciones_invierno_fin,
                estado_activo
            } = req.body

            const updateData: any = {}
            if (fecha_inicio !== undefined) updateData.fecha_inicio = fecha_inicio
            if (fecha_termino !== undefined) updateData.fecha_termino = fecha_termino
            if (primer_semestre_inicio !== undefined) updateData.primer_semestre_inicio = primer_semestre_inicio
            if (primer_semestre_fin !== undefined) updateData.primer_semestre_fin = primer_semestre_fin
            if (segundo_semestre_inicio !== undefined) updateData.segundo_semestre_inicio = segundo_semestre_inicio
            if (segundo_semestre_fin !== undefined) updateData.segundo_semestre_fin = segundo_semestre_fin
            if (vacaciones_invierno_inicio !== undefined) updateData.vacaciones_invierno_inicio = vacaciones_invierno_inicio
            if (vacaciones_invierno_fin !== undefined) updateData.vacaciones_invierno_fin = vacaciones_invierno_fin
            if (estado_activo !== undefined) updateData.estado_activo = estado_activo

            const { data, error } = await supabaseAdmin!
                .from('AnioAcademico')
                .update(updateData)
                .eq('anio_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Año académico no encontrado' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Activar año académico (y desactivar otros del mismo colegio)
    public async activate(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            // Obtener el año académico a activar
            const { data: anioAcademico, error: fetchError } = await supabaseAdmin!
                .from('AnioAcademico')
                .select('colegio_id')
                .eq('anio_id', id)
                .single()

            if (fetchError || !anioAcademico) {
                return res.status(404).json({ message: 'Año académico no encontrado' })
            }

            // Desactivar todos los años académicos del mismo colegio
            const { error: deactivateError } = await supabaseAdmin!
                .from('AnioAcademico')
                .update({ estado_activo: false })
                .eq('colegio_id', anioAcademico.colegio_id)

            if (deactivateError) throw deactivateError

            // Activar el año académico seleccionado
            const { data, error } = await supabaseAdmin!
                .from('AnioAcademico')
                .update({ estado_activo: true })
                .eq('anio_id', id)
                .select()
                .single()

            if (error) throw error

            return res.status(200).json({
                message: 'Año académico activado correctamente',
                data
            })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Deshabilitar año académico
    public async disable(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('AnioAcademico')
                .update({ estado_activo: false })
                .eq('anio_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Año académico no encontrado' })
            }

            return res.status(200).json({
                message: 'Año académico deshabilitado correctamente'
            })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // Eliminar año académico
    public async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { error } = await supabaseAdmin!
                .from('AnioAcademico')
                .delete()
                .eq('anio_id', id)

            if (error) throw error

            return res.status(200).json({ message: 'Año académico eliminado correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }
}
