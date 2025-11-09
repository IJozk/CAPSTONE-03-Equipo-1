import { Router } from 'express'
import { ParentescoController } from '@/controllers/parentesco.controller'

const router = Router()
const parentescoController = new ParentescoController()

// Obtener tutores de un estudiante
router.get('/estudiante/:estudiante_id', parentescoController.getTutoresByEstudiante.bind(parentescoController))

// Crear relación parentesco (asignar tutor existente a estudiante)
router.post('/', parentescoController.create.bind(parentescoController))

// Crear tutor y asignarlo a estudiante (operación combinada)
router.post('/create-and-assign', parentescoController.createTutorAndAssign.bind(parentescoController))

// Actualizar relación parentesco
router.put('/:estudiante_id/:tutor_id', parentescoController.update.bind(parentescoController))

// Eliminar relación parentesco
router.delete('/:estudiante_id/:tutor_id', parentescoController.delete.bind(parentescoController))

export default router
