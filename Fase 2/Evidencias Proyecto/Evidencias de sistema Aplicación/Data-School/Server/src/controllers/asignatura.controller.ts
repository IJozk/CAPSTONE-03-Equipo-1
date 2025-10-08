import { Request, Response } from 'express'
import { supabase, supabaseAdmin } from '@/config/supabase'
import type {
  CreateAsignaturaDto,
  UpdateAsignaturaDto,
  FilterAsignaturaDto
} from '@/models/asignatura'

export class AsignaturaController {
  /**
   * Obtener todas las asignaturas con filtros opcionales
   */
  async getAll(req: Request, res: Response) {
    try {
      const {
        curso_id,
        profesor_id,
        periodo,
        estado_activo,
        tipo_asignatura_id
      } = req.query as FilterAsignaturaDto

      const client = supabaseAdmin || supabase

      // Construir query con filtros
      let query = client
        .from('Asignatura')
        .select(`
          *,
          Curso:curso_id (
            curso_id,
            nombre,
            nivel
          ),
          Profesor:profesor_id (
            profesor_id,
            nombre_completo,
            especialidad
          ),
          Sala:sala_id (
            sala_id,
            nombre,
            capacidad
          ),
          TipoAsignatura:tipo_asignatura_id (
            tipo_asignatura_id,
            nombre
          )
        `)
        .order('nombre', { ascending: true })

      // Aplicar filtros si existen
      if (curso_id) {
        query = query.eq('curso_id', curso_id)
      }
      if (profesor_id) {
        query = query.eq('profesor_id', profesor_id)
      }
      if (periodo) {
        query = query.eq('periodo', periodo)
      }
      if (estado_activo !== undefined) {
        query = query.eq('estado_activo', estado_activo)
      }
      if (tipo_asignatura_id) {
        query = query.eq('tipo_asignatura_id', tipo_asignatura_id)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error obteniendo asignaturas:', error)
        return res.status(500).json({
          error: 'Error al obtener asignaturas',
          details: error.message
        })
      }

      return res.status(200).json({
        message: 'Asignaturas obtenidas exitosamente',
        data: data || []
      })
    } catch (error) {
      console.error('Error en getAll asignaturas:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener una asignatura por ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params

      const client = supabaseAdmin || supabase

      const { data, error } = await client
        .from('Asignatura')
        .select(`
          *,
          Curso:curso_id (
            curso_id,
            nombre,
            nivel,
            anio
          ),
          Profesor:profesor_id (
            profesor_id,
            nombre_completo,
            especialidad,
            titulo_profesional
          ),
          Sala:sala_id (
            sala_id,
            nombre,
            capacidad,
            tipo
          ),
          TipoAsignatura:tipo_asignatura_id (
            tipo_asignatura_id,
            nombre,
            descripcion
          )
        `)
        .eq('asignatura_id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Asignatura no encontrada'
          })
        }
        console.error('Error obteniendo asignatura:', error)
        return res.status(500).json({
          error: 'Error al obtener asignatura',
          details: error.message
        })
      }

