import { Router } from 'express'
import { TipoAlertaController } from '@/controllers/tipoAlerta.controller'

const router = Router()
const tipoAlertaController = new TipoAlertaController()

router.get('/', tipoAlertaController.getAll)
router.get('/activos', tipoAlertaController.getActivos)
router.get('/:id', tipoAlertaController.getById)
router.post('/', tipoAlertaController.create)
router.put('/:id', tipoAlertaController.update)
router.patch('/:id/estado', tipoAlertaController.cambiarEstado)
router.delete('/:id', tipoAlertaController.delete)

export default router
