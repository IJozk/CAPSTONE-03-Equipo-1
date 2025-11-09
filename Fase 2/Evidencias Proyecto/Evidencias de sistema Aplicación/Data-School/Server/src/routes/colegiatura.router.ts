import { Router } from 'express'
import { ColegiaturaController } from '@/controllers/colegiatura.controller'

const router = Router()
const colegiaturaController = new ColegiaturaController()

// Rutas de consulta
router.get('/', colegiaturaController.getAll)
router.get('/pendientes', colegiaturaController.getPendientes)
router.get('/vencidas', colegiaturaController.getVencidas)
router.get('/estadisticas', colegiaturaController.getEstadisticas)
router.get('/estudiante/:estudiante_id', colegiaturaController.getByEstudiante)
router.get('/:id', colegiaturaController.getById)

// Rutas de creación
router.post('/', colegiaturaController.create)
router.post('/generar-masivas', colegiaturaController.generarColegiaturasMasivas)

// Rutas de actualización
router.put('/:id', colegiaturaController.update)
router.patch('/:id/registrar-pago', colegiaturaController.registrarPago)
router.patch('/:id/cambiar-estado', colegiaturaController.cambiarEstado)

// Rutas de eliminación
router.delete('/:id', colegiaturaController.delete)

export default router
