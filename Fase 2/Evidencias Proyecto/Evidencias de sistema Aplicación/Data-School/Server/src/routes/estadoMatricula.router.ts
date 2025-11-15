import { Router } from 'express'
import { EstadoMatriculaController } from '@/controllers/estadoMatricula.controller'

const router = Router()
const estadoMatriculaController = new EstadoMatriculaController()

router.get('/', estadoMatriculaController.getAll)
router.get('/con-asistencia', estadoMatriculaController.getConAsistencia)
router.get('/con-evaluaciones', estadoMatriculaController.getConEvaluaciones)
router.get('/estadisticas', estadoMatriculaController.getEstadisticas)
router.get('/:id', estadoMatriculaController.getById)
router.get('/:id/matriculas', estadoMatriculaController.getMatriculasByEstado)
router.post('/', estadoMatriculaController.create)
router.put('/:id', estadoMatriculaController.update)
router.delete('/:id', estadoMatriculaController.delete)

export default router
