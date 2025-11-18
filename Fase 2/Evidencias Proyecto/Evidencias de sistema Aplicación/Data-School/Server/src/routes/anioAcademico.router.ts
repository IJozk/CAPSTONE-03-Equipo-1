import { Router } from 'express'
import { AnioAcademicoController } from '@/controllers/anioAcademico.controller'

const router = Router()
const anioAcademicoController = new AnioAcademicoController()

// CRUD Años Académicos
router.post('/', anioAcademicoController.create.bind(anioAcademicoController))
router.get('/', anioAcademicoController.getAll.bind(anioAcademicoController))
router.get('/:id', anioAcademicoController.getById.bind(anioAcademicoController))
router.get('/colegio/:colegio_id/activo', anioAcademicoController.getActivo.bind(anioAcademicoController))
router.get('/colegio/:colegio_id/periodo-actual', anioAcademicoController.getPeriodoActual.bind(anioAcademicoController))
router.put('/:id', anioAcademicoController.update.bind(anioAcademicoController))
router.patch('/:id/activate', anioAcademicoController.activate.bind(anioAcademicoController))
router.patch('/:id/disable', anioAcademicoController.disable.bind(anioAcademicoController))
router.delete('/:id', anioAcademicoController.delete.bind(anioAcademicoController))

export default router
