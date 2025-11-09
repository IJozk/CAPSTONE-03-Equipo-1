import { Router } from 'express'
import { MateriaController } from '@/controllers/materia.controller'

const router = Router()
const materiaController = new MateriaController()

router.get('/', materiaController.getAll)
router.get('/estadisticas', materiaController.getEstadisticas)
router.get('/:id', materiaController.getById)
router.get('/:id/asignaturas', materiaController.getAsignaturasByMateria)
router.post('/', materiaController.create)
router.put('/:id', materiaController.update)
router.delete('/:id', materiaController.delete)

export default router
