import { Router } from 'express'
import { EncuestaController } from '@/controllers/encuesta.controller'

const router = Router()
const encuestaController = new EncuestaController()

router.get('/', encuestaController.getAll)
router.get('/activas', encuestaController.getActivas)
router.get('/:id', encuestaController.getById)
router.get('/:id/respuestas', encuestaController.getRespuestas)
router.get('/:id/estadisticas', encuestaController.getEstadisticas)
router.post('/', encuestaController.create)
router.put('/:id', encuestaController.update)
router.patch('/:id/estado', encuestaController.cambiarEstado)
router.delete('/:id', encuestaController.delete)

export default router
