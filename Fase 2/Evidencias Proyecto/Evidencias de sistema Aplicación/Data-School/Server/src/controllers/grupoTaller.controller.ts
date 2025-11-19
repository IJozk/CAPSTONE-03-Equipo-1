import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class GrupoTallerController {

    // ============================================================
    // 🟩 CREAR INSCRIPCIÓN / REACTIVAR SI EXISTE
    // ============================================================
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                taller_id,
                estudiante_id,
                observaciones
            } = req.body

            if (!taller_id || !estudiante_id) {
                return res.status(400).json({
                    message: 'taller_id y estudiante_id son requeridos'
                })
            }

            // --- Verificar taller ---
            const { data: taller, error: tallerError } = await supabaseAdmin!
                .from('Taller')
                .select('taller_id, capacidad_maxima, estado_activo')
                .eq('taller_id', taller_id)
                .single()

            if (tallerError || !taller) {
                return res.status(404).json({ message: 'Taller no encontrado' })
            }

            if (!taller.estado_activo) {
                return res.status(400).json({ message: 'El taller no está activo' })
            }

            // --- Verificar estudiante ---
            const { data: estudiante, error: estError } = await supabaseAdmin!
                .from('Estudiante')
                .select('estudiante_id')
                .eq('estudiante_id', estudiante_id)
                .single()

            if (estError || !estudiante) {
                return res.status(404).json({ message: 'Estudiante no encontrado' })
            }

            // --- Buscar inscripción existente (cualquier estado) ---
            const { data: inscripcionExistente, error: inscError } = await supabaseAdmin!
                .from('Grupo_taller')
                .select('grupo_id, estado, observaciones')
                .eq('taller_id', taller_id)
                .eq('estudiante_id', estudiante_id)
                .maybeSingle()

            if (inscError && inscError.code !== 'PGRST116') {
                throw inscError
            }

            // Si ya está activo -> error
            if (inscripcionExistente && inscripcionExistente.estado === 'ACTIVO') {
                return res.status(400).json({
                    message: 'El estudiante ya está inscrito en este taller'
                })
            }

            // --- Verificar capacidad (para activar o reactivar) ---
            if (taller.capacidad_maxima) {
                const { data: inscritos, error: capError } = await supabaseAdmin!
                    .from('Grupo_taller')
                    .select('grupo_id')
                    .eq('taller_id', taller_id)
                    .eq('estado', 'ACTIVO')

                if (capError) throw capError

                if (inscritos && inscritos.length >= taller.capacidad_maxima) {
                    return res.status(400).json({
                        message: 'El taller ha alcanzado su capacidad máxima'
                    })
                }
            }

            // --- Si existe la inscripción pero estaba RETIRADO / SUSPENDIDO → REACTIVAR ---
            if (inscripcionExistente && inscripcionExistente.estado !== 'ACTIVO') {
                const { data, error } = await supabaseAdmin!
                    .from('Grupo_taller')
                    .update({
                        estado: 'ACTIVO',
                        fecha_inscripcion: new Date().toISOString(),
                        fecha_retiro: null,
                        observaciones: observaciones ?? inscripcionExistente.observaciones ?? null
                    })
                    .eq('grupo_id', inscripcionExistente.grupo_id)
                    .select()
                    .single()

                if (error) throw error

                return res.status(200).json(data)  // reactivado
            }

            // --- Crear inscripción nueva ---
            const { data, error } = await supabaseAdmin!
                .from('Grupo_taller')
                .insert({
                    taller_id,
                    estudiante_id,
                    observaciones: observaciones ?? null,
                    estado: 'ACTIVO',
                    fecha_inscripcion: new Date().toISOString()
                })
                .select()
                .single()

            if (error) throw error

            return res.status(201).json(data) // creado

        } catch (error: any) {
            console.error('Error en create Grupo_taller:', error)
            return res.status(500).json({ message: error.message })
        }
    }

    // ============================================================
    // 🟦 OBTENER INSCRIPCIONES (con filtros)
    // ============================================================
    public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { taller_id, estudiante_id, estado } = req.query

            let query = supabaseAdmin!
                .from('Grupo_taller')
                .select(`
                    *,
                    Taller(taller_id, nombre, horario, Profesor(nombre_completo)),
                    Estudiante(estudiante_id, nombre_completo, rut, email)
                `)

            if (taller_id) query = query.eq('taller_id', taller_id)
            if (estudiante_id) query = query.eq('estudiante_id', estudiante_id)
            if (estado) query = query.eq('estado', estado)

            query = query.order('fecha_inscripcion', { ascending: false })

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // ============================================================
    // 🟩 OBTENER INSCRIPCIÓN POR ID
    // ============================================================
    public async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data, error } = await supabaseAdmin!
                .from('Grupo_taller')
                .select(`
                    *,
                    Taller(
                        taller_id,
                        nombre,
                        descripcion,
                        horario,
                        costo_adicional,
                        Profesor(profesor_id, nombre_completo, telefono),
                        Sala(sala_id, nombre)
                    ),
                    Estudiante(
                        estudiante_id,
                        nombre_completo,
                        rut,
                        email,
                        telefono
                    )
                `)
                .eq('grupo_id', id)
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Inscripción no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // ============================================================
    // 🟩 INSCRIPCIONES POR ESTUDIANTE
    // ============================================================
    public async getByEstudiante(req: Request, res: Response): Promise<Response> {
        try {
            const { estudiante_id } = req.params
            const { estado } = req.query

            let query = supabaseAdmin!
                .from('Grupo_taller')
                .select(`
                    *,
                    Taller(
                        taller_id,
                        nombre,
                        descripcion,
                        horario,
                        costo_adicional,
                        Profesor(profesor_id, nombre_completo)
                    )
                `)
                .eq('estudiante_id', estudiante_id)

            if (estado) query = query.eq('estado', estado)

            query = query.order('fecha_inscripcion', { ascending: false })

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json(data || [])

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // ============================================================
    // 🟧 ACTUALIZAR OBSERVACIONES
    // ============================================================
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const { observaciones } = req.body

            const { data, error } = await supabaseAdmin!
                .from('Grupo_taller')
                .update({ observaciones })
                .eq('grupo_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Inscripción no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // ============================================================
    // 🟥 RETIRAR ESTUDIANTE (estado = RETIRADO)
    // ============================================================
    public async retirar(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const { observaciones } = req.body

            const { data, error } = await supabaseAdmin!
                .from('Grupo_taller')
                .update({
                    estado: 'RETIRADO',
                    fecha_retiro: new Date().toISOString(),
                    observaciones: observaciones ?? null
                })
                .eq('grupo_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Inscripción no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // ============================================================
    // 🟧 SUSPENDER ESTUDIANTE (estado = SUSPENDIDO)
    // ============================================================
    public async suspender(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params
            const { observaciones } = req.body

            const { data, error } = await supabaseAdmin!
                .from('Grupo_taller')
                .update({
                    estado: 'SUSPENDIDO',
                    observaciones: observaciones ?? null
                })
                .eq('grupo_id', id)
                .select()
                .single()

            if (error) throw error

            if (!data) {
                return res.status(404).json({ message: 'Inscripción no encontrada' })
            }

            return res.status(200).json(data)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // ============================================================
    // 🟩 REACTIVAR INSCRIPCIÓN (estado → ACTIVO)
    // ============================================================
    public async reactivar(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { data: inscripcion, error } = await supabaseAdmin!
                .from('Grupo_taller')
                .select('*, Taller(capacidad_maxima, taller_id)')
                .eq('grupo_id', id)
                .single()

            if (error || !inscripcion) {
                return res.status(404).json({ message: 'Inscripción no encontrada' })
            }

            if (inscripcion.estado === 'ACTIVO') {
                return res.status(400).json({ message: 'La inscripción ya está activa' })
            }

            // Verificar capacidad
            if (inscripcion.Taller.capacidad_maxima) {
                const { data: inscritos } = await supabaseAdmin!
                    .from('Grupo_taller')
                    .select('grupo_id')
                    .eq('taller_id', inscripcion.Taller.taller_id)
                    .eq('estado', 'ACTIVO')

                if (inscritos && inscritos.length >= inscripcion.Taller.capacidad_maxima) {
                    return res.status(400).json({
                        message: 'El taller ha alcanzado su capacidad máxima'
                    })
                }
            }

            const { data: updated, error: updError } = await supabaseAdmin!
                .from('Grupo_taller')
                .update({
                    estado: 'ACTIVO',
                    fecha_retiro: null
                })
                .eq('grupo_id', id)
                .select()
                .single()

            if (updError) throw updError

            return res.status(200).json(updated)

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }

    // ============================================================
    // 🗑 ELIMINAR INSCRIPCIÓN
    // ============================================================
    public async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const { error } = await supabaseAdmin!
                .from('Grupo_taller')
                .delete()
                .eq('grupo_id', id)

            if (error) throw error

            return res.status(200).json({ message: 'Inscripción eliminada correctamente' })

        } catch (error: any) {
            return res.status(500).json({ message: error.message })
        }
    }
}
