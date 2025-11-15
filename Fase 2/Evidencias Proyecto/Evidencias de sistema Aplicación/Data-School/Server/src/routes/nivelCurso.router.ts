import { Router } from 'express'
import { NivelCursoController } from '@/controllers/nivelCurso.controller'

const router = Router()
const nivelCursoController = new NivelCursoController()

router.get('/', nivelCursoController.getAll)
router.get('/estadisticas', nivelCursoController.getEstadisticas)
router.get('/nivel/:nivel', nivelCursoController.getByNivel)
router.get('/:id', nivelCursoController.getById)
router.get('/:id/cursos', nivelCursoController.getCursosByNivel)
router.post('/', nivelCursoController.create)
router.put('/:id', nivelCursoController.update)
router.delete('/:id', nivelCursoController.delete)

export default router
