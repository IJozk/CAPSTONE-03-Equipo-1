import { Router } from 'express'
import { AreaController } from '@/controllers/area.controller'

const router = Router()
const areaController = new AreaController()

// CRUD Áreas
router.post('/', areaController.create.bind(areaController))
router.get('/', areaController.getAll.bind(areaController))
router.get('/:id', areaController.getById.bind(areaController))
router.get('/:id/personal', areaController.getPersonal.bind(areaController))
router.get('/:id/estadisticas', areaController.getEstadisticas.bind(areaController))
router.put('/:id', areaController.update.bind(areaController))
router.patch('/:id/asignar-jefe', areaController.asignarJefe.bind(areaController))
router.patch('/:id/remover-jefe', areaController.removerJefe.bind(areaController))
router.delete('/:id', areaController.delete.bind(areaController))

export default router
