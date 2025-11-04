import { Router } from 'express'
import { GrupoTallerController } from '@/controllers/grupoTaller.controller'

const router = Router()
const grupoTallerController = new GrupoTallerController()

// CRUD Inscripciones a Talleres
router.post('/', grupoTallerController.create.bind(grupoTallerController))
router.get('/', grupoTallerController.getAll.bind(grupoTallerController))
router.get('/:id', grupoTallerController.getById.bind(grupoTallerController))
router.get('/estudiante/:estudiante_id', grupoTallerController.getByEstudiante.bind(grupoTallerController))
router.put('/:id', grupoTallerController.update.bind(grupoTallerController))
router.patch('/:id/retirar', grupoTallerController.retirar.bind(grupoTallerController))
router.patch('/:id/suspender', grupoTallerController.suspender.bind(grupoTallerController))
router.patch('/:id/reactivar', grupoTallerController.reactivar.bind(grupoTallerController))
router.delete('/:id', grupoTallerController.delete.bind(grupoTallerController))

export default router
