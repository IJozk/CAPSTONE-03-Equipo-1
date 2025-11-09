import { Router } from 'express'
import { ProfesionController } from '@/controllers/profesion.controller'

const router = Router()
const profesionController = new ProfesionController()

router.get('/', profesionController.getAll)
router.get('/:id', profesionController.getById)
router.post('/', profesionController.create)
router.put('/:id', profesionController.update)
router.delete('/:id', profesionController.delete)

export default router
