import { Router } from 'express'
import { ContratoController } from '@/controllers/contrato.controller'

const router = Router()
const contratoController = new ContratoController()

// Rutas para profesiones
router.get('/profesiones', contratoController.getAllProfesiones)

// Rutas para contratos
router.get('/empleado/:empleado_id', contratoController.getContratoByEmpleado)
router.get('/empleado/:empleado_id/historial', contratoController.getHistorialContratos)
router.post('/', contratoController.create)
router.put('/:id', contratoController.update)
router.patch('/:id/finalizar', contratoController.finalizarContrato)
router.delete('/:id', contratoController.delete)

export default router
