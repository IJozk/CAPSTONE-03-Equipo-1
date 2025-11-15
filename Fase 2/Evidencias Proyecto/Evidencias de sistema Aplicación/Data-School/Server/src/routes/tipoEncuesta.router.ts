import { Router } from 'express'
import { TipoEncuestaController } from '@/controllers/tipoEncuesta.controller'

const router = Router()
const tipoEncuestaController = new TipoEncuestaController()

router.get('/', tipoEncuestaController.getAll)
router.get('/activos', tipoEncuestaController.getActivos)
router.get('/estadisticas', tipoEncuestaController.getEstadisticas)
router.get('/:id', tipoEncuestaController.getById)
router.post('/', tipoEncuestaController.create)
router.put('/:id', tipoEncuestaController.update)
router.patch('/:id/estado', tipoEncuestaController.cambiarEstado)
router.delete('/:id', tipoEncuestaController.delete)

export default router
