import { Request, Response } from 'express'
import asistenciaService from '@/services/asistencia.service'
import { formatErrorResponse } from '@/utils/errors'
import { supabaseAdmin } from '@/config/supabase'

export class AsistenciaController {
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const data = await asistenciaService.create(req.body)
      return res.status(201).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const data = await asistenciaService.update(req.params.id, req.body)
      return res.status(200).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async createBulk(req: Request, res: Response): Promise<Response> {
    try {
      const { asistencias } = req.body

      if (!Array.isArray(asistencias) || asistencias.length === 0) {
        return res.status(400).json({ message: 'Se requiere un array de asistencias' })
      }

      const created = []

      for (const asistencia of asistencias) {
        try {
          const data = await asistenciaService.create(asistencia)
          created.push(data)
        } catch (error: any) {
          const errorResponse = formatErrorResponse(error)
          return res.status(errorResponse.statusCode || 500).json({
            message: `Error en asistencia para estudiante ${asistencia.estudiante_id}`,
            error: errorResponse
          })
        }
      }

      return res.status(201).json(created)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const {
        estudiante_id,
        asignatura_id,
        fecha_inicio,
        fecha_fin,
        presente
      } = req.query

      let query = supabaseAdmin!
        .from('Asistencia')
        .select(`
          *,
          Estudiante(estudiante_id, nombre_completo, rut),
          Asignatura(asignatura_id, nombre, codigo),
          User(user_id, email_address)
        `)

      if (estudiante_id) {
        query = query.eq('estudiante_id', String(estudiante_id))
      }

      if (asignatura_id) {
        query = query.eq('asignatura_id', String(asignatura_id))
      }

      if (fecha_inicio) {
        query = query.gte('fecha', fecha_inicio)
      }

      if (fecha_fin) {
        query = query.lte('fecha', fecha_fin)
      }

      if (presente !== undefined) {
        query = query.eq('presente', presente === 'true')
      }

      query = query.order('fecha', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      return res.status(200).json(data || [])
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const { data, error } = await supabaseAdmin!
        .from('Asistencia')
        .select(`
          *,
          Estudiante(estudiante_id, nombre_completo, rut),
          Asignatura(asignatura_id, nombre, codigo, Curso(nombre, nivel)),
          User(user_id, email_address)
        `)
        .eq('asistencia_id', Number(id))
        .single()

      if (error) throw error

      if (!data) {
        return res.status(404).json({ message: 'Asistencia no encontrada' })
      }

      return res.status(200).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async getResumenEstudiante(req: Request, res: Response): Promise<Response> {
    try {
      const { estudiante_id } = req.params
      const { asignatura_id, fecha_inicio, fecha_fin } = req.query

      let query = supabaseAdmin!
        .from('Asistencia')
        .select('*')
        .eq('estudiante_id', estudiante_id)

      if (asignatura_id) {
        query = query.eq('asignatura_id', String(asignatura_id))
      }

      if (fecha_inicio) {
        query = query.gte('fecha', fecha_inicio)
      }

      if (fecha_fin) {
        query = query.lte('fecha', fecha_fin)
      }

      const { data, error } = await query

      if (error) throw error

      const total = data?.length || 0
      const presentes = data?.filter(a => a.presente).length || 0
      const ausentes = total - presentes
      const justificadas = data?.filter(a => !a.presente && a.justificado).length || 0
      const retrasos = data?.filter(a => a.retraso_minutos && a.retraso_minutos > 0).length || 0
      const porcentaje = total > 0 ? (presentes / total) * 100 : 0

      return res.status(200).json({
        total,
        presentes,
        ausentes,
        justificadas,
        retrasos,
        porcentaje_asistencia: parseFloat(porcentaje.toFixed(2)),
        detalle: data || []
      })
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const { error } = await supabaseAdmin!
        .from('Asistencia')
        .delete()
        .eq('asistencia_id', Number(id))

      if (error) throw error

      return res.status(200).json({ message: 'Asistencia eliminada correctamente' })
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }
}
