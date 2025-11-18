import { Router } from 'express'
import { ConfiguracionColegioController } from '@/controllers/configuracionColegio.controller'

const router = Router()
const configuracionColegioController = new ConfiguracionColegioController()

router.get('/', configuracionColegioController.getAll)
router.get('/por-tipo', configuracionColegioController.getByTipo)
router.get('/clave/:clave', configuracionColegioController.getByClave)
router.get('/:id', configuracionColegioController.getById)
router.post('/', configuracionColegioController.create)
router.put('/:id', configuracionColegioController.update)
router.patch('/clave/:clave/valor', configuracionColegioController.updateValor)
router.delete('/:id', configuracionColegioController.delete)

export default router
