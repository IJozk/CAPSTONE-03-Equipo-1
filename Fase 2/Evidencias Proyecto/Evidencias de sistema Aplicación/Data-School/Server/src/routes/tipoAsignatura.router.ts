import { Router } from 'express'
import { TipoAsignaturaController } from '@/controllers/tipoAsignatura.controller'

const router = Router()
const tipoAsignaturaController = new TipoAsignaturaController()

router.get('/', tipoAsignaturaController.getAll)
router.get('/estadisticas', tipoAsignaturaController.getEstadisticas)
router.get('/:id', tipoAsignaturaController.getById)
router.get('/:id/asignaturas', tipoAsignaturaController.getAsignaturasByTipo)
router.post('/', tipoAsignaturaController.create)
router.put('/:id', tipoAsignaturaController.update)
router.delete('/:id', tipoAsignaturaController.delete)

export default router
