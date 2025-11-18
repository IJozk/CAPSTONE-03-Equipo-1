import { Router } from 'express'
import { EstudianteController } from '@/controllers/estudiante.controller'

const router = Router()
const estudianteController = new EstudianteController()

// CRUD Estudiantes
router.post('/', estudianteController.create.bind(estudianteController))
router.get('/', estudianteController.getAll.bind(estudianteController))
router.get('/:id/dashboard', estudianteController.getDashboard.bind(estudianteController))
router.get('/:id', estudianteController.getById.bind(estudianteController))
router.put('/:id', estudianteController.update.bind(estudianteController))
router.patch('/:id/disable', estudianteController.disable.bind(estudianteController))
router.patch('/:id/enable', estudianteController.enable.bind(estudianteController))

export default router
