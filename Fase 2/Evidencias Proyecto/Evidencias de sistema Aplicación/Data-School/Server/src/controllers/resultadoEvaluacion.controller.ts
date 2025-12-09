import { Request, Response } from 'express'
import resultadoEvaluacionService from '@/services/resultadoEvaluacion.service'
import { formatErrorResponse } from '@/utils/errors'

export class ResultadoEvaluacionController {
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const data = await resultadoEvaluacionService.create(req.body)
      return res.status(201).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const data = await resultadoEvaluacionService.update(req.params.id, req.body)
      return res.status(200).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const {
        evaluacion_id,
        estudiante_id,
        fecha_inicio,
        fecha_fin
      } = req.query

      let query = 'ResultadoEvaluacion(*,Estudiante(estudiante_id,nombre_completo,rut),Evaluacion(evaluacion_id,nombre,tipo,fecha_evaluacion,puntaje_maximo,Asignatura(asignatura_id,nombre,codigo)))'
      const filters: any = {}

      if (evaluacion_id) filters.evaluacion_id = evaluacion_id
      if (estudiante_id) filters.estudiante_id = estudiante_id
      if (fecha_inicio) filters.fecha_inicio = fecha_inicio
      if (fecha_fin) filters.fecha_fin = fecha_fin

      return res.status(200).json({ query, filters })
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { supabaseAdmin } = await import('@/config/supabase')
      const { data, error } = await supabaseAdmin!
        .from('ResultadoEvaluacion')
        .select(`
          *,
          Estudiante(estudiante_id, nombre_completo, rut),
          Evaluacion(
            evaluacion_id,
            nombre,
            descripcion,
            tipo,
            fecha_evaluacion,
            puntaje_maximo,
            Asignatura(asignatura_id, nombre, codigo, Curso(nombre, nivel))
          )
        `)
        .eq('resultado_id', req.params.id)
        .single()

      if (error) throw error
      if (!data) {
        return res.status(404).json({ message: 'Resultado no encontrado' })
      }

      return res.status(200).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async getByEstudiante(req: Request, res: Response): Promise<Response> {
    try {
      const { supabaseAdmin } = await import('@/config/supabase')
      const { estudiante_id } = req.params
      const { asignatura_id, periodo } = req.query

      let query = supabaseAdmin!
        .from('ResultadoEvaluacion')
        .select(`
          *,
          Evaluacion(
            evaluacion_id,
            nombre,
            tipo,
            fecha_evaluacion,
            puntaje_maximo,
            Asignatura(asignatura_id, nombre, codigo, periodo)
          )
        `)
        .eq('estudiante_id', estudiante_id)

      const { data, error } = await query.order('fecha_evaluacion', { ascending: false })

      if (error) throw error

      let resultados = data || []
      if (asignatura_id) {
        resultados = resultados.filter((r: any) =>
          r.Evaluacion?.Asignatura?.asignatura_id === asignatura_id
        )
      }

      if (periodo) {
        resultados = resultados.filter((r: any) =>
          r.Evaluacion?.Asignatura?.periodo === periodo
        )
      }

      return res.status(200).json(resultados)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async getByEvaluacion(req: Request, res: Response): Promise<Response> {
    try {
      const { supabaseAdmin } = await import('@/config/supabase')
      const { evaluacion_id } = req.params

      const { data, error } = await supabaseAdmin!
        .from('ResultadoEvaluacion')
        .select(`
          *,
          Estudiante(estudiante_id, nombre_completo, rut)
        `)
        .eq('evaluacion_id', evaluacion_id)
        .order('nota', { ascending: false })

      if (error) throw error

      return res.status(200).json(data || [])
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { supabaseAdmin } = await import('@/config/supabase')
      const { id } = req.params

      const { error } = await supabaseAdmin!
        .from('ResultadoEvaluacion')
        .delete()
        .eq('resultado_id', id)

      if (error) throw error

      return res.status(200).json({ message: 'Resultado eliminado correctamente' })
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async createBulk(req: Request, res: Response): Promise<Response> {
    try {
      const { resultados } = req.body

      if (!Array.isArray(resultados) || resultados.length === 0) {
        return res.status(400).json({ message: 'Se requiere un array de resultados' })
      }

      const { supabaseAdmin } = await import('@/config/supabase')
      const created = []

      for (const resultado of resultados) {
        try {
          const data = await resultadoEvaluacionService.create(resultado)
          created.push(data)
        } catch (error: any) {
          const errorResponse = formatErrorResponse(error)
          return res.status(errorResponse.statusCode || 500).json({
            message: `Error en resultado para estudiante ${resultado.estudiante_id}`,
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
}
