import { Router } from 'express'
import { AsistenciaController } from '@/controllers/asistencia.controller'

const router = Router()
const asistenciaController = new AsistenciaController()

// CRUD Asistencia
router.post('/', asistenciaController.create.bind(asistenciaController))
router.post('/bulk', asistenciaController.createBulk.bind(asistenciaController))
router.get('/', asistenciaController.getAll.bind(asistenciaController))
router.get('/:id', asistenciaController.getById.bind(asistenciaController))
router.get('/estudiante/:estudiante_id/resumen', asistenciaController.getResumenEstudiante.bind(asistenciaController))
router.put('/:id', asistenciaController.update.bind(asistenciaController))
router.delete('/:id', asistenciaController.delete.bind(asistenciaController))

export default router
