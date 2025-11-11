import { Router } from 'express'
import { ZonaController } from '../controllers/zona.controller'

const router = Router()
const zonaController = new ZonaController()

// CRUD básico
router.post('/', zonaController.create.bind(zonaController))
router.get('/', zonaController.getAll.bind(zonaController))
router.get('/:id', zonaController.getById.bind(zonaController))
router.put('/:id', zonaController.update.bind(zonaController))
router.delete('/:id', zonaController.delete.bind(zonaController))

// Rutas adicionales
router.get('/:id/salas', zonaController.getSalas.bind(zonaController))
router.get('/:id/estadisticas', zonaController.getEstadisticas.bind(zonaController))

export default router
