import { Router } from 'express'
import { TallerController } from '@/controllers/taller.controller'

const router = Router()
const tallerController = new TallerController()

// CRUD Talleres
router.post('/', tallerController.create.bind(tallerController))
router.get('/', tallerController.getAll.bind(tallerController))
router.get('/activos', tallerController.getActivos.bind(tallerController))
router.get('/:id', tallerController.getById.bind(tallerController))
router.get('/:id/estudiantes', tallerController.getEstudiantes.bind(tallerController))
router.get('/:id/estadisticas', tallerController.getEstadisticas.bind(tallerController))
router.put('/:id', tallerController.update.bind(tallerController))
router.patch('/:id/disable', tallerController.disable.bind(tallerController))
router.patch('/:id/enable', tallerController.enable.bind(tallerController))
router.delete('/:id', tallerController.delete.bind(tallerController))

export default router
