import { Router } from 'express'
import { MatriculaController } from '@/controllers/matricula.controller'

const router = Router()
const matriculaController = new MatriculaController()

// CRUD Matrículas
router.post('/', matriculaController.create.bind(matriculaController))
router.get('/', matriculaController.getAll.bind(matriculaController))
router.get('/:id', matriculaController.getById.bind(matriculaController))
router.get('/estudiante/:estudiante_id', matriculaController.getByEstudiante.bind(matriculaController))
router.put('/:id', matriculaController.update.bind(matriculaController))
router.patch('/:id/status', matriculaController.changeStatus.bind(matriculaController))
router.delete('/:id', matriculaController.delete.bind(matriculaController))

export default router
