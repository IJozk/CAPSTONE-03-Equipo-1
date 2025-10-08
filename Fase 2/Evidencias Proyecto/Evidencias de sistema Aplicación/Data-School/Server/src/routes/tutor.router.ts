import { Router } from 'express'
import { TutorController } from '@/controllers/tutor.controller'

const router = Router()
const tutorController = new TutorController()

// CRUD Tutores
router.post('/', tutorController.create.bind(tutorController))
router.get('/', tutorController.getAll.bind(tutorController))
router.get('/:id', tutorController.getById.bind(tutorController))
router.put('/:id', tutorController.update.bind(tutorController))
router.patch('/:id/disable', tutorController.disable.bind(tutorController))
router.patch('/:id/enable', tutorController.enable.bind(tutorController))
router.patch('/:id/link-user', tutorController.linkUser.bind(tutorController))

export default router
