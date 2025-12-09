import { Request, Response } from 'express'
import estudianteService from '@/services/estudiante.service'
import { formatErrorResponse } from '@/utils/errors'

export class EstudianteController {
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const data = await estudianteService.create(req.body)
      return res.status(201).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const incluirInactivos = req.query.incluir_inactivos === 'true'
      const data = await estudianteService.getAll(incluirInactivos)
      return res.status(200).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const data = await estudianteService.getById(req.params.id)
      return res.status(200).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const data = await estudianteService.update(req.params.id, req.body)
      return res.status(200).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async disable(req: Request, res: Response): Promise<Response> {
    try {
      const data = await estudianteService.disable(req.params.id)
      return res.status(200).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }

  public async enable(req: Request, res: Response): Promise<Response> {
    try {
      const data = await estudianteService.enable(req.params.id)
      return res.status(200).json(data)
    } catch (error: any) {
      const errorResponse = formatErrorResponse(error)
      return res.status(errorResponse.statusCode || 500).json(errorResponse)
    }
  }
}
