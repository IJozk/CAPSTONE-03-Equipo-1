import { Router } from 'express'
import { EvaluacionController } from '@/controllers/evaluacion.controller'

const router = Router()
const evaluacionController = new EvaluacionController()

// CRUD Evaluaciones
router.post('/', evaluacionController.create.bind(evaluacionController))
router.get('/', evaluacionController.getAll.bind(evaluacionController))
router.get('/:id', evaluacionController.getById.bind(evaluacionController))
router.get('/:id/estadisticas', evaluacionController.getEstadisticas.bind(evaluacionController))
router.get('/asignatura/:asignatura_id', evaluacionController.getByAsignatura.bind(evaluacionController))
router.put('/:id', evaluacionController.update.bind(evaluacionController))
router.patch('/:id/disable', evaluacionController.disable.bind(evaluacionController))
router.delete('/:id', evaluacionController.delete.bind(evaluacionController))

export default router
