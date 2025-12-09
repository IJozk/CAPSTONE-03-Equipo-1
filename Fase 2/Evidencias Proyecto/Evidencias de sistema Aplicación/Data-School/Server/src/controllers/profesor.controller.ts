import { Request, Response } from 'express'
import profesorService from '@/services/profesor.service'
import { formatErrorResponse } from '@/utils/errors'
import { supabaseAdmin } from '@/config/supabase'

export class ProfesorController {
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const data = await profesorService.create(req.body)
      return res.status(201).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const incluirInactivos = req.query.incluir_inactivos === 'true'
      const data = await profesorService.getAll(incluirInactivos)
      return res.status(200).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const data = await profesorService.getById(req.params.id)
      return res.status(200).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const data = await profesorService.update(req.params.id, req.body)
      return res.status(200).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async disable(req: Request, res: Response): Promise<Response> {
    try {
      const data = await profesorService.disable(req.params.id)
      return res.status(200).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async enable(req: Request, res: Response): Promise<Response> {
    try {
      const data = await profesorService.enable(req.params.id)
      return res.status(200).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async getDashboard(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).userId

      if (!userId) {
        return res.status(401).json({ error: 'No autenticado' })
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Error de configuración del servidor' })
      }

      const { data: profesor, error: profesorError } = await supabaseAdmin
        .from('Profesor')
        .select('profesor_id, nombre_completo, rut, telefono')
        .eq('user_id', userId)
        .single()

      if (profesorError || !profesor) {
        return res.status(404).json({ error: 'Perfil de profesor no encontrado' })
      }

      const { count: total_asignaturas } = await supabaseAdmin
        .from('Asignatura')
        .select('*', { count: 'exact', head: true })
        .eq('profesor_id', profesor.profesor_id)

      const { count: total_estudiantes } = await supabaseAdmin
        .from('Matricula')
        .select('estudiante_id, Asignatura!inner(profesor_id)', { count: 'exact', head: true })
        .eq('Asignatura.profesor_id', profesor.profesor_id)
        .eq('estado_matricula_id', 1)

      const { count: total_cursos } = await supabaseAdmin
        .from('Asignatura')
        .select('curso_id', { count: 'exact', head: true })
        .eq('profesor_id', profesor.profesor_id)

      return res.status(200).json({
        profesor,
        stats: {
          total_asignaturas: total_asignaturas || 0,
          total_estudiantes: total_estudiantes || 0,
          total_cursos: total_cursos || 0,
          evaluaciones_pendientes_revision: 0,
          asistencias_por_registrar_hoy: 0,
          promedio_general_asignaturas: 0
        }
      })
    } catch (error: any) {
      console.error('Error en getDashboard:', error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  public async getUpcoming(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).userId

      if (!userId) {
        return res.status(401).json({ error: 'No autenticado' })
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Error de configuración del servidor' })
      }

      const { data: profesor } = await supabaseAdmin
        .from('Profesor')
        .select('profesor_id')
        .eq('user_id', userId)
        .single()

      if (!profesor) {
        return res.status(404).json({ error: 'Perfil de profesor no encontrado' })
      }

      return res.status(200).json({
        clases_hoy: [],
        evaluaciones_proximas: []
      })
    } catch (error: any) {
      console.error('Error en getUpcoming:', error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}
