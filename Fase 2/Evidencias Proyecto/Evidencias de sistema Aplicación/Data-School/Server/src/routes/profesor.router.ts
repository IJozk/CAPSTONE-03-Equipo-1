import { Router } from 'express'
import { ProfesorController } from '@/controllers/profesor.controller'

const router = Router()
const profesorController = new ProfesorController()

// CRUD Profesores
router.post('/', profesorController.create.bind(profesorController))
router.get('/', profesorController.getAll.bind(profesorController))
router.get('/:id', profesorController.getById.bind(profesorController))
router.put('/:id', profesorController.update.bind(profesorController))
router.patch('/:id/disable', profesorController.disable.bind(profesorController))
router.patch('/:id/enable', profesorController.enable.bind(profesorController))

export default router