      return res.status(200).json({
        message: 'Asignatura obtenida exitosamente',
        data
      })
    } catch (error) {
      console.error('Error en getById asignatura:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Crear una nueva asignatura
   */
  async create(req: Request, res: Response) {
    try {
      const asignaturaData = req.body as CreateAsignaturaDto

      // Validar campos requeridos
      if (!asignaturaData.codigo || !asignaturaData.nombre || !asignaturaData.curso_id ||
          !asignaturaData.profesor_id || !asignaturaData.periodo) {
        return res.status(400).json({
          error: 'Los campos codigo, nombre, curso_id, profesor_id y periodo son requeridos'
        })
      }

      const client = supabaseAdmin || supabase

      // Verificar si ya existe una asignatura con el mismo código
      const { data: existing, error: checkError } = await client
        .from('Asignatura')
        .select('asignatura_id')
        .eq('codigo', asignaturaData.codigo)
        .eq('periodo', asignaturaData.periodo)
        .single()

      if (existing) {
        return res.status(400).json({
          error: 'Ya existe una asignatura con este código en el mismo periodo'
        })
      }

      // Crear asignatura
      const { data, error } = await client
        .from('Asignatura')
        .insert({
          codigo: asignaturaData.codigo,
          nombre: asignaturaData.nombre,
          descripcion: asignaturaData.descripcion || null,
          curso_id: asignaturaData.curso_id,
          profesor_id: asignaturaData.profesor_id,
          periodo: asignaturaData.periodo,
          horas_semanales: asignaturaData.horas_semanales || null,
          creditos: asignaturaData.creditos || null,
          sala_id: asignaturaData.sala_id || null,
          tipo_asignatura_id: asignaturaData.tipo_asignatura_id || null,
          estado_activo: asignaturaData.estado_activo ?? true
        })
        .select(`
          *,
          Curso:curso_id (
            curso_id,
            nombre,
            nivel
          ),
          Profesor:profesor_id (
            profesor_id,
            nombre_completo,
            especialidad
          )
        `)
        .single()

      if (error) {
        console.error('Error creando asignatura:', error)
        return res.status(500).json({
          error: 'Error al crear asignatura',
          details: error.message
        })
      }

      return res.status(201).json({
        message: 'Asignatura creada exitosamente',
        data
      })
    } catch (error) {
      console.error('Error en create asignatura:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Actualizar una asignatura
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const updateData = req.body as UpdateAsignaturaDto

      const client = supabaseAdmin || supabase

      // Verificar si la asignatura existe
      const { data: existing, error: checkError } = await client
        .from('Asignatura')
        .select('asignatura_id')
        .eq('asignatura_id', id)
        .single()

      if (checkError || !existing) {
        return res.status(404).json({
          error: 'Asignatura no encontrada'
        })
      }

      // Si se actualiza el código, verificar que no exista otra con el mismo código y periodo
      if (updateData.codigo) {
        const { data: duplicate } = await client
          .from('Asignatura')
          .select('asignatura_id')
          .eq('codigo', updateData.codigo)
          .eq('periodo', updateData.periodo || '')
          .neq('asignatura_id', id)
          .single()

        if (duplicate) {
          return res.status(400).json({
            error: 'Ya existe otra asignatura con este código en el mismo periodo'
          })
        }
      }

      // Actualizar asignatura
      const { data, error } = await client
        .from('Asignatura')
        .update(updateData)
        .eq('asignatura_id', id)
        .select(`
          *,
          Curso:curso_id (
            curso_id,
            nombre,
            nivel
          ),
          Profesor:profesor_id (
            profesor_id,
            nombre_completo,
            especialidad
          ),
          Sala:sala_id (
            sala_id,
            nombre,
            capacidad
          ),
          TipoAsignatura:tipo_asignatura_id (
            tipo_asignatura_id,
            nombre
          )
        `)
        .single()

      if (error) {
        console.error('Error actualizando asignatura:', error)
        return res.status(500).json({
          error: 'Error al actualizar asignatura',
          details: error.message
        })
      }

      return res.status(200).json({
        message: 'Asignatura actualizada exitosamente',
        data
      })
    } catch (error) {
      console.error('Error en update asignatura:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Eliminar (desactivar) una asignatura
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { hardDelete } = req.query // Opción para eliminar permanentemente

      const client = supabaseAdmin || supabase

      // Verificar si la asignatura existe
      const { data: existing, error: checkError } = await client
        .from('Asignatura')
        .select('asignatura_id, nombre')
        .eq('asignatura_id', id)
        .single()

      if (checkError || !existing) {
        return res.status(404).json({
          error: 'Asignatura no encontrada'
        })
      }

      if (hardDelete === 'true') {
        // Eliminación permanente (solo si no hay referencias)
        const { error } = await client
          .from('Asignatura')
          .delete()
          .eq('asignatura_id', id)

        if (error) {
          console.error('Error eliminando asignatura:', error)
          return res.status(500).json({
            error: 'Error al eliminar asignatura. Puede tener datos relacionados.',
            details: error.message
          })
        }

        return res.status(200).json({
          message: 'Asignatura eliminada permanentemente'
        })
      } else {
        // Soft delete - solo desactivar
        const { error } = await client
          .from('Asignatura')
          .update({ estado_activo: false })
          .eq('asignatura_id', id)

        if (error) {
          console.error('Error desactivando asignatura:', error)
          return res.status(500).json({
            error: 'Error al desactivar asignatura',
            details: error.message
          })
        }

        return res.status(200).json({
          message: 'Asignatura desactivada exitosamente'
        })
      }
    } catch (error) {
      console.error('Error en delete asignatura:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Reactivar una asignatura desactivada
   */
  async activate(req: Request, res: Response) {
    try {
      const { id } = req.params

      const client = supabaseAdmin || supabase

      const { data, error } = await client
        .from('Asignatura')
        .update({ estado_activo: true })
        .eq('asignatura_id', id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Asignatura no encontrada'
          })
        }
        console.error('Error activando asignatura:', error)
        return res.status(500).json({
          error: 'Error al activar asignatura',
          details: error.message
        })
      }

      return res.status(200).json({
        message: 'Asignatura activada exitosamente',
        data
      })
    } catch (error) {
      console.error('Error en activate asignatura:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener asignaturas por curso
   */
  async getByCurso(req: Request, res: Response) {
    try {
      const { curso_id } = req.params

      if (!curso_id) {
        return res.status(400).json({
          error: 'ID de curso es requerido'
        })
      }

      const client = supabaseAdmin || supabase
      const { data, error } = await client
        .from('Asignatura')
        .select(`
          *,
          Profesor:profesor_id (
            profesor_id,
            nombre_completo,
            especialidad
          )
        `)
        .eq('curso_id', curso_id)
        .eq('estado_activo', true)
        .order('nombre', { ascending: true })

      if (error) {
        console.error('Error obteniendo asignaturas por curso:', error)
        return res.status(500).json({
          error: 'Error al obtener asignaturas',
          details: error.message
        })
      }

      return res.status(200).json({
        message: 'Asignaturas del curso obtenidas exitosamente',
        data: data || [],
        count: data?.length || 0
      })
    } catch (error) {
      console.error('Error en getByCurso:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener asignaturas por profesor
   */
  async getByProfesor(req: Request, res: Response) {
    try {
      const { profesor_id } = req.params

      if (!profesor_id) {
        return res.status(400).json({
          error: 'ID de profesor es requerido'
        })
      }

      const client = supabaseAdmin || supabase
      const { data, error } = await client
        .from('Asignatura')
        .select(`
          *,
          Curso:curso_id (
            curso_id,
            nombre,
            nivel,
            paralelo
          )
        `)
        .eq('profesor_id', profesor_id)
        .eq('estado_activo', true)
        .order('nombre', { ascending: true })

      if (error) {
        console.error('Error obteniendo asignaturas por profesor:', error)
        return res.status(500).json({
          error: 'Error al obtener asignaturas',
          details: error.message
        })
      }

      return res.status(200).json({
        message: 'Asignaturas del profesor obtenidas exitosamente',
        data: data || [],
        count: data?.length || 0
      })
    } catch (error) {
      console.error('Error en getByProfesor:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }
}
