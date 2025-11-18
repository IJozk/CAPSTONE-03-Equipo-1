import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class MateriaController {
  /**
   * Obtener todas las materias
   */
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { data, error } = await supabaseAdmin!
        .from('Materia')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo materias:', error)
      return res.status(500).json({ message: 'Error al obtener las materias' })
    }
  }

  /**
   * Obtener una materia por ID
   */
  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const { data, error } = await supabaseAdmin!
        .from('Materia')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        return res.status(404).json({ message: 'Materia no encontrada' })
      }

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo materia:', error)
      return res.status(500).json({ message: 'Error al obtener la materia' })
    }
  }

  /**
   * Obtener asignaturas que usan esta materia
   */
  public async getAsignaturasByMateria(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const { data, error } = await supabaseAdmin!
        .from('Asignatura')
        .select(`
          *,
          Curso (
            curso_id,
            nombre
          ),
          Profesor (
            profesor_id,
            nombre_completo
          )
        `)
        .eq('materia_id', id)
        .order('nombre', { ascending: true })

      if (error) throw error

      return res.json(data || [])
    } catch (error: any) {
      console.error('Error obteniendo asignaturas de la materia:', error)
      return res.status(500).json({ message: 'Error al obtener las asignaturas' })
    }
  }

  /**
   * Crear nueva materia
   */
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre, descripcion } = req.body

      // Validar campos requeridos
      if (!nombre) {
        return res.status(400).json({ message: 'El nombre es requerido' })
      }

      // Verificar que no exista una materia con el mismo nombre
      const { data: existing, error: existingError } = await supabaseAdmin!
        .from('Materia')
        .select('id')
        .ilike('nombre', nombre)
        .maybeSingle()

      if (existing) {
        return res.status(400).json({ message: 'Ya existe una materia con ese nombre' })
      }

      // Crear materia
      const { data, error } = await supabaseAdmin!
        .from('Materia')
        .insert({
          nombre,
          descripcion
        })
        .select()
        .single()

      if (error) throw error

      return res.status(201).json(data)
    } catch (error: any) {
      console.error('Error creando materia:', error)
      return res.status(500).json({ message: 'Error al crear la materia' })
    }
  }

  /**
   * Actualizar materia
   */
  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { nombre, descripcion } = req.body

      // Validar que la materia existe
      const { data: existing, error: existingError } = await supabaseAdmin!
        .from('Materia')
        .select('id')
        .eq('id', id)
        .single()

      if (existingError || !existing) {
        return res.status(404).json({ message: 'Materia no encontrada' })
      }

      // Si se está actualizando el nombre, verificar que no exista otra materia con ese nombre
      if (nombre) {
        const { data: duplicate, error: duplicateError } = await supabaseAdmin!
          .from('Materia')
          .select('id')
          .ilike('nombre', nombre)
          .neq('id', id)
          .maybeSingle()

        if (duplicate) {
          return res.status(400).json({ message: 'Ya existe otra materia con ese nombre' })
        }
      }

      // Actualizar
      const { data, error } = await supabaseAdmin!
        .from('Materia')
        .update({
          nombre,
          descripcion
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error actualizando materia:', error)
      return res.status(500).json({ message: 'Error al actualizar la materia' })
    }
  }

  /**
   * Eliminar materia
   */
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar que no haya asignaturas asociadas
      const { count, error: countError } = await supabaseAdmin!
        .from('Asignatura')
        .select('*', { count: 'exact', head: true })
        .eq('materia_id', id)

      if (countError) throw countError

      if (count && count > 0) {
        return res.status(400).json({
          message: `No se puede eliminar la materia porque tiene ${count} asignatura(s) asociada(s)`
        })
      }

      // Eliminar
      const { error } = await supabaseAdmin!
        .from('Materia')
        .delete()
        .eq('id', id)

      if (error) throw error

      return res.json({ message: 'Materia eliminada exitosamente' })
    } catch (error: any) {
      console.error('Error eliminando materia:', error)
      return res.status(500).json({ message: 'Error al eliminar la materia' })
    }
  }

  /**
   * Obtener estadísticas de materias
   */
  public async getEstadisticas(req: Request, res: Response): Promise<Response> {
    try {
      // Contar total de materias
      const { count: totalMaterias, error: materiasError } = await supabaseAdmin!
        .from('Materia')
        .select('*', { count: 'exact', head: true })

      if (materiasError) throw materiasError

      // Obtener materias con conteo de asignaturas
      const { data: materias, error: asignaturasError } = await supabaseAdmin!
        .from('Materia')
        .select(`
          id,
          nombre,
          descripcion
        `)

      if (asignaturasError) throw asignaturasError

      // Para cada materia, contar sus asignaturas
      const materiasConConteo = await Promise.all(
        (materias || []).map(async (materia) => {
          const { count } = await supabaseAdmin!
            .from('Asignatura')
            .select('*', { count: 'exact', head: true })
            .eq('materia_id', materia.id)

          return {
            ...materia,
            total_asignaturas: count || 0
          }
        })
      )

      // Ordenar por total de asignaturas
      materiasConConteo.sort((a, b) => b.total_asignaturas - a.total_asignaturas)

      return res.json({
        total_materias: totalMaterias || 0,
        materias: materiasConConteo,
        mas_usadas: materiasConConteo.slice(0, 5)
      })
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error)
      return res.status(500).json({ message: 'Error al obtener las estadísticas' })
    }
  }
}
