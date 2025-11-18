import { Router } from 'express'
import { ResultadoEvaluacionController } from '@/controllers/resultadoEvaluacion.controller'

const router = Router()
const resultadoController = new ResultadoEvaluacionController()

// CRUD Resultados de Evaluación
router.post('/', resultadoController.create.bind(resultadoController))
router.post('/bulk', resultadoController.createBulk.bind(resultadoController))
router.get('/', resultadoController.getAll.bind(resultadoController))
router.get('/:id', resultadoController.getById.bind(resultadoController))
router.get('/estudiante/:estudiante_id', resultadoController.getByEstudiante.bind(resultadoController))
router.get('/evaluacion/:evaluacion_id', resultadoController.getByEvaluacion.bind(resultadoController))
router.put('/:id', resultadoController.update.bind(resultadoController))
router.delete('/:id', resultadoController.delete.bind(resultadoController))

export default router
