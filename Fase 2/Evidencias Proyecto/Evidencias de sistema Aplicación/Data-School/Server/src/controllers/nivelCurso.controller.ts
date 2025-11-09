import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class NivelCursoController {
  /**
   * Obtener todos los niveles de curso
   */
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { data, error } = await supabaseAdmin!
        .from('NivelCurso')
        .select('*')
        .order('numero', { ascending: true })

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo niveles de curso:', error)
      return res.status(500).json({ message: 'Error al obtener los niveles de curso' })
    }
  }

  /**
   * Obtener niveles por tipo (Básica/Media)
   */
  public async getByNivel(req: Request, res: Response): Promise<Response> {
    try {
      const { nivel } = req.params

      const { data, error } = await supabaseAdmin!
        .from('NivelCurso')
        .select('*')
        .eq('nivel', nivel)
        .order('numero', { ascending: true })

      if (error) throw error

      return res.json(data || [])
    } catch (error: any) {
      console.error('Error obteniendo niveles por tipo:', error)
      return res.status(500).json({ message: 'Error al obtener los niveles' })
    }
  }

  /**
   * Obtener un nivel de curso por ID
   */
  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const { data, error } = await supabaseAdmin!
        .from('NivelCurso')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        return res.status(404).json({ message: 'Nivel de curso no encontrado' })
      }

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo nivel de curso:', error)
      return res.status(500).json({ message: 'Error al obtener el nivel de curso' })
    }
  }

  /**
   * Obtener cursos de este nivel
   */
  public async getCursosByNivel(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const { data, error } = await supabaseAdmin!
        .from('Curso')
        .select(`
          *,
          NivelCurso (
            id,
            nivel,
            numero
          )
        `)
        .eq('nivel_id', id)
        .order('nombre', { ascending: true })

      if (error) throw error

      return res.json(data || [])
    } catch (error: any) {
      console.error('Error obteniendo cursos del nivel:', error)
      return res.status(500).json({ message: 'Error al obtener los cursos' })
    }
  }

  /**
   * Crear nuevo nivel de curso
   */
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const { nivel, numero } = req.body

      // Validar campos requeridos
      if (!nivel || numero === undefined) {
        return res.status(400).json({ message: 'El nivel y número son requeridos' })
      }

      // Validar que el nivel sea "Básica" o "Media"
      if (nivel !== 'Básica' && nivel !== 'Media') {
        return res.status(400).json({ message: 'El nivel debe ser "Básica" o "Media"' })
      }

      // Verificar que no exista un nivel con el mismo nivel y número
      const { data: existing, error: existingError } = await supabaseAdmin!
        .from('NivelCurso')
        .select('id')
        .eq('nivel', nivel)
        .eq('numero', numero)
        .maybeSingle()

      if (existing) {
        return res.status(400).json({
          message: `Ya existe un nivel de curso ${nivel} con número ${numero}`
        })
      }

      // Crear nivel de curso
      const { data, error } = await supabaseAdmin!
        .from('NivelCurso')
        .insert({
          nivel,
          numero
        })
        .select()
        .single()

      if (error) throw error

      return res.status(201).json(data)
    } catch (error: any) {
      console.error('Error creando nivel de curso:', error)
      return res.status(500).json({ message: 'Error al crear el nivel de curso' })
    }
  }

  /**
   * Actualizar nivel de curso
   */
  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { nivel, numero } = req.body

      // Validar que el nivel existe
      const { data: existing, error: existingError } = await supabaseAdmin!
        .from('NivelCurso')
        .select('id')
        .eq('id', id)
        .single()

      if (existingError || !existing) {
        return res.status(404).json({ message: 'Nivel de curso no encontrado' })
      }

      // Validar que el nivel sea "Básica" o "Media" si se proporciona
      if (nivel && nivel !== 'Básica' && nivel !== 'Media') {
        return res.status(400).json({ message: 'El nivel debe ser "Básica" o "Media"' })
      }

      // Si se está actualizando nivel o número, verificar que no exista otro con esa combinación
      if (nivel || numero !== undefined) {
        const { data: current } = await supabaseAdmin!
          .from('NivelCurso')
          .select('nivel, numero')
          .eq('id', id)
          .single()

        const checkNivel = nivel || current?.nivel
        const checkNumero = numero !== undefined ? numero : current?.numero

        const { data: duplicate, error: duplicateError } = await supabaseAdmin!
          .from('NivelCurso')
          .select('id')
          .eq('nivel', checkNivel)
          .eq('numero', checkNumero)
          .neq('id', id)
          .maybeSingle()

        if (duplicate) {
          return res.status(400).json({
            message: `Ya existe otro nivel de curso ${checkNivel} con número ${checkNumero}`
          })
        }
      }

      // Actualizar
      const updateData: any = {}
      if (nivel !== undefined) updateData.nivel = nivel
      if (numero !== undefined) updateData.numero = numero

      const { data, error } = await supabaseAdmin!
        .from('NivelCurso')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error actualizando nivel de curso:', error)
      return res.status(500).json({ message: 'Error al actualizar el nivel de curso' })
    }
  }

  /**
   * Eliminar nivel de curso
   */
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar que no haya cursos asociados
      const { count, error: countError } = await supabaseAdmin!
        .from('Curso')
        .select('*', { count: 'exact', head: true })
        .eq('nivel_id', id)

      if (countError) throw countError

      if (count && count > 0) {
        return res.status(400).json({
          message: `No se puede eliminar el nivel porque tiene ${count} curso(s) asociado(s)`
        })
      }

      // Eliminar
      const { error } = await supabaseAdmin!
        .from('NivelCurso')
        .delete()
        .eq('id', id)

      if (error) throw error

      return res.json({ message: 'Nivel de curso eliminado exitosamente' })
    } catch (error: any) {
      console.error('Error eliminando nivel de curso:', error)
      return res.status(500).json({ message: 'Error al eliminar el nivel de curso' })
    }
  }

  /**
   * Obtener estadísticas de niveles de curso
   */
  public async getEstadisticas(req: Request, res: Response): Promise<Response> {
    try {
      // Contar total de niveles
      const { count: totalNiveles, error: nivelesError } = await supabaseAdmin!
        .from('NivelCurso')
        .select('*', { count: 'exact', head: true })

      if (nivelesError) throw nivelesError

      // Contar niveles de básica
      const { count: nivelesBasica, error: basicaError } = await supabaseAdmin!
        .from('NivelCurso')
        .select('*', { count: 'exact', head: true })
        .eq('nivel', 'Básica')

      if (basicaError) throw basicaError

      // Contar niveles de media
      const { count: nivelesMedia, error: mediaError } = await supabaseAdmin!
        .from('NivelCurso')
        .select('*', { count: 'exact', head: true })
        .eq('nivel', 'Media')

      if (mediaError) throw mediaError

      // Obtener niveles con conteo de cursos
      const { data: niveles, error: cursosError } = await supabaseAdmin!
        .from('NivelCurso')
        .select(`
          id,
          nivel,
          numero
        `)

      if (cursosError) throw cursosError

      // Para cada nivel, contar sus cursos
      const nivelesConConteo = await Promise.all(
        (niveles || []).map(async (nivelCurso) => {
          const { count } = await supabaseAdmin!
            .from('Curso')
            .select('*', { count: 'exact', head: true })
            .eq('nivel_id', nivelCurso.id)

          return {
            ...nivelCurso,
            total_cursos: count || 0
          }
        })
      )

      // Ordenar por número
      nivelesConConteo.sort((a, b) => a.numero - b.numero)

      return res.json({
        total_niveles: totalNiveles || 0,
        niveles_basica: nivelesBasica || 0,
        niveles_media: nivelesMedia || 0,
        niveles: nivelesConConteo
      })
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error)
      return res.status(500).json({ message: 'Error al obtener las estadísticas' })
    }
  }
}
