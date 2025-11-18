import { Router } from 'express'
import { AlertaController } from '@/controllers/alerta.controller'

const router = Router()
const alertaController = new AlertaController()

// CRUD Alertas
router.post('/', alertaController.create.bind(alertaController))
router.get('/', alertaController.getAll.bind(alertaController))
router.get('/pendientes', alertaController.getPendientes.bind(alertaController))
router.get('/vencidas', alertaController.getVencidas.bind(alertaController))
router.get('/:id', alertaController.getById.bind(alertaController))
router.get('/estudiante/:estudiante_id', alertaController.getByEstudiante.bind(alertaController))
router.put('/:id', alertaController.update.bind(alertaController))
router.patch('/:id/vista', alertaController.marcarVista.bind(alertaController))
router.patch('/:id/resolver', alertaController.resolver.bind(alertaController))
router.patch('/:id/archivar', alertaController.archivar.bind(alertaController))
router.delete('/:id', alertaController.delete.bind(alertaController))

export default router
