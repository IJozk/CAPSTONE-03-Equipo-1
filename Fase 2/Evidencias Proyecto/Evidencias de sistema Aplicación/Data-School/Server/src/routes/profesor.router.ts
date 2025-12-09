import { Router } from 'express'
import { ProfesorController } from '@/controllers/profesor.controller'
import { authenticate } from '@/middlewares/auth.middleware'

const router = Router()
const profesorController = new ProfesorController()

// Teacher Dashboard Routes (deben ir ANTES de las rutas con :id)
router.get('/me/dashboard', authenticate, profesorController.getDashboard.bind(profesorController))
router.get('/me/upcoming', authenticate, profesorController.getUpcoming.bind(profesorController))

// CRUD Profesores
router.post('/', profesorController.create.bind(profesorController))
router.get('/', profesorController.getAll.bind(profesorController))
router.get('/:id', profesorController.getById.bind(profesorController))
router.put('/:id', profesorController.update.bind(profesorController))
router.patch('/:id/disable', profesorController.disable.bind(profesorController))
router.patch('/:id/enable', profesorController.enable.bind(profesorController))

export default router
